import { useMemo, useRef, useState } from 'react'
import ExposicionPuesto from './ExposicionPuesto'
import { aplicarExposicion, faltanExposicion } from './ereLogic'
import {
  COLOR_VR, ETIQUETA_VR, ORDEN_VR, C_DEFECTO, P_DEFECTO, nuevoId, resumenER, siguienteIdMedida, vrDe,
} from './evalLogic'

// Evaluación de riesgos (ER): tabla principal editable.
// Props: supabase, evaluacion {id, fecha, estado, centro, puesto}, filasIniciales, catalogo, riesgos, onVolver, textoVolver
// Es la evaluación de UN puesto dentro de la evaluación del centro: «cerrada» significa puesto evaluado.

const OPC_P = [['B', 'Baja'], ['M', 'Media'], ['A', 'Alta']]
const OPC_C = [['LD', 'Ligeramente dañina'], ['D', 'Dañina'], ['ED', 'Extremadamente dañina']]

const campo = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, fontSize: 14, textAlign: 'left' }
const ancho = { width: '100%', boxSizing: 'border-box' }
const filaCheck = {
  display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  gap: 12, width: '100%', textAlign: 'left', fontSize: 14, cursor: 'pointer',
}
const casilla = { width: 'auto', flex: 'none', margin: 0 }

function InsigniaVR({ p, c }) {
  const vr = vrDe(p, c)
  return (
    <span
      title={vr ? ETIQUETA_VR[vr] : 'Falta indicar P y C'}
      style={{
        display: 'inline-block', minWidth: 38, textAlign: 'center', padding: '2px 8px', borderRadius: 12,
        fontWeight: 700, fontSize: 13, color: '#fff', background: vr ? COLOR_VR[vr] : '#9e9e9e',
      }}
    >
      {vr ?? '—'}
    </span>
  )
}

export default function EvaluacionER({ supabase, evaluacion, filasIniciales, catalogo, riesgos, onVolver, textoVolver = 'Volver a la lista' }) {
  const [filas, setFilas] = useState(filasIniciales)
  const [estado, setEstado] = useState(evaluacion.estado)
  const [sucio, setSucio] = useState(false)
  const [exposicion, setExposicion] = useState(evaluacion.exposicion ?? {})
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [nueva, setNueva] = useState({ riesgo_id: '', condicion: '', p: P_DEFECTO, c: C_DEFECTO, consolidar: false })
  const catalogoRef = useRef(catalogo.slice())

  const cerrada = estado === 'cerrada'
  const resumen = useMemo(() => resumenER(filas), [filas])

  const medidasPorRiesgo = useMemo(() => {
    const m = new Map()
    catalogo.forEach((x) => {
      if (!m.has(x.riesgo_id)) m.set(x.riesgo_id, [])
      m.get(x.riesgo_id).push(x)
    })
    return m
  }, [catalogo])

  const visibles = useMemo(() => {
    if (filtro === 'todos') return filas
    if (filtro === 'pendientes') return filas.filter((f) => !vrDe(f.p, f.c))
    return filas.filter((f) => vrDe(f.p, f.c) === filtro)
  }, [filas, filtro])

  function cambiar(id, parche) {
    setFilas((fs) => fs.map((f) => (f.id === id ? { ...f, ...parche } : f)))
    setSucio(true); setMensaje('')
  }
  const cambiarMedidas = (id, fn) => {
    setFilas((fs) => fs.map((f) => (f.id === id ? { ...f, medidas: fn(f.medidas) } : f)))
    setSucio(true); setMensaje('')
  }
  const setMedida = (id, i, texto) => cambiarMedidas(id, (ms) => ms.map((m, k) => (k === i ? texto : m)))
  const quitarMedida = (id, i) => cambiarMedidas(id, (ms) => ms.filter((_, k) => k !== i))
  const anadirMedida = (id, texto) => cambiarMedidas(id, (ms) => (ms.includes(texto) ? ms : [...ms, texto]))

  function quitarFila(id) {
    if (!window.confirm('¿Quitar este riesgo de la evaluación?')) return
    setFilas((fs) => fs.filter((f) => f.id !== id))
    setSucio(true); setMensaje('')
  }

  function anadirFilaManual() {
    setError('')
    const r = riesgos.find((x) => x.id === nueva.riesgo_id)
    const condicion = nueva.condicion.replace(/\s+/g, ' ').trim()
    if (!r || !condicion) { setError('Elige el riesgo y escribe la condición de exposición.'); return }
    setFilas((fs) => [{
      id: nuevoId(), riesgo_id: r.id, riesgo_nombre: r.nombre, condicion,
      p: nueva.p || null, c: nueva.c || null, medidas: [], origen: 'manual', consolidar: nueva.consolidar,
    }, ...fs])
    setNueva({ riesgo_id: '', condicion: '', p: P_DEFECTO, c: C_DEFECTO, consolidar: false })
    setSucio(true); setMensaje('')
  }

  // Copia el riesgo a la matriz del puesto (y crea en el catálogo las medidas propias).
  async function consolidar(f) {
    const ids = []
    for (const texto of f.medidas) {
      let m = catalogoRef.current.find((x) => x.riesgo_id === f.riesgo_id && x.texto === texto)
      if (!m) {
        const id = siguienteIdMedida(f.riesgo_id, catalogoRef.current)
        const { error: err } = await supabase.from('medidas').insert({ id, riesgo_id: f.riesgo_id, texto })
        if (err) throw err
        m = { id, riesgo_id: f.riesgo_id, texto }
        catalogoRef.current.push(m)
      }
      ids.push(m.id)
    }
    const { data, error: err } = await supabase.from('matriz_puestos')
      .upsert({ puesto_id: evaluacion.puesto.id, riesgo_id: f.riesgo_id, condicion: f.condicion, p: f.p, c: f.c },
        { onConflict: 'puesto_id,riesgo_id,condicion' })
      .select('id').single()
    if (err) throw err
    if (ids.length) {
      const { error: e2 } = await supabase.from('matriz_medidas')
        .upsert(ids.map((medida_id) => ({ matriz_id: data.id, medida_id })),
          { onConflict: 'matriz_id,medida_id', ignoreDuplicates: true })
      if (e2) throw e2
    }
  }

  async function guardar() {
    setError(''); setMensaje('')
    const limpias = filas.map((f) => ({
      ...f,
      condicion: f.condicion.replace(/\s+/g, ' ').trim(),
      medidas: f.medidas.map((m) => m.trim()).filter(Boolean),
    }))
    if (limpias.some((f) => !f.condicion)) { setError('Hay riesgos sin condición de exposición.'); return }
    if (limpias.some((f) => f.consolidar && !(f.p && f.c))) {
      setError('Para añadir un riesgo a la matriz del puesto hay que indicar antes su P y su C.'); return
    }
    setGuardando(true)
    try {
      for (const f of limpias.filter((x) => x.consolidar)) await consolidar(f)

      const filasBD = limpias.map((f) => ({
        id: f.id, evaluacion_id: evaluacion.id, riesgo_id: f.riesgo_id, riesgo_nombre: f.riesgo_nombre,
        condicion: f.condicion, p: f.p, c: f.c, medidas: f.medidas, origen: f.origen,
      }))
      for (let i = 0; i < filasBD.length; i += 200) {
        const { error: err } = await supabase.from('evaluacion_riesgos')
          .upsert(filasBD.slice(i, i + 200), { onConflict: 'id' })
        if (err) throw err
      }
      const { data: enBD, error: e1 } = await supabase.from('evaluacion_riesgos')
        .select('id').eq('evaluacion_id', evaluacion.id)
      if (e1) throw e1
      const vivos = new Set(filasBD.map((f) => f.id))
      const sobran = enBD.map((r) => r.id).filter((id) => !vivos.has(id))
      if (sobran.length) {
        const { error: e2 } = await supabase.from('evaluacion_riesgos').delete().in('id', sobran)
        if (e2) throw e2
      }
      const { error: e3 } = await supabase.from('evaluaciones').update({ exposicion }).eq('id', evaluacion.id)
      if (e3) throw new Error(/exposicion/.test(e3.message) ? 'Falta ampliar la base de datos: ejecuta migracion_informe.sql.' : e3.message)
      setFilas(limpias.map((f) => ({ ...f, consolidar: false })))
      setSucio(false)
      setMensaje('Guardado.')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(nuevo) {
    setError(''); setMensaje('')
    if (nuevo === 'cerrada') {
      if (sucio) { setError('Guarda los cambios antes de marcar el puesto como evaluado.'); return }
      if (resumen.pendientes > 0) { setError(`Faltan P o C en ${resumen.pendientes} riesgo/s.`); return }
      const faltan = faltanExposicion(filas, exposicion)
      if (faltan.length) { setError(`Faltan los datos de exposición para la ERE: ${faltan.join(', ')}.`); return }
    }
    const { error: err } = await supabase.from('evaluaciones').update({ estado: nuevo }).eq('id', evaluacion.id)
    if (err) setError(err.message)
    else {
      setEstado(nuevo)
      setMensaje(nuevo === 'cerrada' ? 'Puesto evaluado. Vuelve al centro para seguir con los demás puestos.' : 'Puesto reabierto. Si la evaluación del centro estaba cerrada, vuelve a estar en curso.')
    }
  }

  function volver() {
    if (sucio && !window.confirm('Hay cambios sin guardar. ¿Salir igualmente?')) return
    onVolver()
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Evaluación de riesgos del puesto</h2>
      <p>
        <b>{evaluacion.centro.codigo} · {evaluacion.centro.nombre}</b><br />
        Puesto: <b>{evaluacion.puesto.nombre}</b> · {evaluacion.fecha} ·{' '}
        <b>{cerrada ? 'Evaluado' : 'En curso'}</b>
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <b>{resumen.total} riesgos</b>
        {Object.keys(ORDEN_VR).filter((k) => resumen.porVR[k]).map((k) => (
          <span key={k} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            <span style={{ background: COLOR_VR[k], color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 13, fontWeight: 700 }}>
              {k}
            </span>
            {resumen.porVR[k]}
          </span>
        ))}
        {resumen.pendientes > 0 && (
          <span style={{ color: '#c62828', fontWeight: 700 }}>{resumen.pendientes} pendientes de P/C</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={guardar} disabled={guardando || cerrada || !sucio} style={{ padding: '8px 16px', fontWeight: 600 }}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
        {cerrada ? (
          <button className="secundario" onClick={() => cambiarEstado('borrador')}>Reabrir el puesto</button>
        ) : (
          <button className="secundario" onClick={() => cambiarEstado('cerrada')} disabled={guardando}>Marcar puesto como evaluado</button>
        )}
        <button className="secundario" onClick={volver} disabled={guardando}>{textoVolver}</button>
        <label style={{ ...campo, flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span>Mostrar</span>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ width: 'auto' }}>
            <option value="todos">Todos</option>
            <option value="pendientes">Pendientes de P/C</option>
            {Object.keys(ORDEN_VR).map((k) => <option key={k} value={k}>{k} · {ETIQUETA_VR[k]}</option>)}
          </select>
        </label>
      </div>

      {sucio && <p style={{ color: '#8a6d00' }}>Hay cambios sin guardar.</p>}
      {mensaje && <p style={{ color: '#2e7d32' }}>{mensaje}</p>}
      {error && <p style={{ color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }}>{error}</p>}

      <ExposicionPuesto supabase={supabase} evaluacion={evaluacion} filas={filas} exposicion={exposicion} soloLectura={cerrada}
        onCambio={(n) => {
          setExposicion(n)
          const r = aplicarExposicion(filas, n)
          if (r.cambiadas.length) { setFilas(r.filas); setMensaje(`Valoración recalculada en ${r.cambiadas.length} ${r.cambiadas.length === 1 ? 'riesgo' : 'riesgos'} con los datos de exposición.`) }
          else setMensaje('')
          setSucio(true)
        }} />

      <fieldset disabled={cerrada} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <details style={{ marginBottom: 14 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Añadir un riesgo manualmente</summary>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, padding: '10px 0' }}>
            <label style={campo}>
              <span>Riesgo</span>
              <select style={ancho} value={nueva.riesgo_id} onChange={(e) => setNueva({ ...nueva, riesgo_id: e.target.value })}>
                <option value="">— elige —</option>
                {riesgos.map((r) => <option key={r.id} value={r.id}>{r.id} · {r.nombre}</option>)}
              </select>
            </label>
            <label style={campo}>
              <span>Condición / situación de exposición</span>
              <input style={ancho} value={nueva.condicion} onChange={(e) => setNueva({ ...nueva, condicion: e.target.value })} />
            </label>
            <label style={campo}>
              <span>P</span>
              <select style={ancho} value={nueva.p} onChange={(e) => setNueva({ ...nueva, p: e.target.value })}>
                <option value="">—</option>
                {OPC_P.map(([v, t]) => <option key={v} value={v}>{v} · {t}</option>)}
              </select>
            </label>
            <label style={campo}>
              <span>C</span>
              <select style={ancho} value={nueva.c} onChange={(e) => setNueva({ ...nueva, c: e.target.value })}>
                <option value="">—</option>
                {OPC_C.map(([v, t]) => <option key={v} value={v}>{v} · {t}</option>)}
              </select>
            </label>
          </div>
          <label style={{ ...filaCheck, maxWidth: 420 }}>
            <span>Añadir también a la matriz de este puesto</span>
            <input type="checkbox" style={casilla} checked={nueva.consolidar}
              onChange={(e) => setNueva({ ...nueva, consolidar: e.target.checked })} />
          </label>
          <p style={{ margin: '10px 0' }}>
            <button type="button" className="secundario" onClick={anadirFilaManual}>Añadir riesgo</button>
          </p>
        </details>

        {visibles.length === 0 && <p className="vacio">No hay riesgos para mostrar con este filtro.</p>}

        {visibles.map((f) => {
          const vr = vrDe(f.p, f.c)
          const delCatalogo = (medidasPorRiesgo.get(f.riesgo_id) ?? []).filter((m) => !f.medidas.includes(m.texto))
          return (
            <div
              key={f.id}
              style={{
                border: `1px solid ${vr ? '#d9d9d9' : '#c62828'}`, borderLeft: `6px solid ${vr ? COLOR_VR[vr] : '#c62828'}`,
                borderRadius: 8, padding: 12, marginBottom: 12, textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <strong>{f.riesgo_id} · {f.riesgo_nombre}</strong>
                <span style={{ fontSize: 13, opacity: 0.75 }}>{evaluacion.puesto.nombre}</span>
              </div>

              <label style={{ ...campo, marginTop: 8 }}>
                <span>Condición / situación de exposición</span>
                <textarea rows={2} style={ancho} value={f.condicion} onChange={(e) => cambiar(f.id, { condicion: e.target.value })} />
              </label>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '8px 0' }}>
                <label style={campo}>
                  <span>P (probabilidad)</span>
                  <select value={f.p ?? ''} onChange={(e) => cambiar(f.id, { p: e.target.value || null })}>
                    <option value="">— elige —</option>
                    {OPC_P.map(([v, t]) => <option key={v} value={v}>{v} · {t}</option>)}
                  </select>
                </label>
                <label style={campo}>
                  <span>C (consecuencias)</span>
                  <select value={f.c ?? ''} onChange={(e) => cambiar(f.id, { c: e.target.value || null })}>
                    <option value="">— elige —</option>
                    {OPC_C.map(([v, t]) => <option key={v} value={v}>{v} · {t}</option>)}
                  </select>
                </label>
                <div style={campo}>
                  <span>Valoración del riesgo</span>
                  <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', minHeight: 34 }}>
                    <InsigniaVR p={f.p} c={f.c} />
                    <span>{vr ? ETIQUETA_VR[vr] : 'Falta indicar P y C'}</span>
                  </span>
                </div>
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, margin: '8px 0 4px' }}>Medidas preventivas ({f.medidas.length})</div>
              {f.medidas.length === 0 && <p className="vacio" style={{ margin: '4px 0' }}>Sin medidas todavía.</p>}
              {f.medidas.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' }}>
                  <textarea rows={2} style={{ ...ancho, flex: 1 }} value={m} onChange={(e) => setMedida(f.id, i, e.target.value)} />
                  <button type="button" className="secundario" title="Quitar medida" onClick={() => quitarMedida(f.id, i)}>✕</button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {delCatalogo.length > 0 && (
                  <select
                    value="" style={{ maxWidth: '100%', flex: 1, minWidth: 220 }}
                    onChange={(e) => { if (e.target.value) anadirMedida(f.id, e.target.value) }}
                  >
                    <option value="">+ Añadir medida del catálogo...</option>
                    {delCatalogo.map((m) => (
                      <option key={m.id} value={m.texto}>
                        {m.id} · {m.texto.length > 110 ? m.texto.slice(0, 110) + '…' : m.texto}
                      </option>
                    ))}
                  </select>
                )}
                <button type="button" className="secundario" onClick={() => anadirMedida(f.id, '')}>+ Medida propia</button>
              </div>

              {f.origen !== 'puesto' && f.origen !== 'todos' && (
                <label style={{ ...filaCheck, maxWidth: 420, marginTop: 8 }}>
                  <span>Añadir a la matriz de este puesto al guardar</span>
                  <input type="checkbox" style={casilla} checked={!!f.consolidar} onChange={(e) => cambiar(f.id, { consolidar: e.target.checked })} />
                </label>
              )}

              <p style={{ margin: '10px 0 0' }}>
                <button type="button" className="secundario" onClick={() => quitarFila(f.id)} style={{ color: '#b00020' }}>
                  Quitar este riesgo
                </button>
              </p>
            </div>
          )
        })}
      </fieldset>
    </div>
  )
}
