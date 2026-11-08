// Ofertas de Navidad. Cambia aquí los precios, los enlaces y la fecha límite.

// Precio normal de la suscripción mensual y del capítulo suelto (para calcular lo que se ahorra)
export const PRECIO_MENSUAL = 18.5;
export const PRECIO_CAPITULO = 18.5;

// Oferta de Navidad
export const PRECIO_CARTA_NAVIDAD = 18;
export const PRECIO_PACK_DOBLE = 34; // dos cartas (revisa este precio: es un ejemplo)
export const PRECIO_REGALO_3_MESES = 48;

// Payment Links de Stripe (pago único). Pega aquí cada enlace cuando lo crees.
export const ENLACES_REGALO: Record<string, string> = {
  "regalo-carta": "",
  "regalo-pack-2": "",
  "regalo-3-meses": "",
};

// Último día para pedir y que llegue antes de Navidad, con formato AAAA-MM-DD (por ejemplo "2026-12-12").
// Si lo dejas vacío, no se muestra ni la fecha ni la cuenta atrás.
export const FECHA_LIMITE_NAVIDAD = "";

// Texto de la etiqueta de edición limitada (cámbialo o déjalo vacío para quitarla)
export const ETIQUETA_EDICION_LIMITADA = "Sobre de Navidad · edición limitada";
