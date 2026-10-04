import { useState } from 'react'
import ImportarCentros from './ImportarCentros'
import ImportarDatos from './ImportarDatos'
import ImportarPac from './ImportarPac'
import RevisarMatriz from './RevisarMatriz'
import CompletarLugar from './CompletarLugar'

// Apartado 6: desde aquí se alimenta el sistema (centros, medidas, matriz, check y lista de comprobación).
const FUENTES = [
  { id: 'centros', titulo: 'Centros', texto: 'Crear un centro a mano o ver y editar los existentes.', boton: 'Ir a Datos de los centros', externo: true },
  { id: 'importar-centros', titulo: 'Importar centros desde Excel', texto: 'Subida masiva de centros con su tipo de usuarios, régimen, horario y características.' },
  { id: 'datos', titulo: 'Importar medidas, matriz y check', texto: 'Catálogo de medidas, matriz de riesgos de cada puesto y preguntas del check.' },
  { id: 'revisar-matriz', titulo: 'Revisar valoraciones de la matriz', texto: 'Casos iguales (mismo riesgo y situación, o misma medida) con valoración distinta según el puesto: unificarlos.' },
  { id: 'lista-pac', titulo: 'Importar la lista de comprobación', texto: 'Puntos y preguntas previas de la evaluación del lugar de trabajo.' },
  { id: 'completar-lugar', titulo: 'Completar la lista con el RD 486/1997', texto: 'Añade a la lista del lugar de trabajo solo los puntos del RD 486/1997 que falten.' },
]

export default function Actualizar({ supabase, onIr }) {
  const [vista, setVista] = useState(null)
  const volver = () => setVista(null)
  if (vista === 'importar-centros') return <ImportarCentros supabase={supabase} onTerminado={() => {}} onVolver={volver} />
  if (vista === 'datos') return <><p><button className="secundario" onClick={volver}>← Volver a Actualizar</button></p><ImportarDatos supabase={supabase} /></>
  if (vista === 'revisar-matriz') return <RevisarMatriz supabase={supabase} onVolver={volver} />
  if (vista === 'completar-lugar') return <CompletarLugar supabase={supabase} onVolver={volver} />
  if (vista === 'lista-pac') return <ImportarPac supabase={supabase} onTerminado={() => {}} onVolver={volver} />
  return (
    <div style={{ textAlign: 'left', maxWidth: 900 }}>
      <h2>Actualizar</h2>
      <p style={{ opacity: 0.8, marginTop: 0 }}>Desde aquí se alimenta el sistema: datos de los centros, medidas, matriz y listas de comprobación.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {FUENTES.map((f) => (
          <div key={f.id} style={{ border: '1px solid #d9dfe3', borderRadius: 10, padding: 14, background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong>{f.titulo}</strong>
            <span style={{ fontSize: 14, opacity: 0.8, flex: 1 }}>{f.texto}</span>
            <button className="secundario" onClick={() => (f.externo ? onIr('centros') : setVista(f.id))}>{f.boton ?? 'Abrir'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
