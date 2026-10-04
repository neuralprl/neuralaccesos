import { useEffect, useRef, useState } from 'react'
import { fechaES } from './planLogic'

// Firmas en pantalla de la evaluación del centro: técnico, dirección y acompañante (representante de los trabajadores).
// Se firma con el dedo, el lápiz o el ratón; las tres firmas se guardan juntas al final.
// Uso: <Firmas supabase={supabase} evc={evc} />

export const ROLES_FIRMA = [
  { rol: 'tecnico', titulo: 'Técnico de prevención' },
  { rol: 'direccion', titulo: 'Dirección del centro' },
  { rol: 'acompanante', titulo: 'Acompañante' },
]

function Lienzo({ onCambio, borrar }) {
  const ref = useRef(null)
  const dibujando = useRef(false)
  const vacio = useRef(true)
  useEffect(() => {
    const c = ref.current
    const r = window.devicePixelRatio || 1
    c.width = c.offsetWidth * r; c.height = c.offsetHeight * r
    const ctx = c.getContext('2d')
    ctx.scale(r, r); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111'
    vacio.current = true
    onCambio(null)
  }, [borrar]) // eslint-disable-line react-hooks/exhaustive-deps
  const punto = (e) => { const b = ref.current.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top] }
  const empezar = (e) => { e.preventDefault(); ref.current.setPointerCapture(e.pointerId); dibujando.current = true; const ctx = ref.current.getContext('2d'); const [x, y] = punto(e); ctx.beginPath(); ctx.moveTo(x, y) }
  const mover = (e) => { if (!dibujando.current) return; const ctx = ref.current.getContext('2d'); const [x, y] = punto(e); ctx.lineTo(x, y); ctx.stroke(); vacio.current = false }
  const terminar = () => { if (!dibujando.current) return; dibujando.current = false; if (!vacio.current) onCambio(ref.current.toDataURL('image/png')) }
  return (
    <canvas ref={ref} onPointerDown={empezar} onPointerMove={mover} onPointerUp={terminar} onPointerLeave={terminar}
      style={{ width: '100%', height: 130, border: '1px dashed #999', borderRadius: 6, background: '#fff', touchAction: 'none', cursor: 'crosshair', display: 'block' }} />
  )
}

export default function Firmas({ supabase, evc }) {
  const [guardadas, setGuardadas] = useState(null)
  const [nuevas, setNuevas] = useState({})          // rol -> dataURL
  const [nombres, setNombres] = useState({ tecnico: evc.tecnico_nombre || '', direccion: '', acompanante: evc.acompanante || '' })
  const [rehacer, setRehacer] = useState({})
  const [borrar, setBorrar] = useState({})
  const [estado, setEstado] = useState('')
  const [error, setError] = useState('')

  async function cargar() {
    const { data, error: err } = await supabase.from('firmas').select('*').eq('evaluacion_centro_id', evc.id)
    if (err) { setError(/firmas/.test(err.message) ? 'Falta ampliar la base de datos: ejecuta migracion_firmas_avisos.sql.' : err.message); setGuardadas({}); return }
    const m = Object.fromEntries(data.map((f) => [f.rol, f]))
    setGuardadas(m)
    setNombres((n) => ({ ...n, ...Object.fromEntries(data.filter((f) => f.nombre).map((f) => [f.rol, f.nombre])) }))
  }
  useEffect(() => { cargar() }, [evc.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function guardar() {
    setError(''); setEstado('Guardando...')
    const filas = ROLES_FIRMA.filter(({ rol }) => nuevas[rol]).map(({ rol }) => ({ evaluacion_centro_id: evc.id, rol, nombre: (nombres[rol] ?? '').trim() || null, imagen: nuevas[rol], firmado_at: new Date().toISOString() }))
    const cambiosNombre = ROLES_FIRMA.filter(({ rol }) => !nuevas[rol] && guardadas?.[rol] && (guardadas[rol].nombre ?? '') !== (nombres[rol] ?? '').trim())
    const { error: err } = filas.length ? await supabase.from('firmas').upsert(filas, { onConflict: 'evaluacion_centro_id,rol' }) : { error: null }
    if (err) { setError(err.message); setEstado(''); return }
    for (const { rol } of cambiosNombre) await supabase.from('firmas').update({ nombre: nombres[rol].trim() || null }).eq('id', guardadas[rol].id)
    setNuevas({}); setRehacer({}); setEstado('Firmas guardadas. Saldrán en el informe de evaluación.')
    cargar()
  }

  const pendientes = ROLES_FIRMA.filter(({ rol }) => !guardadas?.[rol] && !nuevas[rol]).length
  const hayCambios = Object.keys(nuevas).length > 0 || ROLES_FIRMA.some(({ rol }) => guardadas?.[rol] && (guardadas[rol].nombre ?? '') !== (nombres[rol] ?? '').trim())

  return (
    <div style={{ border: '1px solid #d9dfe3', borderRadius: 10, padding: '10px 14px', margin: '14px 0', background: '#fff' }}>
      <strong>Firmas</strong>
      <p style={{ fontSize: 13, margin: '4px 0 10px', opacity: 0.85 }}>Firman el técnico, la dirección del centro y el acompañante. Se guardan las tres juntas al pulsar «Guardar firmas».</p>
      {error && <p style={{ color: '#b00020', background: '#fdecea', padding: 8, borderRadius: 6 }}>{error}</p>}
      {!guardadas && <p>Cargando...</p>}
      {guardadas && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {ROLES_FIRMA.map(({ rol, titulo }) => {
            const g = guardadas[rol]
            const editar = !g || rehacer[rol]
            return (
              <div key={rol}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{titulo}</div>
                <input value={nombres[rol] ?? ''} onChange={(e) => setNombres({ ...nombres, [rol]: e.target.value })} placeholder="Nombre y apellidos"
                  style={{ width: '100%', boxSizing: 'border-box', margin: '4px 0' }} />
                {editar ? (
                  <>
                    <Lienzo borrar={borrar[rol] ?? 0} onCambio={(img) => setNuevas((n) => { const x = { ...n }; if (img) x[rol] = img; else delete x[rol]; return x })} />
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button type="button" className="secundario" style={{ fontSize: 12 }} onClick={() => setBorrar((b) => ({ ...b, [rol]: (b[rol] ?? 0) + 1 }))}>Borrar</button>
                      {g && <button type="button" className="secundario" style={{ fontSize: 12 }} onClick={() => { setRehacer({ ...rehacer, [rol]: false }); setNuevas((n) => { const x = { ...n }; delete x[rol]; return x }) }}>Mantener la anterior</button>}
                    </div>
                  </>
                ) : (
                  <>
                    <img src={g.imagen} alt={`Firma de ${titulo}`} style={{ width: '100%', height: 130, objectFit: 'contain', border: '1px solid #e0e0e0', borderRadius: 6, background: '#fff' }} />
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                      <small style={{ opacity: 0.7, flex: 1 }}>Firmado el {fechaES(String(g.firmado_at).slice(0, 10))}</small>
                      <button type="button" className="secundario" style={{ fontSize: 12 }} onClick={() => setRehacer({ ...rehacer, [rol]: true })}>Volver a firmar</button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
        <button onClick={guardar} disabled={!hayCambios} style={{ fontWeight: 700 }}>Guardar firmas</button>
        {pendientes > 0 && <small style={{ color: '#8a6d00' }}>Faltan {pendientes} {pendientes === 1 ? 'firma' : 'firmas'}.</small>}
        {estado && <small style={{ color: '#2e7d32' }}>{estado}</small>}
      </div>
    </div>
  )
}
