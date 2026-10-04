// Acceso a Supabase para la CAE (técnico y empresa).
import { slugArchivo } from './caeLogic'

export const BUCKET_CAE = 'cae'
const FALTA = 'Falta ejecutar migracion_cae.sql en Supabase'
export const explicar = (e) => (/empresas_externas|cae_|accesos_externos|does not exist|schema cache|Bucket not found/i.test(e?.message ?? '') ? FALTA : e?.message ?? String(e))

export async function cargarTipos(supabase) {
  const { data, error } = await supabase.from('cae_tipos_documento').select('*').order('orden')
  if (error) throw new Error(explicar(error))
  return data
}
export async function cargarEmpresas(supabase) {
  const [e, d] = await Promise.all([
    supabase.from('empresas_externas').select('*').order('nombre'),
    supabase.from('cae_documentos').select('*').eq('vigente', true),
  ])
  if (e.error) throw new Error(explicar(e.error))
  if (d.error) throw new Error(explicar(d.error))
  return e.data.map((emp) => ({ ...emp, docs: d.data.filter((x) => x.empresa_id === emp.id) }))
}
export async function historial(supabase, empresaId, tipo) {
  const { data, error } = await supabase.from('cae_documentos').select('*').eq('empresa_id', empresaId).eq('tipo', tipo).order('subido_en', { ascending: false })
  if (error) throw new Error(explicar(error))
  return data
}
export async function subirDocumento(supabase, empresaId, tipo, archivo, caducaEn) {
  const ruta = `${empresaId}/${tipo}/${Date.now()}-${slugArchivo(archivo.name)}`
  const { error: e1 } = await supabase.storage.from(BUCKET_CAE).upload(ruta, archivo, { contentType: archivo.type || 'application/octet-stream', upsert: false })
  if (e1) throw new Error(explicar(e1))
  const { data, error: e2 } = await supabase.from('cae_documentos')
    .insert({ empresa_id: empresaId, tipo, ruta, nombre_archivo: archivo.name, caduca_en: caducaEn || null }).select('*').single()
  if (e2) { await supabase.storage.from(BUCKET_CAE).remove([ruta]); throw new Error(explicar(e2)) }
  return data
}
export async function abrirDocumento(supabase, doc, descargar = false) {
  const { data, error } = await supabase.storage.from(BUCKET_CAE).createSignedUrl(doc.ruta, 120, descargar ? { download: doc.nombre_archivo || 'documento' } : undefined)
  if (error) throw new Error(explicar(error))
  window.open(data.signedUrl, '_blank', 'noopener')
}
export async function revisarDocumento(supabase, docId, estado, motivo, caducaEn) {
  const { data: u } = await supabase.auth.getUser()
  const cambios = { estado, motivo: estado === 'rechazado' ? (motivo || '').trim() || null : null, revisado_en: new Date().toISOString(), revisado_por: u?.user?.id ?? null }
  if (caducaEn !== undefined) cambios.caduca_en = caducaEn || null
  const { data, error } = await supabase.from('cae_documentos').update(cambios).eq('id', docId).select('*').single()
  if (error) throw new Error(explicar(error))
  return data
}
export async function cambiarCaducidad(supabase, docId, caducaEn) {
  const { data, error } = await supabase.from('cae_documentos').update({ caduca_en: caducaEn || null }).eq('id', docId).select('*').single()
  if (error) throw new Error(explicar(error))
  return data
}
export async function accesoEmpresa(supabase, accion, empresaId) {
  const { data: s } = await supabase.auth.getSession()
  const r = await fetch('/api/acceso-empresa', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s?.session?.access_token ?? ''}` },
    body: JSON.stringify({ accion, empresa_id: empresaId }),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || `Error ${r.status}`)
  return j
}
export async function cargarContenidos(supabase) {
  const { data, error } = await supabase.from('cae_contenidos').select('*')
  if (error) throw new Error(explicar(error))
  return Object.fromEntries(data.map((c) => [c.clave, c]))
}
export async function guardarContenido(supabase, c, texto) {
  const { data, error } = await supabase.from('cae_contenidos')
    .update({ texto, version: (c.version ?? 0) + 1, actualizado_en: new Date().toISOString() }).eq('clave', c.clave).select('*').single()
  if (error) throw new Error(explicar(error))
  return data
}
