export const metadata = {
  title: "Políticas | El Jardín de las Herederas",
};

export default function PoliticasPage() {
  return (
    <main className="contenedor-estrecho pt-24">
      <p className="kicker">Información legal</p>
      <h1 className="titulo-2">Políticas</h1>

      <nav className="mt-6 texto-suave">
        <ul className="space-y-1">
          <li><a href="#aviso-legal" className="underline underline-offset-4">Aviso legal</a></li>
          <li><a href="#privacidad" className="underline underline-offset-4">Política de privacidad</a></li>
          <li><a href="#cookies" className="underline underline-offset-4">Política de cookies</a></li>
          <li><a href="#compra" className="underline underline-offset-4">Condiciones de compra y suscripción</a></li>
        </ul>
      </nav>

      <section id="aviso-legal" className="mt-12">
        <h2 className="titulo-3">Aviso legal</h2>
        <div className="mt-3 space-y-2 texto">
          <p>Titular del sitio: Pilar Pérez (nombre artístico: María Gayarre).</p>
          <p>Correo de contacto: veinticuatro0792@gmail.com</p>
          <p>
            Los textos, la historia, los personajes, las ilustraciones y el
            resto de contenidos de El Jardín de las Herederas son obra de su
            autora y están protegidos por derechos de propiedad intelectual.
            Queda prohibida su reproducción, distribución o transformación
            sin autorización expresa.
          </p>
        </div>
      </section>

      <section id="privacidad" className="mt-12">
        <h2 className="titulo-3">Política de privacidad</h2>
        <div className="mt-3 space-y-2 texto">
          <p>
            <b>Responsable:</b> Pilar Pérez, con los datos de contacto
            indicados en el aviso legal.
          </p>
          <p>
            <b>Datos que recogemos:</b> esta web no tiene cuentas de usuario ni
            guarda datos de clientas. Al comprar, Stripe recoge tu correo,
            nombre, dirección de envío y, si lo indicas, teléfono, además de
            los datos de pago. Yo consulto esos datos desde mi cuenta de
            Stripe para enviarte el pedido y emitir facturas. Los datos de tu
            tarjeta los gestiona Stripe y yo no tengo acceso a ellos. Si me
            escribes por correo o WhatsApp, uso tu mensaje para responderte.
          </p>
          <p>
            <b>Para qué los usamos:</b> gestionar tu suscripción o tus
            compras, enviarte los capítulos y su papelería, emitir facturas y
            atender tus consultas.
          </p>
          <p>
            <b>Base legal:</b> la ejecución del contrato de compra o
            suscripción y, en su caso, el cumplimiento de obligaciones
            legales (contables y fiscales).
          </p>
          <p>
            <b>Destinatarios:</b> Stripe (pagos y datos del pedido), el
            servicio de mensajería de Correos y Vercel (alojamiento web, que
            no almacena datos de clientas). Si me contactas por WhatsApp,
            también ese servicio.
          </p>
          <p>
            <b>Conservación:</b> mientras dure tu suscripción y, después,
            durante los plazos que exija la normativa fiscal y contable.
          </p>
          <p>
            <b>Tus derechos:</b> puedes solicitar acceso, rectificación y eliminación escribiendo a
            veinticuatro0792@gmail.com. Si consideras que no hemos tratado tus
            datos correctamente, puedes reclamar ante la Agencia Española de
            Protección de Datos (aepd.es).
          </p>
        </div>
      </section>

      <section id="cookies" className="mt-12">
        <h2 className="titulo-3">Política de cookies</h2>
        <div className="mt-3 space-y-2 texto">
          <p>
            Este sitio no utiliza cookies de publicidad ni de analítica y no
            necesita que inicies sesión. El pago se hace en la página de
            Stripe, que puede usar sus propias cookies técnicas necesarias
            para procesarlo.
          </p>
        </div>
      </section>

      <section id="compra" className="mt-12">
        <h2 className="titulo-3">Condiciones de compra y suscripción</h2>
        <div className="mt-3 space-y-2 texto">
          <p>
            <b>Productos:</b> cada entrega incluye un capítulo de la saga y su
            papelería temática, enviados a la dirección que indiques al pagar.
          </p>
          <p>
            <b>Precios:</b> los precios se muestran en euros. La suscripción cuesta 18,50 € al mes y la suscripción con envío internacional (direcciones fuera de España) cuesta 21 € al mes. El capítulo suelto cuesta 18,50 €.
            Se incluyen impuestos y gastos de envío.
          </p>
          <p>
            <b>Pago:</b> con tarjeta a través de Stripe. También se admite
            Bizum en la compra de capítulos sueltos, previa comunicación por
            la página de contacto.
          </p>
          <p>
            <b>Suscripción:</b> se renueva cada mes hasta que la canceles.
            Puedes cancelarla en cualquier momento desde el portal de clientes
            de Stripe (enlace «Mi suscripción» de la web) o escribiéndome; la
            cancelación surte efecto al final del periodo ya pagado.
          </p>
          <p>
            <b>Envíos:</b> Cada sobre se envía la última semana del mes anterior para que llegue durante el mes vigente. Si tu
            paquete llega dañado o no llega, escríbenos y lo resolveremos.
          </p>
          <p>
            <b>Desistimiento:</b> como consumidor tienes, con carácter
            general, un plazo de 14 días naturales desde la recepción del
            pedido para desistir sin dar explicaciones, salvo las
            excepciones previstas por la ley. Yo me encargo de la devolución total del dinero pagado por el producto en un plazo máximo de 14 días naturales.
            Tú también tienes un plazo de 14 días naturales desde que notificas el desistimiento para enviar o entregar de vuelta el producto asumiendo los gastos de envío que correspondan.
          </p>
        </div>
      </section>

      <p className="mt-12 texto-suave">
        Última actualización: noviembre de 2026.
      </p>
    </main>
  );
}
