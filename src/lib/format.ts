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

/**
 * The home footer's north-star nudge: "Your goal: <goal>. Keep going."
 * The user's goal is free text that may or may not end in punctuation; without
 * a separator the goal and the "Keep going." nudge run together. This ensures
 * the goal is terminated by a sentence-ender before the nudge — without
 * doubling punctuation when the goal already ends in `.`/`!`/`?`/`…`.
 */
export function formatNorthStarNudge(goal: string): string {
  const trimmed = goal.trim();
  const sep = /[.!?…]$/.test(trimmed) ? "" : ".";
  return `Your goal: ${trimmed}${sep} Keep going.`;
}
