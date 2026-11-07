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

          <p className="texto-suave mt-6">
            Necesitas una cuenta para comprar. Si aún no la tienes{" "}
            <Link href="/registro" className="underline underline-offset-4 hover:text-corte-pergamino">
              crea tu cuenta aquí
            </Link>
            .
          </p>
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
