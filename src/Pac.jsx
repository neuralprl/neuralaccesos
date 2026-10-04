import { useEffect, useMemo, useState } from 'react'
import ImportarPac from './ImportarPac'
import BarraAlta from './BarraAlta'
import {
  ESTADOS_PAC, ORDEN_PRIORIDAD_PAC, PRIORIDADES_PAC, agruparItems, conValoracion, evaluarRegla,
  incidenciaNueva, itemVisible, prioridadPAC, respuestasPrevias,
} from './pacLogic'
import { CONSECUENCIAS, NIVELES_DEFICIENCIA } from './metodologiaContenido'
import { COSTE_POR_DEFECTO, RESPONSABLES, fechaES, formatearCoste, hoyISO } from './planLogic'
import { descargar, excelPAC, filasPAC, htmlPAC, imprimir, nombreArchivoPAC } from './documentos'

// Uso: <Pac supabase={supabase} />
// Visitas al centro: todos los puntos aparecen como correctos y solo se marcan las incidencias.

const campo = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, fontSize: 14, textAlign: 'left' }
const ancho = { width: '100%', boxSizing: 'border-box' }
const rejilla = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, alignItems: 'start' }
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const COLOR_PRIO = { inmediata: '#c62828', alta: '#d9600a', media: '#b8860b', baja: '#2e7d32' }
const CAMPOS_RESP =
  'visita_id,item_id,resultado,observaciones,deficiencia,consecuencias,prioridad,responsable,coste,plazo,' +
  'estado_accion,fecha_realizacion,medida_alternativa,resuelta_estado,fecha_resuelta'

function Segmento({ valor, opciones, onChange, etiqueta }) {
  return (
    <div role="radiogroup" aria-label={etiqueta}
      style={{ display: 'inline-flex', flexWrap: 'wrap', borderRadius: 8, overflow: 'hidden', border: '1px solid #9e9e9e', flex: 'none' }}>
      {opciones.map(([v, texto, color]) => {
        const activo = valor === v
        return (
          <button
            key={v} type="button" role="radio" aria-checked={activo} onClick={() => onChange(v)}
            style={{
              background: activo ? color : '#fff', color: activo ? '#fff' : '#333', border: 'none',
              borderRight: '1px solid #d0d0d0', borderRadius: 0, padding: '6px 12px', margin: 0, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 'inherit', fontWeight: activo ? 700 : 400, boxShadow: 'none',
            }}
          >
            {texto}
          </button>
        )
      })}
    </div>
  )
}

function Interruptor({ activo, onChange, textoOff, textoOn, etiqueta, deshabilitado = false }) {
  return (
    <button
      type="button" role="switch" aria-checked={activo} aria-label={etiqueta} disabled={deshabilitado} onClick={() => onChange(!activo)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: '4px 0',
        margin: 0, cursor: deshabilitado ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit',
        boxShadow: 'none', opacity: deshabilitado ? 0.6 : 1,
      }}
    >
      <span style={{ position: 'relative', width: 46, height: 26, borderRadius: 13, flex: 'none', background: activo ? '#2e7d32' : '#9e9e9e' }}>
        <span style={{ position: 'absolute', top: 3, left: activo ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff' }} />
      </span>
      <span style={{ fontWeight: 600 }}>{activo ? textoOn : textoOff}</span>
    </button>
  )
}

// ---------------------------------------------------------------------
export function FormIncidencia({ r, fechaVisita, hoy, onCambio, soloEstado = false }) {
  const esEstandar = RESPONSABLES.includes(r.responsable)
  const prio = PRIORIDADES_PAC[r.prioridad]
  const hecha = r.estado_accion !== 'pendiente'
  const plazoVencido = r.estado_accion === 'pendiente' && r.plazo && r.plazo < hoy

  return (
    <div style={{ background: '#fafafa', border: '1px solid #e0e0e0', borderLeft: `5px solid ${COLOR_PRIO[r.prioridad] ?? '#999'}`, borderRadius: 8, padding: 12, marginTop: 8 }}>
      <fieldset disabled={soloEstado} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
      <div style={rejilla}>
        <div style={campo}>
          <span>Nivel de deficiencia</span>
          <Segmento
            valor={r.deficiencia} etiqueta="Nivel de deficiencia"
            opciones={NIVELES_DEFICIENCIA.map((d) => [d.codigo, d.nombre, '#455a64'])}
            onChange={(v) => onCambio(conValoracion(r, { deficiencia: v }, fechaVisita))}
          />
          <small style={{ opacity: 0.7 }}>{NIVELES_DEFICIENCIA.find((d) => d.codigo === r.deficiencia)?.descripcion}</small>
        </div>
        <div style={campo}>
          <span>Consecuencias posibles</span>
          <Segmento
            valor={r.consecuencias} etiqueta="Consecuencias"
            opciones={CONSECUENCIAS.map((c) => [c.codigo, c.nombre, '#455a64'])}
            onChange={(v) => onCambio(conValoracion(r, { consecuencias: v }, fechaVisita))}
          />
          <small style={{ opacity: 0.7 }}>{CONSECUENCIAS.find((c) => c.codigo === r.consecuencias)?.descripcion}</small>
        </div>
        <div style={campo}>
          <span>Prioridad (según la matriz)</span>
          <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', minHeight: 34 }}>
            <span style={{ background: COLOR_PRIO[r.prioridad], color: '#fff', borderRadius: 12, padding: '2px 12px', fontWeight: 700 }}>
              {prio?.etiqueta}
            </span>
            <span>{prio?.detalle}</span>
          </span>
        </div>
      </div>

      <label style={{ ...campo, marginTop: 10 }}>
        <span>Observaciones sobre la incidencia</span>
        <textarea rows={2} style={ancho} value={r.observaciones ?? ''} onChange={(e) => onCambio({ ...r, observaciones: e.target.value })} />
      </label>

      <div style={{ ...rejilla, marginTop: 10 }}>
        <div style={campo}>
          <label style={campo}>
            <span>Responsable</span>
            <select
              style={ancho} value={esEstandar ? r.responsable : 'otro'}
              onChange={(e) => onCambio({ ...r, responsable: e.target.value === 'otro' ? '' : e.target.value })}
            >
              {RESPONSABLES.map((x) => <option key={x} value={x}>{x}</option>)}
              <option value="otro">Otro...</option>
            </select>
          </label>
          {!esEstandar && (
            <input style={ancho} placeholder="Indica quién" value={r.responsable ?? ''} onChange={(e) => onCambio({ ...r, responsable: e.target.value })} />
          )}
        </div>

        <label style={campo}>
          <span>Coste de la medida</span>
          <input
            style={ancho} value={r.coste ?? ''} onFocus={(e) => e.target.select()}
            onChange={(e) => onCambio({ ...r, coste: e.target.value })}
            onBlur={() => { const n = formatearCoste(r.coste); if (n !== r.coste) onCambio({ ...r, coste: n }) }}
          />
          <small style={{ opacity: 0.65 }}>Escribe una cifra y saldrá con €</small>
        </label>

        <label style={campo}>
          <span>Plazo</span>
          <input type="date" style={ancho} value={r.plazo ?? ''} onChange={(e) => onCambio({ ...r, plazo: e.target.value || null })} />
          <small style={{ color: plazoVencido ? '#c62828' : undefined, opacity: plazoVencido ? 1 : 0.65, fontWeight: plazoVencido ? 700 : 400 }}>
            {plazoVencido ? 'Plazo vencido · ' : ''}Estándar: {prio?.detalle}
          </small>
        </label>
      </div>

      </fieldset>

      <div style={{ ...campo, marginTop: 12 }}>
        <span>Estado</span>
        <Segmento
          valor={r.estado_accion} etiqueta="Estado de la incidencia"
          opciones={[['pendiente', ESTADOS_PAC.pendiente, '#757575'], ['realizada', ESTADOS_PAC.realizada, '#2e7d32'], ['alternativa', ESTADOS_PAC.alternativa, '#1565c0']]}
          onChange={(v) => onCambio(v === 'pendiente'
            ? { ...r, estado_accion: 'pendiente', fecha_realizacion: null, resuelta_estado: 'pendiente', fecha_resuelta: null }
            : { ...r, estado_accion: v, fecha_realizacion: r.fecha_realizacion || hoy })}
        />
      </div>

      {hecha && (
        <div style={{ ...rejilla, marginTop: 10 }}>
          {r.estado_accion === 'alternativa' && (
            <label style={{ ...campo, gridColumn: '1 / -1' }}>
              <span>¿Cuál es la medida nueva? (obligatorio)</span>
              <textarea
                rows={2} placeholder="Describe la medida alternativa que reduce el riesgo"
                style={{ ...ancho, borderColor: (r.medida_alternativa ?? '').trim() ? undefined : '#c62828' }}
                value={r.medida_alternativa ?? ''} onChange={(e) => onCambio({ ...r, medida_alternativa: e.target.value })}
              />
              {!(r.medida_alternativa ?? '').trim() && (
                <small style={{ color: '#c62828', fontWeight: 600 }}>Indica cuál es la medida para que se guarde.</small>
              )}
            </label>
          )}
          <label style={campo}>
            <span>{r.estado_accion === 'alternativa' ? 'Fecha de implantación' : 'Fecha de realización'}</span>
            <input type="date" style={ancho} value={r.fecha_realizacion ?? ''} onChange={(e) => onCambio({ ...r, fecha_realizacion: e.target.value || null })} />
          </label>
          <div style={campo}>
            <span><b>Comprobación de que la incidencia está resuelta</b></span>
            <Interruptor
              activo={r.resuelta_estado === 'resuelta'} etiqueta="Incidencia resuelta" textoOff="Pendiente" textoOn="Resuelta" deshabilitado={soloEstado}
              onChange={(on) => onCambio(on
                ? { ...r, resuelta_estado: 'resuelta', fecha_resuelta: r.fecha_resuelta || hoy }
                : { ...r, resuelta_estado: 'pendiente', fecha_resuelta: null })}
            />
          </div>
          {r.resuelta_estado === 'resuelta' && (
            <label style={campo}>
              <span>Fecha de comprobación</span>
              <input type="date" style={ancho} disabled={soloEstado} value={r.fecha_resuelta ?? ''} onChange={(e) => onCambio({ ...r, fecha_resuelta: e.target.value || null })} />
            </label>
          )}
        </div>
      )}
    </div>
  )
}

function ItemFila({ item, r, fechaVisita, hoy, onCambio }) {
  const resultado = r?.resultado ?? 'cumple'
  const poner = (v) => {
    if (v === 'cumple') onCambio(item.id, null)
    else if (v === 'no_aplica') onCambio(item.id, { resultado: 'no_aplica' })
    else onCambio(item.id, r?.resultado === 'no_cumple' ? r : incidenciaNueva(fechaVisita))
  }
  return (
    <div style={{ borderBottom: '1px solid #ececec', padding: '8px 0', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <span style={{ flex: '1 1 320px', opacity: resultado === 'no_aplica' ? 0.5 : 1 }}>{item.punto}</span>
        <Segmento
          valor={resultado} etiqueta="Resultado del punto" onChange={poner}
          opciones={[['cumple', 'Correcto', '#2e7d32'], ['no_cumple', 'Incidencia', '#c62828'], ['no_aplica', 'N/A', '#757575']]}
        />
      </div>
      {resultado === 'no_cumple' && r && (
        <FormIncidencia r={r} fechaVisita={fechaVisita} hoy={hoy} onCambio={(nuevo) => onCambio(item.id, nuevo)} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------
export function VisitaPac({ supabase, visitaId, onVolver }) {
  const [datos, setDatos] = useState(null)
  const [resp, setResp] = useState({})
  const [overrides, setOverrides] = useState({})
  const [cambiadosItems, setCambiadosItems] = useState(() => new Set())
  const [cambiadasPrevias, setCambiadasPrevias] = useState(() => new Set())
  const [estado, setEstado] = useState('borrador')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const hoy = hoyISO()

  useEffect(() => {
    (async () => {
      const [v, pq, it, vp, rs] = await Promise.all([
        supabase.from('pac_visitas').select('id,fecha,estado,centros(*)').eq('id', visitaId).single(),
        supabase.from('pac_preguntas_previas').select('*').order('id'),
        supabase.from('pac_items').select('id,orden,bloque,seccion,punto,riesgo,pregunta_previa').order('orden'),
        supabase.from('pac_visita_previas').select('pregunta_id,respuesta').eq('visita_id', visitaId),
        supabase.from('pac_respuestas').select(CAMPOS_RESP).eq('visita_id', visitaId),
      ])
      const fallo = [v, pq, it, vp, rs].find((x) => x.error)
      if (fallo) { setError(fallo.error.message); return }
      const ov = {}
      vp.data.forEach((x) => { ov[x.pregunta_id] = x.respuesta })
      const rr = {}
      rs.data.forEach((x) => {
        const deficiencia = x.deficiencia ?? 'DEF'
        const consecuencias = x.consecuencias ?? 'D'
        rr[x.item_id] = {
          ...x, deficiencia, consecuencias,
          prioridad: x.resultado === 'no_cumple' ? (prioridadPAC(deficiencia, consecuencias) ?? x.prioridad) : x.prioridad,
          medida_alternativa: x.medida_alternativa ?? '', observaciones: x.observaciones ?? '',
        }
      })
      setDatos({ visita: v.data, centro: v.data.centros, preguntas: pq.data, items: it.data })
      setOverrides(ov); setResp(rr); setEstado(v.data.estado)
    })()
  }, [supabase, visitaId])

  const preguntas = datos?.preguntas ?? []
  const items = datos?.items ?? []
  const centro = datos?.centro
  const fechaVisita = datos?.visita.fecha
  const cerrada = estado === 'cerrada'

  const previas = useMemo(() => respuestasPrevias(preguntas, centro, overrides), [preguntas, centro, overrides])
  const bloques = useMemo(() => agruparItems(items), [items])
  const deFicha = useMemo(
    () => new Set(preguntas.filter((p) => evaluarRegla(centro, p.caracteristica, p.operador, p.valor) !== null).map((p) => p.id)),
    [preguntas, centro])

  const incidencias = useMemo(() => filasPAC(items, resp), [items, resp])
  const porPrioridad = useMemo(() => {
    const m = {}
    incidencias.forEach((f) => { m[f.prioridad] = (m[f.prioridad] || 0) + 1 })
    return m
  }, [incidencias])
  const abiertas = incidencias.filter((f) => f.estado_accion === 'pendiente').length

  function cambiarItem(id, nuevo) {
    setResp((r) => {
      const n = { ...r }
      if (nuevo === null) delete n[id]
      else n[id] = nuevo
      return n
    })
    setCambiadosItems((s) => new Set(s).add(id))
    setMensaje('')
  }

  function cambiarPrevia(id, valor) {
    setOverrides((o) => ({ ...o, [id]: valor }))
    setCambiadasPrevias((s) => new Set(s).add(id))
    setMensaje('')
  }

  async function guardar() {
    setError(''); setMensaje('')
    const sinMedida = incidencias.find((f) => f.estado_accion === 'alternativa' && !(f.medida_alternativa ?? '').trim())
    if (sinMedida) { setError(`Indica la medida alternativa del punto: «${sinMedida.punto.slice(0, 80)}…»`); return }
    setGuardando(true)
    try {
      const previas = [...cambiadasPrevias].map((id) => ({ visita_id: visitaId, pregunta_id: id, respuesta: !!overrides[id] }))
      for (let i = 0; i < previas.length; i += 200) {
        const { error: err } = await supabase.from('pac_visita_previas').upsert(previas.slice(i, i + 200), { onConflict: 'visita_id,pregunta_id' })
        if (err) throw err
      }
      const paraGuardar = []
      const paraBorrar = []
      ;[...cambiadosItems].forEach((id) => {
        const r = resp[id]
        if (!r) { paraBorrar.push(id); return }
        if (r.resultado === 'no_aplica') {
          paraGuardar.push({ visita_id: visitaId, item_id: id, resultado: 'no_aplica' })
          return
        }
        paraGuardar.push({
          visita_id: visitaId, item_id: id, resultado: 'no_cumple',
          observaciones: (r.observaciones ?? '').trim() || null,
          deficiencia: r.deficiencia,
          consecuencias: r.consecuencias,
          prioridad: r.prioridad,
          responsable: (r.responsable ?? '').trim() || null,
          coste: formatearCoste(r.coste),
          plazo: r.plazo || null,
          estado_accion: r.estado_accion,
          fecha_realizacion: r.estado_accion === 'pendiente' ? null : r.fecha_realizacion || null,
          medida_alternativa: r.estado_accion === 'alternativa' ? (r.medida_alternativa ?? '').trim() || null : null,
          resuelta_estado: r.estado_accion === 'pendiente' ? 'pendiente' : r.resuelta_estado,
          fecha_resuelta: r.estado_accion !== 'pendiente' && r.resuelta_estado === 'resuelta' ? r.fecha_resuelta || null : null,
        })
      })
      for (let i = 0; i < paraGuardar.length; i += 200) {
        const { error: err } = await supabase.from('pac_respuestas').upsert(paraGuardar.slice(i, i + 200), { onConflict: 'visita_id,item_id' })
        if (err) throw err
      }
      for (let i = 0; i < paraBorrar.length; i += 40) {
        const { error: err } = await supabase.from('pac_respuestas').delete().eq('visita_id', visitaId).in('item_id', paraBorrar.slice(i, i + 40))
        if (err) throw err
      }
      setCambiadosItems(new Set()); setCambiadasPrevias(new Set())
      setMensaje('Visita guardada.')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(nuevo) {
    setError(''); setMensaje('')
    if (nuevo === 'cerrada' && (cambiadosItems.size > 0 || cambiadasPrevias.size > 0)) {
      setError('Guarda los cambios antes de cerrar la visita.'); return
    }
    const { error: err } = await supabase.from('pac_visitas').update({ estado: nuevo }).eq('id', visitaId)
    if (err) setError(err.message)
    else { setEstado(nuevo); setMensaje(nuevo === 'cerrada' ? 'Visita cerrada.' : 'Visita reabierta.') }
  }

  async function bajarExcel() {
    setError('')
    try {
      const blob = await excelPAC({ fecha: fechaVisita, centro }, incidencias)
      descargar(blob, nombreArchivoPAC({ fecha: fechaVisita, centro }, 'xlsx'))
    } catch (err) { setError('No se pudo generar el Excel: ' + err.message) }
  }

  function verPDF() {
    setError('')
    try { imprimir(htmlPAC({ fecha: fechaVisita, centro }, incidencias)) } catch (err) { setError(err.message) }
  }

  function volver() {
    if ((cambiadosItems.size > 0 || cambiadasPrevias.size > 0) && !window.confirm('Hay cambios sin guardar. ¿Salir igualmente?')) return
    onVolver()
  }

  if (error && !datos) return <p style={aviso}>{error}</p>
  if (!datos) return <p>Cargando la visita...</p>

  const filaPrevia = (p) => {
    const rp = previas.get(p.id)
    return (
      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #ececec' }}>
        <span style={{ flex: '1 1 320px' }}>
          {p.pregunta}
          {rp.origen === 'visita' && <small style={{ opacity: 0.6 }}> · cambiada en esta visita</small>}
        </span>
        <Segmento
          valor={rp.valor ? 'si' : 'no'} etiqueta={p.pregunta}
          opciones={[['si', 'Sí', '#2e7d32'], ['no', 'No', '#757575']]} onChange={(v) => cambiarPrevia(p.id, v === 'si')}
        />
      </div>
    )
  }
  const manuales = preguntas.filter((p) => !deFicha.has(p.id))
  const auto = preguntas.filter((p) => deFicha.has(p.id))

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Evaluación de lugar de trabajo</h2>
      <p>
        <b>{centro.codigo} · {centro.nombre}</b><br />
        Fecha: {fechaES(fechaVisita)} · <b>{cerrada ? 'Cerrada' : 'Borrador'}</b>
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <b>{incidencias.length} incidencias</b>
        {ORDEN_PRIORIDAD_PAC.filter((k) => porPrioridad[k]).map((k) => (
          <span key={k} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            <span style={{ background: COLOR_PRIO[k], color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 13, fontWeight: 700 }}>{PRIORIDADES_PAC[k].etiqueta}</span>
            {porPrioridad[k]}
          </span>
        ))}
        {incidencias.length > 0 && <span style={{ opacity: 0.7 }}>· {abiertas} pendientes</span>}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <button onClick={guardar} disabled={guardando || cerrada || (cambiadosItems.size === 0 && cambiadasPrevias.size === 0)} style={{ padding: '8px 16px', fontWeight: 600 }}>
          {guardando ? 'Guardando...' : 'Guardar visita'}
        </button>
        {cerrada
          ? <button className="secundario" onClick={() => cambiarEstado('borrador')}>Reabrir</button>
          : <button className="secundario" onClick={() => cambiarEstado('cerrada')} disabled={guardando}>Cerrar visita</button>}
        <button className="secundario" onClick={bajarExcel}>Descargar Excel</button>
        <button className="secundario" onClick={verPDF}>Generar PDF</button>
        <button className="secundario" onClick={volver} disabled={guardando}>Volver a la lista</button>
      </div>

      {(cambiadosItems.size > 0 || cambiadasPrevias.size > 0) && <p style={{ color: '#8a6d00' }}>Hay cambios sin guardar.</p>}
      {mensaje && <p style={{ color: '#2e7d32' }}>{mensaje}</p>}
      {error && <p style={aviso}>{error}</p>}

      <fieldset disabled={cerrada} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        <details open style={{ marginBottom: 14 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Preguntas previas ({preguntas.length})</summary>
          <p style={{ opacity: 0.7, margin: '6px 0' }}>
            Si respondes No, los puntos que dependen de la pregunta no aparecen en la visita.
          </p>
          <div>{manuales.map(filaPrevia)}</div>
          {auto.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: 'pointer' }}>Deducidas de la ficha del centro ({auto.length})</summary>
              <div>{auto.map(filaPrevia)}</div>
            </details>
          )}
        </details>

        {bloques.map((b) => {
          const secciones = b.secciones
            .map((s) => ({ ...s, items: s.items.filter((it) => itemVisible(it, previas)) }))
            .filter((s) => s.items.length > 0)
          if (secciones.length === 0) return null
          const total = secciones.reduce((n, s) => n + s.items.length, 0)
          const incs = secciones.reduce((n, s) => n + s.items.filter((it) => resp[it.id]?.resultado === 'no_cumple').length, 0)
          return (
            <details key={b.bloque} style={{ borderTop: '1px solid #d9d9d9', padding: '6px 0' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, padding: '6px 0' }}>
                {b.bloque} <span style={{ fontWeight: 400, opacity: 0.7 }}>· {total} puntos</span>
                {incs > 0 && <span style={{ color: '#c62828' }}> · {incs} incidencia{incs > 1 ? 's' : ''}</span>}
              </summary>
              {secciones.map((s) => (
                <div key={s.seccion || 'general'}>
                  {s.seccion && <div style={{ margin: '10px 0 2px', fontWeight: 600, opacity: 0.8 }}>{s.seccion}</div>}
                  {s.items.map((it) => (
                    <ItemFila key={it.id} item={it} r={resp[it.id]} fechaVisita={fechaVisita} hoy={hoy} onCambio={cambiarItem} />
                  ))}
                </div>
              ))}
            </details>
          )
        })}
      </fieldset>
    </div>
  )
}

// ---------------------------------------------------------------------
function NuevaVisita({ supabase, onCreada, onVolver }) {
  const [centros, setCentros] = useState([])
  const [filtro, setFiltro] = useState('')
  const [centroId, setCentroId] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('centros').select('id,codigo,nombre').order('codigo').then(({ data, error: err }) => {
      if (err) setError(err.message); else setCentros(data)
    })
  }, [supabase])

  const visibles = useMemo(() => {
    const q = filtro.trim().toLowerCase()
    return q ? centros.filter((c) => `${c.codigo} ${c.nombre}`.toLowerCase().includes(q)) : centros
  }, [centros, filtro])

  async function empezar() {
    setTrabajando(true); setError('')
    const { data, error: err } = await supabase.from('pac_visitas').insert({ centro_id: centroId }).select('id').single()
    setTrabajando(false)
    if (err) setError(err.message); else onCreada(data.id)
  }

  return (
    <div style={{ maxWidth: 560, textAlign: 'left' }}>
      <h2>Nueva visita</h2>
      {error && <p style={aviso}>{error}</p>}
      <label style={campo}>
        <span>Centro</span>
        <input style={ancho} placeholder="Buscar por código o nombre" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      </label>
      <div role="listbox" aria-label="Centros"
        style={{ ...ancho, marginTop: 6, maxHeight: 240, overflowY: 'auto', border: '1px solid #bbb', borderRadius: 6, background: '#fff' }}>
        {visibles.length === 0 && <div style={{ padding: 8, opacity: 0.7 }}>Ningún centro coincide.</div>}
        {visibles.map((c) => {
          const activo = c.id === centroId
          return (
            <div key={c.id} role="option" aria-selected={activo} tabIndex={0} onClick={() => setCentroId(c.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCentroId(c.id) } }}
              style={{ padding: '7px 10px', cursor: 'pointer', textAlign: 'left', background: activo ? '#cfe0e0' : 'transparent', fontWeight: activo ? 700 : 400 }}>
              {c.codigo} · {c.nombre}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={empezar} disabled={!centroId || trabajando} style={{ padding: '10px 18px', fontWeight: 600 }}>
          {trabajando ? 'Creando...' : 'Empezar la visita'}
        </button>
        <button className="secundario" onClick={onVolver} disabled={trabajando}>Cancelar</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
export default function Pac({ supabase }) {
  const [vista, setVista] = useState('lista') // lista | nueva | visita | importar
  const [visitas, setVisitas] = useState([])
  const [nItems, setNItems] = useState(null)
  const [visitaId, setVisitaId] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  async function cargar() {
    setCargando(true)
    const [v, n] = await Promise.all([
      supabase.from('pac_visitas').select('id,fecha,estado,centros(codigo,nombre)').order('fecha', { ascending: false }),
      supabase.from('pac_items').select('id', { count: 'exact', head: true }),
    ])
    if (v.error || n.error) {
      const msg = (v.error || n.error).message
      setError(/estado|pac_/.test(msg) ? 'Falta ampliar la base de datos: ejecuta migracion_pac.sql en el SQL Editor de Supabase.' : msg)
    } else { setVisitas(v.data); setNItems(n.count ?? 0); setError('') }
    setCargando(false)
  }

  useEffect(() => { cargar() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const aLista = () => { setVista('lista'); setVisitaId(null); cargar() }

  async function borrar(v) {
    if (!window.confirm(`¿Borrar la visita del ${fechaES(v.fecha)} en ${v.centros?.nombre}? No se puede deshacer.`)) return
    const { error: err } = await supabase.from('pac_visitas').delete().eq('id', v.id)
    if (err) setError(err.message); else cargar()
  }

  if (vista === 'importar') return <ImportarPac supabase={supabase} onTerminado={cargar} onVolver={aLista} />
  if (vista === 'nueva') return <NuevaVisita supabase={supabase} onCreada={(id) => { setVisitaId(id); setVista('visita') }} onVolver={aLista} />
  if (vista === 'visita') return <VisitaPac supabase={supabase} visitaId={visitaId} onVolver={aLista} />

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Evaluación de lugar de trabajo</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Evaluación del lugar de trabajo en cada centro. Sus incidencias pasan a la Planificación Acción Correctiva (PAC).</p>
      <BarraAlta
        resumen={<span><b>{visitas.length}</b> {visitas.length === 1 ? 'evaluación' : 'evaluaciones'} · <b>{nItems ?? 0}</b> puntos en la lista de comprobación</span>}
        onManual={() => setVista('nueva')} textoManual="Nueva evaluación del lugar de trabajo" deshabilitadoManual={!nItems}
        onMasivo={() => setVista('importar')} textoMasivo="Importar lista de comprobación"
      />
      {error && <p style={aviso}>{error}</p>}
      {!cargando && nItems === 0 && !error && (
        <p className="vacio">Todavía no hay lista de comprobación. Impórtala desde el Excel para poder empezar una visita.</p>
      )}
      {cargando && <p>Cargando...</p>}
      {!cargando && nItems > 0 && visitas.length === 0 && <p className="vacio">Todavía no hay evaluaciones del lugar de trabajo.</p>}
      {!cargando && visitas.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: 8 }}>Fecha</th><th style={{ padding: 8 }}>Centro</th><th style={{ padding: 8 }}>Estado</th><th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {visitas.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: 8 }}>{fechaES(v.fecha)}</td>
                  <td style={{ padding: 8 }}>{v.centros?.codigo} · {v.centros?.nombre}</td>
                  <td style={{ padding: 8 }}>{v.estado === 'cerrada' ? 'Cerrada' : 'Borrador'}</td>
                  <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                    <button className="secundario" onClick={() => { setVisitaId(v.id); setVista('visita') }}>Abrir</button>{' '}
                    <button className="secundario" onClick={() => borrar(v)} style={{ color: '#b00020' }}>Borrar</button>
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
