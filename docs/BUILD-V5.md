# V5 Build — Real Content + Guidance (the "fuel for the machine" build)

## The problem (Anti, 2026-06-08)
The app is a beautiful engine with no fuel. Clicking a skill node shows a one-line
drill string and ZERO teaching ("Name all 6 open strings, tune from scratch <90s"
but never tells you what the strings are or how to tune). The stand says "warm up /
do whatever". There is no curriculum spine, no "you are here, do this next". Setup
and Orientation nodes are empty shells. The user wants to "drop in and basically
autonomous robot mode my way to improved technique and skill to play the songs I
want to play". Frontend is great; CONTENT and GUIDANCE are missing.

## The fix
1. **Teaching-content layer** — every node gets a real `NodeLesson` (what / why /
   numbered how-to steps / what-good-looks-like / watch-out / a real song). Stored
   as plain-data Records in `lib/<instrument>/lessons.ts`, looked up via
   `lib/lessons.ts#getLesson`. Renderer auto-chips glossary terms.
2. **Surface it** — node panel renders the full lesson; the practice stand leads
   each slot with concrete "do this, here's how, here's why" from the lesson.
3. **Curriculum / Path spine** — a "Your Path" view: ordered, tier-grouped walk of
   the DAG with a "you are here" marker and a clear next-up, framed toward playing
   real songs. The autonomous-robot-mode spine.
4. **Setup & Orientation = real, reachable lessons** — the t0 nodes get full
   lessons and a clear "Start Here" entry so a true beginner is never lost.

## Data model (locked, P-A done on main)
`types.ts`: `LessonStep { do, feel? }`, `NodeLesson { what, why, steps[], goodWhen,
watchOut?, song? }` — all plain strings (JSON-serializable so content is generated
+ fact-checked as DATA). `lib/lessons.ts`: `getLesson(instrument,nodeId)`,
`hasLesson`, `lessonNodeIds`. Gold-standard examples shipped: guitar `g-t0-anatomy`,
`g-t1-power`; piano `p-key-C`. These define the quality bar.

## Phases
| Phase | What | How | Status |
|-------|------|-----|--------|
| P-A Foundation | `NodeLesson` types + `lessons.ts` registry + gold-standard examples | main, inline | ✅ |
| P-B Content | Author `NodeLesson` for all 27 guitar + 21 piano nodes | **Workflow** (parallel writers + fact-check verify), orchestrator assembles into the two `lessons.ts` files | ⬜ |
| P-C Panel | `SkillGraphPanel` renders the full lesson (what/why/steps/goodWhen/watchOut/song, auto-chipped) + tests | worktree dev agent | ⬜ |
| P-D Path view | "Your Path" curriculum surface (ordered DAG walk, you-are-here, next-up, song-framed) + Tree tab + "Start Here" setup entry | worktree dev agent | ⬜ |
| P-E Stand | Warmup/chain slots lead with lesson guidance; route unlearned-foundation users into Setup first; kill generic "do whatever" framing | worktree dev agent | ⬜ |
| P-F Gate+ship | Assemble content, merge worktrees sequentially, full gate, deploy, live QA | main | ⬜ |

Content is DATA-only (two files) so the Workflow never collides with the UI
worktrees. UI agents build/test against the gold-standard examples before full
content lands (getLesson is the only contract). Scoped tests per agent; orchestrator
shoots screenshots once at merge (LESSONS 2026-06-08).

## After (separate experiment, own worktree, timeboxed)
Try **Neon** (Postgres) + **Clerk** (auth): research, make accounts, install official
CLIs, wire a minimal optional cloud-sync of practice state behind Clerk auth with
Neon as the store. Exploratory — this is a single-user localStorage app, so cloud
sync is a genuine "try the tools" experiment, not a need. Honest framing required.
