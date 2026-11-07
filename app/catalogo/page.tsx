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
