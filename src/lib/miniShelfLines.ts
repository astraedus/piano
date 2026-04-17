import type { AppState } from "./types";
import { KEY_META } from "./music";
import { DEPTH_NAMES } from "./types";

// One quiet ambient line per day at the bottom of the Piano Stand.
// Naturalist tone. Small, factual. Never a nag.
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

  if (totalMin > 0) candidates.push(`you've been at piano for ${hours}h, all up.`);
  if (pieceCount > 0) {
    const first = (state.pieces ?? []).slice().sort((a, b) => a.startedAt.localeCompare(b.startedAt))[0];
    const year = new Date().getFullYear();
    const piecesThisYear = (state.pieces ?? []).filter((p) => new Date(p.startedAt).getFullYear() === year).length;
    if (piecesThisYear > 0) candidates.push(`${piecesThisYear} piece${piecesThisYear === 1 ? "" : "s"} this year. ${first?.title} was the first.`);
  }
  if (unlockCount > 0) {
    const last = [...(state.unlocks ?? [])].sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""))[0];
    if (last) candidates.push(`latest unlock: ${last.title.toLowerCase()}`);
  }
  if (touchedKeys.length > 0 && touchedKeys.length < 24) {
    candidates.push(`${touchedKeys.length} keys touched on the map. ${24 - touchedKeys.length} grey.`);
  }
  if (homeKeys.length > 0) {
    const name = KEY_META[homeKeys[0] as keyof typeof KEY_META]?.name;
    if (name) candidates.push(`${name} is home. that doesn't come back down.`);
  }
  if (state.currentPieceId) {
    const p = (state.pieces ?? []).find((x) => x.id === state.currentPieceId);
    if (p && (depths[p.keyId as keyof typeof depths] ?? 0) > 0) {
      const d = depths[p.keyId as keyof typeof depths] ?? 0;
      const name = KEY_META[p.keyId as keyof typeof KEY_META]?.name;
      if (name) candidates.push(`${name} — ${DEPTH_NAMES[d].toLowerCase()} depth.`);
    }
  }
  if (sessionCount === 1) candidates.push("that was the first session. more where that came from.");
  if (sessionCount > 0 && sessionCount % 10 === 0) candidates.push(`${sessionCount} sessions. the thread is becoming rope.`);

  if (candidates.length === 0) return null;
  const seed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24)); // stable per day
  return candidates[seed % candidates.length];
}
