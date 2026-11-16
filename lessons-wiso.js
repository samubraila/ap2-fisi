// Lektionen WiSo
(function () {
  const D = AP2.D, L = AP2.LESSONS, t = D.t, r = D.r, K = "f-host", P = "f-net";

  L["w-bbig"] = { time: 40, kw: /ausbild|probezeit|bbig|azubi|zeugnis|fortbildung/i, train: [],
    ex: `<p>Das <b>Berufsbildungsgesetz (BBiG)</b> regelt die Ausbildung. Der Ausbildungsvertrag beginnt mit der <b>Probezeit</b>: mindestens 1, höchstens 4 Monate. In der Probezeit können beide Seiten <b>jederzeit ohne Frist</b> kündigen (schriftlich).</p>
      <p><b>Nach der Probezeit</b>: Der Betrieb kann nur noch <b>fristlos aus wichtigem Grund</b> kündigen. Der Azubi kann mit <b>4 Wochen Frist</b> kündigen, wenn er die Ausbildung aufgibt oder einen anderen Beruf lernen will. Immer schriftlich und mit Begründung.</p>
      <p>Die Ausbildung endet mit Ablauf der Vertragszeit – <b>besteht der Azubi vorher die Prüfung, endet sie mit Bekanntgabe des Ergebnisses</b>. Arbeitet er danach ohne Absprache weiter, entsteht automatisch ein <b>unbefristetes Arbeitsverhältnis</b>.</p>
      <p>Ausbilder müssen <b>persönlich und fachlich geeignet</b> sein. Azubis müssen über Betriebsgeheimnisse schweigen. Am Ende gibt es ein Zeugnis – qualifiziert (mit Leistung und Verhalten) auf Wunsch. <b>Fortbildung</b> = im Beruf weiterqualifizieren, <b>Umschulung</b> = neuen Beruf lernen.</p>`,
    figs: [{ cap: "Zeitstrahl einer Ausbildung: Was gilt in welcher Phase?", f: () => {
      let s = D.l(20, 70, 650, 70, "s-line");
      s += r(20, 56, 130, 28, K, 4) + t(85, 75, "Probezeit 1–4 Mon.", { a: "middle", fs: 11, w: 600 });
      s += r(150, 56, 370, 28, P, 4) + t(335, 75, "Ausbildung", { a: "middle", fs: 11, w: 600 });
      s += r(520, 56, 130, 28, "f-acc", 4) + t(585, 75, "Arbeitsvertrag", { a: "middle", fs: 11, w: 600, c: "t f-acc-t" });
      s += t(20, 40, "Vertragsbeginn", { fs: 10.5, c: "tm" }) + t(520, 40, "Prüfung bestanden = Ende", { a: "middle", fs: 10.5, w: 700 }) + D.l(520, 46, 520, 96, "s-acc");
      s += D.box(20, 104, 130, 62, "Kündigung beidseitig\njederzeit, ohne Frist,\nschriftlich", "f-box", { fs: 10, bold: false });
      s += D.box(160, 104, 350, 62, "Betrieb: nur fristlos aus wichtigem Grund\nAzubi: 4 Wochen Frist bei Berufsaufgabe\noder Berufswechsel · schriftlich mit Gründen", "f-box", { fs: 10, bold: false });
      s += D.box(520, 104, 130, 62, "Weiterarbeit ohne\nAbsprache =\nunbefristet (§ 24)", "f-box", { fs: 10, bold: false });
      return D.svg(664, 176, s, "Zeitstrahl Ausbildung"); } }],
    q: { f: "Eine Auszubildende will nach der Probezeit kündigen, um eine Ausbildung in einem anderen Beruf zu beginnen. Ist das möglich? (3 Punkte)", a: "Ja. Nach der Probezeit kann die Auszubildende mit einer Frist von vier Wochen kündigen, wenn sie die Berufsausbildung aufgeben oder sich für eine andere Berufstätigkeit ausbilden lassen will. Die Kündigung muss schriftlich und mit Angabe des Grundes erfolgen." } };

  L["w-jarb"] = { time: 25, kw: /jugend|jarb|pause|urlaub/i, train: [],
    ex: `<p>Das <b>Jugendarbeitsschutzgesetz</b> gilt für alle unter 18. Die wichtigsten Zahlen:</p>
      <p><b>Arbeitszeit</b>: höchstens 8 Stunden am Tag, 40 Stunden in der Woche, 5 Tage pro Woche. Nur zwischen <b>6 und 20 Uhr</b>. Zwischen zwei Arbeitstagen mindestens <b>12 Stunden</b> Freizeit.</p>
      <p><b>Pausen</b>: bei mehr als 4,5 Stunden Arbeit 30 Minuten, bei mehr als 6 Stunden 60 Minuten. Nie länger als 4,5 Stunden am Stück ohne Pause. Eine Pause zählt erst ab 15 Minuten.</p>
      <p><b>Urlaub</b> (Werktage), je nach Alter <b>zu Beginn des Kalenderjahres</b>: noch nicht 16 → 30 Tage, noch nicht 17 → 27 Tage, noch nicht 18 → 25 Tage. Am Arbeitstag <b>vor der schriftlichen Abschlussprüfung</b> sind Jugendliche freizustellen.</p>`,
    figs: [{ cap: "Ein erlaubter Arbeitstag für Jugendliche: 8 Stunden Arbeit, 60 Minuten Pause, alles zwischen 6 und 20 Uhr.", f: () => {
      const x0 = 30, W = 600, xp = h => x0 + (h - 6) / 14 * W; let s = r(xp(6), 40, W, 34, "f-sub", 4);
      s += r(xp(8), 40, xp(12) - xp(8), 34, P, 0) + t((xp(8) + xp(12)) / 2, 62, "Arbeit 4 h", { a: "middle", fs: 11, w: 600 });
      s += r(xp(12), 40, xp(13) - xp(12), 34, K, 0) + t((xp(12) + xp(13)) / 2, 62, "Pause", { a: "middle", fs: 10.5 });
      s += r(xp(13), 40, xp(17) - xp(13), 34, P, 0) + t((xp(13) + xp(17)) / 2, 62, "Arbeit 4 h", { a: "middle", fs: 11, w: 600 });
      for (let h = 6; h <= 20; h += 2) s += D.l(xp(h), 76, xp(h), 82) + t(xp(h), 96, h + " Uhr", { a: "middle", c: "tm", fs: 10 });
      s += t(x0, 28, "erlaubt: 6–20 Uhr", { fs: 11, w: 600 });
      s += t(x0, 124, "> 4,5 h → 30 min Pause · > 6 h → 60 min · max. 8 h/Tag, 40 h/Woche · 12 h Freizeit bis zum nächsten Tag", { fs: 11 });
      return D.svg(664, 136, s, "Arbeitstag nach JArbSchG"); } }],
    q: { f: "Ein 17-jähriger Auszubildender arbeitet 7 Stunden. Wie lange müssen die Ruhepausen mindestens dauern? (3 Punkte)", a: "Bei einer Arbeitszeit von mehr als 6 Stunden müssen die Ruhepausen insgesamt mindestens 60 Minuten betragen (Pausen zählen erst ab 15 Minuten)." } };

  L["w-br"] = { time: 30, kw: /betriebsrat|jav|betriebsvereinbarung|anhörung/i, train: [],
    ex: `<p>Der <b>Betriebsrat</b> vertritt die Interessen der Arbeitnehmer gegenüber dem Arbeitgeber (Betriebsverfassungsgesetz). Er kann ab 5 Arbeitnehmern gewählt werden. <b>Wählen</b> darf man ab 16, <b>gewählt werden</b> ab 18 und nach 6 Monaten im Betrieb.</p>
      <p>Rechte: <b>Mitbestimmung</b> (z. B. Arbeitszeit, Urlaubsplan, Überwachungstechnik wie MDM), <b>Mitwirkung</b>, <b>Information</b>. Vor jeder Kündigung muss er <b>angehört</b> werden – sonst ist die Kündigung unwirksam.</p>
      <p>Die <b>JAV</b> (Jugend- und Auszubildendenvertretung) vertritt Jugendliche unter 18 und Azubis unter 25. Sie arbeitet <b>über den Betriebsrat</b>: Sie kann dort Maßnahmen beantragen, verhandelt aber nicht direkt mit der Geschäftsführung.</p>
      <p>Eine <b>Betriebsvereinbarung</b> ist ein Vertrag zwischen Arbeitgeber und Betriebsrat für den ganzen Betrieb.</p>`,
    figs: [{ cap: "Wer vertritt wen? Die JAV wirkt über den Betriebsrat, der mit dem Arbeitgeber verhandelt.", f: () => {
      let s = D.box(250, 10, 160, 40, "Arbeitgeber", "f-box") + D.box(250, 100, 160, 40, "Betriebsrat", "f-acc") + D.box(470, 100, 180, 40, "JAV", K);
      s += D.arrow(330, 98, 330, 52, { both: true, c: "s-acc", label: "Betriebsvereinbarung, Anhörung", la: "start", lx: 6, ly: 0, fs: 10.5 }) + D.arrow(468, 120, 412, 120, { c: "s-acc", label: "beantragt", ly: -8, fs: 10.5 });
      s += D.box(10, 190, 300, 40, "Belegschaft (wählt ab 16, wählbar ab 18 + 6 Monate)", P, { fs: 10.5 }) + D.box(350, 190, 300, 40, "Azubis < 25 und Jugendliche < 18", P, { fs: 10.5 });
      s += D.arrow(160, 188, 300, 142, { label: "wählt", fs: 10.5 }) + D.arrow(500, 188, 560, 142, { label: "wählen", fs: 10.5 });
      return D.svg(664, 240, s, "Betriebsrat und JAV"); } }],
    q: { f: "Einem Mitarbeiter wurde ohne Anhörung des Betriebsrats gekündigt. Beurteilen Sie die Kündigung. (3 Punkte)", a: "Die Kündigung ist unwirksam. Nach § 102 Betriebsverfassungsgesetz muss der Betriebsrat vor jeder Kündigung angehört werden; eine ohne Anhörung ausgesprochene Kündigung ist unwirksam." } };

  L["w-tarif"] = { time: 30, kw: /tarif|streik|gewerkschaft|friedenspflicht|aussperrung|mantel/i, train: [],
    ex: `<p><b>Tarifverträge</b> schließen Gewerkschaften mit Arbeitgeberverbänden (oder einzelnen Arbeitgebern) – das nennt man <b>Tarifautonomie</b>, der Staat mischt sich nicht ein.</p>
      <p><b>Manteltarifvertrag</b>: allgemeine Bedingungen wie Arbeitszeit, Urlaub, Kündigungsfristen – läuft lange. <b>Lohn- und Gehaltstarifvertrag</b>: die Höhe der Bezahlung – läuft kurz (1–2 Jahre).</p>
      <p>Während der Laufzeit gilt die <b>Friedenspflicht</b>: kein Streik zu geregelten Punkten. Scheitern neue Verhandlungen, kann es zur <b>Schlichtung</b> kommen. Danach <b>Urabstimmung</b> (meist 75 % Zustimmung nötig) → <b>Streik</b>. Arbeitgeber können mit <b>Aussperrung</b> antworten. Einigt man sich, stimmen die Mitglieder erneut ab (meist 25 % reichen für die Annahme).</p>`,
    figs: [{ cap: "Ablauf einer Tarifrunde bis zum neuen Tarifvertrag.", f: () => D.flowH([{ t: "Tarifvertrag\nläuft aus", n: "Friedenspflicht endet" }, { t: "Verhandlungen", n: "Gewerkschaft ↔ AG-Verband" }, { t: "Scheitern,\nSchlichtung", n: "neutraler Vermittler" }, { t: "Urabstimmung", n: "meist 75 % dafür" }, { t: "Streik ↔\nAussperrung", c: "f-bad", n: "Arbeitskampf" }, { t: "neuer\nTarifvertrag", c: "f-acc", n: "Friedenspflicht" }], { bw: 92, gap: 18, label: "Ablauf einer Tarifrunde" }) }],
    q: { f: "Nennen Sie zwei Inhalte eines Manteltarifvertrags und einen Inhalt eines Gehaltstarifvertrags. (3 Punkte)", a: "Manteltarifvertrag: Arbeitszeit, Urlaubsdauer, Kündigungsfristen, Zuschläge für Nachtarbeit.\nGehaltstarifvertrag: Höhe der Gehälter bzw. Entgeltgruppen." } };

  L["w-av"] = { time: 35, kw: /kündigung|kündigungsschutz|zeugnis|befrist|§ 622/i, train: ["kuend"],
    ex: `<p><b>Kündigungsfristen nach § 622 BGB</b>: Die <b>Grundfrist</b> ist 4 Wochen zum 15. oder zum Monatsende. Kündigt der <b>Arbeitnehmer</b>, gilt immer diese Grundfrist. Kündigt der <b>Arbeitgeber</b>, verlängert sich die Frist mit der Betriebszugehörigkeit (siehe Treppe). In der Probezeit: 2 Wochen.</p>
      <p><b>Besonderer Kündigungsschutz</b>: Schwangere und Mütter, Schwerbehinderte (Zustimmung des Integrationsamts), Betriebsrats- und JAV-Mitglieder, Azubis nach der Probezeit, Personen in Elternzeit.</p>
      <p><b>Zeugnis</b>: <b>Einfaches</b> Zeugnis = Art und Dauer der Tätigkeit. <b>Qualifiziertes</b> Zeugnis = zusätzlich Leistung und Verhalten, auf Wunsch des Arbeitnehmers. Es muss wohlwollend formuliert sein.</p>
      <p>Ein <b>befristeter</b> Vertrag endet automatisch; ohne sachlichen Grund höchstens 2 Jahre.</p>`,
    figs: [{ cap: "Kündigungsfrist bei Kündigung durch den Arbeitgeber, je nach Jahren im Betrieb (immer zum Monatsende).", f: () => {
      const steps = [[0, "4 Wo."], [2, "1 M"], [5, "2 M"], [8, "3 M"], [10, "4 M"], [12, "5 M"], [15, "6 M"], [20, "7 M"]], x0 = 40, sx = 26, base = 170;
      let s = D.l(x0, base, x0 + 24 * sx, base) + D.l(x0, base, x0, 14);
      steps.forEach(([y, lab], i) => { const x1 = x0 + y * sx, x2 = x0 + (i < steps.length - 1 ? steps[i + 1][0] : 24) * sx, h = 18 + i * 18; s += r(x1, base - h, x2 - x1 - 2, h, i === 0 ? K : P, 2) + t((x1 + x2) / 2, base - h - 6, lab, { a: "middle", fs: 10.5, w: 600 }); s += t(x1, base + 16, y, { a: "middle", c: "tm", fs: 10 }); });
      s += t(x0 + 24 * sx, base + 16, "Jahre", { a: "end", c: "tm", fs: 10 }) + t(x0 + 6, 24, "Frist", { c: "tm", fs: 10.5 });
      return D.svg(680, 194, s, "Kündigungsfristen-Treppe"); } }],
    q: { f: "Ein Mitarbeiter ist seit 13 Jahren im Betrieb. Der Arbeitgeber kündigt ihm am 10. März. Wann endet das Arbeitsverhältnis? (3 Punkte)", a: "Nach 12 Jahren Betriebszugehörigkeit beträgt die Frist 5 Monate zum Monatsende.\n10. März + 5 Monate = 10. August → Ende des Monats: 31. August." } };

  L["w-sv"] = { time: 30, kw: /sozialversicherung|kranken|renten|unfallversicherung|beitragsbemessung|generationen|sozialgericht/i, train: ["kv"],
    ex: `<p>Die gesetzliche <b>Sozialversicherung</b> hat fünf Zweige: <b>Kranken-, Pflege-, Renten-, Arbeitslosen- und Unfallversicherung</b>. Private Versicherungen wie Haftpflicht oder Lebensversicherung gehören nicht dazu.</p>
      <p>Die Beiträge zahlen Arbeitnehmer und Arbeitgeber <b>meist je zur Hälfte</b>. Ausnahme: Die <b>Unfallversicherung</b> zahlt der Arbeitgeber allein; Träger sind die <b>Berufsgenossenschaften</b>. Sie zahlt bei Arbeitsunfällen, Wegeunfällen (direkter Weg zur Arbeit) und Berufskrankheiten.</p>
      <p>Rechnung KV: (14,6 % + Zusatzbeitrag) ÷ 2 × Brutto. Über der <b>Beitragsbemessungsgrenze</b> steigt der Beitrag nicht weiter. Die Rente funktioniert nach dem <b>Generationenvertrag</b>: Die heute Arbeitenden zahlen die heutigen Renten.</p>
      <p>Streit mit einer Sozialversicherung (z. B. Krankenkasse) → <b>Sozialgericht</b>. Streit mit dem Arbeitgeber → Arbeitsgericht.</p>`,
    figs: [{ cap: "Die fünf Säulen der Sozialversicherung und wer zahlt.", f: () => {
      const p = [["Kranken-", "AN + AG", "Krankenkasse"], ["Pflege-", "AN + AG", "Pflegekasse"], ["Renten-", "AN + AG", "Rentenvers."], ["Arbeitslosen-", "AN + AG", "Agentur f. Arbeit"], ["Unfall-", "nur AG", "Berufsgenoss."]];
      let s = `<polygon points="20,40 332,8 644,40" class="f-acc"/>` + t(332, 34, "Gesetzliche Sozialversicherung", { a: "middle", c: "t f-acc-t", w: 700, fs: 12 });
      p.forEach(([n, z, tr], i) => { const x = 28 + i * 124; s += D.box(x, 48, 112, 110, n + "\nversicherung", i === 4 ? K : P, { fs: 11 }) + t(x + 56, 132, z, { a: "middle", fs: 11, w: 700 }) + t(x + 56, 148, tr, { a: "middle", fs: 9.5, c: "tm" }); });
      s += r(20, 162, 624, 12, "f-sub", 2);
      return D.svg(664, 182, s, "Fünf Säulen der Sozialversicherung"); } }],
    q: { f: "Bruttogehalt 4.200 €, allgemeiner Beitragssatz 14,6 %, Zusatzbeitrag 2,4 %. Berechnen Sie den Arbeitnehmeranteil zur Krankenversicherung. (3 Punkte)", a: "Gesamtsatz: 14,6 % + 2,4 % = 17,0 %; Arbeitnehmeranteil die Hälfte = 8,5 %.\n4.200 € × 8,5 % = 357,00 €." } };

  L["w-recht"] = { time: 30, kw: /gmbh|konzern|fusion|kartell|businessplan|handelsregister|rechtsform/i, train: ["gmbh", "ekr", "wirt"],
    ex: `<p><b>GmbH</b>: Stammkapital mindestens <b>25.000 €</b> (bei Gründung mindestens die Hälfte eingezahlt), Gründung auch durch <b>eine Person</b>, notarieller Gesellschaftsvertrag, Eintrag ins <b>Handelsregister</b>. Die Haftung ist auf das Gesellschaftsvermögen beschränkt. Gewinn ohne Regelung: <b>nach Geschäftsanteilen</b>.</p>
      <p><b>Unternehmenszusammenschlüsse</b>: <b>Kartell</b> = Absprache zwischen selbstständigen Unternehmen, grundsätzlich verboten (Bundeskartellamt). <b>Konzern</b> = Unternehmen bleiben rechtlich selbstständig, aber unter einheitlicher Leitung. <b>Fusion</b> = Unternehmen verschmelzen zu einem; Folgen: Einsparungen, breitere Kapitalbasis.</p>
      <p><b>Businessplan</b> bei Gründung: Geschäftsidee, Markt und Wettbewerb, Marketing, Finanz- und Investitionsplan – Grundlage für den Bankkredit.</p>
      <p>Kennzahlen: <b>Wirtschaftlichkeit</b> = Ertrag ÷ Aufwand. <b>Eigenkapitalrentabilität</b> = Gewinn ÷ Eigenkapital × 100.</p>`,
    figs: [{ cap: "Kartell: Absprache, alle bleiben selbstständig. Konzern: einheitliche Leitung, rechtlich selbstständig. Fusion: aus zwei wird eins.", f: () => {
      let s = t(10, 16, "Kartell", { w: 700 }) + D.box(10, 30, 80, 40, "A", P) + D.box(120, 30, 80, 40, "B", P) + D.arrow(92, 50, 118, 50, { both: true, dash: true }) + t(105, 90, "Absprache (verboten)", { a: "middle", fs: 10.5 });
      s += t(240, 16, "Konzern", { w: 700 }) + D.box(280, 26, 110, 30, "Leitung", "f-acc", { fs: 11 }) + D.box(240, 80, 80, 40, "A GmbH", P, { fs: 11 }) + D.box(350, 80, 80, 40, "B GmbH", P, { fs: 11 }) + D.arrow(320, 56, 285, 78) + D.arrow(350, 56, 388, 78) + t(335, 140, "rechtlich selbstständig", { a: "middle", fs: 10.5 });
      s += t(470, 16, "Fusion", { w: 700 }) + D.box(470, 30, 60, 36, "A", P) + D.box(470, 76, 60, 36, "B", P) + D.arrow(532, 48, 568, 68) + D.arrow(532, 94, 568, 76) + D.box(570, 50, 84, 44, "AB", "f-acc") + t(612, 120, "ein Unternehmen", { a: "middle", fs: 10.5 });
      return D.svg(664, 150, s, "Kartell, Konzern, Fusion"); } }],
    q: { f: "Zwei Gesellschafter gründen eine GmbH mit 85.000 € und 35.000 €. Der Gewinn beträgt 60.000 €, eine Regelung zur Verteilung fehlt. Berechnen Sie den Anteil des zweiten Gesellschafters. (3 Punkte)", a: "Ohne Regelung wird nach Geschäftsanteilen verteilt: 35.000 € ÷ 120.000 € × 60.000 € = 17.500 €." } };

  L["w-org"] = { time: 30, kw: /linien|stab|matrix|sparte|organigramm/i, train: [],
    ex: `<p>Ein <b>Organigramm</b> zeigt, wer wem Anweisungen geben darf. In der Prüfung musst du das Leitungssystem erkennen:</p>
      <p><b>Einliniensystem</b>: Jede Stelle hat <b>genau einen</b> Vorgesetzten. Klar, aber lange Dienstwege. <b>Stab-Linien-System</b>: zusätzlich <b>Stabsstellen</b> (z. B. Rechtsabteilung, IT-Sicherheit), die beraten, aber <b>keine Weisungsbefugnis</b> haben – meist seitlich gezeichnet. <b>Mehrliniensystem</b>: Eine Stelle hat <b>mehrere</b> Vorgesetzte (Fachleute). <b>Matrixorganisation</b>: Funktionsbereiche × Produkte/Projekte, jede Stelle hat zwei Vorgesetzte. <b>Spartenorganisation</b>: nach Produkten oder Regionen gegliedert.</p>`,
    figs: [{ cap: "Einliniensystem: genau ein Vorgesetzter je Stelle.", f: () => D.org([{ id: "gl", t: "Geschäftsleitung" }, { id: "v", t: "Vertrieb", parent: "gl" }, { id: "f", t: "Fertigung", parent: "gl" }, { id: "b", t: "Beschaffung", parent: "gl" }, { id: "v1", t: "Verkauf", parent: "v" }, { id: "f1", t: "Montage", parent: "f" }, { id: "b1", t: "Einkauf", parent: "b" }], { label: "Einliniensystem" }) },
      { cap: "Stab-Linien-System: Die Stabsstelle (orange, gestrichelt) berät die Leitung, darf aber keine Anweisungen geben.", f: () => D.org([{ id: "gl", t: "Geschäftsleitung" }, { id: "st", t: "Rechtsabteilung", parent: "gl", staff: true }, { id: "v", t: "Vertrieb", parent: "gl" }, { id: "f", t: "Fertigung", parent: "gl" }, { id: "b", t: "Beschaffung", parent: "gl" }], { label: "Stab-Linien-System" }) },
      { cap: "Mehrliniensystem: Die Stelle unten bekommt Anweisungen von mehreren Vorgesetzten (blau gestrichelt = zusätzliche Weisung).", f: () => D.org([{ id: "gl", t: "Geschäftsleitung" }, { id: "a", t: "Leiter Technik", parent: "gl" }, { id: "b", t: "Leiter Qualität", parent: "gl" }, { id: "m", t: "Mitarbeiterin", parent: "a", extra: ["b"] }], { label: "Mehrliniensystem" }) }],
    q: { f: "Im Organigramm berät die Rechtsabteilung die Geschäftsleitung, hat aber keine Weisungsbefugnis. Welches Leitungssystem liegt vor? (2 Punkte)", a: "Stab-Linien-System: Die Rechtsabteilung ist eine Stabsstelle, die berät, aber keine Weisungen erteilen darf; ansonsten hat jede Stelle genau einen Vorgesetzten." } };

  L["w-schutz"] = { time: 25, kw: /sicherheitszeichen|brand|feuer|unfall|arbeitsschutz/i, train: [],
    ex: `<p><b>Sicherheitszeichen</b> erkennst du an Farbe und Form: <b>Verbot</b> = roter Kreis mit Balken, <b>Gebot</b> = blauer Kreis, <b>Warnung</b> = gelbes Dreieck, <b>Rettung/Erste Hilfe</b> = grünes Rechteck, <b>Brandschutz</b> (Feuerlöscher) = rotes Rechteck.</p>
      <p><b>Im Brandfall</b>: Ruhe bewahren → Brand melden (112) → Menschen in Sicherheit bringen → Löschversuch, wenn ohne Gefahr möglich.</p>
      <p><b>Richtig löschen</b>: mit dem Wind, von vorn nach hinten, von unten nach oben, Tropf- und Fließbrände von oben nach unten, mehrere Löscher gleichzeitig statt nacheinander, benutzte Löscher nicht wieder aufhängen.</p>
      <p>Der Arbeitgeber muss für Arbeitssicherheit sorgen und regelmäßig (mindestens jährlich) unterweisen. Die Unfallversicherung (Berufsgenossenschaft) zahlt bei Arbeits- und Wegeunfällen.</p>`,
    figs: [{ cap: "Form und Farbe verraten die Bedeutung eines Sicherheitszeichens.", f: () => {
      let s = `<circle cx="60" cy="56" r="36" class="f-bad"/><circle cx="60" cy="56" r="26" class="f-box"/><line x1="40" y1="76" x2="80" y2="36" class="s-bad" stroke-width="6"/>` + t(60, 116, "Verbot", { a: "middle", w: 700 }) + t(60, 132, "roter Kreis", { a: "middle", c: "tm", fs: 10.5 });
      s += `<circle cx="190" cy="56" r="36" class="f-c1"/>` + t(190, 62, "!", { a: "middle", w: 700, fs: 22 }) + t(190, 116, "Gebot", { a: "middle", w: 700 }) + t(190, 132, "blauer Kreis", { a: "middle", c: "tm", fs: 10.5 });
      s += `<polygon points="320,18 362,90 278,90" class="f-warn"/>` + t(320, 80, "!", { a: "middle", w: 700, fs: 22 }) + t(320, 116, "Warnung", { a: "middle", w: 700 }) + t(320, 132, "gelbes Dreieck", { a: "middle", c: "tm", fs: 10.5 });
      s += r(410, 24, 90, 64, "f-good", 4) + t(455, 62, "→ Exit", { a: "middle", w: 700 }) + t(455, 116, "Rettung", { a: "middle", w: 700 }) + t(455, 132, "grünes Rechteck", { a: "middle", c: "tm", fs: 10.5 });
      s += r(540, 24, 90, 64, "f-bad", 4) + t(585, 62, "Löscher", { a: "middle", w: 700 }) + t(585, 116, "Brandschutz", { a: "middle", w: 700 }) + t(585, 132, "rotes Rechteck", { a: "middle", c: "tm", fs: 10.5 });
      return D.svg(664, 142, s, "Sicherheitszeichen"); } }],
    q: { f: "Im Lager ist eine Palette in Brand geraten. Nennen Sie die richtige Reihenfolge der ersten Schritte. (3 Punkte)", a: "1. Ruhe bewahren und den Brand melden (Notruf 112 bzw. Brandmelder).\n2. Gefährdete Personen warnen und in Sicherheit bringen.\n3. Löschversuch unternehmen, wenn das ohne Eigengefährdung möglich ist." } };

  L["w-umwelt"] = { time: 20, kw: /umwelt|verursacher|recycling|blauer engel|nachhaltig|emission/i, train: [],
    ex: `<p><b>Verursacherprinzip</b>: Wer Umweltschäden verursacht, muss für Vermeidung und Beseitigung zahlen. Gegensatz: Gemeinlastprinzip (die Allgemeinheit zahlt).</p>
      <p><b>Kreislaufwirtschaft</b> – die Reihenfolge ist wichtig: <b>Vermeiden</b> vor <b>Wiederverwenden</b> vor <b>Recycling</b> (Abfall wird wieder Rohstoff) vor sonstiger Verwertung (z. B. Verbrennung zur Energiegewinnung) vor <b>Beseitigen</b>.</p>
      <p>Der <b>Blaue Engel</b> kennzeichnet Produkte, die umweltschonend hergestellt und schadstoffarm sind. Das <b>Bundes-Immissionsschutzgesetz</b> schützt vor schädlichen Umwelteinwirkungen wie Abgasen, Lärm und Strahlung.</p>
      <p><b>Nachhaltig wirtschaften</b> heißt: ökologisch, ökonomisch und sozial so handeln, dass auch künftige Generationen gut leben können – z. B. Ökostrom, energiesparende Server, langlebige Geräte, Recycling von Altgeräten.</p>`,
    figs: [{ cap: "Abfallhierarchie: Oben steht das Beste (vermeiden), unten das Schlechteste (beseitigen).", f: () => {
      const lv = [["Vermeiden", "f-good"], ["Wiederverwenden", "f-c3"], ["Recycling", P], ["Sonstige Verwertung", K], ["Beseitigen", "f-bad"]]; let s = "";
      lv.forEach(([n, c], i) => { const w = 180 + i * 90, x = 332 - w / 2, y = 10 + i * 34; s += D.box(x, y, w, 30, n, c, { fs: 11.5 }); });
      s += D.arrow(640, 176, 640, 14, { c: "s-acc" }) + t(630, 100, "besser", { a: "end", c: "tm", fs: 10.5 });
      return D.svg(664, 186, s, "Abfallhierarchie"); } }],
    q: { f: "Erläutern Sie das Verursacherprinzip im Umweltschutz. (2 Punkte)", a: "Nach dem Verursacherprinzip trägt derjenige die Kosten für die Vermeidung oder Beseitigung von Umweltschäden, der sie verursacht hat – nicht die Allgemeinheit." } };

  L["w-agg"] = { time: 20, kw: /agg|diversity|gleichbehandlung|vielfalt/i, train: [],
    ex: `<p>Das <b>Allgemeine Gleichbehandlungsgesetz (AGG)</b> verbietet Benachteiligung wegen sechs Merkmalen: <b>ethnische Herkunft</b>, <b>Geschlecht</b>, <b>Religion oder Weltanschauung</b>, <b>Behinderung</b>, <b>Alter</b>, <b>sexuelle Identität</b>.</p>
      <p>Verstöße sind z. B. eine Stellenanzeige „junge Mitarbeiter gesucht“ oder eine Ablehnung wegen der Hautfarbe. <b>Erlaubt</b> sind sachliche Gründe (fehlende PC-Kenntnisse) und Ausgleichsmaßnahmen (Zusatzurlaub für Schwerbehinderte).</p>
      <p><b>Diversity Management</b> geht weiter: Das Unternehmen will die <b>Vielfalt der Belegschaft als Stärke nutzen</b>. Viele Firmen unterschreiben dazu die <b>Charta der Vielfalt</b>, eine freiwillige Selbstverpflichtung.</p>`,
    figs: [{ cap: "Die sechs geschützten Merkmale des AGG.", f: () => {
      const m = ["ethnische Herkunft", "Geschlecht", "Religion /\nWeltanschauung", "Behinderung", "Alter", "sexuelle Identität"]; let s = D.box(262, 82, 140, 50, "AGG", "f-acc", { fs: 16 });
      m.forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 3, x = 332 + Math.cos(a) * 230, y = 107 + Math.sin(a) * 82; s += D.l(332 + Math.cos(a) * 80, 107 + Math.sin(a) * 30, x - Math.cos(a) * 60, y - Math.sin(a) * 16, "s-line") + D.box(x - 72, y - 18, 144, 36, n, K, { fs: 10.5 }); });
      return D.svg(664, 214, s, "AGG-Merkmale"); } }],
    q: { f: "Prüfen Sie, ob folgende Fälle gegen das AGG verstoßen: a) Stellenanzeige „junge Mitarbeiter (m/w/d)“, b) Zusatzurlaub für einen Schwerbehinderten. (2 Punkte)", a: "a) Verstoß: Benachteiligung wegen des Alters.\nb) Kein Verstoß: Zusatzurlaub für Schwerbehinderte ist eine erlaubte Ausgleichsmaßnahme." } };

  L["w-vwl"] = { time: 30, kw: /konjunktur|marktwirtschaft|globalisierung|sektor|zielkonflikt|leitzins/i, train: [],
    ex: `<p>Die <b>Konjunktur</b> schwankt in Phasen: <b>Aufschwung</b> (Produktion und Beschäftigung steigen), <b>Boom</b> (hohe Auslastung, steigende Preise), <b>Abschwung</b> (Nachfrage sinkt), <b>Tiefstand/Rezession</b> (hohe Arbeitslosigkeit, sinkendes BIP).</p>
      <p><b>Konjunktur beleben</b>: Der Staat erhöht seine Investitionen oder senkt Steuern; die Zentralbank <b>senkt den Leitzins</b> (Kredite werden billiger). <b>Bremsen</b>: das Gegenteil.</p>
      <p><b>Soziale Marktwirtschaft</b>: freier Wettbewerb, aber der Staat sorgt für sozialen Ausgleich (Sozialversicherung, Kündigungsschutz) und schützt den Wettbewerb (Kartellamt). <b>Globalisierung</b>: weltweite Arbeitsteilung, offene Märkte, Investitionen über Grenzen.</p>
      <p><b>Wirtschaftssektoren</b>: primär (Rohstoffe, Landwirtschaft), sekundär (Industrie, Handwerk), tertiär (Dienstleistungen – auch IT). <b>Zielkonflikt</b>: Ein Ziel geht auf Kosten eines anderen (Personalkosten sparen ↔ Arbeitsplätze sichern).</p>`,
    figs: [{ cap: "Konjunkturzyklus: Die Wirtschaft wächst nicht gleichmäßig, sondern in Wellen um den langfristigen Trend.", f: () => {
      let s = D.l(30, 170, 650, 170) + D.l(30, 170, 30, 14) + `<line x1="30" y1="130" x2="650" y2="70" class="s-line s-dash"/>` + t(646, 64, "Trend", { a: "end", c: "tm", fs: 10.5 });
      s += `<path d="M30,140 C90,140 110,60 170,60 S250,150 310,150 S390,40 450,40 S540,130 600,120 L650,100" class="s-acc"/>`;
      s += t(110, 108, "Aufschwung", { a: "middle", fs: 11, w: 600 }) + t(170, 48, "Boom", { a: "middle", fs: 11, w: 700 }) + t(250, 96, "Abschwung", { a: "middle", fs: 11, w: 600 }) + t(310, 166, "Tiefstand", { a: "middle", fs: 11, w: 700 });
      s += t(640, 186, "Zeit", { a: "end", c: "tm", fs: 10.5 }) + t(36, 22, "BIP", { c: "tm", fs: 10.5 });
      return D.svg(664, 194, s, "Konjunkturzyklus"); } }],
    q: { f: "Nennen Sie zwei staatliche bzw. geldpolitische Maßnahmen, die die Konjunktur beleben. (2 Punkte)", a: "Erhöhung der staatlichen Investitionen; Senkung der Steuern; Senkung des Leitzinses durch die Zentralbank (Kredite werden günstiger)." } };
})();
