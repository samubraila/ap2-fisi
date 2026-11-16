// Prüft die Lern-App ohne Browser: Syntax aller Dateien, Rechen-Trainer, Lektionen, Notenrechner.
// Aufruf (im Projektordner): node tests/check.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const dir = path.join(__dirname, "..");
const ctx = { console, Math, Date, BigInt, Number, String, JSON, parseFloat, parseInt, isNaN, Array, Object, RegExp };
ctx.window = ctx;
ctx.AP2 = { views: {}, $: () => null, esc: s => String(s), save() {},
  state: () => ({ checks: {}, cards: {}, lessons: {}, trainer: { ok: 0, total: 0 }, quiz: {} }),
  prio: n => n >= 6 ? ["hot", "Sehr oft"] : n >= 4 ? ["mid", "Oft"] : ["low", "Gelegentlich"] };
vm.createContext(ctx);

// Reihenfolge wie in ap2.html (ohne app-core.js, das braucht den Browser)
const html = fs.readFileSync(path.join(dir, "ap2.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
let problems = 0;
const fail = (...a) => { problems++; if (problems < 25) console.log("PROBLEM:", ...a); };
for (const f of scripts) {
  const code = fs.readFileSync(path.join(dir, f), "utf8");
  if (f === "app-core.js") { try { new vm.Script(code, { filename: f }); } catch (e) { fail(f, e.message); } continue; }
  try { vm.runInContext(code, ctx, { filename: f }); } catch (e) { fail(f, e.message); }
}
const A = ctx.AP2;

// Rechen-Trainer: jede Aufgabe 300× erzeugen, eigene Lösung muss als richtig erkannt werden
const T = A._test || {};
for (const [id, g] of Object.entries(A.GEN || {})) {
  if (!g.howto || g.howto.length < 200) fail("Trainer ohne Erklärung:", id);
  for (let i = 0; i < 300; i++) {
    const t = g.make();
    t.fields.forEach(f => { const ans = f.type === "num" ? String(f.a).replace(".", ",") : f.a; if (!T.check(f, ans)) fail("Trainer", id, f.l, f.a); });
    const blob = t.prompt + t.steps.join("") + t.fig;
    if (/NaN|undefined|Infinity/.test(blob)) fail("Trainer-Text", id, blob.match(/.{0,40}(NaN|undefined|Infinity).{0,20}/)[0]);
    if (!t.fig.startsWith("<svg") || /(width|height)="-/.test(t.fig)) fail("Trainer-Zeichnung", id);
  }
}

// Lektionen: jedes Thema braucht eine Lektion mit Erklärung, Diagramm und Prüfungsfrage
const ids = (A.TOPICS || []).map(t => [t.id, t.part]).concat((A.WISO || []).map(w => [w.id, "WiSo"]));
for (const [id, part] of ids) {
  const L = (A.LESSONS || {})[id];
  if (!L) { fail("Lektion fehlt:", id); continue; }
  if (!L.ex || !L.q || !L.q.f || !L.q.a || !(L.figs || []).length || !(L.kw && typeof L.kw.test === "function")) fail("Lektion unvollständig:", id);
  (L.figs || []).forEach((f, k) => { let s = ""; try { s = f.f(); } catch (e) { fail("Diagramm-Fehler", id, k, e.message); return; }
    if (!s.startsWith("<svg") || /NaN|undefined|Infinity/.test(s) || /(width|height)="-/.test(s)) fail("Diagramm", id, k); });
  (L.train || []).forEach(g => { if (!A.GEN[g]) fail("Lektion verweist auf unbekannte Rechenaufgabe", id, g); });
}

// Notenrechner: bekannte Fälle
if (A.evalAll) {
  const ok = A.evalAll({ ap1: 72, doku: 78, praes: 85, ga1: 58, ga2: 46, wiso: 70 });
  if (!ok.passed || Math.abs(ok.total - 72.55) > 0.01) fail("Notenrechner Beispiel", ok.total);
  if (A.evalAll({ ap1: 60, doku: 70, praes: 70, ga1: 40, ga2: 45, wiso: 60 }).passed) fail("Notenrechner: zwei schriftliche < 50 muss durchfallen");
  if (A.evalAll({ ap1: 90, doku: 90, praes: 90, ga1: 25, ga2: 80, wiso: 80 }).passed) fail("Notenrechner: ungenügend muss durchfallen");
}

console.log(`Geprüft: ${scripts.length} Skripte, ${Object.keys(A.GEN || {}).length} Rechenaufgaben, ${ids.length} Lektionen, ${(A.CARDS || []).length} Lernkarten, ${(A.QUIZ || []).length} Quizfragen.`);
console.log(problems ? `${problems} Probleme gefunden.` : "0 Probleme – alles in Ordnung.");
process.exit(problems ? 1 : 0);
