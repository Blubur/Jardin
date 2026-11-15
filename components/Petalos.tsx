"use client";

import { useEffect, useState } from "react";

type Petalo = {
  x: number;
  tam: number;
  dur: number;
  sway: number;
  delay: number;
  op: number;
};

const CANTIDAD = 12;

export default function Petalos() {
  const [petalos, setPetalos] = useState<Petalo[]>([]);

  // Se generan tras montar para evitar diferencias entre servidor y navegador
  useEffect(() => {
    setPetalos(
      Array.from({ length: CANTIDAD }, () => ({
        x: Math.random() * 100,
        tam: 9 + Math.random() * 7,
        dur: 22 + Math.random() * 16,
        sway: 5 + Math.random() * 4,
        delay: -Math.random() * 35,
        op: 0.25 + Math.random() * 0.25,
      }))
    );
  }, []);

  return (
    <div className="petalos" aria-hidden="true">
      {petalos.map((p, i) => (
        <span
          key={i}
          className="petalo-cae"
          style={
            { "--dur": `${p.dur}s`, "--delay": `${p.delay}s` } as React.CSSProperties
          }
        >
          <span
            className="petalo"
            style={
              {
                "--x": `${p.x}%`,
                "--tam": `${p.tam}px`,
                "--sway": `${p.sway}s`,
                "--delay": `${p.delay}s`,
                "--op": p.op,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}
