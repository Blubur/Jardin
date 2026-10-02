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

    // 1) Cliente de Stripe guardado por el webhook (es el fiable: el enlace de
    //    pago no prellena el correo y la clienta puede haber escrito otro).
    const { data: fila } = await supabaseAdmin
      .from("suscripciones")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId: string | undefined = fila?.stripe_customer_id ?? undefined;

    // 2) Respaldo: buscar por el correo de la cuenta (p. ej. quien solo compró
    //    capítulos sueltos y no tiene fila en "suscripciones").
    if (!customerId) {
      const clientes = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = clientes.data[0]?.id;
    }

    if (!customerId) {
      return NextResponse.json({ error: "Todavía no tienes compras" }, { status: 404 });
    }

    const origin = new URL(req.url).origin;
    const params: Stripe.BillingPortal.SessionCreateParams = {
      customer: customerId,
      return_url: `${origin}/panel`,
    };

    // Si pide cancelar, se abre directamente la pantalla de cancelación
    if (tipo === "cancelar") {
      const subs = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });
      const activa = subs.data.find((s) =>
        ["active", "trialing", "past_due"].includes(s.status)
      );

      if (!activa) {
        return NextResponse.json(
          { error: "No tienes ninguna suscripción activa" },
          { status: 404 }
        );
      }

      if (activa.cancel_at_period_end) {
        return NextResponse.json(
          { error: "Tu suscripción ya está cancelada y terminará al final del periodo pagado" },
          { status: 409 }
        );
      }

      params.flow_data = {
        type: "subscription_cancel",
        subscription_cancel: { subscription: activa.id },
        after_completion: {
          type: "redirect",
          redirect: { return_url: `${origin}/panel` },
        },
      };
    }

    const portal = await stripe.billingPortal.sessions.create(params);
    return NextResponse.json({ url: portal.url });
  } catch (e) {
    console.error("Error en /api/portal:", e);
    return NextResponse.json({ error: "No se pudo abrir el portal" }, { status: 500 });
  }
}