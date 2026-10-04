import { useState } from 'react'
import { abrirLibro, leerHoja } from './excelUtil'
import { prepararCentros } from './centrosLogic'

// Uso: <ImportarCentros supabase={supabase} onTerminado={() => ...} onVolver={() => ...} />
// Lee las hojas "centros" y "centro_puestos" de la plantilla, muestra un resumen y los carga.
// Si el código del centro ya existe, lo actualiza; si no, lo crea.

async function subirLotes(supabase, tabla, filas, opciones, selectCols, tamano = 100) {
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

export default function ImportarCentros({ supabase, onTerminado, onVolver }) {
  const [plan, setPlan] = useState(null)
  const [archivo, setArchivo] = useState('')
  const [estado, setEstado] = useState('')
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [terminado, setTerminado] = useState(false)
  const [puestosBD, setPuestosBD] = useState([])

  async function alElegirArchivo(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPlan(null); setError(''); setEstado('Leyendo el archivo...'); setTerminado(false)
    setArchivo(file.name)
    try {
      const [{ data: puestos, error: e1 }, { data: cods, error: e2 }] = await Promise.all([
        supabase.from('puestos').select('id,nombre'),
        supabase.from('centros').select('codigo'),
      ])
      if (e1 || e2) throw new Error((e1 || e2).message)
      if (!puestos.length) {
        throw new Error('Todavía no hay puestos en la base de datos. Importa primero las medidas y la matriz.')
      }
      setPuestosBD(puestos)
      const libro = await abrirLibro(file)
      const centros = await leerHoja(libro, 'centros')
      const centroPuestos = await leerHoja(libro, 'centro_puestos', true)
      setPlan(prepararCentros(
        { centros, centroPuestos },
        { puestosBD: puestos, codigosBD: cods.map((c) => c.codigo) }
      ))
      setEstado('')
    } catch (err) {
      setError(err.message)
      setEstado('')
    }
  }

  async function importar() {
    setTrabajando(true); setError(''); setTerminado(false)
    try {
      setEstado('1/2 Guardando centros...')
      const centrosBD = await subirLotes(supabase, 'centros', plan.centros, { onConflict: 'codigo' }, 'id,codigo')
      const idCentro = new Map(centrosBD.map((c) => [c.codigo, c.id]))
      const idPuesto = new Map(puestosBD.map((p) => [p.nombre, p.id]))

      setEstado('2/2 Guardando puestos de cada centro...')
      const filas = plan.centroPuestos.map((r) => ({
        centro_id: idCentro.get(r.codigo) ?? null,
        puesto_id: idPuesto.get(r.puesto),
        n_trabajadores: r.n_trabajadores,
        turnos: r.turnos,
      }))
      // Los centros que ya existían no se devuelven por el upsert si no cambian: se piden aparte.
      const faltan = [...new Set(plan.centroPuestos.filter((r) => !idCentro.has(r.codigo)).map((r) => r.codigo))]
      if (faltan.length) {
        const { data, error: err } = await supabase.from('centros').select('id,codigo').in('codigo', faltan)
        if (err) throw new Error(err.message)
        data.forEach((c) => idCentro.set(c.codigo, c.id))
        filas.forEach((f, i) => { f.centro_id = idCentro.get(plan.centroPuestos[i].codigo) })
      }
      await subirLotes(supabase, 'centro_puestos', filas, { onConflict: 'centro_id,puesto_id' }, null, 300)

      setEstado(`Importación completada: ${plan.resumen.centros} centros y ${plan.resumen.centroPuestos} puestos de centro.`)
      setTerminado(true)
      onTerminado?.()
    } catch (err) {
      setError(err.message)
      setEstado('')
    } finally {
      setTrabajando(false)
    }
  }

  const r = plan?.resumen

  return (
    <div style={{ maxWidth: 760 }}>
      <h2>Importar centros desde Excel</h2>
      <p>
        Elige la plantilla con las hojas <b>centros</b> y <b>centro_puestos</b>. Los centros cuyo
        código ya exista se actualizan, y los nuevos se crean. La fila de ejemplo de la plantilla
        se ignora automáticamente.
      </p>

      <input type="file" accept=".xlsx" onChange={alElegirArchivo} disabled={trabajando} />
      {archivo && <p style={{ opacity: 0.7 }}>Archivo: {archivo}</p>}

      {error && (
        <p style={{ color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }}>{error}</p>
      )}
      {estado && <p>{estado}</p>}

      {plan && (
        <div>
          <h3>Resumen</h3>
          <ul>
            <li><b>{r.centros}</b> centros ({r.nuevos} nuevos, {r.actualizados} ya existentes que se actualizan).</li>
            <li>{r.centroPuestos} puestos asignados a centros.</li>
          </ul>

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
                {plan.errores.slice(0, 30).map((e, i) => (
                  <li key={i}>Hoja {e.hoja}, fila {e.fila}: {e.motivo}</li>
                ))}
              </ul>
              {plan.errores.length > 30 && <p>...y {plan.errores.length - 30} más.</p>}
            </div>
          )}

          <button
            onClick={importar}
            disabled={trabajando || terminado || plan.centros.length === 0}
            style={{ marginTop: 12, padding: '10px 18px', fontWeight: 600 }}
          >
            {trabajando ? 'Importando...' : terminado ? 'Importado' : 'Importar centros'}
          </button>
        </div>
      )}

      <p>
        <button className="secundario" onClick={onVolver} disabled={trabajando}>Volver a la lista</button>
      </p>
    </div>
  )
}
