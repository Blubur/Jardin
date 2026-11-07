import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";

const enlace = "hover:text-corte-oro";
const titulo = "font-display text-lg text-corte-pergamino";
const lista = "mt-3 space-y-1 text-base text-corte-pergamino/70";

export default function Footer() {
  return (
    <footer className="pie-web mt-24 text-base">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h4 className={titulo}>El Jardín de las Herederas</h4>
          <p className="mt-3 text-base text-corte-pergamino/70">
            Una entrega mensual de El Jardín de las Herederas: un capítulo nuevo y su
            papelería temática, escritos y preparados por una sola persona.
          </p>
          <ul className={lista}>
            <li>María Gayarre</li>
            <li>España</li>
          </ul>
        </div>

        <div>
          <h4 className={titulo}>Explora</h4>
          <ul className={lista}>
            <li><Link href="/#como-funciona" className={enlace}>Cómo funciona</Link></li>
            <li><Link href="/#planes" className={enlace}>Planes</Link></li>
            <li><Link href="/catalogo" className={enlace}>Catálogo de capítulos</Link></li>
            <li><Link href="/faq" className={enlace}>Preguntas frecuentes</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={titulo}>Información legal</h4>
          <ul className={lista}>
            <li><Link href="/politicas#aviso-legal" className={enlace}>Aviso legal</Link></li>
            <li><Link href="/politicas#privacidad" className={enlace}>Política de privacidad</Link></li>
            <li><Link href="/politicas#cookies" className={enlace}>Política de cookies</Link></li>
            <li><Link href="/politicas#compra" className={enlace}>Condiciones de compra</Link></li>
            <li><Link href="/politicas#compra" className={enlace}>Envíos y desistimiento (14 días)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={titulo}>Contacto</h4>
          <ul className={lista}>
            <li>
              <a href="mailto:veinticuatro0792@gmail.com" className={enlace}>
                veinticuatro0792@gmail.com
              </a>
            </li>
            <li><Link href="/contacto" className={enlace}>Escríbeme por WhatsApp</Link></li>
          </ul>

          <h4 className={`mt-6 ${titulo}`}>Sígueme y apoya</h4>
          <div className="mt-3 flex items-center gap-5 text-3xl text-corte-pergamino/70">
            <a
              href="https://www.tiktok.com/@lilimuun"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              title="TikTok"
              className="transition hover:text-corte-oro"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
                <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.3V8.9a8.2 8.2 0 0 0 4.8 1.5V7a4.8 4.8 0 0 1-1-.3z" />
              </svg>
            </a>
            <a
              href="https://ko-fi.com/bluuri"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ko-fi"
              title="Invítame a un café en Ko-fi"
              className="transition hover:text-corte-oro"
            >
              <HeartIcon className="h-7 w-7" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-corte-oro/20 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm text-corte-pergamino/80">Pago seguro</p>
            <ul className="mt-2 flex flex-wrap justify-center gap-2 text-sm text-corte-pergamino/80 sm:justify-start">
              <li className="rounded-sm border border-corte-pergamino/30 px-2 py-1">Tarjeta</li>
              <li className="rounded-sm border border-corte-pergamino/30 px-2 py-1">Procesado por Stripe</li>
              <li className="rounded-sm border border-corte-pergamino/30 px-2 py-1">Bizum (solo capítulos sueltos)</li>
            </ul>
          </div>
          <p className="max-w-md text-sm text-corte-pergamino/60">
            No guardamos los datos de tu tarjeta. Cancela tu suscripción
            cuando quieras desde el portal seguro de Stripe.
          </p>
        </div>
      </div>

      <div className="border-t border-corte-oro/20 px-6 py-6 text-center text-sm text-corte-pergamino/60">
        <p>© 2026 El Jardín de las Herederas. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
