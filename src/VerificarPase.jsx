import { useState } from 'react'
import { fechaCorta } from './caeLogic'

// Comprobación de un pase de acceso de un trabajador externo por su código (técnico y centros).
// Muestra si el pase es válido hoy (6 meses desde que se emitió).
export default function VerificarPase({ supabase, compacto = false }) {
  const [codigo, setCodigo] = useState('')
  const [res, setRes] = useState(null)
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  async function comprobar(e) {
    e?.preventDefault()
    const c = codigo.replace(/\s+/g, '').toUpperCase()
    if (!c) return
    setError(''); setRes(null); setBuscando(true)
    const { data, error: err } = await supabase.rpc('verificar_pase', { p_codigo: c })
    if (err) setError(/verificar_pase|does not exist|schema cache/i.test(err.message) ? 'Falta ejecutar migracion_cae.sql en Supabase' : err.message)
    else setRes(data)
    setBuscando(false)
  }

  const vale = res?.encontrado && res.vigente
  return (
    <div style={{ textAlign: 'left', maxWidth: 620 }}>
      {!compacto && (
        <>
          <h2 style={{ marginBottom: 4 }}>Comprobar pase de contratas</h2>
          <p style={{ marginTop: 0 }}>Escribe el código que aparece en el pase del trabajador. Comprueba también que el nombre y el DNI coinciden con su documento de identidad.</p>
        </>
      )}
      <form onSubmit={comprobar} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <label htmlFor="codigo-pase" style={{ fontWeight: 600 }}>{compacto ? 'Comprobar un pase' : 'Código del pase'}</label>
        <input id="codigo-pase" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="Ej. K7MP3QXA" maxLength={12} autoComplete="off"
          style={{ padding: '8px 10px', fontSize: 16, letterSpacing: '.12em', width: 170, textTransform: 'uppercase' }} />
        <button type="submit" disabled={buscando || !codigo.trim()}>{buscando ? 'Comprobando...' : 'Comprobar'}</button>
      </form>
      {error && <p style={{ color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }}>{error}</p>}
      {res && !res.encontrado && <p style={{ color: '#b3261e', background: '#fdecea', padding: 12, borderRadius: 8, fontWeight: 600 }}>No existe ningún pase con ese código.</p>}
      {res?.encontrado && (
        <div style={{ marginTop: 12, border: `2px solid ${vale ? '#1b7a43' : '#b3261e'}`, borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
          <div style={{ background: vale ? '#1b7a43' : '#b3261e', color: '#fff', padding: '10px 14px', fontWeight: 800, fontSize: 18 }}>
            {vale ? 'PASE VÁLIDO: puede acceder' : 'PASE NO VÁLIDO: no puede acceder'}
          </div>
          <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 14px', margin: 0, padding: '12px 14px', color: '#1f2a33' }}>
            <dt style={{ color: '#55616b' }}>Trabajador/a</dt><dd style={{ margin: 0, fontWeight: 700 }}>{res.nombre}</dd>
            <dt style={{ color: '#55616b' }}>DNI / NIE</dt><dd style={{ margin: 0 }}>{res.dni}</dd>
            <dt style={{ color: '#55616b' }}>Empresa</dt><dd style={{ margin: 0 }}>{res.empresa}</dd>
            <dt style={{ color: '#55616b' }}>Emitido</dt><dd style={{ margin: 0 }}>{fechaCorta(res.emitido)}</dd>
            <dt style={{ color: '#55616b' }}>Válido hasta</dt><dd style={{ margin: 0 }}>{res.valido_hasta ? fechaCorta(res.valido_hasta) : '—'}</dd>
          </dl>
          {!vale && (
            <p style={{ margin: 0, padding: '0 14px 12px', color: '#b3261e' }}>
              {!res.autorizado ? 'El pase se denegó al registrarse.' : 'El pase ha caducado: el trabajador debe registrarse de nuevo en la web de accesos.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
