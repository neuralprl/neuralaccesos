import { useEffect, useMemo, useRef, useState } from 'react'
import { COLOR_VR, ETIQUETA_VR } from './evalLogic'
import { PREGUNTAS, RESPUESTAS, RIESGOS_EQ } from './equiposContenido'
import { baseDe, elementoNuevo, estadoInicial, incidencias, medidasDe, resumenEquipos, siguienteCodigo, vrElemento } from './equiposLogic'
import { descargar, htmlEquipos, imprimir, nombreArchivoEquipos, wordEquipos } from './documentos'
import { fechaES, hoyISO } from './planLogic'

// Evaluación de equipos de trabajo e instalaciones del centro (equipos e instalaciones por separado).
// Técnico: <EquiposInstalaciones supabase={supabase} />
// Centro:  <EquiposInstalaciones supabase={supabase} centroFijo={centro} soloLectura soloPdf />
// Las medidas pasan al PAP del centro al abrir el PAP o al cerrar la evaluación del centro.

const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const sin = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const OPC_P = [['B', 'Baja'], ['M', 'Media'], ['A', 'Alta']]
const OPC_C = [['LD', 'Ligeramente dañina'], ['D', 'Dañina'], ['ED', 'Extremadamente dañina']]
const CAMPOS = ['codigo', 'tipo', 'nombre', 'presente', 'respuestas', 'riesgos', 'otros_riesgos', 'p', 'c', 'ubicacion', 'marca_modelo', 'observaciones']

function Boton({ activo, onClick, children, disabled, color = '#1f3864', title }) {
  return (
    <button type="button" className="secundario" aria-pressed={activo} disabled={disabled} onClick={onClick} title={title}
      style={{ padding: '4px 10px', fontSize: 13, ...(activo ? { background: color, color: '#fff', borderColor: color, fontWeight: 700 } : {}) }}>
      {children}
    </button>
  )
}

function VR({ el }) {
  const vr = vrElemento(el)
  return <span title={ETIQUETA_VR[vr]} style={{ padding: '2px 9px', borderRadius: 12, fontSize: 12, fontWeight: 700, color: '#fff', background: COLOR_VR[vr] ?? '#9e9e9e' }}>{vr}</span>
}

function Tarjeta({ el, onCambio, onQuitar, soloLectura, centro }) {
  const [mas, setMas] = useState(false)
  const base = baseDe(el.codigo)
  const inc = incidencias(el)
  const cambiar = (parche) => onCambio({ ...el, ...parche })
  const resp = (k, v) => cambiar({ respuestas: { ...el.respuestas, [k]: v } })
  const riesgo = (k) => cambiar({ riesgos: el.riesgos.includes(k) ? el.riesgos.filter((x) => x !== k) : [...el.riesgos, k] })
  const sugerencia = base?.sugerido ? (base.sugerido(centro ?? {}) ? `Propuesto: ${base.porque}.` : `No propuesto: según la ficha, ${base.porque.replace(/^el centro tiene|^la ficha del centro indica/, 'no consta')}.`) : ''

  return (
    <div style={{ border: '1px solid #d9dfe3', borderLeft: `5px solid ${!el.presente ? '#bdbdbd' : inc.length ? '#ef6c00' : '#2e7d32'}`, borderRadius: 8, padding: '10px 14px', marginBottom: 10, background: el.presente ? '#fff' : '#f7f7f7' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style={{ flex: '1 1 220px' }}>{el.codigo} · {el.nombre}</strong>
        {el.presente && <VR el={el} />}
        {el.presente && <span style={{ fontSize: 13, fontWeight: 600, color: inc.length ? '#ef6c00' : '#2e7d32' }}>{inc.length ? `${inc.length} ${inc.length === 1 ? 'incidencia' : 'incidencias'}` : 'Conforme'}</span>}
        {!el.presente && <span style={{ fontSize: 13, opacity: 0.7 }}>No hay en el centro</span>}
      </div>

      {!soloLectura && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', margin: '8px 0' }}>
          <span style={{ fontSize: 13 }}>{base?.fijo ? 'Equipo o instalación fija.' : '¿Hay en el centro?'}</span>
          <Boton activo={el.presente} onClick={() => cambiar({ presente: true })}>Sí</Boton>
          <Boton activo={!el.presente} onClick={() => cambiar({ presente: false })} color="#757575" title={base?.fijo ? 'Solo si de verdad no existe en este centro' : ''}>No</Boton>
          {sugerencia && <small style={{ opacity: 0.7 }}>{sugerencia}</small>}
          {onQuitar && <button type="button" className="secundario" style={{ marginLeft: 'auto', color: '#b00020', fontSize: 13 }} onClick={onQuitar}>Quitar</button>}
        </div>
      )}

      {el.presente && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '6px 18px', margin: '6px 0' }}>
            {PREGUNTAS[el.tipo].map((q, i) => (
              <div key={q.k} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, flex: '1 1 auto' }}>{i + 1}. {q.texto}</span>
                {q.opciones.map((o) => (
                  <Boton key={o} disabled={soloLectura} activo={el.respuestas?.[q.k] === o} onClick={() => resp(q.k, o)} color={o === 'no' ? '#c62828' : o === 'si' ? '#2e7d32' : '#5c6bc0'}>{RESPUESTAS[o]}</Boton>
                ))}
              </div>
            ))}
          </div>

          <div style={{ margin: '8px 0 4px', fontSize: 13 }}><b>Riesgos</b> (pulsa para quitar los que no se dan)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {RIESGOS_EQ.map((r) => <Boton key={r.k} disabled={soloLectura} activo={el.riesgos.includes(r.k)} onClick={() => riesgo(r.k)} color="#b8860b">{r.nombre}</Boton>)}
          </div>
          {el.riesgos.includes('otros') && (
            <input disabled={soloLectura} value={el.otros_riesgos ?? ''} onChange={(e) => cambiar({ otros_riesgos: e.target.value })} placeholder="Otros riesgos: descríbelos si los hay (por ejemplo, explosión, fuga de gas refrigerante)"
              style={{ width: '100%', boxSizing: 'border-box', marginTop: 6 }} />
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            <span style={{ fontSize: 13 }}><b>Valoración</b></span>
            <select disabled={soloLectura} value={el.p} onChange={(e) => cambiar({ p: e.target.value })} aria-label="Probabilidad">{OPC_P.map(([k, t]) => <option key={k} value={k}>P {k} · {t}</option>)}</select>
            <select disabled={soloLectura} value={el.c} onChange={(e) => cambiar({ c: e.target.value })} aria-label="Consecuencias">{OPC_C.map(([k, t]) => <option key={k} value={k}>C {k} · {t}</option>)}</select>
            <VR el={el} />
            <button type="button" className="secundario" style={{ marginLeft: 'auto', fontSize: 13 }} onClick={() => setMas(!mas)}>{mas ? 'Ocultar datos y medidas' : 'Datos del equipo y medidas'}</button>
          </div>

          {mas && (
            <div style={{ marginTop: 8, borderTop: '1px dashed #d9dfe3', paddingTop: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                <input disabled={soloLectura} value={el.ubicacion ?? ''} onChange={(e) => cambiar({ ubicacion: e.target.value })} placeholder="Ubicación (planta, sala)" />
                <input disabled={soloLectura} value={el.marca_modelo ?? ''} onChange={(e) => cambiar({ marca_modelo: e.target.value })} placeholder="Marca, modelo o empresa mantenedora" />
              </div>
              <textarea disabled={soloLectura} value={el.observaciones ?? ''} onChange={(e) => cambiar({ observaciones: e.target.value })} placeholder="Observaciones" rows={2} style={{ width: '100%', boxSizing: 'border-box', marginTop: 8 }} />
              <div style={{ fontSize: 13, marginTop: 6 }}><b>Medidas</b>{base?.legal ? <span style={{ opacity: 0.7 }}> · {base.legal}</span> : ''}</div>
              <ul style={{ margin: '4px 0 0', fontSize: 14 }}>
                {medidasDe(el).map((m, i) => <li key={i} style={{ fontWeight: m.correctiva ? 700 : 400 }}>{m.t}</li>)}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ElegirCentro({ centros, resumenes, onElegir }) {
  const [q, setQ] = useState('')
  const vis = centros.filter((c) => !q || sin(`${c.codigo} ${c.nombre}`).includes(sin(q)))
  return (
    <>
      <input type="search" placeholder="Buscar centro" value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: '7px 10px', margin: '0 0 12px', width: '100%', maxWidth: 360, boxSizing: 'border-box' }} />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}><th style={{ padding: 8 }}>Centro</th><th style={{ padding: 8 }}>Última evaluación</th><th style={{ padding: 8 }}>Incidencias</th><th style={{ padding: 8 }} /></tr></thead>
          <tbody>
            {vis.map((c) => {
              const r = resumenes[c.id]
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: 8 }}>{c.codigo} · {c.nombre}</td>
                  <td style={{ padding: 8 }}>{r ? fechaES(r.fecha) : <span style={{ opacity: 0.6 }}>Sin evaluar</span>}</td>
                  <td style={{ padding: 8, color: r?.incidencias ? '#ef6c00' : undefined, fontWeight: r?.incidencias ? 700 : 400 }}>{r ? r.incidencias : '—'}</td>
                  <td style={{ padding: 8 }}><button className="secundario" onClick={() => onElegir(c)}>{r ? 'Abrir' : 'Evaluar'}</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// pestanaInicial: 'equipo' o 'instalacion'. altaRapida: abre con el cursor en «registrar nuevo» (visita guiada).
export default function EquiposInstalaciones({ supabase, centroFijo = null, soloLectura = false, soloPdf = false, pestanaInicial = 'equipo', altaRapida = false }) {
  const [centros, setCentros] = useState(null)
  const [resumenes, setResumenes] = useState({})
  const [centro, setCentro] = useState(centroFijo)
  const [lista, setLista] = useState(null)
  const [fecha, setFecha] = useState(hoyISO())
  const [pestana, setPestana] = useState(pestanaInicial)
  const altaRef = useRef(null)
  const [sucio, setSucio] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')

  const migracion = (m) => (/equipos_evaluacion/.test(m ?? '') ? 'Falta ampliar la base de datos: ejecuta migracion_cambios_equipos.sql en el SQL Editor de Supabase.' : m)

  useEffect(() => {
    if (centroFijo) return
    Promise.all([
      supabase.from('centros').select('*').order('codigo'),
      supabase.from('equipos_evaluacion').select('centro_id,tipo,presente,respuestas,fecha'),
    ]).then(([a, b]) => {
      if (a.error) { setError(a.error.message); return }
      setCentros(a.data)
      if (b.error) { setError(migracion(b.error.message)); return }
      const r = {}
      b.data.forEach((x) => {
        const o = r[x.centro_id] ?? { fecha: x.fecha, incidencias: 0 }
        if (x.fecha > o.fecha) o.fecha = x.fecha
        if (x.presente) o.incidencias += incidencias(x).length
        r[x.centro_id] = o
      })
      setResumenes(r)
    })
  }, [supabase, centroFijo]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!centro) return
    setLista(null); setError(''); setMensaje(''); setSucio(false)
    ;(async () => {
      let ficha = centro
      if (centroFijo) {
        const f = await supabase.from('centros').select('*').eq('id', centro.id).maybeSingle()
        if (!f.error && f.data) ficha = f.data
      }
      const { data, error: err } = await supabase.from('equipos_evaluacion').select('*').eq('centro_id', centro.id)
      if (err) { setError(migracion(err.message)); setLista([]); return }
      setFecha(data.reduce((m, x) => (x.fecha > m ? x.fecha : m), data[0]?.fecha ?? hoyISO()))
      setLista(estadoInicial(data, ficha))
      if (ficha !== centro) setCentro(ficha)
    })()
  }, [centro?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function cambiar(el) { setLista((l) => l.map((x) => (x.codigo === el.codigo ? el : x))); setSucio(true); setMensaje('') }
  function quitar(el) { setLista((l) => l.filter((x) => x.codigo !== el.codigo)); setSucio(true) }
  function anadir() {
    const nombre = nuevoNombre.trim()
    if (!nombre) return
    const codigo = siguienteCodigo(lista, pestana)
    setLista((l) => [...l, { ...elementoNuevo({ codigo, tipo: pestana, nombre, fijo: true }), propio: true, nuevo: true }])
    setNuevoNombre(''); setSucio(true)
  }

  async function guardar() {
    setGuardando(true); setError('')
    try {
      const hoy = hoyISO()
      const filas = lista.map((el) => ({ centro_id: centro.id, ...Object.fromEntries(CAMPOS.map((k) => [k, el[k] ?? null])), fecha: hoy, updated_at: new Date().toISOString() }))
      const { error: err } = await supabase.from('equipos_evaluacion').upsert(filas, { onConflict: 'centro_id,codigo' })
      if (err) throw err
      const codigos = lista.map((x) => x.codigo)
      const { data: viejos } = await supabase.from('equipos_evaluacion').select('id,codigo').eq('centro_id', centro.id)
      const sobran = (viejos ?? []).filter((v) => !codigos.includes(v.codigo)).map((v) => v.id)
      if (sobran.length) await supabase.from('equipos_evaluacion').delete().in('id', sobran)
      setLista((l) => l.map((x) => ({ ...x, nuevo: false })))
      setFecha(hoy); setSucio(false)
      setMensaje('Guardado. Las medidas pasarán al PAP del centro al abrirlo o al cerrar la evaluación del centro.')
    } catch (e) { setError(migracion(e.message)) } finally { setGuardando(false) }
  }

  useEffect(() => {
    if (altaRapida && lista && altaRef.current) { altaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); altaRef.current.focus() }
  }, [altaRapida, !!lista]) // eslint-disable-line react-hooks/exhaustive-deps

  const visibles = useMemo(() => (lista ?? []).filter((x) => x.tipo === pestana && (!soloLectura || x.presente)), [lista, pestana, soloLectura])
  const r = lista ? resumenEquipos(lista) : null

  if (!centro) {
    return (
      <div style={{ textAlign: 'left' }}>
        <h2>Evaluación de equipos e instalaciones</h2>
        <p style={{ opacity: 0.8, marginTop: 0, maxWidth: 820 }}>Equipos de trabajo e instalaciones de cada centro, evaluados por separado: documentación, mantenimiento, riesgos y medidas. Las medidas pasan al PAP del centro.</p>
        {error && <p style={aviso}>{error}</p>}
        {!centros && !error && <p>Cargando...</p>}
        {centros && <ElegirCentro centros={centros} resumenes={resumenes} onElegir={setCentro} />}
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'left', maxWidth: 1000 }}>
      <h2>Evaluación de equipos e instalaciones</h2>
      <p style={{ marginTop: 0 }}><b>{centro.codigo} · {centro.nombre}</b>{lista?.some((x) => !x.nuevo) ? ` · evaluado el ${fechaES(fecha)}` : ' · sin evaluar todavía'}</p>
      {r && <p style={{ fontSize: 14 }}><b>{r.equipos}</b> equipos · <b>{r.instalaciones}</b> instalaciones · <b style={{ color: r.incidencias ? '#ef6c00' : undefined }}>{r.incidencias}</b> incidencias en {r.conIncidencias} elementos</p>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '8px 0 12px' }}>
        {!soloLectura && <button onClick={guardar} disabled={guardando || !sucio || !lista} style={{ padding: '8px 16px', fontWeight: 600 }}>{guardando ? 'Guardando...' : 'Guardar'}</button>}
        {!soloPdf && <button className="secundario" disabled={!lista} onClick={async () => { try { descargar(await wordEquipos(centro, lista, fecha), nombreArchivoEquipos(centro, 'docx')) } catch (e) { setError(e.message) } }}>Word</button>}
        <button className="secundario" disabled={!lista} onClick={() => { try { imprimir(htmlEquipos(centro, lista, fecha)) } catch (e) { setError(e.message) } }}>PDF</button>
        {!centroFijo && <button className="secundario" onClick={() => { if (sucio && !window.confirm('Hay cambios sin guardar. ¿Salir igualmente?')) return; setCentro(null); setLista(null) }}>Otro centro</button>}
        {sucio && <span style={{ color: '#8a6d00' }}>Hay cambios sin guardar.</span>}
      </div>
      {mensaje && <p style={{ color: '#2e7d32' }}>{mensaje}</p>}
      {error && <p style={aviso}>{error}</p>}

      <div role="tablist" style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[['equipo', 'Equipos de trabajo'], ['instalacion', 'Instalaciones']].map(([k, t]) => (
          <Boton key={k} activo={pestana === k} onClick={() => setPestana(k)}>{t} ({(lista ?? []).filter((x) => x.tipo === k && x.presente).length})</Boton>
        ))}
      </div>

      {!lista && !error && <p>Cargando...</p>}
      {visibles.map((el) => (
        <Tarjeta key={el.codigo} el={el} centro={centro} soloLectura={soloLectura} onCambio={cambiar} onQuitar={el.propio && !soloLectura ? () => quitar(el) : null} />
      ))}
      {lista && visibles.length === 0 && <p className="vacio">No hay {pestana === 'equipo' ? 'equipos' : 'instalaciones'}.</p>}

      {!soloLectura && lista && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <input ref={altaRef} onKeyDown={(e) => { if (e.key === 'Enter') anadir() }} value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder={pestana === 'equipo' ? 'Otro equipo (por ejemplo, secadora, plancha, cortadora)' : 'Otra instalación (por ejemplo, climatización, agua caliente)'} style={{ flex: '1 1 320px', maxWidth: 480 }} />
          <button className="secundario" onClick={anadir} disabled={!nuevoNombre.trim()}>Añadir {pestana === 'equipo' ? 'equipo' : 'instalación'}</button>
        </div>
      )}
    </div>
  )
}
