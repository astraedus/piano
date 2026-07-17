import type { UnlockCard } from "../types";

// Drums capabilities the player gains — real things they can now do on the pad,
// not task badges. Each card's id matches the `unlockCardId` on exactly one
// DRUMS_NODES entry (data-integrity test enforces this). Voice mirrors the piano
// / guitar unlock voice: a capability line + a concrete "try it".
export const DRUMS_UNLOCK_LIBRARY: UnlockCard[] = [
  {
    id: "u-d-setup",
    phase: 1,
    title: "You hold the sticks like a drummer.",
    tryLine: "Pick up the sticks cold, find the bounce point, and hold a relaxed grip for a minute. Your hands are ready.",
  },
  {
    id: "u-d-rebound",
    phase: 1,
    title: "You can trust the bounce.",
    tryLine: "Throw a single stroke and watch the stick spring back on its own. That free rebound is the engine of everything fast and quiet.",
  },
  {
    id: "u-d-strokes",
    phase: 1,
    title: "Loud and soft, on purpose.",
    tryLine: "Play a loud note then a genuinely quiet one, back to back, clean. You now own the four strokes under every groove.",
  },
  {
    id: "u-d-click",
    phase: 1,
    title: "You can lock to a steady beat.",
    tryLine: "Put on a click at 80 and glue one hand to it for a minute. Drop out, come back in on beat 1. You can play in time now.",
  },
];

export function drumsPendingForPhase(phase: number): UnlockCard[] {
  return DRUMS_UNLOCK_LIBRARY.filter((u) => u.phase <= phase);
}
