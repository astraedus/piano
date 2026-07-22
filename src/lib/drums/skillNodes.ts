import type { SkillNode } from "../types";

// Drums skill DAG — Tier 0 foundations (Stage A) + Tiers 1-3 rudiment curriculum
// (Stage B). Each node links to a chain drill (its BPM-ladder practice) and an
// unlock card (the capability it earns). No keyId (drums have no key depths); no
// tonal viz. The teaching lives in lessons.ts; these carry the one-line
// masteryDrill / unlock fallbacks.
//
// Order + prereqs are the honest dependency order from roadmap.json (technique
// before vocabulary, vocabulary before combination, combination before speed),
// exactly as tabled in docs/research/drums-module-design.md.
export const DRUMS_NODES: SkillNode[] = [
  // ── Tier 0 — foundations (sound before anything) ──────────────────────────
  {
    id: "d-t0-setup",
    instrument: "drums",
    title: "Hold the Sticks",
    tier: 0,
    category: "setup",
    prereqs: [],
    masteryDrill:
      "Hold a relaxed matched grip in both hands for a whole short session — no death grip, shoulders down, and a light tap lets the stick bounce back on its own.",
    unlock:
      "You can hold the sticks the way every drummer does — ready to play for real without your hands cramping.",
    chainDrillId: "d-t0-setup-drill",
    unlockCardId: "u-d-setup",
  },
  {
    id: "d-t0-rebound",
    instrument: "drums",
    title: "Let the Stick Bounce",
    tier: 0,
    category: "technique",
    prereqs: ["d-t0-setup"],
    masteryDrill:
      "Throw each stick down and let it rebound back to a repeatable height on its own — loose grip, both hands, never lifting the stick back up yourself.",
    unlock:
      "You can trust the bounce, so playing fast or quiet later costs you almost no effort.",
    chainDrillId: "d-t0-rebound-drill",
    unlockCardId: "u-d-rebound",
  },
  {
    id: "d-t0-strokes",
    instrument: "drums",
    title: "The Four Strokes",
    tier: 0,
    category: "technique",
    prereqs: ["d-t0-rebound"],
    masteryDrill:
      "Loop full, down, tap, up on one hand with clearly different heights, matched between your right and left hands, slow.",
    unlock:
      "You have the loud-and-soft vocabulary every pattern, accent, and groove is built from.",
    chainDrillId: "d-t0-strokes-drill",
    unlockCardId: "u-d-strokes",
  },
  {
    id: "d-t0-click",
    instrument: "drums",
    title: "Make Friends with the Click",
    tier: 0,
    category: "rhythm",
    prereqs: ["d-t0-rebound"],
    masteryDrill:
      "Lock one hand to a 60–80 BPM click on the beat for a full minute — drop out, keep counting, then re-enter cleanly on beat 1.",
    unlock:
      "You can lock to a steady beat — the timing floor everything you ever play sits on.",
    chainDrillId: "d-t0-click-drill",
    unlockCardId: "u-d-click",
  },

  // ── Tier 1 — the first rudiments + reading ────────────────────────────────
  {
    id: "d-t1-singles",
    instrument: "drums",
    title: "Single Stroke Roll",
    tier: 1,
    category: "technique",
    prereqs: ["d-t0-strokes", "d-t0-click"],
    masteryDrill:
      "Play R L R L to the click, hands so matched you can't tell them apart, from 60 up toward 120 BPM — even volume, even spacing, leading with either hand.",
    unlock:
      "You own the single stroke roll — the alternating pattern every fill, hi-hat line, and other rudiment is built from.",
    chainDrillId: "d-t1-singles-drill",
    unlockCardId: "u-d-singles",
  },
  {
    id: "d-t1-counting",
    instrument: "drums",
    title: "Count It Out Loud",
    tier: 1,
    category: "rhythm",
    prereqs: ["d-t0-click"],
    masteryDrill:
      "Read and play a short line of quarter and eighth notes off the grid, counting '1 & 2 & 3 & 4 &' out loud, each note value paired with its matching rest.",
    unlock:
      "You can read and count the beat out loud — so every pattern you meet from here is something you can decode, not just copy.",
    chainDrillId: "d-t1-counting-drill",
    unlockCardId: "u-d-counting",
  },
  {
    id: "d-t1-doubles",
    instrument: "drums",
    title: "Double Stroke Roll",
    tier: 1,
    category: "technique",
    prereqs: ["d-t1-singles"],
    masteryDrill:
      "Play R R L L so the two hits per hand sound identical — a slow controlled bounce, not accent-then-ghost — clean at 80–100 BPM.",
    unlock:
      "You own the double stroke roll — two even strokes per hand, the engine behind fast fills, rolls, and ghost notes.",
    chainDrillId: "d-t1-doubles-drill",
    unlockCardId: "u-d-doubles",
  },
  {
    id: "d-t1-accents",
    instrument: "drums",
    title: "Accents & Taps",
    tier: 1,
    category: "technique",
    prereqs: ["d-t1-singles", "d-t0-strokes"],
    masteryDrill:
      "Play a stream of quiet taps with one loud accent, and move the accent to any beat in the bar without the taps ever getting louder — clean at 80 BPM.",
    unlock:
      "You can put one loud note exactly where you want it in a stream of quiet ones — the whole basis of groove and feel.",
    chainDrillId: "d-t1-accents-drill",
    unlockCardId: "u-d-accents",
  },

  // ── Tier 2 — sixteenths, the first combined rudiments, and playing along ──
  {
    id: "d-t2-16ths",
    instrument: "drums",
    title: "Sixteenths",
    tier: 2,
    category: "rhythm",
    prereqs: ["d-t1-counting", "d-t1-singles"],
    masteryDrill:
      "Read and play sixteenth notes counted '1 e & a 2 e & a…', single strokes even from hand to hand, at 70–90 BPM.",
    unlock:
      "You can count and play the faster '1 e & a' subdivision — the density most real grooves and fills live in.",
    chainDrillId: "d-t2-16ths-drill",
    unlockCardId: "u-d-16ths",
  },
  {
    id: "d-t2-triplets",
    instrument: "drums",
    title: "Triplets",
    tier: 2,
    category: "rhythm",
    prereqs: ["d-t1-counting", "d-t1-singles"],
    masteryDrill:
      "Play single-stroke triplets to the click, counting '1 trip let, 2 trip let' out loud, three even notes per beat at 60–90 BPM, and stay relaxed as the lead hand swaps each beat.",
    unlock:
      "You can split a beat into three even notes — the rolling triplet feel that shuffles and 6/8 grooves are built on.",
    chainDrillId: "d-t2-triplets-drill",
    unlockCardId: "u-d-triplets",
  },
  {
    id: "d-t2-offbeats",
    instrument: "drums",
    title: "Offbeats & Syncopation",
    tier: 2,
    category: "rhythm",
    prereqs: ["d-t1-counting", "d-t1-accents"],
    masteryDrill:
      "Play an eighth-note line that rests on the beats and hits the '&'s, counting out loud with the click on the beat, then move a single accent onto a chosen offbeat without drifting back onto the beat.",
    unlock:
      "You can play against the beat instead of on it — the off-beat hits and accents that make a rhythm groove instead of march.",
    chainDrillId: "d-t2-offbeats-drill",
    unlockCardId: "u-d-offbeats",
  },
  {
    id: "d-t2-paradiddle",
    instrument: "drums",
    title: "Single Paradiddle",
    tier: 2,
    category: "technique",
    prereqs: ["d-t1-doubles", "d-t2-16ths"],
    masteryDrill:
      "Loop R L R R, L R L L continuously at 100–120 BPM without the double rushing — even tone through the hand-lead switch, starting on either hand.",
    unlock:
      "You own the single paradiddle — the most-used sticking in drumming, and the one that lets you move a fill around the kit later.",
    chainDrillId: "d-t2-paradiddle-drill",
    unlockCardId: "u-d-paradiddle",
  },
  {
    id: "d-t2-flam",
    instrument: "drums",
    title: "The Flam",
    tier: 2,
    category: "technique",
    prereqs: ["d-t1-accents"],
    masteryDrill:
      "Play a soft grace note a hair before a loud main note from the other hand, heard as one thick note (not two hits, not a flat double), tight at 100 BPM, alternating lead hand.",
    unlock:
      "You can play a flam — the go-to way to make a backbeat land heavier and thicker.",
    chainDrillId: "d-t2-flam-drill",
    unlockCardId: "u-d-flam",
  },
  {
    id: "d-t2-five-stroke",
    instrument: "drums",
    title: "Five Stroke Roll",
    tier: 2,
    category: "technique",
    prereqs: ["d-t1-doubles", "d-t1-accents"],
    masteryDrill:
      "Play R R L L R (and L L R R L) with the last note clearly the loudest — a short roll building into one clean accent, at 100–120 BPM, both leads.",
    unlock:
      "You own the five stroke roll — the classic 'roll into a hit' shape that ends fills and sets up crashes.",
    chainDrillId: "d-t2-five-stroke-drill",
    unlockCardId: "u-d-five-stroke",
  },
  {
    id: "d-t2-play-along",
    instrument: "drums",
    title: "Play Along on the Pad",
    tier: 2,
    category: "repertoire",
    prereqs: ["d-t2-16ths", "d-t1-accents"],
    masteryDrill:
      "Play the sticking of a real song's groove on the pad in time with the track — nail its subdivision and its accents for a full section without dropping the beat.",
    unlock:
      "You can play along to actual songs on the pad — real music you can feel, not just isolated drills.",
    chainDrillId: "d-t2-play-along-drill",
    unlockCardId: "u-d-play-along",
  },

  // ── Tier 3 — combination rudiments, whip technique, and speed ─────────────
  {
    id: "d-t3-drag",
    instrument: "drums",
    title: "The Drag",
    tier: 3,
    category: "technique",
    prereqs: ["d-t2-flam", "d-t1-doubles"],
    masteryDrill:
      "Play two quick soft grace notes on one hand leading into a loud tap on the other — a tight 'brrp', not two separate hits — clean as an eighth-note pickup at 100 BPM.",
    unlock:
      "You own the drag — the soft double-grace-note ornament tucked inside a dozen other patterns, and the classic pickup into a fill.",
    chainDrillId: "d-t3-drag-drill",
    unlockCardId: "u-d-drag",
  },
  {
    id: "d-t3-paradiddle-family",
    instrument: "drums",
    title: "Paradiddle Family",
    tier: 3,
    category: "technique",
    // Six-note groups are two triplets, so a felt triplet is a real prerequisite.
    prereqs: ["d-t2-paradiddle", "d-t2-triplets"],
    masteryDrill:
      "Play the double paradiddle R L R L R R, L R L R L L evenly at 90–100 BPM, landing the accent on the same hand every cycle without slipping back into a single paradiddle.",
    unlock:
      "You can play the paradiddle's bigger cousins — the six-note stickings behind shuffle feels and triplet fills.",
    chainDrillId: "d-t3-paradiddle-family-drill",
    unlockCardId: "u-d-paradiddle-family",
  },
  {
    id: "d-t3-moeller",
    instrument: "drums",
    title: "The Whip Stroke (Moeller)",
    tier: 3,
    category: "technique",
    // Its drill IS an accent-tap-tap triplet, so a felt triplet is a prerequisite.
    prereqs: ["d-t1-accents", "d-t2-five-stroke", "d-t2-triplets"],
    masteryDrill:
      "Chain a down stroke, a rebound tap, and an up stroke into one relaxed whipping motion — a slow accent-tap-tap group, loose arm, no extra unwanted bounces.",
    unlock:
      "You can start the whip stroke — the relaxed Moeller motion that turns your four strokes into speed and power for almost no effort.",
    chainDrillId: "d-t3-moeller-drill",
    unlockCardId: "u-d-moeller",
  },
  {
    id: "d-t3-speed",
    instrument: "drums",
    title: "Open–Close–Open",
    tier: 3,
    category: "technique",
    prereqs: ["d-t2-paradiddle", "d-t1-doubles"],
    masteryDrill:
      "Run a rudiment through one smooth arc — start slow, speed up evenly to your personal max, then slow back down symmetrically — without the pattern breaking down at the top.",
    unlock:
      "You can build real speed the safe way — layering it onto clean technique instead of forcing tension into fast playing.",
    chainDrillId: "d-t3-speed-drill",
    unlockCardId: "u-d-speed",
  },
  {
    id: "d-t3-buzz",
    instrument: "drums",
    title: "Buzz Roll",
    tier: 3,
    category: "technique",
    prereqs: ["d-t1-doubles"],
    masteryDrill:
      "Press each stroke into the pad so it buzzes into a smooth sustain, alternating hands, and crescendo from soft to loud and back over several counts with no gaps or dead spots.",
    unlock:
      "You own the buzz roll — the smooth sustained texture behind crescendos, swells, and soft builds.",
    chainDrillId: "d-t3-buzz-drill",
    unlockCardId: "u-d-buzz",
  },
];
