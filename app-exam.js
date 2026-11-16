// Probeprüfung unter Echtzeit: GA1/GA2 (90 Min., offene Fragen + Rechnen, Selbstbewertung) und WiSo (60 Min., automatisch)
(function () {
  const $ = AP2.$, esc = AP2.esc, st = () => AP2.state();
  let run = null, tick = null;
  const ptsOf = f => { const m = String(f).match(/\((\d+)\s*Punkte\)/); return m ? +m[1] : 4; };
  const clean = f => String(f).replace(/\s*\(\d+\s*Punkte\)\s*$/, "");
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  const mmss = s => String(Math.floor(Math.max(0, s) / 60)).padStart(2, "0") + ":" + String(Math.floor(Math.max(0, s) % 60)).padStart(2, "0");
  const fmtP = x => (Math.round(x * 10) / 10).toLocaleString("de-DE");

  function buildGA(part) {
    const topics = AP2.ALL.filter(t => t.part === part && AP2.LESSONS[t.id]);
    const picked = topics.map(t => ({ t, w: Math.random() * (t.n + 3) })).sort((a, b) => b.w - a.w).slice(0, 8).map(x => x.t);
    const calc = shuffle([...new Set(Object.keys(AP2.GEN).filter(g => AP2.GEN[g].part === part))]).slice(0, 2);
    const items = picked.map(t => { const L = AP2.LESSONS[t.id]; return { type: "open", topic: t.name, q: clean(L.q.f), a: L.q.a, raw: ptsOf(L.q.f) }; })
      .concat(calc.map(g => ({ type: "calc", topic: AP2.GEN[g].label, gen: g, task: AP2.GEN[g].make(), raw: 6 })));
    const sum = items.reduce((a, b) => a + b.raw, 0); items.forEach(it => { it.max = Math.max(1, Math.round(it.raw * 100 / sum)); });
    const tasks = [[], [], [], []]; shuffle(items).forEach((it, i) => tasks[i % 4].push(it));
    return { part, kind: "ga", tasks, items: tasks.flat(), dur: 90 * 60 };
  }
  function buildWiSo() { return { part: "WiSo", kind: "wiso", qs: shuffle(AP2.QUIZ_ALL.filter(q => q.part === "WiSo")).slice(0, 30), dur: 60 * 60 }; }

  function start(part) {
    run = part === "WiSo" ? buildWiSo() : buildGA(part);
    Object.assign(run, { start: Date.now(), done: false, ans: {}, text: {}, calc: {}, grades: {}, saved: false });
    clearInterval(tick); tick = setInterval(onTick, 1000); AP2.render(); window.scrollTo(0, 0);
  }
  function onTick() {
    if (!run || run.done) { clearInterval(tick); return; }
    const left = run.dur - (Date.now() - run.start) / 1000, el = $("#ex-timer");
    if (el) { el.textContent = mmss(left); el.classList.toggle("low", left < 600); }
    if (left <= 0) submit();
  }
  function submit() {
    if (!run || run.done) return; run.done = true; run.used = Math.min(run.dur, (Date.now() - run.start) / 1000); clearInterval(tick);
    if (run.kind === "wiso") { run.total = run.qs.filter(q => q.c.includes(run.ans[q.k])).length / run.qs.length * 100; save(); }
    else run.items.forEach((it, i) => { if (it.type === "calc") { const vals = run.calc[i] || {}; const ok = it.task.fields.filter((f, k) => AP2._test.check(f, vals[k] || "")).length; run.grades[i] = ok / it.task.fields.length; } });
    AP2.render(); window.scrollTo(0, 0);
  }
  function gaTotal() { const items = run.items; const maxSum = items.reduce((a, b) => a + b.max, 0); const got = items.reduce((a, it, i) => a + (run.grades[i] || 0) * it.max, 0); return { got, maxSum, total: got / maxSum * 100 }; }
  function save() {
    if (run.saved) return; run.saved = true; const s = st(); s.exams = (s.exams || []).concat([{ part: run.part, date: AP2.dayKey(new Date()), p: Math.round(run.total * 10) / 10, min: Math.round(run.used / 60) }]).slice(-40);
    AP2.track(5); AP2.save();
  }

  function viewStart(el) {
    const ex = (st().exams || []).slice().reverse();
    const best = p => { const l = ex.filter(e => e.part === p); return l.length ? Math.max(...l.map(e => e.p)) : null; };
    el.innerHTML = `
      <div class="grid" style="gap:4px"><p class="eyebrow">Probeprüfung</p><h2>Prüfung unter echten Bedingungen</h2>
        <p class="lead">Wie am Prüfungstag: Uhr läuft, keine Hilfe, nur Taschenrechner. GA1 und GA2 bestehen aus 4 Aufgaben mit offenen Fragen und Rechenaufgaben – danach bewertest du dich mit der Musterantwort selbst. WiSo wird automatisch ausgewertet. Für 100 % Prüfungsbereitschaft brauchst du in jedem Teil mindestens 92 Punkte.</p></div>
      <div class="grid g3">${[["GA1", "Konzeption & Administration", "90 Minuten · 4 Aufgaben · 100 Punkte"], ["GA2", "Netzwerke", "90 Minuten · 4 Aufgaben · 100 Punkte"], ["WiSo", "Wirtschaft & Soziales", "60 Minuten · 30 Aufgaben · 100 Punkte"]].map(([p, n, d]) => { const b = best(p);
        return `<div class="panel exam-pick"><div class="row"><span class="chip ${p.toLowerCase()}">${p}</span><span class="spacer"></span>${b !== null ? `<span class="chip ${b >= 92 ? "low" : b >= 50 ? "mid" : "hot"}">Bestwert ${fmtP(b)} P</span>` : `<span class="chip">noch keine</span>`}</div><b class="hero-title">${n}</b><span class="small muted">${d}</span><button type="button" class="btn primary" data-start="${p}">Probeprüfung starten</button></div>`; }).join("")}</div>
      <div class="note">Die Aufgaben werden jedes Mal neu aus den Lektionen und dem Rechen-Trainer zusammengestellt. Lade die Seite während der Prüfung nicht neu, sonst ist der Versuch weg.</div>
      ${ex.length ? `<div class="panel"><h3>Deine Ergebnisse</h3><div class="scroll"><table class="small"><thead><tr><th>Datum</th><th>Teil</th><th class="num">Punkte</th><th>Note</th><th class="num">Zeit</th></tr></thead><tbody>${ex.slice(0, 15).map(e => { const g = AP2.grade(e.p); return `<tr><td class="mono">${esc(e.date)}</td><td>${e.part}</td><td class="num mono">${fmtP(e.p)}</td><td>${g[1]} (${g[2]})</td><td class="num mono">${e.min != null ? e.min + " Min." : "–"}</td></tr>`; }).join("")}</tbody></table></div></div>` : ""}`;
    el.querySelectorAll("[data-start]").forEach(b => b.addEventListener("click", () => start(b.dataset.start)));
  }

  function timerBar() { const left = run.dur - (Date.now() - run.start) / 1000; return `<div class="exam-bar"><span class="chip ${run.part.toLowerCase()}">${run.part}</span><b>Probeprüfung</b><span class="spacer"></span><span class="small muted">Restzeit</span><b class="mono ex-timer${left < 600 ? " low" : ""}" id="ex-timer">${mmss(left)}</b><button type="button" class="btn primary sm" id="ex-submit">Abgeben</button></div>`; }

  function viewRunGA(el) {
    let idx = 0;
    el.innerHTML = timerBar() + run.tasks.map((task, ti) => `<section class="panel exam-task"><h3>${ti + 1}. Aufgabe <span class="small muted">(${task.reduce((a, b) => a + b.max, 0)} Punkte)</span></h3>${task.map(it => { const i = idx++;
      return it.type === "open" ? `<div class="exam-item"><div class="row small"><b>${String.fromCharCode(97 + task.indexOf(it))})</b><span class="muted">${esc(it.topic)}</span><span class="spacer"></span><span class="chip">${it.max} P</span></div><p>${esc(it.q)}</p><textarea rows="5" data-text="${i}" placeholder="Stichworte reichen">${esc(run.text[i] || "")}</textarea></div>`
        : `<div class="exam-item"><div class="row small"><b>${String.fromCharCode(97 + task.indexOf(it))})</b><span class="muted">Rechenaufgabe: ${esc(it.topic)}</span><span class="spacer"></span><span class="chip">${it.max} P</span></div><p>${it.task.prompt}</p><div class="task"><div class="fields">${it.task.fields.map((f, k) => `<label class="field">${esc(f.l)}<input type="text" class="mono" autocomplete="off" data-calc="${i}:${k}" value="${esc((run.calc[i] || {})[k] || "")}"></label>`).join("")}</div></div></div>`; }).join("")}</section>`).join("") +
      `<div class="row"><span class="spacer"></span><button type="button" class="btn primary" id="ex-submit2">Prüfung abgeben</button></div>`;
    el.querySelectorAll("[data-text]").forEach(t => t.addEventListener("input", () => { run.text[t.dataset.text] = t.value; }));
    el.querySelectorAll("[data-calc]").forEach(t => t.addEventListener("input", () => { const [i, k] = t.dataset.calc.split(":"); (run.calc[i] = run.calc[i] || {})[k] = t.value; }));
    [$("#ex-submit", el), $("#ex-submit2", el)].forEach(b => b.addEventListener("click", submit));
  }
  function viewRunWiSo(el) {
    el.innerHTML = timerBar() + `<div class="panel"><p class="small muted">Wähle bei jeder Aufgabe genau eine Antwort. Du kannst in beliebiger Reihenfolge arbeiten.</p></div>` +
      run.qs.map((q, n) => `<div class="panel exam-item"><b>${n + 1}. Aufgabe</b><p>${esc(q.q)}</p><div class="grid" style="gap:6px">${q.o.map((o, i) => `<label class="opt"><input type="radio" name="w${n}" value="${i}" data-wq="${q.k}" ${run.ans[q.k] === i ? "checked" : ""}><span><b class="mono">${i + 1}</b> ${esc(o)}</span></label>`).join("")}</div></div>`).join("") +
      `<div class="row"><span class="small muted" id="ex-count"></span><span class="spacer"></span><button type="button" class="btn primary" id="ex-submit2">Prüfung abgeben</button></div>`;
    const cnt = () => { $("#ex-count", el).textContent = Object.keys(run.ans).length + " von " + run.qs.length + " beantwortet"; }; cnt();
    el.querySelectorAll("[data-wq]").forEach(r => r.addEventListener("change", () => { run.ans[r.dataset.wq] = +r.value; cnt(); }));
    [$("#ex-submit", el), $("#ex-submit2", el)].forEach(b => b.addEventListener("click", submit));
  }

  function resultHead(total, extra) {
    const g = AP2.grade(total);
    return `<div class="exam-result"><div class="grid" style="gap:4px"><span class="eyebrow">Ergebnis ${run.part}</span><b class="hero-title">${fmtP(total)} von 100 Punkten · Note ${g[1]} (${g[2]})</b><span class="small muted">${extra} · Zeit: ${Math.round(run.used / 60)} von ${run.dur / 60} Minuten</span></div>
      <div class="row"><button type="button" class="btn" id="ex-noten" ${run.saved ? "" : "disabled"}>In den Notenrechner übernehmen</button><button type="button" class="btn primary" id="ex-new">Neue Probeprüfung</button></div></div>`;
  }
  function bindResult(el) {
    $("#ex-new", el).addEventListener("click", () => { run = null; AP2.render(); });
    const n = $("#ex-noten", el); if (n) n.addEventListener("click", () => { const s = st(); s.noten = s.noten || {}; s.noten[run.part === "GA1" ? "ga1" : run.part === "GA2" ? "ga2" : "wiso"] = Math.round(run.total); AP2.save(); location.hash = "#noten"; });
  }
  function viewReviewGA(el) {
    const openIdx = run.items.map((it, i) => it.type === "open" ? i : -1).filter(i => i >= 0), graded = openIdx.every(i => run.grades[i] != null);
    const t = gaTotal(); run.total = t.total; if (graded) save();
    el.innerHTML = (graded ? resultHead(t.total, `${fmtP(t.got)} von ${t.maxSum} Punkten`) : `<div class="exam-result"><div class="grid" style="gap:4px"><span class="eyebrow">Selbstbewertung</span><b class="hero-title">Vergleiche jede Antwort mit der Musterantwort</b><span class="small muted">Noch ${openIdx.filter(i => run.grades[i] == null).length} offene Fragen bewerten. Rechenaufgaben sind schon automatisch bewertet.</span></div></div>`) +
      run.items.map((it, i) => `<div class="panel exam-item"><div class="row small"><span class="muted">${esc(it.topic)}</span><span class="spacer"></span><span class="chip ${run.grades[i] == null ? "" : run.grades[i] >= 1 ? "low" : run.grades[i] > 0 ? "mid" : "hot"}">${run.grades[i] == null ? "–" : fmtP(run.grades[i] * it.max)} / ${it.max} P</span></div>
        ${it.type === "open" ? `<p><b>${esc(it.q)}</b></p><div class="grid g2"><div><p class="eyebrow">Deine Antwort</p><div class="sol">${esc(run.text[i] || "(leer)")}</div></div><div><p class="eyebrow">Musterantwort</p><div class="sol">${esc(it.a)}</div></div></div>
          <div class="row"><span class="small muted">Wie gut war deine Antwort?</span>${[[0, "Falsch / fehlt"], [0.5, "Teilweise"], [1, "Richtig"]].map(([v, l]) => `<button type="button" class="btn sm ${run.grades[i] === v ? (v ? "good" : "bad") : ""}" data-grade="${i}:${v}">${l}</button>`).join("")}</div>`
        : `<p>${it.task.prompt}</p><div class="sol">${it.task.fields.map((f, k) => `${esc(f.l)}: deine Eingabe <b class="mono">${esc((run.calc[i] || {})[k] || "–")}</b> → richtig <b class="mono">${esc(f.type === "num" ? AP2.T.de(f.a, 4) : f.a)}</b> ${AP2._test.check(f, (run.calc[i] || {})[k] || "") ? "✓" : "✗"}`).join("<br>")}</div><details><summary>Lösungsweg</summary><ol class="small">${it.task.steps.map(s => `<li>${s}</li>`).join("")}</ol></details>`}</div>`).join("");
    el.querySelectorAll("[data-grade]").forEach(b => b.addEventListener("click", () => { const [i, v] = b.dataset.grade.split(":"); run.grades[i] = +v; const y = window.scrollY; viewReviewGA(el); window.scrollTo(0, y); }));
    if (graded) bindResult(el);
  }
  function viewReviewWiSo(el) {
    const ok = run.qs.filter(q => q.c.includes(run.ans[q.k])).length;
    el.innerHTML = resultHead(run.total, `${ok} von ${run.qs.length} richtig`) + run.qs.map((q, n) => { const a = run.ans[q.k], right = q.c.includes(a);
      return `<div class="panel exam-item"><div class="row small"><b>${n + 1}. Aufgabe</b><span class="spacer"></span><span class="chip ${right ? "low" : "hot"}">${right ? "richtig" : a == null ? "nicht beantwortet" : "falsch"}</span></div><p>${esc(q.q)}</p>
        <div class="grid" style="gap:6px">${q.o.map((o, i) => `<div class="opt ${q.c.includes(i) ? "right" : a === i ? "wrong" : ""}"><span><b class="mono">${i + 1}</b> ${esc(o)}</span></div>`).join("")}</div><div class="sol small">${esc(q.e)}</div></div>`; }).join("");
    bindResult(el);
  }

  AP2.views.pruefung = function (el) {
    if (!run) return viewStart(el);
    if (!run.done) return run.kind === "wiso" ? viewRunWiSo(el) : viewRunGA(el);
    return run.kind === "wiso" ? viewReviewWiSo(el) : viewReviewGA(el);
  };
  AP2._exam = { buildGA, buildWiSo };
})();
