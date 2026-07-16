@AGENTS.md

# piano — multi-instrument practice studio (Anti's personal app)

A nightly practice app for learning instruments. **Piano AND electric guitar** (as of 2026-06-07). Next.js 16 / React 19 / TS / Tailwind v4 / Tone.js (audio) / VexFlow 5 (notation) / svguitar (chord diagrams) / @xyflow/react + dagre (skill graph) / motion (reward animations). Client-side, localStorage persistence. Deployed: https://music.raeduslabs.com (live custom domain) + https://piano-two-blue.vercel.app (Vercel auto-deploys on push to `main`).

## Product soul — judge every change against this
The app exists to delete two sentences from practice: **"wait, what should I do?"** and **"shit, I forgot that one thing — what was it again?"**
At every moment, at two zoom levels, it tells you EXACTLY what to do right now and why it matters:
- **Inside a session**: the stand is tonight's plan — what to do now, what's next, when you're done.
- **On the roadmap**: Your Path / the skill tree shows what you've learned (which scales/skills, at what tempo), the ONE thing to learn next, and the way back to anything you forgot (spaced review).
Two more commitments:
- **Fundamentals first.** Good fundamentals carry a learner extremely far; the curriculum's job is to sequence them honestly and explain WHY each one matters — not to pad with novelty.
- **Open to anyone.** No unexplained jargon, ever — every musical term stays tappable (TermChip → plain-language glossary). If a lesson can't be followed by a total beginner reading it cold, it isn't done.
It is not trying to be anything else. No faking: honest progress numbers, real teaching (what/why/how for every node), exact next actions. If a change doesn't make the next action clearer, the record of learned things sharper, or the way-back easier, question whether it belongs.

## Architecture (read `docs/BUILD.md` for the full story + `docs/research/plan.md` for the design rationale)
- **Instrument-agnostic spine + plugin registry.** `lib/instrumentRegistry.ts` defines `InstrumentModule`; each instrument is `lib/<name>/` (e.g. `lib/piano/`, `lib/guitar/`) with a `module.tsx` that self-registers via `registerInstrumentModule()`. The ONLY instrument-coupled components are `InstrumentVisual` (keyboard / fretboard) and `NotationVisual` (staff / tab). Adding an instrument = new `lib/<name>/` dir + one `import "@/lib/<name>/module";` line in `hooks/useAppState.tsx`.
- **Skill tree is a real DAG** (`lib/skillTree.ts`): `resolveStatus` / `nextToLearn` / `prereqsMet`. Nodes (`SkillNode`) carry `prereqs[]` (the edges), link to a drill via `chainDrillId` and to an unlock card via `unlockCardId`. `endSession` marks nodes learned when their drill is done + prereqs met, then fires the linked unlock. The graph renders via `components/SkillGraph*.tsx`. Node counts: piano 22 nodes, guitar 29 nodes (as of 2026-07-16; counts drift — verify with `grep -c 'id: "' src/lib/{piano,guitar}/skillNodes.ts`).
- **Storage** migrated `piano.state` → `practice.state` (v1→v2; old key kept as backup). `AppState.instrument` selects the active module.
- **Design = "Warm Studio"** (light-first, warm cream surfaces, amber piano / crimson guitar accents, sunrise tier ramp). Tokens in `app/globals.css` `:root` (light default) + dark under `prefers-color-scheme`/`[data-theme="dark"]`. Never write `data-phase`/`data-instrument`/`data-theme` directly — use `setRootAttrs()` from `lib/domAttrs.ts`.

## Workflow
- Gate before any commit: `npx tsc --noEmit && npm run test:run && npm run build`. ~710 tests (Vitest + RTL), pure `lib/` logic tested first.
- **LSP/editor diagnostics are unreliable in this repo** (go stale after `git mv` renames — phantom `module.ts`, false "cannot find module"). **Trust `npx tsc --noEmit`, not editor diagnostics.**
- Parallel dev: verify each worktree's base with `git merge-base main <branch>` BEFORE merging — worktree isolation has forked from a stale ref here before.
- **Browser QA of the practice loop:** the home "stand" is a preview — ear rounds only become interactive after a session is generated, and the ear slot can be muted for a given session. Click "Done for Tonight" to regenerate a fresh session; restart 1–2x to force a specific round type (e.g. an Interval ear round). astra-browser can't set a true mobile CSS viewport (extension-based, no CDP emulation) — simulate via `grid-template-columns` to check responsive stacking. **Local `next start` QA: ALWAYS verify the served `BUILD_ID` (`curl -s localhost:PORT | grep <id>`) before trusting results — a half-killed old `next start` keeps serving a stale build and the new one silently fails to bind (`EADDRINUSE`), which reads as "feature regressed/absent" across the board. Free the port with `fuser -k PORT/tcp` (NOT `pkill -f next-server`/`pkill -f "npm run start"` — those match the shell's own command line and kill your session).** Skill nodes on `/tree` expand INLINE (testid `path-step-toggle-<nodeId>`), not via a lesson route; a LOCKED node can be unblocked for QA by seeding its prereqs as learned in `localStorage['practice.state'].skillProgress` (`{status:"learned", learnedAt:<ISO>}`) then reloading.
- **Curriculum (2026-06-17):** Circle of Fifths is the named/taught KeyMap wheel (`circleNeighbors()` in `music.ts` → I/IV/V/vi highlight; chord-cell labels derive from the SOUNDED chord, so F# shows V=C# not Db). Guitar capo = `g-t1-capo` node + `CapoTeacher` (`lib/guitar/capo.ts` pure math). Scale fingerings for all 24 keys in `lib/piano/fingerings.ts` (reference: `docs/research/piano-scale-fingerings.md`). Curriculum answers + plan: `docs/research/curriculum-audit-2026-06-17.md`. Still queued: batch-2 #7 Pop Formula song catalog (needs an owner-approved song list).
- **Progress visibility (2026-06-17):** the three-axis system — `lib/threeAxis.ts` (Generation milestones / Ability / Pattern derivations), `lib/skillSummary.ts` (learned counts + tier fractions), `lib/earProgression.ts` (`earLevel` auto-advance, capped L5) — feeds the Three-Axis card in `Horizons.tsx`. Generation has no true %, so it renders discrete milestone dots, not a bar. `earLevel` now advances in `sessions.ts` (was a dead axis).


<!-- DOC-INDEX:START (auto-generated by astra-doc-index.py; do not hand-edit) -->
## Reference docs (read on demand, not hot-loaded)

These docs live in the repo. Read the relevant one before working on its area; they are pointers, not loaded into context. Regenerate this list with `astra-doc-index.py <repo>`.

- `docs/BUILD-V2.md` -- V2 Build — Gamification + Guitar-Native Loop
- `docs/BUILD-V3.md` -- V3 Build — Motor-Learning Actionables (R1-R10)
- `docs/BUILD-V4.md` -- V4 Build — Soul-First Learning + UX/Resume Fixes
- `docs/BUILD-V5.md` -- V5 Build — Real Content + Guidance (the "fuel for the machine" build)
- `docs/BUILD.md` -- HISTORICAL (2026-06-07 multi-instrument build tracker). Superseded by BUILD-V2 → V5 and docs/research/curriculum-audit-
- `docs/exec-plans/active/plan-neon-clerk-cloud-sync.md` -- Plan: Opt-in Cloud Sync (Clerk auth + Neon Postgres)
- `docs/exec-plans/completed/curriculum-batch-1.md` -- Exec Plan — Curriculum Batch 1: "drills that scale toward songs + finger placement + fixes"
- `docs/exec-plans/completed/curriculum-batch-2.md` -- Exec Plan — Curriculum Batch 2 (pedagogy/motivation layer)
- `docs/exec-plans/completed/plan-curriculum-capo.md` -- Plan: Guitar Capo Module (curriculum batch-2 #8)
- `docs/exec-plans/completed/plan-v3-phase3.md` -- Plan: V3 Phase 3 (P3a + P3b) — motor-learning surfacing + framing
- `docs/exec-plans/completed/progress-three-axis.md` -- Exec Plan — Three-Axis Progress (make progression OBVIOUS)
- `docs/research/audit.md` -- Codebase Audit — pre-multi-instrument (2026-06-07)
- `docs/research/curriculum-audit-2026-06-17.md` -- Curriculum Audit, Answers, Corrections, Plan (2026-06-17)
- `docs/research/design.md` -- Warm Studio — Design Spec
- `docs/research/guitar.md` -- Electric Guitar Curriculum — Research Report
- `docs/research/libs.md` -- Library Selection — Research & Recommendation
- `docs/research/motor-learning.md` -- Motor Learning Science for Instrument Practice Apps
- `docs/research/piano-scale-fingerings.md` -- Piano Scale Fingerings — Verified Reference
- `docs/research/plan.md` -- Piano → Multi-Instrument Practice Studio — Master Build Plan
- `docs/research/progress-axes-grounding.md` -- Progress Three-Axis, Grounding Reports
- `docs/research/soul-first-learning.md` -- Soul-First Learning — Execution-Ready Build Spec
<!-- DOC-INDEX:END -->
