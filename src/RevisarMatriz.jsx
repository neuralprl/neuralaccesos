import { useEffect, useMemo, useState } from 'react'
import { COLOR_VR, ETIQUETA_VR, vrDe } from './evalLogic'
import { filasEvaluacionAfectadas, gruposRevision, masFrecuente } from './matrizLogic'
import { leerTodo } from './supabaseUtil'

// Revisar valoraciones de la matriz: casos iguales (mismo riesgo y situación, o mismo riesgo y medida)
// que tienen valoraciones distintas según el puesto. Se propone la más alta y se aplica a todas sus filas.
// Uso: <RevisarMatriz supabase={supabase} onVolver={() => ...} />

const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const celda = { padding: '5px 8px', borderBottom: '1px solid #ececec', verticalAlign: 'top', fontSize: 14 }
const OPC_P = [['B', 'Baja'], ['M', 'Media'], ['A', 'Alta']]
const OPC_C = [['LD', 'Ligeramente dañina'], ['D', 'Dañina'], ['ED', 'Extremadamente dañina']]
const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

function VR({ p, c }) {
  const vr = vrDe(p, c)
  return (
    <span title={vr ? ETIQUETA_VR[vr] : ''} style={{ display: 'inline-block', minWidth: 34, textAlign: 'center', padding: '1px 8px', borderRadius: 12, fontWeight: 700, fontSize: 13, color: '#fff', background: vr ? COLOR_VR[vr] : '#9e9e9e' }}>
      {vr ?? '—'}
    </span>
  )
}

export default function RevisarMatriz({ supabase, onVolver }) {
  const [filas, setFilas] = useState(null)
  const [eleccion, setEleccion] = useState({})
  const [hechos, setHechos] = useState([])
  const [ignorados, setIgnorados] = useState(() => new Set())
  const [enCurso, setEnCurso] = useState(true)
  const [tipo, setTipo] = useState('')
  const [busca, setBusca] = useState('')
  const [trabajando, setTrabajando] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    leerTodo(() => supabase.from('matriz_puestos')
      .select('id,puesto_id,riesgo_id,condicion,p,c,riesgos(nombre),puestos(nombre),matriz_medidas(medidas(texto))').order('id'))
      .then((data) => setFilas(data.map((r) => ({
        id: r.id, puesto_id: r.puesto_id, puesto: r.puestos?.nombre ?? '', riesgo_id: r.riesgo_id, riesgo_nombre: r.riesgos?.nombre ?? '',
        condicion: r.condicion ?? '', p: r.p, c: r.c, medidas: (r.matriz_medidas ?? []).map((m) => m.medidas?.texto).filter(Boolean),
      }))))
      .catch((e) => { setError(e.message); setFilas([]) })
  }, [supabase])

  const grupos = useMemo(() => (filas ? gruposRevision(filas) : []), [filas])
  const visibles = useMemo(() => {
    const q = sinAcentos(busca.trim())
    return grupos.filter((g) => !ignorados.has(g.clave) && (!tipo || g.tipo === tipo) &&
      (!q || sinAcentos(`${g.riesgo_id} ${g.riesgo_nombre} ${g.titulo} ${g.filas.map((f) => `${f.puesto} ${f.condicion}`).join(' ')}`).includes(q)))
  }, [grupos, ignorados, tipo, busca])

  const valorDe = (g) => eleccion[g.clave] ?? g.propuesta

  async function aplicar(g) {
    const { p, c } = valorDe(g)
    setTrabajando(g.clave); setError('')
    try {
      const ids = g.filas.map((f) => f.id)
      for (let i = 0; i < ids.length; i += 200) {
        const { error: err } = await supabase.from('matriz_puestos').update({ p, c }).in('id', ids.slice(i, i + 200))
        if (err) throw err
      }
      let nEval = 0
      if (enCurso) {
        const { data: evs, error: e1 } = await supabase.from('evaluaciones').select('id,puesto_id').eq('estado', 'borrador')
        if (e1) throw e1
        if (evs.length) {
          const puestoDe = new Map(evs.map((e) => [e.id, e.puesto_id]))
          const evIds = evs.map((e) => e.id)
          const filasEv = []
          for (let i = 0; i < evIds.length; i += 100) {
            const trozo = evIds.slice(i, i + 100)
            filasEv.push(...await leerTodo(() => supabase.from('evaluacion_riesgos').select('id,evaluacion_id,riesgo_id,condicion,origen')
              .in('evaluacion_id', trozo).eq('riesgo_id', g.riesgo_id).order('id')))
          }
          const afect = filasEvaluacionAfectadas(g.filas, filasEv, puestoDe).map((r) => r.id)
          for (let i = 0; i < afect.length; i += 200) {
            const { error: e2 } = await supabase.from('evaluacion_riesgos').update({ p, c }).in('id', afect.slice(i, i + 200))
            if (e2) throw e2
          }
          nEval = afect.length
        }
      }
      setHechos((h) => [...h, `${g.riesgo_id} · ${g.titulo.slice(0, 90)}: ${p}·${c} en ${ids.length} filas de la matriz${enCurso ? ` y en ${nEval} riesgos de evaluaciones en curso` : ''}.`])
      setFilas((fs) => fs.map((f) => (ids.includes(f.id) ? { ...f, p, c } : f)))
    } catch (e) { setError(e.message) } finally { setTrabajando('') }
  }

  const nSit = grupos.filter((g) => g.tipo === 'situacion' && !ignorados.has(g.clave)).length
  const nMed = grupos.filter((g) => g.tipo === 'medida' && !ignorados.has(g.clave)).length

  return (
    <div style={{ textAlign: 'left', maxWidth: 1000 }}>
      <h2>Revisar valoraciones de la matriz</h2>
      <p style={{ maxWidth: 820 }}>
        Casos iguales que tienen valoraciones distintas según el puesto: el mismo riesgo con la misma situación de exposición,
        o el mismo riesgo con la misma medida (o una parecida) en situaciones distintas. Se propone la valoración más alta,
        del lado de la seguridad; puedes cambiarla antes de aplicarla. Si una diferencia es un ajuste del puesto justificado
        en su documento de evaluación, pulsa «Dejar como está».
      </p>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}>
        <input type="checkbox" checked={enCurso} onChange={(e) => setEnCurso(e.target.checked)} style={{ width: 'auto' }} />
        Aplicar también a las evaluaciones en curso (los puestos ya marcados como evaluados no se tocan: reábrelos si quieres cambiarlos)
      </label>

      {error && <p style={aviso}>{error}</p>}
      {!filas && <p>Cargando la matriz...</p>}
      {filas && (
        <p style={{ fontSize: 14 }}>
          <b>{filas.length}</b> filas en la matriz · <b>{nSit}</b> casos con la misma situación y distinta valoración ·{' '}
          <b>{nMed}</b> con la misma medida y distinto nivel
        </p>
      )}

      {hechos.length > 0 && (
        <details open style={{ background: '#e8f5e9', padding: 10, borderRadius: 6, marginBottom: 10 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Corregidos en esta sesión ({hechos.length})</summary>
          <ul style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: 14 }}>{hechos.map((h, i) => <li key={i}>{h}</li>)}</ul>
        </details>
      )}
      {grupos.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '6px 0 14px' }}>
          <input type="search" placeholder="Buscar riesgo, situación, medida o puesto" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: '1 1 280px', maxWidth: 440, padding: '7px 10px' }} />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos los casos</option>
            <option value="situacion">Misma situación</option>
            <option value="medida">Misma medida</option>
          </select>
        </div>
      )}
      {filas && grupos.length === 0 && !error && <p className="vacio">No hay casos iguales con valoraciones distintas.</p>}

      {visibles.map((g) => {
        const v = valorDe(g)
        const frec = masFrecuente(g.filas)
        return (
          <section key={g.clave} style={{ border: '1px solid #d9dfe3', borderRadius: 10, padding: 12, marginBottom: 12, background: '#fff' }}>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              {g.riesgo_id} · {g.riesgo_nombre} · {g.tipo === 'situacion' ? 'misma situación' : 'misma medida en situaciones distintas'} · {g.filas.length} filas
            </div>
            <strong>{g.titulo}</strong>
            <div style={{ overflowX: 'auto', margin: '8px 0' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead><tr style={{ textAlign: 'left' }}>
                  <th style={celda}>Puesto</th>{g.tipo === 'medida' && <th style={celda}>Situación</th>}<th style={celda}>P·C</th><th style={celda}>Nivel</th>
                </tr></thead>
                <tbody>
                  {[...g.filas].sort((a, b) => a.puesto.localeCompare(b.puesto, 'es')).map((f) => (
                    <tr key={f.id}>
                      <td style={celda}>{f.puesto}</td>
                      {g.tipo === 'medida' && <td style={celda}>{f.condicion}</td>}
                      <td style={celda}>{f.p}·{f.c}</td>
                      <td style={celda}><VR p={f.p} c={f.c} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span>Valoración para todas:</span>
                <select value={v.p} onChange={(e) => setEleccion({ ...eleccion, [g.clave]: { ...v, p: e.target.value } })} aria-label="Probabilidad">
                  {OPC_P.map(([k, t]) => <option key={k} value={k}>P {k} · {t}</option>)}
                </select>
                <select value={v.c} onChange={(e) => setEleccion({ ...eleccion, [g.clave]: { ...v, c: e.target.value } })} aria-label="Consecuencias">
                  {OPC_C.map(([k, t]) => <option key={k} value={k}>C {k} · {t}</option>)}
                </select>
                <VR p={v.p} c={v.c} />
                {(frec.p !== v.p || frec.c !== v.c) && (
                  <button type="button" className="secundario" onClick={() => setEleccion({ ...eleccion, [g.clave]: frec })}>Usar la más repetida ({frec.p}·{frec.c})</button>
                )}
                <button onClick={() => aplicar(g)} disabled={!!trabajando} style={{ fontWeight: 600 }}>
                  {trabajando === g.clave ? 'Aplicando...' : `Aplicar a las ${g.filas.length} filas`}
                </button>
                <button className="secundario" onClick={() => setIgnorados((s) => new Set(s).add(g.clave))} disabled={!!trabajando}>Dejar como está</button>
              </div>
            )}
          </section>
        )
      })}

      <p><button className="secundario" onClick={onVolver}>Volver a Actualizar</button></p>
    </div>
  )
}
