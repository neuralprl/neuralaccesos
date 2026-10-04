// Lógica del registro de agresiones. Funciones puras, sin red ni base de datos.

export const TIPOS = {
  fisica: 'Agresión física',
  verbal: 'Agresión verbal',
  amenazas: 'Amenazas',
  sexual: 'Acoso o agresión sexual',
  material: 'Daños al material o a las pertenencias',
  otra: 'Otra',
}
export const AGRESORES = { usuario: 'Usuario', familiar: 'Familiar o acompañante', otra: 'Otra persona' }
export const CONSECUENCIAS = {
  sin_lesion: 'Sin lesión',
  lesion_sin_baja: 'Lesión sin baja',
  lesion_con_baja: 'Lesión con baja',
}
export const ESTADOS = { abierta: 'Abierta', cerrada: 'Cerrada' }

export const hoyISO = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

export const agresionNueva = (centroId = '', hoy = hoyISO()) => ({
  centro_id: centroId,
  fecha: hoy,
  hora: '',
  lugar: '',
  puesto: '',
  tipo: 'fisica',
  agresor: 'usuario',
  agresor_ref: '',
  descripcion: '',
  actuacion: '',
  consecuencias: 'sin_lesion',
  parte_accidente: false,
  comunicada_prevencion: false,
  medidas: '',
  estado: 'abierta',
})

// Devuelve la lista de problemas del formulario (vacía si es correcto).
export function validarAgresion(f, hoy = hoyISO()) {
  const p = []
  if (!f.centro_id) p.push('Elige el centro.')
  if (!f.fecha) p.push('Indica la fecha.')
  else if (f.fecha > hoy) p.push('La fecha no puede ser futura.')
  if (!TIPOS[f.tipo]) p.push('Elige el tipo de agresión.')
  if (!AGRESORES[f.agresor]) p.push('Indica quién agrede.')
  if (!CONSECUENCIAS[f.consecuencias]) p.push('Indica las consecuencias.')
  if (f.consecuencias === 'lesion_con_baja' && !f.parte_accidente) p.push('Una lesión con baja requiere parte de accidente: marca que se ha tramitado o cambia las consecuencias.')
  if ((f.agresor_ref ?? '').trim().length > 12) p.push('La referencia del agresor debe ser un código o unas iniciales, no un nombre completo.')
  return p
}

// Fila lista para guardar: textos recortados y vacíos como null.
export function filaParaGuardar(f) {
  const t = (v) => ((v ?? '').toString().trim() || null)
  return {
    centro_id: f.centro_id,
    fecha: f.fecha,
    hora: t(f.hora),
    lugar: t(f.lugar),
    puesto: t(f.puesto),
    tipo: f.tipo,
    agresor: f.agresor,
    agresor_ref: t(f.agresor_ref) ? t(f.agresor_ref).toUpperCase() : null,
    descripcion: t(f.descripcion),
    actuacion: t(f.actuacion),
    consecuencias: f.consecuencias,
    parte_accidente: !!f.parte_accidente,
    comunicada_prevencion: !!f.comunicada_prevencion,
    medidas: t(f.medidas),
    estado: f.estado,
  }
}

const restaDias = (iso, dias) => {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - dias)
  return d.toISOString().slice(0, 10)
}

// Avisos de una agresión que requiere seguimiento.
export function avisosDe(a, hoy = hoyISO()) {
  const av = []
  if (a.consecuencias !== 'sin_lesion' && !a.parte_accidente) av.push('Lesión sin parte de accidente')
  if (!a.comunicada_prevencion) av.push('Sin comunicar a prevención')
  if (a.estado === 'abierta' && a.fecha <= restaDias(hoy, 30)) av.push('Abierta desde hace más de 30 días')
  return av
}

// Resumen para vigilar un centro (o todos): totales, tipos, puestos, avisos y agresores reiterados.
export function resumenAgresiones(lista, hoy = hoyISO()) {
  const desde = restaDias(hoy, 365)
  const ult = lista.filter((a) => a.fecha > desde)
  const contar = (arr, clave) => arr.reduce((m, a) => { const k = clave(a) || 'Sin indicar'; m[k] = (m[k] || 0) + 1; return m }, {})
  const porTipo = contar(ult, (a) => TIPOS[a.tipo])
  const porPuesto = contar(ult, (a) => a.puesto)
  const refs = contar(ult.filter((a) => (a.agresor_ref ?? '').trim()), (a) => a.agresor_ref.trim().toUpperCase())
  const reiterados = Object.entries(refs).filter(([, n]) => n >= 3).map(([ref, n]) => ({ ref, n })).sort((a, b) => b.n - a.n)
  const conAviso = lista.filter((a) => avisosDe(a, hoy).length > 0)
  return {
    total: lista.length,
    ultimoAnio: ult.length,
    conLesion: ult.filter((a) => a.consecuencias !== 'sin_lesion').length,
    conBaja: ult.filter((a) => a.consecuencias === 'lesion_con_baja').length,
    abiertas: lista.filter((a) => a.estado === 'abierta').length,
    porTipo,
    porPuesto,
    reiterados,
    conAviso: conAviso.length,
  }
}

export function filtrarAgresiones(lista, { anio = '', tipo = '', estado = '', soloAvisos = false } = {}, hoy = hoyISO()) {
  return lista.filter((a) =>
    (!anio || a.fecha.startsWith(anio)) && (!tipo || a.tipo === tipo) && (!estado || a.estado === estado) &&
    (!soloAvisos || avisosDe(a, hoy).length > 0))
}

export const fechaES = (iso) => (iso ? iso.split('-').reverse().join('/') : '')
