// Notas importantes de la visita: se guardan aparte del bloc de notas, cada una con su fecha y hora, y se
// conservan por centro (se ven en todas sus visitas). Tabla notas_importantes (migracion_notas_importantes.sql).
import { useCallback, useEffect, useState } from 'react'

export const fechaHora = (iso) => new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const FALTA = 'Falta ejecutar migracion_notas_importantes.sql en Supabase'
const explicar = (e) => (/notas_importantes|does not exist|schema cache/i.test(e?.message ?? '') ? FALTA : e?.message ?? 'Error')

export function useNotasImportantes(supabase, evc) {
  const centroId = evc?.centros?.id ?? evc?.centro_id
  const [notas, setNotas] = useState([])
  const [error, setError] = useState('')

  const cargar = useCallback(async () => {
    if (!centroId) return
    const { data, error: e } = await supabase.from('notas_importantes').select('id,texto,creada_en,evaluacion_centro_id')
      .eq('centro_id', centroId).order('creada_en', { ascending: false })
    if (e) setError(explicar(e)); else { setError(''); setNotas(data) }
  }, [supabase, centroId])
  useEffect(() => { cargar() }, [cargar])

  async function guardar(texto) {
    const t = texto.trim()
    if (!t) return false
    const { data, error: e } = await supabase.from('notas_importantes')
      .insert({ texto: t, centro_id: centroId, evaluacion_centro_id: evc.id }).select('id,texto,creada_en,evaluacion_centro_id').single()
    if (e) { setError(explicar(e)); return false }
    setError(''); setNotas((n) => [data, ...n]); return true
  }
  async function borrar(id) {
    const { error: e } = await supabase.from('notas_importantes').delete().eq('id', id)
    if (e) setError(explicar(e)); else setNotas((n) => n.filter((x) => x.id !== id))
  }
  return { notas, error, guardar, borrar }
}
