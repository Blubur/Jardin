"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setAviso(null);

    if (!email.trim() || !password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }

    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setCargando(false);

    if (error) {
      const msg = error.message.toLowerCase();
      setError(
        msg.includes("email not confirmed")
          ? "Aún no has confirmado tu correo. Revisa tu bandeja de entrada."
          : "Correo o contraseña incorrectos."
      );
      return;
    }

    // El panel ya comprueba si falta el perfil y redirige a /completar-perfil.
    router.push("/panel");
  }

  async function recuperarContrasena() {
    setError(null);
    setAviso(null);

    if (!email.trim()) {
      setError("Escribe tu correo arriba y vuelve a pulsar este enlace.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/perfil`,
    });

    if (error) {
      setError("No se pudo enviar el correo. Inténtalo de nuevo en unos minutos.");
      return;
    }
    setAviso("Si el correo existe, te hemos enviado un enlace para recuperar tu contraseña.");
  }

  return (
    <main className="contenedor-estrecho">
      <p className="kicker">Tu Corte</p>
      <h1 className="titulo-2">Iniciar sesión</h1>

      <form onSubmit={entrar} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="etiqueta">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="campo"
          />
        </div>

        <div>
          <label htmlFor="password" className="etiqueta">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="campo"
          />
        </div>

        {error && <p role="alert" className="aviso-error">{error}</p>}
        {aviso && <p role="status" className="aviso-ok">{aviso}</p>}

        <button type="submit" disabled={cargando} className="boton boton-primario">
          {cargando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 texto-suave">
        <button
          type="button"
          onClick={recuperarContrasena}
          className="underline underline-offset-4 hover:text-corte-pergamino"
        >
          He olvidado mi contraseña
        </button>
      </p>

      <p className="mt-2 texto-suave">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="underline underline-offset-4 hover:text-corte-pergamino">
          Crea tu cuenta aquí
        </Link>
      </p>
    </main>
  );
}