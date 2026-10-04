import { useMemo, useState } from 'react'

// Lista de evaluaciones de puesto agrupada por centro y, dentro, por puesto (de la A a la Z).
// De cada puesto se muestra la evaluación más reciente; las anteriores quedan plegadas debajo.
// Uso: <PorCentro evals={[{ id, fecha, estado, centro: {id, codigo, nombre}, puesto: {id, nombre} }]}
//        fila={(ev, { anterior }) => <...botones del puesto...>} vacio="No hay evaluaciones." />
const quitar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const porCodigo = (a, b) => String(a.codigo ?? '').localeCompare(String(b.codigo ?? ''), 'es', { numeric: true }) || String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es')

export default function PorCentro({ evals, fila, vacio = 'No hay evaluaciones.' }) {
  const [busca, setBusca] = useState('')
  const [abiertos, setAbiertos] = useState(() => new Set())
  const [anteriores, setAnteriores] = useState(() => new Set())

  const centros = useMemo(() => {
    const q = quitar(busca.trim())
    const mapa = new Map()
    for (const e of evals ?? []) {
      if (q && !quitar(`${e.centro?.codigo} ${e.centro?.nombre} ${e.puesto?.nombre}`).includes(q)) continue
      const c = mapa.get(e.centro?.id) ?? { ...e.centro, puestos: new Map() }
      const clave = e.puesto?.id ?? e.puesto?.nombre
      const lista = c.puestos.get(clave) ?? []
      lista.push(e)
      c.puestos.set(clave, lista)
      mapa.set(e.centro?.id, c)
    }
    return [...mapa.values()].sort(porCodigo).map((c) => ({
      ...c,
      puestos: [...c.puestos.values()]
        .map((l) => l.sort((a, b) => String(b.fecha ?? '').localeCompare(String(a.fecha ?? ''))))
        .sort((a, b) => String(a[0].puesto?.nombre ?? '').localeCompare(String(b[0].puesto?.nombre ?? ''), 'es')),
    }))
  }, [evals, busca])

  const todoAbierto = busca.trim() !== '' || centros.length === 1
  const estaAbierto = (id) => todoAbierto || abiertos.has(id)
  const alternar = (set, setter, id) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); setter(n) }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '0 0 12px' }}>
        <input type="search" placeholder="Buscar por centro o puesto" value={busca} onChange={(e) => setBusca(e.target.value)}
          style={{ padding: '7px 10px', width: '100%', maxWidth: 360, boxSizing: 'border-box' }} />
        {centros.length > 1 && !todoAbierto && (
          <>
            <button type="button" className="secundario" onClick={() => setAbiertos(new Set(centros.map((c) => c.id)))}>Desplegar todos</button>
            <button type="button" className="secundario" onClick={() => setAbiertos(new Set())}>Plegar todos</button>
          </>
        )}
      </div>
      {evals && centros.length === 0 && <p className="vacio">{busca.trim() ? 'Ningún centro o puesto coincide con la búsqueda.' : vacio}</p>}
      {centros.map((c) => {
        const abierto = estaAbierto(c.id)
        return (
          <section key={c.id} style={{ border: '1px solid #c9d2d8', borderRadius: 8, marginBottom: 10, background: '#fff', overflow: 'hidden' }}>
            <button type="button" onClick={() => { if (!todoAbierto) alternar(abiertos, setAbiertos, c.id) }} aria-expanded={abierto}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 14px', border: 0, borderRadius: 0, boxShadow: 'none',
                background: '#f3f6fb', color: '#1f2a33', font: 'inherit', textAlign: 'left', cursor: todoAbierto ? 'default' : 'pointer', opacity: 1 }}>
              {!todoAbierto && <span aria-hidden="true" style={{ width: 12, color: '#1f3864' }}>{abierto ? '▾' : '▸'}</span>}
              <strong style={{ flex: 1 }}>{c.codigo} · {c.nombre}</strong>
              <small style={{ opacity: 0.75 }}>{c.puestos.length} {c.puestos.length === 1 ? 'puesto' : 'puestos'}</small>
            </button>
            {abierto && c.puestos.map((versiones) => {
              const [ultima, ...previas] = versiones
              const clave = `${c.id}-${ultima.puesto?.id ?? ultima.puesto?.nombre}`
              return (
                <div key={clave} style={{ borderTop: '1px solid #e2e7ea' }}>
                  {fila(ultima, { anterior: false })}
                  {previas.length > 0 && (
                    <div style={{ padding: '0 14px 8px 28px' }}>
                      <button type="button" className="secundario" onClick={() => alternar(anteriores, setAnteriores, clave)} style={{ fontSize: 12, padding: '3px 8px' }}>
                        {anteriores.has(clave) ? 'Ocultar' : 'Ver'} versiones anteriores ({previas.length})
                      </button>
                      {anteriores.has(clave) && previas.map((ev) => <div key={ev.id} style={{ borderLeft: '3px solid #d9dfe3', marginTop: 6, opacity: 0.9 }}>{fila(ev, { anterior: true })}</div>)}
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        )
      })}
    </div>
  )
}
