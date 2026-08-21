// Shared, dependency-free helpers for the page.
// Plain functions only.
(function (root) {
  // GeoSphere's CSV only ever contains numeric/timestamp fields
  // Column order isn't assumed: look each column
  // up by name from the header row, so it survives the API changing order.
  function parseCsv(text) {
    const lines = text.split("\n").map((l) => l.replace("\r", "")).filter((l) => l.length);
    if (!lines.length) return [];
    const header = lines[0].split(",");
    const col = (name) => header.indexOf(name);
    const timeIdx = col("time"), meanIdx = col("tl_mittel"), maxIdx = col("tlmax"), minIdx = col("tlmin"), rrIdx = col("rr");
    const num = (v) => (v === "" || v === undefined ? null : parseFloat(v)); // empty cell = missing reading, not 0
    // rr: -1 = no precipitation (API sentinel), 0 = less than 0.1mm - both are "no rain".
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

  // Fixed non-leap cumulative month-starts, shared with the monthly
  // heat-day/tropical-night bucketing in index.html.
  const MONTH_STARTS = [0,31,59,90,120,151,181,212,243,273,304,334];

  // Day-of-year (1-366) from the UTC date parts, using a leap-invariant
  // grid: every date maps to the same slot regardless of the year's
  // leap-status, with Feb 29 pinned to a dedicated trailing slot (366).
  function dayOfYear(isoTime) {
    const d = new Date(isoTime);
    const m = d.getUTCMonth(), day = d.getUTCDate();
    if (m === 1 && day === 29) return 366;
    return MONTH_STARTS[m] + day;
  }

  // Centered moving average that shrinks its window at the array edges and
  // skips nulls rather than treating them as zero.
  function movingAvg(values, window) {
    window = window || 7;
    if (window % 2 === 0) window += 1; // centered avg needs odd width; bump even up by one
    const half = Math.floor(window / 2);
    return values.map((_, i) => {
      const slice = values.slice(Math.max(0, i - half), i + half + 1).filter((v) => v !== null && v !== undefined);
      return slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : null;
    });
  }

  // Mean/median/max/min of a series, skipping nulls.
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

  const api = { parseCsv, dayOfYear, movingAvg, stats, MONTH_STARTS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TempUtils = api;
})(typeof window !== "undefined" ? window : globalThis);