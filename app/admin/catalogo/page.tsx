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

export default function AdminCatalogoPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [mensaje, setMensaje] = useState<Mensaje>(null);
  const [ocupado, setOcupado] = useState("");

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
    setItems((data as Item[]) ?? []);
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
    await cargarItems();
    setMensaje({ tipo: "ok", texto: "Capítulo añadido. Ya puedes subirle imágenes." });
  }

  async function guardar(item: Item) {
    setMensaje(null);
    setOcupado(item.id);
    const ok = await actualizar(item.id, {
      numero: item.numero,
      titulo: item.titulo.trim(),
      descripcion: item.descripcion,
      precio: item.precio,
      enlace_pago: item.enlace_pago.trim(),
      disponible: item.disponible,
    });
    setOcupado("");
    setMensaje(
      ok
        ? { tipo: "ok", texto: `Guardado: capítulo ${item.numero}.` }
        : { tipo: "error", texto: `No se pudo guardar el capítulo ${item.numero} (¿número repetido?).` }
    );
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

  return (
    <main className="contenedor-estrecho">
      <p className="kicker">Administración</p>
      <h1 className="titulo-2">Catálogo de capítulos</h1>
      <p className="mt-4">
        <Link href="/admin" className="text-sm underline underline-offset-4">
          ← Volver a contenido de la web
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

      <section className="mt-10 border-t border-corte-oro/20 pt-8">
        <h2 className="titulo-3">Añadir capítulo</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="etiqueta" htmlFor="n-numero">Número</label>
            <input id="n-numero" type="number" min={1} className="campo" value={nNumero} onChange={(e) => setNNumero(e.target.value)} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="n-titulo">Título</label>
            <input id="n-titulo" type="text" className="campo" value={nTitulo} onChange={(e) => setNTitulo(e.target.value)} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="n-desc">Descripción</label>
            <textarea id="n-desc" rows={3} className="campo" value={nDescripcion} onChange={(e) => setNDescripcion(e.target.value)} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="n-precio">Precio (texto)</label>
            <input id="n-precio" type="text" className="campo" value={nPrecio} onChange={(e) => setNPrecio(e.target.value)} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="n-enlace">Enlace de pago de Stripe (opcional)</label>
            <input id="n-enlace" type="text" className="campo" value={nEnlace} onChange={(e) => setNEnlace(e.target.value)} placeholder="https://buy.stripe.com/..." />
          </div>
          <button onClick={anadir} disabled={ocupado === "nuevo"} className="boton boton-primario">
            {ocupado === "nuevo" ? "Añadiendo..." : "Añadir capítulo"}
          </button>
        </div>
      </section>

      <section className="mt-12 border-t border-corte-oro/20 pt-8">
        <h2 className="titulo-3">Capítulos ({items.length})</h2>
        {items.length === 0 && (
          <p className="texto-suave mt-4">Aún no hay capítulos en la base de datos.</p>
        )}

        {items.map((item) => (
          <div key={item.id} className="mt-8 rounded-sm border border-corte-oro/30 p-5 space-y-4">
            <div>
              <label className="etiqueta">Número</label>
              <input type="number" min={1} className="campo" value={item.numero} onChange={(e) => editar(item.id, { numero: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div>
              <label className="etiqueta">Título</label>
              <input type="text" className="campo" value={item.titulo} onChange={(e) => editar(item.id, { titulo: e.target.value })} />
            </div>
            <div>
              <label className="etiqueta">Descripción</label>
              <textarea rows={3} className="campo" value={item.descripcion} onChange={(e) => editar(item.id, { descripcion: e.target.value })} />
            </div>
            <div>
              <label className="etiqueta">Precio (texto)</label>
              <input type="text" className="campo" value={item.precio} onChange={(e) => editar(item.id, { precio: e.target.value })} />
            </div>
            <div>
              <label className="etiqueta">Enlace de pago de Stripe</label>
              <input type="text" className="campo" value={item.enlace_pago} onChange={(e) => editar(item.id, { enlace_pago: e.target.value })} />
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={item.disponible} onChange={(e) => editar(item.id, { disponible: e.target.checked })} />
              <span>Disponible para comprar (si no, aparece como &quot;Próximamente&quot;)</span>
            </label>

            <div>
              <p className="etiqueta">Imágenes (se muestran en este orden)</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {item.imagenes.map((url, idx) => (
                  <div key={url}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full rounded-sm" />
                    <div className="mt-1 flex gap-3 text-sm">
                      <button type="button" onClick={() => moverImagen(item, idx, -1)} className="underline" aria-label="Mover antes">←</button>
                      <button type="button" onClick={() => moverImagen(item, idx, 1)} className="underline" aria-label="Mover después">→</button>
                      <button type="button" onClick={() => quitarImagen(item, url)} className="underline">Quitar</button>
                    </div>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="mt-3"
                disabled={ocupado === item.id}
                onChange={(e) => {
                  subirImagenes(item, e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => guardar(item)} disabled={ocupado === item.id} className="boton boton-primario">
                {ocupado === item.id ? "Un momento..." : "Guardar cambios"}
              </button>
              <button onClick={() => borrar(item)} disabled={ocupado === item.id} className="boton boton-secundario">
                Borrar capítulo
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
