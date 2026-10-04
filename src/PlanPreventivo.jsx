import { useEffect, useMemo, useRef, useState } from 'react'
import { COLOR_VR, ORDEN_VR, vrDe } from './evalLogic'
import { PRIORIDADES, descargar, excelPAP, filasPAP, htmlPAP, imprimir, nombreArchivo } from './documentos'
import {
  COSTE_POR_DEFECTO, PLAZO_POR_VR, RESPONSABLES, RESPONSABLE_DEFECTO,
  fechaES, formatearCoste, hoyISO, limiteEficacia, plazoPorDefecto,
} from './planLogic'

// Plan de acción preventiva (PAP): los riesgos de la evaluación agrupados por prioridad, con
// responsable, coste, plazo, ejecución y comprobación de la eficacia de cada acción.
// Props: supabase, evaluacion {id, fecha, estado, centro, puesto}, onVolver

const campo = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, fontSize: 14, textAlign: 'left' }
const ancho = { width: '100%', boxSizing: 'border-box' }
const rejilla = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, alignItems: 'start' }
const COLUMNAS =
  'id,evaluacion_id,riesgo_id,riesgo_nombre,condicion,p,c,medidas,origen,responsable,coste,plazo,' +
  'estado_accion,fecha_realizacion,eficacia_estado,fecha_eficacia'

function Interruptor({ activo, onChange, etiqueta, deshabilitado = false }) {
  return (
    <button
      type="button" role="switch" aria-checked={activo} aria-label={etiqueta} disabled={deshabilitado} onClick={() => onChange(!activo)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, background: 'none', border: 'none',
        padding: '4px 0', margin: 0, cursor: deshabilitado ? 'default' : 'pointer', font: 'inherit', color: 'inherit',
        boxShadow: 'none', opacity: deshabilitado ? 0.6 : 1,
      }}
    >
      <span style={{ position: 'relative', width: 46, height: 26, borderRadius: 13, flex: 'none',
        background: activo ? '#2e7d32' : '#9e9e9e', transition: 'background .15s' }}>
        <span style={{ position: 'absolute', top: 3, left: activo ? 23 : 3, width: 20, height: 20,
          borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
      </span>
      <span style={{ fontWeight: 600 }}>{activo ? 'Realizada' : 'Pendiente'}</span>
    </button>
  )
}

// cabeza: lo que se muestra encima de los controles (por defecto, el riesgo, la situación y sus medidas).
export function TarjetaAccion({ f, fechaEval, hoy, onCambio, soloEstado, cabeza = null }) {
  const plazoEstandar = PLAZO_POR_VR[f.vr]?.etiqueta
  const hecha = f.estado_accion === 'realizada'
  const comprobada = f.eficacia_estado === 'realizada'
  const limite = limiteEficacia(fechaEval)
  const esEstandar = RESPONSABLES.includes(f.responsable)
  const plazoVencido = !hecha && f.plazo && f.plazo < hoy
  const eficaciaVencida = hecha && !comprobada && limite && limite < hoy

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 12, marginBottom: 10, textAlign: 'left' }}>
      {cabeza ?? (
        <>
          <strong>{f.riesgo_id} · {f.riesgo_nombre}</strong>
          <p style={{ margin: '4px 0' }}>{f.condicion}</p>
          {f.medidas.length > 0 && (
            <ul style={{ margin: '4px 0 10px 18px', padding: 0 }}>
              {f.medidas.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          )}
        </>
      )}

      <div style={rejilla}>
        <div style={campo}>
          <label style={campo}>
            <span>Responsable</span>
            <select
              style={ancho} disabled={soloEstado} value={esEstandar ? f.responsable : 'otro'}
              onChange={(e) => onCambio(f.id, { responsable: e.target.value === 'otro' ? '' : e.target.value })}
            >
              {RESPONSABLES.map((r) => <option key={r} value={r}>{r}</option>)}
              <option value="otro">Otro...</option>
            </select>
          </label>
          {!esEstandar && (
            <input
              style={ancho} disabled={soloEstado} placeholder="Indica quién" value={f.responsable ?? ''}
              onChange={(e) => onCambio(f.id, { responsable: e.target.value })}
            />
          )}
        </div>

        <label style={campo}>
          <span>Coste de la medida</span>
          <input
            style={ancho} disabled={soloEstado} value={f.coste ?? ''}
            onFocus={(e) => e.target.select()}
            onChange={(e) => onCambio(f.id, { coste: e.target.value })}
            onBlur={() => {
              const nuevo = formatearCoste(f.coste)
              if (nuevo !== f.coste) onCambio(f.id, { coste: nuevo })
            }}
          />
          <small style={{ opacity: 0.65 }}>Escribe una cifra y saldrá con €</small>
        </label>

        <label style={campo}>
          <span>Plazo</span>
          <input type="date" style={ancho} disabled={soloEstado} value={f.plazo ?? ''} onChange={(e) => onCambio(f.id, { plazo: e.target.value })} />
          <small style={{ color: plazoVencido ? '#c62828' : undefined, opacity: plazoVencido ? 1 : 0.65, fontWeight: plazoVencido ? 700 : 400 }}>
            {plazoVencido ? 'Plazo vencido · ' : ''}Estándar de esta prioridad: {plazoEstandar}
          </small>
        </label>

        <div style={campo}>
          <span>Estado de la acción</span>
          <Interruptor
            activo={hecha} etiqueta="Acción realizada"
            onChange={(on) => onCambio(f.id, on
              ? { estado_accion: 'realizada', fecha_realizacion: hoy }
              : { estado_accion: 'pendiente', fecha_realizacion: null, eficacia_estado: 'pendiente', fecha_eficacia: null })}
          />
          {hecha && (
            <label style={campo}>
              <span>Fecha de realización</span>
              <input type="date" style={ancho} value={f.fecha_realizacion ?? ''}
                onChange={(e) => onCambio(f.id, { fecha_realizacion: e.target.value || null })} />
            </label>
          )}
        </div>
      </div>

      {hecha && (
        <div style={{ ...rejilla, marginTop: 12, paddingTop: 10, borderTop: '1px dashed #c9c9c9' }}>
          <div style={campo}>
            <span><b>Comprobación de la eficacia</b></span>
            <small style={{ color: eficaciaVencida ? '#c62828' : undefined, opacity: eficaciaVencida ? 1 : 0.65, fontWeight: eficaciaVencida ? 700 : 400 }}>
              {eficaciaVencida ? 'Fecha límite superada · ' : ''}Fecha límite: {fechaES(limite)}
            </small>
          </div>
          <div style={campo}>
            <Interruptor
              activo={comprobada} etiqueta="Eficacia comprobada" deshabilitado={soloEstado}
              onChange={(on) => onCambio(f.id, on
                ? { eficacia_estado: 'realizada', fecha_eficacia: hoy }
                : { eficacia_estado: 'pendiente', fecha_eficacia: null })}
            />
          </div>
          {comprobada && (
            <label style={campo}>
              <span>Fecha de comprobación</span>
              <input type="date" style={ancho} disabled={soloEstado} value={f.fecha_eficacia ?? ''}
                onChange={(e) => onCambio(f.id, { fecha_eficacia: e.target.value || null })} />
            </label>
          )}
        </div>
      )}
    </div>
  )
}

export default function PlanPreventivo({ supabase, evaluacion, onVolver, soloEstado = false }) {
  const [filas, setFilas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cambiados, setCambiados] = useState(() => new Set())
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [falloAuto, setFalloAuto] = useState(false)
  const filasRef = useRef(filas)
  filasRef.current = filas
  const hoy = hoyISO()

  useEffect(() => {
    supabase.from('evaluacion_riesgos').select(COLUMNAS).eq('evaluacion_id', evaluacion.id)
      .then(({ data, error: err }) => {
        if (err) {
          const falta = ['responsable', 'coste', 'estado_accion', 'fecha_realizacion', 'eficacia_estado', 'fecha_eficacia']
          setError(falta.some((c) => err.message.includes(c))
            ? 'Falta ampliar la base de datos: ejecuta migracion_pap.sql y migracion_pap2.sql en el SQL Editor de Supabase.'
            : err.message)
        } else {
          setFilas(data.map((r) => {
            const vr = vrDe(r.p, r.c)
            return {
              ...r,
              medidas: r.medidas ?? [],
              responsable: r.responsable ?? RESPONSABLE_DEFECTO,
              coste: r.coste ?? COSTE_POR_DEFECTO,
              plazo: r.plazo ?? (vr ? plazoPorDefecto(vr, evaluacion.fecha) : null),
              estado_accion: r.estado_accion === 'realizada' ? 'realizada' : 'pendiente',
              eficacia_estado: r.eficacia_estado ?? 'pendiente',
            }
          }))
        }
        setCargando(false)
      })
  }, [supabase, evaluacion.id, evaluacion.fecha])

  const plan = useMemo(() => filasPAP(filas), [filas])
  const sinVR = useMemo(() => filas.filter((f) => !vrDe(f.p, f.c)).length, [filas])
  const porVR = useMemo(() => {
    const m = {}
    plan.forEach((f) => { (m[f.vr] = m[f.vr] || []).push(f) })
    return m
  }, [plan])

  function cambiar(id, parche) {
    setFilas((fs) => fs.map((f) => (f.id === id ? { ...f, ...parche } : f)))
    setCambiados((s) => new Set(s).add(id))
    setMensaje('')
    setFalloAuto(false)
  }

  // Usuario de centro: cada cambio se guarda solo, a los 0,6 s, con la función segura del servidor.
  async function guardarAuto() {
    const instantanea = filasRef.current.filter((f) => cambiados.has(f.id))
    if (!instantanea.length) return
    setGuardando(true); setError(''); setMensaje('')
    try {
      for (const f of instantanea) {
        const hecha = f.estado_accion === 'realizada'
        const { error: err } = await supabase.rpc('centro_actualizar_pap', {
          p_id: f.id,
          p_estado: hecha ? 'realizada' : 'pendiente',
          p_fecha_realizacion: hecha ? f.fecha_realizacion || null : null,
        })
        if (err) throw err
      }
      // Solo se da por guardado lo que no ha cambiado mientras tanto
      setCambiados((previos) => {
        const n = new Set(previos)
        instantanea.forEach((f) => { if (filasRef.current.find((x) => x.id === f.id) === f) n.delete(f.id) })
        return n
      })
      setMensaje('Guardado')
    } catch (err) {
      setError(err.message)
      setFalloAuto(true)
    } finally {
      setGuardando(false)
    }
  }

  useEffect(() => {
    if (!soloEstado || guardando || falloAuto || cambiados.size === 0) return undefined
    const t = setTimeout(guardarAuto, 600)
    return () => clearTimeout(t)
  }, [soloEstado, guardando, falloAuto, cambiados, filas]) // eslint-disable-line react-hooks/exhaustive-deps

  async function guardar() {
    setError(''); setMensaje('')
    const payload = filas.filter((f) => cambiados.has(f.id)).map((f) => ({
      id: f.id, evaluacion_id: f.evaluacion_id, riesgo_nombre: f.riesgo_nombre, condicion: f.condicion, origen: f.origen,
      responsable: (f.responsable ?? '').trim() || null,
      coste: formatearCoste(f.coste),
      plazo: f.plazo || null,
      estado_accion: f.estado_accion,
      fecha_realizacion: f.estado_accion === 'realizada' ? f.fecha_realizacion || null : null,
      eficacia_estado: f.estado_accion === 'realizada' ? f.eficacia_estado : 'pendiente',
      fecha_eficacia: f.estado_accion === 'realizada' && f.eficacia_estado === 'realizada' ? f.fecha_eficacia || null : null,
    }))
    if (!payload.length) return
    setGuardando(true)
    try {
      for (let i = 0; i < payload.length; i += 200) {
        const { error: err } = await supabase.from('evaluacion_riesgos').upsert(payload.slice(i, i + 200), { onConflict: 'id' })
        if (err) throw err
      }
      setCambiados(new Set())
      setMensaje('Plan guardado.')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  async function bajarExcel() {
    setError('')
    try {
      const blob = await excelPAP(evaluacion, plan)
      descargar(blob, nombreArchivo('PAP', evaluacion, 'xlsx'))
    } catch (err) {
      setError('No se pudo generar el Excel: ' + err.message)
    }
  }

  function verPDF() {
    setError('')
    try { imprimir(htmlPAP(evaluacion, plan)) } catch (err) { setError(err.message) }
  }

  function volver() {
    if (!soloEstado && cambiados.size > 0 && !window.confirm('Hay cambios sin guardar en el plan. ¿Salir igualmente?')) return
    onVolver()
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Planificación Actividad Preventiva (PAP)</h2>
      <p>
        <b>{evaluacion.centro.codigo} · {evaluacion.centro.nombre}</b><br />
        Puesto: <b>{evaluacion.puesto.nombre}</b> · {fechaES(evaluacion.fecha)}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        {soloEstado ? (
          <span style={{ alignSelf: 'center', opacity: 0.8 }}>
            {guardando ? 'Guardando...' : cambiados.size > 0 && !falloAuto ? 'Guardando en un momento...' : 'Los cambios se guardan solos'}
          </span>
        ) : (
          <button onClick={guardar} disabled={guardando || cambiados.size === 0} style={{ padding: '8px 16px', fontWeight: 600 }}>
            {guardando ? 'Guardando...' : 'Guardar plan'}
          </button>
        )}
        <button className="secundario" onClick={bajarExcel} disabled={cargando || plan.length === 0}>Descargar Excel</button>
        <button className="secundario" onClick={verPDF} disabled={cargando || plan.length === 0}>Generar PDF</button>
        <button className="secundario" onClick={volver} disabled={guardando}>Volver a la evaluación</button>
      </div>

      {!soloEstado && cambiados.size > 0 && <p style={{ color: '#8a6d00' }}>Hay cambios sin guardar.</p>}
      {mensaje && <p style={{ color: '#2e7d32' }}>{mensaje}</p>}
      {error && <p style={{ color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }}>{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && sinVR > 0 && (
        <p style={{ color: '#b00020' }}>
          {sinVR} riesgo/s sin P o C no aparecen en el plan. Complétalos en la evaluación.
        </p>
      )}
      {!cargando && plan.length === 0 && !error && <p className="vacio">No hay riesgos valorados para planificar.</p>}

      {Object.keys(ORDEN_VR).filter((k) => porVR[k]).map((vr) => {
        const pr = PRIORIDADES[vr]
        return (
          <section key={vr} style={{ marginBottom: 24 }}>
            <h3 style={{ borderLeft: `6px solid ${COLOR_VR[vr]}`, paddingLeft: 10, margin: '16px 0 4px' }}>
              Prioridad {pr.prioridad} · {vr} {pr.nombre} ({porVR[vr].length})
            </h3>
            <p style={{ margin: '0 0 10px', opacity: 0.8 }}>{pr.accion}</p>
            {porVR[vr].map((f) => (
              <TarjetaAccion key={f.id} f={f} fechaEval={evaluacion.fecha} hoy={hoy} onCambio={cambiar} soloEstado={soloEstado} />
            ))}
          </section>
        )
      })}
    </div>
  )
}
