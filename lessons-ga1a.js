// Lektionen GA1 (Teil 1): Cloud, Virtualisierung, RAID, Backup, Archiv, Verfügbarkeit, Hardware, Härtung, Schutzziele, Malware
(function () {
  const D = AP2.D, L = AP2.LESSONS, t = D.t, r = D.r;
  const K = "f-host", P = "f-net"; // Kunde / Provider

  L["g1-cloud"] = { time: 40, kw: /cloud|iaas|paas|saas|pay-per|on-prem/i, train: [],
    ex: `<p>Bei Cloud-Computing mietest du IT-Leistung über das Internet, statt alles selbst zu kaufen und zu betreiben. Wichtig ist, <b>wer welche Schicht verwaltet</b>: du (Kunde) oder der Anbieter (Provider).</p>
      <p><b>IaaS</b> (Infrastructure as a Service): Du mietest Server, Speicher und Netz – meist als virtuelle Maschine. Betriebssystem und Anwendungen machst du selbst. <b>PaaS</b> (Platform as a Service): Du bekommst eine fertige Plattform zum Entwickeln und Betreiben von Anwendungen. <b>SaaS</b> (Software as a Service): Du nutzt nur noch die fertige Software, z. B. Microsoft 365.</p>
      <p><b>Public Cloud</b>: viele Kunden teilen sich die Infrastruktur, günstig und schnell skalierbar. <b>Private Cloud</b>: nur für ein Unternehmen, mehr Kontrolle über Datenschutz, aber teurer. <b>Hybrid Cloud</b>: Mischung aus beidem.</p>
      <p>Vorteile: Skalierbarkeit, keine eigene Hardware, Abrechnung nach Nutzung (Pay-per-Use). Nachteile: Abhängigkeit vom Anbieter, Datenschutz, Internetverbindung nötig.</p>`,
    figs: [{ cap: "Wer verwaltet was? Orange = du als Kunde, Blau = der Provider.", f: () => {
      const layers = ["Netzwerk/RZ", "Server-Hardware", "Virtualisierung", "Betriebssystem", "Laufzeit", "Daten", "Anwendung"];
      const own = { "On-Premises": 7, "IaaS": 4, "PaaS": 2, "SaaS": 0 };
      return D.stacks(Object.keys(own).map(k => ({ title: k, layers: layers.map((l, i) => ({ split: [{ t: l, c: i >= 7 - own[k] ? K : P, b: false }] })) })), { cw: 138, lh: 26, legend: [[K, "verwaltet der Kunde"], [P, "verwaltet der Provider"]], label: "Verantwortung bei IaaS, PaaS, SaaS" }); } }],
    q: { f: "Erläutern Sie den Unterschied zwischen IaaS und SaaS und nennen Sie je ein Beispiel. (6 Punkte)", a: "IaaS: Der Provider stellt Infrastruktur bereit (virtuelle Server, Speicher, Netz). Der Kunde installiert und verwaltet Betriebssystem und Anwendungen selbst. Beispiel: virtuelle Maschine bei Azure oder AWS EC2.\nSaaS: Der Provider stellt eine fertige Anwendung über das Internet bereit und kümmert sich um Betrieb, Updates und Wartung. Der Kunde nutzt nur die Software. Beispiel: Microsoft 365." } };

  L["g1-virt"] = { time: 40, kw: /hypervisor|virtual|container/i, train: [],
    ex: `<p>Virtualisierung heißt: Auf <b>einem</b> physischen Server laufen <b>mehrere virtuelle Maschinen (VMs)</b>. Jede VM glaubt, sie hätte eigene Hardware. Die Software, die das möglich macht, heißt <b>Hypervisor</b>.</p>
      <p><b>Typ 1 (bare metal)</b> läuft direkt auf der Hardware – schnell und stabil, ideal fürs Rechenzentrum. Beispiele: Microsoft Hyper-V, VMware vSphere/ESXi, KVM. <b>Typ 2 (gehostet)</b> läuft als Programm auf einem normalen Betriebssystem – gut zum Testen am Arbeitsplatz. Beispiele: VirtualBox, VMware Workstation.</p>
      <p><b>Container</b> (z. B. Docker) virtualisieren keine ganzen Rechner, sondern nur <b>Anwendungen</b>. Alle Container teilen sich den Kernel des Host-Betriebssystems. Darum sind sie klein, starten schnell und lassen sich leicht verschieben.</p>
      <p>Vorteile: bessere Auslastung, weniger Strom und Platz, schnelle Bereitstellung, einfache Backups (Snapshots). Nachteile: Fällt der Host aus, fallen alle VMs aus (Single Point of Failure); starke Hardware nötig.</p>`,
    figs: [{ cap: "Typ 1 sitzt direkt auf der Hardware, Typ 2 auf einem Betriebssystem. Container teilen sich ein Betriebssystem.", f: () => D.stacks([
      { title: "Hypervisor Typ 1", layers: [{ split: [{ t: "Hardware", c: "f-sub" }] }, { split: [{ t: "Hypervisor", c: "f-acc" }] }, { split: [{ t: "VM 1\nOS + App", c: P }, { t: "VM 2\nOS + App", c: P }] }] },
      { title: "Hypervisor Typ 2", layers: [{ split: [{ t: "Hardware", c: "f-sub" }] }, { split: [{ t: "Host-Betriebssystem", c: "f-box" }] }, { split: [{ t: "Hypervisor", c: "f-acc" }] }, { split: [{ t: "VM 1", c: P }, { t: "VM 2", c: P }] }] },
      { title: "Container", layers: [{ split: [{ t: "Hardware", c: "f-sub" }] }, { split: [{ t: "Betriebssystem", c: "f-box" }] }, { split: [{ t: "Container-Engine", c: "f-acc" }] }, { split: [{ t: "App A", c: K }, { t: "App B", c: K }, { t: "App C", c: K }] }] }
    ], { cw: 196, lh: 40, label: "Hypervisor Typ 1, Typ 2 und Container" }) }],
    q: { f: "Erläutern Sie Hypervisor Typ 1 und Typ 2. Geben Sie je ein Einsatzbeispiel und ein Produkt an. (8 Punkte)", a: "Typ 1 (nativ, bare metal): setzt direkt auf der Hardware auf und hat direkten Zugriff auf die Ressourcen. Einsatz: Bereitstellung von Servern im Rechenzentrum. Produkt: Microsoft Hyper-V, VMware vSphere, KVM.\nTyp 2 (gehostet): läuft auf einem bereits installierten Betriebssystem wie ein Anwendungsprogramm. Einsatz: Test und Entwicklung am Arbeitsplatz. Produkt: Oracle VirtualBox, VMware Workstation." } };

  L["g1-raid"] = { time: 50, kw: /raid|hot-spare|mix-and-match|platte/i, train: ["raid"],
    ex: `<p>RAID verbindet mehrere Festplatten zu einem Verbund. Ziel: <b>Ausfallsicherheit</b> (Daten bleiben erhalten, wenn eine Platte stirbt) und/oder <b>mehr Geschwindigkeit</b>.</p>
      <p><b>RAID 0</b> verteilt Daten auf alle Platten (Striping) – schnell, aber ohne Sicherheit. <b>RAID 1</b> spiegelt: beide Platten haben dieselben Daten. <b>RAID 5</b> verteilt Daten und eine <b>Parität</b> (eine Prüfsumme) über alle Platten – eine Platte darf ausfallen. <b>RAID 6</b> hat doppelte Parität – zwei Platten dürfen ausfallen. <b>RAID 10</b> spiegelt zuerst und verteilt dann – schnell und sicher, kostet aber die Hälfte der Kapazität.</p>
      <p>Mit der Parität kann der Controller die fehlende Platte aus den übrigen Daten <b>neu berechnen</b>. Wichtig: RAID ersetzt <b>kein Backup</b> – gelöschte oder verschlüsselte Dateien sind auf allen Platten weg.</p>
      <p>In der Prüfung musst du fast immer rechnen: Nettokapazität oder benötigte Plattenanzahl. Übe das im Rechen-Trainer.</p>`,
    figs: [{ cap: "So liegen die Datenblöcke (A1, B1 …) auf den Platten. „p“ = Parität. Bei RAID 5 wandert die Parität über alle Platten.", f: () => {
      let s = ""; const disk = (x, y, items, title) => { let g = D.box(x, y, 52, 18, title, "f-sub", { fs: 10 }); items.forEach((it, i) => { g += D.box(x, y + 22 + i * 24, 52, 20, it, it.endsWith("p") ? K : P, { fs: 10.5 }); }); return g; };
      s += t(10, 16, "RAID 1 (Spiegel)", { w: 700 }) + disk(10, 26, ["A1", "B1", "C1"], "Platte 1") + disk(70, 26, ["A1", "B1", "C1"], "Platte 2");
      s += t(160, 16, "RAID 5 (verteilte Parität)", { w: 700 }); [["A1", "B1", "C1", "Dp"], ["A2", "B2", "Cp", "D1"], ["A3", "Bp", "C2", "D2"], ["Ap", "B3", "C3", "D3"]].forEach((col, i) => { s += disk(160 + i * 60, 26, col, "Platte " + (i + 1)); });
      s += t(420, 16, "RAID 10 (Spiegel + Stripe)", { w: 700 }); [["A1", "C1"], ["A1", "C1"], ["B1", "D1"], ["B1", "D1"]].forEach((col, i) => { s += disk(420 + i * 60, 26, col, "Platte " + (i + 1)); });
      s += `<line x1="420" y1="84" x2="530" y2="84" class="s-acc"/><line x1="540" y1="84" x2="650" y2="84" class="s-acc"/>` + t(475, 98, "Spiegel 1", { a: "middle", fs: 10.5, c: "tm" }) + t(595, 98, "Spiegel 2", { a: "middle", fs: 10.5, c: "tm" });
      s += t(10, 160, "Netto: RAID 1 = 1 Platte · RAID 5 = n − 1 · RAID 6 = n − 2 · RAID 10 = n ÷ 2", { fs: 11.5, w: 600 });
      return D.svg(670, 172, s, "RAID 1, 5 und 10 im Vergleich"); } }],
    q: { f: "Für einen Server werden 20 TiB nutzbarer Speicher benötigt. Es stehen Festplatten mit je 4 TiB zur Verfügung. Berechnen Sie die Anzahl der Festplatten für RAID 5, RAID 6 und RAID 10. (6 Punkte)", a: "20 TiB ÷ 4 TiB = 5 Datenplatten.\nRAID 5: 5 + 1 Parität = 6 Festplatten.\nRAID 6: 5 + 2 Parität = 7 Festplatten.\nRAID 10: 5 × 2 (Spiegelung) = 10 Festplatten." } };

  L["g1-backup"] = { time: 50, kw: /backup|sicherung|inkrement|differenz|3-2-1|d2d2t|großvater|bänder|band/i, train: [],
    ex: `<p>Ein Backup ist eine <b>Kopie</b> deiner Daten, damit du sie nach einem Verlust wiederherstellen kannst (Defekt, Löschen, Ransomware).</p>
      <p><b>Vollsicherung</b>: sichert alles – braucht viel Zeit und Platz. <b>Differenziell</b>: sichert alles, was sich <b>seit der letzten Vollsicherung</b> geändert hat – wird jeden Tag größer. <b>Inkrementell</b>: sichert nur, was sich <b>seit der letzten Sicherung (egal welcher)</b> geändert hat – klein und schnell.</p>
      <p><b>Wiederherstellung:</b> Differenziell braucht die Vollsicherung + die <b>letzte</b> differenzielle Sicherung. Inkrementell braucht die Vollsicherung + <b>alle</b> inkrementellen Sicherungen danach, in der richtigen Reihenfolge.</p>
      <p><b>3-2-1-Regel</b>: 3 Kopien, 2 verschiedene Medien, 1 Kopie außer Haus. <b>Großvater-Vater-Sohn</b>: tägliche (Sohn), wöchentliche (Vater) und monatliche (Großvater) Bänder rotieren. <b>D2D2T</b>: erst auf Festplatte (schnelle Wiederherstellung), dann auf Band.</p>`,
    figs: [{ cap: "Vollsicherung am Sonntag, Ausfall am Freitag. Die farbigen Balken zeigen, welche Änderungen eine Sicherung enthält. Blau umrandet = für die Wiederherstellung nötig.", f: () => {
      const days = ["So", "Mo", "Di", "Mi", "Do", "Fr"], x0 = 120, cw = 88; let s = "";
      days.forEach((d, i) => { s += t(x0 + i * cw + cw / 2, 16, d, { a: "middle", w: 700 }); });
      s += t(x0 + 5 * cw + cw / 2, 30, "Ausfall!", { a: "middle", c: "t ta", fs: 11, w: 700 });
      s += t(x0 - 10, 70, "Differenziell", { a: "end", w: 600 }) + D.box(x0 + 4, 42, cw - 8, 76, "Voll", "f-acc", { fs: 11, rx: 4 });
      for (let i = 1; i <= 4; i++) { const y = 42 + (i - 1) * 20, need = i === 4; s += r(x0 + cw + 4, y, i * cw - 8, 16, need ? "f-net" : "f-sub", 3) + t(x0 + i * cw + cw - 10, y + 12, "Diff " + i, { a: "end", fs: 10.5, w: need ? 700 : 400 }); if (need) s += r(x0 + cw + 4, y, i * cw - 8, 16, "s-acc", 3); }
      s += t(x0 - 10, 147, "Inkrementell", { a: "end", w: 600 }) + D.box(x0 + 4, 130, cw - 8, 26, "Voll", "f-acc", { fs: 11, rx: 4 });
      for (let i = 1; i <= 4; i++) s += r(x0 + i * cw + 4, 130, cw - 8, 26, "f-net", 4) + r(x0 + i * cw + 4, 130, cw - 8, 26, "s-acc", 4) + t(x0 + i * cw + cw / 2, 147, "Inkr " + i, { a: "middle", fs: 10.5 });
      s += t(10, 182, "Differenziell: Voll + Diff 4 (2 Sicherungen) · Inkrementell: Voll + Inkr 1–4 (5 Sicherungen)", { fs: 11.5, w: 600 });
      return D.svg(660, 194, s, "Differenzielle und inkrementelle Sicherung"); } }],
    q: { f: "Erläutern Sie den Unterschied zwischen inkrementeller und differenzieller Datensicherung. (4 Punkte)", a: "Bei der inkrementellen Sicherung bezieht sich nur die erste Sicherung auf die letzte Vollsicherung. Jede weitere sichert nur die Änderungen seit der vorherigen inkrementellen Sicherung.\nBei der differenziellen Sicherung beziehen sich alle Sicherungen auf die letzte Vollsicherung. Sie enthalten jeweils alle Änderungen seit dieser Vollsicherung." } };

  L["g1-archiv"] = { time: 30, kw: /archiv|worm|revisions|cluster|deduplizierung|komprimierung/i, train: [],
    ex: `<p><b>Archiv vs. Backup:</b> Ein Backup ist eine Kopie für die Wiederherstellung und wird regelmäßig überschrieben. Ein <b>Archiv</b> bewahrt Daten <b>langfristig und unveränderbar</b> auf, die nicht mehr täglich gebraucht werden – oft wegen gesetzlicher Fristen (z. B. Rechnungen 10 Jahre).</p>
      <p><b>Revisionssicher</b> heißt: vollständig, unveränderbar, nachvollziehbar und geschützt. Technisch oft mit <b>WORM</b>-Speicher (Write Once Read Many).</p>
      <p><b>Clustergröße</b> (Zuordnungseinheit): die kleinste Einheit, die das Dateisystem für eine Datei belegt. Eine 1-KiB-Datei braucht bei 64-KiB-Clustern trotzdem 64 KiB. Darum: viele kleine Dateien → kleine Cluster; große Dateien (Videos, Bilder) → große Cluster.</p>
      <p><b>Deduplizierung</b>: gleiche Datenblöcke werden nur einmal gespeichert (z. B. derselbe Mailanhang an 50 Empfänger). <b>Komprimierung</b>: Redundanz innerhalb der Datei wird entfernt – verlustfrei (ZIP, Programme) oder verlustbehaftet (JPEG, MP3).</p>`,
    figs: [{ cap: "Dieselben drei Dateien (1 KiB, 3 KiB, 6 KiB) auf kleinen und großen Clustern. Grau = verschwendeter Platz.", f: () => {
      const files = [1, 3, 6]; let s = ""; const row = (y, cs, name, scale) => { let x = 150, g = t(140, y + 17, name, { a: "end", w: 600 }); files.forEach(fz => { const n = Math.ceil(fz / cs); for (let k = 0; k < n; k++) { const used = Math.min(cs, fz - k * cs); g += r(x, y, cs * scale - 2, 26, "f-sub", 2) + r(x, y, used * scale - 2, 26, "f-net", 2); x += cs * scale; } x += 10; }); return g; };
      s += row(14, 1, "Cluster 1 KiB", 22) + row(54, 4, "Cluster 4 KiB", 22);
      s += t(150, 104, "1 KiB-Cluster: 10 KiB belegt, nichts verschwendet · 4 KiB-Cluster: 16 KiB belegt, 6 KiB verschwendet", { fs: 11 });
      return D.svg(680, 116, s, "Clustergröße und Verschnitt"); } }],
    q: { f: "Nennen Sie zwei Unterschiede zwischen einer Datensicherung und einer Archivierung. (4 Punkte)", a: "Backup: Kopie der aktuellen Daten zur Wiederherstellung nach Datenverlust; wird regelmäßig erneuert und überschrieben.\nArchiv: Daten werden langfristig und unveränderbar (revisionssicher, z. B. WORM) aufbewahrt, meist wegen gesetzlicher Aufbewahrungsfristen; die Daten werden aus dem Produktivsystem ausgelagert und entlasten das tägliche Backup." } };

  L["g1-verf"] = { time: 45, kw: /mtbf|mttf|badewanne|usv|vfi|vfd|rto|rpo|verfügbar|scale/i, train: ["mtbf", "usv", "avail"],
    ex: `<p><b>Verfügbarkeit</b> sagt, wie viel Prozent der Zeit ein System läuft. 99,9 % klingt viel, sind aber 8,76 Stunden Ausfall im Jahr (8.760 h × 0,1 %).</p>
      <p><b>MTBF</b> (Mean Time Between Failures) = mittlere Zeit zwischen Ausfällen – für Systeme, die <b>repariert</b> werden. <b>MTTF</b> (Mean Time To Failure) = mittlere Zeit bis zum Ausfall – für Teile, die man <b>wegwirft und ersetzt</b> (Festplatten). Arbeiten n gleiche Teile, teilt man die MTBF durch n.</p>
      <p>Die <b>Badewannenkurve</b> zeigt die Ausfallrate über die Lebenszeit: am Anfang Frühausfälle (Fertigungsfehler), dann lange eine niedrige Rate, am Ende Verschleiß.</p>
      <p><b>USV</b> (unterbrechungsfreie Stromversorgung) überbrückt Stromausfälle mit Akkus, bis ein Notstromaggregat läuft. Typen: Offline (VFD), Line-Interactive (VI), Online/Doppelwandler (VFI, keine Umschaltzeit). Weitere Maßnahmen: redundante Netzteile, RAID, Cluster, Load Balancing.</p>
      <p><b>RTO</b> = wie lange darf die Wiederherstellung dauern? <b>RPO</b> = wie viel Datenverlust (Zeitspanne) ist erlaubt?</p>`,
    figs: [{ cap: "Badewannenkurve: Am Anfang und am Ende fallen Geräte häufiger aus.", f: () => {
      let s = r(60, 20, 170, 120, "f-host", 0) + r(230, 20, 260, 120, "f-sub", 0) + r(490, 20, 150, 120, "f-host", 0);
      s += `<path d="M62,28 C110,110 150,118 230,118 L490,118 C560,118 600,90 638,30" class="s-acc"/>`;
      s += D.l(60, 140, 645, 140) + D.l(60, 140, 60, 14) + t(645, 156, "Zeit", { a: "end", c: "tm", fs: 11 }) + t(54, 18, "Ausfallrate", { a: "end", c: "tm", fs: 11 });
      s += t(145, 40, "I Frühausfälle", { a: "middle", w: 700, fs: 11.5 }) + t(145, 56, "Fertigungsfehler", { a: "middle", c: "tm", fs: 10.5 });
      s += t(360, 40, "II Normalbetrieb", { a: "middle", w: 700, fs: 11.5 }) + t(360, 56, "niedrige, konstante Rate", { a: "middle", c: "tm", fs: 10.5 });
      s += t(565, 40, "III Verschleiß", { a: "middle", w: 700, fs: 11.5 }) + t(565, 56, "Alterung", { a: "middle", c: "tm", fs: 10.5 });
      return D.svg(660, 164, s, "Badewannenkurve"); } }],
    q: { f: "Ein Backup-System wird bei Defekt repariert, Festplatten werden bei Defekt ausgetauscht. Begründen Sie, ob jeweils MTBF oder MTTF relevant ist. (4 Punkte)", a: "Backup-System: Es wird wegen hoher Anschaffungskosten und langer Lebensdauer repariert, also ist die MTBF (mittlere Zeit zwischen Ausfällen) relevant.\nFestplatten: Sie werden bei einem Defekt ausgetauscht und entsorgt, also ist die MTTF (mittlere Zeit bis zum Ausfall) relevant." } };

  L["g1-hw"] = { time: 30, kw: /netzteil|stromkosten|server.*auswahl|ram|ddr/i, train: ["netzteil", "strom"],
    ex: `<p>In der Prüfung sollst du oft aus Datenblättern den <b>passenden Server</b> wählen und begründen. Überleg dir, was die Anwendung braucht:</p>
      <p><b>Datenbankserver</b>: viel Arbeitsspeicher (RAM) und schneller Speicher (SSD, viele IOPS). <b>Virtualisierungsserver</b>: viele CPU-Kerne und viel RAM, weil mehrere VMs gleichzeitig laufen. <b>Mailserver</b>: viel Speicher und gute Ein-/Ausgabe-Leistung. <b>Fileserver</b>: viel Speicherkapazität, RAID.</p>
      <p><b>Netzteil berechnen</b>: alle Verbraucher addieren, Reserve aufschlagen (× 1,2 bei 20 %), durch den Wirkungsgrad teilen (÷ 0,9 bei 90 %), dann die nächstgrößere Baugröße nehmen.</p>
      <p><b>Stromkosten</b>: Watt ÷ 1.000 = kW, × 8.760 h = kWh pro Jahr, × Preis pro kWh.</p>`,
    figs: [{ cap: "Welche Hardware ist für welchen Server wichtig? Mehr Punkte = wichtiger.", f: () => {
      const cols = ["CPU-Kerne", "RAM", "schneller Speicher", "Kapazität"], rows = [["Datenbank", [2, 3, 3, 2]], ["Virtualisierung", [3, 3, 2, 2]], ["Mailserver", [1, 2, 2, 3]], ["Fileserver", [1, 1, 1, 3]]];
      let s = ""; cols.forEach((c, i) => { s += t(220 + i * 110, 18, c, { a: "middle", w: 700, fs: 11.5 }); });
      rows.forEach(([n, v], j) => { const y = 40 + j * 34; s += r(10, y - 4, 640, 28, j % 2 ? "f-sub" : "f-box", 4) + t(20, y + 14, n, { w: 600 }); v.forEach((k, i) => { for (let d = 0; d < 3; d++) s += `<circle cx="${204 + i * 110 + d * 16}" cy="${y + 10}" r="5.5" class="${d < k ? "f-acc" : "f-box"}"/>`; }); });
      return D.svg(660, 178, s, "Serverauswahl nach Einsatzzweck"); } }],
    q: { f: "Ordnen Sie zwei Serverangebote einem Datenbankserver und einem Virtualisierungsserver zu und begründen Sie. (6 Punkte)", a: "Datenbankserver: das System mit viel Arbeitsspeicher und schnellem Primärspeicher (SSD/NVMe), weil Abfragen viel RAM und hohe I/O-Leistung brauchen.\nVirtualisierungsserver: das System mit vielen Prozessorkernen und großem Arbeitsspeicher, weil mehrere virtuelle Maschinen gleichzeitig CPU und RAM benötigen." } };

  L["g1-haert"] = { time: 40, kw: /härt|uefi|bios|secure boot|least|zero trust|tpm/i, train: [],
    ex: `<p><b>Härtung</b> heißt: ein System so einstellen, dass es möglichst wenig Angriffsfläche bietet. Grundidee: <b>Alles, was nicht gebraucht wird, wird abgeschaltet.</b></p>
      <p><b>Firmware (BIOS/UEFI)</b>: Admin-Passwort setzen, Secure Boot aktivieren (nur signierte Bootloader), Booten von USB sperren, TPM aktivieren (für BitLocker), Firmware aktualisieren.</p>
      <p><b>Betriebssystem und Dienste</b>: unnötige Dienste und Programme entfernen, Updates einspielen, Standardpasswörter ändern, Dienste mit eigenen Konten ohne Admin-Rechte betreiben, Protokollierung einschalten.</p>
      <p><b>Least Privilege</b>: Jeder bekommt nur die Rechte, die er wirklich braucht. <b>Zero Trust</b>: Niemandem wird automatisch vertraut, auch nicht im internen Netz – jeder Zugriff wird geprüft.</p>`,
    figs: [{ cap: "Härtung in Schichten: Jede Schicht macht es einem Angreifer schwerer.", f: () => {
      const layers = [["Netzwerk: Firewall, nur nötige Ports", "f-sub"], ["Benutzer: Least Privilege, starke Passwörter, MFA", "f-box"], ["Dienste: nur nötige Dienste, eigene Dienstkonten", K], ["Betriebssystem: Updates, Protokollierung, kein Autostart", P], ["Firmware: UEFI-Passwort, Secure Boot, TPM", "f-acc"]];
      let s = ""; layers.forEach(([txt, c], i) => { const m = i * 26; s += r(10 + m, 10 + m * 0.62, 640 - 2 * m, 200 - m * 1.24, c, 10); s += t(24 + m, 28 + m * 0.62, txt, { w: 600, fs: 11.5, c: c === "f-acc" ? "t f-acc-t" : "t" }); });
      return D.svg(660, 220, s, "Schichten der Systemhärtung"); } }],
    q: { f: "Nennen und beschreiben Sie zwei Einstellungen im UEFI, die die Sicherheit eines Servers erhöhen. (4 Punkte)", a: "Administrator-Passwort setzen: verhindert unbefugte Änderungen an Bootreihenfolge und Sicherheitseinstellungen.\nSecure Boot aktivieren: Es werden nur signierte Bootloader geladen, manipulierte Bootloader oder Schadsoftware beim Start werden verhindert.\n(Alternativ: Booten von externen Medien sperren, TPM aktivieren, Firmware aktualisieren.)" } };

  L["g1-cia"] = { time: 30, kw: /vertraulich|integrit|verfügbarkeit|zutritt|zugang|zugriff|tom|authentiz/i, train: [],
    ex: `<p>Die drei <b>Schutzziele</b> der Informationssicherheit: <b>Vertraulichkeit</b> (nur Berechtigte dürfen lesen), <b>Integrität</b> (Daten werden nicht unbemerkt verändert), <b>Verfügbarkeit</b> (Daten und Dienste sind nutzbar, wenn man sie braucht). Oft kommt <b>Authentizität</b> dazu: Die Herkunft ist echt.</p>
      <p><b>TOM</b> = technische und organisatorische Maßnahmen nach DSGVO. Drei Kontrollen musst du unterscheiden können:</p>
      <p><b>Zutrittskontrolle</b>: Wer kommt ins Gebäude oder in den Raum? (RFID-Karte, Alarmanlage, Pförtner). <b>Zugangskontrolle</b>: Wer kommt an das IT-System? (Login, Passwort, Biometrie). <b>Zugriffskontrolle</b>: Wer darf welche Daten lesen oder ändern? (Berechtigungskonzept, Verschlüsselung).</p>
      <p>Merkhilfe: <b>Zutritt = Tür, Zugang = Tastatur, Zugriff = Datei.</b></p>`,
    figs: [{ cap: "Von außen nach innen: erst ins Gebäude (Zutritt), dann an den Rechner (Zugang), dann an die Daten (Zugriff).", f: () => {
      let s = r(10, 10, 640, 190, "f-sub", 12) + t(26, 32, "Zutrittskontrolle – Gebäude/Raum", { w: 700 }) + t(26, 50, "RFID-Karte, Alarmanlage, Pförtner, Schlüssel", { c: "tm", fs: 11 });
      s += r(60, 62, 540, 128, "f-net", 10) + t(76, 84, "Zugangskontrolle – IT-System", { w: 700 }) + t(76, 102, "Benutzername + Passwort, Biometrie, Smartcard, MFA", { c: "tm", fs: 11 });
      s += r(110, 114, 440, 66, "f-acc", 8) + t(126, 138, "Zugriffskontrolle – Daten", { w: 700, c: "t f-acc-t" }) + t(126, 158, "Berechtigungskonzept, Verschlüsselung, Protokollierung", { fs: 11, c: "t f-acc-t" });
      return D.svg(660, 210, s, "Zutritt, Zugang, Zugriff"); } }],
    q: { f: "Ordnen Sie zu: RFID-Karte für das Gebäude, biometrische Anmeldung am PC, Berechtigungskonzept auf Dateiebene. (3 Punkte)", a: "RFID-Karte für das Gebäude → Zutrittskontrolle.\nBiometrische Anmeldung am PC → Zugangskontrolle.\nBerechtigungskonzept auf Dateiebene → Zugriffskontrolle." } };

  L["g1-malware"] = { time: 25, kw: /virus|wurm|trojaner|ransomware|phishing|hacker/i, train: [],
    ex: `<p><b>Virus</b>: hängt sich an ein Programm oder eine Datei und verbreitet sich, wenn diese ausgeführt wird. <b>Wurm</b>: verbreitet sich <b>selbstständig</b> über das Netzwerk, ohne dass jemand etwas öffnen muss. <b>Trojaner</b>: tarnt sich als nützliches Programm und öffnet im Hintergrund z. B. eine Hintertür. <b>Ransomware</b>: verschlüsselt Daten und fordert Lösegeld.</p>
      <p><b>Phishing</b>: gefälschte Mails oder Webseiten, die Zugangsdaten stehlen sollen. Erkennungsmerkmale: unpersönliche Anrede, fremde Absenderdomain, Rechtschreibfehler, Zeitdruck, Link-Text passt nicht zur echten Adresse.</p>
      <p>Anzeichen einer Infektion: hohe CPU-Last, Abstürze, langsames Surfen, unbekannte Programme oder Prozesse, Mails, die man nicht verschickt hat.</p>
      <p><b>White-Hat-Hacker</b> suchen im Auftrag Schwachstellen, damit sie geschlossen werden. <b>Black-Hat-Hacker</b> nutzen Schwachstellen für eigene Vorteile.</p>`,
    figs: [{ cap: "Vier Arten von Schadsoftware und woran man sie unterscheidet.", f: () => {
      const items = [["Virus", "braucht ein Wirtsprogramm", "Datei.exe + Virus"], ["Wurm", "verbreitet sich selbst", "PC → PC → PC"], ["Trojaner", "getarnt als nützlich", "„Gratis-Tool“"], ["Ransomware", "verschlüsselt, fordert Geld", "Dateien gesperrt"]];
      let s = ""; items.forEach(([n, d, e], i) => { const x = 10 + i * 162; s += D.box(x, 10, 150, 34, n, i === 3 ? "f-bad" : K, { fs: 13 }) + D.box(x, 50, 150, 40, d, "f-box", { fs: 11, bold: false }) + D.box(x, 96, 150, 30, e, "f-sub", { fs: 11, bold: false }); });
      return D.svg(660, 136, s, "Arten von Schadsoftware"); } }],
    q: { f: "Nennen Sie drei Merkmale, an denen Mitarbeitende eine Phishing-Mail erkennen können. (3 Punkte)", a: "Unpersönliche Anrede („Sehr geehrter Kunde“), Absenderadresse mit fremder Domain (z. B. @gmail statt Firmendomain), angezeigter Link stimmt nicht mit der verlinkten Adresse überein. (Auch: Rechtschreibfehler, Zeitdruck, fehlende Signatur.)" } };
})();
