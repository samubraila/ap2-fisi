// Kern: Speicher, Navigation, Übersicht, Themen-Radar, Archiv, Lernplan, Tipps
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  AP2.$ = $; AP2.esc = esc;

  // ---------- Speicher: eigenes Konto (db, privat) oder Browser ----------
  const KEY = "ap2-lernzentrale-v1";
  const defaults = () => ({ examDate: "", cards: {}, checks: {}, trainer: { ok: 0, total: 0 }, quiz: {}, updatedAt: 0 });
  let state = defaults();
  try { const raw = localStorage.getItem(KEY); if (raw) state = Object.assign(defaults(), JSON.parse(raw)); } catch (e) {}
  AP2.state = () => state;

  let ref = null, writing = false, again = false, timer = null;
  function chip(text, ok) { const c = $("#saveChip"); if (c) { c.textContent = text; c.classList.toggle("ok", !!ok); } }
  async function flush() {
    if (!ref) return;
    if (writing) { again = true; return; }
    writing = true;
    try { await ref.set(JSON.parse(JSON.stringify(state))); chip("Fortschritt: in deinem Konto gespeichert", true); }
    catch (e) { chip("Fortschritt: nur dieser Browser", false); if (e && e.code === "invalid_argument") ref = null; }
    writing = false;
    if (again) { again = false; flush(); }
  }
  AP2.save = function () {
    state.updatedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    if (ref) { clearTimeout(timer); timer = setTimeout(flush, 1200); }
  };
  (async function connect() {
    try {
      if (!window.claude || !window.claude.use) return;
      const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
      if (!db || !user) return;
      const uid = await user.id();
      if (!uid) return;
      const r = db.doc("data/users/" + uid + "/progress");
      const snap = await r.get();
      ref = r;
      if (snap.exists) {
        const remote = snap.data() || {};
        if ((remote.updatedAt || 0) >= (state.updatedAt || 0)) {
          state = Object.assign(defaults(), JSON.parse(JSON.stringify(remote)));
          try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
          render();
        } else flush();
      } else if (state.updatedAt) flush();
      chip("Fortschritt: in deinem Konto gespeichert", true);
    } catch (e) { ref = null; }
  })();

  // ---------- Hilfen ----------
  const termIds = AP2.TERMS.map(t => t.id);
  const countOf = t => Object.keys(t.t).length;
  const prio = n => n >= 6 ? ["hot", "Sehr oft"] : n >= 4 ? ["mid", "Oft"] : ["low", "Gelegentlich"];
  AP2.prio = prio;
  const wisoTotal = w => Object.values(w.n).reduce((a, b) => a + b, 0);
  function daysLeft() {
    if (!state.examDate) return null;
    const d = new Date(state.examDate + "T08:00:00"); const now = new Date();
    return Math.ceil((d - now) / 86400000);
  }
  AP2.daysLeft = daysLeft;

  // ---------- Übersicht ----------
  function viewStart(el) {
    const dl = daysLeft();
    const top = AP2.TOPICS.slice().sort((a, b) => countOf(b) - countOf(a)).slice(0, 10);
    const cardIds = AP2.CARDS.map((c, i) => "c" + i);
    const known = cardIds.filter(id => (state.cards[id] || {}).box >= 3).length;
    const allChecks = AP2.TOPICS.length + AP2.WISO.length;
    const done = Object.values(state.checks).filter(Boolean).length;
    const tr = state.trainer; const qz = Object.values(state.quiz);
    const qOk = qz.filter(Boolean).length;
    el.innerHTML = `
      <div class="grid" style="gap:6px">
        <p class="eyebrow">Fachinformatiker Systemintegration · AO 2020</p>
        <h2>Deine AP2-Vorbereitung auf einen Blick</h2>
        <p class="lead">Ausgewertet aus 10 Prüfungsterminen (Winter 2021/22 bis Sommer 2026): welche Themen wie oft drankamen, Rechenaufgaben zum Üben, Lernkarten, WiSo-Quiz und der Notenrechner mit allen Bestehensregeln.</p>
      </div>
      <div class="grid g3">
        <div class="panel">
          <p class="eyebrow">Prüfungstermin</p>
          <label class="field" for="examDate">Datum der schriftlichen Prüfung
            <input type="date" id="examDate" value="${esc(state.examDate)}"></label>
          <div class="kpi">${dl === null ? "–" : dl < 0 ? "vorbei" : dl} <small>${dl === null ? "Datum eintragen" : dl < 0 ? "" : "Tage · " + Math.max(0, Math.floor(dl / 7)) + " Wochen"}</small></div>
        </div>
        <div class="panel">
          <p class="eyebrow">Dein Fortschritt</p>
          <div class="row"><span>Lernkarten sicher</span><span class="spacer"></span><b class="mono">${known}/${cardIds.length}</b></div>
          <div class="bar"><i style="width:${(known / cardIds.length * 100).toFixed(0)}%"></i></div>
          <div class="row"><span>Themen abgehakt</span><span class="spacer"></span><b class="mono">${done}/${allChecks}</b></div>
          <div class="bar"><i style="width:${(done / allChecks * 100).toFixed(0)}%"></i></div>
          <div class="row small muted"><span>Rechen-Trainer: ${tr.ok}/${tr.total} richtig</span><span class="spacer"></span><span>WiSo-Quiz: ${qOk}/${AP2.QUIZ.length}</span></div>
        </div>
        <div class="panel">
          <p class="eyebrow">Notenschlüssel IHK</p>
          <table class="small"><tbody>
            <tr><td>1 sehr gut</td><td class="num mono">100 – 92</td></tr>
            <tr><td>2 gut</td><td class="num mono">unter 92 – 81</td></tr>
            <tr><td>3 befriedigend</td><td class="num mono">unter 81 – 67</td></tr>
            <tr><td>4 ausreichend</td><td class="num mono">unter 67 – 50</td></tr>
            <tr><td>5 mangelhaft</td><td class="num mono">unter 50 – 30</td></tr>
            <tr><td>6 ungenügend</td><td class="num mono">unter 30 – 0</td></tr></tbody></table>
        </div>
      </div>
      <h3>So ist die Prüfung aufgebaut</h3>
      <div class="grid g4">
        ${[["Teil 1 (AP1)", "Einrichten eines IT-gestützten Arbeitsplatzes", "90 Min · bereits geschrieben", "20 %"],
           ["GA1", "Konzeption und Administration von IT-Systemen", "90 Min · 4 Aufgaben · 100 P", "10 %"],
           ["GA2", "Analyse und Entwicklung von Netzwerken", "90 Min · 4 Aufgaben · 100 P", "10 %"],
           ["WiSo", "Wirtschafts- und Sozialkunde", "60 Min · 30 Aufgaben · 100 P", "10 %"],
           ["Projekt", "Betriebliche Projektarbeit", "max. 40 h · Doku + 15 Min Präsentation + 15 Min Fachgespräch", "50 %"]]
          .map(p => `<div class="panel"><div class="row"><b>${p[0]}</b><span class="spacer"></span><span class="chip">${p[3]}</span></div><p class="small">${p[1]}</p><p class="small muted">${p[2]}</p></div>`).join("")}
      </div>
      <div class="grid g2">
        <div class="panel">
          <div class="row"><h3>Die 10 häufigsten Themen</h3><span class="spacer"></span><a href="#themen" class="small">Alle Themen</a></div>
          <ul class="clean">${top.map(t => { const n = countOf(t); const p = prio(n); return `<li class="row"><span class="chip ${t.part.toLowerCase()}">${t.part}</span><span style="flex:1;min-width:0">${esc(t.name)}</span><span class="chip ${p[0]}">${n}/10</span></li>`; }).join("")}</ul>
        </div>
        <div class="panel">
          <h3>Was du jetzt tun kannst</h3>
          <ul class="clean">
            <li><a href="#rechnen"><b>Rechen-Trainer</b></a> – Subnetting, IPv6, RAID, Verfügbarkeit, Übertragungszeit, WiSo-Rechnungen mit neuen Zahlen bei jedem Klick.</li>
            <li><a href="#karten"><b>Lernkarten</b></a> – ${AP2.CARDS.length} Karten mit Wiederholung nach dem Karteikasten-Prinzip.</li>
            <li><a href="#wiso"><b>WiSo-Quiz</b></a> – ${AP2.QUIZ.length} Fragen im IHK-Stil mit Erklärung.</li>
            <li><a href="#noten"><b>Notenrechner</b></a> – Gesamtnote, Bestehensregeln und was du in der mündlichen Ergänzungsprüfung brauchst.</li>
            <li><a href="#plan"><b>Lernplan</b></a> – Themen abhaken, Wochenplan bis zur Prüfung.</li>
          </ul>
        </div>
      </div>`;
    $("#examDate", el).addEventListener("change", e => { state.examDate = e.target.value; AP2.save(); viewStart(el); });
  }

  // ---------- Themen-Radar ----------
  let radarPart = "GA1", radarSel = null;
  function viewThemen(el) {
    const seg = `<div class="seg" role="group" aria-label="Prüfungsteil">${["GA1", "GA2", "WiSo"].map(p => `<button type="button" data-part="${p}" aria-pressed="${radarPart === p}">${p}</button>`).join("")}</div>`;
    let body = "";
    if (radarPart !== "WiSo") {
      const list = AP2.TOPICS.filter(t => t.part === radarPart).sort((a, b) => countOf(b) - countOf(a));
      if (!radarSel || !list.find(t => t.id === radarSel)) radarSel = list[0].id;
      const sel = list.find(t => t.id === radarSel);
      body = `
        <div class="panel"><div class="scroll"><table class="heat">
          <thead><tr><th>Thema</th>${AP2.TERMS.map(t => `<th class="term" title="${t.label}">${t.id}${t.src === "scan" ? "*" : t.src === "inoff" ? "°" : ""}</th>`).join("")}<th class="num">Σ</th></tr></thead>
          <tbody>${list.map(t => { const n = countOf(t); const p = prio(n); return `<tr class="topic${t.id === radarSel ? " sel" : ""}" data-id="${t.id}" tabindex="0"><td>${esc(t.name)}</td>${termIds.map(id => `<td class="c"><span class="${t.t[id] ? "on" : ""}" title="${t.t[id] ? esc(id + ": " + t.t[id]) : ""}"></span></td>`).join("")}<td class="num"><span class="chip ${p[0]}">${n}</span></td></tr>`; }).join("")}</tbody>
        </table></div>
        <p class="small muted">* Termin nur als Scan im Repo – Themen aus den Repo-Lernkapiteln übernommen. ° Musterlösung Sommer 2026 ist kein offizielles ZPA-Dokument. Zeile anklicken für Details.</p></div>
        <div class="panel" id="topicDetail">
          <div class="row"><span class="chip ${sel.part.toLowerCase()}">${sel.part}</span><h3>${esc(sel.name)}</h3><span class="spacer"></span><span class="chip ${prio(countOf(sel))[0]}">${prio(countOf(sel))[1]} · ${countOf(sel)}/10</span></div>
          <div class="grid g2">
            <div><p class="eyebrow">So wurde es gefragt</p><ul class="clean small">${termIds.filter(id => sel.t[id]).map(id => `<li><b class="mono">${id}</b> ${esc(sel.t[id])}</li>`).join("")}</ul></div>
            <div><p class="eyebrow">Das musst du können</p><ul class="facts small">${sel.f.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
          </div>
          <div class="row"><a class="btn primary" href="#t-${sel.id}">Lektion starten →</a><label class="row small"><input type="checkbox" id="chkTopic" ${state.checks[sel.id] ? "checked" : ""}> Thema sitzt – abhaken</label></div>
        </div>`;
    } else {
      const max = Math.max(...AP2.WISO.map(wisoTotal));
      body = `<div class="panel"><p class="small muted">Grundlage: 80 von 90 Fragen aus Sommer 2022, Sommer 2024 und Winter 2025/26 (die drei WiSo-Prüfungen mit lesbarem Text) – je Prüfung 30 Aufgaben in 60 Minuten.</p>
        <ul class="clean">${AP2.WISO.slice().sort((a, b) => wisoTotal(b) - wisoTotal(a)).map(w => `
          <li><details><summary class="row" style="display:flex"><span style="flex:1;min-width:0">${esc(w.name)}</span><span class="mono small">${wisoTotal(w)} Fragen</span></summary>
            <div class="bar" style="margin:8px 0"><i style="width:${(wisoTotal(w) / max * 100).toFixed(0)}%"></i></div>
            <p class="small muted">${Object.entries(w.n).map(([k, v]) => k + ": " + v).join(" · ")}</p>
            <ul class="facts small" style="margin-top:6px">${w.f.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
            <a class="btn sm primary" style="margin-top:8px;display:inline-block" href="#t-${w.id}">Lektion starten →</a></details></li>`).join("")}</ul></div>`;
    }
    el.innerHTML = `<div class="row"><div class="grid" style="gap:4px"><p class="eyebrow">Themen-Radar</p><h2>Was kam wann dran?</h2></div><span class="spacer"></span>${seg}</div>${body}`;
    el.querySelectorAll("[data-part]").forEach(b => b.addEventListener("click", () => { radarPart = b.dataset.part; viewThemen(el); }));
    el.querySelectorAll("tr.topic").forEach(tr => {
      const pick = () => { radarSel = tr.dataset.id; viewThemen(el); $("#topicDetail", el).scrollIntoView({ block: "nearest" }); };
      tr.addEventListener("click", pick); tr.addEventListener("keydown", e => { if (e.key === "Enter") pick(); });
    });
    const c = $("#chkTopic", el);
    if (c) c.addEventListener("change", () => { state.checks[radarSel] = c.checked; AP2.save(); });
  }

  // ---------- Archiv ----------
  let archTerm = "W25";
  function folder(id) { return "AP-2-20" + id.slice(1) + "-" + (id[0] === "W" ? "Winter" : "Sommer"); }
  function viewArchiv(el) {
    const t = AP2.TERMS.find(x => x.id === archTerm); const a = AP2.ARCHIVE[archTerm];
    const srcNote = t.src === "scan" ? "Dieser Termin liegt im Repo nur als Scan vor. Die Aufgabenthemen stammen aus den Repo-Lernkapiteln, Punkte sind nicht erfasst." : t.src === "inoff" ? "Die Musterlösung zu Sommer 2026 ist kein offizielles ZPA-Dokument (anderes Layout, keine Punkte). Inhalte mit Vorsicht nutzen." : "Aufgaben und Punkte aus den offiziellen Lösungshinweisen.";
    const list = rows => `<ul class="clean">${rows.map((r, i) => `<li class="row" style="align-items:flex-start"><b class="mono">${i + 1}.</b><span style="flex:1;min-width:0">${esc(r[0])}</span>${r[1] ? `<span class="chip">${r[1]} P</span>` : ""}</li>`).join("")}</ul>`;
    el.innerHTML = `
      <div class="grid" style="gap:4px"><p class="eyebrow">Prüfungsarchiv</p><h2>Alle 10 Termine im Überblick</h2></div>
      <div class="trainer-list">${AP2.TERMS.map(x => `<button type="button" data-term="${x.id}" aria-pressed="${x.id === archTerm}">${x.label}</button>`).join("")}</div>
      <div class="note">${srcNote} Die PDFs findest du lokal im Ordner <span class="mono">IHK-Abschlusspruefungen-AP2-FiSi-AO2020/${folder(archTerm)}/</span> (Lösungen im Unterordner <span class="mono">Loesungen/</span>).</div>
      <div class="grid g2">
        <div class="panel"><div class="row"><span class="chip ga1">GA1</span><h3>Konzeption & Administration</h3></div>${list(a.ga1)}</div>
        <div class="panel"><div class="row"><span class="chip ga2">GA2</span><h3>Analyse & Entwicklung von Netzwerken</h3></div>${list(a.ga2)}</div>
      </div>
      <div class="panel flat small"><b>So übst du mit dem Archiv:</b> Termin wählen, die echte PDF aus dem Ordner drucken, 90 Minuten Wecker stellen, ohne Hilfe bearbeiten, dann mit den Lösungshinweisen selbst korrigieren und die Punkte im <a href="#noten">Notenrechner</a> eintragen.</div>`;
    el.querySelectorAll("[data-term]").forEach(b => b.addEventListener("click", () => { archTerm = b.dataset.term; viewArchiv(el); }));
  }

  // ---------- Lernplan ----------
  function viewPlan(el) {
    const items = AP2.TOPICS.map(t => ({ id: t.id, part: t.part, name: t.name, n: countOf(t) }))
      .concat(AP2.WISO.map(w => ({ id: w.id, part: "WiSo", name: w.name, n: Math.min(10, Math.round(wisoTotal(w) / 1.3)) })))
      .sort((a, b) => b.n - a.n);
    const open = items.filter(i => !state.checks[i.id]);
    const dl = daysLeft();
    const weeks = dl === null ? 6 : Math.max(1, Math.floor(dl / 7));
    const learnWeeks = Math.max(1, weeks - 1);
    const per = Math.ceil(open.length / learnWeeks);
    const plan = [];
    for (let w = 0; w < learnWeeks; w++) { const chunk = open.slice(w * per, (w + 1) * per); if (chunk.length) plan.push(chunk); }
    const group = p => items.filter(i => i.part === p).map(i => { const pr = prio(i.n); return `<label class="check${state.checks[i.id] ? " done" : ""}"><input type="checkbox" data-chk="${i.id}" ${state.checks[i.id] ? "checked" : ""}><span class="t" style="flex:1">${esc(i.name)}</span><span class="chip ${pr[0]}">${pr[1]}</span></label>`; }).join("");
    el.innerHTML = `
      <div class="grid" style="gap:4px"><p class="eyebrow">Lernplan</p><h2>Themen abhaken und Wochen planen</h2>
      <p class="lead">${dl === null ? "Kein Prüfungsdatum eingetragen – der Plan rechnet mit 6 Wochen. Trag das Datum in der <a href=\"#start\">Übersicht</a> ein." : `Noch ${Math.max(0, dl)} Tage. Offene Themen werden nach Häufigkeit auf ${learnWeeks} Lernwoche(n) verteilt, die letzte Woche ist für Probeprüfungen.`}</p></div>
      <div class="panel">
        <h3>Wochenplan</h3>
        ${open.length === 0 ? `<p>Alle Themen abgehakt. Jetzt nur noch Probeprüfungen unter Zeitdruck.</p>` : `<ol style="margin:0;padding-left:20px;display:grid;gap:8px">${plan.map((c, i) => `<li><b>Woche ${i + 1}:</b> ${c.map(x => esc(x.name)).join(" · ")}</li>`).join("")}<li><b>Letzte Woche:</b> je eine komplette Prüfung GA1, GA2 und WiSo unter Echtzeit aus dem <a href="#archiv">Archiv</a>, danach nur Lücken wiederholen.</li></ol>`}
      </div>
      <div class="grid g3">
        <div class="panel"><div class="row"><span class="chip ga1">GA1</span><h3>Konzeption & Administration</h3></div>${group("GA1")}</div>
        <div class="panel"><div class="row"><span class="chip ga2">GA2</span><h3>Netzwerke</h3></div>${group("GA2")}</div>
        <div class="panel"><div class="row"><span class="chip wiso">WiSo</span><h3>Wirtschaft & Soziales</h3></div>${group("WiSo")}</div>
      </div>`;
    el.querySelectorAll("[data-chk]").forEach(c => c.addEventListener("change", () => { state.checks[c.dataset.chk] = c.checked; AP2.save(); viewPlan(el); }));
  }

  // ---------- Tipps ----------
  function viewTipps(el) {
    el.innerHTML = `
      <div class="grid" style="gap:4px"><p class="eyebrow">Prüfungstipps</p><h2>Punkte holen, die andere liegen lassen</h2></div>
      <div class="grid g2">
        <div class="panel"><h3>Operatoren richtig lesen</h3><div class="scroll"><table class="small"><tbody>
          <tr><td><b>Nennen</b></td><td>Begriff ohne Erklärung, Stichwort reicht.</td></tr>
          <tr><td><b>Beschreiben</b></td><td>Sachverhalt in eigenen Worten darstellen.</td></tr>
          <tr><td><b>Erklären / Erläutern</b></td><td>Beschreiben + Grund oder Beispiel. Ohne Beispiel fehlen oft Punkte.</td></tr>
          <tr><td><b>Begründen</b></td><td>Entscheidung mit Argument stützen („…, weil …“).</td></tr>
          <tr><td><b>Berechnen</b></td><td>Rechenweg aufschreiben, Einheiten angeben – Folgefehler werden gewertet.</td></tr>
          <tr><td><b>Vergleichen / Abgrenzen</b></td><td>Beide Seiten zum selben Kriterium gegenüberstellen.</td></tr></tbody></table></div></div>
        <div class="panel"><h3>Zeit einteilen</h3><ul class="facts small">
          <li>GA1/GA2: 90 Minuten für 100 Punkte ≈ <b>0,9 Minuten pro Punkt</b>. Eine 25-Punkte-Aufgabe ≈ 22 Minuten.</li>
          <li>WiSo: 60 Minuten für 30 Aufgaben = <b>2 Minuten pro Aufgabe</b>, je 3,33 Punkte.</li>
          <li>Erst alle Aufgaben überfliegen, mit der sichersten anfangen.</li>
          <li>Bei Teilaufgaben, die aufeinander aufbauen: lieber mit einem angenommenen Wert weiterrechnen als leer lassen.</li></ul></div>
        <div class="panel"><h3>Bearbeitungsregeln aus den Aufgabensätzen</h3><ul class="facts small">
          <li>Werden z. B. drei Angaben verlangt, zählen nur die ersten drei.</li>
          <li>Stichworte sind erlaubt, wenn keine ganzen Sätze verlangt sind.</li>
          <li>Nur Eintragungen im Aufgabensatz bzw. Lösungsbogen werden bewertet.</li>
          <li>Nicht programmierbarer, netzunabhängiger Taschenrechner ist erlaubt.</li>
          <li>Mit gerundeten Zwischenergebnissen weiterrechnen.</li>
          <li>WiSo: Kennziffern im Lösungsbogen eintragen, bei Zuordnungen von links nach rechts.</li></ul></div>
        <div class="panel"><h3>Einheiten-Falle</h3><ul class="facts small">
          <li>Speicher in den Aufgaben: binär. 1 KiB = 1.024 Byte, 1 MiB = 1.024 KiB, 1 GiB = 1.024 MiB.</li>
          <li>Bandbreite: dezimal. 1 Mbit/s = 1.000.000 bit/s.</li>
          <li>Byte → Bit: × 8. Ein Jahr = 8.760 Stunden.</li>
          <li>Beispiel: 1.634 MiB über 16 Mbit/s = 1.634 × 1.024 × 1.024 × 8 ÷ 16.000.000 ≈ 857 s ≈ 14 min 17 s.</li></ul></div>
      </div>
      <div class="panel"><h3>Hinweise zu den Lernkapiteln im Repo (Ordner Tuts)</h3>
        <p class="small muted">Die Kapitel sind eine gute Themenübersicht, enthalten aber einige Fehler. Verlass dich bei Rechnungen auf die offiziellen Lösungshinweise:</p>
        <ul class="facts small">
          <li>L28: „16 TiB in KiB braucht mindestens 64 Bit (long)“ – laut offizieller Lösung Winter 2021/22 sind es <b>34 Bit</b> (16 TiB = 2^34 KiB). Die Angabe „int max 2.147.483.647 Bit“ ist ebenfalls falsch (das ist ein Zahlenwert, keine Bitzahl).</li>
          <li>L29: Die Formel zur Download-Zeit ist falsch. Richtig: Größe in MiB × 1.024 × 1.024 × 8 ÷ Bandbreite in bit/s (100 MiB über 10 Mbit/s ≈ 84 s).</li>
          <li>L28: USV-Umschaltzeiten „RTO ≈ 200–400 ms“ und „PTO“ sind keine üblichen Begriffe. RTO/RPO gehören zu Backup/Wiederherstellung.</li>
          <li>List.md stuft SQL als „fast jedes Mal“ ein – SQL-Abfragen kamen aber nur 2021/22 bis Winter 2022/23 dran, danach nur noch Datenbank-Konzepte (Winter 2025/26).</li>
        </ul></div>
      <div class="panel flat small"><b>Quellen und Grenzen:</b> Themen und Punkte stammen aus den PDFs im Repo (Text bzw. Lösungshinweise). Die Gewichtungen und Bestehensregeln im Notenrechner folgen der Fachinformatiker-Ausbildungsverordnung 2020. Die Seiten ausbildung-in-der-it.de/notenrechner und /ihk-notenschluessel konnten beim Erstellen nicht abgerufen werden. Rundungsregeln können je IHK leicht abweichen.</div>`;
  }

  // ---------- Router ----------
  const views = { start: viewStart, themen: viewThemen, archiv: viewArchiv, plan: viewPlan, tipps: viewTipps };
  AP2.views = views;
  function current() { const h = (location.hash || "#start").slice(1); if (/^t-[a-z0-9-]+$/.test(h)) return "lektion"; return document.querySelector(`[data-view="${h}"]`) ? h : "start"; }
  function render() {
    const v = current(), tabV = v === "lektion" ? "plan" : v;
    document.querySelectorAll("section.view").forEach(s => { s.hidden = s.dataset.view !== v; });
    document.querySelectorAll("#tabs a").forEach(a => { if (a.getAttribute("href") === "#" + tabV) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    const el = document.querySelector(`[data-view="${v}"]`);
    if (views[v]) views[v](el);
    const tab = document.querySelector(`#tabs a[href="#${v}"]`); if (tab) tab.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  AP2.render = render;
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
  document.addEventListener("DOMContentLoaded", render);
  if (document.readyState !== "loading") setTimeout(render, 0);
})();
