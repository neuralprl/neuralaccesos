import { useState } from 'react'
import { documentoHTML, descargar, imprimir } from './documentos'
import { CSS_PLANTILLA, PLANTILLAS, cabeceraDoc } from './plantillasContenido'

// Plantillas del sistema de gestión para imprimir, guardar en PDF o editar en Word.
// Son el borrador de los formularios de los apartados que aún están en preparación.
function documento(p) {
  const cuerpo = `<style>${CSS_PLANTILLA}</style>${cabeceraDoc(p)}${p.html()}`
  return documentoHTML(`${p.codigo} ${p.titulo}`, cuerpo)
}
function word(p) {
  const html = documento(p).replace('<html lang="es">', '<html lang="es" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">')
  descargar(new Blob(['\ufeff', html], { type: 'application/msword' }), `${p.codigo}_${p.titulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_')}.doc`)
}

export default function Plantillas({ onIr }) {
  const [vista, setVista] = useState(null)
  const [error, setError] = useState('')
  const grupos = [...new Set(PLANTILLAS.map((p) => p.grupo))]
  const pdf = (p) => { try { imprimir(documento(p)) } catch (e) { setError(e.message) } }
  return (
    <div style={{ textAlign: 'left', maxWidth: 980 }}>
      <h2 style={{ marginBottom: 4 }}>Plantillas del sistema</h2>
      <p style={{ marginTop: 0, color: '#55616b', maxWidth: '80ch' }}>
        Modelos para el comité, los objetivos, la investigación de accidentes, la gestión del cambio, la auditoría, la revisión por la dirección,
        los simulacros y la protección de la maternidad. Se pueden imprimir, guardar en PDF o descargar en Word para editarlos. Los códigos son
        provisionales: ajústalos a la codificación de la plantilla ISO del sistema.
      </p>
      {error && <p style={{ color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }}>{error}</p>}
      {grupos.map((g) => (
        <section key={g} style={{ border: '1px solid #c9d2d8', borderRadius: 8, background: '#fff', marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ padding: '8px 14px', background: '#f3f6fb', fontWeight: 700, color: '#1f3864' }}>{g}</div>
          {PLANTILLAS.filter((p) => p.grupo === g).map((p) => (
            <div key={p.id} style={{ borderTop: '1px solid #e2e7ea', padding: '9px 14px' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ flex: '1 1 340px' }}>
                  <strong>{p.titulo}</strong> <small style={{ color: '#6f7b84' }}>{p.codigo}</small>
                  <small style={{ display: 'block', color: '#55616b' }}>{p.descripcion}</small>
                </span>
                <button className="secundario" onClick={() => setVista(vista === p.id ? null : p.id)}>{vista === p.id ? 'Ocultar' : 'Ver'}</button>
                <button className="secundario" onClick={() => pdf(p)}>PDF</button>
                <button className="secundario" onClick={() => word(p)}>Word</button>
                {onIr && p.menu && <button className="secundario" onClick={() => onIr(p.menu)} title="Apartado del sistema donde se usa">Ir al apartado</button>}
              </div>
              {vista === p.id && (
                <iframe title={p.titulo} srcDoc={documento(p)} style={{ width: '100%', height: 520, border: '1px solid #d9dfe3', borderRadius: 6, marginTop: 8, background: '#fff' }} />
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
