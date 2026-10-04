import { useMemo, useState } from 'react'
import { abrirLibro, leerHoja } from './excelUtil'
import { firmaDe, prepararAgresiones } from './agresionesImport'
import { CONSECUENCIAS, ESTADOS, TIPOS, avisosDe, fechaES, filaParaGuardar, hoyISO } from './agresionesLogic'
import { FILAS_PLANTILLA_AGRESIONES, descargar, plantillaAgresiones } from './documentos'
import { PUESTOS_FUNCIONES } from './funcionesContenido'

// Uso: <ImportarAgresiones supabase={supabase} centros={[{id, codigo, nombre}]} onTerminado={() => ...} onVolver={() => ...} />
// centros: los centros en los que se puede cargar (el técnico, todos; el usuario de centro, solo el suyo).
// Lee la hoja «agresiones» de la plantilla, valida fila a fila, salta las ya registradas y carga el resto.

const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const ok = { color: '#1b5e20', background: '#e8f5e9', padding: 10, borderRadius: 6 }
const celda = { padding: '6px 8px', borderBottom: '1px solid #e5e5e5', verticalAlign: 'top' }
const LOTE = 200

// Agresiones ya guardadas en esos centros y fechas, con la misma forma que las filas nuevas.
async function firmasRegistradas(supabase, filas) {
  if (!filas.length) return new Set()
  const ids = [...new Set(filas.map((f) => f.centro_id))]
  const fechas = filas.map((f) => f.fecha).sort()
  const firmas = new Set()
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await supabase.from('agresiones')
      .select('centro_id,fecha,hora,tipo,puesto,agresor_ref,descripcion')
      .in('centro_id', ids.slice(i, i + 100)).gte('fecha', fechas[0]).lte('fecha', fechas[fechas.length - 1])
      .limit(10000)
    if (error) throw new Error(/agresiones/.test(error.message) ? 'Falta ampliar la base de datos: ejecuta migracion_agresiones.sql en el SQL Editor de Supabase.' : error.message)
    data.forEach((a) => firmas.add(firmaDe(filaParaGuardar({ ...a, hora: a.hora ? a.hora.slice(0, 5) : '' }))))
  }
  return firmas
}

export default function ImportarAgresiones({ supabase, centros, onTerminado, onVolver }) {
  const [archivo, setArchivo] = useState('')
  const [plan, setPlan] = useState(null)
  const [estado, setEstado] = useState('')
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const [cargadas, setCargadas] = useState(null)
  const hoy = hoyISO()
  const nombreCentro = useMemo(() => Object.fromEntries(centros.map((c) => [c.id, `${c.codigo} · ${c.nombre ?? ''}`])), [centros])

  async function bajarPlantilla() {
    setError('')
    try {
      const sufijo = centros.length === 1 ? `_${centros[0].codigo}` : ''
      descargar(await plantillaAgresiones(centros, PUESTOS_FUNCIONES.map((p) => p.nombre)), `Plantilla_agresiones${sufijo}.xlsx`)
    } catch (err) { setError('No se pudo generar la plantilla: ' + err.message) }
  }

  async function alElegirArchivo(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setArchivo(file.name); setPlan(null); setError(''); setCargadas(null); setEstado('Leyendo el archivo...')
    try {
      const libro = await abrirLibro(file)
      const hoja = libro.getWorksheet('agresiones') ? 'agresiones' : libro.worksheets[0]?.name
      if (!hoja) throw new Error('El archivo no tiene hojas.')
      const filas = await leerHoja(libro, hoja)
      const { validas, errores, repetidasEnArchivo } = prepararAgresiones(filas, centros, hoy)
      setEstado('Comprobando las agresiones ya registradas...')
      const registradas = await firmasRegistradas(supabase, validas)
      const nuevas = validas.filter((f) => !registradas.has(firmaDe(f)))
      setPlan({ hoja, leidas: filas.length, nuevas, yaRegistradas: validas.length - nuevas.length, repetidasEnArchivo, errores })
      setEstado('')
    } catch (err) {
      setError(err.message); setEstado('')
    }
  }

  async function cargar() {
    setTrabajando(true); setError('')
    let hechas = 0
    try {
      for (let i = 0; i < plan.nuevas.length; i += LOTE) {
        setEstado(`Cargando ${Math.min(i + LOTE, plan.nuevas.length)} de ${plan.nuevas.length}...`)
        const { error: err } = await supabase.from('agresiones').insert(plan.nuevas.slice(i, i + LOTE))
        if (err) throw new Error(err.message)
        hechas = Math.min(i + LOTE, plan.nuevas.length)
      }
      setCargadas(hechas); setEstado('')
      onTerminado?.()
    } catch (err) {
      setError(`Se han cargado ${hechas} de ${plan.nuevas.length} agresiones y la carga se ha detenido: ${err.message}. ` +
        (hechas ? 'Si vuelves a subir el mismo archivo, las ya cargadas se saltan solas.' : ''))
      setEstado('')
      if (hechas) onTerminado?.()
    } finally {
      setTrabajando(false)
    }
  }

  const conAviso = plan ? plan.nuevas.filter((f) => avisosDe(f, hoy).length > 0).length : 0
  const variosCentros = centros.length > 1

  return (
    <div style={{ textAlign: 'left', maxWidth: 1000 }}>
      <h2>Subida masiva de agresiones desde Excel</h2>
      <p style={{ maxWidth: 760 }}>
        Descarga la plantilla, rellena una fila por agresión en la hoja <b>agresiones</b> y súbela. Antes de cargar
        verás qué filas entran, cuáles tienen errores y cuáles ya estaban registradas.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0' }}>
        <button className="secundario" onClick={bajarPlantilla} disabled={trabajando || !centros.length}>Descargar plantilla</button>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>Subir archivo rellenado:</span>
          <input type="file" accept=".xlsx" onChange={alElegirArchivo} disabled={trabajando} />
        </label>
      </div>
      {archivo && <p style={{ opacity: 0.7, margin: '4px 0' }}>Archivo: {archivo}{plan ? ` (hoja «${plan.hoja}», ${plan.leidas} filas con datos)` : ''}</p>}

      {error && <p style={aviso}>{error}</p>}
      {estado && <p>{estado}</p>}
      {cargadas != null && <p style={ok}>Cargadas {cargadas} {cargadas === 1 ? 'agresión' : 'agresiones'}. Ya aparecen en el registro.</p>}

      {plan && (
        <div>
          <h3>Vista previa</h3>
          <ul>
            <li><b>{plan.nuevas.length}</b> {plan.nuevas.length === 1 ? 'agresión nueva se cargará' : 'agresiones nuevas se cargarán'}{conAviso ? ` (${conAviso} quedarán con aviso de seguimiento)` : ''}.</li>
            {plan.yaRegistradas > 0 && <li>{plan.yaRegistradas} ya estaban registradas y se saltan.</li>}
            {plan.repetidasEnArchivo > 0 && <li>{plan.repetidasEnArchivo} están repetidas dentro del archivo y se cargan una sola vez.</li>}
            {plan.errores.length > 0 && <li style={{ color: '#b00020' }}>{plan.errores.length} {plan.errores.length === 1 ? 'fila tiene errores y no se cargará' : 'filas tienen errores y no se cargarán'}.</li>}
          </ul>

          {plan.errores.length > 0 && (
            <div style={{ ...aviso, maxHeight: 260, overflowY: 'auto' }}>
              <b>Filas con errores (corrígelas en el Excel y vuelve a subirlo; las ya cargadas se saltarán):</b>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                {plan.errores.map((e, i) => <li key={i}>Fila {e.fila}: {e.motivo}.</li>)}
              </ul>
            </div>
          )}

          {plan.nuevas.length > 0 && (
            <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto', margin: '12px 0', border: '1px solid #d9dfe3', borderRadius: 8 }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f6f8f9' }}>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={celda}>Fecha</th>
                    {variosCentros && <th style={celda}>Centro</th>}
                    <th style={celda}>Puesto</th>
                    <th style={celda}>Tipo</th>
                    <th style={celda}>Consecuencias</th>
                    <th style={celda}>Estado</th>
                    <th style={celda}>Qué ocurrió</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.nuevas.map((f, i) => (
                    <tr key={i}>
                      <td style={{ ...celda, whiteSpace: 'nowrap' }}>{fechaES(f.fecha)}{f.hora ? ` ${f.hora}` : ''}</td>
                      {variosCentros && <td style={celda}>{nombreCentro[f.centro_id]}</td>}
                      <td style={celda}>{f.puesto ?? ''}</td>
                      <td style={celda}>{TIPOS[f.tipo]}</td>
                      <td style={celda}>{CONSECUENCIAS[f.consecuencias]}</td>
                      <td style={celda}>{ESTADOS[f.estado]}</td>
                      <td style={{ ...celda, maxWidth: 320 }}>{(f.descripcion ?? '').slice(0, 120)}{(f.descripcion ?? '').length > 120 ? '…' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={cargar} disabled={trabajando || cargadas != null || !plan.nuevas.length} style={{ padding: '10px 18px', fontWeight: 600 }}>
            {trabajando ? 'Cargando...' : cargadas != null ? 'Cargadas' : `Cargar ${plan.nuevas.length} ${plan.nuevas.length === 1 ? 'agresión' : 'agresiones'}`}
          </button>
        </div>
      )}

      <p style={{ fontSize: 13, opacity: 0.75, marginTop: 16 }}>
        La plantilla admite {FILAS_PLANTILLA_AGRESIONES} filas por archivo. No escribas nombres ni datos de salud identificables: usa el puesto y un código o iniciales.
      </p>
      <p><button className="secundario" onClick={onVolver} disabled={trabajando}>Volver al registro</button></p>
    </div>
  )
}
