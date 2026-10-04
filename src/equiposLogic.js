// Evaluación de equipos e instalaciones: estado inicial, medidas, incidencias y paso al PAP. Funciones puras.
import { ELEMENTOS, MEDIDAS_EQUIPO, MEDIDAS_INSTALACION, PREGUNTAS, RIESGOS_EQ } from './equiposContenido.js'
import { vrDe } from './evalLogic.js'

export const TODOS_RIESGOS = RIESGOS_EQ.map((r) => r.k)

export function respuestasPorDefecto(tipo) {
  return Object.fromEntries(PREGUNTAS[tipo].map((q) => [q.k, 'si']))
}

export function elementoNuevo(base, centro = {}) {
  const presente = base.fijo ? true : base.sugerido ? !!base.sugerido(centro) : true
  return {
    codigo: base.codigo, tipo: base.tipo, nombre: base.nombre, presente,
    respuestas: respuestasPorDefecto(base.tipo), riesgos: [...TODOS_RIESGOS], otros_riesgos: '',
    p: 'B', c: 'D', ubicacion: '', marca_modelo: '', observaciones: '',
  }
}

// Une lo guardado con el catálogo: los elementos del catálogo que falten se añaden con sus valores por defecto.
export function estadoInicial(guardados = [], centro = {}) {
  const porCodigo = new Map(guardados.map((g) => [g.codigo, g]))
  // Las respuestas guardadas se completan con las preguntas nuevas (por defecto «sí»).
  const unir = (base, g) => ({ ...base, ...g, respuestas: { ...base.respuestas, ...(g.respuestas ?? {}) } })
  const lista = ELEMENTOS.map((b) => (porCodigo.has(b.codigo) ? unir(elementoNuevo(b, centro), porCodigo.get(b.codigo)) : { ...elementoNuevo(b, centro), nuevo: true }))
  guardados.filter((g) => !ELEMENTOS.some((b) => b.codigo === g.codigo)).forEach((g) => lista.push({ ...unir(elementoNuevo({ codigo: g.codigo, tipo: g.tipo, nombre: g.nombre, fijo: true }), g), propio: true }))
  return lista
}

export const baseDe = (codigo) => ELEMENTOS.find((b) => b.codigo === codigo)

export function siguienteCodigo(lista, tipo) {
  const pref = tipo === 'equipo' ? 'E' : 'I'
  const usados = lista.filter((x) => x.codigo.startsWith(pref)).map((x) => parseInt(x.codigo.slice(1), 10)).filter((n) => n >= 201)
  return `${pref}${String(Math.max(200, ...usados) + 1).padStart(3, '0')}`
}

// Medidas del elemento: [{ t, correctiva }]
export function medidasDe(el) {
  const r = el.respuestas ?? {}
  const out = []
  if (el.tipo === 'equipo') {
    MEDIDAS_EQUIPO.siempre.forEach((t) => out.push({ t, correctiva: false }))
    if (r.ce === 'no') out.push({ t: MEDIDAS_EQUIPO.ce, correctiva: true })
    else if (r.declaracion === 'no') out.push({ t: MEDIDAS_EQUIPO.declaracion, correctiva: true })
    if (r.manual === 'no') out.push({ t: MEDIDAS_EQUIPO.manual, correctiva: true })
    if (r.mantenimiento === 'no') out.push({ t: MEDIDAS_EQUIPO.mantenimiento, correctiva: true })
    if (r.registro_mantenimiento === 'no') out.push({ t: MEDIDAS_EQUIPO.registro_mantenimiento, correctiva: true })
  } else {
    MEDIDAS_INSTALACION.siempre.forEach((t) => out.push({ t, correctiva: false }))
    PREGUNTAS.instalacion.forEach((q) => {
      if (r[q.k] === 'no') out.push({ t: `Corregir la incidencia de ${el.codigo} ${el.nombre}: ${MEDIDAS_INSTALACION[q.k]}.`, correctiva: true })
    })
  }
  return out
}

export const incidencias = (el) => PREGUNTAS[el.tipo].filter((q) => el.respuestas?.[q.k] === 'no').map((q) => q.texto)

export function resumenEquipos(lista) {
  const pres = lista.filter((x) => x.presente)
  const conInc = pres.filter((x) => incidencias(x).length)
  return {
    equipos: pres.filter((x) => x.tipo === 'equipo').length,
    instalaciones: pres.filter((x) => x.tipo === 'instalacion').length,
    conIncidencias: conInc.length,
    incidencias: conInc.reduce((n, x) => n + incidencias(x).length, 0),
  }
}

// Filas para el PAP del centro: una por riesgo marcado, con las medidas del elemento.
// Devuelve { filas, puestoDe } con el mismo formato que las evaluaciones de puesto.
export function filasPAPEquipos(lista) {
  const filas = []
  const puestoDe = new Map()
  lista.filter((x) => x.presente).forEach((el) => {
    const id = `eq:${el.codigo}`
    puestoDe.set(id, { puesto_id: id, nombre: `${el.codigo} · ${el.nombre}` })
    const medidas = medidasDe(el).map((m) => m.t)
    const riesgos = RIESGOS_EQ.filter((r) => (el.riesgos ?? []).includes(r.k))
    const usados = riesgos.length ? riesgos : [RIESGOS_EQ.find((r) => r.k === 'otros')]
    const vistos = new Set()
    usados.forEach((r) => {
      const [rid, rnombre] = r[el.tipo]
      if (vistos.has(rid)) return
      vistos.add(rid)
      filas.push({
        evaluacion_id: id, riesgo_id: rid, riesgo_nombre: rnombre,
        condicion: `${el.tipo === 'equipo' ? 'Equipo' : 'Instalación'} ${el.codigo} · ${el.nombre}`,
        p: el.p, c: el.c, medidas,
      })
    })
  })
  return { filas, puestoDe }
}

export const vrElemento = (el) => vrDe(el.p, el.c)
