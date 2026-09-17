/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        corte: {
          fondo: "#1B1023",      // púrpura casi negro, fondo principal
          fondo2: "#241531",     // variante ligeramente más clara
          oro: "#C9A227",        // acento dorado
          pergamino: "#EFE7D8",  // texto sobre fondo oscuro
          granate: "#7A2E3B",    // acento cálido (peonía)
          lavanda: "#B9A6D9",    // acento frío (flor de Iris)
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
