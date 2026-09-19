"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Props = {
  tipo: "suscripcion" | "capitulo" | "portal";
  capitulo?: number;
  className?: string;
  children: React.ReactNode;
};

export default function BotonPago({ tipo, capitulo, className, children }: Props) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function pagar() {
    setError("");
    setCargando(true);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setCargando(false);
      router.push("/registro");
      return;
    }

    try {
      const res = await fetch(tipo === "portal" ? "/api/portal" : "/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tipo, capitulo }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || "No se pudo iniciar el pago");
      }
      window.location.href = json.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
      setCargando(false);
    }
  }

  return (
    <div>
      <button onClick={pagar} disabled={cargando} className={className}>
        {cargando ? "Redirigiendo..." : children}
      </button>
      {error && <p style={{ color: "#b00020", marginTop: 8 }}>{error}</p>}
    </div>
  );
}