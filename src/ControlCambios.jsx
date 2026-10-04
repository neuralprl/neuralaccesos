import { useEffect, useMemo, useState } from 'react'
import { htmlControlCambios, imprimir } from './documentos'
import { fechaES } from './planLogic'

// Control de cambios: cada evaluación de centro que se cierra queda registrada con su versión
// (1 la primera, 2 la siguiente...), el motivo y las fechas. Solo cuentan las evaluaciones cerradas.
// Uso: <ControlCambios supabase={supabase} />
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const sin = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const celda = { padding: 8, borderBottom: '1px solid #e5e5e5', verticalAlign: 'top' }

export default function ControlCambios({ supabase }) {
  const [regs, setRegs] = useState(null)
  const [busca, setBusca] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('control_cambios').select('*,centros(codigo,nombre)').order('fecha_cierre', { ascending: false }).limit(5000)
      .then(({ data, error: err }) => {
        if (err) { setError(/control_cambios/.test(err.message) ? 'Falta ampliar la base de datos: ejecuta migracion_cambios_equipos.sql en el SQL Editor de Supabase.' : err.message); setRegs([]) }
        else setRegs(data.map((r) => ({ ...r, centro: `${r.centros?.codigo ?? ''} · ${r.centros?.nombre ?? ''}` })))
      })
  }, [supabase])

  const vis = useMemo(() => {
    const q = sin(busca.trim())
    return (regs ?? []).filter((r) => !q || sin(`${r.centro} ${r.motivo}`).includes(q))
      .sort((a, b) => a.centro.localeCompare(b.centro, 'es') || b.version - a.version)
  }, [regs, busca])
  const centrosDistintos = new Set(vis.map((r) => r.centro_id)).size

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Control de Cambios</h2>
      <p style={{ opacity: 0.8, marginTop: 0, maxWidth: 820 }}>
        Cada evaluación de riesgos que se cierra queda registrada: la primera de un centro como versión 1 y cada nueva evaluación
        con la versión siguiente, el motivo por el que se hizo y las fechas de inicio y cierre.
      </p>
      {error && <p style={aviso}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <input type="search" placeholder="Buscar por centro o motivo" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ padding: '7px 10px', flex: '1 1 260px', maxWidth: 380 }} />
        <button className="secundario" disabled={!vis.length} onClick={() => imprimir(htmlControlCambios(centrosDistintos === 1 ? vis[0].centro : busca ? `Filtro: ${busca}` : 'Todos los centros', vis))}>Generar PDF</button>
      </div>
      {!regs && <p>Cargando...</p>}
      {regs && vis.length === 0 && !error && <p className="vacio">Todavía no hay evaluaciones cerradas.</p>}
      {vis.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th style={celda}>Centro</th><th style={celda}>Versión</th><th style={celda}>Motivo</th><th style={celda}>Inicio</th><th style={celda}>Cierre</th><th style={celda}>Metodología</th><th style={celda}>Puestos</th>
            </tr></thead>
            <tbody>
              {vis.map((r) => (
                <tr key={r.id}>
                  <td style={celda}>{r.centro}</td>
                  <td style={{ ...celda, fontWeight: 700, textAlign: 'center' }}>{r.version}</td>
                  <td style={celda}>{r.motivo}</td>
                  <td style={{ ...celda, whiteSpace: 'nowrap' }}>{fechaES(r.fecha_inicio)}</td>
                  <td style={{ ...celda, whiteSpace: 'nowrap' }}>{fechaES(r.fecha_cierre)}</td>
                  <td style={celda}>{r.version_metodologia ?? ''}</td>
                  <td style={{ ...celda, textAlign: 'center' }}>{r.puestos ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
