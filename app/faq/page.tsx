import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const metadata = {
  title: "Preguntas frecuentes · El Jardín de las Herederas",
};

// Siempre datos frescos: lo que edites en el panel se ve al recargar
export const revalidate = 0;

export default async function FaqPage() {
  const { data } = await supabase
    .from("faqs")
    .select("id, pregunta, respuesta")
    .order("orden", { ascending: true });

  const faqs = data ?? [];

  return (
    <main className="contenedor-estrecho">
      <p className="kicker">Antes de suscribirte</p>
      <h1 className="titulo-1">Preguntas frecuentes</h1>

      {faqs.length === 0 ? (
        <p className="mt-10 texto">Pronto añadiré aquí las preguntas más habituales.</p>
      ) : (
        <div className="mt-10 divide-y divide-corte-oro/20 border-y border-corte-oro/20">
          {faqs.map((item) => (
            <details key={item.id} className="py-5">
              <summary className="faq-resumen titulo-3">
                <span className="flor" aria-hidden="true">ꕤ</span>
                {item.pregunta}
              </summary>
              <div className="mt-3 space-y-3">
                {item.respuesta.split("\n\n").map((parrafo: string, i: number) => (
                  <p key={i} className="texto">
                    {parrafo}
                  </p>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}

      <p className="mt-10 texto-suave">
        ¿No encuentras tu respuesta?{" "}
        <Link
          href="/contacto"
          className="underline underline-offset-4 hover:text-corte-pergamino"
        >
          Escríbeme desde Contacto
        </Link>
        .
      </p>
    </main>
  );
}
