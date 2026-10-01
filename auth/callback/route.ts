import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Recibe el ?code= que Supabase añade al volver desde el enlace del correo
// (confirmar registro o recuperar contraseña), lo cambia por una sesión y
// redirige a ?next=. Hacerlo en servidor evita que el middleware se coma el
// código antes de que el cliente lo procese.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Solo rutas internas: evita redirecciones abiertas (//otro-sitio.com)
  const next = searchParams.get("next") ?? "/panel";
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/panel";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  // Enlace caducado, ya usado o abierto en otro navegador/dispositivo
  return NextResponse.redirect(`${origin}/recuperar?error=enlace`);
}
