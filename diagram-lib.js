// Zeichenwerkzeuge für Lektions-Diagramme (Netzpläne, Abläufe, Schichten, Organigramme)
(function () {
  const T = AP2.T, D = AP2.D = {};
  D.svg = T.svg; D.t = T.text; D.r = T.rect; D.l = T.line;
  AP2.LESSONS = AP2.LESSONS || {};

  // Kasten mit (mehrzeiligem) Text, mittig
  D.box = function (x, y, w, h, label, c = "f-box", o = {}) {
    const lines = String(label).split("\n"), fs = o.fs || 12, lh = fs * 1.25;
    const tc = o.tc || (c === "f-acc" ? "t f-acc-t" : "t");
    let s = T.rect(x, y, w, h, c, o.rx != null ? o.rx : 6);
    const y0 = y + h / 2 - (lines.length - 1) * lh / 2 + fs * 0.36;
    lines.forEach((ln, i) => { s += T.text(x + w / 2, y0 + i * lh, ln, { a: "middle", c: tc, fs, w: i === 0 && o.bold !== false ? (o.w || 600) : 400 }); });
    return s;
  };

  // Pfeil mit Spitze (optional beidseitig, gestrichelt, beschriftet)
  D.arrow = function (x1, y1, x2, y2, o = {}) {
    const c = (o.c || "s-line") + (o.dash ? " s-dash" : ""), head = o.c === "s-acc" ? "f-acc" : o.c === "s-bad" ? "f-badsolid" : o.c === "s-good" ? "f-goodsolid" : "f-muted";
    const a = Math.atan2(y2 - y1, x2 - x1), hl = 8, hw = 4.5;
    const tip = (x, y, ang) => `<polygon points="${x},${y} ${x - hl * Math.cos(ang) + hw * Math.sin(ang)},${y - hl * Math.sin(ang) - hw * Math.cos(ang)} ${x - hl * Math.cos(ang) - hw * Math.sin(ang)},${y - hl * Math.sin(ang) + hw * Math.cos(ang)}" class="${head}"/>`;
    const ex = x2 - (hl - 1) * Math.cos(a), ey = y2 - (hl - 1) * Math.sin(a);
    const sx = o.both ? x1 + (hl - 1) * Math.cos(a) : x1, sy = o.both ? y1 + (hl - 1) * Math.sin(a) : y1;
    let s = `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" class="${c}"/>` + tip(x2, y2, a) + (o.both ? tip(x1, y1, a + Math.PI) : "");
    if (o.label) s += T.text((x1 + x2) / 2 + (o.lx || 0), (y1 + y2) / 2 + (o.ly != null ? o.ly : -6), o.label, { a: o.la || "middle", fs: o.fs || 11, c: o.lc || "t" });
    return s;
  };

  // Netzwerk-Symbole, Mittelpunkt (x, y), Beschriftung darunter
  D.node = function (x, y, kind, label, o = {}) {
    let s = "", ly = y + 34;
    if (kind === "pc") { s += T.rect(x - 24, y - 18, 48, 30, o.c || "f-box", 3) + T.rect(x - 6, y + 12, 12, 5, "f-muted", 1) + T.rect(x - 14, y + 17, 28, 3, "f-muted", 1); ly = y + 34; }
    else if (kind === "server") { s += T.rect(x - 20, y - 26, 40, 52, o.c || "f-box", 4); for (let i = 0; i < 3; i++) s += T.line(x - 14, y - 14 + i * 12, x + 14, y - 14 + i * 12); ly = y + 42; }
    else if (kind === "router") { s += `<circle cx="${x}" cy="${y}" r="20" class="${o.c || "f-net"}"/>` + T.text(x, y + 4, "R", { a: "middle", w: 700 }); ly = y + 36; }
    else if (kind === "switch") { s += T.rect(x - 38, y - 12, 76, 24, o.c || "f-net", 4); for (let i = 0; i < 6; i++) s += T.rect(x - 30 + i * 11, y - 3, 6, 6, "f-box", 1); ly = y + 28; }
    else if (kind === "fw") { s += T.rect(x - 28, y - 22, 56, 44, o.c || "f-bad", 4); for (let i = 1; i < 3; i++) s += T.line(x - 28, y - 22 + i * 14.6, x + 28, y - 22 + i * 14.6, "s-bad"); s += T.line(x, y - 22, x, y - 7.4, "s-bad") + T.line(x - 12, y - 7.4, x - 12, y + 7.2, "s-bad") + T.line(x + 12, y - 7.4, x + 12, y + 7.2, "s-bad") + T.line(x, y + 7.2, x, y + 22, "s-bad"); ly = y + 38; }
    else if (kind === "cloud") { s += `<ellipse cx="${x}" cy="${y}" rx="${o.rx || 58}" ry="26" class="${o.c || "f-sub"}"/>` + T.text(x, y + 4, label, { a: "middle", w: 600 }); return s; }
    else if (kind === "ap") { s += `<circle cx="${x}" cy="${y + 6}" r="12" class="${o.c || "f-net"}"/>` + `<path d="M${x - 16},${y - 10} Q${x},${y - 26} ${x + 16},${y - 10}" class="s-line"/><path d="M${x - 24},${y - 16} Q${x},${y - 38} ${x + 24},${y - 16}" class="s-line"/>`; ly = y + 32; }
    else if (kind === "user") { s += `<circle cx="${x}" cy="${y - 12}" r="8" class="${o.c || "f-box"}"/><path d="M${x - 15},${y + 14} Q${x},${y - 10} ${x + 15},${y + 14} Z" class="${o.c || "f-box"}"/>`; ly = y + 30; }
    if (label) String(label).split("\n").forEach((ln, i) => { s += T.text(x, ly + i * 13, ln, { a: "middle", fs: o.fs || 11, w: i === 0 ? 600 : 400, c: i === 0 ? "t" : "tm" }); });
    return s;
  };

  // Sequenzdiagramm: Teilnehmer oben, Nachrichten als Pfeile von oben nach unten
  D.seq = function (actors, msgs, o = {}) {
    const W = o.w || 660, n = actors.length, colW = (W - 20) / n, x = i => 10 + colW * (i + 0.5), top = 10, rowH = o.rowH || 38;
    const H = top + 50 + msgs.length * rowH + 10; let s = "";
    actors.forEach((a, i) => { const bw = Math.min(colW - 14, 150); s += D.box(x(i) - bw / 2, top, bw, 34, a, i === (o.hi != null ? o.hi : -1) ? "f-net" : "f-box", { fs: 11.5 }) + `<line x1="${x(i)}" y1="${top + 34}" x2="${x(i)}" y2="${H - 6}" class="s-line s-dash"/>`; });
    msgs.forEach((m, k) => { const [f, t, lab, opt] = m, y = top + 64 + k * rowH, txt = (o.num !== false ? (k + 1) + ". " : "") + lab;
      if (f === t) { const xx = x(f); s += `<path d="M${xx},${y - 8} h28 v16 h-20" class="s-line"/>` + D.arrow(xx + 10, y + 8, xx + 1, y + 8) + T.text(xx + 36, y + 4, txt, { fs: 11 }); }
      else s += D.arrow(x(f), y, x(t), y, { c: opt && opt.c || "s-acc", dash: opt && opt.dash, label: txt, fs: 11 }); });
    return D.svg(W, H, s, o.label || "Ablaufdiagramm");
  };

  // Schichtenstapel: Spalten mit Schichten von unten nach oben
  D.stacks = function (cols, o = {}) {
    const cw = o.cw || 150, gap = 18, lh = o.lh || 30, maxL = Math.max(...cols.map(c => c.layers.length)), H = 40 + maxL * (lh + 4) + (o.legend ? 34 : 8);
    let s = "";
    cols.forEach((c, i) => {
      const x = 10 + i * (cw + gap); s += T.text(x + cw / 2, 20, c.title, { a: "middle", w: 700 });
      c.layers.forEach((L, j) => { const y = 40 + (maxL - c.layers.length + (c.layers.length - 1 - j)) * (lh + 4); const parts = L.split ? L.split : [L]; const pw = (cw - (parts.length - 1) * 4) / parts.length;
        parts.forEach((p, k) => { s += D.box(x + k * (pw + 4), y, pw, lh, p.t, p.c || "f-box", { fs: 11, bold: p.b !== false }); }); });
    });
    if (o.legend) { let lx = 10; const ly = H - 14; o.legend.forEach(([c, t]) => { s += T.rect(lx, ly - 10, 12, 12, c, 2) + T.text(lx + 18, ly, t, { fs: 11 }); lx += 26 + t.length * 6.8; }); }
    return D.svg(10 + cols.length * (cw + gap), H, s, o.label || "Schichtenmodell");
  };

  // Ablauf von links nach rechts (Kästen mit Pfeilen), umbricht nicht
  D.flowH = function (steps, o = {}) {
    const bw = o.bw || 118, bh = o.bh || 54, gap = o.gap || 26; let s = "";
    steps.forEach((st, i) => { const x = 10 + i * (bw + gap); s += D.box(x, 14, bw, bh, st.t || st, st.c || (i === steps.length - 1 && o.lastAcc ? "f-acc" : "f-box"), { fs: 11 }); if (i < steps.length - 1) s += D.arrow(x + bw + 2, 14 + bh / 2, x + bw + gap - 2, 14 + bh / 2); if (st.n) s += T.text(x + bw / 2, 14 + bh + 16, st.n, { a: "middle", c: "tm", fs: 10.5 }); });
    return D.svg(20 + steps.length * (bw + gap) - gap, 14 + bh + (steps.some(x => x.n) ? 30 : 14), s, o.label || "Ablauf");
  };

  // Organigramm aus Ebenen: [{id, t, parent, c, staff}] – Stabsstellen seitlich
  D.org = function (nodes, o = {}) {
    const W = o.w || 640, bw = o.bw || 104, bh = 34, lv = {}, byId = {}; let s = "";
    nodes.forEach(n => { byId[n.id] = n; n.lv = n.parent ? byId[n.parent].lv + (n.staff ? 0 : 1) : 0; (lv[n.lv] = lv[n.lv] || []).push(n); });
    Object.keys(lv).forEach(k => { const row = lv[k].filter(n => !n.staff); row.forEach((n, i) => { n.x = W * (i + 1) / (row.length + 1); n.y = 14 + k * 64; }); lv[k].filter(n => n.staff).forEach(n => { const p = byId[n.parent]; n.x = p.x + bw + 50; n.y = p.y; }); });
    nodes.forEach(n => { if (n.parent) { const p = byId[n.parent]; if (n.staff) s += `<line x1="${p.x + bw / 2}" y1="${n.y + bh / 2}" x2="${n.x - bw / 2}" y2="${n.y + bh / 2}" class="s-line s-dash"/>`; else s += `<polyline points="${p.x},${p.y + bh} ${p.x},${(p.y + bh + n.y) / 2} ${n.x},${(p.y + bh + n.y) / 2} ${n.x},${n.y}" class="s-line"/>`; } (n.extra || []).forEach(e => { s += `<polyline points="${byId[e].x},${byId[e].y + bh} ${byId[e].x},${n.y - 10} ${n.x + 8},${n.y - 10} ${n.x + 8},${n.y}" class="s-acc s-dash"/>`; }); });
    nodes.forEach(n => { s += D.box(n.x - bw / 2, n.y, bw, bh, n.t, n.c || (n.staff ? "f-host" : "f-box"), { fs: 11 }); });
    const H = Math.max(...nodes.map(n => n.y)) + bh + 10;
    return D.svg(W, H, s, o.label || "Organigramm");
  };
})();
