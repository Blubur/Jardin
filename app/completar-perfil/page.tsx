"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState("");
  const [nick, setNick] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
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

      if (perfil?.direccion_postal) {
        router.push("/panel");
        return;
      }

      // Rellena lo que ya exista (por ejemplo, un nick puesto al registrarse).
      setNick(perfil?.nick ?? "");
      setNombreCompleto(perfil?.nombre_completo ?? "");
      setDireccion(perfil?.direccion_postal ?? "");
      setTelefono(perfil?.telefono ?? "");
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

    setGuardando(true);
    // upsert: crea la fila si no existe y la actualiza si ya existe.
    const { error } = await supabase.from("perfiles").upsert(
      {
        user_id: userId,
        nick: nickLimpio,
        nombre_completo: nombreLimpio,
        direccion_postal: direccionLimpia,
        telefono: telefonoLimpio || null,
      },
      { onConflict: "user_id" }
    );
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
          <label htmlFor="telefono" className="etiqueta">Teléfono (opcional)</label>
          <input id="telefono" type="tel" value={telefono}
            onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" className="campo" />
        </div>

        {error && <p role="alert" className="aviso-error">{error}</p>}

        <button type="submit" disabled={guardando} className="boton boton-primario">
          {guardando ? "Guardando..." : "Guardar y entrar"}
        </button>
      </form>
    </main>
  );
}