import { createClient } from '@supabase/supabase-js'

// Clave pública: esta web solo puede leer la información para externos, la lista de empresas
// y registrar un acceso. No puede leer ningún registro ni ningún otro dato del sistema.
const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configOk = Boolean(url && clave)
export const supabase = configOk ? createClient(url, clave, { auth: { persistSession: false } }) : null
