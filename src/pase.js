// Dibuja el pase de acceso como imagen (PNG) para guardarla en el móvil y mostrarla en la entrada.
const AZUL = '#1f3864'
const VERDE = '#1b7a43'
const GRIS = '#5b6770'
const TINTA = '#16202a'
const FUENTE = '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

export const fechaLarga = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
export const fechaCorta = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('es-ES')

function lineas(ctx, texto, ancho) {
  const palabras = String(texto).split(/\s+/)
  const res = []
  let actual = ''
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p
    if (ctx.measureText(prueba).width > ancho && actual) { res.push(actual); actual = p } else actual = prueba
  }
  if (actual) res.push(actual)
  return res.slice(0, 2)
}

function escudo(ctx, x, y, t) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(t / 100, t / 100)
  ctx.beginPath()
  ctx.moveTo(50, 0); ctx.lineTo(95, 16); ctx.lineTo(95, 50)
  ctx.bezierCurveTo(95, 78, 74, 95, 50, 104)
  ctx.bezierCurveTo(26, 95, 5, 78, 5, 50)
  ctx.lineTo(5, 16); ctx.closePath()
  ctx.fillStyle = VERDE; ctx.fill()
  ctx.beginPath(); ctx.moveTo(28, 52); ctx.lineTo(44, 68); ctx.lineTo(74, 36)
  ctx.lineWidth = 11; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
  ctx.restore()
}

export function dibujarPase(p) {
  const W = 1080
  const H = 1560
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')
  const M = 72

  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H)

  // Cabecera
  ctx.fillStyle = AZUL; ctx.fillRect(0, 0, W, 250)
  escudo(ctx, M, 62, 120)
  ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic'
  ctx.font = `800 58px ${FUENTE}`; ctx.fillText('GRUPO NEURAL', M + 150, 125)
  ctx.font = `400 34px ${FUENTE}`; ctx.fillStyle = '#d6def0'; ctx.fillText('Pase de acceso · Empresas externas', M + 150, 178)

  // Franja de autorizado
  ctx.fillStyle = VERDE; ctx.fillRect(0, 250, W, 130)
  ctx.fillStyle = '#fff'; ctx.font = `800 64px ${FUENTE}`; ctx.textAlign = 'center'
  ctx.fillText('ACCESO AUTORIZADO', W / 2, 340)
  ctx.textAlign = 'left'

  // Datos
  let y = 470
  const campo = (etq, valor, tam = 52) => {
    ctx.fillStyle = GRIS; ctx.font = `600 28px ${FUENTE}`; ctx.fillText(etq.toUpperCase(), M, y)
    ctx.fillStyle = TINTA; ctx.font = `700 ${tam}px ${FUENTE}`
    const ls = lineas(ctx, valor, W - 2 * M)
    ls.forEach((l, i) => ctx.fillText(l, M, y + 62 + i * (tam + 10)))
    y += 62 + ls.length * (tam + 10) + 38
  }
  campo('Trabajador/a', p.nombre)
  campo('DNI / NIE', p.dni)
  campo('Empresa', p.empresa, 44)

  // Validez
  const yv = Math.max(y, 1000)
  ctx.fillStyle = '#eef3fb'; ctx.strokeStyle = AZUL; ctx.lineWidth = 4
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(M, yv, W - 2 * M, 200, 24) : ctx.rect(M, yv, W - 2 * M, 200); ctx.fill(); ctx.stroke()
  ctx.textAlign = 'center'
  ctx.fillStyle = GRIS; ctx.font = `600 30px ${FUENTE}`; ctx.fillText('VÁLIDO HASTA EL', W / 2, yv + 62)
  ctx.fillStyle = AZUL; ctx.font = `800 70px ${FUENTE}`; ctx.fillText(fechaLarga(p.valido_hasta), W / 2, yv + 152)

  // Código
  const yc = yv + 290
  ctx.fillStyle = GRIS; ctx.font = `600 28px ${FUENTE}`; ctx.fillText('CÓDIGO DE VERIFICACIÓN', W / 2, yc)
  ctx.fillStyle = TINTA; ctx.font = `800 76px ${FUENTE}`
  ctx.fillText(p.codigo.split('').join(' '), W / 2, yc + 90)

  // Pie
  ctx.fillStyle = GRIS; ctx.font = `400 27px ${FUENTE}`
  ctx.fillText(`Emitido el ${fechaCorta(p.emitido)} · Válido en todos los centros del Grupo Neural`, W / 2, H - 92)
  ctx.fillText('Muéstralo en la entrada junto con tu DNI. Personal e intransferible.', W / 2, H - 50)
  ctx.textAlign = 'left'
  return c
}

export const paseABlob = (canvas) => new Promise((ok) => canvas.toBlob(ok, 'image/png'))
