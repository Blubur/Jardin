import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

async function guardarSuscripcion(sub: Stripe.Subscription) {
  const userId = sub.metadata?.user_id;
  if (!userId) return;

  const { error } = await supabaseAdmin.from("suscripciones").upsert(
    {
      user_id: userId,
      stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripe_subscription_id: sub.id,
      plan: "mensual",
      estado: sub.status,
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

async function guardarCompra(session: Stripe.Checkout.Session) {
  if (session.mode !== "payment" || session.payment_status !== "paid") return;

  const userId = session.metadata?.user_id;
  const capitulo = Number(session.metadata?.capitulo);
  if (!userId || !capitulo) return;

  const { error } = await supabaseAdmin.from("compras").upsert(
    {
      user_id: userId,
      capitulo,
      stripe_session_id: session.id,
      importe_centimos: session.amount_total,
    },
    { onConflict: "stripe_session_id", ignoreDuplicates: true }
  );
  if (error) throw error;
}

export async function POST(req: Request) {
  const firma = req.headers.get("stripe-signature");
  if (!firma) {
    return NextResponse.json({ error: "Falta la firma" }, { status: 400 });
  }

  const cuerpo = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      cuerpo,
      firma,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch {
    return NextResponse.json({ error: "Firma no válida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await guardarSuscripcion(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.completed":
        await guardarCompra(event.data.object as Stripe.Checkout.Session);
        break;
    }
  } catch (e) {
    console.error("Error procesando webhook:", e);
    return NextResponse.json({ error: "Error procesando el evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}