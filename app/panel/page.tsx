"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Suscripcion, Perfil } from "@/lib/supabaseClient";
import BotonPago from "@/components/BotonPago";

const ESTADOS: Record<string, string> = {
  active: "Activa",
  trialing: "En periodo de prueba",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Impagada",
  incomplete: "Incompleta",
  incomplete_expired: "Caducada",
  paused: "Pausada",
};

const PLANES: Record<string, string> = {
  mensual: "Suscripción mensual",
};

export default function PanelPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [capitulosComprados, setCapitulosComprados] = useState<number[]>([]);
  const [pagoOk, setPagoOk] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setPagoOk(
        new URLSearchParams(window.location.search).get("pago") === "ok"
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/registro");
        return;
      }

      setEmail(session.user.email ?? null);

      // El perfil (dirección postal obligatoria) se comprueba antes de
      // dejar entrar al panel. Si no existe fila o falta la dirección,
      // se manda a la usuaria a completarlo primero.
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle<Perfil>();

      if (!perfil || !perfil.direccion_postal) {
        router.push("/completar-perfil");
        return;
      }

      // Una fila por usuaria, mantenida por el webhook de Stripe.
      const { data } = await supabase
        .from("suscripciones")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setSuscripcion(data);

      // Capítulos sueltos comprados (también los escribe el webhook).
      const { data: compras } = await supabase
        .from("compras")
        .select("capitulo")
        .eq("user_id", session.user.id)
        .order("capitulo", { ascending: true });

      setCapitulosComprados(
        (compras ?? []).map((c: { capitulo: number }) => c.capitulo)
      );

      setCargando(false);
    }

    cargar();
  }, [router]);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/registro");
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-corte-pergamino/60">Cargando tu panel...</p>
      </main>
    );
  }

  const suscripcionActiva =
    !!suscripcion &&
    ["active", "trialing", "past_due"].includes(String(suscripcion.estado));

  const planTexto = suscripcion
    ? PLANES[String(suscripcion.plan)] ?? String(suscripcion.plan)
    : "Sin suscripción activa";

  const estadoTexto = suscripcion
    ? ESTADOS[String(suscripcion.estado)] ?? String(suscripcion.estado)
    : "—";

  const tieneHistorialDePago = !!suscripcion || capitulosComprados.length > 0;

  return (
    <main className="contenedor-estrecho">
      <div className="flex items-start justify-between">
        <div>
          <p className="kicker">
            Tu Corte
          </p>
          <h1 className="titulo-2">
            {email}
          </h1>
        </div>
        <button
          onClick={cerrarSesion}
          className="texto-suave underline underline-offset-4 hover:text-corte-pergamino"
        >
          Cerrar sesión
        </button>
      </div>

      {pagoOk && (
        <p className="mt-8 border border-corte-oro/40 px-4 py-3 text-corte-pergamino/85">
          ¡Gracias! Hemos recibido tu pago. Si tu compra aún no aparece
          abajo, espera unos segundos y recarga la página.
        </p>
      )}

      <section className="mt-10 divide-y divide-corte-oro/20 border-y border-corte-oro/20">
        <div className="flex items-center justify-between py-4">
          <span className="text-corte-pergamino/70">Plan</span>
          <span className="font-medium text-corte-pergamino">
            {planTexto}
          </span>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-corte-pergamino/70">Estado</span>
          <span className="font-medium text-corte-pergamino">
            {estadoTexto}
          </span>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-corte-pergamino/70">Capítulo actual</span>
          <span className="font-medium text-corte-pergamino">
            {suscripcion?.capitulo_actual ?? "—"}
          </span>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-corte-pergamino/70">Capítulos sueltos</span>
          <span className="font-medium text-corte-pergamino">
            {capitulosComprados.length > 0
              ? capitulosComprados.map((n) => `Cap. ${n}`).join(", ")
              : "—"}
          </span>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-start gap-4">
         {!suscripcionActiva && (
          <a href="/#planes"
            className="inline-block rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90"
          >
            Elegir un plan
          </a>
        )}

        {tieneHistorialDePago && (
          <BotonPago
            tipo="portal"
            className="inline-block rounded-sm border border-corte-pergamino/30 px-6 py-3 text-corte-pergamino transition hover:border-corte-pergamino/60"
          >
            Ver facturas y gestionar pago
          </BotonPago>
        )}
      </div>
    </main>
  );
}