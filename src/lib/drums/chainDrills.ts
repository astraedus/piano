import type { ChainDrill, StickingCell } from "../types";
import { drumsFocusFor } from "./focus";

// Inline sticking references for the drills that don't map to a single focus
// token (counting / sixteenths / play-along / double paradiddle / Moeller / buzz).
// Rudiment drills reuse drumsFocusFor(token).pattern instead — ONE sticking source.
const EIGHTHS_BAR: StickingCell[] = [
  { hand: "R", accent: true, count: "1" }, { hand: "L", count: "&" },
  { hand: "R", count: "2" }, { hand: "L", count: "&" },
  { hand: "R", count: "3" }, { hand: "L", count: "&" },
  { hand: "R", count: "4" }, { hand: "L", count: "&" },
];
const SIXTEENTHS_BAR: StickingCell[] = ["1", "e", "&", "a", "2", "e", "&", "a", "3", "e", "&", "a", "4", "e", "&", "a"].map(
  (count, i) => ({ hand: (i % 2 === 0 ? "R" : "L") as "R" | "L", accent: i % 4 === 0, count }),
);
// A backbeat accent pattern over eighths: accents land on beats 2 and 4 (the snare
// backbeat) — what "play along" trains you to place inside a real groove.
const BACKBEAT_BAR: StickingCell[] = [
  { hand: "R", count: "1" }, { hand: "L", count: "&" },
  { hand: "R", accent: true, count: "2" }, { hand: "L", count: "&" },
  { hand: "R", count: "3" }, { hand: "L", count: "&" },
  { hand: "R", accent: true, count: "4" }, { hand: "L", count: "&" },
];
// Double paradiddle, R-lead group: R L R L R R over two beats of triplets.
const DOUBLE_PARADIDDLE_BAR: StickingCell[] = [
  { hand: "R", accent: true, count: "1" }, { hand: "L", count: "&" }, { hand: "R", count: "a" },
  { hand: "L", count: "2" }, { hand: "R", count: "&" }, { hand: "R", count: "a" },
];
// Moeller whip: one accent-tap-tap triplet on a single hand (down / tap / up).
const MOELLER_BAR: StickingCell[] = [
  { hand: "R", accent: true, count: "1" }, { hand: "R", count: "&" }, { hand: "R", count: "a" },
];
// Buzz / press roll: alternating pressed strokes on the quarter-note pulse.
const BUZZ_BAR: StickingCell[] = [
  { hand: "R", count: "1" }, { hand: "L", count: "2" }, { hand: "R", count: "3" }, { hand: "L", count: "4" },
];

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

  // ── Tier 1 ────────────────────────────────────────────────────────────────
  {
    id: "d-t1-singles-drill",
    instrument: "drums",
    phase: 1,
    name: "Single Stroke Roll",
    soulName: "Hand to Hand",
    minutes: 4,
    ghostKey: "C",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 120, step: 5, advanceAfterSuccesses: 3 },
    pattern: drumsFocusFor("C").pattern,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Play R L R L to the click, one hit per beat, both hands matched in height and volume." },
      { type: "tone", durationSec: 75, instruction: "Climb 5 BPM at a time only when it stays even — clean first, faster second." },
      { type: "tone", durationSec: 60, instruction: "Play a round leading with your left hand, so neither hand owns the pattern." },
    ],
    closingNote: "R L R L, matched and even. Every fill you'll ever play starts here.",
  },
  {
    id: "d-t1-counting-drill",
    instrument: "drums",
    phase: 1,
    name: "Count It Out",
    soulName: "Say the Beat",
    minutes: 3,
    ghostKey: "C",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 90, step: 5, advanceAfterSuccesses: 3 },
    pattern: EIGHTHS_BAR,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Play the main beats and say '1, 2, 3, 4' out loud, voice and hand landing together." },
      { type: "tone", durationSec: 60, instruction: "Split each beat: add the '&' halfway between, playing and saying '1 & 2 & 3 & 4 &'." },
      { type: "tone", durationSec: 45, instruction: "Leave one beat silent on purpose — a rest — while you keep counting through it." },
    ],
    closingNote: "Count it out loud and the beat stops being a mystery — you can read it.",
  },
  {
    id: "d-t1-doubles-drill",
    instrument: "drums",
    phase: 1,
    name: "Double Stroke Roll",
    soulName: "Two for One",
    minutes: 4,
    ghostKey: "G",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 110, step: 5, advanceAfterSuccesses: 3 },
    pattern: drumsFocusFor("G").pattern,
    steps: [
      { type: "tone", durationSec: 45, instruction: "First from the wrist, no bounce: two deliberate strokes per hand, R R L L, for control." },
      { type: "tone", durationSec: 60, instruction: "Now let the pad give you the second stroke, guiding it with your fingers." },
      { type: "tone", durationSec: 60, instruction: "Blend the two until all four notes sound even — 'buh-buh buh-buh', not 'bum-BUM'." },
    ],
    closingNote: "Two even notes from one motion. The bounce does half the work.",
  },
  {
    id: "d-t1-accents-drill",
    instrument: "drums",
    phase: 1,
    name: "Accent & Tap Ladder",
    soulName: "Make One Note Pop",
    minutes: 4,
    ghostKey: "D",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 90, step: 5, advanceAfterSuccesses: 3 },
    pattern: drumsFocusFor("D").pattern,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Play steady quiet taps, then add one loud accent on beat 1 with a down stroke that stops low." },
      { type: "tone", durationSec: 60, instruction: "Keep every tap the same soft volume after the accent — only the accent is loud." },
      { type: "tone", durationSec: 60, instruction: "Move the accent to a new beat each time so it walks through the bar." },
    ],
    closingNote: "One loud note exactly where you want it. That's groove, in one skill.",
  },

  // ── Tier 2 ────────────────────────────────────────────────────────────────
  {
    id: "d-t2-16ths-drill",
    instrument: "drums",
    phase: 1,
    name: "Sixteenth-Note Reading",
    soulName: "Four to a Beat",
    minutes: 4,
    ghostKey: "C",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 90, step: 5, advanceAfterSuccesses: 3 },
    pattern: SIXTEENTHS_BAR,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Count '1 e & a' out loud slowly before you play, four even syllables per beat." },
      { type: "tone", durationSec: 60, instruction: "Play single strokes, one hit per syllable, all four notes of each beat the same size." },
      { type: "tone", durationSec: 60, instruction: "Climb from 70 toward 90 BPM only once each beat stays clean and even." },
    ],
    closingNote: "Four to a beat, even as steps. This subdivision is where real grooves live.",
  },
  {
    id: "d-t2-paradiddle-drill",
    instrument: "drums",
    phase: 1,
    name: "Single Paradiddle",
    soulName: "The Money Sticking",
    minutes: 4,
    ghostKey: "A",
    pillar: "technique",
    bpmLadder: { startBpm: 70, targetBpm: 120, step: 5, advanceAfterSuccesses: 3 },
    pattern: drumsFocusFor("A").pattern,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Play R L R R, L R L L slow, accenting the first note of each group." },
      { type: "tone", durationSec: 60, instruction: "Keep the double even — never let it rush ahead of the two singles." },
      { type: "tone", durationSec: 60, instruction: "Drop the accent once it's automatic, and drill starting on the left hand too." },
    ],
    closingNote: "The most-used sticking there is. This is the one that moves fills around.",
  },
  {
    id: "d-t2-flam-drill",
    instrument: "drums",
    phase: 1,
    name: "Flam Reps",
    soulName: "One Thick Note",
    minutes: 3,
    ghostKey: "F",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 100, step: 5, advanceAfterSuccesses: 3 },
    pattern: drumsFocusFor("F").pattern,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Set the grace hand low and the main hand high — the stagger is the whole flam." },
      { type: "tone", durationSec: 45, instruction: "Drop both together, the low grace note a fraction before the high main note: one thick sound." },
      { type: "tone", durationSec: 60, instruction: "Alternate which hand leads, so both directions stay tight." },
    ],
    closingNote: "Two sticks, one thick note. That's how a backbeat lands heavier.",
  },
  {
    id: "d-t2-five-stroke-drill",
    instrument: "drums",
    phase: 1,
    name: "Five Stroke Roll",
    soulName: "Roll Into the Hit",
    minutes: 4,
    ghostKey: "E",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 110, step: 5, advanceAfterSuccesses: 3 },
    pattern: drumsFocusFor("E").pattern,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Play the two doubles clean and even first: R R L L." },
      { type: "tone", durationSec: 60, instruction: "Add the fifth note as a loud accent that clearly tops the roll." },
      { type: "tone", durationSec: 45, instruction: "Drill both the right-lead and the left-lead versions." },
    ],
    closingNote: "A roll that lands on a hit. The final note is the loudest, always.",
  },
  {
    id: "d-t2-play-along-drill",
    instrument: "drums",
    phase: 1,
    name: "Song Play-Along",
    soulName: "Play a Real Song",
    minutes: 5,
    ghostKey: "D",
    pillar: "repertoire",
    bpmLadder: { startBpm: 70, targetBpm: 100, step: 5, advanceAfterSuccesses: 3 },
    pattern: BACKBEAT_BAR,
    steps: [
      { type: "tone", durationSec: 60, instruction: "Put on a song with a simple steady groove and tap its subdivision on the pad in time." },
      { type: "tone", durationSec: 90, instruction: "Add the backbeat accents where the snare would land — beats 2 and 4." },
      { type: "tone", durationSec: 60, instruction: "Play a whole section without dropping the beat, and end your session right here." },
    ],
    closingNote: "Real music you can feel. End on this — it's why you come back tomorrow.",
  },

  // ── Tier 3 ────────────────────────────────────────────────────────────────
  {
    id: "d-t3-drag-drill",
    instrument: "drums",
    phase: 1,
    name: "Drag (Ruff)",
    soulName: "A Little Rip",
    minutes: 3,
    ghostKey: "B",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 100, step: 5, advanceAfterSuccesses: 3 },
    pattern: drumsFocusFor("B").pattern,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Play two quick soft grace notes on one hand as a controlled quiet double." },
      { type: "tone", durationSec: 45, instruction: "Attach a loud tap on the other hand right after — a 'brrp', not three clear hits." },
      { type: "tone", durationSec: 45, instruction: "Swap the lead hand every few reps so both directions are reliable." },
    ],
    closingNote: "A soft double into an accent. The quiet part is the whole skill.",
  },
  {
    id: "d-t3-paradiddle-family-drill",
    instrument: "drums",
    phase: 1,
    name: "Double Paradiddle",
    soulName: "Six in a Row",
    minutes: 4,
    ghostKey: "A",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 100, step: 5, advanceAfterSuccesses: 3 },
    pattern: DOUBLE_PARADIDDLE_BAR,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Count six out loud: R L R L R R, then the mirror L R L R L L." },
      { type: "tone", durationSec: 60, instruction: "Keep the front four singles even and the ending double clean — six equal notes." },
      { type: "tone", durationSec: 60, instruction: "Land the accent on the same hand each group; drill both leads." },
    ],
    closingNote: "Six notes, a reliable landing hand. This is the shuffle-feel sticking.",
  },
  {
    id: "d-t3-moeller-drill",
    instrument: "drums",
    phase: 1,
    name: "Moeller Whip",
    soulName: "Crack the Whip",
    minutes: 4,
    ghostKey: "D",
    pillar: "technique",
    bpmLadder: { startBpm: 50, targetBpm: 80, step: 5, advanceAfterSuccesses: 3 },
    pattern: MOELLER_BAR,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Start with a slow accent-tap-tap group — loud, soft, soft — in one relaxed sweep." },
      { type: "tone", durationSec: 60, instruction: "Let the down stroke's rebound feed the tap, and the up stroke set up the next accent." },
      { type: "tone", durationSec: 45, instruction: "Keep the wrist and arm loose — a controlled group, no extra unwanted bounces." },
    ],
    closingNote: "Speed and power for almost no effort — but only once it stays relaxed.",
  },
  {
    id: "d-t3-speed-drill",
    instrument: "drums",
    phase: 1,
    name: "Open–Close–Open",
    soulName: "Up and Back Down",
    minutes: 4,
    ghostKey: "C",
    pillar: "technique",
    bpmLadder: { startBpm: 60, targetBpm: 130, step: 5, advanceAfterSuccesses: 3 },
    pattern: drumsFocusFor("C").pattern,
    steps: [
      { type: "tone", durationSec: 60, instruction: "Pick a clean rudiment and start around 60 BPM, then accelerate smoothly and evenly." },
      { type: "tone", durationSec: 75, instruction: "Reach your max, then decelerate symmetrically all the way back down." },
      { type: "tone", durationSec: 45, instruction: "Stop the instant the pattern breaks — that ragged edge is your honest ceiling today." },
    ],
    closingNote: "Speed is a multiplier on clean technique, never a substitute for it.",
  },
  {
    id: "d-t3-buzz-drill",
    instrument: "drums",
    phase: 1,
    name: "Buzz / Press Roll",
    soulName: "The Smooth Sustain",
    minutes: 4,
    ghostKey: "am",
    pillar: "technique",
    bpmLadder: { startBpm: 70, targetBpm: 90, step: 5, advanceAfterSuccesses: 3 },
    pattern: BUZZ_BAR,
    steps: [
      { type: "tone", durationSec: 45, instruction: "Press one stick into the pad and listen for an even, sustained buzz. Repeat on the other hand." },
      { type: "tone", durationSec: 60, instruction: "Alternate hands so the buzzes overlap into one smooth, unbroken sound." },
      { type: "tone", durationSec: 60, instruction: "Grow from soft to loud and back, keeping the buzz even the whole way." },
    ],
    closingNote: "A smooth sustain, controlled at any volume. This is the sound behind builds.",
  },
];
