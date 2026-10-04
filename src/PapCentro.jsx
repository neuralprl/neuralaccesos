import { useEffect, useMemo, useRef, useState } from 'react'
import { COLOR_VR, ORDEN_VR } from './evalLogic'
import { PRIORIDADES, descargar, excelPAPCentro, htmlPAPCentro, imprimir, nombreArchivoPAPCentro } from './documentos'
import { TarjetaAccion } from './PlanPreventivo'
import { formatearCoste, fechaES, hoyISO } from './planLogic'
import { puestosConMenorPrioridad, resumenPAPCentro } from './papCentroLogic'
import { leerAccionesPAP, sincronizarPAPCentro } from './papCentroDatos'

// PAP del centro: una acción por medida, sin duplicados entre puestos, con la prioridad más restrictiva.
// Técnico: lo actualiza con la evaluación al abrirlo y edita responsable, coste, plazo, estado y eficacia.
// Centro (soloEstado): solo marca realizada o pendiente; se guarda solo.
// Props: supabase, evc {id, fecha, centro: {codigo, nombre}}, soloEstado, onVolver

const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// «3 puestos», «2 equipos o instalaciones» o «3 puestos y 2 equipos o instalaciones»
function etiquetaAmbito(lista) {
  const eq = lista.filter((p) => String(p.puesto_id).startsWith('eq:')).length
  const pu = lista.length - eq
  const t = []
  if (pu) t.push(`${pu} ${pu === 1 ? 'puesto' : 'puestos'}`)
  if (eq) t.push(`${eq} ${eq === 1 ? 'equipo o instalación' : 'equipos o instalaciones'}`)
  return t.join(' y ')
}

function Cabeza({ a, totalPuestos }) {
  const menor = puestosConMenorPrioridad(a)
  const todos = (a.puestos ?? []).filter((p) => !String(p.puesto_id).startsWith('eq:')).length === totalPuestos && (a.puestos ?? []).length === totalPuestos && totalPuestos > 1
  return (
    <div style={{ marginBottom: 10 }}>
      <strong style={{ color: a.sin_medida ? '#b00020' : undefined }}>{a.medida}</strong>
      {(a.variantes ?? []).length > 1 && (
        <details style={{ fontSize: 13, marginTop: 2 }}>
          <summary style={{ cursor: 'pointer', opacity: 0.8 }}>Une {a.variantes.length} redacciones parecidas</summary>
          <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>{a.variantes.map((v) => <li key={v}>{v}</li>)}</ul>
        </details>
      )}
      <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
        {(a.riesgos ?? []).map((r) => `${r.id} · ${r.nombre}`).join(' · ')}
      </div>
      <div style={{ fontSize: 13, marginTop: 4 }}>
        <b>{todos ? `Todos los puestos (${totalPuestos})` : etiquetaAmbito(a.puestos)}:</b>{' '}
        {todos ? '' : a.puestos.map((p) => p.nombre).join(', ')}
      </div>
      {menor.length > 0 && (
        <div style={{ fontSize: 13, marginTop: 4, color: '#7a4b00', background: '#fde9c4', padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>
          Se aplica la prioridad más alta ({a.vr}). En algunos puestos es más baja: {menor.map((p) => `${p.nombre} (${p.vr})`).join(', ')}.
          {' '}Si es el mismo riesgo, revisa la matriz en «Actualizar → Revisar valoraciones de la matriz».
        </div>
      )}
    </div>
  )
}

export default function PapCentro({ supabase, evc, soloEstado = false, onVolver }) {
  const [acciones, setAcciones] = useState(null)
  const [totalPuestos, setTotalPuestos] = useState(0)
  const [cambiados, setCambiados] = useState(() => new Set())
  const [guardando, setGuardando] = useState(false)
  const [falloAuto, setFalloAuto] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [busca, setBusca] = useState('')
  const [estado, setEstado] = useState('')
  const ref = useRef(acciones)
  ref.current = acciones
  const hoy = hoyISO()

  async function cargar(sincronizar) {
    setError('')
    try {
      let msg = ''
      if (sincronizar) {
        const r = await sincronizarPAPCentro(supabase, evc)
        if (r.nuevas || r.cambiadas || r.quitadas) msg = `PAP actualizado con la evaluación: ${r.nuevas} acciones nuevas, ${r.cambiadas} cambiadas, ${r.quitadas} quitadas.`
      }
      const [lista, evs] = await Promise.all([
        leerAccionesPAP(supabase, [evc.id]),
        supabase.from('evaluaciones').select('id', { count: 'exact', head: true }).eq('evaluacion_centro_id', evc.id).in('estado', ['borrador', 'cerrada']),
      ])
      setTotalPuestos(evs.count ?? 0)
      setAcciones(lista.sort((a, b) => ORDEN_VR[a.vr] - ORDEN_VR[b.vr] || a.medida.localeCompare(b.medida, 'es')))
      setCambiados(new Set()); setMensaje(msg)
    } catch (e) { setError(e.message); setAcciones((x) => x ?? []) }
  }
  useEffect(() => { cargar(!soloEstado) }, [evc.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function cambiar(id, parche) {
    setAcciones((as) => as.map((a) => (a.id === id ? { ...a, ...parche } : a)))
    setCambiados((s) => new Set(s).add(id))
    setMensaje(''); setFalloAuto(false)
  }

  async function guardar() {
    const lista = acciones.filter((a) => cambiados.has(a.id))
    if (!lista.length) return
    setGuardando(true); setError(''); setMensaje('')
    try {
      for (let i = 0; i < lista.length; i += 20) {
        const res = await Promise.all(lista.slice(i, i + 20).map((a) => {
          const hecha = a.estado_accion === 'realizada'
          const ef = hecha && a.eficacia_estado === 'realizada'
          const cambios = {
            responsable: (a.responsable ?? '').trim() || null, coste: formatearCoste(a.coste), plazo: a.plazo || null,
            estado_accion: a.estado_accion, fecha_realizacion: hecha ? a.fecha_realizacion || null : null,
            eficacia_estado: hecha ? a.eficacia_estado : 'pendiente', fecha_eficacia: ef ? a.fecha_eficacia || null : null,
          }
          return supabase.from('pap_acciones').update(cambios).eq('id', a.id)
        }))
        const fallo = res.find((r) => r.error)
        if (fallo) throw fallo.error
      }
      setCambiados(new Set()); setMensaje('Plan guardado.')
    } catch (e) { setError(e.message) } finally { setGuardando(false) }
  }

  // Centro: cada cambio se guarda solo con la función segura del servidor.
  async function guardarAuto() {
    const lista = (ref.current ?? []).filter((a) => cambiados.has(a.id))
    if (!lista.length) return
    setGuardando(true); setError('')
    try {
      for (const a of lista) {
        const hecha = a.estado_accion === 'realizada'
        const { error: err } = await supabase.rpc('centro_actualizar_pap_accion', {
          p_id: a.id, p_estado: hecha ? 'realizada' : 'pendiente', p_fecha_realizacion: hecha ? a.fecha_realizacion || null : null,
        })
        if (err) throw err
      }
      setCambiados((prev) => {
        const n = new Set(prev)
        lista.forEach((a) => { if ((ref.current ?? []).find((x) => x.id === a.id) === a) n.delete(a.id) })
        return n
      })
      setMensaje('Guardado')
    } catch (e) { setError(e.message); setFalloAuto(true) } finally { setGuardando(false) }
  }
  useEffect(() => {
    if (!soloEstado || guardando || falloAuto || cambiados.size === 0) return undefined
    const t = setTimeout(guardarAuto, 600)
    return () => clearTimeout(t)
  }, [soloEstado, guardando, falloAuto, cambiados, acciones]) // eslint-disable-line react-hooks/exhaustive-deps

  const vigentes = useMemo(() => (acciones ?? []).filter((a) => a.vigente !== false), [acciones])
  const visibles = useMemo(() => {
    const q = sinAcentos(busca.trim())
    return vigentes.filter((a) => (!estado || a.estado_accion === estado) &&
      (!q || sinAcentos(`${a.medida} ${(a.puestos ?? []).map((p) => p.nombre).join(' ')} ${(a.riesgos ?? []).map((r) => `${r.id} ${r.nombre}`).join(' ')}`).includes(q)))
  }, [vigentes, busca, estado])
  const porVR = useMemo(() => {
    const m = {}
    visibles.forEach((a) => { (m[a.vr] = m[a.vr] || []).push(a) })
    return m
  }, [visibles])
  const r = resumenPAPCentro(acciones ?? [])
  const retiradas = (acciones ?? []).filter((a) => a.vigente === false)
  const doc = { fecha: evc.fecha, centro: evc.centro }

  async function bajarExcel() {
    try { descargar(await excelPAPCentro(doc, vigentes, totalPuestos), nombreArchivoPAPCentro(doc, 'xlsx')) } catch (e) { setError('No se pudo generar el Excel: ' + e.message) }
  }
  function verPDF() {
    try { imprimir(htmlPAPCentro(doc, vigentes, totalPuestos)) } catch (e) { setError(e.message) }
  }
  function volver() {
    if (!soloEstado && cambiados.size > 0 && !window.confirm('Hay cambios sin guardar en el plan. ¿Salir igualmente?')) return
    onVolver()
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Planificación Actividad Preventiva (PAP) del centro</h2>
      <p style={{ marginTop: 0 }}>
        <b>{evc.centro.codigo} · {evc.centro.nombre}</b> · evaluación del {fechaES(evc.fecha)} · {totalPuestos} puestos
      </p>
      <p style={{ fontSize: 14, opacity: 0.85, maxWidth: 820 }}>
        Cada medida sale una sola vez para todo el centro, aunque esté redactada de formas parecidas. Si aparece en varios
        puestos con prioridades distintas, se aplica la más alta, del lado de la seguridad, y se indica en qué puestos sería más baja.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        {soloEstado
          ? <span style={{ opacity: 0.8 }}>{guardando ? 'Guardando...' : cambiados.size > 0 && !falloAuto ? 'Guardando en un momento...' : 'Los cambios se guardan solos'}</span>
          : <button onClick={guardar} disabled={guardando || cambiados.size === 0} style={{ padding: '8px 16px', fontWeight: 600 }}>{guardando ? 'Guardando...' : 'Guardar plan'}</button>}
        {!soloEstado && <button className="secundario" onClick={bajarExcel} disabled={!vigentes.length}>Descargar Excel</button>}
        <button className="secundario" onClick={verPDF} disabled={!vigentes.length}>Generar PDF</button>
        {!soloEstado && <button className="secundario" onClick={() => { if (cambiados.size && !window.confirm('Se perderán los cambios sin guardar. ¿Seguir?')) return; setAcciones(null); cargar(true) }} disabled={guardando}>Actualizar con la evaluación</button>}
        <button className="secundario" onClick={volver} disabled={guardando}>Volver</button>
      </div>

      {acciones && (
        <p style={{ fontSize: 14 }}>
          <b>{r.total}</b> acciones · <b>{r.pendientes}</b> pendientes · <b>{r.unidas}</b> unen varios puestos · <b>{r.redacciones}</b> unen redacciones parecidas
          {r.conMenor > 0 && <> · <b>{r.conMenor}</b> con prioridad más baja en algún puesto</>}
          {r.sinMedida > 0 && <span style={{ color: '#b00020' }}> · <b>{r.sinMedida}</b> riesgos sin medidas: complétalos en la evaluación del puesto</span>}
        </p>
      )}
      {!soloEstado && cambiados.size > 0 && <p style={{ color: '#8a6d00' }}>Hay cambios sin guardar.</p>}
      {mensaje && <p style={{ color: '#2e7d32' }}>{mensaje}</p>}
      {error && <p style={aviso}>{error}</p>}
      {!acciones && <p>{soloEstado ? 'Cargando...' : 'Actualizando el plan con la evaluación...'}</p>}
      {acciones && vigentes.length === 0 && !error && <p className="vacio">No hay acciones: todavía no hay puestos evaluados con riesgos valorados.</p>}

      {vigentes.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '6px 0 12px' }}>
          <input type="search" placeholder="Buscar medida, puesto o riesgo" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: '1 1 260px', maxWidth: 420, padding: '7px 10px' }} />
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todas</option><option value="pendiente">Pendientes</option><option value="realizada">Realizadas</option>
          </select>
        </div>
      )}

      {Object.keys(ORDEN_VR).filter((k) => porVR[k]).map((vr) => {
        const pr = PRIORIDADES[vr]
        return (
          <section key={vr} style={{ marginBottom: 24 }}>
            <h3 style={{ borderLeft: `6px solid ${COLOR_VR[vr]}`, paddingLeft: 10, margin: '16px 0 4px' }}>
              Prioridad {pr.prioridad} · {vr} {pr.nombre} ({porVR[vr].length})
            </h3>
            <p style={{ margin: '0 0 10px', opacity: 0.8 }}>{pr.accion}</p>
            {porVR[vr].map((a) => (
              <TarjetaAccion key={a.id} f={a} fechaEval={evc.fecha} hoy={hoy} onCambio={cambiar} soloEstado={soloEstado}
                cabeza={<Cabeza a={a} totalPuestos={totalPuestos} />} />
            ))}
          </section>
        )
      })}

      {retiradas.length > 0 && (
        <details style={{ marginTop: 16 }}>
          <summary>Acciones realizadas que ya no salen en la evaluación ({retiradas.length})</summary>
          <ul>{retiradas.map((a) => <li key={a.id}>{a.medida} <small style={{ opacity: 0.7 }}>· realizada el {fechaES(a.fecha_realizacion)}</small></li>)}</ul>
        </details>
      )}
    </div>
  )
}

