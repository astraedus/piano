# Exec Plan — Curriculum Batch 1: "drills that scale toward songs + finger placement + fixes"

**Source of truth:** `docs/research/curriculum-audit-2026-06-17.md` (full audit with file:symbol citations, answers to owner Q1-Q7, ranked plan). READ IT FIRST.

**Theme:** Activate the half-wired infrastructure that increases technical ability so a learner can actually play
the songs they want. Every item below EXTENDS an existing system — none is greenfield. Build in this order
(shared files → sequencing avoids churn).

## Build order

### Step 1 — #6 Fix flat-key note spellings (effort S) — correctness, do FIRST
- BUG: flat-key tonics in `KEY_META` are stored as SHARP enharmonics (`src/lib/music.ts:21-25, 38-39`): `Bb.tonic='A#'`,
  `Eb='D#'`, `Ab='G#'`, `Db='C#'`, `Gb='F#'`, `bbm='A#'`, `ebm='D#'`. `scale()` (`music.ts:81-93`), `triad()`,
  `progressionChords()` call `midiToSpn()` WITHOUT `preferFlats`, so e.g. Bb major displays `A# C D D# F G A A#`
  instead of `Bb C D Eb F G A Bb`. Also wrong in the VexFlow staff accidentals.
- FIX: (1) store correct spelled tonics for the 7 flat keys in `KEY_META`. (2) thread a per-key `preferFlats` flag
  (true when the key's `sharpsFlats` is a flat count) into `scale()/triad()/progressionChords()` → `midiToSpn(..., preferFlats)`
  and into `Staff.tsx` so flat keys render flats, sharp keys render sharps.
- TEST: assert `scale('Bb','major')` === `['Bb','C','D','Eb','F','G','A','Bb']`, and that no flat key's display contains `#`.

### Step 2 — #1 Persist + scale the BPM ladder, extend to the flat drills (effort M) — Q5, the #1 technical-ability driver
- Today: `initRepEngine` (`src/lib/repEngine.ts:117-133`, resets at :122) ALWAYS starts from the hardcoded `startBpm`
  — adaptive BPM is amnesiac between days. Only 6 of 50 drills have `repBlocks`+`bpmLadder`; 88% run flat "mark done".
- FIX: (1) `SkillProgress.bpmReached` is already stored (via `markNodeProgress`, see `sessions.ts:221`
  `bpmAdvancedThisSession`). Read it in `initRepEngine` to seed `startBpm = max(config.startBpm, lastBpmReached - 5)`
  so progress persists across sessions. (2) Add a per-drill targetBpm bump: once the user clears `targetBpm` across
  N sessions, raise the ceiling one step. (3) Add minimal `repBlocks`+`bpmLadder` configs to the ~44 flat chain drills
  in `src/lib/piano/chainDrills.ts` + `src/lib/guitar/chainDrills.ts` so they stop being "mark done".
- TEST: persistence (seeds from prior `bpmReached`), ceiling bump after N clears, flat drills now carry config.

### Step 3 — #2 Timed chord-transition fluency drill + song-unlock gating (effort M) — Q3, the real song bottleneck
- Add a "transition mode" to the ChainDrill system (`src/components/slots/ChainDrillSlot.tsx` + `repEngine.ts`): drill a
  chord PAIR (e.g. G→C, Am→F) for 60 seconds, count clean changes, store per-pair best in `SkillProgress`. Surface the
  count as the metric (target ~30/min). Reuse the existing rep/metronome loop.
- Gate the relevant target-song skill nodes on the pair clearing the threshold (via the existing DAG prereq gate in
  `src/lib/skillTree.ts`), framed as "the last reps before the song."
- TEST: clean-change counting logic, threshold gating (pure functions in `lib/`).

### Step 4 — #4 Wire finger numbers + scale fingering into the practice keyboard (effort M) — Q7
- The piano `Keyboard` component ALREADY renders finger numbers (`src/lib/piano/components/Keyboard.tsx:13, 79-82,
  101-102`) via a `fingerings` prop that is NEVER passed (verified: `WarmupSlot.tsx:93` and `ChainDrillSlot.tsx:191`
  pass only `notes`).
- FIX: add canonical scale-fingering maps for the priority keys (standard RH/LH, e.g. C major RH 1-2-3-1-2-3-4-5 with
  thumb tuck) and pass them via the dormant `fingerings` prop from the warmup/chain slots for the current ghost key.
  Guitar: derive a scale-box positions array from the ghost key, pass to `Fretboard.tsx` in the practice slots. Also
  surface the existing `Staff.tsx` (built, only used in KeyMap) in the warmup slot.
- TEST: the fingering map lookups (pure), correct fingering returned per key.

### Step 5 — #5 "What's up next" horizon (effort S) — Q6
- `ghostKeyFor` (`src/lib/ghostKey.ts`) and `warmupForWeek` (`src/lib/todayPlan.ts`) are deterministic over a Date but
  never called forward. Extend the Horizons "This week" section (`src/components/Horizons.tsx:57-68`) with a "Next week"
  row: call both with a +1-week Date → "Next week: G major" + its warmup, plus "week N of M in this rotation".
  Optionally list the drills queued for the current key's frontier node.
- TEST: next-week derivation returns the correct future key/warmup.

## Constraints (hard — same as prior batches)
- Branch `feat/curriculum-batch-1` off `main`. Commit per-step (5 logical commits). Do NOT push/deploy/native-build.
- Tests are part of the change — pure logic in `lib/`, tested. GATE: `npx tsc --noEmit && npm run test:run && npm run build` all green.
- Warm Studio tokens only; never write `data-*` directly (use `setRootAttrs`). Trust `tsc`, not editor diagnostics.
- Additive; don't refactor unrelated systems. Music content must be theory-correct (cross-check the audit doc).
- If a grounding fact is wrong when you open the file, return `blocked: need X` — do not guess or invent fields/content.
- Out of scope (Batch 2): #3 taught circle of fifths, #7 Pop Formula song catalog, #8 capo module.
