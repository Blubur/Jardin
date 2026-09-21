import Link from "next/link";
import BotonPago from "@/components/BotonPago";

export default function Home() {
  return (
    <>
      
      <main className="contenedor">
        {/* Hero */}
        <section className="border-b border-corte-oro/20 pb-16">
          <p className="mb-4 kicker">
            El Jardín de las Herederas
          </p>
          <h1 className="titulo-1">
            El Fuego de las Herederas
          </h1>
          <p className="mt-6 destacado">
            En este mundo, nadie construye un trono, se lo tiene que ganar.
            <br></br>
            Cada nueva Estación, la alta sociedad feérica busca un nuevo hogar y se traslada a la casa de aquella familia que logre demostrarle a la Reina y a toda su Corte que puede acogerlos con calidez bajo su propio techo, abriéndole las puertas a los más hermosos privilegios.
 <br></br>
Aquí, cada tierna pincelada guarda un secreto que espera ser descubierto. Y cada uno de esos secretos, tarde o temprano, encuentra la forma de acariciar la piel y quedarse muy cerca de ti.
          </p>
          <p className="mt-4 destacado">
            Aquí, cada pincelada guarda un secreto. Y cada secreto, tarde o
            temprano, se filtra en la piel de alguien.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/registro"
              className="boton boton-primario"
            >
              Únete a la entrega mensual
                        </Link>
            <Link
              href="#como-funciona"
              className="boton boton-secundario"
            >
              Cómo funciona
            </Link>
            <Link
              href="/faq"
              className="boton boton-secundario"
            >
              Preguntas frecuentes
            </Link>
            <Link
              href="/catalogo"
              className="boton boton-secundario"
            >
              Catálogo de capítulos
            </Link>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="py-16">
          <h2 className="titulo-2">
            Cada mes, un nuevo capítulo
          </h2>
          <p className="mt-3 texto">
            Se trata de una entrega mensual que contiene un nuevo capítulo de la historia
            y papelería temática para que la lectura sea más inmersiva.
          </p>

          <ol className="mt-10 space-y-8">
            <li className="flex gap-6">
              <span className="font-display text-2xl text-corte-oro">1.</span>
              <div>
                <h3 className="titulo-3">
                  Te suscribes
                </h3>
                <p className="mt-1 text-corte-pergamino/75">
                  Eliges tu plan y quedas registrada en la Corte. Tu suscripción
                  se gestiona de forma segura a través de <b>Stripe</b>.
                </p>
              </div>
            </li>
            <li className="flex gap-6">
              <span className="font-display text-2xl text-corte-oro">2.</span>
              <div>
                <h3 className="titulo-3">
                  Recibes tu entrega
                </h3>
                <p className="mt-1 text-corte-pergamino/75">
                  Cada mes, un nuevo capítulo de El Fuego de las Herederas
                  acompañado de tesoros temáticos relacionados con lo que
                  acabas de leer.
                </p>
              </div>
            </li>
            <li className="flex gap-6">
              <span className="font-display text-2xl text-corte-oro">3.</span>
              <div>
                <h3 className="titulo-3">
                  Sigues tu progreso
                </h3>
                <p className="mt-1 text-corte-pergamino/75">
                  Desde tu panel, ves en qué capítulo vas, el estado de tu
                  suscripción y tus facturas.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Planes */}
        <section id="planes" className="seccion">
          <h2 className="titulo-2">
            Elige cómo leer
          </h2>
          <p className="mt-3 texto">
            Suscríbete para recibir cada mes un capítulo nuevo con sus goodies, o llévate solo el envío que te interese.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col rounded-sm border border-corte-oro/30 p-6">
              <h3 className="titulo-3">
                Suscripción mensual
              </h3>
              <p className="mt-2 precio">
                11,00 €{" "}
                <span className="text-base text-corte-pergamino/60">/ mes</span>
              </p>
              <p className="mt-1 texto-suave">
                <u>Precio de preventa del primer correo <b>9€.</b> </u>
                <br></br>
                Preventa disponible hasta el 24 de septiembre a las 12 de la noche.
              </p>
              <p className="mt-4 flex-1 text-corte-pergamino/75">
                Cada mes, un capítulo nuevo de El Fuego de las Herederas con su
                papelería temática para hacer una lectura más inmersiva.
              </p>
              <div className="mt-6">
                <BotonPago
                  tipo="suscripcion"
                  className="w-full rounded-sm bg-corte-oro px-6 py-3 font-medium text-corte-fondo transition hover:bg-corte-oro/90 disabled:opacity-60"
                >
                  Suscribirme
                </BotonPago>
              </div>
            </div>

            <div className="flex flex-col rounded-sm border border-corte-oro/30 p-6">
              <h3 className="titulo-3">
                Capítulo suelto
              </h3>
              <p className="mt-2 precio">11 €</p>
              <p className="mt-1 texto-suave">
                Pago único, sin suscripción
              </p>
              <p className="mt-4 flex-1 text-corte-pergamino/75">
                Envío con su capítulo y su papelería temática, sin compromiso de continuidad.
                <br></br>
                Si has llegado tarde al inicio de los envíos o prefieres hacer el pago mediante <b>Bizum</b> esta es tu mejor opción ya que puedes elegir el capítulo/mes deseado.
                
                  <br></br>
                Preventa disponible hasta el 24 de septiembre a las 12 de la noche.
              </p>
              <div className="mt-6">
                <BotonPago
                  tipo="capitulo"
                  capitulo={1}
                  className="w-full rounded-sm border border-corte-pergamino/30 px-6 py-3 text-corte-pergamino transition hover:border-corte-pergamino/60 disabled:opacity-60"
                >
                  Comprar Capítulo 1, La Ofrenda.
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