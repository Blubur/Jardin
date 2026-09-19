/** @type {import('tailwindcss').Config} */

const paleta = [
  "peonia-nocturna",
  "ciruela-profunda",
  "granate-savia",
  "rosa-peonia",
  "rosa-empolvado",
  "rosa-palido",
  "rosa-petalo",
  "verde-nocheli",
  "verde-salvia",
  "verde-eucalipto",
  "verde-musgo",
  "verde-grisaceo",
  "azul-cielo",
  "azul-niebla",
  "negro-tinta",
  "marron-caoba",
  "terracota",
  "marfil-antiguo",
  "dorado-apagado",
  "humo-lavanda",
];

const color = (nombre) => `rgb(var(--${nombre}) / <alpha-value>)`;

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...Object.fromEntries(paleta.map((nombre) => [nombre, color(nombre)])),
        corte: {
          fondo: color("corte-fondo"),
          fondo2: color("corte-fondo2"),
          oro: color("corte-oro"),
          pergamino: color("corte-pergamino"),
          granate: color("corte-granate"),
          lavanda: color("corte-lavanda"),
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};