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

        {/* Contacto */}
        <div>
          <h4 className="font-display text-corte-pergamino">Contacto</h4>
          <ul className="mt-3 space-y-1 text-sm text-corte-pergamino/70">
            <li>
              <Link href="mailto:tu-correo@dominio.com" className="hover:text-corte-oro">
                tu-correo@dominio.com
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-corte-oro">
                Formulario de contacto
              </Link>
            </li>
          </ul>
        </div>

        {/* Pagos y redes */}
        <div>
          <h4 className="font-display text-corte-pergamino">Métodos de pago</h4>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs text-corte-pergamino/80">
            <li className="rounded-sm border border-corte-pergamino/30 px-2 py-1">Tarjeta</li>
            <li className="rounded-sm border border-corte-pergamino/30 px-2 py-1">Bizum</li>