// Lectura y sincronización del PAP del centro con Supabase.
import { leerTodo } from './supabaseUtil'
import { consolidarPAP, planSincronizacion } from './papCentroLogic'
import { filasPAPEquipos } from './equiposLogic'

const COLS_RIESGO = 'id,evaluacion_id,riesgo_id,riesgo_nombre,condicion,p,c,medidas,responsable,coste,plazo,estado_accion,fecha_realizacion,eficacia_estado,fecha_eficacia'

const migracion = (m) => (/pap_acciones/.test(m ?? '')
  ? 'Falta ampliar la base de datos: ejecuta migracion_pap_centro.sql en el SQL Editor de Supabase.' : m)

export async function leerAccionesPAP(supabase, evcIds) {
  if (!evcIds.length) return []
  try {
    return await leerTodo(() => supabase.from('pap_acciones').select('*').in('evaluacion_centro_id', evcIds).order('id'))
  } catch (e) { throw new Error(migracion(e.message)) }
}

// Rehace las acciones del PAP de una evaluación de centro a partir de las evaluaciones de sus puestos.
// Solo la usa el técnico. evc: { id, fecha }.
export async function sincronizarPAPCentro(supabase, evc) {
  try {
    const { data: evs, error } = await supabase.from('evaluaciones').select('id,puesto_id,puestos(nombre)')
      .eq('evaluacion_centro_id', evc.id).in('estado', ['borrador', 'cerrada'])
    if (error) throw error
    const puestoDe = new Map(evs.map((e) => [e.id, { puesto_id: e.puesto_id, nombre: e.puestos?.nombre ?? '' }]))
    const ids = evs.map((e) => e.id)
    const filas = []
    for (let i = 0; i < ids.length; i += 100) {
      const trozo = ids.slice(i, i + 100)
      filas.push(...await leerTodo(() => supabase.from('evaluacion_riesgos').select(COLS_RIESGO).in('evaluacion_id', trozo).order('id')))
    }
    // Equipos e instalaciones del centro: sus medidas también van al PAP (si la tabla aún no existe, se ignora).
    const { data: ec } = await supabase.from('evaluaciones_centro').select('centro_id').eq('id', evc.id).maybeSingle()
    if (ec?.centro_id) {
      const eq = await supabase.from('equipos_evaluacion').select('*').eq('centro_id', ec.centro_id).eq('presente', true)
      if (!eq.error && eq.data?.length) {
        const extra = filasPAPEquipos(eq.data)
        filas.push(...extra.filas)
        extra.puestoDe.forEach((v, k) => puestoDe.set(k, v))
      }
    }
    const guardadas = await leerTodo(() => supabase.from('pap_acciones').select('*').eq('evaluacion_centro_id', evc.id).order('id'))
    const plan = planSincronizacion(consolidarPAP(filas, puestoDe), guardadas, evc.id, evc.fecha)

    for (let i = 0; i < plan.insertar.length; i += 200) {
      const { error: e } = await supabase.from('pap_acciones').insert(plan.insertar.slice(i, i + 200))
      if (e) throw e
    }
    for (let i = 0; i < plan.actualizar.length; i += 20) {
      const res = await Promise.all(plan.actualizar.slice(i, i + 20).map(({ id, ...cambios }) => supabase.from('pap_acciones').update(cambios).eq('id', id)))
      const fallo = res.find((r) => r.error)
      if (fallo) throw fallo.error
    }
    for (let i = 0; i < plan.retirar.length; i += 100) {
      const { error: e } = await supabase.from('pap_acciones').delete().in('id', plan.retirar.slice(i, i + 100))
      if (e) throw e
    }
    return { nuevas: plan.insertar.length, cambiadas: plan.actualizar.length, quitadas: plan.retirar.length }
  } catch (e) { throw new Error(migracion(e.message)) }
}
