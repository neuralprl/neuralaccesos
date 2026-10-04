// Evaluación del centro: agrupa las evaluaciones de cada puesto del centro.
// Funciones puras, sin red ni base de datos.
import { C_DEFECTO, P_DEFECTO } from './evalLogic.js'
import { limpiar } from './importLogic.js'

// Estados de cada puesto dentro de la evaluación del centro (columna evaluaciones.estado).
export const ESTADOS_PUESTO = {
  pendiente: 'Pendiente',
  borrador: 'En curso',
  cerrada: 'Evaluado',
  no_aplica: 'No aplica',
}
export const COLOR_ESTADO_PUESTO = { pendiente: '#757575', borrador: '#b8860b', cerrada: '#2e7d32', no_aplica: '#5c6bc0' }
export const ESTADOS_CENTRO = { en_curso: 'En curso', cerrada: 'Cerrada' }

// Estados que tienen riesgos y salen en PAP, IR, EPI y FOR.
export const ESTADOS_CON_RIESGOS = ['borrador', 'cerrada']

const hecho = (e) => e.estado === 'cerrada' || e.estado === 'no_aplica'

export function progresoCentro(evals) {
  const n = (est) => evals.filter((e) => e.estado === est).length
  const hechos = evals.filter(hecho).length
  return {
    total: evals.length,
    evaluados: n('cerrada'),
    noAplica: n('no_aplica'),
    enCurso: n('borrador'),
    pendientes: n('pendiente'),
    hechos,
    completo: evals.length > 0 && hechos === evals.length,
  }
}

// Motivos por los que todavía no se puede cerrar la evaluación del centro (vacío si se puede).
export function problemasCierre(evCentro, evals) {
  const p = []
  if (!evCentro.check_hecho) p.push('Falta responder la lista de comprobación del centro.')
  if (!evals.length) p.push('La evaluación no tiene puestos.')
  const pend = evals.filter((e) => e.estado === 'pendiente')
  const curso = evals.filter((e) => e.estado === 'borrador')
  const nom = (arr) => arr.map((e) => e.puestos?.nombre ?? e.puesto_nombre ?? '?').join(', ')
  if (pend.length) p.push(`Sin empezar (${pend.length}): ${nom(pend)}.`)
  if (curso.length) p.push(`En curso (${curso.length}): ${nom(curso)}.`)
  const sinMotivo = evals.filter((e) => e.estado === 'no_aplica' && !(e.motivo_no_aplica ?? '').trim())
  if (sinMotivo.length) p.push(`Falta el motivo de «no aplica» en: ${nom(sinMotivo)}.`)
  return p
}

// Puestos marcados en el centro que aún no están en la evaluación.
export function puestosQueFaltan(centroPuestoIds, evals) {
  const ya = new Set(evals.map((e) => e.puesto_id))
  return [...new Set(centroPuestoIds)].filter((id) => !ya.has(id))
}

// ---------- lista de comprobación (check) del centro ----------
// Se guarda en evaluaciones_centro.check_respuestas: solo las respuestas «Sí».
// [{ pregunta_id, riesgo_id, riesgo_nombre, condicion, medidas: [texto], puestos: [puesto_id] }]

// respuestas del formulario: { [preguntaId]: { si, medidas, puestos } }
export function guardarCheck(preguntas, respuestas, nombresRiesgo) {
  return preguntas
    .filter((q) => respuestas[q.id]?.si && (respuestas[q.id].puestos ?? []).length > 0)
    .map((q) => ({
      pregunta_id: q.id,
      riesgo_id: q.riesgo_id,
      riesgo_nombre: nombresRiesgo.get(q.riesgo_id) ?? q.riesgo_id,
      condicion: limpiar(q.pregunta),
      medidas: [...(respuestas[q.id].medidas ?? [])],
      puestos: [...respuestas[q.id].puestos],
    }))
}

// Para volver a abrir el formulario con lo guardado.
export function respuestasDesdeCheck(guardado = []) {
  return Object.fromEntries(guardado.map((g) => [g.pregunta_id, { si: true, medidas: [...(g.medidas ?? [])], puestos: [...(g.puestos ?? [])] }]))
}

// Riesgos del check que entran en la evaluación de un puesto (P = M, C = D).
export function filasCheckDePuesto(guardado = [], puestoId) {
  return guardado
    .filter((g) => (g.puestos ?? []).includes(puestoId))
    .map((g) => ({
      riesgo_id: g.riesgo_id,
      riesgo_nombre: g.riesgo_nombre,
      condicion: g.condicion,
      p: P_DEFECTO,
      c: C_DEFECTO,
      medidas: [...(g.medidas ?? [])],
      origen: 'check',
    }))
}

// Puestos ya empezados a los que un cambio del check no llegará solo.
export function puestosAfectadosPorCambio(antes = [], despues = [], evals = []) {
  const clave = (g) => g.pregunta_id
  const mapa = (arr) => new Map(arr.map((g) => [clave(g), new Set(g.puestos ?? [])]))
  const a = mapa(antes); const d = mapa(despues)
  const tocados = new Set()
  for (const k of new Set([...a.keys(), ...d.keys()])) {
    const pa = a.get(k) ?? new Set(); const pd = d.get(k) ?? new Set()
    for (const id of new Set([...pa, ...pd])) if (pa.has(id) !== pd.has(id)) tocados.add(id)
  }
  return evals.filter((e) => e.estado !== 'pendiente' && tocados.has(e.puesto_id))
}
