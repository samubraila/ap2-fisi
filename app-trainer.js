// Rechen-Trainer: Erklärung, Schritt-für-Schritt-Hilfe und Zeichnung zu jeder Aufgabe
(function () {
  const $ = AP2.$, esc = AP2.esc, T = AP2.T, GEN = AP2.GEN, de = T.de;

  function parseNum(s) {
    s = String(s).trim().replace(/\s|€|%|h|s$/gi, "");
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    return parseFloat(s);
  }
  function check(f, val) {
    if (String(val).trim() === "") return false;
    if (f.type === "num") { const v = parseNum(val); if (isNaN(v)) return false; const tol = f.tol != null ? f.tol : Math.max(0.01, Math.abs(f.a) * (f.rel || 0)); return Math.abs(v - f.a) <= tol + 1e-9; }
    if (f.type === "ip") return String(val).trim().replace(/\s/g, "") === f.a;
    if (f.type === "ip6") { const v = T.parse6(val); return v !== null && v === T.parse6(f.a); }
    if (f.type === "date") { const m = String(val).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/); return !!m && T.pad2(m[1]) + "." + T.pad2(m[2]) + "." + m[3] === f.a; }
    return String(val).trim().toLowerCase().replace(/\s/g, "") === String(f.a).toLowerCase();
  }
  const show = f => f.type === "num" ? de(f.a, 4) : f.a;

  let genId = "subnet", task = null, results = null, shown = 0, counted = false, howOpen = true;
  function newTask() { task = GEN[genId].make(); results = null; shown = 0; counted = false; }

  function viewTrainer(el) {
    if (!task) newTask();
    const st = AP2.state(), g = GEN[genId], n = task.steps.length, full = shown >= n;
    const groups = ["GA1", "GA2", "WiSo"].map(p => `<div class="grid" style="gap:6px"><span class="eyebrow">${p}</span><div class="trainer-list">${Object.entries(GEN).filter(([, x]) => x.part === p).map(([id, x]) => `<button type="button" data-gen="${id}" aria-pressed="${id === genId}">${x.label}</button>`).join("")}</div></div>`).join("");
    const wrong = results ? task.fields.filter((f, i) => !results[i]).map(f => f.l) : [];
    el.innerHTML = `
      <div class="row"><div class="grid" style="gap:4px"><p class="eyebrow">Rechen-Trainer</p><h2>Rechnen lernen mit Erklärung und Zeichnung</h2></div><span class="spacer"></span><span class="chip">${st.trainer.ok}/${st.trainer.total} Aufgaben richtig</span></div>
      <div class="panel">${groups}</div>
      <details class="howto" id="howto" ${howOpen ? "open" : ""}><summary>So rechnest du das: ${esc(g.label)}</summary><div class="howto-body">${g.howto}</div></details>
      <div class="panel task">
        <div class="row"><span class="chip ${g.part.toLowerCase()}">${g.part}</span><h3>Aufgabe</h3><span class="spacer"></span><button type="button" class="btn sm" id="t-new">Neue Aufgabe</button></div>
        <p class="prompt">${task.prompt}</p>
        <div class="fields">${task.fields.map((f, i) => `<label class="field" for="tf${i}">${esc(f.l)}<input type="text" id="tf${i}" autocomplete="off" spellcheck="false" class="mono ${results ? (results[i] ? "ok" : "no") : ""}" value="${esc(f.v || "")}"></label>`).join("")}</div>
        <div class="row">
          <button type="button" class="btn primary" id="t-check">Prüfen</button>
          <button type="button" class="btn" id="t-step" ${full ? "disabled" : ""}>${shown === 0 ? "Hilfe: 1. Schritt zeigen" : full ? "Alle Schritte gezeigt" : `Nächster Schritt (${shown + 1} von ${n})`}</button>
          <button type="button" class="btn" id="t-all" ${full ? "disabled" : ""}>Ganze Lösung mit Zeichnung</button>
        </div>
        ${results ? (wrong.length === 0 ? `<div class="verdict ok">Alles richtig. ${full ? "" : "Schau dir trotzdem die Zeichnung an, um den Weg zu festigen."}</div>` : `<div class="verdict no">${results.length - wrong.length} von ${results.length} richtig. Noch falsch: ${esc(wrong.join(", "))}. Tipp: Deck den nächsten Schritt auf und rechne dann selbst weiter.</div>`) : ""}
        ${shown > 0 ? `<div class="steps"><p class="eyebrow">Lösungsweg Schritt für Schritt</p><ol>${task.steps.slice(0, shown).map(s => `<li>${s}</li>`).join("")}</ol></div>` : ""}
        ${full ? `<figure class="fig"><div class="scroll">${task.fig}</div><figcaption class="small muted">${esc(task.figCap || "")}</figcaption></figure>
          <div class="sol"><b>Ergebnis:</b> ${task.fields.map(f => esc(f.l) + " = <b class=\"mono\">" + esc(show(f)) + "</b>").join(" · ")}</div>` : ""}
      </div>
      <p class="small muted">Dezimalzahlen mit Komma oder Punkt, Tausenderpunkte sind erlaubt. Speicher wird binär (1.024), Bandbreite dezimal (1.000.000) gerechnet – wie in der IHK-Prüfung.</p>`;
    el.querySelectorAll("[data-gen]").forEach(b => b.addEventListener("click", () => { genId = b.dataset.gen; newTask(); viewTrainer(el); }));
    $("#howto", el).addEventListener("toggle", e => { howOpen = e.target.open; });
    task.fields.forEach((f, i) => $("#tf" + i, el).addEventListener("input", e => { f.v = e.target.value; }));
    $("#t-check", el).addEventListener("click", () => {
      results = task.fields.map(f => check(f, f.v || ""));
      if (!counted) { const s = AP2.state(); s.trainer.total++; if (results.every(Boolean)) s.trainer.ok++; counted = true; AP2.save(); }
      viewTrainer(el);
    });
    $("#t-step", el).addEventListener("click", () => { shown = Math.min(n, shown + 1); viewTrainer(el); });
    $("#t-all", el).addEventListener("click", () => { shown = n; viewTrainer(el); });
    $("#t-new", el).addEventListener("click", () => { newTask(); viewTrainer(el); });
  }
  AP2.views.rechnen = viewTrainer;
  AP2.openTrainer = function (id) { if (GEN[id]) { genId = id; newTask(); } location.hash = "#rechnen"; };
  AP2._test = { parse6: T.parse6, fmt6: T.fmt6, check, GEN };
})();
