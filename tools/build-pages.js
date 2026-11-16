// Erzeugt index.html für GitHub Pages aus ap2.html (dem Artifact-Bruchstück).
// Aufruf im Projektordner: node tools/build-pages.js
// Mit --check: nur prüfen, ob index.html aktuell ist (Exit-Code 1, wenn nicht).
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(dir, "ap2.html"), "utf8").replace(/\r\n/g, "\n");
const cut = src.indexOf("<header");
if (cut < 0) { console.error("ap2.html: <header> nicht gefunden"); process.exit(1); }
const head = src.slice(0, cut).trim(), body = src.slice(cut).trim();

// Gleiche Grundeinstellungen wie das Gerüst des Artifact-Hosts
const out = `<!doctype html>
<!-- Automatisch erzeugt aus ap2.html mit: node tools/build-pages.js – nicht von Hand bearbeiten. -->
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Lern-App für die IHK-Abschlussprüfung Teil 2, Fachinformatiker Systemintegration (AO 2020)">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px/1.5 system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
${head}
</head>
<body>
${body}
</body>
</html>
`;

const target = path.join(dir, "index.html");
if (process.argv.includes("--check")) {
  const cur = fs.existsSync(target) ? fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n") : "";
  if (cur !== out) { console.log("index.html ist veraltet – bitte `node tools/build-pages.js` ausführen."); process.exit(1); }
  console.log("index.html ist aktuell.");
} else {
  fs.writeFileSync(target, out);
  console.log("index.html erzeugt (" + out.length + " Zeichen).");
}
