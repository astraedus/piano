# Plan: Guitar Capo Module (curriculum batch-2 #8)

## Goal
Teach the capo as a key-multiplier: a static CAGED-shape × fret → sounding-key chart, an interactive capo calculator (target key + shape → fret), and a capo indicator on ChordDiagram — surfaced behind a new `g-t1-capo` skill node after open chords.

## Capo math (verified)
- A CAGED shape's open root pitch class: C=0, A=9, G=7, E=4, D=2.
- `soundingKey(shape, fret)` → pitch class `(openPc + fret) % 12`.
- `capoFret(shape, targetKey)` → `((targetPc - openPc) % 12 + 12) % 12`.
- Worked: C-shape + capo 2 → D; G-shape + capo 3 → Bb; E-shape open (fret 0) → E; `capoFret(C, D)` = 2.

## Steps
- [x] `src/lib/guitar/capo.ts` — pure fns + `CAPO_SHAPES`, `CAPO_FRETS` (0-7), `capoChartRow`, names spelled flat-aware.
- [x] `src/lib/guitar/capo.test.ts` — pin every worked example + invariants (inverse round-trip over all shapes×frets, chart correctness).
- [x] `g-t1-capo` node in `skillNodes.ts` (tier 1, prereqs = both open-chord nodes, acyclic). New dedicated one-minute-changes-style capo chain drill so node↔drill stays 1:1.
- [x] `g-capo-chain` drill in `chainDrills.ts` (reuses the One-Minute-Changes mechanism: capo on, play shapes, count clean changes).
- [x] `ChordDiagram` — optional `capoFret` prop → labeled capo bar at that fret.
- [x] `CapoTeacher` component (chart + calculator), surfaced in `LessonMedia` for the capo node.
- [x] Glossary entry "capo" + `nodeToTermId` mapping.
- [x] Bump `GUITAR_NODES.length` test 28→29; update module.test count comment.

## Decisions made
- New dedicated capo chain drill rather than sharing an existing drill id: `endSession`'s ceiling-bump uses `nodes.find(n => n.chainDrillId === id)` (first match), so a shared id would mis-attribute. A new id keeps node↔drill 1:1 while reusing the One-Minute-Changes drill *shape*.
- No unlock card: the integrity test requires unlockCardId nodes to carry a chainDrillId; capo is a quiet capability node, no celebration needed (keeps it additive/low-risk).
- Calculator/chart live in a dedicated component rendered by LessonMedia (priority branch on node id) so the existing one-visual-per-lesson contract is preserved and the interactive surface is testable in isolation.
