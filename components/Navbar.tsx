import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-corte-oro/20 bg-corte-fondo/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg text-corte-oro">
          El Jardín de las Herederas
        </Link>

        <ul className="flex items-center gap-6 text-sm text-corte-pergamino/80">
          <li>
            <Link href="/login" className="transition hover:text-corte-oro">
              Conectate
            </Link>
            </li>
            <li>
            <Link href="/perfil" className="transition hover:text-corte-oro">
              Perfil
            </Link>
          </li>
          <li>
            <Link href="/carrito" className="transition hover:text-corte-oro">
              Carrito
            </Link>
          </li>
          <li>
            <Link href="/contacto" className="transition hover:text-corte-oro">
              Contacto
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}