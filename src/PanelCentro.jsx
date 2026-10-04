import { useEffect, useMemo, useState } from 'react'
import {
  COLOR_NIVEL, accionesPAC, accionesPAPCentro, avisosDePanel, filtrarAcciones, hoyISO, ordenar, resumen, textoPlazo,
} from './panelLogic'
import { avisosDe } from './agresionesLogic'
import { fechaES } from './planLogic'
import { leerTodo } from './supabaseUtil'

// Panel del usuario de centro: lo primero que ve al entrar.
// Props: supabase, evals (evaluaciones del usuario: {id, fecha, centro, puesto}), onIr(seccion, id)
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const FONDO_NIVEL = { vencida: '#fdecea', hoy: '#fde9c4', manana: '#fde9c4', semana: '#fff8e1', proxima: '#e8f5e9', sinplazo: '#eceff1' }

function Tarjeta({ valor, titulo, color, nota, onClick, activa }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        textAlign: 'left', border: `1px solid ${activa ? color : '#d9d9d9'}`, borderLeft: `6px solid ${color}`, borderRadius: 8, padding: '8px 14px',
        minWidth: 150, background: activa ? '#f3f6fb' : '#fff', cursor: onClick ? 'pointer' : 'default', color: 'inherit', boxShadow: 'none', font: 'inherit',
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{valor}</div>
      <div style={{ fontSize: 13 }}>{titulo}</div>
      {nota && <div style={{ fontSize: 12, opacity: 0.65 }}>{nota}</div>}
    </button>
  )
}

export default function PanelCentro({ supabase, evals, onIr }) {
  const [acciones, setAcciones] = useState(null)
  const [agresiones, setAgresiones] = useState(0)
  const [filtro, setFiltro] = useState({ origen: '', soloUrgentes: false })
  const [error, setError] = useState('')
  const hoy = hoyISO()

  const centros = useMemo(() => [...new Map(evals.map((e) => [e.centro?.id, e.centro])).values()].filter(Boolean), [evals])

  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const centroIds = centros.map((c) => c.id)
        // PAP del centro: acciones unificadas de las evaluaciones de centro a las que pertenecen sus puestos.
        const evcs = [...new Map(evals.filter((e) => e.evaluacion_centro_id)
          .map((e) => [e.evaluacion_centro_id, { id: e.evaluacion_centro_id, centro: e.centro }])).values()]
        let pap = []
        if (evcs.length) {
          const acc = await leerTodo(() => supabase.from('pap_acciones').select('id,evaluacion_centro_id,medida,vr,riesgos,puestos,vigente,plazo,estado_accion,responsable')
            .in('evaluacion_centro_id', evcs.map((e) => e.id)).order('id')).catch(() => [])   // si la tabla aún no existe, se ignora
          pap = accionesPAPCentro(acc, evcs, hoy)
        }

        let pac = []
        if (centroIds.length) {
          const v = await supabase.from('pac_visitas').select('id,fecha,centro_id,centros(nombre)').in('centro_id', centroIds)
          if (!v.error && v.data.length) {
            const [r, it] = await Promise.all([
              supabase.from('pac_respuestas').select('visita_id,item_id,resultado,prioridad,responsable,plazo,estado_accion').in('visita_id', v.data.map((x) => x.id)).eq('resultado', 'no_cumple'),
              supabase.from('pac_items').select('id,bloque,punto'),
            ])
            if (!r.error && !it.error) pac = accionesPAC(r.data, it.data, v.data, hoy)
          }
        }

        let nAgr = 0
        if (centroIds.length) {
          const a = await supabase.from('agresiones').select('*').in('centro_id', centroIds)     // si la tabla aún no existe, se ignora
          if (!a.error) nAgr = a.data.filter((x) => avisosDe(x, hoy).length > 0).length
        }
        if (vivo) { setAcciones(ordenar([...pap, ...pac])); setAgresiones(nAgr) }
      } catch (err) { if (vivo) { setError(err.message); setAcciones([]) } }
    })()
    return () => { vivo = false }
  }, [supabase, evals, centros, hoy])

  return <PanelVista centros={centros} acciones={acciones} agresiones={agresiones} filtro={filtro} setFiltro={setFiltro} error={error} onIr={onIr} hoy={hoy} />
}

// Vista del panel (sin acceso a datos): recibe las acciones ya calculadas.
export function PanelVista({ centros, acciones, agresiones, filtro, setFiltro, error, onIr, hoy }) {
  const todas = acciones ?? []
  const r = useMemo(() => resumen(todas), [todas])
  const avisos = useMemo(() => avisosDePanel(todas), [todas])
  const visibles = useMemo(() => filtrarAcciones(todas, filtro), [todas, filtro])
  const chip = (texto, activo, f) => (
    <button key={texto} type="button" className="secundario" onClick={() => setFiltro(f)}
      style={activo ? { fontWeight: 700, textDecoration: 'underline' } : undefined}>{texto}</button>
  )

  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ marginBottom: 2 }}>Panel</h2>
      <p style={{ marginTop: 0, opacity: 0.75 }}>
        {centros.map((c) => `${c.codigo} · ${c.nombre}`).join(' | ')} · hoy, {fechaES(hoy)}
      </p>
      {error && <p style={aviso}>{error}</p>}
      {!acciones && !error && <p>Cargando...</p>}

      {acciones && (
        <>
          {avisos.length > 0 ? (
            <div role="alert" style={{ border: '2px solid #d9600a', borderRadius: 10, padding: '10px 14px', margin: '8px 0 14px', background: '#fff8f0' }}>
              <strong>Tienes avisos:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                {avisos.map((a) => <li key={a.nivel} style={{ color: COLOR_NIVEL[a.nivel], fontWeight: 700 }}>{a.texto}</li>)}
              </ul>
            </div>
          ) : (
            <p style={{ background: '#e8f5e9', color: '#1b5e20', padding: '10px 14px', borderRadius: 8 }}>
              {r.total ? 'No tienes acciones vencidas ni que venzan en los próximos 7 días.' : 'No tienes acciones pendientes.'}
            </p>
          )}
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 0 }}>
            Se avisa de las acciones que vencen en los próximos 7 días, mañana y hoy, y de las que ya han vencido.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0' }}>
            <Tarjeta valor={r.total} titulo="Acciones pendientes" color="#1f3864" nota={`${r.pap} del PAP · ${r.pac} del PAC`} onClick={() => setFiltro({ origen: '', soloUrgentes: false })} activa={!filtro.origen && !filtro.soloUrgentes} />
            <Tarjeta valor={r.vencidas} titulo="Vencidas" color="#c62828" onClick={() => setFiltro({ origen: '', soloUrgentes: true })} />
            <Tarjeta valor={r.hoy + r.manana} titulo="Vencen hoy o mañana" color="#d9600a" onClick={() => setFiltro({ origen: '', soloUrgentes: true })} />
            <Tarjeta valor={r.semana} titulo="Vencen en 2 a 7 días" color="#b8860b" onClick={() => setFiltro({ origen: '', soloUrgentes: true })} />
            <Tarjeta valor={agresiones} titulo="Agresiones con seguimiento" color={agresiones ? '#c62828' : '#2e7d32'} nota="Lesión sin parte, sin comunicar o abiertas" onClick={() => onIr('agresiones')} />
          </div>

          <h3 style={{ margin: '18px 0 6px' }}>Lo que tienes que cerrar</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {chip('Todas', !filtro.origen && !filtro.soloUrgentes, { origen: '', soloUrgentes: false })}
            {chip('Urgentes (vencidas y próximos 7 días)', filtro.soloUrgentes, { origen: '', soloUrgentes: true })}
            {chip('Plan de acción (PAP)', filtro.origen === 'PAP', { origen: 'PAP', soloUrgentes: false })}
            {chip('Visitas (PAC)', filtro.origen === 'PAC', { origen: 'PAC', soloUrgentes: false })}
          </div>

          {visibles.length === 0 && <p className="vacio">No hay acciones con este filtro.</p>}
          {visibles.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                    <th style={{ padding: 8 }}>Plazo</th><th style={{ padding: 8 }}>Aviso</th><th style={{ padding: 8 }}>Origen</th>
                    <th style={{ padding: 8 }}>Dónde</th><th style={{ padding: 8 }}>Qué hay que cerrar</th><th style={{ padding: 8 }}>Responsable</th><th style={{ padding: 8 }} />
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((a) => (
                    <tr key={`${a.origen}-${a.id}`} style={{ borderBottom: '1px solid #e5e5e5', verticalAlign: 'top', background: ['vencida', 'hoy', 'manana'].includes(a.nivel) ? FONDO_NIVEL[a.nivel] : undefined }}>
                      <td style={{ padding: 8, whiteSpace: 'nowrap', fontWeight: 600 }}>{fechaES(a.plazo)}</td>
                      <td style={{ padding: 8, whiteSpace: 'nowrap', color: COLOR_NIVEL[a.nivel], fontWeight: 700 }}>{textoPlazo(a.dias)}</td>
                      <td style={{ padding: 8 }}>{a.origen}</td>
                      <td style={{ padding: 8 }}>{a.donde}{centros.length > 1 && a.centro ? <><br /><small style={{ opacity: 0.65 }}>{a.centro}</small></> : null}</td>
                      <td style={{ padding: 8 }}>
                        <strong>{a.que}</strong>
                        {a.detalle && <div style={{ opacity: 0.85 }}>{a.detalle.length > 160 ? `${a.detalle.slice(0, 160)}…` : a.detalle}</div>}
                      </td>
                      <td style={{ padding: 8 }}>{a.responsable}</td>
                      <td style={{ padding: 8 }}>
                        <button className="secundario" onClick={() => onIr(a.origen === 'PAP' ? 'pap' : 'pac', a.origen === 'PAP' ? a.evaluacion_centro_id : a.centro_id)}>Abrir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
