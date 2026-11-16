// Hilfsfunktionen und Zeichenwerkzeuge für den Rechen-Trainer
(function () {
  const T = AP2.T = {};
  AP2.GEN = AP2.GEN || {};
  T.R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  T.pick = a => a[T.R(0, a.length - 1)];
  T.de = (x, d = 2) => Number(x).toLocaleString("de-DE", { maximumFractionDigits: d });
  T.ip2n = s => s.split(".").reduce((a, o) => a * 256 + (+o), 0);
  T.n2ip = n => [Math.floor(n / 16777216) % 256, Math.floor(n / 65536) % 256, Math.floor(n / 256) % 256, n % 256].join(".");
  T.maskN = p => 4294967296 - Math.pow(2, 32 - p);
  T.pad2 = n => String(n).padStart(2, "0");
  T.dstr = d => T.pad2(d.getDate()) + "." + T.pad2(d.getMonth() + 1) + "." + d.getFullYear();
  T.octets = n => T.n2ip(n).split(".").map(Number);
  T.bin = (n, len) => n.toString(2).padStart(len, "0");

  T.parse6 = function (s) {
    s = String(s).trim().toLowerCase().replace(/\/\d+$/, "");
    if (!/^[0-9a-f:]+$/.test(s)) return null;
    const parts = s.split("::"); if (parts.length > 2) return null;
    const h = parts[0] ? parts[0].split(":") : []; const t = parts.length === 2 && parts[1] ? parts[1].split(":") : [];
    const fill = parts.length === 2 ? 8 - h.length - t.length : 0;
    const all = h.concat(Array(Math.max(0, fill)).fill("0"), t);
    if (all.length !== 8 || all.some(x => !/^[0-9a-f]{1,4}$/.test(x))) return null;
    return all.reduce((a, x) => (a << 16n) + BigInt(parseInt(x, 16)), 0n);
  };
  T.hextets = b => { const hx = []; for (let i = 7; i >= 0; i--) hx.push(Number((b >> BigInt(i * 16)) & 0xffffn)); return hx; };
  T.fmt6 = function (b) {
    const hx = T.hextets(b).map(x => x.toString(16));
    let bs = -1, bl = 0;
    for (let i = 0; i < 8;) { if (hx[i] === "0") { let j = i; while (j < 8 && hx[j] === "0") j++; if (j - i > bl && j - i >= 2) { bs = i; bl = j - i; } i = j; } else i++; }
    if (bs < 0) return hx.join(":");
    return hx.slice(0, bs).join(":") + "::" + hx.slice(bs + bl).join(":");
  };

  // ---------- SVG ----------
  const X = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  T.X = X;
  T.svg = (w, h, inner, label) => `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;min-width:${Math.min(w, 520)}px" role="img" aria-label="${X(label)}">${inner}</svg>`;
  T.text = (x, y, s, o = {}) => `<text x="${x}" y="${y}" class="${o.c || "t"}" text-anchor="${o.a || "start"}"${o.fs ? ` font-size="${o.fs}"` : ""}${o.w ? ` font-weight="${o.w}"` : ""}>${X(s)}</text>`;
  T.rect = (x, y, w, h, c, rx = 4) => `<rect x="${x}" y="${y}" width="${Math.max(0, w)}" height="${h}" rx="${rx}" class="${c}"/>`;
  T.line = (x1, y1, x2, y2, c = "s-line") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${c}"/>`;
  T.arrowR = (x1, y, x2, c = "s-line") => T.line(x1, y, x2 - 5, y, c) + `<polygon points="${x2},${y} ${x2 - 7},${y - 4} ${x2 - 7},${y + 4}" class="${c === "s-acc" ? "f-acc" : "f-muted"}"/>`;

  // Rechenkette: [{v, s}] Kästen und "× 1.024" Operatoren dazwischen. Letzter Kasten = Ergebnis.
  T.chain = function (items, label, maxW = 680) {
    const cw = 7.3, rowH = 74; let x = 8, row = 0, out = "", used = 0;
    items.forEach((it, i) => {
      const isBox = typeof it === "object";
      const w = isBox ? Math.max(String(it.v).length * cw * 1.05, String(it.s || "").length * 6.2) + 22 : String(it).length * cw + 30;
      if (x + w > maxW - 4 && x > 8) { x = 8; row++; }
      const y = 10 + row * rowH;
      if (isBox) {
        const last = i === items.length - 1;
        out += T.rect(x, y, w, 46, last ? "f-acc" : "f-box", 7);
        out += T.text(x + w / 2, y + 20, it.v, { a: "middle", c: last ? "t f-acc-t" : "t", w: 600 });
        if (it.s) out += T.text(x + w / 2, y + 37, it.s, { a: "middle", c: last ? "t f-acc-t" : "tm", fs: 10.5 });
      } else {
        out += T.text(x + w / 2, y + 18, it, { a: "middle", c: "t", w: 600 });
        out += T.arrowR(x + 6, y + 28, x + w - 6);
      }
      x += w + 6; used = Math.max(used, x);
    });
    return T.svg(Math.max(320, Math.ceil(used + 4)), 10 + (row + 1) * rowH - 14, out, label);
  };
})();
