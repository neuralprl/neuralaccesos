// Lógica de centros: opciones, etiquetas y validación de la importación desde Excel.
// No usa red ni base de datos, así que se puede probar por separado.

export const OPCIONES = {
  regimen: ['ambulatorio', 'hospitalizacion', 'residencial', 'mixto'],
  horario: ['L-V', '24/7/365'],
  comedor: ['no', 'catering', 'cocina_propia'],
  vigilancia_seguridad: ['no', 'presencial', 'solo_camaras'],
  turnos: ['manana', 'tarde', 'noche', 'partido', 'rotativo'],
}

export const ETIQUETAS = {
  regimen: { ambulatorio: 'Ambulatorio', hospitalizacion: 'Hospitalización', residencial: 'Residencial', mixto: 'Mixto' },
  horario: { 'L-V': 'Lunes a viernes', '24/7/365': '24 horas, 365 días' },
  comedor: { no: 'Sin comedor', catering: 'Catering', cocina_propia: 'Cocina propia' },
  vigilancia_seguridad: { no: 'Sin vigilancia', presencial: 'Presencial', solo_camaras: 'Solo cámaras' },
  turnos: { manana: 'Mañana', tarde: 'Tarde', noche: 'Noche', partido: 'Partido', rotativo: 'Rotativo' },
}

export const CAMPOS_BOOL = [
  ['usuarios_psiquiatrico_adultos', 'Psiquiátrico (adultos)'],
  ['usuarios_infantil_juvenil', 'Infantil-juvenil'],
  ['usuarios_geriatrico', 'Geriátrico'],
  ['turnos_noche', 'Turnos de noche'],
  ['ascensor', 'Ascensor'],
  ['sala_contencion', 'Sala de contención'],
  ['jardin_exterior', 'Jardín o patio exterior'],
  ['lavanderia', 'Lavandería'],
  ['almacen_quimicos', 'Almacén de productos químicos'],
  ['plan_autoproteccion', 'Plan de autoprotección'],
  ['desfibrilador', 'Desfibrilador'],
]

export const CAMPOS_TEXTO = ['direccion', 'municipio', 'provincia', 'responsable', 'telefono', 'email', 'observaciones']
export const CAMPOS_ENTERO = ['n_trabajadores', 'n_plazas', 'n_plantas']

// ---------- utilidades ----------
export const limpiar = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()
const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
export const clave = (s) => sinAcentos(s).toLowerCase().trim().replace(/\s+/g, '_')

function parseBool(v) {
  const k = clave(v)
  if (['si', 's', 'true', '1', 'x', 'yes', 'verdadero'].includes(k)) return true
  if (['no', 'n', 'false', '0', '', 'falso'].includes(k)) return false
  return undefined
}

function parseEntero(v) {
  const t = limpiar(v)
  if (t === '') return { vacio: true }
  const n = Number(t.replace(',', '.'))
  return Number.isInteger(n) && n >= 0 ? { valor: n } : { error: true }
}

function parseFecha(v) {
  const t = limpiar(v)
  if (t === '') return { vacio: true }
  let y, m, d
  let r = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (r) [, y, m, d] = r
  else if ((r = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/))) [, d, m, y] = r
  else return { error: true }
  const dt = new Date(Date.UTC(+y, +m - 1, +d))
  if (dt.getUTCFullYear() !== +y || dt.getUTCMonth() !== +m - 1 || dt.getUTCDate() !== +d) return { error: true }
  return { valor: `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` }
}

function parseOpcion(campo, v) {
  const k = clave(v)
  if (k === '') return { vacio: true }
  if (campo === 'horario') {
    if (['l-v', 'lv', 'l_v', 'lunes_a_viernes', 'lunes-viernes'].includes(k)) return { valor: 'L-V' }
    if (k.includes('24')) return { valor: '24/7/365' }
    return { error: true }
  }
  const ok = OPCIONES[campo].find((o) => o === k)
  return ok ? { valor: ok } : { error: true }
}

// ---------- formulario ----------
export function centroVacio() {
  const c = { codigo: '', nombre: '', regimen: '', horario: '', comedor: 'no', vigilancia_seguridad: 'no',
    fecha_ultima_evaluacion: '', n_trabajadores: '', n_plazas: '', n_plantas: '1' }
  CAMPOS_TEXTO.forEach((k) => { c[k] = '' })
  CAMPOS_BOOL.forEach(([k]) => { c[k] = false })
  return c
}

// ---------- importación desde Excel ----------
// filas: objetos con las cabeceras de la plantilla (hojas "centros" y "centro_puestos").
// bd: { puestosBD: [{nombre}], codigosBD: ['CL-001', ...] }
export function prepararCentros({ centros = [], centroPuestos = [] }, { puestosBD = [], codigosBD = [] } = {}) {
  const avisos = []
  const errores = []
  const filas = []
  const codigos = new Set()
  const ignorados = new Set()
  let ejemplos = 0

  const conocidas = new Set([
    'codigo_centro', 'nombre', 'regimen', 'horario', 'comedor', 'vigilancia_seguridad', 'fecha_ultima_evaluacion',
    ...CAMPOS_TEXTO, ...CAMPOS_ENTERO, ...CAMPOS_BOOL.map((c) => c[0]),
  ])
  if (centros.length) {
    Object.keys(centros[0]).filter((h) => h && !conocidas.has(h))
      .forEach((h) => avisos.push(`La columna "${h}" de la hoja centros no se reconoce y se ignora`))
  }

  centros.forEach((r, i) => {
    const fila = i + 2
    const codigo = limpiar(r.codigo_centro)
    const nombre = limpiar(r.nombre)
    if (!codigo && !nombre) return
    if (/^ejemplo ficticio/i.test(limpiar(r.observaciones))) {
      ejemplos++
      ignorados.add(codigo)
      return
    }
    const problemas = []
    if (!codigo) problemas.push('falta codigo_centro')
    if (!nombre) problemas.push('falta el nombre')
    if (codigo && codigos.has(codigo)) problemas.push(`código repetido en el archivo (${codigo})`)

    const out = { codigo, nombre }
    CAMPOS_TEXTO.forEach((c) => { out[c] = limpiar(r[c]) || null })

    CAMPOS_BOOL.forEach(([c]) => {
      const b = parseBool(r[c])
      if (b === undefined) problemas.push(`${c}: usa SI o NO (pone "${limpiar(r[c])}")`)
      out[c] = b === true
    })

    CAMPOS_ENTERO.forEach((c) => {
      const n = parseEntero(r[c])
      if (n.error) problemas.push(`${c}: debe ser un número entero (pone "${limpiar(r[c])}")`)
      out[c] = n.vacio || n.error ? (c === 'n_plantas' ? 1 : null) : n.valor
    })

    ;['regimen', 'horario', 'comedor', 'vigilancia_seguridad'].forEach((c) => {
      const o = parseOpcion(c, r[c])
      if (o.error) problemas.push(`${c}: valor no válido ("${limpiar(r[c])}"); admite ${OPCIONES[c].join(', ')}`)
      const defecto = c === 'comedor' || c === 'vigilancia_seguridad' ? 'no' : null
      out[c] = o.vacio || o.error ? defecto : o.valor
    })

    const f = parseFecha(r.fecha_ultima_evaluacion)
    if (f.error) problemas.push(`fecha_ultima_evaluacion: usa AAAA-MM-DD o DD/MM/AAAA (pone "${limpiar(r.fecha_ultima_evaluacion)}")`)
    out.fecha_ultima_evaluacion = f.valor ?? null

    if (problemas.length) {
      errores.push({ hoja: 'centros', fila, motivo: problemas.join('; ') })
      return
    }
    codigos.add(codigo)
    filas.push(out)
  })

  // ---------- puestos de cada centro ----------
  const puestoPorClave = new Map(puestosBD.map((p) => [clave(p.nombre), p.nombre]))
  const codigosValidos = new Set([...codigos, ...codigosBD])
  const vistos = new Set()
  const cp = []
  let cpIgnoradas = 0

  centroPuestos.forEach((r, i) => {
    const fila = i + 2
    const codigo = limpiar(r.codigo_centro)
    const puesto = limpiar(r.puesto)
    if (!codigo && !puesto) return
    if (ignorados.has(codigo)) { cpIgnoradas++; return }
    const problemas = []
    if (!codigo || !codigosValidos.has(codigo)) problemas.push(`el centro "${codigo}" no existe (ni en el archivo ni en la base de datos)`)
    const nombrePuesto = puestoPorClave.get(clave(puesto))
    if (!puesto) problemas.push('falta el puesto')
    else if (clave(puesto) === 'todos') problemas.push('TODOS no es un puesto de centro')
    else if (!nombrePuesto) problemas.push(`el puesto "${puesto}" no existe en la matriz`)
    const n = parseEntero(r.n_trabajadores)
    if (n.error) problemas.push('n_trabajadores debe ser un número entero')
    const t = parseOpcion('turnos', r.turnos)
    if (t.error) problemas.push(`turnos: valor no válido ("${limpiar(r.turnos)}"); admite ${OPCIONES.turnos.join(', ')}`)
    if (problemas.length) {
      errores.push({ hoja: 'centro_puestos', fila, motivo: problemas.join('; ') })
      return
    }
    const k = `${codigo}|${nombrePuesto}`
    if (vistos.has(k)) { avisos.push(`centro_puestos, fila ${fila}: ${nombrePuesto} repetido en ${codigo}; se usa la primera fila`); return }
    vistos.add(k)
    cp.push({ codigo, puesto: nombrePuesto, n_trabajadores: n.valor ?? null, turnos: t.valor ?? 'rotativo' })
  })

  if (ejemplos > 0) {
    avisos.push(`Se ha ignorado la fila de ejemplo de la plantilla (${ejemplos})${cpIgnoradas ? ` y sus ${cpIgnoradas} puesto/s` : ''}.`)
  }

  const existentes = new Set(codigosBD)
  return {
    centros: filas,
    centroPuestos: cp,
    avisos,
    errores,
    resumen: {
      centros: filas.length,
      nuevos: filas.filter((c) => !existentes.has(c.codigo)).length,
      actualizados: filas.filter((c) => existentes.has(c.codigo)).length,
      centroPuestos: cp.length,
      ejemplosIgnorados: ejemplos,
    },
  }
}
