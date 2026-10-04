import { useEffect, useState } from 'react'
import PorCentro from './PorCentro'
import { ACCIONES } from './ereContenido'
import { aQuien } from './ereLogic'
import { calcularERE, descargarERE } from './ereDatos'
import { fechaES } from './planLogic'

// Evaluación de riesgos para embarazo, parto reciente y lactancia (ERE), desglosada por centro y, dentro, por puesto:
// cada puesto de cada centro se ve, se imprime y se descarga por separado.
// Se genera sola con los riesgos de la evaluación del puesto en cuanto el puesto se marca como evaluado.
// Uso: técnico <EvaluacionEmbarazo supabase={supabase} />   centro: <EvaluacionEmbarazo supabase={supabase} soloPdf /> (solo sus puestos y solo PDF).
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }

function Vista({ ere }) {
  return (
    <div>
      {!ere.completa && <p style={aviso}>Faltan los datos de exposición del puesto: {ere.faltan.join(', ')}. Hasta completarlos en la evaluación del puesto no se puede descargar la ERE.</p>}
      <p style={{ margin: '6px 0' }}><b>Conclusión:</b> {ere.conclusion}</p>
      {ere.tareas.length > 0 && <p style={{ margin: '6px 0' }}><b>Tareas afectadas:</b> {ere.tareas.join(', ')}</p>}
      {ere.entradas.map((e) => (
        <div key={e.id} style={{ borderLeft: `5px solid ${ACCIONES[e.accion].color}`, padding: '4px 10px', margin: '8px 0' }}>
          <strong>{e.r} · {e.condicion}</strong>
          <div style={{ fontSize: 13, color: ACCIONES[e.accion].color, fontWeight: 600 }}>
            {ACCIONES[e.accion].nombre}{e.semana ? ` · desde la semana ${e.semana}` : e.semanas ? ` · desde la semana ${e.semanas.unico} (${e.semanas.multiple} si es múltiple)` : ''}{e.nivel ? ` · nivel ${e.nivel}` : ''} · {aQuien(e)}
          </div>
          <ul style={{ margin: '4px 0 0', fontSize: 14 }}>{e.medidas.map((m, i) => <li key={i}>{m}</li>)}</ul>
          {e.exposicion && <div style={{ fontSize: 13, opacity: 0.8 }}>Exposición del puesto: {e.exposicion}</div>}
          {e.nivel && <div style={{ fontSize: 13, opacity: 0.8 }}>{e.confirmado ? `Nivel ${e.nivel} confirmado.` : `Nivel sin confirmar (propuesto: ${e.nivelPropuesto}).`} Registro de agresiones: {e.agresiones12m} a este puesto en 12 meses.</div>}
        </div>
      ))}
    </div>
  )
}

export default function EvaluacionEmbarazo({ supabase, soloPdf = false }) {
  const [evals, setEvals] = useState(null)
  const [abierta, setAbierta] = useState(null)
  const [trabajando, setTrabajando] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('evaluaciones').select('id,fecha,estado,centros(id,codigo,nombre),puestos(id,nombre)').eq('estado', 'cerrada').order('fecha', { ascending: false }).limit(2000)
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setEvals([]) }
        else setEvals(data.map((e) => ({ id: e.id, fecha: e.fecha, centro: e.centros, puesto: e.puestos })))
      })
  }, [supabase])

  async function ver(ev) {
    if (abierta?.id === ev.id) { setAbierta(null); return }
    setError(''); setTrabajando(`${ev.id}-ver`)
    try { setAbierta({ id: ev.id, ere: await calcularERE(supabase, ev) }) } catch (e) { setError(e.message) }
    setTrabajando('')
  }
  async function bajar(ev, formato) {
    setError(''); setTrabajando(`${ev.id}-${formato}`)
    try { await descargarERE(supabase, ev, formato) } catch (e) { setError('No se pudo generar la evaluación: ' + e.message) }
    setTrabajando('')
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Evaluación de Riesgos Embarazadas (ERE)</h2>
      <p style={{ opacity: 0.8, marginTop: 0, maxWidth: 820 }}>
        Evaluación para trabajadoras embarazadas, que han dado a luz o en periodo de lactancia. Se genera sola con los riesgos
        de la evaluación de cada puesto en cuanto el puesto está evaluado. Está organizada por centro y, dentro, por puesto: abre el centro
        y descarga o imprime solo la ERE del puesto que necesites. Solo aparecen los puestos marcados como evaluados.
      </p>
      {error && <p style={aviso}>{error}</p>}
      {!evals && <p>Cargando...</p>}
      {evals && (
        <PorCentro evals={evals} vacio="Todavía no hay puestos evaluados." fila={(e, { anterior }) => (
          <>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: anterior ? '6px 10px' : '9px 14px 9px 28px' }}>
              <span style={{ flex: '1 1 240px' }}><strong>{e.puesto?.nombre}</strong> <small style={{ opacity: 0.7 }}>· evaluado el {fechaES(e.fecha)}</small></span>
              <button className="secundario" disabled={!!trabajando} onClick={() => ver(e)}>{abierta?.id === e.id ? 'Ocultar' : trabajando === `${e.id}-ver` ? 'Calculando...' : 'Ver'}</button>
              <button className="secundario" disabled={!!trabajando} onClick={() => bajar(e, 'pdf')} title="Abre la ERE de este puesto para imprimirla o guardarla en PDF">
                {trabajando === `${e.id}-pdf` ? 'Generando...' : 'Imprimir / PDF'}
              </button>
              {!soloPdf && <button className="secundario" disabled={!!trabajando} onClick={() => bajar(e, 'word')}>{trabajando === `${e.id}-word` ? 'Generando...' : 'Word'}</button>}
            </div>
            {abierta?.id === e.id && <div style={{ padding: '4px 16px 14px 28px', borderTop: '1px dashed #d9dfe3' }}><Vista ere={abierta.ere} /></div>}
          </>
        )} />
      )}
    </div>
  )
}
