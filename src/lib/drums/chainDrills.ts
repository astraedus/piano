import type { ChainDrill } from "../types";

// Drums chain drills — one per Tier-0 node, each the node's nightly BPM-ladder
// practice. Every drill soft-prefers the "C" rotation token (single strokes, the
// through-line of foundational pad work — see curriculum.ts). The `pattern` field
// feeds the RhythmGrid reference + the "Hear it" percussion demo. BPM ladders keep
// tempos honest and slow: fundamentals are built at a tempo you can stay relaxed
// at, then nudged up.
export const DRUMS_CHAIN_DRILLS: ChainDrill[] = [
  {
    id: "d-t0-setup-drill",
    instrument: "drums",
    phase: 1,
    name: "Grip Check",
    soulName: "Settle the Sticks",
    minutes: 3,
    ghostKey: "C",
    pillar: "technique",
    bpmLadder: { startBpm: 50, targetBpm: 70, step: 5, advanceAfterSuccesses: 3 },
    pattern: [
      { hand: "R", accent: true, count: "1" }, { hand: "L", count: "2" },
      { hand: "R", count: "3" }, { hand: "L", count: "4" },
    ],
    steps: [
      { type: "tone", durationSec: 30, instruction: "Run the pendulum check: hold each stick only at its balance point, let it hang, and bounce it once — feel it rebound on its own." },
      { type: "tone", durationSec: 60, instruction: "Play slow single hits, right then left, keeping the loose 'OK'-sign grip. Shoulders down." },
      { type: "tone", durationSec: 60, instruction: "Every few hits, deliberately loosen your hands. Notice the pad ring more openly as you relax." },
    ],
    closingNote: "A relaxed grip is the whole foundation. Loose hands, open sound.",
  },
  {
    id: "d-t0-rebound-drill",
    instrument: "drums",
    phase: 1,
    name: "Bounce & Catch",
    soulName: "Let It Come Back",
    minutes: 4,
    ghostKey: "C",
    pillar: "technique",
    bpmLadder: { startBpm: 50, targetBpm: 80, step: 5, advanceAfterSuccesses: 3 },
    pattern: [
      { hand: "R", accent: true, count: "1" }, { hand: "L", count: "2" },
      { hand: "R", count: "3" }, { hand: "L", count: "4" },
    ],
    steps: [
      { type: "tone", durationSec: 45, instruction: "Drop one stick onto the pad and let it bounce four to six times freely — do nothing, just watch it decay." },
      { type: "tone", durationSec: 60, instruction: "Throw single free strokes, one hand at a time, letting each stick spring back near its start height on its own." },
      { type: "tone", durationSec: 75, instruction: "Alternate hands slowly with the click, trusting the bounce to bring each stick back — no lifting." },
    ],
    closingNote: "You throw it down; the pad hands it back. That trade is the whole trick.",
  },
  {
    id: "d-t0-strokes-drill",
    instrument: "drums",
    phase: 1,
    name: "Four Strokes Loop",
    soulName: "Loud and Soft on Purpose",
    minutes: 4,
    ghostKey: "C",
    pillar: "technique",
    bpmLadder: { startBpm: 50, targetBpm: 90, step: 5, advanceAfterSuccesses: 3 },
    pattern: [
      { hand: "R", accent: true, count: "full" }, { hand: "R", accent: true, count: "down" },
      { hand: "R", count: "tap" }, { hand: "R", count: "up" },
    ],
    steps: [
      { type: "tone", durationSec: 45, instruction: "One hand: play a full stroke (high to high), then a down stroke that stops low. Feel the catch at the bottom." },
      { type: "tone", durationSec: 45, instruction: "One hand: play a tap (low, quiet) then an up stroke that lifts back to high. A quiet note that gets you ready." },
      { type: "tone", durationSec: 90, instruction: "Loop full, down, tap, up slowly. Then match it hand to hand — right, then left." },
    ],
    closingNote: "Four heights, four jobs. This is the loud-soft alphabet under every groove.",
  },
  {
    id: "d-t0-click-drill",
    instrument: "drums",
    phase: 1,
    name: "Lock to the Click",
    soulName: "Glue to the Beat",
    minutes: 4,
    ghostKey: "C",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 90, step: 5, advanceAfterSuccesses: 3 },
    pattern: [
      { hand: "R", count: "1" }, { hand: "R", count: "2" },
      { hand: "R", count: "3" }, { hand: "R", count: "4" },
    ],
    steps: [
      { type: "tone", durationSec: 60, instruction: "One hand, one hit on each tick, counting '1, 2, 3, 4' out loud. Aim to bury the click so you hear one sound." },
      { type: "tone", durationSec: 60, instruction: "Stop playing but keep counting in your head, then drop back in exactly on beat 1." },
      { type: "tone", durationSec: 60, instruction: "Switch hands and lock the other one to the click just as cleanly." },
    ],
    closingNote: "Land on the beat, not a hair ahead. One sound, you and the click together.",
  },
];
