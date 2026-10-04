import { useEffect, useState } from 'react'
import { recogerMemoria, recogerPrograma } from './memoriaDatos'
import { wordMemoria, wordPrograma } from './documentosSistema'
import { descargar } from './documentos'
import { nombreCategoria } from './gestorLogic'

// Programa anual de actividades (se elabora a principio de año) y memoria anual (se va completando sola con lo
// que se registra en el sistema). Solo para el técnico. El programa, una vez aprobado, se cuelga en
// «Documentos generales del sistema y procedimientos».
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const tarjeta = { border: '1px solid #d9dfe3', borderRadius: 10, padding: '12px 16px', background: '#fff', marginBottom: 14 }
const leerCfg = () => { try { return JSON.parse(localStorage.getItem('neuraler:sistema') || '{}') } catch { return {} } }

export default function MemoriaPrograma({ supabase }) {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getMonth() >= 10 ? hoy.getFullYear() + 1 : hoy.getFullYear())
  const [anioMem, setAnioMem] = useState(hoy.getMonth() <= 1 ? hoy.getFullYear() - 1 : hoy.getFullYear())
  const [cfg, setCfg] = useState({ servicio: 'Servicio de Prevención Mancomunado del Grupo Neural', empresas: '', lugar: 'Valencia', ...leerCfg() })
  const [memoria, setMemoria] = useState(null)
  const [haciendo, setHaciendo] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { try { localStorage.setItem('neuraler:sistema', JSON.stringify(cfg)) } catch { /* sin almacenamiento */ } }, [cfg])
  useEffect(() => {
    setMemoria(null)
    recogerMemoria(supabase, anioMem).then(setMemoria).catch((e) => setError(e.message))
  }, [anioMem]) // eslint-disable-line react-hooks/exhaustive-deps

  async function programa() {
    setHaciendo('programa'); setError('')
    try { descargar(await wordPrograma(await recogerPrograma(supabase, anio), cfg), `Programa_anual_actividades_${anio}.docx`) } catch (e) { setError(e.message) }
    setHaciendo('')
  }
  async function bajarMemoria() {
    setHaciendo('memoria'); setError('')
    try { descargar(await wordMemoria(memoria, cfg), `Memoria_anual_${anioMem}.docx`) } catch (e) { setError(e.message) }
    setHaciendo('')
  }
  const r = memoria?.resumen
  const anios = [hoy.getFullYear() - 2, hoy.getFullYear() - 1, hoy.getFullYear(), hoy.getFullYear() + 1]

  return (
    <div style={{ textAlign: 'left', maxWidth: 980 }}>
      <h2>Memoria y programa anual</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Solo los ve el técnico. El programa se elabora a principio de año; la memoria se completa sola con lo que se registra en el sistema y se cierra al acabar el año.</p>
      {error && <p style={aviso}>{error}</p>}

      <details style={{ ...tarjeta }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Datos del servicio (salen en los dos documentos)</summary>
        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          <label>Nombre del servicio<br /><input value={cfg.servicio} onChange={(e) => setCfg({ ...cfg, servicio: e.target.value })} style={{ width: '100%' }} /></label>
          <label>Empresas que lo integran<br /><textarea rows={2} value={cfg.empresas} onChange={(e) => setCfg({ ...cfg, empresas: e.target.value })} style={{ width: '100%' }} placeholder="Casta Salud SL, INIA Neural SL..." /></label>
          <label>Lugar de firma<br /><input value={cfg.lugar} onChange={(e) => setCfg({ ...cfg, lugar: e.target.value })} /></label>
        </div>
      </details>

      <section style={tarjeta}>
        <h3 style={{ marginTop: 0 }}>Programa anual de actividades</h3>
        <p style={{ fontSize: 14 }}>Borrador en Word con lo previsto para el año: evaluaciones iniciales y revisiones que vencen (con su mes), visitas, seguimiento del PAP pendiente, vigilancia de la salud, formación, simulacros por centro, agresiones, coordinación, comités y calendario por trimestres. Revísalo, apruébalo y cuélgalo en los documentos generales del sistema.</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}>{anios.map((a) => <option key={a} value={a}>{a}</option>)}</select>
          <button onClick={programa} disabled={!!haciendo}>{haciendo === 'programa' ? 'Preparando...' : `Generar el programa ${anio} (Word)`}</button>
        </div>
      </section>

      <section style={tarjeta}>
        <h3 style={{ marginTop: 0 }}>Memoria anual</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <select value={anioMem} onChange={(e) => setAnioMem(Number(e.target.value))}>{anios.map((a) => <option key={a} value={a}>{a}</option>)}</select>
          <button onClick={bajarMemoria} disabled={!memoria || !!haciendo}>{haciendo === 'memoria' ? 'Preparando...' : `Descargar la memoria ${anioMem} (Word)`}</button>
        </div>
        {!memoria && !error && <p>Recopilando la actividad del año...</p>}
        {r && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
              {[
                ['Evaluaciones cerradas', r.evaluaciones], ['Puestos evaluados', r.puestosEvaluados], ['Visitas PAC', r.visitas], ['Centros con equipos evaluados', r.centrosEquipos],
                ...Object.entries(r.porCategoria).map(([k, n]) => [nombreCategoria(k), n]),
                ['Acciones PAP realizadas', r.papRealizadas], ['Acciones PAP vencidas', r.papVencidas], ['Agresiones', r.agresiones], ['Informes de adaptación', r.adaptaciones],
                ['Centros con evaluación vigente', `${r.centrosVigentes} / ${r.totalCentros}`],
              ].map(([x, n]) => <div key={x} style={{ border: '1px solid #e3e8ec', borderRadius: 8, padding: '8px 10px' }}><b style={{ fontSize: 18 }}>{n}</b><br /><small>{x}</small></div>)}
            </div>
            <p style={{ fontSize: 13, opacity: 0.8 }}>Para que una actividad cuente, regístrala en el sistema: por ejemplo, cuelga el informe de un simulacro en los documentos del centro con el tipo «Informe de simulacro» y su fecha.</p>
          </>
        )}
      </section>
    </div>
  )
}
