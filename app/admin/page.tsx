"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CAMPOS, Campo } from "@/lib/camposEditables";

type Mensaje = { tipo: "ok" | "error"; texto: string } | null;

export default function AdminPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState("");
  const [mensaje, setMensaje] = useState<Mensaje>(null);

  useEffect(() => {
    async function cargar() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/registro");
        return;
      }

      const { data: admin } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!admin) {
        setCargando(false);
        return;
      }
      setEsAdmin(true);

      const { data } = await supabase.from("contenido").select("clave, valor");
      const mapa: Record<string, string> = {};
      CAMPOS.forEach((c) => (mapa[c.clave] = c.porDefecto));
      (data ?? []).forEach((f) => (mapa[f.clave] = f.valor));
      setValores(mapa);
      setCargando(false);
    }
    cargar();
  }, [router]);

  async function guardarValor(campo: Campo, valor: string) {
    const { data, error } = await supabase
      .from("contenido")
      .upsert({
        clave: campo.clave,
        valor,
        tipo: campo.tipo,
        updated_at: new Date().toISOString(),
      })
      .select("clave");
    if (error || !data || data.length === 0) {
      throw new Error("No se pudo guardar.");
    }
  }

  async function guardarTexto(campo: Campo) {
    setMensaje(null);
    setOcupado(campo.clave);
    try {
      await guardarValor(campo, valores[campo.clave] ?? "");
      setMensaje({ tipo: "ok", texto: `Guardado: ${campo.etiqueta}.` });
    } catch {
      setMensaje({ tipo: "error", texto: `No se pudo guardar: ${campo.etiqueta}.` });
    }
    setOcupado("");
  }

  async function subirImagen(campo: Campo, archivo: File | undefined) {
    if (!archivo) return;
    setMensaje(null);
    setOcupado(campo.clave);
    try {
      const ext = archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const ruta = `${campo.clave}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("web").upload(ruta, archivo);
      if (error) throw error;
      const { data } = supabase.storage.from("web").getPublicUrl(ruta);
      await guardarValor(campo, data.publicUrl);
      setValores((v) => ({ ...v, [campo.clave]: data.publicUrl }));
      setMensaje({ tipo: "ok", texto: `Imagen actualizada: ${campo.etiqueta}.` });
    } catch {
      setMensaje({ tipo: "error", texto: `No se pudo subir la imagen: ${campo.etiqueta}.` });
    }
    setOcupado("");
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-corte-pergamino/60">Cargando...</p>
      </main>
    );
  }

  if (!esAdmin) {
    return (
      <main className="contenedor-estrecho">
        <h1 className="titulo-2">Acceso restringido</h1>
        <p className="texto-suave mt-4">Esta página es solo para administración.</p>
      </main>
    );
  }

  const grupos = Array.from(new Set(CAMPOS.map((c) => c.grupo)));

  return (
    <main className="contenedor-estrecho">
      <p className="kicker">Administración</p>
      <h1 className="titulo-2">Contenido de la web</h1>
      <p className="mt-4">
        <Link href="/panel" className="text-sm underline underline-offset-4">
          ← Volver al panel
        </Link>
      </p>
      <p className="mt-2">
        <Link href="/admin/catalogo" className="text-sm underline underline-offset-4">
          Gestionar catálogo de capítulos →
        </Link>
      </p>
      {mensaje && (
        <p
          role={mensaje.tipo === "error" ? "alert" : "status"}
          className={mensaje.tipo === "ok" ? "aviso-ok mt-6" : "aviso-error mt-6"}
        >
          {mensaje.texto}
        </p>
      )}

      {grupos.map((grupo) => (
        <section key={grupo} className="mt-10 border-t border-corte-oro/20 pt-8">
          <h2 className="titulo-3">{grupo}</h2>

          {CAMPOS.filter((c) => c.grupo === grupo).map((campo) => (
            <div key={campo.clave} className="mt-6">
              <label className="etiqueta" htmlFor={campo.clave}>
                {campo.etiqueta}
              </label>

              {campo.tipo === "imagen" ? (
                <>
                  {valores[campo.clave] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={valores[campo.clave]}
                      alt=""
                      className="mb-3 max-h-48 rounded"
                    />
                  )}
                  <input
                    id={campo.clave}
                    type="file"
                    accept="image/*"
                    disabled={ocupado === campo.clave}
                    onChange={(e) => subirImagen(campo, e.target.files?.[0])}
                  />
                </>
              ) : (
                <>
                  {campo.tipo === "largo" ? (
                    <textarea
                      id={campo.clave}
                      rows={4}
                      className="campo"
                      value={valores[campo.clave] ?? ""}
                      onChange={(e) =>
                        setValores((v) => ({ ...v, [campo.clave]: e.target.value }))
                      }
                    />
                  ) : (
                    <input
                      id={campo.clave}
                      type="text"
                      className="campo"
                      value={valores[campo.clave] ?? ""}
                      onChange={(e) =>
                        setValores((v) => ({ ...v, [campo.clave]: e.target.value }))
                      }
                    />
                  )}
                  <button
                    onClick={() => guardarTexto(campo)}
                    disabled={ocupado === campo.clave}
                    className="boton boton-primario mt-3"
                  >
                    {ocupado === campo.clave ? "Guardando..." : "Guardar"}
                  </button>
                </>
              )}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
