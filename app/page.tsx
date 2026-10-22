import Link from "next/link";
import BotonPago from "@/components/BotonPago";
import { cargarContenido } from "@/lib/contenido";
import { defecto } from "@/lib/camposEditables";

export const revalidate = 0;

export default async function Home() {
  const c = await cargarContenido();
  const t = (clave: string) => c[clave] || defecto(clave);

  return (
    <>
      <main className="contenedor">
        {/* Hero */}
        <section className="border-b border-corte-oro/20 pb-16">
          <p className="mb-4 kicker">{t("home.kicker")}</p>
          <h1 className="titulo-1">{t("home.titulo")}</h1>

      

          <p className="mt-6 destacado whitespace-pre-line">{t("home.intro")}</p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/registro" className="boton boton-primario">
              Únete a la entrega mensual
            </Link>
            <Link href="#como-funciona" className="boton boton-secundario">
              Cómo funciona
            </Link>
            <Link href="/faq" className="boton boton-secundario">
              Preguntas frecuentes
            </Link>
            <Link href="/catalogo" className="boton boton-secundario">
              Catálogo de capítulos
            </Link>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="py-16">
          <h2 className="titulo-2">{t("como.titulo")}</h2>
          <p className="mt-3 texto whitespace-pre-line">{t("como.intro")}</p>

          <ol className="mt-10 space-y-8">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex gap-6">
                <span className="font-display text-2xl text-corte-oro">{n}.</span>
                <div>
                  <h3 className="titulo-3">{t(`como.paso${n}.titulo`)}</h3>
                  <p className="mt-1 text-corte-pergamino/75 whitespace-pre-line">
                    {t(`como.paso${n}.texto`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Planes */}
        <section id="planes" className="seccion">
          <h2 className="titulo-2">{t("planes.titulo")}</h2>
          <p className="mt-3 texto whitespace-pre-line">{t("planes.intro")}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col rounded-sm border border-corte-oro/30 p-6">
              <h3 className="titulo-3">{t("sub.nombre")}</h3>
              <p className="mt-2 precio">
                {t("sub.precio")}{" "}
                <span className="text-base text-corte-pergamino/60">
                  {t("sub.periodo")}
                </span>
              </p>
              <p className="mt-1 texto-suave whitespace-pre-line">{t("sub.nota")}</p>
              <p className="mt-4 flex-1 text-corte-pergamino/75 whitespace-pre-line">
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

            <div className="flex flex-col rounded-sm border border-corte-oro/30 p-6">
              <h3 className="titulo-3">{t("cap.nombre")}</h3>
              <p className="mt-2 precio">{t("cap.precio")}</p>
              <p className="mt-1 texto-suave whitespace-pre-line">{t("cap.nota")}</p>
              <p className="mt-4 flex-1 text-corte-pergamino/75 whitespace-pre-line">
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
          </div>

          <p className="mt-6 texto-suave">
            Necesitas una cuenta para comprar. Si aún no la tienes{" "}
            <Link
              href="/registro"
              className="underline underline-offset-4 hover:text-corte-pergamino"
            >
              crea tu cuenta aquí
            </Link>.
          </p>
        </section>
      </main>
    </>
  );
}
