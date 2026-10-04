// Utilidades de acceso a Supabase.

// PostgREST devuelve como máximo 1000 filas por petición: se pide por páginas hasta tenerlas todas.
// construir: función que devuelve la consulta (por ejemplo, () => supabase.from('tabla').select('*').order('id')).
export async function leerTodo(construir) {
  const todo = []
  for (let desde = 0; ; desde += 1000) {
    const { data, error } = await construir().range(desde, desde + 999)
    if (error) throw error
    todo.push(...data)
    if (data.length < 1000) return todo
  }
}
