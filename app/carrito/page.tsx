"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import BotonPago from "@/components/BotonPago";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Añade aquí los capítulos a medida que estén a la venta.
const CAPITULOS_DISPONIBLES = [1];

export default function CarritoPage() {
  const [cargando, setCargando] = useState(true);
  const [haySesion, setHaySesion] = useState(false);
  const [comprados, setComprados] = useState<number[]>([]);
  const [capitulo, setCapitulo] = useState<number>(CAPITULOS_DISPONIBLES[0]);

  useEffect(() => {
    async function cargar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setHaySesion(true);
        const { data } = await supabase
          .from("compras")
          .select("capitulo")
          .eq("user_id", session.user.id);
        setComprados((data ?? []).map((c: { capitulo: number }) => c.capitulo));
      }
      setCargando(false);
    }
    cargar();
  }, []);

  const yaComprado = comprados.includes(capitulo);

  return (
    <>
   
      <main className="contenedor-estrecho pt-24">
        <p className="kicker">Tu pedido</p>
        <h1 className="titulo-2">Carrito</h1>

        {cargando ? (
          <p className="mt-8 text-corte-pergamino/60">Cargando...</p>
        ) : !haySesion ? (
          <p className="mt-8 texto">
            Necesitas una cuenta para comprar.{" "}
            <Link
              href="/registro"
              className="underline underline-offset-4 hover:text-corte-pergamino"
            >
              Crea tu cuenta o entra aquí
            </Link>
            .
          </p>
        ) : (
          <div className="mt-8 space-y-6">
            <section className="rounded-sm border border-corte-oro/30 p-6">
              <h2 className="titulo-3">Capítulo suelto</h2>
              <p className="mt-1 texto-suave">
                11 € · pago único con su papelería temática. También puedes
                pagar por Bizum: escríbenos desde Contacto.
              </p>

              <label htmlFor="capitulo" className="etiqueta mt-4 block">
                Elige el capítulo
              </label>
              <select
                id="capitulo"
                value={capitulo}
                onChange={(e) => setCapitulo(Number(e.target.value))}
                className="campo"
              >
                {CAPITULOS_DISPONIBLES.map((n) => (
                  <option key={n} value={n}>
                    Capítulo {n}
                    {comprados.includes(n) ? " (ya comprado)" : ""}
                  </option>
                ))}
              </select>

              {yaComprado && (
                <p className="aviso-ok mt-3">
                  Ya tienes este capítulo. Puedes comprarlo de nuevo si es un
                  regalo, pero comprueba tu panel antes.
                </p>
              )}

              <div className="mt-6">
                <BotonPago
                  tipo="capitulo"
                  capitulo={capitulo}
                  className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
                >
                  Pagar capítulo {capitulo} · 11 €
                </BotonPago>
              </div>
            </section>

            <section className="rounded-sm border border-corte-oro/30 p-6">
              <h2 className="titulo-3">Suscripción mensual</h2>
              <p className="mt-1 texto-suave">
                9 € al mes en preventa (precio habitual 11 €). Un capítulo
                nuevo cada mes con sus goodies.
              </p>
              <div className="mt-6">
                <BotonPago
                  tipo="suscripcion"
                  className="w-full rounded-sm border border-corte-pergamino/30 px-6 py-3 text-corte-pergamino transition hover:border-corte-pergamino/60 disabled:opacity-60"
                >
                  Suscribirme
                </BotonPago>
              </div>
            </section>

            <p className="texto-suave">
              <Link
                href="/panel"
                className="underline underline-offset-4 hover:text-corte-pergamino"
              >
                Ver mi panel y mis facturas
              </Link>
            </p>
          </div>
        )}
      </main>
   
    </>
  );
}
