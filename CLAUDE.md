# AP2 Lernzentrale FiSi – Arbeitsanweisung für Claude

Lern-App für die IHK-Abschlussprüfung Teil 2, Fachinformatiker Systemintegration (AO 2020).

- **Live-App (Claude-Artifact):** https://claude.ai/artifact/Gvr32rVTViEjKyub3FU8eb
- **Live-App (GitHub Pages):** https://samubraila.github.io/ap2-fisi/ – wird aus `index.html` auf `main` ausgeliefert
- **GitHub:** https://github.com/samubraila/ap2-fisi – Branch `main`

## Pflicht nach JEDER Änderung

Der Nutzer will, dass jede Änderung **sofort** im Repo und in beiden Live-Versionen landet. Nicht nachfragen, keinen Feature-Branch anlegen – direkt auf `main`.

1. **Bauen und testen:** `node tools/build-pages.js` (erzeugt `index.html` aus `ap2.html`), dann `node tests/check.js` – muss mit „0 Probleme“ enden. Sonst erst reparieren. `index.html` nie von Hand bearbeiten.
2. **Committen und pushen:**
   ```
   git add -A
   git commit -m "<was geändert wurde, auf Deutsch>"
   git push
   ```
3. **Artifact neu veröffentlichen – immer dieselbe URL:**
   - In einem neuen Chat zuerst das Artifact-Tool mit `action: "read"` und `url: https://claude.ai/artifact/Gvr32rVTViEjKyub3FU8eb` aufrufen (sonst wird der Publish abgelehnt).
   - Dann `action: "publish"` mit `url` (wie oben), `file_path` = `ap2.html` dieses Ordners und `files` = **alle** `.js`-Dateien, die in `ap2.html` per `<script src>` eingebunden sind (Pfad im Artifact = Dateiname).
   - `capabilities` und `icon` weglassen – sie bleiben erhalten (db + user für den Fortschritt).
4. Dem Nutzer kurz sagen, was neu ist, und beide Links nennen. GitHub Pages braucht nach dem Push 1–2 Minuten.

Hinweis: Auf GitHub Pages gibt es kein `window.claude` – der Fortschritt liegt dort nur im `localStorage` des Browsers, getrennt vom Fortschritt im Artifact. Der Code muss ohne `window.claude` voll funktionieren.

## Aufbau

| Datei | Inhalt |
|---|---|
| `ap2.html` | Gerüst, Design (CSS-Variablen für hell/dunkel), Reiter, Script-Reihenfolge |
| `data-topics.js` | Prüfungstermine, Themen GA1/GA2 mit „wann gefragt“, WiSo-Kategorien, Aufgaben je Termin |
| `data-cards.js` | Lernkarten `[Bereich, Frage, Antwort]` und WiSo-Quiz |
| `app-core.js` | Speicher (db-Capability `data/users/<id>/progress` + localStorage), Router, Übersicht, Themen-Radar, Archiv, Tipps |
| `app-tools.js` | Notenrechner (FIAusbV 2020), Lernkarten-Ansicht, WiSo-Quiz |
| `trainer-lib.js` | Hilfsfunktionen und SVG-Werkzeuge für den Rechen-Trainer |
| `trainer-ga1.js`, `trainer-ga2.js`, `trainer-wiso.js` | Rechenaufgaben: `howto`, `make()` → `prompt`, `fields`, `steps`, `fig`, `figCap` |
| `app-trainer.js` | Oberfläche Rechen-Trainer (Schritt-für-Schritt-Hilfe) |
| `diagram-lib.js` | Diagramm-Bausteine: `box`, `arrow`, `node`, `seq`, `stacks`, `flowH`, `org` |
| `lessons-*.js` | 51 Lektionen: `ex`, `figs`, `q`, `kw`, `train`, `time` |
| `app-lessons.js` | Lektionsansicht (`#t-<themen-id>`), Lernplan mit Start-Knöpfen, „Heute dran“ |
| `tests/check.js` | Prüfskript ohne Browser (prüft auch, ob `index.html` aktuell ist) |
| `tools/build-pages.js` | Baut `index.html` (vollständige Seite für GitHub Pages) aus `ap2.html` |
| `index.html`, `.nojekyll` | Erzeugte Seite für GitHub Pages – nicht von Hand ändern |

Neue `.js`-Datei? → in `ap2.html` einbinden **und** beim Publish in `files` aufnehmen.

## Regeln für Inhalte

- Deutsch, einfache klare Sätze. Der Nutzer wünscht verständliche Erklärungen **mit Zeichnungen**.
- Keine Originaltexte der IHK-Prüfungen kopieren (Urheberrecht) – Themen zusammenfassen, Fragen selbst formulieren.
- Rechnen wie in der IHK-Prüfung: Speicher binär (1.024), Bandbreite dezimal (1.000.000).
- Farben nur über die vorhandenen Klassen/Variablen (`f-net`, `f-host`, `f-acc`, `s-acc` …), damit helles und dunkles Design funktionieren.
- Die Prüfungs-PDFs liegen im Nachbarordner `IHK-Abschlusspruefungen-AP2-FiSi-AO2020/` (Quelle für die Auswertung, nicht Teil dieses Repos).
