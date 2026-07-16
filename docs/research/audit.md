# Codebase Audit — pre-multi-instrument (2026-06-07)
*Deep technical audit of the piano-only codebase taken before the multi-instrument rebuild.*

## 1. Architecture Map

### Data Flow (top-down)

```
lib/types.ts          ← canonical domain model (AppState + all sub-types)
lib/storage.ts        ← localStorage read/write, defaultState, migration stub
    ↓
hooks/useAppState.tsx ← React Context + state/patch/bumpRep; hydrates from storage on mount
    ↓ (consumed by)
hooks/useTodayPlan.ts ← thin wrapper: useMemo → computeTodayPlan(state, date)
    ↓
lib/todayPlan.ts      ← pure fn: produces TodayPlan from AppState + Date
  ├─ lib/ghostKey.ts  ← weekly key rotation (weekIdOf, ghostKeyFor, setGhostOverride)
  ├─ lib/warmups.ts   ← warmup rotation by week number + phase
  └─ lib/chainDrillPicker.ts ← picks ChainDrill for (phase, ghost, day-of-year)
       └─ lib/chainDrills.ts ← CHAIN_DRILLS constant (12 P1 + 9 P2 + 10 P3 drills)
    ↓
app routes consume either AppStateProvider+useAppState directly or PianoStand
```

### App Routes

| Route | Provider | Main Component |
|---|---|---|
| `/` (page.tsx) | AppStateProvider | HomeGate → PianoStand |
| `/onboarding` | AppStateProvider | Onboarding (3-step wizard) |
| `/tree` | AppStateProvider | KeyMap / SongShelf / YourArc (tab-switched) |
| `/timeline` | AppStateProvider | Timeline (last 45 days session log) |
| `/settings` | AppStateProvider | Settings (grade, ghost override, theme, data) |
| `/print` | AppStateProvider | PrintSheet (auto-triggers window.print()) |

Every page instantiates its own `AppStateProvider`. There is no shared provider at the layout level. This means multiple tabs can drift out of sync (mitigated by the `storage` event listener in `useAppState.tsx:32-38`, but only catches external writes).

### State Persistence

`storage.ts` uses a single localStorage key `"piano.state"` (version 1). `loadState` merges `defaultState()` with the parsed blob — new fields added to `defaultState` are automatically injected on next load. Migrations: `migrateV0` is a no-op pass-through; no real migration exists yet. `version !== 1` currently resets (with a best-effort merge). `saveState` is called synchronously in both `setState` and `patch` callbacks.

The `data-phase` HTML attribute is set eagerly via an inline `<script>` in `layout.tsx:38` to avoid flash-of-wrong-color. This is duplicated in `AppStateProvider.setState` and `AppStateProvider.patch` (three places maintain the same side-effect).

### Core Domain Model (`types.ts`)

Key primitives:
- **AppState** (190 lines of `types.ts`) — single blob. Phase (1–5), Grade, EarLevel, Pieces, KeyDepths, Sessions, Arc, Unlocks/PendingUnlocks, recentDrillIds, skillReps.
- **SessionLog** — one session record. Slots touched, ghost key, ear results, journal, mode.
- **UnlockCard** — a skill capability card with optional `requires` (skill ids — never actually checked; see §2 bugs).
- **ChainDrill** — a sequential drill with steps, phase, ghostKey, pillar.
- **Piece** — user's repertoire item with status lifecycle.
- **ArcEvent** — phase/unlock/improv milestone entry.
- **KeyDepth** (0–5) — fluency depth per key.
- **skillReps** — `Record<string, {count, maxBpm?, lastAt?}>` for rep tracking.

---

## 2. The Skill Tree / Progression System

### What Actually Exists Today

The "skill tree" as built is **not a graph**. The spec document (`The Progression — Skill Tree.md §9`) describes a full `curriculum.json` with skill nodes, prereqs, and edges. The app has none of this. What exists is:

1. **UNLOCK_LIBRARY** (`unlocks.ts`) — 12 `UnlockCard` objects grouped by phase. Each has an `id`, `phase`, `title`, `tryLine`, and an optional `requires?: string[]` field (present in the type but **never populated** on any card — all `requires` arrays are undefined in the data).

2. **`shouldUnlock()`** (`sessions.ts:88-112`) — a hand-coded switch/case that checks heuristic conditions per card id. There is no graph traversal, no prereq checking (the `requires` field on `UnlockCard` is dead weight). The heuristics are:
   - Session count thresholds (`>= 3`, `>= 8`, `>= 10`)
   - Phase gates (`state.phase >= 2`)
   - `keyDepths.C >= 2`
   - `anyChain` (any session has a chainDrillId)
   - Ear round count, piece count, yoursCount

3. **`pendingForPhase()`** (`unlocks.ts:80-82`) — returns all library unlocks `u.phase <= phase`. This is never called anywhere in the current codebase.

4. **KeyDepth system** — the closest thing to real progression nodes. Six states (0–5) per key, bumped by `depthBumpForSession()` in `sessions.ts`.

5. **The `/tree` page** — renders `KeyMap`, `SongShelf`, and `YourArc`. The "Skill Graph" and "Drill Mosaic" views from the spec are **not built** (spec §10 defers them to v1.1).

### Specific Bugs and Design Smells

**Bug 1: `shouldUnlock` checks against the wrong phase state.**
`shouldUnlock(card, _prev, state)` in `sessions.ts:44` is called with the *updated* state (after session end), not the original state. For phase-gated cards like `u-p2-chord-under-melody`, the check `state.phase >= 2` fires only if the user is *already* phase 2, which is correct — but if the user's phase was advanced in the same patch call, the card could fire on the same session the phase changed, before the user has actually done anything in phase 2. The `_prev` parameter is unused.

**Bug 2: Phase 3 unlock conditions are relative to session count, not cumulative.**
`"u-p3-ii-v-i": state.phase >= 3 && sessions >= 3` — only 3 sessions needed while phase 3, which means a user who manually jumps to phase 3 via Settings and does 3 sessions will earn a "jazz ii–V–I" unlock card without having done phase 1 or 2 work. The unlock library has no cross-phase prereqs.

**Bug 3: `requires` field is declared but never populated or checked.**
`UnlockCard.requires?: string[]` in `types.ts:119` is the designed prereq system. Zero cards in `UNLOCK_LIBRARY` set it. The `shouldUnlock` function never reads it. This is dead code pretending to be a system.

**Bug 4: `depthBumpForSession()` — only phases up to depth 3, never 4 or 5.**
`sessions.ts:76-78`:
```ts
if (didWarmup && cur < 1) bumpTo = 1;       // Heard
if (didChain && cur < 2) bumpTo = 2;         // Walked  
if (didChain && log.mode !== "first-back" && cur < 3) bumpTo = 3;  // Played
```
There is no code path that ever automatically elevates a key to depth 4 (Lived) or 5 (Home). Depth 5 (Home) is only reachable manually via `KeyMap`'s "mark as home" button, and only if depth is already 4. Depth 4 is never set automatically — the `log.pieceId` branch at `sessions.ts:83-85` has a comment "// Note: actual keyId of piece is elsewhere; skip — SongShelf promotion handles that" but `SongShelf` does not call any depth promotion function either. **Keys can never reach Lived depth automatically.**

**Bug 5: Ghost override weekId calculation is inconsistent.**
In `settings/page.tsx:68`:
```ts
const weekId = `${now.getUTCFullYear()}-W${Math.ceil(now.getUTCDate() / 7)}`;
```
This is NOT the same as `weekIdOf(date)` in `ghostKey.ts`, which uses ISO week numbering (Thursday-based). The `Math.ceil(date / 7)` approach gives week 1–5 based on day-of-month. `ghostKeyFor()` compares `ghostOverride.weekId === thisWeek` where `thisWeek = weekIdOf(date)` — so a ghost override set in Settings will **never match** the value computed by `ghostKeyFor()`, making the Settings ghost override non-functional.

The onboarding also sets `ghostOverride: { key: option.ghost, weekId: "seed" }` which will never match any real week string, effectively being permanent until cleared.

**Bug 6: `pickChainDrill()` — deterministic only within a phase; drills repeat within a day.**
`chainDrillPicker.ts:18-19`:
```ts
const seed = dayOfYear(date);
const idx = seed % choices.length;
```
`dayOfYear` returns the same value all day. This means the same drill is picked every time `computeTodayPlan` is called on a given day, which is correct. But the seed is purely `dayOfYear` — it doesn't incorporate the phase. If a user advances phase mid-year, the drill index resets to `dayOfYear % newPhasePoolSize`, which could repeat a recently-played drill.

**Bug 7: `p3-blues-starter` uses a cast that signals a type hole.**
`chainDrills.ts:402`: `pillar: "improv" as const as ChainDrill["pillar"]`. The `Pillar` type in `types.ts:16` does not include `"improv"`. This is a silent type coercion hiding a data model inconsistency. Same issue on `p3-pentatonic-fluent` at line 450. These drills have an invalid pillar value at runtime.

**Design smell: The "skill tree" page is actually a key map + shelf + arc.**
The spec describes a Skill Graph view with nodes and edges. The `/tree` route is named "tree" but renders a circle-of-fifths map, a song shelf, and an arc timeline. There is no rendered skill graph. The tab is named "the tree" but has no tree visualization.

**Design smell: `UNLOCK_LIBRARY` only goes through Phase 3.**
There are 4 Phase 1 unlocks, 4 Phase 2 unlocks, and 4 Phase 3 unlocks. Phases 4 and 5 have zero unlock cards. A user in Phase 4 will see "0 of 0 capabilities shown" in the Horizons component.

**Design smell: `Horizons` shows "next capability" from all phases ≤ current.**
`Horizons.tsx:19-21`:
```ts
const nextUnlock = UNLOCK_LIBRARY
  .filter((u) => u.phase <= state.phase && !earned.has(u.id))
  .sort((a, b) => a.phase - b.phase)[0];
```
This picks the lowest-phase un-earned unlock, which could be a phase 1 card the user hasn't triggered (e.g. they've never passed `shouldUnlock("u-p1-minor-feeling")`). A phase 3 user could see a phase 1 next-capability nudge.

---

## 3. Piano-Coupling Inventory

### PIANO-SPECIFIC (keep as-is, sibling a guitar version)

| File / Location | What it does | Disposition |
|---|---|---|
| `components/Keyboard.tsx` | Renders SVG piano keyboard with key highlights | PIANO-SPECIFIC — sibling with `Fretboard.tsx` |
| `components/Staff.tsx` | Renders VexFlow treble/bass staff notation | PIANO-SPECIFIC — sibling with `Tab.tsx` (guitar tab renderer) |
| `lib/trinity.ts` | Trinity Piano Syllabus data (TQT hours, sight-reading params, scale sets per grade) | PIANO-SPECIFIC — sibling with a guitar curriculum module |
| `lib/warmups.ts` — content | Warmup instructions reference piano posture, arm weight, five-finger pattern, sustain pedal | PIANO-SPECIFIC content — structure is reusable |
| `lib/chainDrills.ts` — content | All drill instructions reference piano-specific technique (thumb placement, pedal, hands-separate/together, triad voicings) | PIANO-SPECIFIC content — the `ChainDrill` type is reusable |
| `lib/unlocks.ts` — content | Unlock card text is piano-specific ("Hold a chord with the left hand while the right plays", "play the piano") | PIANO-SPECIFIC content — `UnlockCard` type is reusable |
| `lib/earRounds.ts` | Generates ear rounds using piano-friendly note names and keyboard-based intervals | GENERALIZABLE (instrument-agnostic music theory) |
| `components/AppShell.tsx:14` | Nav logo hardcoded as `"piano"` text | PIANO-SPECIFIC copy |
| `app/layout.tsx:19` | `<title>Piano</title>` and description hardcoded | PIANO-SPECIFIC |
| `onboarding/page.tsx` + `Onboarding.tsx` | Entire flow is piano-specific. Pieces seeded are piano-specific (Tickery Tockery, Once Upon A Time). Questions reference "a keyboard or piano". | PIANO-SPECIFIC — needs instrument-aware variant |
| `lib/storage.ts:3` | `STORAGE_KEY = "piano.state"` | PIANO-SPECIFIC — needs namespacing |

### REUSABLE AS-IS (instrument-agnostic)

| File | Why reusable |
|---|---|
| `lib/types.ts` | `AppState`, `SessionLog`, `ChainDrill`, `UnlockCard`, `Piece`, `ArcEvent`, `KeyDepth` are all instrument-agnostic (modulo `KeyId` which is piano-key naming but maps 1:1 to music theory keys) |
| `lib/music.ts` | Pure music theory: chromatic scale, MIDI conversions, `KEY_META`, `progressionChords()`, `scale()`, `triad()`, `pentatonic()`. Zero piano coupling. |
| `lib/ghostKey.ts` | Pure date math + rotation logic. Instrument-agnostic. |
| `lib/sessions.ts` | `endSession()`, `depthBumpForSession()`, `shouldUnlock()` — all operate on the abstract domain model. |
| `lib/todayPlan.ts` | `computeTodayPlan()` — instrument-agnostic orchestration. |
| `lib/doneLines.ts` | Some lines reference "piano" explicitly (`"the piano is here"` — but only in `notifyAfter5Days` not implemented). Content swap needed, structure reusable. |
| `lib/miniShelfLines.ts:20` | References `"piano"` in `"you've been at piano for..."` | Needs string param |
| `hooks/useAppState.tsx` | Fully instrument-agnostic. |
| `hooks/useTodayPlan.ts` | Fully instrument-agnostic. |
| `components/Slot.tsx` | Generic collapsible slot. Fully reusable. |
| `components/Metronome.tsx` | Pure audio utility. Fully reusable. |
| `components/UnlockCardModal.tsx` | Generic modal. Reusable. |
| `components/GhostPicker.tsx` | References `KEY_META` and `GHOST_ROTATION_PER_PHASE` (piano syllabus). Needs abstraction but structure is reusable. |
| `components/slots/EarMomentSlot.tsx` | Instrument-agnostic (uses EarRound, which is music-theory based). |
| `components/slots/FreeSlot.tsx` | Generic. Reusable. |
| `components/slots/WarmupSlot.tsx` | Renders warmup + keyboard visual. The keyboard embed is piano-specific; the slot structure is reusable. |
| `components/slots/ChainDrillSlot.tsx` | Renders keyboard + chain steps. The keyboard embed is piano-specific; the drill structure is reusable. |
| `components/KeyMap.tsx` | Uses `KEY_META` (music theory) + `Keyboard`/`Staff` (piano). The circle-of-fifths layout and depth coloring are music-theory-based and reusable; the embedded keyboard+staff panel is piano-specific. |
| `components/SongShelf.tsx` | Generic piece shelf. Reusable with an `instrument` field on `Piece`. |
| `components/YourArc.tsx` | Generic arc timeline. `ArcEventKind = "piano-begins"` is piano-specific. |
| `components/Horizons.tsx` | References `"piano"` in phase names and copy. Needs instrument param. |
| `app/tree/page.tsx` | Generic tab shell. Reusable. |

### GENERALIZABLE (rename + abstract)

| File | What needs changing |
|---|---|
| `lib/songs.ts` | `SongHook` type has no `instrument` field. All current songs are piano repertoire. Add `instrument: "piano" \| "guitar"` field. `songsForKey()` should filter by instrument too. |
| `lib/warmups.ts` | `Warmup.lines` and `Warmup.postureLine` content is piano-specific but the `Warmup` type and rotation logic are reusable. |
| `lib/chainDrills.ts` | `ChainDrill` type is reusable; all content is piano-specific. |
| `components/slots/WarmupSlot.tsx` | Conditionally renders `<Keyboard>` — need to gate on instrument. |
| `components/slots/ChainDrillSlot.tsx` | Conditionally renders `<Keyboard>` — need to gate on instrument. |
| `components/AppShell.tsx` | Logo text `"piano"` → instrument-aware. |

---

## 4. Generalization Plan

### Core Insight

The app's domain is: **a music practice companion for an instrument**. The piano-specific parts are: the visual instrument (keyboard vs. fretboard), the notation renderer (staff vs. tab), the syllabus content (Trinity piano vs. guitar curriculum), and some copy. Everything else — session tracking, ghost key rotation, chain drills, ear training, unlock cards, key depths, arc events — is music-theory-level and works for any tonal instrument.

### Proposed Shared Types (`types.ts` additions)

```ts
// Instrument type
export type Instrument = "piano" | "guitar";

// Add to AppState:
export interface AppState {
  // ... existing ...
  instrument: Instrument;  // NEW — which instrument this profile is for
}

// Generalise ArcEventKind:
export type ArcEventKind =
  | "instrument-begins"   // replaces "piano-begins"
  | "phase-begins" | "unlock" | "piece-yours" | "first-improv" | "piece-started";

// Add instrument to SongHook (in songs.ts):
export interface SongHook {
  // ... existing ...
  instrument: Instrument;
}

// Add instrument to ChainDrill (in types.ts):
export interface ChainDrill {
  // ... existing ...
  instrument: Instrument;
}

// Add instrument to Warmup:
export interface Warmup {
  // ... existing ...
  instrument: Instrument;
}
```

### Proposed InstrumentModule Interface

```ts
// lib/instrumentModule.ts
export interface InstrumentModule {
  id: Instrument;
  displayName: string;             // "Piano" | "Electric Guitar"
  // Provides the curriculum:
  chainDrills: ChainDrill[];
  warmups: Record<string, Warmup>;
  warmupRotation: { phase1: string[]; phase2Plus: string[] };
  unlockLibrary: UnlockCard[];
  ghostRotation: Record<Phase, KeyId[]>;
  // Provides the visual components (injected, not imported directly):
  InstrumentVisual: React.ComponentType<{ notes: string[] }>;  // Keyboard | Fretboard
  NotationVisual: React.ComponentType<{ notes: string[] }>;    // Staff | Tab
}
```

### Migration Path (smallest clean refactor)

1. **Add `instrument: Instrument` to `AppState`.** Default `"piano"`. Storage migration: `migrateV0` sets `instrument: "piano"` for all existing saves.

2. **Move piano content into `lib/piano/` subfolder**: `chainDrills.ts` → `lib/piano/chainDrills.ts`, `warmups.ts` → `lib/piano/warmups.ts`, `unlocks.ts` → `lib/piano/unlocks.ts`, `trinity.ts` → `lib/piano/trinity.ts`. Create parallel `lib/guitar/` folder.

3. **Create `lib/piano/module.ts` and `lib/guitar/module.ts`** implementing `InstrumentModule`.

4. **`computeTodayPlan(state, date)`** already accepts `AppState` — it would call `getInstrumentModule(state.instrument)` to get the right drills, warmups, ghost rotation.

5. **`PianoStand` → `PracticeStand`** — rename and accept `module: InstrumentModule`. `WarmupSlot` and `ChainDrillSlot` receive `module` and conditionally render the instrument visual.

6. **`AppShell`** reads `state.instrument` for the nav logo text.

7. **Onboarding** gains an instrument selector as step 0.

8. **Storage key** becomes `"practice.state"` (with migration from `"piano.state"`).

---

## 5. Code Quality Issues

### 5.1 Two invalid Pillar values in chainDrills.ts

`lib/chainDrills.ts:402` and `:450`:
```ts
pillar: "improv" as const as ChainDrill["pillar"],
```
`Pillar` in `types.ts:16` is `"technique" | "repertoire" | "ear" | "expression" | "lead-sheet"`. `"improv"` is not in the union. These are silent runtime lies — the drills have an invalid pillar that no switch/case handles. If any code filters `CHAIN_DRILLS` by pillar (e.g., a future Drill Mosaic colored by pillar), these drills will be invisible or crash. Fix: add `"improv"` to the `Pillar` union, or reclassify these drills as `"ear"`.

### 5.2 Ghost override weekId inconsistency (settings/page.tsx:68)

Already described in §2 Bug 5. The week ID computed in Settings is `Math.ceil(date / 7)` (week-of-month), while `ghostKeyFor()` uses ISO week numbers. The Settings ghost override is always ignored. Fix: import and call `weekIdOf(new Date())` from `ghostKey.ts`.

### 5.3 `dismissUnlock` is a no-op (useAppState.tsx:60-62)

```ts
const dismissUnlock = useCallback((_id: string) => {
  // For now there's no "dismissed" state — unlocks live in state.unlocks.
}, []);
```
Exported in context but does nothing. If any component calls `dismissUnlock(id)`, nothing happens. The function is also not called anywhere in the current codebase. Either implement or remove from the context interface.

### 5.4 `data-phase` attribute updated in three places

`layout.tsx:38` (inline script), `useAppState.tsx:29, 45, 51-53` (useEffect + setState + patch). If a new place that changes phase is added, this attribute can fall out of sync. Fix: centralize in a single `setPhaseAttribute(phase)` utility called from one effect.

### 5.5 `chainDrills.ts` is 480 lines of inline data

The file is one giant constant array. This is fine for now but will become unwieldy when guitar drills are added. The real fix is the instrument module split (§4), not inlining more data here.

### 5.6 `WarmupSlot.tsx:25-28` — timer drift bug

```ts
useEffect(() => {
  if (running) {
    const t0 = Date.now() - elapsed * 1000;
    iv.current = setInterval(...)
  }
```
`elapsed` is a stale closure dependency on re-renders that isn't in the deps array (eslint-disable comment on line 29). If the component re-renders while the timer is running, `t0` is recalculated from stale `elapsed`, causing the timer to jump. Fix: use a ref for `startTime` instead of deriving from `elapsed`.

### 5.7 `PieceSlot.tsx` — local state desync on piece prop change

`PieceSlot` initialises `title`, `composer`, etc. with `useState(piece?.title ?? "")` but does not update when `piece` prop changes. If the active piece changes externally (e.g., from a different tab), the form stays stale. Fix: add a `useEffect` that resets local state when `piece?.id` changes.

### 5.8 `sessions.ts:29` — misleading arc event for first session

```ts
if (sessions.length === 1) {
  arc.push({ ...kind: "piece-started", label: "first session" });
}
```
The `ArcEventKind` `"piece-started"` is used for "first session." This is semantic mismatch — the event kind describes a piece being started, but the label says "first session." The arc timeline in `YourArc.tsx` renders `"piece-started"` with label prefix "piece" — so "first session" shows as `piece: first session`, which is confusing.

### 5.9 `Keyboard.tsx:88` — octave extraction fragile

```ts
const octave = parseInt(n.slice(-1));
```
This only reads the last character. For octave 10+ (MIDI note 132+) this silently breaks. Not a practical issue at normal piano range but worth a comment or a regex fix.

### 5.10 `fieldCls` string duplicated in two components

`PieceSlot.tsx:129` and `settings/page.tsx:230` define identical `fieldCls` CSS strings. Extract to `lib/classNames.ts` or a shared `components/ui/` module.

### 5.11 `miniShelfLines.ts:20` — hardcoded "piano" in user-facing copy

```ts
candidates.push(`you've been at piano for ${hours}h, all up.`);
```
Needs to accept `instrument` as a parameter or read from state.

### 5.12 Missing null guard for `state.currentPieceId` in `miniShelfLines.ts:41-45`

```ts
if (p && (depths[p.keyId as keyof typeof depths] ?? 0) > 0) {
```
If `p.keyId` is `undefined` (which `Piece.keyId` is optional), `depths[undefined]` returns `undefined`, which the `?? 0` handles — but `KEY_META[undefined]` on line 44 would return `undefined`, crashing `name` access silently. The `if (name)` guard on line 45 catches the crash but leaves a silent undefined-key bug.

### 5.13 No error boundary anywhere

VexFlow rendering failures are caught by try/catch inside `Staff.tsx:78-80` (shows "notation unavailable"). Tone.js errors in `audio.ts` are silently swallowed. There are no React error boundaries wrapping components. A VexFlow API change or a Tone.js failure in a slot would propagate and white-screen the app.

---

## 6. Test Gaps — Highest-Value Units First

The app has zero tests. The entire `src/lib/` folder contains pure functions (no React, no browser APIs) and is the ideal test target.

### Priority 1 — Bug-covering (the issues in §2 + §5)

| Unit | Test scenario | Why |
|---|---|---|
| `sessions.shouldUnlock()` | Phase 3 cards trigger with only 3 sessions at phase 3; verify p1 unlock does NOT fire at phase 3 with no p1 work | Exposes the loose heuristics |
| `sessions.depthBumpForSession()` | Verify depth never exceeds 3 automatically; verify depth 4 is never reached automatically | Documents the current (intentional?) cap |
| `ghostKey.ghostKeyFor()` vs `settings/page.tsx weekId` | Show the two week calculations diverge | Exposes Bug 5 |
| `chainDrills.CHAIN_DRILLS` | Verify all drills have valid `pillar` values from the `Pillar` union | Catches the `"improv"` type lie |

### Priority 2 — Core Logic (high churn expected during guitar refactor)

| Unit | Tests |
|---|---|
| `ghostKey.ghostKeyFor()` | Respects `ghostOverride.weekId`; falls through to rotation when weekId mismatches; returns correct key from phase rotation; handles week rollover |
| `ghostKey.weekIdOf()` | ISO week number matches known dates; consistent with `weeksSinceEpoch` |
| `chainDrillPicker.pickChainDrill()` | Returns null when no drills for phase; prefers ghost-matching drills; excludes recent 5; falls back to full pool when all recent; stable within same day |
| `todayPlan.computeTodayPlan()` | Returns `first-back` mode when gap ≥ 3 days; returns `just-play` mode when passed; earRound is null in first-back mode; northStar nudge conditions |
| `sessions.endSession()` | Session appended; lastSessionEndedAt updated; recentDrillIds capped at 5; arc events fire correctly; newUnlocks returned and appended to state |

### Priority 3 — Music Theory (stable, pure functions)

| Unit | Tests |
|---|---|
| `music.scale()` | C major = correct 8 notes; A minor natural = correct; 2-octave length; edge cases (Gb, Cs) |
| `music.triad()` | Major/minor/dim/aug intervals correct |
| `music.progressionChords()` | I–IV–V–I in C; i–iv–V–i in am; unknown roman returns degree 0 |
| `music.pitchMidi()` | C4=60, A4=69, Bb3=58; flat/sharp enharmonics |
| `earRounds.generateEarRound()` | Returns correct level for each EarLevel; all returned fields are non-null; correctId exists in choices |
| `storage.loadState()` / `saveState()` | Round-trip preserves state; missing fields get defaults; version mismatch triggers migration |

### Priority 4 — Regression guard (once guitar is added)

Integration tests for:
- `computeTodayPlan` with guitar `AppState` returns guitar-appropriate drills
- `endSession` with guitar state updates key depths correctly
- `UNLOCK_LIBRARY` drills never reference piano-specific terms (content audit test)

---

**Summary of the biggest risks going into the guitar + skill-tree refactor:**

1. The `ghostOverride` weekId bug (Settings ghost picker is broken today).
2. Key depths can never reach 4 automatically (Lived depth is unreachable without touching `SongShelf` promotion, which also does not set depth).
3. The "requires" prereq system on UnlockCard is a declared-but-dead API — the spec describes a full graph; the code has 12 heuristic switch cases.
4. Two chain drills have invalid pillar values (`"improv"` not in Pillar union).
5. Phase 4 and 5 users have zero unlock cards and the Horizons component will show "0 of 0 capabilities" for those phases.
6. `chainDrills.ts` will need to be instrument-split before adding guitar content — adding guitar drills to the same file and array would make the phase/ghost picker return piano drills to guitar sessions.