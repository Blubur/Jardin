"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Item = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  precio: string;
  imagenes: string[];
  enlace_pago: string;
  disponible: boolean;
};

type Mensaje = { tipo: "ok" | "error"; texto: string } | null;

const MARCA = "/object/public/web/";

function rutaEnBucket(url: string): string | null {
  const i = url.indexOf(MARCA);
  return i === -1 ? null : decodeURIComponent(url.slice(i + MARCA.length));
}

// Resumen de los campos editables, para detectar cambios sin guardar
function firma(i: Item) {
  return JSON.stringify([i.numero, i.titulo, i.descripcion, i.precio, i.enlace_pago, i.disponible]);
}

// Estilos propios del panel (los mismos que en /admin)
const FUENTE =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const INPUT =
  "w-full rounded-md border border-[#d5d8df] bg-white px-3 py-2 text-sm text-[#1f2430] placeholder:text-[#9aa1ad] focus:border-[#49304F] focus:outline-none focus:ring-2 focus:ring-[#49304F]/20 disabled:opacity-60";
const BTN_PRIMARIO =
  "inline-flex items-center justify-center rounded-md bg-[#49304F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5b3d63] disabled:cursor-not-allowed disabled:opacity-40";
const BTN_SECUNDARIO =
  "inline-flex items-center justify-center rounded-md border border-[#d5d8df] bg-white px-4 py-2 text-sm font-medium text-[#1f2430] transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-40";
const BTN_PELIGRO =
  "inline-flex items-center justify-center rounded-md border border-[#f1c9c5] bg-white px-4 py-2 text-sm font-medium text-[#b42318] transition hover:bg-[#fef3f2] disabled:cursor-not-allowed disabled:opacity-40";
const BTN_MINI =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-[#d5d8df] bg-white px-2 text-xs text-[#1f2430] transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-30";
const ETIQUETA = "mb-1 block text-sm font-medium";

export default function AdminCatalogoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [firmas, setFirmas] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState<Mensaje>(null);
  const [ocupado, setOcupado] = useState("");
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [nNumero, setNNumero] = useState("");
  const [nTitulo, setNTitulo] = useState("");
  const [nDescripcion, setNDescripcion] = useState("");
  const [nPrecio, setNPrecio] = useState("11 €");
  const [nEnlace, setNEnlace] = useState("");

  async function cargarItems() {
    const { data } = await supabase
      .from("catalogo")
      .select("*")
      .order("numero", { ascending: true });
    const lista = (data as Item[]) ?? [];
    setItems(lista);
    setFirmas(Object.fromEntries(lista.map((i) => [i.id, firma(i)])));
  }

  useEffect(() => {
    async function iniciar() {
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
      await cargarItems();
      setCargando(false);
    }
    iniciar();
  }, [router]);

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 4500);
    return () => clearTimeout(t);
  }, [mensaje]);

  function editar(id: string, cambios: Partial<Item>) {
    setItems((lista) => lista.map((i) => (i.id === id ? { ...i, ...cambios } : i)));
  }

  async function actualizar(id: string, cambios: Partial<Item>): Promise<boolean> {
    const { data, error } = await supabase
      .from("catalogo")
      .update(cambios)
      .eq("id", id)
      .select("id");
    return !error && !!data && data.length > 0;
  }

  async function anadir() {
    setMensaje(null);
    const numero = parseInt(nNumero, 10);
    if (!Number.isInteger(numero) || numero < 1) {
      setMensaje({ tipo: "error", texto: "Escribe un número de capítulo válido (1, 2, 3...)." });
      return;
    }
    if (nTitulo.trim().length < 2) {
      setMensaje({ tipo: "error", texto: "Escribe el título del capítulo." });
      return;
    }
    setOcupado("nuevo");
    const { error } = await supabase.from("catalogo").insert({
      numero,
      titulo: nTitulo.trim(),
      descripcion: nDescripcion.trim(),
      precio: nPrecio.trim() || "11 €",
      enlace_pago: nEnlace.trim(),
    });
    setOcupado("");
    if (error) {
      setMensaje({
        tipo: "error",
        texto:
          error.code === "23505"
            ? "Ya existe un capítulo con ese número."
            : "No se pudo añadir el capítulo.",
      });
      return;
    }
    setNNumero("");
    setNTitulo("");
    setNDescripcion("");
    setNPrecio("11 €");
    setNEnlace("");
    setMostrarNuevo(false);
    await cargarItems();
    setMensaje({ tipo: "ok", texto: "Capítulo añadido. Ya puedes subirle imágenes." });
  }

  async function guardar(item: Item) {
    setMensaje(null);
    setOcupado(item.id);
    const limpio: Item = {
      ...item,
      titulo: item.titulo.trim(),
      enlace_pago: item.enlace_pago.trim(),
    };
    const ok = await actualizar(item.id, {
      numero: limpio.numero,
      titulo: limpio.titulo,
      descripcion: limpio.descripcion,
      precio: limpio.precio,
      enlace_pago: limpio.enlace_pago,
      disponible: limpio.disponible,
    });
    setOcupado("");
    if (ok) {
      editar(item.id, { titulo: limpio.titulo, enlace_pago: limpio.enlace_pago });
      setFirmas((f) => ({ ...f, [item.id]: firma(limpio) }));
      setMensaje({ tipo: "ok", texto: `Guardado: capítulo ${item.numero}.` });
    } else {
      setMensaje({
        tipo: "error",
        texto: `No se pudo guardar el capítulo ${item.numero} (¿número repetido?).`,
      });
    }
  }

  function descartar(item: Item) {
    // Recarga la lista para volver a los valores guardados
    cargarItems();
  }

  async function borrar(item: Item) {
    if (!window.confirm(`¿Borrar el capítulo ${item.numero}, "${item.titulo}"? No se puede deshacer.`)) return;
    setMensaje(null);
    setOcupado(item.id);
    const rutas = item.imagenes.map(rutaEnBucket).filter((r): r is string => !!r);
    const { error } = await supabase.from("catalogo").delete().eq("id", item.id);
    if (!error && rutas.length > 0) {
      await supabase.storage.from("web").remove(rutas);
    }
    setOcupado("");
    if (error) {
      setMensaje({ tipo: "error", texto: "No se pudo borrar el capítulo." });
      return;
    }
    setItems((lista) => lista.filter((i) => i.id !== item.id));
    setMensaje({ tipo: "ok", texto: "Capítulo borrado." });
  }

  async function subirImagenes(item: Item, archivos: FileList | null) {
    if (!archivos || archivos.length === 0) return;
    setMensaje(null);
    setOcupado(item.id);
    try {
      const nuevas: string[] = [];
      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        const ext = archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const ruta = `catalogo/cap-${item.numero}-${Date.now()}-${i}.${ext}`;
        const { error } = await supabase.storage.from("web").upload(ruta, archivo);
        if (error) throw error;
        nuevas.push(supabase.storage.from("web").getPublicUrl(ruta).data.publicUrl);
      }
      const imagenes = [...item.imagenes, ...nuevas];
      if (!(await actualizar(item.id, { imagenes }))) throw new Error("guardar");
      editar(item.id, { imagenes });
      setMensaje({ tipo: "ok", texto: `Imágenes añadidas al capítulo ${item.numero}.` });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudieron subir las imágenes." });
    }
    setOcupado("");
  }

  async function quitarImagen(item: Item, url: string) {
    setMensaje(null);
    setOcupado(item.id);
    const imagenes = item.imagenes.filter((u) => u !== url);
    if (await actualizar(item.id, { imagenes })) {
      editar(item.id, { imagenes });
      const ruta = rutaEnBucket(url);
      if (ruta) await supabase.storage.from("web").remove([ruta]);
    } else {
      setMensaje({ tipo: "error", texto: "No se pudo quitar la imagen." });
    }
    setOcupado("");
  }

  async function moverImagen(item: Item, indice: number, delta: number) {
    const destino = indice + delta;
    if (destino < 0 || destino >= item.imagenes.length) return;
    const imagenes = [...item.imagenes];
    [imagenes[indice], imagenes[destino]] = [imagenes[destino], imagenes[indice]];
    if (await actualizar(item.id, { imagenes })) editar(item.id, { imagenes });
  }

  // Capa a pantalla completa, independiente del layout de la web
  const capa = "fixed inset-0 z-[100] flex bg-[#f4f5f7] text-[#1f2430]";

  if (cargando) {
    return (
      <div className={`${capa} items-center justify-center`} style={{ fontFamily: FUENTE }}>
        <p className="text-sm text-[#6b7280]">Cargando panel...</p>
      </div>
    );
  }

  if (!esAdmin) {
    return (
      <div className={`${capa} items-center justify-center px-6`} style={{ fontFamily: FUENTE }}>
        <div className="w-full max-w-sm rounded-lg border border-[#e3e5ea] bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold [font-family:inherit]">Acceso restringido</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Esta página es solo para administración.</p>
          <Link href="/panel" className={`${BTN_PRIMARIO} mt-6`}>
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  const bloqueado = ocupado !== "";
  const itemsPendientes = items.filter((i) => firmas[i.id] !== undefined && firma(i) !== firmas[i.id]).length;

  return (
    <div className={capa} style={{ fontFamily: FUENTE }}>
      {/* Barra lateral */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#30213A] text-white md:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-sm font-semibold leading-tight">El Jardín de las Herederas</p>
          <p className="mt-0.5 text-xs text-white/55">Panel de administración</p>
        </div>

        <nav aria-label="Secciones" className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-xs font-medium text-white/45">Contenido de la web</p>
          <Link
            href="/admin"
            className="block rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            Textos e imágenes
          </Link>
          <Link
            href="/admin"
            className="block rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            Preguntas frecuentes
          </Link>

          <p className="mt-6 px-3 pb-2 text-xs font-medium text-white/45">Gestión</p>
          <span
            aria-current="page"
            className="flex w-full items-center justify-between rounded-md border-l-2 border-[#B59A68] bg-white/10 px-3 py-2 text-sm text-white"
          >
            <span>Catálogo de capítulos</span>
            <span className="ml-2 text-xs text-white/50">{items.length}</span>
          </span>
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/panel"
            className="block rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            Volver al panel
          </Link>
        </div>
      </aside>

      {/* Zona principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#e3e5ea] bg-white px-6 py-3 md:h-16 md:flex-nowrap md:px-8 md:py-0">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold [font-family:inherit]">
              Catálogo de capítulos
            </h1>
            <p className="text-xs text-[#6b7280]">
              {items.length} {items.length === 1 ? "capítulo" : "capítulos"}
              {itemsPendientes > 0 &&
                ` · ${itemsPendientes} con cambios sin guardar`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin" className={`${BTN_SECUNDARIO} md:hidden`}>
              Contenido
            </Link>
            <Link href="/panel" className={`${BTN_SECUNDARIO} md:hidden`}>
              Panel
            </Link>
            <button
              onClick={() => setMostrarNuevo((v) => !v)}
              disabled={bloqueado}
              className={BTN_PRIMARIO}
            >
              {mostrarNuevo ? "Cerrar formulario" : "Añadir capítulo"}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
          <div className="w-full space-y-5">
            {/* Formulario de nuevo capítulo */}
            {mostrarNuevo && (
              <div className="rounded-lg border border-[#49304F]/40 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold">Nuevo capítulo</p>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-[120px_1fr_160px]">
                    <div>
                      <label className={ETIQUETA} htmlFor="n-numero">Número</label>
                      <input id="n-numero" type="number" min={1} className={INPUT} value={nNumero} onChange={(e) => setNNumero(e.target.value)} />
                    </div>
                    <div>
                      <label className={ETIQUETA} htmlFor="n-titulo">Título</label>
                      <input id="n-titulo" type="text" className={INPUT} value={nTitulo} onChange={(e) => setNTitulo(e.target.value)} />
                    </div>
                    <div>
                      <label className={ETIQUETA} htmlFor="n-precio">Precio (texto)</label>
                      <input id="n-precio" type="text" className={INPUT} value={nPrecio} onChange={(e) => setNPrecio(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={ETIQUETA} htmlFor="n-desc">Descripción</label>
                    <textarea id="n-desc" rows={3} className={`${INPUT} resize-y`} value={nDescripcion} onChange={(e) => setNDescripcion(e.target.value)} />
                  </div>
                  <div>
                    <label className={ETIQUETA} htmlFor="n-enlace">Enlace de pago de Stripe (opcional)</label>
                    <input id="n-enlace" type="text" className={INPUT} value={nEnlace} onChange={(e) => setNEnlace(e.target.value)} placeholder="https://buy.stripe.com/..." />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={anadir} disabled={bloqueado} className={BTN_PRIMARIO}>
                    {ocupado === "nuevo" ? "Añadiendo..." : "Añadir capítulo"}
                  </button>
                  <button onClick={() => setMostrarNuevo(false)} disabled={bloqueado} className={BTN_SECUNDARIO}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de capítulos */}
            {items.length === 0 && !mostrarNuevo ? (
              <div className="rounded-lg border border-dashed border-[#d5d8df] bg-white px-6 py-12 text-center">
                <p className="text-sm font-medium">Aún no hay capítulos</p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Crea el primero con el botón «Añadir capítulo».
                </p>
              </div>
            ) : (
              items.map((item) => {
                const mod = firmas[item.id] !== undefined && firma(item) !== firmas[item.id];
                const enCurso = ocupado === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border bg-white p-6 shadow-sm ${
                      mod ? "border-[#e0b94f] bg-[#fffbeb]" : "border-[#e3e5ea]"
                    }`}
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold">Capítulo {item.numero}</p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.disponible
                              ? "bg-[#e6f4ec] text-[#2f6f4f]"
                              : "bg-[#eceef2] text-[#6b7280]"
                          }`}
                        >
                          {item.disponible ? "Disponible" : "Próximamente"}
                        </span>
                      </div>
                      {mod && (
                        <span className="text-xs font-medium text-[#92400e]">Sin guardar</span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-[120px_1fr_160px]">
                        <div>
                          <label className={ETIQUETA} htmlFor={`num-${item.id}`}>Número</label>
                          <input id={`num-${item.id}`} type="number" min={1} className={INPUT} value={item.numero} onChange={(e) => editar(item.id, { numero: parseInt(e.target.value, 10) || 0 })} />
                        </div>
                        <div>
                          <label className={ETIQUETA} htmlFor={`tit-${item.id}`}>Título</label>
                          <input id={`tit-${item.id}`} type="text" className={INPUT} value={item.titulo} onChange={(e) => editar(item.id, { titulo: e.target.value })} />
                        </div>
                        <div>
                          <label className={ETIQUETA} htmlFor={`pre-${item.id}`}>Precio (texto)</label>
                          <input id={`pre-${item.id}`} type="text" className={INPUT} value={item.precio} onChange={(e) => editar(item.id, { precio: e.target.value })} />
                        </div>
                      </div>

                      <div>
                        <label className={ETIQUETA} htmlFor={`des-${item.id}`}>Descripción</label>
                        <textarea id={`des-${item.id}`} rows={3} className={`${INPUT} resize-y`} value={item.descripcion} onChange={(e) => editar(item.id, { descripcion: e.target.value })} />
                      </div>

                      <div>
                        <label className={ETIQUETA} htmlFor={`enl-${item.id}`}>Enlace de pago de Stripe</label>
                        <input id={`enl-${item.id}`} type="text" className={INPUT} value={item.enlace_pago} onChange={(e) => editar(item.id, { enlace_pago: e.target.value })} />
                      </div>

                      <label className="flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[#49304F]"
                          checked={item.disponible}
                          onChange={(e) => editar(item.id, { disponible: e.target.checked })}
                        />
                        <span>
                          Disponible para comprar (si no, aparece como «Próximamente»)
                        </span>
                      </label>

                      {/* Imágenes */}
                      <div>
                        <p className={ETIQUETA}>Imágenes</p>
                        <p className="mb-3 text-xs text-[#9aa1ad]">
                          Se muestran en este orden. Las imágenes se guardan en cuanto las subes, las quitas o las mueves.
                        </p>
                        {item.imagenes.length > 0 && (
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {item.imagenes.map((url, idx) => (
                              <div key={url}>
                                <div className="aspect-[3/4] overflow-hidden rounded-md border border-[#e3e5ea] bg-[#f4f5f7]">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt="" className="h-full w-full object-cover" />
                                </div>
                                <div className="mt-2 flex items-center gap-1.5">
                                  <button type="button" onClick={() => moverImagen(item, idx, -1)} disabled={bloqueado || idx === 0} className={BTN_MINI} aria-label="Mover antes" title="Mover antes">←</button>
                                  <button type="button" onClick={() => moverImagen(item, idx, 1)} disabled={bloqueado || idx === item.imagenes.length - 1} className={BTN_MINI} aria-label="Mover después" title="Mover después">→</button>
                                  <button type="button" onClick={() => quitarImagen(item, url)} disabled={bloqueado} className={`${BTN_MINI} ml-auto text-[#b42318]`}>Quitar</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-3">
                          <input
                            id={`img-${item.id}`}
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            disabled={bloqueado}
                            onChange={(e) => {
                              subirImagenes(item, e.target.files);
                              e.target.value = "";
                            }}
                          />
                          <label
                            htmlFor={`img-${item.id}`}
                            className={`${BTN_SECUNDARIO} cursor-pointer ${
                              bloqueado ? "pointer-events-none opacity-40" : ""
                            }`}
                          >
                            {enCurso ? "Un momento..." : "Subir imágenes"}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#eceef2] pt-4">
                      <button
                        onClick={() => guardar(item)}
                        disabled={bloqueado || !mod}
                        className={BTN_PRIMARIO}
                      >
                        {enCurso ? "Guardando..." : "Guardar cambios"}
                      </button>
                      {mod && (
                        <button
                          onClick={() => descartar(item)}
                          disabled={bloqueado}
                          className={BTN_SECUNDARIO}
                        >
                          Descartar
                        </button>
                      )}
                      <button
                        onClick={() => borrar(item)}
                        disabled={bloqueado}
                        className={`${BTN_PELIGRO} ml-auto`}
                      >
                        Borrar capítulo
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* Aviso */}
      {mensaje && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[110]">
          <p
            role={mensaje.tipo === "error" ? "alert" : "status"}
            className={`pointer-events-auto max-w-sm rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg ${
              mensaje.tipo === "ok" ? "bg-[#2f6f4f]" : "bg-[#b42318]"
            }`}
          >
            {mensaje.texto}
          </p>
        </div>
      )}
    </div>
  );
}
