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

  // ── Tier 1 ──
  {
    id: "u-d-singles",
    phase: 1,
    title: "Your two hands sound like one.",
    tryLine: "Play R L R L at 100 for a full minute — even, matched, unbreakable. Now start on your left. That is the root of every fill.",
  },
  {
    id: "u-d-counting",
    phase: 1,
    title: "You can read and count the beat.",
    tryLine: "Read a fresh line off the grid counting '1 & 2 & 3 & 4 &' out loud. You are decoding rhythm now, not copying it by ear.",
  },
  {
    id: "u-d-doubles",
    phase: 1,
    title: "Two even notes from one motion.",
    tryLine: "Play R R L L at 100 so clean you cannot tell the two hits apart. The bounce is working for you now.",
  },
  {
    id: "u-d-accents",
    phase: 1,
    title: "You can put a loud note anywhere.",
    tryLine: "Play a stream of quiet taps and drop one accent on any beat you name — taps unchanged. That is the seed of groove.",
  },

  // ── Tier 2 ──
  {
    id: "u-d-16ths",
    phase: 1,
    title: "You count and play the fast subdivision.",
    tryLine: "Play a bar of '1 e & a' sixteenths, even, at 80. The busy grooves and quick runs just opened up.",
  },
  {
    id: "u-d-triplets",
    phase: 1,
    title: "You can split a beat into three.",
    tryLine: "Count '1 trip let, 2 trip let' and play three even notes per beat, letting the lead hand swap each time. Shuffles and 6/8 feels start here.",
  },
  {
    id: "u-d-offbeats",
    phase: 1,
    title: "You can play against the beat.",
    tryLine: "Keep the click on the beat and land your hits on the '&'s instead. Now drop one accent off the beat. That is groove, not marching.",
  },
  {
    id: "u-d-paradiddle",
    phase: 1,
    title: "You own the money sticking.",
    tryLine: "Loop R L R R, L R L L at 110 from either hand. This is the pattern that moves a fill around the drums.",
  },
  {
    id: "u-d-flam",
    phase: 1,
    title: "You can make a note land thick.",
    tryLine: "Drop a flam on a backbeat — one thick note, not two hits. The hit just got heavier.",
  },
  {
    id: "u-d-five-stroke",
    phase: 1,
    title: "You can roll into a hit.",
    tryLine: "Play R R L L R with the last note the loudest. That is a fill-ending, in one clean shape.",
  },
  {
    id: "u-d-play-along",
    phase: 1,
    title: "You can play along to real songs.",
    tryLine: "Put on a simple groove and ride it on the pad for a whole section, accents and all. That is music, not a drill.",
  },

  // ── Tier 3 ──
  {
    id: "u-d-drag",
    phase: 1,
    title: "You own the drag.",
    tryLine: "Play two soft grace notes into a loud tap — a tight little rip. It is the pickup into a hundred fills.",
  },
  {
    id: "u-d-paradiddle-family",
    phase: 1,
    title: "You can play the paradiddle's bigger cousins.",
    tryLine: "Loop the double paradiddle R L R L R R, landing the accent on the same hand every time. Shuffle feels live here.",
  },
  {
    id: "u-d-moeller",
    phase: 1,
    title: "You can start the whip stroke.",
    tryLine: "Play one relaxed accent-tap-tap whip, loose in the arm. This is where effortless speed begins.",
  },
  {
    id: "u-d-speed",
    phase: 1,
    title: "You can build speed the safe way.",
    tryLine: "Run a rudiment slow, up to your max, and symmetrically back down without it breaking. Clean first, then fast.",
  },
  {
    id: "u-d-buzz",
    phase: 1,
    title: "You own the smooth sustained roll.",
    tryLine: "Press into a steady buzz and swell it from soft to loud and back. That is the sound under every build.",
  },
];

export function drumsPendingForPhase(phase: number): UnlockCard[] {
  return DRUMS_UNLOCK_LIBRARY.filter((u) => u.phase <= phase);
}
