import { useEffect, useMemo, useState } from 'react'
import EvaluacionER from './EvaluacionER'
import BarraAlta from './BarraAlta'
import {
  armarFilasER, filaDesdeMatriz, fusionarFilas, nuevoId, ordenarFilas,
} from './evalLogic'
import { filasCheckDePuesto, progresoCentro, puestosAfectadosPorCambio, puestosQueFaltan, problemasCierre } from './evalCentroLogic'
import { BarraProgreso, CheckCentro, NuevaEvaluacionCentro } from './EvaluacionCentro'
import VisitaCentro from './VisitaCentro'
import { METODOLOGIA_VERSION } from './metodologiaContenido'
import PapCentro from './PapCentro'
import { sincronizarPAPCentro } from './papCentroDatos'
import { descargarERE } from './ereDatos'

// Uso: <Evaluaciones supabase={supabase} onActualizar={...} />
// Flujo: lista de evaluaciones de centro -> nueva (elegir centro) -> lista de comprobación del centro
//        -> panel del centro con sus puestos -> evaluar cada puesto (creador de puesto si hace falta) -> ER
// La evaluación del centro se cierra cuando todos sus puestos están evaluados o marcados como «no aplica».

const EMBED = 'id,riesgo_id,condicion,p,c,riesgos(nombre),matriz_medidas(medida_id,medidas(texto))'
const filaCheck = {
  display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  gap: 12, width: '100%', textAlign: 'left', fontSize: 14, cursor: 'pointer',
}
const casilla = { width: 'auto', flex: 'none', margin: 0 }
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }

async function cargarFilasPuesto(supabase, puestoId, origen, usarIds = false) {
  const { data, error } = await supabase.from('matriz_puestos').select(EMBED).eq('puesto_id', puestoId)
  if (error) throw error
  return data.map((r) => filaDesdeMatriz(r, origen, usarIds))
}

async function cargarCatalogos(supabase) {
  const [m, r] = await Promise.all([
    supabase.from('medidas').select('id,riesgo_id,texto').order('id'),
    supabase.from('riesgos').select('id,nombre').order('id'),
  ])
  if (m.error || r.error) throw (m.error || r.error)
  return { catalogo: m.data, riesgos: r.data }
}

const filaBD = (f, evaluacionId) => ({
  id: f.id, evaluacion_id: evaluacionId, riesgo_id: f.riesgo_id, riesgo_nombre: f.riesgo_nombre,
  condicion: f.condicion, p: f.p, c: f.c, medidas: f.medidas, origen: f.origen,
})

// ---------------------------------------------------------------------
function CreadorPuesto({ supabase, puesto, onCreado, onCancelar }) {
  const [candidatos, setCandidatos] = useState([])
  const [sel, setSel] = useState({})
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('matriz_puestos').select('puesto_id'),
      supabase.from('puestos').select('id,nombre').neq('nombre', 'TODOS').neq('id', puesto.id).order('nombre'),
    ]).then(([m, p]) => {
      if (m.error || p.error) { setError((m.error || p.error).message); return }
      const cuenta = new Map()
      m.data.forEach((r) => cuenta.set(r.puesto_id, (cuenta.get(r.puesto_id) ?? 0) + 1))
      setCandidatos(p.data.filter((x) => cuenta.has(x.id)).map((x) => ({ ...x, riesgos: cuenta.get(x.id) })))
    })
  }, [supabase, puesto])

  async function crear() {
    setError('')
    const ids = Object.keys(sel).filter((k) => sel[k])
    if (!ids.length) { setError('Elige al menos un puesto similar.'); return }
    setTrabajando(true)
    try {
      const todas = []
      for (const id of ids) todas.push(...await cargarFilasPuesto(supabase, id, 'puesto', true))
      const fusion = ordenarFilas(fusionarFilas(todas))
      if (!fusion.length) throw new Error('Los puestos elegidos no tienen riesgos en la matriz.')

      const filasMatriz = fusion.map((f) => ({
        id: nuevoId(), puesto_id: puesto.id, riesgo_id: f.riesgo_id, condicion: f.condicion, p: f.p, c: f.c,
      }))
      for (let i = 0; i < filasMatriz.length; i += 200) {
        const { error: err } = await supabase.from('matriz_puestos').insert(filasMatriz.slice(i, i + 200))
        if (err) throw err
      }
      const vinculos = []
      fusion.forEach((f, i) => f.medidas.forEach((medida_id) => vinculos.push({ matriz_id: filasMatriz[i].id, medida_id })))
      for (let i = 0; i < vinculos.length; i += 400) {
        const { error: err } = await supabase.from('matriz_medidas').insert(vinculos.slice(i, i + 400))
        if (err) throw err
      }
      onCreado()
    } catch (err) {
      setError(err.message)
      setTrabajando(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, textAlign: 'left' }}>
      <h2>Creador de puesto</h2>
      <p style={{ opacity: 0.7 }}>El puesto no está en la matriz</p>
      <p>
        <b>{puesto.nombre}</b> todavía no tiene riesgos en la matriz. Elige los puestos que se le parecen:
        se juntarán sus riesgos (sin duplicados, con la P y C más altas) y quedarán guardados como
        matriz del puesto.
      </p>
      {error && <p style={aviso}>{error}</p>}
      <div>
        {candidatos.map((c) => (
          <div key={c.id} style={{ borderBottom: '1px solid #e5e5e5', padding: '6px 0' }}>
            <label style={filaCheck}>
              <span>{c.nombre} <span style={{ opacity: 0.6 }}>({c.riesgos} riesgos)</span></span>
              <input type="checkbox" style={casilla} checked={!!sel[c.id]} onChange={(e) => setSel({ ...sel, [c.id]: e.target.checked })} />
            </label>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={crear} disabled={trabajando} style={{ padding: '10px 18px', fontWeight: 600 }}>
          {trabajando ? 'Creando...' : 'Crear puesto y continuar'}
        </button>
        <button className="secundario" onClick={onCancelar} disabled={trabajando}>Cancelar</button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
const SEL_EVC = '*,centros(id,codigo,nombre)'
const SEL_EVAL = '*,puestos(id,nombre)'
const hoyISO = () => new Date().toISOString().slice(0, 10)
const migracion = (m) => (/evaluaciones_centro|evaluacion_centro_id|motivo_no_aplica/.test(m ?? '')
  ? 'Falta ampliar la base de datos: ejecuta migracion_evaluacion_centro.sql en el SQL Editor de Supabase.' : m)

export default function Evaluaciones({ supabase, onActualizar }) {
  const [vista, setVista] = useState('lista') // lista | nueva | centro | check | creador | er | pap
  const [lista, setLista] = useState([])
  const [cargandoLista, setCargandoLista] = useState(true)
  const [evc, setEvc] = useState(null)          // evaluación del centro abierta
  const [evals, setEvals] = useState([])        // sus puestos
  const [faltan, setFaltan] = useState([])      // puestos del centro que no están en la evaluación
  const [checkCtx, setCheckCtx] = useState(null)
  const [puestoCtx, setPuestoCtx] = useState(null)
  const [er, setEr] = useState(null)
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function cargarLista() {
    setCargandoLista(true)
    const { data, error: err } = await supabase.from('evaluaciones_centro')
      .select(`${SEL_EVC},evaluaciones(id,estado)`).order('created_at', { ascending: false })
    if (err) setError(migracion(err.message))
    else { setLista(data); setError('') }
    setCargandoLista(false)
  }
  useEffect(() => { cargarLista() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const enCurso = useMemo(() => Object.fromEntries(lista.filter((e) => e.estado === 'en_curso').map((e) => [e.centros?.id, e.id])), [lista])
  // Revisión anual: la última evaluación cerrada de cada centro sin otra en curso vence a los 12 meses de su cierre.
  const revision = useMemo(() => {
    const m = {}
    const hoy = hoyISO()
    ;[...lista].filter((e) => e.estado === 'cerrada' && e.fecha_cierre).sort((a, b) => b.fecha_cierre.localeCompare(a.fecha_cierre)).forEach((e) => {
      const cid = e.centros?.id
      if (m[cid] !== undefined || enCurso[cid]) { if (m[cid] === undefined) m[cid] = null; return }
      const v = new Date(`${e.fecha_cierre}T00:00:00Z`); v.setUTCFullYear(v.getUTCFullYear() + 1)
      const vence = v.toISOString().slice(0, 10)
      const dias = Math.round((Date.parse(vence) - Date.parse(hoy)) / 86400000)
      m[cid] = { evc: e.id, vence, dias }
    })
    return m
  }, [lista, enCurso])
  const yaEvaluados = useMemo(() => new Set(lista.filter((e) => e.estado === 'cerrada').map((e) => e.centros?.id)), [lista])
  const aLista = () => { setVista('lista'); setEvc(null); setEr(null); setError(''); setMensaje(''); cargarLista() }

  // Ejecuta una acción mostrando «trabajando» y recogiendo el error.
  async function con(accion) {
    setError(''); setTrabajando(true)
    try { await accion() } catch (e) { setError(migracion(e.message)) } finally { setTrabajando(false) }
  }

  async function abrirCentro(id, msg = '') {
    const [a, b] = await Promise.all([
      supabase.from('evaluaciones_centro').select(SEL_EVC).eq('id', id).single(),
      supabase.from('evaluaciones').select(SEL_EVAL).eq('evaluacion_centro_id', id),
    ])
    if (a.error || b.error) throw (a.error || b.error)
    let centro = a.data
    const { data: cp, error: e3 } = await supabase.from('centro_puestos').select('puesto_id').eq('centro_id', centro.centros.id)
    if (e3) throw e3
    // Si se reabrió un puesto o hay puestos sin hacer, la evaluación del centro vuelve a «en curso».
    if (centro.estado === 'cerrada' && problemasCierre(centro, b.data).length) {
      const { error: e4 } = await supabase.from('evaluaciones_centro').update({ estado: 'en_curso', fecha_cierre: null }).eq('id', id)
      if (e4) throw e4
      centro = { ...centro, estado: 'en_curso', fecha_cierre: null }
      msg = msg || 'La evaluación del centro vuelve a estar en curso porque hay puestos sin terminar.'
    }
    setEvc(centro); setEvals(b.data); setFaltan(puestosQueFaltan(cp.map((r) => r.puesto_id), b.data))
    setMensaje(msg); setVista('centro')
  }

  async function prepararCheck(centro) {
    const [q, cats] = await Promise.all([
      supabase.from('check_preguntas').select('id,riesgo_id,subtipo,pregunta,orden').order('orden'),
      cargarCatalogos(supabase),
    ])
    if (q.error) throw q.error
    setCheckCtx({ preguntas: q.data, ...cats })
    if (centro) setEvc(centro)
    setVista('check')
  }

  // Nueva evaluación: crea la del centro y una evaluación pendiente por cada puesto marcado.
  // Nueva versión: copia la última evaluación cerrada del centro (riesgos y datos de exposición de cada puesto,
  // lista de comprobación y PAP con sus estados). Los puestos nuevos entran como pendientes.
  async function copiarAnterior(centro, nueva, puestoIds) {
    const { data: previa } = await supabase.from('evaluaciones_centro').select('*').eq('centro_id', centro.id).eq('estado', 'cerrada')
      .order('fecha_cierre', { ascending: false }).limit(1).maybeSingle()
    if (!previa) return null
    const { data: antes, error: e1 } = await supabase.from('evaluaciones').select('*').eq('evaluacion_centro_id', previa.id)
    if (e1) throw e1
    const porPuesto = new Map(antes.map((e) => [String(e.puesto_id), e]))
    const hoy = hoyISO()
    const filas = puestoIds.map((puesto_id) => {
      const a = porPuesto.get(String(puesto_id))
      const base = { centro_id: centro.id, puesto_id, evaluacion_centro_id: nueva.id }
      if (!a) return { ...base, estado: 'pendiente' }
      if (a.estado === 'no_aplica') return { ...base, estado: 'no_aplica', motivo_no_aplica: a.motivo_no_aplica }
      return { ...base, estado: ['borrador', 'cerrada'].includes(a.estado) ? 'borrador' : 'pendiente', fecha: hoy, ...(a.exposicion ? { exposicion: a.exposicion } : {}) }
    })
    const { data: creadas, error: e2 } = await supabase.from('evaluaciones').insert(filas).select(SEL_EVAL)
    if (e2) throw e2
    for (const ev of creadas.filter((x) => x.estado === 'borrador')) {
      const a = porPuesto.get(String(ev.puesto_id))
      const { data: rs, error: e3 } = await supabase.from('evaluacion_riesgos').select('riesgo_id,riesgo_nombre,condicion,p,c,medidas,origen').eq('evaluacion_id', a.id)
      if (e3) throw e3
      for (let i = 0; i < rs.length; i += 200) {
        const { error: e4 } = await supabase.from('evaluacion_riesgos').insert(rs.slice(i, i + 200).map((r) => ({ ...r, id: nuevoId(), evaluacion_id: ev.id })))
        if (e4) throw e4
      }
    }
    await supabase.from('evaluaciones_centro').update({ check_respuestas: previa.check_respuestas ?? [], check_hecho: !!previa.check_hecho }).eq('id', nueva.id)
    const pap = await supabase.from('pap_acciones').select('*').eq('evaluacion_centro_id', previa.id)
    if (!pap.error && pap.data?.length) {
      const copia = pap.data.map(({ id, created_at, updated_at, ...x }) => ({ ...x, evaluacion_centro_id: nueva.id }))   // eslint-disable-line no-unused-vars
      for (let i = 0; i < copia.length; i += 200) await supabase.from('pap_acciones').insert(copia.slice(i, i + 200))
    }
    return creadas
  }

  const crearCentro = (centro, motivo, copiar = true) => con(async () => {
    if (enCurso[centro.id]) { await abrirCentro(enCurso[centro.id]); return }
    if (yaEvaluados.has(centro.id) && !(motivo ?? '').trim()) throw new Error('Indica el motivo de la nueva evaluación.')
    const { data: cp, error: e1 } = await supabase.from('centro_puestos').select('puesto_id').eq('centro_id', centro.id)
    if (e1) throw e1
    if (!cp.length) throw new Error('Este centro no tiene puestos marcados. Márcalos en «Datos de los centros» y vuelve a crear la evaluación.')
    const { data: nueva, error: e2 } = await supabase.from('evaluaciones_centro')
      .insert({ centro_id: centro.id, version_metodologia: METODOLOGIA_VERSION, motivo: (motivo ?? '').trim() || null }).select(SEL_EVC).single()
    if (e2) throw e2
    const puestoIds = [...new Set(cp.map((r) => r.puesto_id))]
    if (copiar && yaEvaluados.has(centro.id)) {
      try {
        const creadas = await copiarAnterior(centro, nueva, puestoIds)
        if (creadas) { await abrirCentro(nueva.id, 'Nueva versión creada a partir de la última evaluación cerrada: revisa cada puesto y vuelve a marcarlo como evaluado.'); return }
      } catch (e) { await supabase.from('evaluaciones_centro').delete().eq('id', nueva.id); throw e }
    }
    const filas = puestoIds.map((puesto_id) => ({ centro_id: centro.id, puesto_id, estado: 'pendiente', evaluacion_centro_id: nueva.id }))
    const { data: creadas, error: e3 } = await supabase.from('evaluaciones').insert(filas).select(SEL_EVAL)
    if (e3) { await supabase.from('evaluaciones_centro').delete().eq('id', nueva.id); throw e3 }
    setEvals(creadas); setFaltan([])
    await prepararCheck(nueva)
  })

  const guardarCheckCentro = (respuestas) => con(async () => {
    const afectados = puestosAfectadosPorCambio(evc.check_respuestas ?? [], respuestas, evals)
    const { error: err } = await supabase.from('evaluaciones_centro').update({ check_respuestas: respuestas, check_hecho: true }).eq('id', evc.id)
    if (err) throw err
    await abrirCentro(evc.id, afectados.length
      ? `Lista de comprobación guardada. Revisa a mano estos puestos ya empezados, porque el cambio no les llega solo: ${afectados.map((e) => e.puestos?.nombre).join(', ')}.`
      : 'Lista de comprobación guardada.')
  })

  async function abrirER(ev, filas, cats) {
    setEr({ evaluacion: { id: ev.id, fecha: ev.fecha, estado: ev.estado, centro: evc.centros, puesto: ev.puestos, exposicion: ev.exposicion ?? {} }, filas, ...cats })
    setVista('er')
  }

  async function empezarPuesto(ev) {
    const { data: todosP, error: e0 } = await supabase.from('puestos').select('id').eq('nombre', 'TODOS').maybeSingle()
    if (e0) throw e0
    const [filasPuesto, filasTodos, cats] = await Promise.all([
      cargarFilasPuesto(supabase, ev.puesto_id, 'puesto'),
      todosP ? cargarFilasPuesto(supabase, todosP.id, 'todos') : Promise.resolve([]),
      cargarCatalogos(supabase),
    ])
    const filas = armarFilasER({ puesto: filasPuesto, todos: filasTodos, check: filasCheckDePuesto(evc.check_respuestas, ev.puesto_id) })
    const filasDB = filas.map((f) => filaBD(f, ev.id))
    try {
      for (let i = 0; i < filasDB.length; i += 200) {
        const { error: e2 } = await supabase.from('evaluacion_riesgos').insert(filasDB.slice(i, i + 200))
        if (e2) throw e2
      }
      const { error: e3 } = await supabase.from('evaluaciones').update({ estado: 'borrador', fecha: hoyISO() }).eq('id', ev.id)
      if (e3) throw e3
    } catch (e) {
      await supabase.from('evaluacion_riesgos').delete().eq('evaluacion_id', ev.id)
      throw e
    }
    await abrirER({ ...ev, estado: 'borrador', fecha: hoyISO() }, filas, cats)
  }

  const evaluarPuesto = (ev) => con(async () => {
    if (ev.estado === 'pendiente') {
      const { count, error: err } = await supabase.from('matriz_puestos').select('id', { count: 'exact', head: true }).eq('puesto_id', ev.puesto_id)
      if (err) throw err
      if (!count) { setPuestoCtx(ev); setVista('creador'); return }
      await empezarPuesto(ev)
      return
    }
    const [rows, cats] = await Promise.all([
      supabase.from('evaluacion_riesgos').select('*').eq('evaluacion_id', ev.id),
      cargarCatalogos(supabase),
    ])
    if (rows.error) throw rows.error
    const filas = ordenarFilas(rows.data.map((r) => ({
      id: r.id, riesgo_id: r.riesgo_id, riesgo_nombre: r.riesgo_nombre, condicion: r.condicion,
      p: r.p, c: r.c, medidas: r.medidas ?? [], origen: r.origen,
    })))
    await abrirER(ev, filas, cats)
  })

  const cambiarPuesto = (ev, cambios, msg) => con(async () => {
    const { error: err } = await supabase.from('evaluaciones').update(cambios).eq('id', ev.id)
    if (err) throw err
    await abrirCentro(evc.id, msg)
  })

  const anadirFaltan = () => con(async () => {
    const filas = faltan.map((puesto_id) => ({ centro_id: evc.centros.id, puesto_id, estado: 'pendiente', evaluacion_centro_id: evc.id }))
    const { error: err } = await supabase.from('evaluaciones').insert(filas)
    if (err) throw err
    await abrirCentro(evc.id, `${filas.length} ${filas.length === 1 ? 'puesto añadido' : 'puestos añadidos'} como pendientes.`)
  })

  const cerrarCentro = (cerrar) => con(async () => {
    if (cerrar && problemasCierre(evc, evals).length) throw new Error('Todavía hay puestos sin terminar.')
    const { error: err } = await supabase.from('evaluaciones_centro')
      .update(cerrar ? { estado: 'cerrada', fecha_cierre: hoyISO() } : { estado: 'en_curso', fecha_cierre: null }).eq('id', evc.id)
    if (err) throw err
    setEvc({ ...evc, estado: cerrar ? 'cerrada' : 'en_curso', fecha_cierre: cerrar ? hoyISO() : null })
    let msg = cerrar ? 'Evaluación del centro cerrada.' : 'Evaluación del centro reabierta.'
    msg += await registrarCambio(cerrar)
    if (cerrar) {
      try {
        const r = await sincronizarPAPCentro(supabase, evc)
        msg += ` PAP del centro preparado (${r.nuevas} acciones nuevas, ${r.cambiadas} actualizadas).`
      } catch (e) { msg += ` No se ha podido preparar el PAP: ${e.message}` }
    }
    setMensaje(msg)
  })

  // Control de cambios: al cerrar se registra la versión (1 la primera del centro); al reabrir se retira el registro.
  async function registrarCambio(cerrar) {
    try {
      if (!cerrar) {
        const { error: err } = await supabase.from('control_cambios').delete().eq('evaluacion_centro_id', evc.id)
        if (err) throw err
        return ' Se ha retirado del control de cambios hasta que se vuelva a cerrar.'
      }
      const { data: previos, error: e1 } = await supabase.from('control_cambios').select('version,evaluacion_centro_id').eq('centro_id', evc.centros.id)
      if (e1) throw e1
      const propio = previos.find((x) => x.evaluacion_centro_id === evc.id)
      const version = propio?.version ?? (previos.reduce((m, x) => Math.max(m, x.version), 0) + 1)
      const fila = {
        centro_id: evc.centros.id, evaluacion_centro_id: evc.id, version,
        motivo: (evc.motivo ?? '').trim() || (version === 1 ? 'Evaluación inicial' : 'Nueva evaluación'),
        fecha_inicio: evc.fecha, fecha_cierre: hoyISO(), version_metodologia: evc.version_metodologia,
        puestos: evals.filter((x) => x.estado === 'cerrada').length,
      }
      const { error: e2 } = await supabase.from('control_cambios').upsert(fila, { onConflict: 'evaluacion_centro_id' })
      if (e2) throw e2
      return ` Registrada en el control de cambios como versión ${version}.`
    } catch (e) {
      return /control_cambios/.test(e.message) ? ' No se ha podido registrar en el control de cambios: falta ejecutar migracion_cambios_equipos.sql.' : ` No se ha podido registrar en el control de cambios: ${e.message}`
    }
  }

  async function borrar(e) {
    const n = e.evaluaciones?.length ?? 0
    if (!window.confirm(`¿Borrar la evaluación de ${e.centros?.nombre} con sus ${n} puestos y todos sus riesgos y acciones del PAP? No se puede deshacer.`)) return
    const { error: err } = await supabase.from('evaluaciones_centro').delete().eq('id', e.id)
    if (err) setError(err.message); else cargarLista()
  }

  // ---------- vistas ----------
  const errorBox = error && <p style={aviso}>{error}</p>

  if (vista === 'nueva') {
    return <>{errorBox}<NuevaEvaluacionCentro supabase={supabase} enCurso={enCurso} yaEvaluados={yaEvaluados} onContinuar={crearCentro} onVolver={aLista} trabajando={trabajando} /></>
  }
  if (vista === 'check' && evc && checkCtx) {
    return (
      <>{errorBox}
        <CheckCentro evc={evc} evals={evals} {...checkCtx} trabajando={trabajando}
          onGuardar={guardarCheckCentro} onVolver={() => con(() => abrirCentro(evc.id))} />
      </>
    )
  }
  if (vista === 'creador' && puestoCtx) {
    return (
      <>{errorBox}
        <CreadorPuesto supabase={supabase} puesto={puestoCtx.puestos} onCancelar={() => con(() => abrirCentro(evc.id))}
          onCreado={() => con(() => empezarPuesto(puestoCtx))} />
      </>
    )
  }
  if (vista === 'er' && er) {
    return (
      <EvaluacionER supabase={supabase} evaluacion={er.evaluacion} filasIniciales={er.filas}
        catalogo={er.catalogo} riesgos={er.riesgos} onVolver={() => con(() => abrirCentro(evc.id))} textoVolver="Volver al centro" />
    )
  }
  if (vista === 'pap' && evc) {
    return <PapCentro supabase={supabase} evc={{ id: evc.id, fecha: evc.fecha, centro: evc.centros }} onVolver={() => con(() => abrirCentro(evc.id))} />
  }
  if (vista === 'centro' && evc) {
    return (
      <VisitaCentro onEvc={setEvc} onRecargar={(msg) => con(() => abrirCentro(evc.id, msg))} supabase={supabase} evc={evc} evals={evals} faltan={faltan} mensaje={mensaje} error={error} trabajando={trabajando}
        onCheck={() => con(() => prepararCheck())}
        onEvaluar={evaluarPuesto}
        onNoAplica={(ev, motivo) => cambiarPuesto(ev, { estado: 'no_aplica', motivo_no_aplica: motivo.trim() }, `${ev.puestos?.nombre}: no aplica.`)}
        onPendiente={(ev) => cambiarPuesto(ev, { estado: 'pendiente', motivo_no_aplica: null }, `${ev.puestos?.nombre} vuelve a pendiente.`)}
        onAnadirFaltan={anadirFaltan}
        onPap={() => { setError(''); setVista('pap') }}
        onERE={(ev) => con(() => descargarERE(supabase, { id: ev.id, fecha: ev.fecha, centro: evc.centros, puesto: ev.puestos }, 'word'))}
        onCerrar={() => cerrarCentro(true)} onReabrir={() => cerrarCentro(false)} onVolver={aLista} />
    )
  }

  const cerradas = lista.filter((e) => e.estado === 'cerrada').length
  const vencidas = Object.values(revision).filter((r) => r && r.dias < 0).length
  const proximas = Object.values(revision).filter((r) => r && r.dias >= 0 && r.dias <= 30).length
  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Evaluación de Riesgos</h2>
      <BarraAlta
        resumen={<span><b>{lista.length}</b> {lista.length === 1 ? 'evaluación de centro' : 'evaluaciones de centro'} · <b>{cerradas}</b> cerradas · <b>{lista.length - cerradas}</b> en curso</span>}
        onManual={() => { setError(''); setVista('nueva') }} textoManual="Nueva evaluación de centro"
        onMasivo={onActualizar} textoMasivo="Importar medidas, matriz y check"
      />
      {errorBox}
      {(vencidas > 0 || proximas > 0) && (
        <p style={{ background: '#fde9c4', color: '#7a4b00', padding: 10, borderRadius: 6 }}>
          Revisión anual: {vencidas > 0 && <b>{vencidas} {vencidas === 1 ? 'centro con la evaluación vencida' : 'centros con la evaluación vencida'}</b>}{vencidas > 0 && proximas > 0 && ' · '}{proximas > 0 && `${proximas} ${proximas === 1 ? 'vence' : 'vencen'} en los próximos 30 días`}. Crea una nueva evaluación del centro para revisarla.
        </p>
      )}
      {cargandoLista && <p>Cargando...</p>}
      {!cargandoLista && lista.length === 0 && !error && <p className="vacio">Todavía no hay evaluaciones. Crea la primera con «Nueva evaluación de centro».</p>}
      {!cargandoLista && lista.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th style={{ padding: 8 }}>Centro</th>
                <th style={{ padding: 8 }}>Iniciada</th>
                <th style={{ padding: 8 }}>Avance</th>
                <th style={{ padding: 8 }}>Estado</th>
                <th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {lista.map((e) => {
                const prog = progresoCentro(e.evaluaciones ?? [])
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: 8 }}>{e.centros?.codigo} · {e.centros?.nombre}</td>
                    <td style={{ padding: 8, whiteSpace: 'nowrap' }}>{e.fecha}</td>
                    <td style={{ padding: 8 }}><BarraProgreso evals={e.evaluaciones ?? []} /></td>
                    <td style={{ padding: 8 }}>
                      {e.estado === 'cerrada' ? `Cerrada (${e.fecha_cierre ?? ''})` : !e.check_hecho ? 'En curso · falta la lista de comprobación' : prog.completo ? 'En curso · lista para cerrar' : 'En curso'}
                      {revision[e.centros?.id]?.evc === e.id && revision[e.centros.id].dias <= 30 && (
                        <div style={{ fontSize: 13, fontWeight: 700, color: revision[e.centros.id].dias < 0 ? '#c62828' : '#ef6c00' }}>
                          {revision[e.centros.id].dias < 0 ? `Revisión anual vencida desde el ${revision[e.centros.id].vence}` : revision[e.centros.id].dias === 0 ? 'La revisión anual vence hoy' : `Revisión anual en ${revision[e.centros.id].dias} días`}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                      <button className="secundario" onClick={() => con(() => abrirCentro(e.id))} disabled={trabajando}>Abrir</button>{' '}
                      <button className="secundario" onClick={() => borrar(e)} disabled={trabajando} style={{ color: '#b00020' }}>Borrar</button>
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
