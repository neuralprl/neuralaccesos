import { useEffect, useMemo, useState } from 'react'
import { ESTADOS, FORMAS, GRAVEDAD, TIPOS, TIPOS_CAUSA, avisos, conBaja, diasBaja, fechaCorta, hoyISO, indicadores, investigable, plazoDelta, plazoRelacion } from './accLogic'
import { documentoHTML, esc, imprimir } from './documentos'

// Accidentes, incidentes y enfermedades profesionales: registro, investigación (causas y medidas), Delt@ e índices.
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const FALTA = 'Falta ejecutar migracion_accidentes.sql en Supabase'
const explicar = (e) => (/inc_|does not exist|schema cache/i.test(e?.message ?? '') ? FALTA : e?.message ?? String(e))
const quitar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const pestanaEstilo = (a) => (a ? { background: '#1f3864', color: '#fff', borderColor: '#1f3864' } : undefined)
const COLOR_AVISO = { alto: ['#b3261e', '#fdecea'], medio: ['#8a5a00', '#fdf0d5'], info: ['#1f5f8b', '#e6f0f8'] }

export function Chip({ e, children }) {
  return <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10, color: e.color, background: e.fondo, whiteSpace: 'nowrap' }}>{children ?? e.corto ?? e.texto}</span>
}
const campo = (t, el, ancho = '1 1 200px') => <label style={{ flex: ancho, display: 'flex', flexDirection: 'column', gap: 3, fontSize: 14 }}>{t}{el}</label>
const ancho100 = { width: '100%', boxSizing: 'border-box' }

// ---------- Formulario de datos del suceso (lo usan también los centros) ----------
export function DatosSuceso({ f, setF, centros, soloComunicar = false }) {
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const sinDano = f.tipo === 'incidente'
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {centros && centros.length > 1 && campo('Centro', <select value={f.centro_id ?? ''} onChange={set('centro_id')}><option value="">Elige...</option>{centros.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}</select>, '2 1 280px')}
      {campo('Tipo', <select value={f.tipo} onChange={set('tipo')}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}</select>, '2 1 260px')}
      {campo('Fecha', <input type="date" value={f.fecha ?? ''} max={hoyISO()} onChange={set('fecha')} />, '0 1 150px')}
      {campo('Hora', <input type="time" value={f.hora ?? ''} onChange={set('hora')} />, '0 1 110px')}
      {campo('Cómo se produjo', <select value={f.forma ?? ''} onChange={set('forma')}><option value="">Elige...</option>{FORMAS.map((x) => <option key={x}>{x}</option>)}</select>, '2 1 260px')}
      {campo('Lugar exacto', <input value={f.lugar ?? ''} onChange={set('lugar')} style={ancho100} />)}
      {campo('Tarea que se realizaba', <input value={f.tarea ?? ''} onChange={set('tarea')} style={ancho100} />)}
      {campo('Qué ocurrió (hechos, sin valoraciones)', <textarea rows={3} value={f.descripcion ?? ''} onChange={set('descripcion')} style={ancho100} />, '1 1 100%')}
      {campo('Testigos', <input value={f.testigos ?? ''} onChange={set('testigos')} style={ancho100} />)}
      {!sinDano && (
        <>
          {campo('Persona afectada', <input value={f.persona ?? ''} onChange={set('persona')} style={ancho100} />)}
          {campo('Puesto', <input value={f.puesto ?? ''} onChange={set('puesto')} style={ancho100} />)}
          {campo('Empresa (vacío si es personal propio)', <input value={f.empresa ?? ''} onChange={set('empresa')} style={ancho100} />)}
          {campo('Lesión', <input value={f.lesion ?? ''} onChange={set('lesion')} style={ancho100} />)}
          {campo('Parte del cuerpo', <input value={f.parte_cuerpo ?? ''} onChange={set('parte_cuerpo')} style={ancho100} />)}
        </>
      )}
      {campo('Gravedad', <select value={f.gravedad ?? ''} onChange={set('gravedad')}><option value="">—</option>{Object.entries(GRAVEDAD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>, '0 1 140px')}
      {(f.tipo === 'accidente_baja' || f.tipo === 'in_itinere' || f.tipo === 'enfermedad') && (
        <>
          {campo('Fecha de baja', <input type="date" value={f.fecha_baja ?? ''} onChange={set('fecha_baja')} />, '0 1 150px')}
          {!soloComunicar && campo('Fecha de alta', <input type="date" value={f.fecha_alta ?? ''} onChange={set('fecha_alta')} />, '0 1 150px')}
        </>
      )}
    </div>
  )
}

const VACIO = { centro_id: '', tipo: 'accidente_baja', fecha: hoyISO(), hora: '', forma: '', lugar: '', tarea: '', descripcion: '', testigos: '', persona: '', puesto: '', empresa: '', lesion: '', parte_cuerpo: '', gravedad: 'leve', fecha_baja: '', fecha_alta: '' }
export const limpiarSuceso = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, typeof v === 'string' ? (v.trim() || null) : v]))

// ---------- Informe de investigación en PDF ----------
function informePDF(s, centro) {
  const fila = (t, v) => `<tr><th style="width:32%;text-align:left">${t}</th><td>${esc(v ?? '')}</td></tr>`
  const cuerpo = `<h1>Informe de investigación de accidente o incidente</h1>
<p class="nota">Grupo Neural · Servicio de prevención mancomunado · Art. 16.3 de la Ley 31/1995 · ISO 45001, 10.2</p>
<h2>1. Datos del suceso</h2><table>${fila('Tipo', TIPOS[s.tipo]?.texto)}${fila('Fecha y hora', `${fechaCorta(s.fecha)} ${s.hora ?? ''}`)}${fila('Centro', `${centro?.codigo ?? ''} · ${centro?.nombre ?? ''}`)}
${fila('Lugar', s.lugar)}${fila('Tarea', s.tarea)}${fila('Cómo se produjo', s.forma)}${fila('Testigos', s.testigos)}</table>
<h2>2. Persona afectada</h2><table>${fila('Nombre', s.persona)}${fila('Puesto', s.puesto)}${fila('Empresa', s.empresa || 'Personal propio')}${fila('Lesión y parte del cuerpo', [s.lesion, s.parte_cuerpo].filter(Boolean).join(' · '))}
${fila('Gravedad', GRAVEDAD[s.gravedad])}${fila('Baja', s.fecha_baja ? `Desde ${fechaCorta(s.fecha_baja)}${s.fecha_alta ? ` hasta ${fechaCorta(s.fecha_alta)}` : ''} (${diasBaja(s)} días)` : 'Sin baja')}
${fila('Parte Delt@', s.delta_numero ? `${s.delta_numero} · ${fechaCorta(s.delta_fecha)}` : '')}</table>
<h2>3. Descripción</h2><p>${esc(s.descripcion ?? '')}</p>
<h2>4. Investigación</h2><table>${fila('Equipo investigador', s.inv_equipo)}${fila('Fecha', fechaCorta(s.inv_fecha))}${fila('Método', s.inv_metodo)}</table>
<h2>5. Causas</h2><table><thead><tr><th>Tipo</th><th>Descripción</th></tr></thead><tbody>${(s.causas ?? []).map((c) => `<tr><td>${esc(c.tipo)}</td><td>${esc(c.texto)}</td></tr>`).join('') || '<tr><td colspan="2">—</td></tr>'}</tbody></table>
<h2>6. Medidas</h2><table><thead><tr><th>Medida</th><th>Responsable</th><th>Plazo</th><th>Estado</th></tr></thead><tbody>${(s.medidas ?? []).map((m) => `<tr><td>${esc(m.texto)}${m.pap ? ' (PAP)' : ''}</td><td>${esc(m.responsable)}</td><td>${esc(fechaCorta(m.plazo))}</td><td>${m.hecha ? 'Realizada' : 'Pendiente'}</td></tr>`).join('') || '<tr><td colspan="4">—</td></tr>'}</tbody></table>
<p>¿Revisar la evaluación de riesgos? ${s.revisar_er == null ? '—' : s.revisar_er ? 'Sí' : 'No'} · Comunicado a los delegados de prevención: ${fechaCorta(s.comunicado_delegados) || '—'}</p>
${s.conclusiones ? `<h2>7. Conclusiones</h2><p>${esc(s.conclusiones)}</p>` : ''}
<table class="firma"><tr><td>Técnico/a de prevención</td><td>Responsable del centro</td></tr></table>`
  imprimir(documentoHTML(`Investigacion_${s.fecha}_${s.id}`, cuerpo))
}

// ---------- Ficha de un suceso ----------
function Ficha({ supabase, suceso, centros, onGuardado, onVolver, onBorrar }) {
  const [f, setF] = useState(suceso)
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  useEffect(() => { setF(suceso) }, [suceso])
  const centro = centros.find((c) => String(c.id) === String(f.centro_id))
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const lista = (k) => f[k] ?? []
  const cambiarItem = (k, i, cambios) => setF({ ...f, [k]: lista(k).map((x, j) => (j === i ? { ...x, ...cambios } : x)) })

  async function guardar(extra = {}) {
    setError(''); setMsg(''); setTrabajando(true)
    const datos = limpiarSuceso({ ...f, ...extra })
    delete datos.id; delete datos.creado_en; delete datos.comunicado_por
    datos.causas = (datos.causas ?? []).filter((c) => c.texto?.trim())
    datos.medidas = (datos.medidas ?? []).filter((m) => m.texto?.trim())
    const { data, error: e } = await supabase.from('inc_sucesos').update(datos).eq('id', suceso.id).select('*').single()
    if (e) setError(explicar(e)); else { onGuardado(data); setMsg('Guardado.') }
    setTrabajando(false)
  }
  const av = avisos(f)
  const pr = plazoRelacion(f)

  return (
    <div>
      <p><button className="secundario" onClick={onVolver}>← Volver al registro</button></p>
      <h3 style={{ margin: '0 0 4px' }}>{TIPOS[f.tipo]?.texto} · {fechaCorta(f.fecha)}</h3>
      <p style={{ margin: '0 0 10px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: '#55616b' }}>{centro ? `${centro.codigo} · ${centro.nombre}` : ''}{f.persona ? ` · ${f.persona}` : ''}</span>
        <Chip e={ESTADOS[f.estado]} />
      </p>
      {av.map((a, i) => <p key={i} style={{ margin: '0 0 6px', padding: '8px 12px', borderRadius: 6, color: COLOR_AVISO[a.nivel][0], background: COLOR_AVISO[a.nivel][1] }}>{a.texto}</p>)}
      {error && <p style={aviso}>{error}</p>}

      <section style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', padding: 14, margin: '10px 0 14px' }}>
        <strong style={{ display: 'block', marginBottom: 8, color: '#1f3864' }}>Datos del suceso</strong>
        <DatosSuceso f={f} setF={setF} centros={centros} />
        {(conBaja(f) || f.tipo === 'accidente_sin_baja') && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: '1px dashed #d9dfe3' }}>
            {campo(conBaja(f) ? 'Número del parte Delt@' : 'Relación mensual de accidentes sin baja (número)', <input value={f.delta_numero ?? ''} onChange={set('delta_numero')} style={ancho100} />)}
            {campo('Fecha de comunicación', <input type="date" value={f.delta_fecha ?? ''} onChange={set('delta_fecha')} />, '0 1 160px')}
            <small style={{ flexBasis: '100%', color: '#55616b' }}>{conBaja(f) ? `Plazo: 5 días hábiles desde el accidente o la baja (hasta el ${fechaCorta(plazoDelta(f))}).` : `Plazo de la relación mensual: hasta el ${fechaCorta(pr)}.`}</small>
          </div>
        )}
      </section>

      <section style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', padding: 14, marginBottom: 14 }}>
        <strong style={{ display: 'block', marginBottom: 8, color: '#1f3864' }}>Investigación {investigable(f) ? '' : <small style={{ fontWeight: 400, color: '#55616b' }}>(opcional en este tipo de suceso)</small>}</strong>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {campo('Equipo investigador', <input value={f.inv_equipo ?? ''} onChange={set('inv_equipo')} style={ancho100} />, '2 1 300px')}
          {campo('Fecha', <input type="date" value={f.inv_fecha ?? ''} onChange={set('inv_fecha')} />, '0 1 160px')}
          {campo('Método', <input value={f.inv_metodo ?? ''} placeholder="Árbol de causas (NTP 274)" onChange={set('inv_metodo')} style={ancho100} />, '1 1 220px')}
        </div>
        <p style={{ fontWeight: 600, margin: '12px 0 4px' }}>Causas</p>
        {lista('causas').map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <select value={c.tipo ?? ''} onChange={(e) => cambiarItem('causas', i, { tipo: e.target.value })} style={{ flex: '1 1 220px' }}><option value="">Tipo de causa...</option>{TIPOS_CAUSA.map((t) => <option key={t}>{t}</option>)}</select>
            <input value={c.texto ?? ''} onChange={(e) => cambiarItem('causas', i, { texto: e.target.value })} placeholder="Descripción" style={{ flex: '3 1 340px' }} />
            <button className="secundario" onClick={() => setF({ ...f, causas: lista('causas').filter((_, j) => j !== i) })} aria-label="Quitar causa">×</button>
          </div>
        ))}
        <button className="secundario" onClick={() => setF({ ...f, causas: [...lista('causas'), { tipo: '', texto: '' }] })}>+ Añadir causa</button>
        <p style={{ fontWeight: 600, margin: '12px 0 4px' }}>Medidas</p>
        {lista('medidas').map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={m.texto ?? ''} onChange={(e) => cambiarItem('medidas', i, { texto: e.target.value })} placeholder="Medida" style={{ flex: '3 1 300px' }} />
            <input value={m.responsable ?? ''} onChange={(e) => cambiarItem('medidas', i, { responsable: e.target.value })} placeholder="Responsable" style={{ flex: '1 1 150px' }} />
            <input type="date" value={m.plazo ?? ''} onChange={(e) => cambiarItem('medidas', i, { plazo: e.target.value })} title="Plazo" />
            <label style={{ fontSize: 13 }}><input type="checkbox" checked={!!m.pap} onChange={(e) => cambiarItem('medidas', i, { pap: e.target.checked })} /> PAP</label>
            <label style={{ fontSize: 13 }}><input type="checkbox" checked={!!m.hecha} onChange={(e) => cambiarItem('medidas', i, { hecha: e.target.checked })} /> Realizada</label>
            <button className="secundario" onClick={() => setF({ ...f, medidas: lista('medidas').filter((_, j) => j !== i) })} aria-label="Quitar medida">×</button>
          </div>
        ))}
        <button className="secundario" onClick={() => setF({ ...f, medidas: [...lista('medidas'), { texto: '', responsable: '', plazo: '', pap: false, hecha: false }] })}>+ Añadir medida</button>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'flex-end' }}>
          {campo('¿Hay que revisar la evaluación de riesgos?', <select value={f.revisar_er == null ? '' : f.revisar_er ? 'si' : 'no'} onChange={(e) => setF({ ...f, revisar_er: e.target.value === '' ? null : e.target.value === 'si' })}><option value="">—</option><option value="si">Sí</option><option value="no">No</option></select>, '1 1 240px')}
          {campo('Comunicado a los delegados de prevención', <input type="date" value={f.comunicado_delegados ?? ''} onChange={set('comunicado_delegados')} />, '0 1 200px')}
          {campo('Conclusiones', <textarea rows={2} value={f.conclusiones ?? ''} onChange={set('conclusiones')} style={ancho100} />, '1 1 100%')}
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => guardar(f.estado === 'comunicado' && (f.inv_fecha || (f.causas ?? []).length) ? { estado: 'investigacion' } : {})} disabled={trabajando}>{trabajando ? 'Guardando...' : 'Guardar'}</button>
        {f.estado !== 'cerrado' && <button className="secundario" onClick={() => guardar({ estado: 'cerrado', cerrado_en: hoyISO() })} disabled={trabajando}>Guardar y cerrar</button>}
        {f.estado === 'cerrado' && <button className="secundario" onClick={() => guardar({ estado: 'investigacion', cerrado_en: null })} disabled={trabajando}>Reabrir</button>}
        <button className="secundario" onClick={() => informePDF(f, centro)}>Informe PDF</button>
        <button className="secundario" onClick={() => { if (window.confirm('¿Borrar este suceso del registro?')) onBorrar(suceso) }}>Borrar</button>
        {msg && <span style={{ color: '#1b6e3c' }}>{msg}</span>}
      </div>
    </div>
  )
}

// ---------- Registro ----------
function Registro({ supabase, sucesos, setSucesos, centros, onAbrir }) {
  const [anio, setAnio] = useState(String(new Date().getFullYear()))
  const [tipo, setTipo] = useState('')
  const [busca, setBusca] = useState('')
  const [nuevo, setNuevo] = useState(null)
  const [error, setError] = useState('')
  const anios = [...new Set([String(new Date().getFullYear()), ...sucesos.map((s) => s.fecha.slice(0, 4))])].sort().reverse()
  const lista = useMemo(() => {
    const q = quitar(busca.trim())
    return sucesos.filter((s) => (!anio || s.fecha.startsWith(anio)) && (!tipo || s.tipo === tipo))
      .filter((s) => { const c = centros.find((x) => x.id === s.centro_id); return !q || quitar(`${c?.codigo} ${c?.nombre} ${s.persona} ${s.puesto} ${s.forma} ${s.descripcion}`).includes(q) })
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [sucesos, anio, tipo, busca, centros])
  const pendientes = sucesos.filter((s) => avisos(s).some((a) => a.nivel !== 'info'))

  async function crear() {
    setError('')
    if (!nuevo.centro_id) { setError('Elige el centro.'); return }
    const datos = limpiarSuceso(nuevo)
    if (datos.tipo === 'incidente') { datos.persona = null; datos.lesion = null }
    const { data, error: e } = await supabase.from('inc_sucesos').insert(datos).select('*').single()
    if (e) setError(explicar(e)); else { setSucesos([data, ...sucesos]); setNuevo(null); onAbrir(data.id) }
  }

  return (
    <div>
      {pendientes.length > 0 && (
        <p style={{ ...aviso, background: '#fdf0d5', color: '#7a4b00' }}>
          {pendientes.length} sucesos necesitan atención (parte Delt@, investigación o medidas vencidas). Están marcados en la lista.
        </p>
      )}
      {error && <p style={aviso}>{error}</p>}
      {nuevo ? (
        <div style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: 14, background: '#fff', marginBottom: 14 }}>
          <strong style={{ display: 'block', marginBottom: 8, color: '#1f3864' }}>Nuevo suceso</strong>
          <DatosSuceso f={nuevo} setF={setNuevo} centros={centros} />
          <p style={{ display: 'flex', gap: 8, marginBottom: 0 }}><button onClick={crear}>Guardar</button><button className="secundario" onClick={() => setNuevo(null)}>Cancelar</button></p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={() => setNuevo({ ...VACIO, centro_id: centros.length === 1 ? centros[0].id : '' })}>+ Registrar suceso</button>
          <select value={anio} onChange={(e) => setAnio(e.target.value)}><option value="">Todos los años</option>{anios.map((a) => <option key={a}>{a}</option>)}</select>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Todos los tipos</option>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}</select>
          <input type="search" placeholder="Buscar centro, persona, puesto o forma" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ padding: '7px 10px', flex: '1 1 240px', maxWidth: 340 }} />
        </div>
      )}
      {lista.length === 0 && <p className="vacio">No hay sucesos con estos filtros.</p>}
      {lista.length > 0 && (
        <div style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
          {lista.map((s, i) => {
            const c = centros.find((x) => x.id === s.centro_id)
            const av = avisos(s).filter((a) => a.nivel !== 'info')
            return (
              <button key={s.id} type="button" onClick={() => onAbrir(s.id)} style={{ display: 'flex', width: '100%', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '10px 14px', border: 0, borderTop: i ? '1px solid #e2e7ea' : 0, borderRadius: 0, background: '#fff', color: '#1f2a33', font: 'inherit', textAlign: 'left', cursor: 'pointer', boxShadow: 'none' }}>
                <span style={{ width: 86, color: '#55616b' }}>{fechaCorta(s.fecha)}</span>
                <Chip e={TIPOS[s.tipo]} />
                <span style={{ flex: '1 1 260px' }}>
                  <strong>{s.persona || s.forma || 'Sin persona afectada'}</strong>{s.puesto ? ` · ${s.puesto}` : ''}
                  <small style={{ display: 'block', color: '#6f7b84' }}>{c ? `${c.codigo} · ${c.nombre}` : ''}{s.forma && s.persona ? ` · ${s.forma}` : ''}{s.fecha_baja ? ` · ${diasBaja(s)} días de baja${s.fecha_alta ? '' : ' (abierta)'}` : ''}</small>
                </span>
                {av.length > 0 && <Chip e={{ color: '#b3261e', fondo: '#fdecea' }}>{av.length} avisos</Chip>}
                <Chip e={ESTADOS[s.estado]} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---------- Índices ----------
function Indicadores({ supabase, sucesos, centros }) {
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [plantillas, setPlantillas] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    supabase.from('inc_plantilla').select('*').then(({ data, error: e }) => { if (e) { setError(explicar(e)); setPlantillas([]) } else setPlantillas(data) })
  }, [supabase])
  const delAnio = sucesos.filter((s) => s.fecha.startsWith(String(anio)))
  const general = plantillas?.find((p) => p.anio === anio && p.centro_id == null)
  const ind = indicadores(delAnio, general)

  async function guardarPlantilla(campoP, valor) {
    setError('')
    const fila = { anio, centro_id: null, trabajadores: general?.trabajadores ?? null, horas: general?.horas ?? null, [campoP]: valor === '' ? null : Number(valor) }
    const q = general ? supabase.from('inc_plantilla').update({ [campoP]: fila[campoP] }).eq('id', general.id) : supabase.from('inc_plantilla').insert(fila)
    const { data, error: e } = await q.select('*').single()
    if (e) setError(explicar(e)); else setPlantillas([...plantillas.filter((p) => p.id !== data.id), data])
  }
  const porForma = FORMAS.map((x) => [x, delAnio.filter((s) => s.forma === x && s.tipo !== 'incidente').length]).filter(([, n]) => n).sort((a, b) => b[1] - a[1])
  const porCentro = centros.map((c) => [c, delAnio.filter((s) => s.centro_id === c.id)]).filter(([, l]) => l.length).sort((a, b) => b[1].length - a[1].length)
  const tarjeta = (t, v, nota) => (
    <div style={{ border: '1px solid #d9dfe3', borderRadius: 8, background: '#fff', padding: '10px 14px', minWidth: 150, flex: '1 1 150px' }}>
      <div style={{ fontSize: 13, color: '#55616b' }}>{t}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#1f3864' }}>{v ?? '—'}</div>
      {nota && <div style={{ fontSize: 12, color: '#6f7b84' }}>{nota}</div>}
    </div>
  )
  return (
    <div>
      {error && <p style={aviso}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
        <label>Año<br /><select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>{[0, 1, 2, 3].map((k) => new Date().getFullYear() - k).map((a) => <option key={a}>{a}</option>)}</select></label>
        <label>Plantilla media<br /><input type="number" min="0" key={`t${anio}${general?.id}`} defaultValue={general?.trabajadores ?? ''} onBlur={(e) => guardarPlantilla('trabajadores', e.target.value)} style={{ width: 120 }} /></label>
        <label>Horas trabajadas en el año<br /><input type="number" min="0" key={`h${anio}${general?.id}`} defaultValue={general?.horas ?? ''} onBlur={(e) => guardarPlantilla('horas', e.target.value)} style={{ width: 160 }} /></label>
        <small style={{ color: '#55616b', flex: '1 1 260px' }}>Datos de toda la organización, para calcular los índices. Se guardan al salir del campo.</small>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {tarjeta('Accidentes con baja (en jornada)', ind.n)}
        {tarjeta('Índice de incidencia', ind.incidencia, 'por cada 1.000 trabajadores')}
        {tarjeta('Índice de frecuencia', ind.frecuencia, 'por millón de horas')}
        {tarjeta('Índice de gravedad', ind.gravedad, 'días de baja por 1.000 horas')}
        {tarjeta('Duración media de la baja', ind.duracion, 'días por accidente')}
      </div>
      <p style={{ color: '#37424b' }}>
        Además: {ind.sinBaja} accidentes sin baja · {ind.itinere} in itinere con baja · {ind.biologicos} accidentes biológicos · {ind.incidentes} incidentes · {ind.enfermedades} enfermedades profesionales.
        Los días de baja se cuentan en días naturales; los de bajas abiertas, hasta hoy.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        <section style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', padding: '10px 14px' }}>
          <strong style={{ color: '#1f3864' }}>Cómo se producen</strong>
          {porForma.length === 0 ? <p style={{ color: '#55616b' }}>Sin datos.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 6 }}><tbody>
              {porForma.map(([x, n]) => <tr key={x} style={{ borderTop: '1px solid #eef1f3' }}><td style={{ padding: '4px 0' }}>{x}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{n}</td></tr>)}
            </tbody></table>
          )}
        </section>
        <section style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', padding: '10px 14px' }}>
          <strong style={{ color: '#1f3864' }}>Por centro</strong>
          {porCentro.length === 0 ? <p style={{ color: '#55616b' }}>Sin datos.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 6 }}>
              <thead><tr style={{ textAlign: 'left', color: '#55616b' }}><th>Centro</th><th style={{ textAlign: 'right' }}>Con baja</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
              <tbody>{porCentro.map(([c, l]) => <tr key={c.id} style={{ borderTop: '1px solid #eef1f3' }}><td style={{ padding: '4px 0' }}>{c.codigo} · {c.nombre}</td><td style={{ textAlign: 'right' }}>{l.filter((s) => s.tipo === 'accidente_baja').length}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{l.length}</td></tr>)}</tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}

export default function Accidentes({ supabase }) {
  const [pestana, setPestana] = useState('registro')
  const [sucesos, setSucesos] = useState(null)
  const [centros, setCentros] = useState([])
  const [abierto, setAbierto] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    Promise.all([supabase.from('inc_sucesos').select('*').order('fecha', { ascending: false }), supabase.from('centros').select('id,codigo,nombre').order('codigo')])
      .then(([s, c]) => { if (s.error) { setError(explicar(s.error)); setSucesos([]) } else setSucesos(s.data); setCentros(c.data ?? []) })
  }, [supabase])
  const suceso = sucesos?.find((s) => s.id === abierto)
  async function borrar(s) {
    const { error: e } = await supabase.from('inc_sucesos').delete().eq('id', s.id)
    if (e) setError(explicar(e)); else { setSucesos(sucesos.filter((x) => x.id !== s.id)); setAbierto(null) }
  }
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ marginBottom: 4 }}>Accidentes e incidentes</h2>
      <p style={{ margin: '0 0 14px', color: '#55616b' }}>Registro e investigación de accidentes, incidentes y enfermedades profesionales, parte Delt@ e índices de siniestralidad (art. 16.3 de la Ley 31/1995; ISO 45001, 10.2). Las agresiones se registran en su propio apartado; si causan baja, regístralas también aquí como accidente.</p>
      {!suceso && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, borderBottom: '1px solid #d9dfe3', paddingBottom: 8 }}>
          {[['registro', 'Registro'], ['indices', 'Índices de siniestralidad']].map(([k, t]) => <button key={k} className="secundario" onClick={() => setPestana(k)} style={pestanaEstilo(pestana === k)}>{t}</button>)}
        </div>
      )}
      {error && <p style={aviso}>{error}</p>}
      {!sucesos ? <p>Cargando...</p> : suceso
        ? <Ficha supabase={supabase} suceso={suceso} centros={centros} onVolver={() => setAbierto(null)} onBorrar={borrar} onGuardado={(n) => setSucesos(sucesos.map((x) => (x.id === n.id ? n : x)))} />
        : pestana === 'registro' ? <Registro supabase={supabase} sucesos={sucesos} setSucesos={setSucesos} centros={centros} onAbrir={setAbierto} />
          : <Indicadores supabase={supabase} sucesos={sucesos} centros={centros} />}
    </div>
  )
}
