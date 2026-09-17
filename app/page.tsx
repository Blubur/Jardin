import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      {/* Hero */}
      <section className="border-b border-corte-oro/20 pb-16">
        <p className="mb-4 font-display text-lg italic text-corte-lavanda">
          La Corte Errante
        </p>
        <h1 className="max-w-2xl font-display text-5xl font-semibold leading-tight text-corte-pergamino sm:text-6xl">
          El Jardín de las Herederas
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-corte-pergamino/85">
          En este mundo, nadie construye un trono: lo gana. Cada Estación, la
          alta sociedad feérica entera se muda a la casa de la familia que
          consiga demostrar, ante una Reina que jamás ha mostrado su favor,
          que merece sostener la Corte bajo su propio techo.
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
                acompañado de goodies temáticos relacionados con lo que
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
    </main>
  );
}
