export type Capitulo = {
  numero: number;
  titulo: string;
  descripcion: string;
  precio: number; // en euros
  imagenes: string[]; // rutas dentro de /public
  disponible: boolean;
};

// Para añadir un capítulo nuevo, copia un bloque y cambia los datos.
export const CAPITULOS: Capitulo[] = [
  {
    numero: 1,
    titulo: "Capítulo",
    descripcion:
      "Esta opcción permite comprar los capítulos de forma individual sin función de suscripción. Quizás resulte tedioso venir a pedir tu sobre cada mes, pero es la única forma de pagar con Bizum que existe actualmente.\n\nPuedes elegir más de un solo capítulo en la misma compra añadiendo tantos productos como quieras y indicando el número en el campo Otros DatabaseIcon.",
    precio: 18.50,
    imagenes: [
      "/capitulos/capitulo-1/1.jpeg",
      "/capitulos/capitulo-1/2.jpeg",
    ],
    disponible: true,
  },
];