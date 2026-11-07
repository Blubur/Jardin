#!/bin/bash
# Restaura todos los cambios de la conversación. Ejecutar desde la raíz del proyecto:
#   bash restaurar.sh
set -e

if [ ! -f package.json ] || [ ! -d app ]; then
  echo "Ejecuta este script desde la raíz del proyecto (donde está package.json)."
  exit 1
fi

mkdir -p components lib app/catalogo app/carrito app/politicas

# ---------- components/Reveal.tsx ----------
cat > components/Reveal.tsx <<'EOF'
"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  className = "",
  retraso = 0,
}: {
  children: React.ReactNode;
  className?: string;
  retraso?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${retraso}ms` }}
      className={`reveal ${visible ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
EOF

# ---------- app/globals.css (solo añade si no está ya) ----------
if ! grep -q "Home de scroll continuo" app/globals.css; then
cat >> app/globals.css <<'EOF'

/* ===== Home de scroll continuo ===== */
html {
  scroll-behavior: smooth;
  scroll-padding-top: 6rem; /* la navbar es fija */
}

.banda-clara {
  background-color: rgb(var(--corte-fondo2) / 0.75);
  border-top: 1px solid rgb(var(--corte-salvia) / 0.6);
  border-bottom: 1px solid rgb(var(--corte-salvia) / 0.6);
}
.banda-salvia {
  background-color: rgb(var(--corte-salvia) / 0.22);
}

.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
EOF
fi

# ---------- app/page.tsx ----------
cat > app/page.tsx <<'EOF'
import Link from "next/link";
import BotonPago from "@/components/BotonPago";
import Galeria from "@/components/Galeria";
import Reveal from "@/components/Reveal";
import { cargarContenido } from "@/lib/contenido";
import { defecto } from "@/lib/camposEditables";
import { supabase } from "@/lib/supabaseClient";
import { CAPITULOS } from "@/lib/catalogo";

export const revalidate = 0;

// Textos de las secciones nuevas (cuando quieras, los pasamos al panel de admin)
const NUEVOS: Record<string, string> = {
  "edicion.kicker": "La entrega en curso",
  "edicion.titulo": "Así llega tu sobre",
  "edicion.texto":
    "Cada mes recibes en tu buzón un capítulo nuevo de La Corte Errante y la papelería que lo acompaña, lejos de las prisas de las pantallas.",
  "incluye.titulo": "En cada entrega encontrarás",
  "incluye.1.titulo": "Un capítulo nuevo",
  "incluye.1.texto": "La historia de Alondra y la Corte, impresa y lista para leer.",
  "incluye.2.titulo": "Papelería temática",
  "incluye.2.texto": "Pequeños objetos del mundo del capítulo para leer de forma más inmersiva.",
  "incluye.3.titulo": "Una carta de Irula",
  "incluye.3.texto": "La archivista de la Corte te cuenta lo que no sale en el capítulo.",
  "incluye.4.titulo": "Ficha y calendario",
  "incluye.4.texto": "Una ficha de personaje y el mes del calendario, en tamaño pequeño.",
  "quien.kicker": "Detrás de la Corte",
  "quien.titulo": "¿Quién escribe estas cartas?",
  "quien.texto":
    "Soy Blu. Escribo La Corte Errante, la imprimo, la preparo y la envío yo sola, a lo largo del mes y con mucho mimo.\n\nQuería que la historia llegara en papel, a tu buzón, como se recibía antes una carta.",
  "faq.titulo": "Preguntas frecuentes",
  "final.titulo": "Tu sitio en la Corte te espera",
  "final.texto": "Suscríbete y recibe el próximo capítulo en tu buzón.",
};

export default async function Home() {
  const c = await cargarContenido();
  const t = (clave: string) => c[clave] || NUEVOS[clave] || defecto(clave);

  const { data: faqsData } = await supabase
    .from("faqs")
    .select("id, pregunta, respuesta")
    .order("orden", { ascending: true });
  const faqs = faqsData ?? [];

  const disponibles = CAPITULOS.filter((x) => x.disponible);
  const capActual = disponibles[disponibles.length - 1];
  const imagenHero = c["home.imagen"];

  return (
    <main>
      {/* 1. Portada */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal>
            <p className="kicker mb-4">{t("home.kicker")}</p>
            <h1 className="titulo-1">{t("home.titulo")}</h1>
            <p className="texto-destacado mt-6 whitespace-pre-line">{t("home.intro")}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="#planes" className="boton boton-primario">
                Suscríbete
              </Link>
              <Link href="#como-funciona" className="boton boton-secundario">
                ¿Cómo funciona?
              </Link>
            </div>
          </Reveal>

          {imagenHero && (
            <Reveal retraso={150}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagenHero}
                alt="El Jardín de las Herederas"
                className="w-full rounded-sm border border-corte-oro/30 object-cover"
              />
            </Reveal>
          )}
        </div>
      </section>

      {/* 2. Entrega en curso */}
      {capActual && capActual.imagenes.length > 0 && (
        <section id="entrega" className="banda-clara">
          <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 md:grid-cols-2">
            <Reveal>
              <Galeria imagenes={capActual.imagenes} alt={`Capítulo ${capActual.numero}`} />
            </Reveal>
            <Reveal retraso={150}>
              <p className="kicker">{t("edicion.kicker")}</p>
              <h2 className="titulo-2 mt-2">{t("edicion.titulo")}</h2>
              <p className="texto mt-4 whitespace-pre-line">{t("edicion.texto")}</p>
              <Link href="/catalogo" className="boton boton-secundario mt-8">
                Ver el catálogo de capítulos
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* 3. Qué incluye */}
      <section id="incluye" className="mx-auto max-w-5xl px-6 py-20">
        <Reveal>
          <h2 className="titulo-2">{t("incluye.titulo")}</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <Reveal key={n} retraso={n * 80}>
              <div className="tarjeta h-full">
                <h3 className="titulo-3">{t(`incluye.${n}.titulo`)}</h3>
                <p className="texto-suave mt-2 text-base">{t(`incluye.${n}.texto`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4. Cómo funciona */}
      <section id="como-funciona" className="banda-salvia">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <Reveal>
            <h2 className="titulo-2">{t("como.titulo")}</h2>
            <p className="texto mt-3 whitespace-pre-line">{t("como.intro")}</p>
          </Reveal>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <li key={n}>
                <Reveal retraso={n * 100}>
                  <span className="font-display text-5xl text-corte-oro">{n}</span>
                  <h3 className="titulo-3 mt-2">{t(`como.paso${n}.titulo`)}</h3>
                  <p className="mt-2 whitespace-pre-line text-corte-pergamino/75">
                    {t(`como.paso${n}.texto`)}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Quién está detrás */}
      <section id="quien" className="mx-auto max-w-3xl px-6 py-20 text-center">
        <Reveal>
          <p className="kicker">{t("quien.kicker")}</p>
          <h2 className="titulo-2 mt-2">{t("quien.titulo")}</h2>
          <div className="mt-6 space-y-4">
            {t("quien.texto")
              .split("\n\n")
              .map((p, i) => (
                <p key={i} className="text-lg leading-relaxed text-corte-pergamino/80">
                  {p}
                </p>
              ))}
          </div>
        </Reveal>
      </section>

      {/* 6. Planes */}
      <section id="planes" className="banda-clara">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <Reveal>
            <h2 className="titulo-2">{t("planes.titulo")}</h2>
            <p className="texto mt-3 whitespace-pre-line">{t("planes.intro")}</p>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <Reveal>
              <div className="tarjeta h-full">
                <h3 className="titulo-3">{t("sub.nombre")}</h3>
                <p className="precio mt-2">
                  {t("sub.precio")}{" "}
                  <span className="text-base text-corte-pergamino/60">{t("sub.periodo")}</span>
                </p>
                {t("sub.nota") && (
                  <p className="texto-suave mt-1 whitespace-pre-line">{t("sub.nota")}</p>
                )}
                <p className="mt-4 flex-1 whitespace-pre-line text-base text-corte-pergamino/75">
                  {t("sub.descripcion")}
                </p>
                <div className="mt-6">
                  <BotonPago
                    tipo="suscripcion"
                    className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
                  >
                    {t("sub.boton")}
                  </BotonPago>
                </div>
              </div>
            </Reveal>

            <Reveal retraso={100}>
              <div className="tarjeta h-full">
                <h3 className="titulo-3">{t("sub2.nombre")}</h3>
                <p className="precio mt-2">
                  {t("sub2.precio")}{" "}
                  <span className="text-base text-corte-pergamino/60">{t("sub2.periodo")}</span>
                </p>
                {t("sub2.nota") && (
                  <p className="texto-suave mt-1 whitespace-pre-line">{t("sub2.nota")}</p>
                )}
                <p className="mt-4 flex-1 whitespace-pre-line text-base text-corte-pergamino/75">
                  {t("sub2.descripcion")}
                </p>
                <div className="mt-6">
                  <BotonPago
                    tipo="suscripcion-internacional"
                    className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
                  >
                    {t("sub2.boton")}
                  </BotonPago>
                </div>
              </div>
            </Reveal>

            <Reveal retraso={200}>
              <div className="tarjeta h-full">
                <h3 className="titulo-3">{t("cap.nombre")}</h3>
                <p className="precio mt-2">{t("cap.precio")}</p>
                <p className="texto-suave mt-1 whitespace-pre-line">{t("cap.nota")}</p>
                <p className="mt-4 flex-1 whitespace-pre-line text-base text-corte-pergamino/75">
                  {t("cap.descripcion")}
                </p>
                <div className="mt-6">
                  <BotonPago
                    tipo="capitulo"
                    capitulo={1}
                    className="w-full rounded-sm border border-corte-pergamino/30 px-6 py-3 text-corte-pergamino transition hover:border-corte-pergamino/60 disabled:opacity-60"
                  >
                    {t("cap.boton")}
                  </BotonPago>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 7. Preguntas frecuentes */}
      {faqs.length > 0 && (
        <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
          <Reveal>
            <h2 className="titulo-2">{t("faq.titulo")}</h2>
            <div className="mt-8 divide-y divide-corte-oro/20 border-y border-corte-oro/20">
              {faqs.map((item) => (
                <details key={item.id} className="py-5">
                  <summary className="faq-resumen titulo-3">
                    <span className="flor" aria-hidden="true">
                      ꕤ
                    </span>
                    {item.pregunta}
                  </summary>
                  <div className="mt-3 space-y-3">
                    {item.respuesta.split("\n\n").map((parrafo: string, i: number) => (
                      <p key={i} className="texto">
                        {parrafo}
                      </p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
            <p className="texto-suave mt-8">
              ¿Tienes otra duda?{" "}
              <Link href="/contacto" className="underline underline-offset-4 hover:text-corte-pergamino">
                Escríbeme desde Contacto
              </Link>
              .
            </p>
          </Reveal>
        </section>
      )}

      {/* 8. Llamada final */}
      <section className="banda-salvia">
        <Reveal className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="titulo-2">{t("final.titulo")}</h2>
          <p className="texto mx-auto mt-4">{t("final.texto")}</p>
          <Link href="#planes" className="boton boton-primario mt-8">
            Ver los planes
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
EOF

# ---------- lib/enlaces.ts (no pisa tu enlace si ya lo habías pegado) ----------
if [ ! -f lib/enlaces.ts ]; then
cat > lib/enlaces.ts <<'EOF'
// Enlace de acceso al portal de clientes de Stripe (Ajustes > Facturación > Portal de clientes > "Enlace de inicio de sesión").
// Con él, cada clienta pone su correo, Stripe le manda un enlace y puede ver facturas, cambiar la tarjeta o cancelar.
export const PORTAL_STRIPE = "";
EOF
fi

# ---------- components/Navbar.tsx ----------
cat > components/Navbar.tsx <<'EOF'
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
EOF

# ---------- components/BotonPago.tsx (conserva tus enlaces de Stripe si ya los cambiaste) ----------
LINK_SUB=$(grep -oE 'suscripcion: "[^"]*"' components/BotonPago.tsx 2>/dev/null | head -1 | sed -E 's/suscripcion: "(.*)"/\1/' || true)
LINK_INT=$(grep -oE '"suscripcion-internacional": "[^"]*"' components/BotonPago.tsx 2>/dev/null | head -1 | sed -E 's/.*: "(.*)"/\1/' || true)
LINK_CAP=$(grep -oE '"capitulo-1": "[^"]*"' components/BotonPago.tsx 2>/dev/null | head -1 | sed -E 's/.*: "(.*)"/\1/' || true)
[ -z "$LINK_SUB" ] && LINK_SUB="https://buy.stripe.com/7sY9AS3V29iFaTXdtg14403"
[ -z "$LINK_CAP" ] && LINK_CAP="https://buy.stripe.com/bJeaEWcry7ax2nrdtg14404"

cat > components/BotonPago.tsx <<EOF
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
  suscripcion: "$LINK_SUB",
  // Pega aquí el Payment Link de Stripe de la suscripción internacional (21 €/mes)
  "suscripcion-internacional": "$LINK_INT",
  "capitulo-1": "$LINK_CAP",
};

export default function BotonPago({ tipo, capitulo, className, children }: Props) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function pagar() {
    setError("");

    // Pagos: directo a Stripe, sin cuenta ni sesión
    if (tipo === "suscripcion" || tipo === "suscripcion-internacional" || tipo === "capitulo") {
      const clave = tipo === "capitulo" ? \`capitulo-\${capitulo}\` : tipo;
      const enlace = ENLACES[clave];
      if (!enlace) {
        setError("Esta opción aún no está disponible para compra");
        return;
      }
      setCargando(true);
      window.location.href = enlace;
      return;
    }

    // Portal y cancelación (solo las usa el antiguo /panel)
    setCargando(true);
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session) {
      setCargando(false);
      router.push("/registro?modo=login");
      return;
    }

    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${session.access_token}\`,
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
EOF

# ---------- app/catalogo/page.tsx ----------
cat > app/catalogo/page.tsx <<'EOF'
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BotonPago from "@/components/BotonPago";
import Galeria from "@/components/Galeria";
import { CAPITULOS } from "@/lib/catalogo";

type Capitulo = {
  numero: number;
  titulo: string;
  descripcion: string;
  precio: string;
  imagenes: string[];
  disponible: boolean;
};

const CAPITULOS_RESPALDO: Capitulo[] = CAPITULOS.map((c) => ({
  numero: c.numero,
  titulo: c.titulo,
  descripcion: c.descripcion,
  precio: `${c.precio.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €`,
  imagenes: c.imagenes,
  disponible: c.disponible,
}));

const BTN_PRIMARIO =
  "w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60";

export default function CatalogoPage() {
  const [capitulos, setCapitulos] = useState<Capitulo[]>(CAPITULOS_RESPALDO);

  useEffect(() => {
    async function cargar() {
      const { data: filas, error } = await supabase
        .from("catalogo")
        .select("numero, titulo, descripcion, precio, imagenes, disponible")
        .order("numero", { ascending: true });
      if (!error && filas && filas.length > 0) {
        setCapitulos(filas as Capitulo[]);
      }
    }
    cargar();
  }, []);

  return (
    <main className="contenedor">
      <p className="kicker">El Jardín de las Herederas</p>
      <h1 className="titulo-1">Catálogo de capítulos</h1>
      <p className="texto-destacado mt-4">
        Cada capítulo llega con su papelería temática. También puedes
        suscribirte y recibir uno nuevo cada mes.
      </p>

      <section className="seccion mt-10">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="tarjeta">
            <h2 className="titulo-3">Suscripción mensual · España</h2>
            <p className="mt-1 texto-suave">
              18,50 € al mes. Un capítulo nuevo cada mes con sus goodies.
            </p>
            <div className="mt-6">
              <BotonPago tipo="suscripcion" className={BTN_PRIMARIO}>
                Suscribirme
              </BotonPago>
            </div>
          </div>

          <div className="tarjeta">
            <h2 className="titulo-3">Suscripción mensual · Internacional</h2>
            <p className="mt-1 texto-suave">
              21 € al mes. Lo mismo, con envío a direcciones fuera de España.
            </p>
            <div className="mt-6">
              <BotonPago tipo="suscripcion-internacional" className={BTN_PRIMARIO}>
                Suscribirme (internacional)
              </BotonPago>
            </div>
          </div>
        </div>
      </section>

      <section className="seccion">
        <h2 className="titulo-2 mb-8">Capítulo Individual</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {capitulos.map((c) => (
            <article
              key={c.numero}
              className={`tarjeta ${c.disponible ? "" : "opacity-60"}`}
            >
              <Galeria imagenes={c.imagenes} alt={`Capítulo ${c.numero}: ${c.titulo}`} />
              <p className="kicker mt-4">Capítulo {c.numero}</p>
              <h3 className="titulo-3">{c.titulo}</h3>
              <p className="mt-2 flex-1 texto-suave whitespace-pre-line">{c.descripcion}</p>
              <p className="precio mt-4">{c.precio}</p>

              <div className="mt-4">
                {c.disponible ? (
                  <BotonPago tipo="capitulo" capitulo={c.numero} className={BTN_PRIMARIO}>
                    Comprar capítulo {c.numero} · {c.precio}
                  </BotonPago>
                ) : (
                  <span className="boton boton-secundario w-full cursor-not-allowed text-center opacity-60">
                    Próximamente
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
EOF

# ---------- app/carrito/page.tsx ----------
cat > app/carrito/page.tsx <<'EOF'
import { redirect } from "next/navigation";

export default function CarritoPage() {
  redirect("/#planes");
}
EOF

# ---------- middleware.ts ----------
cat > middleware.ts <<'EOF'
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Solo estas zonas exigen sesión (la administración de la autora).
// El resto de la web es pública y no consulta Supabase.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/registro?modo=login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/panel/:path*", "/perfil/:path*"],
};
EOF

# ---------- app/politicas/page.tsx ----------
cat > app/politicas/page.tsx <<'EOF'
export const metadata = {
  title: "Políticas | El Jardín de las Herederas",
};

export default function PoliticasPage() {
  return (
    <main className="contenedor-estrecho pt-24">
      <p className="kicker">Información legal</p>
      <h1 className="titulo-2">Políticas</h1>

      <nav className="mt-6 texto-suave">
        <ul className="space-y-1">
          <li><a href="#aviso-legal" className="underline underline-offset-4">Aviso legal</a></li>
          <li><a href="#privacidad" className="underline underline-offset-4">Política de privacidad</a></li>
          <li><a href="#cookies" className="underline underline-offset-4">Política de cookies</a></li>
          <li><a href="#compra" className="underline underline-offset-4">Condiciones de compra y suscripción</a></li>
        </ul>
      </nav>

      <section id="aviso-legal" className="mt-12">
        <h2 className="titulo-3">Aviso legal</h2>
        <div className="mt-3 space-y-2 texto">
          <p>Titular del sitio: Pilar Pérez (nombre artístico: María Gayarre).</p>
          <p>Correo de contacto: veinticuatro0792@gmail.com</p>
          <p>
            Los textos, la historia, los personajes, las ilustraciones y el
            resto de contenidos de El Jardín de las Herederas son obra de su
            autora y están protegidos por derechos de propiedad intelectual.
            Queda prohibida su reproducción, distribución o transformación
            sin autorización expresa.
          </p>
        </div>
      </section>

      <section id="privacidad" className="mt-12">
        <h2 className="titulo-3">Política de privacidad</h2>
        <div className="mt-3 space-y-2 texto">
          <p>
            <b>Responsable:</b> Pilar Pérez, con los datos de contacto
            indicados en el aviso legal.
          </p>
          <p>
            <b>Datos que recogemos:</b> esta web no tiene cuentas de usuario ni
            guarda datos de clientas. Al comprar, Stripe recoge tu correo,
            nombre, dirección de envío y, si lo indicas, teléfono, además de
            los datos de pago. Yo consulto esos datos desde mi cuenta de
            Stripe para enviarte el pedido y emitir facturas. Los datos de tu
            tarjeta los gestiona Stripe y yo no tengo acceso a ellos. Si me
            escribes por correo o WhatsApp, uso tu mensaje para responderte.
          </p>
          <p>
            <b>Para qué los usamos:</b> gestionar tu suscripción o tus
            compras, enviarte los capítulos y su papelería, emitir facturas y
            atender tus consultas.
          </p>
          <p>
            <b>Base legal:</b> la ejecución del contrato de compra o
            suscripción y, en su caso, el cumplimiento de obligaciones
            legales (contables y fiscales).
          </p>
          <p>
            <b>Destinatarios:</b> Stripe (pagos y datos del pedido), el
            servicio de mensajería de Correos y Vercel (alojamiento web, que
            no almacena datos de clientas). Si me contactas por WhatsApp,
            también ese servicio.
          </p>
          <p>
            <b>Conservación:</b> mientras dure tu suscripción y, después,
            durante los plazos que exija la normativa fiscal y contable.
          </p>
          <p>
            <b>Tus derechos:</b> puedes solicitar acceso, rectificación y eliminación escribiendo a
            veinticuatro0792@gmail.com. Si consideras que no hemos tratado tus
            datos correctamente, puedes reclamar ante la Agencia Española de
            Protección de Datos (aepd.es).
          </p>
        </div>
      </section>

      <section id="cookies" className="mt-12">
        <h2 className="titulo-3">Política de cookies</h2>
        <div className="mt-3 space-y-2 texto">
          <p>
            Este sitio no utiliza cookies de publicidad ni de analítica y no
            necesita que inicies sesión. El pago se hace en la página de
            Stripe, que puede usar sus propias cookies técnicas necesarias
            para procesarlo.
          </p>
        </div>
      </section>

      <section id="compra" className="mt-12">
        <h2 className="titulo-3">Condiciones de compra y suscripción</h2>
        <div className="mt-3 space-y-2 texto">
          <p>
            <b>Productos:</b> cada entrega incluye un capítulo de la saga y su
            papelería temática, enviados a la dirección que indiques al pagar.
          </p>
          <p>
            <b>Precios:</b> los precios se muestran en euros. La suscripción cuesta 18,50 € al mes y la suscripción con envío internacional (direcciones fuera de España) cuesta 21 € al mes. El capítulo suelto cuesta 18,50 €.
            Se incluyen impuestos y gastos de envío.
          </p>
          <p>
            <b>Pago:</b> con tarjeta a través de Stripe. También se admite
            Bizum en la compra de capítulos sueltos, previa comunicación por
            la página de contacto.
          </p>
          <p>
            <b>Suscripción:</b> se renueva cada mes hasta que la canceles.
            Puedes cancelarla en cualquier momento desde el portal de clientes
            de Stripe (enlace «Mi suscripción» de la web) o escribiéndome; la
            cancelación surte efecto al final del periodo ya pagado.
          </p>
          <p>
            <b>Envíos:</b> Cada sobre se envía la última semana del mes anterior para que llegue durante el mes vigente. Si tu
            paquete llega dañado o no llega, escríbenos y lo resolveremos.
          </p>
          <p>
            <b>Desistimiento:</b> como consumidor tienes, con carácter
            general, un plazo de 14 días naturales desde la recepción del
            pedido para desistir sin dar explicaciones, salvo las
            excepciones previstas por la ley. Yo me encargo de la devolución total del dinero pagado por el producto en un plazo máximo de 14 días naturales.
            Tú también tienes un plazo de 14 días naturales desde que notificas el desistimiento para enviar o entregar de vuelta el producto asumiendo los gastos de envío que correspondan.
          </p>
        </div>
      </section>

      <p className="mt-12 texto-suave">
        Última actualización: noviembre de 2026.
      </p>
    </main>
  );
}
EOF

# ---------- Retoques de texto ----------
sed -i '/Mi panel/d' components/Footer.tsx
sed -i 's/cuando quieras desde tu panel\./cuando quieras desde el portal seguro de Stripe./' components/Footer.tsx
sed -i 's/quedas registrada en la Corte\./entras en la Corte./' lib/camposEditables.ts
sed -i 's/"Sigues tu progreso"/"Gestionas tu suscripción"/' lib/camposEditables.ts
sed -i 's/Desde tu panel, ves en qué capítulo vas, el estado de tu suscripción y tus facturas\./Stripe te envía tus facturas y, desde su portal seguro, puedes cambiar la tarjeta o cancelar cuando quieras./' lib/camposEditables.ts
sed -i 's/18\.50 €/18,50 €/' lib/camposEditables.ts

# ---------- Fuera el webhook ----------
rm -rf app/api/webhook

echo ""
echo "Hecho. Comprobación (no debería salir nada):"
grep -rn "Mi panel\|Necesitas una cuenta" components app/page.tsx lib/camposEditables.ts || echo "  limpio"
echo ""
echo "Siguiente: cierra los archivos abiertos en VS Code SIN guardar, y haz  npm run dev  para verlo."
