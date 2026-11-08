import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { EB_Garamond, Barlow, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
});

// Sustituta de Bahnschrift para quien no la tenga instalada
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
});

// Fuente de títulos (sustituye a Soligant): elegante y con soporte completo de tildes, ñ y ¿¡
const titulos = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-titulo",
});

const cascadia = localFont({
  src: "./fonts/CascadiaCode.woff2",
  variable: "--font-mono",
});

export const metadata = {
  title: "El Jardín de las Herederas",
  description:
    "Una entrega mensual de El Jardín de las Herederas: capítulo y goodies temáticos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${ebGaramond.variable} ${barlow.variable} ${titulos.variable} ${cascadia.variable}`}
    >
      <body className="bg-corte-fondo text-corte-pergamino font-body">
        <Navbar />
        <div className="pt-24 min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}