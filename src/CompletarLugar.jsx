import { useEffect, useMemo, useState } from 'react'
import { nucleo } from './medidasSimilares'
import { PUNTOS_RD486 } from './lugarRd486'

// Completar la lista de comprobación del lugar de trabajo con los puntos del RD 486/1997 que falten.
// Compara cada punto con los que ya hay (por las palabras que dicen de qué trata) y propone añadir solo los que no tienen uno parecido.
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const ok = { color: '#1b5e20', background: '#e8f5e9', padding: 10, borderRadius: 6 }
const UMBRAL = 0.45

function parecido(a, b) {
  const inter = [...a].filter((x) => b.has(x)).length
  if (!inter) return 0
  const union = new Set([...a, ...b]).size
  return Math.max(inter / union, inter / Math.min(a.size, b.size) * 0.8)
}
const anexoCorto = (a) => a.replace(/\s*\(.*\)\s*$/, '').replace(/^ANEXO ([IVX]+):\s*/, 'Anexo $1 · ').toLowerCase().replace(/^anexo/, 'Anexo').replace(/· (.)/, (m, c) => `· ${c.toUpperCase()}`)

export default function CompletarLugar({ supabase, onVolver }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [anexo, setAnexo] = useState('')
  const [elegidos, setElegidos] = useState(null)
  const [bloque, setBloque] = useState('Lugares de trabajo (RD 486/1997)')
  const [trabajando, setTrabajando] = useState(false)

  useEffect(() => {
    supabase.from('pac_items').select('id,orden,bloque,seccion,punto').order('orden').then(({ data, error: e }) => {
      if (e) setError(e.message); else setItems(data)
    })
  }, [supabase])

  const comparados = useMemo(() => {
    if (!items) return []
    const existentes = items.map((it) => ({ it, n: nucleo(it.punto) }))
    return PUNTOS_RD486.map((p) => {
      const n = nucleo(p.texto)
      let mejor = null; let score = 0
      for (const e of existentes) { const s = parecido(n, e.n); if (s > score) { score = s; mejor = e.it } }
      return { ...p, mejor, score, existe: score >= UMBRAL }
    })
  }, [items])
  useEffect(() => { if (items && !elegidos) setElegidos(new Set(comparados.filter((c) => !c.existe).map((c) => c.id))) }, [items, comparados, elegidos])

  const anexos = [...new Set(PUNTOS_RD486.map((p) => p.anexo))]
  const lista = comparados.filter((c) => !anexo || c.anexo === anexo)
  const bloques = [...new Set((items ?? []).map((i) => i.bloque))]
  const alternar = (id) => setElegidos((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })

  async function anadir() {
    setError(''); setMsg(''); setTrabajando(true)
    try {
      let orden = Math.max(0, ...(items ?? []).map((i) => i.orden ?? 0))
      const filas = comparados.filter((c) => elegidos.has(c.id)).map((c) => ({ orden: ++orden, bloque: bloque.trim(), seccion: c.area, punto: c.texto, riesgo: null, pregunta_previa: null }))
      for (let i = 0; i < filas.length; i += 100) {
        const { error: e } = await supabase.from('pac_items').upsert(filas.slice(i, i + 100), { onConflict: 'bloque,punto', ignoreDuplicates: true })
        if (e) throw e
      }
      setMsg(`Se han añadido ${filas.length} puntos al bloque «${bloque.trim()}». Aparecerán en las próximas visitas del apartado Lugar de trabajo.`)
      const { data } = await supabase.from('pac_items').select('id,orden,bloque,seccion,punto').order('orden')
      setItems(data); setElegidos(new Set())
    } catch (e) { setError(e.message) }
    setTrabajando(false)
  }

  return (
    <div style={{ textAlign: 'left', maxWidth: 1000 }}>
      <p><button className="secundario" onClick={onVolver}>← Volver a Actualizar</button></p>
      <h2>Completar la lista del lugar de trabajo</h2>
      <p style={{ maxWidth: '80ch' }}>
        Compara los {PUNTOS_RD486.length} puntos del RD 486/1997 (condiciones generales, orden y limpieza, servicios higiénicos, primeros auxilios,
        emergencias e instalación eléctrica) con los {items?.length ?? '...'} que ya tiene tu lista. Quedan marcados para añadir solo los que no tienen
        uno parecido; revisa la propuesta antes de añadirlos.
      </p>
      {error && <p style={aviso}>{error}</p>}
      {msg && <p style={ok}>{msg}</p>}
      {!items && !error && <p>Cargando...</p>}
      {items && elegidos && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
            <select value={anexo} onChange={(e) => setAnexo(e.target.value)}><option value="">Todos los anexos</option>{anexos.map((a) => <option key={a} value={a}>{anexoCorto(a)}</option>)}</select>
            <button className="secundario" onClick={() => setElegidos(new Set([...elegidos, ...lista.filter((c) => !c.existe).map((c) => c.id)]))}>Marcar los que faltan</button>
            <button className="secundario" onClick={() => setElegidos(new Set([...elegidos].filter((id) => !lista.some((c) => c.id === id))))}>Desmarcar estos</button>
            <span style={{ color: '#55616b' }}>{comparados.filter((c) => c.existe).length} ya tienen uno parecido · {elegidos.size} marcados</span>
          </div>
          <div style={{ border: '1px solid #d9dfe3', borderRadius: 8, background: '#fff', maxHeight: 560, overflowY: 'auto' }}>
            {lista.map((c) => (
              <label key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 12px', borderBottom: '1px solid #eef1f3', alignItems: 'flex-start', cursor: 'pointer', background: c.existe ? '#fafbfc' : '#fff' }}>
                <input type="checkbox" checked={elegidos.has(c.id)} onChange={() => alternar(c.id)} style={{ marginTop: 3 }} />
                <span style={{ flex: 1, fontSize: 14 }}>
                  <small style={{ color: '#6f7b84' }}>{anexoCorto(c.anexo)} · {c.area}</small><br />
                  {c.texto}
                  {c.existe && <small style={{ display: 'block', color: '#1b6e3c', marginTop: 2 }}>Parecido a: «{c.mejor.punto}» ({c.mejor.bloque})</small>}
                </span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 12 }}>
            <label>Bloque donde se añaden<br />
              <input list="bloques-pac" value={bloque} onChange={(e) => setBloque(e.target.value)} style={{ minWidth: 320 }} />
              <datalist id="bloques-pac">{bloques.map((b) => <option key={b} value={b} />)}</datalist>
            </label>
            <button onClick={anadir} disabled={trabajando || !elegidos.size || !bloque.trim()}>{trabajando ? 'Añadiendo...' : `Añadir ${elegidos.size} puntos`}</button>
          </div>
        </>
      )}
    </div>
  )
}
