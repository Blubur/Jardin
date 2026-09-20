"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import BotonPago from "@/components/BotonPago";
import Galeria from "@/components/Galeria";
import { CAPITULOS } from "@/lib/catalogo";

export default function CatalogoPage() {
  const [haySesion, setHaySesion] = useState(false);
  const [comprados, setComprados] = useState<number[]>([]);

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
    }
    cargar();
  }, []);

  return (
    <main className="contenedor">
      <p className="kicker">La Corte Errante</p>
      <h1 className="titulo-1">Catálogo de capítulos</h1>
      <p className="texto-destacado mt-4">
        Cada capítulo llega con su papelería temática. También puedes
        suscribirte y recibir uno nuevo cada mes.
      </p>

      <section className="seccion mt-10">
        <div className="tarjeta max-w-xl">
          <h2 className="titulo-3">Suscripción mensual</h2>
          <p className="mt-1 texto-suave">
            9 € al mes en preventa (precio habitual 11 €). Un capítulo nuevo
            cada mes con sus goodies.
          </p>
          <div className="mt-6">
            {haySesion ? (
              <BotonPago
                tipo="suscripcion"
                className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
              >
                Suscribirme
              </BotonPago>
            ) : (
              <Link
                href="/registro?modo=login"
                className="boton boton-primario w-full text-center"
              >
                Entra para suscribirte
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="seccion">
        <h2 className="titulo-2 mb-8">Capítulos sueltos</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {CAPITULOS.map((c) => {
            const yaComprado = comprados.includes(c.numero);
            return (
              <article
                key={c.numero}
                className={`tarjeta ${c.disponible ? "" : "opacity-60"}`}
              >
                <Galeria imagenes={c.imagenes} alt={`Capítulo ${c.numero}: ${c.titulo}`} />
                <p className="kicker mt-4">Capítulo {c.numero}</p>
                <h3 className="titulo-3">{c.titulo}</h3>
                <p className="mt-2 flex-1 texto-suave">{c.descripcion}</p>
                <p className="precio mt-4">{c.precio} €</p>

                <div className="mt-4">
                  {!c.disponible ? (
                    <span className="boton boton-secundario w-full cursor-not-allowed text-center opacity-60">
                      Próximamente
                    </span>
                  ) : !haySesion ? (
                    <Link
                      href="/registro?modo=login"
                      className="boton boton-primario w-full text-center"
                    >
                      Entra para comprar
                    </Link>
                  ) : (
                    <>
                      {yaComprado && (
                        <Link href="/panel" className="boton boton-secundario w-full text-center">Ya lo tienes · ver en mi panel</Link>
                      )}
                      <BotonPago
                        tipo="capitulo"
                        capitulo={c.numero}
                        className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
                      >
                        Comprar capítulo {c.numero} · {c.precio} €
                      </BotonPago>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
