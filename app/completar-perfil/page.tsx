"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [direccionPostal, setDireccionPostal] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/registro");
        return;
      }

      setCargando(false);
    }

    cargar();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setGuardando(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/registro");
      return;
    }

    const { error } = await supabase.from("perfiles").upsert({
      user_id: session.user.id,
      direccion_postal: direccionPostal,
      telefono: telefono || null,
    });

    setGuardando(false);

    if (error) {
      setMensaje(error.message);
      return;
    }

    router.push("/panel");
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-corte-pergamino/60">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-semibold text-corte-pergamino">
        Completa tu perfil
      </h1>
      <p className="mt-2 text-corte-pergamino/70">
        Necesitamos tu dirección postal para poder enviarte los goodies de
        cada entrega. El teléfono es opcional, solo para incidencias de
        envío.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-corte-pergamino/70">
            Dirección postal <span className="text-corte-oro">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={direccionPostal}
            onChange={(e) => setDireccionPostal(e.target.value)}
            placeholder="Calle, número, piso, código postal, ciudad, provincia, país"
            className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
          />
        </div>
        <div>
          <label className="block text-sm text-corte-pergamino/70">
            Teléfono (opcional)
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
          />
        </div>

        {mensaje && <p className="text-sm text-corte-lavanda">{mensaje}</p>}

        <button
          type="submit"
          disabled={guardando}
          className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar y continuar"}
        </button>
      </form>
    </main>
  );
}
