// Lectura de hojas de Excel en el navegador (con exceljs).

export function textoCelda(v) {
  if (v == null) return ''
  if (v instanceof Date) {
    if (v.getUTCFullYear() <= 1900) return `${String(v.getUTCHours()).padStart(2, '0')}:${String(v.getUTCMinutes()).padStart(2, '0')}`   // hora sin fecha
    return v.toISOString().slice(0, 10)
  }
  if (typeof v === 'object') {
    if (v.richText) return v.richText.map((t) => t.text).join('')
    if ('result' in v) return textoCelda(v.result)
    if ('text' in v) return textoCelda(v.text)
    if ('error' in v) return ''
  }
  return String(v)
}

// Devuelve las filas de la hoja como objetos { cabecera: valor }.
export async function leerHoja(libro, nombre, opcional = false) {
  const hoja = libro.getWorksheet(nombre)
  if (!hoja) {
    if (opcional) return []
    throw new Error(`No encuentro la hoja "${nombre}" en el archivo.`)
  }
  const cabeceras = []
  hoja.getRow(1).eachCell({ includeEmpty: true }, (celda, n) => {
    cabeceras[n] = textoCelda(celda.value).trim()
  })
  const filas = []
  hoja.eachRow((fila, n) => {
    if (n === 1) return
    const obj = {}
    let vacia = true
    cabeceras.forEach((h, col) => {
      if (!h) return
      const v = textoCelda(fila.getCell(col).value).trim()
      obj[h] = v
      if (v !== '') vacia = false
    })
    if (!vacia) filas.push(obj)
  })
  return filas
}

export async function abrirLibro(file) {
  const ExcelJS = (await import('exceljs')).default
  const libro = new ExcelJS.Workbook()
  await libro.xlsx.load(await file.arrayBuffer())
  return libro
}
