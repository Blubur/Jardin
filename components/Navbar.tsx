import Link from "next/link";
import {
  SparklesIcon,
  CreditCardIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { PORTAL_STRIPE } from "@/lib/enlaces";

const enlace =
  "flex items-center gap-2 rounded-sm p-2 text-corte-pergamino/80 transition hover:text-corte-oro";
const icono = "h-6 w-6 shrink-0";

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-corte-oro/20 bg-corte-fondo/90 px-3 py-3 backdrop-blur sm:px-6 sm:py-4">
      <Link href="/" className="corte-oro font-semibold">
        <span className="hidden sm:inline">El Jardín de las Herederas</span>
        <span className="sm:hidden">El Jardín</span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-3">
        <Link href="/#como-funciona" className={`${enlace} hidden md:flex`}>
          <SparklesIcon className={icono} />
          <span>Cómo funciona</span>
        </Link>
        <Link href="/#planes" className={enlace} aria-label="Planes">
          <CreditCardIcon className={icono} />
          <span className="hidden sm:inline">Planes</span>
        </Link>
        <Link href="/catalogo" className={enlace} aria-label="Catálogo">
          <BookOpenIcon className={icono} />
          <span className="hidden sm:inline">Catálogo</span>
        </Link>
        <Link href="/#faq" className={enlace} aria-label="Preguntas frecuentes">
          <QuestionMarkCircleIcon className={icono} />
          <span className="hidden sm:inline">FAQ</span>
        </Link>
        <Link href="/contacto" className={enlace} aria-label="Contacto">
          <EnvelopeIcon className={icono} />
          <span className="hidden sm:inline">Contacto</span>
        </Link>
        {PORTAL_STRIPE && (
          <a
            href={PORTAL_STRIPE}
            target="_blank"
            rel="noopener noreferrer"
            className={enlace}
            aria-label="Gestionar suscripción"
          >
            <Cog6ToothIcon className={icono} />
            <span className="hidden lg:inline">Mi suscripción</span>
          </a>
        )}
      </div>
    </nav>
  );
}
