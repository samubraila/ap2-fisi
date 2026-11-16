// Lektionen, Lernplan mit Start-Knöpfen und „Heute dran“
(function () {
  const $ = AP2.$, esc = AP2.esc, LS = AP2.LESSONS;
  const countOf = t => Object.keys(t.t).length, wTot = w => Object.values(w.n).reduce((a, b) => a + b, 0);
  const TOPICS = AP2.TOPICS.map(t => ({ id: t.id, part: t.part, name: t.name, n: countOf(t), t: t.t, f: t.f }))
    .concat(AP2.WISO.map(w => ({ id: w.id, part: "WiSo", name: w.name, n: Math.min(10, Math.round(wTot(w) / 1.3)), wn: w.n, f: w.f })));
  const byId = Object.fromEntries(TOPICS.map(t => [t.id, t]));
  AP2.ALL = TOPICS;
  const st = () => AP2.state();
  const prog = id => { const s = st(); s.lessons = s.lessons || {}; return s.lessons[id] || {}; };
  const setProg = (id, k) => { const s = st(); s.lessons = s.lessons || {}; s.lessons[id] = Object.assign({}, s.lessons[id], { [k]: true }); AP2.track(); AP2.save(); };
  const status = id => st().checks[id] ? "done" : (() => { const p = prog(id); return p.read || p.cards || p.quiz ? "started" : "open"; })();
  const STATUS = { done: ["chip low", "fertig"], started: ["chip mid", "angefangen"], open: ["chip", "offen"] };
  const timeOf = id => (LS[id] && LS[id].time) || 30;
  const prio = n => AP2.prio(n);

  // Reihenfolge: nach Häufigkeit, Prüfungsteile abwechselnd
  function order() {
    const lists = { GA1: [], GA2: [], WiSo: [] }; TOPICS.slice().sort((a, b) => b.n - a.n).forEach(t => lists[t.part].push(t));
    const pat = ["GA2", "GA1", "WiSo", "GA1", "GA2"], out = []; let k = 0;
    while (out.length < TOPICS.length) { const p = pat[k++ % pat.length]; if (lists[p].length) out.push(lists[p].shift()); }
    return out;
  }
  AP2.planOrder = order;
  const nextOpen = () => order().find(t => status(t.id) !== "done");

  // ---------- Lektion ----------
  let deck = null, deckIdx = 0, deckShow = false, deckFor = null, ansOpen = false;
  function cardsFor(id) {
    const t = byId[id], L = LS[id]; if (!L || !L.kw) return [];
    return AP2.CARDS.map((c, i) => ({ c, i })).filter(x => x.c[0] === (t.part === "WiSo" ? "WiSo" : t.part) && L.kw.test(x.c[1] + " " + x.c[2])).slice(0, 12);
  }
  function viewLesson(el) {
    const id = (location.hash || "").slice(3), t = byId[id], L = LS[id];
    if (!t || !L) { el.innerHTML = `<div class="panel"><p>Diese Lektion gibt es nicht.</p><a class="btn" href="#plan">Zum Lernplan</a></div>`; return; }
    if (deckFor !== id) { deck = cardsFor(id); deckIdx = 0; deckShow = false; deckFor = id; ansOpen = false; }
    const p = prog(id), done = !!st().checks[id], pr = prio(t.n);
    const steps = [["Verstehen", p.read], ["Merken", p.cards || !deck.length], ["Prüfungsfrage", p.quiz], ["Abschließen", done]];
    const asked = t.t ? AP2.TERMS.filter(x => t.t[x.id]).map(x => `<li><b class="mono">${x.id}</b> ${esc(t.t[x.id])}</li>`).join("") : Object.entries(t.wn).map(([k, v]) => `<li><b class="mono">${k}</b> ${v} Fragen</li>`).join("");
    const nxt = order().find(x => x.id !== id && status(x.id) !== "done");
    const c = deck[deckIdx];
    el.innerHTML = `
      <div class="row small"><a href="#plan">← Lernplan</a><span class="muted">·</span><a href="#themen">Themen-Radar</a></div>
      <div class="lesson-head">
        <div class="grid" style="gap:6px;min-width:0"><div class="row"><span class="chip ${t.part.toLowerCase()}">${t.part}</span><span class="chip ${pr[0]}">${pr[1]} · ${t.n}/10</span><span class="chip">ca. ${timeOf(id)} Min.</span></div>
        <h2>${esc(t.name)}</h2></div>
        <ol class="stepper">${steps.map(([n, ok], i) => `<li class="${ok ? "ok" : ""}"><i>${ok ? "✓" : i + 1}</i>${n}</li>`).join("")}</ol>
      </div>
      <section class="panel lesson-sec"><p class="eyebrow">Schritt 1 · Verstehen</p><h3>Kurz erklärt</h3><div class="prose">${L.ex}</div>
        ${(L.figs || []).map(f => `<figure class="fig"><div class="scroll">${f.f()}</div><figcaption class="small muted">${esc(f.cap || "")}</figcaption></figure>`).join("")}
        <div class="grid g2"><div><p class="eyebrow">So wurde es in der Prüfung gefragt</p><ul class="clean small">${asked}</ul></div>
          <div><p class="eyebrow">Das musst du können</p><ul class="facts small">${t.f.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
        <div class="row"><button type="button" class="btn ${p.read ? "good" : "primary"}" id="l-read">${p.read ? "✓ Verstanden" : "Verstanden – weiter"}</button></div></section>
      <section class="panel lesson-sec" id="l-cards-sec"><p class="eyebrow">Schritt 2 · Merken</p><h3>Lernkarten zu diesem Thema</h3>
        ${deck.length ? `<p class="small muted">Karte ${Math.min(deckIdx + 1, deck.length)} von ${deck.length}</p>
          ${c ? `<div class="card mini"><p class="q">${esc(c.c[1])}</p>${deckShow ? `<div class="a">${esc(c.c[2])}</div>` : ""}</div>
          <div class="row" style="justify-content:center">${deckShow ? `<button type="button" class="btn bad" id="l-no">Nicht gewusst</button><button type="button" class="btn good" id="l-yes">Gewusst</button>` : `<button type="button" class="btn primary" id="l-show">Antwort zeigen</button>`}</div>`
          : `<div class="verdict ok">Alle ${deck.length} Karten durch. <button type="button" class="btn sm" id="l-again">Nochmal</button></div>`}` : `<p class="small muted">Für dieses Thema gibt es keine eigenen Karten – präg dir die Punkte unter „Das musst du können“ ein.</p>`}</section>
      <section class="panel lesson-sec"><p class="eyebrow">Schritt 3 · Prüfungsfrage</p><h3>So könnte es drankommen</h3>
        <div class="exam-q">${esc(L.q.f)}</div>
        <label class="field" for="l-own">Deine Antwort (Stichworte reichen, wird nicht gespeichert)<textarea id="l-own" rows="4"></textarea></label>
        <div class="row"><button type="button" class="btn ${ansOpen ? "" : "primary"}" id="l-ans">${ansOpen ? "Musterantwort ausblenden" : "Musterantwort zeigen"}</button></div>
        ${ansOpen ? `<div class="sol">${esc(L.q.a)}</div><p class="small muted">Vergleiche: Hast du die gefragte Anzahl Punkte genannt? Bei „erläutern“ immer mit Grund oder Beispiel.</p>` : ""}</section>
      <section class="panel lesson-sec"><p class="eyebrow">Schritt 4 · Üben und abschließen</p>
        <div class="row">${(L.train || []).map(g => `<button type="button" class="btn" data-train="${g}">Rechenaufgabe: ${esc(AP2.GEN[g] ? AP2.GEN[g].label : g)}</button>`).join("")}
          ${t.part === "WiSo" ? `<a class="btn" href="#wiso">WiSo-Quiz</a>` : `<a class="btn" href="#archiv">Echte Prüfung im Archiv</a>`}</div>
        <div class="row"><button type="button" class="btn ${done ? "good" : "primary"}" id="l-done">${done ? "✓ Thema abgeschlossen" : "Thema abschließen"}</button>
          ${nxt ? `<a class="btn" href="#t-${nxt.id}">Weiter mit: ${esc(nxt.name)} →</a>` : ""}</div></section>`;
    $("#l-read", el).addEventListener("click", () => { setProg(id, "read"); viewLesson(el); $("#l-cards-sec", el).scrollIntoView({ behavior: "smooth", block: "start" }); });
    const rate = ok => { const s = st(), cid = "c" + c.i, cur = s.cards[cid] || { box: 1 }; s.cards[cid] = { box: ok ? Math.min(5, (cur.box || 1) + 1) : 1 }; deckIdx++; deckShow = false; if (deckIdx >= deck.length) setProg(id, "cards"); else { AP2.track(); AP2.save(); } viewLesson(el); };
    if ($("#l-show", el)) $("#l-show", el).addEventListener("click", () => { deckShow = true; viewLesson(el); });
    if ($("#l-yes", el)) { $("#l-yes", el).addEventListener("click", () => rate(true)); $("#l-no", el).addEventListener("click", () => rate(false)); }
    if ($("#l-again", el)) $("#l-again", el).addEventListener("click", () => { deckIdx = 0; deckShow = false; viewLesson(el); });
    $("#l-ans", el).addEventListener("click", () => { ansOpen = !ansOpen; if (ansOpen) setProg(id, "quiz"); const own = $("#l-own", el).value; viewLesson(el); $("#l-own", el).value = own; });
    el.querySelectorAll("[data-train]").forEach(b => b.addEventListener("click", () => AP2.openTrainer(b.dataset.train)));
    $("#l-done", el).addEventListener("click", () => { const s = st(); s.checks[id] = !s.checks[id]; setProg(id, "done"); viewLesson(el); });
  }

  // ---------- Lernplan ----------
  const WD = { 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6] };
  const DN = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const fmtD = d => DN[d.getDay()] + " " + String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + ".";
  function topicCard(t) {
    const s = status(t.id), lab = s === "done" ? "Wiederholen" : s === "started" ? "Weiter" : "Starten";
    return `<div class="tcard ${s}"><div class="row" style="gap:6px"><span class="chip ${t.part.toLowerCase()}">${t.part}</span><span class="${STATUS[s][0]}">${STATUS[s][1]}</span><span class="small muted">${timeOf(t.id)} Min.</span></div>
      <b class="tname">${esc(t.name)}</b><a class="btn sm ${s === "done" ? "" : "primary"}" href="#t-${t.id}">${lab}</a></div>`;
  }
  function viewPlan(el) {
    const s = st(), days = s.planDays || 5, today = new Date(); today.setHours(0, 0, 0, 0);
    const exam = s.examDate ? new Date(s.examDate + "T00:00:00") : new Date(today.getTime() + 42 * 86400000);
    const learn = []; for (let d = new Date(today); d < exam; d.setDate(d.getDate() + 1)) if (WD[days].includes(d.getDay())) learn.push(new Date(d));
    const open = order().filter(t => status(t.id) !== "done"), doneL = order().filter(t => status(t.id) === "done");
    const reserve = learn.length > 12 ? Math.min(4, Math.floor(learn.length / 8)) : 0, lDays = Math.max(1, learn.length - reserve);
    const per = Math.max(1, Math.ceil(open.length / lDays));
    const sched = learn.map((d, i) => ({ d, items: i < lDays ? open.slice(i * per, (i + 1) * per) : null, exam: i >= lDays ? ["GA1", "GA2", "WiSo", "Wiederholung"][(i - lDays) % 4] : null }))
      .filter(x => x.exam || (x.items && x.items.length));
    const weeks = []; sched.forEach(x => { const mon = new Date(x.d); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7)); const k = mon.toDateString(); let w = weeks.find(w => w.k === k); if (!w) weeks.push(w = { k, mon, list: [] }); w.list.push(x); });
    const nx = nextOpen(), total = TOPICS.length, doneN = doneL.length;
    el.innerHTML = `
      <div class="grid" style="gap:4px"><p class="eyebrow">Lernplan</p><h2>Tag für Tag bis zur Prüfung</h2>
        <p class="lead">Die Themen sind nach Häufigkeit in den Prüfungen sortiert und wechseln zwischen GA1, GA2 und WiSo. Klick bei einem Thema auf <b>Starten</b> – du kommst direkt in die Lektion mit Erklärung, Zeichnung, Lernkarten und Prüfungsfrage.</p></div>
      ${nx ? `<div class="hero-next"><div class="grid" style="gap:4px;min-width:0"><span class="eyebrow">Jetzt weitermachen</span><b class="hero-title">${esc(nx.name)}</b><span class="small">${nx.part} · ${STATUS[status(nx.id)][1]} · ca. ${timeOf(nx.id)} Min.</span></div><a class="btn primary" href="#t-${nx.id}">${status(nx.id) === "started" ? "Weiter" : "Starten"} →</a></div>` : `<div class="verdict ok">Alle Themen abgeschlossen. Jetzt Probeprüfungen aus dem Archiv schreiben.</div>`}
      <div class="panel"><div class="grid g3">
        <label class="field" for="p-exam">Prüfungsdatum<input type="date" id="p-exam" value="${esc(s.examDate || "")}"></label>
        <label class="field" for="p-days">Lerntage pro Woche<select id="p-days">${[3, 4, 5, 6, 7].map(n => `<option value="${n}" ${n === days ? "selected" : ""}>${n} Tage</option>`).join("")}</select></label>
        <div class="grid" style="gap:6px"><span class="small muted">Fortschritt</span><div class="bar"><i style="width:${(doneN / total * 100).toFixed(0)}%"></i></div><span class="small"><b>${doneN}</b> von ${total} Themen fertig · ${open.length} offen · ${learn.length} Lerntage</span></div>
      </div>${s.examDate ? "" : `<p class="small muted">Kein Prüfungsdatum eingetragen – der Plan rechnet mit 6 Wochen.</p>`}${per > 1 ? `<p class="small muted">Es sind mehr Themen als Lerntage – darum ${per} Themen pro Tag. Mehr Lerntage pro Woche entlasten den Plan.</p>` : ""}</div>
      ${weeks.length ? "" : `<div class="note">Das Prüfungsdatum liegt in der Vergangenheit oder heute. Trag oben das neue Datum ein.</div>`}
      ${weeks.map((w, wi) => `<section class="week"><h3>Woche ${wi + 1} <span class="small muted">ab ${fmtD(w.mon)}</span></h3><div class="days">
        ${w.list.map(x => `<div class="day"><div class="dhead"><b>${fmtD(x.d)}</b>${x.d.getTime() === today.getTime() ? `<span class="chip hot">heute</span>` : ""}</div>
          ${x.exam ? `<div class="tcard exam"><span class="chip">${x.exam === "Wiederholung" ? "Wiederholen" : "Probeprüfung"}</span><b class="tname">${x.exam === "Wiederholung" ? "Lernkarten + Rechen-Trainer" : x.exam + " unter Echtzeit (" + (x.exam === "WiSo" ? "60" : "90") + " Min.)"}</b><a class="btn sm" href="${x.exam === "Wiederholung" ? "#karten" : "#archiv"}">Öffnen</a></div>` : x.items.map(topicCard).join("")}</div>`).join("")}</div></section>`).join("")}
      ${doneL.length ? `<details><summary>Schon erledigt (${doneL.length})</summary><div class="days" style="margin-top:10px">${doneL.map(t => `<div class="day">${topicCard(t)}</div>`).join("")}</div></details>` : ""}`;
    $("#p-exam", el).addEventListener("change", e => { st().examDate = e.target.value; AP2.save(); viewPlan(el); });
    $("#p-days", el).addEventListener("change", e => { st().planDays = +e.target.value; AP2.save(); viewPlan(el); });
  }

  // ---------- Übersicht: „Heute dran“ + Fortschrittsring ----------
  const baseStart = AP2.views.start;
  function viewStart(el) {
    baseStart(el);
    const nx = nextOpen(), doneN = TOPICS.filter(t => st().checks[t.id]).length, pct = doneN / TOPICS.length, C = 2 * Math.PI * 34;
    const ring = `<svg viewBox="0 0 84 84" width="84" height="84" role="img" aria-label="Fortschritt ${Math.round(pct * 100)} Prozent"><circle cx="42" cy="42" r="34" class="ring-bg"/><circle cx="42" cy="42" r="34" class="ring-fg" stroke-dasharray="${(pct * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 42 42)"/><text x="42" y="47" text-anchor="middle" class="ring-t">${Math.round(pct * 100)}%</text></svg>`;
    const box = document.createElement("div"); box.className = "hero-next big";
    box.innerHTML = nx ? `${ring}<div class="grid" style="gap:4px;min-width:0;flex:1"><span class="eyebrow">Heute dran</span><b class="hero-title">${esc(nx.name)}</b><span class="small">${nx.part} · ca. ${timeOf(nx.id)} Min. · ${doneN} von ${TOPICS.length} Themen fertig</span></div><div class="row"><a class="btn primary" href="#t-${nx.id}">${status(nx.id) === "started" ? "Weiter" : "Lektion starten"} →</a><a class="btn" href="#plan">Ganzer Plan</a></div>`
      : `${ring}<div class="grid" style="gap:4px;flex:1"><span class="eyebrow">Geschafft</span><b class="hero-title">Alle Themen abgeschlossen</b></div><a class="btn primary" href="#archiv">Probeprüfung</a>`;
    el.insertBefore(box, el.children[1]);
  }

  AP2.views.lektion = viewLesson;
  AP2.views.plan = viewPlan;
  AP2.views.start = viewStart;
})();
