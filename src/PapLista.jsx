import { useEffect, useMemo, useState } from 'react'
import PapCentro from './PapCentro'
import { accionesPAPCentro, hoyISO, resumen } from './panelLogic'
import { fechaES } from './planLogic'
import { leerAccionesPAP } from './papCentroDatos'

// PAP fuera de la evaluación: un plan por evaluación de centro, con sus acciones pendientes y plazos.
// Técnico: <PapLista supabase={supabase} />    Centro: <PapLista supabase={supabase} soloEstado inicial={idEvaluacionCentro} />
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const quitar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function PapLista({ supabase, soloEstado = false, inicial = null }) {
  const [evcs, setEvcs] = useState(null)
  const [acciones, setAcciones] = useState([])
  const [abierta, setAbierta] = useState(null)
  const [busca, setBusca] = useState('')
  const [error, setError] = useState('')

  async function cargar() {
    try {
      const { data, error: err } = await supabase.from('evaluaciones_centro').select('id,fecha,estado,centros(id,codigo,nombre)').order('fecha', { ascending: false })
      if (err) throw err
      const e = data.map((x) => ({ id: x.id, fecha: x.fecha, estado: x.estado, centro: x.centros }))
      setEvcs(e)
      setAcciones(await leerAccionesPAP(supabase, e.map((x) => x.id)))
      if (inicial) setAbierta(e.find((x) => x.id === inicial) ?? null)
    } catch (err) { setError(err.message); setEvcs((x) => x ?? []) }
  }
  useEffect(() => { cargar() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const hoy = hoyISO()
  const cuentas = useMemo(() => {
    const acc = accionesPAPCentro(acciones, evcs ?? [], hoy)
    const m = {}
    ;(evcs ?? []).forEach((e) => {
      m[e.id] = { ...resumen(acc.filter((a) => a.evaluacion_centro_id === e.id)), creado: acciones.some((a) => a.evaluacion_centro_id === e.id) }
    })
    return m
  }, [acciones, evcs, hoy])

  const lista = useMemo(() => {
    const q = quitar(busca.trim())
    return (evcs ?? []).filter((e) => !q || quitar(`${e.centro?.codigo} ${e.centro?.nombre}`).includes(q))
  }, [evcs, busca])

  if (abierta) return <PapCentro supabase={supabase} evc={abierta} soloEstado={soloEstado} onVolver={() => { setAbierta(null); cargar() }} />

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Planificación Actividad Preventiva (PAP)</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Un plan por centro, con las medidas de todos sus puestos sin repetir, y sus plazos.</p>
      {error && <p style={aviso}>{error}</p>}
      <input type="search" placeholder="Buscar por centro" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ padding: '7px 10px', margin: '0 0 12px', width: '100%', maxWidth: 360, boxSizing: 'border-box' }} />
      {!evcs && <p>Cargando...</p>}
      {evcs && lista.length === 0 && !error && <p className="vacio">No hay evaluaciones de centro.</p>}
      {lista.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: 8 }}>Evaluación</th><th style={{ padding: 8 }}>Centro</th>
                <th style={{ padding: 8 }}>Pendientes con plazo</th><th style={{ padding: 8 }}>Vencidas</th><th style={{ padding: 8 }}>Próximos 7 días</th><th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {lista.map((e) => {
                const r = cuentas[e.id] ?? { total: 0, vencidas: 0, hoy: 0, manana: 0, semana: 0, creado: false }
                const prox = r.hoy + r.manana + r.semana
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: 8, whiteSpace: 'nowrap' }}>{fechaES(e.fecha)} · {e.estado === 'cerrada' ? 'cerrada' : 'en curso'}</td>
                    <td style={{ padding: 8 }}>{e.centro?.codigo} · {e.centro?.nombre}</td>
                    {r.creado ? (
                      <>
                        <td style={{ padding: 8 }}>{r.total}</td>
                        <td style={{ padding: 8, color: r.vencidas ? '#c62828' : undefined, fontWeight: r.vencidas ? 700 : 400 }}>{r.vencidas}</td>
                        <td style={{ padding: 8, color: prox ? '#b8860b' : undefined, fontWeight: prox ? 700 : 400 }}>{prox}</td>
                      </>
                    ) : <td colSpan={3} style={{ padding: 8, opacity: 0.7 }}>{soloEstado ? 'Plan todavía sin preparar' : 'Sin generar: se prepara al abrirlo'}</td>}
                    <td style={{ padding: 8 }}><button className="secundario" onClick={() => setAbierta(e)}>Abrir</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
