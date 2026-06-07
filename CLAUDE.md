@AGENTS.md

# piano — multi-instrument practice studio (Anti's personal app)

A nightly practice app for learning instruments. **Piano AND electric guitar** (as of 2026-06-07). Next.js 16 / React 19 / TS / Tailwind v4 / Tone.js (audio) / VexFlow 5 (notation) / svguitar (chord diagrams) / @xyflow/react + dagre (skill graph) / motion (reward animations). Client-side, localStorage persistence. Deployed: https://piano-two-blue.vercel.app (Vercel auto-deploys on push to `main`).

## Architecture (read `docs/BUILD.md` for the full story + `docs/research/plan.md` for the design rationale)
- **Instrument-agnostic spine + plugin registry.** `lib/instrumentRegistry.ts` defines `InstrumentModule`; each instrument is `lib/<name>/` (e.g. `lib/piano/`, `lib/guitar/`) with a `module.tsx` that self-registers via `registerInstrumentModule()`. The ONLY instrument-coupled components are `InstrumentVisual` (keyboard / fretboard) and `NotationVisual` (staff / tab). Adding an instrument = new `lib/<name>/` dir + one `import "@/lib/<name>/module";` line in `hooks/useAppState.tsx`.
- **Skill tree is a real DAG** (`lib/skillTree.ts`): `resolveStatus` / `nextToLearn` / `prereqsMet`. Nodes (`SkillNode`) carry `prereqs[]` (the edges), link to a drill via `chainDrillId` and to an unlock card via `unlockCardId`. `endSession` marks nodes learned when their drill is done + prereqs met, then fires the linked unlock. The graph renders via `components/SkillGraph*.tsx`.
- **Storage** migrated `piano.state` → `practice.state` (v1→v2; old key kept as backup). `AppState.instrument` selects the active module.
- **Design = "Warm Studio"** (light-first, warm cream surfaces, amber piano / crimson guitar accents, sunrise tier ramp). Tokens in `app/globals.css` `:root` (light default) + dark under `prefers-color-scheme`/`[data-theme="dark"]`. Never write `data-phase`/`data-instrument`/`data-theme` directly — use `setRootAttrs()` from `lib/domAttrs.ts`.

## Workflow
- Gate before any commit: `npx tsc --noEmit && npm run test:run && npm run build`. 134 tests (Vitest + RTL), pure `lib/` logic tested first.
- **LSP/editor diagnostics are unreliable in this repo** (go stale after `git mv` renames — phantom `module.ts`, false "cannot find module"). **Trust `npx tsc --noEmit`, not editor diagnostics.**
- Parallel dev: verify each worktree's base with `git merge-base main <branch>` BEFORE merging — worktree isolation has forked from a stale ref here before.
