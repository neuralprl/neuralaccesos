// Lógica del PAC (visita al centro): prioridades y plazos, preguntas previas y validación de la lista.
// Funciones puras, sin red ni base de datos.
import { limpiar } from './importLogic.js'
import { COSTE_POR_DEFECTO, RESPONSABLE_DEFECTO, sumarPlazo } from './planLogic.js'
import {
  CONSECUENCIAS, MATRIZ_PAC, NIVELES_DEFICIENCIA, PRIORIDADES_PAC as PRIORIDADES_DOC,
} from './metodologiaContenido.js'

// ---------- prioridades y estados ----------
// El texto del plazo (detalle) es el de la metodología; la fecha se calcula con la regla numérica.
const detalleDoc = (clave) => PRIORIDADES_DOC.find((p) => p.nombre.toLowerCase() === clave)?.plazo ?? ''
export const PRIORIDADES_PAC = {
  inmediata: { etiqueta: 'Inmediata', detalle: detalleDoc('inmediata'), plazo: { dias: 0 }, color: '#c62828' },
  alta: { etiqueta: 'Alta', detalle: detalleDoc('alta'), plazo: { dias: 7 }, color: '#ef6c00' },
  media: { etiqueta: 'Media', detalle: detalleDoc('media'), plazo: { meses: 1 }, color: '#f9a825' },
  baja: { etiqueta: 'Baja', detalle: detalleDoc('baja'), plazo: { meses: 3 }, color: '#2e7d32' },
}
export const ORDEN_PRIORIDAD_PAC = ['inmediata', 'alta', 'media', 'baja']
export const ESTADOS_PAC = { pendiente: 'Pendiente', realizada: 'Realizada', alternativa: 'Medida alternativa' }

export const plazoPrioridad = (prioridad, fechaVisita) =>
  PRIORIDADES_PAC[prioridad] ? sumarPlazo(fechaVisita, PRIORIDADES_PAC[prioridad].plazo) : null

// Prioridad de una incidencia según el nivel de deficiencia y las consecuencias (matriz de la metodología).
export const DEFICIENCIA_DEFECTO = 'DEF'   // Deficiente
export const CONSECUENCIAS_DEFECTO = 'D'   // Dañino  -> prioridad Media
export const prioridadPAC = (deficiencia, consecuencias) => {
  const p = MATRIZ_PAC[deficiencia]?.[consecuencias]
  return p ? p.toLowerCase() : null
}
export const nombreDeficiencia = (codigo) => NIVELES_DEFICIENCIA.find((x) => x.codigo === codigo)?.nombre ?? ''
export const nombreConsecuencia = (codigo) => CONSECUENCIAS.find((x) => x.codigo === codigo)?.nombre ?? ''

// Valores de una incidencia recién marcada.
export function incidenciaNueva(fechaVisita) {
  const prioridad = prioridadPAC(DEFICIENCIA_DEFECTO, CONSECUENCIAS_DEFECTO)
  return {
    resultado: 'no_cumple',
    deficiencia: DEFICIENCIA_DEFECTO,
    consecuencias: CONSECUENCIAS_DEFECTO,
    prioridad,
    observaciones: '',
    responsable: RESPONSABLE_DEFECTO,
    coste: COSTE_POR_DEFECTO,
    plazo: plazoPrioridad(prioridad, fechaVisita),
    estado_accion: 'pendiente',
    fecha_realizacion: null,
    medida_alternativa: '',
    resuelta_estado: 'pendiente',
    fecha_resuelta: null,
  }
}

// Al cambiar la deficiencia o las consecuencias se recalcula la prioridad y, con ella, el plazo
// (salvo que el plazo se hubiera fijado a mano).
export function conValoracion(inc, cambio, fechaVisita) {
  const nueva = { ...inc, ...cambio }
  const prioridad = prioridadPAC(nueva.deficiencia, nueva.consecuencias) ?? inc.prioridad
  const eraAutomatico = !inc.plazo || inc.plazo === plazoPrioridad(inc.prioridad, fechaVisita)
  return { ...nueva, prioridad, plazo: eraAutomatico ? plazoPrioridad(prioridad, fechaVisita) : nueva.plazo }
}

// ---------- preguntas previas ----------
const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const esSI = (v) => ['si', 'true', '1', 'yes'].includes(sinAcentos(v))
const OPERADORES = ['=', '!=', '>', '<', '>=', '<=']

// Evalúa una regla de la pregunta previa contra la ficha del centro.
// Devuelve true/false, o null si no hay regla o el centro no tiene el dato.
export function evaluarRegla(centro, caracteristica, operador, valor) {
  if (!caracteristica || !operador) return null
  const raw = centro?.[caracteristica]
  if (raw === undefined || raw === null || raw === '') return null
  if (typeof raw === 'boolean') {
    const b = esSI(valor)
    return operador === '!=' ? raw !== b : raw === b
  }
  if (typeof raw === 'number') {
    const n = Number(valor)
    if (Number.isNaN(n)) return null
    return { '=': raw === n, '!=': raw !== n, '>': raw > n, '<': raw < n, '>=': raw >= n, '<=': raw <= n }[operador] ?? null
  }
  const a = sinAcentos(raw)
  const b = sinAcentos(valor)
  if (operador === '=') return a === b
  if (operador === '!=') return a !== b
  return null
}

// Respuesta de cada pregunta previa para un centro: la de la visita si se cambió,
// si no la que sale de la ficha del centro y, si no, la de por defecto.
export function respuestasPrevias(preguntas, centro, overrides = {}) {
  const mapa = new Map()
  preguntas.forEach((p) => {
    if (overrides[p.id] !== undefined && overrides[p.id] !== null) {
      mapa.set(p.id, { valor: !!overrides[p.id], origen: 'visita' })
      return
    }
    const auto = evaluarRegla(centro, p.caracteristica, p.operador, p.valor)
    mapa.set(p.id, auto !== null ? { valor: auto, origen: 'ficha' } : { valor: !!p.por_defecto, origen: 'defecto' })
  })
  return mapa
}

export const itemVisible = (item, respuestas) =>
  !item.pregunta_previa || (respuestas.get(item.pregunta_previa)?.valor ?? true)

// Bloques y secciones en el orden de la lista.
export function agruparItems(items) {
  const bloques = []
  const porBloque = new Map()
  ;[...items].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).forEach((it) => {
    let b = porBloque.get(it.bloque)
    if (!b) { b = { bloque: it.bloque, secciones: [], mapa: new Map() }; porBloque.set(it.bloque, b); bloques.push(b) }
    const clave = it.seccion || ''
    let s = b.mapa.get(clave)
    if (!s) { s = { seccion: clave, items: [] }; b.mapa.set(clave, s); b.secciones.push(s) }
    s.items.push(it)
  })
  return bloques.map(({ bloque, secciones }) => ({ bloque, secciones }))
}

// ---------- validación de la lista (hojas preguntas_previas y pac_items) ----------
const col = (fila, prefijo) => {
  const k = Object.keys(fila).find((h) => h.toLowerCase().startsWith(prefijo.toLowerCase()))
  return k ? fila[k] : ''
}

export function prepararPac({ preguntas = [], items = [] }) {
  const errores = []
  const avisos = []
  const pregs = []
  const ids = new Set()

  preguntas.forEach((r, i) => {
    const fila = i + 2
    const id = limpiar(col(r, 'ID'))
    const pregunta = limpiar(col(r, 'Pregunta previa'))
    if (!id && !pregunta) return
    const problemas = []
    if (!id) problemas.push('falta el ID')
    if (id && ids.has(id)) problemas.push(`ID repetido (${id})`)
    if (!pregunta) problemas.push('falta la pregunta')
    const defecto = sinAcentos(col(r, 'Por defecto'))
    if (!['si', 'no'].includes(defecto)) problemas.push('«Por defecto» debe ser Sí o No')
    const car = limpiar(col(r, 'Se responde sola'))
    const op = limpiar(col(r, 'Operador'))
    const val = limpiar(col(r, 'Valor'))
    if (car && !OPERADORES.includes(op)) problemas.push('falta un operador válido (=, !=, >, <, >=, <=)')
    if (car && val === '') problemas.push('falta el valor de la regla')
    if (problemas.length) { errores.push({ hoja: 'preguntas_previas', fila, motivo: problemas.join('; ') }); return }
    ids.add(id)
    pregs.push({ id, pregunta, por_defecto: defecto === 'si', caracteristica: car || null, operador: car ? op : null, valor: car ? val : null })
  })

  const vistos = new Set()
  const its = []
  items.forEach((r, i) => {
    const fila = i + 2
    const bloque = limpiar(col(r, 'Bloque'))
    const punto = limpiar(col(r, 'Punto a comprobar'))
    if (!bloque && !punto) return
    const previa = limpiar(col(r, 'Pregunta previa'))
    const problemas = []
    if (!bloque) problemas.push('falta el bloque')
    if (!punto) problemas.push('falta el punto a comprobar')
    if (previa && !ids.has(previa)) problemas.push(`la pregunta previa ${previa} no existe`)
    if (bloque && punto && vistos.has(`${bloque}|${punto}`)) problemas.push('punto repetido en el mismo bloque')
    if (problemas.length) { errores.push({ hoja: 'pac_items', fila, motivo: problemas.join('; ') }); return }
    vistos.add(`${bloque}|${punto}`)
    const orden = parseInt(limpiar(col(r, 'Orden')), 10)
    its.push({
      orden: Number.isNaN(orden) ? its.length + 1 : orden,
      bloque,
      seccion: limpiar(col(r, 'Sección')) || null,
      punto,
      riesgo: limpiar(col(r, 'Riesgo asociado')) || null,
      pregunta_previa: previa || null,
    })
  })

  const usadas = new Set(its.map((x) => x.pregunta_previa).filter(Boolean))
  const sinUso = pregs.filter((p) => !usadas.has(p.id)).length
  if (sinUso) avisos.push(`${sinUso} pregunta/s previa/s no controlan ningún punto`)

  return {
    preguntas: pregs,
    items: its,
    errores,
    avisos,
    resumen: {
      preguntas: pregs.length,
      puntos: its.length,
      bloques: new Set(its.map((x) => x.bloque)).size,
      conPrevia: its.filter((x) => x.pregunta_previa).length,
    },
  }
}
