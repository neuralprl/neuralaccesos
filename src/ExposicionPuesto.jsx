import { useEffect, useState } from 'react'
import { EXPOSICION } from './ereContenido'
import { clavesExposicion, faltanExposicion, nivelAgresiones } from './ereLogic'

// Datos de exposición del puesto: los necesita su ERE (semana exacta) y ajustan la valoración
// (más kilos suben C; más frecuencia sube P). Solo se piden los que corresponden a los riesgos del puesto.
// Props: supabase, evaluacion {centro, puesto}, filas, exposicion, onCambio(nueva), soloLectura

export default function ExposicionPuesto({ supabase, evaluacion, filas, exposicion = {}, onCambio, soloLectura }) {
  const claves = clavesExposicion(filas)
  const faltan = faltanExposicion(filas, exposicion)
  const [propuesta, setPropuesta] = useState(null)
  const [abierto, setAbierto] = useState(faltan.length > 0)

  useEffect(() => {
    if (!claves.includes('agresiones')) return
    ;(async () => {
      const c = await supabase.from('centros').select('*').eq('id', evaluacion.centro?.id).maybeSingle()
      const d = new Date(); d.setFullYear(d.getFullYear() - 1)
      const a = await supabase.from('agresiones').select('tipo,puesto').eq('centro_id', evaluacion.centro?.id).gte('fecha', d.toISOString().slice(0, 10))
      const sin = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
      const fis = (a.data ?? []).filter((x) => sin(x.puesto) === sin(evaluacion.puesto?.nombre) && x.tipo === 'fisica').length
      setPropuesta(nivelAgresiones(c.data ?? {}, fis))
    })()
  }, [claves.includes('agresiones')]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!claves.length) return null
  const poner = (clave, campo, valor) => onCambio({ ...exposicion, [clave]: { ...(exposicion[clave] ?? {}), [campo]: valor } })

  return (
    <section style={{ border: `1px solid ${faltan.length ? '#ef9a9a' : '#d9dfe3'}`, background: faltan.length ? '#fff8f7' : '#f7f9fb', borderRadius: 10, padding: '10px 14px', margin: '0 0 14px' }}>
      <button type="button" onClick={() => setAbierto(!abierto)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
        <strong style={{ flex: 1 }}>Datos de exposición del puesto (para la ERE y la valoración)</strong>
        <span style={{ fontSize: 13, color: faltan.length ? '#c62828' : '#2e7d32', fontWeight: 600 }}>{faltan.length ? `Faltan ${faltan.length}` : 'Completos'}</span>
        <span aria-hidden="true">{abierto ? '▴' : '▾'}</span>
      </button>
      {abierto && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 13, margin: '0 0 8px', opacity: 0.85 }}>
            Sin estos datos no se puede marcar el puesto como evaluado ni descargar su ERE. Al cambiarlos se recalcula la valoración:
            más kilos suben las consecuencias y más frecuencia sube la probabilidad.
          </p>
          {claves.map((k) => (
            <div key={k} style={{ padding: '8px 0', borderTop: '1px dashed #d9dfe3' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{EXPOSICION[k].titulo}</div>
              {k === 'agresiones' && propuesta && (
                <div style={{ fontSize: 13, marginBottom: 4, opacity: 0.85 }}>
                  Propuesta: nivel {propuesta.nivel}{propuesta.motivos.length ? `, porque ${propuesta.motivos.join('; ')}` : ' (no consta contención en el centro ni agresiones reiteradas a este puesto)'}.
                </div>
              )}
              {EXPOSICION[k].campos.map((c) => (
                <div key={c.k} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', margin: '4px 0' }}>
                  <span style={{ fontSize: 13, minWidth: 150 }}>{c.texto}</span>
                  {c.opciones.map(([v, t]) => {
                    const activo = exposicion[k]?.[c.k] === v
                    return (
                      <button key={v} type="button" className="secundario" disabled={soloLectura} aria-pressed={activo} onClick={() => poner(k, c.k, v)}
                        style={{ padding: '4px 10px', fontSize: 13, ...(activo ? { background: '#1f3864', color: '#fff', borderColor: '#1f3864', fontWeight: 700 } : {}) }}>{t}</button>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
