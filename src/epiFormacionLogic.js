// Hojas de EPI y de formación de una evaluación: se construyen con las medidas que lleva la evaluación del puesto.
// Funciones puras. No se inventa nada: solo aparece lo que está escrito en una medida.

const PROPORCIONAR = /^(proporcionar|dotar|facilitar|entregar)/i
const INFO_FORMACION = /^(informar|informaci[oó]n|formar|formaci[oó]n|impartir|dejar constancia|evitar)/i
const EPI_PALABRAS = /(guantes?|gafas|mascarilla|calzado|pantalla facial|casco|tapones|orejeras|protecci[oó]n (auditiva|ocular|respiratoria|facial)|arn[eé]s|chaleco|manguitos|botas|delantal|ropa de protecci[oó]n|protectores de brazos|buzos?|monos? desechables?|batas?|\bEPI\b)/i
const NO_EPI = /ligero, flexible/i     // recomendación de calzado ergonómico, no es un EPI

// Catálogo de EPI con su norma. El orden importa: primero lo más específico.
export const CATALOGO_EPI = [
  { id: 'calzado-soldeo', nombre: 'Calzado de protección para soldeo', norma: 'UNE-EN ISO 20349-2', re: /calzado.*soldadura|soldadura.*calzado/i },
  { id: 'ropa-soldeo', nombre: 'Ropa de protección para soldeo', norma: 'UNE-EN ISO 11611', re: /ropa de protecci[oó]n para soldeo/i },
  { id: 'manguitos', nombre: 'Manguitos para soldadura', norma: 'UNE-EN ISO 11611', re: /manguitos/i },
  { id: 'guantes-soldador', nombre: 'Guantes de protección para soldadores', norma: 'UNE-EN 12477', re: /soldadores/i },
  { id: 'pantalla-soldadura', nombre: 'Pantalla facial con filtros para soldadura', norma: 'UNE-EN ISO 16321-1/-2', re: /pantalla facial con filtros/i },
  { id: 'pantalla', nombre: 'Pantalla facial', norma: 'UNE-EN 166 / UNE-EN ISO 16321-1', re: /pantalla facial/i },
  { id: 'gafas-gotas', nombre: 'Gafas de protección ocular de montura integral para gotas de líquido', norma: 'UNE-EN ISO 16321-1', re: /gafas.*gotas/i },
  { id: 'gafas', nombre: 'Gafas de protección ocular de montura integral', norma: 'UNE-EN ISO 16321-1', re: /gafas/i },
  { id: 'mascarilla-gases', nombre: 'Mascarilla filtrante contra gases y vapores', norma: 'Según las fichas de datos de seguridad', re: /mascarilla.*gases/i },
  { id: 'mascarilla-ffp', nombre: 'Mascarilla filtrante contra partículas (FFP)', norma: 'UNE-EN 149', re: /mascarilla.*part[ií]culas|\bFFP/i },
  { id: 'guantes-malla', nombre: 'Guantes de malla metálica y protectores de brazos contra cortes de cuchillo', norma: 'UNE-EN 1082-1', re: /malla met[aá]lica/i },
  { id: 'guantes-micro', nombre: 'Guantes de protección contra microorganismos', norma: 'UNE-EN ISO 374-5', re: /guantes.*microorganismos/i },
  { id: 'guantes-quimico', nombre: 'Guantes de protección frente al riesgo químico', norma: 'UNE-EN 374-1', re: /guantes.*(riesgo qu[ií]mico|agentes qu[ií]micos)/i },
  { id: 'guantes-mecanico', nombre: 'Guantes de protección contra riesgos mecánicos', norma: 'UNE-EN 388', re: /guantes.*riesgos mec[aá]nicos/i },
  { id: 'guantes-termico', nombre: 'Guantes y manoplas de protección térmica', norma: 'UNE-EN 407', re: /guantes.*t[eé]rmic|manoplas/i },
  { id: 'calzado-antideslizante', nombre: 'Calzado de trabajo antideslizante con buena sujeción del talón', norma: 'UNE-EN ISO 20347', re: /antideslizante/i },
  { id: 'calzado-proteccion', nombre: 'Calzado de protección o de seguridad', norma: 'UNE-EN ISO 20345 / 20346', re: /calzado (de (protecci[oó]n|seguridad)|que proteja)/i },
]
const ORDEN_EPI = CATALOGO_EPI.map((e) => e.id)

const numRiesgo = (id) => parseInt(String(id).replace(/\D/g, ''), 10) || 0

// Riesgos de la evaluación con sus medidas (sin repetir).
function agrupa(filas) {
  const mapa = new Map()
  filas.forEach((f) => {
    if (!mapa.has(f.riesgo_id)) mapa.set(f.riesgo_id, { r: f.riesgo_id, riesgo: f.riesgo_nombre, medidas: [] })
    const g = mapa.get(f.riesgo_id)
    ;(f.medidas ?? []).forEach((m) => { if (m && !g.medidas.includes(m)) g.medidas.push(m) })
  })
  return [...mapa.values()].sort((a, b) => numRiesgo(a.r) - numRiesgo(b.r))
}

export const esMedidaEpi = (t) => !INFO_FORMACION.test(t.trim()) && !NO_EPI.test(t) && (EPI_PALABRAS.test(t) || (PROPORCIONAR.test(t.trim()) && /protecci[oó]n/i.test(t)))

// EPI que exige la evaluación. «otros» son medidas que hablan de un equipo de protección que no está en el catálogo: se muestran para revisarlas.
export function epiDeEvaluacion(filas) {
  const mapa = new Map()
  const otros = new Map()
  agrupa(filas).forEach((g) => g.medidas.forEach((m) => {
    const t = m.trim()
    if (!esMedidaEpi(t)) return
    const cat = CATALOGO_EPI.find((e) => e.re.test(t))
    if (!cat) {
      if (!otros.has(t)) otros.set(t, { texto: t, riesgos: [] })
      otros.get(t).riesgos.push({ r: g.r, nombre: g.riesgo })
      return
    }
    if (!mapa.has(cat.id)) mapa.set(cat.id, { id: cat.id, nombre: cat.nombre, norma: cat.norma, proporcionar: false, riesgos: [] })
    const e = mapa.get(cat.id)
    e.proporcionar = e.proporcionar || PROPORCIONAR.test(t)
    if (!e.riesgos.some((x) => x.r === g.r)) e.riesgos.push({ r: g.r, nombre: g.riesgo })
  }))
  return {
    epis: [...mapa.values()].sort((a, b) => ORDEN_EPI.indexOf(a.id) - ORDEN_EPI.indexOf(b.id)),
    otros: [...otros.values()],
  }
}

// ---------- formación ----------
const FORMACION = /^(formaci[oó]n|formar|impartir formaci)/i
const VACIAS = new Set('formar formacion sobre riesgos riesgo medidas preventivas personas trabajadoras trabajadores personal derivados derivadas frente tareas correcto uso para que las los del con por una como entre'.split(' '))
const fichas = (s) => new Set(s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !VACIAS.has(w)))
const jaccard = (a, b) => { const i = [...a].filter((x) => b.has(x)).length; const u = new Set([...a, ...b]).size; return u ? i / u : 0 }

// Temas formativos de la evaluación, por riesgo; los que dicen lo mismo se reúnen en uno.
export function formacionDeEvaluacion(filas) {
  return agrupa(filas).map((g) => {
    const temas = []
    g.medidas.filter((m) => FORMACION.test(m.trim())).forEach((m) => {
      const f = fichas(m)
      if (!temas.some((t) => jaccard(t.fichas, f) >= 0.6)) temas.push({ texto: m.trim().replace(/\.$/, ''), fichas: f })
    })
    return { r: g.r, riesgo: g.riesgo, temas: temas.map((t) => t.texto) }
  }).filter((g) => g.temas.length > 0)
}
