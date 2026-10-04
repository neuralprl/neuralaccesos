// Lógica del panel del centro: qué acciones tiene que cerrar, para cuándo y qué avisos le corresponden.
// Funciones puras, sin red ni base de datos.
import { vrDe } from './evalLogic.js'
import { plazoPorDefecto } from './planLogic.js'

export const hoyISO = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

// Días que faltan desde hoy hasta el plazo (negativo si ya venció).
export function diasHasta(plazo, hoy = hoyISO()) {
  if (!plazo) return null
  const a = Date.UTC(...hoy.split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))))
  const b = Date.UTC(...String(plazo).slice(0, 10).split('-').map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))))
  return Math.round((b - a) / 86400000)
}

// vencida | hoy | manana | semana (2 a 7 días) | proxima (más de 7) | sinplazo
export function nivelPlazo(dias) {
  if (dias == null) return 'sinplazo'
  if (dias < 0) return 'vencida'
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'manana'
  if (dias <= 7) return 'semana'
  return 'proxima'
}

export function textoPlazo(dias) {
  if (dias == null) return 'Sin plazo'
  if (dias < 0) return dias === -1 ? 'Venció ayer' : `Vencida hace ${-dias} días`
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  return `Vence en ${dias} días`
}

export const COLOR_NIVEL = { vencida: '#c62828', hoy: '#d9600a', manana: '#d9600a', semana: '#b8860b', proxima: '#2e7d32', sinplazo: '#757575' }

const ORDEN_NIVEL = { vencida: 0, hoy: 1, manana: 2, semana: 3, proxima: 4, sinplazo: 5 }

// Acciones pendientes del plan de acción (PAP). filas: filas de evaluacion_riesgos; evaluaciones: {id, fecha, centro, puesto}.
// Las filas de riesgo trivial no llevan plazo y no entran.
export function accionesPAP(filas, evaluaciones, hoy = hoyISO()) {
  const ev = Object.fromEntries(evaluaciones.map((e) => [e.id, e]))
  const out = []
  filas.forEach((f) => {
    const e = ev[f.evaluacion_id]
    const vr = vrDe(f.p, f.c)
    if (!e || !vr || f.estado_accion === 'realizada') return
    const plazo = f.plazo ?? plazoPorDefecto(vr, e.fecha)
    if (!plazo) return
    const dias = diasHasta(plazo, hoy)
    out.push({
      origen: 'PAP', id: f.id, evaluacion_id: f.evaluacion_id, plazo, dias, nivel: nivelPlazo(dias), vr,
      donde: e.puesto?.nombre ?? '', centro: e.centro?.nombre ?? '',
      que: `${f.riesgo_id ? `${f.riesgo_id} · ` : ''}${f.riesgo_nombre ?? ''}`,
      detalle: (f.medidas ?? [])[0] ?? f.condicion ?? '',
      responsable: f.responsable ?? 'Dirección del centro',
    })
  })
  return out
}

// Acciones pendientes del PAP del centro. acciones: filas de pap_acciones; evcs: evaluaciones_centro con {id, fecha, centro}.
export function accionesPAPCentro(acciones, evcs, hoy = hoyISO()) {
  const ev = Object.fromEntries(evcs.map((e) => [e.id, e]))
  const out = []
  acciones.forEach((a) => {
    const e = ev[a.evaluacion_centro_id]
    if (!e || a.vigente === false || a.estado_accion === 'realizada' || !a.plazo) return
    const dias = diasHasta(a.plazo, hoy)
    const n = (a.puestos ?? []).length
    out.push({
      origen: 'PAP', id: a.id, evaluacion_centro_id: a.evaluacion_centro_id, plazo: a.plazo, dias, nivel: nivelPlazo(dias), vr: a.vr,
      donde: n === 1 ? a.puestos[0].nombre : `${n} puestos`, centro: e.centro?.nombre ?? '',
      que: a.medida, detalle: (a.riesgos ?? []).map((r) => `${r.id} · ${r.nombre}`).join('; '),
      responsable: a.responsable ?? 'Dirección del centro',
    })
  })
  return out
}

// Incidencias pendientes del PAC. respuestas: filas de pac_respuestas; items: pac_items; visitas: pac_visitas con centros.
export function accionesPAC(respuestas, items, visitas, hoy = hoyISO()) {
  const it = Object.fromEntries(items.map((i) => [i.id, i]))
  const vi = Object.fromEntries(visitas.map((v) => [v.id, v]))
  const out = []
  respuestas.forEach((r) => {
    const v = vi[r.visita_id]
    if (!v || r.resultado !== 'no_cumple' || r.estado_accion !== 'pendiente' || !r.plazo) return
    const dias = diasHasta(r.plazo, hoy)
    out.push({
      origen: 'PAC', id: `${r.visita_id}|${r.item_id}`, visita_id: r.visita_id, centro_id: v.centro_id, plazo: r.plazo, dias, nivel: nivelPlazo(dias),
      prioridad: r.prioridad, donde: `Visita del ${String(v.fecha).slice(0, 10).split('-').reverse().join('/')}`, centro: v.centros?.nombre ?? '',
      que: it[r.item_id]?.bloque ?? '', detalle: it[r.item_id]?.punto ?? '', responsable: r.responsable ?? 'Dirección del centro',
    })
  })
  return out
}

export function ordenar(acciones) {
  return [...acciones].sort((a, b) => ORDEN_NIVEL[a.nivel] - ORDEN_NIVEL[b.nivel] || (a.dias ?? 1e9) - (b.dias ?? 1e9) || a.origen.localeCompare(b.origen))
}

export function resumen(acciones) {
  const c = (n) => acciones.filter((a) => a.nivel === n).length
  return {
    total: acciones.length,
    pap: acciones.filter((a) => a.origen === 'PAP').length,
    pac: acciones.filter((a) => a.origen === 'PAC').length,
    vencidas: c('vencida'), hoy: c('hoy'), manana: c('manana'), semana: c('semana'), proximas: c('proxima'),
    // lo que merece un aviso: ya vencido, hoy, mañana y los próximos 7 días
    conAviso: acciones.filter((a) => ['vencida', 'hoy', 'manana', 'semana'].includes(a.nivel)).length,
  }
}

// Avisos que se muestran al entrar: los tres momentos pedidos (una semana antes, un día antes y el mismo día) y las vencidas.
export function avisosDePanel(acciones) {
  const r = resumen(acciones)
  const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`
  const l = []
  if (r.vencidas) l.push({ nivel: 'vencida', texto: `${plural(r.vencidas, 'acción vencida', 'acciones vencidas')}` })
  if (r.hoy) l.push({ nivel: 'hoy', texto: `${plural(r.hoy, 'acción vence', 'acciones vencen')} hoy` })
  if (r.manana) l.push({ nivel: 'manana', texto: `${plural(r.manana, 'acción vence', 'acciones vencen')} mañana` })
  if (r.semana) l.push({ nivel: 'semana', texto: `${plural(r.semana, 'acción vence', 'acciones vencen')} en los próximos 7 días` })
  return l
}

export function filtrarAcciones(acciones, { origen = '', soloUrgentes = false } = {}) {
  return acciones.filter((a) => (!origen || a.origen === origen) && (!soloUrgentes || ['vencida', 'hoy', 'manana', 'semana'].includes(a.nivel)))
}
