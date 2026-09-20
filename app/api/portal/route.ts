import { NextResponse } from "next/server";
import type Stripe from "stripe";
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

    const { tipo } = await req.json().catch(() => ({ tipo: undefined }));

    const clientes = await stripe.customers.list({ email: user.email, limit: 1 });
    if (!clientes.data[0]) {
      return NextResponse.json({ error: "Todavía no tienes compras" }, { status: 404 });
    }

    const origin = new URL(req.url).origin;
    const params: Stripe.BillingPortal.SessionCreateParams = {
      customer: clientes.data[0].id,
      return_url: `${origin}/panel`,
    };

    // Si pide cancelar, se abre directamente la pantalla de cancelación
    if (tipo === "cancelar") {
      const subs = await stripe.subscriptions.list({
        customer: clientes.data[0].id,
        status: "all",
        limit: 10,
      });
      const activa = subs.data.find((s) =>
        ["active", "trialing", "past_due"].includes(s.status)
      );
      if (activa) {
        params.flow_data = {
          type: "subscription_cancel",
          subscription_cancel: { subscription: activa.id },
          after_completion: {
            type: "redirect",
            redirect: { return_url: `${origin}/panel` },
          },
        };
      }
    }

    const portal = await stripe.billingPortal.sessions.create(params);
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("Error en /api/portal:", e);
    return NextResponse.json({ error: "No se pudo abrir el portal" }, { status: 500 });
  }
}
