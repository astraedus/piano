# Exec Plan — Curriculum Batch 3b (PIANO half)

Audit source: `docs/research/curriculum-gaps-2026-07-16.md`. Piano-side only
(`src/lib/piano/*` + shared files a piano node forces). Guitar half is a parallel
agent — do not touch `src/lib/guitar/*`.

## Nodes (6 new) + 1 reorder + wiring

| # | id | tier | cat | prereqs | drill | glossary |
|---|----|------|-----|---------|-------|----------|
| P5 | `p-t2-hands-together` | 2 | technique | p-key-C, p-key-G | new `p2-hands-together` (ph2, ghost C) | new `hands-together` |
| P6-A | `p-key-A` | 2 | scales (keyId A) | p-key-G, p-key-D | new `p2-a-major` (ph2, ghost A) | — (like p-key-D) |
| P6-E | `p-key-E` | 2 | scales (keyId E) | p-key-A | new `p2-e-major` (ph2, ghost E) | — |
| P6-Dm | `p-key-dm` | 2 | scales (keyId dm) | p-key-F, p-key-am | EXISTING `p2-dm-arpeggio` (ph2, ghost dm) | — |
| P7 | `p-t1-articulation` | 1 | expression | p-key-C | new `p1-articulation` (ph1, ghost C) | new `articulation`,`legato`,`staccato` |
| P10 | `p-t2-first-song` | 2 | repertoire | p-t2-chord-under-melody, p-t2-pop-formula | new `p2-first-song` (ph2, ghost C) | — (unlockCard u-p2-first-song) |

Reorder: `p-t0-staff` prereqs `[p-t0-keyboard-map]` → `[p-key-C]`, tier 0 → 1
(soul-first: sound before notation). NO node lists p-t0-staff as a prereq
(verified), so no downstream rewire. Id kept ("p-t0-staff") to preserve
NODE_TERM_IDS / test references / persisted progress keys.

## Decisions / fact-checks
- Fingerings (from `lib/piano/fingerings.ts`, verified): A/E/dm all use RH
  `1 2 3 1 2 3 4 5`, LH `5 4 3 2 1 3 2 1` (thumb-under after 3rd note RH; 3rd
  finger crosses over the thumb after the 5th note LH). Scale spellings from
  KEY_META: A major = 3 sharps (F#,C#,G#); E major = 4 sharps (F#,C#,G#,D#);
  D natural minor = 1 flat (Bb), relative of F major.
- Dm drill: hang the EXISTING orphan `p2-dm-arpeggio` (phase 2, ghost dm — aligns
  with the tier-2 node and IS a valid D-minor key chain: scale/triad/i-iv-V/improv/
  song). Its i-iv-V (Dm-Gm-A) is taught in the lesson mirroring p-key-am's i-iv-V-i
  (the A-major V chord resolves home, exactly parallel to E resolving to Am). The
  OTHER orphan `p1-d-minor-chain` ("D minor dusk", phase 1) stays orphan — still
  surfaces via the phase-1 dm ghost-week rotation.
- `legato` currently lives ONLY as a guitar `hammer-on` alias — a piano lesson
  saying "legato" would chip to the wrong (guitar) explainer. Fix: give `legato`
  its own instrument-neutral entry + remove the alias from `hammer-on`. No-shadow
  test forbids the duplicate, so the removal is mandatory, not optional.
- Key nodes A/E/dm get NO dedicated glossary entry (consistent with p-key-D/F/em;
  NODE_TERM_IDS intentionally omits key nodes without a 1:1 term).
- P10 is song-agnostic (learner picks any suggested/own song); zero coupling to
  `progressionSongs.ts` (the still-unapproved catalog).

## Tests
- Extend `module.test.ts`: (a) new NODE_TERM_IDS mappings resolve; already covered
  by glossary.test NODE_IDS_WITH_TERMS — add the two new ids there. (b) drill
  ghostKey-in-rotation guard already exists (covers new drills).
- Extend `glossary.test.ts`: add `hands-together`, `articulation`, `legato`,
  `staccato` to a "batch-3b terms exist" invariant + the two new node→term ids.
- Gate: `npx tsc --noEmit && npm run test:run && npm run build`.
