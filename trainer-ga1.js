// GA1-Rechenaufgaben: RAID, MTBF, USV, Video, Strom, Netzteil, Bitbedarf, Unix-Rechte
(function () {
  const T = AP2.T, { R, pick, de } = T;

  // ---------- RAID ----------
  function disks(list, label, note) {
    const per = 12, W = 14 + per * 48; let g = "";
    list.forEach((d, i) => {
      const col = i % per, row = Math.floor(i / per), x = 14 + col * 48, y = 12 + row * 84;
      g += T.rect(x, y, 40, 54, d.k === "D" ? "f-net" : "f-host", 8) + T.line(x, y + 12, x + 40, y + 12, "s-line");
      g += T.text(x + 20, y + 38, d.k, { a: "middle", w: 700 }) + T.text(x + 20, y + 68, d.s, { a: "middle", c: "tm", fs: 9.5 });
      if (d.pair) g += T.line(x, y + 76, x + 88, y + 76, "s-acc");
    });
    const rows = Math.ceil(list.length / per), y = 18 + rows * 84;
    g += T.rect(14, y - 10, 12, 12, "f-net", 2) + T.text(32, y, "D = Daten", { fs: 11 }) + T.rect(130, y - 10, 12, 12, "f-host", 2) + T.text(148, y, "P = Parität, S = Spiegel (Sicherheit)", { fs: 11 });
    if (note) g += T.text(14, y + 22, note, { fs: 11.5, w: 600 });
    return T.svg(Math.max(W, 460), y + 34, g, label);
  }
  AP2.GEN.raid = { part: "GA1", label: "RAID",
    howto: `<p><b>Idee:</b> Bei RAID geht ein Teil der Kapazität für Sicherheit weg – für Parität oder Spiegelung. Netto bleibt, was du wirklich speichern kannst.</p>
      <div class="scroll"><table class="small"><thead><tr><th>Level</th><th>Netto</th><th>min. Platten</th><th>verkraftet</th></tr></thead><tbody>
      <tr><td>RAID 0</td><td class="mono">n × C</td><td>2</td><td>keinen Ausfall</td></tr>
      <tr><td>RAID 1</td><td class="mono">C</td><td>2</td><td>1 Ausfall</td></tr>
      <tr><td>RAID 5</td><td class="mono">(n − 1) × C</td><td>3</td><td>1 Ausfall</td></tr>
      <tr><td>RAID 6</td><td class="mono">(n − 2) × C</td><td>4</td><td>2 Ausfälle</td></tr>
      <tr><td>RAID 10</td><td class="mono">n ÷ 2 × C</td><td>4</td><td>sicher 1 Ausfall</td></tr></tbody></table></div>
      <p class="small muted">n = Anzahl Platten, C = Kapazität einer Platte</p>
      <p><b>Rückwärts rechnen</b> (wie viele Platten?): Bedarf ÷ Plattengröße, <b>aufrunden</b> = Datenplatten. Dann RAID 5: + 1, RAID 6: + 2, RAID 10: × 2.</p>
      <p><b>Mini-Beispiel (Sommer 2024):</b> 20 TiB mit 4-TiB-Platten → 5 Datenplatten → RAID 5: 6, RAID 6: 7, RAID 10: 10 Platten.</p>
      <p><b>Typische Fehler:</b> Nicht aufgerundet. Bei RAID 10 nur + 1 statt × 2. Hot-Spare mitgezählt (zählt nie zur Nettokapazität).</p>`,
    make() {
      const sz = pick([2, 4, 8, 10, 12, 16, 18, 20]);
      if (Math.random() < 0.5) {
        const lvl = pick([0, 1, 5, 6, 10]); const n = lvl === 1 ? 2 : lvl === 10 ? 2 * R(2, 8) : lvl === 0 ? R(2, 8) : R(lvl === 5 ? 3 : 4, 16);
        const net = lvl === 0 ? n * sz : lvl === 1 ? sz : lvl === 5 ? (n - 1) * sz : lvl === 6 ? (n - 2) * sz : n / 2 * sz;
        const rule = { 0: `Striping ohne Sicherheit: n × C = ${n} × ${sz}`, 1: `Spiegelung: eine Platte nutzbar = ${sz}`, 5: `eine Platte für Parität: (n − 1) × C = ${n - 1} × ${sz}`, 6: `zwei Platten für Parität: (n − 2) × C = ${n - 2} × ${sz}`, 10: `Hälfte für Spiegel: n ÷ 2 × C = ${n / 2} × ${sz}` }[lvl];
        const list = []; for (let i = 0; i < n; i++) { let k = "D"; if (lvl === 5 && i === n - 1) k = "P"; if (lvl === 6 && i >= n - 2) k = "P"; if ((lvl === 1 || lvl === 10) && i % 2 === 1) k = "S"; list.push({ k, s: sz + " TiB", pair: lvl === 10 && i % 2 === 0 }); }
        return { prompt: `RAID ${lvl} aus <b>${n} Festplatten</b> mit je <b>${sz} TiB</b>. Wie groß ist die Nettokapazität?`, fields: [{ l: "Netto in TiB", type: "num", a: net, tol: 0 }],
          steps: [`Brutto: ${n} × ${sz} TiB = ${n * sz} TiB`, `RAID ${lvl}: ${rule} = <b>${net} TiB</b> netto`, `Für Sicherheit gehen ${n * sz - net} TiB weg (${de((n * sz - net) / (n * sz) * 100, 1)} %).`, `RAID ${lvl} verkraftet ${{ 0: "keinen Ausfall", 1: "1 Ausfall", 5: "1 Ausfall", 6: "2 Ausfälle", 10: "sicher 1 Ausfall (pro Spiegelpaar einen)" }[lvl]}.`],
          fig: disks(list, "RAID-Platten", `Netto = ${net} TiB von ${n * sz} TiB brutto`), figCap: lvl === 5 || lvl === 6 ? "Die Parität ist in echt über alle Platten verteilt – sie kostet aber genau so viel Platz wie hier gezeichnet." : "Jeder Kasten ist eine Platte." };
      }
      const lvl = pick([5, 6, 10]); const need = R(10, 160); const data = Math.ceil(need / sz); const n = lvl === 5 ? data + 1 : lvl === 6 ? data + 2 : data * 2;
      const net = lvl === 10 ? n / 2 * sz : (data) * sz;
      const list = []; for (let i = 0; i < n; i++) { let k = "D"; if (lvl === 5 && i === n - 1) k = "P"; if (lvl === 6 && i >= n - 2) k = "P"; if (lvl === 10 && i % 2 === 1) k = "S"; list.push({ k, s: sz + " TiB", pair: lvl === 10 && i % 2 === 0 }); }
      return { prompt: `Es werden mindestens <b>${need} TiB</b> nutzbarer Speicher benötigt. Wie viele Festplatten à <b>${sz} TiB</b> brauchst du bei RAID ${lvl}?`, fields: [{ l: "Anzahl Festplatten", type: "num", a: n, tol: 0 }],
        steps: [`Datenplatten: ${need} TiB ÷ ${sz} TiB = ${de(need / sz)} → <b>aufrunden auf ${data}</b>`, `RAID ${lvl}: ${lvl === 5 ? `+ 1 Paritätsplatte → ${data} + 1` : lvl === 6 ? `+ 2 Paritätsplatten → ${data} + 2` : `jede Platte gespiegelt → ${data} × 2`} = <b>${n} Platten</b>`, `Probe: netto ${net} TiB ≥ ${need} TiB benötigt ✓`],
        fig: disks(list, "RAID-Platten", `${data} Datenplatten + ${n - data} für Sicherheit = ${n} Platten`), figCap: "Erst die Datenplatten zählen, dann die Platten für Parität oder Spiegel dazu." };
    } };

  // ---------- MTBF ----------
  AP2.GEN.mtbf = { part: "GA1", label: "MTBF",
    howto: `<p><b>Idee:</b> MTBF ist die durchschnittliche Zeit bis zu einem Ausfall. Arbeiten viele gleiche Teile zusammen, fällt <b>irgendeins</b> viel früher aus.</p>
      <ol><li>MTBF des Systems ≈ MTBF eines Teils ÷ Anzahl der Teile.</li><li>Stunden in Jahre: ÷ 8.760 (365 × 24).</li></ol>
      <p><b>Mini-Beispiel (Winter 2021/22):</b> 800.000 h ÷ 16 Platten = 50.000 h ÷ 8.760 = <b>5,7 Jahre</b>.</p>
      <p><b>Merke:</b> MTBF für Systeme, die repariert werden. MTTF für Teile, die man austauscht (Festplatten).</p>
      <p><b>Typischer Fehler:</b> mit der Anzahl multiplizieren statt teilen.</p>`,
    make() {
      const m = pick([500000, 800000, 1000000, 1200000, 1500000]); const n = pick([4, 8, 12, 16, 20, 24]); const h = m / n, y = h / 8760;
      return { prompt: `Eine Festplatte hat eine MTBF von <b>${de(m, 0)} h</b>. Im System arbeiten <b>${n}</b> davon. Nach wie vielen Jahren ist statistisch mit dem ersten Ausfall zu rechnen?`,
        fields: [{ l: "Jahre (1 Nachkommastelle)", type: "num", a: +y.toFixed(1), tol: 0.06 }],
        steps: [`Viele Platten → einer fällt früher aus: ${de(m, 0)} h ÷ ${n} = <b>${de(h, 0)} h</b>`, `1 Jahr = 24 × 365 = 8.760 h`, `${de(h, 0)} h ÷ 8.760 h = <b>${de(y)} Jahre</b> → gerundet ${de(y, 1)}`],
        fig: T.chain([{ v: de(m, 0) + " h", s: "MTBF einer Platte" }, "÷ " + n, { v: de(h, 0) + " h", s: "MTBF des Systems" }, "÷ 8.760", { v: de(y, 1) + " Jahre", s: "bis zum 1. Ausfall" }], "Rechenweg MTBF"), figCap: "Durch die Anzahl teilen, dann in Jahre umrechnen." };
    } };

  // ---------- USV ----------
  AP2.GEN.usv = { part: "GA1", label: "USV-Ladezustand",
    howto: `<p><b>Idee:</b> Der Akku der USV leert sich gleichmäßig. 100 % = volle Überbrückungszeit. Das Notstromaggregat braucht Zeit zum Starten. So lange muss der Akku noch halten – und danach soll eine Reserve übrig sein.</p>
      <ol><li>Prozent pro Minute: 100 % ÷ Überbrückungszeit.</li><li>Startzeit in Prozent: Startzeit × Prozent pro Minute.</li><li>Startpunkt = Reserve + Startzeit in Prozent.</li></ol>
      <p><b>Mini-Beispiel (Sommer 2025):</b> 60 min = 100 % → 1 % = 0,6 min → 3 min Start = 5 % → 30 % Reserve + 5 % = <b>35 %</b>.</p>
      <p><b>Typische Fehler:</b> Reserve vergessen. Startzeit in Minuten statt Prozent addiert.</p>`,
    make() {
      const Tm = pick([20, 30, 40, 60]); const s = pick([2, 3, 4, 5, 6]); const r = pick([10, 15, 20, 25, 30]); const sp = s / Tm * 100, z = r + sp;
      const x0 = 30, W = 560, xp = p => x0 + p / 100 * W; let g = "";
      g += T.rect(x0 - 3, 40, W + 6, 56, "f-box", 8) + T.rect(x0 + W + 3, 56, 10, 24, "f-muted", 3);
      g += T.rect(xp(0), 44, xp(r) - xp(0), 48, "f-bad", 4) + T.rect(xp(r), 44, xp(z) - xp(r), 48, "f-warn", 0) + T.rect(xp(z), 44, xp(100) - xp(z), 48, "f-good", 4);
      g += T.text((xp(0) + xp(r)) / 2, 73, "Reserve", { a: "middle", fs: 11 }) + T.text((xp(z) + xp(100)) / 2, 73, "normaler Akkubetrieb", { a: "middle", fs: 11 });
      [0, 25, 50, 75, 100].forEach(p => { g += T.line(xp(p), 98, xp(p), 104) + T.text(xp(p), 116, p + " %", { a: "middle", c: "tm", fs: 10 }); });
      g += T.line(xp(z), 20, xp(z), 98, "s-acc") + T.text(xp(z), 14, `Aggregat starten bei ${de(z)} %`, { a: xp(z) > 420 ? "end" : "middle", c: "t ta", w: 700, fs: 12 });
      g += T.text(Math.max(x0 + 60, (xp(r) + xp(z)) / 2), 138, `Orange: ${s} min Start = ${de(sp)} %`, { a: "middle", fs: 11, w: 600 });
      g += T.text(x0, 160, `Der Akku entlädt sich von rechts (100 %) nach links (0 %). 1 % = ${de(Tm / 100)} min.`, { fs: 11, c: "tm" });
      return { prompt: `Die USV überbrückt bei Volllast <b>${Tm} Minuten</b> (100 %). Das Notstromaggregat braucht <b>${s} Minuten</b> zum Start. Bei <b>${r} %</b> Restladung muss es spätestens übernehmen. Bei welchem Ladezustand muss es gestartet werden?`,
        fields: [{ l: "Ladezustand in %", type: "num", a: +z.toFixed(2), tol: 0.05 }],
        steps: [`${Tm} min = 100 % → 1 min = 100 ÷ ${Tm} = <b>${de(100 / Tm, 3)} %</b> (oder 1 % = ${de(Tm / 100)} min)`, `Startzeit: ${s} min × ${de(100 / Tm, 3)} % = <b>${de(sp)} %</b>`, `Reserve + Startzeit: ${r} % + ${de(sp)} % = <b>${de(z)} %</b>`, `Sobald der Akku auf ${de(z)} % fällt, muss das Aggregat starten. Nach ${s} Minuten Startzeit sind noch ${r} % übrig.`],
        fig: T.svg(620, 170, g, "Akku-Balken der USV"), figCap: "Der Akku als Balken: Grün läuft normal, Orange ist die Startzeit des Aggregats, Rot ist die Reserve." };
    } };

  // ---------- Video ----------
  AP2.GEN.video = { part: "GA1", label: "Datenmenge Video",
    howto: `<p><b>Idee:</b> Unkomprimiertes Video besteht aus vielen Einzelbildern. Ein Bild hat Breite × Höhe Pixel, jedes Pixel braucht so viele Bit wie die Farbtiefe.</p>
      <ol><li>Bit pro Bild = Breite × Höhe × Farbtiefe.</li><li>× Bilder pro Sekunde × Sekunden = Bit gesamt.</li><li>÷ 8 = Byte, ÷ 1.024 = KiB, ÷ 1.024 = MiB.</li></ol>
      <p><b>Mini-Beispiel (Sommer 2022):</b> 1.920 × 1.080 × 16 bit × 10 Bilder/s × 60 s ÷ 8 = 2.488.320.000 Byte ÷ 1.024 ÷ 1.024 ≈ <b>2.373 MiB</b>.</p>
      <p><b>Typische Fehler:</b> ÷ 8 vergessen. Durch 1.000 statt 1.024 geteilt.</p>`,
    make() {
      const [w, h] = pick([[1280, 720], [1920, 1080], [2560, 1440], [3840, 2160]]); const bpp = pick([16, 24]); const fps = pick([10, 15, 25, 30]); const sec = pick([10, 30, 60]);
      const bitImg = w * h * bpp, bitAll = bitImg * fps * sec, by = bitAll / 8, mib = by / 1048576;
      return { prompt: `Eine Kamera liefert <b>${w} × ${h}</b> Pixel, <b>${bpp} Bit</b> Farbtiefe, <b>${fps} Bilder/s</b> unkomprimiert. Wie viel MiB fallen in <b>${sec} Sekunden</b> an?`,
        fields: [{ l: "MiB", type: "num", a: +mib.toFixed(2), tol: Math.max(1, mib * 0.002) }],
        steps: [`Ein Bild: ${w} × ${h} Pixel × ${bpp} bit = <b>${de(bitImg, 0)} bit</b>`, `Alle Bilder: × ${fps} Bilder/s × ${sec} s = <b>${de(bitAll, 0)} bit</b>`, `In Byte: ÷ 8 = <b>${de(by, 0)} Byte</b>`, `In MiB: ÷ 1.024 ÷ 1.024 = <b>${de(mib)} MiB</b>`],
        fig: T.chain([{ v: `${w}×${h}`, s: "Pixel" }, "× " + bpp + " bit", { v: de(bitImg, 0), s: "bit pro Bild" }, `× ${fps} × ${sec}`, { v: de(bitAll, 0), s: "bit gesamt" }, "÷ 8", { v: de(by, 0), s: "Byte" }, "÷ 1.024²", { v: de(mib) + " MiB", s: "Ergebnis" }], "Rechenweg Datenmenge Video"), figCap: "Vom einzelnen Pixel zur Datenmenge des ganzen Videos." };
    } };

  // ---------- Strom ----------
  AP2.GEN.strom = { part: "GA1", label: "Stromkosten",
    howto: `<p><b>Idee:</b> Energie = Leistung × Zeit. Strom wird in <b>kWh</b> (Kilowattstunden) abgerechnet.</p>
      <ol><li>Gesamtleistung = Anzahl × Watt.</li><li>Watt → Kilowatt: ÷ 1.000.</li><li>× Stunden pro Jahr (24 × 365 = 8.760) = kWh.</li><li>× Preis pro kWh = Kosten.</li></ol>
      <p><b>Mini-Beispiel (Winter 2023/24):</b> 4 × 0,6 kW × 24 × 365 × 0,40 € = <b>8.409,60 €</b>.</p>
      <p><b>Typischer Fehler:</b> Watt nicht in Kilowatt umgerechnet – das Ergebnis ist dann 1.000-mal zu groß.</p>`,
    make() {
      const n = R(2, 10); const w = R(3, 18) * 50; const p = pick([0.25, 0.3, 0.35, 0.4]); const kw = n * w / 1000, kwh = kw * 8760, e = kwh * p;
      return { prompt: `<b>${n} Server</b> mit je <b>${w} W</b> laufen rund um die Uhr. Strompreis <b>${de(p)} €/kWh</b>. Stromkosten pro Jahr?`,
        fields: [{ l: "€ pro Jahr", type: "num", a: +e.toFixed(2), tol: 1 }],
        steps: [`Gesamtleistung: ${n} × ${w} W = ${de(n * w, 0)} W = <b>${de(kw, 3)} kW</b>`, `Energie im Jahr: ${de(kw, 3)} kW × 8.760 h = <b>${de(kwh, 1)} kWh</b>`, `Kosten: ${de(kwh, 1)} kWh × ${de(p)} € = <b>${de(e)} €</b>`],
        fig: T.chain([{ v: `${n} × ${w} W`, s: "Server" }, "÷ 1.000", { v: de(kw, 3) + " kW", s: "Leistung" }, "× 8.760 h", { v: de(kwh, 1) + " kWh", s: "Energie/Jahr" }, "× " + de(p) + " €", { v: de(e) + " €", s: "Kosten/Jahr" }], "Rechenweg Stromkosten"), figCap: "Leistung in kW, mal Stunden im Jahr, mal Preis." };
    } };

  // ---------- Netzteil ----------
  AP2.GEN.netzteil = { part: "GA1", label: "Netzteil",
    howto: `<p><b>Idee:</b> Das Netzteil muss alle Bauteile versorgen und eine Reserve haben. Weil kein Netzteil 100 % effizient ist, muss es noch mehr leisten können.</p>
      <ol><li>Alle Verbraucher addieren (Anzahl × Watt).</li><li>Reserve aufschlagen: × (1 + Reserve), z. B. × 1,2 bei 20 %.</li><li>Wirkungsgrad berücksichtigen: ÷ Wirkungsgrad, z. B. ÷ 0,9 bei 90 %.</li><li>Das nächstgrößere Netzteil aus der Liste wählen.</li></ol>
      <p><b>Mini-Beispiel (Sommer 2026):</b> 304 W × 1,2 ÷ 0,9 = 405,3 W → <b>450-W-Netzteil</b>.</p>
      <p><b>Typische Fehler:</b> Mit dem Wirkungsgrad multipliziert statt geteilt. Abgerundet statt das nächstgrößere Netzteil genommen.</p>`,
    make() {
      const cpu = R(13, 25) * 5, hdd = R(4, 12), fan = R(2, 6); const parts = [["Mainboard", 40], ["2 CPUs", 2 * cpu], [hdd + " HDDs", hdd * 6], [fan + " Lüfter", fan * 5]];
      const sum = parts.reduce((a, p) => a + p[1], 0); const res = pick([20, 25, 30]); const eta = pick([85, 88, 90, 92]);
      const withRes = sum * (1 + res / 100), need = withRes / (eta / 100); const sizes = [300, 400, 450, 500, 550, 650, 750, 850, 1000, 1200, 1600]; const psu = sizes.find(s => s >= need);
      const x0 = 120, sc = 520 / (psu * 1.08); let g = "", x = x0;
      g += T.text(x0 - 8, 32, "Bauteile", { a: "end", w: 600, fs: 11.5 });
      parts.forEach((p, i) => { const w = p[1] * sc; g += T.rect(x, 16, w - 1, 26, "f-c" + (i + 1), 2); if (w > 40) g += T.text(x + w / 2, 33, p[1] + " W", { a: "middle", fs: 10 }); x += w; });
      g += T.text(x + 6, 33, "= " + sum + " W", { fs: 11, w: 600 });
      g += T.text(x0 - 8, 74, "+ Reserve", { a: "end", w: 600, fs: 11.5 }) + T.rect(x0, 58, sum * sc, 26, "f-net", 2) + T.rect(x0 + sum * sc, 58, (withRes - sum) * sc, 26, "f-host", 2) + T.text(x0 + withRes * sc + 6, 75, "= " + de(withRes, 1) + " W", { fs: 11, w: 600 });
      g += T.text(x0 - 8, 116, "÷ Wirkungsgrad", { a: "end", w: 600, fs: 11.5 }) + T.rect(x0, 100, need * sc, 26, "f-acc", 2) + T.text(x0 + need * sc + 6, 117, "= " + de(need, 1) + " W", { fs: 11, w: 600 });
      g += T.line(x0 + psu * sc, 8, x0 + psu * sc, 140, "s-acc") + T.text(x0 + psu * sc, 156, "Netzteil " + psu + " W", { a: "middle", c: "t ta", w: 700, fs: 11.5 });
      parts.forEach((p, i) => { g += T.rect(14 + i * 150, 172, 12, 12, "f-c" + (i + 1), 2) + T.text(32 + i * 150, 182, p[0], { fs: 11 }); });
      return { prompt: `Mainboard 40 W, 2 CPUs à ${cpu} W, ${hdd} Festplatten à 6 W, ${fan} Lüfter à 5 W. Reserve <b>${res} %</b>, Wirkungsgrad <b>${eta} %</b>. Verfügbare Netzteile: ${sizes.join(", ")} W.`,
        fields: [{ l: "Benötigte Leistung in W", type: "num", a: +need.toFixed(2), tol: 0.6 }, { l: "Netzteilgröße in W", type: "num", a: psu, tol: 0 }],
        steps: [`Verbraucher: 40 + 2 × ${cpu} + ${hdd} × 6 + ${fan} × 5 = <b>${sum} W</b>`, `Reserve ${res} %: ${sum} W × ${de(1 + res / 100)} = <b>${de(withRes, 2)} W</b>`, `Wirkungsgrad ${eta} %: ${de(withRes, 2)} W ÷ ${de(eta / 100)} = <b>${de(need, 2)} W</b>`, `Nächstgrößeres Netzteil in der Liste: <b>${psu} W</b>`],
        fig: T.svg(680, 192, g, "Leistungsbedarf als Balken"), figCap: "Drei Balken: Bauteile, dann mit Reserve, dann geteilt durch den Wirkungsgrad. Die Linie ist das gewählte Netzteil." };
    } };

  // ---------- Bitbedarf ----------
  AP2.GEN.bits = { part: "GA1", label: "Bitbedarf",
    howto: `<p><b>Idee:</b> Mit n Bit kann man 2<sup>n</sup> verschiedene Werte darstellen, also <b>0 bis 2<sup>n</sup> − 1</b>.</p>
      <ol><li>Suche die kleinste Zweierpotenz, die <b>größer</b> als der Höchstwert ist.</li><li>Der Exponent ist die Bitzahl.</li></ol>
      <div class="scroll"><table class="small mono"><tbody><tr><td>2<sup>8</sup> = 256</td><td>2<sup>10</sup> = 1.024</td><td>2<sup>16</sup> = 65.536</td><td>2<sup>20</sup> ≈ 1,05 Mio.</td><td>2<sup>24</sup> ≈ 16,8 Mio.</td><td>2<sup>30</sup> ≈ 1,07 Mrd.</td><td>2<sup>32</sup> ≈ 4,29 Mrd.</td></tr></tbody></table></div>
      <p><b>Mini-Beispiel:</b> Werte 0 bis 1.000 → 2<sup>9</sup> = 512 reicht nicht, 2<sup>10</sup> = 1.024 reicht → <b>10 Bit</b>.</p>
      <p><b>Trick (Winter 2021/22):</b> 16 TiB in KiB = 16 × 1.024 × 1.024 × 1.024 = 2<sup>4</sup> × 2<sup>10</sup> × 2<sup>10</sup> × 2<sup>10</sup> → 4 + 30 = <b>34 Bit</b>.</p>
      <p><b>Typischer Fehler:</b> „− 1“ vergessen: mit 10 Bit geht maximal 1.023, nicht 1.024.</p>`,
    make() {
      const N = pick([R(100, 999), R(1000, 99999), R(100000, 9999999), 16 * 1073741824 - 1]); const b = Math.ceil(Math.log2(N + 1)), lo = Math.pow(2, b - 1), hi = Math.pow(2, b);
      const x0 = 30, W = 600, xp = v => x0 + v / hi * W; let g = "";
      g += T.line(x0, 60, x0 + W, 60, "s-line") + T.rect(x0, 54, xp(lo) - x0, 12, "f-bad", 2) + T.rect(xp(lo), 54, x0 + W - xp(lo), 12, "f-good", 2);
      [[0, "0"], [lo, `2^${b - 1} = ${de(lo, 0)}`], [hi, `2^${b} = ${de(hi, 0)}`]].forEach(([v, t], i) => { g += T.line(xp(v), 48, xp(v), 72) + T.text(xp(v), i === 1 ? 92 : 92, t, { a: i === 0 ? "start" : i === 2 ? "end" : "middle", fs: 11 }); });
      g += T.line(xp(N), 30, xp(N), 66, "s-acc") + T.text(xp(N), 24, "Höchstwert " + de(N, 0), { a: xp(N) > 480 ? "end" : "middle", c: "t ta", w: 700, fs: 11.5 });
      g += T.text(x0, 118, `Rot: mit ${b - 1} Bit darstellbar (bis ${de(lo - 1, 0)}). Grün: mit ${b} Bit (bis ${de(hi - 1, 0)}).`, { fs: 11 });
      return { prompt: `Wie viele Bit braucht eine vorzeichenlose Variable mindestens, um alle Werte von 0 bis <b>${de(N, 0)}</b> darzustellen?`,
        fields: [{ l: "Bit", type: "num", a: b, tol: 0 }],
        steps: [`Gesucht: kleinste Zweierpotenz größer als ${de(N, 0)}.`, `2<sup>${b - 1}</sup> = ${de(lo, 0)} → damit geht nur bis ${de(lo - 1, 0)}. Reicht <b>nicht</b>.`, `2<sup>${b}</sup> = ${de(hi, 0)} → damit geht bis ${de(hi - 1, 0)}. Reicht ✓`, `Ergebnis: <b>${b} Bit</b>`],
        fig: T.svg(660, 128, g, "Zahlenstrahl Bitbedarf"), figCap: "Der Höchstwert liegt im grünen Bereich: Erst mit dieser Bitzahl passt er hinein." };
    } };

  // ---------- Unix-Rechte ----------
  AP2.GEN.chmod = { part: "GA1", label: "Unix-Rechte",
    howto: `<p><b>Idee:</b> Jede Datei hat Rechte für drei Gruppen: <b>Eigentümer</b>, <b>Gruppe</b>, <b>Andere</b> – immer in dieser Reihenfolge. Pro Gruppe gibt es r (lesen), w (schreiben), x (ausführen).</p>
      <p>Jedes Recht hat einen Wert: <b>r = 4, w = 2, x = 1</b>. Die Werte einer Gruppe werden addiert → eine Ziffer von 0 bis 7. Drei Ziffern = drei Gruppen.</p>
      <div class="scroll"><table class="small mono"><tbody><tr><td>7 rwx</td><td>6 rw-</td><td>5 r-x</td><td>4 r--</td><td>3 -wx</td><td>2 -w-</td><td>1 --x</td><td>0 ---</td></tr></tbody></table></div>
      <p><b>Mini-Beispiel (Winter 2023/24):</b> chmod 664 → rw- rw- r-- (Eigentümer und Gruppe lesen und schreiben, Andere nur lesen).</p>
      <p><b>Typische Fehler:</b> Reihenfolge verwechselt. w = 2 und x = 1 vertauscht.</p>`,
    make() {
      const s = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"]; const o = [R(4, 7), R(0, 7), R(0, 7)]; const sym = o.map(x => s[x]).join(""); const oct = o.join("");
      const groups = ["Eigentümer", "Gruppe", "Andere"], letters = ["r", "w", "x"], vals = [4, 2, 1]; let g = "";
      o.forEach((d, gi) => {
        const x = 16 + gi * 200; g += T.text(x + 84, 16, groups[gi], { a: "middle", w: 700 });
        for (let k = 0; k < 3; k++) { const on = s[d][k] !== "-"; g += T.rect(x + k * 58, 26, 52, 44, on ? "f-acc" : "f-sub", 6) + T.text(x + k * 58 + 26, 46, letters[k], { a: "middle", c: on ? "t f-acc-t" : "tm", w: 700 }) + T.text(x + k * 58 + 26, 63, "= " + vals[k], { a: "middle", c: on ? "t f-acc-t" : "tm", fs: 10.5 }); }
        const parts = [0, 1, 2].filter(k => s[d][k] !== "-").map(k => vals[k]);
        g += T.text(x + 84, 92, (parts.length ? parts.join(" + ") : "0") + " = " + d, { a: "middle", w: 700 });
      });
      g += T.text(316, 122, `chmod ${oct}  ↔  ${sym}`, { a: "middle", w: 700, fs: 13 });
      const steps = o.map((d, i) => `${groups[i]}: ${s[d]} → ${[0, 1, 2].filter(k => s[d][k] !== "-").map(k => letters[k] + "=" + vals[k]).join(" + ") || "nichts"} = <b>${d}</b>`);
      const A = Math.random() < 0.5;
      steps.push(`Zusammen: <b>${A ? oct : sym}</b>`);
      return A
        ? { prompt: `Welche Oktalzahl entspricht den Rechten <b class="mono">${sym}</b>?`, fields: [{ l: "chmod (3 Ziffern)", type: "text", a: oct }], steps, fig: T.svg(632, 132, g, "Rechte als Tabelle"), figCap: "Blau = Recht gesetzt. Die Werte pro Gruppe zusammenzählen." }
        : { prompt: `Welche Rechte setzt <b class="mono">chmod ${oct}</b>? (9 Zeichen, z. B. rwxr-x---)`, fields: [{ l: "Rechte", type: "text", a: sym }], steps: o.map((d, i) => `${groups[i]}: ${d} = ${[0, 1, 2].filter(k => s[d][k] !== "-").map(k => vals[k]).join(" + ") || "0"} → <b>${s[d]}</b>`).concat([`Zusammen: <b>${sym}</b>`]), fig: T.svg(632, 132, g, "Rechte als Tabelle"), figCap: "Jede Ziffer in 4, 2 und 1 zerlegen: 4 = r, 2 = w, 1 = x." };
    } };
})();
