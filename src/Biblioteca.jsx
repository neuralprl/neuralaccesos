import { useEffect, useMemo, useState } from 'react'

// Biblioteca de referencia: guías técnicas del INSST, notas técnicas de prevención (NTP) y normas UNE.
// La ven el técnico y los centros; solo el técnico la edita. Se enlaza desde la metodología.
const TIPOS = { guia: 'Guías técnicas del INSST', ntp: 'Notas técnicas de prevención (NTP)', une: 'Normas UNE', otro: 'Otras referencias' }
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const quitar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const enlace = (r) => r.enlace || `https://www.google.com/search?q=${encodeURIComponent(r.tipo === 'une' ? `site:une.org "${r.codigo}"` : `site:insst.es "${r.tipo === 'ntp' ? r.codigo : r.titulo}"`)}`

export default function Biblioteca({ supabase, editable = false }) {
  const [refs, setRefs] = useState(null)
  const [busca, setBusca] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  useEffect(() => {
    supabase.from('biblioteca_ref').select('*').order('orden').then(({ data, error: e }) => {
      if (e) { setError(/biblioteca_ref|does not exist|schema cache/i.test(e.message) ? 'Falta ejecutar migracion_requisitos_legales.sql en Supabase' : e.message); setRefs([]) } else setRefs(data)
    })
  }, [supabase])
  const grupos = useMemo(() => {
    const q = quitar(busca.trim())
    return Object.keys(TIPOS).map((t) => [t, (refs ?? []).filter((r) => r.tipo === t && (!q || quitar(`${r.codigo} ${r.titulo} ${r.relacion}`).includes(q)))]).filter(([, l]) => l.length)
  }, [refs, busca])

  async function guardar() {
    setError('')
    const datos = { tipo: form.tipo, codigo: form.codigo?.trim() || null, titulo: form.titulo.trim(), relacion: form.relacion?.trim() || null, enlace: form.enlace?.trim() || null }
    const q = form.id ? supabase.from('biblioteca_ref').update(datos).eq('id', form.id) : supabase.from('biblioteca_ref').insert(datos)
    const { data, error: e } = await q.select('*').single()
    if (e) setError(e.message); else { setRefs(form.id ? refs.map((r) => (r.id === data.id ? data : r)) : [...refs, data]); setForm(null) }
  }
  async function borrar(r) {
    if (!window.confirm(`¿Quitar «${r.codigo ?? ''} ${r.titulo}» de la biblioteca?`)) return
    const { error: e } = await supabase.from('biblioteca_ref').delete().eq('id', r.id)
    if (e) setError(e.message); else setRefs(refs.filter((x) => x.id !== r.id))
  }

  return (
    <div style={{ textAlign: 'left', maxWidth: 980 }}>
      <h2 style={{ marginBottom: 4 }}>Biblioteca de referencia</h2>
      <p style={{ marginTop: 0, color: '#55616b', maxWidth: '80ch' }}>
        Guías técnicas del INSST, notas técnicas de prevención y normas UNE que sirven de criterio en la evaluación y la planificación. Las guías y NTP son
        de libre acceso en la web del INSST; las normas UNE se adquieren en UNE. Si el enlace no lleva directamente al documento, abre una búsqueda.
      </p>
      {error && <p style={aviso}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input type="search" placeholder="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ padding: '7px 10px', flex: '1 1 240px', maxWidth: 340 }} />
        {editable && !form && <button onClick={() => setForm({ tipo: 'ntp', codigo: '', titulo: '', relacion: '', enlace: '' })}>+ Añadir referencia</button>}
      </div>
      {form && (
        <div style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: 12, background: '#fff', marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label>Tipo<br /><select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label>Código<br /><input value={form.codigo ?? ''} onChange={(e) => setForm({ ...form, codigo: e.target.value })} style={{ width: 140 }} /></label>
          <label style={{ flex: '2 1 280px' }}>Título<br /><input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
          <label style={{ flex: '1 1 200px' }}>Relacionada con<br /><input value={form.relacion ?? ''} onChange={(e) => setForm({ ...form, relacion: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
          <label style={{ flex: '2 1 280px' }}>Enlace directo (opcional)<br /><input type="url" value={form.enlace ?? ''} onChange={(e) => setForm({ ...form, enlace: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} /></label>
          <button onClick={guardar} disabled={!form.titulo.trim()}>Guardar</button>
          <button className="secundario" onClick={() => setForm(null)}>Cancelar</button>
        </div>
      )}
      {!refs && <p>Cargando...</p>}
      {grupos.map(([t, lista]) => (
        <section key={t} style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '8px 14px', background: '#f3f6fb', fontWeight: 700, color: '#1f3864' }}>{TIPOS[t]}</div>
          {lista.map((r) => (
            <div key={r.id} style={{ borderTop: '1px solid #e2e7ea', padding: '8px 14px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ flex: '1 1 340px' }}>
                {r.codigo && r.codigo !== 'GT' && <strong>{r.codigo} · </strong>}{r.titulo}
                {r.relacion && <small style={{ display: 'block', color: '#6f7b84' }}>{r.relacion}</small>}
              </span>
              <a href={enlace(r)} target="_blank" rel="noopener noreferrer">{r.enlace ? 'Abrir' : 'Buscar'}</a>
              {editable && <button className="secundario" onClick={() => setForm(r)}>Editar</button>}
              {editable && <button className="secundario" onClick={() => borrar(r)}>Quitar</button>}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
