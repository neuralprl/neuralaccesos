import { useEffect, useMemo, useState } from 'react'
import {
  AGRESORES, CONSECUENCIAS, ESTADOS, TIPOS, agresionNueva, avisosDe, fechaES, filaParaGuardar, filtrarAgresiones,
  hoyISO, resumenAgresiones, validarAgresion,
} from './agresionesLogic'
import { PUESTOS_FUNCIONES } from './funcionesContenido'
import { descargar, excelAgresiones, htmlAgresiones, imprimir } from './documentos'
import BarraAlta from './BarraAlta'
import ImportarAgresiones from './ImportarAgresiones'

// Uso:
//   Técnico:      <Agresiones supabase={supabase} />                       (elige el centro o ve todos)
//   Centro:       <Agresiones supabase={supabase} centro={{id, codigo, nombre}} />   (solo su centro; no puede borrar)

const campo = { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, fontSize: 14, textAlign: 'left' }
const ancho = { width: '100%', boxSizing: 'border-box' }
const rejilla = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'start' }
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const COLOR_CONS = { sin_lesion: '#2e7d32', lesion_sin_baja: '#d9600a', lesion_con_baja: '#c62828' }

function Tarjeta({ titulo, valor, color, nota }) {
  return (
    <div style={{ border: '1px solid #d9d9d9', borderLeft: `6px solid ${color || '#1f3864'}`, borderRadius: 8, padding: '8px 12px', minWidth: 140, textAlign: 'left' }}>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{valor}</div>
      <div style={{ fontSize: 13 }}>{titulo}</div>
      {nota && <div style={{ fontSize: 12, opacity: 0.65 }}>{nota}</div>}
    </div>
  )
}

function Formulario({ valor, onCambio, onGuardar, onCancelar, centros, centroFijo, guardando, errores }) {
  const set = (k, v) => onCambio({ ...valor, [k]: v })
  return (
    <div style={{ border: '2px solid #1f3864', borderRadius: 10, padding: 14, margin: '12px 0', textAlign: 'left' }}>
      <h3 style={{ margin: '0 0 10px' }}>{valor.id ? 'Editar agresión' : 'Nueva agresión'}</h3>
      {errores.length > 0 && <div style={aviso}>{errores.map((e, i) => <div key={i}>{e}</div>)}</div>}
      <div style={rejilla}>
        {!centroFijo && (
          <label style={campo}>
            <span>Centro</span>
            <select style={ancho} value={valor.centro_id} disabled={!!valor.id} onChange={(e) => set('centro_id', e.target.value)}>
              <option value="">— elige —</option>
              {centros.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
            </select>
          </label>
        )}
        <label style={campo}><span>Fecha</span><input type="date" style={ancho} value={valor.fecha} max={hoyISO()} onChange={(e) => set('fecha', e.target.value)} /></label>
        <label style={campo}><span>Hora (opcional)</span><input type="time" style={ancho} value={valor.hora ?? ''} onChange={(e) => set('hora', e.target.value)} /></label>
        <label style={campo}><span>Lugar</span><input style={ancho} placeholder="Sala, pasillo, comedor..." value={valor.lugar ?? ''} onChange={(e) => set('lugar', e.target.value)} /></label>
        <label style={campo}>
          <span>Puesto de la persona agredida</span>
          <input style={ancho} list="agr-puestos" value={valor.puesto ?? ''} onChange={(e) => set('puesto', e.target.value)} />
          <datalist id="agr-puestos">{PUESTOS_FUNCIONES.map((p) => <option key={p.nombre} value={p.nombre} />)}</datalist>
        </label>
        <label style={campo}>
          <span>Tipo</span>
          <select style={ancho} value={valor.tipo} onChange={(e) => set('tipo', e.target.value)}>
            {Object.entries(TIPOS).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
        </label>
        <label style={campo}>
          <span>Quién agrede</span>
          <select style={ancho} value={valor.agresor} onChange={(e) => set('agresor', e.target.value)}>
            {Object.entries(AGRESORES).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
        </label>
        <label style={campo}>
          <span>Código o iniciales del agresor</span>
          <input style={ancho} maxLength={12} placeholder="Nunca el nombre completo" value={valor.agresor_ref ?? ''} onChange={(e) => set('agresor_ref', e.target.value)} />
          <small style={{ opacity: 0.65 }}>Sirve para detectar agresiones repetidas.</small>
        </label>
        <label style={campo}>
          <span>Consecuencias para la persona agredida</span>
          <select style={ancho} value={valor.consecuencias} onChange={(e) => set('consecuencias', e.target.value)}>
            {Object.entries(CONSECUENCIAS).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
        </label>
      </div>
      <label style={{ ...campo, marginTop: 10 }}><span>Qué ocurrió</span><textarea rows={3} style={ancho} value={valor.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} /></label>
      <label style={{ ...campo, marginTop: 10 }}><span>Cómo se actuó en el momento</span><textarea rows={2} style={ancho} value={valor.actuacion ?? ''} onChange={(e) => set('actuacion', e.target.value)} /></label>
      <label style={{ ...campo, marginTop: 10 }}><span>Medidas adoptadas o propuestas</span><textarea rows={2} style={ancho} value={valor.medidas ?? ''} onChange={(e) => set('medidas', e.target.value)} /></label>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0' }}>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={!!valor.parte_accidente} onChange={(e) => set('parte_accidente', e.target.checked)} /> Parte de accidente tramitado</label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={!!valor.comunicada_prevencion} onChange={(e) => set('comunicada_prevencion', e.target.checked)} /> Comunicada al servicio de prevención</label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          Estado
          <select value={valor.estado} onChange={(e) => set('estado', e.target.value)}>
            {Object.entries(ESTADOS).map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
        </label>
      </div>
      <p style={{ fontSize: 13, opacity: 0.75, margin: '0 0 10px' }}>
        No escribas nombres ni datos de salud identificables de usuarios o trabajadores: usa el puesto y un código o iniciales.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onGuardar} disabled={guardando} style={{ padding: '8px 16px', fontWeight: 600 }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        <button className="secundario" onClick={onCancelar} disabled={guardando}>Cancelar</button>
      </div>
    </div>
  )
}

export default function Agresiones({ supabase, centro }) {
  const esCentro = !!centro
  const [centros, setCentros] = useState(centro ? [centro] : [])
  const [centroId, setCentroId] = useState(centro?.id ?? '')
  const [lista, setLista] = useState(null)
  const [filtro, setFiltro] = useState({ anio: '', tipo: '', estado: '', soloAvisos: false })
  const [edicion, setEdicion] = useState(null)
  const [errores, setErrores] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [vista, setVista] = useState('lista')
  const hoy = hoyISO()

  useEffect(() => {
    if (esCentro) return
    supabase.from('centros').select('id,codigo,nombre').order('codigo').then(({ data, error: err }) => {
      if (err) setError(err.message); else setCentros(data)
    })
  }, [supabase, esCentro])

  async function cargar() {
    let q = supabase.from('agresiones').select('*').order('fecha', { ascending: false }).order('creado_en', { ascending: false }).limit(2000)
    if (centroId) q = q.eq('centro_id', centroId)
    const { data, error: err } = await q
    if (err) {
      setError(/agresiones/.test(err.message) ? 'Falta ampliar la base de datos: ejecuta migracion_agresiones.sql en el SQL Editor de Supabase.' : err.message)
      setLista([])
    } else { setError(''); setLista(data) }
  }
  useEffect(() => { cargar() }, [centroId]) // eslint-disable-line react-hooks/exhaustive-deps

  const nombreCentro = useMemo(() => Object.fromEntries(centros.map((c) => [c.id, `${c.codigo} · ${c.nombre}`])), [centros])
  const resumen = useMemo(() => resumenAgresiones(lista ?? [], hoy), [lista, hoy])
  const anios = useMemo(() => [...new Set((lista ?? []).map((a) => a.fecha.slice(0, 4)))].sort().reverse(), [lista])
  const visibles = useMemo(() => filtrarAgresiones(lista ?? [], filtro, hoy), [lista, filtro, hoy])

  async function guardar() {
    const probs = validarAgresion(edicion, hoy)
    setErrores(probs)
    if (probs.length) return
    setGuardando(true)
    const fila = filaParaGuardar(edicion)
    const { error: err } = edicion.id
      ? await supabase.from('agresiones').update(fila).eq('id', edicion.id)
      : await supabase.from('agresiones').insert(fila)
    setGuardando(false)
    if (err) { setErrores([err.message]); return }
    setEdicion(null); cargar()
  }

  async function borrar(a) {
    if (!window.confirm(`¿Borrar la agresión del ${fechaES(a.fecha)}? No se puede deshacer.`)) return
    const { error: err } = await supabase.from('agresiones').delete().eq('id', a.id)
    if (err) setError(err.message); else cargar()
  }

  async function bajarExcel() {
    try {
      const nombre = centroId ? (nombreCentro[centroId] ?? 'centro') : 'Todos los centros'
      descargar(await excelAgresiones(nombre, visibles, nombreCentro, !centroId), `Agresiones_${nombre.replace(/[^A-Za-z0-9]+/g, '-')}_${hoy}.xlsx`)
    } catch (err) { setError('No se pudo generar el Excel: ' + err.message) }
  }

  function verPDF() {
    try {
      const nombre = esCentro ? `${centro.codigo} · ${centro.nombre}` : centroId ? (nombreCentro[centroId] ?? 'centro') : 'Todos los centros'
      imprimir(htmlAgresiones(nombre, visibles, nombreCentro, !esCentro && !centroId))
    } catch (err) { setError(err.message) }
  }

  if (vista === 'importar') {
    return <ImportarAgresiones supabase={supabase} centros={centroId ? centros.filter((c) => c.id === centroId) : centros}
      onTerminado={cargar} onVolver={() => { setVista('lista'); cargar() }} />
  }

  const ambito = esCentro ? 'en el centro' : centroId ? 'en este centro' : `en ${centros.length} ${centros.length === 1 ? 'centro' : 'centros'}`

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Registro de Agresiones</h2>
      {esCentro
        ? <p><b>{centro.codigo} · {centro.nombre}</b></p>
        : (
          <label style={{ ...campo, maxWidth: 420, marginBottom: 10 }}>
            <span>Centro</span>
            <select style={ancho} value={centroId} onChange={(e) => { setCentroId(e.target.value); setEdicion(null) }}>
              <option value="">Todos los centros</option>
              {centros.map((c) => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
            </select>
          </label>
        )}

      {error && <p style={aviso}>{error}</p>}

      <BarraAlta
        resumen={<span><b>{resumen.total}</b> {resumen.total === 1 ? 'agresión registrada' : 'agresiones registradas'} {ambito} · <b>{resumen.abiertas}</b> abiertas</span>}
        onManual={() => { setErrores([]); setEdicion(agresionNueva(centroId, hoy)) }} textoManual="Registrar agresión manualmente"
        deshabilitadoManual={!!edicion || (!esCentro && !centros.length)}
        onMasivo={() => { setEdicion(null); setVista('importar') }} textoMasivo="Subida masiva desde Excel"
      />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '10px 0' }}>
        <Tarjeta titulo="Agresiones en 12 meses" valor={resumen.ultimoAnio} nota={`${resumen.total} en total`} />
        <Tarjeta titulo="Con lesión (12 meses)" valor={resumen.conLesion} color="#d9600a" nota={`${resumen.conBaja} con baja`} />
        <Tarjeta titulo="Abiertas" valor={resumen.abiertas} color="#b8860b" />
        <Tarjeta titulo="Requieren seguimiento" valor={resumen.conAviso} color={resumen.conAviso ? '#c62828' : '#2e7d32'} />
      </div>

      {resumen.reiterados.length > 0 && (
        <p style={{ background: '#fde9c4', color: '#7a4b00', padding: 10, borderRadius: 6 }}>
          <b>Agresiones repetidas:</b> {resumen.reiterados.map((r) => `${r.ref} (${r.n} en 12 meses)`).join(', ')}. Conviene revisar el plan de intervención con esa persona.
        </p>
      )}
      {Object.keys(resumen.porPuesto).length > 0 && (
        <p style={{ fontSize: 14 }}>
          <b>Por tipo (12 meses):</b> {Object.entries(resumen.porTipo).map(([k, n]) => `${k}: ${n}`).join(' · ')}<br />
          <b>Por puesto (12 meses):</b> {Object.entries(resumen.porPuesto).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}: ${n}`).join(' · ')}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end', marginBottom: 10 }}>
        <label style={campo}><span>Año</span><select value={filtro.anio} onChange={(e) => setFiltro({ ...filtro, anio: e.target.value })}><option value="">Todos</option>{anios.map((a) => <option key={a} value={a}>{a}</option>)}</select></label>
        <label style={campo}><span>Tipo</span><select value={filtro.tipo} onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}><option value="">Todos</option>{Object.entries(TIPOS).map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
        <label style={campo}><span>Estado</span><select value={filtro.estado} onChange={(e) => setFiltro({ ...filtro, estado: e.target.value })}><option value="">Todos</option>{Object.entries(ESTADOS).map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', paddingBottom: 6 }}><input type="checkbox" checked={filtro.soloAvisos} onChange={(e) => setFiltro({ ...filtro, soloAvisos: e.target.checked })} /> Solo las que requieren seguimiento</label>
        {!esCentro && <button className="secundario" onClick={bajarExcel} disabled={!visibles.length}>Descargar Excel</button>}
        <button className="secundario" onClick={verPDF} disabled={!visibles.length}>Generar PDF</button>
      </div>

      {edicion && (
        <Formulario valor={edicion} onCambio={setEdicion} onGuardar={guardar} onCancelar={() => { setEdicion(null); setErrores([]) }}
          centros={centros} centroFijo={esCentro} guardando={guardando} errores={errores} />
      )}

      {!lista && <p>Cargando...</p>}
      {lista && visibles.length === 0 && !error && <p className="vacio">No hay agresiones registradas con ese filtro.</p>}
      {visibles.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: 8 }}>Fecha</th>
                {!centroId && <th style={{ padding: 8 }}>Centro</th>}
                <th style={{ padding: 8 }}>Puesto</th>
                <th style={{ padding: 8 }}>Tipo</th>
                <th style={{ padding: 8 }}>Consecuencias</th>
                <th style={{ padding: 8 }}>Estado</th>
                <th style={{ padding: 8 }}>Seguimiento</th>
                <th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {visibles.map((a) => {
                const av = avisosDe(a, hoy)
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #e5e5e5', verticalAlign: 'top' }}>
                    <td style={{ padding: 8, whiteSpace: 'nowrap' }}>{fechaES(a.fecha)}{a.hora ? ` ${a.hora.slice(0, 5)}` : ''}</td>
                    {!centroId && <td style={{ padding: 8 }}>{nombreCentro[a.centro_id] ?? ''}</td>}
                    <td style={{ padding: 8 }}>{a.puesto ?? ''}</td>
                    <td style={{ padding: 8 }}>{TIPOS[a.tipo]}</td>
                    <td style={{ padding: 8 }}><span style={{ color: COLOR_CONS[a.consecuencias], fontWeight: 700 }}>{CONSECUENCIAS[a.consecuencias]}</span></td>
                    <td style={{ padding: 8 }}>{ESTADOS[a.estado]}</td>
                    <td style={{ padding: 8, fontSize: 13, color: av.length ? '#c62828' : '#2e7d32' }}>{av.length ? av.join('; ') : 'Al día'}</td>
                    <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                      <button className="secundario" onClick={() => { setErrores([]); setEdicion({ ...agresionNueva(a.centro_id, hoy), ...a, hora: a.hora ? a.hora.slice(0, 5) : '' }) }}>Editar</button>
                      {!esCentro && <> <button className="secundario" onClick={() => borrar(a)} style={{ color: '#b00020' }}>Borrar</button></>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
