import { useEffect, useState } from 'react'
import PorCentro from './PorCentro'
import { epiDeEvaluacion, formacionDeEvaluacion } from './epiFormacionLogic'
import { descargar, htmlEPI, htmlFOR, imprimir, nombreArchivo, wordEPI, wordFOR } from './documentos'
import { fechaES } from './planLogic'

// Hojas de EPI y de formación, organizadas por centro y, dentro, por puesto. Se construyen con las medidas de la evaluación del puesto.
// Uso: <HojasEvaluacion supabase={supabase} modo="epis" />   o   modo="formacion"
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const TEXTOS = {
  epis: { titulo: 'Equipos de Protección Individual (EPIs)', sub: 'Por centro y, dentro de cada centro, por puesto: hoja de equipos de protección individual del puesto, con todas las medidas de EPI de su evaluación y el registro de entrega.', prefijo: 'EPI' },
  formacion: { titulo: 'Formación en Prevención de Riesgos (FORM)', sub: 'Por centro y, dentro de cada centro, por puesto: contenido formativo del puesto, con todas las medidas de formación de su evaluación y el registro de formación recibida.', prefijo: 'FORM' },
}

function VistaEpi({ datos }) {
  if (!datos.epis.length && !datos.otros.length) return <p style={{ opacity: 0.75 }}>La evaluación de este puesto no exige equipos de protección individual.</p>
  return (
    <>
      {datos.epis.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}><th style={{ padding: 6 }}>EPI</th><th style={{ padding: 6 }}>Norma</th><th style={{ padding: 6 }}>Qué hay que hacer</th><th style={{ padding: 6 }}>Riesgos</th></tr></thead>
            <tbody>
              {datos.epis.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid #e5e5e5', verticalAlign: 'top' }}>
                  <td style={{ padding: 6, fontWeight: 600 }}>{e.nombre}</td>
                  <td style={{ padding: 6 }}>{e.norma}</td>
                  <td style={{ padding: 6 }}>{e.proporcionar ? 'La empresa lo proporciona' : 'Uso obligatorio'}</td>
                  <td style={{ padding: 6 }}>{e.riesgos.map((r) => `${r.r} · ${r.nombre}`).join('; ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {datos.otros.length > 0 && (
        <>
          <h4 style={{ margin: '14px 0 4px' }}>Otras medidas que mencionan equipos de protección</h4>
          <ul style={{ margin: 0 }}>{datos.otros.map((o, i) => <li key={i}>{o.texto} <small style={{ opacity: 0.65 }}>({o.riesgos.map((r) => r.r).join(', ')})</small></li>)}</ul>
        </>
      )}
    </>
  )
}

function VistaFor({ grupos }) {
  if (!grupos.length) return <p style={{ opacity: 0.75 }}>La evaluación de este puesto no incluye medidas de formación.</p>
  return grupos.map((g) => (
    <div key={g.r} style={{ marginBottom: 10 }}>
      <strong>{g.r} · {g.riesgo}</strong>
      <ul style={{ margin: '4px 0 0' }}>{g.temas.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  ))
}

// soloPdf: el usuario de centro solo descarga en PDF.
export default function HojasEvaluacion({ supabase, modo, soloPdf = false }) {
  const T = TEXTOS[modo]
  const [evals, setEvals] = useState(null)
  const [abierta, setAbierta] = useState(null)       // { id, datos }
  const [trabajando, setTrabajando] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('evaluaciones').select('id,fecha,estado,centros(id,codigo,nombre),puestos(id,nombre)').in('estado', ['borrador', 'cerrada']).order('fecha', { ascending: false }).limit(1000)
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setEvals([]) }
        else setEvals(data.map((e) => ({ id: e.id, fecha: e.fecha, estado: e.estado, centro: e.centros, puesto: e.puestos })))
      })
  }, [supabase])

  async function calcular(ev) {
    const { data, error: err } = await supabase.from('evaluacion_riesgos').select('riesgo_id,riesgo_nombre,medidas').eq('evaluacion_id', ev.id)
    if (err) throw err
    const filas = data.map((r) => ({ ...r, medidas: r.medidas ?? [] }))
    return modo === 'epis' ? epiDeEvaluacion(filas) : formacionDeEvaluacion(filas)
  }
  async function ver(ev) {
    if (abierta?.id === ev.id) { setAbierta(null); return }
    setError(''); setTrabajando(`${ev.id}-ver`)
    try { setAbierta({ id: ev.id, datos: await calcular(ev) }) } catch (err) { setError(err.message) }
    setTrabajando('')
  }
  async function generar(ev, formato) {
    setError(''); setTrabajando(`${ev.id}-${formato}`)
    try {
      const datos = await calcular(ev)
      if (formato === 'word') descargar(await (modo === 'epis' ? wordEPI : wordFOR)(ev, datos), nombreArchivo(T.prefijo, ev, 'docx'))
      else imprimir((modo === 'epis' ? htmlEPI : htmlFOR)(ev, datos))
    } catch (err) { setError('No se pudo generar el documento: ' + err.message) }
    setTrabajando('')
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>{T.titulo}</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>{T.sub}</p>
      {error && <p style={aviso}>{error}</p>}
      {!evals && <p>Cargando...</p>}
      {evals && (
        <PorCentro evals={evals} vacio="No hay evaluaciones." fila={(e, { anterior }) => (
          <>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: anterior ? '6px 10px' : '9px 14px 9px 28px' }}>
              <span style={{ flex: '1 1 260px' }}><strong>{e.puesto?.nombre}</strong> <small style={{ opacity: 0.7 }}>· {fechaES(e.fecha)} · {e.estado === 'cerrada' ? 'Evaluado' : 'En curso'}</small></span>
              <button className="secundario" disabled={!!trabajando} onClick={() => ver(e)}>{abierta?.id === e.id ? 'Ocultar' : trabajando === `${e.id}-ver` ? 'Calculando...' : 'Ver'}</button>
              {!soloPdf && <button className="secundario" disabled={!!trabajando} onClick={() => generar(e, 'word')}>{trabajando === `${e.id}-word` ? 'Generando...' : 'Word'}</button>}
              <button className="secundario" disabled={!!trabajando} onClick={() => generar(e, 'pdf')}>{trabajando === `${e.id}-pdf` ? 'Generando...' : 'PDF'}</button>
            </div>
            {abierta?.id === e.id && (
              <div style={{ padding: '4px 16px 14px 28px', borderTop: '1px dashed #d9dfe3' }}>
                {modo === 'epis' ? <VistaEpi datos={abierta.datos} /> : <VistaFor grupos={abierta.datos} />}
              </div>
            )}
          </>
        )} />
      )}
    </div>
  )
}
