"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setConectado(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, session) => {
      setConectado(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur">
      <Link href="/" className="corte-oro font-semibold">El Jardín de las Herederas</Link>
      <div className="flex gap-5 items-center">
        <Link href="/catalogo">Catálogo</Link>
        <Link href="/carrito">Tu pedido</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contacto">Contacto</Link>
        {conectado ? (
          <Link href="/perfil">Mi perfil</Link>
        ) : (
          <Link href="/registro?modo=login">Entrar</Link>
        )}
      </div>
    </nav>
  );
}
