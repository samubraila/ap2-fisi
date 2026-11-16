// Lektionen GA2 (Teil 1): Subnetting, Routing, NAT, IPv6, VLAN, STP/FHRP, Firewall, DMZ, WLAN, 802.1X
(function () {
  const D = AP2.D, L = AP2.LESSONS, t = D.t, r = D.r, K = "f-host", P = "f-net";

  L["g2-subnet"] = { time: 60, kw: /nutzbare hosts|\/31|privaten ipv4/i, train: ["subnet", "vlsm"],
    ex: `<p>Eine IPv4-Adresse hat <b>32 Bit</b>, geschrieben als 4 Zahlen (Oktette) von 0 bis 255. Das <b>Präfix</b> (/24, /26 …) sagt, wie viele Bit von links das <b>Netz</b> bestimmen. Der Rest sind <b>Host-Bits</b> für die Geräte.</p>
      <p><b>Nutzbare Hosts</b> = 2<sup>Host-Bits</sup> − 2. Abgezogen werden die <b>Netz-ID</b> (alle Host-Bits 0) und der <b>Broadcast</b> (alle Host-Bits 1). Beispiel /26: 6 Host-Bits → 64 Adressen → 62 nutzbar.</p>
      <p><b>Schnell rechnen mit der Blockgröße</b>: 256 − Maskenwert. Bei /26 ist die Maske 255.255.255.192 → Block 64. Die Netze beginnen bei .0, .64, .128, .192.</p>
      <p><b>VLSM</b>: Netze unterschiedlicher Größe aus einem Bereich – immer das größte zuerst vergeben. <b>Private Bereiche</b>: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.</p>`,
    figs: [{ cap: "192.168.1.0/24 in vier /26-Netze geteilt. Jedes Netz hat 64 Adressen: die erste ist die Netz-ID, die letzte der Broadcast.", f: () => {
      let s = t(10, 16, "192.168.1.0/24 → 4 × /26 (Maske 255.255.255.192, Blockgröße 64)", { w: 700 });
      [0, 64, 128, 192].forEach((b, i) => { const x = 10 + i * 162; s += r(x, 28, 156, 50, ["f-c1", "f-c2", "f-c3", "f-c4"][i], 6) + t(x + 78, 48, "Netz " + (i + 1) + ": ." + b + " – ." + (b + 63), { a: "middle", w: 700, fs: 11.5 }) + t(x + 78, 66, "62 Hosts", { a: "middle", fs: 11 });
        s += t(x, 96, "ID ." + b, { fs: 10.5 }) + t(x + 156, 96, "BC ." + (b + 63), { a: "end", fs: 10.5 }); });
      s += t(10, 124, "Beispiel: Host .77 liegt im Netz .64 – .127 → Netz-ID 192.168.1.64, Broadcast 192.168.1.127", { fs: 11.5 });
      return D.svg(664, 134, s, "Subnetting in vier Netze"); } }],
    q: { f: "Ein Unternehmen hat 172.16.102.0/24 und braucht Netze für 80, 50, 20 und 10 Hosts. Geben Sie Netzadresse und Subnetzmaske je Bereich an. (8 Punkte)", a: "80 Hosts → 128 Adressen (/25): 172.16.102.0, 255.255.255.128\n50 Hosts → 64 Adressen (/26): 172.16.102.128, 255.255.255.192\n20 Hosts → 32 Adressen (/27): 172.16.102.192, 255.255.255.224\n10 Hosts → 16 Adressen (/28): 172.16.102.224, 255.255.255.240" } };

  L["g2-route"] = { time: 45, kw: /routing|metrik|default route|mac des gateways|unicast/i, train: [],
    ex: `<p>Ein <b>Router</b> verbindet Netze und entscheidet anhand seiner <b>Routingtabelle</b>, wohin ein Paket geht. Jede Zeile: Zielnetz, Maske, Schnittstelle, Next-Hop (nächster Router).</p>
      <p>Der Router wählt immer die <b>spezifischste</b> passende Route (längstes Präfix). Passt keine, greift die <b>Default Route</b> 0.0.0.0/0 – meist Richtung Internet.</p>
      <p><b>Statisches Routing</b>: Routen werden von Hand eingetragen – einfach, aber fällt eine Leitung aus, merkt es der Router nicht. <b>Dynamisches Routing</b> (OSPF, RIP …): Router tauschen Routen aus, finden Alternativwege automatisch – kostet aber Rechenleistung und Bandbreite. Die <b>Metrik</b> bewertet Wege; kleiner ist besser.</p>
      <p>Ein PC prüft: Liegt das Ziel in meinem Netz? Wenn nein, schickt er das Paket an sein <b>Standard-Gateway</b>. Dessen MAC-Adresse holt er per <b>ARP</b> (Broadcast „Wer hat IP x?“).</p>`,
    figs: [{ cap: "Router R1 kennt zwei Netze direkt, ein drittes über R2 und alles andere über die Default Route ins Internet.", f: () => {
      let s = D.node(70, 60, "switch", "LAN A\n10.0.1.0/24") + D.node(250, 60, "router", "R1") + D.node(430, 60, "router", "R2") + D.node(590, 60, "switch", "LAN B\n10.0.2.0/24");
      s += D.l(108, 60, 230, 60, "s-acc") + D.l(270, 60, 410, 60, "s-acc") + D.l(450, 60, 552, 60, "s-acc") + t(340, 52, "10.0.0.0/30", { a: "middle", fs: 10.5, c: "tm" });
      s += D.node(250, 160, "cloud", "Internet") + D.l(250, 80, 250, 134, "s-acc") + t(256, 112, "eth2", { fs: 10.5, c: "tm" }) + t(204, 52, "eth0", { fs: 10.5, c: "tm" }) + t(274, 52, "eth1", { fs: 10.5, c: "tm" });
      const rows = [["Zielnetz", "Interface", "Next-Hop"], ["10.0.1.0/24", "eth0", "direkt"], ["10.0.0.0/30", "eth1", "direkt"], ["10.0.2.0/24", "eth1", "10.0.0.2"], ["0.0.0.0/0", "eth2", "Provider"]];
      rows.forEach((row, j) => row.forEach((v, k) => { s += D.box(360 + k * 100, 110 + j * 22, 98, 20, v, j === 0 ? "f-acc" : j === 4 ? K : "f-box", { fs: 10.5, bold: j === 0 }); }));
      s += t(360, 104, "Routingtabelle R1", { w: 700, fs: 11.5 });
      return D.svg(664, 226, s, "Routing mit zwei Routern"); } }],
    q: { f: "Nennen Sie je zwei Vor- und Nachteile von dynamischem Routing gegenüber statischem Routing. (6 Punkte)", a: "Vorteile: Bei Leitungsausfall werden automatisch Alternativrouten genutzt; neue Netze werden automatisch bekannt gemacht (weniger Pflegeaufwand).\nNachteile: höhere Prozessorlast und Netzlast durch den Austausch der Routinginformationen; aufwendigere Konfiguration, Know-how zu Routingprotokollen nötig." } };

  L["g2-nat"] = { time: 45, kw: /nat|pat|portforward|cgn|masquerad/i, train: [],
    ex: `<p>Im Firmennetz haben Geräte <b>private</b> IP-Adressen (z. B. 192.168.1.10). Diese werden im Internet nicht geroutet. Der Router tauscht sie darum gegen seine <b>öffentliche</b> Adresse: das ist <b>NAT</b> (Network Address Translation).</p>
      <p><b>PAT</b> (Port Address Translation) ändert zusätzlich den Quell-Port. So können viele Geräte gleichzeitig eine öffentliche IP nutzen. Der Router merkt sich in einer Tabelle, welcher Port zu welchem internen Gerät gehört, und leitet die Antwort richtig zurück.</p>
      <p><b>Portforwarding</b> (Destination-NAT) ist die Gegenrichtung: Anfragen von außen an öffentliche IP:Port werden an einen internen Server weitergeleitet – z. B. Port 443 an den Webserver in der DMZ.</p>
      <p><b>CGN</b> (Carrier-Grade NAT, oft bei LTE): Schon der Provider NATtet. Dann ist dein Router von außen <b>nicht erreichbar</b>, Portforwarding geht nicht. Lösung: öffentliche IPv4 buchen oder IPv6 nutzen.</p>`,
    figs: [{ cap: "PAT: Der Router ersetzt Quell-IP und Quell-Port und merkt sich die Zuordnung. Die Antwort wird zurückübersetzt.", f: () => {
      let s = D.node(60, 60, "pc", "PC A\n192.168.1.10") + D.node(60, 160, "pc", "PC B\n192.168.1.11") + D.node(320, 110, "router", "NAT-Router\n203.0.113.5") + D.node(600, 110, "server", "Webserver\n198.51.100.7");
      s += D.arrow(88, 60, 296, 102, { c: "s-acc", label: "von .10:50000", ly: -8, fs: 10.5 }) + D.arrow(88, 160, 296, 120, { c: "s-acc", label: "von .11:50000", ly: 16, fs: 10.5 });
      s += D.arrow(344, 104, 576, 104, { c: "s-acc", label: "von 203.0.113.5:40001 / :40002", fs: 10.5 }) + D.arrow(576, 122, 344, 122, { dash: true, label: "Antwort an :40001", ly: 18, fs: 10.5 });
      [["intern", "extern"], ["192.168.1.10:50000", "203.0.113.5:40001"], ["192.168.1.11:50000", "203.0.113.5:40002"]].forEach((row, j) => row.forEach((v, k) => { s += D.box(200 + k * 150, 180 + j * 22, 148, 20, v, j === 0 ? "f-acc" : "f-box", { fs: 10.5, bold: j === 0 }); }));
      s += t(200, 174, "NAT/PAT-Tabelle des Routers", { w: 700, fs: 11.5 });
      return D.svg(664, 252, s, "NAT und PAT"); } }],
    q: { f: "Erläutern Sie, warum ein Router bei PAT für ausgehende Verbindungen neue Quell-Portnummern wählt. (2 Punkte)", a: "Mehrere interne PCs können Pakete mit identischer Quell-Portnummer senden. Der Router vergibt deshalb eigene, eindeutige Quell-Ports und merkt sich die Zuordnung, damit er Antworten an den richtigen internen PC weiterleiten kann." } };

  L["g2-ipv6"] = { time: 50, kw: /ipv6|fe80|slaac|dual stack|dhcpv6|\/56|\/64/i, train: ["ipv6"],
    ex: `<p>IPv6-Adressen haben <b>128 Bit</b>, geschrieben als 8 Blöcke à 4 Hex-Ziffern: 2001:0db8:abcd:0012:0000:0000:0000:0001. Kürzen: führende Nullen weglassen, <b>einmal</b> eine Folge von Null-Blöcken durch :: ersetzen → 2001:db8:abcd:12::1.</p>
      <p>Aufbau: vorne das <b>Präfix</b> vom Provider (oft /48 oder /56), dann die <b>Subnetz-ID</b> (bis /64), hinten 64 Bit <b>Interface-ID</b> für das Gerät. Ein /64 hat 2<sup>64</sup> Adressen – mehr als genug.</p>
      <p>Adressarten: <b>fe80::/10</b> Link-Local (nur im eigenen Segment, jedes Gerät hat eine), <b>2000::/3</b> Global Unicast (öffentlich), <b>fc00::/7</b> Unique Local (privat).</p>
      <p><b>SLAAC</b>: Das Gerät bekommt per Router Advertisement das Präfix und bildet seine Adresse selbst. <b>DHCPv6</b>: zentrale Vergabe und Protokollierung. <b>Dual Stack</b>: IPv4 und IPv6 laufen parallel. Vorteile von IPv6: riesiger Adressraum, kein NAT nötig, Autokonfiguration, IPsec eingebaut.</p>`,
    figs: [{ cap: "Aufbau einer IPv6-Adresse: Präfix vom Provider, Subnetz-ID für eigene Netze, Interface-ID für das Gerät.", f: () => {
      const parts = [["2001:db8:abcd", "Präfix /48 (vom Provider)", 3, P], ["0012", "Subnetz-ID (16 Bit)", 1, K], ["0000:0000:0000:0001", "Interface-ID (64 Bit)", 4, "f-sub"]];
      let s = "", x = 10; parts.forEach(([v, n, w, c]) => { const bw = w * 80; s += D.box(x, 20, bw - 4, 40, v, c, { fs: 12 }) + t(x + bw / 2 - 2, 78, n, { a: "middle", fs: 11, w: 600 }); x += bw; });
      s += t(10, 108, "Bit 1–48", { c: "tm", fs: 10.5 }) + t(250, 108, "49–64", { c: "tm", fs: 10.5 }) + t(330, 108, "65–128", { c: "tm", fs: 10.5 });
      s += t(10, 136, "Mit /48 kann man 2^16 = 65.536 eigene /64-Netze bilden, mit /56 nur 2^8 = 256.", { fs: 11.5 });
      return D.svg(664, 148, s, "Aufbau einer IPv6-Adresse"); } }],
    q: { f: "Nennen Sie drei Vorteile von IPv6 gegenüber IPv4. (6 Punkte)", a: "Sehr großer Adressraum (128 Bit), dadurch kein NAT mehr nötig; zustandslose Autokonfiguration (SLAAC) vereinfacht die Verwaltung; integrierte Sicherheit auf Netzwerkebene (IPsec). (Auch: vereinfachter Header, effizienteres Routing ohne Fragmentierung durch Router, QoS-Unterstützung.)" } };

  L["g2-vlan"] = { time: 50, kw: /vlan|trunk|tagged|802\.1q|subinterface|router-on/i, train: [],
    ex: `<p>Ein <b>VLAN</b> (Virtual LAN) teilt einen physischen Switch in mehrere <b>logische Netze</b>. Geräte in VLAN 10 sehen Geräte in VLAN 20 nicht – als wären es getrennte Switches. Vorteile: mehr Sicherheit, kleinere Broadcast-Domänen, weniger Hardware, flexibel.</p>
      <p><b>Access-Port</b> (untagged): gehört zu genau einem VLAN, dort hängt ein Endgerät. <b>Trunk-Port</b> (tagged): transportiert mehrere VLANs zwischen Switches oder zum Router. Damit klar ist, zu welchem VLAN ein Frame gehört, fügt <b>802.1Q</b> auf Layer 2 einen 4-Byte-Tag mit der VLAN-ID ein.</p>
      <p>Zwischen VLANs braucht man einen <b>Router</b> (oder Layer-3-Switch). <b>Router-on-a-Stick</b>: ein physisches Router-Interface mit einem <b>Subinterface pro VLAN</b>, jedes mit der Gateway-IP seines Netzes.</p>
      <p>Typische Fehler in Aufgaben: Uplink nicht tagged, Client im falschen VLAN, Gateway-IP liegt nicht im Netz des VLANs, DHCP-Server in anderem VLAN ohne DHCP-Relay.</p>`,
    figs: [{ cap: "Zwei Switches mit Trunk (tagged). Endgeräte hängen an Access-Ports (untagged). Der Router hat ein Subinterface pro VLAN.", f: () => {
      let s = D.node(160, 120, "switch", "Switch 1") + D.node(500, 120, "switch", "Switch 2") + D.node(330, 30, "router", "");
      s += t(360, 26, "Router: eth0.10 = 192.168.10.1", { fs: 10.5 }) + t(360, 40, "eth0.20 = 192.168.20.1", { fs: 10.5 });
      s += D.l(198, 120, 462, 120, "s-acc") + t(330, 112, "Trunk: VLAN 10 + 20 (tagged)", { a: "middle", fs: 11, w: 600 }) + D.l(330, 50, 330, 120, "s-acc") + t(336, 92, "Trunk", { fs: 10.5 });
      [[80, 10], [150, 20], [220, 10], [430, 20], [500, 10], [570, 20]].forEach(([x, v]) => { const c = v === 10 ? "f-c1" : "f-c2"; s += D.l(x, 132, x, 182, "s-line") + D.node(x, 200, "pc", "VLAN " + v, { c }); });
      s += r(10, 250, 12, 12, "f-c1", 2) + t(28, 260, "VLAN 10 Verwaltung (untagged Access-Port)", { fs: 11 }) + r(340, 250, 12, 12, "f-c2", 2) + t(358, 260, "VLAN 20 Technik (untagged Access-Port)", { fs: 11 });
      return D.svg(664, 270, s, "VLANs mit Trunk und Router-on-a-Stick"); } }],
    q: { f: "Nennen Sie zwei Vorteile von VLANs und erläutern Sie, was am Uplink zwischen zwei Switches eingestellt werden muss. (6 Punkte)", a: "Vorteile: mehr Sicherheit durch logische Trennung der Netze; kleinere Broadcast-Domänen; weniger Hardware und Verkabelung, da mehrere Netze auf einem Switch laufen.\nUplink: Die Ports müssen als Trunk auf „tagged“ (IEEE 802.1Q) gestellt werden, damit Frames mehrerer VLANs mit VLAN-Tag übertragen werden." } };

  L["g2-stp"] = { time: 30, kw: /spanning|stp|link aggregation|lacp|fhrp|vrrp|hsrp/i, train: [],
    ex: `<p>Redundante Kabel zwischen Switches erhöhen die Ausfallsicherheit – aber sie erzeugen <b>Schleifen</b>. Broadcasts würden endlos kreisen (Broadcast-Sturm) und das Netz lahmlegen.</p>
      <p><b>Spanning Tree (STP)</b> verhindert das: Die Switches einigen sich auf einen Root-Switch und <b>blockieren</b> redundante Ports. Fällt ein Weg aus, wird der blockierte Port freigegeben.</p>
      <p><b>Link Aggregation (LACP)</b> bündelt mehrere Kabel zwischen zwei Geräten zu einer logischen Verbindung: mehr Bandbreite und Ausfallsicherheit – ohne Schleife.</p>
      <p><b>FHRP</b> (z. B. VRRP, HSRP) macht das <b>Gateway</b> redundant: Zwei Router teilen sich eine <b>virtuelle IP</b>. Die Clients tragen diese als Gateway ein. Fällt der aktive Router aus, übernimmt der Standby-Router.</p>`,
    figs: [{ cap: "Links: STP blockiert einen Port, damit keine Schleife entsteht. Rechts: VRRP – zwei Router teilen sich die virtuelle Gateway-IP .254.", f: () => {
      let s = D.node(160, 30, "switch", "Switch A (Root)") + D.node(60, 150, "switch", "Switch B") + D.node(260, 150, "switch", "Switch C");
      s += D.l(140, 42, 70, 138, "s-acc") + D.l(180, 42, 250, 138, "s-acc") + `<line x1="98" y1="150" x2="222" y2="150" class="s-bad s-dash"/>` + t(160, 144, "✗ blockiert", { a: "middle", c: "t", fs: 11, w: 700 });
      s += D.node(450, 40, "router", "Router 1\naktiv") + D.node(590, 40, "router", "Router 2\nStandby") + D.box(440, 110, 160, 30, "virtuelle IP .254", "f-acc", { fs: 11.5 });
      s += D.l(450, 60, 500, 110, "s-acc") + D.l(590, 60, 540, 110, "s-line s-dash") + D.node(520, 196, "pc", "Clients: Gateway .254") + D.l(520, 140, 520, 176, "s-acc");
      return D.svg(664, 244, s, "Spanning Tree und VRRP"); } }],
    q: { f: "An einem Switch ist ein Port mit angeschlossenem Kabel als „blocked“ gekennzeichnet. Erläutern Sie den Grund. (4 Punkte)", a: "Das Spanning Tree Protocol hat den Port blockiert, weil über diese Verbindung eine Schleife im Netzwerk entstehen würde. So werden Broadcast-Stürme verhindert. Fällt der aktive Weg aus, gibt STP den Port wieder frei." } };

  L["g2-fw"] = { time: 45, kw: /firewall|stateful|ngfw|paketfilter|wichtige ports/i, train: [],
    ex: `<p>Eine <b>Firewall</b> filtert Datenverkehr nach Regeln. Jede Regel: Richtung, Protokoll (TCP/UDP), Quell-IP, Ziel-IP, Quell-Port, Ziel-Port, Aktion (allow/deny).</p>
      <p>Regeln werden <b>von oben nach unten</b> geprüft, die <b>erste passende</b> gilt. Ganz unten steht immer: <b>alles andere verbieten</b> (deny any). Der Quell-Port eines Clients ist zufällig (any), der Ziel-Port ist der Dienst (443 für HTTPS).</p>
      <p><b>Paketfilter</b> prüft jedes Paket einzeln. <b>Stateful Packet Inspection (SPI)</b> merkt sich Verbindungen und lässt Antworten automatisch durch – man braucht keine Regel für den Rückweg. <b>Next Generation Firewall (NGFW)</b> prüft zusätzlich auf Layer 7: Anwendungen, Malware, URLs, IDS/IPS, TLS-Inspection.</p>
      <p>Grenzen: Gegen Phishing, USB-Sticks oder Innentäter hilft eine Firewall nicht. Wichtige Ports: 22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS, 587 Mail-Versand, 993 IMAPS.</p>`,
    figs: [{ cap: "Ein Paket an Port 443 wird von oben geprüft. Regel 1 passt nicht, Regel 2 passt → erlaubt. Die letzte Regel verbietet alles andere.", f: () => {
      const rows = [["Nr.", "Richtung", "Protokoll", "Ziel-IP", "Ziel-Port", "Aktion"], ["1", "in", "TCP", "203.0.113.11", "25", "allow"], ["2", "in", "TCP", "203.0.113.10", "443", "allow"], ["3", "in", "TCP", "203.0.113.11", "993", "allow"], ["4", "in", "any", "any", "any", "deny"]];
      const cw = [44, 80, 80, 130, 80, 70]; let s = "";
      rows.forEach((row, j) => { let x = 150; row.forEach((v, k) => { s += D.box(x, 14 + j * 30, cw[k] - 3, 26, v, j === 0 ? "f-acc" : j === 2 ? "f-good" : j === 4 ? "f-bad" : "f-box", { fs: 11, bold: j === 0 }); x += cw[k]; }); });
      s += D.box(10, 50, 110, 46, "Paket\nTCP → .10:443", K, { fs: 11 }) + D.arrow(122, 58, 148, 58) + t(640, 58, "passt nicht", { fs: 10.5, c: "tm" }) + D.arrow(122, 88, 148, 88, { c: "s-acc" }) + t(640, 88, "passt → allow", { fs: 10.5, w: 700 });
      s += D.arrow(135, 60, 135, 86, { c: "s-acc" });
      return D.svg(730, 168, s, "Firewall-Regeln von oben nach unten"); } }],
    q: { f: "Erläutern Sie den Unterschied zwischen einem Paketfilter und Stateful Packet Inspection. (4 Punkte)", a: "Ein Paketfilter prüft jedes Paket einzeln nach IP-Adressen, Ports und Protokoll; Antwortpakete braucht er als eigene Regel.\nSPI erfasst erlaubte Verbindungen als „States“ in einer Zustandstabelle. Antworten auf erfasste Verbindungen werden automatisch zugelassen." } };

  L["g2-dmz"] = { time: 35, kw: /dmz|reverse proxy|proxy|split-horizon/i, train: [],
    ex: `<p>Eine <b>DMZ</b> (demilitarisierte Zone) ist ein eigenes Netz zwischen Internet und internem LAN. Dort stehen Server, die <b>von außen erreichbar</b> sein müssen: Webserver, Mailserver, Reverse Proxy.</p>
      <p>Warum? Wird ein Webserver gehackt, ist der Angreifer nur in der DMZ – <b>nicht direkt im internen Netz</b>. Die Firewall erlaubt aus der DMZ ins LAN nur das Nötigste.</p>
      <p><b>Intern bleiben</b>: Datenbankserver, Active Directory, Fileserver, Druckserver – sie müssen von außen nicht erreichbar sein.</p>
      <p>Ein <b>Reverse Proxy</b> nimmt Anfragen aus dem Internet stellvertretend an und leitet sie an interne Server weiter. Er kann TLS entschlüsseln, filtern, zwischenspeichern und Last verteilen – mehr als eine einfache Portweiterleitung.</p>`,
    figs: [{ cap: "Firewall mit drei Zonen: Internet, DMZ (öffentliche Dienste) und LAN (interne Server). Aus dem Internet geht es nur in die DMZ.", f: () => {
      let s = D.node(80, 110, "cloud", "Internet", { rx: 60 }) + D.node(300, 110, "fw", "Firewall");
      s += D.arrow(140, 110, 270, 110, { c: "s-acc", label: "443, 25", fs: 10.5 });
      s += r(390, 10, 264, 92, "f-host", 10) + t(400, 28, "DMZ", { w: 700 }); [["Webserver", 440], ["Mailserver", 520], ["Rev. Proxy", 600]].forEach(([n, x]) => { s += D.node(x, 58, "server", n); });
      s += r(390, 120, 264, 104, "f-net", 10) + t(400, 138, "LAN (intern)", { w: 700 }); [["DB-Server", 440], ["AD", 520], ["Fileserver", 600]].forEach(([n, x]) => { s += D.node(x, 170, "server", n); });
      s += D.arrow(330, 98, 388, 60, { c: "s-acc" }) + D.arrow(330, 122, 388, 170, { c: "s-line" }) + t(150, 150, "kein direkter Weg", { fs: 10.5, c: "tm" }) + D.arrow(140, 128, 388, 196, { c: "s-bad", dash: true });
      return D.svg(664, 236, s, "DMZ-Aufbau"); } }],
    q: { f: "Ordnen Sie Reverse-Proxy, Webserver, Mailserver, Datenbankserver, AD-Server und Druckserver der DMZ oder dem internen Netz zu und begründen Sie. (4 Punkte)", a: "DMZ: Reverse-Proxy, Webserver, Mailserver – sie müssen aus dem Internet erreichbar sein und sollen vom internen Netz getrennt sein.\nInternes Netz: Datenbankserver, AD-Server, Druckserver – ihre Dienste müssen von außen nicht erreichbar sein." } };

  L["g2-wlan"] = { time: 45, kw: /wlan|wpa|psk|ssid|bssid|gast|captive|aaa|kanal/i, train: [],
    ex: `<p><b>WPA2/WPA3-Personal (PSK)</b>: Alle nutzen <b>ein gemeinsames Passwort</b>. Einfach, aber riskant: Das Passwort wird weitergegeben, und wenn jemand die Firma verlässt, muss man es überall ändern.</p>
      <p><b>WPA2/WPA3-Enterprise</b>: Jeder meldet sich mit <b>eigenen Zugangsdaten</b> oder einem Zertifikat an. Der Access Point fragt einen <b>RADIUS-Server</b> (802.1X/EAP). Einzelne Nutzer lassen sich sperren, Zugriffe werden personenbezogen protokolliert. RADIUS macht <b>AAA</b>: Authentication (wer?), Authorization (was darf er?), Accounting (was hat er genutzt?).</p>
      <p><b>Gast-WLAN</b>: eigene SSID, eigenes VLAN/IP-Netz ohne Zugriff aufs LAN, <b>Captive Portal</b> mit Voucher (zeitlich begrenzt, Nutzungsbedingungen).</p>
      <p>WLAN-Scan lesen: <b>SSID</b> = Name, <b>BSSID</b> = MAC des Access Points, Kanal, Kanalbreite, Verschlüsselung, Signalstärke. Bei 2,4 GHz überlappen sich Kanäle – nur 1, 6, 11 sind überlappungsfrei. „&lt;hidden&gt;“ = SSID-Broadcast ist aus.</p>`,
    figs: [{ cap: "Ein Access Point mit zwei SSIDs: Mitarbeitende melden sich über RADIUS an und landen im LAN-VLAN, Gäste nur im Internet.", f: () => {
      let s = D.node(330, 60, "ap", "Access Point");
      s += D.node(90, 40, "user", "Mitarbeiterin", { c: P }) + D.arrow(114, 40, 300, 60, { c: "s-acc", label: "SSID Firma · WPA2-Enterprise", ly: -10, fs: 10.5 });
      s += D.node(90, 150, "user", "Gast", { c: K }) + D.arrow(114, 150, 300, 76, { label: "SSID Gast · Captive Portal", ly: 20, fs: 10.5 });
      s += D.node(560, 30, "server", "RADIUS") + D.arrow(358, 54, 536, 32, { c: "s-acc", both: true, label: "802.1X prüfen", fs: 10.5 });
      s += D.box(430, 110, 220, 32, "VLAN 10 → Firmen-LAN", P, { fs: 11.5 }) + D.box(430, 156, 220, 32, "VLAN 99 → nur Internet", K, { fs: 11.5 }) + D.arrow(350, 84, 428, 126, { c: "s-acc" }) + D.arrow(345, 90, 428, 172);
      return D.svg(664, 210, s, "Firmen- und Gast-WLAN"); } }],
    q: { f: "Erläutern Sie den Vorteil von WPA2-Enterprise gegenüber WPA2-PSK, wenn ein Mitarbeiter das Unternehmen verlässt. (4 Punkte)", a: "Bei WPA2-PSK nutzen alle einen gemeinsamen Schlüssel. Verlässt jemand das Unternehmen, müsste der Schlüssel auf allen Geräten geändert werden.\nBei WPA2-Enterprise hat jeder Benutzer eigene Zugangsdaten (über RADIUS). Es genügt, die Zugangsdaten dieses einen Mitarbeiters zu deaktivieren." } };

  L["g2-8021x"] = { time: 25, kw: /802\.1x|port-security|sticky|radius|mac/i, train: [],
    ex: `<p><b>802.1X</b> schützt Netzwerkanschlüsse (LAN-Dosen und WLAN): Ein Gerät darf erst ins Netz, wenn es sich angemeldet hat. Drei Rollen: <b>Supplicant</b> (das Gerät), <b>Authenticator</b> (Switch oder Access Point) und <b>Authentication Server</b> (RADIUS). Nach der Anmeldung kann der Switch das Gerät sogar automatisch in das richtige VLAN stecken.</p>
      <p><b>Port-Security</b> ist einfacher: Pro Switchport sind nur bestimmte MAC-Adressen erlaubt. <b>Configured</b> = fest eingetragen, <b>Sticky</b> = der Switch lernt die erste MAC und merkt sie sich. Kommt eine fremde MAC, greift der <b>Violation Mode</b>, z. B. <b>shutdown</b>: Port wird abgeschaltet.</p>
      <p>Grenze: Port-Security hilft nicht, wenn der Angreifer ein erlaubtes Gerät nutzt oder dessen MAC fälscht.</p>`,
    figs: [{ cap: "802.1X: Der Switch lässt das Gerät erst durch, wenn der RADIUS-Server die Anmeldung bestätigt hat.", f: () => D.seq(["Laptop\n(Supplicant)", "Switch\n(Authenticator)", "RADIUS-Server"], [[0, 1, "Verbindung, Port noch gesperrt"], [1, 0, "Identität?"], [0, 1, "Benutzer + Passwort / Zertifikat"], [1, 2, "Anmeldedaten prüfen"], [2, 1, "Accept + VLAN 10"], [1, 0, "Port frei (VLAN 10)", { c: "s-good" }]], { w: 640, label: "Ablauf 802.1X" }) }],
    q: { f: "Erläutern Sie die Funktionsweise von Port-Security mit „sticky MAC“ und dem Violation Mode „shutdown“. (4 Punkte)", a: "Bei sticky MAC lernt der Switch die MAC-Adresse des ersten angeschlossenen Geräts dynamisch und speichert sie als erlaubte Adresse für diesen Port.\nWird danach ein Gerät mit einer anderen MAC-Adresse angeschlossen, tritt eine Verletzung auf; im Modus shutdown wird der Port sofort deaktiviert und bleibt aus, bis er manuell wieder aktiviert wird." } };
})();
