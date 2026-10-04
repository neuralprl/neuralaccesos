// Barra de alta de datos que se repite en cada apartado: resumen a la izquierda y, a la derecha,
// crear a mano y subida masiva desde Excel.
export default function BarraAlta({ resumen, onManual, textoManual = 'Crear manualmente', deshabilitadoManual = false, onMasivo, textoMasivo = 'Subida masiva desde Excel' }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', border: '1px solid #d9dfe3', background: '#f6f8f9', borderRadius: 10, padding: '10px 14px', margin: '8px 0 14px' }}>
      <div style={{ flex: '1 1 260px', textAlign: 'left' }}>{resumen}</div>
      {onManual && <button onClick={onManual} disabled={deshabilitadoManual} style={{ padding: '8px 16px', fontWeight: 600 }}>＋ {textoManual}</button>}
      {onMasivo && <button className="secundario" onClick={onMasivo}>⇪ {textoMasivo}</button>}
    </div>
  )
}
