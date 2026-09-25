import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const RUTAS_PUBLICAS = ["/login", "/registro", "/recuperar", "/completar-perfil", "/actualizar-contrasena"];

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

  // Sin sesión: solo dejar pasar por rutas públicas (login, registro, etc.)
  if (!session) {
    if (!esRutaPublica && pathname !== "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  // Con sesión: comprobar si el perfil está completo, salvo en rutas ya
  // pensadas para completarlo o cerrar sesión.
  if (!esRutaPublica) {
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
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)",
  ],
};