#!/usr/bin/env bash
# Ejecuta esto desde la RAÍZ del proyecto (donde está package.json):
#   bash arreglar-acuarela.sh
set -e

if [ ! -f package.json ]; then
  echo "Error: ejecuta el script desde la raíz del proyecto (donde está package.json)."
  exit 1
fi

SRC="."
[ -d "src" ] && SRC="src"
CSS="$SRC/app/globals.css"

if [ ! -f "$CSS" ]; then
  echo "Error: no encuentro $CSS"
  exit 1
fi

cat > /tmp/manchas-v2.css <<'CSS_EOF'
/* Manchas de acuarela v2: viven DENTRO de cada sección y se desvanecen antes de tocar el borde (sin cortes) */
.inicio > section {
  position: relative;
  isolation: isolate;
}
.inicio > section::before,
.inicio > section::after {
  content: "";
  position: absolute;
  z-index: -2;
  pointer-events: none;
}
.inicio > section::before {
  top: 12%;
  bottom: 12%;
  left: 3%;
  width: 46%;
  background:
    radial-gradient(ellipse 48% 46% at 50% 50%,
      rgb(var(--rosa-palido) / 0.55) 0%,
      rgb(var(--rosa-palido) / 0.28) 45%,
      transparent 100%),
    radial-gradient(ellipse 36% 38% at 62% 60%,
      rgb(var(--rosa-empolvado) / 0.22) 0%,
      transparent 100%);
}
.inicio > section::after {
  top: 16%;
  bottom: 10%;
  right: 3%;
  width: 42%;
  background:
    radial-gradient(ellipse 48% 46% at 50% 50%,
      rgb(var(--azul-niebla) / 0.6) 0%,
      rgb(var(--azul-niebla) / 0.3) 45%,
      transparent 100%),
    radial-gradient(ellipse 34% 36% at 40% 42%,
      rgb(var(--acento-salvia) / 0.3) 0%,
      transparent 100%);
}
.inicio > section:nth-of-type(even)::before {
  left: auto;
  right: 3%;
  background:
    radial-gradient(ellipse 48% 46% at 50% 50%,
      rgb(var(--acento-salvia) / 0.4) 0%,
      rgb(var(--acento-salvia) / 0.2) 45%,
      transparent 100%),
    radial-gradient(ellipse 36% 38% at 40% 60%,
      rgb(var(--rosa-palido) / 0.3) 0%,
      transparent 100%);
}
.inicio > section:nth-of-type(even)::after {
  right: auto;
  left: 3%;
  background:
    radial-gradient(ellipse 48% 46% at 50% 50%,
      rgb(var(--rosa-empolvado) / 0.28) 0%,
      rgb(var(--rosa-empolvado) / 0.14) 45%,
      transparent 100%);
}
@media (max-width: 640px) {
  .inicio > section::before,
  .inicio > section::after {
    width: 85%;
  }
}

CSS_EOF

cat > /tmp/parche-manchas.js <<'NODE_EOF'
const fs = require("fs");
const f = process.argv[2];
let s = fs.readFileSync(f, "utf8");

if (s.includes("Manchas de acuarela v2")) {
  console.log("--  globals.css ya tiene las manchas v2, no lo toco");
  process.exit(0);
}

const re = /\/\* Manchas de acuarela[\s\S]*?(?=\/\* Trazo de pincel en lugar)/;
if (!re.test(s)) {
  console.log("AVISO: no encontré el bloque de manchas en globals.css. No he cambiado nada.");
  process.exit(0);
}

const nuevo = fs.readFileSync("/tmp/manchas-v2.css", "utf8");
s = s.replace(re, () => nuevo);
fs.writeFileSync(f, s);
console.log("OK  globals.css (manchas sin cortes)");
NODE_EOF

node /tmp/parche-manchas.js "$CSS"

echo ""
echo "Listo. Recarga con Ctrl + F5 (con npm run dev en marcha)."
