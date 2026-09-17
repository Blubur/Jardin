"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegistroPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"registro" | "login">("registro");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    const { error } =
      modo === "registro"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setCargando(false);

    if (error) {
      setMensaje(error.message);
      return;
    }

    if (modo === "registro") {
      setMensaje(
        "Cuenta creada. Revisa tu correo para confirmar el registro."
      );
    } else {
      router.push("/panel");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="font-display text-3xl font-semibold text-corte-pergamino">
        {modo === "registro" ? "Entra en la Corte" : "Bienvenida de nuevo"}
      </h1>
      <p className="mt-2 text-corte-pergamino/70">
        {modo === "registro"
          ? "Crea tu cuenta para gestionar tu suscripción mensual."
          : "Accede a tu panel para ver tu entrega y tu factura."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm text-corte-pergamino/70">
            Correo
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
          />
        </div>
        <div>
          <label className="block text-sm text-corte-pergamino/70">
            Contraseña
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

        {mensaje && (
          <p className="text-sm text-corte-lavanda">{mensaje}</p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
        >
          {cargando
            ? "Un momento..."
            : modo === "registro"
            ? "Crear cuenta"
            : "Entrar"}
        </button>
      </form>

      <button
        onClick={() => setModo(modo === "registro" ? "login" : "registro")}
        className="mt-6 text-sm text-corte-pergamino/60 underline underline-offset-4 hover:text-corte-pergamino"
      >
        {modo === "registro"
          ? "¿Ya tienes cuenta? Inicia sesión"
          : "¿Aún no tienes cuenta? Regístrate"}
      </button>
    </main>
  );
}
