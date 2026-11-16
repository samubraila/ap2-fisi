// Notenrechner, Lernkarten, WiSo-Quiz
(function () {
  const $ = AP2.$, esc = AP2.esc;
  const fmt = x => (Math.round(x * 10) / 10).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const GRADES = [[92, 1, "sehr gut"], [81, 2, "gut"], [67, 3, "befriedigend"], [50, 4, "ausreichend"], [30, 5, "mangelhaft"], [0, 6, "ungenügend"]];
  const grade = p => GRADES.find(g => p >= g[0]);
  AP2.grade = grade;

  // ---------- Notenrechner ----------
  const FIELDS = [
    ["ap1", "Teil 1 (AP1)", "20 %"], ["doku", "Projektdokumentation", "Teil des Projekts"], ["praes", "Präsentation + Fachgespräch", "Teil des Projekts"],
    ["ga1", "GA1 Konzeption & Administration", "10 %"], ["ga2", "GA2 Netzwerke", "10 %"], ["wiso", "WiSo", "10 %"]
  ];
  const EXAMPLE = { ap1: 72, doku: 78, praes: 85, ga1: 58, ga2: 46, wiso: 70 };

  function evalAll(v) {
    const proj = (v.doku + v.praes) / 2;
    const w = [v.ga1, v.ga2, v.wiso];
    const total = 0.2 * v.ap1 + 0.5 * proj + 0.1 * (v.ga1 + v.ga2 + v.wiso);
    const teil2 = (0.5 * proj + 0.1 * (v.ga1 + v.ga2 + v.wiso)) / 0.8;
    const nOk = w.filter(x => x >= 50).length;
    const rules = [
      [total >= 50, "Gesamtergebnis aus Teil 1 und Teil 2 mindestens ausreichend", fmt(total) + " P"],
      [teil2 >= 50, "Ergebnis von Teil 2 mindestens ausreichend", fmt(teil2) + " P"],
      [proj >= 50, "Betriebliche Projektarbeit mindestens ausreichend", fmt(proj) + " P"],
      [nOk >= 2, "Mindestens zwei der drei schriftlichen Bereiche ausreichend", nOk + " von 3"],
      [[proj].concat(w).every(x => x >= 30), "Kein Prüfungsbereich von Teil 2 ungenügend (unter 30)", ""]
    ];
    return { proj, total, teil2, rules, passed: rules.every(r => r[0]) };
  }
  AP2.evalAll = evalAll;

  function viewNoten(el) {
    const st = AP2.state();
    const isExample = !st.noten;
    const vals = Object.assign({}, st.noten || EXAMPLE);
    const all = FIELDS.every(f => typeof vals[f[0]] === "number" && !isNaN(vals[f[0]]));
    let out = "";
    if (all) {
      const r = evalAll(vals); const g = grade(r.total);
      const oral = [];
      [["ga1", "GA1"], ["ga2", "GA2"], ["wiso", "WiSo"]].forEach(([k, name]) => {
        if (vals[k] >= 50) return;
        if (r.passed) { oral.push(`<li><b>${name}</b> (${fmt(vals[k])} P): nicht möglich, weil du ohnehin bestanden hast.</li>`); return; }
        let need = null;
        for (let m = 0; m <= 100; m++) { const t = Object.assign({}, vals); t[k] = (2 * vals[k] + m) / 3; if (evalAll(t).passed) { need = m; break; } }
        oral.push(need === null
          ? `<li><b>${name}</b> (${fmt(vals[k])} P): kann allein nicht den Ausschlag geben – auch 100 Punkte mündlich reichen nicht.</li>`
          : `<li><b>${name}</b> (${fmt(vals[k])} P): möglich. Du brauchst mindestens <b>${need} Punkte</b> in der etwa 15-minütigen mündlichen Prüfung. Neues Ergebnis = (2 × schriftlich + mündlich) ÷ 3.</li>`);
      });
      out = `
        <div class="verdict ${r.passed ? "ok" : "no"}">${r.passed ? "Bestanden" : "Nicht bestanden"} · Gesamt ${fmt(r.total)} Punkte · Note ${g[1]} (${g[2]})</div>
        <div class="scale">${GRADES.map(x => `<div class="${x[1] === g[1] ? "cur" : ""}">${x[1]}<br><span class="small">${x[2]}</span></div>`).join("")}</div>
        <div class="grid g3">
          <div class="panel"><p class="eyebrow">Projektarbeit</p><div class="kpi">${fmt(r.proj)} <small>P · Note ${grade(r.proj)[1]}</small></div></div>
          <div class="panel"><p class="eyebrow">Teil 2 gesamt</p><div class="kpi">${fmt(r.teil2)} <small>P · Note ${grade(r.teil2)[1]}</small></div></div>
          <div class="panel"><p class="eyebrow">Gesamtergebnis</p><div class="kpi">${fmt(r.total)} <small>P · Note ${g[1]}</small></div></div>
        </div>
        <div class="panel"><h3>Bestehensregeln</h3>${r.rules.map(x => `<div class="rule ${x[0] ? "ok" : "no"}"><i>${x[0] ? "✓" : "✗"}</i><span style="flex:1">${x[1]}</span><span class="mono small">${x[2]}</span></div>`).join("")}</div>
        <div class="panel"><h3>Mündliche Ergänzungsprüfung</h3>
          ${oral.length ? `<ul class="clean small">${oral.join("")}</ul>` : `<p class="small muted">Nicht nötig – kein schriftlicher Bereich unter 50 Punkten.</p>`}
          <p class="small muted">Auf Antrag in genau einem der Bereiche GA1, GA2 oder WiSo, wenn dieser unter 50 Punkten liegt und die mündliche Prüfung für das Bestehen den Ausschlag geben kann.</p></div>`;
    } else {
      out = `<div class="verdict open">Trag alle sechs Werte ein, um Note und Bestehensregeln zu sehen – oder nutze den Zielrechner unten.</div>`;
    }
    // Zielrechner
    const openKey = st.notenOpen || "ga2";
    let target = "";
    {
      const others = FIELDS.filter(f => f[0] !== openKey);
      const ready = others.every(f => typeof vals[f[0]] === "number" && !isNaN(vals[f[0]]));
      if (ready) {
        const find = test => { for (let x = 0; x <= 100; x++) { const t = Object.assign({}, vals); t[openKey] = x; if (test(evalAll(t))) return x; } return null; };
        const rows = [["Bestehen", find(r => r.passed)], ["Gesamtnote 3", find(r => r.passed && r.total >= 67)], ["Gesamtnote 2", find(r => r.passed && r.total >= 81)], ["Gesamtnote 1", find(r => r.passed && r.total >= 92)]];
        target = `<table class="small"><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td class="num mono">${r[1] === null ? "nicht erreichbar" : "mind. " + r[1] + " P"}</td></tr>`).join("")}</tbody></table>`;
      } else target = `<p class="small muted">Trag zuerst alle anderen Werte ein.</p>`;
    }
    el.innerHTML = `
      <div class="grid" style="gap:4px"><p class="eyebrow">Notenrechner</p><h2>Gesamtnote und Bestehen berechnen</h2>
      <p class="lead">Gewichtung nach der Fachinformatiker-Ausbildungsverordnung 2020: AP1 20 %, Projektarbeit 50 %, GA1, GA2 und WiSo je 10 %. Dokumentation und Präsentation mit Fachgespräch zählen hier je zur Hälfte der Projektnote.</p></div>
      ${isExample ? `<div class="note">Beispielwerte zum Ausprobieren – überschreib sie mit deinen Punkten.</div>` : ""}
      <div class="panel"><div class="grid g3">${FIELDS.map(f => `<label class="field" for="n-${f[0]}">${f[1]} <span class="small">(${f[2]})</span><input type="number" id="n-${f[0]}" min="0" max="100" step="0.5" inputmode="decimal" value="${typeof vals[f[0]] === "number" && !isNaN(vals[f[0]]) ? vals[f[0]] : ""}" placeholder="0–100"></label>`).join("")}</div>
        <div class="row"><button type="button" class="btn sm" id="n-clear">Felder leeren</button><button type="button" class="btn sm" id="n-example">Beispielwerte</button></div></div>
      ${out}
      <div class="panel"><h3>Zielrechner: Wie viele Punkte brauche ich noch?</h3>
        <label class="field" for="n-open">Welche Prüfung ist noch offen?
          <select id="n-open">${FIELDS.map(f => `<option value="${f[0]}" ${f[0] === openKey ? "selected" : ""}>${f[1]}</option>`).join("")}</select></label>
        ${target}</div>
      <p class="small muted">Berechnung mit exakten Werten. Manche IHKs runden Zwischenergebnisse auf ganze Punkte – knapp an einer Notengrenze kann das die Note ändern.</p>`;
    FIELDS.forEach(f => $("#n-" + f[0], el).addEventListener("change", e => {
      const s = AP2.state(); s.noten = s.noten || Object.assign({}, EXAMPLE);
      const v = parseFloat(String(e.target.value).replace(",", "."));
      s.noten[f[0]] = isNaN(v) ? null : Math.max(0, Math.min(100, v));
      AP2.save(); viewNoten(el);
    }));
    $("#n-clear", el).addEventListener("click", () => { const s = AP2.state(); s.noten = {}; AP2.save(); viewNoten(el); });
    $("#n-example", el).addEventListener("click", () => { const s = AP2.state(); s.noten = Object.assign({}, EXAMPLE); AP2.save(); viewNoten(el); });
    $("#n-open", el).addEventListener("change", e => { const s = AP2.state(); s.notenOpen = e.target.value; AP2.save(); viewNoten(el); });
  }

  // ---------- Lernkarten (Karteikasten 1–5) ----------
  let cardPart = "Alle", cardIdx = null, showAns = false, lastIdx = null;
  function pickCard() {
    const st = AP2.state();
    const pool = AP2.CARDS.map((c, i) => i).filter(i => cardPart === "Alle" || AP2.CARDS[i][0] === cardPart);
    const box = i => (st.cards["c" + i] || {}).box || 1;
    pool.sort((a, b) => box(a) - box(b) || Math.random() - 0.5);
    const minBox = box(pool[0]);
    const cand = pool.filter(i => box(i) === minBox && i !== lastIdx);
    const list = cand.length ? cand : pool;
    return list[Math.floor(Math.random() * list.length)];
  }
  function viewKarten(el) {
    const st = AP2.state();
    if (cardIdx === null || (cardPart !== "Alle" && AP2.CARDS[cardIdx][0] !== cardPart)) { cardIdx = pickCard(); showAns = false; }
    const c = AP2.CARDS[cardIdx];
    const inPart = AP2.CARDS.map((x, i) => i).filter(i => cardPart === "Alle" || AP2.CARDS[i][0] === cardPart);
    const counts = [1, 2, 3, 4, 5].map(b => inPart.filter(i => ((st.cards["c" + i] || {}).box || 1) === b).length);
    el.innerHTML = `
      <div class="row"><div class="grid" style="gap:4px"><p class="eyebrow">Lernkarten</p><h2>Wissen abfragen</h2></div><span class="spacer"></span>
        <div class="seg" role="group" aria-label="Bereich">${["Alle", "GA1", "GA2", "WiSo"].map(p => `<button type="button" data-cp="${p}" aria-pressed="${cardPart === p}">${p}</button>`).join("")}</div></div>
      <div class="boxes">${counts.map((n, i) => `<div><b>${n}</b>Fach ${i + 1}</div>`).join("")}</div>
      <p class="small muted">Gewusst → Karte rückt ein Fach weiter. Nicht gewusst → zurück in Fach 1. Karten aus niedrigen Fächern kommen zuerst.</p>
      <div class="card">
        <span class="chip ${c[0].toLowerCase()}" style="justify-self:center">${c[0]}</span>
        <p class="q">${esc(c[1])}</p>
        ${showAns ? `<div class="a">${esc(c[2])}</div>` : ""}
      </div>
      <div class="row" style="justify-content:center">
        ${showAns
          ? `<button type="button" class="btn bad" id="k-no">Nicht gewusst</button><button type="button" class="btn good" id="k-yes">Gewusst</button>`
          : `<button type="button" class="btn primary" id="k-show">Antwort zeigen</button><button type="button" class="btn" id="k-skip">Überspringen</button>`}
      </div>`;
    el.querySelectorAll("[data-cp]").forEach(b => b.addEventListener("click", () => { cardPart = b.dataset.cp; cardIdx = null; viewKarten(el); }));
    const next = () => { lastIdx = cardIdx; cardIdx = pickCard(); showAns = false; viewKarten(el); };
    const rate = ok => { const s = AP2.state(); const id = "c" + cardIdx; const cur = s.cards[id] || { box: 1 }; s.cards[id] = { box: ok ? Math.min(5, (cur.box || 1) + 1) : 1 }; AP2.track(); AP2.save(); next(); };
    if ($("#k-show", el)) { $("#k-show", el).addEventListener("click", () => { showAns = true; viewKarten(el); }); $("#k-skip", el).addEventListener("click", next); }
    if ($("#k-yes", el)) { $("#k-yes", el).addEventListener("click", () => rate(true)); $("#k-no", el).addEventListener("click", () => rate(false)); }
  }

  // ---------- WiSo-Quiz ----------
  let qi = 0, qPicked = null, qChecked = false, onlyWrong = false;
  function viewQuiz(el) {
    const st = AP2.state();
    const idxs = AP2.QUIZ.map((q, i) => i).filter(i => !onlyWrong || st.quiz["q" + i] !== true || (qChecked && i === qi));
    if (!idxs.length) { onlyWrong = false; return viewQuiz(el); }
    if (!idxs.includes(qi)) qi = idxs[0];
    const q = AP2.QUIZ[qi]; const pos = idxs.indexOf(qi);
    const answered = Object.keys(st.quiz).length; const right = Object.values(st.quiz).filter(Boolean).length;
    el.innerHTML = `
      <div class="row"><div class="grid" style="gap:4px"><p class="eyebrow">WiSo-Quiz</p><h2>Fragen im Stil der IHK</h2></div><span class="spacer"></span>
        <span class="chip">${right} richtig · ${answered}/${AP2.QUIZ.length} beantwortet</span></div>
      <div class="panel">
        <p class="small muted">Frage ${pos + 1} von ${idxs.length}${onlyWrong ? " (nur offene/falsche)" : ""}</p>
        <h3 style="font-family:var(--f-body);font-weight:600">${esc(q[0])}</h3>
        <div class="grid" style="gap:8px">${q[1].map((o, i) => {
          let cls = ""; if (qChecked) { if (q[2].includes(i)) cls = "right"; else if (qPicked === i) cls = "wrong"; }
          return `<label class="opt ${cls}"><input type="radio" name="qopt" value="${i}" ${qPicked === i ? "checked" : ""} ${qChecked ? "disabled" : ""}><span><b class="mono">${i + 1}</b> ${esc(o)}</span></label>`; }).join("")}</div>
        ${qChecked ? `<div class="sol">${q[2].includes(qPicked) ? "Richtig. " : "Leider falsch. "}${esc(q[3])}</div>` : ""}
        <div class="row">
          <button type="button" class="btn" id="q-prev" ${pos === 0 ? "disabled" : ""}>Zurück</button>
          <span class="spacer"></span>
          ${qChecked ? `<button type="button" class="btn primary" id="q-next">${pos === idxs.length - 1 ? "Von vorn" : "Weiter"}</button>` : `<button type="button" class="btn primary" id="q-check" ${qPicked === null ? "disabled" : ""}>Prüfen</button>`}
        </div>
      </div>
      <div class="row"><button type="button" class="btn sm" id="q-wrong">${onlyWrong ? "Alle Fragen zeigen" : "Nur offene und falsche Fragen"}</button>
        <button type="button" class="btn sm" id="q-reset">Quiz zurücksetzen</button></div>`;
    el.querySelectorAll('input[name="qopt"]').forEach(r => r.addEventListener("change", () => { qPicked = +r.value; viewQuiz(el); }));
    const go = d => { const n = idxs[(pos + d + idxs.length) % idxs.length]; qi = n; qPicked = null; qChecked = false; viewQuiz(el); };
    $("#q-prev", el).addEventListener("click", () => go(-1));
    if ($("#q-check", el)) $("#q-check", el).addEventListener("click", () => { qChecked = true; const s = AP2.state(); s.quiz["q" + qi] = q[2].includes(qPicked); AP2.save(); viewQuiz(el); });
    if ($("#q-next", el)) $("#q-next", el).addEventListener("click", () => go(1));
    $("#q-wrong", el).addEventListener("click", () => { onlyWrong = !onlyWrong; qPicked = null; qChecked = false; viewQuiz(el); });
    $("#q-reset", el).addEventListener("click", () => { const s = AP2.state(); s.quiz = {}; AP2.save(); qi = 0; qPicked = null; qChecked = false; viewQuiz(el); });
  }

  AP2.views.noten = viewNoten;
  AP2.views.karten = viewKarten;
  AP2.views.wiso = viewQuiz;
})();
