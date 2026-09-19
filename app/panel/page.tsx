"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Suscripcion, Perfil } from "@/lib/supabaseClient";
import BotonPago from "@/components/BotonPago";

const ESTADOS: Record<string, string> = {
  active: "Activa",
  trialing: "En periodo de prueba",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Impagada",
  incomplete: "Incompleta",
  incomplete_expired: "Caducada",
  paused: "Pausada",
};

const PLANES: Record<string, string> = {
  mensual: "Suscripción mensual",
};

export default function PanelPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [capitulosComprados, setCapitulosComprados] = useState<number[]>([]);
  const [pagoOk, setPagoOk] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setPagoOk(
        new URLSearchParams(window.location.search).get("pago") === "ok"
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/registro");
        return;
      }

      setEmail(session.user.email ?? null);

      // El perfil (dirección postal obligatoria) se comprueba antes de
      // dejar entrar al panel. Si no existe fila o falta la dirección,
      // se manda a la usuaria a completarlo primero.
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle<Perfil>();

      if (!perfil || !perfil.direccion_postal) {
        router.push("/completar-perfil");
        return;
      }

      // Una fila por usuaria, mantenida por el webhook de Stripe.
      const { data } = await supabase
        .from("suscripciones")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setSuscripcion(data);

      // Capítulos sueltos comprados (también los escribe el webhook).
      const { data: compras } = await supabase
        .from("compras")
        .select("capitulo")
        .eq("user_id", session.user.id)
        .order("capitulo",