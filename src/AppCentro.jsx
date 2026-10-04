import { useEffect, useMemo, useRef, useState } from 'react'
import Marco from './Marco'
import { MENU_CENTRO } from './menuSistema'
import PanelCentro from './PanelCentro'
import PapLista from './PapLista'
import InformacionRiesgos from './InformacionRiesgos'
import HojasEvaluacion from './HojasEvaluacion'
import MetodologiaTab from './MetodologiaTab'
import FuncionesPuestos from './FuncionesPuestos'
import Agresiones from './Agresiones'
import EvaluacionEmbarazo from './EvaluacionEmbarazo'
import EquiposInstalaciones from './EquiposInstalaciones'
import GestorDocumental from './GestorDocumental'
import VerificarPase from './VerificarPase'
import Biblioteca from './Biblioteca'
import ComunicarSuceso from './ComunicarSuceso'
import { FormIncidencia } from './Pac'
import { COLOR_VR, ETIQUETA_VR, ordenarFilas, vrDe } from './evalLogic'
import { filasPAC } from './documentos'
import { ORDEN_PRIORIDAD_PAC, PRIORIDADES_PAC, prioridadPAC } from './pacLogic'
import { fechaES, hoyISO } from './planLogic'

// Aplicación del usuario de centro (acceso restringido). Entra en un panel con las acciones que tiene que cerrar y sus plazos.
// Solo ve lo suyo: su evaluación (solo lectura), el PAP y el PAC (donde solo cambia el estado), su registro de agresiones y sus documentos.
// La seguridad real la imponen las políticas de Supabase; esta pantalla solo muestra lo permitido.

const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const COLOR_PRIO = { inmediata: '#c62828', alta: '#d9600a', media: '#b8860b', baja: '#2e7d32' }

// ---------------------------------------------------------------------
function VistaEvaluacion({ supabase, evaluacion }) {
  const [filas, setFilas] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('evaluacion_riesgos')
      .select('id,riesgo_id,riesgo_nombre,condicion,p,c,medidas,origen').eq('evaluacion_id', evaluacion.id)
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setFilas(ordenarFilas(data.map((r) => ({ ...r, medidas: r.medidas ?? [] }))))
      })
  }, [supabase, evaluacion.id])

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Evaluación de Riesgos</h2>
      <p>
        <b>{evaluacion.centro.codigo} · {evaluacion.centro.nombre}</b><br />
        Puesto: <b>{evaluacion.puesto.nombre}</b> · {fechaES(evaluacion.fecha)}
      </p>
      {error && <p style={aviso}>{error}</p>}
      {!filas && !error && <p>Cargando...</p>}
      {filas && filas.length === 0 && <p className="vacio">Esta evaluación no tiene riesgos.</p>}
      {filas?.map((f) => {
        const vr = vrDe(f.p, f.c)
        return (
          <div key={f.id} style={{ border: '1px solid #d9d9d9', borderLeft: `6px solid ${vr ? COLOR_VR[vr] : '#9e9e9e'}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <strong>{f.riesgo_id} · {f.riesgo_nombre}</strong>
              {vr && (
                <span title={ETIQUETA_VR[vr]} style={{ background: COLOR_VR[vr], color: '#fff', borderRadius: 12, padding: '2px 10px', fontWeight: 700, fontSize: 13 }}>
                  {vr} · {ETIQUETA_VR[vr]}
                </span>
              )}
            </div>
            <p style={{ margin: '6px 0' }}>{f.condicion}</p>
            {f.medidas.length > 0 && (
              <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                {f.medidas.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------
function PacCentro({ supabase, centroId }) {
  const [visitas, setVisitas] = useState(null)
  const [visita, setVisita] = useState(null)
  const [items, setItems] = useState([])
  const [resp, setResp] = useState({})
  const [cambiados, setCambiados] = useState(() => new Set())
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [falloAuto, setFalloAuto] = useState(false)
  const respRef = useRef(resp)
  respRef.current = resp
  const hoy = hoyISO()

  useEffect(() => {
    supabase.from('pac_visitas').select('id,fecha,estado').eq('centro_id', centroId).order('fecha', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else { setVisitas(data); if (data.length === 1) setVisita(data[0]) }
      })
  }, [supabase, centroId])

  useEffect(() => {
    if (!visita) return
    setResp({}); setCambiados(new Set()); setMensaje(''); setError('')
    Promise.all([
      supabase.from('pac_items').select('id,orden,bloque,seccion,punto'),
      supabase.from('pac_respuestas').select('*').eq('visita_id', visita.id).eq('resultado', 'no_cumple'),
    ]).then(([it, rs]) => {
      const fallo = it.error || rs.error
      if (fallo) { setError(fallo.message); return }
      const rr = {}
      rs.data.forEach((x) => {
        const deficiencia = x.deficiencia ?? 'DEF'
        const consecuencias = x.consecuencias ?? 'D'
        rr[x.item_id] = {
          ...x, deficiencia, consecuencias,
          prioridad: prioridadPAC(deficiencia, consecuencias) ?? x.prioridad,
          medida_alternativa: x.medida_alternativa ?? '', observaciones: x.observaciones ?? '',
        }
      })
      setItems(it.data); setResp(rr)
    })
  }, [supabase, visita])

  const incidencias = useMemo(() => filasPAC(items, resp), [items, resp])

  // Una incidencia con «medida alternativa» no se guarda hasta que se indica cuál es.
  const completa = (r) => !!r && !(r.estado_accion === 'alternativa' && !(r.medida_alternativa ?? '').trim())
  const hayListos = [...cambiados].some((id) => completa(resp[id]))
  const faltanMedida = [...cambiados].some((id) => resp[id] && !completa(resp[id]))

  function cambiar(itemId, nuevo) {
    setResp((r) => ({ ...r, [itemId]: nuevo }))
    setCambiados((s) => new Set(s).add(itemId))
    setMensaje('')
    setFalloAuto(false)
  }

  // Cada cambio se guarda solo, a los 0,6 s, con la función segura del servidor.
  async function guardarAuto() {
    const instantanea = [...cambiados].map((id) => [id, respRef.current[id]]).filter(([, r]) => completa(r))
    if (!instantanea.length) return
    setGuardando(true); setError(''); setMensaje('')
    try {
      for (const [id, r] of instantanea) {
        const { error: err } = await supabase.rpc('centro_actualizar_pac', {
          p_visita: visita.id,
          p_item: id,
          p_estado: r.estado_accion,
          p_fecha_realizacion: r.estado_accion === 'pendiente' ? null : r.fecha_realizacion || null,
          p_medida_alternativa: r.estado_accion === 'alternativa' ? (r.medida_alternativa ?? '').trim() : null,
        })
        if (err) throw err
      }
      // Solo se da por guardado lo que no ha cambiado mientras tanto
      setCambiados((previos) => {
        const n = new Set(previos)
        instantanea.forEach(([id, r]) => { if (respRef.current[id] === r) n.delete(id) })
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
    if (!hayListos || guardando || falloAuto) return undefined
    const t = setTimeout(guardarAuto, 600)
    return () => clearTimeout(t)
  }, [hayListos, guardando, falloAuto, cambiados, resp]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visitas && !error) return <p>Cargando...</p>

  if (!visita) {
    return (
      <div style={{ textAlign: 'left' }}>
        <h2>Planificación Acción Correctiva (PAC)</h2>
        {error && <p style={aviso}>{error}</p>}
        {visitas?.length === 0 && <p className="vacio">Todavía no hay visitas registradas en el centro.</p>}
        {visitas?.map((v) => (
          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid #e5e5e5' }}>
            <span>{fechaES(v.fecha)} · {v.estado === 'cerrada' ? 'Cerrada' : 'Borrador'}</span>
            <button className="secundario" onClick={() => setVisita(v)}>Abrir</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Visita del {fechaES(visita.fecha)}</h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ alignSelf: 'center', opacity: 0.8 }}>
          {guardando ? 'Guardando...' : hayListos && !falloAuto ? 'Guardando en un momento...' : 'Los cambios se guardan solos'}
        </span>
        {visitas?.length > 1 && <button className="secundario" onClick={() => setVisita(null)} disabled={guardando}>Otras visitas</button>}
      </div>
      {faltanMedida && <p style={{ color: '#8a6d00' }}>Hay incidencias con medida alternativa sin describir: se guardarán en cuanto indiques cuál es.</p>}
      {mensaje && <p style={{ color: '#2e7d32' }}>{mensaje}</p>}
      {error && <p style={aviso}>{error}</p>}
      <p style={{ opacity: 0.75 }}>Puedes elegir el estado de cada incidencia (pendiente, realizada o medida alternativa). El resto es de solo lectura.</p>
      {incidencias.length === 0 && !error && <p className="vacio">La visita no tiene incidencias.</p>}
      {ORDEN_PRIORIDAD_PAC.map((k) => {
        const grupo = incidencias.filter((f) => f.prioridad === k)
        if (grupo.length === 0) return null
        return (
          <section key={k} style={{ marginBottom: 20 }}>
            <h3 style={{ borderLeft: `6px solid ${COLOR_PRIO[k]}`, paddingLeft: 10 }}>
              Prioridad {PRIORIDADES_PAC[k].etiqueta} ({grupo.length})
            </h3>
            {grupo.map((f) => (
              <div key={f.item_id} style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div style={{ fontSize: 13, opacity: 0.7 }}>{f.bloque}{f.seccion ? ` · ${f.seccion}` : ''}</div>
                <strong>{f.punto}</strong>
                <FormIncidencia
                  r={resp[f.item_id]} fechaVisita={visita.fecha} hoy={hoy} soloEstado
                  onCambio={(nuevo) => cambiar(f.item_id, nuevo)}
                />
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------
function ElegirCentro({ centros, onElegir, titulo }) {
  return (
    <div style={{ textAlign: 'left' }}>
      <h2>{titulo}</h2>
      <p>Elige el centro.</p>
      {centros.map((c) => (
        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid #e5e5e5' }}>
          <span>{c.codigo} · {c.nombre}</span>
          <button className="secundario" onClick={() => onElegir(c.id)}>Abrir</button>
        </div>
      ))}
    </div>
  )
}


export default function AppCentro({ supabase, sesion }) {
  const [evals, setEvals] = useState(null)
  const [seccion, setSeccion] = useState('panel')
  const [evalSel, setEvalSel] = useState(null)
  const [papInicial, setPapInicial] = useState(null)
  const [centroSel, setCentroSel] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('evaluaciones').select('id,fecha,estado,evaluacion_centro_id,centros(id,codigo,nombre),puestos(id,nombre)').in('estado', ['borrador', 'cerrada'])
      .order('fecha', { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); return }
        setEvals(data.map((e) => ({ id: e.id, fecha: e.fecha, estado: e.estado, evaluacion_centro_id: e.evaluacion_centro_id, centro: e.centros, puesto: e.puestos })))
      })
  }, [supabase])

  const centros = useMemo(() => [...new Map((evals ?? []).map((e) => [e.centro?.id, e.centro])).values()].filter(Boolean), [evals])
  const centro = centros.length === 1 ? centros[0] : centros.find((c) => c.id === centroSel) ?? null

  function irA(destino, id) {
    if (destino === 'pap') setPapInicial(id ?? null)
    if (destino === 'pac' || destino === 'agresiones') { if (id) setCentroSel(id) }
    setSeccion(destino)
  }
  function ir(destino) { setPapInicial(null); setSeccion(destino) }

  const evalElegida = evals && (evals.length === 1 ? evals[0] : evals.find((e) => e.id === evalSel) ?? null)

  return (
    <Marco email={sesion.user.email} onSalir={() => supabase.auth.signOut()} menu={evals?.length ? MENU_CENTRO : []} seccion={seccion} onElegir={ir}>
        {error && <p style={aviso}>{error}</p>}
        {!evals && !error && <p>Cargando...</p>}
        {evals && evals.length === 0 && <p className="vacio">Todavía no tienes ninguna evaluación asignada.</p>}

        {evals && evals.length > 0 && (
          <>

            {seccion === 'panel' && <PanelCentro supabase={supabase} evals={evals} onIr={irA} />}

            {seccion === 'evaluacion' && (evalElegida
              ? (
                <>
                  {evals.length > 1 && <p><button className="secundario" onClick={() => setEvalSel(null)}>Ver otro puesto</button></p>}
                  <VistaEvaluacion supabase={supabase} evaluacion={evalElegida} />
                </>
              )
              : (
                <div style={{ textAlign: 'left' }}>
                  <h2>Evaluación de riesgos por puesto</h2>
                  {centros.map((c) => (
                    <section key={c.id} style={{ marginBottom: 16 }}>
                      {centros.length > 1 && <h3 style={{ margin: '8px 0 4px' }}>{c.codigo} · {c.nombre}</h3>}
                      {evals.filter((e) => e.centro?.id === c.id)
                        .sort((a, b) => (a.puesto?.nombre ?? '').localeCompare(b.puesto?.nombre ?? '', 'es'))
                        .map((e) => (
                          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid #e5e5e5' }}>
                            <span>{e.puesto?.nombre} <small style={{ opacity: 0.65 }}>· {e.estado === 'cerrada' ? 'evaluado' : 'en curso'} · {fechaES(e.fecha)}</small></span>
                            <button className="secundario" onClick={() => setEvalSel(e.id)}>Abrir</button>
                          </div>
                        ))}
                    </section>
                  ))}
                </div>
              ))}

            {seccion === 'pap' && <PapLista key={papInicial ?? 'lista'} supabase={supabase} soloEstado inicial={papInicial} />}

            {seccion === 'pac' && (centro ? <PacCentro supabase={supabase} centroId={centro.id} /> : <ElegirCentro centros={centros} titulo="Planificación Acción Correctiva (PAC)" onElegir={setCentroSel} />)}
            {seccion === 'agresiones' && (centro ? <Agresiones supabase={supabase} centro={centro} /> : <ElegirCentro centros={centros} titulo="Registro de Agresiones" onElegir={setCentroSel} />)}
            {seccion === 'ere' && <EvaluacionEmbarazo supabase={supabase} soloPdf />}
            {seccion === 'equipos' && (centro ? <EquiposInstalaciones supabase={supabase} centroFijo={centro} soloLectura soloPdf /> : <ElegirCentro centros={centros} titulo="Equipos e instalaciones" onElegir={setCentroSel} />)}
            {seccion === 'ir' && <InformacionRiesgos supabase={supabase} soloPdf />}
            {seccion === 'epis' && <HojasEvaluacion supabase={supabase} modo="epis" soloPdf />}
            {seccion === 'form' && <HojasEvaluacion supabase={supabase} modo="formacion" soloPdf />}
            {seccion === 'procedimientos' && <GestorDocumental supabase={supabase} ambito="general" soloLectura onIrOtra={() => ir('docs')} />}
            {seccion === 'docs' && <GestorDocumental supabase={supabase} ambito="centro" soloLectura onIrOtra={() => ir('procedimientos')} />}
            {seccion === 'metodologia' && <MetodologiaTab onBiblioteca={() => ir('biblioteca')} />}
            {seccion === 'funciones' && <FuncionesPuestos />}
            {seccion === 'pase' && <VerificarPase supabase={supabase} />}
            {seccion === 'biblioteca' && <Biblioteca supabase={supabase} />}
            {seccion === 'comunicar' && (centro ? <ComunicarSuceso supabase={supabase} centro={centro} /> : <ElegirCentro centros={centros} titulo="Comunicar accidente o incidente" onElegir={setCentroSel} />)}
          </>
        )}
    </Marco>
  )
}
