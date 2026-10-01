// URL pública "oficial" de la web. Se usa en emailRedirectTo / redirectTo para
// que los enlaces de los correos apunten SIEMPRE al mismo dominio, aunque la
// persona haya entrado por otro dominio de Vercel.
//
// En Vercel (Production) define: NEXT_PUBLIC_SITE_URL=https://secretosdelasherederas.vercel.app
// En local no hace falta definirla: usa window.location.origin.
export function urlSitio(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  const base =
    env && env.length > 0
      ? env
      : typeof window !== "undefined"
      ? window.location.origin
      : "";
  return base.replace(/\/+$/, "");
}
