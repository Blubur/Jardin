#!/usr/bin/env bash
# Ejecuta esto desde la RAÍZ del proyecto (donde está package.json):
#   bash aplicar-acuarela.sh
set -e

if [ ! -f package.json ]; then
  echo "Error: ejecuta el script desde la raíz del proyecto (donde está package.json)."
  exit 1
fi

SRC="."
[ -d "src" ] && SRC="src"
APP="$SRC/app"
CSS="$APP/globals.css"

if [ ! -f "$CSS" ]; then
  echo "Error: no encuentro $CSS"
  exit 1
fi

# ---------------------------------------------------------------
# 1) CSS al final de globals.css (sin duplicar)
# ---------------------------------------------------------------
if grep -q "trazo de pincel" "$CSS"; then
  echo "--  globals.css ya tiene la acuarela, no lo toco"
else
  cat >> "$CSS" <<'CSS_EOF'

/* ===== Acuarela, trazo de pincel y papel ===== */
:root {
  /* Trazo de pincel irregular (sustituye a las líneas rectas) */
  --trazo: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 20'%3E%3Cfilter id='r' x='-5%25' y='-60%25' width='110%25' height='220%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.03 .5' numOctaves='2' seed='4' result='t'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='t' scale='5'/%3E%3C/filter%3E%3Cpath filter='url(%23r)' fill='%236B3047' fill-opacity='.5' d='M0 9 C80 5 160 11 260 7 S420 4 520 8 S700 11 800 6 L800 12 C700 17 560 12 470 15 S250 16 150 14 S40 15 0 14 Z'/%3E%3C/svg%3E");

  /* Grano de papel */
  --papel: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .36 0 0 0 0 .26 0 0 0 0 .22 0 0 0 .9 -.3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Se quitan los degradados de fondo: ahora lo dan las manchas de cada sección */
body {
  background-image: none;
}

/* Textura de papel sobre toda la web (sube o baja "opacity" para más o menos grano) */
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  background-image: var(--papel);
  opacity: 0.4;
}

/* Manchas de acuarela en las secciones de la home (<main className="inicio">) */
.inicio > section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}
.inicio > section::before,
.inicio > section::after {
  content: "";
  position: absolute;
  z-index: -2;
  pointer-events: none;
  filter: blur(46px);
}
.inicio > section::before {
  top: -90px;
  left: -130px;
  width: 520px;
  height: 380px;
  background: rgb(var(--rosa-palido) / 0.6);
  border-radius: 62% 38% 55% 45% / 48% 58% 42% 52%;
}
.inicio > section::after {
  bottom: -110px;
  right: -150px;
  width: 480px;
  height: 360px;
  background: rgb(var(--azul-niebla) / 0.7);
  border-radius: 40% 60% 46% 54% / 56% 42% 58% 44%;
}
.inicio > section:nth-of-type(even)::before {
  left: auto;
  right: -120px;
  top: -60px;
  background: rgb(var(--acento-salvia) / 0.45);
  border-radius: 48% 52% 38% 62% / 55% 45% 55% 45%;
}
.inicio > section:nth-of-type(even)::after {
  right: auto;
  left: -140px;
  bottom: -90px;
  background: rgb(var(--rosa-empolvado) / 0.3);
}
/* Sobre las bandas de salvia, la mancha rosa se ve mejor */
.inicio > .banda-salvia::before {
  background: rgb(var(--rosa-palido) / 0.5);
}
@media (max-width: 640px) {
  .inicio > section::before,
  .inicio > section::after {
    width: 300px;
    height: 240px;
    filter: blur(36px);
  }
}

/* Trazo de pincel en lugar del borde recto entre secciones */
.inicio > section + section,
.seccion {
  background-image: var(--trazo);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: min(760px, 88%) 18px;
}
.seccion {
  border-top: 0;
}
.pie-web {
  border-top: 0;
  background-image: var(--trazo);
  background-repeat: no-repeat;
  background-position: top center;
  background-size: min(760px, 88%) 18px;
}
CSS_EOF
  echo "OK  globals.css (acuarela, trazo y papel)"
fi

# ---------------------------------------------------------------
# 2) page.tsx: <main> pasa a <main className="inicio">
# ---------------------------------------------------------------
cat > /tmp/parche-inicio.js <<'NODE_EOF'
const fs = require("fs");
const f = process.argv[2];
let s = fs.readFileSync(f, "utf8");

if (s.includes('<main className="inicio"')) {
  console.log("--  page.tsx ya tiene la clase inicio, no lo toco");
  process.exit(0);
}
if (!s.includes("<main>")) {
  console.log('AVISO: no encontré <main> en page.tsx. Cámbialo a mano por <main className="inicio">');
  process.exit(0);
}
s = s.replace("<main>", '<main className="inicio">');
fs.writeFileSync(f, s);
console.log('OK  page.tsx (<main className="inicio">)');
NODE_EOF

if [ -f "$APP/page.tsx" ]; then
  node /tmp/parche-inicio.js "$APP/page.tsx"
else
  echo "AVISO: no encuentro $APP/page.tsx"
fi

echo ""
echo "Listo. Pruébalo con: npm run dev  (y recarga con Ctrl + F5)"
