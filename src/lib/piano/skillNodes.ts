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
  // NOTE: "Reading the Staff" (p-t0-staff) used to live here, gated only on the
  // keyboard map — i.e. BEFORE the learner had made a single musical sound.
  // Batch-3b soul-first reorder moves it AFTER the first key (p-key-C) and up to
  // tier 1; see its node in the Tier 1 block below. Sound before notation.

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
  {
    id: "p-t1-articulation",
    instrument: "piano",
    title: "Legato vs Staccato",
    tier: 1,
    category: "expression",
    // Batch 3b (P7) — connected-vs-detached touch, a basic expression lever that
    // pairs with dynamics/timing (Three Moods) and later the pedal. Reachable as
    // soon as one scale is under the hand (p-key-C), so it arrives early like the
    // other touch fundamentals. pathTags omitted = shown on every path.
    prereqs: ["p-key-C"],
    masteryDrill: "Play the C five-finger pattern twice: once legato (each note held smooth into the next, no gaps) and once staccato (each note clipped short with silence between), same notes, same tempo.",
    unlock: "Can play the same line two ways on purpose, smoothly connected (legato) or crisply detached (staccato), as a deliberate expressive choice.",
    chainDrillId: "p1-articulation",
    fluencyTest: { prompt: "Play a familiar melody once fully legato and once fully staccato, switching cleanly between the two touches without changing the notes or the tempo." },
    soulTitle: "Smooth or Crisp",
    keepTitle: "Articulation (legato vs staccato)",
  },
  {
    id: "p-t0-staff",
    instrument: "piano",
    title: "Reading the Staff",
    // Id keeps its historical "p-t0-" prefix (referenced by pathFilter + persisted
    // progress), but the node now sits at TIER 1: batch-3b soul-first reorder moved
    // it from before the learner makes any sound to AFTER the first key (p-key-C).
    tier: 1,
    category: "notation",
    prereqs: ["p-key-C"],
    masteryDrill: "Name treble + bass clef notes on sight, no counting up from a landmark.",
    unlock: "Decode a basic score.",
    keepTitle: "Reading the Staff",
    pathTags: ["go-deep"],
    theory: true,
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
    id: "p-t2-hands-together",
    instrument: "piano",
    title: "Hands Together + Left-Hand Fingering",
    tier: 2,
    category: "technique",
    // Batch 3b (P5) — every scale lesson so far is hands-SEPARATE and gives only
    // RIGHT-hand fingering; the C-major fluency test already asks for a scale
    // hands-together with nothing having taught it. This node teaches the missing
    // half: the left-hand scale fingering (thumb under / third finger crossing the
    // thumb) AND coordinating both hands on the same scale. Gated on the first two
    // keys so the fingering it teaches is one the learner already plays RH.
    // pathTags omitted = every path (a coordination fundamental).
    prereqs: ["p-key-C", "p-key-G"],
    masteryDrill: "Play the C and G scales hands together, one octave, slow and even, using the left-hand fingering 5-4-3-2-1 then 3-2-1 going up (third finger crosses over the thumb after the fifth note).",
    unlock: "Can play a scale with both hands at once, and knows the left-hand fingering (thumb tucks under, third finger crosses over) for the keys learned so far.",
    chainDrillId: "p2-hands-together",
    fluencyTest: { prompt: "Play the C major scale hands together, up and down, while counting the beats out loud and looking away from your hands." },
    soulTitle: "Both Hands, One Scale",
    keepTitle: "Hands Together + Left-Hand Fingering",
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
    id: "p-key-A",
    instrument: "piano",
    title: "A major (three sharps)",
    tier: 2,
    category: "scales",
    // Batch 3b (P6) — A is in the ~80% pop key set (our own batch-2 research); we
    // taught the less song-dense F over it. Slots after D (its two sharps F#/C#
    // are the base A adds G# onto). Same standard fingering as C/G/D.
    prereqs: ["p-key-G", "p-key-D"],
    masteryDrill: "A major scale (three sharps: F#, C#, G#), A triad (A C# E), and I–V–vi–IV in A (A–E–F#m–D).",
    unlock: "A bright three-sharp key that anchors countless guitar-and-piano pop songs.",
    chainDrillId: "p2-a-major",
    keyId: "A",
    soulTitle: "Bright and Ringing",
    keepTitle: "A major",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-key-E",
    instrument: "piano",
    title: "E major (four sharps)",
    tier: 2,
    category: "scales",
    // Batch 3b (P6) — E is the other high-frequency pop/rock key. Slots after A
    // (E adds a fourth sharp, D#, onto A's three). Same standard fingering.
    prereqs: ["p-key-A"],
    masteryDrill: "E major scale (four sharps: F#, C#, G#, D#), E triad (E G# B), and I–V–vi–IV in E (E–B–C#m–A).",
    unlock: "A ringing four-sharp key at the heart of rock and anthemic pop.",
    chainDrillId: "p2-e-major",
    keyId: "E",
    soulTitle: "The Anthem Key",
    keepTitle: "E major",
    pathTags: ["play-with-soul", "go-deep"],
  },
  {
    id: "p-key-dm",
    instrument: "piano",
    title: "D minor (one flat)",
    tier: 2,
    category: "scales",
    // Batch 3b (P6) — D minor is the relative minor of the F major you already
    // know (same one flat, Bb), slotted right after F and A minor. Reuses the
    // existing orphan D-minor arpeggio chain (p2-dm-arpeggio, phase 2, ghost dm):
    // it walks the scale, the triad, and i–iv–V, exactly a "meet the key" chain.
    prereqs: ["p-key-F", "p-key-am"],
    masteryDrill: "D natural minor scale (one flat, Bb), D minor triad (D F A), and i–iv–V–i in D minor (Dm–Gm–A–Dm).",
    unlock: "The saddest, most cinematic of the early keys — the relative minor of F.",
    chainDrillId: "p2-dm-arpeggio",
    keyId: "dm",
    soulTitle: "The Cinematic Minor",
    keepTitle: "D minor",
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
  {
    id: "p-t2-first-song",
    instrument: "piano",
    title: "Play a Whole Song",
    tier: 2,
    category: "repertoire",
    // Batch 3b (P10) — the capstone. Songs are motivational footnotes everywhere
    // else; this makes "perform ONE song end to end, both hands" a real, gated
    // milestone. Deliberately SONG-AGNOSTIC ("your song") so it does not depend on
    // the still-unapproved song catalog (batch-2 #7): the learner picks any song
    // the app has already suggested, or one of their own. Gated on the two skills
    // that make a whole song possible: two hands together (chord under melody) and
    // a chord vocabulary (the pop formula).
    prereqs: ["p-t2-chord-under-melody", "p-t2-pop-formula"],
    masteryDrill: "Pick one song the app has suggested (or your own), and play it start to finish, both hands, without stopping — at a slow, steady tempo, on two separate practice sessions.",
    unlock: "Can perform one whole song from start to finish, both hands, without stopping.",
    chainDrillId: "p2-first-song",
    unlockCardId: "u-p2-first-song",
    fluencyTest: { prompt: "Play your chosen song start to finish, both hands, without stopping, while a phone records you or someone listens." },
    soulTitle: "Your First Whole Song",
    keepTitle: "Complete-Song Milestone",
    pathTags: ["just-play", "play-with-soul", "go-deep"],
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
