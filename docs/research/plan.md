# Piano → Multi-Instrument Practice Studio — Master Build Plan

**Status:** Execution-ready. Lead architect synthesis of 4 research reports, verified against live code (`~/Projects/piano`, commit-state 2026-06-07).
**Stack confirmed:** Next.js 16.2.4 (Turbopack default), React 19.2.4, TS 5, Tailwind v4, Tone.js 15, VexFlow 5. 4,660 LOC, zero tests, single-blob localStorage.
**Hard constraint (from AGENTS.md):** This Next.js has breaking changes vs training data. Any agent touching routing/config/server boundaries MUST read `node_modules/next/dist/docs/` first.

---

## 0. KEY ARCHITECTURAL DECISIONS (reconciled across reports)

These are the load-bearing calls. Everything downstream follows from them.

| # | Decision | Rationale / conflict resolved |
|---|---|---|
| D1 | **Instrument modules via a runtime `InstrumentModule` registry, NOT per-route forking.** One shared `<PracticeStand>` consumes `getInstrumentModule(state.instrument)`. | Report 1's plan. Keeps the spine single-source; guitar is data + 2 injected components, not a parallel app. |
| D2 | **Keep VexFlow for guitar tab (`TabStave`).** Do NOT add alphaTab. | Report 3: alphaTab needs the webpack plugin, which fights Next 16 Turbopack default. We author tab as JS objects anyway (personal app, we own the data). Zero new render surface. |
| D3 | **Roll our own SVG `Fretboard`; use `svguitar` for chord diagrams.** | Report 3. Fretboard.js is 3.5yr stale (dep rot risk on a core surface). svguitar has zero React coupling = zero React-19 risk. Chord diagrams are higher-fidelity work, worth the dep. |
| D4 | **Rebuild the skill tree as a real DAG (`SkillNode[]` + prereq edges) that serves BOTH instruments.** Delete the dead `requires`-but-never-checked system and the hand-coded `shouldUnlock` switch. | Reports 1 + 2 agree the current "tree" is a lie (12 heuristic switch-cases, `requires` never populated/read). The DAG is the actual feature being asked for (goal #2). |
| D5 | **`@xyflow/react` + `dagre` for the graph render.** | Report 3. DAG (multi-prereq) rules out react-d3-tree. Industry-standard, React-19 safe, gives pan/zoom/custom-nodes free. |
| D6 | **Light-mode-first "Warm Studio" palette becomes default. Dark mode retained as opt-in.** | Report 4 + owner's stated goal #4. Current app is dark-first; we flip the default but keep the dark tokens for `prefers-color-scheme`/toggle. |
| D7 | **Vitest + RTL + jsdom.** Pure `src/lib/` logic tested first (no mocks). | Report 3, official Next 16 path. |
| D8 | **Storage key migrates `piano.state` → `practice.state`, version bumps 1→2.** Real migration injects `instrument:"piano"`. | Report 1. The version-mismatch path currently half-resets; we make it a proper migration so the owner's existing practice history survives. |
| D9 | **Tree DAG nodes are the source of truth; legacy `UnlockCard`/`KeyDepth` become *derived/retained* surfaces.** Skill nodes drive unlock celebrations; KeyDepth stays as the per-key fluency map (it's good and orthogonal). | Resolves the Report-1 tension: KeyDepth (per-key, both instruments) and skill nodes (per-technique DAG) are different axes — keep both, but unlocks now flow from node completion, not the switch. |

---

## 1. TARGET ARCHITECTURE

### 1.1 The shape

```
SHARED SPINE (instrument-agnostic)
  lib/types.ts ............ domain model + Instrument type + SkillNode
  lib/music.ts ............ pure theory (untouched)
  lib/ghostKey.ts ......... date math (bug-fixed)
  lib/sessions.ts ......... endSession, depth bumps, node-completion → unlocks
  lib/todayPlan.ts ........ orchestration; resolves module by state.instrument
  lib/skillTree.ts ........ NEW: DAG engine (status resolution, next-nodes, prereq check)
  lib/instrumentRegistry.ts NEW: getInstrumentModule(id)
  lib/storage.ts .......... v2 migration + practice.state key
  hooks/* ................. untouched (already agnostic)

INSTRUMENT PLUGINS
  lib/piano/  module.ts, chainDrills.ts, warmups.ts, unlocks.ts, trinity.ts, skillNodes.ts, songs.ts
  lib/guitar/ module.ts, chainDrills.ts, warmups.ts, unlocks.ts, curriculum.ts, skillNodes.ts, songs.ts
              + components: Fretboard.tsx, ChordDiagram.tsx, Tab.tsx
  lib/piano/components: Keyboard.tsx, Staff.tsx (moved from components/)

RENDER
  components/PracticeStand.tsx  (was PianoStand) — consumes module
  components/slots/* ........... receive `module`, render module.InstrumentVisual / NotationVisual
  components/SkillGraph.tsx ..... NEW: xyflow DAG view, instrument-filtered
```

### 1.2 Core TypeScript interfaces (write these exactly)

Add to `lib/types.ts`:

```ts
// ---- Instrument identity ----
export type Instrument = "piano" | "guitar";

// ---- Skill DAG (serves BOTH instruments) ----
export type SkillCategory =
  | "setup" | "technique" | "chords" | "scales"
  | "rhythm" | "notation" | "repertoire" | "expression" | "ear";

export type SkillNodeStatus = "locked" | "available" | "in-progress" | "learned";

export interface SkillNode {
  id: string;                 // "g-t1-power", "p-key-C-scale"
  instrument: Instrument | "shared"; // "shared" = music theory / ear (shows in both graphs)
  title: string;
  tier: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  category: SkillCategory;
  prereqs: string[];          // node ids — the DAG edges (REAL, checked)
  masteryDrill: string;       // the concrete drill text
  unlock: string;             // the capability sentence ("Can solo over rock/blues")
  // optional render hints (guitar)
  viz?: "chord_diagram" | "fretboard_map" | "tab" | "animation";
  chordShape?: number[];      // e.g. [-1,0,2,2,1,0] for Am (-1 = muted)
  cagedShape?: "E"|"A"|"G"|"C"|"D";
  // optional linkage to existing systems
  chainDrillId?: string;      // completing this drill marks node in-progress/learned
  keyId?: KeyId;              // for per-key nodes, ties to keyDepths
}

// ---- Per-skill mastery state (replaces the dead `requires` system) ----
export interface SkillProgress {
  status: SkillNodeStatus;    // computed, but persisted snapshot allowed
  reps: number;
  maxBpm?: number;
  firstReachedAt?: string;
  learnedAt?: string;
}
```

Extend `AppState`:

```ts
export interface AppState {
  version: 2;                 // bumped
  instrument: Instrument;     // NEW — active instrument for this profile
  // ...all existing fields...
  skillProgress?: Record<string, SkillProgress>; // NEW — keyed by SkillNode.id
}
```

Add `instrument` to these existing types (one field each):
- `ChainDrill { instrument: Instrument }`
- `Warmup { instrument: Instrument }`
- `SongHook { instrument: Instrument }` (in `songs.ts`)

Generalize `ArcEventKind`: `"piano-begins"` → `"instrument-begins"` (migration rewrites old events).

### 1.3 The InstrumentModule interface

`lib/instrumentRegistry.ts`:

```ts
import type { ComponentType } from "react";
import type { ChainDrill, Warmup, UnlockCard, SkillNode, Instrument, Phase, KeyId } from "./types";

export interface InstrumentModule {
  id: Instrument;
  displayName: string;                 // "Piano" | "Electric Guitar"
  accentVar: string;                   // "piano" | "guitar" → drives data-instrument
  chainDrills: ChainDrill[];
  warmups: Record<string, Warmup>;
  warmupRotation: { phase1: string[]; phase2Plus: string[] };
  unlockLibrary: UnlockCard[];
  skillNodes: SkillNode[];
  ghostRotation: Record<Phase, KeyId[]>;
  // injected visuals — the ONLY instrument-coupled components
  InstrumentVisual: ComponentType<{ notes?: string[]; shape?: number[]; className?: string }>;
  NotationVisual: ComponentType<{ notes?: string[]; tab?: TabData; className?: string }>;
}

const REGISTRY: Record<Instrument, () => Promise<InstrumentModule>> = {
  piano:  () => import("./piano/module").then(m => m.pianoModule),
  guitar: () => import("./guitar/module").then(m => m.guitarModule),
};
export async function getInstrumentModule(id: Instrument): Promise<InstrumentModule> {
  return REGISTRY[id]();
}
// sync variant for already-loaded modules (cached) for use in pure fns:
export function getModuleSync(id: Instrument): InstrumentModule { /* cache lookup */ }
```

> **Note for `todayPlan.ts` (a pure fn):** it must not `await`. Decision: modules are eagerly imported (small data) and cached in a sync map at app init; `getModuleSync` reads the cache. Dynamic `import()` is only for the heavy visual components, code-split via `next/dynamic`.

### 1.4 How piano migrates without breaking

1. `git mv` content files into `lib/piano/`: `chainDrills.ts`, `warmups.ts`, `unlocks.ts`, `trinity.ts`. `git mv` `Keyboard.tsx` + `Staff.tsx` → `lib/piano/components/`. Update all imports (codemod with grep+sed, then `tsc --noEmit` gate).
2. Add `instrument:"piano"` to every existing `ChainDrill`/`Warmup`/`SongHook` (bulk edit).
3. Create `lib/piano/skillNodes.ts` — map the existing 12 unlocks + key-depth concepts into DAG nodes (piano nodes can be a lighter set initially; the guitar tree is the showcase).
4. `lib/piano/module.ts` assembles the `pianoModule` with `InstrumentVisual = Keyboard`, `NotationVisual = Staff`.
5. `storage.ts` v2 migration: `instrument:"piano"`, `skillProgress:{}`, rewrite `piano-begins`→`instrument-begins`, copy `piano.state`→`practice.state` (read old key once, write new, leave old as backup).
6. `PianoStand`→`PracticeStand`, `AppShell` logo reads `module.displayName`.

### 1.5 How guitar slots in

Purely additive once D1–D5 land: `lib/guitar/` data files + `guitarModule` with `InstrumentVisual = Fretboard`, `NotationVisual = Tab`. Onboarding gains an instrument step (D-onboard). The graph and stand "just work" because they read the module.

---

## 2. SKILL-TREE SYSTEM (rebuilt)

### 2.1 The DAG engine — `lib/skillTree.ts` (pure, fully testable)

```ts
// Compute live status of every node from prereqs + progress.
export function resolveStatus(nodes: SkillNode[], progress: Record<string, SkillProgress>): Map<string, SkillNodeStatus>;
// A node is:
//   learned     → progress[id].status === "learned"
//   in-progress → has reps but not learned
//   available   → ALL prereqs learned, not yet started
//   locked      → some prereq not learned
export function nextToLearn(nodes, progress, limit = 3): SkillNode[]; // available nodes nearest learned frontier
export function prereqsMet(node: SkillNode, progress): boolean;
export function markNodeProgress(progress, nodeId, { learned?: boolean }): Record<string, SkillProgress>;
```

### 2.2 Fixes to the buggy existing logic (verified in code)

| Bug (Report 1, confirmed) | Fix | File |
|---|---|---|
| **B5: ghost override weekId mismatch** — Settings writes `YYYY-W${ceil(date/7)}`; `ghostKeyFor` compares against ISO `weekIdOf`. Override never matches → broken today. | Replace line 68 with `import { weekIdOf } from "@/lib/ghostKey"; const weekId = weekIdOf(now);`. Onboarding's `weekId:"seed"` → `weekIdOf(new Date())`. | `app/settings/page.tsx:68`, `Onboarding.tsx` |
| **B4: KeyDepth can never reach 4 (Lived) automatically** — `depthBumpForSession` caps at 3; the piece-in-key branch is a TODO comment. | Implement the depth-4 promotion: when a session logs a `pieceId` whose `keyId === ghost` (or piece's own key), bump that key to 4. | `lib/sessions.ts:81-85` |
| **B3 + D4: dead `requires` + hand-coded `shouldUnlock`** | Delete `shouldUnlock` switch. Unlocks now fire when a `SkillNode` reaches `learned` and has a linked `UnlockCard`. `endSession` calls `markNodeProgress` then diffs newly-learned nodes → pending unlocks. | `lib/sessions.ts` |
| **B7: `pillar:"improv"` cast lie** — `Pillar` union lacks `"improv"`; two drills cast through it. | Add `"improv"` to the `Pillar` union in `types.ts:16` (it's a real pillar in the design). Remove the casts. | `types.ts`, `chainDrills.ts:402,450` |
| **B2: phase-jump exploits** (3 sessions at phase 3 → jazz unlock) | Eliminated structurally — unlocks now require the node's prereq chain to be `learned`, not a session count. | (resolved by D4) |
| **B6: drill picker repeats on phase change** | Seed with `dayOfYear + phase*31` so the index space is phase-stable. | `lib/chainDrillPicker.ts:18` |
| Phase 4/5 have 0 unlocks; `Horizons` shows phase-1 nudges to phase-3 users | `nextToLearn()` (frontier-based) replaces phase-filter sort. | `Horizons.tsx` → reads `nextToLearn` |

### 2.3 Graph rendering — `components/SkillGraph.tsx`

- `@xyflow/react` + `dagre` auto-layout (top-down by tier). `'use client'`, `import '@xyflow/react/dist/style.css'`.
- Custom node component: circle, tier-colored per §4, status-styled (locked/available/in-progress/learned), "next-to-learn" pulse ring.
- Instrument filter pills (Piano amber / Guitar rosewood) — switch `state.instrument`-filtered node set + `"shared"` nodes, cross-fade 250ms.
- Edges: dashed (locked path) / solid (unlocked) / tier-gradient (learned).
- Tap node → side panel: title, masteryDrill, unlock sentence, "add to today" button (`tier-N` bordered style), and the viz (chord diagram / fretboard / tab) for guitar nodes.
- The `/tree` route gains a "Skill Graph" tab alongside existing KeyMap / SongShelf / Arc.

### 2.4 Guitar skill-tree node data — `lib/guitar/skillNodes.ts` (concrete, ship this)

26 nodes from Report 2, as `SkillNode[]`. Abbreviated here — the full set is the report's Part 2 JSON mapped 1:1 (ids, tiers, prereqs, masteryDrill, unlock all carry over verbatim). Render hints added:

```ts
export const GUITAR_NODES: SkillNode[] = [
  { id:"g-t0-anatomy", instrument:"guitar", title:"Guitar Anatomy & Tuning", tier:0, category:"setup",
    prereqs:[], masteryDrill:"Name all 6 open strings, tune from scratch <90s", unlock:"Tune & orient independently" },
  { id:"g-t0-posture", instrument:"guitar", title:"Holding & Pick Grip", tier:0, category:"technique",
    prereqs:["g-t0-anatomy"], masteryDrill:"30s body check: wrist relaxed, thumb behind neck, pick 45°", unlock:"Foundation posture", viz:"animation" },
  { id:"g-t0-tab", instrument:"guitar", title:"Reading Tab Basics", tier:0, category:"notation",
    prereqs:["g-t0-anatomy"], masteryDrill:"Read Seven Nation Army tab by fret-number, no playing", unlock:"Decode any basic tab", viz:"tab" },
  { id:"g-t1-fretting", instrument:"guitar", title:"Fretting Hand Placement", tier:1, category:"technique",
    prereqs:["g-t0-posture"], masteryDrill:"Every string rings clean frets 1-5, fingertip only", unlock:"Clean single-note fretting" },
  { id:"g-t1-downpick", instrument:"guitar", title:"Down-Picking", tier:1, category:"technique",
    prereqs:["g-t0-posture"], masteryDrill:"Open-E downstrokes 60bpm 1min, even volume", unlock:"Controlled attack" },
  { id:"g-t1-altpick", instrument:"guitar", title:"Alternate Picking", tier:1, category:"technique",
    prereqs:["g-t1-downpick"], masteryDrill:"Chromatic 1-2-3-4 all 6 strings, alt-pick 80bpm", unlock:"Efficient scale motion" },
  { id:"g-t1-openEM", instrument:"guitar", title:"Open Chords — Em, Am, E, A", tier:1, category:"chords",
    prereqs:["g-t1-fretting","g-t1-downpick"], masteryDrill:"1-min changes Em↔Am ≥30; E↔A ≥30, all strings ring",
    unlock:"Play dozens of songs in E/A minor", viz:"chord_diagram", chordShape:[0,2,2,0,0,0] /*Em*/ },
  { id:"g-t1-openDGC", instrument:"guitar", title:"Open Chords — D, G, C", tier:1, category:"chords",
    prereqs:["g-t1-openEM"], masteryDrill:"1-min changes G↔C ≥30; D↔G ≥30", unlock:"Full open-chord vocabulary",
    viz:"chord_diagram", chordShape:[-1,3,2,0,1,0] /*C*/ },
  { id:"g-t1-strum", instrument:"guitar", title:"Basic Strumming", tier:1, category:"rhythm",
    prereqs:["g-t1-openEM","g-t1-downpick"], masteryDrill:"D-DU-UDU over Em→Am→C→G 80bpm 2min", unlock:"Accompany songs" },
  { id:"g-t1-power", instrument:"guitar", title:"Power Chords", tier:1, category:"chords",
    prereqs:["g-t1-fretting","g-t1-downpick"], masteryDrill:"E5→A5→D5→G5 2 beats each 80bpm, moveable",
    unlock:"Rock rhythm — entire rock/punk/metal vocabulary", viz:"chord_diagram", chordShape:[0,2,2,-1,-1,-1] /*E5*/ },
  { id:"g-t1-palmmute", instrument:"guitar", title:"Palm Muting", tier:1, category:"technique",
    prereqs:["g-t1-power"], masteryDrill:"2 bars muted E5 / 2 bars open E5 80bpm, audible contrast", unlock:"Rhythmic punch", viz:"animation" },
  { id:"g-t1-tabrhythm", instrument:"guitar", title:"Tab Rhythm Reading", tier:1, category:"notation",
    prereqs:["g-t0-tab"], masteryDrill:"Tap a 4-bar tab rhythm before playing, note values correct", unlock:"Learn from tab without hearing", viz:"tab" },
  { id:"g-t2-hammer", instrument:"guitar", title:"Hammer-Ons", tier:2, category:"technique",
    prereqs:["g-t1-fretting","g-t1-altpick"], masteryDrill:"G string 5h7 equal volume, 10 reps/string", unlock:"Legato phrasing", viz:"tab" },
  { id:"g-t2-pulloff", instrument:"guitar", title:"Pull-Offs", tier:2, category:"technique",
    prereqs:["g-t2-hammer"], masteryDrill:"G string 7p5 rings clearly, 10 reps/string", unlock:"Full legato vocabulary", viz:"tab" },
  { id:"g-t2-slide", instrument:"guitar", title:"Slides", tier:2, category:"technique",
    prereqs:["g-t1-fretting","g-t1-altpick"], masteryDrill:"B string 5/7 and 7\\5 80bpm, landing rings full beat", unlock:"Melodic glide", viz:"tab" },
  { id:"g-t2-bend", instrument:"guitar", title:"String Bending — Whole Step", tier:2, category:"technique",
    prereqs:["g-t2-hammer","g-t2-slide"], masteryDrill:"B fret7→sound of fret9, in-tune 8/10 vs reference", unlock:"The blues voice", viz:"animation" },
  { id:"g-t2-vibrato", instrument:"guitar", title:"Vibrato", tier:2, category:"technique",
    prereqs:["g-t2-bend"], masteryDrill:"B fret7 even oscillation 4×/beat 60bpm 8s", unlock:"Sustained notes breathe", viz:"animation" },
  { id:"g-t2-pent-box1", instrument:"guitar", title:"Minor Pentatonic — Box 1", tier:2, category:"scales",
    prereqs:["g-t1-altpick","g-t2-hammer","g-t2-slide"], masteryDrill:"Am Box1 100bpm; improvise over Am track 2min",
    unlock:"First improv vocabulary — solo over rock/blues", viz:"fretboard_map" },
  { id:"g-t2-pent-box2", instrument:"guitar", title:"Minor Pentatonic — Box 2 + Connect", tier:2, category:"scales",
    prereqs:["g-t2-pent-box1"], masteryDrill:"Box1→Box2 unbroken 80bpm, descend back", unlock:"Leave first position", viz:"fretboard_map" },
  { id:"g-t2-barre-E", instrument:"guitar", title:"Barre Chords — E Shape", tier:2, category:"chords",
    prereqs:["g-t1-openEM","g-t1-power"], masteryDrill:"F barre fret1 all 6 ring; 1-min Bm↔F#m ≥15",
    unlock:"Every major/minor chord via one shape", viz:"chord_diagram", cagedShape:"E" },
  { id:"g-t2-barre-A", instrument:"guitar", title:"Barre Chords — A Shape", tier:2, category:"chords",
    prereqs:["g-t1-openDGC","g-t2-barre-E"], masteryDrill:"B barre fret2; 1-min B↔E ≥15", unlock:"Any key anywhere", viz:"chord_diagram", cagedShape:"A" },
  { id:"g-t3-blues12", instrument:"guitar", title:"12-Bar Blues", tier:3, category:"repertoire",
    prereqs:["g-t1-power","g-t1-strum","g-t2-pent-box1"], masteryDrill:"12-bar in A power chords 75bpm, then solo Box1", unlock:"Harmonic spine of blues/rock; can jam" },
  { id:"g-t3-phrasing", instrument:"guitar", title:"Lead Phrasing — Q&A", tier:3, category:"expression",
    prereqs:["g-t2-pent-box1","g-t2-vibrato"], masteryDrill:"4-note phrase, 1 bar silence, 4-note answer over 12-bar", unlock:"Solos sound musical" },
  { id:"g-t3-licks", instrument:"guitar", title:"Pentatonic Licks — Box 1", tier:3, category:"scales",
    prereqs:["g-t2-pent-box1","g-t2-bend","g-t2-vibrato"], masteryDrill:"3 memorized licks, transposed to 2 keys each", unlock:"Solo with intent", viz:"tab" },
  { id:"g-t3-fullneck", instrument:"guitar", title:"Full-Neck Pentatonic", tier:3, category:"scales",
    prereqs:["g-t2-pent-box2"], masteryDrill:"Pentatonic Highway: 5 boxes 5th→17th fret and back", unlock:"Full fretboard freedom", viz:"fretboard_map" },
  { id:"g-t3-bendaccuracy", instrument:"guitar", title:"Bending Accuracy + Expression", tier:3, category:"technique",
    prereqs:["g-t2-bend","g-t2-vibrato"], masteryDrill:"Whole-step bends in-tune 9/10; pre-bend", unlock:"Real blues-rock lead", viz:"animation" },
  { id:"g-t3-syncopation", instrument:"guitar", title:"Rhythm Syncopation & Accents", tier:3, category:"rhythm",
    prereqs:["g-t1-strum","g-t1-palmmute"], masteryDrill:"D-x-DU-x-DU over Em 90bpm 2min, muted strokes even", unlock:"Rhythm sounds alive" },
];
```

Guitar starter repertoire (`lib/guitar/songs.ts`) — Report 2 Part 4's 8 songs, each `{ instrument:"guitar", title, artist, requiredNodes:[...] }`: Seven Nation Army → Smoke on the Water → Iron Man → Sunshine of Your Love → Come As You Are → Back in Black → Whole Lotta Love → La Grange/Pride and Joy.

---

## 3. LIBRARY DECISIONS (locked)

| Need | Choice | Why not the alternative |
|---|---|---|
| Chord diagrams | **`svguitar`** (`'use client'`, instantiate in `useEffect`) | react-chords forks are stale/community; svguitar has zero React dep |
| Fretboard / scale maps | **Custom SVG component** (~120 LOC) | fretboard.js 3.5yr stale = dep rot on core surface |
| Guitar tab | **VexFlow 5 `TabStave`** (already installed) | alphaTab needs webpack plugin vs Next 16 Turbopack |
| Skill DAG graph | **`@xyflow/react` + `dagre`** | react-d3-tree can't do multi-prereq DAGs |
| Reward animation | **`motion`** (`import from "motion/react"`) | explicitly React-19 / Next-16 tested |
| Testing | **Vitest + RTL + jsdom** | official Next 16 path; Jest needs custom transform |

**Single consolidated install command:**

```bash
npm install svguitar @xyflow/react dagre motion && \
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths @types/dagre
```

(VexFlow/Tone already present. alphaTab deferred unless GP-file import becomes a requirement.)

---

## 4. DESIGN SYSTEM — "The Warm Studio" (light-first)

Adopt Report 4 wholesale. Locked tokens, condensed:

**Surfaces (warm cream, not white):** `--bg-base #FBF6EE`, `--bg-surface #F5EDD9`, `--bg-surface-2 #EDE2C8`, `--bg-surface-3 #E4D6B8`, `--bg-rule #D4C5A0`.
**Ink (WCAG-verified):** `--ink-primary #231A0E` (17:1), `--ink-secondary #4A3A22` (9.6:1), `--ink-tertiary #7A6448` (5.2:1), `--ink-muted #A08860` (decorative only — never info-bearing).
**Instrument accents:** Piano amber `--piano-500 #D4900A` / deep `#9C6800`; Guitar rosewood `--guitar-500 #C94040` / deep `#9A2A2A`. Full 100–500 ramps + glow per report.
**Tier colors (sunrise ramp, shared across instruments):** t0 `#C8BAA0`, t1 `#D4900A`, t2 `#C06020`, t3 `#A0803E`, t4 `#587840`, t5 `#3868A0`, t6 `#6840A0`.
**Semantic:** success `#3A8040`, warning `#C07000`, error `#B83030`, info `#2870A0` (all ≥4.6:1 + bg tints).

**Type:** Fraunces (display/reward/identity) + Inter (all operational). Scale 36/28/22/18/15/13/11px. Fraunces-900 reserved for the ONE unlock headline.
**Component language:** nested-radius rule (xl 20 > lg 16 > md 12 > sm 8 > xs 4, never equal nested); two-shadow warm-tinted stacks; **lit top-edge** (`inset 0 1px 0 rgba(255,255,255,.65)`) on all major cards; slot left-edge pillar strips (technique=amber, ear=sage, expression=terracotta, lead-sheet=cerulean, improv=violet, repertoire=rose).

**Implementation files:**
- `src/app/globals.css` — replace `:root` block + add full `@theme inline` mapping (Report 4 §7 verbatim). **Flip default to light**; move current dark tokens into `@media (prefers-color-scheme: dark)` + `[data-theme="dark"]`.
- `data-instrument` attribute on `:root` swaps `--instrument-accent*` (set alongside the existing `data-phase` mechanism). **Centralize** the `data-phase`/`data-instrument` writes — currently duplicated in 3 places (layout inline script + setState + patch); extract `lib/domAttrs.ts setRootAttrs(phase, instrument, theme)` called from one effect + the inline boot script.
- `layout.tsx` inline script extended to set `data-instrument` + `data-theme` (no-flash).

**Anti-AI-look guardrails (Report 4 §6):** real SVG instrument icons (no 🎵 emoji), progress = territory/artifacts not %-bars, animations RARE (unlock card, phase rite, key-map depth-up, arc entrance only), warm near-vertical multi-stop gradients only.

**Motivation surfaces:** unlock card (Fraunces-900 headline, sunrise top-bar, `cardRise` 400ms, no confetti), phase-rite full-screen warm fade, skill-graph "next-to-learn" pulse ring, key-map swell on depth-up, "only grows" counters in Fraunces-italic prose.

---

## 5. TEST STRATEGY

Vitest + RTL + jsdom. `vitest.config.mts` per Report 3. Scripts: `"test":"vitest"`, `"test:run":"vitest run"`. Pure `src/lib/` first (zero mocks). CI gate = `tsc --noEmit && vitest run && next build`.

**Prioritized first list (write in Phase 0 + grow per phase):**

*P1 — bug-covering (lock the fixes):*
1. `ghostKey`: `weekIdOf` matches known ISO dates; Settings weekId now equals `ghostKeyFor` weekId (regression for B5).
2. `sessions.depthBumpForSession`: depth reaches 4 when piece-in-key logged (regression for B4); never skips levels.
3. `chainDrills`/all modules: every drill has valid `Pillar` (catches the `"improv"` lie post-fix).
4. `skillTree.resolveStatus`: locked until ALL prereqs learned; no phase-jump exploit.

*P2 — DAG engine + core logic:*
5. `skillTree`: `nextToLearn` returns frontier nodes only; `prereqsMet`; cycle-free assertion over GUITAR_NODES + PIANO_NODES.
6. `chainDrillPicker`: phase-stable seed (B6); excludes recent 5; ghost preference.
7. `todayPlan.computeTodayPlan`: first-back mode on ≥3-day gap; resolves correct module per `state.instrument`.
8. `sessions.endSession`: node-completion → pending unlocks; recentDrillIds capped at 5; arc events.

*P3 — theory + storage:*
9. `music`: scale/triad/progressionChords/pitchMidi correctness.
10. `storage`: v1→v2 migration injects `instrument:"piano"` + `skillProgress`, rewrites `piano-begins`, round-trips.
11. Content audit test: guitar nodes never contain piano terms and vice-versa.

*P4 — components (RTL, mock `next/navigation`):* SkillGraph renders locked/learned states; ChordDiagram renders shape; instrument filter toggles node set.

---

## 6. PHASED EXECUTION ROADMAP

Dependency graph: **P0 → {P1, P2} → P3 → {P4, P5} → P6**. Worktree-isolated parallel pairs flagged.

### PHASE 0 — Foundation (SEQUENTIAL, blocks everything) — senior-developer-agent
Everything downstream imports from this. One agent, main branch, no parallel.
- **Files create:** `vitest.config.mts`, `lib/skillTree.ts` (engine + tests), `lib/instrumentRegistry.ts`, `lib/domAttrs.ts`, `lib/piano/` dir skeleton.
- **Files modify:** `lib/types.ts` (add `Instrument`, `SkillNode`, `SkillProgress`, extend `AppState` v2, add `"improv"` to `Pillar`, `ArcEventKind` rename); `lib/storage.ts` (v2 migration + `practice.state`); `package.json` (deps + test scripts); `src/app/globals.css` (full Warm Studio token block + `@theme`, light default); `layout.tsx` (boot script sets data-instrument/theme).
- **Gate:** `npm run test:run` green on skillTree + storage + ghostKey tests; `tsc --noEmit` clean; `next build` passes.

### PHASE 1 — Piano migration onto the spine (depends P0) — senior-developer-agent, **worktree A**
- `git mv` content → `lib/piano/{chainDrills,warmups,unlocks,trinity}.ts`; `Keyboard.tsx`/`Staff.tsx` → `lib/piano/components/`. Update all imports.
- Add `instrument:"piano"` to all drills/warmups/songs. Create `lib/piano/skillNodes.ts` (PIANO_NODES) + `lib/piano/module.ts` (`pianoModule`).
- Rename `PianoStand.tsx`→`PracticeStand.tsx`, thread `module`; `WarmupSlot`/`ChainDrillSlot` render `module.InstrumentVisual`. `AppShell` logo ← `module.displayName`.
- **Gate:** app runs piano-identically to today; existing localStorage migrates; all P0 tests still green + new module tests.

### PHASE 2 — Bug-fix sweep (depends P0, **parallel with P1**) — developer-agent, **worktree B**
Touches different files than P1, so worktree-isolated parallel is safe. Merge P1 first, then P2.
- B5 (`settings/page.tsx`, `Onboarding.tsx` weekId), B4 (`sessions.ts` depth-4), B6 (`chainDrillPicker.ts` seed), B7 casts removed, delete `shouldUnlock` switch + wire node-completion in `endSession`, fix `dismissUnlock` no-op, `Horizons`→`nextToLearn`.
- **Gate:** all P1-tier bug tests pass.

### PHASE 3 — Skill Graph render (depends P1+P2 merged) — senior-developer-agent
- `components/SkillGraph.tsx` (xyflow + dagre, custom nodes, instrument filter, side panel, next-to-learn pulse). Add tab to `app/tree/page.tsx`.
- **Gate:** piano graph renders real DAG with correct locked/learned states; P4 component tests.

### PHASE 4 — Guitar content + visuals (depends P0+P3) — senior-developer-agent, **worktree C**
- `lib/guitar/{module,chainDrills,warmups,unlocks,curriculum,skillNodes,songs}.ts` (skillNodes = §2.4 verbatim). Drills follow Report 2 drill texts; warmups = tuning/posture/one-minute-changes.
- Components: `lib/guitar/components/Fretboard.tsx` (custom SVG), `ChordDiagram.tsx` (svguitar), `Tab.tsx` (VexFlow TabStave). `guitarModule` wires them.
- Register guitar in `instrumentRegistry`. Add instrument step to onboarding.
- **Gate:** guitar selectable; guitar graph + drills + chord diagrams render; switching instruments swaps accent + node set.

### PHASE 5 — Design polish pass (depends P1+P3, **parallel with P4** if scoped to shared components) — developer-agent, **worktree D**
- Apply Warm Studio component language across `PracticeStand`, all slots, `KeyMap`, `SongShelf`, `YourArc`, unlock card, phase-rite, buttons. Add `motion` reward animations. Real SVG icons.
- **Gate:** visual QA screenshots (light default); contrast spot-check; `prefers-reduced-motion` honored.

### PHASE 6 — Integration + verification (depends all) — frontend-qa-agent + Codex QA in parallel
- Full-flow: onboard piano → practice → onboard guitar → practice → graph both → unlock fires → migration from real old `piano.state`. Browser screenshots. Final `tsc + vitest + build` gate. Deploy to Vercel.

**Parallelization summary:** P1∥P2 (worktrees A/B), P4∥P5 (worktrees C/D). Merge order within each pair: P1 before P2, P4 before P5. All parallel dev dispatches MUST use `isolation:"worktree"` per the parallel-dispatch rule.

---

## 7. RISKS & OPEN QUESTIONS (flag to owner early)

**Needs owner taste/decision (UI — check before Phase 5, ideally show a Phase-0 globals.css preview):**
1. **Light-first flip (D6).** Confirm: light Warm Studio as default, dark retained as toggle? This is the single biggest visual change and is taste-dependent. Recommend a screenshot of one screen in the new palette before committing the full pass.
2. **Guitar accent = rosewood red `#C94040`.** Red can read "error/alarm." Confirm it feels like "guitar soul," not warning. Alt: warmer terracotta/burnt-orange if red feels off.
3. **Skill graph layout density.** 26 guitar nodes in a dagre top-down graph can feel busy on mobile. Acceptable to ship tier-collapsed (expand a tier on tap) as v1 if it's cramped?

**Technical decisions made (no owner input needed, noted for transparency):**
4. **Module loading is sync-cached** (not async) so `computeTodayPlan` stays a pure fn — heavy visuals code-split via `next/dynamic`. If module data grows large, revisit.
5. **KeyDepth + SkillNode coexist** (D9) — two orthogonal progress axes. Could confuse if surfaced together; keep KeyMap and SkillGraph as separate tree-tabs.
6. **Storage migration leaves old `piano.state` as backup** (not deleted) — safety net for the owner's real history. One-time; harmless.

**Open product question (low urgency):**
7. **Per-instrument profiles vs shared.** Current `AppState` has ONE `instrument` field — switching instruments switches the whole profile's lens but shares sessions/arc. Is that right, or should piano and guitar have fully separate progress (sessions, depths, nodes)? Recommend **shared profile, instrument-tagged data** for v1 (simpler, one practice history); split later if it feels wrong. Flag because it affects whether `sessions`/`arc` need an `instrument` field too — **safest to add `instrument` to `SessionLog` now** (cheap) to keep the door open.

> Recommendation on #7 incorporated as a Phase-0 hedge: add `instrument: Instrument` to `SessionLog` and `ArcEvent` during the P0 type pass so per-instrument filtering is possible later without a v3 migration.