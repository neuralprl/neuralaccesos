// Reúne los datos del informe de evaluación del centro y genera el informe y el dossier con todos los documentos.
import { ordenarFilas } from './evalLogic'
import { ETIQUETAS } from './centrosLogic'
import { estadoInicial } from './equiposLogic'
import { generarERE } from './ereLogic'
import { epiDeEvaluacion, formacionDeEvaluacion } from './epiFormacionLogic'
import { leerAccionesPAP, sincronizarPAPCentro } from './papCentroDatos'
import {
  descargar, filasPAC, htmlDossier, htmlEPI, htmlERE, htmlEquipos, htmlFOR, htmlIR, htmlInforme, htmlPAC, htmlPAPCentro,
  imprimir, nombreArchivoInforme, wordInforme,
} from './documentos'
import { hoyISO } from './planLogic'

const sin = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export async function recogerDatosInforme(supabase, evcId) {
  const { data: evc, error } = await supabase.from('evaluaciones_centro').select('*,centros(id,codigo,nombre)').eq('id', evcId).single()
  if (error) throw error
  try { await sincronizarPAPCentro(supabase, evc) } catch { /* si falla, se usa lo guardado */ }
  const cid = evc.centros.id
  const desde = new Date(); desde.setFullYear(desde.getFullYear() - 1)
  const [centro, evs, cp, cambios, eq, ps, ag, acciones, firmas] = await Promise.all([
    supabase.from('centros').select('*').eq('id', cid).single(),
    supabase.from('evaluaciones').select('*,puestos(id,nombre)').eq('evaluacion_centro_id', evcId),
    supabase.from('centro_puestos').select('puesto_id,n_trabajadores,turnos').eq('centro_id', cid),
    supabase.from('control_cambios').select('*').eq('centro_id', cid).order('version'),
    supabase.from('equipos_evaluacion').select('*').eq('centro_id', cid),
    supabase.from('personas_sensibles').select('tipo,activa').eq('centro_id', cid).eq('activa', true),
    supabase.from('agresiones').select('tipo,puesto').eq('centro_id', cid).gte('fecha', desde.toISOString().slice(0, 10)),
    leerAccionesPAP(supabase, [evcId]).catch(() => []),
    supabase.from('firmas').select('rol,nombre,imagen,firmado_at').eq('evaluacion_centro_id', evcId),
  ])
  if (centro.error) throw centro.error
  if (evs.error) throw evs.error
  const cpMap = new Map((cp.data ?? []).map((r) => [String(r.puesto_id), r]))
  const puestos = []
  for (const ev of [...evs.data].sort((a, b) => (a.puestos?.nombre ?? '').localeCompare(b.puestos?.nombre ?? '', 'es'))) {
    let filas = []
    if (['borrador', 'cerrada'].includes(ev.estado)) {
      const r = await supabase.from('evaluacion_riesgos').select('*').eq('evaluacion_id', ev.id)
      filas = ordenarFilas((r.data ?? []).map((x) => ({ ...x, medidas: x.medidas ?? [] })))
    }
    const c = cpMap.get(String(ev.puesto_id))
    const delPuesto = (ag.data ?? []).filter((x) => sin(x.puesto) === sin(ev.puestos?.nombre))
    const ere = ev.estado === 'cerrada' ? generarERE(filas, { centro: centro.data, exposicion: ev.exposicion ?? {}, agresiones12m: delPuesto.length, agresionesFisicas12m: delPuesto.filter((x) => x.tipo === 'fisica').length }) : null
    puestos.push({ ev, nombre: ev.puestos?.nombre ?? '', n_trabajadores: c?.n_trabajadores ?? '', turnos: c?.turnos ? (ETIQUETAS.turnos[c.turnos] ?? c.turnos) : '', filas, ere })
  }
  let pac = null
  if (evc.pac_visita_id) {
    const [v, it, rs] = await Promise.all([
      supabase.from('pac_visitas').select('id,fecha').eq('id', evc.pac_visita_id).maybeSingle(),
      supabase.from('pac_items').select('id,orden,bloque,seccion,punto').order('orden'),
      supabase.from('pac_respuestas').select('*').eq('visita_id', evc.pac_visita_id),
    ])
    const resp = Object.fromEntries((rs.data ?? []).map((r) => [r.item_id, r]))
    pac = { fecha: v.data?.fecha ?? evc.fecha_visita, filas: filasPAC(it.data ?? [], resp) }
  }
  const lista = cambios.data ?? []
  const propio = lista.find((x) => x.evaluacion_centro_id === evcId)
  const version = propio?.version ?? (lista.reduce((m, x) => Math.max(m, x.version), 0) + 1)
  const n = (t) => (ps.data ?? []).filter((x) => x.tipo === t).length
  return {
    evc, centro: centro.data, version, fecha: evc.fecha_visita || evc.fecha || hoyISO(), puestos,
    equipos: (eq.data ?? []).length ? estadoInicial(eq.data, centro.data) : [],
    pac, pap: { acciones: (acciones ?? []).filter((a) => a.vigente !== false) }, cambios: lista,
    firmas: Object.fromEntries((firmas.data ?? []).map((f) => [f.rol, f])),
    sensibles: { embarazo: n('embarazo'), parto: n('parto_reciente'), lactancia: n('lactancia'), limitaciones: n('limitaciones') },
  }
}

export async function descargarInforme(supabase, evcId, formato) {
  const d = await recogerDatosInforme(supabase, evcId)
  if (formato === 'word') descargar(await wordInforme(d), nombreArchivoInforme(d, 'docx'))
  else imprimir(htmlInforme(d))
}

// Dossier: informe + PAP + por cada puesto evaluado su IR, ERE, EPI y FOR + equipos + PAC, en un solo PDF.
export async function generarDossier(supabase, evcId) {
  const d = await recogerDatosInforme(supabase, evcId)
  const centro = d.centro
  const partes = [htmlInforme(d)]
  const totalPuestos = d.puestos.filter((p) => ['borrador', 'cerrada'].includes(p.ev.estado)).length
  if (d.pap.acciones.length) partes.push(htmlPAPCentro({ fecha: d.evc.fecha, centro }, d.pap.acciones, totalPuestos))
  d.puestos.filter((p) => p.ev.estado === 'cerrada').forEach((p) => {
    const ev = { fecha: p.ev.fecha || d.evc.fecha, centro, puesto: { nombre: p.nombre } }
    partes.push(htmlIR(ev, p.filas))
    if (p.ere?.completa) partes.push(htmlERE(ev, p.ere))
    const epi = epiDeEvaluacion(p.filas)
    if (epi.epis.length || epi.otros.length) partes.push(htmlEPI(ev, epi))
    const form = formacionDeEvaluacion(p.filas)
    if (form.length) partes.push(htmlFOR(ev, form))
  })
  if (d.equipos.length) partes.push(htmlEquipos(centro, d.equipos, d.fecha))
  if (d.pac) partes.push(htmlPAC({ fecha: d.pac.fecha, centro }, d.pac.filas))
  imprimir(htmlDossier(`Documentacion_${centro.codigo}_v${d.version}`, partes))
  const sinERE = d.puestos.filter((p) => p.ev.estado === 'cerrada' && p.ere && !p.ere.completa).map((p) => p.nombre)
  return { partes: partes.length, sinERE }
}
