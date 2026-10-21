import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }),
    },
  }
)

export async function cargarContenido(): Promise<Record<string, string>> {
  const { data } = await supabase.from('contenido').select('clave, valor')
  return Object.fromEntries((data ?? []).map((f) => [f.clave, f.valor]))
}
