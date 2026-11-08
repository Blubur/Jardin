#!/bin/bash
# Añade a la home las dos secciones de Navidad. Ejecutar desde la raíz del proyecto:
#   bash navidad.sh
set -e

if [ ! -f package.json ] || [ ! -f app/page.tsx ]; then
  echo "Ejecuta este script desde la raíz del proyecto (donde está package.json)."
  exit 1
fi

# ---------- lib/regalos.ts (precios, enlaces y fecha límite) ----------
if [ ! -f lib/regalos.ts ] || ! grep -q "PRECIO_PACK_DOBLE" lib/regalos.ts; then
cat > lib/regalos.ts <<'EOF'
// Ofertas de Navidad. Cambia aquí los precios, los enlaces y la fecha límite.

// Precio normal de la suscripción mensual y del capítulo suelto (para calcular lo que se ahorra)
export const PRECIO_MENSUAL = 18.5;
export const PRECIO_CAPITULO = 18.5;

// Oferta de Navidad
export const PRECIO_CARTA_NAVIDAD = 18;
export const PRECIO_PACK_DOBLE = 34; // dos cartas (revisa este precio: es un ejemplo)
export const PRECIO_REGALO_3_MESES = 48;

// Payment Links de Stripe (pago único). Pega aquí cada enlace cuando lo crees.
export const ENLACES_REGALO: Record<string, string> = {
  "regalo-carta": "",
  "regalo-pack-2": "",
  "regalo-3-meses": "",
};

// Último día para pedir y que llegue antes de Navidad, con formato AAAA-MM-DD (por ejemplo "2026-12-12").
// Si lo dejas vacío, no se muestra ni la fecha ni la cuenta atrás.
export const FECHA_LIMITE_NAVIDAD = "";

// Texto de la etiqueta de edición limitada (cámbialo o déjalo vacío para quitarla)
export const ETIQUETA_EDICION_LIMITADA = "Sobre de Navidad · edición limitada";
EOF
fi

# ---------- components/BotonRegalo.tsx ----------
cat > components/BotonRegalo.tsx <<'EOF'
"use client";

import { useState } from "react";
import { ENLACES_REGALO } from "@/lib/regalos";

export default function BotonRegalo({
  clave,
  className,
  children,
}: {
  clave: "regalo-carta" | "regalo-pack-2" | "regalo-3-meses";
  className?: string;
  children: React.ReactNode;
}) {
  const [aviso, setAviso] = useState("");

  function ir() {
    const enlace = ENLACES_REGALO[clave];
    if (!enlace) {
      setAviso("Esta opción estará disponible muy pronto.");
      return;
    }
    window.location.href = enlace;
  }

  return (
    <div>
      <button onClick={ir} className={className}>
        {children}
      </button>
      {aviso && <p style={{ color: "#b00020", marginTop: 8 }}>{aviso}</p>}
    </div>
  );
}
EOF

# ---------- components/CuentaAtras.tsx ----------
cat > components/CuentaAtras.tsx <<'EOF'
"use client";

import { useEffect, useState } from "react";

export default function CuentaAtras({ fecha }: { fecha: string }) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    function calcular() {
      const fin = new Date(`${fecha}T23:59:59`).getTime();
      const resto = fin - Date.now();
      if (isNaN(fin) || resto <= 0) {
        setTexto("");
        return;
      }
      const dias = Math.floor(resto / 86400000);
      const horas = Math.floor((resto % 86400000) / 3600000);
      if (dias === 0) {
        setTexto(`¡Último día! Quedan ${horas} ${horas === 1 ? "hora" : "horas"}`);
      } else {
        setTexto(
          `Quedan ${dias} ${dias === 1 ? "día" : "días"} y ${horas} ${horas === 1 ? "hora" : "horas"}`
        );
      }
    }
    calcular();
    const id = setInterval(calcular, 60000);
    return () => clearInterval(id);
  }, [fecha]);

  if (!texto) return null;
  return <span className="font-medium text-corte-oro">{texto}</span>;
}
EOF

# ---------- components/NavidadRegalos.tsx ----------
cat > components/NavidadRegalos.tsx <<'EOF'
import Link from "next/link";
import Reveal from "@/components/Reveal";
import BotonRegalo from "@/components/BotonRegalo";
import CuentaAtras from "@/components/CuentaAtras";
import {
  PRECIO_MENSUAL,
  PRECIO_CAPITULO,
  PRECIO_CARTA_NAVIDAD,
  PRECIO_PACK_DOBLE,
  PRECIO_REGALO_3_MESES,
  FECHA_LIMITE_NAVIDAD,
  ETIQUETA_EDICION_LIMITADA,
} from "@/lib/regalos";

const euros = (n: number) =>
  `${n.toLocaleString("es-ES", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })} €`;

const BOTON =
  "w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60";

export default function NavidadRegalos() {
  const mesesPorSeparado = PRECIO_MENSUAL * 3;
  const ahorro3Meses = mesesPorSeparado - PRECIO_REGALO_3_MESES;
  const ahorroPack = PRECIO_CARTA_NAVIDAD * 2 - PRECIO_PACK_DOBLE;

  const fechaTexto = FECHA_LIMITE_NAVIDAD
    ? new Date(`${FECHA_LIMITE_NAVIDAD}T12:00:00`).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      })
    : "";

  const etiqueta = ETIQUETA_EDICION_LIMITADA && (
    <span className="inline-block rounded-sm border border-corte-oro/40 px-3 py-1 text-sm text-corte-oro">
      {ETIQUETA_EDICION_LIMITADA}
    </span>
  );

  return (
    <>
      {/* Amigo invisible */}
      <section id="amigo-invisible" className="banda-salvia">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <Reveal>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="kicker">Oferta de Navidad</p>
              {etiqueta}
            </div>
            {fechaTexto && (
              <p className="mt-2 text-corte-pergamino/80">
                Pedidos hasta el {fechaTexto}. <CuentaAtras fecha={FECHA_LIMITE_NAVIDAD} />
              </p>
            )}
            <h2 className="titulo-2 mt-3">¿No sabes qué regalar en el amigo invisible?</h2>
            <p className="texto-destacado mt-4">
              Regala una carta de La Corte Errante: un capítulo con su papelería
              temática, en su sobre y listo para envolver.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="tarjeta h-full">
                <h3 className="titulo-3">Una carta</h3>
                <p className="precio mt-2">
                  {euros(PRECIO_CARTA_NAVIDAD)}{" "}
                  <span className="text-base text-corte-pergamino/60 line-through">
                    {euros(PRECIO_CAPITULO)}
                  </span>
                </p>
                <p className="texto-suave mt-1">Precio especial de Navidad.</p>
                <p className="mt-4 flex-1 text-base text-corte-pergamino/75">
                  Un capítulo con su papelería temática, para un regalo.
                </p>
                <div className="mt-6">
                  <BotonRegalo clave="regalo-carta" className={BOTON}>
                    Regalar una carta · {euros(PRECIO_CARTA_NAVIDAD)}
                  </BotonRegalo>
                </div>
              </div>
            </Reveal>

            <Reveal retraso={100}>
              <div className="tarjeta h-full">
                <h3 className="titulo-3">Pack de dos cartas</h3>
                <p className="precio mt-2">
                  {euros(PRECIO_PACK_DOBLE)}{" "}
                  <span className="text-base text-corte-pergamino/60 line-through">
                    {euros(PRECIO_CARTA_NAVIDAD * 2)}
                  </span>
                </p>
                {ahorroPack > 0 && (
                  <p className="texto-suave mt-1">Te ahorras {euros(ahorroPack)}.</p>
                )}
                <p className="mt-4 flex-1 text-base text-corte-pergamino/75">
                  Para quien tiene que regalar a dos personas: el amigo
                  invisible y otro regalo más.
                </p>
                <div className="mt-6">
                  <BotonRegalo clave="regalo-pack-2" className={BOTON}>
                    Regalar dos cartas · {euros(PRECIO_PACK_DOBLE)}
                  </BotonRegalo>
                </div>
              </div>
            </Reveal>
          </div>

          <p className="texto mt-6">
            Te lo enviamos a ti, a la dirección que pongas al pagar, para que
            lo entregues tú en mano y el secreto siga siendo secreto.{" "}
            <span className="texto-suave">
              ¿Prefieres que le llegue directamente a la persona?{" "}
              <Link href="/contacto" className="underline underline-offset-4 hover:text-corte-pergamino">
                Escríbeme antes de comprar
              </Link>
              .
            </span>
          </p>
        </div>
      </section>

      {/* Regalo de 3 meses */}
      <section id="regalo-navidad" className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <Reveal>
          <div className="tarjeta sm:p-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="kicker">Regalo de Navidad</p>
              {etiqueta}
            </div>
            <h2 className="titulo-2 mt-3">¿No sabes qué regalar estas Navidades?</h2>
            <p className="texto-destacado mt-4">
              Regala 3 meses de El Jardín de las Herederas: un sobre al mes con
              su capítulo y su papelería temática. {euros(PRECIO_REGALO_3_MESES)} en
              un único pago: te ahorras {euros(ahorro3Meses)} frente a pagarlo mes a
              mes ({euros(mesesPorSeparado)}).
            </p>
            <p className="texto mt-3">
              Sin renovación automática: al terminar los tres meses no se cobra
              nada más. En la dirección de envío, pon la de la persona que lo
              recibe.
              {fechaTexto && ` Pídelo antes del ${fechaTexto} para que llegue antes de Navidad.`}
            </p>
            <div className="mt-8 sm:max-w-sm">
              <BotonRegalo clave="regalo-3-meses" className={BOTON}>
                Regalar 3 meses · {euros(PRECIO_REGALO_3_MESES)}
              </BotonRegalo>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
EOF

# ---------- app/page.tsx: importar y colocar justo después de la portada ----------
if ! grep -q "NavidadRegalos" app/page.tsx; then
  sed -i 's|^import Reveal from "@/components/Reveal";|import Reveal from "@/components/Reveal";\nimport NavidadRegalos from "@/components/NavidadRegalos";|' app/page.tsx
  sed -i 's|^      {/\* 2\. Entrega en curso \*/}|      <NavidadRegalos />\n\n      {/* 2. Entrega en curso */}|' app/page.tsx
fi

echo ""
if grep -q "<NavidadRegalos />" app/page.tsx && grep -q 'import NavidadRegalos' app/page.tsx; then
  echo "Hecho: las secciones de Navidad están en la home, justo después de la portada."
else
  echo "AVISO: no he podido colocar <NavidadRegalos /> en app/page.tsx. Avísame y lo colocamos a mano."
fi
echo "Siguiente: cierra los archivos abiertos en VS Code sin guardar y prueba con  npm run dev"
