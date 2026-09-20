import Link from "next/link";

export const metadata = {
  title: "Preguntas frecuentes · El Jardín de las Herederas",
};

const FAQ = [
  {
    pregunta: "¿Cuál es la fecha límite para conseguir la edición de este mes?",
    respuesta:
      "Tienes hasta el día 5 de cada mes para sumarte. Como preparo cada carta a mano y con todo el cuidado del mundo, esa es la fecha en la que cierro los pedidos para ponerme a empaquetar. Si te suscribes después del día 5, estrenarás tu suscripción con la entrega del mes siguiente.\n\nEjemplo: Si te das de alta el 3 de noviembre, recibirás la edición de noviembre (que se envía entre el 8 y el 12). Si te apuntas el 6 de noviembre, tu primer envío será la edición de diciembre (que saldrá entre el 8 y el 12 de diciembre).",
  },
  {
    pregunta: "¿Puedo conseguir las entregas anteriores si me he perdido la preventa?",
    respuesta:
      "¡Sí! Puedes comprar los capítulos pasados de forma individual directamente en la tienda. A partir del momento en el que te suscribas, empezarás a recibir las siguientes entregas en el orden correspondiente, como el resto del club.",
  },
  {
    pregunta: "¿En qué momento del mes se realiza el cobro?",
    respuesta:
      "La cuota se cobra automáticamente cada mes el mismo día en que te registraste. Es decir, si te sumaste al club un día 14, las siguientes mensualidades se renovarán los días 14 de cada mes.",
  },
  {
    pregunta: "¿Hay algún compromiso de permanencia o puedo darme de baja cuando quiera?",
    respuesta:
      "Puedes pausar o cancelar tu cuenta en cualquier momento desde tu panel de usuario, sin preguntas ni penalizaciones.\n\nSolo ten en cuenta la fecha de corte: gestiono los envíos el día 5. Si cancelas o me pides pausar después de esa fecha y tu cobro ya se ha tramitado, te llegará el sobre correspondiente a ese pago y la baja se hará efectiva para el próximo ciclo.",
  },
  {
    pregunta: "¿Cuándo sale mi carta hacia mi buzón?",
    respuesta:
      "Preparo todos los paquetes individualmente en el taller y salen de viaje entre los días 8 y 12 de cada mes. Como hago todo el proceso de forma manual, este margen me permite cuidar cada detalle. Una vez depositados en Correos, el tiempo de entrega dependerá de los plazos habituales del envío postal ordinario.",
  },
  {
    pregunta: "¿Tengo que pagar el envío aparte?",
    respuesta:
      "No, los gastos de envío por correo postal ordinario ya vienen incluidos en el precio final de la suscripción.",
  },
  {
    pregunta: "¿Puedo hacer el seguimiento del paquete con un código?",
    respuesta:
      "Para conservar el encanto de la correspondencia tradicional de toda la vida, utilizo el servicio de correo ordinario. Estas cartas no disponen de código de rastreo, ¡así que la sorpresa al abrir el buzón forma parte de la experiencia!",
  },
  {
    pregunta: "¿Qué pasa si la carta se retrasa o hay algún problema con la entrega?",
    respuesta:
      "Las cartas ordinarias suelen tardar entre 3 y 10 días laborables en llegar a su destino desde que salen del estudio. Si ha transcurrido un margen razonable (más de 15 días para envíos en España o más de un mes para entregas internacionales), escríbeme desde la página de Contacto y buscaré una solución de inmediato.",
  },
];

export default function FaqPage() {
  return (
    <main className="contenedor-estrecho">
      <p className="kicker">Antes de suscribirte</p>
      <h1 className="titulo-1">Preguntas frecuentes</h1>

      <div className="mt-10 divide-y divide-corte-oro/20 border-y border-corte-oro/20">
        {FAQ.map((item) => (
          <details key={item.pregunta} className="py-5">
            <summary className="faq-resumen titulo-3">
              <span className="flor" aria-hidden="true">ꕤ</span>
              {item.pregunta}
            </summary>
            <div className="mt-3 space-y-3">
              {item.respuesta.split("\n\n").map((parrafo, i) => (
                <p key={i} className="texto">
                  {parrafo}
                </p>
              ))}
            </div>
          </details>
        ))}
      </div>

      <p className="mt-10 texto-suave">
        ¿No encuentras tu respuesta?{" "}
        <Link
          href="/contacto"
          className="underline underline-offset-4 hover:text-corte-pergamino"
        >
          Escríbeme desde Contacto
        </Link>
        .
      </p>
    </main>
  );
}
