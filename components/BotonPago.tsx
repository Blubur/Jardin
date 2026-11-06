"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type Props = {
  tipo: "suscripcion" | "suscripcion-internacional" | "capitulo" | "portal" | "cancelar";
  capitulo?: number;
  className?: string;
  children: React.ReactNode;
};

const ENLACES: Record<string, string> = {
  suscripcion: "https://buy.stripe.com/7sY9AS3V29iFaTXdtg14403",
  // Pega aquí el Payment Link de Stripe de la suscripción internacional (21 €/mes)
  "suscripcion-internacional": "",
  "capitulo-1": "https://buy.stripe.com/bJeaEWcry7ax2nrdtg14404",
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
      if (tipo === "suscripcion" || tipo === "suscripcion-internacional" || tipo === "capitulo") {
        const clave = tipo === "capitulo" ? `capitulo-${capitulo}` : tipo;
        const base = ENLACES[clave];
        if (!base) throw new Error("Esta opción aún no está disponible para compra");

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