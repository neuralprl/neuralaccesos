// Accidentes e incidentes: tipos, plazos de comunicación, avisos e índices de siniestralidad.

export const hoyISO = () => new Date().toISOString().slice(0, 10)
export const fechaCorta = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`).toLocaleDateString('es-ES') : '')
const d = (iso) => new Date(`${iso}T12:00:00`)
const iso = (x) => x.toISOString().slice(0, 10)

export const TIPOS = {
  accidente_baja: { texto: 'Accidente con baja', corto: 'Con baja', color: '#b3261e', fondo: '#fdecea' },
  accidente_sin_baja: { texto: 'Accidente sin baja', corto: 'Sin baja', color: '#8a5a00', fondo: '#fdf0d5' },
  in_itinere: { texto: 'Accidente in itinere', corto: 'In itinere', color: '#6a4c93', fondo: '#efe9f7' },
  biologico: { texto: 'Accidente biológico (pinchazo, salpicadura)', corto: 'Biológico', color: '#8a5a00', fondo: '#fdf0d5' },
  incidente: { texto: 'Incidente sin daño', corto: 'Incidente', color: '#1f5f8b', fondo: '#e6f0f8' },
  enfermedad: { texto: 'Enfermedad profesional', corto: 'Enf. profesional', color: '#b3261e', fondo: '#fdecea' },
}
export const FORMAS = [
  'Caída al mismo nivel', 'Caída a distinto nivel', 'Golpe o choque contra objetos', 'Sobreesfuerzo en la movilización de pacientes',
  'Otro sobreesfuerzo o mala postura', 'Agresión de usuario', 'Agresión de familiar u otra persona', 'Corte o pinchazo',
  'Contacto con fluidos biológicos', 'Contacto con productos químicos', 'Quemadura', 'Contacto eléctrico', 'Atrapamiento',
  'Accidente de tráfico', 'Estrés o crisis de ansiedad tras un suceso', 'Otra',
]
export const GRAVEDAD = { leve: 'Leve', grave: 'Grave', muy_grave: 'Muy grave', mortal: 'Mortal' }
export const ESTADOS = {
  comunicado: { texto: 'Comunicado', color: '#8a5a00', fondo: '#fdf0d5' },
  investigacion: { texto: 'En investigación', color: '#1f5f8b', fondo: '#e6f0f8' },
  cerrado: { texto: 'Cerrado', color: '#1b6e3c', fondo: '#e3f3e8' },
}
export const TIPOS_CAUSA = [
  'Condiciones del lugar o de las instalaciones', 'Equipos o materiales', 'Organización del trabajo (cargas, turnos, dotación)',
  'Usuario o tercero', 'Formación, información o procedimiento', 'Equipos de protección', 'Factores individuales',
]

export const conBaja = (s) => s.tipo === 'accidente_baja' || (s.tipo === 'in_itinere' && !!s.fecha_baja)
export const investigable = (s) => ['accidente_baja', 'accidente_sin_baja', 'biologico', 'enfermedad'].includes(s.tipo) || (s.tipo === 'incidente' && s.gravedad && s.gravedad !== 'leve')

export function diasBaja(s, hasta = hoyISO()) {
  if (!s.fecha_baja) return 0
  const fin = s.fecha_alta || hasta
  return Math.max(0, Math.round((d(fin) - d(s.fecha_baja)) / 86400000))
}
function sumarHabiles(desde, n) {
  const x = d(desde)
  let k = 0
  while (k < n) { x.setDate(x.getDate() + 1); if (x.getDay() !== 0 && x.getDay() !== 6) k++ }
  return iso(x)
}
// Plazo del parte Delt@: 5 días hábiles desde el accidente o la baja médica (Orden TAS/2926/2002). Sin contar festivos.
export function plazoDelta(s) {
  if (!conBaja(s)) return null
  return sumarHabiles(s.fecha_baja || s.fecha, 5)
}
// Accidentes sin baja: relación mensual en los 5 primeros días hábiles del mes siguiente.
export function plazoRelacion(s) {
  if (s.tipo !== 'accidente_sin_baja') return null
  const x = d(s.fecha); x.setMonth(x.getMonth() + 1, 1); x.setDate(0)   // último día del mes
  return sumarHabiles(iso(x), 5)
}

export function avisos(s) {
  const out = []
  const hoy = hoyISO()
  if (['grave', 'muy_grave', 'mortal'].includes(s.gravedad) && s.tipo !== 'incidente') out.push({ nivel: 'alto', texto: 'Accidente grave, muy grave o mortal: además del parte, hay que comunicarlo a la autoridad laboral en 24 horas.' })
  const p = plazoDelta(s)
  if (p && !s.delta_fecha) out.push({ nivel: p < hoy ? 'alto' : 'medio', texto: `Parte Delt@ pendiente: plazo hasta el ${fechaCorta(p)}.` })
  if (s.tipo === 'enfermedad') out.push({ nivel: 'info', texto: 'El parte de enfermedad profesional lo comunica la mutua (CEPROSS); la empresa debe facilitarle la información.' })
  if (investigable(s) && s.estado === 'comunicado') out.push({ nivel: 'medio', texto: 'Pendiente de investigar.' })
  const vencidas = (s.medidas ?? []).filter((m) => !m.hecha && m.plazo && m.plazo < hoy).length
  if (vencidas) out.push({ nivel: 'alto', texto: `${vencidas} medidas con el plazo vencido.` })
  if (s.fecha_baja && !s.fecha_alta) out.push({ nivel: 'info', texto: `Baja abierta: ${diasBaja(s)} días.` })
  return out
}

// Índices del año (accidentes con baja en jornada de trabajo; los in itinere se cuentan aparte).
export function indicadores(sucesos, plantilla) {
  const conB = sucesos.filter((s) => s.tipo === 'accidente_baja')
  const n = conB.length
  const dias = conB.reduce((a, s) => a + diasBaja(s), 0)
  const t = Number(plantilla?.trabajadores) || 0
  const h = Number(plantilla?.horas) || 0
  const r = (x, dec = 2) => (Number.isFinite(x) ? Math.round(x * 10 ** dec) / 10 ** dec : null)
  return {
    n, dias,
    itinere: sucesos.filter((s) => s.tipo === 'in_itinere' && s.fecha_baja).length,
    sinBaja: sucesos.filter((s) => s.tipo === 'accidente_sin_baja').length,
    biologicos: sucesos.filter((s) => s.tipo === 'biologico').length,
    incidentes: sucesos.filter((s) => s.tipo === 'incidente').length,
    enfermedades: sucesos.filter((s) => s.tipo === 'enfermedad').length,
    incidencia: t ? r((n / t) * 1000) : null,
    frecuencia: h ? r((n / h) * 1e6) : null,
    gravedad: h ? r((dias / h) * 1000) : null,
    duracion: n ? r(dias / n, 1) : null,
  }
}
