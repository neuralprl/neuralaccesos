import { useEffect, useState } from 'react'
import { fechaES, hoyISO } from './planLogic'
import { descargarERE } from './ereDatos'
import { EditorMedidas, ImportarAptitudes, descargarAdaptacion, detalleDe, informeDeRegistro } from './Adaptaciones'

// Personas especialmente sensibles del centro: embarazo, parto reciente, lactancia y personas con limitaciones
// (aptas con limitaciones). Sin nombres: puesto y una referencia (código o iniciales). Solo las ve el técnico.
// Las limitaciones requieren informe de adaptación; el embarazo enlaza con la ERE del puesto.
// Uso: <PersonasSensibles supabase={supabase} evc={evc} evals={evals} />

const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
export const TIPOS_SENSIBLE = { embarazo: 'Embarazo', parto_reciente: 'Parto reciente', lactancia: 'Lactancia', limitaciones: 'Persona con limitaciones' }
const INFORME = { pendiente: 'Informe de adaptación pendiente', emitido: 'Informe emitido', no_necesario: 'No necesita informe' }
const celda = { padding: 6, borderBottom: '1px solid #e5e5e5', verticalAlign: 'top', fontSize: 14 }

const nueva = (evc) => ({ tipo: 'embarazo', puesto_id: '', referencia: '', fecha_comunicacion: hoyISO(), semana_gestacion: '', fecha_prevista: '', limitaciones: '', informe_estado: 'pendiente', fecha_informe: '', observaciones: '', centro_id: evc.centros.id, evaluacion_centro_id: evc.id })

export default function PersonasSensibles({ supabase, evc, evals, onCambio }) {
  const [lista, setLista] = useState(null)
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [importar, setImportar] = useState(false)
  const [editando, setEditando] = useState(null)
  const [msg, setMsg] = useState('')
  const puestos = [...evals].map((e) => ({ id: e.puesto_id, nombre: e.puestos?.nombre ?? '', ev: e })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  async function cargar() {
    const { data, error: err } = await supabase.from('personas_sensibles').select('*').eq('centro_id', evc.centros.id).order('fecha_comunicacion', { ascending: false })
    if (err) { setError(/personas_sensibles/.test(err.message) ? 'Falta ampliar la base de datos: ejecuta migracion_visita.sql en el SQL Editor de Supabase.' : err.message); setLista([]) }
    else { setLista(data); onCambio?.(data) }
  }
  useEffect(() => { cargar() }, [evc.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function guardar() {
    setTrabajando(true); setError('')
    const p = puestos.find((x) => String(x.id) === String(form.puesto_id))
    const fila = {
      ...form, puesto: p?.nombre ?? null, puesto_id: form.puesto_id ? String(form.puesto_id) : null,
      referencia: form.referencia.trim().slice(0, 20) || null,
      semana_gestacion: form.semana_gestacion === '' ? null : Number(form.semana_gestacion),
      fecha_prevista: form.fecha_prevista || null, fecha_informe: form.fecha_informe || null,
      fecha_reconocimiento: form.fecha_reconocimiento || null, fecha_vigencia: form.fecha_vigencia || null,
      nombre: form.nombre?.trim() || null, dni: form.dni?.trim() || null,
      limitaciones: form.limitaciones?.trim() || null,
      ...(form.limitaciones?.trim() && (!form.detalle?.limitaciones?.length || form.limitaciones.trim() !== (lista.find((x) => x.id === form.id)?.limitaciones ?? '')) ? { detalle: detalleDe(form.limitaciones.trim()) } : {}),
      informe_estado: form.tipo === 'limitaciones' ? form.informe_estado : 'no_necesario',
    }
    const q = fila.id ? supabase.from('personas_sensibles').update(fila).eq('id', fila.id) : supabase.from('personas_sensibles').insert(fila)
    const { error: err } = await q
    setTrabajando(false)
    if (err) setError(err.message); else { setForm(null); cargar() }
  }
  async function cerrarCaso(x) {
    if (!window.confirm('¿Dar por finalizada esta situación (fin del embarazo o de la lactancia, o fin de las limitaciones)?')) return
    const { error: err } = await supabase.from('personas_sensibles').update({ activa: false }).eq('id', x.id)
    if (err) setError(err.message); else cargar()
  }
  async function ere(x) {
    const p = puestos.find((y) => String(y.id) === String(x.puesto_id))
    if (!p) { setError('Ese puesto no está en esta evaluación.'); return }
    if (p.ev.estado !== 'cerrada') { setError(`Evalúa primero el puesto ${p.nombre}: la ERE se genera cuando el puesto está evaluado.`); return }
    try { await descargarERE(supabase, { id: p.ev.id, fecha: p.ev.fecha, centro: evc.centros, puesto: p.ev.puestos }, 'pdf') } catch (e) { setError(e.message) }
  }

  const activas = (lista ?? []).filter((x) => x.activa)
  const antiguas = (lista ?? []).filter((x) => !x.activa)
  const f = form

  return (
    <div>
      <p style={{ marginTop: 0, maxWidth: 820 }}>
        Pregunta a la dirección si hay alguna <b>trabajadora embarazada</b>, que haya dado a luz recientemente o en lactancia, y si hay
        alguna <b>persona con limitaciones</b> (apta con limitaciones o especialmente sensible). Se registra sin nombres: puesto y una referencia.
      </p>
      {error && <p style={aviso}>{error}</p>}
      {!lista && <p>Cargando...</p>}
      {lista && activas.length === 0 && !f && <p className="vacio">No hay ninguna persona registrada.</p>}

      {activas.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: 10 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead><tr style={{ textAlign: 'left' }}><th style={celda}>Situación</th><th style={celda}>Puesto</th><th style={celda}>Referencia</th><th style={celda}>Datos</th><th style={celda}>Informe</th><th style={celda} /></tr></thead>
            <tbody>
              {activas.map((x) => (
                <tr key={x.id}>
                  <td style={celda}><b>{TIPOS_SENSIBLE[x.tipo]}</b><br /><small>desde {fechaES(x.fecha_comunicacion)}</small></td>
                  <td style={celda}>{x.puesto ?? '—'}</td>
                  <td style={celda}>{x.nombre ?? x.referencia ?? '—'}{x.dni ? <><br /><small>{x.dni}</small></> : null}</td>
                  <td style={celda}>
                    {x.tipo === 'embarazo' && <>{x.semana_gestacion ? `Semana ${x.semana_gestacion}` : ''}{x.fecha_prevista ? ` · parto previsto ${fechaES(x.fecha_prevista)}` : ''}</>}
                    {x.tipo === 'limitaciones' && x.limitaciones}
                    {x.observaciones && <div style={{ opacity: 0.75 }}>{x.observaciones}</div>}
                  </td>
                  <td style={{ ...celda, color: x.informe_estado === 'pendiente' ? '#ef6c00' : undefined, fontWeight: x.informe_estado === 'pendiente' ? 700 : 400 }}>
                    {x.tipo === 'limitaciones' ? `${INFORME[x.informe_estado]}${x.fecha_informe ? ` (${fechaES(x.fecha_informe)})` : ''}` : 'ERE del puesto'}
                    {x.limitaciones && (() => { const n = informeDeRegistro(x, '').pendientes.length; return n ? <div style={{ color: '#c62828', fontSize: 12 }}>{n} {n === 1 ? 'pendiente' : 'pendientes'} de indicar</div> : null })()}
                  </td>
                  <td style={{ ...celda, whiteSpace: 'nowrap' }}>
                    {x.tipo !== 'limitaciones' && <><button className="secundario" onClick={() => ere(x)}>ERE (PDF)</button>{' '}</>}
                    {x.limitaciones && <><button className="secundario" onClick={() => setEditando(x)}>Medidas</button>{' '}
                      <button className="secundario" onClick={() => descargarAdaptacion(x, evc.tecnico_nombre || '', 'word').catch((e) => setError(e.message))}>Informe (Word)</button>{' '}
                      <button className="secundario" onClick={() => descargarAdaptacion(x, evc.tecnico_nombre || '', 'pdf').catch((e) => setError(e.message))}>PDF</button>{' '}</>}
                    <button className="secundario" onClick={() => setForm({ ...nueva(evc), ...x, semana_gestacion: x.semana_gestacion ?? '', fecha_prevista: x.fecha_prevista ?? '', limitaciones: x.limitaciones ?? '', fecha_informe: x.fecha_informe ?? '', observaciones: x.observaciones ?? '', referencia: x.referencia ?? '', puesto_id: x.puesto_id ?? '' })}>Editar</button>{' '}
                    <button className="secundario" onClick={() => cerrarCaso(x)}>Finalizar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {msg && <p style={{ color: '#2e7d32' }}>{msg}</p>}
      {editando && <EditorMedidas supabase={supabase} registro={editando} onCancelar={() => setEditando(null)} onGuardado={() => { setEditando(null); setMsg('Medidas guardadas.'); cargar() }} />}
      {importar && <ImportarAptitudes supabase={supabase} evc={evc} evals={evals} onCancelar={() => setImportar(false)} onTerminado={(n) => { setImportar(false); setMsg(`${n} ${n === 1 ? 'carta importada' : 'cartas importadas'}. Revisa las medidas de cada una.`); cargar() }} />}
      {!f && !importar && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="secundario" onClick={() => setForm(nueva(evc))} disabled={!lista}>Registrar una persona</button>
          <button className="secundario" onClick={() => setImportar(true)} disabled={!lista}>Importar cartas de aptitud (Excel)</button>
        </div>
      )}

      {f && (
        <div style={{ border: '1px solid #d9dfe3', borderRadius: 8, padding: 12, maxWidth: 760, background: '#fff' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {Object.entries(TIPOS_SENSIBLE).map(([k, t]) => (
              <button key={k} type="button" className="secundario" aria-pressed={f.tipo === k} onClick={() => setForm({ ...f, tipo: k })}
                style={f.tipo === k ? { background: '#1f3864', color: '#fff', fontWeight: 700 } : undefined}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            <label>Puesto<br />
              <select value={f.puesto_id} onChange={(e) => setForm({ ...f, puesto_id: e.target.value })} style={{ width: '100%' }}>
                <option value="">Elige el puesto</option>
                {puestos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </label>
            {f.tipo === 'limitaciones'
              ? <label>Nombre del trabajador/a (para el informe)<br /><input value={f.nombre ?? ''} onChange={(e) => setForm({ ...f, nombre: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
              : <label>Referencia (código o iniciales, sin nombre)<br /><input maxLength={20} value={f.referencia} onChange={(e) => setForm({ ...f, referencia: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>}
            {f.tipo === 'limitaciones' && <label>DNI/NIE<br /><input value={f.dni ?? ''} onChange={(e) => setForm({ ...f, dni: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>}
            {f.tipo === 'limitaciones' && <label>Fecha del reconocimiento<br /><input type="date" value={f.fecha_reconocimiento ?? ''} onChange={(e) => setForm({ ...f, fecha_reconocimiento: e.target.value })} /></label>}
            {f.tipo === 'limitaciones' && <label>Vigencia hasta<br /><input type="date" value={f.fecha_vigencia ?? ''} onChange={(e) => setForm({ ...f, fecha_vigencia: e.target.value })} /></label>}
            <label>Fecha de comunicación<br /><input type="date" value={f.fecha_comunicacion} onChange={(e) => setForm({ ...f, fecha_comunicacion: e.target.value })} /></label>
            {f.tipo === 'embarazo' && <label>Semana de gestación (opcional)<br /><input type="number" min="1" max="42" value={f.semana_gestacion} onChange={(e) => setForm({ ...f, semana_gestacion: e.target.value })} /></label>}
            {f.tipo === 'embarazo' && <label>Fecha prevista de parto (opcional)<br /><input type="date" value={f.fecha_prevista} onChange={(e) => setForm({ ...f, fecha_prevista: e.target.value })} /></label>}
          </div>
          {f.tipo === 'limitaciones' && (
            <>
              <label style={{ display: 'block', marginTop: 10 }}>Limitaciones indicadas por la vigilancia de la salud (sin diagnóstico; separadas por « - », tal como vienen en la carta)<br />
                <textarea rows={2} value={f.limitaciones} onChange={(e) => setForm({ ...f, limitaciones: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }}
                  placeholder="Por ejemplo: no manipular cargas de más de 5 kg; evitar bipedestación prolongada; no trabajo nocturno" />
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
                <select value={f.informe_estado} onChange={(e) => setForm({ ...f, informe_estado: e.target.value })}>{Object.entries(INFORME).map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
                {f.informe_estado === 'emitido' && <label>Fecha del informe <input type="date" value={f.fecha_informe} onChange={(e) => setForm({ ...f, fecha_informe: e.target.value })} /></label>}
              </div>
            </>
          )}
          <label style={{ display: 'block', marginTop: 10 }}>Observaciones<br /><input value={f.observaciones} onChange={(e) => setForm({ ...f, observaciones: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={guardar} disabled={trabajando || !f.puesto_id}>{trabajando ? 'Guardando...' : 'Guardar'}</button>
            <button className="secundario" onClick={() => setForm(null)} disabled={trabajando}>Cancelar</button>
          </div>
          <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 0 }}>Son datos de salud: solo los ve el técnico, no el usuario del centro. En las personas con limitaciones se guarda el nombre porque el informe de adaptación se entrega al trabajador/a.</p>
        </div>
      )}

      {antiguas.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary>Situaciones finalizadas ({antiguas.length})</summary>
          <ul>{antiguas.map((x) => <li key={x.id}>{TIPOS_SENSIBLE[x.tipo]} · {x.puesto ?? ''} · {x.referencia ?? ''} · desde {fechaES(x.fecha_comunicacion)}</li>)}</ul>
        </details>
      )}
    </div>
  )
}
