// Medidas parecidas: agrupa redacciones distintas de la misma medida preventiva.
// Funciones puras. Criterio prudente: mejor dejar dos medidas separadas que unir dos distintas.
//  - Solo se comparan medidas del mismo tipo: información, formación, información y formación, EPI u otra.
//  - Se quitan las palabras que aparecen en casi todas las medidas («informar sobre los riesgos y medidas
//    preventivas...», «dejar constancia documental...») y se comparan las que quedan, que son las que dicen
//    de qué trata la medida (cargas, extintores, agentes químicos...).

const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const VACIAS = new Set((
  'a al ante bajo con contra de del desde durante e el ella en entre es esa ese esta este esto la las le les lo los ' +
  'mas mediante muy ni o para por que se segun ser si sin sobre su sus tal tambien u un una uno unos unas y ya ' +
  'cada cual cuando como donde todo toda todos todas dicho dicha otro otra otros otras mismo misma asi siempre ' +
  // términos que aparecen en casi todas las medidas
  'trabajador trabajadora persona personal riesgo medida preventiva prevencion proteccion protector ' +
  'adoptar aplicable correcta correcto correctamente adecuada adecuado necesario necesaria posible caso ' +
  'dejar constancia documental entrega observacion realizar realizacion tarea trabajo lugar uso utilizacion utilizar ' +
  'derivado derivada asociado asociada relacionado relacionada frente exposicion agente manipulacion manejo ' +
  'informar informacion formar formacion reciclar instruir velar proporcionar dotar facilitar disponer garantizar ' +
  'establecer implantar mantener comprobar verificar revisar periodicamente periodico deber debera ' +
  'empresa centro especifico especifica general'
).split(' '))

// Singular sencillo: «cargas» -> «carga», «manuales» -> «manual».
function raiz(t) {
  if (t.length > 5 && /[lrnd]es$/.test(t)) return t.slice(0, -2)
  if (t.length > 3 && t.endsWith('s')) return t.slice(0, -1)
  return t
}

export function palabras(texto) {
  return sinAcentos(texto).toLowerCase()
    .replace(/dejar constancia documental de (su|la) entrega/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)
}

export function nucleo(texto) {
  // Los números de norma (374, 20345, 16321...) se conservan: distinguen un EPI de otro.
  return new Set(palabras(texto).map(raiz).filter((t) => t.length > 1 && !VACIAS.has(t) && (!/^\d+$/.test(t) || t.length >= 3)))
}

const EPI = /\b(guante|gafa|mascarilla|calzado|pantalla facial|ropa de proteccion|ropa para|rodillera|manguito|bota|epi|casco|protector auditivo|delantal|mandil)/
export function tipoMedida(texto) {
  const t = sinAcentos(texto).toLowerCase()
  const info = /\b(informar|informacion|informa|informado)\b/.test(t)
  const form = /\b(formar|formacion|formado|reciclar)\b/.test(t)
  if (info && form) return 'informacion y formacion'
  if (info) return 'informacion'
  if (form) return 'formacion'
  if (EPI.test(t)) return 'epi'
  return 'otra'
}

export function parecidas(a, b) {
  const inter = [...a].filter((x) => b.has(x)).length
  const union = new Set([...a, ...b]).size
  if (union === 0) return true                                    // las dos son genéricas del mismo tipo
  const j = inter / union
  const menor = Math.min(a.size, b.size)
  return j >= 0.8 || (menor >= 3 && inter === menor && j >= 0.6)
}

// textos: lista de redacciones (puede haber repetidas). Devuelve grupos:
// [{ texto: redacción elegida (la más completa), variantes: [textos distintos] }]
// y un Map texto -> índice de grupo.
export function agruparMedidas(textos) {
  const distintos = [...new Set(textos.map((t) => String(t ?? '').trim()).filter(Boolean))]
    .sort((x, y) => y.length - x.length || x.localeCompare(y, 'es'))
  const grupos = []
  const deTexto = new Map()
  for (const t of distintos) {
    const tipo = tipoMedida(t)
    const n = nucleo(t)
    let k = grupos.findIndex((g) => g.tipo === tipo && parecidas(g.nucleo, n))
    if (k < 0) { grupos.push({ tipo, nucleo: n, texto: t, variantes: [] }); k = grupos.length - 1 }
    grupos[k].variantes.push(t)
    deTexto.set(t, k)
  }
  return { grupos: grupos.map(({ texto, variantes, tipo }) => ({ texto, variantes, tipo })), deTexto }
}
