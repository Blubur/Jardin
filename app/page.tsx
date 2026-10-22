"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [guardados, setGuardados] = useState<Record<string, string>>({});
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
      setGuardados(mapa);
      setCargando(false);
    }
    cargar();
  }, [router]);

  // El aviso se cierra solo a los pocos segundos
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 4500);
    return () => clearTimeout(t);
  }, [mensaje]);

  const grupos = useMemo(() => Array.from(new Set(CAMPOS.map((c) => c.grupo))), []);

  const sinGuardar = useMemo(
    () =>
      CAMPOS.filter(
        (c) => c.tipo !== "imagen" && (valores[c.clave] ?? "") !== (guardados[c.clave] ?? "")
      ).length,
    [valores, guardados]
  );

  function estaModificado(campo: Campo) {
    return (valores[campo.clave] ?? "") !== (guardados[campo.clave] ?? "");
  }

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
      const valor = valores[campo.clave] ?? "";
      await guardarValor(campo, valor);
      setGuardados((g) => ({ ...g, [campo.clave]: valor }));
      setMensaje({ tipo: "ok", texto: `Guardado: ${campo.etiqueta}.` });
    } catch {
      setMensaje({ tipo: "error", texto: `No se pudo guardar: ${campo.etiqueta}.` });
    }
    setOcupado("");
  }

  function descartar(campo: Campo) {
    setValores((v) => ({ ...v, [campo.clave]: guardados[campo.clave] ?? "" }));
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
      setGuardados((g) => ({ ...g, [campo.clave]: data.publicUrl }));
      setMensaje({ tipo: "ok", texto: `Imagen actualizada: ${campo.etiqueta}.` });
    } catch {
      setMensaje({ tipo: "error", texto: `No se pudo subir la imagen: ${campo.etiqueta}.` });
    }
    setOcupado("");
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <p className="text-corte-pergamino/60">Cargando...</p>
      </main>
    );
  }

  if (!esAdmin) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6">
        <div className="max-w-md rounded-sm border border-corte-oro/30 p-8 text-center">
          <h1 className="titulo-2">Acceso restringido</h1>
          <p className="texto-suave mt-4">Esta página es solo para administración.</p>
          <Link href="/panel" className="boton boton-secundario mt-6">
            Volver al panel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-corte-oro/20 bg-corte-fondo/90 backdrop-blur">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-corte-lavanda">Administración</p>
              <h1 className="font-display text-xl font-semibold text-corte-pergamino">
                Contenido de la web
              </h1>
            </div>
            {sinGuardar > 0 && (
              <span className="rounded-full border border-corte-oro/50 px-3 py-1 text-xs text-corte-oro">
                {sinGuardar} {sinGuardar === 1 ? "cambio sin guardar" : "cambios sin guardar"}
              </span>
            )}
          </div>

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/admin/catalogo"
              className="rounded-sm border border-corte-pergamino/30 px-4 py-2 text-corte-pergamino hover:border-corte-pergamino/60"
            >
              Catálogo de capítulos
            </Link>
            <Link
              href="/panel"
              className="rounded-sm border border-corte-pergamino/30 px-4 py-2 text-corte-pergamino hover:border-corte-pergamino/60"
            >
              Volver al panel
            </Link>
          </nav>
        </div>
      </header>

      {/* Aviso flotante */}
      {mensaje && (
        <div className="pointer-events-none fixed right-6 top-20 z-40">
          <p
            role={mensaje.tipo === "error" ? "alert" : "status"}
            className={`pointer-events-auto max-w-sm bg-corte-fondo shadow-lg ${
              mensaje.tipo === "ok" ? "aviso-ok" : "aviso-error"
            }`}
          >
            {mensaje.texto}
          </p>
        </div>
      )}

      <div className="flex w-full flex-1 flex-col lg:flex-row">
        {/* Navegación por grupos */}
        <aside className="border-b border-corte-oro/20 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <nav
            aria-label="Secciones"
            className="flex gap-1 overflow-x-auto px-6 py-3 lg:flex-col lg:gap-0 lg:px-4 lg:py-6"
          >
            <p className="mb-2 hidden px-3 text-xs text-corte-pergamino/50 lg:block">
              Secciones
            </p>
            {grupos.map((grupo, i) => (
              <a
                key={grupo}
                href={`#grupo-${i}`}
                className="whitespace-nowrap rounded-sm px-3 py-2 text-sm text-corte-pergamino/75 hover:bg-corte-pergamino/5 hover:text-corte-pergamino"
              >
                {grupo}
              </a>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
          {grupos.map((grupo, i) => {
            const campos = CAMPOS.filter((c) => c.grupo === grupo);
            return (
              <section
                key={grupo}
                id={`grupo-${i}`}
                className={`scroll-mt-24 ${i > 0 ? "mt-12" : ""}`}
              >
                <div className="mb-5 flex items-baseline justify-between border-b border-corte-oro/20 pb-3">
                  <h2 className="titulo-3">{grupo}</h2>
                  <span className="text-xs text-corte-pergamino/50">
                    {campos.length} {campos.length === 1 ? "campo" : "campos"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                  {campos.map((campo) => {
                    const modificado = estaModificado(campo);
                    const enCurso = ocupado === campo.clave;
                    const ancho = campo.tipo === "largo" ? "xl:col-span-2 2xl:col-span-2" : "";

                    return (
                      <div
                        key={campo.clave}
                        className={`flex flex-col rounded-sm border bg-corte-fondo2/30 p-5 transition-colors ${
                          modificado ? "border-corte-oro/60" : "border-corte-oro/20"
                        } ${ancho}`}
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <label
                            className="text-sm font-medium text-corte-pergamino"
                            htmlFor={campo.clave}
                          >
                            {campo.etiqueta}
                          </label>
                          {modificado && (
                            <span className="text-xs text-corte-oro">Sin guardar</span>
                          )}
                        </div>

                        {campo.tipo === "imagen" ? (
                          <div className="flex flex-1 flex-col gap-4">
                            <div className="flex h-44 items-center justify-center overflow-hidden rounded-sm border border-dashed border-corte-pergamino/25 bg-black/10">
                              {valores[campo.clave] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={valores[campo.clave]}
                                  alt=""
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <span className="text-sm text-corte-pergamino/40">
                                  Sin imagen
                                </span>
                              )}
                            </div>
                            <div>
                              <input
                                id={campo.clave}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                disabled={enCurso}
                                onChange={(e) => subirImagen(campo, e.target.files?.[0])}
                              />
                              <label
                                htmlFor={campo.clave}
                                className={`boton boton-secundario cursor-pointer text-sm ${
                                  enCurso ? "opacity-60" : ""
                                }`}
                              >
                                {enCurso ? "Subiendo..." : "Cambiar imagen"}
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-1 flex-col">
                            {campo.tipo === "largo" ? (
                              <textarea
                                id={campo.clave}
                                rows={6}
                                className="campo flex-1 resize-y"
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

                            <div className="mt-4 flex items-center gap-3">
                              <button
                                onClick={() => guardarTexto(campo)}
                                disabled={enCurso || !modificado}
                                className="boton boton-primario text-sm"
                              >
                                {enCurso ? "Guardando..." : "Guardar cambios"}
                              </button>
                              {modificado && !enCurso && (
                                <button
                                  onClick={() => descartar(campo)}
                                  className="text-sm text-corte-pergamino/60 underline underline-offset-4 hover:text-corte-pergamino"
                                >
                                  Descartar
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}