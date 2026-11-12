import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export const metadata = {
  title: "Preguntas del amigo invisible · El Jardín de las Herederas",
};

// Siempre datos frescos: lo que edites en el panel se ve al recargar
export const revalidate = 0;

export default async function FaqAmigoInvisiblePage() {
  const { data } = await supabase
    .from("faqs")
    .select("id, pregunta, respuesta")
    .ilike("pregunta", "Amigo invisible:%")
    .order("orden", { ascending: true });

  const faqs = data ?? [];

  return (
    <main className="contenedor-estrecho">
      <p className="kicker">Navidad</p>
      <h1 className="titulo-1">Preguntas sobre el amigo invisible</h1>

      {faqs.length === 0 ? (
        <p className="mt-10 texto">Pronto añadiré aquí las preguntas sobre el amigo invisible.</p>
      ) : (
        <div className="mt-10 divide-y divide-corte-oro/20 border-y border-corte-oro/20">
          {faqs.map((item) => (
            <details key={item.id} className="py-5">
              <summary className="faq-resumen titulo-3">
                <span className="flor" aria-hidden="true">ꕤ</span>
                {item.pregunta.replace(/^Amigo invisible:\s*/i, "")}
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
        ¿Otra duda? Mira las{" "}
        <Link
          href="/faq"
          className="underline underline-offset-4 hover:text-corte-pergamino"
        >
          preguntas frecuentes
        </Link>{" "}
        o{" "}
        <Link
          href="/contacto"
          className="underline underline-offset-4 hover:text-corte-pergamino"
        >
          escríbeme desde Contacto
        </Link>
        .
      </p>
    </main>
  );
}
