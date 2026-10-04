// Lógica pura de importación: recibe las filas de las hojas "medidas" y "matriz"
// (como objetos con las cabeceras de la plantilla) y devuelve el plan a cargar.
// No toca la red ni la base de datos, así que se puede probar por separado.

const RANK_P = { B: 1, M: 2, A: 3 }
const RANK_C = { LD: 1, D: 2, ED: 3 }

const VR_TABLA = {
  'B-LD': 'T', 'B-D': 'TO', 'M-LD': 'TO',
  'B-ED': 'MO', 'M-D': 'MO', 'A-LD': 'MO',
  'M-ED': 'IM', 'A-D': 'IM', 'A-ED': 'IN',
}

export const calcVR = (p, c) => VR_TABLA[`${p}-${c}`] ?? null

export const limpiar = (v) => String(v ?? '').replace(/\s+/g, ' ').trim()

// "R01 – Caídas..." -> "R01"
export function codigoRiesgo(txt) {
  const m = limpiar(txt).match(/^R\s*0*(\d+)/i)
  return m ? 'R' + String(parseInt(m[1], 10)).padStart(2, '0') : null
}

// "R01 – Caídas..." -> "Caídas..."
export const nombreRiesgo = (txt) =>
  limpiar(txt).replace(/^R\s*\d+\s*[–—-]\s*/i, '')

export function prepararImportacion({ medidas = [], matriz = [], check = [] }) {
  const avisos = []
  const errores = []

  // ---------- 1. Catálogo de riesgos y medidas ----------
  const riesgos = new Map()        // 'R01' -> nombre oficial (el del catálogo)
  const medidasMap = new Map()     // 'R01-M01' -> { id, riesgo_id, texto }
  const idPorTexto = new Map()     // 'R01|texto' -> 'R01-M01'
  const maxNum = new Map()         // 'R01' -> mayor número de medida usado

  medidas.forEach((r, i) => {
    const fila = i + 2
    const id = limpiar(r['ID Medida'])
    const texto = limpiar(r['Medida preventiva/correctiva'])
    let cod = codigoRiesgo(r['Riesgo'])
    if (!cod && r['Nº Riesgo'] != null && limpiar(r['Nº Riesgo']) !== '') {
      cod = 'R' + String(parseInt(r['Nº Riesgo'], 10)).padStart(2, '0')
    }
    if (!id && !texto) return
    if (!id || !texto || !cod) {
      errores.push({ hoja: 'medidas', fila, motivo: 'Falta ID, riesgo o texto de la medida' })
      return
    }
    if (medidasMap.has(id)) {
      errores.push({ hoja: 'medidas', fila, motivo: `ID repetido: ${id}` })
      return
    }
    if (!id.startsWith(cod + '-')) {
      avisos.push(`medidas, fila ${fila}: el ID ${id} no empieza por el código del riesgo ${cod}`)
    }
    if (!riesgos.has(cod)) riesgos.set(cod, nombreRiesgo(r['Riesgo']))
    medidasMap.set(id, { id, riesgo_id: cod, texto })
    const clave = `${cod}|${texto}`
    if (!idPorTexto.has(clave)) idPorTexto.set(clave, id)
    const n = parseInt((id.match(/-M(\d+)$/) || [])[1], 10)
    if (!Number.isNaN(n)) maxNum.set(cod, Math.max(maxNum.get(cod) ?? 0, n))
  })

  const medidasNuevas = []
  const nuevaMedida = (cod, texto) => {
    const n = (maxNum.get(cod) ?? 0) + 1
    maxNum.set(cod, n)
    const id = `${cod}-M${String(n).padStart(2, '0')}`
    const m = { id, riesgo_id: cod, texto }
    medidasMap.set(id, m)
    idPorTexto.set(`${cod}|${texto}`, id)
    medidasNuevas.push(m)
    return id
  }

  // ---------- 2. Matriz: validar, unificar y fusionar ----------
  const grupos = new Map()
  const nombresPorCodigo = new Map()
  const puestos = new Set()
  let filasLeidas = 0
  let filasSinMedida = 0
  let repetidasExactas = 0
  let conflictosPC = 0

  matriz.forEach((r, i) => {
    const fila = i + 2
    const puesto = limpiar(r['Puesto'])
    const riesgoTxt = limpiar(r['Riesgo'])
    const condicion = limpiar(r['Condición / situación de exposición'])
    const p = limpiar(r['P']).toUpperCase()
    const c = limpiar(r['C']).toUpperCase()
    const medidaTxt = limpiar(r['Medida preventiva/correctiva'])

    if (!puesto && !riesgoTxt && !condicion && !p && !c && !medidaTxt) return
    filasLeidas++

    const cod = codigoRiesgo(riesgoTxt)
    const problemas = []
    if (!puesto) problemas.push('falta el puesto')
    if (!cod) problemas.push('riesgo sin código (R01, R02...)')
    if (!condicion) problemas.push('falta la condición de exposición')
    if (!RANK_P[p]) problemas.push(`P no válida (${p || 'vacía'}); debe ser B, M o A`)
    if (!RANK_C[c]) problemas.push(`C no válida (${c || 'vacía'}); debe ser LD, D o ED`)
    if (problemas.length) {
      errores.push({ hoja: 'matriz', fila, motivo: problemas.join('; ') })
      return
    }

    if (!riesgos.has(cod)) {
      riesgos.set(cod, nombreRiesgo(riesgoTxt))
      avisos.push(`El riesgo ${cod} está en la matriz pero no en el catálogo de medidas; se crea con el nombre de la matriz`)
    }
    if (!nombresPorCodigo.has(cod)) nombresPorCodigo.set(cod, new Set())
    nombresPorCodigo.get(cod).add(nombreRiesgo(riesgoTxt))

    puestos.add(puesto)
    const clave = `${puesto}|${cod}|${condicion}`
    let g = grupos.get(clave)
    if (!g) {
      g = { puesto, riesgo_id: cod, condicion, p, c, medidas: new Set(), filas: 0 }
      grupos.set(clave, g)
    }
    g.filas++
    if (g.filas > 1 && (g.p !== p || g.c !== c)) {
      conflictosPC++
      if (RANK_P[p] > RANK_P[g.p]) g.p = p
      if (RANK_C[c] > RANK_C[g.c]) g.c = c
    }

    if (!medidaTxt) { filasSinMedida++; return }
    let mid = idPorTexto.get(`${cod}|${medidaTxt}`)
    if (!mid) mid = nuevaMedida(cod, medidaTxt)
    if (g.medidas.has(mid)) repetidasExactas++
    else g.medidas.add(mid)
  })

  // ---------- 2b. Hoja check: preguntas de comprobación por riesgo ----------
  // "R30 - Carga física – Posturas forzadas" -> riesgo R30, subtipo "Posturas forzadas"
  const checkFinal = []
  const vistas = new Set()
  let checkRepetidas = 0
  check.forEach((r, i) => {
    const fila = i + 2
    const riesgoTxt = limpiar(r['Riesgo'])
    const pregunta = limpiar(r['Pregunta de comprobación'])
    if (!riesgoTxt && !pregunta) return
    const cod = codigoRiesgo(riesgoTxt)
    if (!cod || !pregunta) {
      errores.push({ hoja: 'check', fila, motivo: 'Falta el riesgo (con su código) o la pregunta' })
      return
    }
    if (!riesgos.has(cod)) {
      errores.push({ hoja: 'check', fila, motivo: `El riesgo ${cod} no está en el catálogo de medidas` })
      return
    }
    const clave = `${cod}|${pregunta}`
    if (vistas.has(clave)) { checkRepetidas++; return }
    vistas.add(clave)
    const partes = nombreRiesgo(riesgoTxt).split(/\s+[–—]\s+/)
    const subtipo = partes.slice(1).join(' – ') || null
    checkFinal.push({ riesgo_id: cod, subtipo, pregunta, orden: checkFinal.length + 1 })
  })

  // ---------- 3. Resumen ----------
  const matrizFinal = [...grupos.values()].map((g) => ({
    puesto: g.puesto, riesgo_id: g.riesgo_id, condicion: g.condicion,
    p: g.p, c: g.c, medidas: [...g.medidas],
  }))

  const porVR = {}
  matrizFinal.forEach((m) => {
    const vr = calcVR(m.p, m.c)
    porVR[vr] = (porVR[vr] || 0) + 1
  })

  let codigosConNombreDistinto = 0
  nombresPorCodigo.forEach((nombres, cod) => {
    const oficial = riesgos.get(cod)
    if ([...nombres].some((n) => n !== oficial)) codigosConNombreDistinto++
  })

  const gruposFusionados = [...grupos.values()].filter((g) => g.filas > 1).length

  return {
    riesgos: [...riesgos].map(([id, nombre]) => ({ id, nombre })),
    medidas: [...medidasMap.values()],
    puestos: [...puestos].sort((a, b) => a.localeCompare(b, 'es')),
    matriz: matrizFinal,
    check: checkFinal,
    avisos,
    errores,
    resumen: {
      riesgos: riesgos.size,
      medidas: medidasMap.size,
      medidasNuevas,
      puestos: puestos.size,
      filasLeidas,
      filasMatriz: matrizFinal.length,
      gruposFusionados,
      vinculos: matrizFinal.reduce((s, m) => s + m.medidas.length, 0),
      repetidasExactas,
      conflictosPC,
      filasSinMedida,
      codigosConNombreDistinto,
      porVR,
      check: {
        preguntas: checkFinal.length,
        riesgos: new Set(checkFinal.map((c) => c.riesgo_id)).size,
        conSubtipo: checkFinal.filter((c) => c.subtipo).length,
        repetidas: checkRepetidas,
      },
    },
  }
}
