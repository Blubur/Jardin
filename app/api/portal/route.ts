import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user || !user.email) {
      return NextResponse.json({ error: "Sesión no válida" }, { status: 401 });
    }

    const clientes = await stripe.customers.list({ email: user.email, limit: 1 });
    if (!clientes.data[0]) {
      return NextResponse.json({ error: "Todavía no tienes compras" }, { status: 404 });
    }

    const origin = new URL(req.url).origin;
    const portal = await stripe.billingPortal.sessions.create({
      customer: clientes.data[0].id,
      return_url: `${origin}/panel`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("Error en /api/portal:", e);
    return NextResponse.json({ error: "No se pudo abrir el portal" }, { status: 500 });
  }
}