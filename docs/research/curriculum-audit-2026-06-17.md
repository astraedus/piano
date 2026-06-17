# Curriculum Audit, Answers, Corrections, Plan (2026-06-17)
_From the piano-curriculum-audit workflow. Answers each owner question from ground truth + ranked plan._

## Answers (Q1-Q7)
### Q1: Are there sections that teach ALL the majors and minors (12 major + 12 minor keys)? Where, and how complete?
**[partial]** Partial. All 24 keys (12 major + 12 minor) are interactively REFERENCEABLE but only 6 are TAUGHT. The KeyMap circle (src/components/KeyMap.tsx, /tree page) renders all 24 keys as clickable wedges; tapping any opens KeyDetailPanel which generates a 2-octave scale, tonic triad, I-IV-V-I / i-iv-V-i progression, a keyboard highlight, and staff notation for that key. So a self-service reference exists for all 24. But the actual CURRICULUM (skillNodes.ts DAG) has dedicated key nodes for only 6: C, G, F, am (Tier 1) and D, em (Tier 2). The other 18 keys have no lesson node, no guided drill sequence, no unlock gate — they are reached only via the weekly ghost-key rotation (Phase 5 covers 22 of 24; C# major and Gb major are never weekly keys) and a handful of chain drills (~12 keys have practice sequences). Guitar has NO per-key nodes at all; it relies on moveable barre/power-chord shapes to cover every key. Bottom line: a learner can LOOK UP all 24, but is only walked through 6 with real teaching scaffolding.

_Evidence:_ src/lib/music.ts:43-44 (CIRCLE_MAJORS+CIRCLE_MINORS=12+12); src/components/KeyMap.tsx (all 24 interactive); src/lib/piano/skillNodes.ts (only C,G,F,am,D,em have keyId nodes); src/lib/piano/trinity.ts:64-83 (SCALES_PER_GRADE, GHOST_ROTATION_PER_PHASE); src/lib/guitar/skillNodes.ts (no per-key nodes)

### Q2: Is the CIRCLE OF FIFTHS taught and/or visualized anywhere?
**[partial]** Visualized correctly, but never named or taught. KeyMap.tsx draws a proper circle-of-fifths: outer ring = 12 majors, inner ring = 12 relative minors, ordered strictly clockwise by fifths from C (CIRCLE_MAJORS / CIRCLE_MINORS in music.ts). That IS a textbook circle of fifths. But the term 'circle of fifths' appears only in code comments — the user-facing center label is 'The Keys' and the only caption is 'Majors outside, minors inside. Play a key and it warms up.' There is no glossary entry for it (glossary.ts has no 'circle'/'fifths' term), no tooltip explaining WHY keys sit where they do, no I-IV-V-vi adjacency teaching, and the ghost-key rotation is sequenced pedagogically (not by fifths) so the relationship isn't taught implicitly through practice either. The single most transferable pattern in popular music — that I, IV, V sit adjacent and vi is the inner neighbor — is sitting un-exploited inside a diagram the app already renders.

_Evidence:_ src/lib/music.ts:42-44 (circle defined, clockwise); src/components/KeyMap.tsx:12 (comment 'Circle of fifths'); center label 'The Keys'; src/lib/explain/glossary.ts (no circle/fifths entry)

### Q3 (research): Biggest bang-for-buck for technical ability so a learner can actually PLAY THE SONGS THEY WANT?
**[research-answer]** In priority order: (1) CHORD-TRANSITION FLUENCY under time pressure is the real bottleneck. Knowing a chord and being able to change to it in tempo are separated by weeks of motor consolidation. Most apps teach shapes and never measure transition speed, so learners 'know' chords but can't play songs. Drill the PAIR (G->C, Am->F) as a timed 60-second count, target ~30/min, and gate the song on hitting it. (2) The FOUR-CHORD CORE (I-V-vi-IV and rotations, plus I-IV-V and I-vi-IV-V) covers the majority of pop/rock/blues/country — name it 'the Pop Formula' and show the actual songs it unlocks. (3) RHYTHM/TIMING is the most underweighted skill: a chord in time sounds musical, a perfect chord out of time sounds broken — make timing a first-class graded signal, not an afterthought. (4) The 80/20 of KEYS: C/G/D/A/E major + Am/Em/Dm cover ~80% of songs — don't dilute across all 24 early; on guitar, the CAPO multiplies 5 open-chord keys across the whole spectrum for near-zero new motor cost. (5) Instrument-specific unlock: guitar = power chords -> barre (E-shape); piano = the 'chord-under-melody' two-hand pattern (LH block chords on 1 & 3, RH melody) which covers 90% of easy pop arrangements. (6) SONG-AS-CONTAINER, DRILL-AS-TOOL: every drill should end with 'here's how this sounds in [real song]', and song-level unlocks ('You can now play Wonderwall') drive the dopamine that sustains practice. The synthesis: make drills SCALE and TIE to songs — the app already has the chain-drill + DAG spine to do this; it just isn't measuring transition speed, isn't surfacing the four-chord payoff, and doesn't persist difficulty.

_Evidence:_ Pedagogy research: JustinGuitar One-Minute Changes; Hooktheory 1300-song analysis; I-V-vi-IV Wikipedia (300+ songs); docs/research/motor-learning.md (dopamine-reward coupling, BPM laddering); existing p-t2-pop-formula node + lib/guitar/songs.ts

### Q4: Is the current music content CORRECT? (key signatures, circle-of-fifths relationships, chord/scale content, key ordering, finger patterns)
**[has-it]** Mostly correct, with ONE real bug that affects display of all flat keys. CORRECT: all 28 key-signature sharp/flat counts (music.ts:11-39), all 14 relative major/minor pairs, the three scale step-patterns (MAJOR=2,2,1,2,2,2,1; NATURAL_MINOR=2,1,2,2,1,2,2; HARMONIC_MINOR=2,1,2,2,1,3,1), the circle-of-fifths clockwise ordering, the diatonic chord qualities for both major (I,ii,iii,IV,V,vi,vii dim) and minor (i,ii dim,III,iv,v,V,VI,VII), and the audited drill/finger content (C major I-IV-V-I=C-F-G-C; F major thumb-on-F fingering; G5/E5 power-chord shapes; Iron Man E5/G5/A5/D5). BUG: flat-key tonics in KEY_META are stored as SHARP enharmonics — Bb.tonic='A#', Eb.tonic='D#', Ab.tonic='G#', Db.tonic='C#', Gb.tonic='F#', bbm.tonic='A#', ebm.tonic='D#'. Because scale()/triad()/progressionChords() call midiToSpn() WITHOUT preferFlats=true, the displayed Bb-major scale reads 'A# C D D# F G A A#' instead of 'Bb C D Eb F G A Bb'. Pitches are acoustically right (equal temperament), but the NOTE SPELLINGS shown to the user — and the VexFlow staff accidentals — are wrong for all 7 flat keys. This is a music-literacy error: a learner reading a flat key should never see A#/D#/G#/C#/F# spellings.

_Evidence:_ CORRECT: src/lib/music.ts:6-9, 11-39, 110-132. BUG: src/lib/music.ts:21-25,38-39 (flat tonics as sharps) + music.ts:84-90 scale() / triad() / progressionChords() call midiToSpn without preferFlats; verified directly in file

### Q5: Do the DRILLS CHANGE AS YOU PROGRESS them? (BPM ladder, rep blocks, added complexity) or are they static 'mark done'?
**[partial]** Mostly static, with a genuine but narrow adaptive core. Only 6 of 50 drills (12%) have real motor config (repBlocks + bpmLadder): 3 piano Phase-1 technique drills and 3 guitar Tier-1 drills. For those 6, the engine (repEngine.ts) is genuinely adaptive WITHIN a session — BPM climbs +step after 3 consecutive successes up to targetBpm (R5), enforces micro-rests after rep blocks (R2, Bonstrup 2020), and can interleave 2+ eligible drills A,B,A,B (R4). The other 44 drills (88%) run a flat degraded path: N reps, no metronome ladder, no rest, no tempo target — effectively 'mark done' with a counter. TWO critical gaps even for the adaptive 6: (a) BPM does NOT persist across sessions — initRepEngine always resets to the hardcoded startBpm (repEngine.ts:122, verified); reaching 95 BPM today still starts you at 60 tomorrow. Only intra-day resume exists (repResume.ts, day-keyed). (b) There is NO per-drill difficulty scaling — a drill runs identically at day 1 and day 100 (targetBpm never rises after you beat it, no added variations). The DAG (skillTree.ts) provides real CROSS-session progression by gating WHICH drills unlock, but the drills themselves don't get harder once unlocked.

_Evidence:_ src/lib/repEngine.ts:117-133 (always inits from startBpm, verified line 122); src/lib/piano/chainDrills.ts + guitar/chainDrills.ts (6/50 have repBlocks+bpmLadder); src/components/slots/repResume.ts (day-scoped only); src/lib/skillTree.ts (DAG gates unlock, not internal difficulty)

### Q6: Can you see 'WHAT'S UP NEXT'? (next week's warmups, drills for current major/minor) — is the FUTURE visible, or only today?
**[partial]** Almost entirely no — only today is visible. The weekly ghost key is computed deterministically from weeksSinceEpoch (ghostKey.ts:ghostKeyFor) so next week's key is TRIVIALLY computable by passing a future Date — but NO UI surface ever does. PracticeStand header shows only TODAY's 'Key of the Week'; Horizons 'This week' row shows only the current key+warmup ('One key, seven days. The week picks it'); GhostPicker shows the phase's rotation keys but unordered and with no 'next week will be X' label. Same for warmups (warmupForWeek is deterministic over weekNumber, never called with a future week). There is exactly ONE forward-looking element: Horizons 'Next to learn' (nextToLearn) surfaces the frontier skill node (next prereqs-met unlearned skill) + its tryLine, and PathView shows the full tier-ordered tree with a 'You are here' badge. So the SKILL roadmap is visible, but the TIME-BASED horizon (next week's key, next week's warmup, 'week 4 will be G major', the drills queued for the current major/minor) is completely absent.

_Evidence:_ src/components/Horizons.tsx:57-91 (this-week + next-to-learn only); src/components/GhostPicker.tsx (rotation, no future label); src/lib/ghostKey.ts:ghostKeyFor + src/lib/todayPlan.ts:warmupForWeek (deterministic over Date, never called for future); src/components/PathView.tsx ('You are here')

### Q7: Are there VISUALS for finger placement etc.? (keyboard/fretboard showing current key's scale/chord finger positions, notation, chord diagrams)
**[partial]** Yes for note highlighting and chord diagrams; NO for finger placement. The piano Keyboard.tsx HAS a fingerings prop (renders 1-5 finger numbers inside highlighted keys, lines 79-82 & 101-102) — but it is DORMANT: verified that no call site in the practice flow (WarmupSlot, ChainDrillSlot) or KeyMap ever passes it. So the keyboard lights up WHICH keys are in the current key's scale/triad (tied to the ghost key in the warmup slot), but shows no finger numbers and no fingering pattern ('thumb tucks under on F#'). VexFlow staff notation (Staff.tsx) renders only on the KeyMap reference page, NOT in the practice slots. Guitar is stronger: ChordDiagram.tsx (svguitar) shows real chord diagrams in the lesson panel + glossary, and Fretboard.tsx shows chord-shape dots in the warmup/drill slots tied to the node's shape — but there's no mechanism to derive a scale-BOX from the ghost key for the practice stand, and the guitar Tab.tsx exists but is unused in the practice flow. Summary: the app shows the NOTES of the current key but not HOW to finger them; the finger-number capability is built and wired into the component but never fed data.

_Evidence:_ src/lib/piano/components/Keyboard.tsx:13,79-82,101-102 (fingerings prop exists); verified never passed: WarmupSlot.tsx:93 / ChainDrillSlot.tsx:191 pass only notes; src/lib/piano/components/Staff.tsx used only in KeyMap.tsx:197; src/lib/guitar/components/ChordDiagram.tsx + Fretboard.tsx (lesson/slot use); guitar Tab.tsx unused in practice flow

## Corrections (theory errors)
- **Flat-key tonics are stored as SHARP enharmonics, so every flat key DISPLAYS wrong note spellings. Bb major shows 'A# C D D# F G A A#' instead of 'Bb C D Eb F G A Bb'. Affects all 7 flat keys (Bb, Eb, Ab, Db, Gb major + bbm, ebm minor) across the scale display, triad display, I-IV-V progression, and the VexFlow staff accidentals. Pitches are acoustically correct but the spellings are musically illiterate — a flat key must never show A#/D#/G#/C#/F#.**
  - where: src/lib/music.ts:21-25 and :38-39 (KEY_META.tonic fields) propagated through scale() music.ts:81-93, triad() :95-100, progressionChords() :104-143 — all call midiToSpn() without preferFlats=true
  - fix: Two-part: (1) store correct spelled tonics in KEY_META (Bb.tonic='Bb', Eb.tonic='Eb', Ab.tonic='Ab', Db.tonic='Db', Gb.tonic='Gb', bbm.tonic='Bb', ebm.tonic='Eb'); (2) thread a per-key preferFlats flag (true when sharpsFlats starts with the flat symbol) into scale()/triad()/progressionChords() -> midiToSpn(..., preferFlats) and into the VexFlow Staff so accidentals render as flats for flat keys and sharps for sharp keys. Add a unit test asserting scale('Bb','major') === ['Bb','C','D','Eb','F','G','A','Bb'] and that no flat key's display contains a '#'.

## Ranked Plan
## Synthesis
Honest state: the piano app has an unusually strong SKELETON — a real skill-tree DAG, a genuine adaptive rep engine, a correct circle-of-fifths render, interactive reference panels for all 24 keys, and built (if dormant) finger-number and notation components. The theory is ~95% correct. But the most valuable machinery is half-wired: the adaptive BPM engine is amnesiac between days and reaches only 6 of 50 drills (88% are 'mark done'); the circle of fifths is drawn but never named or taught; finger numbers are coded into the keyboard but never passed; the future ('next week's key') is computable but shown nowhere; and flat keys display sharp spellings. So the biggest gaps the owner asked about are not missing infrastructure — they're un-activated infrastructure. That is the through-line and the opportunity: nearly every high-value item EXTENDS something already built rather than greenfield.\n\nThe biggest gaps, ranked by what actually gets a learner playing songs: (1) drills don't scale or persist difficulty (Q5) — the single most important fix for technical ability; (2) nothing measures chord-transition fluency (Q3), the real bottleneck between knowing chords and playing songs; (3) the circle of fifths / four-chord pattern isn't taught (Q2/Q3); (4) no finger-placement guidance in the practice flow (Q7); (5) no forward horizon (Q6); plus the flat-key spelling bug (Q4).\n\nRecommended MVP batch (one coherent 'drills that actually scale toward songs' shippable upgrade): items #1 (persist + extend the BPM ladder), #2 (timed transition-fluency drill gating song unlocks), and #4 (wire finger numbers into the practice keyboard). Together these turn the static-feeling practice loop into one that escalates difficulty, measures the skill that unlocks songs, and shows the learner HOW to finger the current key — the core of 'increase technical ability so you can play the songs you want.'\n\nBuild order: First ship #6 (flat-key spelling fix, S) — it's cheap and rank-3 depends on correct key content. Then the MVP batch in order #1 -> #2 -> #4 (each builds on repEngine/ChainDrillSlot, so sequencing avoids merge churn). Then #5 ('what's up next', S, pure presentation) as a quick motivation win. Then #3 (taught circle of fifths) and #7 (Pop Formula song catalog + unlock cards) as the pedagogy/motivation layer, and #8 (capo) last as a guitar-specific multiplier.

## Full audit detail (file:symbol)
### AREA: theory/keys
## Q1 — Are all 12 major + 12 minor keys taught?

**Short answer: all 24 are visually accessible and have interactive reference content; only 6 have dedicated curriculum nodes in the DAG.**

### Coverage layers (piano):

**KeyMap visual (`src/components/KeyMap.tsx`)** — the `/tree` page "Key Map" tab renders an SVG circle with 24 wedge segments: `CIRCLE_MAJORS` (12 outer) and `CIRCLE_MINORS` (12 inner) from `src/lib/music.ts:43-44`. Clicking any segment opens `KeyDetailPanel` which generates and displays: 2-octave scale, tonic triad, I–IV–V–I or i–iv–V–i progression, an interactive keyboard highlight, and staff notation. This works for every one of the 24 keys — so there is at minimum a self-service reference panel for all 24.

**Skill-tree DAG nodes (`src/lib/piano/skillNodes.ts`)** — only 6 keys have dedicated `SkillNode` entries with `keyId` set:
- Tier 1: `p-key-C` (C major), `p-key-G` (G major), `p-key-F` (F major), `p-key-am` (A minor)
- Tier 2: `p-key-D` (D major), `p-key-em` (E minor)

The remaining 18 circle keys (A, E, B, F#, Db, Ab, Eb, Bb + bm, fsm, csm, gsm, dsm, bbm, fm, cm, gm, dm) have no SkillNode in the DAG. They are reached via ghost-key rotation and chain drills, not a curriculum gate.

**Chain drills (`src/lib/piano/chainDrills.ts`)** — dedicated drills exist for: C, G, F, am, dm (Phase 1), am, Bb, D, em, G, Eb (Phase 2), G, F, am, em, C (Phase 3). That is roughly 12 unique keys with full practice sequences.

**Ghost-key rotation (`src/lib/piano/trinity.ts:77-83` `GHOST_ROTATION_PER_PHASE`):**
- Phase 5 rotation covers 22 of the 24 circle keys; missing: C# major (`Cs`) and G♭ major (`Gb`) as weekly practice keys.
- Missing minors from Phase 5 rotation: `dsm` (D# minor), `asm` (A# minor), `dm` (D minor), `ebm` (Eb minor). Note: `dm` is the relative of F and is present in Phase 1–4 drills despite missing from Phase 5 rotation.

**`SCALES_PER_GRADE` (`src/lib/piano/trinity.ts:64-74`)** — Grade 8 lists all 14 major KeyIds + 13 of 14 minor KeyIds. The only absence is `asm` (A# minor), which is the enharmonic equivalent of `bbm` (B♭ minor, which is present). This is standard practice — exam syllabuses typically use one spelling per enharmonic pair.

**Guitar** — `src/lib/guitar/skillNodes.ts` has no per-key nodes at all. Guitar's coverage is via moveable shapes: once barre chords E-shape (`g-t2-barre-E`) and A-shape (`g-t2-barre-A`) are learned, any key is reachable.

---

## Q2 — Is the circle of fifths taught/visualized?

**Visualized yes; named and taught, no.**

`src/lib/music.ts:42-44` defines:
```ts
// Circle of fifths, majors outer / minors inner — clockwise starting at C.
export const CIRCLE_MAJORS: KeyId[] = ["C", "G", "D", "A", "E", "B", "Fs", "Db", "Ab", "Eb", "Bb", "F"];
export const CIRCLE_MINORS: KeyId[] = ["am", "em", "bm", "fsm", "csm", "gsm", "dsm", "bbm", "fm", "cm", "gm", "dm"];
```

`src/components/KeyMap.tsx:12` renders this as a full SVG circle with three concentric rings (outer = 12 major wedges, inner = 12 minor wedges, center label "The Keys"). The wedge order is strictly circle-of-fifths clockwise. This is a proper circle-of-fifths visualization.

However, there is no user-facing label calling it "the circle of fifths". The only text a user sees is the footer: *"Majors outside, minors inside. Play a key and it warms up."* The term "circle of fifths" appears only in a code comment. There is no glossary entry for it (`src/lib/explain/glossary.ts` has no "circle" or "fifths" entry), and no tooltip or explanation in the UI explaining the concept or why keys are ordered this way.

The ghost-key rotation does NOT follow circle-of-fifths order — it is pedagogically sequenced (common-key-first, Trinity exam ordering), so the circle relationship is not implicitly taught through practice sequencing either.

**GuitarMap** (`src/components/GuitarMap.tsx`) replaces the circle with a fretboard territory map for guitar; the comment at line 5 explicitly notes the guitar does not chart 24 keys on a circle.

---

## Q4 — Is the theory correct?

### Verified correct:
- **Key signatures** (`src/lib/music.ts:11-39` `KEY_META.sharpsFlats`): all 28 KeyIds have correct sharp/flat counts verified against standard music theory (C=♮, G=♯1, D=♯2 ... F=♭1, Bb=♭2 ... and all minors matching their relative majors). Zero errors found.
- **Relative key pairs** (`KEY_META.relative`): all 14 major/minor pairs correct (C↔am, G↔em, D↔bm, A↔fsm, E↔csm, B↔gsm, F#↔dsm, C#↔asm, F↔dm, Bb↔gm, Eb↔cm, Ab↔fm, Db↔bbm, Gb↔ebm).
- **Scale step patterns** (`src/lib/music.ts:6-9`): `MAJOR_STEPS = [2,2,1,2,2,2,1]` (correct W-W-H-W-W-W-H), `NATURAL_MINOR_STEPS = [2,1,2,2,1,2,2]` (correct), `HARMONIC_MINOR_STEPS = [2,1,2,2,1,3,1]` (correct).
- **Circle-of-fifths ordering**: clockwise from C correct for both majors and minors.
- **Diatonic chord qualities in `progressionChords()`** (`src/lib/music.ts:104-143`): major and minor maps both correct (major: I maj, ii min, iii min, IV maj, V maj, vi min, vii° dim; minor: i min, ii° dim, III maj, iv min, v min, V maj [harmonic], VI maj, VII maj).
- **D major lesson** (`src/lib/piano/lessons.ts:475`): correctly mentions "F sharp, C sharp" as the two sharps.
- **E minor lesson** (`src/lib/piano/lessons.ts:484`): correctly identifies it as the relative minor of G, same notes.

### Confirmed bug:
**Flat-key tonic names use sharp enharmonics throughout `KEY_META`** (`src/lib/music.ts:21-25, 38-39`):
```
Bb: { tonic: "A#" }   // should be "Bb"
Eb: { tonic: "D#" }   // should be "Eb"
Ab: { tonic: "G#" }   // should be "Ab"
Db: { tonic: "C#" }   // should be "Db"
Gb: { tonic: "F#" }   // should be "Gb"
bbm: { tonic: "A#" }  // should be "Bb"
ebm: { tonic: "D#" }  // should be "Eb"
```

The `scale()` function at `src/lib/music.ts:81-93` calls `midiToSpn(cur)` without `preferFlats=true`. This means the scale display in `KeyDetailPanel` (`src/components/KeyMap.tsx:161`) for Bb major shows note names `A# C D D# F G A A#` instead of `Bb C D Eb F G A Bb`. The MIDI pitches are acoustically correct (A# == Bb in equal temperament), but the displayed note spellings are wrong for flat keys. The same affects `triad()` and `progressionChords()`. The Staff/VexFlow notation output will also show incorrect accidentals for these keys.

### AREA: drill-adaptivity
## Drill Adaptivity: What Is Real, What Is Flat

### The RepEngine (the adaptive motor)

`src/lib/repEngine.ts` implements a genuine rep-engine state machine with three adaptive mechanisms:

1. **BPM ladder (R5)**: starts at `startBpm`, tracks `consecutiveAtBpm`, and offers a `+step` BPM bump after 3 consecutive successes, up to `targetBpm`. In-session BPM climbs in real time — this is genuinely adaptive *within* a session.

2. **Micro-rest cadence (R2)**: after `repsPerBlock` reps (default 3), enforces a rest period (`restSec` seconds, default 12). Based on Bönstrup 2020 motor consolidation research, cited inline.

3. **Interleaved rep sequences (R4)**: once 2+ drills are `in-progress` or `learned`, their reps can be woven A,B,A,B for contextual interference. Gated by `buildInterleavePlan` in `src/lib/chainDrillPicker.ts` — brand-new skills (`available`) are excluded to avoid confusion.

The engine degrades gracefully: "a drill with no repBlocks/bpmLadder/interleave collapses to a single flat block of reps with no rest and no metronome ladder" (`repEngine.ts` line 9).

### Critical Gap: ~88% of drills run FLAT — the prior claim is verified

Total drills: **29 piano + 21 guitar = 50 total**.

Drills with `repBlocks` + `bpmLadder` (the full motor config):
- Piano: **3 of 29** (p1-c-major-chain, p1-g-major-chain, p1-f-major-chain — all Phase 1 technique drills, identical config: startBpm 60, targetBpm 100, step 5)
- Guitar: **3 of 21** (g-t1-downpick-chain: 60→120, g-t1-altpick-chain: 80→140, g-t1-power-chords-chain: 80→120)

**6/50 = 12% have real motor config. 88% run flat** — confirmed. The other 44 drills get the flat degraded path: N reps, no BPM ladder, no micro-rest, no tempo target. They are essentially "mark done" sessions with a rep counter.

The `interleavable: true` flag also only appears on those same 6 drills, so interleaving is only possible when at least 2 of those 6 overlap in the user's current phase.

### BPM Does NOT Persist Across Sessions (Critical Gap)

`initRepEngine` always initializes `bpm: config.bpmLadder?.startBpm ?? 80` (`repEngine.ts:122`). The drill definition hardcodes `startBpm` — e.g. every session on p1-c-major-chain starts at 60 BPM, regardless of the user having reached 95 BPM last time.

`bpmReached` is recorded in `SkillProgress` (via `markNodeProgress` in `skillTree.ts`) and used for XP bonus detection (`bpmAdvancedThisSession` in `sessions.ts:221`), but it is **never fed back to set the `startBpm` for the next session**. The drill's `bpmLadder.startBpm` is a compile-time constant in `chainDrills.ts`.

There IS an intra-day resume: `repResume.ts` snapshots the running BPM to `localStorage` with a day key; on reload the same day it rehydrates (line 100: `bpm: snapshot.bpm`). But this only preserves mid-session progress within one calendar day — a new day's session always restarts the ladder.

**The BPM ladder is a within-session feature only.** Between sessions it resets to `startBpm` every time.

### DAG Gating: Genuine But Limited Unlock-and-Static

The skill-tree DAG in `src/lib/skillTree.ts` is real: `resolveStatus` computes each node's status from prereqs and persisted progress. `prereqsMet` checks that every prereq is `learned` before a node can become `available` or `in-progress`. A tier-3 unlock literally cannot fire until its full prereq chain is learned (`sessions.ts:64-94`).

However, DAG gating governs **which drills are accessible**, not the drills' internal difficulty. Once a drill is unlocked, its BPM ladder and rep structure are static. The DAG provides "drill X after drill Y" sequencing, but drill X itself runs identically at day 1 as at day 100 of practice (except the BPM ladder within a session). There is no mechanism that, say, increases `targetBpm` once a user has beaten it consistently.

### Summary: What Actually Changes vs. What Is Static

| Mechanism | Adaptive? | Scope | Covered drills |
|---|---|---|---|
| BPM ladder climb | Yes, adaptive | Within session only; resets next day | 6/50 drills |
| Micro-rest cadence | Structural (fixed) | Within session | 6/50 drills |
| Interleaved rep weave | Unlocks with progress | Session-level when 2+ eligible skills | 6/50 drills |
| DAG prereq gating | Unlocks new drills | Cross-session | All nodes |
| R3 success-rate gate | Quality gate on `learned` | Cross-session accumulation | All drills |
| BPM persistence across days | MISSING | — | 0/50 drills |
| Per-drill difficulty scaling | MISSING | — | 0/50 drills |

### Finger Pattern / Content Correctness of Drills

Within the 6 motor-configured drills:
- p1-c-major-chain: correct — C major scale, C triad, I-IV-V-I (C-F-G-C) all accurate
- p1-g-major-chain: correct — G major scale (notes F#), G triad, G-C-D-G, G major pentatonic
- p1-f-major-chain: correct — F major scale (note Bb), F triad, F-Bb-C-F, F major pentatonic. "Thumb placement on F and C" is correct standard fingering advice
- g-t1-downpick-chain: correct technique — downstrokes at 60 BPM, wrist motion, Seven Nation Army is a correct reference (single-string riff)
- g-t1-altpick-chain: correct — chromatic 1-2-3-4 at 80 BPM, strict alternation
- g-t1-power-chords-chain: correct — E5 shape (low E + 2nd fret A), moveable shape, Iron Man riff uses E5/G5/A5/D5 (correct)

The flat drills also appear content-correct: A minor chord (A-C-E, correct), D minor (D-F-A, correct), i-iv-V-i progressions, chord symbols throughout match the stated keys. No factual errors found in the six motor-configured drills or in the directly audited flat drill content.

### AREA: upnext-visuals
## Q6 — Can the user see "What's Up Next"?

### Ghost key / weekly key: NO future visibility

The weekly key ("ghost key") is computed deterministically from a `weeksSinceEpoch` counter mod the rotation length (`src/lib/ghostKey.ts:ghostKeyFor`). The formula is fully deterministic — calling `ghostKeyFor(state, nextWeekDate)` with any future `Date` would yield next week's key trivially. However, **no UI surface does this**. The only places the current ghost key appears are:

- **PracticeStand header** (`src/components/PracticeStand.tsx:Header`) — shows only TODAY's key with the label "Key of the Week".
- **Horizons section** (`src/components/Horizons.tsx:57-68`) — "This week" row shows the current `ghostKey` + warmup, with the note "One key, seven days. The week picks it, so you don't have to." Zero mention of what next week's key will be.
- **GhostPicker** (`src/components/GhostPicker.tsx`) — shows the current phase's rotation keys as a picker (labeled "This Week's Keys") so the user CAN see which keys are in rotation for their phase, but with no ordering or "next week will be X" label. The footer says "Just this week. The rotation comes back next week."

There is no "next week's key will be __" text, component, or route anywhere in the codebase.

### Warmup: NO future visibility

`warmupForWeek` (defined inside `src/lib/todayPlan.ts:28`, also separately at `src/lib/piano/warmups.ts:89`) takes a `weekNumber` (from `weeksSinceEpoch`) and `phase` and rotates through the warmup list. Again: calling it with `weeksSinceEpoch(nextWeek)` is trivial, but **no UI surface does so**. Only TODAY's warmup is shown — in the PracticeStand warmup slot and the Horizons "This week" row.

### "Next to learn" skill node: YES (skill tree only)

`src/components/Horizons.tsx:79-91` renders a **"Next to learn"** row using `nextToLearn(nodes, skillProgress, 1)`. This surfaces the *frontier skill node* — the first available (prereqs met) unlearned skill from the DAG — its title and `tryLine`. This is the only forward-looking element in the app. It is not a time-based preview (it's skill-graph frontier, not "next week's drills for the current major/minor").

`src/components/PathView.tsx` also marks the frontier node with a "You are here" badge, and the full tier-ordered skill tree is visible, so the user can see the entire skill roadmap in `/tree`. That does answer "what will I be working on in upcoming sessions" at the skill level.

### Gap: no time-based future horizon

There is no UI showing:
- Next week's ghost key
- Next week's warmup
- "This is week 3 of 5-key rotation — week 4 will be G major"
- The sequence of drills that will be picked once the current major/minor skill finishes

The user sees only the present: today's key, today's warmup, today's drill.

---

## Q7 — Finger-Placement and Other Visuals

### Piano: Keyboard SVG with scale/chord note highlighting — YES, but no finger numbers passed in practice

`src/lib/piano/components/Keyboard.tsx` renders an SVG keyboard. It supports:
- `notes?: string[]` — highlighted with filled dots
- `fingerings?: Record<string, number>` — optional finger-number overlays (1..5 shown as text inside highlighted keys)

The `fingerings` prop is rendered at `Keyboard.tsx:79-82` (white keys) and `101-102` (black keys). However, **no call site in the practice flow passes `fingerings`**. Every usage in the app passes only `notes`:
- `WarmupSlot.tsx:93` — `<InstrumentVisual notes={scale(KEY_META[ghostKey].tonic, KEY_META[ghostKey].mode, 2)} rangeStart="C4" octaves={2} />` (no fingerings)
- `ChainDrillSlot.tsx:191` — `<module.InstrumentVisual notes={prog.flat()} rangeStart="C3" octaves={2} />` (no fingerings)
- `KeyMap.tsx:194-196, 213` — `<Keyboard notes={scaleNotes2} .../>` and `<Keyboard notes={triadNotes} .../>` (no fingerings)

So the **keyboard highlights the notes of the current key's scale (2 octaves) and triad, but no finger numbers are shown**.

### Piano: VexFlow staff notation — YES for KeyMap, NOT in practice flow

`src/lib/piano/components/Staff.tsx` renders a VexFlow treble staff. It is used:
- `KeyMap.tsx:197` — `<Staff notes={scaleNotes} ariaLabel=.../>` inside `KeyDetailPanel` — **shows the scale in standard notation on the KeyMap page only**.
- `PianoNotationVisual` in `src/lib/piano/module.tsx:59-73` — the module's NotationVisual adapter. But `NotationVisual` is never called in `WarmupSlot`, `ChainDrillSlot`, or `PracticeStand` in the current code — only `InstrumentVisual` (the keyboard) is used in the practice flow.

### Guitar: Fretboard SVG — YES for scale/chord shapes

`src/lib/guitar/components/Fretboard.tsx` — a custom SVG fretboard showing colored dots. Roots are highlighted in the instrument accent. Used:
- `GuitarMap.tsx:187` — neck backdrop showing all learned chord shape dots accumulated
- `LessonMedia.tsx:110` — `node.viz === "fretboard_map"` renders `<Fretboard ariaLabel=.../>` (default Am pentatonic Box 1 when no positions supplied)
- `InstrumentDefault` in `LessonMedia.tsx:146` — fallback for guitar nodes
- `GuitarInstrumentVisual` in `src/lib/guitar/module.tsx:36-38` passes `shape` prop to Fretboard — used in warmup/chain drill slots for guitar

The guitar practice flow DOES show a fretboard shape in warmup/drill slots when a chord shape is present on the skill node.

### Guitar: ChordDiagram via svguitar — YES, in lesson media and TermVisual

`src/lib/guitar/components/ChordDiagram.tsx` renders svguitar chord diagrams. Used in:
- `LessonMedia.tsx:101-108` — when `node.viz === "chord_diagram"`, renders `<ChordDiagram chordShape={node.chordShape} cagedShape={node.cagedShape} title={node.title} />`
- `src/components/explain/TermVisual.tsx:28` — for `seeKind === "chord-diagram"` in the glossary term explainer (tapping a TermChip on any theory term)

These are in the **skill tree lesson panel** (PathView → expand a node → LessonMedia) and the **glossary explainer**, not directly in the PracticeStand drill-running flow.

### Tied to the current key? Partially.

The keyboard scale/triad visual in the **warmup slot** IS tied to the current week's ghost key: `WarmupSlot.tsx:93` passes `scale(KEY_META[ghostKey].tonic, KEY_META[ghostKey].mode, 2)`. Same for the chain drill's progression notes `prog.flat()` which are derived from the current `drill.ghostKey`.

The KeyMap (`/tree` page) lets the user click any of the 24 keys and see its scale (keyboard + staff), triad (keyboard), and I-IV-V-I progression with playback — this is completely interactive but is a reference map, not the daily practice flow.

### Guitar: Tab via VexFlow TabStave — EXISTS but unused in practice

`src/lib/guitar/components/Tab.tsx` exists and is the `NotationVisual` for guitar. Like piano's Staff, it is the module's `NotationVisual` but that slot is not called in the practice flow slots.

### Gaps

1. **Finger numbers on the piano keyboard are supported** (`Keyboard.fingerings` prop) but **never passed** anywhere in the actual practice or lesson flows — the prop is dormant.
2. The **staff notation (VexFlow)** is only shown on the KeyMap reference page, not inside the practice stand or warmup/drill slots.
3. No visual shows the **fingering pattern for the current key's scale** (e.g., "thumb tucks under on F#"). The keyboard just highlights which keys light up.
4. No fretboard visual shows scale boxes tied to the current ghost key in the guitar drill flow (GuitarInstrumentVisual passes `shape` — a chord shape — but there is no mechanism to derive a scale-box `positions` array from the ghost key and pass it to `Fretboard` in the practice stand).

## Research detail
### Bang-for-buck technical ability: piano and electric guitar for adult learners who want to play real songs
# Synthesis: Highest-Leverage Technical Skills for Playing Real Songs

## Existing Research Foundation

The app already has strong pedagogical grounding in motor learning science (`/home/astraedus/Projects/piano/docs/research/motor-learning.md`), soul-first framing (`soul-first-learning.md`), and a detailed guitar curriculum (`guitar.md`). This synthesis builds on that foundation and fills the gaps: chord-first vs. scale-first, progression coverage math, key economy, transition fluency, and song-based vs. drill-based practice.

---

## 1. The Chord-Vocabulary-First vs. Scale-First Debate

**The verdict for adult learners wanting to play songs: chord vocabulary first, by a wide margin.**

The evidence is circumstantial but overwhelming in practice:
- Chords are the unit of music that lets you **accompany a song immediately**. A learner who knows 4 chords (I, IV, V, vi) can play hundreds of pop songs in one key after a few weeks. A learner who knows the major scale but not the chords cannot play a single song yet.
- Scales are the foundation of soloing and melody. They are indispensable but they come *after* you have a harmonic home to solo over. The minor pentatonic scale (the first soloing tool for guitar) needs a backing chord context to sound musical; without knowing chords first, scale practice is abstract and demotivating.
- For **piano specifically**, the fastest path to playing recognizable songs is: learn the 4-5 most common chords in C major → learn the I-V-vi-IV progression as a block-chord left hand → layer a simple melody on top. This produces a recognizable song in weeks, not months.
- For **guitar specifically**, JustinGuitar's entire Grade 1 is chord-first: Em, Am, E, A, D, G, C, plus the One-Minute Changes drill. This is the world's most-used free guitar curriculum (tens of millions of learners) and the design reflects expert consensus that chords are the gateway to songs.
- **Scale caveat**: the minor pentatonic scale for guitar is the one exception where a scale arrives *before* some chords (Tier 2 in the existing tree), because it produces immediate, zero-wrong-note improvisation over any power chord progression. This is scale-as-expression-tool, not scale-as-theory-foundation.

**Conclusion**: The existing skill tree in the app has this right. Chord vocabulary before scale theory. Minor pentatonic as the first scale, introduced as a soloing tool over known chord progressions.

---

## 2. Chord Progression Coverage Math: What Unlocks the Catalog

The Hooktheory analysis of 1,300+ Billboard songs and the I–V–vi–IV Wikipedia article (documenting 300+ songs using that single progression) together establish a clear 80/20:

**The four-chord core (I, IV, V, vi) covers the majority of Western popular music.** Specifically:
- **I–V–vi–IV** (and its four rotations: vi–IV–I–V, IV–I–V–vi, V–vi–IV–I) appears in hundreds of documented pop hits. The Axis of Awesome medley demonstrated this with 36+ chart songs in a single 4-minute performance; their video has over 100M views.
- **I–IV–V** is the foundation of blues, classic rock, and country — arguably the three most jam-friendly genres.
- **I–vi–IV–V** ("the 1950s progression") covers doo-wop, early rock, and much modern pop.
- In C major, the four chords C–G–Am–F (or Am–F–C–G, etc.) appear in *recognizable form* in songs by The Beatles, Taylor Swift, Adele, Ed Sheeran, U2, Coldplay, Maroon 5, OneRepublic, Oasis, and hundreds more.
- The Hooktheory data shows that in C-major songs, the most common chords after I are V (31%), IV, and vi — meaning the progression data validates teaching I, IV, V, vi first and stopping there for most learners.

**App implication**: The "Pop Formula" skill node (`p-t2-pop-formula` and the glossary's `pop-formula`) is correctly placed as a high-leverage early intermediate milestone. It should be surfaced prominently as "this unlocks half of all pop music."

---

## 3. Chord-Transition Fluency: The Bottleneck That Isn't Taught

Knowing chords and being able to *play songs with them* are separated by a single bottleneck: **transition speed under time pressure**.

- The JustinGuitar "One-Minute Changes" drill (count clean chord swaps in 60 seconds; target 30–60 per minute for common pairs) is the most widely-adopted beginner chord-transition protocol. No peer-reviewed study specifically validates it, but it is consistent with motor learning principles: high repetition count, external measurement, daily practice, clear progression metric.
- Research on motor learning (existing `motor-learning.md`) confirms the mechanism: chord transitions are procedural motor programs. They require many physical repetitions (not understanding) to automate. The "30 changes per minute" threshold is when the motor program begins to run without conscious oversight — the Fitts/Posner autonomous stage.
- **The hardest transitions** (G→C for guitar, Am→F for piano) require disproportionate drill time. These are the specific transition bottlenecks that block the most songs for most beginners.
- **Piano-specific**: the equivalent is a "chord-under-melody" drill — the transition from playing a chord in the left hand to the next chord while keeping the right-hand melody rhythm. This is the hardest two-hand coordination challenge for early piano learners.

**App implication**: Chain drills should be transition-pair focused, not chord-isolation focused. The drill is "G→C→G→C for 60 seconds," not "practice the G chord." Track improvement over sessions as a concrete number, not binary pass/fail.

---

## 4. The 80/20 of Keys: You Do Not Need All 24

For **guitar**, mastering 5 keys + capo covers ~90% of popular songs:
- **Open-position keys**: C, G, D, A, E. These are "guitar-friendly" because they use mostly open chords that ring naturally.
- **Minor versions**: Am, Em, Dm come free since they share the same chord set as C, G, F respectively (relative minor relationship).
- **The capo**: placing a capo on fret 2 and playing "G shapes" produces A chords. Capo on 3 produces Bb. This means a guitarist who knows only 5 open-position key patterns can play in every key by moving the capo. Capo fluency is a high-leverage, low-effort skill that multiplies a limited chord vocabulary across the entire key spectrum.

For **piano**, the calculus is different — there is no capo equivalent. But:
- **C major** is the visual anchor (all white keys). Start here.
- **G major** (one sharp), **F major** (one flat), **A minor** (relative of C), **E minor** (relative of G): these 5 positions cover most pop and classical beginner repertoire.
- **D major and E major** expand into most rock and pop songs (guitar-friendly keys that pianists also encounter frequently).
- The existing app's "key of the week" system with spaced depth tracking is the correct architecture — cycling through these priority keys repeatedly until they are autonomous, not touching all 24 early.

**Conclusion**: C, G, D, A, E major + Am, Em minor on guitar (capo for other keys) cover the vast majority of the popular song catalog. On piano: C, G, F, Am, Em cover the beginner core; D and E expand to cover most pop/rock. The app's current key rotation already prioritizes these.

---

## 5. Barre Chords and Hand Independence: The Gatekeeping Skills

**Barre chords (guitar)** are the single most commonly-cited frustration point for adult beginners:
- They require 6–12 weeks of daily practice before becoming reliable in musical contexts (practitioner consensus; no peer-reviewed data on exact timeline).
- The physical challenge is genuine: the index finger must function as a moveable capo while other fingers form chord shapes. This requires conditioning (not just strength), proper thumb placement, and guitar setup (action height). A high-action guitar makes barre chords harder by a factor of 2–3x.
- **The E-shape barre** unlocks every major and minor chord via one moveable shape. This is the single highest-leverage advanced skill for chord coverage — it breaks the open-chord key restriction completely.
- **Power chords are the barre chord intermediate step**: two-string shapes, same fretboard mobility concept, but much easier physically. The existing tree correctly places power chords (T1) before barre chords (T2).

**Hand independence (piano)** is the piano equivalent of barre chords in terms of learner difficulty and unlock value:
- The bottleneck is not strength but **coordination**: getting the left hand to hold a different rhythm/pattern than the right while both are executing under time pressure.
- The fastest proven pathway is: hands-separate mastery of each part → hands-together at very slow tempo → BPM ladder to performance tempo. This is consistent with the motor learning research (chunking + tempo laddering).
- The biggest practical unlock is the "chord-under-melody" pattern: left hand plays block chords on beats 1 and 3, right hand plays the melody continuously. This is the pattern behind 90% of simple piano song arrangements.

---

## 6. Rhythm and Strumming/Comping: The Most Underweighted Skill

Virtually every guitar pedagogue and many piano teachers rate rhythm as the most important and most neglected beginner skill:
- "Strumming in time is the most important and most overlooked skill students can learn" (JustinGuitar). This is not just opinion — it reflects the observable fact that poor chord changes with good rhythm sound musical; perfect chord shapes with bad rhythm do not.
- **For guitar**: a single down-only strum pattern applied confidently to a 4-chord progression sounds like a real song. The full folk strum (D-DU-UDU) is the single highest-leverage strum pattern for covering the most pop and folk songs.
- **For piano**: basic comping (left hand plays chord on beat 1, rests, plays on beat 3 or adds arpeggiation) is the equivalent. Even a simple "bass note + chord" Alberti-adjacent pattern transforms a boring block-chord exercise into a musical accompaniment.
- Motor learning research is clear that timing/rhythm is a separate skill system from pitch/harmony. It should be drilled independently and in context, not treated as a side effect of chord learning.

---

## 7. Song-Based vs. Drill-Based Practice: The Evidence

The research supports a **hybrid model where songs are the motivational container and drills are the precision tool**:

- **Song-based learning**: higher motivation, better retention of material in context, stronger emotional connection (dopamine research from `motor-learning.md` directly applies — playing a recognizable song triggers genuine reward response). Adult learners who learn songs they love practice more consistently (aggregate evidence from multiple music motivation studies).
- **Drill-based learning**: faster acquisition of specific skills in isolation (contextual interference and blocked practice data), critical for techniques that require a precision threshold before they become musical (e.g., a chord transition below 20/minute sounds broken; a bent note that's flat sounds bad).
- **The chain principle from the existing guitar.md research is the synthesis**: every drill should connect immediately to a song or musical context. "You just learned the G→C transition — here is how it sounds in 'Wonderwall.'" The drill builds the motor program; the song provides the musical proof that it works.
- The existing app's structure (warmup → skill drill → ear moment → free play) already encodes this hybrid. The key is ensuring every drill slot ends with a "here's what this sounds like in a real song" payoff.

**Confidence**: MODERATE for song-based motivation advantages (consistent practitioner consensus, limited adult-specific RCTs); HIGH for dopamine-reward coupling mechanism (from `motor-learning.md`).

---

## Sources

- [I–V–vi–IV Progression Wikipedia](https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression) — 300+ documented songs, genre spread, rotation variants
- [Hooktheory 1300 Songs Analysis (via Gigazine summary)](https://gigazine.net/gsc_news/en/20190116-analyze-popular-songs-chords/) — chord frequency data from Billboard Hot 100 (2010–2012)
- [Liberty Park Music — Common Chord Progressions](https://www.libertyparkmusic.com/common-chord-progressions/) — I-V-vi-IV as "most popular in Western popular music"; 4-chord universe covers hundreds of songs
- [JustinGuitar — One Minute Changes](https://www.justinguitar.com/guitar-lessons/one-minute-changes-exercise-b1-110) — chord transition fluency protocol
- [JustinGuitar — Rhythm Guitar Basics](https://www.justinguitar.com/guitar-lessons/rhythm-guitar-basics-1-bc-136) — rhythm as most important overlooked skill
- [Pickup Music — How to Get Better at Chord Changing](https://www.pickupmusic.com/blog/how-to-get-better-at-chord-changing) — transition speed methodology
- [Green Hills Guitar Studio — Why Players Struggle with Barre Chords](https://greenhillsguitarstudio.com/why-do-guitar-players-struggle-with-barre-chords/) — 6–12 week realistic timeline
- [Liberty Park Music — How to Use a Capo](https://www.libertyparkmusic.com/how-to-use-capo/) — capo as key-coverage multiplier
- [Piano After 40 — Fastest Way to Learn Piano Chords](https://pianoafter40.com/fastest-way-adults-learn-piano-chords/) — chord-first for adult pianists
- [Guitar World — Song vs Exercise debate](https://www.guitarworld.com/features/why-learning-songs-is-just-as-important-as-practicing-technical-exercises) — hybrid model evidence
- Existing app research: `/home/astraedus/Projects/piano/docs/research/motor-learning.md`, `guitar.md`, `soul-first-learning.md`, `plan.md`

### keys + circle of fifths pedagogy
# Circle of Fifths: Correct Facts for App Verification

## 1. The Complete Circle of Fifths (Authoritative Reference)

**The 12 positions clockwise from C, with key signatures and relative minors:**

| Position | Major Key | Sharps/Flats | Accidentals (in addition order) | Relative Minor |
|---|---|---|---|---|
| 12 o'clock | C Major | 0 | — | A minor |
| 1 o'clock | G Major | 1♯ | F♯ | E minor |
| 2 o'clock | D Major | 2♯ | F♯, C♯ | B minor |
| 3 o'clock | A Major | 3♯ | F♯, C♯, G♯ | F♯ minor |
| 4 o'clock | E Major | 4♯ | F♯, C♯, G♯, D♯ | C♯ minor |
| 5 o'clock | B Major | 5♯ | F♯, C♯, G♯, D♯, A♯ | G♯ minor |
| 6 o'clock | F♯/G♭ Major | 6♯ or 6♭ | F♯,C♯,G♯,D♯,A♯,E♯ / B♭,E♭,A♭,D♭,G♭,C♭ | D♯/E♭ minor |
| 7 o'clock | C♯/D♭ Major | 7♯ or 5♭ | (all 7 sharps) / B♭,E♭,A♭,D♭,G♭ | A♯/B♭ minor |
| 8 o'clock | A♭ Major | 4♭ | B♭, E♭, A♭, D♭ | F minor |
| 9 o'clock | E♭ Major | 3♭ | B♭, E♭, A♭ | C minor |
| 10 o'clock | B♭ Major | 2♭ | B♭, E♭ | G minor |
| 11 o'clock | F Major | 1♭ | B♭ | D minor |

**Note on enharmonic equivalents:** Three pairs of keys are enharmonically identical (same pitches, different names). In practice only one spelling is used per context:
- B Major (5♯) = C♭ Major (7♭)
- F♯ Major (6♯) = G♭ Major (6♭)
- C♯ Major (7♯) = D♭ Major (5♭)

**Order of sharps (cumulative, left to right):** F♯ C♯ G♯ D♯ A♯ E♯ B♯
Mnemonic: **F**ather **C**harles **G**oes **D**own **A**nd **E**nds **B**attle

**Order of flats (cumulative, left to right):** B♭ E♭ A♭ D♭ G♭ C♭ F♭
Mnemonic: **B**attle **E**nds **A**nd **D**own **G**oes **C**harles's **F**ather (reverse of sharps)

**Finding relative minor:** The relative minor is 3 semitones (a minor third) down from the major tonic, OR equivalently 3 positions clockwise on the inner ring of the circle.

Sources: [Milne Publishing textbook](https://milnepublishing.geneseo.edu/fundamentals-function-form/chapter/10-the-circle-of-fifths-2/), [Hello Music Theory](https://hellomusictheory.com/learn/circle-of-fifths/), [Liberty Park Music](https://www.libertyparkmusic.com/the-circle-of-fifths/)

---

## 2. Do Learners Need All 24 Keys? No — A High-Value Subset Exists

**Guitar: 5 keys cover ~80% of popular songs.**
C, G, D, A, E (the "open chord keys") account for roughly 80% of popular songs on guitar. These keys align with the open string tuning (E A D G B E), enabling open-chord shapes and avoiding barre chords entirely at the beginner stage. Source: [bmusician.com](https://bmusician.com/blog/beginner-guitar-keys-explained/)

**Piano: C major dominates, G and F follow.**
Spotify analysis of 30M+ songs shows G Major, C Major, D Major, A Major are the top four keys, accounting for over a third of all songs. Source: [Gizmodo/Spotify chart analysis](https://gizmodo.com/a-chart-of-the-most-commonly-used-keys-shows-our-actual-1703086174)

**The minor keys that matter:** A minor (relative of C), E minor (relative of G), D minor (relative of F) — these are the only minor keys breaking significant usage thresholds in popular songs.

**Recommended learning order for guitar (fastest song payoff):**
1. G Major (G, C, D, Em — no barre chords; "Knockin' on Heaven's Door", "Three Little Birds")
2. D Major (D, A, Bm — "Bad Moon Rising")
3. C Major (C, F, G, Am — "House of the Rising Sun" — F chord is the first barre challenge)
4. A Major (A, E, F♯m)
5. E Major (E, B, C♯m — rock territory)
6. Add Am, Em, Dm for minor-key songs

**Recommended learning order for piano:**
C Major first (all white keys, simplest finger placement), then G, F, D in circle-of-fifths adjacent steps. The circle-of-fifths order (add one sharp or flat at a time) is the standard pedagogical path for scales.

---

## 3. How the Circle of Fifths Is Best Taught and Visualized in a Learning App

### The Core Mental Model to Establish
The circle is a **map of harmonic relationships** — not just a key-signature memory aid. Its three practical powers are:
1. **Find the chords in any key instantly** — I (root), IV (one step counter-clockwise), V (one step clockwise), vi (relative minor, inner ring)
2. **Understand why chord progressions work** — adjacent keys share 6/7 notes and harmonize smoothly; the V-to-I pull is the strongest resolution in Western music
3. **Transpose and use a capo intelligently** — a capo fret physically moves your chord shapes to a new sounding key in a predictable circle-of-fifths step

### Visualization: Three Concentric Rings (Standard + Effective)
- **Outer ring:** Major keys (12 positions)
- **Middle ring:** Relative minor keys (same key signature, inner position)
- **Inner ring (or overlay):** Key signature — number of sharps/flats

Interactive click-to-select: tap any key, highlight its I, IV, V, and vi chords simultaneously on the wheel. This is the single highest-leverage UX feature for real-song payoff because learners immediately see "what four chords work together."

### The I–V–vi–IV Connection (The Four-Chord Unlock)
The most important insight to teach early: the I, IV, V, and vi chords of any key sit adjacent on the circle. In C major: C (I) — G (V, one step clockwise) — F (IV, one step counter-clockwise) — Am (vi, inner ring). This single progression (I–V–vi–IV or its rotations) underlies hundreds of hit songs: "Let It Be," "Don't Stop Believin'," "Someone Like You," "Take Me Home, Country Roads." Source: [circleoffifths.io](https://circleoffifths.io/blog/four-chord-song-secret-find-i-v-vi-iv-with-circle-of-fifths)

### What Accelerates Playing Songs
- **Diatonic chord lock-in:** once a learner knows the circle, they know that every major key has exactly 3 major chords (I, IV, V) and 3 minor chords (ii, iii, vi) plus a diminished (vii°). They stop guessing "does this chord fit?" and instead navigate by position.
- **Transposition without re-learning:** understanding the circle means the same I-IV-V relationship holds in every key — move your shapes, the pattern is identical.
- **Capo mastery:** capo on fret 2 with G-shape = A major sounding; capo on fret 5 with C-shape = F major sounding. The circle makes this predictable rather than mystery. Source: [online-guitartuner.com capo chart](https://www.online-guitartuner.com/blog/guitar-capo-chart)
- **Recognizing songs by ear:** adjacent keys share notes, so trained recognition of V-to-I movement (dominant resolution) allows learners to identify where they are in a song.

### Pedagogical Approach: Build It, Don't Just Show It
The most effective teaching method is **building the circle incrementally** with students rather than presenting a completed diagram. Start at C (no accidentals), ask "what's a fifth above C?", arrive at G, add F♯, repeat. This embeds the logic rather than the shape. Source: [circleoffifths.io teaching blog](https://circleoffifths.io/blog/teaching-the-circle-of-fifths-an-interactive-music-theory-tool)

Audio feedback is non-negotiable: learners must **hear** the tonic, dominant, and subdominant chords as they click, not just see Roman numerals.

---

## 4. Most Effective Key/Scale/Chord Introduction Order for Fastest Real-Song Payoff

### For Guitar (fastest path to playing real songs):
1. **G major** — learn G, C, D (all open, no barre). Dozens of songs available immediately.
2. **Em and Am** — same hand positions, first minor feel.
3. **C major** — introduces F chord (first barre challenge) but unlocks C, Am, F, G combination.
4. **D major** — D, G, A, Bm — country and folk repertoire.
5. **A major** — A, D, E progression — blues territory.
6. **E major** — E, A, B — rock.
7. **Introduce the circle** once learner has 3 keys: show that G-D-A are adjacent (G → D is one step clockwise, D → A is another). Pattern clicks visually.
8. **Pentatonic minor scales** (Am pentatonic, Em pentatonic) — solo/melody unlocks.

### For Piano (fastest path):
1. **C major** — all white keys, foundational finger placement. C, F, G, Am chords.
2. **G major** — one sharp (F♯), adjacent on circle, similar chord vocabulary.
3. **F major** — one flat (B♭), introduces flat-side of circle.
4. **A minor** — same key signature as C, natural entry to minor keys.
5. **D major** — two sharps. Expand by one accidental per step.
6. Continue circle-of-fifths order adding one accidental per key.

### The "Power Subset" for Both Instruments:
Master C, G, D, A, E major + Am, Em, Dm minor + the I-IV-V-vi relationships within each, and you can play the overwhelming majority of pop, rock, folk, and country songs. This is a 10-key curriculum (6 major + 4 minor, with significant overlap in chords), not 24.

Sources: [Guitar Keys for Beginners — Tomas Michaud](https://tomasmichaud.com/guitar-keys/), [Yousician Guitar Keys](https://yousician.com/blog/guitar-keys), [Thrive Piano scales order](https://www.thrivepiano.com/what-piano-scales-should-i-learn/), [Hooktheory chord analysis blog](https://www.hooktheory.com/blog/i-analyzed-the-chords-of-1300-popular-songs-for-patterns-this-is-what-i-found/)


## Ranked Plan (re-inserted)
### #1 [M, impact 5/5] Persist + scale the BPM ladder across sessions (and extend it to the flat drills)
- addresses: Q5 (drill adaptivity), Q3 (technical ability via tempo laddering)
- build: Feed the recorded bpmReached back into the next session's startBpm instead of resetting to the hardcoded constant. SkillProgress already stores bpmReached (via markNodeProgress); read it in initRepEngine to seed startBpm = max(config.startBpm, lastBpmReached - 5). Add a simple per-drill targetBpm bump: once a user clears targetBpm in N sessions, raise the ceiling by one step. Then add minimal repBlocks+bpmLadder configs to the ~44 flat chain drills so they stop being 'mark done'.
- why: The adaptive motor engine ALREADY EXISTS and works within a session — it's just amnesiac between days and only wired to 6/50 drills. Fixing persistence + extending the config is config/wiring work on a proven engine, and it directly converts 'mark done' reps into real, escalating technical practice (the #1 driver of actually playing songs at tempo). Highest leverage-to-effort in the whole list.
- extends: src/lib/repEngine.ts:117-133 (initRepEngine), src/lib/skillTree.ts (markNodeProgress / SkillProgress.bpmReached), src/lib/sessions.ts:221 (bpmAdvancedThisSession), src/lib/piano/chainDrills.ts, src/lib/guitar/chainDrills.ts

### #2 [M, impact 5/5] Timed chord-transition drill mode + song unlock gated on transition fluency
- addresses: Q3 (the real song-playing bottleneck), Q5 (a drill that scales by a real number)
- build: Add a 'transition mode' to the ChainDrill system that drills a chord PAIR (G->C, Am->F) for 60 seconds and counts clean changes, storing the per-pair best in SkillProgress. Surface the count as the progress metric (target ~30/min). Gate target-song skill nodes on the pair clearing the threshold, framed as 'the last 10 reps before the song'. Reuse the existing rep/metronome loop and the DAG prereq gate.
- why: Research says this is THE gap between knowing chords and playing songs, and no current drill measures it. It rides the existing ChainDrillSlot + repEngine + DAG gating, turns a binary 'mark done' into a concrete improving number, and ties directly to song payoff. Pure capability gain for medium effort.
- extends: src/components/slots/ChainDrillSlot.tsx, src/lib/repEngine.ts, src/lib/skillTree.ts (prereq gating + SkillProgress), src/lib/piano/chainDrills.ts, src/lib/guitar/chainDrills.ts

### #3 [M, impact 4/5] Turn the KeyMap circle into a taught, interactive Circle of Fifths with I-IV-V-vi highlight
- addresses: Q2 (circle of fifths taught), Q3 (four-chord unlock), Q1 (deepen the 24-key reference)
- build: Name it 'Circle of Fifths' in the UI, add a glossary entry, and on key-tap highlight that key's I (root), V (clockwise neighbor), IV (counter-clockwise neighbor) and vi (inner-ring relative) simultaneously on the wheel + a chord grid below, with audio playback (engine already plays chords in KeyDetailPanel). Add a one-line caption teaching the adjacency rule (I IV V = major, ii iii vi = minor).
- why: The circle is ALREADY rendered correctly and KeyDetailPanel already generates+plays the I-IV-V progression — this is labeling + a highlight overlay + a glossary entry on top of existing data, not new infrastructure. It teaches the single most transferable pattern in pop music and makes the four-chord payoff visible. Big pedagogical win, low-medium effort.
- extends: src/components/KeyMap.tsx, src/components/KeyMap.tsx KeyDetailPanel, src/lib/music.ts (CIRCLE_MAJORS/MINORS, progressionChords), src/lib/explain/glossary.ts

### #4 [M, impact 4/5] Wire finger numbers + scale fingering into the practice keyboard
- addresses: Q7 (finger-placement visuals), Q3 (technical ability)
- build: Add canonical scale-fingering maps for the priority keys (standard RH/LH fingerings, e.g. C major RH 1-2-3-1-2-3-4-5 with thumb tuck) and pass them via the EXISTING dormant Keyboard.fingerings prop from WarmupSlot/ChainDrillSlot for the current ghost key. For guitar, derive a scale-box positions array from the ghost key and pass to Fretboard in the practice slots. Also surface the existing VexFlow Staff (already built) in the warmup slot.
- why: The piano Keyboard ALREADY renders finger numbers (lines 79-82, 101-102) — the prop is built and just never fed. This is largely a data + wiring task on existing components, and finger placement is exactly what a learner needs to physically execute the current key. Very high value relative to the (mostly) data effort.
- extends: src/lib/piano/components/Keyboard.tsx (fingerings prop, dormant), src/components/slots/WarmupSlot.tsx:93, src/components/slots/ChainDrillSlot.tsx:191, src/lib/piano/components/Staff.tsx, src/lib/guitar/components/Fretboard.tsx

### #5 [S, impact 3/5] Add a time-based 'What's Up Next' horizon (next week's key + warmup + queued drills)
- addresses: Q6 (future visibility)
- build: Extend the Horizons 'This week' section with a 'Next week' row: call ghostKeyFor and warmupForWeek with a +1-week Date (both are already deterministic over Date), and show 'Next week: G major' + its warmup, plus 'week N of M in this rotation'. Optionally list the drills queued for the current major/minor's frontier node.
- why: The future is ALREADY computable — ghostKeyFor/warmupForWeek take a Date and no UI calls them forward. This is a pure presentation add (no new logic) that gives the learner a visible runway, which the audit shows is entirely missing. Low effort, real motivation/clarity payoff.
- extends: src/components/Horizons.tsx:57-68, src/lib/ghostKey.ts:ghostKeyFor, src/lib/todayPlan.ts:warmupForWeek, src/components/GhostPicker.tsx

### #6 [S, impact 3/5] Fix flat-key note spellings (correctness bug)
- addresses: Q4 (content correctness)
- build: Store correct spelled tonics in KEY_META for the 7 flat keys and thread preferFlats through scale()/triad()/progressionChords() and the VexFlow Staff so flat keys display flats. Add a unit test pinning scale('Bb','major') and asserting no flat key's display contains '#'.
- why: A genuine music-literacy error visible on every flat key in KeyDetailPanel and the staff. Small, well-scoped fix on a single file's helpers; protects credibility of all 24-key reference content (rank 3 leans on this being correct). Cheap insurance.
- extends: src/lib/music.ts:21-25,38-39 (KEY_META), src/lib/music.ts:81-143 (scale/triad/progressionChords), src/lib/piano/components/Staff.tsx

### #7 [M, impact 4/5] Surface the four-chord 'Pop Formula' with a real song catalog + song-unlock cards
- addresses: Q3 (song payoff, motivation), Q1 (connecting keys to songs)
- build: Extend the existing pop-formula glossary/node with a 'Songs You Can Now Play' panel listing 8-10 recognizable titles per progression (I-V-vi-IV, I-IV-V, I-vi-IV-V). Tag songs in lib/guitar/songs.ts by progression/key. Add a song-unlock card (variant of the existing unlock card) fired from endSession when a song's prerequisite nodes all become learned.
- why: Turns abstract drill progress into 'you can now play Wonderwall' — the strongest dopamine/retention lever in the research. Builds on the existing p-t2-pop-formula node, songs.ts data, unlock-card component and endSession hook. Mostly content + one card variant.
- extends: src/lib/explain/glossary.ts (pop-formula), src/lib/guitar/songs.ts, src/lib/sessions.ts (endSession unlock firing), existing unlock card component

### #8 [M, impact 3/5] Add a guitar capo module (key multiplier) as a Tier-1 skill
- addresses: Q3 (80/20 of keys, song coverage), Q1 (key coverage on guitar)
- build: Add a g-t1-capo skill node after open chords with a static capo chart (5 shapes x frets 0-7 -> sounding key) and a two-dropdown 'capo calculator' (target key + shape -> fret). Reuse the One-Minute-Changes drill; add a capo indicator to ChordDiagram.
- why: Capo reuses already-learned shapes to unlock every key for near-zero new motor cost — extreme repertoire-per-hour ROI. It's mostly static data + a small calculator on the existing skillNodes/ChordDiagram systems.
- extends: src/lib/guitar/skillNodes.ts, src/lib/guitar/components/ChordDiagram.tsx, src/components/LessonMedia.tsx

