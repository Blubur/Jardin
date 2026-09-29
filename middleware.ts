import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Rutas de acceso (login, registro...) que no requieren sesión
const RUTAS_PUBLICAS = ["/login", "/registro", "/recuperar", "/completar-perfil", "/actualizar-contrasena"];

// Páginas informativas visibles para todo el mundo, con o sin sesión,
// y sin exigir perfil completo
const RUTAS_ABIERTAS = ["/faq", "/contacto", "/politicas"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const esRutaPublica = RUTAS_PUBLICAS.some((r) => pathname.startsWith(r));
  const esRutaAbierta = RUTAS_ABIERTAS.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  // Sin sesión: dejar pasar rutas públicas, abiertas y la home
  if (!session) {
    if (!esRutaPublica && !esRutaAbierta && pathname !== "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  // Con sesión: comprobar perfil completo, salvo en rutas públicas y abiertas
  if (!esRutaPublica && !esRutaAbierta) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("direccion_postal")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!perfil || !perfil.direccion_postal) {
      return NextResponse.redirect(new URL("/completar-perfil", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
