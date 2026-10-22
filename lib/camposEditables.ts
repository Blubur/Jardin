export type Campo = {
  grupo: string;
  clave: string;
  etiqueta: string;
  tipo: "texto" | "largo" | "imagen";
  porDefecto: string;
};

export const CAMPOS: Campo[] = [
  // Portada
  { grupo: "Home: portada", clave: "home.kicker", etiqueta: "Texto pequeño superior", tipo: "texto", porDefecto: "El Jardín de las Herederas" },
  { grupo: "Home: portada", clave: "home.titulo", etiqueta: "Título principal", tipo: "texto", porDefecto: "El Fuego de las Herederas" },
  { grupo: "Home: portada", clave: "home.intro", etiqueta: "Texto de presentación (deja una línea en blanco entre párrafos)", tipo: "largo", porDefecto: "En este mundo, nadie construye un trono, se lo tiene que ganar.\n\nCada nueva Estación, la alta sociedad feérica busca un nuevo hogar y se traslada a la casa de aquella familia que logre demostrarle a la Reina y a toda su Corte que puede acogerlos con calidez bajo su propio techo, abriéndole las puertas a los más hermosos privilegios.\n\nAquí, cada tierna pincelada guarda un secreto que espera ser descubierto. Y cada uno de esos secretos, tarde o temprano, encuentra la forma de acariciar la piel y quedarse muy cerca de ti." },
  { grupo: "Home: portada", clave: "home.imagen", etiqueta: "Imagen de portada (opcional)", tipo: "imagen", porDefecto: "" },

  // Cómo funciona
  { grupo: "Home: cómo funciona", clave: "como.titulo", etiqueta: "Título", tipo: "texto", porDefecto: "Cada mes, un nuevo capítulo" },
  { grupo: "Home: cómo funciona", clave: "como.intro", etiqueta: "Introducción", tipo: "largo", porDefecto: "Se trata de una entrega mensual que contiene un nuevo capítulo de la historia y papelería temática para que la lectura sea más inmersiva." },
  { grupo: "Home: cómo funciona", clave: "como.paso1.titulo", etiqueta: "Paso 1: título", tipo: "texto", porDefecto: "Te suscribes" },
  { grupo: "Home: cómo funciona", clave: "como.paso1.texto", etiqueta: "Paso 1: texto", tipo: "largo", porDefecto: "Eliges tu plan y quedas registrada en la Corte. Tu suscripción se gestiona de forma segura a través de Stripe." },
  { grupo: "Home: cómo funciona", clave: "como.paso2.titulo", etiqueta: "Paso 2: título", tipo: "texto", porDefecto: "Recibes tu entrega" },
  { grupo: "Home: cómo funciona", clave: "como.paso2.texto", etiqueta: "Paso 2: texto", tipo: "largo", porDefecto: "Cada mes, un nuevo capítulo de El Fuego de las Herederas acompañado de tesoros temáticos relacionados con lo que acabas de leer." },
  { grupo: "Home: cómo funciona", clave: "como.paso3.titulo", etiqueta: "Paso 3: título", tipo: "texto", porDefecto: "Sigues tu progreso" },
  { grupo: "Home: cómo funciona", clave: "como.paso3.texto", etiqueta: "Paso 3: texto", tipo: "largo", porDefecto: "Desde tu panel, ves en qué capítulo vas, el estado de tu suscripción y tus facturas." },

  // Planes
  { grupo: "Home: planes", clave: "planes.titulo", etiqueta: "Título", tipo: "texto", porDefecto: "Elige cómo leer" },
  { grupo: "Home: planes", clave: "planes.intro", etiqueta: "Introducción", tipo: "largo", porDefecto: "Suscríbete para recibir cada mes un capítulo nuevo con sus goodies, o llévate solo el envío que te interese." },

  { grupo: "Home: plan suscripción", clave: "sub.nombre", etiqueta: "Nombre", tipo: "texto", porDefecto: "Suscripción mensual" },
  { grupo: "Home: plan suscripción", clave: "sub.precio", etiqueta: "Precio", tipo: "texto", porDefecto: "11,00 €" },
  { grupo: "Home: plan suscripción", clave: "sub.periodo", etiqueta: "Periodo (junto al precio)", tipo: "texto", porDefecto: "/ mes" },
  { grupo: "Home: plan suscripción", clave: "sub.nota", etiqueta: "Nota bajo el precio (preventa, avisos)", tipo: "largo", porDefecto: "" },
  { grupo: "Home: plan suscripción", clave: "sub.descripcion", etiqueta: "Descripción", tipo: "largo", porDefecto: "Cada mes, un capítulo nuevo de El Fuego de las Herederas con su papelería temática para hacer una lectura más inmersiva." },
  { grupo: "Home: plan suscripción", clave: "sub.boton", etiqueta: "Texto del botón", tipo: "texto", porDefecto: "Suscribirme" },

  { grupo: "Home: capítulo suelto", clave: "cap.nombre", etiqueta: "Nombre", tipo: "texto", porDefecto: "Capítulo suelto" },
  { grupo: "Home: capítulo suelto", clave: "cap.precio", etiqueta: "Precio", tipo: "texto", porDefecto: "11 €" },
  { grupo: "Home: capítulo suelto", clave: "cap.nota", etiqueta: "Nota bajo el precio", tipo: "largo", porDefecto: "Pago único, sin suscripción" },
  { grupo: "Home: capítulo suelto", clave: "cap.descripcion", etiqueta: "Descripción", tipo: "largo", porDefecto: "Envío con su capítulo y su papelería temática, sin compromiso de continuidad.\nSi has llegado tarde al inicio de los envíos o prefieres hacer el pago mediante Bizum esta es tu mejor opción ya que puedes elegir el capítulo/mes deseado.\nPreventa disponible hasta el 24 de septiembre a las 12 de la noche." },
  { grupo: "Home: capítulo suelto", clave: "cap.boton", etiqueta: "Texto del botón", tipo: "texto", porDefecto: "Comprar Capítulo 1, La Ofrenda." },
];

export function defecto(clave: string): string {
  return CAMPOS.find((c) => c.clave === clave)?.porDefecto ?? "";
}
