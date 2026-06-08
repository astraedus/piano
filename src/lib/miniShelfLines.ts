import type { AppState } from "./types";
import { KEY_META } from "./music";
import { DEPTH_NAMES } from "./types";

// One quiet ambient line per day at the bottom of the Practice Stand.
// Small, factual, encouraging. Sentence case. Never a nag.
export function miniShelfLineFor(state: AppState, date: Date = new Date()): string | null {
  const candidates: string[] = [];

  const totalMin = (state.sessions ?? []).reduce((s, x) => s + x.minutes, 0);
  const hours = Math.round((totalMin / 60) * 10) / 10;
  const pieceCount = (state.pieces ?? []).length;
  const unlockCount = (state.unlocks ?? []).length;
  const sessionCount = (state.sessions ?? []).length;

  const depths = state.keyDepths ?? {};
  const touchedKeys = Object.keys(depths).filter((k) => (depths[k as keyof typeof depths] ?? 0) > 0);
  const homeKeys = Object.entries(depths).filter(([, d]) => d === 5).map(([k]) => k);

  if (totalMin > 0) candidates.push(`You've practiced for ${hours}h in total.`);
  if (pieceCount > 0) {
    const first = (state.pieces ?? []).slice().sort((a, b) => a.startedAt.localeCompare(b.startedAt))[0];
    const year = new Date().getFullYear();
    const piecesThisYear = (state.pieces ?? []).filter((p) => new Date(p.startedAt).getFullYear() === year).length;
    if (piecesThisYear > 0) candidates.push(`${piecesThisYear} piece${piecesThisYear === 1 ? "" : "s"} this year. ${first?.title} was the first.`);
  }
  if (unlockCount > 0) {
    const last = [...(state.unlocks ?? [])].sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""))[0];
    if (last) candidates.push(`Latest unlock: ${last.title}.`);
  }
  if (touchedKeys.length > 0 && touchedKeys.length < 24) {
    const k = touchedKeys.length;
    const left = 24 - k;
    candidates.push(`${k} of 24 ${k === 1 ? "key" : "keys"} touched. ${left} to go.`);
  }
  if (homeKeys.length > 0) {
    const name = KEY_META[homeKeys[0] as keyof typeof KEY_META]?.name;
    if (name) candidates.push(`${name} is home now. That stays.`);
  }
  if (state.currentPieceId) {
    const p = (state.pieces ?? []).find((x) => x.id === state.currentPieceId);
    if (p && (depths[p.keyId as keyof typeof depths] ?? 0) > 0) {
      const d = depths[p.keyId as keyof typeof depths] ?? 0;
      const name = KEY_META[p.keyId as keyof typeof KEY_META]?.name;
      if (name) candidates.push(`${name} is at ${DEPTH_NAMES[d]} depth.`);
    }
  }
  if (sessionCount === 1) candidates.push("That was your first session. Plenty more to come.");
  if (sessionCount > 0 && sessionCount % 10 === 0) candidates.push(`${sessionCount} sessions in. It's adding up.`);

  if (candidates.length === 0) return null;
  const seed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24)); // stable per day
  return candidates[seed % candidates.length];
}
