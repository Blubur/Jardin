"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CAMPOS, Campo } from "@/lib/camposEditables";

type Mensaje = { tipo: "ok" | "error"; texto: string } | null;

// Estilos propios del panel (independientes del resto de la web)
const FUENTE =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const INPUT =
  "w-full rounded-md border border-[#d5d8df] bg-white px-3 py-2 text-sm text-[#1f2430] placeholder:text-[#9aa1ad] focus:border-[#49304F] focus:outline-none focus:ring-2 focus:ring-[#49304F]/20 disabled:opacity-60";
const BTN_PRIMARIO =
  "inline-flex items-center justify-center rounded-md bg-[#49304F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5b3d63] disabled:cursor-not-allowed disabled:opacity-40";
const BTN_SECUNDARIO =
  "inline-flex items-center justify-center rounded-md border border-[#d5d8df] bg-white px-4 py-2 text-sm font-medium text-[#1f2430] transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-40";

export default function AdminPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [guardados, setGuardados] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState("");
  const [mensaje, setMensaje] = useState<Mensaje>(null);
  const [activo, setActivo] = useState(0);

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

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 4500);
    return () => clearTimeout(t);
  }, [mensaje]);

  const grupos = useMemo(() => Array.from(new Set(CAMPOS.map((c) => c.grupo))), []);

  function modificado(campo: Campo) {
    return campo.tipo !== "imagen" && (valores[campo.clave] ?? "") !== (guardados[campo.clave] ?? "");
  }

  const pendientes = CAMPOS.filter(modificado);
  const pendientesPorGrupo = (g: string) => pendientes.filter((c) => c.grupo === g).length;

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

  async function guardarTodo() {
    if (pendientes.length === 0) return;
    setMensaje(null);
    setOcupado("__todo");
    const hechos: Record<string, string> = {};
    try {
      for (const campo of pendientes) {
        const valor = valores[campo.clave] ?? "";
        await guardarValor(campo, valor);
        hechos[campo.clave] = valor;
      }
      setMensaje({
        tipo: "ok",
        texto: `Se guardaron ${pendientes.length} ${pendientes.length === 1 ? "cambio" : "cambios"}.`,
      });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudieron guardar todos los cambios." });
    }
    setGuardados((g) => ({ ...g, ...hechos }));
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

  const grupoActivo = grupos[activo] ?? grupos[0];
  const camposGrupo = CAMPOS.filter((c) => c.grupo === grupoActivo);

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
          <ul className="space-y-0.5">
            {grupos.map((g, i) => {
              const n = pendientesPorGrupo(g);
              const sel = i === activo;
              return (
                <li key={g}>
                  <button
                    onClick={() => setActivo(i)}
                    aria-current={sel ? "page" : undefined}
                    className={`flex w-full items-center justify-between rounded-md border-l-2 px-3 py-2 text-left text-sm transition ${
                      sel
                        ? "border-[#B59A68] bg-white/10 text-white"
                        : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="truncate">{g}</span>
                    {n > 0 && (
                      <span className="ml-2 rounded-full bg-[#B59A68] px-1.5 text-xs font-medium text-[#30213A]">
                        {n}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 px-3 pb-2 text-xs font-medium text-white/45">Gestión</p>
          <Link
            href="/admin/catalogo"
            className="block rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            Catálogo de capítulos
          </Link>
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
              {grupoActivo}
            </h1>
            <p className="text-xs text-[#6b7280]">
              {camposGrupo.length} {camposGrupo.length === 1 ? "campo editable" : "campos editables"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de sección en móvil */}
            <select
              aria-label="Sección"
              value={activo}
              onChange={(e) => setActivo(Number(e.target.value))}
              className={`${INPUT} w-auto md:hidden`}
            >
              {grupos.map((g, i) => (
                <option key={g} value={i}>
                  {g}
                </option>
              ))}
            </select>

            {pendientes.length > 0 && (
              <span className="hidden rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-medium text-[#92400e] sm:inline">
                {pendientes.length} {pendientes.length === 1 ? "cambio sin guardar" : "cambios sin guardar"}
              </span>
            )}
            <button
              onClick={guardarTodo}
              disabled={pendientes.length === 0 || ocupado !== ""}
              className={BTN_PRIMARIO}
            >
              {ocupado === "__todo" ? "Guardando..." : "Guardar todo"}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
          <div className="w-full overflow-hidden rounded-lg border border-[#e3e5ea] bg-white shadow-sm">
            {camposGrupo.map((campo, idx) => {
              const mod = modificado(campo);
              const enCurso = ocupado === campo.clave;
              const bloqueado = ocupado !== "";

              return (
                <div
                  key={campo.clave}
                  className={`grid gap-4 px-6 py-5 md:grid-cols-[260px_1fr] md:gap-8 ${
                    idx > 0 ? "border-t border-[#eceef2]" : ""
                  } ${mod ? "bg-[#fffbeb]" : ""}`}
                >
                  <div>
                    <label htmlFor={campo.clave} className="text-sm font-medium">
                      {campo.etiqueta}
                    </label>
                    <p className="mt-1 break-all text-xs text-[#9aa1ad]">{campo.clave}</p>
                    {mod && (
                      <p className="mt-2 text-xs font-medium text-[#92400e]">Sin guardar</p>
                    )}
                  </div>

                  {campo.tipo === "imagen" ? (
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="flex h-28 w-48 items-center justify-center overflow-hidden rounded-md border border-dashed border-[#d5d8df] bg-[#f4f5f7]">
                        {valores[campo.clave] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={valores[campo.clave]}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-[#9aa1ad]">Sin imagen</span>
                        )}
                      </div>
                      <div>
                        <input
                          id={campo.clave}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={bloqueado}
                          onChange={(e) => subirImagen(campo, e.target.files?.[0])}
                        />
                        <label
                          htmlFor={campo.clave}
                          className={`${BTN_SECUNDARIO} cursor-pointer ${
                            bloqueado ? "pointer-events-none opacity-40" : ""
                          }`}
                        >
                          {enCurso ? "Subiendo..." : "Cambiar imagen"}
                        </label>
                        <p className="mt-2 text-xs text-[#9aa1ad]">
                          La imagen se publica en cuanto termina de subirse.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {campo.tipo === "largo" ? (
                        <textarea
                          id={campo.clave}
                          rows={6}
                          className={`${INPUT} resize-y`}
                          value={valores[campo.clave] ?? ""}
                          onChange={(e) =>
                            setValores((v) => ({ ...v, [campo.clave]: e.target.value }))
                          }
                        />
                      ) : (
                        <input
                          id={campo.clave}
                          type="text"
                          className={INPUT}
                          value={valores[campo.clave] ?? ""}
                          onChange={(e) =>
                            setValores((v) => ({ ...v, [campo.clave]: e.target.value }))
                          }
                        />
                      )}
                      {mod && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => guardarTexto(campo)}
                            disabled={bloqueado}
                            className={BTN_PRIMARIO}
                          >
                            {enCurso ? "Guardando..." : "Guardar cambios"}
                          </button>
                          <button
                            onClick={() => descartar(campo)}
                            disabled={bloqueado}
                            className={BTN_SECUNDARIO}
                          >
                            Descartar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
