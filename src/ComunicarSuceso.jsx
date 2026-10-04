import { useEffect, useState } from 'react'
import { Chip, DatosSuceso, limpiarSuceso } from './Accidentes'
import { ESTADOS, TIPOS, fechaCorta, hoyISO } from './accLogic'

// Centros: comunicar al servicio de prevención un accidente, incidente o enfermedad profesional de su centro y ver su estado.
const aviso = { color: '#b00020', background: '#fdecea', padding: 10, borderRadius: 6 }
const VACIO = { tipo: 'accidente_baja', fecha: hoyISO(), hora: '', forma: '', lugar: '', tarea: '', descripcion: '', testigos: '', persona: '', puesto: '', empresa: '', lesion: '', parte_cuerpo: '', gravedad: 'leve', fecha_baja: '' }

export default function ComunicarSuceso({ supabase, centro }) {
  const [lista, setLista] = useState(null)
  const [f, setF] = useState(null)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  useEffect(() => {
    supabase.from('inc_sucesos').select('id,fecha,tipo,persona,puesto,forma,estado').eq('centro_id', centro.id).order('fecha', { ascending: false })
      .then(({ data, error: e }) => { if (e) { setError(/inc_|does not exist|schema cache/i.test(e.message) ? 'Falta ejecutar migracion_accidentes.sql en Supabase' : e.message); setLista([]) } else setLista(data) })
  }, [supabase, centro.id])

  async function enviar() {
    setError(''); setOk('')
    if (!f.descripcion?.trim()) { setError('Describe qué ocurrió.'); return }
    setTrabajando(true)
    const datos = { ...limpiarSuceso(f), centro_id: centro.id, estado: 'comunicado' }
    const { data, error: e } = await supabase.from('inc_sucesos').insert(datos).select('id,fecha,tipo,persona,puesto,forma,estado').single()
    if (e) setError(e.message); else { setLista([data, ...lista]); setF(null); setOk('Comunicado al servicio de prevención. Gracias.') }
    setTrabajando(false)
  }

  return (
    <div style={{ textAlign: 'left', maxWidth: 980 }}>
      <h2 style={{ marginBottom: 4 }}>Comunicar un accidente o incidente</h2>
      <p style={{ marginTop: 0, maxWidth: '80ch' }}>
        Comunica cuanto antes cualquier accidente, incidente sin daño (casi accidente), pinchazo o salpicadura, aunque no haya baja. El servicio de prevención
        lo investiga y te propondrá medidas. Si hay baja, el parte Delt@ debe presentarse en 5 días hábiles: avisa el mismo día.
        Las agresiones se comunican también en «Registro de agresiones».
      </p>
      {error && <p style={aviso}>{error}</p>}
      {ok && <p style={{ color: '#1b5e20', background: '#e8f5e9', padding: 10, borderRadius: 6 }}>{ok}</p>}
      {f ? (
        <div style={{ border: '1px solid #c9d2d8', borderRadius: 8, padding: 14, background: '#fff', marginBottom: 14 }}>
          <strong style={{ display: 'block', marginBottom: 8, color: '#1f3864' }}>{centro.codigo} · {centro.nombre}</strong>
          <DatosSuceso f={f} setF={setF} soloComunicar />
          <p style={{ display: 'flex', gap: 8, marginBottom: 0 }}><button onClick={enviar} disabled={trabajando}>{trabajando ? 'Enviando...' : 'Comunicar'}</button><button className="secundario" onClick={() => setF(null)}>Cancelar</button></p>
        </div>
      ) : <p><button onClick={() => { setF({ ...VACIO }); setOk('') }}>+ Comunicar un suceso</button></p>}
      <h3>Sucesos comunicados en el centro</h3>
      {!lista && <p>Cargando...</p>}
      {lista?.length === 0 && <p className="vacio">No hay sucesos comunicados.</p>}
      {lista?.map((s) => (
        <div key={s.id} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '8px 12px', border: '1px solid #e2e7ea', borderRadius: 8, background: '#fff', marginBottom: 6 }}>
          <span style={{ width: 86, color: '#55616b' }}>{fechaCorta(s.fecha)}</span>
          <Chip e={TIPOS[s.tipo]} />
          <span style={{ flex: 1 }}>{s.persona || s.forma || ''}{s.puesto ? ` · ${s.puesto}` : ''}</span>
          <Chip e={ESTADOS[s.estado]} />
        </div>
      ))}
    </div>
  )
}
