import { useEffect, useState } from 'react'
import CabeceraFija from './CabeceraFija'
import MenuLateral from './MenuLateral'

// Estructura de la aplicación: cabecera fija arriba, menú lateral a la izquierda y el contenido a la derecha.
// En pantallas anchas el menú está abierto y se pliega con el botón de la cabecera (se recuerda);
// en tablet vertical y móvil se abre por encima del contenido.
const CSS = `
.sg-cuerpo{display:flex;align-items:flex-start;min-height:calc(100vh - var(--alto-cabecera,0px))}
.sg-cuerpo > .contenido{flex:1;min-width:0}
`
const ANCHO = '(max-width: 900px)'
const CLAVE = 'sgprl:menu-plegado'

export default function Marco({ email, onSalir, menu, seccion, onElegir, children }) {
  const [movil, setMovil] = useState(() => typeof window !== 'undefined' && window.matchMedia(ANCHO).matches)
  const [plegado, setPlegado] = useState(() => { try { return localStorage.getItem(CLAVE) === '1' } catch { return false } })
  const [abiertoMovil, setAbiertoMovil] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(ANCHO)
    const cambio = () => { setMovil(mq.matches); setAbiertoMovil(false) }
    mq.addEventListener?.('change', cambio)
    return () => mq.removeEventListener?.('change', cambio)
  }, [])
  useEffect(() => { try { localStorage.setItem(CLAVE, plegado ? '1' : '0') } catch { /* sin almacenamiento */ } }, [plegado])

  const abierto = menu?.length ? (movil ? abiertoMovil : !plegado) : false
  const alternar = () => (movil ? setAbiertoMovil(!abiertoMovil) : setPlegado(!plegado))

  return (
    <div className="app">
      <style>{CSS}</style>
      <CabeceraFija email={email} onSalir={onSalir} onMenu={menu?.length ? alternar : null} menuAbierto={abierto} />
      <div className="sg-cuerpo">
        {menu?.length > 0 && (
          <MenuLateral menu={menu} seccion={seccion} onElegir={onElegir} abierto={abierto} movil={movil} onCerrar={() => setAbiertoMovil(false)} />
        )}
        <main className="contenido">{children}</main>
      </div>
    </div>
  )
}
