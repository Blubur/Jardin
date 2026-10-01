"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { urlSitio } from "@/lib/urlSitio";
import { traducirErrorAuth } from "@/lib/erroresAuth";

// Supabase solo permite un correo de recuperación por usuario cada 60 s, y
// cada correo nuevo invalida el anterior. Bloqueamos el botón para evitarlo.
const ESPERA_SEGUNDOS = 60;

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);

  // Si venimos de un enlace caducado, lo explicamos
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "enlace") {
      setMensaje(
        "El enlace ha caducado o ya se había usado. Pide uno nuevo y usa solo el correo más reciente."
      );
    }
  }, []);

  useEffect(() => {
    if (segundos <= 0) return;
    const t = setTimeout(() => setSegundos((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [segundos]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cargando || segundos > 0) return;
    setCargando(true);
    setMensaje(null);

    const emailLimpio = email.trim().toLowerCase();

    const { error } = await supabase.auth.resetPasswordForEmail(emailLimpio, {
      redirectTo: `${urlSitio()}/auth/callback?next=/actualizar-contrasena`,
    });

    setCargando(false);

    if (error) {
      setMensaje(traducirErrorAuth(error));
      return;
    }

    setSegundos(ESPERA_SEGUNDOS);
    setMensaje(
      "Si ese correo tiene una cuenta, te hemos enviado un enlace para restablecer la contraseña. Usa solo el último correo que recibas y ábrelo en este mismo navegador. Si no llega, mira el spam."
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="titulo-2">Recupera tu contraseña</h1>
      <p className="mt-2 text-corte-pergamino/70">
        Te enviaremos un enlace a tu correo para elegir una nueva contraseña.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-corte-pergamino/70">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
          />
        </div>

        {mensaje && <p className="text-sm text-corte-lavanda">{mensaje}</p>}

        <button
          type="submit"
          disabled={cargando || segundos > 0}
          className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
        >
          {cargando
            ? "Enviando..."
            : segundos > 0
            ? `Espera ${segundos} s para reenviar`
            : "Enviar enlace"}
        </button>
      </form>

      <p className="mt-6 text-sm">
        <Link
          href="/login"
          className="text-corte-pergamino/60 underline underline-offset-4 hover:text-corte-pergamino"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </main>
  );
}
