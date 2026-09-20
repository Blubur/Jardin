"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CORREO = "tu-correo@dominio.com";

export default function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState<string | null>(null);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      setError("Rellena tu nombre, tu correo y el mensaje.");
      return;
    }

    const cuerpo = `Nombre: ${nombre.trim()}\nCorreo: ${email.trim()}\n\n${mensaje.trim()}`;
    const asuntoFinal = asunto.trim() || "Consulta desde la web";

    window.location.href = `mailto:${CORREO}?subject=${encodeURIComponent(
      asuntoFinal
    )}&body=${encodeURIComponent(cuerpo)}`;
  }

  return (
    <>
   
      <main className="contenedor-estrecho pt-24">
        <p className="kicker">Escríbenos</p>
        <h1 className="titulo-2">Contacto</h1>
        <p className="mt-3 texto">
          Para dudas sobre envíos, pagos por Bizum, tu suscripción o cualquier
          otra cosa. Al enviar se abrirá tu programa de correo con el mensaje
          ya preparado.
        </p>

        <form onSubmit={enviar} className="mt-8 space-y-5">
          <div>
            <label htmlFor="nombre" className="etiqueta">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              className="campo"
            />
          </div>

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
            <label htmlFor="asunto" className="etiqueta">Asunto (opcional)</label>
            <input
              id="asunto"
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              className="campo"
            />
          </div>

          <div>
            <label htmlFor="mensaje" className="etiqueta">Mensaje</label>
            <textarea
              id="mensaje"
              rows={6}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="campo"
            />
          </div>

          {error && <p role="alert" className="aviso-error">{error}</p>}

          <button type="submit" className="boton boton-primario">
            Enviar mensaje
          </button>
        </form>

        <p className="mt-8 texto-suave">
          Si el botón no abre tu correo, escríbenos directamente a {CORREO}.
        </p>
      </main>
      
    </>
  );
}
