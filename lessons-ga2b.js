// Lektionen GA2 (Teil 2): PKI/TLS, VPN, DNS/DHCP, Fehlersuche, Monitoring, Anbindung, Verkabelung, E-Mail, Angriffe, IoT
(function () {
  const D = AP2.D, L = AP2.LESSONS, t = D.t, r = D.r, K = "f-host", P = "f-net";

  L["g2-pki"] = { time: 50, kw: /zertifikat|ca |ca\b|tls|kollision|diffie|signatur|root/i, train: [],
    ex: `<p>Ein <b>Zertifikat</b> bestätigt: Dieser öffentliche Schlüssel gehört wirklich zu www.firma.de. Ausgestellt wird es von einer <b>Zertifizierungsstelle (CA)</b>. Inhalt: Inhaber, öffentlicher Schlüssel, Aussteller, Gültigkeit, Signaturverfahren.</p>
      <p><b>Signatur</b>: Die CA bildet einen <b>Hashwert</b> des Zertifikats und verschlüsselt ihn mit ihrem <b>privaten Schlüssel</b>. Jeder kann mit dem öffentlichen Schlüssel der CA prüfen. Der Browser vertraut einer Kette: Root-CA → Zwischen-CA → Server-Zertifikat.</p>
      <p><b>Kollisionsangriff</b>: Bei schwachen Hashverfahren wie MD5 kann man ein gefälschtes Zertifikat mit gleichem Hashwert bauen – die Signatur passt dann scheinbar. <b>Private Key der CA verraten</b>: Die ganze CA ist kompromittiert → neue CA, alle Zertifikate ersetzen.</p>
      <p><b>TLS</b> ist hybrid: Beim Verbindungsaufbau werden Zertifikat geprüft und Schlüssel ausgetauscht (bei TLS 1.3 mit <b>Diffie-Hellman</b>), danach wird schnell <b>symmetrisch</b> verschlüsselt.</p>`,
    figs: [{ cap: "Vertrauenskette: Jede Stufe signiert die nächste. Der Browser kennt die Root-CA bereits.", f: () => {
      let s = D.box(10, 20, 170, 56, "Root-CA\nim Browser gespeichert", "f-acc", { fs: 11.5 }) + D.arrow(182, 48, 238, 48, { c: "s-acc", label: "signiert", fs: 10.5 }) + D.box(240, 20, 170, 56, "Zwischen-CA", P, { fs: 12 }) + D.arrow(412, 48, 468, 48, { c: "s-acc", label: "signiert", fs: 10.5 }) + D.box(470, 20, 180, 56, "Server-Zertifikat\nwww.firma.de", K, { fs: 11.5 });
      s += D.box(240, 100, 410, 44, "Signatur = Hash(Zertifikat) verschlüsselt mit Private Key der CA", "f-sub", { fs: 11, bold: false }) + t(10, 126, "Prüfen mit Public Key der CA", { fs: 11, w: 600 });
      return D.svg(664, 154, s, "Zertifikatskette"); } },
      { cap: "TLS-Verbindungsaufbau (vereinfacht): erst Zertifikat prüfen und Schlüssel aushandeln, dann symmetrisch verschlüsselt.", f: () => D.seq(["Browser (Client)", "Webserver"], [[0, 1, "ClientHello: TLS-Version, Cipher Suites, Zufall"], [1, 0, "ServerHello + Zertifikat + Schlüsselanteil (DH)"], [0, 0, "Zertifikat prüfen: Kette, Gültigkeit, Domain", { c: "s-line" }], [0, 1, "Schlüsselanteil (DH) → beide berechnen Session-Key"], [0, 1, "Daten symmetrisch verschlüsselt (AES)", { c: "s-good" }]], { w: 600, label: "TLS-Handshake" }) }],
    q: { f: "Erläutern Sie, warum bei TLS ein hybrides Verschlüsselungsverfahren eingesetzt wird. (6 Punkte)", a: "Hybrid heißt: Es wird ein asymmetrisches und ein symmetrisches Verfahren genutzt.\nBeim Verbindungsaufbau wird asymmetrisch gearbeitet (Authentifizierung über Zertifikat, Schlüsselaustausch). Das ist rechenaufwendig, braucht aber kein vorher vereinbartes Geheimnis und funktioniert über eine unsichere Verbindung.\nDanach wird auf das performantere symmetrische Verfahren gewechselt, um die eigentlichen Daten zu verschlüsseln." } };

  L["g2-vpn"] = { time: 35, kw: /vpn|tunnel|site-to-site|remote/i, train: [],
    ex: `<p>Ein <b>VPN</b> (Virtual Private Network) baut einen <b>verschlüsselten Tunnel</b> durch ein unsicheres Netz wie das Internet. Die Daten sind darin vertraulich, unverändert (Integrität) und der Partner ist echt (Authentizität).</p>
      <p><b>Site-to-Site-VPN</b>: verbindet zwei Standorte dauerhaft. Das VPN läuft auf den Routern oder Firewalls beider Standorte – die Endgeräte merken nichts. <b>Remote-Access-VPN</b> (End-to-Site): Ein einzelnes Gerät (Laptop im Homeoffice) baut mit einem VPN-Client die Verbindung zum Firmen-Gateway auf.</p>
      <p><b>Full Tunnel</b>: Der gesamte Verkehr läuft durch die Firma – kann dort gefiltert werden. <b>Split Tunnel</b>: nur Firmenverkehr durch den Tunnel.</p>
      <p>Fehlersuche: Internet da? Zugangsdaten richtig? VPN-Client richtig eingestellt? Blockiert ISP, Hotel-WLAN oder lokale Firewall den VPN-Port? MTU zu groß?</p>`,
    figs: [{ cap: "Oben: zwei Standorte über ihre Router verbunden. Unten: ein Laptop verbindet sich mit dem VPN-Client.", f: () => {
      let s = t(10, 16, "Site-to-Site", { w: 700 }) + D.node(60, 60, "switch", "LAN A") + D.node(170, 60, "router", "VPN-GW A") + D.node(332, 60, "cloud", "Internet", { rx: 54 }) + D.node(494, 60, "router", "VPN-GW B") + D.node(604, 60, "switch", "LAN B");
      s += D.l(98, 60, 150, 60) + D.l(514, 60, 566, 60) + r(190, 52, 284, 16, "f-acc", 8) + t(332, 64, "verschlüsselter Tunnel", { a: "middle", c: "t f-acc-t", fs: 10.5, w: 700 });
      s += t(10, 132, "Remote Access", { w: 700 }) + D.node(60, 176, "pc", "Laptop\n+ VPN-Client") + D.node(332, 176, "cloud", "Internet", { rx: 54 }) + D.node(494, 176, "router", "VPN-GW") + D.node(604, 176, "switch", "Firmen-LAN");
      s += D.l(514, 176, 566, 176) + r(86, 168, 388, 16, "f-acc", 8) + t(280, 180, "verschlüsselter Tunnel", { a: "middle", c: "t f-acc-t", fs: 10.5, w: 700 });
      return D.svg(664, 230, s, "Site-to-Site- und Remote-Access-VPN"); } }],
    q: { f: "Ein Reiseunternehmen will die Filiale dauerhaft mit der Zentrale verbinden und Busfahrern unterwegs Zugriff geben. Nennen Sie jeweils die passende VPN-Art und wo sie eingerichtet wird. (4 Punkte)", a: "Filiale–Zentrale: Site-to-Site-VPN, eingerichtet auf den VPN-Gateways (Router/Firewall) beider Standorte.\nBusfahrer: Remote-Access-VPN (End-to-Site), eingerichtet auf dem VPN-Gateway der Firma und mit VPN-Client auf dem jeweiligen Endgerät." } };

  L["g2-dns"] = { time: 50, kw: /dns|dhcp|apipa|169\.254|nslookup|discover|cname/i, train: [],
    ex: `<p><b>DHCP</b> verteilt IP-Konfiguration automatisch: IP-Adresse, Subnetzmaske, Gateway, DNS-Server, Lease-Zeit. Ablauf <b>DORA</b>: Discover (Broadcast, weil der Client noch keine IP hat) → Offer → Request → Acknowledge. Bekommt ein Client keine Antwort, gibt er sich eine <b>APIPA</b>-Adresse 169.254.x.x – ein klares Zeichen: DHCP-Server nicht erreichbar.</p>
      <p><b>DNS</b> übersetzt Namen in IP-Adressen. Der Client fragt seinen DNS-Server (Resolver). Kennt der die Antwort nicht, fragt er nacheinander: Root-Server → Server für .de → Server für ihk.de. Die Antwort wird zwischengespeichert. „Nicht autorisierende Antwort“ bei nslookup heißt: kam aus dem Cache, nicht vom zuständigen Server.</p>
      <p>Typischer Fehler: Am PC ist ein öffentlicher DNS (8.8.8.8) eingetragen – dann lassen sich <b>interne Namen</b> (fileserver.firma.local) nicht auflösen. Lösung: internen DNS (Domain Controller) eintragen. <b>Split-Horizon-DNS</b>: intern und extern unterschiedliche Antworten für denselben Namen.</p>`,
    figs: [{ cap: "DHCP-Ablauf (DORA). Der erste Schritt ist ein Broadcast, weil der Client noch keine Adresse hat.", f: () => D.seq(["Client (noch ohne IP)", "DHCP-Server"], [[0, 1, "DHCP Discover (Broadcast)"], [1, 0, "DHCP Offer: 192.168.5.101"], [0, 1, "DHCP Request: ich nehme .101"], [1, 0, "DHCP Ack + Maske, Gateway, DNS, Lease", { c: "s-good" }]], { w: 600, label: "DHCP DORA" }) },
      { cap: "Rekursive DNS-Auflösung: Der Resolver fragt sich von der Wurzel bis zum zuständigen Server durch.", f: () => D.seq(["Client", "DNS-Resolver", "Root-Server", ".de-Server", "ihk.de-Server"], [[0, 1, "www.ihk.de?"], [1, 2, "www.ihk.de?"], [2, 1, "frag .de-Server"], [1, 3, "www.ihk.de?"], [3, 1, "frag ihk.de-Server"], [1, 4, "www.ihk.de?"], [4, 1, "IP-Adresse", { c: "s-good" }], [1, 0, "IP-Adresse", { c: "s-good" }]], { w: 664, rowH: 32, label: "DNS-Auflösung" }) }],
    q: { f: "Ein Client hat die IP-Adresse 169.254.12.7. Erläutern Sie die Ursache und nennen Sie eine Lösung. (4 Punkte)", a: "Der Client ist auf DHCP eingestellt, hat aber keine Antwort von einem DHCP-Server erhalten. Er hat sich deshalb automatisch eine APIPA-Adresse aus 169.254.0.0/16 gegeben.\nLösung: Erreichbarkeit des DHCP-Servers prüfen (Kabel, VLAN, DHCP-Relay) und mit „ipconfig /renew“ neu anfordern oder die Adresse manuell konfigurieren." } };

  L["g2-trouble"] = { time: 40, kw: /ping|tracert|traceroute|icmp|ipconfig|fehler/i, train: [],
    ex: `<p>Gehe bei Netzwerkfehlern <b>von unten nach oben</b> vor – wie im OSI-Modell. So findest du die Ursache schnell und ohne Raten.</p>
      <p>1. <b>Physisch</b>: Kabel, Link-LED, WLAN verbunden? 2. <b>IP-Konfiguration</b>: <span class="mono">ipconfig /all</span> – richtige IP, Maske, Gateway, DNS? 169.254.x.x = kein DHCP. 3. <b>Gateway</b>: <span class="mono">ping</span> auf das Gateway. 4. <b>Internet/Weg</b>: <span class="mono">tracert</span> zeigt jeden Router auf dem Weg. 5. <b>DNS</b>: <span class="mono">nslookup</span> – wird der Name aufgelöst? 6. <b>Dienst</b>: Läuft der Dienst, ist der Port offen?</p>
      <p>Wichtige Fälle aus Prüfungen: <b>Ping scheitert, Webseite geht</b> → ICMP wird von einer Firewall blockiert. <b>* * * bei tracert</b> → dieser Router antwortet nicht auf ICMP. <b>Andere Route bei erneutem tracert</b> → dynamisches Routing oder DNS-Lastverteilung. <b>Client und Router in verschiedenen VLANs</b> → keine Verbindung ohne Routing.</p>`,
    figs: [{ cap: "Fehlersuche von unten nach oben: Erst wenn eine Stufe funktioniert, gehst du zur nächsten.", f: () => {
      const st = [["1 Physisch", "Kabel, Link-LED, WLAN"], ["2 IP-Konfiguration", "ipconfig /all"], ["3 Gateway", "ping 192.168.1.1"], ["4 Weg ins Internet", "tracert 8.8.8.8"], ["5 Namensauflösung", "nslookup www.ihk.de"], ["6 Dienst / Port", "Browser, Port 443"]];
      let s = ""; st.forEach(([a, b], i) => { const y = 10 + (5 - i) * 38, x = 10 + i * 28; s += D.box(x, y, 250, 32, a, i === 5 ? "f-acc" : P, { fs: 11.5 }) + t(x + 262, y + 21, b, { fs: 11.5 }); });
      s += D.arrow(640, 216, 640, 20, { c: "s-acc" }) + t(630, 120, "von unten nach oben", { a: "end", c: "tm", fs: 10.5 });
      return D.svg(664, 236, s, "Vorgehen bei der Fehlersuche"); } }],
    q: { f: "Ein Ping auf einen Webserver schlägt fehl, die Webseite lässt sich aber im Browser öffnen. Nennen Sie eine Ursache. (4 Punkte)", a: "Auf dem Zielsystem oder auf dem Weg dorthin ist das Protokoll ICMP durch eine Firewall-Regel gesperrt. Ping nutzt ICMP, der Webzugriff nutzt TCP Port 80/443, der erlaubt ist." } };

  L["g2-mon"] = { time: 25, kw: /snmp|trap|polling|span|mirror|monitoring/i, train: [],
    ex: `<p>Beim <b>Monitoring</b> überwacht man Geräte zentral, z. B. mit <b>SNMP</b>. Abgefragt werden Werte wie Port-Status (Bool), Lüfterdrehzahl (Integer), Systemlast (Float) oder Standort (String).</p>
      <p><b>Polling</b>: Der Monitoring-Server fragt in festen Abständen ab. Nachteil: Eine Störung fällt erst beim nächsten Abfragen auf. <b>Trap</b>: Das Gerät meldet sich <b>selbst sofort</b>, wenn ein Schwellwert überschritten wird.</p>
      <p>Ein <b>SPAN-Port</b> (Mirror-Port) am Switch bekommt eine <b>Kopie</b> des Verkehrs anderer Ports. Daran hängt man ein Analysegerät (z. B. Wireshark), um mitzuschneiden. Hoher Verkehr an einem Port kann also bedeuten: Uplink, Monitoring-Port – oder ein Man-in-the-Middle-Angriff.</p>`,
    figs: [{ cap: "Links Polling (Server fragt regelmäßig), rechts Trap (Gerät meldet sich bei Überschreitung sofort).", f: () => {
      let s = t(10, 16, "Polling", { w: 700 }) + D.box(10, 26, 110, 34, "Monitoring", P, { fs: 11 }) + D.box(200, 26, 110, 34, "Switch", "f-box", { fs: 11 });
      [0, 1, 2].forEach(i => { s += D.arrow(120, 76 + i * 44, 200, 76 + i * 44, { c: "s-acc", label: "Wert? (alle 5 min)", fs: 10 }) + D.arrow(200, 92 + i * 44, 120, 92 + i * 44, { dash: true }); });
      s += t(160, 222, "Störung fällt erst beim nächsten Abfragen auf", { a: "middle", c: "tm", fs: 10.5 });
      s += t(370, 16, "Trap", { w: 700 }) + D.box(370, 26, 110, 34, "Monitoring", P, { fs: 11 }) + D.box(560, 26, 100, 34, "Switch", "f-box", { fs: 11 });
      s += D.box(560, 90, 100, 34, "Lüfter > 80 °C", "f-bad", { fs: 10.5 }) + D.arrow(560, 140, 482, 140, { c: "s-bad", label: "Trap: sofort!", fs: 10.5 });
      s += t(515, 222, "Gerät meldet sich selbst", { a: "middle", c: "tm", fs: 10.5 });
      return D.svg(670, 232, s, "SNMP Polling und Trap"); } }],
    q: { f: "Erläutern Sie den Nachteil von SNMP-Polling und wie ein Trap diesen Nachteil behebt. (6 Punkte)", a: "Beim Polling wird der Wert nur zum Zeitpunkt der Abfrage erfasst. Ein Vorfall wie ein Lüfterausfall wird erst bei der nächsten Abfrage erkannt.\nBeim Trap sendet ein Agent auf dem Gerät bei Überschreiten eines Schwellwertes sofort selbst eine Nachricht an das Monitoringsystem." } };

  L["g2-wan"] = { time: 35, kw: /parallele verfügbarkeit|shared medium|geschäftskunden/i, train: ["avail", "transfer"],
    ex: `<p>Bei der Wahl der <b>Internetanbindung</b> zählen Bandbreite (vor allem Upload), Verfügbarkeit, feste IP-Adresse und Entstörzeit. <b>Geschäftskunden-Anschlüsse</b> bieten SLA, feste IP und schnelle Hilfe.</p>
      <p><b>Shared Medium</b> (GPON-Glasfaser, Kabel, LTE): Viele Kunden teilen sich die Bandbreite eines Segments – abends kann es langsamer werden. Bei <b>LTE</b> kommt oft CGN dazu (keine öffentliche IP).</p>
      <p><b>Verfügbarkeit</b>: Ausfall pro Jahr = 8.760 h × (1 − Verfügbarkeit). Zwei <b>parallele</b> Anbindungen: 1 − (1 − A1) × (1 − A2) – zwei Leitungen mit 99 % ergeben 99,99 %.</p>
      <p><b>Übertragungszeit</b> = Datenmenge in Bit ÷ Bandbreite in bit/s. Speicher binär (MiB × 1.024 × 1.024 × 8), Leitung dezimal (Mbit/s × 1.000.000).</p>`,
    figs: [{ cap: "Shared Medium (GPON): Ein passiver Splitter verteilt eine Glasfaser auf viele Kunden – sie teilen sich die Bandbreite.", f: () => {
      let s = D.box(10, 70, 120, 44, "Provider\n(OLT)", P, { fs: 11 }) + D.l(130, 92, 270, 92, "s-acc") + t(200, 84, "1 Glasfaser", { a: "middle", fs: 10.5 });
      s += `<polygon points="270,72 310,92 270,112" class="f-host"/>` + t(290, 132, "Splitter", { a: "middle", fs: 10.5 });
      [20, 60, 100, 140, 180].forEach((y, i) => { s += D.l(310, 92, 430, y + 10, "s-line") + D.box(432, y, 120, 22, "Kunde " + (i + 1), i === 2 ? "f-acc" : "f-box", { fs: 10.5 }); });
      s += t(562, 104, "teilen sich", { fs: 11 }) + t(562, 120, "1 Gbit/s", { fs: 11, w: 700 });
      return D.svg(664, 212, s, "Shared Medium GPON"); } }],
    q: { f: "Ein Provider garantiert 99 % Verfügbarkeit. Berechnen Sie die maximale Ausfallzeit pro Jahr. Wie hoch ist die Verfügbarkeit mit einer zweiten, unabhängigen 99-%-Leitung? (5 Punkte)", a: "365 × 24 h = 8.760 h; 1 % davon = 87,6 Stunden Ausfall pro Jahr.\nZwei parallele Leitungen: 1 − (0,01 × 0,01) = 0,9999 → 99,99 %." } };

  L["g2-kabel"] = { time: 25, kw: /glasfaser|kupfer|sfp|poe|kabel/i, train: [],
    ex: `<p><b>Kupferkabel</b> (Twisted Pair, Cat 6/7) reichen höchstens <b>100 Meter</b>. Zwischen Gebäuden nimmt man <b>Glasfaser</b>: Multimode bis einige hundert Meter, Singlemode viele Kilometer.</p>
      <p>Weitere Vorteile von Glasfaser: höhere und zukunftssichere Bandbreite, <b>unempfindlich gegen elektromagnetische Störungen</b>, <b>galvanische Trennung</b> (kein Ausgleichsstrom zwischen Gebäuden mit unterschiedlichem Erdpotenzial), Schutz bei Blitzeinschlag.</p>
      <p><b>SFP/SFP+</b> sind steckbare Module für Glasfaser am Switch (1 bzw. 10 Gbit/s). Beide Seiten brauchen die <b>gleiche Wellenlänge</b>; Sende- und Empfangsfaser dürfen nicht vertauscht sein; Stecker müssen sauber sein.</p>
      <p><b>PoE</b> (Power over Ethernet) versorgt Access Points, Kameras und Telefone über das Netzwerkkabel. Die Summe aller Geräte darf das <b>PoE-Budget</b> des Switches nicht übersteigen.</p>`,
    figs: [{ cap: "Zwischen zwei Gebäuden mit 150 m Abstand reicht Kupfer (max. 100 m) nicht – Glasfaser schon.", f: () => {
      let s = r(10, 30, 130, 120, "f-sub", 6) + t(75, 22, "Gebäude A", { a: "middle", w: 700 }) + r(524, 30, 130, 120, "f-sub", 6) + t(589, 22, "Gebäude B", { a: "middle", w: 700 });
      s += D.node(75, 90, "switch", "") + D.node(589, 90, "switch", "");
      s += D.l(113, 80, 551, 80, "s-acc") + t(332, 72, "Glasfaser 150 m ✓", { a: "middle", w: 700 });
      s += D.l(113, 104, 330, 104, "s-bad") + t(220, 124, "Kupfer max. 100 m ✗", { a: "middle", fs: 11, w: 600 }) + t(336, 108, "✗", { w: 700 });
      s += t(332, 172, "+ EMV-unempfindlich · galvanisch getrennt · Blitzschutz · mehr Bandbreite", { a: "middle", fs: 11 });
      return D.svg(664, 184, s, "Glasfaser zwischen Gebäuden"); } }],
    q: { f: "Zwei Gebäude im Abstand von 150 m sollen verbunden werden. Begründen Sie mit drei Argumenten den Einsatz von Glasfaser statt Kupfer. (6 Punkte)", a: "Reichweite: Kupfer ist auf 100 m begrenzt, Glasfaser schafft deutlich mehr.\nEMV: Glasfaser ist unempfindlich gegen elektromagnetische Störungen.\nGalvanische Trennung: Glasfaser leitet keinen Strom, es fließt kein Ausgleichsstrom zwischen Gebäuden mit unterschiedlichem Potenzial; zusätzlich Schutz bei Blitzeinschlag. (Auch: höhere, zukunftssichere Bandbreite.)" } };

  L["g2-mail"] = { time: 25, kw: /mail|smtp|imap|pop3|spf|spam|sandbox|starttls/i, train: [],
    ex: `<p><b>Mail senden</b>: Der Mailclient schickt per <b>SMTP</b> an den eigenen Mailserver (Port <b>587</b> mit STARTTLS oder 465 mit SSL/TLS). Der Server leitet per SMTP (Port 25) an den Server des Empfängers weiter. <b>Mail abholen</b>: per <b>IMAP</b> (Port 993, Mails bleiben auf dem Server – gut für mehrere Geräte) oder POP3 (Port 995, Mails werden heruntergeladen).</p>
      <p><b>SPF</b>: ein DNS-Eintrag, der festlegt, welche Server Mails für eine Domain senden dürfen – gegen gefälschte Absender. <b>Spamfilter</b> prüfen Absender, Betreff, Anhänge, Blacklists. Eine <b>Sandbox</b> öffnet verdächtige Anhänge in einer abgeschotteten virtuellen Maschine und beobachtet, was passiert.</p>
      <p>Rechtlich: Darf der Arbeitgeber Mails filtern oder einsehen? Nur wenn private Nutzung verboten ist oder die Mitarbeitenden nachweislich informiert wurden.</p>`,
    figs: [{ cap: "Weg einer E-Mail mit Protokollen und Ports.", f: () => {
      let s = D.node(50, 60, "pc", "Absender\nMailclient") + D.node(240, 60, "server", "Mailserver\nfirma.de") + D.node(450, 60, "server", "Mailserver\nkunde.de") + D.node(620, 60, "pc", "Empfänger\nMailclient");
      s += D.arrow(78, 60, 216, 60, { c: "s-acc", label: "SMTP 587", fs: 10.5 }) + D.arrow(264, 60, 426, 60, { c: "s-acc", label: "SMTP 25", fs: 10.5 }) + D.arrow(592, 60, 474, 60, { label: "IMAP 993 abholen", fs: 10.5 });
      s += D.box(330, 120, 240, 40, "Prüft: SPF-Eintrag von firma.de,\nSpamfilter, Sandbox", K, { fs: 10.5 }) + D.arrow(450, 118, 450, 92, { dash: true });
      return D.svg(664, 170, s, "Weg einer E-Mail"); } }],
    q: { f: "Ein Mitarbeiter richtet seinen Mailclient ein. Nennen Sie das Protokoll zum Abrufen (Mails sollen auf mehreren Geräten verfügbar sein) und die Verbindungssicherheit für den Versand über Port 587. (3 Punkte)", a: "Abrufen: IMAP (Mails bleiben auf dem Server, mehrere Geräte möglich).\nVersand über Port 587: STARTTLS." } };

  L["g2-attack"] = { time: 30, kw: /mitm|arp|passwort|mfa|faktor|phishing|ddos/i, train: [],
    ex: `<p><b>Man-in-the-Middle (MitM)</b>: Ein Angreifer schaltet sich unbemerkt zwischen zwei Kommunikationspartner, liest mit oder verändert Daten. Ein typischer Weg ist <b>ARP-Poisoning</b>: Der Angreifer schickt gefälschte ARP-Antworten „Die IP des Gateways hat meine MAC“. Die Opfer schicken ihren Verkehr dann an ihn.</p>
      <p>Im Mitschnitt erkennst du ARP-Poisoning daran, dass <b>dieselbe IP-Adresse mit verschiedenen MAC-Adressen</b> auftaucht. Schutz: Port-Security, Dynamic ARP Inspection, Verschlüsselung (TLS).</p>
      <p><b>Passwort-Policy</b>: Mindestlänge, Groß/Klein, Zahlen, Sonderzeichen, keine Namen oder Wörterbuchwörter, Wechsel bei Leaks. <b>MFA</b> kombiniert Faktoren: <b>Wissen</b> (Passwort), <b>Besitz</b> (Smartphone, Token), <b>Biometrie</b> (Fingerabdruck).</p>
      <p><b>DDoS</b>: Viele verteilte Systeme überlasten einen Dienst gleichzeitig, sodass echte Kunden ihn nicht mehr erreichen.</p>`,
    figs: [{ cap: "ARP-Poisoning: Der Angreifer behauptet, die Gateway-IP gehöre zu seiner MAC. Der Verkehr des Opfers läuft dann über ihn.", f: () => {
      let s = D.node(80, 60, "pc", "Opfer\n192.168.12.20") + D.node(580, 60, "router", "Gateway\n192.168.12.254") + D.node(330, 170, "pc", "Angreifer\nMAC f2:b9:…", { c: "f-bad" });
      s += `<line x1="108" y1="60" x2="558" y2="60" class="s-line s-dash"/>` + t(330, 52, "normaler Weg (wird umgangen)", { a: "middle", c: "tm", fs: 10.5 });
      s += D.arrow(108, 74, 304, 158, { c: "s-bad" }) + D.arrow(358, 158, 562, 76, { c: "s-bad" }) + D.arrow(304, 176, 112, 92, { c: "s-bad", dash: true, label: "gefälschte ARP-Antwort", ly: 24, fs: 10.5 });
      s += D.box(430, 130, 224, 64, "ARP-Tabelle des Opfers:\n.254 → f2:b9:… (falsch!)\nvorher: .254 → e0:46:…", "f-bad", { fs: 10.5 });
      return D.svg(664, 220, s, "ARP-Poisoning"); } }],
    q: { f: "Nennen Sie neben dem Wissen (Passwort) zwei weitere Faktoren für eine Mehr-Faktor-Authentifizierung mit Beispiel. (4 Punkte)", a: "Besitz: etwas, das der Nutzer hat, z. B. Smartphone mit Authenticator-App oder Hardware-Token.\nBiometrie (Inhärenz): etwas, das der Nutzer ist, z. B. Fingerabdruck oder Gesichtserkennung." } };

  L["g2-iot"] = { time: 20, kw: /mqtt|iot|voip|qos/i, train: [],
    ex: `<p><b>MQTT</b> ist ein schlankes Protokoll für IoT-Geräte (Sensoren). Es arbeitet nach dem <b>Publish/Subscribe</b>-Prinzip: Sensoren senden (publish) Werte an einen zentralen <b>Broker</b>, Anwendungen abonnieren (subscribe) die Themen, die sie interessieren. MQTT nutzt <b>TCP</b>, damit Nachrichten zuverlässig ankommen.</p>
      <p>Bandbreite rechnen: Datenmenge pro Gerät × Anzahl Geräte ÷ Zeitintervall × 8 = bit/s. Beispiel: 500 Geräte × 66 Byte pro Minute = 33.000 Byte ÷ 60 s = 550 Byte/s = 4,4 kbit/s.</p>
      <p><b>VoIP</b> (Telefonie über IP) bekommt meist ein <b>eigenes VLAN</b>: Sprache kann per <b>QoS</b> bevorzugt werden (keine Aussetzer), Telefone sind vom Datennetz getrennt (Sicherheit), Fehler lassen sich leichter finden.</p>`,
    figs: [{ cap: "MQTT: Sensoren veröffentlichen Werte beim Broker, Anwendungen abonnieren die Themen.", f: () => {
      let s = D.box(260, 80, 140, 50, "MQTT-Broker", "f-acc", { fs: 12 });
      [["Temperatur-\nsensor", 30], ["Feuchte-\nsensor", 100], ["Bewegungs-\nmelder", 170]].forEach(([n, y]) => { s += D.box(10, y, 130, 46, n, K, { fs: 10.5 }) + D.arrow(142, y + 23, 258, 105, { c: "s-acc" }); });
      s += t(190, 60, "publish", { a: "middle", fs: 10.5, w: 600 }) + t(470, 60, "subscribe", { a: "middle", fs: 10.5, w: 600 });
      [["Dashboard", 50], ["Alarm-App", 150]].forEach(([n, y]) => { s += D.box(520, y, 130, 40, n, P, { fs: 11 }) + D.arrow(402, 105, 518, y + 20); });
      return D.svg(664, 226, s, "MQTT Publish/Subscribe"); } }],
    q: { f: "Begründen Sie, warum MQTT das Transportprotokoll TCP verwendet. (3 Punkte)", a: "Die Daten werden an einen bestimmten Server (MQTT-Broker) gesendet. Dafür ist ein Verbindungsaufbau nötig, der mit TCP die zuverlässige Zustellung der Publish-Nachrichten sicherstellt (Bestätigung, erneutes Senden bei Verlust)." } };
})();
