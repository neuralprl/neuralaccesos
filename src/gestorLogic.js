// Lógica del gestor documental. Funciones puras, sin red ni base de datos.

export const MAX_BYTES = 50 * 1024 * 1024   // límite habitual de Supabase por archivo; el servidor aplica el suyo

export const extension = (nombre) => {
  const m = /\.([A-Za-z0-9]{1,8})$/.exec(nombre ?? '')
  return m ? m[1].toLowerCase() : ''
}

// Icono de cada documento: etiqueta corta y color.
export function iconoDe(doc) {
  if (doc.tipo === 'enlace') return { etiqueta: 'ENLACE', color: '#455a64' }
  const e = extension(doc.nombre_archivo)
  if (e === 'pdf') return { etiqueta: 'PDF', color: '#c62828' }
  if (['doc', 'docx', 'odt', 'rtf'].includes(e)) return { etiqueta: 'DOC', color: '#1565c0' }
  if (['xls', 'xlsx', 'xlsm', 'csv', 'ods'].includes(e)) return { etiqueta: 'XLS', color: '#2e7d32' }
  if (['ppt', 'pptx', 'odp'].includes(e)) return { etiqueta: 'PPT', color: '#d9600a' }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(e)) return { etiqueta: 'IMG', color: '#6a1b9a' }
  if (['zip', 'rar', '7z'].includes(e)) return { etiqueta: 'ZIP', color: '#6d4c41' }
  if (['txt', 'md'].includes(e)) return { etiqueta: 'TXT', color: '#546e7a' }
  return { etiqueta: (e || 'ARCH').toUpperCase().slice(0, 4), color: '#546e7a' }
}

// Los navegadores muestran estos tipos sin descargarlos.
export const sePuedeVer = (doc) =>
  doc.tipo === 'enlace' || ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt'].includes(extension(doc.nombre_archivo))

// Nombre apto para el almacenamiento: sin acentos, espacios ni símbolos, conservando la extensión.
export function nombreSeguro(nombre) {
  const original = String(nombre ?? '').trim()
  const ext = extension(original)
  const base = ext ? original.slice(0, -(ext.length + 1)) : original
  const limpio = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^[_.-]+|[_.-]+$/g, '').slice(0, 80) || 'archivo'
  return ext ? `${limpio}.${ext}` : limpio
}

// Ruta dentro del almacenamiento. La seguridad depende de esta estructura:
//   general/<id>/<archivo>            visible para todos
//   centro/<centro_id>/<id>/<archivo> visible solo para el técnico y para los usuarios de ese centro
export function rutaDe({ ambito, centro_id, id, nombreArchivo }) {
  const f = nombreSeguro(nombreArchivo)
  return ambito === 'centro' ? `centro/${centro_id}/${id}/${f}` : `general/${id}/${f}`
}

export function esUrlSegura(texto) {
  try {
    const u = new URL(String(texto ?? '').trim())
    return u.protocol === 'https:' && !u.username && !u.password
  } catch {
    return false
  }
}

export function tamanoLegible(b) {
  if (b == null) return ''
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

// f: { ambito, centro_id, nombre, tipo, archivo: {name,size}, url }
export function validarDocumento(f) {
  const p = []
  if (!(f.nombre ?? '').trim()) p.push('Escribe el nombre que tendrá el documento.')
  else if (f.nombre.trim().length > 120) p.push('El nombre es demasiado largo (máximo 120 caracteres).')
  if (!['general', 'centro'].includes(f.ambito)) p.push('Indica si el documento es general o específico de un centro.')
  if (f.ambito === 'centro' && !f.centro_id) p.push('Elige el centro del documento.')
  if (f.tipo === 'enlace') {
    if (!esUrlSegura(f.url)) p.push('El enlace debe empezar por https:// y no llevar usuario ni contraseña.')
  } else {
    if (!f.archivo) p.push('Elige el archivo.')
    else if (!f.archivo.size) p.push('El archivo está vacío.')
    else if (f.archivo.size > MAX_BYTES) p.push(`El archivo pesa ${tamanoLegible(f.archivo.size)} y el máximo es ${tamanoLegible(MAX_BYTES)}.`)
  }
  return p
}

export function filtrarDocumentos(lista, { q = '', centro = '' } = {}) {
  const t = q.trim().toLowerCase()
  return lista.filter((d) =>
    (!centro || (centro === 'general' ? d.ambito === 'general' : d.centro_id === centro)) &&
    (!t || `${d.nombre} ${d.nombre_archivo ?? ''}`.toLowerCase().includes(t)))
}

// Generales primero y después un bloque por centro, ordenados por nombre.
export function agrupar(lista, nombresCentros = {}) {
  const orden = (a, b) => a.nombre.localeCompare(b.nombre, 'es')
  const generales = lista.filter((d) => d.ambito === 'general').sort(orden)
  const mapa = new Map()
  lista.filter((d) => d.ambito === 'centro').forEach((d) => {
    if (!mapa.has(d.centro_id)) mapa.set(d.centro_id, [])
    mapa.get(d.centro_id).push(d)
  })
  const porCentro = [...mapa.entries()]
    .map(([centro_id, docs]) => ({ centro_id, nombre: nombresCentros[centro_id] ?? 'Centro', docs: docs.sort(orden) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  return { generales, porCentro }
}

export const fechaES = (iso) => (iso ? String(iso).slice(0, 10).split('-').reverse().join('/') : '')

// Tipo de cada documento. Los de «actividad» se cuentan en la memoria anual por su fecha.
export const CATEGORIAS_DOC = {
  general: [
    { id: 'sistema', nombre: 'Documento general del sistema', ayuda: 'Plan de prevención, política, programa anual, manual...' },
    { id: 'procedimiento', nombre: 'Procedimiento' },
  ],
  centro: [
    { id: 'simulacro', nombre: 'Informe de simulacro', actividad: 'Simulacros de emergencia' },
    { id: 'formacion', nombre: 'Formación (registro, certificado, listado)', actividad: 'Acciones formativas' },
    { id: 'informacion', nombre: 'Información a trabajadores (recibís)', actividad: 'Entregas de información' },
    { id: 'investigacion', nombre: 'Investigación de accidente o incidente', actividad: 'Investigaciones de accidentes e incidentes' },
    { id: 'mediciones', nombre: 'Mediciones o estudio específico', actividad: 'Mediciones y estudios específicos' },
    { id: 'instalaciones', nombre: 'Certificado o revisión de instalaciones', actividad: 'Revisiones de instalaciones' },
    { id: 'cae', nombre: 'Coordinación de actividades empresariales', actividad: 'Coordinación de actividades empresariales' },
    { id: 'reunion', nombre: 'Acta de reunión o del comité', actividad: 'Reuniones y comités de seguridad y salud' },
    { id: 'emergencia', nombre: 'Plan de emergencia o autoprotección', actividad: 'Planes de emergencia' },
    { id: 'otro', nombre: 'Otro documento' },
  ],
}
export const nombreCategoria = (id) => [...CATEGORIAS_DOC.general, ...CATEGORIAS_DOC.centro].find((c) => c.id === id)?.nombre ?? 'Otro documento'
