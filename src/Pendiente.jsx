// Apartado que ya está en el menú pero aún sin contenido: explica qué va a recoger y a qué apartado de la ISO responde.
// Uso: <Pendiente apartado={{ titulo, iso, pendiente: { texto, recoge: [] } }} />
export default function Pendiente({ apartado, titulo, texto, necesita = [] }) {
  const t = apartado?.titulo ?? titulo
  const desc = apartado?.pendiente?.texto ?? texto
  const lista = apartado?.pendiente?.recoge ?? necesita
  return (
    <div style={{ textAlign: 'left', maxWidth: 760 }}>
      <h2 style={{ marginBottom: 4 }}>{apartado?.sigla ? `${apartado.sigla} · ` : ''}{t}</h2>
      {apartado?.iso && <p style={{ margin: '0 0 14px', color: '#55616b', fontSize: 14 }}>ISO 45001, apartado {apartado.iso}</p>}
      <p style={{ display: 'inline-block', margin: '0 0 14px', background: '#fdf0d5', color: '#7a4b00', border: '1px solid #f1d49a', padding: '6px 12px', borderRadius: 6, fontWeight: 600, fontSize: 14 }}>
        Apartado en preparación
      </p>
      {desc && <p style={{ marginTop: 0, maxWidth: '70ch' }}>{desc}</p>}
      {lista.length > 0 && (
        <>
          <h3 style={{ marginBottom: 6 }}>Qué recogerá</h3>
          <ul style={{ marginTop: 0, maxWidth: '70ch' }}>{lista.map((n, i) => <li key={i} style={{ marginBottom: 4 }}>{n}</li>)}</ul>
        </>
      )}
    </div>
  )
}
