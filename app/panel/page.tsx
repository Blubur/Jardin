"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Suscripcion, Perfil } from "@/lib/supabaseClient";

export default function PanelPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
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

      // Esta consulta asume una tabla "suscripciones" con una fila por
      // usuaria (user_id = session.user.id), que el webhook de Stripe
      // mantendrá actualizada. Hasta que Stripe esté conectado, esta
      // tabla puede no tener aún fila para el usuario.
      const { data } = await supabase
        .from("suscripciones")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setSuscripcion(data);
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

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg italic text-corte-lavanda">
            Tu Corte
          </p>
          <h1 className="font-display text-3xl font-semibold text-corte-pergamino">
            {email}
          </h1>
        </div>
        <button
          onClick={cerrarSesion}
          className="text-sm text-corte-pergamino/60 underline underline-offset-4 hover:text-corte-pergamino"
        >
          Cerrar sesión
        </button>
      </div>

      <section className="mt-10 divide-y divide-corte-oro/20 border-y border-corte-oro/20">
        <div className="flex items-center justify-between py-4">
          <span className="text-corte-pergamino/70">Plan</span>
          <span className="font-medium text-corte-pergamino">
            {suscripcion?.plan ?? "Sin suscripción activa"}
          </span>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-corte-pergamino/70">Estado</span>
          <span className="font-medium text-corte-pergamino capitalize">
            {suscripcion?.estado ?? "—"}
          </span>
        </div>
        <div className="flex items-center justify-between py-4">
          <span className="text-corte-pergamino/70">Capítulo actual</span>
          <span className="font-medium text-corte-pergamino">
            {suscripcion?.capitulo_actual ?? "—"}
          </span>
        </div>
      </section>

      <div className="mt-8">
        {suscripcion ? (
          <a
            href="/api/stripe/portal"
            className="inline-block rounded-sm border border-corte-pergamino/30 px-6 py-3 text-corte-pergamino transition hover:border-corte-pergamino/60"
          >
            Ver facturas y gestionar pago
          </a>
        ) : (
          <a
            href="/#planes"
            className="inline-block rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90"
          >
            Elegir un plan
          </a>
        )}
      </div>
    </main>
  );
}
