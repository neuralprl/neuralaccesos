import { useEffect, useMemo, useState } from 'react'
import AccesoEvaluacion from './AccesoEvaluacion'
import {
  COLOR_ESTADO_PUESTO, ESTADOS_PUESTO, guardarCheck, problemasCierre, progresoCentro, respuestasDesdeCheck,
} from './evalCentroLogic'

// Pantallas de la evaluación del centro. La lógica de datos está en Evaluaciones.jsx.

const campo = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, fontSize: 14, textAlign: 'left' }
const ancho = { width: '100%', boxSizing: 'border-box' }
const filaCheck = {
  display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  gap: 12, width: '100%', textAlign: 'left', fontSize: 14, cursor: 'pointer',
}
const casilla = { width: 'auto', flex: 'none', margin: 0 }
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const celda = { padding: 8, borderBottom: '1px solid #e5e5e5', verticalAlign: 'top' }

export function Etiqueta({ estado }) {
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', background: COLOR_ESTADO_PUESTO[estado] ?? '#757575' }}>
      {ESTADOS_PUESTO[estado] ?? estado}
    </span>
  )
}

export function BarraProgreso({ evals }) {
  const p = progresoCentro(evals)
  const pct = p.total ? Math.round((p.hechos / p.total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
      <div style={{ flex: 1, height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }} aria-hidden="true">
        <div style={{ width: `${pct}%`, height: '100%', background: p.completo ? '#2e7d32' : '#1f3864' }} />
      </div>
      <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{p.hechos} de {p.total} puestos</span>
    </div>
  )
}

// ---------------------------------------------------------------------
// Paso 1: elegir el centro.
export function NuevaEvaluacionCentro({ supabase, enCurso, yaEvaluados = new Set(), onContinuar, onVolver, trabajando }) {
  const [centros, setCentros] = useState([])
  const [motivo, setMotivo] = useState('')
  const [copiar, setCopiar] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [centroId, setCentroId] = useState('')
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
  const abierta = enCurso[centroId]
  const pideMotivo = !!centroId && !abierta && yaEvaluados.has(centroId)

  return (
    <div style={{ maxWidth: 560, textAlign: 'left' }}>
      <h2>Nueva evaluación de centro</h2>
      <p style={{ opacity: 0.7 }}>Se evalúan todos los puestos marcados en el centro. Después de elegirlo, responderás la lista de comprobación una sola vez para todo el centro.</p>
      {error && <p style={aviso}>{error}</p>}
      {centros.length === 0 && !error && <p className="vacio">Primero hay que crear algún centro.</p>}

      <label style={campo}>
        <span>Centro</span>
        <input style={ancho} placeholder="Buscar por código o nombre" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      </label>
      <div role="listbox" aria-label="Centros"
        style={{ ...ancho, marginTop: 6, maxHeight: 260, overflowY: 'auto', border: '1px solid #bbb', borderRadius: 6, background: '#fff' }}>
        {visibles.length === 0 && <div style={{ padding: 8, opacity: 0.7 }}>Ningún centro coincide.</div>}
        {visibles.map((c) => {
          const activo = c.id === centroId
          return (
            <div key={c.id} role="option" aria-selected={activo} tabIndex={0}
              onClick={() => setCentroId(c.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCentroId(c.id) } }}
              style={{ padding: '7px 10px', cursor: 'pointer', background: activo ? '#cfe0e0' : 'transparent', fontWeight: activo ? 700 : 400 }}>
              {c.codigo} · {c.nombre}{enCurso[c.id] ? ' (tiene una evaluación en curso)' : yaEvaluados.has(c.id) ? ' (ya evaluado)' : ''}
            </div>
          )
        })}
      </div>
      {abierta && <p style={{ color: '#8a6d00' }}>Este centro ya tiene una evaluación en curso. Al continuar se abrirá esa.</p>}
      {pideMotivo && (
        <label style={{ ...campo, marginTop: 12 }}>
          <span><b>Motivo de la nueva evaluación</b> (queda en el control de cambios)</span>
          <textarea style={ancho} rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)}
            placeholder="Por ejemplo: revisión anual, cambio de instalaciones, nuevo puesto, daños a la salud detectados, embarazo comunicado..." />
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '4px 0' }}>
            <input type="checkbox" checked={copiar} onChange={(e) => setCopiar(e.target.checked)} style={{ width: 'auto' }} />
            Partir de la última evaluación cerrada del centro (riesgos, datos de exposición, lista de comprobación y PAP)
          </label>
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Revisión periódica', 'Cambio en las condiciones de trabajo', 'Nuevos equipos o instalaciones', 'Nuevo puesto de trabajo', 'Daños a la salud detectados', 'Requerimiento de la Inspección'].map((t) => (
              <button key={t} type="button" className="secundario" style={{ fontSize: 12, padding: '3px 8px' }} onClick={() => setMotivo(t)}>{t}</button>
            ))}
          </span>
        </label>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={() => onContinuar(centros.find((c) => c.id === centroId), motivo, copiar)} disabled={!centroId || trabajando || (pideMotivo && !motivo.trim())} style={{ padding: '10px 18px', fontWeight: 600 }}>
          {trabajando ? 'Preparando...' : abierta ? 'Abrir la evaluación en curso' : 'Crear evaluación del centro'}
        </button>
        <button className="secundario" onClick={onVolver} disabled={trabajando}>Cancelar</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Panel de la evaluación del centro: check, puestos y cierre.
export function ResumenEvaluacionCentro({
  supabase, evc, evals, faltan, mensaje, error, trabajando, mostrarCierre = true, mostrarAcceso = true,
  onCheck, onEvaluar, onNoAplica, onPendiente, onAnadirFaltan, onCerrar, onReabrir, onVolver, onPap, onERE,
}) {
  const [motivo, setMotivo] = useState({ id: null, texto: '' })
  const prog = progresoCentro(evals)
  const problemas = problemasCierre(evc, evals)
  const cerrada = evc.estado === 'cerrada'
  const nCheck = (evc.check_respuestas ?? []).length
  const ordenados = [...evals].sort((a, b) => (a.puestos?.nombre ?? '').localeCompare(b.puestos?.nombre ?? '', 'es'))

  return (
    <div style={{ textAlign: 'left', maxWidth: 980 }}>
      <h2>Evaluación de riesgos del centro</h2>
      <p style={{ marginTop: 0 }}>
        <b>{evc.centros.codigo} · {evc.centros.nombre}</b><br />
        Iniciada el {evc.fecha}{evc.version_metodologia ? ` · metodología ${evc.version_metodologia}` : ''} ·{' '}
        <b>{cerrada ? `Cerrada el ${evc.fecha_cierre ?? ''}` : 'En curso'}</b>
        {evc.motivo && <><br />Motivo: {evc.motivo}</>}
      </p>
      <div style={{ maxWidth: 420, margin: '8px 0 14px' }}><BarraProgreso evals={evals} /></div>

      {mensaje && <p style={{ color: '#1b5e20', background: '#e8f5e9', padding: 10, borderRadius: 6 }}>{mensaje}</p>}
      {error && <p style={aviso}>{error}</p>}

      <section style={{ border: '1px solid #d9dfe3', borderRadius: 10, padding: '10px 14px', margin: '0 0 14px', background: evc.check_hecho ? '#f6f8f9' : '#fff8e1' }}>
        <b>Lista de comprobación del centro</b>
        <p style={{ margin: '4px 0 8px', fontSize: 14 }}>
          {evc.check_hecho
            ? `Respondida: ${nCheck} ${nCheck === 1 ? 'riesgo añadido' : 'riesgos añadidos'}, cada uno a los puestos que marcaste.`
            : 'Sin responder. Hay que responderla antes de empezar a evaluar los puestos.'}
        </p>
        <button className={evc.check_hecho ? 'secundario' : undefined} onClick={onCheck} disabled={trabajando || cerrada}>
          {evc.check_hecho ? 'Revisar la lista de comprobación' : 'Responder la lista de comprobación'}
        </button>
      </section>

      {faltan.length > 0 && !cerrada && (
        <p style={{ background: '#fde9c4', color: '#7a4b00', padding: 10, borderRadius: 6 }}>
          El centro tiene {faltan.length} {faltan.length === 1 ? 'puesto marcado que no está' : 'puestos marcados que no están'} en esta evaluación.{' '}
          <button className="secundario" onClick={onAnadirFaltan} disabled={trabajando}>Añadirlos</button>
        </p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th style={celda}>Puesto</th>
              <th style={celda}>Estado</th>
              <th style={celda} />
            </tr>
          </thead>
          <tbody>
            {ordenados.map((ev) => (
              <tr key={ev.id}>
                <td style={celda}>
                  {ev.puestos?.nombre}
                  {ev.estado === 'no_aplica' && <div style={{ fontSize: 13, opacity: 0.75 }}>Motivo: {ev.motivo_no_aplica || '—'}</div>}
                  {motivo.id === ev.id && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                      <input autoFocus style={{ flex: '1 1 240px' }} placeholder="Por qué no se evalúa (p. ej., sin trabajadores en el centro)"
                        value={motivo.texto} onChange={(e) => setMotivo({ ...motivo, texto: e.target.value })} />
                      <button onClick={() => { onNoAplica(ev, motivo.texto); setMotivo({ id: null, texto: '' }) }} disabled={!motivo.texto.trim() || trabajando}>Guardar</button>
                      <button className="secundario" onClick={() => setMotivo({ id: null, texto: '' })}>Cancelar</button>
                    </div>
                  )}
                </td>
                <td style={celda}><Etiqueta estado={ev.estado} /></td>
                <td style={{ ...celda, whiteSpace: 'nowrap', textAlign: 'right' }}>
                  {ev.estado === 'pendiente' && (
                    <>
                      <button onClick={() => onEvaluar(ev)} disabled={trabajando || !evc.check_hecho || cerrada}
                        title={evc.check_hecho ? '' : 'Responde antes la lista de comprobación'}>Evaluar</button>{' '}
                      <button className="secundario" onClick={() => setMotivo({ id: ev.id, texto: '' })} disabled={trabajando || cerrada}>No aplica</button>
                    </>
                  )}
                  {ev.estado === 'borrador' && <button onClick={() => onEvaluar(ev)} disabled={trabajando}>Continuar</button>}
                  {ev.estado === 'cerrada' && (
                    <>
                      <button className="secundario" onClick={() => onEvaluar(ev)} disabled={trabajando}>Ver</button>{' '}
                      <button className="secundario" onClick={() => onERE(ev)} disabled={trabajando} title="Evaluación de riesgos para embarazo, parto reciente y lactancia">Descargar ERE</button>
                    </>
                  )}
                  {ev.estado === 'no_aplica' && <button className="secundario" onClick={() => onPendiente(ev)} disabled={trabajando || cerrada}>Volver a pendiente</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mostrarCierre && <section style={{ marginTop: 18 }}>
        {cerrada ? (
          <button className="secundario" onClick={onReabrir} disabled={trabajando}>Reabrir la evaluación del centro</button>
        ) : (
          <>
            {problemas.length > 0 && (
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                <b>Para cerrar la evaluación del centro falta:</b>
                <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>{problemas.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}
            <button onClick={onCerrar} disabled={trabajando || problemas.length > 0} style={{ padding: '10px 18px', fontWeight: 600 }}>
              Cerrar la evaluación del centro
            </button>
            {prog.completo && problemas.length === 0 && <span style={{ marginLeft: 10, color: '#2e7d32' }}>Todos los puestos están evaluados.</span>}
          </>
        )}
        {' '}<button className="secundario" onClick={onPap} disabled={trabajando || prog.evaluados + prog.enCurso === 0}>Ver el PAP del centro</button>
        {' '}<button className="secundario" onClick={onVolver} disabled={trabajando}>Volver a la lista</button>
      </section>}

      {mostrarAcceso && <div style={{ marginTop: 28 }}>
        <AccesoEvaluacion supabase={supabase} evaluacionCentro={evc} resaltar={cerrada} />
      </div>}
    </div>
  )
}

// ---------------------------------------------------------------------
// Lista de comprobación del centro: una vez por centro, y en cada «Sí» los puestos a los que afecta.
export function CheckCentro({ evc, evals, preguntas, catalogo, riesgos, onGuardar, onVolver, trabajando }) {
  const puestos = useMemo(() => evals.filter((e) => e.estado !== 'no_aplica')
    .map((e) => ({ id: e.puesto_id, nombre: e.puestos?.nombre ?? '' }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')), [evals])
  const todosIds = puestos.map((p) => p.id)
  const [resp, setResp] = useState(() => respuestasDesdeCheck(evc.check_respuestas ?? []))
  const nombres = useMemo(() => new Map(riesgos.map((r) => [r.id, r.nombre])), [riesgos])
  const medidasPor = useMemo(() => {
    const m = new Map()
    catalogo.forEach((x) => { if (!m.has(x.riesgo_id)) m.set(x.riesgo_id, []); m.get(x.riesgo_id).push(x) })
    return m
  }, [catalogo])

  const poner = (id, parche) => setResp((r) => ({ ...r, [id]: { si: false, medidas: [], puestos: todosIds, ...r[id], ...parche } }))
  const alternarMedida = (id, texto) => {
    const act = resp[id]?.medidas ?? []
    poner(id, { medidas: act.includes(texto) ? act.filter((t) => t !== texto) : [...act, texto] })
  }
  const alternarPuesto = (id, pid) => {
    const act = resp[id]?.puestos ?? []
    poner(id, { puestos: act.includes(pid) ? act.filter((x) => x !== pid) : [...act, pid] })
  }
  const siSinPuestos = preguntas.filter((q) => resp[q.id]?.si && !(resp[q.id].puestos ?? []).length).length
  const siCount = preguntas.filter((q) => resp[q.id]?.si).length

  return (
    <div style={{ maxWidth: 760, textAlign: 'left' }}>
      <h2>Lista de comprobación del centro</h2>
      <p style={{ opacity: 0.7 }}>{evc.centros.codigo} · {evc.centros.nombre} · {puestos.length} puestos</p>
      <p>
        Contesta <b>Sí</b> a las situaciones que se dan en el centro y marca a qué puestos afectan (vienen todos marcados).
        El riesgo se añade a esos puestos con P media y C dañina; lo ajustarás al evaluar cada puesto.
      </p>
      {evc.check_hecho && (
        <p style={{ fontSize: 14, background: '#fff8e1', padding: 10, borderRadius: 6 }}>
          Los cambios se aplican a los puestos que empieces a evaluar a partir de ahora. En los puestos ya empezados, añade o quita el riesgo a mano en su evaluación.
        </p>
      )}
      {preguntas.length === 0 && <p className="vacio">No hay preguntas de check cargadas.</p>}

      {preguntas.map((q) => {
        const r = resp[q.id]
        const si = !!r?.si
        const medidas = medidasPor.get(q.riesgo_id) ?? []
        return (
          <div key={q.id} style={{ borderBottom: '1px solid #e5e5e5', padding: '12px 0' }}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{q.riesgo_id} · {nombres.get(q.riesgo_id)}{q.subtipo ? ` · ${q.subtipo}` : ''}</div>
            <div style={{ margin: '4px 0 8px' }}>{q.pregunta}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="secundario" aria-pressed={si}
                style={si ? { fontWeight: 700, outline: '2px solid #1f3864' } : undefined}
                onClick={() => poner(q.id, { si: true })}>Sí</button>
              <button type="button" className="secundario" aria-pressed={!si}
                style={!si ? { fontWeight: 700, outline: '2px solid #1f3864' } : undefined}
                onClick={() => poner(q.id, { si: false })}>No</button>
            </div>
            {si && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer' }}>
                  Puestos afectados: {r.puestos.length === puestos.length ? 'todos' : `${r.puestos.length} de ${puestos.length}`}
                  {!r.puestos.length && <span style={{ color: '#b00020' }}> (marca al menos uno)</span>}
                </summary>
                <div style={{ display: 'flex', gap: 8, margin: '6px 0' }}>
                  <button type="button" className="secundario" onClick={() => poner(q.id, { puestos: todosIds })}>Todos</button>
                  <button type="button" className="secundario" onClick={() => poner(q.id, { puestos: [] })}>Ninguno</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2px 16px' }}>
                  {puestos.map((p) => (
                    <label key={p.id} style={{ ...filaCheck, justifyContent: 'flex-start', padding: '3px 0' }}>
                      <input type="checkbox" style={casilla} checked={r.puestos.includes(p.id)} onChange={() => alternarPuesto(q.id, p.id)} />
                      <span>{p.nombre}</span>
                    </label>
                  ))}
                </div>
              </details>
            )}
            {si && medidas.length > 0 && (
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer' }}>Medidas presentes ({r.medidas.length} marcadas de {medidas.length})</summary>
                <div style={{ marginTop: 6 }}>
                  {medidas.map((m) => (
                    <div key={m.id} style={{ borderBottom: '1px solid #f0f0f0', padding: '4px 0' }}>
                      <label style={filaCheck}>
                        <span>{m.texto}</span>
                        <input type="checkbox" style={casilla} checked={r.medidas.includes(m.texto)} onChange={() => alternarMedida(q.id, m.texto)} />
                      </label>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )
      })}

      {siSinPuestos > 0 && <p style={aviso}>{siSinPuestos} {siSinPuestos === 1 ? 'respuesta «Sí» no tiene' : 'respuestas «Sí» no tienen'} ningún puesto marcado y no se guardará{siSinPuestos === 1 ? '' : 'n'}.</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => onGuardar(guardarCheck(preguntas, resp, nombres))} disabled={trabajando} style={{ padding: '10px 18px', fontWeight: 600 }}>
          {trabajando ? 'Guardando...' : 'Guardar la lista de comprobación'}
        </button>
        <button className="secundario" onClick={onVolver} disabled={trabajando}>Cancelar</button>
        <span style={{ opacity: 0.7 }}>{siCount} {siCount === 1 ? 'situación marcada' : 'situaciones marcadas'} con Sí</span>
      </div>
    </div>
  )
}
