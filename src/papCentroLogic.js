// PAP del centro: une las medidas repetidas de todos los puestos en una sola acción.
// Cada acción toma la prioridad más restrictiva (del lado de la seguridad) y guarda en qué puestos
// aparece y con qué prioridad, para indicar dónde podría ser más baja.
// Funciones puras, sin red ni base de datos.
import { ORDEN_VR, vrDe } from './evalLogic.js'
import { limpiar } from './importLogic.js'
import { COSTE_POR_DEFECTO, RESPONSABLE_DEFECTO, plazoPorDefecto } from './planLogic.js'
import { agruparMedidas } from './medidasSimilares.js'

const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Dos medidas son la misma si coinciden al quitar mayúsculas, acentos, signos y la coletilla
// «Dejar constancia documental de su entrega» (que no cambia la medida).
export function claveMedida(texto) {
  return sinAcentos(texto).toLowerCase()
    .replace(/dejar constancia documental de (su|la) entrega/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export const masGrave = (a, b) => (!a ? b : !b ? a : ORDEN_VR[a] <= ORDEN_VR[b] ? a : b)

// filas: filas de evaluacion_riesgos de los puestos del centro.
// puestoDe: Map evaluacion_id -> { puesto_id, nombre }.
// Las medidas iguales o parecidas (medidasSimilares.js) se unen en una sola acción con la redacción más completa.
export function consolidarPAP(filas, puestoDe) {
  const m = new Map()
  const { grupos, deTexto } = agruparMedidas(filas.flatMap((f) => f.medidas ?? []))
  for (const f of filas) {
    const vr = vrDe(f.p, f.c)
    const pu = puestoDe.get(f.evaluacion_id)
    if (!vr || !pu) continue
    const medidas = (f.medidas ?? []).map((t) => String(t ?? '').trim()).filter(Boolean)
    const items = medidas.length
      ? medidas.map((t) => { const g = grupos[deTexto.get(t)]; return { clave: `m:${claveMedida(g.texto)}`, texto: g.texto, variantes: g.variantes, sin: false } })
      : [{ clave: `r:${f.riesgo_id}|${claveMedida(f.condicion)}`, texto: `Definir medidas preventivas para ${f.riesgo_id} · ${f.riesgo_nombre}: ${limpiar(f.condicion ?? '')}`, sin: true }]
    const vistas = new Set()
    for (const it of items) {
      if (vistas.has(it.clave)) continue
      vistas.add(it.clave)
      let a = m.get(it.clave)
      if (!a) {
        a = { clave: it.clave, medida: it.texto, variantes: it.variantes ?? [], sin_medida: it.sin, vr, riesgos: new Map(), puestos: new Map(), origen: [] }
        m.set(it.clave, a)
      }
      if (it.texto.length > a.medida.length) a.medida = it.texto       // la redacción más completa
      a.vr = masGrave(a.vr, vr)
      a.riesgos.set(f.riesgo_id, f.riesgo_nombre)
      const p = a.puestos.get(pu.puesto_id)
      a.puestos.set(pu.puesto_id, { puesto_id: pu.puesto_id, nombre: pu.nombre, vr: masGrave(p?.vr, vr) })
      a.origen.push(f)
    }
  }
  const num = (id) => parseInt(String(id).replace(/\D/g, ''), 10) || 0
  return [...m.values()].map((a) => ({
    clave: a.clave,
    medida: a.medida,
    variantes: [...a.variantes].sort((x, y) => x.localeCompare(y, 'es')),
    sin_medida: a.sin_medida,
    vr: a.vr,
    riesgos: [...a.riesgos].map(([id, nombre]) => ({ id, nombre })).sort((x, y) => num(x.id) - num(y.id)),
    puestos: [...a.puestos.values()].sort((x, y) => x.nombre.localeCompare(y.nombre, 'es')),
    origen: a.origen,
  })).sort((x, y) => ORDEN_VR[x.vr] - ORDEN_VR[y.vr] || x.medida.localeCompare(y.medida, 'es'))
}

// Puestos en los que esa medida tiene una prioridad más baja que la aplicada.
export const puestosConMenorPrioridad = (a) => (a.puestos ?? []).filter((p) => p.vr && p.vr !== a.vr)

// Primera vez que se crea la acción: hereda lo que ya se hubiera anotado en el PAP por puesto.
// Solo se da por realizada si estaba realizada en todos los puestos.
export function heredarGestion(origen, vr, fechaEval) {
  const valor = (campo, defecto) => origen.map((o) => (o[campo] ?? '').trim()).find((v) => v && v !== defecto) ?? defecto
  const plazos = origen.map((o) => o.plazo).filter(Boolean).sort()
  const todas = origen.length > 0 && origen.every((o) => o.estado_accion === 'realizada')
  const eficaz = todas && origen.every((o) => o.eficacia_estado === 'realizada')
  const max = (campo) => origen.map((o) => o[campo]).filter(Boolean).sort().pop() ?? null
  return {
    responsable: valor('responsable', RESPONSABLE_DEFECTO),
    coste: valor('coste', COSTE_POR_DEFECTO),
    plazo: plazos[0] ?? plazoPorDefecto(vr, fechaEval),
    estado_accion: todas ? 'realizada' : 'pendiente',
    fecha_realizacion: todas ? max('fecha_realizacion') : null,
    eficacia_estado: eficaz ? 'realizada' : 'pendiente',
    fecha_eficacia: eficaz ? max('fecha_eficacia') : null,
  }
}

// Claves con las que se reconoce una acción: la suya y la de cada redacción que une.
const clavesDe = (x) => new Set([x.clave, ...(x.variantes ?? []).map((t) => `m:${claveMedida(t)}`)])

// Qué hay que cambiar en pap_acciones para que refleje la evaluación actual.
// Se conservan responsable, coste, plazo y estados de las acciones que ya existían. Una acción guardada se
// reconoce aunque ahora una más redacciones; si se unen varias guardadas, se queda la pendiente (o la primera)
// y las demás se borran si estaban pendientes o quedan como histórico si estaban realizadas.
export function planSincronizacion(calculadas, guardadas, evcId, fechaEval) {
  const porClave = new Map()
  guardadas.forEach((g) => clavesDe(g).forEach((k) => { if (!porClave.has(k)) porClave.set(k, []); porClave.get(k).push(g) }))
  const usadas = new Set()
  const insertar = []
  const actualizar = []
  const retirar = []
  const historico = (old) => (old.estado_accion === 'realizada'
    ? (old.vigente !== false && actualizar.push({ id: old.id, evaluacion_centro_id: evcId, clave: old.clave, vigente: false }))
    : retirar.push(old.id))

  for (const a of calculadas) {
    const base = { medida: a.medida, variantes: a.variantes ?? [], sin_medida: a.sin_medida, vr: a.vr, riesgos: a.riesgos, puestos: a.puestos, vigente: true }
    const candidatas = [...new Set([...clavesDe(a)].flatMap((k) => porClave.get(k) ?? []))].filter((g) => !usadas.has(g.id))
    if (!candidatas.length) { insertar.push({ evaluacion_centro_id: evcId, clave: a.clave, ...base, ...heredarGestion(a.origen, a.vr, fechaEval) }); continue }
    const old = candidatas.find((g) => g.estado_accion !== 'realizada' && g.vigente !== false) ?? candidatas.find((g) => g.vigente !== false) ?? candidatas[0]
    candidatas.forEach((g) => usadas.add(g.id))
    candidatas.filter((g) => g !== old).forEach(historico)
    const cambios = {}
    for (const k of Object.keys(base)) {
      if (JSON.stringify(old[k] ?? null) !== JSON.stringify(base[k])) cambios[k] = base[k]
    }
    // Si cambia la prioridad y el plazo era el de la prioridad anterior, se recalcula.
    if (cambios.vr && old.estado_accion !== 'realizada' && (!old.plazo || old.plazo === plazoPorDefecto(old.vr, fechaEval))) {
      cambios.plazo = plazoPorDefecto(a.vr, fechaEval)
    }
    if (Object.keys(cambios).length) actualizar.push({ id: old.id, evaluacion_centro_id: evcId, clave: old.clave, ...cambios })
  }
  guardadas.filter((g) => !usadas.has(g.id)).forEach(historico)
  return { insertar, actualizar, retirar }
}

// Resumen para la cabecera del PAP.
export function resumenPAPCentro(acciones) {
  const vig = acciones.filter((a) => a.vigente !== false)
  const unidas = vig.filter((a) => (a.puestos ?? []).length > 1).length
  return {
    total: vig.length,
    pendientes: vig.filter((a) => a.estado_accion !== 'realizada').length,
    unidas,
    redacciones: vig.filter((a) => (a.variantes ?? []).length > 1).length,
    conMenor: vig.filter((a) => puestosConMenorPrioridad(a).length > 0).length,
    sinMedida: vig.filter((a) => a.sin_medida).length,
  }
}
