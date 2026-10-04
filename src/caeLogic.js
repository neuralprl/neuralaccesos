// Lógica de la CAE: estado de cada documento y de cada empresa, textos con formato sencillo e importación desde Drive.

export const URL_ACCESOS = 'https://neuralaccesos.vercel.app'   // web pública de accesos de trabajadores externos (cámbiala si tiene otro dominio)
export const DIAS_AVISO = 30                                     // «caduca pronto»

export const hoyISO = () => new Date().toISOString().slice(0, 10)
export function sumarMeses(iso, meses) {
  if (!meses) return ''
  const d = new Date(`${iso}T12:00:00`)
  d.setMonth(d.getMonth() + Number(meses))
  return d.toISOString().slice(0, 10)
}
const diasHasta = (iso) => Math.round((new Date(`${iso}T12:00:00`) - new Date(`${hoyISO()}T12:00:00`)) / 86400000)
export const fechaCorta = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`).toLocaleDateString('es-ES') : '')
export const enmascararDni = (dni) => (dni ? `****${String(dni).slice(-5)}` : '')

// Estado de un documento vigente (o de su ausencia).
export const ESTADOS_DOC = {
  falta: { texto: 'Falta', color: '#b3261e', fondo: '#fdecea' },
  rechazado: { texto: 'Rechazado', color: '#b3261e', fondo: '#fdecea' },
  caducado: { texto: 'Caducado', color: '#b3261e', fondo: '#fdecea' },
  revisar: { texto: 'Pendiente de revisión', color: '#8a5a00', fondo: '#fdf0d5' },
  valido: { texto: 'Validado', color: '#1b6e3c', fondo: '#e3f3e8' },
}
export function estadoDoc(doc) {
  if (!doc) return { clave: 'falta', ...ESTADOS_DOC.falta }
  if (doc.estado === 'rechazado') return { clave: 'rechazado', ...ESTADOS_DOC.rechazado }
  if (doc.caduca_en && diasHasta(doc.caduca_en) < 0) return { clave: 'caducado', ...ESTADOS_DOC.caducado }
  const pronto = doc.caduca_en && diasHasta(doc.caduca_en) <= DIAS_AVISO ? diasHasta(doc.caduca_en) : null
  const base = doc.estado === 'validado' ? { clave: 'valido', ...ESTADOS_DOC.valido } : { clave: 'revisar', ...ESTADOS_DOC.revisar }
  return { ...base, pronto }
}
// Un imprescindible vale si está subido o validado y sin caducar (igual que en la base de datos).
export const docVale = (doc) => ['revisar', 'valido'].includes(estadoDoc(doc).clave)

// Resumen de una empresa: qué documentos le faltan, cuáles hay que revisar y cuáles caducan pronto.
export function resumenEmpresa(tipos, docs) {
  const vig = new Map(docs.filter((d) => d.vigente).map((d) => [d.tipo, d]))
  const activos = tipos.filter((t) => t.activo)
  const faltanImp = activos.filter((t) => t.imprescindible && !docVale(vig.get(t.codigo)))
  const obligPend = activos.filter((t) => !docVale(vig.get(t.codigo)))
  const porRevisar = [...vig.values()].filter((d) => estadoDoc(d).clave === 'revisar').length
  const caducanPronto = [...vig.values()].filter((d) => estadoDoc(d).pronto != null).length
  return { acceso: faltanImp.length === 0, faltanImp, obligPend, porRevisar, caducanPronto, vig }
}

// ---------- Texto con formato sencillo: «# » título, «- » punto de lista; el resto, párrafos ----------
export function bloquesTexto(texto) {
  const bloques = []
  for (const linea of String(texto ?? '').split(/\r?\n/)) {
    const l = linea.trim()
    if (!l) continue
    if (l.startsWith('# ')) bloques.push({ tipo: 'h', texto: l.slice(2).trim() })
    else if (l.startsWith('- ')) {
      const ult = bloques[bloques.length - 1]
      if (ult?.tipo === 'ul') ult.items.push(l.slice(2).trim()); else bloques.push({ tipo: 'ul', items: [l.slice(2).trim()] })
    } else bloques.push({ tipo: 'p', texto: l })
  }
  return bloques
}
const e = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const htmlTexto = (texto) => bloquesTexto(texto).map((b) => (b.tipo === 'h' ? `<h2>${e(b.texto)}</h2>` : b.tipo === 'ul' ? `<ul>${b.items.map((i) => `<li>${e(i)}</li>`).join('')}</ul>` : `<p>${e(b.texto)}</p>`)).join('\n')

// ---------- Importación de los archivos de Drive ----------
// Carpeta «A001 - AEM» -> código A001. Archivo «1-...», «2-...», «3-...» o palabras clave -> tipo.
export function codigoDeRuta(ruta) {
  const partes = String(ruta ?? '').split('/').filter(Boolean)
  const carpeta = partes.length > 1 ? partes[partes.length - 2] : ''
  const m = carpeta.match(/^\s*([A-Za-z]\d{2,})/)
  return m ? m[1].toUpperCase() : null
}
const sin = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
export function tipoDeArchivo(nombre) {
  const n = sin(nombre)
  if (/^1[-_ ]/.test(n)) return 'prl'
  if (/^2[-_ ]/.test(n)) return 'er'
  if (/^3[-_ ]/.test(n)) return 'sp'
  if (/certificado.*(prl|cae|cumplimiento)|coordinacion|documento.?cae/.test(n)) return 'prl'
  if (/evaluacion|riesgos/.test(n)) return 'er'
  if (/modalidad|preventiva|concierto|servicio.?de.?prevencion/.test(n)) return 'sp'
  if (/responsabilidad.?civil|poliza|seguro/.test(n)) return 'rc'
  if (/seguridad.?social|tgss/.test(n)) return 'ss'
  if (/hacienda|aeat|tributaria/.test(n)) return 'hac'
  if (/\brnt\b|relacion.?nominal|\bita\b/.test(n)) return 'rnt'
  if (/formacion/.test(n)) return 'for'
  if (/aptitud|reconocimiento|vigilancia/.test(n)) return 'vs'
  if (/\bepi/.test(n)) return 'epi'
  return null
}

export const slugArchivo = (s) => sin(s).replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'documento'
