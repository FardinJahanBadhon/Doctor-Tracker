// Validated categorical/sequential slots — see references/palette.md (dataviz skill).
// Slot order is the CVD-safety mechanism: never reassign hues per-render.
// Matches the app's own --primary token (#2a78d6) for visual consistency.
export const chartColors = {
  seriesDoctors: "#eb6834", // categorical slot 2 (orange) — "doctors added"
  seriesPatients: "#2a78d6", // categorical slot 1 (blue) — "patients added"
  sequentialBar: "#2a78d6", // single-series magnitude (patients per doctor)
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  mutedText: "#898781",
  tooltipBorder: "#e1e0d9",
};
