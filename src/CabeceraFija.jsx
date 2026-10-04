import { useLayoutEffect, useRef } from 'react'
import { TituloApp } from './Marca'

// Cabecera fija: no se mueve con el scroll. Lleva el botón que abre y pliega el menú lateral.
// Publica su altura en la variable CSS --alto-cabecera para que el menú lateral y lo que se queda pegado
// debajo (guía de la visita, barras) empiecen justo bajo ella.
const CSS = `
.cab-fija{position:sticky;top:0;z-index:70;background:#fff;box-shadow:0 1px 0 #d9dfe3}
.cab-menu{display:inline-flex;align-items:center;justify-content:center;flex:none;width:40px;height:38px;padding:0;border:1px solid #c9d2d8;
  border-radius:8px;background:#fff;color:#1f3864;cursor:pointer;box-shadow:none}
.cab-menu:hover,.cab-menu[aria-expanded="true"]{border-color:#1f3864;background:#eef2f8}
.cab-menu svg{display:block}
`

export default function CabeceraFija({ email, onSalir, onMenu, menuAbierto }) {
  const caja = useRef(null)
  useLayoutEffect(() => {
    const el = caja.current
    if (!el) return undefined
    const poner = () => document.documentElement.style.setProperty('--alto-cabecera', `${el.offsetHeight}px`)
    poner()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(poner) : null
    ro?.observe(el)
    window.addEventListener('resize', poner)
    return () => { ro?.disconnect(); window.removeEventListener('resize', poner) }
  }, [])

  return (
    <div className="cab-fija" ref={caja}>
      <style>{CSS}</style>
      <header className="cabecera">
        {onMenu && (
          <button type="button" className="cab-menu" onClick={onMenu} aria-expanded={!!menuAbierto} aria-controls="menu-lateral"
            title={menuAbierto ? 'Plegar el menú' : 'Abrir el menú'} aria-label={menuAbierto ? 'Plegar el menú' : 'Abrir el menú'}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <TituloApp />
        <span className="usuario">{email}</span>
        <button className="secundario" onClick={onSalir}>Cerrar sesión</button>
      </header>
    </div>
  )
}
