#!/usr/bin/env bash
# Ejecuta esto desde la RAÍZ del proyecto (donde está package.json):
#   bash quitar-acuarela.sh
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

cat > /tmp/secciones.css <<'CSS_EOF'
/* Secciones a pantalla completa: todas del mismo tamaño.
   Para cambiar la altura, edita --alto-seccion (por ejemplo: auto, 80vh, 100vh). */
:root {
  --alto-seccion: calc(100vh - 6rem);
}
@supports (height: 100svh) {
  :root {
    --alto-seccion: calc(100svh - 6rem);
  }
}
.inicio > section {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: var(--alto-seccion);
  scroll-margin-top: 6rem;
}
.inicio > section > * {
  width: 100%;
}

CSS_EOF

cat > /tmp/parche-secciones.js <<'NODE_EOF'
const fs = require("fs");
const f = process.argv[2];
let s = fs.readFileSync(f, "utf8");

if (s.includes("Secciones a pantalla completa")) {
  console.log("--  globals.css ya tiene las secciones a pantalla completa, no lo toco");
  process.exit(0);
}

// Sustituye el bloque de manchas (versión 1 o 2) por el de secciones completas
const re = /\/\* Manchas de acuarela[\s\S]*?(?=\/\* Trazo de pincel en lugar)/;
if (!re.test(s)) {
  console.log("AVISO: no encontré el bloque de manchas en globals.css. No he cambiado nada.");
  process.exit(0);
}

const nuevo = fs.readFileSync("/tmp/secciones.css", "utf8");
s = s.replace(re, () => nuevo);
fs.writeFileSync(f, s);
console.log("OK  globals.css (manchas eliminadas, secciones a pantalla completa)");
NODE_EOF

node /tmp/parche-secciones.js "$CSS"

echo ""
echo "Listo. Recarga con Ctrl + F5 (con npm run dev en marcha)."
