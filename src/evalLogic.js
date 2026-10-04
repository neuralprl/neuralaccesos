// Lógica pura del flujo de evaluación (sin red ni base de datos).
import { calcVR, limpiar } from './importLogic.js'

export const RANK_P = { B: 1, M: 2, A: 3 }
export const RANK_C = { LD: 1, D: 2, ED: 3 }

export const ORDEN_VR = { IN: 0, IM: 1, MO: 2, TO: 3, T: 4 }
export const ETIQUETA_VR = { T: 'Trivial', TO: 'Tolerable', MO: 'Moderado', IM: 'Importante', IN: 'Intolerable' }
export const COLOR_VR = { T: '#2e7d32', TO: '#689f38', MO: '#f9a825', IM: '#ef6c00', IN: '#c62828' }
export const ORIGEN_TEXTO = { puesto: 'Puesto', todos: 'Todos los puestos', check: 'Check', manual: 'Manual', centro: 'Centro' }

// Valores por defecto de un riesgo que entra por el check o se añade a mano: M + D = MO.
export const P_DEFECTO = 'M'
export const C_DEFECTO = 'D'

export const nuevoId = () =>
  globalThis.crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })

export const vrDe = (p, c) => (p && c ? calcVR(p, c) : null)
const numRiesgo = (id) => parseInt(String(id).replace(/\D/g, ''), 10) || 0

// Fila de matriz_puestos (con embeds de Supabase) -> fila de trabajo.
// usarIds=true guarda los ID de medida en vez de sus textos (para copiar puestos).
export function filaDesdeMatriz(r, origen, usarIds = false) {
  const medidas = [...(r.matriz_medidas ?? [])]
    .sort((a, b) => String(a.medida_id).localeCompare(String(b.medida_id)))
    .map((m) => (usarIds ? m.medida_id : m.medidas?.texto))
    .filter(Boolean)
  return {
    riesgo_id: r.riesgo_id,
    riesgo_nombre: r.riesgos?.nombre ?? r.riesgo_id,
    condicion: limpiar(r.condicion),
    p: r.p ?? null,
    c: r.c ?? null,
    medidas,
    origen,
  }
}

// Une filas con el mismo riesgo, condición y origen: se queda con la P y C más altas
// y junta las medidas sin repetirlas.
export function fusionarFilas(filas) {
  const mapa = new Map()
  for (const f of filas) {
    const k = `${f.riesgo_id}|${limpiar(f.condicion)}|${f.origen}`
    const g = mapa.get(k)
    if (!g) {
      mapa.set(k, { ...f, condicion: limpiar(f.condicion), medidas: [...new Set(f.medidas)] })
      continue
    }
    if (f.p && (!g.p || RANK_P[f.p] > RANK_P[g.p])) g.p = f.p
    if (f.c && (!g.c || RANK_C[f.c] > RANK_C[g.c])) g.c = f.c
    f.medidas.forEach((x) => { if (!g.medidas.includes(x)) g.medidas.push(x) })
  }
  return [...mapa.values()]
}

// Pendientes primero, luego de más a menos grave, y por código de riesgo.
export function ordenarFilas(filas) {
  const peso = (f) => {
    const vr = vrDe(f.p, f.c)
    return vr ? ORDEN_VR[vr] : -1
  }
  return [...filas].sort((a, b) =>
    peso(a) - peso(b) ||
    numRiesgo(a.riesgo_id) - numRiesgo(b.riesgo_id) ||
    a.condicion.localeCompare(b.condicion, 'es'))
}

// respuestas: { [preguntaId]: { si: boolean, medidas: [texto] } }
export function filasDeCheck(preguntas, respuestas, nombresRiesgo) {
  return preguntas
    .filter((q) => respuestas[q.id]?.si)
    .map((q) => ({
      riesgo_id: q.riesgo_id,
      riesgo_nombre: nombresRiesgo.get(q.riesgo_id) ?? q.riesgo_id,
      condicion: limpiar(q.pregunta),
      p: P_DEFECTO,
      c: C_DEFECTO,
      medidas: [...(respuestas[q.id].medidas ?? [])],
      origen: 'check',
    }))
}

// Evaluación = riesgos del puesto + riesgos de TODOS + riesgos marcados en el check.
export function armarFilasER({ puesto = [], todos = [], check = [] }) {
  const base = fusionarFilas([
    ...puesto.map((f) => ({ ...f, origen: 'puesto' })),
    ...todos.map((f) => ({ ...f, origen: 'todos' })),
  ])
  return ordenarFilas([...base, ...check]).map((f) => ({ ...f, id: nuevoId() }))
}

export function resumenER(filas) {
  const porVR = {}
  let pendientes = 0
  filas.forEach((f) => {
    const vr = vrDe(f.p, f.c)
    if (!vr) pendientes++
    else porVR[vr] = (porVR[vr] || 0) + 1
  })
  return { total: filas.length, pendientes, porVR }
}

// 'R24' + medidas existentes -> 'R24-M03'
export function siguienteIdMedida(riesgoId, catalogo) {
  const max = catalogo
    .filter((m) => m.riesgo_id === riesgoId)
    .reduce((mx, m) => Math.max(mx, parseInt((String(m.id).match(/-M(\d+)$/) || [])[1], 10) || 0), 0)
  return `${riesgoId}-M${String(max + 1).padStart(2, '0')}`
}
