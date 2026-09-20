"use client";

import { useState } from "react";

export default function Galeria({
  imagenes,
  alt,
}: {
  imagenes: string[];
  alt: string;
}) {
  const [i, setI] = useState(0);
  const total = imagenes.length;
  const ir = (paso: number) => setI((i + paso + total) % total);

  return (
    <div className="relative overflow-hidden rounded-sm border border-corte-oro/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagenes[i]}
        alt={`${alt} (${i + 1} de ${total})`}
        className="aspect-[4/5] w-full object-cover"
      />
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => ir(-1)}
            aria-label="Imagen anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-corte-fondo/70 px-3 py-1 text-corte-pergamino hover:bg-corte-fondo"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => ir(1)}
            aria-label="Imagen siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-corte-fondo/70 px-3 py-1 text-corte-pergamino hover:bg-corte-fondo"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {imagenes.map((_, n) => (
              <span
                key={n}
                className={`h-2 w-2 rounded-full ${
                  n === i ? "bg-corte-oro" : "bg-corte-pergamino/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
