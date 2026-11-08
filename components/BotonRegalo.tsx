"use client";

import { useState } from "react";
import { ENLACES_REGALO } from "@/lib/regalos";

export default function BotonRegalo({
  clave,
  className,
  children,
}: {
  clave: "regalo-carta" | "regalo-pack-2" | "regalo-3-meses";
  className?: string;
  children: React.ReactNode;
}) {
  const [aviso, setAviso] = useState("");

  function ir() {
    const enlace = ENLACES_REGALO[clave];
    if (!enlace) {
      setAviso("Esta opción estará disponible muy pronto.");
      return;
    }
    window.location.href = enlace;
  }

  return (
    <div>
      <button onClick={ir} className={className}>
        {children}
      </button>
      {aviso && <p style={{ color: "#b00020", marginTop: 8 }}>{aviso}</p>}
    </div>
  );
}
