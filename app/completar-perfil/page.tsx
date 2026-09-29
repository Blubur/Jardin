"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState("");
  const [nick, setNick] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [comoNosConociste, setComoNosConociste] = useState("");
  const [comoDetalle, setComoDetalle] = useState("");
  const [yaAceptoPrivacidad, setYaAceptoPrivacidad] = useState(false);
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);

      // Si ya tiene el perfil completo, no hace falta estar aquí.
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      

      // Rellena lo que ya exista (por ejemplo, un nick puesto al registrarse).
      setNick(perfil?.nick ?? "");
      setNombreCompleto(perfil?.nombre_completo ?? "");
      setDireccion(perfil?.direccion_postal ?? "");
      setTelefono(perfil?.telefono ?? "");
      setInstrucciones(perfil?.instrucciones_entrega ?? "");
      setComoNosConociste(perfil?.como_nos_conociste ?? "");
      setComoDetalle(perfil?.como_nos_conociste_detalle ?? "");
      setYaAceptoPrivacidad(perfil?.acepta_privacidad === true);
      setCargando(false);
    }
    cargar();
  }, [router]);

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const nickLimpio = nick.trim();
    const nombreLimpio = nombreCompleto.trim();
    const direccionLimpia = direccion.trim();
    const telefonoLimpio = telefono.trim();
    const instruccionesLimpias = instrucciones.trim();
    const detalleLimpio = PREGUNTA_DETALLE[comoNosConociste]
      ? comoDetalle.trim()
      : "";

    if (nickLimpio.length < 3 || nickLimpio.length > 30) {
      setError("El nick debe tener entre 3 y 30 caracteres.");
      return;
    }
    if (nombreLimpio.length < 2) {
      setError("Escribe tu nombre completo.");
      return;
    }
    if (direccionLimpia.length < 10) {
      setError("Escribe tu dirección postal completa (calle, número, código postal, ciudad y país).");
      return;
    }
    if (telefonoLimpio && !/^[+\d][\d\s().-]{6,19}$/.test(telefonoLimpio)) {
      setError("El teléfono no parece válido.");
      return;
    }
    if (!yaAceptoPrivacidad && !aceptaPrivacidad) {
      setError("Debes aceptar la política de privacidad para continuar.");
      return;
    }

    setGuardando(true);

    const datos: Record<string, unknown> = {
      user_id: userId,
      nick: nickLimpio,
      nombre_completo: nombreLimpio,
      direccion_postal: direccionLimpia,
      telefono: telefonoLimpio || null,
      instrucciones_entrega: instruccionesLimpias || null,
      como_nos_conociste: comoNosConociste || null,
      como_nos_conociste_detalle: detalleLimpio || null,
    };

    // Solo se registra la aceptación si es nueva, para no pisar la fecha
    // de una aceptación anterior.
    if (!yaAceptoPrivacidad && aceptaPrivacidad) {
      datos.acepta_privacidad = true;
      datos.acepta_privacidad_en = new Date().toISOString();
    }

    // upsert: crea la fila si no existe y la actualiza si ya existe.
    const { error } = await supabase
      .from("perfiles")
      .upsert(datos, { onConflict: "user_id" });
    setGuardando(false);

    if (error) {
      setError(
        error.code === "23505"
          ? "Ese nick ya está en uso. Prueba con otro."
          : "No se pudo guardar tu perfil. Inténtalo de nuevo."
      );
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
    <main className="contenedor-estrecho">
      <p className="kicker">Casi listo</p>
      <h1 className="titulo-2">Completa tu perfil</h1>
      <p className="texto-suave mt-2">
        Necesitamos tu dirección para enviarte los goodies de cada entrega.
      </p>

      <form onSubmit={guardar} className="mt-8 space-y-5">
        <div>
          <label htmlFor="nick" className="etiqueta">Nick</label>
          <input id="nick" type="text" value={nick} maxLength={30}
            onChange={(e) => setNick(e.target.value)} autoComplete="nickname" className="campo" />
        </div>

        <div>
          <label htmlFor="nombre" className="etiqueta">Nombre completo</label>
          <input id="nombre" type="text" value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)} autoComplete="name" className="campo" />
        </div>

        <div>
          <label htmlFor="direccion" className="etiqueta">Dirección postal</label>
          <textarea id="direccion" rows={3} value={direccion}
            onChange={(e) => setDireccion(e.target.value)} autoComplete="street-address" className="campo" />
        </div>

        <div>
          <label htmlFor="instrucciones" className="etiqueta">
            Instrucciones de entrega (opcional)
          </label>
          <textarea id="instrucciones" rows={2} value={instrucciones}
            placeholder="Por ejemplo: dejar en portería, llamar al timbre B..."
            onChange={(e) => setInstrucciones(e.target.value)} className="campo" />
        </div>

        <div>
          <label htmlFor="telefono" className="etiqueta">Teléfono (opcional)</label>
          <input id="telefono" type="tel" value={telefono}
            onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" className="campo" />
        </div>

        <div>
          <label htmlFor="conociste" className="etiqueta">
            ¿Cómo nos conociste? (opcional)
          </label>
          <select id="conociste" value={comoNosConociste}
            onChange={(e) => {
              setComoNosConociste(e.target.value);
              setComoDetalle("");
            }} className="campo">
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
            <label htmlFor="conociste-detalle" className="etiqueta">
              {PREGUNTA_DETALLE[comoNosConociste]} (opcional)
            </label>
            <input id="conociste-detalle" type="text" maxLength={100}
              value={comoDetalle}
              onChange={(e) => setComoDetalle(e.target.value)} className="campo" />
          </div>
        )}

        {!yaAceptoPrivacidad && (
          <label className="flex items-start gap-3 text-sm text-corte-pergamino/80">
            <input
              type="checkbox"
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

        {error && <p role="alert" className="aviso-error">{error}</p>}

        <button type="submit" disabled={guardando} className="boton boton-primario">
          {guardando ? "Guardando..." : "Guardar y entrar"}
        </button>
      </form>
    </main>
  );
}
