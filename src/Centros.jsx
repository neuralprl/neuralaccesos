import { useEffect, useMemo, useState } from 'react'
import ImportarCentros from './ImportarCentros'
import BarraAlta from './BarraAlta'
import { CAMPOS_BOOL, ETIQUETAS, OPCIONES, centroVacio } from './centrosLogic'

// Uso: <Centros supabase={supabase} />
// Lista de centros con búsqueda, alta/edición manual (incluye sus puestos) e importación desde Excel.

const rejilla = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }
const campo = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, fontSize: 14, textAlign: 'left' }
// Fila con el texto a la izquierda y la casilla a la derecha
const filaCheck = {
  display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  gap: 12, width: '100%', textAlign: 'left', fontSize: 14, cursor: 'pointer',
}
const casilla = { width: 'auto', flex: 'none', margin: 0 }

function resumenUsuarios(c) {
  const t = []
  if (c.usuarios_psiquiatrico_adultos) t.push('Psiquiátrico')
  if (c.usuarios_infantil_juvenil) t.push('Infantil')
  if (c.usuarios_geriatrico) t.push('Geriátrico')
  return t.join(' · ') || '—'
}

function aTexto(v) { return v == null ? '' : String(v) }

function mensajeError(err) {
  if (err.code === '23505') return 'Ya existe un centro con ese código.'
  if (err.code === '23503') return 'No se puede borrar: el centro tiene evaluaciones o visitas asociadas.'
  return err.message
}

// ---------------------------------------------------------------------
export function FormCentro({ supabase, centro, puestos, onVolver, onGuardado }) {
  const nuevo = !centro
  const [f, setF] = useState(() => {
    if (nuevo) return centroVacio()
    const base = centroVacio()
    Object.keys(base).forEach((k) => {
      const v = centro[k]
      base[k] = typeof base[k] === 'boolean' ? !!v : aTexto(v)
    })
    return base
  })
  // puesto_id -> { n_trabajadores, turnos }. En un centro nuevo vienen todos marcados.
  const [sel, setSel] = useState(() => (
    nuevo ? Object.fromEntries(puestos.map((p) => [p.id, { n_trabajadores: '', turnos: 'rotativo' }])) : {}
  ))
  const [listaPuestos, setListaPuestos] = useState(puestos)
  const [nuevoPuesto, setNuevoPuesto] = useState('')
  const [errorPuesto, setErrorPuesto] = useState('')
  const [anadiendo, setAnadiendo] = useState(false)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (nuevo) return
    supabase.from('centro_puestos').select('puesto_id,n_trabajadores,turnos').eq('centro_id', centro.id)
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); return }
        const m = {}
        data.forEach((r) => { m[r.puesto_id] = { n_trabajadores: aTexto(r.n_trabajadores), turnos: aTexto(r.turnos) || 'rotativo' } })
        setSel(m)
      })
  }, [supabase, centro, nuevo])

  const cambia = (k, v) => setF((x) => ({ ...x, [k]: v }))

  function marcarPuesto(id, marcado) {
    setSel((s) => {
      const n = { ...s }
      if (marcado) n[id] = { n_trabajadores: '', turnos: 'rotativo' }
      else delete n[id]
      return n
    })
  }

  const entero = (s) => (s === '' ? null : parseInt(s, 10))

  async function guardar(e) {
    e.preventDefault()
    setError('')
    const codigo = f.codigo.trim()
    const nombre = f.nombre.trim()
    if (!codigo || !nombre) { setError('El código y el nombre son obligatorios.'); return }
    for (const k of ['n_trabajadores', 'n_plazas', 'n_plantas']) {
      if (f[k] !== '' && !(Number.isInteger(Number(f[k])) && Number(f[k]) >= 0)) {
        setError(`${k} debe ser un número entero.`); return
      }
    }

    const fila = { ...f, codigo, nombre }
    ;['n_trabajadores', 'n_plazas'].forEach((k) => { fila[k] = entero(f[k]) })
    fila.n_plantas = f.n_plantas === '' ? 1 : entero(f.n_plantas)
    ;['regimen', 'horario', 'fecha_ultima_evaluacion', 'direccion', 'municipio', 'provincia',
      'responsable', 'telefono', 'email', 'observaciones'].forEach((k) => { fila[k] = f[k].trim() || null })

    setGuardando(true)
    try {
      let id = centro?.id
      if (id) {
        const { error: err } = await supabase.from('centros').update(fila).eq('id', id)
        if (err) throw err
      } else {
        const { data, error: err } = await supabase.from('centros').insert(fila).select('id').single()
        if (err) throw err
        id = data.id
      }

      const ids = Object.keys(sel)
      if (ids.length) {
        const filas = ids.map((puesto_id) => ({
          centro_id: id, puesto_id,
          n_trabajadores: entero(sel[puesto_id].n_trabajadores),
          turnos: sel[puesto_id].turnos || null,
        }))
        const { error: err } = await supabase.from('centro_puestos').upsert(filas, { onConflict: 'centro_id,puesto_id' })
        if (err) throw err
      }
      let borrar = supabase.from('centro_puestos').delete().eq('centro_id', id)
      if (ids.length) borrar = borrar.not('puesto_id', 'in', `(${ids.join(',')})`)
      const { error: errDel } = await borrar
      if (errDel) throw errDel

      onGuardado()
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  async function anadirPuesto() {
    setErrorPuesto('')
    const nombre = nuevoPuesto.replace(/\s+/g, ' ').trim()
    if (!nombre) return
    if (nombre.toUpperCase() === 'TODOS') { setErrorPuesto('TODOS es un nombre reservado.'); return }
    const igual = listaPuestos.find((p) => p.nombre.toLowerCase() === nombre.toLowerCase())
    if (igual) { setErrorPuesto(`Ya existe el puesto "${igual.nombre}".`); return }
    setAnadiendo(true)
    const { data, error: err } = await supabase.from('puestos').insert({ nombre }).select('id,nombre').single()
    setAnadiendo(false)
    if (err) { setErrorPuesto(err.code === '23505' ? 'Ya existe un puesto con ese nombre.' : err.message); return }
    setListaPuestos((l) => [...l, data].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')))
    setSel((x) => ({ ...x, [data.id]: { n_trabajadores: '', turnos: 'rotativo' } }))
    setNuevoPuesto('')
  }

  async function borrar() {
    if (!window.confirm(`¿Borrar el centro ${f.nombre}? Esta acción no se puede deshacer.`)) return
    const { error: err } = await supabase.from('centros').delete().eq('id', centro.id)
    if (err) setError(mensajeError(err))
    else onGuardado()
  }

  const texto = (k, etiqueta, extra = {}) => (
    <label style={campo}>
      <span>{etiqueta}</span>
      <input value={f[k]} onChange={(e) => cambia(k, e.target.value)} {...extra} />
    </label>
  )

  const lista = (k, etiqueta, vacio) => (
    <label style={campo}>
      <span>{etiqueta}</span>
      <select value={f[k]} onChange={(e) => cambia(k, e.target.value)}>
        {vacio !== undefined && <option value="">{vacio}</option>}
        {OPCIONES[k].map((o) => <option key={o} value={o}>{ETIQUETAS[k][o]}</option>)}
      </select>
    </label>
  )

  return (
    <form onSubmit={guardar} style={{ maxWidth: 900 }}>
      <h2>{nuevo ? 'Nuevo centro' : `Centro ${centro.codigo}`}</h2>

      <h3>Identificación</h3>
      <div style={rejilla}>
        {texto('codigo', 'Código *')}
        {texto('nombre', 'Nombre *')}
        {texto('direccion', 'Dirección')}
        {texto('municipio', 'Municipio')}
        {texto('provincia', 'Provincia')}
        {texto('responsable', 'Responsable')}
        {texto('telefono', 'Teléfono')}
        {texto('email', 'Email', { type: 'email' })}
        {texto('n_trabajadores', 'Nº de trabajadores', { type: 'number', min: 0 })}
        {texto('n_plazas', 'Nº de plazas', { type: 'number', min: 0 })}
        {texto('fecha_ultima_evaluacion', 'Última evaluación', { type: 'date' })}
      </div>

      <h3>Usuarios que atiende</h3>
      <div style={rejilla}>
        {CAMPOS_BOOL.slice(0, 3).map(([k, etiqueta]) => (
          <label key={k} style={{ ...filaCheck, padding: '4px 0', borderBottom: '1px solid #e5e5e5' }}>
            <span>{etiqueta}</span>
            <input type="checkbox" style={casilla} checked={f[k]} onChange={(e) => cambia(k, e.target.checked)} />
          </label>
        ))}
      </div>

      <h3>Funcionamiento</h3>
      <div style={rejilla}>
        {lista('regimen', 'Régimen', '— sin indicar —')}
        {lista('horario', 'Horario', '— sin indicar —')}
        {texto('n_plantas', 'Nº de plantas', { type: 'number', min: 1 })}
        {lista('comedor', 'Comedor')}
        {lista('vigilancia_seguridad', 'Vigilancia de seguridad')}
      </div>

      <h3>Instalaciones y medios</h3>
      <div style={rejilla}>
        {CAMPOS_BOOL.slice(3).map(([k, etiqueta]) => (
          <label key={k} style={{ ...filaCheck, padding: '4px 0', borderBottom: '1px solid #e5e5e5' }}>
            <span>{etiqueta}</span>
            <input type="checkbox" style={casilla} checked={f[k]} onChange={(e) => cambia(k, e.target.checked)} />
          </label>
        ))}
      </div>

      <label style={{ ...campo, marginTop: 12 }}>
        <span>Observaciones</span>
        <textarea rows={3} value={f.observaciones} onChange={(e) => cambia('observaciones', e.target.value)} />
      </label>

      <h3>Puestos de este centro</h3>
      {nuevo && listaPuestos.length > 0 && (
        <p style={{ opacity: 0.7, fontSize: 13, maxWidth: 380 }}>
          Vienen todos marcados: desmarca los que no existan en este centro.
        </p>
      )}
      {listaPuestos.length === 0 && <p className="vacio">Aún no hay puestos: añade uno o importa la matriz.</p>}
      <div style={{ maxWidth: 380 }}>
        {listaPuestos.map((p) => {
          const marcado = !!sel[p.id]
          return (
            <div key={p.id} style={{ borderBottom: '1px solid #e5e5e5', padding: '3px 0', textAlign: 'left' }}>
              <label style={filaCheck}>
                <span>{p.nombre}</span>
                <input type="checkbox" style={casilla} checked={marcado} onChange={(e) => marcarPuesto(p.id, e.target.checked)} />
              </label>
              {marcado && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '8px 0 2px' }}>
                  <input
                    type="number" min={0} placeholder="Nº trabajadores" style={{ width: 140 }}
                    value={sel[p.id].n_trabajadores}
                    onChange={(e) => setSel((x) => ({ ...x, [p.id]: { ...x[p.id], n_trabajadores: e.target.value } }))}
                  />
                  <select
                    value={sel[p.id].turnos}
                    onChange={(e) => setSel((x) => ({ ...x, [p.id]: { ...x[p.id], turnos: e.target.value } }))}
                  >
                    <option value="">Turnos</option>
                    {OPCIONES.turnos.map((o) => <option key={o} value={o}>{ETIQUETAS.turnos[o]}</option>)}
                  </select>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, maxWidth: 380 }}>
        <input
          placeholder="Nombre del nuevo puesto" value={nuevoPuesto} style={{ flex: 1, minWidth: 200 }}
          onChange={(e) => setNuevoPuesto(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); anadirPuesto() } }}
        />
        <button type="button" className="secundario" onClick={anadirPuesto} disabled={anadiendo}>
          {anadiendo ? 'Añadiendo...' : 'Añadir puesto'}
        </button>
      </div>
      {errorPuesto && <p style={{ color: '#b00020' }}>{errorPuesto}</p>}
      <p style={{ opacity: 0.7, fontSize: 13, maxWidth: 380 }}>
        Un puesto nuevo no tiene riesgos asociados hasta que se cree con el creador de puestos, al evaluarlo.
      </p>

      {error && (
        <p style={{ color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
        <button type="submit" disabled={guardando} style={{ padding: '10px 18px', fontWeight: 600 }}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" className="secundario" onClick={onVolver} disabled={guardando}>Cancelar</button>
        {!nuevo && (
          <button type="button" className="secundario" onClick={borrar} disabled={guardando}
            style={{ marginLeft: 'auto', color: '#b00020' }}>
            Borrar centro
          </button>
        )}
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------
export default function Centros({ supabase }) {
  const [vista, setVista] = useState('lista') // 'lista' | 'form' | 'importar'
  const [centros, setCentros] = useState([])
  const [puestos, setPuestos] = useState([])
  const [editando, setEditando] = useState(null)
  const [buscar, setBuscar] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function cargar() {
    setCargando(true)
    const [c, p] = await Promise.all([
      supabase.from('centros').select('*').order('codigo'),
      supabase.from('puestos').select('id,nombre').neq('nombre', 'TODOS').order('nombre'),
    ])
    if (c.error || p.error) setError((c.error || p.error).message)
    else { setCentros(c.data); setPuestos(p.data); setError('') }
    setCargando(false)
  }

  useEffect(() => { cargar() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const visibles = useMemo(() => {
    const q = buscar.trim().toLowerCase()
    if (!q) return centros
    return centros.filter((c) =>
      [c.codigo, c.nombre, c.municipio, c.provincia].some((v) => (v || '').toLowerCase().includes(q)))
  }, [centros, buscar])

  const volver = () => { setVista('lista'); setEditando(null); cargar() }

  if (vista === 'form') {
    return <FormCentro supabase={supabase} centro={editando} puestos={puestos} onVolver={volver} onGuardado={volver} />
  }
  if (vista === 'importar') {
    return <ImportarCentros supabase={supabase} onTerminado={cargar} onVolver={volver} />
  }

  return (
    <div>
      <h2>Datos de los centros</h2>
      <BarraAlta
        resumen={(
          <span>
            <b>{centros.length}</b> {centros.length === 1 ? 'centro' : 'centros'} ·{' '}
            <b>{centros.filter((c) => c.horario === '24/7/365').length}</b> abiertos 24 h ·{' '}
            <b>{centros.filter((c) => c.turnos_noche).length}</b> con turno de noche ·{' '}
            <b>{centros.filter((c) => c.regimen === 'hospitalizacion' || c.regimen === 'residencial').length}</b> con hospitalización o residencia
          </span>
        )}
        onManual={() => { setEditando(null); setVista('form') }} textoManual="Crear centro manualmente"
        onMasivo={() => setVista('importar')} textoMasivo="Subida masiva desde Excel"
      />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          placeholder="Buscar por código, nombre o municipio" value={buscar}
          onChange={(e) => setBuscar(e.target.value)} style={{ flex: 1, minWidth: 220 }}
        />
      </div>

      {error && <p style={{ color: '#b00020' }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && centros.length === 0 && (
        <p className="vacio">Todavía no hay centros. Crea el primero o impórtalos desde Excel.</p>
      )}
      {!cargando && centros.length > 0 && (
        <>
          <p style={{ opacity: 0.7 }}>{visibles.length} de {centros.length} centros</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                  <th style={{ padding: 8 }}>Código</th>
                  <th style={{ padding: 8 }}>Nombre</th>
                  <th style={{ padding: 8 }}>Municipio</th>
                  <th style={{ padding: 8 }}>Usuarios</th>
                  <th style={{ padding: 8 }}>Horario</th>
                  <th style={{ padding: 8 }}>Plantas</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((c) => (
                  <tr
                    key={c.id} onClick={() => { setEditando(c); setVista('form') }}
                    style={{ cursor: 'pointer', borderBottom: '1px solid #e5e5e5' }}
                  >
                    <td style={{ padding: 8 }}><b>{c.codigo}</b></td>
                    <td style={{ padding: 8 }}>{c.nombre}</td>
                    <td style={{ padding: 8 }}>{c.municipio || '—'}</td>
                    <td style={{ padding: 8 }}>{resumenUsuarios(c)}</td>
                    <td style={{ padding: 8 }}>{ETIQUETAS.horario[c.horario] || '—'}</td>
                    <td style={{ padding: 8 }}>{c.n_plantas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
