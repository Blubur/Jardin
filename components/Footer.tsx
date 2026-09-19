import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-corte-oro/20">
      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {/* Mis datos */}
        <div>
          <h4 className="font-display text-corte-pergamino">Datos del titular</h4>
          <ul className="mt-3 space-y-1 text-sm text-corte-pergamino/70">
            <li>Pilar Higuera (Blu)</li>
            <li>NIF: [tu NIF]</li>
            <li>[Tu dirección postal]</li>
            <li>[Ciudad, país]</li>
          </ul>
        </div>

        {/* Enlaces de interés */}
        <div>
          <h4 className="font-display text-corte-pergamino">Enlaces de interés</h4>
          <ul className="mt-3 space-y-1 text-sm text-corte-pergamino/70">
            <li><Link href="/#como-funciona" className="hover:text-corte-oro">Cómo funciona</Link></li>
            <li><Link href="/#planes" className="hover:text-corte-oro">Planes</Link></li>
            <li><Link href="/panel" className="hover:text-corte-oro">Mi panel</Link></li>
            <li><Link href="/registro" className="hover:text-corte-oro">Crear cuenta</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="font-display text-corte-pergamino">Contacto</h4>
          <ul className="mt-3 space-y-1 text-sm text-corte-pergamino/70">
            <li>
              <a href="mailto:[tu-correo@dominio.com]" className="hover:text-corte-oro">
                [tu-correo@dominio.com]
              </a>
            </li>
            <li><Link href="/contacto" className="hover:text-corte-oro">Formulario de contacto</Link></li>
          </ul>
        </div>

        {/* Pagos y redes */}
        <div>
          <h4 className="font-display text-corte-pergamino">Métodos de pago</h4>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs text-corte-pergamino/80">
            {["Tarjeta", "Bizum", "Stripe"].map((m) => (
              <li key={m} className="rounded-sm border border-corte-pergamino/30 px-2 py-1">
                {m}
              </li>
            ))}
          </ul>

          <h4 className="mt-6 font-display text-corte-pergamino">Sígueme</h4>
          
            href="https://www.tiktok.com/@[tu_usuario]"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="mt-3 inline-block text-corte-pergamino/70 transition hover:text-corte-oro"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
              <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.3V8.9a8.2 8.2 0 0 0 4.8 1.5V7a4.8 4.8 0 0 1-1-.3z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="border-t border-corte-oro/20 px-6 py-6 text-center text-xs text-corte-pergamino/60">
        <p>
          <Link href="/politicas" className="underline underline-offset-4 hover:text-corte-pergamino">
            Políticas (privacidad, cookies y condiciones de compra)
          </Link>
        </p>
        <p className="mt-2">© 2026 El Jardín de las Herederas. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}