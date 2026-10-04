// Mantenimiento legal de instalaciones: periodicidades, próxima fecha y estado de cada actuación.

export const hoyISO = () => new Date().toISOString().slice(0, 10)
export const fechaCorta = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`).toLocaleDateString('es-ES') : '')
export function sumarDias(iso, dias) {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + Number(dias))
  return d.toISOString().slice(0, 10)
}
const diasEntre = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000)

const NOMBRES = { 7: 'semanal', 30: 'mensual', 91: 'trimestral', 182: 'semestral', 365: 'anual' }
export function textoPeriodo(dias) {
  if (!dias) return 'Según la instalación'
  if (NOMBRES[dias]) return NOMBRES[dias]
  if (dias >= 700) return `cada ${Math.round(dias / 365.25)} años`
  if (dias >= 28) return `cada ${Math.round(dias / 30.44)} meses`
  return `cada ${dias} días`
}
// «5 años», «6 meses», «30 días» -> días
export function leerPeriodo(texto) {
  const m = String(texto ?? '').trim().toLowerCase().match(/^(\d+(?:[.,]\d+)?)\s*(d|dia|días|dias|s|sem|semanas?|m|mes|meses|a|año|años|anos?)?$/)
  if (!m) return null
  const n = Number(m[1].replace(',', '.'))
  const u = (m[2] ?? 'd')[0]
  return Math.round(u === 'a' ? n * 365.25 : u === 'm' ? n * 30.44 : u === 's' ? n * 7 : n)
}

export const ESTADOS = {
  vencida: { texto: 'Vencida', color: '#b3261e', fondo: '#fdecea', orden: 0 },
  proxima: { texto: 'Próxima', color: '#8a5a00', fondo: '#fdf0d5', orden: 1 },
  sin_datos: { texto: 'Sin registro', color: '#55616b', fondo: '#eef1f3', orden: 2 },
  sin_periodo: { texto: 'Falta periodicidad', color: '#55616b', fondo: '#eef1f3', orden: 3 },
  al_dia: { texto: 'Al día', color: '#1b6e3c', fondo: '#e3f3e8', orden: 4 },
}
// Aviso de «próxima»: el 15 % del periodo, entre 7 y 60 días.
const margen = (dias) => Math.min(60, Math.max(7, Math.round(dias * 0.15)))

export function periodoDe(inst, act) {
  const propio = inst.dias_propios?.[act.id]
  return propio ? Number(propio) : act.dias
}

export function estadoActuacion(inst, act, registros) {
  const regs = registros.filter((r) => r.instalacion_id === inst.id && r.actuacion_id === act.id).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const ultima = regs[0] ?? null
  const dias = periodoDe(inst, act)
  let clave
  let proxima = null
  if (!dias) clave = 'sin_periodo'
  else if (!ultima) clave = 'sin_datos'
  else {
    proxima = sumarDias(ultima.fecha, dias)
    const quedan = diasEntre(hoyISO(), proxima)
    clave = quedan < 0 ? 'vencida' : quedan <= margen(dias) ? 'proxima' : 'al_dia'
  }
  const defectos = regs.filter((r) => r.resultado !== 'favorable' && !r.subsanado_en)
  return { clave, ...ESTADOS[clave], dias, ultima, proxima, regs, defectos }
}

export const actuacionesDe = (inst, actuaciones) => actuaciones.filter((a) => a.tipo === inst.tipo && !(inst.actuaciones_off ?? []).includes(a.id))

export const RESULTADOS = { favorable: 'Favorable', con_defectos: 'Con defectos', desfavorable: 'Desfavorable' }
