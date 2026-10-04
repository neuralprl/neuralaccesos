import { useEffect, useRef, useState } from 'react'
import AccesoEvaluacion from './AccesoEvaluacion'
import EquiposInstalaciones from './EquiposInstalaciones'
import PersonasSensibles from './PersonasSensibles'
import { FormCentro } from './Centros'
import { VisitaPac } from './Pac'
import { ResumenEvaluacionCentro } from './EvaluacionCentro'
import { incidencias as incidenciasEq } from './equiposLogic'
import { problemasCierre, progresoCentro } from './evalCentroLogic'
import { htmlListadoPuestos, imprimir } from './documentos'
import { ETIQUETAS } from './centrosLogic'
import { fechaES, hoyISO } from './planLogic'
import { descargarInforme, generarDossier } from './informeDatos'
import Firmas from './Firmas'
import { fechaHora, useNotasImportantes } from './notasImportantes'

// Visita guiada al centro: sigue el orden real de la visita, con la guía de pasos arriba y un bloc de notas
// que se guarda solo. Cada paso se marca como hecho al terminarlo; algunos se marcan solos.
// Props: las mismas que ResumenEvaluacionCentro, más onEvc(evcActualizada) y onRecargar(msg).

export const TECNICO_DEFECTO = 'Julio Benages Cadroy'
export const TITULACION_DEFECTO = 'Técnico Superior en Prevención de Riesgos Laborales con las tres especialidades técnicas'

export const PASOS = [
  { id: 'preparacion', corto: 'Puestos', titulo: 'Preparación: listado de puestos' },
  { id: 'reunion', corto: 'Dirección', titulo: 'Reunión inicial con la dirección: datos del centro y acceso' },
  { id: 'inicio', corto: 'Inicio', titulo: 'Inicio de la evaluación: técnico, fecha y quién acompaña' },
  { id: 'entrevistas', corto: 'Puestos y personal', titulo: 'Entrevistas con el personal: evaluación de los puestos' },
  { id: 'personas', corto: 'Embarazo y limitaciones', titulo: 'Embarazadas y personas con limitaciones' },
  { id: 'instalaciones', corto: 'Instalaciones', titulo: 'Visita a las instalaciones: lista de comprobación, equipos e instalaciones' },
  { id: 'final', corto: 'Reunión final', titulo: 'Reunión final con la dirección' },
]

// Paso abierto de cada evaluación mientras la aplicación está abierta (al volver de evaluar un puesto se sigue en el mismo paso).
const RECUERDO = new Map()

const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const ok = { color: '#1b5e20', background: '#e8f5e9', padding: 10, borderRadius: 6 }

// ¿Está hecho el paso? Lo marcado a mano o lo que se deduce de los datos.
export function pasoHecho(id, evc, evals) {
  if (evc.pasos?.[id]) return true
  if (id === 'inicio') return !!(evc.tecnico_nombre && evc.fecha_visita)
  if (id === 'entrevistas') return !!evc.check_hecho && progresoCentro(evals).completo
  if (id === 'final') return evc.estado === 'cerrada'
  return false
}

function Guia({ actual, evc, evals, onIr }) {
  return (
    <nav aria-label="Pasos de la visita" style={{ position: 'sticky', top: 'var(--alto-cabecera, 0px)', zIndex: 5, background: '#fff', padding: '8px 0 10px', marginBottom: 12, borderBottom: '1px solid #d9dfe3' }}>
      <ol style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, overflowX: 'auto' }}>
        {PASOS.map((p, i) => {
          const hecho = pasoHecho(p.id, evc, evals)
          const esta = p.id === actual
          return (
            <li key={p.id} style={{ flex: '1 1 0', minWidth: 96 }}>
              <button type="button" onClick={() => onIr(p.id)} aria-current={esta ? 'step' : undefined} title={p.titulo}
                style={{
                  width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 4px', borderRadius: 8, cursor: 'pointer',
                  border: esta ? '2px solid #1f3864' : '1px solid #d9dfe3', background: esta ? '#eef2f8' : '#fff',
                  color: '#1f2a33', boxShadow: 'none',
                }}>
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
                  color: hecho || esta ? '#fff' : '#37424b', background: hecho ? '#2e7d32' : esta ? '#1f3864' : '#e3e7ea',
                }}>{hecho ? '✓' : i + 1}</span>
                <span style={{ fontSize: 12, lineHeight: 1.2, textAlign: 'center', fontWeight: esta ? 700 : 400, color: hecho && !esta ? '#1b5e20' : '#1f2a33' }}>{p.corto}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Bloc de notas flotante: se abre y se cierra con un botón y se guarda solo. Debajo, «Guardar nota importante»:
// cada nota importante se guarda aparte con su fecha y hora y queda en las notas del centro para siempre.
function Notas({ supabase, evc, onEvc }) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState(evc.notas ?? '')
  const [estado, setEstado] = useState('')
  const [importante, setImportante] = useState('')
  const [guardando, setGuardando] = useState(false)
  const imp = useNotasImportantes(supabase, evc)
  const ultimo = useRef(evc.notas ?? '')
  useEffect(() => { setTexto(evc.notas ?? ''); ultimo.current = evc.notas ?? '' }, [evc.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (texto === ultimo.current) return undefined
    setEstado('Guardando...')
    const t = setTimeout(async () => {
      const { error } = await supabase.from('evaluaciones_centro').update({ notas: texto }).eq('id', evc.id)
      if (error) setEstado(/notas/.test(error.message) ? 'Falta ejecutar migracion_visita.sql' : 'No se ha podido guardar')
      else { ultimo.current = texto; setEstado('Guardado'); onEvc({ ...evc, notas: texto }) }
    }, 800)
    return () => clearTimeout(t)
  }, [texto]) // eslint-disable-line react-hooks/exhaustive-deps
  async function guardarImportante() {
    setGuardando(true)
    if (await imp.guardar(importante)) setImportante('')
    setGuardando(false)
  }
  const n = (texto.match(/\S+/g) ?? []).length
  const k = imp.notas.length
  const borde = '1px solid #e6d77a'
  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 50 }}>
      {abierto && (
        <div style={{ width: 'min(400px, calc(100vw - 32px))', maxHeight: 'calc(100vh - var(--alto-cabecera, 0px) - 90px)', overflowY: 'auto', boxSizing: 'border-box',
          background: '#fffde7', border: borde, borderRadius: 10, boxShadow: '0 6px 24px rgba(0,0,0,.18)', padding: 10, marginBottom: 8, color: '#1f2a33' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong>Notas de la visita</strong>
            <small style={{ opacity: 0.7 }}>{estado}</small>
          </div>
          <textarea autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} rows={8}
            placeholder="Lo que te comenten y quieras recordar: se guarda solo."
            style={{ width: '100%', boxSizing: 'border-box', background: '#fffef5', border: borde, borderRadius: 6, padding: 8, fontSize: 14, resize: 'vertical', color: '#1f2a33' }} />

          <div style={{ marginTop: 8, padding: 8, background: '#fff4d6', border: '1px solid #f0c75e', borderRadius: 8 }}>
            <label htmlFor="nota-importante" style={{ fontWeight: 700, fontSize: 13 }}>★ Nota importante</label>
            <textarea id="nota-importante" value={importante} onChange={(e) => setImportante(e.target.value)} rows={2}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) guardarImportante() }}
              placeholder="Escribe y pulsa «Guardar nota importante»: se guarda con la fecha y la hora."
              style={{ width: '100%', boxSizing: 'border-box', margin: '4px 0 6px', background: '#fff', border: '1px solid #f0c75e', borderRadius: 6, padding: 6, fontSize: 14, resize: 'vertical', color: '#1f2a33' }} />
            <button type="button" onClick={guardarImportante} disabled={guardando || !importante.trim()}
              style={{ background: '#f9a825', color: '#222', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>
              {guardando ? 'Guardando...' : 'Guardar nota importante'}
            </button>
            {imp.error && <p style={{ color: '#b00020', fontSize: 13, margin: '6px 0 0' }}>{imp.error}</p>}
          </div>

          {k > 0 && <ListaImportantes notas={imp.notas} evcId={evc.id} onBorrar={imp.borrar} />}
        </div>
      )}
      <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}
        style={{ float: 'right', borderRadius: 24, padding: '10px 16px', fontWeight: 700, background: '#f9a825', color: '#222', border: 'none', boxShadow: '0 3px 10px rgba(0,0,0,.2)', cursor: 'pointer' }}>
        {abierto ? 'Cerrar notas' : `Notas${n ? ` (${n})` : ''}${k ? ` · ★ ${k}` : ''}`}
      </button>
    </div>
  )
}

// Lista de notas importantes del centro, de la más reciente a la más antigua, con su fecha y hora.
function ListaImportantes({ notas, evcId, onBorrar }) {
  return (
    <div style={{ marginTop: 10 }}>
      <strong style={{ fontSize: 13 }}>Notas importantes guardadas</strong>
      <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0 }}>
        {notas.map((x) => (
          <li key={x.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderTop: '1px solid #eadf9c' }}>
            <span style={{ flex: 1 }}>
              <small style={{ display: 'block', color: '#7a5d00', fontWeight: 600 }}>
                {fechaHora(x.creada_en)}{x.evaluacion_centro_id !== evcId ? ' · otra visita' : ''}
              </small>
              <span style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{x.texto}</span>
            </span>
            {onBorrar && (
              <button type="button" title="Borrar esta nota" aria-label="Borrar esta nota"
                onClick={() => { if (window.confirm('¿Borrar esta nota importante?')) onBorrar(x.id) }}
                style={{ background: 'none', border: 'none', color: '#8a6d00', cursor: 'pointer', fontSize: 16, padding: '0 4px', boxShadow: 'none' }}>×</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function BotonHecho({ hecho, onHecho, siguiente, texto = 'Paso hecho: siguiente' }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18, paddingTop: 12, borderTop: '1px solid #e5e5e5' }}>
      <button onClick={onHecho} style={{ padding: '10px 18px', fontWeight: 600 }}>{texto}</button>
      {hecho && <span style={{ color: '#2e7d32' }}>✓ Paso hecho</span>}
      {siguiente && <small style={{ opacity: 0.7 }}>Siguiente: {siguiente}</small>}
    </div>
  )
}

// ---------- Paso 1 ----------
function PasoPreparacion({ supabase, evc, evals }) {
  const [filas, setFilas] = useState(null)
  useEffect(() => {
    supabase.from('centro_puestos').select('puesto_id,n_trabajadores,turnos').eq('centro_id', evc.centros.id).then(({ data }) => {
      const m = new Map((data ?? []).map((r) => [String(r.puesto_id), r]))
      setFilas([...evals].sort((a, b) => (a.puestos?.nombre ?? '').localeCompare(b.puestos?.nombre ?? '', 'es')).map((e) => {
        const r = m.get(String(e.puesto_id))
        return { puesto: e.puestos?.nombre ?? '', n_trabajadores: r?.n_trabajadores ?? '', turnos: r?.turnos ? (ETIQUETAS.turnos[r.turnos] ?? r.turnos) : '', estado: e.estado }
      }))
    })
  }, [evc.id, evals.length]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <p style={{ marginTop: 0 }}>Imprime el listado y llévalo a la visita para confirmar los puestos, las personas de cada uno y los cambios.</p>
      <button onClick={() => imprimir(htmlListadoPuestos(evc.centros, filas ?? [], evc.fecha_visita || hoyISO()))} disabled={!filas}>Listado de puestos (PDF)</button>
      {filas && (
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 760, marginTop: 12 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}><th style={{ padding: 6 }}>Puesto</th><th style={{ padding: 6 }}>Personas</th><th style={{ padding: 6 }}>Turnos</th></tr></thead>
          <tbody>{filas.map((f, i) => <tr key={i} style={{ borderBottom: '1px solid #eee' }}><td style={{ padding: 6 }}>{f.puesto}</td><td style={{ padding: 6 }}>{f.n_trabajadores || '—'}</td><td style={{ padding: 6 }}>{f.turnos || '—'}</td></tr>)}</tbody>
        </table>
      )}
      <p style={{ fontSize: 13, opacity: 0.75 }}>Si en el centro hay puestos nuevos o que ya no existen, cámbialos en el paso siguiente, en los datos del centro.</p>
    </div>
  )
}

// ---------- Paso 2 ----------
function PasoReunion({ supabase, evc, onGuardado }) {
  const [centro, setCentro] = useState(null)
  const [puestos, setPuestos] = useState(null)
  const [clave, setClave] = useState(0)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    Promise.all([
      supabase.from('centros').select('*').eq('id', evc.centros.id).single(),
      supabase.from('puestos').select('id,nombre').neq('nombre', 'TODOS').order('nombre'),
    ]).then(([c, p]) => { setCentro(c.data); setPuestos(p.data ?? []) })
  }, [evc.centros.id, clave]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <p style={{ marginTop: 0 }}>Con la dirección: completa los datos del centro que necesitas para empezar y explícale el acceso a la plataforma. Te indicará el usuario (correo) y la contraseña.</p>
      {msg && <p style={ok}>{msg}</p>}
      <details open style={{ marginBottom: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>Datos del centro</summary>
        <div style={{ marginTop: 8 }}>
          {centro && puestos
            ? <FormCentro key={clave} supabase={supabase} centro={centro} puestos={puestos} onVolver={() => setClave((k) => k + 1)}
                onGuardado={() => { setMsg('Datos del centro guardados.'); setClave((k) => k + 1); onGuardado() }} />
            : <p>Cargando...</p>}
        </div>
      </details>
      <AccesoEvaluacion supabase={supabase} evaluacionCentro={evc} />
    </div>
  )
}

// ---------- Paso 3 ----------
function PasoInicio({ supabase, evc, onEvc, onHecho }) {
  const [f, setF] = useState({
    tecnico_nombre: evc.tecnico_nombre || TECNICO_DEFECTO,
    tecnico_titulacion: evc.tecnico_titulacion || TITULACION_DEFECTO,
    fecha_visita: evc.fecha_visita || hoyISO(),
    acompanante: evc.acompanante || '',
  })
  const [error, setError] = useState('')
  async function guardar() {
    setError('')
    const cambios = { ...f, tecnico_nombre: f.tecnico_nombre.trim() || TECNICO_DEFECTO, acompanante: f.acompanante.trim() || null }
    const { error: err } = await supabase.from('evaluaciones_centro').update(cambios).eq('id', evc.id)
    if (err) { setError(/tecnico_|fecha_visita|acompanante/.test(err.message) ? 'Falta ampliar la base de datos: ejecuta migracion_visita.sql.' : err.message); return }
    onEvc({ ...evc, ...cambios })
    onHecho()
  }
  const campo = { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12, maxWidth: 640 }
  return (
    <div>
      {error && <p style={aviso}>{error}</p>}
      <label style={campo}><b>Técnico que firma la evaluación</b><input value={f.tecnico_nombre} onChange={(e) => setF({ ...f, tecnico_nombre: e.target.value })} /></label>
      <label style={campo}><b>Titulación</b><input value={f.tecnico_titulacion} onChange={(e) => setF({ ...f, tecnico_titulacion: e.target.value })} /></label>
      <label style={campo}><b>Fecha de la visita</b><input type="date" value={f.fecha_visita} onChange={(e) => setF({ ...f, fecha_visita: e.target.value })} style={{ maxWidth: 200 }} /></label>
      <label style={campo}><b>¿Quién acompaña?</b><input value={f.acompanante} onChange={(e) => setF({ ...f, acompanante: e.target.value })} placeholder="Nombre y cargo (puede quedar en blanco)" /></label>
      <button onClick={guardar} style={{ padding: '10px 18px', fontWeight: 600 }}>Guardar y seguir</button>
    </div>
  )
}

// ---------- Paso 6 ----------
function PasoInstalaciones({ supabase, evc, onEvc }) {
  const [vista, setVista] = useState('check')       // check | equipo | instalacion
  const [alta, setAlta] = useState(0)
  const [visitaId, setVisitaId] = useState(evc.pac_visita_id ?? null)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(!evc.pac_visita_id)

  useEffect(() => {
    if (visitaId) return
    // Si ya hay una visita PAC del centro desde el inicio de esta evaluación, se usa esa.
    supabase.from('pac_visitas').select('id,fecha').eq('centro_id', evc.centros.id).gte('fecha', evc.fecha).order('fecha', { ascending: false }).limit(1)
      .then(({ data }) => { if (data?.[0]) vincular(data[0].id); setBuscando(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function vincular(id) {
    setVisitaId(id)
    const { error: err } = await supabase.from('evaluaciones_centro').update({ pac_visita_id: id }).eq('id', evc.id)
    if (!err) onEvc({ ...evc, pac_visita_id: id })
  }
  async function empezarVisita() {
    setError('')
    const { data, error: err } = await supabase.from('pac_visitas').insert({ centro_id: evc.centros.id }).select('id').single()
    if (err) setError(err.message); else vincular(data.id)
  }
  const boton = (activo) => ({ padding: '10px 14px', fontWeight: 700, ...(activo ? { background: '#1f3864', color: '#fff', borderColor: '#1f3864' } : {}) })

  return (
    <div>
      <p style={{ marginTop: 0 }}>Recorre las instalaciones: completa la lista de comprobación y, a la vez, registra y evalúa cada equipo o instalación que veas.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, position: 'sticky', top: 'calc(var(--alto-cabecera, 0px) + 74px)', zIndex: 4, background: '#fff', padding: '6px 0' }}>
        <button className="secundario" style={boton(vista === 'check')} onClick={() => setVista('check')}>Lista de comprobación</button>
        <button className="secundario" style={boton(vista === 'equipo')} onClick={() => { setVista('equipo'); setAlta((n) => n + 1) }}>+ Registrar nuevo equipo</button>
        <button className="secundario" style={boton(vista === 'instalacion')} onClick={() => { setVista('instalacion'); setAlta((n) => n + 1) }}>+ Registrar nueva instalación</button>
      </div>
      {error && <p style={aviso}>{error}</p>}
      {vista === 'check' && (
        buscando ? <p>Cargando...</p>
          : visitaId ? <VisitaPac supabase={supabase} visitaId={visitaId} onVolver={() => setVista('equipo')} />
            : <div><p>Todavía no has empezado la lista de comprobación de esta visita.</p><button onClick={empezarVisita} style={{ padding: '10px 18px', fontWeight: 600 }}>Empezar la lista de comprobación</button></div>
      )}
      {vista !== 'check' && (
        <EquiposInstalaciones key={`${vista}-${alta}`} supabase={supabase} centroFijo={evc.centros} pestanaInicial={vista} altaRapida />
      )}
    </div>
  )
}

// ---------- Paso 7 ----------
function Documentos({ supabase, evc }) {
  const [haciendo, setHaciendo] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  async function hacer(tipo) {
    setHaciendo(tipo); setErr(''); setMsg('')
    try {
      if (tipo === 'dossier') {
        const r = await generarDossier(supabase, evc.id)
        setMsg(`Dossier generado con ${r.partes} documentos.${r.sinERE.length ? ` Sin ERE por falta de datos de exposición: ${r.sinERE.join(', ')}.` : ''}`)
      } else await descargarInforme(supabase, evc.id, tipo)
    } catch (e) { setErr(e.message) }
    setHaciendo('')
  }
  return (
    <div style={{ border: '1px solid #d9dfe3', borderRadius: 10, padding: '10px 14px', margin: '14px 0', background: '#f7f9fb' }}>
      <strong>Documentos de la evaluación</strong>
      <p style={{ fontSize: 13, margin: '4px 0 8px', opacity: 0.85 }}>
        El dossier reúne en un solo PDF el informe de evaluación, el PAP, y de cada puesto evaluado su información de riesgos, ERE, EPI y formación, más los equipos e instalaciones y la comprobación del lugar de trabajo.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => hacer('dossier')} disabled={!!haciendo} style={{ fontWeight: 700 }}>{haciendo === 'dossier' ? 'Preparando...' : 'Generar todos los documentos (PDF)'}</button>
        <button className="secundario" onClick={() => hacer('word')} disabled={!!haciendo}>{haciendo === 'word' ? 'Preparando...' : 'Informe de evaluación (Word)'}</button>
        <button className="secundario" onClick={() => hacer('pdf')} disabled={!!haciendo}>{haciendo === 'pdf' ? 'Preparando...' : 'Informe de evaluación (PDF)'}</button>
      </div>
      {msg && <p style={{ ...ok, marginBottom: 0 }}>{msg}</p>}
      {err && <p style={{ ...aviso, marginBottom: 0 }}>{err}</p>}
    </div>
  )
}

function PasoFinal({ supabase, evc, evals, onCerrar, onReabrir, onPap, trabajando }) {
  const [datos, setDatos] = useState(null)
  const imp = useNotasImportantes(supabase, evc)
  useEffect(() => {
    Promise.all([
      supabase.from('equipos_evaluacion').select('tipo,presente,respuestas').eq('centro_id', evc.centros.id),
      supabase.from('personas_sensibles').select('tipo,informe_estado,activa').eq('centro_id', evc.centros.id).eq('activa', true),
      evc.pac_visita_id ? supabase.from('pac_respuestas').select('id', { count: 'exact', head: true }).eq('visita_id', evc.pac_visita_id) : Promise.resolve({ count: null }),
    ]).then(([eq, ps, pac]) => setDatos({ eq: eq.data ?? [], ps: ps.data ?? [], pac: pac.count }))
  }, [evc.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const prog = progresoCentro(evals)
  const problemas = problemasCierre(evc, evals)
  const cerrada = evc.estado === 'cerrada'
  const eqInc = datos ? datos.eq.filter((x) => x.presente).reduce((n, x) => n + incidenciasEq(x).length, 0) : null
  const informes = datos ? datos.ps.filter((x) => x.tipo === 'limitaciones' && x.informe_estado === 'pendiente').length : null
  const tarjeta = { border: '1px solid #d9dfe3', borderRadius: 8, padding: '10px 12px', background: '#fff' }
  return (
    <div>
      <p style={{ marginTop: 0 }}>Repasa con la dirección lo visto y explícale cómo acceder a la plataforma para seguir sus acciones.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
        <div style={tarjeta}><b>{prog.hechos} de {prog.total}</b><br />puestos evaluados</div>
        <div style={tarjeta}><b>{evc.check_hecho ? 'Respondida' : 'Sin responder'}</b><br />lista de comprobación de la evaluación</div>
        <div style={tarjeta}><b>{datos?.pac ?? '—'}</b><br />incidencias en la visita (PAC)</div>
        <div style={tarjeta}><b>{eqInc ?? '—'}</b><br />incidencias en equipos e instalaciones</div>
        <div style={tarjeta}><b>{datos ? datos.ps.length : '—'}</b><br />personas especialmente sensibles{informes ? <><br /><span style={{ color: '#ef6c00' }}>{informes} informes de adaptación pendientes</span></> : null}</div>
      </div>

      {(evc.notas || imp.notas.length > 0) && (
        <details open style={{ background: '#fffde7', border: '1px solid #e6d77a', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Notas de la visita</summary>
          {evc.notas && <p style={{ whiteSpace: 'pre-wrap', margin: '6px 0 0' }}>{evc.notas}</p>}
          {imp.notas.length > 0 && <ListaImportantes notas={imp.notas} evcId={evc.id} />}
        </details>
      )}

      <h3 style={{ marginBottom: 6 }}>Guion para la reunión</h3>
      <ol style={{ marginTop: 0 }}>
        <li>Puestos evaluados y riesgos más relevantes (prioridades altas del PAP).</li>
        <li>Incidencias de la visita y de los equipos e instalaciones, y sus plazos.</li>
        {datos?.ps.length > 0 && <li>Situaciones de embarazo, lactancia o limitaciones: ERE del puesto e informes de adaptación.</li>}
        <li>Acceso a la plataforma: el centro marca las acciones como realizadas y ve los avisos de plazos en su panel.</li>
      </ol>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0' }}>
        <button className="secundario" onClick={onPap} disabled={trabajando || prog.evaluados + prog.enCurso === 0}>Ver el PAP del centro</button>
        {cerrada
          ? <button className="secundario" onClick={onReabrir} disabled={trabajando}>Reabrir la evaluación</button>
          : <button onClick={onCerrar} disabled={trabajando || problemas.length > 0} style={{ padding: '10px 18px', fontWeight: 600 }}>Cerrar la evaluación del centro</button>}
      </div>
      {!cerrada && problemas.length > 0 && (
        <div style={{ fontSize: 14 }}><b>Para cerrar falta:</b><ul style={{ margin: '4px 0' }}>{problemas.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
      )}
      {cerrada && <p style={ok}>Evaluación cerrada el {fechaES(evc.fecha_cierre)}. Queda registrada en el control de cambios.</p>}
      <Firmas supabase={supabase} evc={evc} />
      <Documentos supabase={supabase} evc={evc} />

      <div style={{ marginTop: 20 }}>
        <AccesoEvaluacion supabase={supabase} evaluacionCentro={evc} resaltar />
        <p style={{ fontSize: 14 }}>Dirección de acceso: <b>{typeof window !== 'undefined' ? window.location.origin : ''}</b>. El centro entra con el correo y la contraseña que te indicó.</p>
      </div>
    </div>
  )
}

// ---------- Visita completa ----------
export default function VisitaCentro(props) {
  const { supabase, evc, evals, onEvc, onRecargar, onVolver, mensaje, error } = props
  const primerPendiente = PASOS.find((p) => !pasoHecho(p.id, evc, evals))?.id ?? 'final'
  const [actual, setActualEstado] = useState(RECUERDO.get(evc.id) ?? primerPendiente)
  const setActual = (id) => { RECUERDO.set(evc.id, id); setActualEstado(id) }
  const [fallo, setFallo] = useState('')
  const indice = PASOS.findIndex((p) => p.id === actual)
  const siguiente = PASOS[indice + 1]

  async function marcar(id, irSiguiente = true) {
    setFallo('')
    const pasos = { ...(evc.pasos ?? {}), [id]: true }
    const { error: err } = await supabase.from('evaluaciones_centro').update({ pasos }).eq('id', evc.id)
    if (err) { setFallo(/pasos/.test(err.message) ? 'Falta ampliar la base de datos: ejecuta migracion_visita.sql.' : err.message); return }
    onEvc({ ...evc, pasos })
    if (irSiguiente && siguiente) { setActual(siguiente.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }
  const ir = (id) => { setActual(id); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div style={{ textAlign: 'left', maxWidth: 1040, paddingBottom: 70 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: '0 0 4px' }}>Visita al centro · {evc.centros.codigo} · {evc.centros.nombre}</h2>
        <button className="secundario" onClick={onVolver}>Volver a la lista</button>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 14, opacity: 0.8 }}>
        {evc.fecha_visita ? `Visita del ${fechaES(evc.fecha_visita)}` : `Evaluación iniciada el ${fechaES(evc.fecha)}`}
        {evc.tecnico_nombre ? ` · ${evc.tecnico_nombre}` : ''}{evc.acompanante ? ` · acompaña ${evc.acompanante}` : ''}
        {evc.motivo ? ` · motivo: ${evc.motivo}` : ''}
      </p>
      <Guia actual={actual} evc={evc} evals={evals} onIr={ir} />

      <h3 style={{ marginTop: 0 }}>{indice + 1}. {PASOS[indice].titulo}</h3>
      {mensaje && <p style={ok}>{mensaje}</p>}
      {(error || fallo) && <p style={aviso}>{error || fallo}</p>}

      {actual === 'preparacion' && <><PasoPreparacion supabase={supabase} evc={evc} evals={evals} /><BotonHecho hecho={pasoHecho('preparacion', evc, evals)} onHecho={() => marcar('preparacion')} siguiente={siguiente?.corto} /></>}
      {actual === 'reunion' && <><PasoReunion supabase={supabase} evc={evc} onGuardado={() => onRecargar('')} /><BotonHecho hecho={pasoHecho('reunion', evc, evals)} onHecho={() => marcar('reunion')} siguiente={siguiente?.corto} /></>}
      {actual === 'inicio' && <PasoInicio supabase={supabase} evc={evc} onEvc={onEvc} onHecho={() => marcar('inicio')} />}
      {actual === 'entrevistas' && (
        <>
          <ResumenEvaluacionCentro {...props} mostrarCierre={false} mostrarAcceso={false} />
          <BotonHecho hecho={pasoHecho('entrevistas', evc, evals)} onHecho={() => marcar('entrevistas')} siguiente={siguiente?.corto}
            texto={pasoHecho('entrevistas', evc, evals) ? 'Paso hecho: siguiente' : 'Seguir (quedan puestos por terminar)'} />
        </>
      )}
      {actual === 'personas' && <><PersonasSensibles supabase={supabase} evc={evc} evals={evals} /><BotonHecho hecho={pasoHecho('personas', evc, evals)} onHecho={() => marcar('personas')} siguiente={siguiente?.corto} texto="Registrado (o no hay ninguna): siguiente" /></>}
      {actual === 'instalaciones' && <><PasoInstalaciones supabase={supabase} evc={evc} onEvc={onEvc} /><BotonHecho hecho={pasoHecho('instalaciones', evc, evals)} onHecho={() => marcar('instalaciones')} siguiente={siguiente?.corto} /></>}
      {actual === 'final' && <PasoFinal {...props} />}

      <Notas supabase={supabase} evc={evc} onEvc={onEvc} />
    </div>
  )
}

