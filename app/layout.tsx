import "./globals.css";
import { Lora, Barlow } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lora = Lora({
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

const soligant = localFont({
  src: "./fonts/Soligant.woff2",
  variable: "--font-titulo",
});

const cascadia = localFont({
  src: "./fonts/CascadiaCode.woff2",
  variable: "--font-mono",
});

export const metadata = {
  title: "El Jardín de las Herederas",
  description:
    "Una entrega mensual de La Corte Errante: capítulo y goodies temáticos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${lora.variable} ${barlow.variable} ${soligant.variable} ${cascadia.variable}`}
    >
      <body className="bg-corte-fondo text-corte-pergamino font-body">
        <Navbar />
        <div className="pt-24 min-h-screen">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
