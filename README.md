# AP2 Lernzentrale FiSi

Lern-App für die **IHK-Abschlussprüfung Teil 2 – Fachinformatiker Systemintegration (AO 2020)**, ausgewertet aus zehn Prüfungsterminen (Winter 2021/22 bis Sommer 2026).

**Online öffnen:** https://samubraila.github.io/ap2-fisi/

## Funktionen

- **Lernplan** Tag für Tag bis zum Prüfungstermin, jedes Thema mit „Starten“-Knopf
- **51 Lektionen** (GA1, GA2, WiSo): Erklärung, Diagramm, Lernkarten, Prüfungsfrage mit Musterantwort
- **Themen-Radar:** welches Thema in welchem Termin drankam
- **Rechen-Trainer:** 18 Aufgabentypen mit Zufallszahlen, Schritt-für-Schritt-Lösung und Zeichnung (Subnetting, VLSM, IPv6, RAID, Verfügbarkeit, Übertragungszeit, USV, KV-Beitrag, Kündigungsfrist …)
- **Lernkarten** nach dem Karteikasten-Prinzip, **WiSo-Quiz**
- **Notenrechner** mit allen Bestehensregeln und mündlicher Ergänzungsprüfung
- **Prüfungsarchiv** und **Prüfungstipps**

## Starten

Die App läuft auf GitHub Pages (Link oben) und als Claude-Artifact. `index.html` wird aus `ap2.html` erzeugt:

```
node tools/build-pages.js   # index.html neu bauen
node tests/check.js         # Logik, Lektionen und index.html prüfen
```

Lokal einfach `index.html` im Browser öffnen. Der Lernfortschritt wird im Browser gespeichert.

## Hinweis

Die Inhalte sind eigene Zusammenfassungen und selbst formulierte Übungsfragen. Original-Prüfungsaufgaben der IHK/ZPA sind urheberrechtlich geschützt und **nicht** Teil dieses Repos.
