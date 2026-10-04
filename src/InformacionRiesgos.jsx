import { useEffect, useState } from 'react'
import PorCentro from './PorCentro'
import { ordenarFilas } from './evalLogic'
import { descargar, htmlIR, imprimir, nombreArchivo, wordIR } from './documentos'
import { fechaES } from './planLogic'

// Información de riesgos (IR), organizada por centro y, dentro, por puesto, para descargarla en Word o PDF sin entrar en cada evaluación.
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }

// soloPdf: el usuario de centro solo descarga en PDF.
export default function InformacionRiesgos({ supabase, soloPdf = false }) {
  const [evals, setEvals] = useState(null)
  const [trabajando, setTrabajando] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('evaluaciones').select('id,fecha,estado,centros(id,codigo,nombre),puestos(id,nombre)').in('estado', ['borrador', 'cerrada']).order('fecha', { ascending: false }).limit(1000)
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setEvals([]) }
        else setEvals(data.map((e) => ({ id: e.id, fecha: e.fecha, estado: e.estado, centro: e.centros, puesto: e.puestos })))
      })
  }, [supabase])

  async function filasDe(ev) {
    const { data, error: err } = await supabase.from('evaluacion_riesgos')
      .select('id,riesgo_id,riesgo_nombre,condicion,p,c,medidas,origen').eq('evaluacion_id', ev.id)
    if (err) throw err
    return ordenarFilas(data.map((r) => ({ ...r, medidas: r.medidas ?? [] })))
  }
  async function generar(ev, formato) {
    setError(''); setTrabajando(`${ev.id}-${formato}`)
    try {
      const filas = await filasDe(ev)
      if (formato === 'word') descargar(await wordIR(ev, filas), nombreArchivo('IR', ev, 'docx'))
      else imprimir(htmlIR(ev, filas))
    } catch (err) { setError('No se pudo generar el documento: ' + err.message) }
    setTrabajando('')
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <h2>Información de Riesgos (IR)</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Por centro y, dentro de cada centro, por puesto: documento de información de riesgos del puesto, en {soloPdf ? 'PDF' : 'Word o PDF'}.</p>
      {error && <p style={aviso}>{error}</p>}
      {!evals && <p>Cargando...</p>}
      {evals && (
        <PorCentro evals={evals} vacio="No hay evaluaciones." fila={(e, { anterior }) => (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: anterior ? '6px 10px' : '9px 14px 9px 28px' }}>
            <span style={{ flex: '1 1 260px' }}><strong>{e.puesto?.nombre}</strong> <small style={{ opacity: 0.7 }}>· {fechaES(e.fecha)} · {e.estado === 'cerrada' ? 'Evaluado' : 'En curso'}</small></span>
            {!soloPdf && <button className="secundario" disabled={!!trabajando} onClick={() => generar(e, 'word')}>{trabajando === `${e.id}-word` ? 'Generando...' : 'Word'}</button>}
            <button className="secundario" disabled={!!trabajando} onClick={() => generar(e, 'pdf')}>{trabajando === `${e.id}-pdf` ? 'Generando...' : 'PDF'}</button>
          </div>
        )} />
      )}
    </div>
  )
}
