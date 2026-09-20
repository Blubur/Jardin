"use client";

import { useState } from "react";

const WHATSAPP = "34667643509"; 

export default function Contacto() {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");

  function enviar() {
    const texto = `Hola, soy ${nombre || "un/a lector/a"}. ${mensaje}`;
    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`,
      "_blank"
    );
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-10">
      <h1 className="corte-oro text-3xl mb-6">Contacto</h1>
      <div className="corte-pergamino p-6 space-y-4">
        <input
          className="campo w-full"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <textarea
          className="campo w-full"
          rows={5}
          placeholder="Tu mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
        <button className="boton" onClick={enviar} disabled={!mensaje.trim()}>
          Escribir por WhatsApp
        </button>
      </div>
    </main>
  );
}
