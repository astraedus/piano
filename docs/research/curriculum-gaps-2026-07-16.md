# Curriculum Gaps — Batch-3 Backlog (audit 2026-07-16)

*Two independent pedagogue audits (piano + electric guitar) against the shipped DAG (piano 20 nodes, guitar 29). Prior-audit items (curriculum-audit-2026-06-17.md) excluded — nothing here duplicates batch 2. Verdict from both: the lessons that exist are teacher-grade; the gaps are whole domains never built. Ranked for a pop/rock-leaning adult self-learner.*

*Framing (Anti, 2026-07-16): the app teaches **fundamentals** — good fundamentals carry a learner very far — in **plain language, open to anyone**. Every gap below IS a missing fundamental (pedal, rhythm, inversions, fretboard names, amp basics), not a novelty add. Authoring bar for every new node: zero unexplained jargon (every term gets a TermChip/glossary entry), and the WHY line must land for a total beginner reading it cold.*

## Bugs (fix now, not backlog)

- **B1. Piano prereq bug**: `p-t1-first-improv` (loops C–F–G–C) and `p-t1-three-moods` (plays C–Am–F–G) require only `p-key-C` — the F/G/Am key nodes are siblings, not prereqs. A learner can legally reach them having been taught only C major, then face three cold chords. Fix: add `p-key-F` + `p-key-G` (and `p-key-am` for three-moods) as prereqs, or simplify the drills to C-only material.

## Piano — ranked

| # | Gap | Why it matters | Slots after | Effort |
|---|---|---|---|---|
| P1 | **Sustain pedal** (legato/syncopated pedaling: press *after* the note, change *on* the chord) | Entirely untaught, yet 3 chain drills instruct "pedal heavy"; every ballad in the song list sounds wrong without it. The #1 "why doesn't mine sound like the recording" hole. Glossary term exists, node never built. | `p-t2-chord-under-melody` | M |
| P2 | **Chord inversions / voice leading** | Only root-position triads taught; the pop-formula lesson's "only one finger moves Am→F" is only true WITH inversions. THE skill that makes pop changes smooth. | between key nodes and `p-t2-pop-formula` | M |
| P3 | **Rhythm foundation** (counting, subdivision, steady pulse; later a comping-rhythm node) | Rhythm's only appearance is swing feel in Tier-3 blues. Guitar has rhythm nodes; piano has none. A chord in time beats a perfect chord out of time. | `p-t0-posture` (T0/1) + T2 comping node | M |
| P4 | **Left-hand accompaniment patterns** (broken chords, root-fifth, arpeggiated, octaves) | LH never evolves past static block chords — the classic month-3-6 "sounds stiff" plateau. Orphan drill `p2-dm-arpeggio` already exists to hang it on. | `p-t2-chord-under-melody` | M |
| P5 | **Hands-together + LH scale fingering** | All scale lessons are hands-separate and only RH fingering is given; the C-major fluency test *asks* for hands-together but nothing teaches it. Glossary term exists, node never built. | Tier 1→2 boundary (after first 2-3 keys) | M |
| P6 | **Keys: A major, E major, D minor** | The ~80% pop set (per our own batch-2 research) includes A/E/Dm; we teach the less song-dense F over A/E. Dm arpeggio drill already exists. | A after `p-key-G`/`p-key-D`; E after A; Dm after `p-key-F`/`p-key-am` | S each |
| P7 | **Articulation (legato vs staccato) as a controllable lever** | Three Moods teaches dynamics/timing/touch but never connected-vs-detached; pairs with pedal work. Glossary term exists. | Tier 1–2, or fold into pedal/expression track | S |
| P8 | **7th / color chords as pop color** (maj7, m7, sus4, add9) | Every Adele/Coldplay ballad leans on these; currently only jazz shells buried in Tier-3 go-deep. | `p-t2-pop-formula` | M |
| P9 | **Ear: interval + chord-quality recognition progression** | Echo spine hears melody; nothing systematizes hearing changes / major-vs-minor — the enabler for `p-t3-pop-pull`. | branch off `p-t1-echo-ear` | S-M |
| P10 | **Complete-song repertoire milestone** (perform one song end-to-end, both hands) | Songs are motivational footnotes, never a gated integration event — the biggest motivation payoff isn't a milestone. | capstone after `p-t2-chord-under-melody` + `p-t2-pop-formula` | S-M |
| P11 | **Backing-track play-along** (lock to an external pulse) | Distinct from the app metronome; the solo-learner's substitute for bandmates. | after P3 | S |
| P12 | **Transposition / number system** (moveable I-V-vi-IV) | The four-chord trick's real power; circle of fifths shows adjacency but no node teaches "move it to a new key". | after `p-t2-pop-formula` + circle of fifths | S |

**Piano ordering notes**: rhythm should be near-first, not Tier-3-only (P3). `p-t0-staff` sits ahead of making any sound — consider moving after the first keys (soul-first ordering). The Am→F transition node is right but too narrow — G→Am, C→G, F→G, D→G are equally song-blocking; generalize when touched next.

## Electric guitar — ranked

| # | Gap | Why it matters | Slots after | Effort |
|---|---|---|---|---|
| G1 | **Tone & gear: amp, gain staging, clean vs drive, pickups** (+ optional later effects node: EQ/OD/reverb/delay) | 100% absent — the layer that makes it *electric*. Pedagogically load-bearing: gain defines how palm muting/power chords sound, and too much gain masks sloppy fretting. | new node after `g-t0-posture`; effects node T2/3 | M (S if lesson-only) |
| G2 | **Fretboard note navigation: root names on low E & A strings + octave shape** | Power chords, barre chords, and capo ALL assume "play a G5 = 3rd fret low E" — never taught. Also the documented escape from the boxed-in-pentatonic plateau. | after `g-t1-power`, feeding `g-t2-barre-E` | M |
| G3 | **Noise control: muting idle strings under gain** | Electric-only problem (driven strings squeal); the difference between a clean solo and mess. Distinct from rhythmic palm muting. | Tier 2, alongside `g-t2-pent-box1` | S-M |
| G4 | **Blues note (♭5) → blues scale** | One added note on the existing Box-1 shape = the highest-ROI lead note in blues-rock. | after `g-t2-pent-box1` (or fold into `g-t3-licks`) | S |
| G5 | **Barre stepping-stone: partial-barre / Fmaj7** | Power→full-6-string-F is the #1 quit point; the mini-barre scaffold was in the original research and never shipped. | between `g-t1-openDGC`/`g-t1-power` and `g-t2-barre-E` | S |
| G6 | **Half-step + unison/held bends** | Only whole-step bends taught; half-step is more common and easier. | extend `g-t2-bend` | S |
| G7 | **Double stops / octave shapes** | Core electric rhythm-lead vocabulary (Chuck Berry/Hendrix territory); nothing between single notes and full chords. | Tier 3, after power + early lead | S-M |
| G8 | **Electric rhythm idiom: down-picked 8ths, palm-muted gallop** | The only taught strum is the folk D-DU-UDU; rock/punk drive rhythm is implied by downpick+palmmute but never taught as a skill. | Tier 1/2 rhythm node or electric variant on `g-t1-strum` | S |
| G9 | **Major scale + relation to pentatonic** | The ceiling on intermediate lead; lower priority while pentatonic carries. | after `g-t2-pent-box2` / `g-t3-fullneck` | M |
| G10 | **Metronome/backing-track lock-in as a taught habit** (+ possible in-app drone) | Drills say "put on a backing track" but the skill of locking to a groove is never taught. Feature+content hybrid. | T1/2 | M |

**Guitar ordering notes**: `g-t2-bend` is gated behind hammer-on + slide it doesn't mechanically need — re-gate on `g-t1-fretting` (+ strength) so THE electric expressive arrives sooner. Capo is prominent Tier-1 real estate while amp/gain and fretboard notes (higher-priority for electric identity) don't exist — pair or demote when G1/G2 ship.

## Suggested batch-3 cut

1. **Now (bug)**: B1 prereq fix.
2. **Batch 3a (soul-critical, ~8 nodes)**: P1 pedal, P2 inversions, P3 rhythm foundation, P4 LH patterns, G1 amp/gain, G2 fretboard notes, G3 noise control, G5 mini-barre. These close the "month-3-6 wall" (piano) and the "unplugged electric" hole (guitar).
3. **Batch 3b (breadth, mostly S)**: P5-P7, P10, G4, G6, G8 + the two re-orderings (bend gate, staff position).
4. **Later**: P8, P9, P11, P12, G7, G9, G10.

Authoring pattern: same as V5 (parallel lesson writers + per-batch fact-check, coverage asserted by lessons.test.ts); every new node needs lesson + drill + glossary links + DAG edges + tests.
