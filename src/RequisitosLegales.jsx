import { useEffect, useMemo, useState } from 'react'
import { documentoHTML, esc, imprimir } from './documentos'

// Requisitos legales (ISO 45001, 6.1.3) y evaluación periódica de su cumplimiento (9.1.2).
// Registro de normativa estatal, autonómica y local, con su enlace, si aplica y a qué apartado de la norma responde.
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const ok = { color: '#1b5e20', background: '#e8f5e9', padding: 10, borderRadius: 6 }
const FALTA = 'Falta ejecutar migracion_requisitos_legales.sql en Supabase'
const explicar = (e) => (/req_|does not exist|schema cache/i.test(e?.message ?? '') ? FALTA : e?.message ?? String(e))
const quitar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const fechaCorta = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`).toLocaleDateString('es-ES') : '')
const pestanaEstilo = (activa) => (activa ? { background: '#1f3864', color: '#fff', borderColor: '#1f3864' } : undefined)

const AMBITOS = { estatal: 'Estatal', autonomico: 'Autonómica', local: 'Local', europeo: 'Europea', otro: 'Otra' }
const CCAA = ['Andalucía', 'Aragón', 'Asturias', 'Illes Balears', 'Canarias', 'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña',
  'Comunitat Valenciana', 'Extremadura', 'Galicia', 'La Rioja', 'Comunidad de Madrid', 'Región de Murcia', 'Navarra', 'País Vasco', 'Ceuta', 'Melilla']
export const RESULTADOS = {
  pendiente: { texto: 'Pendiente', color: '#55616b', fondo: '#eef1f3' },
  cumple: { texto: 'Cumple', color: '#1b6e3c', fondo: '#e3f3e8' },
  parcial: { texto: 'Cumple en parte', color: '#8a5a00', fondo: '#fdf0d5' },
  no_cumple: { texto: 'No cumple', color: '#b3261e', fondo: '#fdecea' },
  no_aplica: { texto: 'No aplica', color: '#55616b', fondo: '#eef1f3' },
}
export const enlaceNorma = (n) => n.enlace || `https://www.google.com/search?q=${encodeURIComponent(n.ambito === 'estatal' ? `site:boe.es "${n.referencia}"` : `"${n.referencia}" ${n.ccaa ?? ''}`)}`
const VACIA = { referencia: '', titulo: '', tema: 'Organización y gestión', ambito: 'autonomico', ccaa: '', resumen: '', enlace: '', iso: '', aplica: true, observaciones: '' }

function Chip({ r }) {
  const e = RESULTADOS[r] ?? RESULTADOS.pendiente
  return <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10, color: e.color, background: e.fondo, whiteSpace: 'nowrap' }}>{e.texto}</span>
}

function FormNorma({ inicial, temas, onGuardar, onCancelar, trabajando }) {
  const [f, setF] = useState(inicial)
  const campo = (k, t, ancho = '1 1 220px', props = {}) => (
    <label style={{ flex: ancho }}>{t}<br /><input value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} {...props} /></label>
  )
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {campo('referencia', 'Referencia (p. ej. «Decreto 12/2020»)', '1 1 220px')}
      {campo('titulo', 'Título', '2 1 320px')}
      <label>Ámbito<br /><select value={f.ambito} onChange={(e) => setF({ ...f, ambito: e.target.value })}>{Object.entries(AMBITOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      {f.ambito === 'autonomico' && (
        <label>Comunidad autónoma<br /><select value={f.ccaa ?? ''} onChange={(e) => setF({ ...f, ccaa: e.target.value })}><option value="">Elige...</option>{CCAA.map((c) => <option key={c}>{c}</option>)}</select></label>
      )}
      <label style={{ flex: '1 1 200px' }}>Tema<br />
        <input list="temas-req" value={f.tema} onChange={(e) => setF({ ...f, tema: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
        <datalist id="temas-req">{temas.map((t) => <option key={t} value={t} />)}</datalist>
      </label>
      {campo('iso', 'Apartado ISO 45001', '0 1 130px')}
      <label style={{ flexBasis: '100%' }}>Qué exige<br /><textarea rows={2} value={f.resumen ?? ''} onChange={(e) => setF({ ...f, resumen: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
      {campo('enlace', 'Enlace al boletín (opcional)', '2 1 320px', { type: 'url' })}
      {campo('observaciones', 'Observaciones', '2 1 320px')}
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={!!f.aplica} onChange={(e) => setF({ ...f, aplica: e.target.checked })} /> Aplica a la organización</label>
      <span style={{ flex: 1 }} />
      <button className="secundario" onClick={onCancelar} disabled={trabajando}>Cancelar</button>
      <button onClick={() => onGuardar(f)} disabled={trabajando || !f.referencia.trim() || !f.titulo.trim()}>{trabajando ? 'Guardando...' : 'Guardar'}</button>
    </div>
  )
}

// ---------- Registro de normativa ----------
function Registro({ supabase, normas, setNormas }) {
  const [busca, setBusca] = useState('')
  const [ambito, setAmbito] = useState('')
  const [soloAplica, setSoloAplica] = useState(false)
  const [editando, setEditando] = useState(null)   // 'nueva' o id
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState('')
  const temas = [...new Set(normas.map((n) => n.tema))]

  const grupos = useMemo(() => {
    const q = quitar(busca.trim())
    const lista = normas.filter((n) => (!ambito || n.ambito === ambito) && (!soloAplica || n.aplica) && (!q || quitar(`${n.referencia} ${n.titulo} ${n.resumen} ${n.ccaa} ${n.tema}`).includes(q)))
    const m = new Map()
    lista.forEach((n) => { if (!m.has(n.tema)) m.set(n.tema, []); m.get(n.tema).push(n) })
    return [...m.entries()].map(([tema, ns]) => [tema, ns.sort((a, b) => a.orden - b.orden || a.referencia.localeCompare(b.referencia))])
  }, [normas, busca, ambito, soloAplica])

  async function guardar(f) {
    setError(''); setTrabajando(true)
    const datos = { referencia: f.referencia.trim(), titulo: f.titulo.trim(), tema: f.tema.trim() || 'Otros', ambito: f.ambito, ccaa: f.ambito === 'autonomico' ? f.ccaa || null : null,
      resumen: f.resumen?.trim() || null, enlace: f.enlace?.trim() || null, iso: f.iso?.trim() || null, aplica: !!f.aplica, observaciones: f.observaciones?.trim() || null }
    const q = editando === 'nueva' ? supabase.from('req_normas').insert(datos) : supabase.from('req_normas').update(datos).eq('id', editando)
    const { data, error: e } = await q.select('*').single()
    if (e) setError(/duplicate|unique/i.test(e.message) ? 'Ya existe una norma con esa referencia.' : explicar(e))
    else { setNormas(editando === 'nueva' ? [...normas, data] : normas.map((n) => (n.id === data.id ? data : n))); setEditando(null) }
    setTrabajando(false)
  }
  async function alternarAplica(n) {
    const { data, error: e } = await supabase.from('req_normas').update({ aplica: !n.aplica }).eq('id', n.id).select('*').single()
    if (e) setError(explicar(e)); else setNormas(normas.map((x) => (x.id === data.id ? data : x)))
  }
  async function borrar(n) {
    if (!window.confirm(`¿Borrar «${n.referencia}» del registro? También se quita de las evaluaciones.`)) return
    const { error: e } = await supabase.from('req_normas').delete().eq('id', n.id)
    if (e) setError(explicar(e)); else setNormas(normas.filter((x) => x.id !== n.id))
  }

  const autonomicas = normas.filter((n) => n.ambito === 'autonomico').length
  return (
    <div>
      <p style={{ marginTop: 0, maxWidth: '80ch' }}>
        Normativa de prevención que afecta a los centros. La lista de partida es estatal; añade la <b>normativa autonómica</b> de cada comunidad donde hay
        centros (desfibriladores, legionela, autoprotección, instalaciones, protocolos de agresiones a personal sanitario...) y la local que corresponda.
        {autonomicas === 0 && <span style={{ color: '#8a5a00' }}> Todavía no hay ninguna norma autonómica.</span>}
      </p>
      {error && <p style={aviso}>{error}</p>}
      {editando === 'nueva' ? (
        <div style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: 14, background: '#fff', marginBottom: 14 }}>
          <strong style={{ display: 'block', marginBottom: 8, color: '#1f3864' }}>Nueva norma</strong>
          <FormNorma inicial={VACIA} temas={temas} onGuardar={guardar} onCancelar={() => setEditando(null)} trabajando={trabajando} />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => setEditando('nueva')}>+ Añadir norma</button>
          <input type="search" placeholder="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ padding: '7px 10px', flex: '1 1 220px', maxWidth: 320 }} />
          <select value={ambito} onChange={(e) => setAmbito(e.target.value)}><option value="">Todos los ámbitos</option>{Object.entries(AMBITOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={soloAplica} onChange={(e) => setSoloAplica(e.target.checked)} /> Solo las que aplican</label>
        </div>
      )}
      {grupos.map(([tema, ns]) => (
        <section key={tema} style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '8px 14px', background: '#f3f6fb', fontWeight: 700, color: '#1f3864' }}>{tema} <span style={{ fontWeight: 400, color: '#55616b' }}>· {ns.length}</span></div>
          {ns.map((n) => (
            <div key={n.id} style={{ borderTop: '1px solid #e2e7ea', padding: '9px 14px', opacity: n.aplica ? 1 : 0.6 }}>
              {editando === n.id ? <FormNorma inicial={n} temas={temas} onGuardar={guardar} onCancelar={() => setEditando(null)} trabajando={trabajando} /> : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div style={{ flex: '1 1 380px' }}>
                    <strong>{n.referencia}</strong> · {n.titulo}
                    <span style={{ fontSize: 12, color: '#55616b' }}> · {AMBITOS[n.ambito]}{n.ccaa ? ` (${n.ccaa})` : ''}{n.iso ? ` · ISO ${n.iso}` : ''}</span>
                    {n.resumen && <div style={{ fontSize: 13, color: '#37424b', marginTop: 2 }}>{n.resumen}</div>}
                    {n.observaciones && <div style={{ fontSize: 13, color: '#8a5a00', marginTop: 2 }}>{n.observaciones}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <a className="secundario" href={enlaceNorma(n)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, alignSelf: 'center' }}>{n.enlace ? 'Ver texto' : 'Buscar'}</a>
                    <button className="secundario" onClick={() => alternarAplica(n)}>{n.aplica ? 'No aplica' : 'Aplica'}</button>
                    <button className="secundario" onClick={() => setEditando(n.id)}>Editar</button>
                    <button className="secundario" onClick={() => borrar(n)}>Borrar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}

// ---------- Evaluación del cumplimiento ----------
function informe(ev, items, normas) {
  const filas = items.map((it) => {
    const n = normas.find((x) => x.id === it.norma_id)
    return `<tr><td>${esc(n?.referencia)}<br><small>${esc(n?.titulo)}</small></td><td>${esc(RESULTADOS[it.resultado]?.texto)}</td><td>${esc(it.evidencia)}</td><td>${esc(it.accion)}${it.responsable ? `<br><small>${esc(it.responsable)}</small>` : ''}${it.plazo ? `<br><small>Plazo: ${esc(fechaCorta(it.plazo))}</small>` : ''}</td></tr>`
  }).join('')
  const cuenta = (r) => items.filter((i) => i.resultado === r).length
  const cuerpo = `<h1>Evaluación del cumplimiento de los requisitos legales</h1>
<div class="meta"><p><b>${esc(ev.titulo)}</b></p><p><b>Fecha:</b> ${esc(fechaCorta(ev.fecha))}${ev.realizada_por ? ` · <b>Realizada por:</b> ${esc(ev.realizada_por)}` : ''}</p>
<p>Cumple: ${cuenta('cumple')} · En parte: ${cuenta('parcial')} · No cumple: ${cuenta('no_cumple')} · No aplica: ${cuenta('no_aplica')} · Pendiente: ${cuenta('pendiente')}</p></div>
<p class="nota">ISO 45001:2018, apartado 9.1.2. Grupo Neural · Servicio de prevención.</p>
<table><thead><tr><th>Requisito</th><th>Resultado</th><th>Evidencia</th><th>Acción</th></tr></thead><tbody>${filas}</tbody></table>
${ev.conclusiones ? `<h2>Conclusiones</h2><p>${esc(ev.conclusiones)}</p>` : ''}
<table class="firma"><tr><td>Firma: ${esc(ev.realizada_por ?? '')}</td></tr></table>`
  imprimir(documentoHTML(ev.titulo, cuerpo, true))
}

function Evaluacion({ supabase, ev, normas, onVolver, onEv }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [conclusiones, setConclusiones] = useState(ev.conclusiones ?? '')
  const [realizada, setRealizada] = useState(ev.realizada_por ?? '')
  useEffect(() => {
    supabase.from('req_eval_items').select('*').eq('evaluacion_id', ev.id).then(({ data, error: e }) => { if (e) setError(explicar(e)); else setItems(data) })
  }, [supabase, ev.id])
  const orden = (it) => { const n = normas.find((x) => x.id === it.norma_id); return [n?.tema ?? '', n?.orden ?? 0] }
  const lista = (items ?? []).slice().sort((a, b) => { const [ta, oa] = orden(a); const [tb, ob] = orden(b); return ta.localeCompare(tb) || oa - ob })

  async function cambiar(it, cambios) {
    setItems(items.map((x) => (x.id === it.id ? { ...x, ...cambios } : x)))
    const { error: e } = await supabase.from('req_eval_items').update(cambios).eq('id', it.id)
    if (e) setError(explicar(e))
  }
  async function guardarEv(cambios) {
    const { data, error: e } = await supabase.from('req_evaluaciones').update(cambios).eq('id', ev.id).select('*').single()
    if (e) setError(explicar(e)); else onEv(data)
  }
  async function anadirNuevas() {
    const ya = new Set(items.map((i) => i.norma_id))
    const filas = normas.filter((n) => n.aplica && !ya.has(n.id)).map((n) => ({ evaluacion_id: ev.id, norma_id: n.id }))
    if (!filas.length) return
    const { data, error: e } = await supabase.from('req_eval_items').insert(filas).select('*')
    if (e) setError(explicar(e)); else setItems([...items, ...data])
  }
  const cerrada = ev.cerrada
  const pend = (items ?? []).filter((i) => i.resultado === 'pendiente').length
  const nuevas = items ? normas.filter((n) => n.aplica && !items.some((i) => i.norma_id === n.id)).length : 0

  return (
    <div>
      <p><button className="secundario" onClick={onVolver}>← Volver a las evaluaciones</button></p>
      <h3 style={{ margin: '0 0 4px' }}>{ev.titulo}</h3>
      <p style={{ margin: '0 0 12px', color: '#55616b' }}>{fechaCorta(ev.fecha)} · {cerrada ? 'Cerrada' : `${pend} requisitos pendientes de valorar`}</p>
      {error && <p style={aviso}>{error}</p>}
      {!cerrada && nuevas > 0 && <p style={{ ...ok, background: '#fdf0d5', color: '#7a4b00' }}>Hay {nuevas} normas que aplican y no están en esta evaluación. <button className="secundario" onClick={anadirNuevas}>Añadirlas</button></p>}
      {!items && <p>Cargando...</p>}
      {lista.map((it) => {
        const n = normas.find((x) => x.id === it.norma_id)
        return (
          <div key={it.id} style={{ border: '1px solid #d9dfe3', borderRadius: 8, background: '#fff', padding: '9px 12px', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 320px' }}><strong>{n?.referencia}</strong> · {n?.titulo}<div style={{ fontSize: 12, color: '#55616b' }}>{n?.tema}</div></div>
              {cerrada ? <Chip r={it.resultado} /> : (
                <select value={it.resultado} onChange={(e) => cambiar(it, { resultado: e.target.value })}>{Object.entries(RESULTADOS).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}</select>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              <input placeholder="Evidencia (documento, registro, visita...)" defaultValue={it.evidencia ?? ''} disabled={cerrada} onBlur={(e) => e.target.value !== (it.evidencia ?? '') && cambiar(it, { evidencia: e.target.value || null })} style={{ flex: '2 1 300px' }} />
              {['parcial', 'no_cumple'].includes(it.resultado) && (
                <>
                  <input placeholder="Acción para cumplir" defaultValue={it.accion ?? ''} disabled={cerrada} onBlur={(e) => e.target.value !== (it.accion ?? '') && cambiar(it, { accion: e.target.value || null })} style={{ flex: '2 1 260px' }} />
                  <input placeholder="Responsable" defaultValue={it.responsable ?? ''} disabled={cerrada} onBlur={(e) => e.target.value !== (it.responsable ?? '') && cambiar(it, { responsable: e.target.value || null })} style={{ flex: '1 1 150px' }} />
                  <input type="date" defaultValue={it.plazo ?? ''} disabled={cerrada} onBlur={(e) => e.target.value !== (it.plazo ?? '') && cambiar(it, { plazo: e.target.value || null })} title="Plazo" />
                </>
              )}
            </div>
          </div>
        )
      })}
      {items && (
        <div style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', padding: 12, marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Realizada por<br /><input value={realizada} disabled={cerrada} onChange={(e) => setRealizada(e.target.value)} onBlur={() => guardarEv({ realizada_por: realizada || null })} style={{ width: '100%', maxWidth: 420, boxSizing: 'border-box' }} /></label>
          <label style={{ display: 'block' }}>Conclusiones<br /><textarea rows={3} value={conclusiones} disabled={cerrada} onChange={(e) => setConclusiones(e.target.value)} onBlur={() => guardarEv({ conclusiones: conclusiones || null })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button className="secundario" onClick={() => informe({ ...ev, conclusiones, realizada_por: realizada }, lista, normas)}>Informe PDF</button>
            {!cerrada && <button onClick={() => { if (pend === 0 || window.confirm(`Quedan ${pend} requisitos pendientes. ¿Cerrar igualmente?`)) guardarEv({ cerrada: true }) }}>Cerrar evaluación</button>}
            {cerrada && <button className="secundario" onClick={() => guardarEv({ cerrada: false })}>Reabrir</button>}
          </div>
        </div>
      )}
    </div>
  )
}

function Evaluaciones({ supabase, normas }) {
  const [evs, setEvs] = useState(null)
  const [abierta, setAbierta] = useState(null)
  const [error, setError] = useState('')
  const [creando, setCreando] = useState(false)
  useEffect(() => {
    supabase.from('req_evaluaciones').select('*').order('fecha', { ascending: false }).then(({ data, error: e }) => { if (e) { setError(explicar(e)); setEvs([]) } else setEvs(data) })
  }, [supabase])
  async function nueva() {
    setError(''); setCreando(true)
    try {
      const { data: ev, error: e1 } = await supabase.from('req_evaluaciones').insert({ titulo: `Evaluación del cumplimiento legal ${new Date().getFullYear()}` }).select('*').single()
      if (e1) throw e1
      const filas = normas.filter((n) => n.aplica).map((n) => ({ evaluacion_id: ev.id, norma_id: n.id }))
      if (filas.length) { const { error: e2 } = await supabase.from('req_eval_items').insert(filas); if (e2) throw e2 }
      setEvs([ev, ...evs]); setAbierta(ev.id)
    } catch (e) { setError(explicar(e)) }
    setCreando(false)
  }
  const ev = evs?.find((x) => x.id === abierta)
  if (ev) return <Evaluacion supabase={supabase} ev={ev} normas={normas} onVolver={() => setAbierta(null)} onEv={(n) => setEvs(evs.map((x) => (x.id === n.id ? n : x)))} />
  const ultima = evs?.find((x) => x.cerrada)
  const caducada = !ultima || (new Date() - new Date(`${ultima.fecha}T12:00:00`)) / 86400000 > 365
  return (
    <div>
      <p style={{ marginTop: 0, maxWidth: '80ch' }}>
        Al menos una vez al año, y cuando cambie la normativa o la organización, se valora el cumplimiento de cada requisito que aplica, con su evidencia
        y, si no se cumple del todo, la acción, el responsable y el plazo.
      </p>
      {evs && caducada && <p style={{ ...aviso, background: '#fdf0d5', color: '#7a4b00' }}>{ultima ? `La última evaluación cerrada es del ${fechaCorta(ultima.fecha)}: hace más de un año.` : 'Todavía no hay ninguna evaluación cerrada.'}</p>}
      {error && <p style={aviso}>{error}</p>}
      <p><button onClick={nueva} disabled={creando || !normas.length}>{creando ? 'Creando...' : '+ Nueva evaluación'}</button></p>
      {!evs && <p>Cargando...</p>}
      {evs?.map((e) => (
        <button key={e.id} type="button" onClick={() => setAbierta(e.id)} style={{ display: 'flex', width: '100%', gap: 10, alignItems: 'center', padding: '10px 14px', marginBottom: 8, border: '1px solid #d9dfe3', borderRadius: 8, background: '#fff', color: '#1f2a33', font: 'inherit', textAlign: 'left', cursor: 'pointer', boxShadow: 'none' }}>
          <span style={{ flex: 1 }}><strong>{e.titulo}</strong><small style={{ display: 'block', color: '#6f7b84' }}>{fechaCorta(e.fecha)}{e.realizada_por ? ` · ${e.realizada_por}` : ''}</small></span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10, color: e.cerrada ? '#1b6e3c' : '#8a5a00', background: e.cerrada ? '#e3f3e8' : '#fdf0d5' }}>{e.cerrada ? 'Cerrada' : 'En curso'}</span>
        </button>
      ))}
    </div>
  )
}

export default function RequisitosLegales({ supabase }) {
  const [pestana, setPestana] = useState('registro')
  const [normas, setNormas] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    supabase.from('req_normas').select('*').order('orden').then(({ data, error: e }) => { if (e) { setError(explicar(e)); setNormas([]) } else setNormas(data) })
  }, [supabase])
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ marginBottom: 4 }}>Requisitos legales</h2>
      <p style={{ margin: '0 0 14px', color: '#55616b' }}>Normativa aplicable y evaluación periódica de su cumplimiento (ISO 45001, 6.1.3 y 9.1.2).</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, borderBottom: '1px solid #d9dfe3', paddingBottom: 8 }}>
        {[['registro', 'Registro de normativa'], ['evaluaciones', 'Evaluación del cumplimiento']].map(([k, t]) => (
          <button key={k} className="secundario" onClick={() => setPestana(k)} style={pestanaEstilo(pestana === k)}>{t}</button>
        ))}
      </div>
      {error && <p style={aviso}>{error}</p>}
      {!normas ? <p>Cargando...</p> : pestana === 'registro' ? <Registro supabase={supabase} normas={normas} setNormas={setNormas} /> : <Evaluaciones supabase={supabase} normas={normas} />}
    </div>
  )
}
