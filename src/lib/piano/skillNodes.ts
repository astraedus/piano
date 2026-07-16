// Piano skill-tree DAG — PIANO_NODES.
//
// A real, coherent prereq graph (not stubs). Guitar (P4) is the showcase tree;
// piano is intentionally a lighter set, but every edge is real and the graph is
// acyclic + fully reachable from the tier-0 roots.
//
// Design axes mapped from the existing app:
//   - the 12 unlock cards (lib/piano/unlocks.ts) → each maps to the node whose
//     completion earns it, via `unlock` (the capability sentence is carried here
//     and on the card; the linkage is by id convention "u-<node-suffix>").
//   - the key-depth concept (KeyDepth 0..5 per key) → per-key foundation nodes
//     (p-key-C, p-key-am, ...) tagged with `keyId` so a future surface can tie
//     node progress to keyDepths.
//   - chain-drill pillars (technique / ear / expression / lead-sheet / improv /
//     repertoire) → SkillCategory + chainDrillId links to concrete drills.
//
// Tiers (sunrise ramp, shared with guitar):
//   t0 orientation · t1 foundation + first keys · t2 more keys + improv + ear ·
//   t3 lead-sheet / jazz / expression.

import type { SkillNode } from "../types";

// V4 soul-first labels + path membership applied per docs/research/soul-first-learning.md
// Section 3 (piano table). The four foundation keys (C/G/F/am) are on all three paths
// and are NOT theory (a beginner needs a home key to play in). Reading-the-staff,
// lead-sheet, and ii-V-I are the only piano theory:true nodes; they carry NO soulTitle
// (they only render in Go Deep, where the theory name is the right label). All fields
// optional and backward-compatible.

export const PIANO_NODES: SkillNode[] = [
  // ───── Tier 0 — orientation ─────
  {
    id: "p-t0-keyboard-map",
    instrument: "piano",
    title: "Map the Keyboard",
    tier: 0,
    category: "setup",
    prereqs: [],
    masteryDrill: "Close your eyes, pick a letter, touch it in under a second.",
    unlock: "Find any note in under a second.",
    unlockCardId: "u-p1-keyboard-map",
    soulTitle: "Find Any Note",
    keepTitle: "Keyboard Map",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
  {
    id: "p-t0-posture",
    instrument: "piano",
    title: "Posture & Arm Weight",
    tier: 0,
    category: "technique",
    prereqs: ["p-t0-keyboard-map"],
    masteryDrill: "Five-finger pattern with relaxed arm weight, zero tension between strikes.",
    unlock: "Play without tension — the foundation of tone.",
    soulTitle: "Sit and Settle",
    keepTitle: "Posture and Arm Weight",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
  {
    id: "p-t0-staff",
    instrument: "piano",
    title: "Reading the Staff",
    tier: 0,
    category: "notation",
    prereqs: ["p-t0-keyboard-map"],
    masteryDrill: "Name treble + bass clef notes on sight, no counting up from a landmark.",
    unlock: "Decode a basic score.",
    keepTitle: "Reading the Staff",
    pathTags: ["go-deep"],
    theory: true,
  },

  // ───── Tier 1 — foundation + first keys ─────
  {
    id: "p-key-C",
    instrument: "piano",
    title: "C major is yours",
    tier: 1,
    category: "scales",
    prereqs: ["p-t0-posture"],
    masteryDrill: "C scale hands-separate, C triad, I–IV–V–I in C.",
    unlock: "C major is yours.",
    chainDrillId: "p1-c-major-chain",
    keyId: "C",
    unlockCardId: "u-p1-c-map",
    fluencyTest: { prompt: "Play the C major scale, hands together, while counting the beats out loud." },
    soulTitle: "The Home Shape",
    keepTitle: "C major",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
  {
    id: "p-key-G",
    instrument: "piano",
    title: "G major (one sharp)",
    tier: 1,
    category: "scales",
    prereqs: ["p-key-C"],
    masteryDrill: "G scale hands-separate — listen for the F♯. G triad, G–C–D–G.",
    unlock: "A second key under your hands.",
    chainDrillId: "p1-g-major-chain",
    keyId: "G",
    soulTitle: "One Sharp",
    keepTitle: "G major (one sharp)",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
  {
    id: "p-key-F",
    instrument: "piano",
    title: "F major (one flat)",
    tier: 1,
    category: "scales",
    prereqs: ["p-key-C"],
    masteryDrill: "F scale, thumb on F and C. F triad, F–Bb–C–F.",
    unlock: "The home key of countless ballads.",
    chainDrillId: "p1-f-major-chain",
    keyId: "F",
    soulTitle: "One Flat",
    keepTitle: "F major (one flat)",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
  {
    id: "p-key-am",
    instrument: "piano",
    title: "A minor longing",
    tier: 1,
    category: "scales",
    prereqs: ["p-key-C"],
    masteryDrill: "A natural minor, Am triad, i–iv–V–i. Feel the E resolve.",
    unlock: "Hear major vs minor reliably.",
    chainDrillId: "p1-a-minor-chain",
    keyId: "am",
    unlockCardId: "u-p1-minor-feeling",
    soulTitle: "The Sad Shape",
    keepTitle: "A minor",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
  {
    id: "p-t1-first-improv",
    instrument: "piano",
    title: "First Improvisation",
    tier: 1,
    category: "expression",
    // B1: only C major is a real prereq, so the drill stays C-only (a one-chord
    // vamp), not the C-F-G-C loop that leaned on F/G before they are taught.
    prereqs: ["p-key-C"],
    masteryDrill: "Hold a C chord in the left hand, noodle the C pentatonic (C D E G A) with the right.",
    unlock: "Make something up that sounds good.",
    chainDrillId: "p1-first-improv",
    unlockCardId: "u-p1-first-improv",
    soulTitle: "Make It Up",
    keepTitle: "First Improvisation",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-t1-echo-ear",
    instrument: "piano",
    title: "The Echo (ear)",
    tier: 1,
    category: "ear",
    prereqs: ["p-t0-keyboard-map"],
    masteryDrill: "Hear 3–4 notes in C, echo them back. Then with eyes closed.",
    unlock: "Your ear can find notes it just heard.",
    chainDrillId: "p1-echo-ear",
    soulTitle: "Echo It Back",
    keepTitle: "The Echo (ear training)",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-t1-three-moods",
    instrument: "piano",
    title: "Three Moods",
    tier: 1,
    category: "expression",
    // B1: reachable with only C major, so the material is a plain C line (C D E F G)
    // played three ways, not I-vi-IV-V (which needs the Am/F/G chords, not yet taught).
    prereqs: ["p-key-C"],
    masteryDrill: "Play a simple C line (C D E F G) three ways: tender, restless, resigned. Same notes.",
    unlock: "Touch and timing change the whole feeling.",
    chainDrillId: "p1-three-moods-lite",
    soulTitle: "Same Notes, Three Feelings",
    keepTitle: "Three Moods",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-t1-rhythm",
    instrument: "piano",
    title: "Rhythm Foundation",
    tier: 1,
    category: "rhythm",
    // Batch 3a — the single most universal absent skill (Trinity's aural test opens
    // with "clap the pulse" at every grade). Prereq is posture only, so rhythm is
    // reachable in parallel with the first keys. pathTags omitted = shown on every
    // path (a soul-critical fundamental).
    prereqs: ["p-t0-posture"],
    masteryDrill: "Lock a simple pattern to the metronome for a full minute at 80 BPM, counting quarter notes and eighth note subdivisions out loud the whole time.",
    unlock: "Can hold a steady pulse, count quarter notes and eighth note subdivisions out loud, and lock a simple pattern to the metronome without drifting.",
    chainDrillId: "p1-rhythm-foundation",
    fluencyTest: { prompt: "Tap the steady pulse with one hand while counting the eighth note subdivision, '1 and 2 and 3 and 4 and,' out loud at the same time, without losing the beat or slowing down." },
    soulTitle: "Lock the Beat",
    keepTitle: "Rhythm Foundation",
  },

  // ───── Tier 2 — more keys, the pop formula, transcribing ─────
  {
    id: "p-t2-chord-under-melody",
    instrument: "piano",
    title: "Chord Under Melody",
    tier: 2,
    category: "technique",
    prereqs: ["p-key-C", "p-key-am"],
    masteryDrill: "Left hand holds a chord while the right hand plays a melody.",
    unlock: "Hold a chord with the left hand while the right plays a melody.",
    unlockCardId: "u-p2-chord-under-melody",
    soulTitle: "Two Hands Together",
    keepTitle: "Chord Under Melody",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
  {
    id: "p-t2-pop-formula",
    instrument: "piano",
    title: "The Pop Formula",
    tier: 2,
    category: "chords",
    // #2 — gated on the Am→F transition clearing the fluency threshold, so the
    // song unlock fires only once the hard change is actually in tempo. Batch 3a:
    // also gated on p-t2-inversions — the lesson's "only one finger moves from Am
    // to F" claim is only literally true once F is voiced in first inversion.
    prereqs: ["p-t2-chord-under-melody", "p-trans-am-F", "p-t2-inversions"],
    masteryDrill: "Am–F–C–G as block chords, then a melody over the loop.",
    unlock: "You can play half of pop music.",
    chainDrillId: "p2-am-pop-formula",
    unlockCardId: "u-p2-pop-formula",
    fluencyTest: { prompt: "Play the Am–F–C–G loop without looking at your hands, and hum the melody on top." },
    soulTitle: "Half of All Pop",
    keepTitle: "The Pop Formula",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
  {
    id: "p-t2-4-bar-improv",
    instrument: "piano",
    title: "4-Bar Improv",
    tier: 2,
    category: "expression",
    prereqs: ["p-t1-first-improv", "p-key-am"],
    masteryDrill: "Loop i–iv–V in A minor, improvise eight bars without panicking.",
    unlock: "Improvise a 4-bar idea without panicking.",
    chainDrillId: "p2-left-hand-loop",
    unlockCardId: "u-p2-4-bar-improv",
    soulTitle: "Improvise Without Panic",
    keepTitle: "4-Bar Improvisation",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-t2-transcribe",
    instrument: "piano",
    title: "Put a Melody on the Keys",
    tier: 2,
    category: "ear",
    prereqs: ["p-t1-echo-ear", "p-key-C"],
    masteryDrill: "Play Happy Birthday, then Ode to Joy, by ear in C.",
    unlock: "Put a melody you heard onto the piano.",
    chainDrillId: "p2-song-transcribe",
    unlockCardId: "u-p2-first-transcribe",
    soulTitle: "Play It By Ear",
    keepTitle: "Transcribing by Ear",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-key-D",
    instrument: "piano",
    title: "D major daylight",
    tier: 2,
    category: "scales",
    prereqs: ["p-key-G"],
    masteryDrill: "D scale (two sharps), I–V–vi–IV in D.",
    unlock: "A bright two-sharp key.",
    chainDrillId: "p2-d-major-daylight",
    keyId: "D",
    soulTitle: "Bright and Wide Open",
    keepTitle: "D major",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-key-em",
    instrument: "piano",
    title: "E minor mood",
    tier: 2,
    category: "scales",
    prereqs: ["p-key-am", "p-key-G"],
    masteryDrill: "E natural minor, i–III–VII–VI in Em, played two moods.",
    unlock: "A relative-minor colour to reach for.",
    chainDrillId: "p2-e-minor-mood",
    keyId: "em",
    soulTitle: "Dark and Cinematic",
    keepTitle: "E minor",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-t2-pedal",
    instrument: "piano",
    title: "The Sustain Pedal",
    tier: 2,
    category: "technique",
    // Batch 3a — pedal timing assumes a hand that already holds a chord steady
    // (chord-under-melody). pathTags omitted = every path: it is a physical
    // fundamental, an expression lever, AND a formal Trinity Grade 3 requirement.
    prereqs: ["p-t2-chord-under-melody"],
    masteryDrill: "Loop Am, F, C, G with the pedal flicking up and down exactly on every chord change, so the sound never gaps and never blurs.",
    unlock: "Can pedal through a chord progression so it flows smooth, with no gaps and no muddy overlap between chords.",
    chainDrillId: "p2-sustain-pedal",
    unlockCardId: "u-p2-pedal",
    fluencyTest: { prompt: "Play the Am to F to C to G loop with the pedal flicking cleanly on every change while looking away from your hands." },
    soulTitle: "Smooth Every Change",
    keepTitle: "The Sustain Pedal",
  },
  {
    id: "p-t2-inversions",
    instrument: "piano",
    title: "Chord Inversions",
    tier: 2,
    category: "chords",
    // Batch 3a — makes the Pop Formula's "only one finger moves from Am to F"
    // promise literally true (F in first inversion). Gates p-t2-pop-formula.
    // pathTags omitted = every path (its neighbours are all universal).
    prereqs: ["p-key-C", "p-key-am"],
    masteryDrill: "Loop Am to F using F's first inversion (A, C, F) so only your top finger moves, then use the same nearest inversion instinct to go from F to C.",
    unlock: "Can move Am to F with barely a finger of motion, and reach for the nearest inversion instead of jumping to root position on any familiar chord.",
    chainDrillId: "p-t2-inversions-drill",
    fluencyTest: { prompt: "Play Am to F using its first inversion, then F to C using whichever shape sits closest, three times each without hunting for the next chord." },
    soulTitle: "The Nearest Chord",
    keepTitle: "Chord Inversions",
  },
  {
    id: "p-t2-lh-patterns",
    instrument: "piano",
    title: "Left-Hand Accompaniment Patterns",
    tier: 2,
    category: "technique",
    // Batch 3a — the direct next step after holding one static chord: teach that
    // the held chord can MOVE. Fixes the month-3-6 stiffness plateau that hits
    // every path, so pathTags omitted = shown everywhere.
    prereqs: ["p-t2-chord-under-melody"],
    masteryDrill: "Loop C, F, G, C and switch left-hand patterns (broken chord, root-fifth, rolling arpeggio, octave bass) under each chord without losing the pulse.",
    unlock: "Can move the left hand through four different accompaniment patterns under a chord progression instead of freezing on one block chord.",
    chainDrillId: "p2-lh-patterns",
    fluencyTest: { prompt: "Loop C to F to G to C using a left-hand pattern of your choice while singing or humming the melody out loud." },
    soulTitle: "The Left Hand Wakes Up",
    keepTitle: "Left-Hand Accompaniment Patterns",
  },

  // ───── Tier 3 — lead-sheet, jazz, expression ─────
  {
    id: "p-t3-lead-sheet",
    instrument: "piano",
    title: "Read a Lead Sheet",
    tier: 3,
    category: "chords",
    prereqs: ["p-t2-pop-formula", "p-key-G"],
    masteryDrill: "LH comps chord symbols while RH finds the melody, in real time.",
    unlock: "Read a lead sheet in real time.",
    chainDrillId: "p2-g-lead-sheet",
    unlockCardId: "u-p3-lead-sheet",
    keepTitle: "Reading a Lead Sheet",
    pathTags: ["go-deep"],
    theory: true,
  },
  {
    id: "p-t3-three-moods",
    instrument: "piano",
    title: "Same Progression, Three Ways",
    tier: 3,
    category: "expression",
    prereqs: ["p-t1-three-moods", "p-t2-chord-under-melody"],
    masteryDrill: "vi–IV–I–V played tender, angry, resigned — only touch and timing change.",
    unlock: "Play the same progression three ways.",
    chainDrillId: "p2-three-moods",
    unlockCardId: "u-p3-three-moods",
    soulTitle: "Feel, Not Notes",
    keepTitle: "Same Progression, Three Ways",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-t3-pop-pull",
    instrument: "piano",
    title: "Pull a Song from a Recording",
    tier: 3,
    category: "ear",
    prereqs: ["p-t2-transcribe", "p-t2-pop-formula"],
    masteryDrill: "Put on a half-known song, find the melody, find a chord under each bar.",
    unlock: "Pick up a pop song from a recording.",
    chainDrillId: "p3-pop-pull",
    unlockCardId: "u-p3-pop-pull",
    soulTitle: "Pull a Song Off a Record",
    keepTitle: "Transcribing Pop Songs",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-t3-ii-v-i",
    instrument: "piano",
    title: "ii–V–I (first jazz)",
    tier: 3,
    category: "chords",
    prereqs: ["p-t3-lead-sheet"],
    masteryDrill: "ii–V–I in F and C with shell voicings, melody landing on chord tones.",
    unlock: "You can read and play a ii–V–I.",
    chainDrillId: "p3-ii-v-i-taste",
    unlockCardId: "u-p3-ii-v-i",
    keepTitle: "ii-V-I (jazz foundation)",
    pathTags: ["go-deep"],
    theory: true,
  },
  {
    id: "p-t3-blues",
    instrument: "piano",
    title: "12-Bar Blues",
    tier: 3,
    category: "rhythm",
    // Batch 3a: +p-t1-rhythm — swing is a subdivision feel (uneven eighths), so it
    // assumes straight quarter/eighth counting is solid first. Deep node, no over-gate.
    prereqs: ["p-t2-4-bar-improv", "p-key-C", "p-t1-rhythm"],
    masteryDrill: "12-bar blues in C, LH roots, RH C minor pentatonic + blue note, swung.",
    unlock: "Play blues without permission.",
    chainDrillId: "p3-blues-starter",
    soulTitle: "Blues Permission",
    keepTitle: "12-Bar Blues",
    pathTags: ["play-with-soul", "go-deep"],
  },

  // ───── Curriculum #2 — chord-transition fluency (the song bottleneck) ─────
  // A timed one-minute-changes drill on the Am→F pair (the hard change behind
  // the Pop Formula loop). Learned when the pair clears ~30 clean changes/min;
  // it gates The Pop Formula as "the last reps before the song." Prereqs are the
  // two keys the chords live in — no cycle (pop-formula sits above this).
  {
    id: "p-trans-am-F",
    instrument: "piano",
    title: "Am → F, in time",
    tier: 2,
    category: "chords",
    // Batch 3a: +p-t1-rhythm — the counter is changes-per-minute, which is only
    // honest once the learner can hold a steady internal pulse to count against.
    prereqs: ["p-key-C", "p-key-am", "p-t1-rhythm"],
    masteryDrill: "One-minute changes Am↔F. Count clean changes. Target 30/min.",
    unlock: "Change between Am and F in tempo — the last reps before the song.",
    chainDrillId: "p-trans-am-F-drill",
    soulTitle: "The Last Reps Before the Song",
    keepTitle: "Am → F transition",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
  },
];
