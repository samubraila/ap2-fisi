// Lektionen GA1 (Teil 2): Kryptografie, DSGVO, Programmierung, Datenbanken, UML, Tests, Lizenzen, MDM, Betriebssystem
(function () {
  const D = AP2.D, L = AP2.LESSONS, t = D.t, r = D.r, K = "f-host", P = "f-net";

  L["g1-krypto"] = { time: 35, kw: /aes|des|rsa|md5|sha|symmetr|asymmetr|hash/i, train: [],
    ex: `<p><b>Symmetrische Verschlüsselung</b> (z. B. AES): Sender und Empfänger nutzen <b>denselben Schlüssel</b>. Sehr schnell, gut für große Datenmengen und Festplatten. Problem: Wie kommt der Schlüssel sicher zum Partner?</p>
      <p><b>Asymmetrische Verschlüsselung</b> (z. B. RSA): Jeder hat ein <b>Schlüsselpaar</b>. Mit dem <b>öffentlichen Schlüssel</b> des Empfängers wird verschlüsselt, nur sein <b>privater Schlüssel</b> kann entschlüsseln. Langsamer, aber kein gemeinsames Geheimnis nötig. Wird für Schlüsselaustausch und Signaturen genutzt.</p>
      <p><b>Hashverfahren</b> (z. B. SHA-256) sind <b>keine</b> Verschlüsselung: Aus Daten wird ein fester Fingerabdruck berechnet, der sich nicht zurückrechnen lässt. Damit prüft man, ob Daten verändert wurden.</p>
      <p>Bewertung: <b>DES</b> (56 Bit) und <b>MD5</b> gelten als unsicher. <b>AES-256</b> und <b>SHA-256</b> gelten als sicher.</p>`,
    figs: [{ cap: "Oben symmetrisch (ein Schlüssel), Mitte asymmetrisch (Schlüsselpaar des Empfängers), unten Hash (nur eine Richtung).", f: () => {
      let s = ""; const row = (y, a, k1, mid, k2, b) => D.box(10, y, 100, 40, a, "f-box", { fs: 11.5 }) + D.arrow(112, y + 20, 196, y + 20, { label: k1, fs: 10.5 }) + D.box(198, y, 150, 40, mid, K, { fs: 11 }) + (k2 ? D.arrow(350, y + 20, 434, y + 20, { label: k2, fs: 10.5 }) + D.box(436, y, 110, 40, b, "f-box", { fs: 11.5 }) : "");
      s += t(10, 14, "Symmetrisch (AES)", { w: 700 }) + row(22, "Klartext", "Schlüssel K", "Geheimtext", "Schlüssel K", "Klartext");
      s += t(10, 86, "Asymmetrisch (RSA)", { w: 700 }) + row(94, "Klartext", "Public Key B", "Geheimtext", "Private Key B", "Klartext");
      s += t(10, 158, "Hash (SHA-256)", { w: 700 }) + row(166, "Daten", "Hashfunktion", "Hashwert\n(Fingerabdruck)", "", "") + D.arrow(434, 186, 352, 186, { c: "s-bad", dash: true }) + t(440, 190, "nicht umkehrbar", { c: "t", fs: 11 });
      return D.svg(560, 216, s, "Symmetrisch, asymmetrisch und Hash"); } }],
    q: { f: "Ein Unternehmen soll zwischen DES, AES und RSA für die Verschlüsselung von Festplatten wählen. Bewerten Sie die Verfahren und geben Sie eine Empfehlung. (7 Punkte)", a: "DES gilt wegen der kurzen Schlüssellänge von 56 Bit als unsicher (Brute-Force).\nAES ist ein symmetrisches Verfahren mit langen Schlüsseln (128/256 Bit), sicher und schnell.\nRSA ist asymmetrisch und wird für Schlüsselaustausch und Signaturen genutzt, nicht für die Verschlüsselung ganzer Datenträger.\nEmpfehlung: AES." } };

  L["g1-dsgvo"] = { time: 40, kw: /dsgvo|datenpanne|anonym|pseudonym|löschfrist|datenschutz|avv/i, train: [],
    ex: `<p>Die <b>DSGVO</b> schützt personenbezogene Daten (Name, Adresse, IP-Adresse, Kundennummer …). Wichtige Grundsätze: <b>Zweckbindung</b> (nur für den angegebenen Zweck nutzen), <b>Datensparsamkeit</b> (nur so viel wie nötig), <b>Löschfristen</b> (löschen, wenn der Zweck erfüllt ist).</p>
      <p><b>Datenpanne</b> (z. B. Mail mit Kundendaten an falschen Empfänger): unverzüglich bewerten, <b>innerhalb von 72 Stunden</b> der Aufsichtsbehörde melden, bei hohem Risiko auch die Betroffenen informieren, alles dokumentieren.</p>
      <p><b>Anonymisierung</b>: Der Personenbezug ist dauerhaft weg. <b>Pseudonymisierung</b>: Namen werden durch Kennungen ersetzt; mit einer getrennt gespeicherten Zuordnungstabelle kann man zurückrechnen.</p>
      <p><b>Datenträger entsorgen</b>: Formatieren reicht nicht. Mehrfach überschreiben oder durch einen zertifizierten Dienstleister physisch vernichten lassen (mit Nachweis). Für Cloud-Dienste braucht man einen <b>Auftragsverarbeitungsvertrag (AVV)</b>.</p>`,
    figs: [{ cap: "Was tun bei einer Datenpanne? Die 72 Stunden laufen ab dem Bekanntwerden.", f: () => D.flowH([{ t: "Datenpanne\nentdeckt", n: "Zeit läuft" }, { t: "Risiko\nbewerten", n: "Welche Daten?" }, { t: "Aufsichts-\nbehörde melden", c: "f-acc", n: "≤ 72 Stunden" }, { t: "Betroffene\ninformieren", n: "bei hohem Risiko" }, { t: "Dokumentieren\n+ Maßnahmen", n: "immer" }], { bw: 112, label: "Ablauf bei einer Datenpanne" }) },
      { cap: "Pseudonymisierung ist umkehrbar (mit Zuordnungstabelle), Anonymisierung nicht.", f: () => {
        let s = D.box(10, 10, 150, 40, "Max Muster\nKunde seit 2019", "f-box", { fs: 11 }) + D.arrow(162, 30, 236, 30, { label: "pseudonym", fs: 10.5 }) + D.box(238, 10, 150, 40, "K-4711\nKunde seit 2019", K, { fs: 11 }) + D.arrow(390, 30, 450, 30, { both: true, c: "s-acc" }) + D.box(452, 10, 196, 40, "Zuordnungstabelle\nK-4711 = Max Muster", P, { fs: 11 });
        s += D.box(10, 70, 150, 40, "Max Muster\nKunde seit 2019", "f-box", { fs: 11 }) + D.arrow(162, 90, 236, 90, { label: "anonym", fs: 10.5 }) + D.box(238, 70, 150, 40, "Kunde\nseit 2019", "f-sub", { fs: 11 }) + t(400, 94, "kein Rückweg möglich", { fs: 11, w: 600 });
        return D.svg(660, 120, s, "Pseudonymisierung und Anonymisierung"); } }],
    q: { f: "Ein Mitarbeiter hat versehentlich eine Kundenliste an einen externen Empfänger geschickt. Nennen Sie drei Maßnahmen, die das Unternehmen jetzt ergreifen muss. (6 Punkte)", a: "Vorfall unverzüglich der zuständigen Datenschutz-Aufsichtsbehörde melden (spätestens 72 Stunden).\nDen Empfänger kontaktieren und zur Löschung auffordern.\nBetroffene Kunden informieren, wenn ein hohes Risiko besteht; den Vorfall dokumentieren und interne Maßnahmen (z. B. Schulung) einleiten." } };

  L["g1-prog"] = { time: 60, kw: /array|index|schleife|pseudocode|int |wertebereich|syntax|semantik|modulo|ganzzahl/i, train: ["bits"],
    ex: `<p>In fast jeder GA1 gibt es eine Programmieraufgabe in Pseudocode oder einer C-ähnlichen Sprache. Typisch: <b>Schreibtischtest</b> (Variablen Schritt für Schritt verfolgen), <b>Fehler finden</b>, <b>Code ergänzen</b>.</p>
      <p><b>Arrays</b> beginnen bei Index 0. Ein Array mit 5 Werten hat die Indizes 0 bis 4. Darum heißt die Schleife <span class="mono">for (i = 0; i &lt; 5; i++)</span> – mit <b>&lt;</b>, nicht &lt;=. Sonst: „Index außerhalb des Bereichs“.</p>
      <p><b>Schreibtischtest</b>: Lege eine Tabelle an, eine Spalte pro Variable, eine Zeile pro Schleifendurchlauf. Trag nach jedem Schritt die Werte ein. Langsam und sauber arbeiten – Folgefehler werden zwar gewertet, aber jede Zeile zählt.</p>
      <p><b>Ganzzahldivision und Modulo</b>: 47 / 10 = 4 (Rest weg), 47 % 10 = 7 (nur der Rest). Damit holt man Ziffern aus Zahlen: (x / 10000) % 10. <b>Syntaxfehler</b> verletzen die Schreibregeln (Compiler meckert). <b>Semantikfehler</b>: Programm läuft, rechnet aber falsch.</p>`,
    figs: [{ cap: "Schreibtischtest einer Maximum-Suche: Jede Zeile ist ein Schleifendurchlauf.", f: () => {
      const code = ["werte = [4, 9, 2, 7]", "max = werte[0]", "for (i = 1; i < 4; i++) {", "  if (werte[i] > max)", "    max = werte[i]", "}", "ausgabe(max)"];
      let s = r(10, 10, 260, 170, "f-sub", 8); code.forEach((c, i) => { s += t(22, 34 + i * 21, c, { fs: 11.5 }); });
      const rows = [["Start", "–", "4"], ["1", "9", "9"], ["2", "2", "9"], ["3", "7", "9"]], x0 = 300, cw = [80, 100, 80];
      ["i", "werte[i]", "max"].forEach((h, k) => { const x = x0 + cw.slice(0, k).reduce((a, b) => a + b, 0); s += D.box(x, 10, cw[k] - 4, 28, h, "f-acc", { fs: 11.5 }); });
      rows.forEach((row, j) => row.forEach((v, k) => { const x = x0 + cw.slice(0, k).reduce((a, b) => a + b, 0); s += D.box(x, 42 + j * 32, cw[k] - 4, 28, v, k === 2 && j === 1 ? K : "f-box", { fs: 12, bold: false }); }));
      s += t(x0, 186, "Ergebnis: max = 9", { w: 700 });
      return D.svg(570, 196, s, "Schreibtischtest Maximum-Suche"); } }],
    q: { f: "Eine Schleife soll alle 50 Elemente eines Arrays durchlaufen: for (i = 0; i <= anzahl; i++) mit anzahl = 50. Beim Ausführen erscheint „Index außerhalb des Bereichs“. Nennen Sie Ursache und Lösung. (6 Punkte)", a: "Ursache: Das Array hat die Indizes 0 bis 49. Durch die Bedingung „<= anzahl“ wird auch Index 50 abgefragt, der nicht existiert.\nLösung: Bedingung auf „i < anzahl“ ändern (oder anzahl mit 49 initialisieren)." } };

  L["g1-db"] = { time: 40, kw: /sql|datenbank|referentiell|index|locking|kardinal|select|er-modell/i, train: [],
    ex: `<p>Eine relationale Datenbank speichert Daten in <b>Tabellen</b>. Jede Tabelle hat einen <b>Primärschlüssel (PK)</b>, der jede Zeile eindeutig macht. Ein <b>Fremdschlüssel (FK)</b> zeigt auf den Primärschlüssel einer anderen Tabelle – so entstehen Beziehungen.</p>
      <p><b>Kardinalitäten</b>: 1:1 (ein Mitarbeiter – ein Dienstwagen), <b>1:n</b> (ein Windpark – viele Windräder), n:m (viele Studenten – viele Kurse, braucht eine Zwischentabelle).</p>
      <p><b>Referentielle Integrität</b>: Ein Fremdschlüssel darf nur auf existierende Datensätze zeigen. Das verhindert Einfüge-, Lösch- und Änderungsanomalien.</p>
      <p><b>SQL-Grundform</b>: <span class="mono">SELECT COUNT(*) FROM Windrad WHERE IDWindpark = 102;</span> <b>Index</b> beschleunigt Suchen. <b>Locking</b> sperrt Datensätze, damit zwei Nutzer nicht gleichzeitig dasselbe ändern.</p>`,
    figs: [{ cap: "ER-Modell: Ein Windpark hat viele Windräder, ein Windrad hat viele Betriebsdaten. Der FK zeigt auf den PK der anderen Tabelle.", f: () => {
      const ent = (x, name, attrs) => { let s = D.box(x, 10, 170, 28, name, "f-acc", { fs: 12 }); attrs.forEach((a, i) => { s += r(x, 38 + i * 24, 170, 24, i % 2 ? "f-sub" : "f-box", 0) + t(x + 10, 54 + i * 24, a, { fs: 11, w: a.startsWith("PK") ? 700 : 400 }); }); return s; };
      let s = ent(10, "Windpark", ["PK IDWindpark", "Name", "Ort"]) + ent(250, "Windrad", ["PK IDWindrad", "FK IDWindpark", "Typ", "Baujahr"]) + ent(490, "Betriebsdaten", ["PK IDMessung", "FK IDWindrad", "Datum", "Leistung"]);
      s += D.l(180, 62, 250, 62, "s-acc") + t(186, 56, "1", { w: 700 }) + t(240, 56, "n", { a: "end", w: 700 });
      s += D.l(420, 62, 490, 62, "s-acc") + t(426, 56, "1", { w: 700 }) + t(480, 56, "n", { a: "end", w: 700 });
      return D.svg(670, 140, s, "ER-Modell Windpark"); } }],
    q: { f: "Erläutern Sie, wozu die referentielle Integrität in einer Datenbank genutzt wird. (3 Punkte)", a: "Die referentielle Integrität stellt sicher, dass Fremdschlüssel nur auf vorhandene Datensätze verweisen. Dadurch werden inkonsistente Zustände der Datenbank verhindert, also Einfüge-, Lösch- und Änderungsanomalien (z. B. ein Windrad, das zu einem nicht existierenden Windpark gehört)." } };

  L["g1-uml"] = { time: 45, kw: /uml|aktivität|klassendiagramm|aggregation|komposition|sequenz/i, train: [],
    ex: `<p>UML-Diagramme beschreiben Software. <b>Statische</b> Diagramme zeigen den Aufbau (Klassen-, Objekt-, Paketdiagramm). <b>Dynamische</b> Diagramme zeigen Abläufe (Aktivitäts-, Sequenz-, Zustandsdiagramm).</p>
      <p><b>Aktivitätsdiagramm</b> – das musst du zeichnen können: <b>Startknoten</b> (gefüllter Kreis), <b>Aktionen</b> (abgerundete Rechtecke), <b>Entscheidung</b> (Raute mit Bedingungen in eckigen Klammern [ja]/[nein]), <b>Zusammenführung</b> (Raute), <b>Endknoten</b> (Kreis mit Punkt). Pfeile zeigen die Reihenfolge.</p>
      <p><b>Klassendiagramm</b>: Kasten mit Name, Attributen und Methoden. <b>Aggregation</b> (leere Raute): Das Teil kann ohne das Ganze existieren (Mitarbeiter ohne Abteilung). <b>Komposition</b> (gefüllte Raute): Das Teil existiert nur mit dem Ganzen (Raum ohne Gebäude gibt es nicht).</p>`,
    figs: [{ cap: "Aktivitätsdiagramm: nächtliches Backup mit Entscheidung. Bedingungen stehen in eckigen Klammern.", f: () => {
      const cx = 200; let s = `<circle cx="${cx}" cy="20" r="10" class="f-acc"/>`;
      s += D.arrow(cx, 30, cx, 50) + D.box(cx - 80, 50, 160, 34, "Backup starten", K, { rx: 16 });
      s += D.arrow(cx, 84, cx, 104) + D.box(cx - 80, 104, 160, 34, "Prüfsumme prüfen", K, { rx: 16 });
      s += D.arrow(cx, 138, cx, 158) + `<polygon points="${cx},158 ${cx + 22},180 ${cx},202 ${cx - 22},180" class="f-box"/>`;
      s += D.arrow(cx - 22, 180, 90, 180) + D.arrow(90, 180, 90, 218) + t(150, 172, "[fehlerhaft]", { a: "middle", fs: 11 }) + D.box(10, 218, 160, 34, "Admin per Mail\nbenachrichtigen", K, { rx: 16, fs: 11 });
      s += D.arrow(cx + 22, 180, 310, 180) + D.arrow(310, 180, 310, 218) + t(256, 172, "[ok]", { a: "middle", fs: 11 }) + D.box(230, 218, 160, 34, "Protokoll schreiben", K, { rx: 16, fs: 11 });
      s += `<polygon points="${cx},270 ${cx + 18},288 ${cx},306 ${cx - 18},288" class="f-box"/>` + `<polyline points="90,252 90,288 ${cx - 18},288" class="s-line"/><polyline points="310,252 310,288 ${cx + 18},288" class="s-line"/>`;
      s += D.arrow(cx, 306, cx, 326) + `<circle cx="${cx}" cy="338" r="11" class="f-box"/><circle cx="${cx}" cy="338" r="6" class="f-acc"/>`;
      s += t(430, 30, "● Startknoten", { fs: 11 }) + t(430, 52, "▭ Aktion (abgerundet)", { fs: 11 }) + t(430, 74, "◇ Entscheidung / Zusammenführung", { fs: 11 }) + t(430, 96, "◉ Endknoten", { fs: 11 }) + t(430, 118, "[…] Bedingung am Pfeil", { fs: 11 });
      return D.svg(660, 356, s, "UML-Aktivitätsdiagramm"); } },
      { cap: "Klassendiagramm: Komposition (gefüllte Raute) und Aggregation (leere Raute). Die Raute sitzt immer beim Ganzen.", f: () => {
        const cls = (x, y, n, a) => D.box(x, y, 140, 28, n, "f-acc", { fs: 12 }) + r(x, y + 28, 140, 40, "f-box", 0) + t(x + 8, y + 46, a[0], { fs: 10.5 }) + t(x + 8, y + 62, a[1], { fs: 10.5 });
        let s = cls(10, 10, "Gebäude", ["- adresse: String", "+ raeumeZeigen()"]) + cls(260, 10, "Raum", ["- nummer: int", "+ belegen()"]);
        s += `<polygon points="150,38 162,32 174,38 162,44" class="f-acc"/>` + D.l(174, 38, 260, 38, "s-line") + t(178, 30, "1", { fs: 11 }) + t(252, 30, "1..*", { a: "end", fs: 11 }) + t(205, 62, "Komposition", { a: "middle", fs: 11, w: 700 });
        s += cls(10, 100, "Abteilung", ["- name: String", "+ einstellen()"]) + cls(260, 100, "Mitarbeiter", ["- persNr: int", "+ arbeiten()"]);
        s += `<polygon points="150,128 162,122 174,128 162,134" class="f-box"/>` + D.l(174, 128, 260, 128, "s-line") + t(178, 120, "1", { fs: 11 }) + t(252, 120, "0..*", { a: "end", fs: 11 }) + t(205, 152, "Aggregation", { a: "middle", fs: 11, w: 700 });
        s += t(420, 40, "Raum ohne Gebäude: gibt es nicht", { fs: 11 }) + t(420, 130, "Mitarbeiter ohne Abteilung: möglich", { fs: 11 });
        return D.svg(660, 178, s, "Komposition und Aggregation"); } }],
    q: { f: "Ordnen Sie den folgenden UML-Diagrammen die statische oder dynamische Sicht zu: Klassendiagramm, Aktivitätsdiagramm, Sequenzdiagramm, Objektdiagramm. (4 Punkte)", a: "Statische Sicht (logischer Aufbau): Klassendiagramm, Objektdiagramm.\nDynamische Sicht (Abläufe/Interaktionen): Aktivitätsdiagramm, Sequenzdiagramm." } };

  L["g1-test"] = { time: 25, kw: /white-box|black-box|test|exception|laufzeit/i, train: [],
    ex: `<p><b>White-Box-Test</b>: Der Tester kennt den Quellcode und testet gezielt alle Zweige und Schleifen. Vorteil: findet Logikfehler im Code. Nachteil: Code muss offengelegt werden, bei großen Programmen aufwendig.</p>
      <p><b>Black-Box-Test</b>: Der Tester kennt nur die Spezifikation (was soll rauskommen?). Er gibt Testdaten ein und vergleicht die Ausgabe mit dem erwarteten Ergebnis. Qualität hängt stark von guten Testdaten ab (Grenzwerte, ungültige Eingaben).</p>
      <p><b>Laufzeitfehler (Exceptions)</b> treten erst beim Ausführen auf: Array-Index außerhalb des Bereichs, Division durch 0, Datei nicht gefunden, Lesen über das Dateiende.</p>`,
    figs: [{ cap: "White-Box: Man sieht in das Programm hinein. Black-Box: Man prüft nur Eingabe und Ausgabe.", f: () => {
      let s = t(10, 16, "White-Box-Test", { w: 700 }) + r(70, 26, 190, 110, "f-box", 8); ["if (x > 0)", "  y = x * 2", "else", "  y = 0"].forEach((c, i) => { s += t(84, 50 + i * 20, c, { fs: 11 }); });
      s += D.arrow(10, 80, 68, 80, { label: "Test", fs: 10.5 }) + t(165, 150, "Code bekannt, Zweige testen", { a: "middle", c: "tm", fs: 11 });
      s += t(340, 16, "Black-Box-Test", { w: 700 }) + r(430, 26, 140, 110, "f-acc", 8) + t(500, 86, "?", { a: "middle", c: "t f-acc-t", fs: 30, w: 700 });
      s += D.arrow(340, 60, 428, 60, { label: "x = 5", fs: 10.5 }) + D.arrow(340, 104, 428, 104, { label: "x = −1", fs: 10.5 }) + D.arrow(572, 60, 652, 60, { label: "y = 10 ✓", fs: 10.5 }) + D.arrow(572, 104, 652, 104, { label: "y = 0 ✓", fs: 10.5 });
      s += t(500, 150, "nur Spezifikation bekannt", { a: "middle", c: "tm", fs: 11 });
      return D.svg(664, 160, s, "White-Box- und Black-Box-Test"); } }],
    q: { f: "Beschreiben Sie jeweils das White-Box- und das Black-Box-Testverfahren. (6 Punkte)", a: "White-Box: Grundlage ist die Analyse des Quellcodes. Tests werden anhand der Programmstruktur (Zweige, Schleifen) erstellt. Der Code muss offengelegt werden; bei großen Programmen ist das aufwendig.\nBlack-Box: Die innere Struktur ist unbekannt. Getestet wird gegen die Spezifikation mit ausgewählten Testdaten; die Zuverlässigkeit hängt stark von der Auswahl der Testdaten ab." } };

  L["g1-lizenz"] = { time: 25, kw: /cal|lizenz|update|upgrade|patch/i, train: [],
    ex: `<p>Für den Zugriff auf Server-Software (z. B. Windows Server) braucht man <b>Client Access Licenses (CALs)</b>.</p>
      <p><b>User-CAL</b>: Lizenz pro Person. Die Person darf mit beliebig vielen Geräten zugreifen. Sinnvoll, wenn Mitarbeitende Laptop, Smartphone und Tablet nutzen. <b>Device-CAL</b>: Lizenz pro Gerät. Beliebig viele Personen dürfen dieses Gerät nutzen. Sinnvoll bei Schichtbetrieb oder Kiosk-PCs.</p>
      <p><b>Update/Patch</b>: behebt Fehler und schließt Sicherheitslücken, meist kostenlos, kein neuer Funktionsumfang. <b>Upgrade</b>: neue Hauptversion mit neuen Funktionen, oft kostenpflichtig.</p>
      <p><b>Patch-Management</b> zentral (z. B. WSUS): Patches bewerten, testen, priorisieren und gesteuert verteilen – spart Internet-Bandbreite.</p>`,
    figs: [{ cap: "User-CAL: eine Lizenz für eine Person mit vielen Geräten. Device-CAL: eine Lizenz für ein Gerät mit vielen Personen.", f: () => {
      let s = t(10, 16, "User-CAL (1 Lizenz)", { w: 700 }) + D.node(80, 90, "user", "Person", { c: "f-acc" });
      [["Laptop", 40], ["Handy", 95], ["Tablet", 150]].forEach(([n, y]) => { s += D.arrow(100, 90, 210, y + 10, { c: "s-acc" }) + D.node(240, y + 4, "pc", "", { c: P }) + t(276, y + 10, n, { fs: 11 }); });
      s += t(350, 16, "Device-CAL (1 Lizenz)", { w: 700 }) + D.node(420, 96, "pc", "PC Schicht", { c: "f-acc" });
      [["Früh", 40], ["Spät", 95], ["Nacht", 150]].forEach(([n, y]) => { s += D.arrow(530, y + 6, 448, 96, { c: "s-acc" }) + D.node(560, y + 4, "user", "", { c: K }) + t(584, y + 8, n, { fs: 11 }); });
      return D.svg(660, 200, s, "User-CAL und Device-CAL"); } }],
    q: { f: "Erläutern Sie User-CALs und Device-CALs und nennen Sie je einen sinnvollen Einsatzfall. (6 Punkte)", a: "User-CAL: wird pro Benutzer erworben, der Benutzer darf mit beliebig vielen Geräten zugreifen. Sinnvoll, wenn Mitarbeitende mehrere Geräte nutzen oder es mehr Geräte als Nutzer gibt.\nDevice-CAL: wird pro Gerät erworben, unabhängig davon, wie viele Personen das Gerät nutzen. Sinnvoll bei geteilten Geräten, z. B. im Schichtbetrieb." } };

  L["g1-mdm"] = { time: 25, kw: /mdm|mobil|byod|wipe|smartphone/i, train: [],
    ex: `<p><b>MDM (Mobile Device Management)</b> verwaltet Smartphones, Tablets und Laptops zentral: Richtlinien (z. B. PIN-Pflicht), Apps verteilen, Geräte orten, <b>sperren (Lock)</b> und <b>löschen (Wipe)</b>, wenn ein Gerät verloren geht.</p>
      <p>Bei <b>BYOD</b> (Bring Your Own Device) nutzen Mitarbeitende private Geräte dienstlich. Ein <b>Container</b> trennt Firmendaten von privaten Daten: Die Firma kann den Container löschen, aber nicht auf private Fotos zugreifen.</p>
      <p>Weil MDM Leistung und Verhalten der Mitarbeitenden überwachen kann, braucht es eine <b>Betriebsvereinbarung</b> mit dem Betriebsrat: Passwortrichtlinien, Privatnutzung, Bewegungsdaten, Schulungen.</p>
      <p>Weitere Schutzmaßnahmen: Verschlüsselung, Zwei-Faktor-Anmeldung, keine Daten lokal speichern, TPM und Secure Boot bei Laptops.</p>`,
    figs: [{ cap: "Der MDM-Server steuert alle Geräte. Auf jedem Gerät trennt ein Container Firmendaten (blau) von privaten Daten.", f: () => {
      let s = D.node(330, 40, "server", "MDM-Server", { c: "f-acc" });
      [["Smartphone", 90], ["Tablet", 330], ["Laptop", 570]].forEach(([n, x]) => { s += D.arrow(330, 92, x, 128, { c: "s-acc" }) + r(x - 70, 130, 140, 70, "f-box", 10) + D.box(x - 64, 136, 64, 58, "Firma\n(Container)", P, { fs: 10.5 }) + D.box(x + 2, 136, 62, 58, "Privat", "f-sub", { fs: 10.5 }) + t(x, 218, n, { a: "middle", w: 600, fs: 11 }); });
      s += t(380, 70, "Richtlinien · Apps · Lock · Wipe", { fs: 11 });
      return D.svg(660, 228, s, "Mobile Device Management"); } }],
    q: { f: "Ein Unternehmen führt ein MDM-System mit BYOD ein. Nennen Sie fünf Punkte, die in einer Betriebsvereinbarung geregelt werden sollten. (5 Punkte)", a: "Passwortrichtlinien; Regelungen zu BYOD; private Nutzung dienstlicher Geräte; Erfassung und Speicherung von Bewegungsdaten; Rechte- und Berechtigungsvergabe; Schulung der Mitarbeitenden; Klassifizierung von Daten." } };

  L["g1-os"] = { time: 30, kw: /chmod|unix|rechte|path|grub|wildcard|schtasks/i, train: ["chmod"],
    ex: `<p><b>Unix-Rechte</b>: Jede Datei hat Rechte für <b>Eigentümer</b>, <b>Gruppe</b> und <b>Andere</b>. Pro Gruppe gibt es r (lesen = 4), w (schreiben = 2), x (ausführen = 1). Die Werte werden addiert: rw- = 6, r-x = 5. <span class="mono">chmod 664 datei</span> setzt rw-rw-r--.</p>
      <p><b>Kommandozeile</b>: Wildcards <span class="mono">*</span> (beliebig viele Zeichen) und <span class="mono">?</span> (genau ein Zeichen), z. B. <span class="mono">copy *2022040?.log X:\\debug</span>. Wird ein Programm nicht gefunden, fehlt der Pfad: vollen Pfad angeben oder den Ordner in die Umgebungsvariable <b>PATH</b> aufnehmen.</p>
      <p><b>Aufgabenplanung</b> unter Windows: <span class="mono">schtasks /create /tn Name /tr Programm /sc daily /st 16:10</span>.</p>
      <p><b>GRUB</b> ist der Bootloader unter Linux. Bootet das System nicht, startet man ein Rettungssystem und repariert mit <span class="mono">grub-install</span> und <span class="mono">update-grub</span>.</p>`,
    figs: [{ cap: "So liest du eine Rechte-Zeile aus „ls -l“: erst der Typ, dann drei Dreiergruppen.", f: () => {
      const chars = ["-", "r", "w", "x", "r", "-", "x", "r", "-", "-"]; let s = "";
      chars.forEach((c, i) => { const x = 40 + i * 52 + (i > 0 ? 12 : 0) + (i > 3 ? 12 : 0) + (i > 6 ? 12 : 0); s += D.box(x, 20, 44, 44, c, i === 0 ? "f-sub" : c === "-" ? "f-box" : "f-acc", { fs: 20 }); s += t(x + 22, 80, i === 0 ? "Typ" : c === "-" ? "0" : { r: "4", w: "2", x: "1" }[c], { a: "middle", c: "tm", fs: 11 }); });
      [["Eigentümer", 104, 7], ["Gruppe", 272, 5], ["Andere", 440, 0]].forEach(([n, x, v]) => { s += D.l(x, 92, x + 148, 92, "s-acc") + t(x + 74, 110, n, { a: "middle", w: 700 }) + t(x + 74, 130, "= " + v, { a: "middle", w: 700, c: "t ta", fs: 14 }); });
      s += t(40, 160, "-rwxr-x---  →  chmod 750", { w: 700, fs: 13 });
      return D.svg(640, 172, s, "Unix-Rechte lesen"); } }],
    q: { f: "Die Datei bericht.txt hat die Rechte rw-rw-r--. Geben Sie den chmod-Befehl in Oktalschreibweise an und erläutern Sie die Rechte. (4 Punkte)", a: "chmod 664 bericht.txt\nEigentümer (6): lesen und schreiben. Gruppe (6): lesen und schreiben. Andere (4): nur lesen." } };
})();
