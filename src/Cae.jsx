import { useEffect, useMemo, useState } from 'react'
import CaeDocumentos from './CaeDocumentos'
import VerificarPase from './VerificarPase'
import { accesoEmpresa, cargarContenidos, cargarEmpresas, cargarTipos, explicar, guardarContenido, subirDocumento } from './caeDatos'
import VistaTexto from './VistaTexto'
import { URL_ACCESOS, codigoDeRuta, fechaCorta, hoyISO, resumenEmpresa, sumarMeses, tipoDeArchivo } from './caeLogic'
import { imprimirCertificado, imprimirContenido } from './caeImprimir'
import { abrirLibro, leerHoja } from './excelUtil'

// Coordinación de actividades empresariales (RD 171/2004): empresas externas, su documentación,
// accesos de sus trabajadores, textos para externos e importación desde la web antigua (Sheets y Drive).
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const ok = { color: '#1b5e20', background: '#e8f5e9', padding: 10, borderRadius: 6 }
const quitar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const PESTANAS = [
  { id: 'empresas', texto: 'Empresas' },
  { id: 'accesos', texto: 'Accesos de trabajadores' },
  { id: 'textos', texto: 'Información para externos' },
  { id: 'importar', texto: 'Importar desde la web antigua' },
]
const FILTROS = {
  todas: { texto: 'Todas', f: () => true },
  revisar: { texto: 'Con documentos por revisar', f: (e) => e.r.porRevisar > 0 },
  pronto: { texto: 'Con documentos que caducan pronto', f: (e) => e.r.caducanPronto > 0 },
  oblig: { texto: 'Con documentos pendientes', f: (e) => e.r.obligPend.length > 0 },
  completas: { texto: 'Con la documentación completa', f: (e) => e.r.obligPend.length === 0 },
  sinusuario: { texto: 'Sin usuario', f: (e) => !e.user_id },
  inactivas: { texto: 'Dadas de baja', f: (e) => !e.activa },
}
const VACIA = { codigo: '', nombre: '', cif: '', email: '', telefono: '', contacto: '', actividad: '', observaciones: '', activa: true }

function Etiqueta({ color, fondo, children }) {
  return <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10, color, background: fondo, whiteSpace: 'nowrap' }}>{children}</span>
}

function siguienteCodigo(empresas) {
  const n = empresas.map((e) => parseInt(String(e.codigo ?? '').replace(/\D/g, ''), 10) || 0)
  return `A${String(Math.max(0, ...n) + 1).padStart(3, '0')}`
}

// ---------- Ficha de una empresa ----------
function FormEmpresa({ inicial, onGuardar, onCancelar, trabajando }) {
  const [f, setF] = useState(inicial)
  const campo = (k, t, props = {}) => (
    <label style={{ flex: props.ancho ?? '1 1 220px' }}>{t}<br />
      <input value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} {...props.input} />
    </label>
  )
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {campo('codigo', 'Código', { ancho: '0 1 110px' })}
      {campo('nombre', 'Razón social', { ancho: '2 1 280px' })}
      {campo('cif', 'CIF', { ancho: '0 1 140px' })}
      {campo('actividad', 'Actividad o servicio que presta', { ancho: '2 1 280px' })}
      {campo('email', 'Correo (usuario de acceso)', { input: { type: 'email' } })}
      {campo('contacto', 'Persona de contacto')}
      {campo('telefono', 'Teléfono', { ancho: '0 1 150px' })}
      <label style={{ flexBasis: '100%' }}>Observaciones<br />
        <textarea rows={2} value={f.observaciones ?? ''} onChange={(e) => setF({ ...f, observaciones: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
      </label>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input type="checkbox" checked={!!f.activa} onChange={(e) => setF({ ...f, activa: e.target.checked })} /> Empresa activa (aparece en la web de accesos)
      </label>
      <span style={{ flex: 1 }} />
      {onCancelar && <button className="secundario" onClick={onCancelar} disabled={trabajando}>Cancelar</button>}
      <button onClick={() => onGuardar(f)} disabled={trabajando || !f.nombre?.trim()}>{trabajando ? 'Guardando...' : 'Guardar datos'}</button>
    </div>
  )
}

function PanelAcceso({ supabase, empresa, onCambio }) {
  const [trabajando, setTrabajando] = useState('')
  const [error, setError] = useState('')
  const [clave, setClave] = useState(null)
  async function hacer(accion) {
    if (accion === 'quitar' && !window.confirm('¿Quitar el acceso de esta empresa a la plataforma?')) return
    setError(''); setTrabajando(accion); setClave(null)
    try {
      const r = await accesoEmpresa(supabase, accion, empresa.id)
      if (r.password) setClave(r)
      onCambio()
    } catch (e) { setError(e.message) }
    setTrabajando('')
  }
  return (
    <div style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: '10px 14px', background: '#fff', marginBottom: 14 }}>
      <strong style={{ color: '#1f3864' }}>Acceso de la empresa a la plataforma</strong>
      <p style={{ margin: '4px 0 8px', fontSize: 14 }}>
        {empresa.user_id ? <>Tiene usuario: <b>{empresa.email}</b>. Ve solo su ficha y sus documentos.</> : 'Todavía no tiene usuario.'}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {!empresa.user_id && <button onClick={() => hacer('crear')} disabled={!!trabajando || !empresa.email}>{trabajando === 'crear' ? 'Creando...' : 'Crear usuario'}</button>}
        {empresa.user_id && <button className="secundario" onClick={() => hacer('restablecer')} disabled={!!trabajando}>{trabajando === 'restablecer' ? '...' : 'Nueva contraseña'}</button>}
        {empresa.user_id && <button className="secundario" onClick={() => hacer('quitar')} disabled={!!trabajando}>Quitar acceso</button>}
      </div>
      {!empresa.email && <p style={{ fontSize: 13, color: '#8a5a00', margin: '6px 0 0' }}>Añade el correo de la empresa para poder crear su usuario.</p>}
      {clave && (
        <div style={{ ...ok, marginTop: 10 }}>
          Comunica estos datos a la empresa (la contraseña no se vuelve a mostrar):<br />
          Web: <b>{window.location.origin}</b> · Usuario: <b>{clave.email}</b> · Contraseña: <b style={{ userSelect: 'all' }}>{clave.password}</b>
        </div>
      )}
      {error && <p style={{ ...aviso, margin: '8px 0 0' }}>{error}</p>}
    </div>
  )
}

function Ficha({ supabase, empresa, tipos, onVolver, onRecargar, onDoc }) {
  const [trabajando, setTrabajando] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const r = resumenEmpresa(tipos, empresa.docs)
  async function guardar(f) {
    setError(''); setMsg(''); setTrabajando(true)
    const datos = { ...f, codigo: f.codigo?.trim() || null, nombre: f.nombre.trim(), email: f.email?.trim().toLowerCase() || null }
    delete datos.docs; delete datos.id; delete datos.user_id; delete datos.creada_en; delete datos.r
    const { error: e } = await supabase.from('empresas_externas').update(datos).eq('id', empresa.id)
    if (e) setError(explicar(e)); else { setMsg('Datos guardados.'); onRecargar() }
    setTrabajando(false)
  }
  return (
    <div>
      <p><button className="secundario" onClick={onVolver}>← Volver a las empresas</button></p>
      <h3 style={{ margin: '0 0 4px' }}>{empresa.codigo ? `${empresa.codigo} · ` : ''}{empresa.nombre}</h3>
      <p style={{ margin: '0 0 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {r.obligPend.length === 0 ? <Etiqueta color="#1b6e3c" fondo="#e3f3e8">Documentación completa</Etiqueta> : <Etiqueta color="#8a5a00" fondo="#fdf0d5">{r.obligPend.length} documentos pendientes</Etiqueta>}
        {r.porRevisar > 0 && <Etiqueta color="#8a5a00" fondo="#fdf0d5">{r.porRevisar} por revisar</Etiqueta>}
      </p>
      <details style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: '10px 14px', background: '#fff', marginBottom: 14 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#1f3864' }}>Datos de la empresa</summary>
        <div style={{ marginTop: 10 }}><FormEmpresa inicial={empresa} onGuardar={guardar} trabajando={trabajando} /></div>
        {msg && <p style={{ ...ok, margin: '8px 0 0' }}>{msg}</p>}
        {error && <p style={{ ...aviso, margin: '8px 0 0' }}>{error}</p>}
      </details>
      <PanelAcceso supabase={supabase} empresa={empresa} onCambio={onRecargar} />
      <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 12px' }}>
        <button className="secundario" onClick={() => imprimirCertificado(empresa)}>Plantilla del certificado CAE (con sus datos)</button>
      </p>
      <CaeDocumentos supabase={supabase} empresa={empresa} tipos={tipos} modo="tecnico" onCambio={onDoc} />
    </div>
  )
}

// ---------- Lista de empresas ----------
function Empresas({ supabase, tipos, empresas, onRecargar, setEmpresas }) {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [abierta, setAbierta] = useState(null)
  const [nueva, setNueva] = useState(false)
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState('')

  const lista = useMemo(() => {
    const q = quitar(busca.trim())
    return empresas.map((e) => ({ ...e, r: resumenEmpresa(tipos, e.docs) }))
      .filter((e) => (filtro === 'inactivas' ? !e.activa : e.activa || filtro === 'todas'))
      .filter(FILTROS[filtro].f)
      .filter((e) => !q || quitar(`${e.codigo} ${e.nombre} ${e.cif} ${e.email} ${e.actividad}`).includes(q))
  }, [empresas, tipos, busca, filtro])

  const empresa = empresas.find((e) => e.id === abierta)
  if (empresa) {
    const onDoc = (doc) => setEmpresas((prev) => prev.map((e) => (e.id !== doc.empresa_id ? e : {
      ...e, docs: [...e.docs.filter((d) => d.id !== doc.id && d.tipo !== doc.tipo), doc],
    })))
    return <Ficha supabase={supabase} empresa={empresa} tipos={tipos} onVolver={() => setAbierta(null)} onRecargar={onRecargar} onDoc={onDoc} />
  }

  async function crear(f) {
    setError(''); setTrabajando(true)
    const { data, error: e } = await supabase.from('empresas_externas')
      .insert({ ...f, codigo: f.codigo?.trim() || null, nombre: f.nombre.trim(), email: f.email?.trim().toLowerCase() || null }).select('id').single()
    if (e) setError(/duplicate|unique/i.test(e.message) ? 'Ya existe una empresa con ese código.' : explicar(e))
    else { setNueva(false); await onRecargar(); setAbierta(data.id) }
    setTrabajando(false)
  }

  const total = empresas.filter((e) => e.activa)
  const completas = total.filter((e) => resumenEmpresa(tipos, e.docs).obligPend.length === 0).length
  return (
    <div>
      <p style={{ margin: '0 0 12px', color: '#55616b' }}>{total.length} empresas activas · {completas} con la documentación completa · {total.length - completas} con documentos pendientes</p>
      {error && <p style={aviso}>{error}</p>}
      {nueva ? (
        <div style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: 14, background: '#fff', marginBottom: 14 }}>
          <strong style={{ display: 'block', marginBottom: 8, color: '#1f3864' }}>Nueva empresa</strong>
          <FormEmpresa inicial={{ ...VACIA, codigo: siguienteCodigo(empresas) }} onGuardar={crear} onCancelar={() => setNueva(false)} trabajando={trabajando} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => setNueva(true)}>+ Nueva empresa</button>
          <input type="search" placeholder="Buscar por código, nombre, CIF o actividad" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ padding: '7px 10px', flex: '1 1 260px', maxWidth: 380 }} />
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>{Object.entries(FILTROS).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}</select>
        </div>
      )}
      {lista.length === 0 && <p className="vacio">{empresas.length ? 'Ninguna empresa coincide.' : 'Todavía no hay empresas. Créalas o impórtalas desde la web antigua.'}</p>}
      <div style={{ border: lista.length ? '1px solid #c9d2d8' : 0, borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
        {lista.map((e, i) => (
          <button key={e.id} type="button" onClick={() => setAbierta(e.id)}
            style={{ display: 'flex', width: '100%', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '10px 14px', border: 0, borderTop: i ? '1px solid #e2e7ea' : 0, borderRadius: 0,
              background: '#fff', color: '#1f2a33', font: 'inherit', textAlign: 'left', cursor: 'pointer', boxShadow: 'none', opacity: e.activa ? 1 : 0.6 }}>
            <span style={{ flex: '1 1 260px' }}>
              <strong>{e.codigo ? `${e.codigo} · ` : ''}{e.nombre}</strong>
              <small style={{ display: 'block', color: '#6f7b84' }}>{[e.actividad, e.email].filter(Boolean).join(' · ') || 'Sin datos de contacto'}</small>
            </span>
            {e.r.obligPend.length === 0 ? <Etiqueta color="#1b6e3c" fondo="#e3f3e8">Completa</Etiqueta> : <Etiqueta color="#8a5a00" fondo="#fdf0d5">{e.r.obligPend.length} pendientes</Etiqueta>}
            {e.r.porRevisar > 0 && <Etiqueta color="#8a5a00" fondo="#fdf0d5">{e.r.porRevisar} por revisar</Etiqueta>}
            {e.r.caducanPronto > 0 && <Etiqueta color="#8a5a00" fondo="#fdf0d5">{e.r.caducanPronto} caducan pronto</Etiqueta>}
            {!e.user_id && <Etiqueta color="#55616b" fondo="#eef1f3">Sin usuario</Etiqueta>}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------- Registro de accesos de trabajadores ----------
function Accesos({ supabase }) {
  const [filas, setFilas] = useState(null)
  const [busca, setBusca] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    supabase.from('accesos_externos').select('*').order('creado_en', { ascending: false }).limit(1000)
      .then(({ data, error: e }) => { if (e) { setError(explicar(e)); setFilas([]) } else setFilas(data) })
  }, [supabase])
  const lista = useMemo(() => {
    const q = quitar(busca.trim())
    return (filas ?? []).filter((a) => !q || quitar(`${a.codigo} ${a.nombre} ${a.dni} ${a.empresa_nombre}`).includes(q))
  }, [filas, busca])
  const hoy = hoyISO()
  return (
    <div>
      <p style={{ marginTop: 0, maxWidth: '75ch' }}>
        Los trabajadores de las empresas externas se registran en la web de accesos ({URL_ACCESOS}), sin usuario: leen la información de riesgos y las
        medidas de emergencia, escriben su nombre, DNI o NIE y empresa, aceptan la declaración y el aviso de privacidad, y descargan su pase (6 meses).
        Los registros se borran un año después de caducar el pase. «Empresa dada de alta» indica que el nombre escrito coincide con una empresa de la CAE.
      </p>
      <VerificarPase supabase={supabase} compacto />
      {error && <p style={aviso}>{error}</p>}
      <input type="search" placeholder="Buscar por nombre, DNI, código o empresa" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ padding: '7px 10px', width: '100%', maxWidth: 380, boxSizing: 'border-box', margin: '14px 0 10px' }} />
      {!filas && <p>Cargando...</p>}
      {filas && lista.length === 0 && <p className="vacio">No hay registros.</p>}
      {lista.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: 6 }}>Fecha</th><th style={{ padding: 6 }}>Código</th><th style={{ padding: 6 }}>Trabajador/a</th><th style={{ padding: 6 }}>DNI</th><th style={{ padding: 6 }}>Empresa</th><th style={{ padding: 6 }}>Resultado</th>
            </tr></thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #e5e5e5', verticalAlign: 'top' }}>
                  <td style={{ padding: 6, whiteSpace: 'nowrap' }}>{new Date(a.creado_en).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td style={{ padding: 6, fontWeight: 700, letterSpacing: '.06em' }}>{a.codigo}</td>
                  <td style={{ padding: 6 }}>{a.nombre}</td>
                  <td style={{ padding: 6 }}>{a.dni}</td>
                  <td style={{ padding: 6 }}>{a.empresa_nombre}{a.empresa_id ? <small style={{ display: 'block', color: '#1b6e3c' }}>Empresa dada de alta</small> : <small style={{ display: 'block', color: '#8a5a00' }}>No coincide con ninguna empresa de la CAE</small>}</td>
                  <td style={{ padding: 6 }}>
                    {a.autorizado
                      ? <span style={{ color: a.valido_hasta >= hoy ? '#1b6e3c' : '#6f7b84', fontWeight: 600 }}>{a.valido_hasta >= hoy ? 'Pase válido' : 'Pase caducado'} hasta {fechaCorta(a.valido_hasta)}</span>
                      : <span style={{ color: '#b3261e' }}>Denegado: faltaba {(a.faltan ?? []).join(', ')}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---------- Textos para externos ----------
const CLAVES = ['ir_externos', 'emergencias_externos', 'privacidad_accesos', 'declaracion_accesos']
function Textos({ supabase }) {
  const [c, setC] = useState(null)
  const [abierta, setAbierta] = useState(CLAVES[0])
  const [borrador, setBorrador] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { cargarContenidos(supabase).then(setC).catch((e) => { setError(e.message); setC({}) }) }, [supabase])
  useEffect(() => { if (c?.[abierta]) setBorrador(c[abierta].texto) }, [abierta, c])
  if (!c) return <p>Cargando...</p>
  const actual = c[abierta]
  async function guardar() {
    setError(''); setMsg(''); setTrabajando(true)
    try { const n = await guardarContenido(supabase, actual, borrador); setC({ ...c, [abierta]: n }); setMsg(`Guardado como versión ${n.version}.`) } catch (e) { setError(e.message) }
    setTrabajando(false)
  }
  return (
    <div>
      <p style={{ marginTop: 0, maxWidth: '75ch' }}>
        Son comunes a todos los centros. Los ven los trabajadores en la web de accesos antes de pedir su pase, y las empresas en la plataforma.
        Formato: una línea que empieza por «# » es un título; por «- », un punto de lista; el resto, párrafos.
      </p>
      {error && <p style={aviso}>{error}</p>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {CLAVES.filter((k) => c[k]).map((k) => (
          <button key={k} className="secundario" onClick={() => { setAbierta(k); setMsg('') }} style={abierta === k ? { background: '#1f3864', color: '#fff', borderColor: '#1f3864' } : undefined}>{c[k].titulo}</button>
        ))}
      </div>
      {actual && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          <div>
            <textarea value={borrador} onChange={(e) => setBorrador(e.target.value)} rows={24} style={{ width: '100%', boxSizing: 'border-box', fontSize: 14, lineHeight: 1.45 }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6, alignItems: 'center' }}>
              <button onClick={guardar} disabled={trabajando || borrador === actual.texto}>{trabajando ? 'Guardando...' : 'Guardar'}</button>
              <button className="secundario" onClick={() => imprimirContenido({ ...actual, texto: borrador })}>PDF</button>
              <small style={{ color: '#6f7b84' }}>Versión {actual.version} · {fechaCorta(actual.actualizado_en)}</small>
            </div>
            {/\[●/.test(borrador) && <p style={{ ...aviso, background: '#fdf0d5', color: '#7a4b00', marginTop: 8 }}>Quedan datos por completar, marcados con [●].</p>}
            {msg && <p style={{ ...ok, marginTop: 8 }}>{msg}</p>}
          </div>
          <div style={{ border: '1px solid #d9dfe3', borderRadius: 8, padding: '6px 16px 12px', background: '#fff', maxHeight: 560, overflowY: 'auto' }}>
            <h3 style={{ marginBottom: 4 }}>{actual.titulo}</h3>
            <VistaTexto texto={borrador} />
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Importación desde la web antigua ----------
function Importar({ supabase, tipos, empresas, onRecargar }) {
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [filasExcel, setFilasExcel] = useState(null)
  const [archivos, setArchivos] = useState(null)
  const [trabajando, setTrabajando] = useState('')
  const porCodigo = new Map(empresas.filter((e) => e.codigo).map((e) => [e.codigo.toUpperCase(), e]))

  async function leerExcel(file) {
    setError(''); setMsg(''); setFilasExcel(null)
    try {
      const libro = await abrirLibro(file)
      const hoja = libro.getWorksheet('CONTRATAS') ? 'CONTRATAS' : libro.worksheets[0].name
      const filas = (await leerHoja(libro, hoja)).map((f) => {
        const k = Object.fromEntries(Object.entries(f).map(([a, b]) => [a.toLowerCase().replace(/\s+/g, ''), b]))
        return { codigo: (k.companyid || k.codigo || '').toUpperCase(), nombre: k.companyname || k.nombre || '', email: (k.useremail || k.email || '').toLowerCase() }
      }).filter((f) => f.nombre)
      if (!filas.length) throw new Error('No encuentro empresas: la hoja debe tener las columnas CompanyID, CompanyName y UserEmail.')
      setFilasExcel(filas)
    } catch (e) { setError(e.message) }
  }
  async function importarEmpresas() {
    setError(''); setTrabajando('excel')
    let nuevas = 0; let act = 0
    try {
      for (const f of filasExcel) {
        const ya = f.codigo && porCodigo.get(f.codigo)
        if (ya) {
          const { error: e } = await supabase.from('empresas_externas').update({ nombre: f.nombre, email: f.email || ya.email }).eq('id', ya.id)
          if (e) throw new Error(explicar(e)); act++
        } else {
          const { error: e } = await supabase.from('empresas_externas').insert({ codigo: f.codigo || null, nombre: f.nombre, email: f.email || null })
          if (e) throw new Error(explicar(e)); nuevas++
        }
      }
      setMsg(`Empresas importadas: ${nuevas} nuevas y ${act} actualizadas. Las contraseñas antiguas no se migran: crea el usuario de cada empresa desde su ficha.`)
      setFilasExcel(null); await onRecargar()
    } catch (e) { setError(e.message) }
    setTrabajando('')
  }
  function leerCarpeta(lista) {
    setError(''); setMsg('')
    const filas = [...lista].filter((f) => !f.name.startsWith('.')).map((f) => {
      const ruta = f.webkitRelativePath || f.name
      const codigo = codigoDeRuta(ruta)
      return { file: f, ruta, codigo, empresa: codigo ? porCodigo.get(codigo) : null, tipo: tipoDeArchivo(f.name) ?? '' }
    }).sort((a, b) => a.file.lastModified - b.file.lastModified)
    setArchivos(filas)
  }
  async function subirArchivos() {
    setError(''); setTrabajando('drive')
    const validos = archivos.filter((a) => a.empresa && a.tipo)
    let n = 0
    try {
      for (const a of validos) {
        const t = tipos.find((x2) => x2.codigo === a.tipo)
        await subirDocumento(supabase, a.empresa.id, a.tipo, a.file, sumarMeses(hoyISO(), t?.meses_validez))
        n++
      }
      setMsg(`Se han subido ${n} documentos con la caducidad propuesta. Revísalos y corrige la caducidad en la ficha de cada empresa.`)
      setArchivos(null); await onRecargar()
    } catch (e) { setError(`${e.message} (subidos ${n} de ${validos.length})`) }
    setTrabajando('')
  }

  return (
    <div style={{ maxWidth: 980 }}>
      {error && <p style={aviso}>{error}</p>}
      {msg && <p style={ok}>{msg}</p>}
      <section style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: 14, background: '#fff', marginBottom: 14 }}>
        <strong style={{ color: '#1f3864' }}>1. Empresas desde el Google Sheets</strong>
        <p style={{ margin: '4px 0 8px', fontSize: 14 }}>Descarga el Sheets como Excel (Archivo → Descargar → .xlsx) y elígelo. Se lee la hoja CONTRATAS: código, nombre y correo. Las empresas que ya existan con el mismo código se actualizan.</p>
        <input type="file" accept=".xlsx" onChange={(e) => e.target.files[0] && leerExcel(e.target.files[0])} />
        {filasExcel && (
          <div style={{ marginTop: 10 }}>
            <p style={{ margin: '0 0 6px' }}>{filasExcel.length} empresas: {filasExcel.filter((f) => f.codigo && porCodigo.get(f.codigo)).length} ya existen y se actualizarán.</p>
            <ul style={{ maxHeight: 180, overflowY: 'auto', margin: '0 0 8px', fontSize: 13 }}>{filasExcel.map((f, i) => <li key={i}>{f.codigo} · {f.nombre} · {f.email}</li>)}</ul>
            <button onClick={importarEmpresas} disabled={!!trabajando}>{trabajando === 'excel' ? 'Importando...' : 'Importar empresas'}</button>
          </div>
        )}
      </section>
      <section style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: 14, background: '#fff' }}>
        <strong style={{ color: '#1f3864' }}>2. Documentos desde Google Drive</strong>
        <p style={{ margin: '4px 0 8px', fontSize: 14 }}>
          Descarga la carpeta CONTRATAS de Drive, descomprímela y elígela entera. Cada carpeta «A001 - NOMBRE» se asigna a la empresa con ese código, y cada archivo
          a su tipo por el prefijo (1-, 2-, 3-) o por su nombre. Revisa la lista antes de subir; los que no tengan empresa o tipo no se suben.
        </p>
        <input type="file" multiple webkitdirectory="" directory="" onChange={(e) => leerCarpeta(e.target.files)} />
        {archivos && (
          <div style={{ marginTop: 10 }}>
            <div style={{ overflowX: 'auto', maxHeight: 360, overflowY: 'auto', border: '1px solid #e2e7ea', borderRadius: 6 }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                <thead><tr style={{ textAlign: 'left', background: '#f6f8f9', position: 'sticky', top: 0 }}><th style={{ padding: 6 }}>Archivo</th><th style={{ padding: 6 }}>Empresa</th><th style={{ padding: 6 }}>Tipo</th></tr></thead>
                <tbody>
                  {archivos.map((a, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #eef1f3', opacity: a.empresa && a.tipo ? 1 : 0.6 }}>
                      <td style={{ padding: 6 }}>{a.ruta}</td>
                      <td style={{ padding: 6 }}>{a.empresa ? `${a.empresa.codigo} · ${a.empresa.nombre}` : <span style={{ color: '#b3261e' }}>{a.codigo ? `Sin empresa con código ${a.codigo}` : 'Carpeta sin código'}</span>}</td>
                      <td style={{ padding: 6 }}>
                        <select value={a.tipo} onChange={(e) => setArchivos(archivos.map((y, j) => (j === i ? { ...y, tipo: e.target.value } : y)))}>
                          <option value="">— No subir —</option>
                          {tipos.map((t) => <option key={t.codigo} value={t.codigo}>{t.nombre}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ margin: '8px 0' }}>Se subirán {archivos.filter((a) => a.empresa && a.tipo).length} de {archivos.length} archivos.</p>
            <button onClick={subirArchivos} disabled={!!trabajando || !archivos.some((a) => a.empresa && a.tipo)}>{trabajando === 'drive' ? 'Subiendo...' : 'Subir documentos'}</button>
          </div>
        )}
      </section>
    </div>
  )
}

export default function Cae({ supabase }) {
  const [pestana, setPestana] = useState('empresas')
  const [tipos, setTipos] = useState(null)
  const [empresas, setEmpresas] = useState(null)
  const [error, setError] = useState('')
  async function recargar() {
    try { const [t, e] = await Promise.all([cargarTipos(supabase), cargarEmpresas(supabase)]); setTipos(t); setEmpresas(e); setError('') } catch (e) { setError(e.message); setTipos([]); setEmpresas([]) }
  }
  useEffect(() => { recargar() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ marginBottom: 4 }}>Coordinación de actividades empresariales (CAE)</h2>
      <p style={{ margin: '0 0 14px', color: '#55616b' }}>Empresas externas que trabajan en los centros, su documentación y el acceso de sus trabajadores (art. 24 de la Ley 31/1995 y Real Decreto 171/2004).</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, borderBottom: '1px solid #d9dfe3', paddingBottom: 8 }}>
        {PESTANAS.map((p) => (
          <button key={p.id} className="secundario" onClick={() => setPestana(p.id)} aria-current={pestana === p.id ? 'page' : undefined}
            style={pestana === p.id ? { background: '#1f3864', color: '#fff', borderColor: '#1f3864' } : undefined}>{p.texto}</button>
        ))}
      </div>
      {error && <p style={aviso}>{error}</p>}
      {(!tipos || !empresas) ? <p>Cargando...</p> : (
        <>
          {pestana === 'empresas' && <Empresas supabase={supabase} tipos={tipos} empresas={empresas} setEmpresas={setEmpresas} onRecargar={recargar} />}
          {pestana === 'accesos' && <Accesos supabase={supabase} />}
          {pestana === 'textos' && <Textos supabase={supabase} />}
          {pestana === 'importar' && <Importar supabase={supabase} tipos={tipos} empresas={empresas} onRecargar={recargar} />}
        </>
      )}
    </div>
  )
}
