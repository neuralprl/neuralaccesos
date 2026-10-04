import { bloquesTexto } from './caeLogic'

// Muestra un texto con formato sencillo: «# » título, «- » punto de lista; el resto, párrafos.
export default function VistaTexto({ texto }) {
  return bloquesTexto(texto).map((b, i) => (b.tipo === 'h' ? <h4 key={i} style={{ margin: '12px 0 4px', color: '#1f3864' }}>{b.texto}</h4>
    : b.tipo === 'ul' ? <ul key={i} style={{ margin: '4px 0' }}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul> : <p key={i} style={{ margin: '4px 0' }}>{b.texto}</p>))
}
