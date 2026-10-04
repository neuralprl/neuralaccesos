import { useEffect, useMemo, useState } from 'react'
import {
  agrupar, extension, fechaES, filtrarDocumentos, iconoDe, nombreSeguro, rutaDe, sePuedeVer, tamanoLegible, validarDocumento, MAX_BYTES, CATEGORIAS_DOC, nombreCategoria } from './gestorLogic'

// Dos partes, cada una en su pantalla:
//   <GestorDocumental supabase={supabase} ambito="general" />   Procedimientos: los ven todos los centros
//   <GestorDocumental supabase={supabase} ambito="centro" />    Documentos específicos: cada centro ve solo los suyos
// El técnico sube, renombra y borra (soloLectura = false). El usuario de centro solo ve y descarga (soloLectura).
// Los archivos están en un almacenamiento privado de Supabase (en la nube): se abren desde cualquier dispositivo con la sesión iniciada.

const campo = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, fontSize: 14, textAlign: 'left' }
const ancho = { width: '100%', boxSizing: 'border-box' }
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const BUCKET = 'documentos'

export const TEMAS = {
  general: { color: '#1f3864', fondo: '#eef3fb', etiqueta: 'GENERAL', titulo: 'Documentos generales del sistema y procedimientos', sub: 'Los ven todos los centros.' },
  centro: { color: '#1b6e4a', fondo: '#eaf6f0', etiqueta: 'ESPECÍFICOS', titulo: 'Documentos específicos por centro', sub: 'Cada centro ve solo los suyos.' },
}

function Icono({ doc }) {
  const { etiqueta, color } = iconoDe(doc)
  return (
    <svg width="38" height="46" viewBox="0 0 44 54" aria-hidden="true" style={{ flex: 'none' }}>
      <path d="M4 2h26l10 10v40a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fff" stroke={color} strokeWidth="2" />
      <path d="M30 2v10h10" fill="#eceff1" stroke={color} strokeWidth="2" />
      <rect x="2" y="30" width="38" height="16" fill={color} />
      <text x="21" y="42" textAnchor="middle" fontSize={etiqueta.length > 4 ? 8 : 10} fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">{etiqueta}</text>
    </svg>
  )
}

function Fila({ doc, tema, par, soloLectura, ocupado, onVer, onDescargar, onRenombrar, onBorrar }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', padding: '10px 14px', borderTop: '1px solid #e3e8ec', borderLeft: `5px solid ${tema.color}`, background: par ? '#fff' : '#fafbfc' }}>
      <Icono doc={doc} />
      <div style={{ flex: '1 1 260px', minWidth: 0, textAlign: 'left' }}>
        <div style={{ fontWeight: 650, fontSize: 15, overflowWrap: 'anywhere' }}>{doc.nombre}</div>
        <div style={{ fontSize: 12, opacity: 0.65, overflowWrap: 'anywhere' }}>
          {doc.ambito === 'centro' && doc.categoria && doc.categoria !== 'otro' && <b style={{ color: tema.color }}>{nombreCategoria(doc.categoria)} · </b>}
          {doc.tipo === 'enlace' ? 'Enlace externo' : `${doc.nombre_archivo ?? ''}${doc.tamano ? ` · ${tamanoLegible(doc.tamano)}` : ''}`} · {fechaES(doc.fecha_actividad || doc.creado_en)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sePuedeVer(doc) && <button className="secundario" disabled={ocupado} onClick={() => onVer(doc)}>{doc.tipo === 'enlace' ? 'Abrir' : 'Ver'}</button>}
        {doc.tipo === 'archivo' && <button className="secundario" disabled={ocupado} onClick={() => onDescargar(doc)}>Descargar</button>}
        {!soloLectura && <button className="secundario" disabled={ocupado} onClick={() => onRenombrar(doc)}>Renombrar</button>}
        {!soloLectura && <button className="secundario" disabled={ocupado} onClick={() => onBorrar(doc)} style={{ color: '#b00020' }}>Borrar</button>}
      </div>
    </div>
  )
}

// Lista vertical. grupos: [{ titulo, docs }]; en la parte general hay un solo grupo sin título.
export function ListaDocumentos({ tema, grupos, ...acciones }) {
  return (
    <div style={{ border: `1px solid ${tema.color}`, borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      {grupos.map((g, gi) => (
        <div key={g.clave ?? gi}>
          {g.titulo && (
            <div style={{ background: tema.fondo, color: tema.color, fontWeight: 700, padding: '8px 14px', borderTop: gi ? `2px solid ${tema.color}` : undefined, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span>{g.titulo}</span><span style={{ fontWeight: 400, opacity: 0.8 }}>{g.docs.length} {g.docs.length === 1 ? 'documento' : 'documentos'}</span>
            </div>
          )}
          {g.docs.map((d, i) => <Fila key={d.id} doc={d} tema={tema} par={i % 2 === 0} {...acciones} />)}
        </div>
      ))}
    </div>
  )
}

const FORM0 = { tipo: 'archivo', centro_id: '', nombre: '', archivo: null, url: '', categoria: '', fecha_actividad: new Date().toISOString().slice(0, 10) }

export default function GestorDocumental({ supabase, ambito = 'general', soloLectura = false, onIrOtra }) {
  const tema = TEMAS[ambito]
  const [docs, setDocs] = useState(null)
  const [centros, setCentros] = useState([])
  const [q, setQ] = useState('')
  const [centroFiltro, setCentroFiltro] = useState('')
  const [form, setForm] = useState(null)
  const [errores, setErrores] = useState([])
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function cargar() {
    const [d, c] = await Promise.all([
      supabase.from('documentos').select('*').eq('ambito', ambito).order('nombre'),
      supabase.from('centros').select('id,codigo,nombre').order('codigo'),
    ])
    if (d.error) {
      setError(/documentos/.test(d.error.message) ? 'Falta ampliar la base de datos: ejecuta migracion_documentos.sql en el SQL Editor de Supabase.' : d.error.message)
      setDocs([])
    } else { setError(''); setDocs(d.data) }
    if (!c.error) setCentros(c.data)
  }
  useEffect(() => { setDocs(null); setForm(null); cargar() }, [ambito]) // eslint-disable-line react-hooks/exhaustive-deps

  const nombresCentros = useMemo(() => Object.fromEntries(centros.map((c) => [c.id, `${c.codigo} · ${c.nombre}`])), [centros])
  const visibles = useMemo(() => filtrarDocumentos(docs ?? [], { q, centro: ambito === 'centro' ? centroFiltro : '' }), [docs, q, centroFiltro, ambito])
  const grupos = useMemo(() => {
    if (ambito === 'general') {
      const gen = agrupar(visibles).generales
      return CATEGORIAS_DOC.general.map((c) => ({ clave: c.id, titulo: c.id === 'sistema' ? 'Documentos generales del sistema' : 'Procedimientos', docs: gen.filter((d) => (d.categoria === 'sistema' ? 'sistema' : 'procedimiento') === c.id) })).filter((g) => g.docs.length)
    }
    return agrupar(visibles, nombresCentros).porCentro.map((g) => ({ clave: g.centro_id, titulo: g.nombre, docs: g.docs }))
  }, [visibles, nombresCentros, ambito])

  // Enlace temporal (el almacenamiento es privado). Se abre en una pestaña creada al pulsar, para que el navegador no la bloquee.
  async function firmar(doc, descargar) {
    const { data, error: err } = await supabase.storage.from(BUCKET).createSignedUrl(doc.ruta, 120, descargar ? { download: doc.nombre_archivo || doc.nombre } : undefined)
    if (err || !data?.signedUrl) throw new Error(err?.message ?? 'No se pudo generar el enlace.')
    return data.signedUrl
  }
  async function ver(doc) {
    setError('')
    if (doc.tipo === 'enlace') { window.open(doc.url, '_blank', 'noopener,noreferrer'); return }
    const w = window.open('', '_blank')
    setOcupado(true)
    try {
      const url = await firmar(doc, false)
      if (w) { w.opener = null; w.location.href = url } else window.location.href = url
    } catch (err) { if (w) w.close(); setError(err.message) }
    setOcupado(false)
  }
  async function descargar(doc) {
    setError(''); setOcupado(true)
    try { window.location.href = await firmar(doc, true) } catch (err) { setError(err.message) }
    setOcupado(false)
  }

  async function guardar() {
    const datos = { ...form, ambito }
    const probs = validarDocumento(datos)
    setErrores(probs)
    if (probs.length) return
    setOcupado(true); setError(''); setMensaje('')
    const id = crypto.randomUUID()
    const comun = { id, ambito, centro_id: ambito === 'centro' ? form.centro_id : null, nombre: form.nombre.trim(), categoria: form.categoria || (ambito === 'general' ? 'procedimiento' : 'otro'), fecha_actividad: form.fecha_actividad || null }
    try {
      if (form.tipo === 'enlace') {
        const { error: err } = await supabase.from('documentos').insert({ ...comun, tipo: 'enlace', url: form.url.trim() })
        if (err) throw err
      } else {
        const ruta = rutaDe({ ambito, centro_id: comun.centro_id, id, nombreArchivo: form.archivo.name })
        const { error: e1 } = await supabase.storage.from(BUCKET).upload(ruta, form.archivo, { contentType: form.archivo.type || 'application/octet-stream', upsert: false })
        if (e1) throw e1
        const { error: e2 } = await supabase.from('documentos').insert({
          ...comun, tipo: 'archivo', ruta, nombre_archivo: nombreSeguro(form.archivo.name), mime: form.archivo.type || null, tamano: form.archivo.size,
        })
        if (e2) { await supabase.storage.from(BUCKET).remove([ruta]); throw e2 }
      }
      setForm(null); setMensaje('Documento guardado.'); cargar()
    } catch (err) {
      setErrores([/Bucket not found/i.test(err.message) ? 'Falta crear el almacenamiento: ejecuta migracion_documentos.sql en el SQL Editor de Supabase.' : err.message])
    }
    setOcupado(false)
  }

  async function renombrar(doc) {
    const nuevo = window.prompt('Nuevo nombre del documento', doc.nombre)
    if (nuevo == null || !nuevo.trim() || nuevo.trim() === doc.nombre) return
    const { error: err } = await supabase.from('documentos').update({ nombre: nuevo.trim().slice(0, 120) }).eq('id', doc.id)
    if (err) setError(err.message); else cargar()
  }
  async function borrar(doc) {
    if (!window.confirm(`¿Borrar «${doc.nombre}»? No se puede deshacer.`)) return
    setOcupado(true); setError('')
    try {
      if (doc.tipo === 'archivo' && doc.ruta) {
        const { error: e1 } = await supabase.storage.from(BUCKET).remove([doc.ruta])
        if (e1) throw e1
      }
      const { error: e2 } = await supabase.from('documentos').delete().eq('id', doc.id)
      if (e2) throw e2
      cargar()
    } catch (err) { setError(err.message) }
    setOcupado(false)
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const acc = { soloLectura, ocupado, onVer: ver, onDescargar: descargar, onRenombrar: renombrar, onBorrar: borrar }

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ background: tema.color, color: '#fff', borderRadius: 10, padding: '12px 18px', marginBottom: 14, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ background: '#fff', color: tema.color, fontWeight: 800, fontSize: 12, letterSpacing: 1, borderRadius: 6, padding: '3px 10px' }}>{tema.etiqueta}</span>
        <div style={{ flex: '1 1 240px' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{tema.titulo}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{tema.sub}</div>
        </div>
        {onIrOtra && (
          <button type="button" onClick={onIrOtra} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', boxShadow: 'none' }}>
            {ambito === 'general' ? 'Ver documentos específicos →' : 'Ver procedimientos generales →'}
          </button>
        )}
      </div>

      {error && <p style={aviso}>{error}</p>}
      {mensaje && <p style={{ color: '#2e7d32' }}>{mensaje}</p>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end', marginBottom: 14 }}>
        {!soloLectura && (
          <>
            <button onClick={() => { setErrores([]); setMensaje(''); setForm({ ...FORM0, tipo: 'archivo' }) }} disabled={!!form} style={{ padding: '8px 16px', fontWeight: 600 }}>Subir archivo</button>
            <button className="secundario" onClick={() => { setErrores([]); setMensaje(''); setForm({ ...FORM0, tipo: 'enlace' }) }} disabled={!!form}>Añadir enlace</button>
          </>
        )}
        <label style={campo}><span>Buscar</span><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre del documento" /></label>
        {ambito === 'centro' && centros.length > 1 && (
          <label style={campo}>
            <span>Centro</span>
            <select value={centroFiltro} onChange={(e) => setCentroFiltro(e.target.value)}>
              <option value="">Todos</option>
              {centros.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
            </select>
          </label>
        )}
        {docs && <span style={{ opacity: 0.7, paddingBottom: 8 }}>{visibles.length} {visibles.length === 1 ? 'documento' : 'documentos'}</span>}
      </div>

      {form && (
        <div style={{ border: `2px solid ${tema.color}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px' }}>{form.tipo === 'enlace' ? 'Añadir enlace' : 'Subir archivo'} · {ambito === 'general' ? 'general (lo ven todos los centros)' : 'específico de un centro'}</h3>
          {errores.length > 0 && <div style={aviso}>{errores.map((e, i) => <div key={i}>{e}</div>)}</div>}
          {ambito === 'centro' && (
            <label style={{ ...campo, maxWidth: 420, margin: '8px 0 10px' }}>
              <span>Centro al que pertenece</span>
              <select style={ancho} value={form.centro_id} onChange={(e) => set('centro_id', e.target.value)}>
                <option value="">— elige —</option>
                {centros.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
              </select>
            </label>
          )}
          {form.tipo === 'enlace' ? (
            <label style={{ ...campo, margin: '8px 0 10px' }}>
              <span>Enlace (SharePoint, OneDrive u otro, con https://)</span>
              <input style={ancho} value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..." />
              <small style={{ opacity: 0.7 }}>Quien lo abra necesita tener permiso en el sitio de origen. Si no lo tiene, es mejor subir el archivo.</small>
            </label>
          ) : (
            <label style={{ ...campo, margin: '8px 0 10px' }}>
              <span>Archivo (máximo {tamanoLegible(MAX_BYTES)})</span>
              <input type="file" onChange={(e) => {
                const archivo = e.target.files?.[0] ?? null
                setForm((f) => ({ ...f, archivo, nombre: f.nombre || (archivo ? archivo.name.replace(new RegExp(`\\.${extension(archivo.name)}$`), '') : '') }))
              }} />
            </label>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <label style={{ ...campo, flex: '1 1 260px' }}>
              <span>Tipo de documento</span>
              <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
                <option value="">{ambito === 'general' ? 'Procedimiento' : 'Otro documento'}</option>
                {CATEGORIAS_DOC[ambito].map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </label>
            <label style={{ ...campo, flex: '0 1 180px' }}>
              <span>{ambito === 'centro' ? 'Fecha de la actividad' : 'Fecha del documento'}</span>
              <input type="date" value={form.fecha_actividad} onChange={(e) => set('fecha_actividad', e.target.value)} />
            </label>
          </div>
          {ambito === 'centro' && CATEGORIAS_DOC.centro.find((c) => c.id === form.categoria)?.actividad && (
            <p style={{ fontSize: 13, margin: '0 0 10px', opacity: 0.8 }}>Este documento se contará en la memoria anual como actividad realizada en el centro en esa fecha.</p>
          )}
          <label style={{ ...campo, marginBottom: 12 }}>
            <span>Nombre que tendrá el documento</span>
            <input style={ancho} maxLength={120} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={guardar} disabled={ocupado} style={{ padding: '8px 16px', fontWeight: 600 }}>{ocupado ? 'Guardando...' : 'Guardar'}</button>
            <button className="secundario" onClick={() => { setForm(null); setErrores([]) }} disabled={ocupado}>Cancelar</button>
          </div>
        </div>
      )}

      {!docs && <p>Cargando...</p>}
      {docs && grupos.length === 0 && !error && <p className="vacio">{docs.length ? 'Ningún documento coincide.' : 'Todavía no hay documentos.'}</p>}
      {grupos.length > 0 && <ListaDocumentos tema={tema} grupos={grupos} {...acc} />}
    </div>
  )
}
