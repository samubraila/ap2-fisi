// GA2-Rechenaufgaben: Subnetting, VLSM, IPv6, Verfügbarkeit, Übertragungszeit
(function () {
  const T = AP2.T, { R, pick, de, n2ip, ip2n, maskN, bin } = T;

  // ---------- IPv4-Subnetting ----------
  AP2.GEN.subnet = { part: "GA2", label: "IPv4-Subnetting",
    howto: `<p><b>Idee:</b> Eine IPv4-Adresse hat 32 Bit. Das Präfix (z. B. /26) sagt, wie viele Bit von links zum <b>Netz</b> gehören. Der Rest sind <b>Host-Bits</b>.</p>
      <ol><li>Host-Bits = 32 − Präfix. Adressen = 2<sup>Host-Bits</sup>, nutzbar = 2<sup>Host-Bits</sup> − 2 (Netz-ID und Broadcast fallen weg).</li>
      <li>Suche das <b>interessante Oktett</b>: dort liegt die Grenze zwischen Netz und Host (/24–/32 → 4. Oktett, /16–/23 → 3. Oktett).</li>
      <li><b>Blockgröße</b> = 256 − Maskenwert in diesem Oktett. Netze beginnen bei 0, 1×Block, 2×Block …</li>
      <li><b>Netz-ID</b> = größtes Vielfaches der Blockgröße, das ≤ dem Host-Wert ist. <b>Broadcast</b> = nächste Netz-ID − 1.</li>
      <li>Erster Host = Netz-ID + 1, letzter Host = Broadcast − 1.</li></ol>
      <div class="scroll"><table class="small mono"><tbody><tr><th>Präfix im Oktett</th><td>/17 /25</td><td>/18 /26</td><td>/19 /27</td><td>/20 /28</td><td>/21 /29</td><td>/22 /30</td><td>/23 /31</td></tr>
      <tr><th>Maskenwert</th><td>128</td><td>192</td><td>224</td><td>240</td><td>248</td><td>252</td><td>254</td></tr>
      <tr><th>Blockgröße</th><td>128</td><td>64</td><td>32</td><td>16</td><td>8</td><td>4</td><td>2</td></tr></tbody></table></div>
      <p><b>Mini-Beispiel:</b> 192.168.1.77/26 → Maske 255.255.255.192 → Block 64 → Netze 0, 64, 128 … → 77 liegt in 64–127 → Netz-ID .64, Broadcast .127, 62 Hosts.</p>
      <p><b>Typische Fehler:</b> „− 2“ vergessen. Blockgröße im falschen Oktett. Bei /20–/23 ist das 4. Oktett der Netz-ID immer 0 und des Broadcasts immer 255.</p>`,
    make() {
      const p = R(20, 29);
      const host = pick([() => `10.${R(0, 255)}.${R(0, 255)}.${R(1, 254)}`, () => `172.${R(16, 31)}.${R(0, 255)}.${R(1, 254)}`, () => `192.168.${R(0, 255)}.${R(1, 254)}`])();
      const size = Math.pow(2, 32 - p); let ip = ip2n(host); const net = Math.floor(ip / size) * size; const bc = net + size - 1;
      if (ip === net) ip++; if (ip === bc) ip--;
      const oct = p >= 24 ? 4 : 3, oi = oct - 1, block = Math.pow(2, (oct === 4 ? 32 : 24) - p), mv = 256 - block;
      const hv = T.octets(ip)[oi], start = Math.floor(hv / block) * block;
      const steps = [
        `/${p} → 32 − ${p} = <b>${32 - p} Host-Bits</b> → 2<sup>${32 - p}</sup> = ${de(size, 0)} Adressen, davon <b>${de(size - 2, 0)} nutzbar</b>.`,
        `Maske: ${p} Einsen, danach ${32 - p} Nullen → <b>${n2ip(maskN(p))}</b>. Die Grenze liegt im <b>${oct}. Oktett</b> (Maskenwert ${mv}).`,
        `Blockgröße im ${oct}. Oktett: 256 − ${mv} = <b>${block}</b>. Netze beginnen dort bei 0, ${block}, ${2 * block}, ${3 * block} …`,
        `Der Host hat im ${oct}. Oktett den Wert <b>${hv}</b>. ${hv} ÷ ${block} = ${Math.floor(hv / block)} Rest ${hv % block} → das Netz beginnt bei ${Math.floor(hv / block)} × ${block} = <b>${start}</b>.${oct === 3 ? " Das 4. Oktett wird 0." : ""} → Netz-ID <b>${n2ip(net)}</b>`,
        `Broadcast = nächstes Netz (${start + block}) − 1 = ${start + block - 1}${oct === 3 ? ", 4. Oktett 255" : ""} → <b>${n2ip(bc)}</b>`,
        `Erster Host = Netz-ID + 1 = <b>${n2ip(net + 1)}</b>, letzter Host = Broadcast − 1 = <b>${n2ip(bc - 1)}</b>.`];
      const L = 92, C = 14, xb = i => L + i * C + Math.floor(i / 8) * 8, rows = [["Host-IP", ip], ["Maske", maskN(p)], ["Netz-ID", net], ["Broadcast", bc]];
      let g = "";
      for (let o = 0; o < 4; o++) g += T.text(xb(o * 8) + 4 * C, 14, (o + 1) + ". Oktett", { a: "middle", c: "tm", fs: 10.5 });
      rows.forEach(([name, val], r) => {
        const y = 22 + r * 28, bits = T.octets(val).map(o => bin(o, 8)).join("");
        g += T.text(L - 8, y + 15, name, { a: "end", w: 600 });
        for (let i = 0; i < 32; i++) { g += T.rect(xb(i), y, C - 1, 20, i < p ? "f-net" : "f-host", 2); g += T.text(xb(i) + (C - 1) / 2, y + 14, bits[i], { a: "middle", fs: 11 }); }
        g += T.text(xb(31) + C + 10, y + 15, n2ip(val), { w: r >= 2 ? 600 : 400 });
      });
      const bx = xb(p - 1) + C - 0.5 + (p % 8 === 0 ? 4 : 0);
      g += T.line(bx, 18, bx, 22 + 4 * 28, "s-acc") + T.text(bx, 138, "/" + p, { a: "middle", c: "t ta", w: 700 });
      g += T.rect(L, 150, 12, 12, "f-net", 2) + T.text(L + 18, 160, "Netzteil (bleibt gleich)", { fs: 11 }) + T.rect(L + 210, 150, 12, 12, "f-host", 2) + T.text(L + 228, 160, "Hostteil: Netz-ID = alle 0, Broadcast = alle 1", { fs: 11 });
      return { prompt: `Host <b class="mono">${n2ip(ip)}/${p}</b>. Bestimme die Adressdaten des Subnetzes.`,
        fields: [{ l: "Netz-ID", type: "ip", a: n2ip(net) }, { l: "Broadcast", type: "ip", a: n2ip(bc) }, { l: "Erster Host", type: "ip", a: n2ip(net + 1) }, { l: "Letzter Host", type: "ip", a: n2ip(bc - 1) }, { l: "Nutzbare Hosts", type: "num", a: size - 2, tol: 0 }, { l: "Subnetzmaske dezimal", type: "ip", a: n2ip(maskN(p)) }],
        steps, fig: T.svg(Math.ceil(xb(31) + C + 130), 172, g, "Adressen binär mit Netz- und Hostteil"), figCap: "Alle Adressen binär: links vom Strich der Netzteil, rechts der Hostteil." };
    } };

  // ---------- VLSM ----------
  AP2.GEN.vlsm = { part: "GA2", label: "VLSM",
    howto: `<p><b>Idee:</b> Jede Abteilung bekommt ein eigenes Netz, so groß wie nötig. Damit nichts überlappt, vergibst du <b>das größte Netz zuerst</b>.</p>
      <ol><li>Benötigte Adressen = Hosts + 2 (Netz-ID und Broadcast).</li>
      <li>Nächste Zweierpotenz suchen: 4, 8, 16, 32, 64, 128. Das ist die Blockgröße.</li>
      <li>Präfix aus der Blockgröße: 128 → /25, 64 → /26, 32 → /27, 16 → /28, 8 → /29, 4 → /30.</li>
      <li>Die Netze lückenlos hintereinander legen: das nächste Netz beginnt direkt nach dem Broadcast des vorherigen.</li></ol>
      <p><b>Mini-Beispiel:</b> 50 Hosts → 50 + 2 = 52 → nächste Zweierpotenz 64 → /26.</p>
      <p><b>Typische Fehler:</b> „+ 2“ vergessen (62 Hosts passen in /26, 63 nicht mehr). Kleine Netze zuerst vergeben – dann passen die großen nicht mehr auf eine gültige Grenze.</p>`,
    make() {
      const base = 192 * 16777216 + 168 * 65536 + R(0, 255) * 256;
      const hosts = [R(60, 120), R(25, 60), R(10, 28), R(3, 12)].sort((a, b) => b - a);
      const names = ["Vertrieb", "Technik", "Verwaltung", "Management"];
      let cur = base; const rows = hosts.map((h, i) => { let b = 4; while (b - 2 < h) b *= 2; const r = { n: names[i], h, net: cur, p: 32 - Math.log2(b), b }; cur += b; return r; });
      const steps = rows.map(r => `<b>${r.n}:</b> ${r.h} + 2 = ${r.h + 2} Adressen → nächste Zweierpotenz <b>${r.b}</b> → /${r.p} → ${n2ip(r.net)} bis ${n2ip(r.net + r.b - 1)}`);
      steps.push(`Frei bleibt: .${(cur - base)} bis .255 (${256 - (cur - base)} Adressen) für spätere Netze.`);
      const W = 680, x0 = 20, sc = 640 / 256; let g = "";
      g += T.rect(x0, 26, 640, 40, "f-sub", 4) + T.text(x0 + 640 - 6, 50, "frei", { a: "end", c: "tm", fs: 11 });
      rows.forEach((r, i) => { const x = x0 + (r.net - base) * sc, w = r.b * sc; g += T.rect(x, 26, w - 1, 40, "f-c" + (i + 1), 3) + T.text(x + w / 2, 51, "/" + r.p, { a: "middle", w: 600, fs: 11 }); });
      const ticks = [0].concat(rows.map(r => r.net - base + r.b)); ticks.forEach(t => { const x = x0 + t * sc; g += T.line(x, 66, x, 74) + T.text(x, 86, "." + t, { a: "middle", fs: 10.5 }); });
      g += T.text(x0, 16, "Letztes Oktett von " + n2ip(base) + " (0 bis 255)", { c: "tm", fs: 11 });
      rows.forEach((r, i) => { const y = 104 + i * 20; g += T.rect(x0, y - 11, 12, 12, "f-c" + (i + 1), 2) + T.text(x0 + 20, y, `${r.n}: ${r.h} Hosts → ${r.b} Adressen → /${r.p} → .${r.net - base} bis .${r.net - base + r.b - 1}`, { fs: 11.5 }); });
      return { prompt: `Teile <b class="mono">${n2ip(base)}/24</b> lückenlos ab der ersten Adresse auf (größtes Netz zuerst):<br>${rows.map(r => `${r.n}: ${r.h} Hosts`).join(" · ")}`,
        fields: rows.flatMap(r => [{ l: r.n + " Netz-ID", type: "ip", a: n2ip(r.net) }, { l: r.n + " Präfix (nur Zahl)", type: "num", a: r.p, tol: 0 }]),
        steps, fig: T.svg(W, 104 + rows.length * 20, g, "Aufteilung des /24-Netzes"), figCap: "Das /24-Netz als Balken: jede Abteilung bekommt einen Block, der größte zuerst." };
    } };

  // ---------- IPv6 ----------
  AP2.GEN.ipv6 = { part: "GA2", label: "IPv6-Subnetze",
    howto: `<p><b>Idee:</b> IPv6 hat 128 Bit in 8 Blöcken à 16 Bit. Ein Block hat 4 Hex-Ziffern, <b>eine Hex-Ziffer = 4 Bit</b>. Bei /56 sind die ersten 56 Bit fest.</p>
      <ol><li>Subnetz-Bits = neues Präfix − altes Präfix (z. B. 64 − 56 = 8).</li>
      <li>Anzahl Subnetze = 2<sup>Subnetz-Bits</sup> (2<sup>8</sup> = 256).</li>
      <li>Der 4. Block enthält Bit 49 bis 64. Bei /48 bis /64 liegen die Subnetz-Bits immer dort.</li>
      <li>1. Subnetz: alle Subnetz-Bits 0. Nächstes Subnetz: + Schrittweite. Letztes: alle Subnetz-Bits 1.</li>
      <li>Schrittweite im 4. Block = 2<sup>64 − neues Präfix</sup> (bei /64 → 1, bei /60 → 16 = 0x10, bei /50 → 16384 = 0x4000).</li></ol>
      <p><b>Mini-Beispiel:</b> 2001:db8:abcd:ef00::/56 → /64: 256 Netze. 1.: …:ef00::, 2.: …:ef01::, letztes: …:efff::.</p>
      <p><b>Wenn die Grenze mitten in einer Hex-Ziffer liegt</b> (z. B. /48 → /50): binär rechnen. Die ersten 2 Bit des 4. Blocks zählen 00, 01, 10, 11 → 0000, 4000, 8000, c000.</p>
      <p><b>Typische Fehler:</b> Vergessen, dass eine Hex-Ziffer 4 Bit hat. „::“ falsch gesetzt – es darf nur einmal vorkommen.</p>`,
    make() {
      const P = pick([48, 52, 56]); const Tt = Math.min(64, P + pick(P === 56 ? [4, 8] : [2, 4, 8, 12]));
      const rnd = (BigInt(R(0x1000, 0xffff)) << 80n) | (BigInt(R(0, 0xffff)) << 64n);
      let base = (0x20010db8n << 96n) | rnd; base = (base >> BigInt(128 - P)) << BigInt(128 - P);
      const d = Tt - P, cnt = 2 ** d, size = 1n << BigInt(128 - Tt), step = 2 ** (64 - Tt);
      const second = base + size, last = base + BigInt(cnt - 1) * size;
      const h4 = x => T.hextets(x)[3];
      const steps = [
        `Subnetz-Bits: ${Tt} − ${P} = <b>${d}</b> → 2<sup>${d}</sup> = <b>${cnt} Subnetze</b>.`,
        `Die Subnetz-Bits sind Bit ${P + 1} bis ${Tt}. Sie liegen im <b>4. Block</b> (Bit 49 bis 64): die ersten ${P - 48} Bit dort bleiben fest, die nächsten ${d} Bit zählen hoch${Tt < 64 ? `, die letzten ${64 - Tt} Bit bleiben 0` : ""}.`,
        `4. Block der Basis: <b>${h4(base).toString(16).padStart(4, "0")}</b> = ${bin(h4(base), 16).replace(/(\d{4})(?=\d)/g, "$1 ")} binär.`,
        `Schrittweite im 4. Block: 2<sup>64 − ${Tt}</sup> = ${step} = <b>0x${step.toString(16)}</b>.`,
        `1. Subnetz (alle Subnetz-Bits 0): <b>${T.fmt6(base)}/${Tt}</b>`,
        `2. Subnetz = 1. + Schrittweite: ${h4(base).toString(16)} + ${step.toString(16)} = ${h4(second).toString(16)} → <b>${T.fmt6(second)}/${Tt}</b>`,
        `Letztes Subnetz (alle ${d} Subnetz-Bits 1): 4. Block ${h4(last).toString(16)} → <b>${T.fmt6(last)}/${Tt}</b>`];
      const hx = T.hextets(base); let g = "";
      for (let i = 0; i < 4; i++) { const x = 10 + i * 82; g += T.rect(x, 10, 74, 34, i < 3 ? "f-net" : "f-host", 4) + T.text(x + 37, 32, hx[i].toString(16), { a: "middle", w: 600 }); g += T.text(x + 37, 56, "Block " + (i + 1), { a: "middle", c: "tm", fs: 10 }); }
      g += T.text(10 + 4 * 82 + 4, 32, `:: /${P} → /${Tt}`, { w: 600 });
      const L = 120, C = 18, xb = i => L + i * C + Math.floor(i / 4) * 6;
      for (let n = 0; n < 4; n++) g += T.text(xb(n * 4) + 2 * C, 84, "Hex " + (n + 1), { a: "middle", c: "tm", fs: 10 });
      [["1. Subnetz", base], ["2. Subnetz", second], ["Letztes", last]].forEach(([nm, v], r) => {
        const y = 92 + r * 30, val = h4(v), bits = bin(val, 16);
        g += T.text(L - 10, y + 15, nm, { a: "end", w: 600 });
        for (let i = 0; i < 16; i++) { const cls = i < P - 48 ? "f-net" : i < Tt - 48 ? "f-host" : "f-sub"; g += T.rect(xb(i), y, C - 2, 22, cls, 2) + T.text(xb(i) + (C - 2) / 2, y + 15, bits[i], { a: "middle", fs: 11 }); }
        g += T.text(xb(15) + C + 12, y + 15, "= " + val.toString(16).padStart(4, "0"), { w: 600 });
      });
      g += T.rect(L, 192, 12, 12, "f-net", 2) + T.text(L + 18, 202, "fest (Präfix)", { fs: 11 }) + T.rect(L + 120, 192, 12, 12, "f-host", 2) + T.text(L + 138, 202, "Subnetz-Bits (zählen hoch)", { fs: 11 });
      if (Tt < 64) g += T.rect(L + 330, 192, 12, 12, "f-sub", 2) + T.text(L + 348, 202, "bleibt 0", { fs: 11 });
      return { prompt: `Das Präfix <b class="mono">${T.fmt6(base)}/${P}</b> soll in gleich große <b>/${Tt}</b>-Netze aufgeteilt werden.`,
        fields: [{ l: "Anzahl Subnetze", type: "num", a: cnt, tol: 0 }, { l: "Erstes Subnetz", type: "ip6", a: T.fmt6(base) }, { l: "Zweites Subnetz", type: "ip6", a: T.fmt6(second) }, { l: "Letztes Subnetz", type: "ip6", a: T.fmt6(last) }],
        steps, fig: T.svg(Math.max(600, Math.ceil(xb(15) + C + 80)), 214, g, "4. Block binär für erstes, zweites und letztes Subnetz"), figCap: "Oben die ersten 4 Blöcke der Basis. Unten der 4. Block binär: Nur die orangen Bits ändern sich von Subnetz zu Subnetz." };
    } };

  // ---------- Verfügbarkeit ----------
  AP2.GEN.avail = { part: "GA2", label: "Verfügbarkeit",
    howto: `<p><b>Ausfallzeit pro Jahr:</b> Ein Jahr hat 365 × 24 = <b>8.760 Stunden</b>. Ausfallzeit = 8.760 h × (100 % − Verfügbarkeit).</p>
      <p>Beispiel 99,9 %: 100 % − 99,9 % = 0,1 % = 0,001 → 8.760 h × 0,001 = <b>8,76 h</b>.</p>
      <p><b>Parallel (Redundanz):</b> Es fällt nur alles aus, wenn <b>beide</b> Leitungen gleichzeitig ausfallen. Darum multipliziert man die <b>Ausfall</b>-Wahrscheinlichkeiten: Gesamt = 1 − (1 − A1) × (1 − A2).</p>
      <p>Beispiel 99 % und 99 %: 1 − 0,01 × 0,01 = 1 − 0,0001 = 0,9999 = <b>99,99 %</b>.</p>
      <p><b>Seriell</b> (hintereinander, jede Komponente kann alles lahmlegen): A1 × A2.</p>
      <p><b>Typische Fehler:</b> Prozent nicht in Dezimalzahl umgewandelt (1 % = 0,01). Verfügbarkeiten addiert statt Ausfälle multipliziert.</p>`,
    make() {
      if (Math.random() < 0.5) {
        const A = pick([99, 99.5, 99.9, 99.95, 99.99]); const fr = (100 - A) / 100; const h = 8760 * fr;
        return { prompt: `Ein Provider garantiert <b>${de(A)} %</b> Verfügbarkeit. Wie viele Stunden Ausfall pro Jahr sind maximal erlaubt?`,
          fields: [{ l: "Stunden pro Jahr", type: "num", a: +h.toFixed(2), tol: 0.01 }],
          steps: [`1 Jahr = 365 Tage × 24 h = <b>8.760 h</b>`, `Erlaubter Ausfall = 100 % − ${de(A)} % = ${de(100 - A)} % = <b>${de(fr, 4)}</b>`, `8.760 h × ${de(fr, 4)} = <b>${de(h)} h</b> pro Jahr`, `Zur Vorstellung: ${de(h * 60, 1)} Minuten, also etwa ${de(h * 60 / 12, 1)} Minuten pro Monat.`],
          fig: T.chain([{ v: "365", s: "Tage" }, "× 24", { v: "8.760 h", s: "Stunden im Jahr" }, "× " + de(fr, 4), { v: de(h) + " h", s: "max. Ausfall" }], "Rechenweg Ausfallzeit"), figCap: "Rechenweg als Kette: von den Tagen im Jahr zur erlaubten Ausfallzeit." };
      }
      const a = pick([95, 97, 98, 99, 99.5]), b = pick([95, 97, 98, 99, 99.5]); const fa = (100 - a) / 100, fb = (100 - b) / 100, both = fa * fb, p = (1 - both) * 100;
      let g = T.rect(14, 64, 110, 50, "f-box", 8) + T.text(69, 94, "Firma", { a: "middle", w: 600 }) + T.rect(436, 64, 120, 50, "f-net", 25) + T.text(496, 94, "Internet", { a: "middle", w: 600 });
      g += `<polyline points="124,80 170,34 390,34 436,80" class="s-acc"/><polyline points="124,98 170,144 390,144 436,98" class="s-acc"/>`;
      g += T.text(280, 26, `Leitung A: ${de(a)} % (Ausfall ${de(100 - a)} %)`, { a: "middle", fs: 11.5 }) + T.text(280, 162, `Leitung B: ${de(b)} % (Ausfall ${de(100 - b)} %)`, { a: "middle", fs: 11.5 });
      g += T.text(280, 94, "parallel = redundant", { a: "middle", c: "tm", fs: 11 });
      g += T.text(14, 188, "Weg nur, wenn beide gleichzeitig ausfallen:", { fs: 11.5 }) + T.text(14, 206, `${de(fa, 3)} × ${de(fb, 3)} = ${de(both, 6)} → verfügbar ${de(p, 4)} %`, { fs: 11.5, w: 600 });
      return { prompt: `Zwei unabhängige Internetanbindungen mit <b>${de(a)} %</b> und <b>${de(b)} %</b> Verfügbarkeit laufen parallel. Wie hoch ist die Gesamtverfügbarkeit in %?`,
        fields: [{ l: "Gesamt in %", type: "num", a: +p.toFixed(4), tol: 0.001 }],
        steps: [`Ausfallwahrscheinlichkeit A: 100 % − ${de(a)} % = ${de(100 - a)} % = <b>${de(fa, 3)}</b>`, `Ausfallwahrscheinlichkeit B: 100 % − ${de(b)} % = ${de(100 - b)} % = <b>${de(fb, 3)}</b>`, `Beide gleichzeitig weg: ${de(fa, 3)} × ${de(fb, 3)} = <b>${de(both, 6)}</b>`, `Verfügbarkeit = 1 − ${de(both, 6)} = ${de(1 - both, 6)} = <b>${de(p, 4)} %</b>`],
        fig: T.svg(570, 216, g, "Zwei parallele Leitungen"), figCap: "Zwei Wege ins Internet: Die Firma ist nur offline, wenn beide Leitungen gleichzeitig ausfallen." };
    } };

  // ---------- Übertragungszeit ----------
  AP2.GEN.transfer = { part: "GA2", label: "Übertragungszeit",
    howto: `<p><b>Idee:</b> Zeit = Datenmenge ÷ Geschwindigkeit. Beide brauchen dieselbe Einheit: <b>Bit</b>.</p>
      <ol><li>Datei in Byte: MiB × 1.024 × 1.024 (GiB × 1.024 × 1.024 × 1.024). <b>Speicher ist binär.</b></li>
      <li>Byte → Bit: × 8.</li><li>Overhead (z. B. 10 %): × 1,1.</li>
      <li>Bandbreite in bit/s: Mbit/s × 1.000.000. <b>Leitungen sind dezimal.</b></li>
      <li>Sekunden = Bit ÷ bit/s. Minuten: ÷ 60, der Rest sind Sekunden.</li></ol>
      <p><b>Mini-Beispiel:</b> 100 MiB über 10 Mbit/s: 100 × 1.048.576 × 8 = 838.860.800 bit ÷ 10.000.000 bit/s = <b>83,9 s</b>.</p>
      <p><b>Typische Fehler:</b> × 8 vergessen. Mbit/s mit 1.024 statt 1.000.000 rechnen. MiB mit 1.000 statt 1.024 rechnen.</p>`,
    make() {
      const gib = Math.random() < 0.5; const size = gib ? R(1, 20) : R(200, 5000); const bw = pick([16, 50, 100, 250, 500, 1000]); const oh = pick([0, 10]);
      const bytes = size * (gib ? 1073741824 : 1048576), bits0 = bytes * 8, bits = bits0 * (1 + oh / 100), s = bits / (bw * 1e6);
      const steps = [`${de(size, 0)} ${gib ? "GiB × 1.024 × 1.024 × 1.024" : "MiB × 1.024 × 1.024"} = <b>${de(bytes, 0)} Byte</b>`, `× 8 = <b>${de(bits0, 0)} bit</b>`];
      if (oh) steps.push(`+ ${oh} % Overhead: × ${de(1 + oh / 100)} = <b>${de(bits, 0)} bit</b>`);
      steps.push(`Bandbreite: ${bw} Mbit/s = <b>${de(bw * 1e6, 0)} bit/s</b>`, `${de(bits, 0)} bit ÷ ${de(bw * 1e6, 0)} bit/s = <b>${de(s)} s</b>`, `In Minuten: ${de(s)} ÷ 60 = ${Math.floor(s / 60)} min Rest ${de(s - Math.floor(s / 60) * 60, 1)} s`);
      const items = [{ v: de(size, 0) + (gib ? " GiB" : " MiB"), s: "Dateigröße" }, gib ? "× 1.024³" : "× 1.024²", { v: de(bytes, 0), s: "Byte" }, "× 8", { v: de(bits0, 0), s: "bit" }];
      if (oh) items.push("× " + de(1 + oh / 100), { v: de(bits, 0), s: "bit inkl. Overhead" });
      items.push("÷ " + de(bw * 1e6, 0), { v: de(s) + " s", s: "≈ " + Math.floor(s / 60) + " min " + Math.round(s % 60) + " s" });
      return { prompt: `Eine Datei mit <b>${de(size, 0)} ${gib ? "GiB" : "MiB"}</b> wird über eine Leitung mit <b>${bw} Mbit/s</b> übertragen${oh ? `, zusätzlich ${oh} % Protokoll-Overhead` : ""}. Wie viele Sekunden dauert das?`,
        fields: [{ l: "Sekunden", type: "num", a: +s.toFixed(2), rel: 0.005 }], steps, fig: T.chain(items, "Rechenweg Übertragungszeit"), figCap: "Erst alles in Bit umrechnen, dann durch die Bandbreite in bit/s teilen." };
    } };
})();
