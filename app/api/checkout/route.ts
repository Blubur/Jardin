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

    const { tipo, capitulo } = await req.json();
    const origin = new URL(req.url).origin;

    // Reutiliza el cliente de Stripe si ya existe, o crea uno nuevo
    const existentes = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId =
      existentes.data[0]?.id ??
      (await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } })).id;

    let session: Stripe.Checkout.Session;

    if (tipo === "suscripcion") {
      const { data: actual } = await supabaseAdmin
        .from("suscripciones")
        .select("estado")
        .eq("user_id", user.id)
        .maybeSingle();

      if (actual && ["active", "trialing", "past_due"].includes(actual.estado)) {
        return NextResponse.json({ error: "Ya tienes una suscripción activa" }, { status: 409 });
      }

      const cupon = process.env.STRIPE_COUPON_PREVENTA;

      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: process.env.STRIPE_PRICE_SUSCRIPCION as string, quantity: 1 }],
        discounts: cupon ? [{ coupon: cupon }] : undefined,
        client_reference_id: user.id,
        metadata: { user_id: user.id, tipo: "suscripcion" },
        subscription_data: { metadata: { user_id: user.id } },
        success_url: `${origin}/panel?pago=ok`,
        cancel_url: `${origin}/?pago=cancelado`,
      });
    } else if (tipo === "capitulo") {
      const numero = Number(capitulo);
      if (!Number.isInteger(numero) || numero < 1) {
        return NextResponse.json({ error: "Capítulo no válido" }, { status: 400 });
      }

      const { data: yaComprado } = await supabaseAdmin
        .from("compras")
        .select("id")
        .eq("user_id", user.id)
        .eq("capitulo", numero)
        .maybeSingle();

      if (yaComprado) {
        return NextResponse.json({ error: "Ya tienes este capítulo" }, { status: 409 });
      }

      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        line_items: [{ price: process.env.STRIPE_PRICE_CAPITULO as string, quantity: 1 }],
        invoice_creation: { enabled: true },
        client_reference_id: user.id,
        metadata: { user_id: user.id, tipo: "capitulo", capitulo: String(numero) },
        success_url: `${origin}/panel?pago=ok`,
        cancel_url: `${origin}/?pago=cancelado`,
      });
    } else {
      return NextResponse.json({ error: "Tipo de compra no válido" }, { status: 400 });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Error en /api/checkout:", e);
    return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });
  }
}