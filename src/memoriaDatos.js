// Datos de la memoria anual (lo realizado en el año) y del programa anual (lo previsto), sacados del sistema.
// La memoria se va completando sola: evaluaciones cerradas, visitas, equipos, documentos colgados en los centros
// (simulacros, formación, investigaciones...), agresiones, acciones del PAP e informes de adaptación.
import { CATEGORIAS_DOC } from './gestorLogic'

const enAnio = (f, a) => !!f && String(f).slice(0, 4) === String(a)
const sumar = (m, k, n = 1) => { m[k] = (m[k] ?? 0) + n }

async function todo(q) { const r = await q; if (r.error) { if (/does not exist|relation|column/.test(r.error.message)) return []; throw r.error } return r.data ?? [] }

export async function recogerMemoria(supabase, anio) {
  const desde = `${anio}-01-01`; const hasta = `${anio}-12-31`
  const [centros, evcs, visitas, equipos, docs, agresiones, pap, sensibles, evals] = await Promise.all([
    todo(supabase.from('centros').select('id,codigo,nombre').order('codigo')),
    todo(supabase.from('evaluaciones_centro').select('id,centro_id,estado,fecha,fecha_cierre,motivo').order('fecha_cierre')),
    todo(supabase.from('pac_visitas').select('id,centro_id,fecha').gte('fecha', desde).lte('fecha', hasta)),
    todo(supabase.from('equipos_evaluacion').select('centro_id,fecha,presente,respuestas,tipo')),
    todo(supabase.from('documentos').select('id,ambito,centro_id,nombre,categoria,fecha_actividad').eq('ambito', 'centro').gte('fecha_actividad', desde).lte('fecha_actividad', hasta)),
    todo(supabase.from('agresiones').select('centro_id,fecha,tipo,consecuencias').gte('fecha', desde).lte('fecha', hasta)),
    todo(supabase.from('pap_acciones').select('evaluacion_centro_id,estado_accion,fecha_realizacion,plazo,vigente,vr')),
    todo(supabase.from('personas_sensibles').select('tipo,fecha_comunicacion,informe_estado,fecha_informe')),
    todo(supabase.from('evaluaciones').select('evaluacion_centro_id,estado,fecha').eq('estado', 'cerrada')),
  ])
  const incid = visitas.length ? await todo(supabase.from('pac_respuestas').select('visita_id,resultado').in('visita_id', visitas.map((v) => v.id)).eq('resultado', 'no_cumple')) : []
  const incPorVisita = {}; incid.forEach((r) => sumar(incPorVisita, r.visita_id))
  const evcCentro = Object.fromEntries(evcs.map((e) => [e.id, e.centro_id]))
  const versiones = {}; const porCentro = {}
  const act = (cid) => (porCentro[cid] ??= [])
  evcs.filter((e) => e.estado === 'cerrada').forEach((e) => {
    versiones[e.centro_id] = (versiones[e.centro_id] ?? 0) + 1
    if (enAnio(e.fecha_cierre, anio)) act(e.centro_id).push({ fecha: e.fecha_cierre, actividad: versiones[e.centro_id] === 1 ? 'Evaluación de riesgos inicial, planificación (PAP), información de riesgos y ERE de los puestos' : `Revisión de la evaluación de riesgos (versión ${versiones[e.centro_id]}), PAP, información de riesgos y ERE`, obs: e.motivo ?? '' })
  })
  visitas.forEach((v) => act(v.centro_id).push({ fecha: v.fecha, actividad: 'Visita de comprobación de las condiciones del lugar de trabajo (PAC)', obs: `${incPorVisita[v.id] ?? 0} incidencias` }))
  const eqCentro = {}
  equipos.filter((x) => enAnio(x.fecha, anio)).forEach((x) => { const o = (eqCentro[x.centro_id] ??= { fecha: x.fecha, n: 0, inc: 0 }); if (x.fecha > o.fecha) o.fecha = x.fecha; if (x.presente) { o.n++; o.inc += Object.values(x.respuestas ?? {}).filter((r) => r === 'no').length } })
  Object.entries(eqCentro).forEach(([cid, o]) => act(cid).push({ fecha: o.fecha, actividad: 'Evaluación de equipos de trabajo e instalaciones', obs: `${o.n} elementos · ${o.inc} incidencias` }))
  const catNombre = Object.fromEntries(CATEGORIAS_DOC.centro.map((c) => [c.id, c.actividad ?? c.nombre]))
  const porCategoria = {}
  docs.forEach((d) => {
    if (CATEGORIAS_DOC.centro.find((c) => c.id === d.categoria)?.actividad) sumar(porCategoria, d.categoria)
    act(d.centro_id).push({ fecha: d.fecha_actividad, actividad: `${catNombre[d.categoria] ?? 'Documento'}: ${d.nombre}`, obs: '' })
  })
  const agrCentro = {}; const agrTipo = {}; let agrBaja = 0
  agresiones.forEach((a) => { sumar(agrCentro, a.centro_id); sumar(agrTipo, a.tipo); if (a.consecuencias === 'lesion_con_baja') agrBaja++ })
  const papAnio = pap.filter((a) => a.vigente !== false)
  const realizadas = papAnio.filter((a) => a.estado_accion === 'realizada' && enAnio(a.fecha_realizacion, anio))
  const pendientes = papAnio.filter((a) => a.estado_accion !== 'realizada')
  const vencidas = pendientes.filter((a) => a.plazo && a.plazo <= hasta)
  const papCentro = {}
  pendientes.forEach((a) => { const c = evcCentro[a.evaluacion_centro_id]; const o = (papCentro[c] ??= { pendientes: 0, vencidas: 0, realizadas: 0 }); o.pendientes++; if (a.plazo && a.plazo <= hasta) o.vencidas++ })
  realizadas.forEach((a) => { const c = evcCentro[a.evaluacion_centro_id]; (papCentro[c] ??= { pendientes: 0, vencidas: 0, realizadas: 0 }).realizadas++ })
  // Centros con evaluación vigente a 31 de diciembre (cerrada en los últimos 12 meses)
  const ultima = {}
  evcs.filter((e) => e.estado === 'cerrada' && e.fecha_cierre && e.fecha_cierre <= hasta).forEach((e) => { if (!ultima[e.centro_id] || e.fecha_cierre > ultima[e.centro_id]) ultima[e.centro_id] = e.fecha_cierre })
  const limite = `${anio - 1}-12-31`
  const vigentes = centros.filter((c) => ultima[c.id] && ultima[c.id] > limite).length
  const evCerradasAnio = evcs.filter((e) => e.estado === 'cerrada' && enAnio(e.fecha_cierre, anio)).map((e) => e.id)
  Object.values(porCentro).forEach((l) => l.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))))
  return {
    anio, centros,
    actividades: centros.filter((c) => porCentro[c.id]?.length).map((c) => ({ centro: c, lista: porCentro[c.id] })),
    resumen: {
      evaluaciones: evCerradasAnio.length,
      puestosEvaluados: evals.filter((e) => evCerradasAnio.includes(e.evaluacion_centro_id)).length,
      visitas: visitas.length, incidenciasPac: incid.length, centrosEquipos: Object.keys(eqCentro).length,
      porCategoria, agresiones: agresiones.length, agrBaja, agrTipo, agrCentro,
      papRealizadas: realizadas.length, papPendientes: pendientes.length, papVencidas: vencidas.length, papCentro,
      adaptaciones: sensibles.filter((s) => s.informe_estado === 'emitido' && enAnio(s.fecha_informe, anio)).length,
      adaptacionesPendientes: sensibles.filter((s) => s.tipo === 'limitaciones' && s.informe_estado === 'pendiente').length,
      embarazos: sensibles.filter((s) => ['embarazo', 'parto_reciente', 'lactancia'].includes(s.tipo) && enAnio(s.fecha_comunicacion, anio)).length,
      centrosVigentes: vigentes, totalCentros: centros.length,
    },
  }
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export async function recogerPrograma(supabase, anio) {
  const inicio = `${anio}-01-01`
  const [centros, evcs, pap] = await Promise.all([
    todo(supabase.from('centros').select('id,codigo,nombre').order('codigo')),
    todo(supabase.from('evaluaciones_centro').select('id,centro_id,estado,fecha_cierre')),
    todo(supabase.from('pap_acciones').select('evaluacion_centro_id,estado_accion,plazo,vigente')),
  ])
  const ultima = {}; const enCurso = new Set()
  evcs.forEach((e) => { if (e.estado === 'cerrada' && e.fecha_cierre && (!ultima[e.centro_id] || e.fecha_cierre > ultima[e.centro_id])) ultima[e.centro_id] = e.fecha_cierre; if (e.estado === 'en_curso') enCurso.add(e.centro_id) })
  const iniciales = centros.filter((c) => !ultima[c.id]).map((c) => ({ centro: c, enCurso: enCurso.has(c.id) }))
  const revisiones = centros.filter((c) => ultima[c.id]).map((c) => {
    const v = new Date(`${ultima[c.id]}T00:00:00Z`); v.setUTCFullYear(v.getUTCFullYear() + 1)
    const vence = v.toISOString().slice(0, 10)
    return { centro: c, vence, mes: vence < inicio ? 'enero (vencida)' : String(v.getUTCFullYear()) === String(anio) ? MESES[v.getUTCMonth()] : null }
  }).filter((r) => r.mes)
  const evcCentro = Object.fromEntries(evcs.map((e) => [e.id, e.centro_id]))
  const papCentro = {}
  pap.filter((a) => a.vigente !== false && a.estado_accion !== 'realizada').forEach((a) => { const o = (papCentro[evcCentro[a.evaluacion_centro_id]] ??= { pendientes: 0, vencidas: 0 }); o.pendientes++; if (a.plazo && a.plazo < inicio) o.vencidas++ })
  return { anio, centros, iniciales, revisiones, papCentro }
}
