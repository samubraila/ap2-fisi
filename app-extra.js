// Prüfungsbereitschaft, Lernserie, Schwachstellen, Fortschritt übertragen, Suche, Hell/Dunkel, Quiz (WiSo + GA)
(function () {
  const $ = AP2.$, esc = AP2.esc, st = () => AP2.state();
  const strip = h => String(h).replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");

  // ---------- Quiz-Liste (WiSo + GA1 + GA2) ----------
  const QUIZ = AP2.QUIZ.map((d, i) => ({ k: "q" + i, part: "WiSo", q: d[0], o: d[1], c: d[2], e: d[3] }))
    .concat((AP2.QUIZ_GA || []).map((d, i) => ({ k: "g" + i, part: d[0], q: d[1], o: d[2], c: d[3], e: d[4] })));
  AP2.QUIZ_ALL = QUIZ;

  // ---------- Prüfungsbereitschaft ----------
  const bestExam = p => Math.max(0, ...(st().exams || []).filter(e => e.part === p).map(e => e.p));
  function readiness() {
    const s = st(), all = AP2.ALL, by = (s.trainer && s.trainer.byType) || {}, gens = Object.keys(AP2.GEN);
    const openT = AP2.planOrder().filter(t => !s.checks[t.id]);
    const unsafe = AP2.CARDS.filter((c, i) => ((s.cards["c" + i] || {}).box || 0) < 3).length;
    const quizOpen = QUIZ.filter(q => s.quiz[q.k] !== true).length;
    const genOpen = gens.filter(g => ((by[g] || {}).ok || 0) < 2);
    const exOpen = ["GA1", "GA2", "WiSo"].filter(p => bestExam(p) < 92);
    const parts = [
      { n: "Themen abgeschlossen", w: 30, v: 1 - openT.length / all.length, todo: openT.length ? `${openT.length} Themen offen – als Nächstes: ${openT[0].name}` : "", href: openT.length ? "#t-" + openT[0].id : "" },
      { n: "Lernkarten sicher (ab Fach 3)", w: 20, v: 1 - unsafe / AP2.CARDS.length, todo: unsafe ? `${unsafe} Lernkarten noch nicht sicher` : "", href: "#karten" },
      { n: "Quizfragen richtig", w: 15, v: 1 - quizOpen / QUIZ.length, todo: quizOpen ? `${quizOpen} Quizfragen offen oder falsch` : "", href: "#wiso" },
      { n: "Rechenaufgaben je 2× richtig", w: 15, v: 1 - genOpen.length / gens.length, todo: genOpen.length ? `Noch nicht sicher: ${genOpen.slice(0, 4).map(g => AP2.GEN[g].label).join(", ")}${genOpen.length > 4 ? " …" : ""}` : "", gen: genOpen[0] },
      { n: "Probeprüfungen mit Note 1 (ab 92 P)", w: 20, v: ["GA1", "GA2", "WiSo"].reduce((a, p) => a + Math.min(1, bestExam(p) / 92), 0) / 3, todo: exOpen.length ? `Probeprüfung noch unter 92 Punkten: ${exOpen.join(", ")}` : "", href: "#pruefung" }
    ];
    return { pct: parts.reduce((a, p) => a + p.w * p.v, 0), parts };
  }
  AP2.readiness = readiness;

  // ---------- Lernserie ----------
  function streak() { const d = st().days || {}; let n = 0; const t = new Date(); if (!d[AP2.dayKey(t)]) t.setDate(t.getDate() - 1); while (d[AP2.dayKey(t)]) { n++; t.setDate(t.getDate() - 1); } return n; }
  function heatmap() {
    const d = st().days || {}, cell = 15, gap = 3, weeks = 16, today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - ((today.getDay() + 6) % 7) - (weeks - 1) * 7);
    let s = ""; ["Mo", "Mi", "Fr"].forEach((n, i) => { s += AP2.D.t(0, 24 + i * 2 * (cell + gap), n, { c: "tm", fs: 9.5 }); });
    for (let w = 0; w < weeks; w++) for (let k = 0; k < 7; k++) {
      const day = new Date(start); day.setDate(start.getDate() + w * 7 + k); if (day > today) continue;
      const n = d[AP2.dayKey(day)] || 0, cls = n === 0 ? "f-sub" : n < 10 ? "hm1" : n < 25 ? "hm2" : "hm3";
      s += `<rect x="${24 + w * (cell + gap)}" y="${12 + k * (cell + gap)}" width="${cell}" height="${cell}" rx="3" class="${cls}${day.getTime() === today.getTime() ? " hm-today" : ""}"><title>${AP2.dayKey(day)}: ${n} Aktionen</title></rect>`;
    }
    return `<svg viewBox="0 0 ${24 + weeks * (cell + gap)} ${12 + 7 * (cell + gap)}" width="100%" style="max-width:${24 + weeks * (cell + gap)}px" role="img" aria-label="Lernkalender der letzten ${weeks} Wochen">${s}</svg>`;
  }

  // ---------- Schwachstellen ----------
  function weak() {
    const s = st(), by = (s.trainer && s.trainer.byType) || {}, res = [];
    AP2.ALL.forEach(t => {
      const L = AP2.LESSONS[t.id]; if (!L) return; let score = 0; const why = [];
      const bad = AP2.CARDS.map((c, i) => ({ c, i })).filter(x => x.c[0] === t.part && L.kw.test(x.c[1] + " " + x.c[2]) && s.cards["c" + x.i] && s.cards["c" + x.i].box === 1).length;
      if (bad) { score += bad; why.push(bad + " Karte" + (bad > 1 ? "n" : "") + " nicht gewusst"); }
      (L.train || []).forEach(g => { const b = by[g]; if (b && b.total > b.ok) { score += (b.total - b.ok) * 1.5; why.push((b.total - b.ok) + "× " + AP2.GEN[g].label + " falsch"); } });
      const qWrong = QUIZ.filter(q => q.part === t.part && s.quiz[q.k] === false && L.kw.test(q.q + " " + q.o.join(" "))).length;
      if (qWrong) { score += qWrong; why.push(qWrong + " Quizfrage" + (qWrong > 1 ? "n" : "") + " falsch"); }
      if (score) res.push({ t, score, why });
    });
    return res.sort((a, b) => b.score - a.score).slice(0, 4);
  }

  // ---------- Fortschritt übertragen ----------
  const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  const dec = c => JSON.parse(decodeURIComponent(escape(atob(String(c).trim()))));
  let importArmed = false;

  // ---------- Übersicht erweitern ----------
  const baseStart = AP2.views.start;
  AP2.views.start = function (el) {
    baseStart(el);
    const r = readiness(), pct = Math.round(r.pct), C = 2 * Math.PI * 44, sk = streak(), today = (st().days || {})[AP2.dayKey(new Date())] || 0, goal = 20, wk = weak();
    const ring = `<svg viewBox="0 0 108 108" width="108" height="108" role="img" aria-label="Prüfungsbereitschaft ${pct} Prozent"><circle cx="54" cy="54" r="44" class="ring-bg" style="stroke-width:10"/><circle cx="54" cy="54" r="44" class="ring-fg" style="stroke-width:10" stroke-dasharray="${(r.pct / 100 * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 54 54)"/><text x="54" y="60" text-anchor="middle" class="ring-t" style="font-size:22px">${pct}%</text></svg>`;
    const ready = document.createElement("div"); ready.className = "panel readiness";
    ready.innerHTML = `<div class="ready-top">${ring}<div class="grid" style="gap:4px;min-width:0;flex:1"><span class="eyebrow">Prüfungsbereitschaft</span><b class="hero-title">${pct >= 100 ? "Du bist zu 100 % vorbereitet." : pct >= 80 ? "Fast geschafft – schließ die letzten Lücken." : pct >= 40 ? "Gute Basis – jetzt dranbleiben." : "Los geht's – jeden Tag ein Stück."}</b><span class="small muted">100 % heißt: alle Themen abgeschlossen, alle Karten sicher, alle Quizfragen richtig, jede Rechenaufgabe 2× richtig und jede Probeprüfung mit mindestens 92 Punkten.</span></div></div>
      <div class="ready-parts">${r.parts.map(p => `<div class="rp"><div class="row small"><span>${p.n}</span><span class="spacer"></span><b class="mono">${Math.round(p.v * 100)} %</b></div><div class="bar"><i style="width:${Math.round(p.v * 100)}%"></i></div></div>`).join("")}</div>
      ${r.parts.some(p => p.todo) ? `<div><p class="eyebrow">Was dir noch bis 100 % fehlt</p><ul class="clean todo">${r.parts.filter(p => p.todo).map((p, i) => `<li class="row"><span style="flex:1;min-width:0">${esc(p.todo)}</span>${p.gen ? `<button type="button" class="btn sm" data-gen-open="${p.gen}">Üben</button>` : `<a class="btn sm" href="${p.href}">Üben</a>`}</li>`).join("")}</ul></div>` : ""}`;
    const row = document.createElement("div"); row.className = "grid g2";
    row.innerHTML = `<div class="panel"><div class="row"><h3>Lernserie</h3><span class="spacer"></span><span class="chip ${sk ? "hot" : ""}">${sk} Tag${sk === 1 ? "" : "e"} in Folge</span></div>
        <div class="row small"><span>Tagesziel: ${goal} Lernaktionen</span><span class="spacer"></span><b class="mono">${Math.min(today, goal)}/${goal}</b></div><div class="bar"><i style="width:${Math.min(100, today / goal * 100)}%"></i></div>
        <div class="scroll">${heatmap()}</div><p class="small muted">Jede beantwortete Karte, Rechenaufgabe, Quizfrage und jeder Lektionsschritt zählt als Aktion.</p></div>
      <div class="panel"><h3>Deine Schwachstellen</h3>${wk.length ? `<ul class="clean">${wk.map(w => `<li class="weak"><div class="grid" style="gap:2px;min-width:0"><b>${esc(w.t.name)}</b><span class="small muted">${esc(w.why.join(" · "))}</span></div><a class="btn sm primary" href="#t-${w.t.id}">Wiederholen</a></li>`).join("")}</ul>` : `<p class="small muted">Noch keine Schwachstellen erkannt. Sobald du Karten mit „Nicht gewusst“ markierst oder Aufgaben falsch löst, erscheinen hier die Themen, die du wiederholen solltest.</p>`}</div>`;
    const hero = el.querySelector(".hero-next"); const after = hero ? hero.nextSibling : el.children[1];
    el.insertBefore(ready, after); el.insertBefore(row, ready.nextSibling);
    const xfer = document.createElement("div"); xfer.className = "panel";
    xfer.innerHTML = `<h3>Fortschritt übertragen</h3><p class="small muted">Dein Fortschritt wird pro Version gespeichert (GitHub-Seite im Browser, Claude-Version im Konto). Mit diesem Code nimmst du ihn mit: hier kopieren, in der anderen Version einfügen.</p>
      <div class="grid g2"><div class="grid" style="gap:6px"><label class="field" for="x-out">Dein Code<textarea id="x-out" rows="3" readonly></textarea></label><div class="row"><button type="button" class="btn sm" id="x-copy">Code kopieren</button><span class="small muted" id="x-msg"></span></div></div>
      <div class="grid" style="gap:6px"><label class="field" for="x-in">Code aus der anderen Version einfügen<textarea id="x-in" rows="3"></textarea></label><div class="row"><button type="button" class="btn sm" id="x-imp">Übernehmen</button><span class="small muted" id="x-imsg"></span></div></div></div>`;
    el.appendChild(xfer);
    el.querySelectorAll("[data-gen-open]").forEach(b => b.addEventListener("click", () => AP2.openTrainer(b.dataset.genOpen)));
    const out = $("#x-out", el); out.value = enc(st());
    $("#x-copy", el).addEventListener("click", () => { const done = () => { $("#x-msg", el).textContent = "Kopiert."; }; const fb = () => { out.select(); $("#x-msg", el).textContent = "Markiert – jetzt Strg+C drücken."; }; try { navigator.clipboard.writeText(out.value).then(done, fb); } catch (e) { fb(); } });
    $("#x-imp", el).addEventListener("click", () => {
      const msg = $("#x-imsg", el); let data; try { data = dec($("#x-in", el).value); } catch (e) { msg.textContent = "Der Code ist ungültig. Bitte vollständig einfügen."; return; }
      if (!data || typeof data !== "object" || !data.cards || !data.checks) { msg.textContent = "Das ist kein Fortschritts-Code dieser App."; return; }
      if (!importArmed) { importArmed = true; msg.textContent = "Ersetzt deinen jetzigen Stand. Zum Bestätigen nochmal klicken."; $("#x-imp", el).classList.add("bad"); return; }
      importArmed = false; const cur = st(); Object.keys(cur).forEach(k => delete cur[k]); Object.assign(cur, data); AP2.save(); AP2.render();
    });
  };

  // ---------- Quiz (WiSo + GA1 + GA2) ----------
  let qPart = "Alle", qi = 0, picked = null, checked = false, onlyWrong = false;
  AP2.views.wiso = function viewQuiz(el) {
    const s = st(), list = QUIZ.filter(q => qPart === "Alle" || q.part === qPart).filter(q => !onlyWrong || s.quiz[q.k] !== true || (checked && q === QUIZ[qi]));
    if (!list.length) { onlyWrong = false; return viewQuiz(el); }
    let q = QUIZ[qi]; if (!list.includes(q)) { q = list[0]; qi = QUIZ.indexOf(q); picked = null; checked = false; }
    const pos = list.indexOf(q), inPart = QUIZ.filter(x => qPart === "Alle" || x.part === qPart), right = inPart.filter(x => s.quiz[x.k] === true).length;
    el.innerHTML = `
      <div class="row"><div class="grid" style="gap:4px"><p class="eyebrow">Quiz</p><h2>Fragen im Stil der IHK</h2></div><span class="spacer"></span>
        <div class="seg" role="group" aria-label="Bereich">${["Alle", "GA1", "GA2", "WiSo"].map(p => `<button type="button" data-qp="${p}" aria-pressed="${qPart === p}">${p}</button>`).join("")}</div></div>
      <div class="row small"><span class="chip">${right} von ${inPart.length} richtig</span><div class="bar" style="flex:1;min-width:120px"><i style="width:${inPart.length ? right / inPart.length * 100 : 0}%"></i></div></div>
      <div class="panel">
        <div class="row small"><span class="chip ${q.part.toLowerCase()}">${q.part}</span><span class="muted">Frage ${pos + 1} von ${list.length}${onlyWrong ? " (offene und falsche)" : ""}</span></div>
        <h3 style="font-family:var(--f-body);font-weight:600">${esc(q.q)}</h3>
        <div class="grid" style="gap:8px">${q.o.map((o, i) => { let cls = ""; if (checked) { if (q.c.includes(i)) cls = "right"; else if (picked === i) cls = "wrong"; }
          return `<label class="opt ${cls}"><input type="radio" name="qopt" value="${i}" ${picked === i ? "checked" : ""} ${checked ? "disabled" : ""}><span><b class="mono">${i + 1}</b> ${esc(o)}</span></label>`; }).join("")}</div>
        ${checked ? `<div class="sol">${q.c.includes(picked) ? "Richtig. " : "Leider falsch. "}${esc(q.e)}</div>` : ""}
        <div class="row"><button type="button" class="btn" id="q-prev" ${pos === 0 ? "disabled" : ""}>Zurück</button><span class="spacer"></span>
          ${checked ? `<button type="button" class="btn primary" id="q-next">${pos === list.length - 1 ? "Von vorn" : "Weiter"}</button>` : `<button type="button" class="btn primary" id="q-check" ${picked === null ? "disabled" : ""}>Prüfen</button>`}</div>
      </div>
      <div class="row"><button type="button" class="btn sm" id="q-wrong">${onlyWrong ? "Alle Fragen zeigen" : "Nur offene und falsche Fragen"}</button><button type="button" class="btn sm" id="q-reset">Quiz zurücksetzen</button></div>`;
    el.querySelectorAll("[data-qp]").forEach(b => b.addEventListener("click", () => { qPart = b.dataset.qp; picked = null; checked = false; viewQuiz(el); }));
    el.querySelectorAll('input[name="qopt"]').forEach(r => r.addEventListener("change", () => { picked = +r.value; viewQuiz(el); }));
    const go = d => { const n = list[(pos + d + list.length) % list.length]; qi = QUIZ.indexOf(n); picked = null; checked = false; viewQuiz(el); };
    $("#q-prev", el).addEventListener("click", () => go(-1));
    if ($("#q-check", el)) $("#q-check", el).addEventListener("click", () => { checked = true; s.quiz[q.k] = q.c.includes(picked); AP2.track(); AP2.save(); viewQuiz(el); });
    if ($("#q-next", el)) $("#q-next", el).addEventListener("click", () => go(1));
    $("#q-wrong", el).addEventListener("click", () => { onlyWrong = !onlyWrong; picked = null; checked = false; viewQuiz(el); });
    $("#q-reset", el).addEventListener("click", () => { QUIZ.filter(x => qPart === "Alle" || x.part === qPart).forEach(x => { delete s.quiz[x.k]; }); AP2.save(); picked = null; checked = false; viewQuiz(el); });
  };

  // ---------- Suche ----------
  let index = null;
  function buildIndex() {
    index = [];
    AP2.ALL.forEach(t => { const L = AP2.LESSONS[t.id] || {}; index.push({ title: t.name, sub: t.part + " · Lektion", text: (t.name + " " + t.f.join(" ") + " " + strip(L.ex || "") + " " + (L.q ? L.q.f : "")).toLowerCase(), href: "#t-" + t.id }); });
    Object.entries(AP2.GEN).forEach(([id, g]) => index.push({ title: g.label, sub: g.part + " · Rechenaufgabe", text: (g.label + " " + strip(g.howto)).toLowerCase(), gen: id }));
    AP2.CARDS.forEach(c => index.push({ title: c[1], sub: c[0] + " · Lernkarte", text: (c[1] + " " + c[2]).toLowerCase(), ans: c[2] }));
  }
  function search(qs) {
    if (!index) buildIndex(); const words = qs.toLowerCase().split(/\s+/).filter(w => w.length > 1); if (!words.length) return [];
    return index.filter(x => words.every(w => x.text.includes(w))).map(x => ({ x, r: words.filter(w => x.title.toLowerCase().includes(w)).length * 2 + (x.href ? 1 : 0) })).sort((a, b) => b.r - a.r).slice(0, 14).map(o => o.x);
  }
  function initSearch() {
    const inp = $("#q"), box = $("#sres"); if (!inp || !box) return;
    const close = () => { box.hidden = true; };
    const show = () => {
      const res = search(inp.value); if (!inp.value.trim()) return close();
      box.innerHTML = res.length ? res.map((x, i) => `<div class="sr" data-i="${i}"><div class="row small"><span class="muted">${esc(x.sub)}</span></div><b>${esc(x.title)}</b>${x.ans ? `<div class="sr-ans small" hidden>${esc(x.ans)}</div>` : ""}</div>`).join("") : `<div class="sr small muted">Nichts gefunden. Versuch einen anderen Begriff.</div>`;
      box.hidden = false;
      box.querySelectorAll(".sr[data-i]").forEach(d => d.addEventListener("click", () => { const x = res[+d.dataset.i];
        if (x.href) { location.hash = x.href; close(); inp.value = ""; } else if (x.gen) { AP2.openTrainer(x.gen); close(); inp.value = ""; } else { const a = d.querySelector(".sr-ans"); if (a) a.hidden = !a.hidden; } }));
    };
    inp.addEventListener("input", show); inp.addEventListener("focus", show);
    inp.addEventListener("keydown", e => { if (e.key === "Escape") { close(); inp.blur(); } if (e.key === "Enter") { const f = box.querySelector(".sr[data-i]"); if (f) f.click(); } });
    document.addEventListener("click", e => { if (!e.target.closest(".search")) close(); });
  }

  // ---------- Hell / Dunkel (nur außerhalb von Claude, dort steuert die Oberfläche das Design) ----------
  const MODES = [["auto", "Design: Auto"], ["light", "Design: Hell"], ["dark", "Design: Dunkel"]];
  function applyTheme(m) { if (m === "light" || m === "dark") document.documentElement.setAttribute("data-theme", m); else document.documentElement.removeAttribute("data-theme"); }
  let themeMode = "auto"; try { themeMode = localStorage.getItem("ap2-theme") || "auto"; } catch (e) {}
  if (typeof document === "undefined") return; // Prüfskript ohne Browser
  if (!window.claude) applyTheme(themeMode);
  function initTheme() {
    const b = $("#themeBtn"); if (!b || window.claude) return; b.hidden = false;
    const label = () => { b.textContent = MODES.find(m => m[0] === themeMode)[1]; }; label();
    b.addEventListener("click", () => { const i = MODES.findIndex(m => m[0] === themeMode); themeMode = MODES[(i + 1) % 3][0]; applyTheme(themeMode); try { localStorage.setItem("ap2-theme", themeMode); } catch (e) {} label(); });
  }
  const init = () => { initSearch(); initTheme(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
