"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { traducirErrorAuth } from "@/lib/erroresAuth";

type Estado = "comprobando" | "listo" | "invalido";

export default function ActualizarContrasenaPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("comprobando");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // El enlace del correo pasa por /auth/callback, que ya deja la sesión de
  // recuperación en las cookies. Aquí solo comprobamos que exista; si no,
  // el enlace no sirve (caducado, ya usado, otro navegador...).
  useEffect(() => {
    let activo = true;

    const query = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (query.get("error") || hash.get("error")) {
      setEstado("invalido");
      return;
    }

    const { data: suscripcion } = supabase.auth.onAuthStateChange(
      (evento, session) => {
        if (!activo) return;
        if (evento === "PASSWORD_RECOVERY" || (evento === "SIGNED_IN" && session)) {
          setEstado("listo");
        }
      }
    );

    async function comprobar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!activo) return;
      if (session) {
        setEstado("listo");
        return;
      }
      // Pequeño margen por si el cliente aún está procesando el enlace
      setTimeout(async () => {
        if (!activo) return;
        const {
          data: { session: segunda },
        } = await supabase.auth.getSession();
        if (!activo) return;
        setEstado(segunda ? "listo" : "invalido");
      }, 1500);
    }
    comprobar();

    return () => {
      activo = false;
      suscripcion.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);

    if (password.length < 8) {
      setMensaje("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    const { error } = await supabase.auth.updateUser({ password });
    setCargando(false);

    if (error) {
      setMensaje(traducirErrorAuth(error));
      return;
    }

    router.replace("/panel");
  }

  if (estado === "comprobando") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-corte-pergamino/60">Comprobando tu enlace...</p>
      </main>
    );
  }

  if (estado === "invalido") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <h1 className="titulo-2">Enlace no válido</h1>
        <p className="mt-2 text-corte-pergamino/70">
          Este enlace ha caducado o ya se ha usado. Pide uno nuevo y usa solo el
          último correo que recibas, abriéndolo en el mismo navegador desde el
          que lo pediste.
        </p>
        <Link
          href="/recuperar"
          className="mt-6 inline-block w-full rounded-sm bg-corte-oro px-6 py-3 text-center font-medium text-corte-fondo transition hover:bg-corte-oro/90"
        >
          Pedir un enlace nuevo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="titulo-2">Elige tu nueva contraseña</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-corte-pergamino/70">
            Nueva contraseña
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
          />
        </div>
        <div>
          <label className="block text-sm text-corte-pergamino/70">
            Confirma la contraseña
          </label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
          />
        </div>

        {mensaje && <p className="text-sm text-corte-lavanda">{mensaje}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
        >
          {cargando ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    </main>
  );
}
