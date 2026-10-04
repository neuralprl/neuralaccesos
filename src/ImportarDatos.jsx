import { useState } from 'react'
import { prepararImportacion } from './importLogic'

// Uso: <ImportarDatos supabase={supabase} />
// Lee las hojas "medidas" y "matriz" de la plantilla Excel, muestra un resumen
// y, al confirmar, las carga en Supabase. Se puede repetir sin duplicar datos.

const VR_ORDEN = ['T', 'TO', 'MO', 'IM', 'IN']

function textoCelda(v) {
  if (v == null) return ''
  if (typeof v === 'object') {
    if (v.richText) return v.richText.map((t) => t.text).join('')
    if ('result' in v) return textoCelda(v.result)
    if ('text' in v) return textoCelda(v.text)
    if ('error' in v) return ''
    if (v instanceof Date) return v.toISOString().slice(0, 10)
  }
  return String(v)
}

async function leerHoja(libro, nombre, opcional = false) {
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

async function subirLotes(supabase, tabla, filas, opciones, selectCols, tamano = 200) {
  const devueltas = []
  for (let i = 0; i < filas.length; i += tamano) {
    let consulta = supabase.from(tabla).upsert(filas.slice(i, i + tamano), opciones)
    if (selectCols) consulta = consulta.select(selectCols)
    const { data, error } = await consulta
    if (error) throw new Error(`${tabla}: ${error.message}`)
    if (data) devueltas.push(...data)
  }
  return devueltas
}

export default function ImportarDatos({ supabase }) {
  const [plan, setPlan] = useState(null)
  const [archivo, setArchivo] = useState('')
  const [estado, setEstado] = useState('')
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [terminado, setTerminado] = useState(false)

  async function alElegirArchivo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPlan(null); setError(''); setEstado(''); setTerminado(false)
    setArchivo(file.name)
    try {
      setEstado('Leyendo el archivo...')
      const ExcelJS = (await import('exceljs')).default
      const libro = new ExcelJS.Workbook()
      await libro.xlsx.load(await file.arrayBuffer())
      const medidas = await leerHoja(libro, 'medidas')
      const matriz = await leerHoja(libro, 'matriz')
      const check = await leerHoja(libro, 'check', true)
      setPlan(prepararImportacion({ medidas, matriz, check }))
      setEstado('')
    } catch (err) {
      setError(err.message)
      setEstado('')
    }
  }

  async function importar() {
    if (!plan) return
    setTrabajando(true); setError(''); setTerminado(false)
    try {
      setEstado('1/6 Guardando riesgos...')
      await subirLotes(supabase, 'riesgos', plan.riesgos, { onConflict: 'id' })

      setEstado('2/6 Guardando medidas...')
      await subirLotes(supabase, 'medidas', plan.medidas, { onConflict: 'id' })

      if (plan.check.length > 0) {
        setEstado('3/6 Guardando preguntas del check...')
        await subirLotes(supabase, 'check_preguntas', plan.check, { onConflict: 'riesgo_id,pregunta' })
      }

      setEstado('4/6 Guardando puestos...')
      const puestosBD = await subirLotes(
        supabase, 'puestos', plan.puestos.map((nombre) => ({ nombre })),
        { onConflict: 'nombre' }, 'id,nombre'
      )
      const idPuesto = new Map(puestosBD.map((p) => [p.nombre, p.id]))

      setEstado('5/6 Guardando la matriz de riesgos...')
      const filasMatriz = plan.matriz.map((m) => ({
        puesto_id: idPuesto.get(m.puesto),
        riesgo_id: m.riesgo_id,
        condicion: m.condicion,
        p: m.p,
        c: m.c,
      }))
      const matrizBD = await subirLotes(
        supabase, 'matriz_puestos', filasMatriz,
        { onConflict: 'puesto_id,riesgo_id,condicion' },
        'id,puesto_id,riesgo_id,condicion'
      )
      const idMatriz = new Map(
        matrizBD.map((r) => [`${r.puesto_id}|${r.riesgo_id}|${r.condicion}`, r.id])
      )

      setEstado('6/6 Vinculando medidas...')
      const vinculos = []
      plan.matriz.forEach((m) => {
        const mid = idMatriz.get(`${idPuesto.get(m.puesto)}|${m.riesgo_id}|${m.condicion}`)
        m.medidas.forEach((medida_id) => vinculos.push({ matriz_id: mid, medida_id }))
      })
      await subirLotes(
        supabase, 'matriz_medidas', vinculos,
        { onConflict: 'matriz_id,medida_id', ignoreDuplicates: true }, null, 400
      )

      const { count } = await supabase
        .from('matriz_puestos').select('*', { count: 'exact', head: true })
      setEstado(`Importación completada. La matriz tiene ahora ${count ?? '?'} filas.`)
      setTerminado(true)
    } catch (err) {
      const pista = err.message.includes('check_preguntas')
        ? ' Falta crear la tabla del check: ejecuta migracion_check.sql en el SQL Editor de Supabase.'
        : ''
      setError(err.message + pista)
      setEstado('')
    } finally {
      setTrabajando(false)
    }
  }

  const r = plan?.resumen

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 16 }}>
      <h2>Importar medidas y matriz</h2>
      <p>
        Elige la plantilla Excel con las hojas <b>medidas</b> y <b>matriz</b>. Verás un resumen
        antes de cargar nada. Puedes repetir la importación sin duplicar datos.
      </p>

      <input type="file" accept=".xlsx" onChange={alElegirArchivo} disabled={trabajando} />
      {archivo && <p style={{ opacity: 0.7 }}>Archivo: {archivo}</p>}

      {error && (
        <p style={{ color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }}>
          {error}
        </p>
      )}
      {estado && <p>{estado}</p>}

      {plan && (
        <div>
          <h3>Resumen</h3>
          <ul>
            <li>{r.riesgos} riesgos y {r.medidas} medidas en el catálogo
              {r.medidasNuevas.length > 0 && ` (${r.medidasNuevas.length} nueva/s creada/s a partir de la matriz)`}.</li>
            <li>{r.puestos} puestos (incluye TODOS si existe).</li>
            <li>{r.filasLeidas} filas leídas en la matriz, que quedan en <b>{r.filasMatriz}</b> tras fusionar
              las que comparten puesto, riesgo y condición ({r.gruposFusionados} grupos).</li>
            <li>{r.vinculos} medidas vinculadas a la matriz.</li>
            {r.check.preguntas > 0 ? (
              <li>Check: {r.check.preguntas} preguntas sobre {r.check.riesgos} riesgos
                ({r.check.conSubtipo} son subtipos de un mismo riesgo, como los de carga física).</li>
            ) : (
              <li>No se ha encontrado la hoja <b>check</b> (o está vacía): no se cargarán preguntas.</li>
            )}
            <li>Valoración: {VR_ORDEN.filter((k) => r.porVR[k]).map((k) => `${k} ${r.porVR[k]}`).join(' · ')}.</li>
            {r.codigosConNombreDistinto > 0 && (
              <li>{r.codigosConNombreDistinto} riesgos tenían el nombre escrito de varias formas; se usa el del catálogo.</li>
            )}
            {r.repetidasExactas > 0 && <li>{r.repetidasExactas} fila/s totalmente repetida/s eliminada/s.</li>}
            {r.conflictosPC > 0 && <li>{r.conflictosPC} conflicto/s de P o C resueltos quedándose con el valor más alto.</li>}
          </ul>

          {r.medidasNuevas.length > 0 && (
            <details>
              <summary>Medidas nuevas que se crearán</summary>
              <ul>{r.medidasNuevas.map((m) => <li key={m.id}><b>{m.id}</b>: {m.texto}</li>)}</ul>
            </details>
          )}

          {plan.avisos.length > 0 && (
            <details open>
              <summary>Avisos ({plan.avisos.length})</summary>
              <ul>{plan.avisos.slice(0, 20).map((a, i) => <li key={i}>{a}</li>)}</ul>
            </details>
          )}

          {plan.errores.length > 0 && (
            <div style={{ background: '#fdecea', padding: 10, borderRadius: 6 }}>
              <b>{plan.errores.length} fila/s con errores (no se importarán):</b>
              <ul>
                {plan.errores.slice(0, 20).map((e, i) => (
                  <li key={i}>Hoja {e.hoja}, fila {e.fila}: {e.motivo}</li>
                ))}
              </ul>
              {plan.errores.length > 20 && <p>...y {plan.errores.length - 20} más.</p>}
            </div>
          )}

          <button
            onClick={importar}
            disabled={trabajando || terminado || plan.matriz.length === 0}
            style={{ marginTop: 12, padding: '10px 18px', fontWeight: 600 }}
          >
            {trabajando ? 'Importando...' : terminado ? 'Importado' : 'Importar a Supabase'}
          </button>
        </div>
      )}
    </div>
  )
}
