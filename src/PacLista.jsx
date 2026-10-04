import { useEffect, useMemo, useState } from 'react'
import { VisitaPac } from './Pac'
import { accionesPAC, hoyISO, resumen } from './panelLogic'
import { fechaES } from './planLogic'
import { leerTodo } from './supabaseUtil'

// Apartado 4: Planificación de la Acción Correctiva. Visitas con sus incidencias pendientes y plazos.
// El resultado de la evaluación del lugar de trabajo (apartado 16) llega aquí.
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }

export default function PacLista({ supabase }) {
  const [visitas, setVisitas] = useState(null)
  const [resp, setResp] = useState([])
  const [items, setItems] = useState([])
  const [abierta, setAbierta] = useState(null)
  const [error, setError] = useState('')

  async function cargar() {
    try {
      const v = await leerTodo(() => supabase.from('pac_visitas').select('id,fecha,estado,centro_id,centros(codigo,nombre)').order('fecha', { ascending: false }).order('id'))
      const r = await leerTodo(() => supabase.from('pac_respuestas').select('visita_id,item_id,resultado,prioridad,responsable,plazo,estado_accion').eq('resultado', 'no_cumple').order('visita_id').order('item_id'))
      const it = await leerTodo(() => supabase.from('pac_items').select('id,bloque,punto').order('id'))
      setVisitas(v); setResp(r); setItems(it); setError('')
    } catch (err) {
      setError(/pac_|estado/.test(err.message) ? 'Falta ampliar la base de datos: ejecuta migracion_pac.sql en el SQL Editor de Supabase.' : err.message)
      setVisitas([])
    }
  }
  useEffect(() => { cargar() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const hoy = hoyISO()
  const cuentas = useMemo(() => {
    const acc = accionesPAC(resp, items, visitas ?? [], hoy)
    const m = {}
    ;(visitas ?? []).forEach((v) => {
      const mias = acc.filter((a) => a.visita_id === v.id)
      m[v.id] = { ...resumen(mias), incidencias: resp.filter((x) => x.visita_id === v.id).length }
    })
    return m
  }, [visitas, resp, items, hoy])

  if (abierta) return <VisitaPac supabase={supabase} visitaId={abierta} onVolver={() => { setAbierta(null); cargar() }} />

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Planificación Acción Correctiva (PAC)</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Incidencias detectadas en las evaluaciones del lugar de trabajo, con sus plazos. Para hacer una evaluación nueva, ve a «Evaluación de lugar de trabajo».</p>
      {error && <p style={aviso}>{error}</p>}
      {!visitas && <p>Cargando...</p>}
      {visitas && visitas.length === 0 && !error && <p className="vacio">Todavía no hay evaluaciones del lugar de trabajo.</p>}
      {visitas && visitas.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: 8 }}>Fecha</th><th style={{ padding: 8 }}>Centro</th><th style={{ padding: 8 }}>Incidencias</th>
                <th style={{ padding: 8 }}>Pendientes</th><th style={{ padding: 8 }}>Vencidas</th><th style={{ padding: 8 }}>Próximos 7 días</th><th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {visitas.map((v) => {
                const r = cuentas[v.id] ?? { incidencias: 0, total: 0, vencidas: 0, hoy: 0, manana: 0, semana: 0 }
                const prox = r.hoy + r.manana + r.semana
                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: 8, whiteSpace: 'nowrap' }}>{fechaES(v.fecha)}</td>
                    <td style={{ padding: 8 }}>{v.centros?.codigo} · {v.centros?.nombre}</td>
                    <td style={{ padding: 8 }}>{r.incidencias}</td>
                    <td style={{ padding: 8 }}>{r.total}</td>
                    <td style={{ padding: 8, color: r.vencidas ? '#c62828' : undefined, fontWeight: r.vencidas ? 700 : 400 }}>{r.vencidas}</td>
                    <td style={{ padding: 8, color: prox ? '#b8860b' : undefined, fontWeight: prox ? 700 : 400 }}>{prox}</td>
                    <td style={{ padding: 8 }}><button className="secundario" onClick={() => setAbierta(v.id)}>Abrir</button></td>
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
