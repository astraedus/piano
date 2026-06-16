// Shared display formatters — pure, testable.

/**
 * Human-friendly total practice time from a minute count.
 * - <= 0 → an em-dash placeholder
 * - < 60 → "N min"
 * - whole hours → "Nh"
 * - else → "Nh Mm"
 */
export function fmtTotalTime(totalMin: number): string {
  if (totalMin <= 0) return "—";
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
