# Austria Historic Temperature Comparison

A static, dependency free page that compares daily mean/min/max temperatures
between two years for an Austrian weather station, using
[GeoSphere Austria's](https://data.hub.geosphere.at) `klima-v2-1d` dataset.

## Run

Just open `index.html` in a browser, no build step, no server required.
Requests go directly from your browser to the GeoSphere API.

## Files

- `index.html` - UI, chart rendering, API calls
- `temp-utils.js` - CSV parsing, day-of-year alignment, moving average, stats

## Notes

- UI language (English/German) toggles top-right; the underlying data and
  units stay the same either way.
- Chart mode switches between temperature bands, daily precipitation, and
  monthly heat-day/tropical-night counts.
- Station list is fetched live from the API's `/metadata` endpoint (falls back
  to a single hardcoded station if that's blocked).
- Fetched years are cached in memory to stay under GeoSphere's rate limit.
- Heat-day and tropical-night counts always use raw (unsmoothed) daily
  max/min, regardless of the moving-average toggle.

---

# Österreich Historischer Temperaturvergleich

Eine statische Seite ohne Abhängigkeiten, die die täglichen Mittel-/Min-/Max-
Temperaturen zweier Jahre für eine österreichische Wetterstation vergleicht,
basierend auf dem Datensatz `klima-v2-1d` von
[GeoSphere Austria](https://data.hub.geosphere.at).

## Ausführen

Einfach `index.html` im Browser öffnen, kein Build-Schritt, kein Server
nötig. Anfragen gehen direkt vom Browser an die GeoSphere-API.

## Dateien

- `index.html` - UI, Chart-Rendering, API-Aufrufe
- `temp-utils.js` - CSV-Parsing, Ausrichtung nach Jahrestag, gleitender
  Durchschnitt, Statistik

## Hinweise

- Die UI-Sprache (Englisch/Deutsch) lässt sich oben rechts umschalten; Daten
und Einheiten bleiben davon unberührt.
- Der Diagrammmodus wechselt zwischen Temperaturbändern, täglichem
Niederschlag und monatlichen Hitzetage-/Tropennächte-Zählungen.
- Die Stationsliste wird live vom `/metadata`-Endpunkt der API geladen (Fallback
auf eine einzelne fest codierte Station, falls dieser blockiert ist).
- Geladene Jahre werden im Speicher zwischengespeichert, um das Rate-Limit von
GeoSphere einzuhalten.
- Hitzetage- und Tropennächte-Zählung basieren immer auf dem rohen
(ungeglätteten) Tagesmaximum/-minimum, unabhängig vom Toggle für den
gleitenden Durchschnitt.