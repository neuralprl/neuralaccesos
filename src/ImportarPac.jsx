import { useState } from 'react'
import { abrirLibro, leerHoja } from './excelUtil'
import { prepararPac } from './pacLogic'

// Uso: <ImportarPac supabase={supabase} onTerminado={() => ...} onVolver={() => ...} />
// Lee las hojas "preguntas_previas" y "pac_items" del Excel de la lista del PAC y las carga.
// Se puede repetir sin duplicar: los puntos se identifican por su bloque y su texto.

async function subirLotes(supabase, tabla, filas, opciones, tamano = 200) {
  for (let i = 0; i < filas.length; i += tamano) {
    const { error } = await supabase.from(tabla).upsert(filas.slice(i, i + tamano), opciones)
    if (error) throw new Error(`${tabla}: ${error.message}`)
  }
}

export default function ImportarPac({ supabase, onTerminado, onVolver }) {
  const [plan, setPlan] = useState(null)
  const [archivo, setArchivo] = useState('')
  const [estado, setEstado] = useState('')
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [terminado, setTerminado] = useState(false)

  async function alElegirArchivo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPlan(null); setError(''); setEstado('Leyendo el archivo...'); setTerminado(false)
    setArchivo(file.name)
    try {
      const libro = await abrirLibro(file)
      const preguntas = await leerHoja(libro, 'preguntas_previas')
      const items = await leerHoja(libro, 'pac_items')
      setPlan(prepararPac({ preguntas, items }))
      setEstado('')
    } catch (err) {
      setError(err.message)
      setEstado('')
    }
  }

  async function importar() {
    setTrabajando(true); setError(''); setTerminado(false)
    try {
      setEstado('1/2 Guardando las preguntas previas...')
      await subirLotes(supabase, 'pac_preguntas_previas', plan.preguntas, { onConflict: 'id' })
      setEstado('2/2 Guardando los puntos de comprobación...')
      await subirLotes(supabase, 'pac_items', plan.items, { onConflict: 'bloque,punto' })
      setEstado(`Importación completada: ${plan.resumen.puntos} puntos y ${plan.resumen.preguntas} preguntas previas.`)
      setTerminado(true)
      onTerminado?.()
    } catch (err) {
      const pista = /pac_preguntas_previas|pregunta_previa|seccion|riesgo/.test(err.message)
        ? ' Falta ampliar la base de datos: ejecuta migracion_pac.sql en el SQL Editor de Supabase.'
        : ''
      setError(err.message + pista)
      setEstado('')
    } finally {
      setTrabajando(false)
    }
  }

  const r = plan?.resumen

  return (
    <div style={{ maxWidth: 760, textAlign: 'left' }}>
      <h2>Importar la lista del PAC</h2>
      <p>
        Elige el Excel con las hojas <b>preguntas_previas</b> y <b>pac_items</b>. Se puede repetir
        la importación sin duplicar puntos: si cambias el texto de un punto, se añadirá como uno nuevo.
      </p>

      <input type="file" accept=".xlsx" onChange={alElegirArchivo} disabled={trabajando} />
      {archivo && <p style={{ opacity: 0.7 }}>Archivo: {archivo}</p>}

      {error && <p style={{ color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }}>{error}</p>}
      {estado && <p>{estado}</p>}

      {plan && (
        <div>
          <h3>Resumen</h3>
          <ul>
            <li><b>{r.puntos}</b> puntos de comprobación en {r.bloques} bloques.</li>
            <li>{r.preguntas} preguntas previas, que controlan {r.conPrevia} puntos.</li>
          </ul>

          {plan.avisos.length > 0 && (
            <details open>
              <summary>Avisos ({plan.avisos.length})</summary>
              <ul>{plan.avisos.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </details>
          )}

          {plan.errores.length > 0 && (
            <div style={{ background: '#fdecea', padding: 10, borderRadius: 6 }}>
              <b>{plan.errores.length} fila/s con errores (no se importarán):</b>
              <ul>
                {plan.errores.slice(0, 30).map((e, i) => (
                  <li key={i}>Hoja {e.hoja}, fila {e.fila}: {e.motivo}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={importar}
            disabled={trabajando || terminado || plan.items.length === 0}
            style={{ marginTop: 12, padding: '10px 18px', fontWeight: 600 }}
          >
            {trabajando ? 'Importando...' : terminado ? 'Importado' : 'Importar lista del PAC'}
          </button>
        </div>
      )}

      <p>
        <button className="secundario" onClick={onVolver} disabled={trabajando}>Volver</button>
      </p>
    </div>
  )
}
