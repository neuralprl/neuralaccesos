import { useEffect, useMemo, useRef, useState } from 'react'

// Menú lateral desplegable y plegable, por grupos de la ISO 45001. Los apartados pendientes ya están
// en el menú, en gris y con la marca «pendiente». Con buscador de apartados y grupos plegables (todos, también el del apartado abierto).
// Uso: <MenuLateral menu={MENU_TECNICO} seccion={id} onElegir={fn} abierto movil onCerrar={fn} />
const CSS = `
.sg-lateral{box-sizing:border-box;width:280px;flex:none;position:sticky;top:var(--alto-cabecera,0px);height:calc(100vh - var(--alto-cabecera,0px));
  overflow-y:auto;background:#f5f7f9;border-right:1px solid #d9dfe3;padding:12px 0 24px;color:#1f2a33;font-size:14px;text-align:left}
.sg-lateral.movil{position:fixed;left:0;bottom:0;height:auto;z-index:69;box-shadow:6px 0 22px rgba(0,0,0,.16)}
.sg-fondo{position:fixed;inset:0;top:var(--alto-cabecera,0px);background:rgba(20,30,40,.3);z-index:68}
.sg-buscar{display:block;box-sizing:border-box;width:calc(100% - 28px);margin:0 14px 10px;padding:7px 10px;border:1px solid #c9d2d8;border-radius:6px;font:inherit;font-size:13px;background:#fff}
.sg-avance{margin:0 14px 14px;font-size:12px;color:#55616b}
.sg-avance-barra{height:4px;border-radius:2px;background:#dfe5ea;margin-top:5px;overflow:hidden}
.sg-avance-barra span{display:block;height:100%;background:#1b7a43}
.sg-grupo{margin:0 0 4px}
.sg-grupo-tit{display:flex;align-items:center;gap:6px;width:100%;padding:8px 14px 4px;border:0;border-radius:0;background:none;box-shadow:none;
  color:#1f3864;font:inherit;font-size:12.5px;font-weight:700;text-align:left;cursor:pointer}
.sg-grupo-tit:hover{color:#0f2347}
.sg-grupo-tit .sg-flecha{width:10px;font-size:10px;color:#7b8790}
.sg-grupo-tit .sg-iso{margin-left:auto;font-weight:400;font-size:11px;color:#7b8790}
.sg-lateral ul{list-style:none;margin:0;padding:0}
.sg-item{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:7px 14px 7px 30px;border:0;border-left:3px solid transparent;
  border-radius:0;background:none;box-shadow:none;color:#1f2a33;font:inherit;font-size:13.5px;line-height:1.3;text-align:left;cursor:pointer}
.sg-item:hover{background:#e8eef5}
.sg-item:focus-visible{outline:2px solid #1f3864;outline-offset:-2px}
.sg-item[aria-current="page"]{background:#1f3864;color:#fff;border-left-color:#1b7a43}
.sg-item .sg-sigla{flex:none;min-width:34px;font-size:11px;font-weight:700;color:#1f3864}
.sg-item[aria-current="page"] .sg-sigla{color:#cfe3d6}
.sg-item .sg-tit{flex:1}
.sg-item.pend{color:#6f7b84}
.sg-item.pend .sg-sigla{color:#8c979f}
.sg-item.pend[aria-current="page"]{color:#fff}
.sg-pill{flex:none;font-size:10.5px;padding:1px 6px;border-radius:9px;background:#fdf0d5;color:#8a5a00;border:1px solid #f1d49a}
.sg-item[aria-current="page"] .sg-pill{background:transparent;color:#fde9c4;border-color:#fde9c4}
@media (prefers-reduced-motion:no-preference){.sg-lateral.movil{animation:sgEntra .16s ease-out}}
@keyframes sgEntra{from{transform:translateX(-14px);opacity:.6}to{transform:none;opacity:1}}
@media print{.sg-lateral,.sg-fondo{display:none}}
`
const quitar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function MenuLateral({ menu, seccion, onElegir, abierto, movil, onCerrar }) {
  const [busca, setBusca] = useState('')
  // Al entrar, todos los grupos están plegados.
  const [abiertos, setAbiertos] = useState(() => new Set())
  const caja = useRef(null)
  const primera = useRef(true)

  // Si se llega a un apartado desde otro sitio (un enlace o un botón), su grupo se despliega; al entrar no.
  useEffect(() => {
    if (primera.current) { primera.current = false; return }
    const g = menu.find((x) => x.items.some((it) => it.id === seccion))
    if (g) setAbiertos((p) => (p.has(g.id) ? p : new Set([...p, g.id])))
  }, [seccion]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!abierto || !movil) return undefined
    const tecla = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', tecla)
    caja.current?.querySelector('[aria-current="page"], .sg-item')?.focus()
    return () => window.removeEventListener('keydown', tecla)
  }, [abierto, movil]) // eslint-disable-line react-hooks/exhaustive-deps

  const grupos = useMemo(() => {
    const q = quitar(busca.trim())
    return menu.map((g) => ({ ...g, items: g.items.filter((it) => !q || quitar(`${it.sigla ?? ''} ${it.titulo} ${g.titulo}`).includes(q)) })).filter((g) => g.items.length)
  }, [menu, busca])

  const total = menu.reduce((n, g) => n + g.items.length, 0)
  const pendientes = menu.reduce((n, g) => n + g.items.filter((it) => it.pendiente).length, 0)
  const enMarcha = total - pendientes

  if (!abierto) return null
  const alternar = (id) => setAbiertos((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n })
  function elegir(id) {
    onElegir(id)
    if (movil) onCerrar()
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <style>{CSS}</style>
      {movil && <div className="sg-fondo" onClick={onCerrar} />}
      <nav id="menu-lateral" className={`sg-lateral${movil ? ' movil' : ''}`} aria-label="Apartados del sistema" ref={caja}>
        <input type="search" className="sg-buscar" placeholder="Buscar apartado" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar apartado" />
        {pendientes > 0 && !busca && (
          <div className="sg-avance">
            {enMarcha} de {total} apartados en funcionamiento
            <div className="sg-avance-barra"><span style={{ width: `${Math.round((enMarcha / total) * 100)}%` }} /></div>
          </div>
        )}
        {grupos.length === 0 && <p style={{ margin: '0 14px', fontSize: 13, color: '#6f7b84' }}>Ningún apartado coincide.</p>}
        {grupos.map((g) => {
          const conSigla = g.items.some((it) => it.sigla)
          const abiertoG = busca.trim() !== '' || abiertos.has(g.id)
          return (
            <div className="sg-grupo" key={g.id}>
              <button type="button" className="sg-grupo-tit" onClick={() => alternar(g.id)} aria-expanded={abiertoG}>
                <span className="sg-flecha" aria-hidden="true">{abiertoG ? '▾' : '▸'}</span>
                {g.titulo}
                {g.iso && <span className="sg-iso" title="Apartado de la ISO 45001">ISO {g.iso}</span>}
              </button>
              {abiertoG && (
                <ul>
                  {g.items.map((it) => (
                    <li key={it.id}>
                      <button type="button" className={`sg-item${it.pendiente ? ' pend' : ''}`} onClick={() => elegir(it.id)}
                        aria-current={seccion === it.id ? 'page' : undefined} title={it.ayuda ?? (it.iso ? `ISO 45001 · ${it.iso}` : it.titulo)}>
                        {(it.sigla || conSigla) && <span className="sg-sigla" aria-hidden={!it.sigla}>{it.sigla ?? ''}</span>}
                        <span className="sg-tit">{it.titulo}</span>
                        {it.pendiente && <span className="sg-pill">pendiente</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </>
  )
}
