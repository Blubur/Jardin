import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t text-base border-corte-oro/20">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h4 className="font-display text-lg text-corte-pergamino">Datos del titular</h4>
          <ul className="mt-3 space-y-1 text-base text-corte-pergamino/70">
            <li>María Gayarre </li>
            <li>veinticuatro0792@gmail.com</li>
            <li>España</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-corte-pergamino">Enlaces de interés</h4>
          <ul className="mt-3 space-y-1 text-base text-corte-pergamino/70">
            <li>
              <Link href="/#como-funciona" className="hover:text-corte-oro">
                Cómo funciona
              </Link>
            </li>
            <li>
              <Link href="/#planes" className="hover:text-corte-oro">
                Planes
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-corte-oro">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link href="/panel" className="hover:text-corte-oro">
                Mi panel
              </Link>
            </li>
            <li>
              <Link href="/registro" className="hover:text-corte-oro">
                Crear cuenta
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-corte-pergamino">Contacto</h4>
          <ul className="mt-3 space-y-1 text-base text-corte-pergamino/70">
            <li>
              <Link href="mailto:tu-correo@dominio.com" className="hover:text-corte-oro">
                veinticuatro0792@gmail.com
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-corte-oro">
                Formulario de contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-corte-pergamino">Métodos de pago</h4>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm text-corte-pergamino/80">
            <li className="rounded-sm border border-corte-pergamino/30 px-2 py-1">Tarjeta</li>
            <li className="rounded-sm border border-corte-pergamino/30 px-2 py-1">Bizum</li>
            <li className="rounded-sm border border-corte-pergamino/30 px-2 py-1">Stripe</li>
          </ul>

          <h4 className="mt-6 font-display text-lg text-corte-pergamino">Sígueme</h4>
          <Link
            href="https://www.tiktok.com/@tu_usuario"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="mt-3 inline-block text-corte-pergamino/70 transition hover:text-corte-oro"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
              <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.3V8.9a8.2 8.2 0 0 0 4.8 1.5V7a4.8 4.8 0 0 1-1-.3z" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="border-t border-corte-oro/20 px-6 py-6 text-center text-sm text-corte-pergamino/60">
        <p>
          <Link
            href="/politicas"
            className="underline underline-offset-4 hover:text-corte-pergamino"
          >
            Políticas (privacidad, cookies y condiciones de compra)
          </Link>
        </p>
        <p className="mt-2">
          © 2026 El Jardín de las Herederas. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}