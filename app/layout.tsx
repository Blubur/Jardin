import "./globals.css";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
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
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="bg-corte-fondo text-corte-pergamino font-body">
        {children}
      </body>
    </html>
  );
}
