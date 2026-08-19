// Shared, dependency-free helpers for the Austria temperature comparison page.
// Plain functions only -- no class/module abstraction, since there's nothing
// here that needs state or inheritance.
(function (root) {
  // GeoSphere's CSV only ever contains numeric/timestamp fields (no
  // embedded commas or quotes), so a plain split is correct -- pulling in a
  // full CSV library for quote/escape handling would be solving a problem
  // this API doesn't have. Column order isn't assumed: we look each column
  // up by name from the header row, so it survives the API changing order.
  function parseCsv(text) {
    const lines = text.split("\n").map((l) => l.replace("\r", "")).filter((l) => l.length);
    if (!lines.length) return [];
    const header = lines[0].split(",");
    const col = (name) => header.indexOf(name);
    const timeIdx = col("time"), meanIdx = col("tl_mittel"), maxIdx = col("tlmax"), minIdx = col("tlmin"), rrIdx = col("rr");
    const num = (v) => (v === "" || v === undefined ? null : parseFloat(v)); // empty cell = missing reading, not 0
    // rr: -1 = no precipitation (API sentinel), 0 = less than 0.1mm -- both
    // are "no rain", but -1 is not a real negative amount, so it's mapped to 0.
    const precip = (v) => { const n = num(v); return n === -1 ? 0 : n; };
    return lines.slice(1).map((line) => {
      const cells = line.split(",");
      return {
        time: cells[timeIdx],
        mean: num(cells[meanIdx]),
        max: num(cells[maxIdx]),
        min: num(cells[minIdx]),
        precip: precip(cells[rrIdx]),
      };
    });
  }

  // Day-of-year (1-366) from the UTC date parts. The API returns timestamps
  // with an explicit UTC offset; using local Date getters (getMonth etc.)
  // instead of the UTC ones would shift some days across a timezone
  // boundary, so we deliberately use Date.UTC / getUTC* throughout.
  function dayOfYear(isoTime) {
    const d = new Date(isoTime);
    const start = Date.UTC(d.getUTCFullYear(), 0, 1);
    const day = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return Math.round((day - start) / 86400000) + 1;
  }

  // Centered moving average that shrinks its window at the array edges and
  // skips nulls (missing days) rather than treating them as zero.
  function movingAvg(values, window) {
    window = window || 7;
    const half = Math.floor(window / 2);
    return values.map((_, i) => {
      const slice = values.slice(Math.max(0, i - half), i + half + 1).filter((v) => v !== null && v !== undefined);
      return slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : null;
    });
  }

  // Mean/median/max/min of a series, skipping nulls (missing days). Used to
  // build the year-A-vs-year-B difference table.
  function stats(values) {
    const v = values.filter((x) => x !== null && x !== undefined);
    if (!v.length) return { mean: null, median: null, max: null, min: null };
    const sorted = [...v].sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    return {
      mean: v.reduce((a, b) => a + b, 0) / v.length,
      median,
      max: sorted[sorted.length - 1],
      min: sorted[0],
    };
  }

  const api = { parseCsv, dayOfYear, movingAvg, stats };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TempUtils = api;
})(typeof window !== "undefined" ? window : globalThis);