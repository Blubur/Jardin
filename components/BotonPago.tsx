"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Props = {
  tipo: "suscripcion" | "capitulo" | "portal" | "cancelar";
  capitulo?: number;
  className?: string;
  children: React.ReactNode;
};

const ENLACES: Record<string, string> = {
  suscripcion: "https://buy.stripe.com/5kQ6oG77e3Yl1jnah414401",
  "capitulo-1": "https://buy.stripe.com/8x2fZgdvC52pe693SG14402",
};

export default function BotonPago({ tipo, capitulo, className, children }: Props) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function pagar() {
    setError("");
    setCargando(true);

    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
      setCargando(false);
      router.push("/registro");
      return;
    }

    try {
      // Pagos: enlace directo de Stripe, sin correo prellenado
      if (tipo === "suscripcion" || tipo === "capitulo") {
        const clave = tipo === "suscripcion" ? "suscripcion" : `capitulo-${capitulo}`;
        const base = ENLACES[clave];
        if (!base) throw new Error("Este capítulo aún no está disponible para compra");

        const params = new URLSearchParams({
          client_reference_id: session.user.id,
        });
        window.location.href = `${base}?${params.toString()}`;
        return;
      }

      // Portal y cancelación siguen usando la API
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tipo, capitulo }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "No se pudo abrir el portal");
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