"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ActualizarContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);

    if (password !== confirmar) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    // Al llegar desde el enlace del correo, Supabase ya ha abierto una
    // sesión temporal de recuperación, así que updateUser funciona
    // directamente sin pedir la contraseña anterior.
    const { error } = await supabase.auth.updateUser({ password });

    setCargando(false);

    if (error) {
      setMensaje(error.message);
      return;
    }

    router.push("/panel");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-semibold text-corte-pergamino">
        Elige tu nueva contraseña
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-corte-pergamino/70">
            Nueva contraseña
          </label>
          <input
            type="password"
            required
            minLength={6}
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
            minLength={6}
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
