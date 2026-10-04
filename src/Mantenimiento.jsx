import { useEffect, useMemo, useState } from 'react'
import { ESTADOS, RESULTADOS, actuacionesDe, estadoActuacion, fechaCorta, hoyISO, leerPeriodo, textoPeriodo } from './mantLogic'

// Mantenimiento legal e inspecciones de las instalaciones de cada centro (REBT, RIPCI, RITE, ascensores, legionela...).
// Calendario de todos los centros, ficha de instalaciones por centro y catálogo con los reglamentos.
const BUCKET = 'mantenimiento'
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const FALTA = 'Falta ejecutar migracion_mantenimiento.sql en Supabase'
const explicar = (e) => (/mant_|does not exist|schema cache|Bucket not found/i.test(e?.message ?? '') ? FALTA : e?.message ?? String(e))
const quitar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const slug = (s) => quitar(s).replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'documento'

function Chip({ e, children }) {
  return <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 10, color: e.color, background: e.fondo, whiteSpace: 'nowrap' }}>{children ?? e.texto}</span>
}
const pestanaEstilo = (activa) => (activa ? { background: '#1f3864', color: '#fff', borderColor: '#1f3864' } : undefined)

// ---------- Registrar una revisión o inspección ----------
function FormRegistro({ supabase, inst, act, onGuardado, onCancelar }) {
  const [f, setF] = useState({ fecha: hoyISO(), resultado: 'favorable', defectos: '', subsanar_antes: '', empresa: inst.empresa ?? '' })
  const [archivo, setArchivo] = useState(null)
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState('')
  async function guardar() {
    setError(''); setTrabajando(true)
    let ruta = null
    try {
      if (archivo) {
        ruta = `${inst.centro_id}/${inst.id}/${Date.now()}-${slug(archivo.name)}`
        const { error: e1 } = await supabase.storage.from(BUCKET).upload(ruta, archivo, { contentType: archivo.type || 'application/octet-stream' })
        if (e1) throw e1
      }
      const fila = {
        instalacion_id: inst.id, actuacion_id: act.id, fecha: f.fecha, resultado: f.resultado, empresa: f.empresa.trim() || null,
        defectos: f.resultado === 'favorable' ? null : f.defectos.trim() || null,
        subsanar_antes: f.resultado === 'favorable' ? null : f.subsanar_antes || null,
        ruta, nombre_archivo: archivo?.name ?? null,
      }
      const { data, error: e2 } = await supabase.from('mant_registros').insert(fila).select('*').single()
      if (e2) { if (ruta) await supabase.storage.from(BUCKET).remove([ruta]); throw e2 }
      onGuardado(data)
    } catch (e) { setError(explicar(e)) }
    setTrabajando(false)
  }
  return (
    <div style={{ margin: '6px 0 10px', padding: 10, background: '#f5f7f9', border: '1px solid #d9dfe3', borderRadius: 8, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <strong style={{ flexBasis: '100%', color: '#1f3864' }}>Registrar: {act.nombre}</strong>
      <label>Fecha<br /><input type="date" value={f.fecha} max={hoyISO()} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></label>
      <label>Resultado<br />
        <select value={f.resultado} onChange={(e) => setF({ ...f, resultado: e.target.value })}>{Object.entries(RESULTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </label>
      <label style={{ flex: '1 1 200px' }}>Empresa u organismo<br /><input value={f.empresa} onChange={(e) => setF({ ...f, empresa: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
      {f.resultado !== 'favorable' && (
        <>
          <label style={{ flex: '2 1 300px' }}>Defectos detectados<br /><textarea rows={2} value={f.defectos} onChange={(e) => setF({ ...f, defectos: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
          <label>Subsanar antes de<br /><input type="date" value={f.subsanar_antes} onChange={(e) => setF({ ...f, subsanar_antes: e.target.value })} /></label>
        </>
      )}
      <label style={{ flex: '1 1 220px' }}>Certificado o acta (opcional)<br /><input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setArchivo(e.target.files[0] ?? null)} /></label>
      <button onClick={guardar} disabled={trabajando || !f.fecha}>{trabajando ? 'Guardando...' : 'Guardar'}</button>
      <button className="secundario" onClick={onCancelar} disabled={trabajando}>Cancelar</button>
      {error && <p style={{ ...aviso, flexBasis: '100%', margin: 0 }}>{error}</p>}
    </div>
  )
}

// ---------- Una instalación con sus actuaciones ----------
function TarjetaInstalacion({ supabase, inst, tipo, actuaciones, registros, onInst, onRegistro, onBorrar }) {
  const [registrando, setRegistrando] = useState(null)
  const [historial, setHistorial] = useState(null)
  const [editando, setEditando] = useState(false)
  const [datos, setDatos] = useState({ nombre: inst.nombre ?? '', empresa: inst.empresa ?? '', observaciones: inst.observaciones ?? '' })
  const [error, setError] = useState('')
  const todas = actuaciones.filter((a) => a.tipo === inst.tipo)
  const aplican = actuacionesDe(inst, actuaciones)

  async function actualizar(cambios) {
    setError('')
    const { data, error: e } = await supabase.from('mant_instalaciones').update(cambios).eq('id', inst.id).select('*').single()
    if (e) setError(explicar(e)); else onInst(data)
  }
  const alternarAplica = (id) => {
    const off = new Set(inst.actuaciones_off ?? [])
    if (off.has(id)) off.delete(id); else off.add(id)
    actualizar({ actuaciones_off: [...off] })
  }
  function cambiarPeriodo(act) {
    const actual = textoPeriodo(inst.dias_propios?.[act.id] ?? act.dias)
    const t = window.prompt(`Periodicidad de «${act.nombre}» en esta instalación.\nEscribe por ejemplo «30 días», «6 meses» o «5 años». Déjalo vacío para volver al valor del catálogo (${textoPeriodo(act.dias)}).`, actual)
    if (t === null) return
    const propios = { ...(inst.dias_propios ?? {}) }
    if (!t.trim()) delete propios[act.id]
    else {
      const d = leerPeriodo(t)
      if (!d) { setError('No entiendo esa periodicidad. Usa, por ejemplo, «6 meses» o «5 años».'); return }
      propios[act.id] = d
    }
    actualizar({ dias_propios: propios })
  }
  async function verDocumento(r) {
    const { data, error: e } = await supabase.storage.from(BUCKET).createSignedUrl(r.ruta, 120)
    if (e) setError(explicar(e)); else window.open(data.signedUrl, '_blank', 'noopener')
  }
  async function subsanar(r) {
    const f = window.prompt('Fecha de subsanación (AAAA-MM-DD):', hoyISO())
    if (!f) return
    const { data, error: e } = await supabase.from('mant_registros').update({ subsanado_en: f }).eq('id', r.id).select('*').single()
    if (e) setError(explicar(e)); else onRegistro(data)
  }

  return (
    <section style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', marginBottom: 14, overflow: 'hidden', opacity: inst.activa ? 1 : 0.6 }}>
      <div style={{ padding: '10px 14px', background: '#f3f6fb', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px' }}>
          <strong style={{ color: '#1f3864' }}>{inst.nombre || tipo?.nombre}</strong>
          {inst.nombre && <span style={{ color: '#55616b' }}> · {tipo?.nombre}</span>}
          <div style={{ fontSize: 13, color: '#55616b' }}>{tipo?.reglamento}{inst.empresa ? ` · Mantenedora: ${inst.empresa}` : ''}</div>
        </div>
        <button className="secundario" onClick={() => setEditando(!editando)}>{editando ? 'Cerrar' : 'Datos'}</button>
      </div>
      {editando && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid #e2e7ea', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ flex: '1 1 200px' }}>Nombre (p. ej. «Ascensor 1»)<br /><input value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
          <label style={{ flex: '1 1 200px' }}>Empresa mantenedora<br /><input value={datos.empresa} onChange={(e) => setDatos({ ...datos, empresa: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
          <label style={{ flex: '2 1 300px' }}>Observaciones (potencia, categoría, ubicación...)<br /><input value={datos.observaciones} onChange={(e) => setDatos({ ...datos, observaciones: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
          <button onClick={() => actualizar({ nombre: datos.nombre.trim() || null, empresa: datos.empresa.trim() || null, observaciones: datos.observaciones.trim() || null })}>Guardar</button>
          <button className="secundario" onClick={() => actualizar({ activa: !inst.activa })}>{inst.activa ? 'Dar de baja' : 'Reactivar'}</button>
          <button className="secundario" onClick={() => { if (window.confirm('¿Borrar la instalación y todos sus registros?')) onBorrar(inst) }}>Borrar</button>
          {tipo?.nota && <p style={{ flexBasis: '100%', margin: 0, fontSize: 13, color: '#55616b' }}>{tipo.nota}</p>}
          <div style={{ flexBasis: '100%', fontSize: 13 }}>
            <strong>Actuaciones que aplican:</strong>{' '}
            {todas.map((a) => (
              <label key={a.id} style={{ marginRight: 14, whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={!(inst.actuaciones_off ?? []).includes(a.id)} onChange={() => alternarAplica(a.id)} /> {a.nombre}
              </label>
            ))}
          </div>
        </div>
      )}
      {error && <p style={{ ...aviso, margin: '8px 14px' }}>{error}</p>}
      {aplican.map((a) => {
        const est = estadoActuacion(inst, a, registros)
        return (
          <div key={a.id} style={{ borderTop: '1px solid #e2e7ea', padding: '9px 14px' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 280px' }}>
                <strong style={{ fontWeight: 600 }}>{a.nombre}</strong>{' '}
                {a.oca && <span style={{ fontSize: 11, fontWeight: 700, color: '#1f3864', border: '1px solid #1f3864', borderRadius: 8, padding: '0 5px' }}>OCA</span>}{' '}
                {!a.obligatoria && <span style={{ fontSize: 11, color: '#55616b' }}>(recomendada)</span>}
                <div style={{ fontSize: 13, color: '#55616b' }}>
                  {textoPeriodo(est.dias)}{inst.dias_propios?.[a.id] ? ' (propia)' : ''}{a.comprobar && !inst.dias_propios?.[a.id] ? ' · comprueba la periodicidad de esta instalación' : ''}
                  {a.quien ? ` · ${a.quien}` : ''}
                </div>
              </div>
              <div style={{ fontSize: 13, minWidth: 170 }}>
                Última: <b>{est.ultima ? fechaCorta(est.ultima.fecha) : '—'}</b><br />Próxima: <b>{est.proxima ? fechaCorta(est.proxima) : '—'}</b>
              </div>
              <Chip e={est} />
              {est.defectos.length > 0 && <Chip e={ESTADOS.vencida}>{est.defectos.length} con defectos</Chip>}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setRegistrando(registrando === a.id ? null : a.id)}>Registrar</button>
                <button className="secundario" onClick={() => cambiarPeriodo(a)} title="Cambiar la periodicidad en esta instalación">Periodicidad</button>
                {est.regs.length > 0 && <button className="secundario" onClick={() => setHistorial(historial === a.id ? null : a.id)}>Historial</button>}
              </div>
            </div>
            {registrando === a.id && <FormRegistro supabase={supabase} inst={inst} act={a} onCancelar={() => setRegistrando(null)} onGuardado={(r) => { onRegistro(r); setRegistrando(null) }} />}
            {historial === a.id && (
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13 }}>
                {est.regs.map((r) => (
                  <li key={r.id} style={{ marginBottom: 4 }}>
                    {fechaCorta(r.fecha)} · {RESULTADOS[r.resultado]}{r.empresa ? ` · ${r.empresa}` : ''}
                    {r.defectos && <> · <span style={{ color: '#b3261e' }}>{r.defectos}</span>{r.subsanar_antes ? ` (antes del ${fechaCorta(r.subsanar_antes)})` : ''}</>}
                    {r.subsanado_en && <span style={{ color: '#1b6e3c' }}> · subsanado el {fechaCorta(r.subsanado_en)}</span>}{' '}
                    {r.ruta && <button className="secundario" style={{ fontSize: 12, padding: '1px 6px' }} onClick={() => verDocumento(r)}>Ver documento</button>}{' '}
                    {r.resultado !== 'favorable' && !r.subsanado_en && <button className="secundario" style={{ fontSize: 12, padding: '1px 6px' }} onClick={() => subsanar(r)}>Marcar subsanado</button>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
      {aplican.length === 0 && <p style={{ margin: 0, padding: '10px 14px', color: '#55616b' }}>No hay actuaciones activas: actívalas en «Datos».</p>}
    </section>
  )
}

// ---------- Instalaciones de un centro ----------
function PorCentro({ supabase, centro, datos, setDatos }) {
  const [nuevoTipo, setNuevoTipo] = useState('')
  const [error, setError] = useState('')
  const insts = datos.instalaciones.filter((i) => i.centro_id === centro.id)
  const yaTiene = new Set(insts.map((i) => i.tipo))

  async function anadir(tipos) {
    setError('')
    const filas = tipos.map((t) => ({ centro_id: centro.id, tipo: t }))
    const { data, error: e } = await supabase.from('mant_instalaciones').insert(filas).select('*')
    if (e) setError(explicar(e)); else { setDatos({ ...datos, instalaciones: [...datos.instalaciones, ...data] }); setNuevoTipo('') }
  }
  async function borrar(inst) {
    const { error: e } = await supabase.from('mant_instalaciones').delete().eq('id', inst.id)
    if (e) setError(explicar(e)); else setDatos({ ...datos, instalaciones: datos.instalaciones.filter((i) => i.id !== inst.id), registros: datos.registros.filter((r) => r.instalacion_id !== inst.id) })
  }
  const onInst = (n) => setDatos({ ...datos, instalaciones: datos.instalaciones.map((i) => (i.id === n.id ? n : i)) })
  const onRegistro = (r) => setDatos({ ...datos, registros: [...datos.registros.filter((x) => x.id !== r.id), r] })
  const habituales = ['bt', 'pci', 'rite', 'leg']

  return (
    <div>
      <h3 style={{ margin: '0 0 10px' }}>{centro.codigo} · {centro.nombre}</h3>
      {error && <p style={aviso}>{error}</p>}
      {insts.length === 0 && (
        <div style={{ border: '1px dashed #9fb0bf', borderRadius: 8, padding: 14, marginBottom: 14, background: '#fbfcfd' }}>
          <p style={{ marginTop: 0 }}>Este centro aún no tiene instalaciones registradas. Casi todos los centros tienen al menos electricidad, protección contra incendios, instalaciones térmicas y agua sanitaria.</p>
          <button onClick={() => anadir(habituales)}>Añadir las cuatro habituales</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)}>
          <option value="">Añadir instalación...</option>
          {datos.tipos.map((t) => <option key={t.codigo} value={t.codigo}>{t.nombre}{yaTiene.has(t.codigo) ? ' (ya hay una)' : ''}</option>)}
        </select>
        <button onClick={() => anadir([nuevoTipo])} disabled={!nuevoTipo}>Añadir</button>
      </div>
      {insts.sort((a, b) => (datos.tipos.findIndex((t) => t.codigo === a.tipo) - datos.tipos.findIndex((t) => t.codigo === b.tipo)) || a.id - b.id).map((i) => (
        <TarjetaInstalacion key={i.id} supabase={supabase} inst={i} tipo={datos.tipos.find((t) => t.codigo === i.tipo)} actuaciones={datos.actuaciones}
          registros={datos.registros} onInst={onInst} onRegistro={onRegistro} onBorrar={borrar} />
      ))}
    </div>
  )
}

// ---------- Calendario de todos los centros ----------
function Calendario({ datos, onAbrirCentro }) {
  const [filtro, setFiltro] = useState('pendientes')
  const [busca, setBusca] = useState('')
  const filas = useMemo(() => {
    const out = []
    for (const inst of datos.instalaciones.filter((i) => i.activa)) {
      const centro = datos.centros.find((c) => c.id === inst.centro_id)
      const tipo = datos.tipos.find((t) => t.codigo === inst.tipo)
      for (const a of actuacionesDe(inst, datos.actuaciones)) out.push({ inst, centro, tipo, a, est: estadoActuacion(inst, a, datos.registros) })
    }
    const q = quitar(busca.trim())
    return out
      .filter((f) => !q || quitar(`${f.centro?.codigo} ${f.centro?.nombre} ${f.tipo?.nombre} ${f.inst.nombre} ${f.a.nombre}`).includes(q))
      .filter((f) => (filtro === 'todas' ? true : filtro === 'defectos' ? f.est.defectos.length > 0 : filtro === 'pendientes' ? ['vencida', 'proxima', 'sin_datos', 'sin_periodo'].includes(f.est.clave) || f.est.defectos.length > 0 : f.est.clave === filtro))
      .sort((x, y) => (x.est.orden - y.est.orden) || String(x.est.proxima ?? '9').localeCompare(String(y.est.proxima ?? '9')))
  }, [datos, filtro, busca])
  const cuenta = (k) => datos.instalaciones.filter((i) => i.activa).flatMap((i) => actuacionesDe(i, datos.actuaciones).map((a) => estadoActuacion(i, a, datos.registros))).filter((e) => e.clave === k).length
  const centrosSin = datos.centros.filter((c) => !datos.instalaciones.some((i) => i.centro_id === c.id)).length

  return (
    <div>
      <p style={{ margin: '0 0 10px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip e={ESTADOS.vencida}>{cuenta('vencida')} vencidas</Chip>
        <Chip e={ESTADOS.proxima}>{cuenta('proxima')} próximas</Chip>
        <Chip e={ESTADOS.sin_datos}>{cuenta('sin_datos')} sin registro</Chip>
        {centrosSin > 0 && <Chip e={ESTADOS.sin_periodo}>{centrosSin} centros sin instalaciones registradas</Chip>}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <input type="search" placeholder="Buscar centro, instalación o actuación" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ padding: '7px 10px', flex: '1 1 260px', maxWidth: 380 }} />
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="pendientes">Pendientes de atender</option>
          <option value="vencida">Vencidas</option>
          <option value="proxima">Próximas</option>
          <option value="sin_datos">Sin registro</option>
          <option value="defectos">Con defectos sin subsanar</option>
          <option value="todas">Todas</option>
        </select>
      </div>
      {filas.length === 0 && <p className="vacio">{datos.instalaciones.length ? 'No hay nada pendiente con este filtro.' : 'Todavía no hay instalaciones registradas. Empieza en «Por centro».'}</p>}
      {filas.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: 6 }}>Centro</th><th style={{ padding: 6 }}>Instalación</th><th style={{ padding: 6 }}>Actuación</th><th style={{ padding: 6 }}>Última</th><th style={{ padding: 6 }}>Próxima</th><th style={{ padding: 6 }}>Estado</th>
            </tr></thead>
            <tbody>
              {filas.map((f) => (
                <tr key={`${f.inst.id}-${f.a.id}`} onClick={() => onAbrirCentro(f.centro)} style={{ borderBottom: '1px solid #e5e5e5', cursor: 'pointer' }}>
                  <td style={{ padding: 6 }}>{f.centro?.codigo} · {f.centro?.nombre}</td>
                  <td style={{ padding: 6 }}>{f.inst.nombre || f.tipo?.nombre}</td>
                  <td style={{ padding: 6 }}>{f.a.nombre}{f.a.oca ? ' (OCA)' : ''}</td>
                  <td style={{ padding: 6, whiteSpace: 'nowrap' }}>{f.est.ultima ? fechaCorta(f.est.ultima.fecha) : '—'}</td>
                  <td style={{ padding: 6, whiteSpace: 'nowrap' }}>{f.est.proxima ? fechaCorta(f.est.proxima) : '—'}</td>
                  <td style={{ padding: 6 }}><Chip e={f.est} />{f.est.defectos.length > 0 && <> <Chip e={ESTADOS.vencida}>defectos</Chip></>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Catalogo({ datos }) {
  return (
    <div style={{ maxWidth: 980 }}>
      <p style={{ marginTop: 0 }}>Periodicidades de partida de cada reglamento. Las marcadas «comprobar» dependen de la potencia, la categoría o el plan del centro: ajústalas en cada instalación con «Periodicidad».</p>
      {datos.tipos.map((t) => (
        <section key={t.codigo} style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', marginBottom: 12, padding: '10px 14px' }}>
          <strong style={{ color: '#1f3864' }}>{t.nombre}</strong>
          <div style={{ fontSize: 13, color: '#55616b' }}>{t.reglamento}{t.nota ? ` · ${t.nota}` : ''}</div>
          <ul style={{ margin: '6px 0 0', fontSize: 14 }}>
            {datos.actuaciones.filter((a) => a.tipo === t.codigo).map((a) => (
              <li key={a.id}>{a.nombre}: <b>{textoPeriodo(a.dias)}</b>{a.oca ? ' · organismo de control' : ''}{!a.obligatoria ? ' · recomendada' : ''}{a.comprobar ? ' · comprobar' : ''}{a.nota ? ` · ${a.nota}` : ''}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default function Mantenimiento({ supabase }) {
  const [pestana, setPestana] = useState('calendario')
  const [datos, setDatos] = useState(null)
  const [centroId, setCentroId] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    (async () => {
      const r = await Promise.all([
        supabase.from('centros').select('id,codigo,nombre').order('codigo'),
        supabase.from('mant_tipos').select('*').order('orden'),
        supabase.from('mant_actuaciones').select('*').order('orden'),
        supabase.from('mant_instalaciones').select('*'),
        supabase.from('mant_registros').select('*'),
      ])
      const e = r.find((x) => x.error)?.error
      if (e) { setError(explicar(e)); return }
      setDatos({ centros: r[0].data, tipos: r[1].data, actuaciones: r[2].data, instalaciones: r[3].data, registros: r[4].data })
    })()
  }, [supabase])

  const centro = datos?.centros.find((c) => String(c.id) === String(centroId))
  return (
    <div style={{ textAlign: 'left' }}>
      <h2 style={{ marginBottom: 4 }}>Mantenimiento legal de instalaciones</h2>
      <p style={{ margin: '0 0 14px', color: '#55616b' }}>Revisiones e inspecciones reglamentarias de las instalaciones de cada centro, con sus certificados y defectos (ISO 45001, 8.1 y 9.1.2).</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, borderBottom: '1px solid #d9dfe3', paddingBottom: 8 }}>
        {[['calendario', 'Calendario'], ['centro', 'Por centro'], ['catalogo', 'Catálogo y reglamentos']].map(([k, t]) => (
          <button key={k} className="secundario" onClick={() => setPestana(k)} style={pestanaEstilo(pestana === k)}>{t}</button>
        ))}
      </div>
      {error && <p style={aviso}>{error}</p>}
      {!datos && !error && <p>Cargando...</p>}
      {datos && pestana === 'calendario' && <Calendario datos={datos} onAbrirCentro={(c) => { setCentroId(c.id); setPestana('centro') }} />}
      {datos && pestana === 'centro' && (
        <>
          <p>
            <select value={centroId} onChange={(e) => setCentroId(e.target.value)} style={{ minWidth: 300 }}>
              <option value="">Elige un centro...</option>
              {datos.centros.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}{datos.instalaciones.some((i) => i.centro_id === c.id) ? '' : ' (sin instalaciones)'}</option>)}
            </select>
          </p>
          {centro && <PorCentro supabase={supabase} centro={centro} datos={datos} setDatos={setDatos} />}
        </>
      )}
      {datos && pestana === 'catalogo' && <Catalogo datos={datos} />}
    </div>
  )
}
