"use client";

import { useEffect, useState } from "react";

export default function CuentaAtras({ fecha }: { fecha: string }) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    function calcular() {
      const fin = new Date(`${fecha}T23:59:59`).getTime();
      const resto = fin - Date.now();
      if (isNaN(fin) || resto <= 0) {
        setTexto("");
        return;
      }
      const dias = Math.floor(resto / 86400000);
      const horas = Math.floor((resto % 86400000) / 3600000);
      if (dias === 0) {
        setTexto(`¡Último día! Quedan ${horas} ${horas === 1 ? "hora" : "horas"}`);
      } else {
        setTexto(
          `Quedan ${dias} ${dias === 1 ? "día" : "días"} y ${horas} ${horas === 1 ? "hora" : "horas"}`
        );
      }
    }
    calcular();
    const id = setInterval(calcular, 60000);
    return () => clearInterval(id);
  }, [fecha]);

  if (!texto) return null;
  return <span className="font-medium text-corte-oro">{texto}</span>;
}
