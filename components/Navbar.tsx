"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpenIcon,
  ShoppingBagIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  UserIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";

const enlace =
  "flex items-center gap-2 rounded-sm p-2 text-corte-pergamino/80 transition hover:text-corte-oro";
const icono = "h-6 w-6 shrink-0";

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
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/80 px-3 py-3 backdrop-blur sm:px-6 sm:py-4">
      <Link href="/" className="corte-oro font-semibold">
        <span className="hidden sm:inline">El Jardín de las Herederas</span>
        <span className="sm:hidden">El Jardín</span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-3">
        <Link href="/catalogo" className={enlace} aria-label="Catálogo">
          <BookOpenIcon className={icono} />
          <span className="hidden sm:inline">Catálogo</span>
        </Link>
        <Link href="/carrito" className={enlace} aria-label="Tu pedido">
          <ShoppingBagIcon className={icono} />
          <span className="hidden sm:inline">Tu pedido</span>
        </Link>
        <Link href="/faq" className={enlace} aria-label="Preguntas frecuentes">
          <QuestionMarkCircleIcon className={icono} />
          <span className="hidden sm:inline">FAQ</span>
        </Link>
        <Link href="/contacto" className={enlace} aria-label="Contacto">
          <EnvelopeIcon className={icono} />
          <span className="hidden sm:inline">Contacto</span>
        </Link>
        {conectado ? (
          <Link href="/panel" className={enlace} aria-label="Mi perfil">
            <UserCircleIcon className={icono} />
            <span className="hidden sm:inline">Mi perfil</span>
          </Link>
        ) : (
          <Link href="/registro?modo=login" className={enlace} aria-label="Entrar">
            <UserIcon className={icono} />
            <span className="hidden sm:inline">Entrar</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
