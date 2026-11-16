#!/usr/bin/env bash
# Ejecuta esto desde la RAÍZ del proyecto (donde está package.json):
#   bash igualar-ancho.sh
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

cat > /tmp/ancho.css <<'CSS_EOF'
/* Secciones del mismo ancho: todas ocupan todo el ancho de la página
   y su contenido se centra en la misma columna. */
.inicio > section {
  position: relative;
  width: 100%;
  max-width: none;
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
  padding-right: 0;
}
/* Columna de contenido común (la misma que ya usan las bandas: max-w-5xl) */
:where(.inicio > section > *:not(.petalos)) {
  width: 100%;
  max-width: 64rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
/* Secciones de texto: columna más estrecha para que se lea bien */
#quien > *,
#faq > * {
  max-width: 48rem;
}

CSS_EOF

cat > /tmp/parche-ancho.js <<'NODE_EOF'
const fs = require("fs");
const f = process.argv[2];
let s = fs.readFileSync(f, "utf8");

if (s.includes("Secciones del mismo ancho")) {
  console.log("--  globals.css ya tiene el ancho igualado, no lo toco");
  process.exit(0);
}

// Sustituye el bloque anterior (manchas o secciones a pantalla completa)
const re = /\/\* (Manchas de acuarela|Secciones a pantalla completa)[\s\S]*?(?=\/\* Trazo de pincel en lugar)/;
if (!re.test(s)) {
  console.log("AVISO: no encontré el bloque anterior en globals.css. No he cambiado nada.");
  process.exit(0);
}

const nuevo = fs.readFileSync("/tmp/ancho.css", "utf8");
s = s.replace(re, () => nuevo);
fs.writeFileSync(f, s);
console.log("OK  globals.css (todas las secciones del mismo ancho)");
NODE_EOF

node /tmp/parche-ancho.js "$CSS"

echo ""
echo "Listo. Recarga con Ctrl + F5 (con npm run dev en marcha)."
