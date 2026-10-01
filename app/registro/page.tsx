"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { urlSitio } from "@/lib/urlSitio";
import { traducirErrorAuth } from "@/lib/erroresAuth";

const OPCIONES_CONOCISTE = [
  "TikTok",
  "Me lo recomendó alguien",
  "Otro",
];

// Opciones que despliegan un campo extra, con su pregunta
const PREGUNTA_DETALLE: Record<string, string> = {
  "Me lo recomendó alguien": "¿Quién?",
  "Otro": "¿Dónde?",
};

export default function RegistroPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"registro" | "login">("registro");
  const [nick, setNick] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [comoNosConociste, setComoNosConociste] = useState("");
  const [comoDetalle, setComoDetalle] = useState("");
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [correoYaRegistrado, setCorreoYaRegistrado] = useState(false);

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
    setCorreoYaRegistrado(false);

    // El teclado del móvil suele meter mayúsculas o espacios de más
    const emailLimpio = email.trim().toLowerCase();

    if (modo === "registro") {
      const direccionLimpia = direccion.trim();
      const telefonoLimpio = telefono.trim();
      const instruccionesLimpias = instrucciones.trim();
      const nickLimpio = nick.trim();
      const nombreLimpio = nombreCompleto.trim();
      const detalleLimpio = PREGUNTA_DETALLE[comoNosConociste]
        ? comoDetalle.trim()
        : "";

      if (nickLimpio.length < 3 || nickLimpio.length > 30) {
        setCargando(false);
        setMensaje("El nick debe tener entre 3 y 30 caracteres.");
        return;
      }
      if (nombreLimpio.length < 2) {
        setCargando(false);
        setMensaje("Escribe tu nombre completo.");
        return;
      }
      if (password.length < 8) {
        setCargando(false);
        setMensaje("La contraseña debe tener al menos 8 caracteres.");
        return;
      }
      if (direccionLimpia.length < 10) {
        setCargando(false);
        setMensaje("Escribe tu dirección postal completa (calle, número, código postal, ciudad y país).");
        return;
      }
      if (telefonoLimpio && !/^[+\d][\d\s().-]{6,19}$/.test(telefonoLimpio)) {
        setCargando(false);
        setMensaje("El teléfono no parece válido.");
        return;
      }
      if (!aceptaPrivacidad) {
        setCargando(false);
        setMensaje("Debes aceptar la política de privacidad para crear tu cuenta.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailLimpio,
        password,
        options: {
          emailRedirectTo: `${urlSitio()}/auth/callback?next=/panel`,
          // Estos datos se guardan como metadatos del usuario en Supabase
          // Auth. El trigger handle_new_user() los copia a la tabla
          // perfiles al crearse la cuenta.
          data: {
            nick: nickLimpio,
            nombre_completo: nombreLimpio,
            direccion_postal: direccionLimpia,
            telefono: telefonoLimpio || null,
            instrucciones_entrega: instruccionesLimpias || null,
            como_nos_conociste: comoNosConociste || null,
            como_nos_conociste_detalle: detalleLimpio || null,
            acepta_privacidad: aceptaPrivacidad,
          },
        },
      });

      setCargando(false);

      if (error) {
        setMensaje(traducirErrorAuth(error));
        return;
      }

      // Caso 1: "Confirm email" desactivado en Supabase -> ya hay sesión.
      if (data.session) {
        router.push("/panel");
        return;
      }

      // Caso 2: el correo ya estaba registrado. Supabase responde 200 con un
      // usuario "falso" sin identidades y NO envía ningún correo.
      if (data.user?.identities?.length === 0) {
        setCorreoYaRegistrado(true);
        setMensaje(
          "Ya existe una cuenta con ese correo, así que no te hemos enviado ningún correo nuevo. Inicia sesión o, si no recuerdas la contraseña, recupérala."
        );
        return;
      }

      // Caso 3: cuenta nueva pendiente de confirmar.
      setMensaje(
        "Cuenta creada. Te hemos enviado un correo para confirmarla. Si no lo ves en unos minutos, mira el spam."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailLimpio,
      password,
    });

    setCargando(false);

    if (error) {
      setMensaje(traducirErrorAuth(error));
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
          ? "Crea tu cuenta para gestionar tu suscripción mensual. Necesitamos tu dirección y tu teléfono para poder enviarte los goodies de cada entrega."
          : "Accede a tu panel para ver tu entrega y tu factura."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {modo === "registro" && (
          <>
            <div>
              <label className="block text-base font-mono text-corte-pergamino/70">
                ¿A quién me dirijo?{" "}
                <span className="font-display text-corte-lavanda">
                  (Pon aquí el nombre/nick que quieres que use para referirme a ti en la carta, puedes poner dos si lo lees junto a un mutual. En la dirección usaré tu nombre completo)
                </span>
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
              <label className="block text-base font-mono text-corte-pergamino/70">
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
            <div>
              <label className="block text-base font-mono text-corte-pergamino/70">
                Dirección postal completa{" "}
                <span className="font-display text-corte-lavanda">
                  (incluye número, letra si la tiene, código postal y región)
                </span>
              </label>
              <textarea
                required
                rows={3}
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                autoComplete="street-address"
                className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
              />
            </div>
            <div>
              <label className="block text-base font-mono text-corte-pergamino/70">
                Instrucciones de entrega{" "}
                <span className="font-display text-corte-lavanda">
                  (opcional: por ejemplo, &quot;dejar en portería&quot; o &quot;llamar al timbre B&quot;)
                </span>
              </label>
              <textarea
                rows={2}
                value={instrucciones}
                onChange={(e) => setInstrucciones(e.target.value)}
                className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
              />
            </div>
            <div>
              <label className="block text-base font-mono text-corte-pergamino/70">
                Teléfono{" "}
                <span className="font-display text-corte-lavanda">
                  (indispensable si tengo que contactar contigo)
                </span>
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                autoComplete="tel"
                className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
              />
            </div>
            <div>
              <label className="block text-base font-mono text-corte-pergamino/70">
                ¿Cómo nos conociste?{" "}
                <span className="font-display text-corte-lavanda">
                  (opcional)
                </span>
              </label>
              <select
                value={comoNosConociste}
                onChange={(e) => {
                  setComoNosConociste(e.target.value);
                  setComoDetalle("");
                }}
                className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
              >
                <option value="">Elige una opción</option>
                {OPCIONES_CONOCISTE.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>
            {PREGUNTA_DETALLE[comoNosConociste] && (
              <div>
                <label className="block text-base font-mono text-corte-pergamino/70">
                  {PREGUNTA_DETALLE[comoNosConociste]}{" "}
                  <span className="font-display text-corte-lavanda">
                    (opcional)
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={comoDetalle}
                  onChange={(e) => setComoDetalle(e.target.value)}
                  className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
                />
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-base font-mono text-corte-pergamino/70">
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
        <div>
          <label className="block text-base font-mono text-corte-pergamino/70">
            Contraseña
          </label>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={modo === "registro" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-sm border border-corte-pergamino/30 bg-corte-fondo2 px-3 py-2 text-corte-pergamino outline-none focus:border-corte-oro"
          />
        </div>

        {modo === "registro" && (
          <label className="flex items-start gap-3 text-sm text-corte-pergamino/80">
            <input
              type="checkbox"
              required
              checked={aceptaPrivacidad}
              onChange={(e) => setAceptaPrivacidad(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-corte-oro"
            />
            <span>
              He leído y acepto la{" "}
              <Link
                href="/politicas"
                target="_blank"
                className="underline underline-offset-4 hover:text-corte-pergamino"
              >
                política de privacidad
              </Link>{" "}
              y el tratamiento de mis datos para gestionar mi suscripción y los
              envíos.
            </span>
          </label>
        )}

        {mensaje && <p className="text-sm text-corte-lavanda">{mensaje}</p>}

        {correoYaRegistrado && (
          <div className="flex flex-col gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setModo("login");
                setMensaje(null);
                setCorreoYaRegistrado(false);
              }}
              className="text-left text-corte-oro underline underline-offset-4"
            >
              Iniciar sesión con este correo
            </button>
            <Link
              href="/recuperar"
              className="text-left text-corte-oro underline underline-offset-4"
            >
              He olvidado mi contraseña
            </Link>
          </div>
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

      <div className="mt-6 flex flex-col gap-2 text-sm">
        <button
          onClick={() => {
            setModo(modo === "registro" ? "login" : "registro");
            setMensaje(null);
            setCorreoYaRegistrado(false);
          }}
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
