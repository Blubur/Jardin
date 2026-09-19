import Link from "next/link";
import BotonPago from "@/components/BotonPago";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      {/* Hero */}
      <section className="border-b border-corte-oro/20 pb-16">
        <p className="mb-4 font-display text-lg italic text-corte-lavanda">
          El Jardín de las Herederas
        </p>
        <h1 className="max-w-2xl font-display text-5xl font-semibold leading-tight text-corte-pergamino sm:text-6xl">
          El Jardín de las Herederas
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-corte-pergamino/85">
          En este mundo, nadie construye un trono, se lo tiene que ganar.
          <br></br> 
          Cada Estación, la
          alta sociedad feérica se muda a la casa de la familia que
          consiga demostrar ante una Reina que jamás ha mostrado su favor
          que merece sostener la Corte bajo su propio techo y así obtener todas sus grandes ventajas.
        </p>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-corte-pergamino/85">
          Aquí, cada pincelada guarda un secreto. Y cada secreto, tarde o
          temprano, se filtra en la piel de alguien.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/registro"
            className="rounded-sm bg-corte-oro px-6 py-3 font-body font-medium text-corte-fondo transition hover:bg-corte-oro/90"
          >
            Únete a la entrega mensual
          </Link>
          <a
            href="#como-funciona"
            className="rounded-sm border border-corte-pergamino/30 px-6 py-3 font-body text-corte-pergamino transition hover:border-corte-pergamino/60"
          >
            Cómo funciona
          </a>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-16">
        <h2 className="font-display text-3xl font-semibold text-corte-pergamino">
          Cada mes, un nuevo capítulo
        </h2>
        <p className="mt-3 max-w-xl text-corte-pergamino/75">
          No es solo un libro: es una entrega mensual con su propio capítulo
          y goodies temáticos, pensada para vivirse igual que Alondra vive la
          Corte — poco a poco, secreto a secreto.
        </p>

        <ol className="mt-10 space-y-8">
          <li className="flex gap-6">
            <span className="font-display text-2xl text-corte-oro">I.</span>
            <div>
              <h3 className="font-display text-xl text-corte-pergamino">
                Te suscribes
              </h3>
              <p className="mt-1 text-corte-pergamino/75">
                Eliges tu plan y quedas registrada en la Corte. Tu suscripción
                se gestiona de forma segura a través de Stripe.
              </p>
            </div>
          </li>
          <li className="flex gap-6">
            <span className="font-display text-2xl text-corte-oro">II.</span>
            <div>
              <h3 className="font-display text-xl text-corte-pergamino">
                Recibes tu entrega
              </h3>
              <p className="mt-1 text-corte-pergamino/75">
                Cada mes, un nuevo capítulo de El Jardín de las Herederas
                acompañado de tesoros temáticos relacionados con lo que
                acabas de leer.
              </p>
            </div>
          </li>
          <li className="flex gap-6">
            <span className="font-display text-2xl text-corte-oro">III.</span>
            <div>
              <h3 className="font-display text-xl text-corte-pergamino">
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
      <section id="planes" className="border-t border-corte-oro/20 py-16">
        <h2 className="font-display text-3xl font-semibold text-corte-pergamino">
          Elige cómo leer
        </h2>
        <p className="mt-3 max-w-xl text-corte-pergamino/75">
          Suscríbete para recibir cada mes un capítulo nuevo con sus goodies,
          o llévate solo el envío que te interese.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col rounded-sm border border-corte-oro/30 p-6">
            <h3 className="font-display text-xl text-corte-pergamino">
              Suscripción mensual
            </h3>
            <p className="mt-2 font-display text-3xl text-corte-oro">
              9 €{" "}
              <span className="text-base text-corte-pergamino/60">/ mes</span>
            </p>
            <p className="mt-1 text-sm text-corte-pergamino/60">
              Precio de preventa del primer correo 9€ · precio habitual 11 €/mes
            </p>
            <p className="mt-4 flex-1 text-corte-pergamino/75">
              Cada mes, un capítulo nuevo de El Fuego de las Herederas con sus
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
            <h3 className="font-display text-xl text-corte-pergamino">
              Capítulo suelto
            </h3>
            <p className="mt-2 font-display text-3xl text-corte-oro">11 €</p>
            <p className="mt-1 text-sm text-corte-pergamino/60">
              Pago único, sin suscripción
            </p>
            <p className="mt-4 flex-1 text-corte-pergamino/75">
              Un único envío con su capítulo, sin compromiso de continuidad.
            </p>
            <div className="mt-6">
              <BotonPago
                tipo="capitulo"
                capitulo={1}
                className="w-full rounded-sm border border-corte-pergamino/30 px-6 py-3 text-corte-pergamino transition hover:border-corte-pergamino/60 disabled:opacity-60"
              >
                Comprar capítulo 1
              </BotonPago>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-corte-pergamino/60">
          Necesitas una cuenta para comprar. Si aún no la tienes, te llevamos
          al registro.
        </p>
      </section>







    </main>
  );
}
