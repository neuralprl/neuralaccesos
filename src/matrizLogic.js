// Revisión de la matriz: casos iguales con valoraciones distintas entre puestos.
// Funciones puras, sin red ni base de datos.
//  - «situacion»: mismo riesgo y misma situación de exposición (condición) con distinta P o C.
//  - «medida»: mismo riesgo y misma medida (o parecida), en situaciones distintas, con distinto nivel de riesgo.
import { ORDEN_VR, RANK_C, RANK_P, vrDe } from './evalLogic.js'
import { limpiar } from './importLogic.js'
import { agruparMedidas } from './medidasSimilares.js'

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
export const claveSituacion = (riesgoId, condicion) => `${riesgoId}|${norm(limpiar(condicion ?? ''))}`

// Valoración propuesta: la más alta (del lado de la seguridad); a igual nivel, la de mayor C.
export function propuesta(filas) {
  const conVR = filas.filter((f) => vrDe(f.p, f.c))
  if (!conVR.length) return { p: 'M', c: 'D' }
  const mejor = [...conVR].sort((a, b) =>
    ORDEN_VR[vrDe(a.p, a.c)] - ORDEN_VR[vrDe(b.p, b.c)] || RANK_C[b.c] - RANK_C[a.c] || RANK_P[b.p] - RANK_P[a.p])[0]
  return { p: mejor.p, c: mejor.c }
}

// Valoración más repetida (por si se prefiere la mayoritaria).
export function masFrecuente(filas) {
  const n = new Map()
  filas.forEach((f) => { const k = `${f.p}|${f.c}`; n.set(k, (n.get(k) ?? 0) + 1) })
  const [k] = [...n].sort((a, b) => b[1] - a[1])[0] ?? ['M|D']
  const [p, c] = k.split('|')
  return { p, c }
}

const distintos = (filas, clave) => new Set(filas.map(clave)).size > 1
const firma = (filas) => filas.map((f) => f.id).sort().join(',')

// filas: [{ id, puesto, riesgo_id, riesgo_nombre, condicion, p, c, medidas: [texto] }]
export function gruposRevision(filas) {
  const grupos = []
  const vistos = new Set()

  // 1. Misma situación
  const porSit = new Map()
  filas.forEach((f) => {
    const k = claveSituacion(f.riesgo_id, f.condicion)
    if (!porSit.has(k)) porSit.set(k, [])
    porSit.get(k).push(f)
  })
  for (const [k, fs] of porSit) {
    if (fs.length < 2 || !distintos(fs, (f) => `${f.p}|${f.c}`)) continue
    vistos.add(firma(fs))
    grupos.push({ clave: `s:${k}`, tipo: 'situacion', riesgo_id: fs[0].riesgo_id, riesgo_nombre: fs[0].riesgo_nombre, titulo: limpiar(fs[0].condicion), filas: fs, propuesta: propuesta(fs) })
  }

  // 2. Misma medida dentro del mismo riesgo, en situaciones distintas
  const porRiesgo = new Map()
  filas.forEach((f) => { if (!porRiesgo.has(f.riesgo_id)) porRiesgo.set(f.riesgo_id, []); porRiesgo.get(f.riesgo_id).push(f) })
  for (const [rid, fs] of porRiesgo) {
    const { grupos: gm, deTexto } = agruparMedidas(fs.flatMap((f) => f.medidas ?? []))
    const filasDe = gm.map(() => new Map())
    fs.forEach((f) => (f.medidas ?? []).forEach((t) => { const k = deTexto.get(String(t).trim()); if (k != null) filasDe[k].set(f.id, f) }))
    gm.forEach((g, k) => {
      const sel = [...filasDe[k].values()]
      if (sel.length < 2 || !distintos(sel, (f) => vrDe(f.p, f.c)) || !distintos(sel, (f) => claveSituacion(f.riesgo_id, f.condicion))) return
      const fir = firma(sel)
      if (vistos.has(fir)) return
      vistos.add(fir)
      grupos.push({ clave: `m:${rid}|${norm(g.texto)}`, tipo: 'medida', riesgo_id: rid, riesgo_nombre: sel[0].riesgo_nombre, titulo: g.texto, filas: sel, propuesta: propuesta(sel) })
    })
  }
  const num = (id) => parseInt(String(id).replace(/\D/g, ''), 10) || 0
  return grupos.sort((a, b) => num(a.riesgo_id) - num(b.riesgo_id) || (a.tipo === b.tipo ? 0 : a.tipo === 'situacion' ? -1 : 1) || b.filas.length - a.filas.length)
}

// Filas de evaluaciones en curso que corresponden a las filas de la matriz que se cambian.
// filasMatriz: las del grupo (con puesto_id y puesto); evalFilas: [{id, evaluacion_id, riesgo_id, condicion, origen, p, c}];
// puestoDeEval: Map evaluacion_id -> puesto_id. Solo se tocan las que vienen de la matriz (puesto o TODOS).
export function filasEvaluacionAfectadas(filasMatriz, evalFilas, puestoDeEval) {
  const claves = new Set()
  filasMatriz.forEach((f) => claves.add(`${f.puesto === 'TODOS' ? '*' : f.puesto_id}|${claveSituacion(f.riesgo_id, f.condicion)}`))
  return evalFilas.filter((r) => {
    const sit = claveSituacion(r.riesgo_id, r.condicion)
    if (r.origen === 'todos') return claves.has(`*|${sit}`)
    if (r.origen === 'puesto') return claves.has(`${puestoDeEval.get(r.evaluacion_id)}|${sit}`)
    return false
  })
}
