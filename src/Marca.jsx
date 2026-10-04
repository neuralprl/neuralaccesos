// Marca de la aplicación: icono y título de la cabecera (técnico y centro).
export const TITULO_APP = 'SISTEMA DE GESTIÓN DE LA PREVENCIÓN - GRUPO NEURAL - ÁREA PREVENCIÓN - V1.0'

// Escudo verde con una marca de verificación: el verde es el color de seguridad de las señales de
// condición segura (UNE-EN ISO 7010), y el escudo, la protección del trabajador.
export function IconoMarca({ tamano = 30 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 32 32" aria-hidden="true" focusable="false" style={{ flex: 'none', display: 'block' }}>
      <path d="M16 2.5 4.5 6.8v8.4c0 7.2 4.9 12.4 11.5 14.3 6.6-1.9 11.5-7.1 11.5-14.3V6.8L16 2.5Z" fill="#1b7a43" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m10.5 16.2 3.8 3.8 7.3-7.6" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TituloApp() {
  return (
    <>
      <IconoMarca />
      <strong style={{ fontSize: 'clamp(12px, 1.5vw, 16px)', letterSpacing: '0.03em', lineHeight: 1.25 }}>{TITULO_APP}</strong>
    </>
  )
}
