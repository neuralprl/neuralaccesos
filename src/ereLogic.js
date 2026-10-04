// Genera la evaluación de riesgos para embarazo, parto reciente y lactancia (ERE) de un puesto
// a partir de los riesgos de su evaluación. Funciones puras, sin red ni base de datos.
import { ACCIONES, CONDICIONES_ERE, EXPOSICION, SEGO } from './ereContenido.js'

// Nivel de riesgo de agresión para la embarazada.
// Nivel I si la contención forma parte de la actividad (sala de contención, psiquiatría de adultos con
// hospitalización, menores con régimen residencial u hospitalario) o si el registro de agresiones muestra
// 3 o más agresiones físicas a ese puesto en 12 meses. Si no, nivel II.
export function nivelAgresiones(centro = {}, agresionesFisicas12m = 0) {
  const motivos = []
  const reg = centro.regimen
  if (centro.sala_contencion) motivos.push('el centro dispone de sala de contención')
  if (centro.usuarios_psiquiatrico_adultos && ['hospitalizacion', 'mixto'].includes(reg)) motivos.push('atiende a adultos con patología psiquiátrica en hospitalización')
  if (centro.usuarios_infantil_juvenil && ['residencial', 'hospitalizacion', 'mixto'].includes(reg)) motivos.push('atiende a menores en régimen residencial u hospitalario')
  if (agresionesFisicas12m >= 3) motivos.push(`el registro recoge ${agresionesFisicas12m} agresiones físicas a este puesto en los últimos 12 meses`)
  return { nivel: motivos.length ? 'I' : 'II', motivos }
}

// ---------- Datos de exposición ----------
const condDe = (id) => CONDICIONES_ERE.find((c) => c.id === id)
const aplica = (c, f) => { try { return c.si(f) } catch { return false } }

// Datos de exposición que necesita el puesto según sus riesgos.
export function clavesExposicion(filas) {
  return Object.entries(EXPOSICION).filter(([, d]) => filas.some((f) => aplica(condDe(d.condicion), f))).map(([k]) => k)
}
export function faltanExposicion(filas, exp = {}) {
  return clavesExposicion(filas).filter((k) => EXPOSICION[k].campos.some((c) => !exp?.[k]?.[c.k])).map((k) => EXPOSICION[k].titulo)
}

const T = 'tolerable'
const COL_H = { mas5: 0, '3a5': 1, '2a3': 2 }
// Semana de inicio del riesgo { unico, multiple } o 'tolerable', según los datos del puesto.
export function semanaDe(clave, d = {}) {
  const h = COL_H[d.horas]
  const par = (tabla, fila) => (fila === T || h == null ? T : { unico: tabla[fila][h], multiple: tabla[fila][h + 3] })
  if (clave === 'cargas') {
    if (d.peso === 'menos4' || d.horas === 'menos2') return T
    const t = { 'mas10|4omas': [20, 22, 24, 18, 20, 22], 'mas10|menos4': [24, 26, 28, 22, 24, 26], '4a10|4omas': [24, 28, 30, 22, 26, 28], '4a10|menos4': [28, 34, 36, 26, 32, 34] }
    return par(t, `${d.peso}|${d.frecuencia}`)
  }
  if (clave === 'flexion') {
    if (d.frecuencia === 'menos2' || d.horas === 'menos2') return T
    return par({ mas10: [20, 22, 24, 18, 20, 22], '2a10': [28, 34, 36, 26, 32, 34] }, d.frecuencia)
  }
  if (clave === 'bipedestacion') {
    if (d.tipo === 'ninguna' || d.horas === 'menos2') return T
    const t = { estatica: [22, 26, 30, 20, 24, 26], dinamica: [30, 34, T, 28, 32, T] }
    const r = par(t, d.tipo)
    return r === T || r.unico === T ? T : r
  }
  if (clave === 'sedestacion') {
    if (d.cambios === 'con' || d.horas === 'menos2') return T
    const r = par({ sin: [33, 37, T, 31, 34, T] }, 'sin')
    return r === T || r.unico === T ? T : r
  }
  if (clave === 'escaleras') {
    const t = {
      mano: { 'menos4|mas1': [37, 32], 'menos4|menos1': T, '4a8|mas1': [30, 28], '4a8|menos1': [34, 32], 'mas8|mas1': [26, 24], 'mas8|menos1': [30, 28] },
      escala: { 'menos4|mas1': [26, 24], 'menos4|menos1': [34, 32], '4a8|mas1': [20, 18], '4a8|menos1': [26, 24], 'mas8|mas1': [18, 16], 'mas8|menos1': [20, 18] },
    }
    const v = t[d.tipo]?.[`${d.frecuencia}|${d.altura}`]
    return !v || v === T ? T : { unico: v[0], multiple: v[1] }
  }
  return null
}

// Valoración que imponen los datos: más kilos suben C; más frecuencia sube P.
export function valoracionExposicion(clave, d = {}) {
  if (clave === 'cargas' && d.peso && d.frecuencia) {
    const c = { menos4: 'LD', '4a10': 'D', mas10: 'ED' }[d.peso]
    const p = d.frecuencia === 'menos4' ? 'B' : d.horas === 'mas5' ? 'A' : 'M'
    return { p, c }
  }
  if (clave === 'flexion' && d.frecuencia) return { p: { menos2: 'B', '2a10': 'M', mas10: 'A' }[d.frecuencia] }
  if (clave === 'escaleras' && d.frecuencia) return { p: { menos4: 'B', '4a8': 'M', mas8: 'A' }[d.frecuencia] }
  return null
}

// Aplica la valoración de los datos a las filas afectadas. Devuelve { filas, cambiadas: [ids] }.
export function aplicarExposicion(filas, exp = {}) {
  const cambiadas = []
  let nuevas = filas
  Object.entries(EXPOSICION).forEach(([k, def]) => {
    const v = valoracionExposicion(k, exp?.[k])
    if (!v) return
    const c = condDe(def.condicion)
    nuevas = nuevas.map((f) => {
      if (!aplica(c, f)) return f
      const parche = {}
      if (v.p && f.p !== v.p) parche.p = v.p
      if (v.c && f.c !== v.c) parche.c = v.c
      if (!Object.keys(parche).length) return f
      cambiadas.push(f.id)
      return { ...f, ...parche }
    })
  })
  return { filas: nuevas, cambiadas }
}

const textoSemana = (s) => `a partir de la semana ${s.unico} de gestación (${s.multiple} en embarazo múltiple), según la guía de la SEGO, el INSS y la AMAT; la entidad colaboradora o el criterio médico pueden ajustarla`

// filas: [{ riesgo_id, riesgo_nombre, condicion, p, c }] de la evaluación del puesto.
// ctx: { centro, agresionesFisicas12m, agresiones12m, exposicion }
export function generarERE(filas, ctx = {}) {
  const exp = ctx.exposicion ?? {}
  const claveDe = Object.fromEntries(Object.entries(EXPOSICION).map(([k, d]) => [d.condicion, k]))
  const entradas = []
  for (const c of CONDICIONES_ERE) {
    const origen = filas.filter((f) => { try { return c.si(f) } catch { return false } })
    if (!origen.length) continue
    const e = { ...c, origen: origen.map((f) => ({ riesgo_id: f.riesgo_id, riesgo_nombre: f.riesgo_nombre, condicion: f.condicion })) }
    delete e.si
    const clave = claveDe[c.id]
    if (clave && clave !== 'agresiones') {
      const d = exp[clave]
      e.exposicion = d && EXPOSICION[clave].campos.every((x) => d[x.k])
        ? EXPOSICION[clave].campos.map((x) => x.opciones.find((o) => o[0] === d[x.k])?.[1]).join(' · ') : null
      if (!e.exposicion) e.falta = EXPOSICION[clave].titulo
      else {
        const sem = semanaDe(clave, d)
        if (sem === 'tolerable') { e.accion = 'sin_exclusion'; e.tolerable = true; e.tabla = null; e.medidas = [`Con la exposición del puesto (${e.exposicion}) el riesgo es tolerable durante el embarazo: no hay que limitar la tarea. Se mantienen las medidas preventivas generales.`] }
        else if (sem) { e.semanas = sem; e.tabla = null; e.medidas = e.medidas.map((m) => m.replace(SEGO, textoSemana(sem))) }
      }
    }
    if (c.id === 'R38-agresiones') {
      const n = nivelAgresiones(ctx.centro, ctx.agresionesFisicas12m ?? 0)
      e.nivelPropuesto = n.nivel
      e.nivel = exp.agresiones?.nivel ?? null
      if (!e.nivel) { e.falta = EXPOSICION.agresiones.titulo; e.nivel = n.nivel }
      e.motivosNivel = n.motivos
      e.confirmado = !!exp.agresiones?.nivel
      if (e.confirmado) e.medidas = [e.medidas[e.nivel === 'I' ? 0 : 1]]
      e.agresiones12m = ctx.agresiones12m ?? 0
      e.accion = e.nivel === 'I' ? 'retirada' : 'adaptar'
      e.semana = e.nivel === 'I' ? 12 : null
    }
    entradas.push(e)
  }
  const num = (r) => parseInt(String(r).replace(/\D/g, ''), 10) || 0
  entradas.sort((a, b) => num(a.r) - num(b.r))
  const porAccion = Object.fromEntries(Object.keys(ACCIONES).map((k) => [k, entradas.filter((e) => e.accion === k).length]))
  const relevantes = entradas.filter((e) => e.accion !== 'sin_exclusion')
  const peor = relevantes.reduce((m, e) => (m == null || ACCIONES[e.accion].orden < ACCIONES[m].orden ? e.accion : m), null)
  const faltan = [...new Set(entradas.filter((e) => e.falta).map((e) => e.falta))]
  return {
    completa: faltan.length === 0,
    faltan,
    entradas,
    porAccion,
    exento: relevantes.length === 0,
    conclusion: conclusionERE(peor, relevantes.length),
    tareas: [...new Set(relevantes.map((e) => e.grupo))],
    afecta: { EM: entradas.some((e) => e.EM), PR: entradas.some((e) => e.PR), LA: entradas.some((e) => e.LA) },
  }
}

export function conclusionERE(peor, n) {
  if (!n) return 'Puesto exento de riesgo específico para el embarazo, el parto reciente y la lactancia natural con las condiciones evaluadas. Se mantienen las medidas preventivas generales del puesto.'
  if (peor === 'retirada') return 'El puesto incluye tareas no compatibles con el embarazo o la lactancia. Hay que adaptar el puesto retirando esas tareas; si no es posible, cambiar a un puesto exento de riesgo y, en último término, tramitar la suspensión del contrato por riesgo durante el embarazo o la lactancia (art. 26 de la Ley 31/1995).'
  if (peor === 'limitar') return 'El puesto es compatible con el embarazo adaptando las condiciones de trabajo y limitando las tareas indicadas a partir de la semana de gestación que corresponda. Si la adaptación no es posible, se estudia el cambio de puesto (art. 26 de la Ley 31/1995).'
  if (peor === 'adaptar') return 'El puesto es compatible con el embarazo y la lactancia con las adaptaciones indicadas.'
  return 'El puesto es compatible con el embarazo y la lactancia, pendiente de la valoración individual indicada (serología, mediciones o fichas de datos de seguridad).'
}

// Texto de a quién aplica una condición: «Embarazo, parto reciente».
export const aQuien = (e) => [e.EM && 'Embarazo', e.PR && 'Parto reciente', e.LA && 'Lactancia'].filter(Boolean).join(', ')
