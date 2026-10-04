import { useState } from 'react'
import { abrirLibro, leerHoja } from './excelUtil'
import { prepararInforme } from './adaptacionLogic'
import { descargar, htmlAdaptacion, imprimir, nombreArchivoAdaptacion, wordAdaptacion } from './documentos'
import { fechaES } from './planLogic'

// Aptos con limitaciones: importar las cartas de aptitud de vigilancia de la salud, revisar las medidas
// (editables; lo no reconocido queda pendiente) y descargar el informe de adaptación.
// Se usa dentro de PersonasSensibles. Props: supabase, evc, evals, lista (personas_sensibles del centro), onCambio

const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const sin = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const COLS = { dni: 'DNI/NIE', nombre: 'Nombre', empresa: 'Razón Social del contrato', centro: 'Centro de Trabajo', puesto: 'Puesto de Trabajo', tipo: 'Tipo de Reconocimiento', fecha: 'Fecha Reconocimiento', vigencia: 'Fecha Vigencia', meses: 'Vigencia (meses)', grado: 'Grado Aptitud', limitaciones: 'Tipo Limitación' }

// Puesto de la evaluación que más se parece al de la carta (por palabras en común).
function puestoParecido(texto, puestos) {
  const a = new Set(sin(texto).split(' ').filter((w) => w.length > 3))
  let mejor = null; let max = 0
  puestos.forEach((p) => {
    const b = sin(p.nombre).split(' ').filter((w) => w.length > 3)
    const n = b.filter((w) => [...a].some((x) => x.startsWith(w.slice(0, 5)) || w.startsWith(x.slice(0, 5)))).length
    if (n > max) { max = n; mejor = p }
  })
  return mejor?.id ?? ''
}

// Informe a partir de un registro guardado (con las medidas revisadas).
export function informeDeRegistro(r, tecnico) {
  const base = prepararInforme({
    nombre: r.nombre ?? r.referencia ?? '', dni: r.dni ?? '', empresa: r.empresa ?? '', centro: r.centro_carta ?? '', puesto: r.puesto_carta || r.puesto || '',
    tipo_reconocimiento: r.tipo_reconocimiento ?? '', fecha_reconocimiento: r.fecha_reconocimiento, fecha_vigencia: r.fecha_vigencia, vigencia_meses: r.vigencia_meses,
    grado: 'Apto con limitaciones', limitaciones: (r.detalle?.limitaciones ?? []).length ? '' : r.limitaciones ?? '',
  })
  if ((r.detalle?.limitaciones ?? []).length) {
    base.limitaciones = r.detalle.limitaciones.map((x) => ({ ...x, tipo: (x.medidas ?? []).filter((m) => m.trim()).length ? 'limitacion' : 'pendiente' }))
    base.notas = r.detalle.notas ?? []
    const vig = base.pendientes.filter((p) => /vigencia/.test(p))
    base.pendientes = [...vig, ...base.limitaciones.filter((x) => x.tipo === 'pendiente').map((x) => `Indicar las medidas preventivas de: «${x.texto}».`)]
    const vistas = new Set()
    base.limitaciones.forEach((x) => { x.repetida = x.medidas.length > 0 && x.medidas.every((m) => vistas.has(m)); x.medidas.forEach((m) => vistas.add(m)) })
  }
  return { ...base, tecnico }
}

export function detalleDe(texto) {
  const i = prepararInforme({ limitaciones: texto })
  return { limitaciones: i.limitaciones.map(({ texto: t, regla, medidas }) => ({ texto: t, regla, medidas })), notas: i.notas }
}

export function EditorMedidas({ supabase, registro, onGuardado, onCancelar }) {
  const [lims, setLims] = useState((registro.detalle?.limitaciones?.length ? registro.detalle.limitaciones : detalleDe(registro.limitaciones ?? '').limitaciones).map((x) => ({ ...x, medidasTxt: (x.medidas ?? []).join('\n') })))
  const [error, setError] = useState('')
  async function guardar() {
    const limitaciones = lims.map(({ medidasTxt, ...x }) => ({ ...x, medidas: medidasTxt.split('\n').map((m) => m.trim()).filter(Boolean) }))
    const detalle = { limitaciones, notas: registro.detalle?.notas ?? detalleDe(registro.limitaciones ?? '').notas }
    const { error: err } = await supabase.from('personas_sensibles').update({ detalle }).eq('id', registro.id)
    if (err) setError(err.message); else onGuardado()
  }
  return (
    <div style={{ border: '1px solid #d9dfe3', borderRadius: 8, padding: 12, background: '#fff', margin: '8px 0' }}>
      <strong>Medidas preventivas · {registro.nombre ?? registro.referencia}</strong>
      <p style={{ fontSize: 13, margin: '4px 0 8px', opacity: 0.8 }}>Una medida por línea. Las limitaciones que el sistema no reconoce aparecen vacías y en rojo: escribe sus medidas.</p>
      {error && <p style={aviso}>{error}</p>}
      {lims.map((x, k) => {
        const vacia = !x.medidasTxt.trim()
        return (
          <div key={k} style={{ margin: '8px 0', paddingTop: 6, borderTop: '1px dashed #d9dfe3' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{k + 1}. {x.texto}</div>
            <textarea rows={Math.max(2, x.medidasTxt.split('\n').length)} value={x.medidasTxt} onChange={(e) => setLims(lims.map((y, j) => (j === k ? { ...y, medidasTxt: e.target.value } : y)))}
              placeholder="PENDIENTE: indicar las medidas preventivas"
              style={{ width: '100%', boxSizing: 'border-box', marginTop: 4, borderColor: vacia ? '#c62828' : undefined, background: vacia ? '#fff5f5' : undefined }} />
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={guardar}>Guardar medidas</button>
        <button className="secundario" onClick={onCancelar}>Cancelar</button>
      </div>
    </div>
  )
}

export async function descargarAdaptacion(r, tecnico, formato) {
  const inf = informeDeRegistro(r, tecnico)
  if (formato === 'word') descargar(await wordAdaptacion(inf), nombreArchivoAdaptacion(inf, 'docx'))
  else imprimir(htmlAdaptacion(inf))
  return inf
}

export function ImportarAptitudes({ supabase, evc, evals, onTerminado, onCancelar }) {
  const [filas, setFilas] = useState(null)
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const puestos = evals.map((e) => ({ id: String(e.puesto_id), nombre: e.puestos?.nombre ?? '' }))

  async function leer(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    try {
      const libro = await abrirLibro(file)
      const datos = await leerHoja(libro, libro.worksheets[0].name)
      if (!datos.length || !(COLS.limitaciones in datos[0])) throw new Error(`El archivo no tiene la columna «${COLS.limitaciones}». Usa el Excel de cartas de aptitud de vigilancia de la salud.`)
      setFilas(datos.filter((d) => d[COLS.nombre]).map((d) => {
        const f = {
          dni: d[COLS.dni], nombre: d[COLS.nombre], empresa: String(d[COLS.empresa] ?? '').replace(/\s+/g, ' ').trim(), centro: d[COLS.centro], puesto: d[COLS.puesto],
          tipo_reconocimiento: d[COLS.tipo], fecha_reconocimiento: d[COLS.fecha] || null, fecha_vigencia: d[COLS.vigencia] || null, vigencia_meses: Number(d[COLS.meses]) || 0,
          grado: d[COLS.grado], limitaciones: d[COLS.limitaciones],
        }
        const inf = prepararInforme(f)
        return { ...f, sel: true, puesto_id: puestoParecido(f.puesto, puestos), pendientes: inf.pendientes.length, gestacion: inf.gestacion, n: inf.limitaciones.length }
      }))
    } catch (err) { setError(err.message) }
  }

  async function importar() {
    setTrabajando(true); setError('')
    const elegidas = filas.filter((f) => f.sel)
    const registros = elegidas.map((f) => ({
      centro_id: evc.centros.id, evaluacion_centro_id: evc.id, tipo: f.gestacion ? 'embarazo' : 'limitaciones',
      puesto_id: f.puesto_id || null, puesto: puestos.find((p) => p.id === f.puesto_id)?.nombre ?? null, referencia: null,
      nombre: f.nombre, dni: f.dni, empresa: f.empresa, centro_carta: f.centro, puesto_carta: f.puesto, tipo_reconocimiento: f.tipo_reconocimiento,
      fecha_reconocimiento: f.fecha_reconocimiento, fecha_vigencia: f.fecha_vigencia, vigencia_meses: f.vigencia_meses, fecha_comunicacion: f.fecha_reconocimiento,
      limitaciones: f.limitaciones, detalle: detalleDe(f.limitaciones), informe_estado: 'pendiente',
    }))
    const { error: err } = await supabase.from('personas_sensibles').insert(registros)
    setTrabajando(false)
    if (err) setError(/nombre|dni|detalle/.test(err.message) ? 'Falta ampliar la base de datos: ejecuta migracion_adaptacion.sql.' : err.message)
    else onTerminado(registros.length)
  }

  return (
    <div style={{ border: '1px solid #d9dfe3', borderRadius: 8, padding: 12, background: '#fff', margin: '8px 0' }}>
      <strong>Importar cartas de aptitud (Excel de vigilancia de la salud)</strong>
      <p style={{ fontSize: 13, margin: '4px 0 8px', opacity: 0.8 }}>Cada línea es un reconocimiento. Marca las de este centro y comprueba el puesto. Las medidas se proponen solas y podrás revisarlas.</p>
      {error && <p style={aviso}>{error}</p>}
      {!filas && <input type="file" accept=".xlsx" onChange={leer} />}
      {filas && (
        <>
          <div style={{ overflowX: 'auto', maxHeight: 380, overflowY: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead><tr style={{ textAlign: 'left', position: 'sticky', top: 0, background: '#f6f8f9' }}><th /><th>Trabajador/a</th><th>Carta</th><th>Puesto en la evaluación</th><th>Limitaciones</th></tr></thead>
              <tbody>
                {filas.map((f, k) => (
                  <tr key={k} style={{ borderBottom: '1px solid #eee', opacity: f.sel ? 1 : 0.5 }}>
                    <td><input type="checkbox" checked={f.sel} onChange={(e) => setFilas(filas.map((x, j) => (j === k ? { ...x, sel: e.target.checked } : x)))} style={{ width: 'auto' }} /></td>
                    <td>{f.nombre}<br /><small>{f.empresa}</small></td>
                    <td>{f.puesto}<br /><small>{f.tipo_reconocimiento} · {fechaES(f.fecha_reconocimiento)}</small></td>
                    <td><select value={f.puesto_id} onChange={(e) => setFilas(filas.map((x, j) => (j === k ? { ...x, puesto_id: e.target.value } : x)))}>
                      <option value="">Sin puesto</option>{puestos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></td>
                    <td>{f.n}{f.gestacion ? ' · embarazo' : ''}{f.pendientes ? <span style={{ color: '#c62828' }}> · {f.pendientes} pendientes</span> : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={importar} disabled={trabajando || !filas.some((f) => f.sel)}>{trabajando ? 'Importando...' : `Importar ${filas.filter((f) => f.sel).length}`}</button>
            <button className="secundario" onClick={onCancelar}>Cancelar</button>
          </div>
        </>
      )}
      {!filas && <p><button className="secundario" onClick={onCancelar}>Cancelar</button></p>}
    </div>
  )
}
