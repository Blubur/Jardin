"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, Perfil } from "@/lib/supabaseClient";

type Mensaje = { tipo: "ok" | "error"; texto: string } | null;

function Aviso({ mensaje }: { mensaje: Mensaje }) {
  if (!mensaje) return null;
  return (
    <p
      role={mensaje.tipo === "error" ? "alert" : "status"}
      className={mensaje.tipo === "ok" ? "aviso-ok" : "aviso-error"}
    >
      {mensaje.texto}
    </p>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [nick, setNick] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajePerfil, setMensajePerfil] = useState<Mensaje>(null);

  const [nuevaPass, setNuevaPass] = useState("");
  const [repetirPass, setRepetirPass] = useState("");
  const [cambiandoPass, setCambiandoPass] = useState(false);
  const [mensajePass, setMensajePass] = useState<Mensaje>(null);

  useEffect(() => {
    async function cargar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/registro");
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email ?? "");

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle<Perfil>();

      if (!perfil) {
        router.push("/completar-perfil");
        return;
      }

      setNick(perfil.nick ?? "");
      setNombreCompleto(perfil.nombre_completo ?? "");
      setDireccion(perfil.direccion_postal ?? "");
      setTelefono(perfil.telefono ?? "");
      setCargando(false);
    }

    cargar();
  }, [router]);

  async function guardarPerfil(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensajePerfil(null);

    const nickLimpio = nick.trim();
    const nombreLimpio = nombreCompleto.trim();
    const direccionLimpia = direccion.trim();
    const telefonoLimpio = telefono.trim();

    if (nickLimpio.length < 3 || nickLimpio.length > 30) {
      setMensajePerfil({ tipo: "error", texto: "El nick debe tener entre 3 y 30 caracteres." });
      return;
    }
    if (nombreLimpio.length < 2) {
      setMensajePerfil({ tipo: "error", texto: "Escribe tu nombre completo." });
      return;
    }
    if (direccionLimpia.length < 10) {
      setMensajePerfil({
        tipo: "error",
        texto: "Escribe tu dirección postal completa (calle, número, código postal, ciudad y país).",
      });
      return;
    }
    if (telefonoLimpio && !/^[+\d][\d\s().-]{6,19}$/.test(telefonoLimpio)) {
      setMensajePerfil({ tipo: "error", texto: "El teléfono no parece válido." });
      return;
    }

    setGuardando(true);
    const { data, error } = await supabase
      .from("perfiles")
      .update({
        nick: nickLimpio,
        nombre_completo: nombreLimpio,
        direccion_postal: direccionLimpia,
        telefono: telefonoLimpio || null,
      })
      .eq("user_id", userId)
      .select("user_id");
    setGuardando(false);

    if (error) {
      setMensajePerfil({
        tipo: "error",
        texto:
          error.code === "23505"
            ? "Ese nick ya está en uso. Prueba con otro."
            : "No se pudieron guardar los cambios. Inténtalo de nuevo.",
      });
      return;
    }

    // Si la política de seguridad no permite actualizar, Supabase no da error: devuelve 0 filas.
    if (!data || data.length === 0) {
      setMensajePerfil({
        tipo: "error",
        texto: "No se pudo guardar: falta el permiso de actualización en la base de datos.",
      });
      return;
    }

    setNick(nickLimpio);
    setNombreCompleto(nombreLimpio);
    setDireccion(direccionLimpia);
    setTelefono(telefonoLimpio);
    setMensajePerfil({ tipo: "ok", texto: "Cambios guardados." });
  }

  async function cambiarContrasena(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensajePass(null);

    if (nuevaPass.length < 8) {
      setMensajePass({ tipo: "error", texto: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    if (nuevaPass !== repetirPass) {
      setMensajePass({ tipo: "error", texto: "Las contraseñas no coinciden." });
      return;
    }

    setCambiandoPass(true);
    const { error } = await supabase.auth.updateUser({ password: nuevaPass });
    setCambiandoPass(false);

    if (error) {
      const distinta = error.message.toLowerCase().includes("different");
      setMensajePass({
        tipo: "error",
        texto: distinta
          ? "La nueva contraseña debe ser distinta de la actual."
          : "No se pudo cambiar la contraseña. Cierra sesión, vuelve a entrar e inténtalo de nuevo.",
      });
      return;
    }

    setNuevaPass("");
    setRepetirPass("");
    setMensajePass({ tipo: "ok", texto: "Contraseña actualizada." });
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/registro");
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-corte-pergamino/60">Cargando tu perfil...</p>
      </main>
    );
  }

  return (
    <main className="contenedor-estrecho">
      <div className="flex items-start justify-between">
        <div>
          <p className="kicker">Tu Corte</p>
          <h1 className="titulo-2">Mi perfil</h1>
        </div>
        <button
          onClick={cerrarSesion}
          className="text-sm text-corte-pergamino/60 underline underline-offset-4 hover:text-corte-pergamino"
        >
          Cerrar sesión
        </button>
      </div>

      <p className="mt-4">
        <Link
          href="/panel"
          className="text-sm text-corte-pergamino/70 underline underline-offset-4 hover:text-corte-pergamino"
        >
          ← Volver al panel
        </Link>
      </p>

      <section className="mt-10 border-t border-corte-oro/20 pt-10">
        <h2 className="titulo-3">Tus datos</h2>
        <p className="texto-suave mt-2">
          Usamos tu dirección solo para enviarte los goodies de cada entrega.
        </p>

        <form onSubmit={guardarPerfil} className="mt-6 space-y-5">
          <div>
            <label htmlFor="nick" className="etiqueta">Nick</label>
            <input
              id="nick"
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              autoComplete="nickname"
              maxLength={30}
              className="campo"
            />
          </div>

          <div>
            <label htmlFor="nombre" className="etiqueta">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              autoComplete="name"
              className="campo"
            />
          </div>

          <div>
            <label htmlFor="direccion" className="etiqueta">Dirección postal</label>
            <textarea
              id="direccion"
              rows={3}
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              autoComplete="street-address"
              className="campo"
            />
          </div>

          <div>
            <label htmlFor="telefono" className="etiqueta">Teléfono (opcional)</label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              autoComplete="tel"
              className="campo"
            />
          </div>

          <Aviso mensaje={mensajePerfil} />

          <button type="submit" disabled={guardando} className="boton boton-primario">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>

      <section className="mt-12 border-t border-corte-oro/20 pt-10">
        <h2 className="titulo-3">Tu cuenta</h2>

        <div className="mt-6">
          <label htmlFor="email" className="etiqueta">Correo electrónico</label>
          <input id="email" type="email" value={email} disabled className="campo" />
          <p className="texto-suave mt-2">
            El correo no se puede cambiar desde aquí porque está ligado a tus pagos.
            Si necesitas cambiarlo, escríbenos.
          </p>
        </div>

        <form onSubmit={cambiarContrasena} className="mt-8 space-y-5">
          <h3 className="font-display text-lg text-corte-pergamino">Cambiar contraseña</h3>

          <div>
            <label htmlFor="nueva" className="etiqueta">Nueva contraseña</label>
            <input
              id="nueva"
              type="password"
              value={nuevaPass}
              onChange={(e) => setNuevaPass(e.target.value)}
              autoComplete="new-password"
              className="campo"
            />
          </div>

          <div>
            <label htmlFor="repetir" className="etiqueta">Repite la nueva contraseña</label>
            <input
              id="repetir"
              type="password"
              value={repetirPass}
              onChange={(e) => setRepetirPass(e.target.value)}
              autoComplete="new-password"
              className="campo"
            />
          </div>

          <Aviso mensaje={mensajePass} />

          <button type="submit" disabled={cambiandoPass} className="boton boton-secundario">
            {cambiandoPass ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </section>
    </main>
  );
}