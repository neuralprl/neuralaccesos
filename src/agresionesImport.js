// Subida masiva de agresiones desde Excel: lee las filas, las valida una a una y devuelve lo que se puede cargar.
// Funciones puras, sin red ni base de datos.
import { AGRESORES, CONSECUENCIAS, ESTADOS, TIPOS, agresionNueva, filaParaGuardar, hoyISO, validarAgresion } from './agresionesLogic.js'

export const COLUMNAS = [
  'Código del centro', 'Fecha', 'Hora', 'Lugar', 'Puesto', 'Tipo', 'Quién agrede', 'Ref. agresor', 'Consecuencias',
  'Parte de accidente', 'Comunicada a prevención', 'Estado', 'Qué ocurrió', 'Actuación', 'Medidas',
]
export const OBLIGATORIAS = ['Código del centro', 'Fecha', 'Tipo']

const sin = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Acepta la etiqueta completa, la clave o una parte clara de la etiqueta («física», «sexual»).
export function claveDe(mapa, texto) {
  const t = sin(texto)
  if (!t) return null
  for (const [k, v] of Object.entries(mapa)) if (k === t || sin(v) === t) return k
  const parecidas = Object.entries(mapa).filter(([, v]) => t.length >= 4 && sin(v).includes(t))
  return parecidas.length === 1 ? parecidas[0][0] : null
}

export function parseFecha(txt) {
  const t = String(txt ?? '').trim()
  if (!t) return null
  let y, m, d
  let r
  if ((r = /^(\d{4})-(\d{2})-(\d{2})/.exec(t))) [y, m, d] = [+r[1], +r[2], +r[3]]
  else if ((r = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/.exec(t))) [d, m, y] = [+r[1], +r[2], r[3].length === 2 ? 2000 + +r[3] : +r[3]]
  else if (/^\d{5}$/.test(t)) {                                    // fecha de Excel guardada como número
    const f = new Date(Date.UTC(1899, 11, 30) + Number(t) * 86400000)
    return f.toISOString().slice(0, 10)
  } else return null
  const f = new Date(Date.UTC(y, m - 1, d))
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== m - 1 || f.getUTCDate() !== d) return null
  return f.toISOString().slice(0, 10)
}

export function parseHora(txt) {
  const t = String(txt ?? '').trim()
  if (!t) return ''
  let r = /^(\d{1,2}):(\d{2})(:\d{2})?$/.exec(t)
  if (r && +r[1] < 24 && +r[2] < 60) return `${r[1].padStart(2, '0')}:${r[2]}`
  if ((r = /^0?\.\d+$/.exec(t))) {                                // hora de Excel guardada como fracción de día
    const min = Math.round(parseFloat(t) * 1440)
    return `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
  }
  return null
}

export function parseSiNo(txt) {
  const t = sin(txt)
  if (['', 'no', 'n', '0', 'false'].includes(t)) return false
  if (['si', 's', '1', 'true', 'x'].includes(t)) return true
  return null
}

const firma = (f) => [f.centro_id, f.fecha, f.hora ?? '', f.tipo, sin(f.puesto), (f.agresor_ref ?? '').toUpperCase(), sin(f.descripcion).slice(0, 40)].join('|')
export const firmaDe = firma

// filas: objetos { cabecera: texto } (como los devuelve leerHoja). centros: [{id, codigo}] a los que se puede cargar.
export function prepararAgresiones(filas, centros, hoy = hoyISO()) {
  const porCodigo = new Map(centros.map((c) => [sin(c.codigo), c]))
  const errores = []
  const validas = []
  const vistas = new Set()
  let repetidasEnArchivo = 0

  if (filas.length === 0) return { validas, errores: [{ fila: 1, motivo: 'La hoja no tiene filas con datos.' }], repetidasEnArchivo }
  const cabeceras = new Set(Object.keys(filas[0]))
  const faltan = OBLIGATORIAS.filter((c) => !cabeceras.has(c))
  if (faltan.length) return { validas, errores: [{ fila: 1, motivo: `Faltan columnas obligatorias: ${faltan.join(', ')}. Usa la plantilla.` }], repetidasEnArchivo }

  filas.forEach((r, i) => {
    const n = i + 2
    const p = []
    const g = (c) => String(r[c] ?? '').trim()
    const centro = porCodigo.get(sin(g('Código del centro')))
    if (!g('Código del centro')) p.push('falta el código del centro')
    else if (!centro) p.push(`el centro «${g('Código del centro')}» no existe o no tienes acceso`)
    const fecha = parseFecha(g('Fecha'))
    if (!g('Fecha')) p.push('falta la fecha'); else if (!fecha) p.push(`la fecha «${g('Fecha')}» no es válida (usa dd/mm/aaaa)`)
    const hora = parseHora(g('Hora'))
    if (hora === null) p.push(`la hora «${g('Hora')}» no es válida (usa hh:mm)`)
    const tipo = claveDe(TIPOS, g('Tipo'))
    if (!g('Tipo')) p.push('falta el tipo'); else if (!tipo) p.push(`el tipo «${g('Tipo')}» no es válido`)
    const agresor = g('Quién agrede') ? claveDe(AGRESORES, g('Quién agrede')) : 'usuario'
    if (!agresor) p.push(`«Quién agrede» «${g('Quién agrede')}» no es válido`)
    const consecuencias = g('Consecuencias') ? claveDe(CONSECUENCIAS, g('Consecuencias')) : 'sin_lesion'
    if (!consecuencias) p.push(`las consecuencias «${g('Consecuencias')}» no son válidas`)
    const estado = g('Estado') ? claveDe(ESTADOS, g('Estado')) : 'abierta'
    if (!estado) p.push(`el estado «${g('Estado')}» no es válido`)
    const parte = parseSiNo(g('Parte de accidente'))
    if (parte === null) p.push('«Parte de accidente» debe ser Sí o No')
    const comunicada = parseSiNo(g('Comunicada a prevención'))
    if (comunicada === null) p.push('«Comunicada a prevención» debe ser Sí o No')

    if (!p.length) {
      const f = {
        ...agresionNueva(centro.id, hoy), fecha, hora, lugar: g('Lugar'), puesto: g('Puesto'), tipo, agresor, agresor_ref: g('Ref. agresor'),
        descripcion: g('Qué ocurrió'), actuacion: g('Actuación'), consecuencias, parte_accidente: parte, comunicada_prevencion: comunicada, medidas: g('Medidas'), estado,
      }
      p.push(...validarAgresion(f, hoy).map((m) => m.replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())))
      if (!p.length) {
        const fila = filaParaGuardar(f)
        const k = firma(fila)
        if (vistas.has(k)) repetidasEnArchivo += 1
        else { vistas.add(k); validas.push(fila) }
      }
    }
    if (p.length) errores.push({ fila: n, motivo: p.join('; ') })
  })
  return { validas, errores, repetidasEnArchivo }
}
