# AP2 Lernzentrale FiSi

Lern-App für die **IHK-Abschlussprüfung Teil 2 – Fachinformatiker Systemintegration (AO 2020)**, ausgewertet aus zehn Prüfungsterminen (Winter 2021/22 bis Sommer 2026).

## Funktionen

- **Lernplan** Tag für Tag bis zum Prüfungstermin, jedes Thema mit „Starten“-Knopf
- **51 Lektionen** (GA1, GA2, WiSo): Erklärung, Diagramm, Lernkarten, Prüfungsfrage mit Musterantwort
- **Themen-Radar:** welches Thema in welchem Termin drankam
- **Rechen-Trainer:** 18 Aufgabentypen mit Zufallszahlen, Schritt-für-Schritt-Lösung und Zeichnung (Subnetting, VLSM, IPv6, RAID, Verfügbarkeit, Übertragungszeit, USV, KV-Beitrag, Kündigungsfrist …)
- **Lernkarten** nach dem Karteikasten-Prinzip, **WiSo-Quiz**
- **Notenrechner** mit allen Bestehensregeln und mündlicher Ergänzungsprüfung
- **Prüfungsarchiv** und **Prüfungstipps**

## Starten

Die App läuft als Claude-Artifact. Lokal: `ap2.html` braucht das Gerüst des Artifact-Hosts; zum Testen der Logik ohne Browser:

```
node tests/check.js
```

## Hinweis

Die Inhalte sind eigene Zusammenfassungen und selbst formulierte Übungsfragen. Original-Prüfungsaufgaben der IHK/ZPA sind urheberrechtlich geschützt und **nicht** Teil dieses Repos.
