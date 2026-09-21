"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegistroPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"registro" | "login">("registro");
  const [nick, setNick] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarAviso, setMostrarAviso] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("modo") === "login") {
      setModo("login");
    } else {
      setMostrarAviso(true);
    }
  }, []);

  // Cerrar el aviso con la tecla Escape
  useEffect(() => {
    if (!mostrarAviso) return;
    function alPulsarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") setMostrarAviso(false);
    }
    window.addEventListener("keydown", alPulsarTecla);
    return () => window.removeEventListener("keydown", alPulsarTecla);
  }, [mostrarAviso]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    if (modo === "registro") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // El nick y el nombre completo se guardan como metadatos del
          // usuario en Supabase Auth (no requieren tabla propia).
          data: {
            nick,
            nombre_completo: nombreCompleto,
          },
        },
      });

      setCargando(false);

      if (error) {
        setMensaje(error.message);
        return;
      }

      setMensaje(
        "Cuenta creada. Revisa tu correo para confirmar el registro."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setCargando(false);

    if (error) {
      setMensaje(error.message);
      return;
    }

    router.push("/panel");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      {mostrarAviso && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
          onClick={() => setMostrarAviso(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="aviso-titulo"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-sm border border-corte-oro bg-corte-fondo2 p-6 text-corte-pergamino shadow-xl"
          >
            <button
              type="button"
              onClick={() => setMostrarAviso(false)}
              aria-label="Cerrar aviso"
              className="absolute right-3 top-3 text-2xl leading-none text-corte-pergamino/60 transition hover:text-corte-pergamino"
            >
              ×
            </button>

            <h2 id="aviso-titulo" className="pr-6 text-xl text-corte-oro">
              Antes de registrarte
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-corte-pergamino/90">
              Al crear tu cuenta te llegará un correo de confirmación enviado
              por <strong>Supabase</strong>. Supabase es el servicio que
              guarda de forma segura las cuentas de esta web y envía ese
              mensaje automático para comprobar que el correo es tuyo. Pulsa
              el botón del correo para activar tu cuenta.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-corte-pergamino/90">
              Si no lo ves, mira también la carpeta de spam o correo no
              deseado.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-corte-pergamino/90">
              Si te da un error al registrarte, limpia las cookies de tu
              navegador y vuelve a intentarlo.
            </p>

            <button
              type="button"
              onClick={() => setMostrarAviso(false)}
              className="mt-6 w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <h1 className="titulo-2">
        {modo === "registro" ? "Entra en la Corte" : "Bienvenida de nuevo"}
      </h1>
      <p className="mt-2 text-corte-pergamino/70">
        {modo === "registro"
          ? "Crea tu cuenta para gestionar tu suscripción mensual."
          : "Accede a tu panel para ver tu entrega y tu factura."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {modo === "registro" && (
          <>
            <div>
              <label className="block text-sm text-corte-pergamino/70">
                Nick
              </label>
              <input
                type="text"
                required
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
              />
            </div>
            <div>
              <label className="block text-sm text-corte-pergamino/70">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm text-corte-pergamino/70">
            Correo electrónico
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

        {mensaje && <p className="text-sm text-corte-lavanda">{mensaje}</p>}

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

      <div className="mt-6 flex flex-col gap-2 text-sm">
        <button
          onClick={() => setModo(modo === "registro" ? "login" : "registro")}
          className="text-left text-corte-pergamino/60 underline underline-offset-4 hover:text-corte-pergamino"
        >
          {modo === "registro"
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿Aún no tienes cuenta? Regístrate"}
        </button>

        {modo === "login" && (
          <Link
            href="/recuperar"
            className="text-left text-corte-pergamino/60 underline underline-offset-4 hover:text-corte-pergamino"
          >
            He olvidado mi contraseña
          </Link>
        )}
      </div>
    </main>
  );
}
