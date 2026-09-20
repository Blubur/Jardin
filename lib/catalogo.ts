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
    titulo: "La Ofrenda",
    descripcion:
      "Una semana antes del Cortejo del Trono, la Ofrenda de Alondra arde bajo su propio pincel. Capítulo 1 de El Fuego de las Herederas.",
    precio: 11,
   imagenes: [
  "/capitulos/capitulo-1/1.png",
  "/capitulos/capitulo-1/2.jpg",
],
    disponible: true,
  },
 {
  numero: 2,
  titulo: "El nombre",
  descripcion: "Próximamente.",
  precio: 11,
  imagenes: ["https://dummyimage.com/1280x720/fff/aaa"],
  disponible: false,
},
];
