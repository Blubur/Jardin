"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CAMPOS, Campo } from "@/lib/camposEditables";

type Mensaje = { tipo: "ok" | "error"; texto: string } | null;
type Faq = { id: string; pregunta: string; respuesta: string; orden: number };
type FaqTexto = { pregunta: string; respuesta: string };

// Valor de "activo" para la sección de preguntas frecuentes
const VISTA_FAQ = -1;

// Estilos propios del panel (independientes del resto de la web)
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
const BTN_ICONO =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d5d8df] bg-white text-sm text-[#1f2430] transition hover:bg-[#f4f5f7] disabled:cursor-not-allowed disabled:opacity-30";

export default function AdminPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [guardados, setGuardados] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState("");
  const [mensaje, setMensaje] = useState<Mensaje>(null);
  const [activo, setActivo] = useState(0);

  // Preguntas frecuentes
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqsGuardadas, setFaqsGuardadas] = useState<Record<string, FaqTexto>>({});
  const [nueva, setNueva] = useState<FaqTexto | null>(null);

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

      const { data: faqData } = await supabase
        .from("faqs")
        .select("id, pregunta, respuesta, orden")
        .order("orden", { ascending: true });
      const lista = (faqData ?? []) as Faq[];
      setFaqs(lista);
      setFaqsGuardadas(
        Object.fromEntries(
          lista.map((f) => [f.id, { pregunta: f.pregunta, respuesta: f.respuesta }])
        )
      );

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

  // ---------- Preguntas frecuentes ----------

  function faqModificada(f: Faq) {
    const g = faqsGuardadas[f.id];
    return !!g && (f.pregunta !== g.pregunta || f.respuesta !== g.respuesta);
  }

  function editarFaq(id: string, cambios: Partial<FaqTexto>) {
    setFaqs((lista) => lista.map((f) => (f.id === id ? { ...f, ...cambios } : f)));
  }

  function descartarFaq(f: Faq) {
    const g = faqsGuardadas[f.id];
    if (g) editarFaq(f.id, g);
  }

  async function crearFaq() {
    if (!nueva) return;
    const pregunta = nueva.pregunta.trim();
    const respuesta = nueva.respuesta.trim();
    if (!pregunta || !respuesta) {
      setMensaje({ tipo: "error", texto: "Escribe la pregunta y la respuesta." });
      return;
    }
    setMensaje(null);
    setOcupado("faq-nueva");
    try {
      const orden = faqs.reduce((m, f) => Math.max(m, f.orden), 0) + 1;
      const { data, error } = await supabase
        .from("faqs")
        .insert({ pregunta, respuesta, orden })
        .select("id, pregunta, respuesta, orden")
        .single();
      if (error || !data) throw new Error("No se pudo crear.");
      const f = data as Faq;
      setFaqs((lista) => [...lista, f]);
      setFaqsGuardadas((g) => ({ ...g, [f.id]: { pregunta: f.pregunta, respuesta: f.respuesta } }));
      setNueva(null);
      setMensaje({ tipo: "ok", texto: "Pregunta creada." });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo crear la pregunta." });
    }
    setOcupado("");
  }

  async function guardarFaq(f: Faq) {
    const pregunta = f.pregunta.trim();
    const respuesta = f.respuesta.trim();
    if (!pregunta || !respuesta) {
      setMensaje({ tipo: "error", texto: "La pregunta y la respuesta no pueden estar vacías." });
      return;
    }
    setMensaje(null);
    setOcupado(`faq-${f.id}`);
    try {
      const { data, error } = await supabase
        .from("faqs")
        .update({ pregunta, respuesta })
        .eq("id", f.id)
        .select("id");
      if (error || !data || data.length === 0) throw new Error("No se pudo guardar.");
      editarFaq(f.id, { pregunta, respuesta });
      setFaqsGuardadas((g) => ({ ...g, [f.id]: { pregunta, respuesta } }));
      setMensaje({ tipo: "ok", texto: "Pregunta guardada." });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo guardar la pregunta." });
    }
    setOcupado("");
  }

  async function eliminarFaq(f: Faq) {
    if (!window.confirm(`¿Eliminar la pregunta "${f.pregunta}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    setMensaje(null);
    setOcupado(`faq-${f.id}`);
    try {
      const { data, error } = await supabase.from("faqs").delete().eq("id", f.id).select("id");
      if (error || !data || data.length === 0) throw new Error("No se pudo eliminar.");
      setFaqs((lista) => lista.filter((x) => x.id !== f.id));
      setFaqsGuardadas((g) => {
        const copia = { ...g };
        delete copia[f.id];
        return copia;
      });
      setMensaje({ tipo: "ok", texto: "Pregunta eliminada." });
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo eliminar la pregunta." });
    }
    setOcupado("");
  }

  async function moverFaq(indice: number, direccion: -1 | 1) {
    const destino = indice + direccion;
    if (destino < 0 || destino >= faqs.length) return;
    setMensaje(null);
    setOcupado("faq-mover");
    try {
      const intercambiada = [...faqs];
      [intercambiada[indice], intercambiada[destino]] = [intercambiada[destino], intercambiada[indice]];
      const renumerada = intercambiada.map((f, i) => ({ ...f, orden: i + 1 }));
      const cambios = renumerada.filter(
        (f) => faqs.find((o) => o.id === f.id)?.orden !== f.orden
      );
      const resultados = await Promise.all(
        cambios.map((f) =>
          supabase.from("faqs").update({ orden: f.orden }).eq("id", f.id).select("id")
        )
      );
      if (resultados.some((r) => r.error || !r.data || r.data.length === 0)) {
        throw new Error("No se pudo reordenar.");
      }
      setFaqs(renumerada);
    } catch {
      setMensaje({ tipo: "error", texto: "No se pudo cambiar el orden." });
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

  const enFaq = activo === VISTA_FAQ;
  const grupoActivo = grupos[activo] ?? grupos[0];
  const camposGrupo = CAMPOS.filter((c) => c.grupo === grupoActivo);
  const faqsPendientes = faqs.filter(faqModificada).length;

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
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => setActivo(VISTA_FAQ)}
                aria-current={enFaq ? "page" : undefined}
                className={`flex w-full items-center justify-between rounded-md border-l-2 px-3 py-2 text-left text-sm transition ${
                  enFaq
                    ? "border-[#B59A68] bg-white/10 text-white"
                    : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>Preguntas frecuentes</span>
                <span className="ml-2 text-xs text-white/50">{faqs.length}</span>
              </button>
            </li>
            <li>
              <Link
                href="/admin/catalogo"
                className="block rounded-md border-l-2 border-transparent px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
              >
                Catálogo de capítulos
              </Link>
            </li>
          </ul>
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
              {enFaq ? "Preguntas frecuentes" : grupoActivo}
            </h1>
            <p className="text-xs text-[#6b7280]">
              {enFaq
                ? `${faqs.length} ${faqs.length === 1 ? "pregunta publicada" : "preguntas publicadas"}`
                : `${camposGrupo.length} ${camposGrupo.length === 1 ? "campo editable" : "campos editables"}`}
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
              <option value={VISTA_FAQ}>Preguntas frecuentes</option>
            </select>

            {enFaq ? (
              <button
                onClick={() => setNueva((n) => n ?? { pregunta: "", respuesta: "" })}
                disabled={nueva !== null}
                className={BTN_PRIMARIO}
              >
                Nueva pregunta
              </button>
            ) : (
              <>
                {pendientes.length > 0 && (
                  <span className="hidden rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-medium text-[#92400e] sm:inline">
                    {pendientes.length}{" "}
                    {pendientes.length === 1 ? "cambio sin guardar" : "cambios sin guardar"}
                  </span>
                )}
                <button
                  onClick={guardarTodo}
                  disabled={pendientes.length === 0 || ocupado !== ""}
                  className={BTN_PRIMARIO}
                >
                  {ocupado === "__todo" ? "Guardando..." : "Guardar todo"}
                </button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
          {enFaq ? (
            <div className="w-full space-y-5">
              {/* Formulario de nueva pregunta */}
              {nueva && (
                <div className="rounded-lg border border-[#49304F]/40 bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold">Nueva pregunta</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="faq-nueva-pregunta" className="text-sm font-medium">
                        Pregunta
                      </label>
                      <input
                        id="faq-nueva-pregunta"
                        type="text"
                        className={`${INPUT} mt-1`}
                        value={nueva.pregunta}
                        onChange={(e) => setNueva({ ...nueva, pregunta: e.target.value })}
                        autoFocus
                      />
                    </div>
                    <div>
                      <label htmlFor="faq-nueva-respuesta" className="text-sm font-medium">
                        Respuesta
                      </label>
                      <textarea
                        id="faq-nueva-respuesta"
                        rows={5}
                        className={`${INPUT} mt-1 resize-y`}
                        value={nueva.respuesta}
                        onChange={(e) => setNueva({ ...nueva, respuesta: e.target.value })}
                      />
                      <p className="mt-1 text-xs text-[#9aa1ad]">
                        Deja una línea en blanco para separar párrafos. Se añadirá al final de la lista.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={crearFaq}
                      disabled={ocupado !== ""}
                      className={BTN_PRIMARIO}
                    >
                      {ocupado === "faq-nueva" ? "Creando..." : "Crear pregunta"}
                    </button>
                    <button
                      onClick={() => setNueva(null)}
                      disabled={ocupado !== ""}
                      className={BTN_SECUNDARIO}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de preguntas */}
              {faqs.length === 0 && !nueva ? (
                <div className="rounded-lg border border-dashed border-[#d5d8df] bg-white px-6 py-12 text-center">
                  <p className="text-sm font-medium">Todavía no hay preguntas</p>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Crea la primera con el botón «Nueva pregunta».
                  </p>
                </div>
              ) : (
                faqs.map((f, i) => {
                  const mod = faqModificada(f);
                  const enCurso = ocupado === `faq-${f.id}`;
                  const bloqueado = ocupado !== "";
                  return (
                    <div
                      key={f.id}
                      className={`rounded-lg border bg-white p-6 shadow-sm ${
                        mod ? "border-[#e0b94f] bg-[#fffbeb]" : "border-[#e3e5ea]"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-[#9aa1ad]">Posición {i + 1}</p>
                        {mod && (
                          <span className="text-xs font-medium text-[#92400e]">Sin guardar</span>
                        )}
                      </div>

                      <label htmlFor={`pregunta-${f.id}`} className="text-sm font-medium">
                        Pregunta
                      </label>
                      <input
                        id={`pregunta-${f.id}`}
                        type="text"
                        className={`${INPUT} mt-1`}
                        value={f.pregunta}
                        onChange={(e) => editarFaq(f.id, { pregunta: e.target.value })}
                      />

                      <label
                        htmlFor={`respuesta-${f.id}`}
                        className="mt-4 block text-sm font-medium"
                      >
                        Respuesta
                      </label>
                      <textarea
                        id={`respuesta-${f.id}`}
                        rows={5}
                        className={`${INPUT} mt-1 resize-y`}
                        value={f.respuesta}
                        onChange={(e) => editarFaq(f.id, { respuesta: e.target.value })}
                      />

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {mod && (
                          <>
                            <button
                              onClick={() => guardarFaq(f)}
                              disabled={bloqueado}
                              className={BTN_PRIMARIO}
                            >
                              {enCurso ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button
                              onClick={() => descartarFaq(f)}
                              disabled={bloqueado}
                              className={BTN_SECUNDARIO}
                            >
                              Descartar
                            </button>
                          </>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => moverFaq(i, -1)}
                            disabled={bloqueado || i === 0}
                            aria-label="Subir una posición"
                            title="Subir"
                            className={BTN_ICONO}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moverFaq(i, 1)}
                            disabled={bloqueado || i === faqs.length - 1}
                            aria-label="Bajar una posición"
                            title="Bajar"
                            className={BTN_ICONO}
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => eliminarFaq(f)}
                            disabled={bloqueado}
                            className={BTN_PELIGRO}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {faqsPendientes > 0 && (
                <p className="text-xs text-[#92400e]">
                  Tienes {faqsPendientes}{" "}
                  {faqsPendientes === 1 ? "pregunta con cambios sin guardar" : "preguntas con cambios sin guardar"}.
                  Cada una se guarda con su propio botón.
                </p>
              )}
            </div>
          ) : (
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
          )}
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
