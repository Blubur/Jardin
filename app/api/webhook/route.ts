import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

// El id de la usuaria puede venir de client_reference_id o de metadata.
// Se aceptan ambos para que un cambio en el checkout no rompa el webhook.
function idUsuaria(session: Stripe.Checkout.Session): string | null {
  return session.client_reference_id ?? session.metadata?.user_id ?? null;
}

async function guardarSuscripcion(sub: Stripe.Subscription) {
  const userId = sub.metadata?.user_id;
  if (!userId) {
    // Antes se ignoraba en silencio. Si ves este aviso en los logs de Vercel,
    // el checkout no está enviando subscription_data.metadata.user_id.
    console.warn("Suscripción sin metadata.user_id, no se guarda:", sub.id);
    return;
  }

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

  const userId = idUsuaria(session);
  const capitulo = Number(session.metadata?.capitulo);
  if (!userId || !Number.isInteger(capitulo) || capitulo < 1) {
    console.warn("Compra sin user_id o capítulo válido, no se guarda:", session.id);
    return;
  }

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

// Copia la dirección y el teléfono que Stripe recoge en el checkout a perfiles.
// Usa UPDATE (no upsert): así nunca crea una fila a medias, sin nick, que
// podría fallar por restricciones NOT NULL o dejar un perfil incompleto.
async function guardarDatosEnvio(session: Stripe.Checkout.Session) {
  const userId = idUsuaria(session);
  if (!userId) return;

  // Se castea porque la versión de tipos de Stripe instalada no declara
  // shipping_details en Checkout.Session, aunque el campo sí existe en la
  // respuesta real de la API.
  const sessionConEnvio = session as Stripe.Checkout.Session & {
    shipping_details?: { address?: Stripe.Address | null } | null;
  };

  const direccionStripe =
    sessionConEnvio.shipping_details?.address ?? session.customer_details?.address;
  const telefono = session.customer_details?.phone;

  // Solo se copia una dirección COMPLETA (con calle). Si el checkout no pide
  // dirección de envío, Stripe devuelve a lo sumo país y código postal, y
  // copiarlo pisaría la dirección completa que la clienta escribió al
  // registrarse, dejándola en algo como "23740, ES".
  const direccion = direccionStripe?.line1 ? direccionStripe : null;

  if (!direccion && !telefono) return;

  // Se añade el país (código ISO, p. ej. "ES"): sin él, un envío postal
  // internacional queda ambiguo.
  const direccionFormateada = direccion
    ? [
        direccion.line1,
        direccion.line2,
        direccion.postal_code,
        direccion.city,
        direccion.state,
        direccion.country,
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;

  const datos: Record<string, unknown> = {};
  if (direccionFormateada) datos.direccion_postal = direccionFormateada;
  if (telefono) datos.telefono = telefono;

  const { error } = await supabaseAdmin
    .from("perfiles")
    .update(datos)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function POST(req: Request) {
  const firma = req.headers.get("stripe-signature");
  if (!firma) {
    return NextResponse.json({ error: "Falta la firma" }, { status: 400 });
  }

  const secreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secreto) {
    console.error("Falta la variable STRIPE_WEBHOOK_SECRET en Vercel");
    return NextResponse.json({ error: "Webhook mal configurado" }, { status: 500 });
  }

  const cuerpo = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(cuerpo, firma, secreto);
  } catch (e) {
    // Causa típica: secreto de otro endpoint o de otro modo (test frente a live).
    console.error("Firma de webhook no válida:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Firma no válida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await guardarSuscripcion(event.data.object as Stripe.Subscription);
        break;

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Lo importante primero: registrar lo que se ha pagado.
        await guardarCompra(session);
        // Copiar la dirección es secundario: si falla, se registra pero no
        // devuelve 500, para que Stripe no reintente y no bloquee la compra.
        try {
          await guardarDatosEnvio(session);
        } catch (e) {
          console.error("No se pudieron copiar los datos de envío:", e);
        }
        break;
      }

      // Pagos que se confirman más tarde (p. ej. domiciliación SEPA)
      case "checkout.session.async_payment_succeeded":
        await guardarCompra(event.data.object as Stripe.Checkout.Session);
        break;
    }
  } catch (e) {
    console.error("Error procesando webhook:", e);
    return NextResponse.json({ error: "Error procesando el evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
