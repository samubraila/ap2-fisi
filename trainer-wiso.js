// WiSo-Rechenaufgaben: KV-Beitrag, EK-Rentabilität, GmbH-Gewinn, Kündigungsfrist, Wirtschaftlichkeit
(function () {
  const T = AP2.T, { R, pick, de, dstr } = T;

  // ---------- KV-Beitrag ----------
  AP2.GEN.kv = { part: "WiSo", label: "KV-Beitrag",
    howto: `<p><b>Idee:</b> Den Beitrag zur gesetzlichen Krankenversicherung zahlen Arbeitnehmer und Arbeitgeber <b>je zur Hälfte</b> – auch den Zusatzbeitrag.</p>
      <ol><li>Gesamtsatz = 14,6 % + Zusatzbeitrag.</li><li>Arbeitnehmeranteil = Gesamtsatz ÷ 2.</li><li>Beitrag = Brutto × Arbeitnehmeranteil.</li></ol>
      <p><b>Mini-Beispiel (Winter 2025/26):</b> 14,6 % + 1,8 % = 16,4 % → ÷ 2 = 8,2 % → 3.500 € × 8,2 % = <b>287,00 €</b>.</p>
      <p><b>Merke:</b> Über der Beitragsbemessungsgrenze steigt der Beitrag nicht weiter. Rentenversicherung: 18,6 % → je 9,3 %.</p>
      <p><b>Typischer Fehler:</b> Nur die 14,6 % halbiert und den Zusatzbeitrag voll gerechnet.</p>`,
    make() {
      const b = R(44, 110) * 50; const z = pick([1.3, 1.7, 1.8, 2.4, 2.5, 2.9]); const tot = 14.6 + z, half = tot / 2, an = b * half / 100;
      const x0 = 20, W = 600, sc = W / tot; let g = "";
      [[7.3, "f-c1", "7,3 %"], [z / 2, "f-c1", de(z / 2) + " %"], [7.3, "f-c2", "7,3 %"], [z / 2, "f-c2", de(z / 2) + " %"]].reduce((x, [v, c, t]) => { g += T.rect(x, 30, v * sc - 2, 40, c, 3) + (v * sc > 46 ? T.text(x + v * sc / 2, 55, t, { a: "middle", fs: 11 }) : ""); return x + v * sc; }, x0);
      g += T.text(x0, 20, `Gesamtsatz ${de(tot)} % = 14,6 % + ${de(z)} % Zusatzbeitrag`, { fs: 11.5, w: 600 });
      g += T.text(x0 + W / 4, 90, `Arbeitnehmer: ${de(half)} %`, { a: "middle", w: 700 }) + T.text(x0 + 3 * W / 4, 90, `Arbeitgeber: ${de(half)} %`, { a: "middle", w: 700 });
      g += T.text(x0, 122, `${de(b)} € × ${de(half)} % = ${de(an)} € Arbeitnehmeranteil`, { w: 700, c: "t ta", fs: 13 });
      return { prompt: `Bruttogehalt <b>${de(b)} €</b>, allgemeiner Beitragssatz 14,6 %, Zusatzbeitrag <b>${de(z)} %</b>. Wie hoch ist der Arbeitnehmeranteil zur Krankenversicherung?`,
        fields: [{ l: "€", type: "num", a: +an.toFixed(2), tol: 0.01 }],
        steps: [`Gesamtsatz: 14,6 % + ${de(z)} % = <b>${de(tot)} %</b>`, `Je zur Hälfte: ${de(tot)} % ÷ 2 = <b>${de(half)} %</b> Arbeitnehmeranteil`, `${de(b)} € × ${de(half)} % = ${de(b)} × ${de(half / 100, 4)} = <b>${de(an)} €</b>`],
        fig: T.svg(640, 134, g, "Aufteilung des Beitragssatzes"), figCap: "Der Beitragssatz wird halbiert: Blau zahlt der Arbeitnehmer, Orange der Arbeitgeber." };
    } };

  // ---------- EK-Rentabilität ----------
  AP2.GEN.ekr = { part: "WiSo", label: "Eigenkapitalrentabilität",
    howto: `<p><b>Idee:</b> Die Eigenkapitalrentabilität zeigt, wie viel Prozent Gewinn das eingesetzte Eigenkapital gebracht hat.</p>
      <p class="mono"><b>EK-Rentabilität = Reingewinn ÷ Eigenkapital × 100</b></p>
      <p><b>Mini-Beispiel (Sommer 2026):</b> 24.860 € ÷ 220.000 € × 100 = <b>11,3 %</b>.</p>
      <p><b>Zum Verstehen:</b> Bringt eine sichere Geldanlage mehr Zinsen als dieser Prozentsatz, lohnt sich das Unternehmen für die Eigentümer weniger.</p>
      <p><b>Typische Fehler:</b> Gewinn und Eigenkapital vertauscht. × 100 vergessen.</p>`,
    make() {
      const gw = R(10, 90) * 1000 + R(0, 9) * 10; const ek = R(10, 80) * 10000; const q = gw / ek, r = q * 100;
      const x0 = 20, W = 600; let g = T.rect(x0, 26, W, 34, "f-net", 4) + T.text(x0 + 8, 48, `Eigenkapital ${de(ek)} € = 100 %`, { fs: 11.5, w: 600 });
      const bw = Math.max(3, W * Math.min(1, q)), lab = `Gewinn ${de(gw)} € = ${de(r, 1)} %`;
      g += T.rect(x0, 70, bw, 34, "f-acc", 4) + (bw > 360 ? T.text(x0 + bw - 8, 92, lab, { a: "end", c: "t f-acc-t", fs: 11.5, w: 600 }) : T.text(x0 + bw + 8, 92, lab, { fs: 11.5, w: 600 }));
      g += T.text(x0, 18, "Wie groß ist der Gewinn im Verhältnis zum Eigenkapital?", { c: "tm", fs: 11 });
      return { prompt: `Reingewinn <b>${de(gw)} €</b>, Eigenkapital <b>${de(ek)} €</b>. Eigenkapitalrentabilität in %?`, fields: [{ l: "% (1 Nachkommastelle)", type: "num", a: +r.toFixed(1), tol: 0.06 }],
        steps: [`Formel: Reingewinn ÷ Eigenkapital × 100`, `${de(gw)} ÷ ${de(ek)} = <b>${de(q, 5)}</b>`, `× 100 = <b>${de(r, 2)} %</b> → gerundet ${de(r, 1)} %`],
        fig: T.svg(640, 116, g, "Gewinn im Verhältnis zum Eigenkapital"), figCap: "Oben das ganze Eigenkapital (100 %), unten der Gewinn als Anteil davon." };
    } };

  // ---------- GmbH-Gewinnverteilung ----------
  AP2.GEN.gmbh = { part: "WiSo", label: "GmbH-Gewinnverteilung",
    howto: `<p><b>Idee:</b> Steht im Gesellschaftsvertrag nichts zur Gewinnverteilung, wird der Gewinn <b>nach Geschäftsanteilen</b> verteilt.</p>
      <ol><li>Gesamtkapital = Summe aller Anteile.</li><li>Quote = eigener Anteil ÷ Gesamtkapital.</li><li>Gewinnanteil = Quote × Gewinn.</li></ol>
      <p><b>Mini-Beispiel (Winter 2025/26):</b> Anteile 85.000 € und 35.000 €, Gewinn 60.000 € → 35.000 ÷ 120.000 × 60.000 € = <b>17.500 €</b>.</p>
      <p><b>Merke:</b> GmbH-Stammkapital mindestens 25.000 €, Gründung auch durch eine Person, Eintrag ins Handelsregister.</p>
      <p><b>Typischer Fehler:</b> Den Gewinn einfach durch die Anzahl der Gesellschafter geteilt.</p>`,
    make() {
      const a = R(5, 18) * 5000, b = R(3, 12) * 5000; const gw = R(10, 60) * 2000; const sum = a + b, qa = a / sum, qb = b / sum, sa = qa * gw, sb = qb * gw;
      const x0 = 110, W = 520; let g = "";
      g += T.text(x0 - 10, 46, "Kapital", { a: "end", w: 600 }) + T.rect(x0, 26, W * qa - 2, 32, "f-c1", 3) + T.rect(x0 + W * qa, 26, W * qb, 32, "f-c2", 3);
      const lbl = (txt, cx, w, y) => w > 64 ? T.text(cx, y, txt, { a: "middle", fs: 11, w: 600 }) : "";
      g += lbl(`A ${de(qa * 100, 1)} %`, x0 + W * qa / 2, W * qa, 46) + lbl(`B ${de(qb * 100, 1)} %`, x0 + W * qa + W * qb / 2, W * qb, 46);
      g += T.text(x0 - 10, 98, "Gewinn", { a: "end", w: 600 }) + T.rect(x0, 78, W * qa - 2, 32, "f-c1", 3) + T.rect(x0 + W * qa, 78, W * qb, 32, "f-c2", 3);
      g += lbl("A", x0 + W * qa / 2, W * qa, 98) + lbl("B", x0 + W * qa + W * qb / 2, W * qb, 98);
      g += T.rect(x0, 124, 12, 12, "f-c1", 2) + T.text(x0 + 18, 134, `A: ${de(a)} € Kapital (${de(qa * 100, 2)} %) → ${de(sa)} € Gewinn`, { fs: 11.5 });
      g += T.rect(x0, 144, 12, 12, "f-c2", 2) + T.text(x0 + 18, 154, `B: ${de(b)} € Kapital (${de(qb * 100, 2)} %) → ${de(sb)} € Gewinn`, { fs: 11.5, w: 700 });
      g += T.text(x0, 16, `Gesamtkapital ${de(sum)} € · Gewinn ${de(gw)} € – beide im gleichen Verhältnis geteilt`, { c: "tm", fs: 11 });
      return { prompt: `GmbH mit zwei Gesellschaftern: Anteil A <b>${de(a)} €</b>, Anteil B <b>${de(b)} €</b>. Gewinn <b>${de(gw)} €</b>, keine vertragliche Regelung. Gewinnanteil von B?`,
        fields: [{ l: "€", type: "num", a: +sb.toFixed(2), tol: 1 }],
        steps: [`Keine Regelung → Verteilung nach Geschäftsanteilen.`, `Gesamtkapital: ${de(a)} € + ${de(b)} € = <b>${de(sum)} €</b>`, `Quote B: ${de(b)} ÷ ${de(sum)} = <b>${de(qb, 4)}</b> (${de(qb * 100, 2)} %)`, `Gewinnanteil B: ${de(qb, 4)} × ${de(gw)} € = <b>${de(sb)} €</b> (A bekommt ${de(sa)} €)`],
        fig: T.svg(650, 164, g, "Kapital und Gewinn im gleichen Verhältnis"), figCap: "Der Gewinn wird genau so aufgeteilt wie das Kapital." };
    } };

  // ---------- Kündigungsfrist ----------
  AP2.GEN.kuend = { part: "WiSo", label: "Kündigungsfrist",
    howto: `<p><b>Arbeitnehmer kündigt:</b> immer die Grundfrist (§ 622 Abs. 1 BGB): <b>4 Wochen zum 15. oder zum Monatsende</b> – egal wie lange er im Betrieb ist.</p>
      <p><b>Arbeitgeber kündigt:</b> Die Frist wird mit der Betriebszugehörigkeit länger, immer <b>zum Monatsende</b>:</p>
      <div class="scroll"><table class="small"><tbody><tr><th>Jahre im Betrieb</th><td>unter 2</td><td>2</td><td>5</td><td>8</td><td>10</td><td>12</td><td>15</td><td>20</td></tr>
      <tr><th>Frist</th><td>4 Wo. zum 15./Ende</td><td>1 Mon.</td><td>2 Mon.</td><td>3 Mon.</td><td>4 Mon.</td><td>5 Mon.</td><td>6 Mon.</td><td>7 Mon.</td></tr></tbody></table></div>
      <ol><li>Entscheidend ist der <b>Zugang</b> der Kündigung. Die Frist beginnt am Tag danach.</li>
      <li>4 Wochen: Zugang + 28 Tage = frühestes Ende. Dann den nächsten 15. oder Monatsletzten nehmen.</li>
      <li>Monate: Zugang + n Monate (gleicher Kalendertag), dann bis zum Ende dieses Monats.</li></ol>
      <p><b>Mini-Beispiel (Winter 2025/26):</b> Zugang 11.12.2025 → + 4 Wochen = 08.01.2026 → nächster Termin <b>15.01.2026</b>.</p>
      <p><b>Typische Fehler:</b> Die längeren Arbeitgeberfristen bei einer Kündigung durch den Arbeitnehmer verwendet. In der Probezeit gelten 2 Wochen zu jedem Tag.</p>`,
    make() {
      const d = new Date(2026, R(0, 11), R(1, 28)); const an = Math.random() < 0.45; const yrs = an ? R(1, 20) : pick([1, 3, 6, 9, 11, 13, 16, 21]);
      const months = an || yrs < 2 ? 0 : yrs >= 20 ? 7 : yrs >= 15 ? 6 : yrs >= 12 ? 5 : yrs >= 10 ? 4 : yrs >= 8 ? 3 : yrs >= 5 ? 2 : 1;
      let end, mid, steps;
      if (months === 0) {
        mid = new Date(d); mid.setDate(mid.getDate() + 28); let yy = mid.getFullYear(), mm = mid.getMonth();
        for (;;) { const c15 = new Date(yy, mm, 15), ce = new Date(yy, mm + 1, 0); if (c15 >= mid) { end = c15; break; } if (ce >= mid) { end = ce; break; } mm++; }
        steps = [an ? "Der Arbeitnehmer kündigt → immer Grundfrist: 4 Wochen zum 15. oder zum Monatsende." : `Unter 2 Jahren im Betrieb → Grundfrist: 4 Wochen zum 15. oder zum Monatsende.`, `Zugang ${dstr(d)} + 4 Wochen (28 Tage) = <b>${dstr(mid)}</b> (frühestes Ende)`, `Nächster zulässiger Termin ab ${dstr(mid)}: der 15. oder der Monatsletzte → <b>${dstr(end)}</b>`];
      } else {
        const mi = d.getMonth() + months; const dim = new Date(d.getFullYear(), mi + 1, 0).getDate(); mid = new Date(d.getFullYear(), mi, Math.min(d.getDate(), dim)); end = new Date(mid.getFullYear(), mid.getMonth() + 1, 0);
        steps = [`Der Arbeitgeber kündigt nach ${yrs} Jahren → Tabelle: <b>${months} Monat${months > 1 ? "e" : ""} zum Monatsende</b>.`, `Zugang ${dstr(d)} + ${months} Monat${months > 1 ? "e" : ""} = <b>${dstr(mid)}</b>`, `Bis zum Ende dieses Monats → <b>${dstr(end)}</b>`];
      }
      // Zeitstrahl
      const t0 = d.getTime(), t1 = end.getTime() + 6 * 86400000, x0 = 30, W = 600, xp = t => x0 + (t - t0) / (t1 - t0) * W; let g = "";
      g += T.line(x0, 70, x0 + W, 70, "s-line") + T.rect(xp(t0), 62, xp(mid.getTime()) - xp(t0), 16, "f-host", 3) + T.rect(xp(mid.getTime()), 62, Math.max(2, xp(end.getTime()) - xp(mid.getTime())), 16, "f-c1", 3);
      if (months === 0) { for (let m = d.getMonth(); m <= end.getMonth() + (end.getFullYear() - d.getFullYear()) * 12; m++) { [new Date(d.getFullYear(), m, 15), new Date(d.getFullYear(), m + 1, 0)].forEach(c => { if (c > d && c.getTime() <= t1) g += T.line(xp(c.getTime()), 82, xp(c.getTime()), 90, "s-line") + T.text(xp(c.getTime()), 102, c.getDate() === 15 ? "15." : "Ende", { a: "middle", c: "tm", fs: 9.5 }); }); } }
      [[t0, "Zugang", dstr(d), 30, "start"], [mid.getTime(), months ? "+ " + months + " Mon." : "+ 4 Wochen", dstr(mid), 30, "middle"], [end.getTime(), "Ende", dstr(end), 130, "middle"]].forEach(([t, a, b2, y, an2]) => { const x = xp(t), tx = an2 === "start" ? x - 6 : x; g += `<circle cx="${x}" cy="70" r="6" class="${a === "Ende" ? "f-acc" : "f-box"}"/>` + T.text(tx, y - 12, a, { a: an2, w: 700, fs: 11 }) + T.text(tx, y + 2, b2, { a: an2, fs: 11, c: a === "Ende" ? "t ta" : "t" }); });
      g += T.rect(x0, 146, 12, 12, "f-host", 2) + T.text(x0 + 18, 156, "Kündigungsfrist", { fs: 11 }) + T.rect(x0 + 150, 146, 12, 12, "f-c1", 2) + T.text(x0 + 168, 156, "warten bis zum nächsten Termin", { fs: 11 });
      return { prompt: `${an ? "Ein Arbeitnehmer kündigt" : "Der Arbeitgeber kündigt einem Mitarbeiter"} (seit <b>${yrs} Jahren</b> im Betrieb, Probezeit vorbei). Die Kündigung geht am <b>${dstr(d)}</b> zu. Es gilt die gesetzliche Frist nach § 622 BGB. Wann endet das Arbeitsverhältnis?`,
        fields: [{ l: "Datum TT.MM.JJJJ", type: "date", a: dstr(end) }], steps, fig: T.svg(660, 166, g, "Zeitstrahl der Kündigungsfrist"), figCap: "Zeitstrahl: erst läuft die Frist, dann wird bis zum nächsten erlaubten Termin gewartet." };
    } };

  // ---------- Wirtschaftlichkeit ----------
  AP2.GEN.wirt = { part: "WiSo", label: "Wirtschaftlichkeit",
    howto: `<p><b>Idee:</b> Wirtschaftlichkeit = <b>Ertrag ÷ Aufwand</b>. Über 1 heißt: es kommt mehr herein, als hinausgeht. Je größer der Wert, desto wirtschaftlicher.</p>
      <p><b>Mini-Beispiel:</b> Ertrag 720.000 €, Aufwand 400.000 € → 720.000 ÷ 400.000 = <b>1,8</b>.</p>
      <p><b>Typischer Fehler:</b> Den Gewinn (Ertrag − Aufwand) vergleichen. Der Auftrag mit dem größten Gewinn ist nicht immer der wirtschaftlichste.</p>`,
    make() {
      const rows = [1, 2, 3].map(i => { const auf = R(20, 90) * 1000; const ert = Math.round(auf * (0.9 + Math.random() * 0.5) / 1000) * 1000; return { i, auf, ert, w: ert / auf }; });
      const best = rows.slice().sort((a, b) => b.w - a.w)[0]; const mx = Math.max(...rows.map(r => r.ert), ...rows.map(r => r.auf));
      const x0 = 110, W = 360; let g = "";
      rows.forEach((r, k) => { const y = 14 + k * 62; g += T.text(x0 - 10, y + 26, "Auftrag " + r.i, { a: "end", w: 700 });
        g += T.rect(x0, y, r.ert / mx * W, 20, "f-good", 3) + T.text(x0 + r.ert / mx * W + 6, y + 15, "Ertrag " + de(r.ert) + " €", { fs: 10.5 });
        g += T.rect(x0, y + 24, r.auf / mx * W, 20, "f-bad", 3) + T.text(x0 + r.auf / mx * W + 6, y + 39, "Aufwand " + de(r.auf) + " €", { fs: 10.5 });
        g += T.text(706, y + 28, "= " + de(r.w, 3), { a: "end", w: 700, c: r === best ? "t ta" : "t" }); });
      return { prompt: `Welcher Auftrag war am wirtschaftlichsten?<br>${rows.map(r => `Auftrag ${r.i}: Ertrag ${de(r.ert)} €, Aufwand ${de(r.auf)} €`).join("<br>")}`,
        fields: [{ l: "Auftrag Nr.", type: "num", a: best.i, tol: 0 }, { l: "Wirtschaftlichkeit (2 Nachkommastellen)", type: "num", a: +best.w.toFixed(2), tol: 0.011 }],
        steps: rows.map(r => `Auftrag ${r.i}: ${de(r.ert)} ÷ ${de(r.auf)} = <b>${de(r.w, 3)}</b>`).concat([`Größter Wert → <b>Auftrag ${best.i}</b> mit ${de(best.w, 2)}`]),
        fig: T.svg(716, 200, g, "Ertrag und Aufwand je Auftrag"), figCap: "Grün Ertrag, Rot Aufwand. Rechts das Verhältnis – der größte Wert gewinnt." };
    } };
})();
