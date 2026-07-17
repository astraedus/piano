# Exec Plan — DRUMS module, Stage B (curriculum fill: Tiers 1-3)

Plan of record: `docs/research/drums-module-design.md` (DAG table, rotation, ear-gate table).
Backing musical facts: `docs/research/drums/*.json` (stickings/tempos cite-checked; no invented facts).
Follows Stage A's authoring pattern (fabc293). Voice: zero unexplained jargon; WHY lands cold.

## DAG (design doc, verbatim) — 14 new nodes, all `phase: 1` (see note)

Tier 1: d-t1-singles [strokes,click], d-t1-counting [click], d-t1-doubles [singles], d-t1-accents [singles,strokes]
Tier 2: d-t2-16ths [counting,singles], d-t2-paradiddle [doubles,16ths], d-t2-flam [accents],
        d-t2-five-stroke [doubles,accents], d-t2-play-along [16ths,accents]
Tier 3: d-t3-drag [flam,doubles], d-t3-paradiddle-family [paradiddle], d-t3-moeller [accents,five-stroke],
        d-t3-speed [paradiddle,doubles], d-t3-buzz [doubles]

**Why every drill is `phase: 1`:** drums onboarding only offers phase 1 and NOTHING advances `state.phase`
after onboarding (verified — phase is read-only post-onboard). A drill with `phase > 1` is therefore
unreachable for drums. The DAG (prereqs) is the real sequencing gate; `pickChainDrill`'s
`filterDrillsByNodeUnlocked` hides a drill until its node's prereqs are learned. (Guitar uses phase-tiers
because guitar onboarding offers phases 2/3 — drums cannot.)

## Increments (commit per chunk)

1. **Curriculum fill** — skillNodes (14) + lessons (14) + chainDrills (14) + unlocks (14). Chain-drill
   ghostKey = the node's rudiment token where it maps to one (singles→C, doubles→G, accents→D,
   paradiddle→A, five-stroke→E, flam→F, drag→B, buzz→am); non-rudiment drills reuse the closest token
   (counting/16ths/speed→C, play-along/moeller→D, paradiddle-family→A). BPM ladders from rudiments.json
   "you own it" tempos. Rudiment drills reuse `drumsFocusFor(token).pattern` (ONE sticking source, no dupes).
   Update module.test (4→18 nodes, tier distribution), todayPlan.integration + focus tests
   (rotation-aware). contentAudit auto-covers new prose.
2. **Rotation completion** — DRUMS_GHOST_ROTATION phase1 = [C,G,D]; phase2+ = [C,G,D,A,E,F,B,am].
3. **Ear rounds L3-L5** — L3 "Which pattern?" 3× 16th grids (gate d-t2-16ths); L4 "Where's the accent?"
   (gate d-t1-accents); L5 "Which rudiment?" singles/doubles/paradiddle by ear (gate d-t2-paradiddle).
   Re-point L2 gate d-t0-click → d-t1-counting. Extend earRounds.test.
4. **Glossary batch** — add single-stroke-roll, double-stroke-roll, sixteenth-notes, accent (universal
   wording, text SEE), paradiddle, flam, drag, five-stroke-roll, buzz-roll, moeller. (subdivision already
   exists; free stroke already aliased on `rebound`.) Extend drums/glossary.test REQUIRED_TERMS.
5. **RudimentLadder polish** — mark the next-to-learn frontier node(s) so 18 nodes read as an honest map.

## Deviations from the design doc (all documented in final report)
- Song field: authored on 6 nodes where a famous, verifiable groove connection exists (singles/counting/
  16ths/accents/paradiddle/play-along); omitted (it's optional) where a specific-song claim would be a
  fabrication. Cite-check constraint is about stickings/tempos (honored); no invented song facts.
- All drills `phase: 1` (see note above) — deliberate, not a design-doc violation.

## Gate
`npx tsc --noEmit && npm run test:run && npm run build` (trust tsc, not editor diagnostics).
