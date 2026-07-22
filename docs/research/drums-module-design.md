# Drums Module — Design Doc (v1, practice-pad only)

*2026-07-17. Owner constraint (Anti): he owns ONLY a practice pad — no kit, no pedals. v1 is pad-first hands fundamentals; kit translation is a later horizon. "We don't need too much — the super-fundamentals are what matter."*

*Research inputs (all in `docs/research/drums/`): `roadmap.json` (teaching order + why), `rudiments.json` (11 selected rudiments with stickings/tempos/pitfalls + explicit skips), `technique.json` (grip/rebound/stroke cues + mistake self-diagnosis), `reading.json` (counting pedagogy; letter+count grid over staff notation for v1), `motivation.json` (pad-practice motivation levers), `repo-contract.json` (full integration contract + key-centricity leaks + risks). Read them before authoring content — lessons must cite-check against them.*

## Product framing

Drums on a pad = the purest version of this app's soul: tiny nightly sessions, one focus, honest BPM-ladder progress. The chain-drill BPM ladder (`bestBpm`) IS rudiment pedagogy — every rudiment has a "you own it" tempo. Focus of the week = **Rudiment of the Week**.

## Architecture decisions (grounded in repo-contract.json)

1. **Do NOT widen `KeyId`.** It's a closed 24-member union backed by exhaustive `KEY_META`; fabricated members throw at render. Follow guitar's precedent: drums' `ghostRotation` reuses existing KeyId values as **opaque rotation tokens**, and `module.focusLabel(token)` maps them to rudiment names. The token→rudiment map lives in ONE place in `lib/drums/focus.ts` (e.g. `C→singles, G→doubles, D→accents, A→paradiddle, E→five-stroke, F→flam, B→drag, am→buzz`). Drills' `ghostKey` uses the matching token. Tokens are never shown raw to users.
2. **Widen `focusKind` to `"key" | "chord" | "rudiment"`** and convert its two ternary consumers (`PracticeStand.tsx:392`, `WarmupSlot.warmupReferenceLabel`) to explicit switches. A module is **non-tonal** iff `focusKind === "rudiment"` (derive; no separate flag).
3. **Gate every tonal UI block on tonality** (these currently render unconditionally): WarmupSlot's scale/fingering/Hear-the-Scale block, ChainDrillSlot's I-IV-V-I progression + pentatonic "Hear it" previews, GhostPicker + settings' 24-key override grid (scope to the active module's own rotation values, labeled via `focusLabel`), Horizons' hardcoded `"Key · " + KEY_META[...]` cards (use `module.focusLabel` + focusKind-aware eyebrow — this also fixes guitar's latent mislabel bug).
4. **Drums MUST ship its own `earRounds` generator** — the shared fallback serves pitched piano content (the bug class we just fixed). Also add a class-level test: any registered non-tonal module must define `earRounds` + `earLevelGates`.
5. **Audio: add a small percussion layer to `lib/audio.ts`** (currently 100% pitched SPN). Tone.js `MembraneSynth`/`NoiseSynth`: `playSticking(pattern, bpm)` where pattern = `{hand: "R"|"L", accent?: boolean}[]` at a subdivision — pan R slightly right / L slightly left, accent = velocity. Powers lesson "Hear it" (hear the rudiment at tempo!) and ear rounds.
6. **Visuals** (the module's two injected components):
   - `InstrumentVisual` = **PadVisual**: clean SVG practice pad (pad disc + two sticks), can highlight R/L. Ignores tonal props (`scaleKey` etc.).
   - `NotationVisual` = **RhythmGrid**: the research-endorsed v1 representation — count row (`1 e & a…`) + sticking row (R/L letters) + accent marks (`>`), rests as `–`. Carry pattern data via the deliberately-loose `tab?: TabData` field (`{[key:string]: unknown}`) rather than widening the notation contract. No staff notation in v1 (reading.json: letter+count grid is honest and sufficient; staff can come with the kit horizon).
   - `progressMapKind`: widen union with `"rudiments"`; /tree renders a **RudimentLadder** — each learned rudiment with its best BPM from the drill ladder. v1 = simple card list, not a graph.
7. **`transitionDrill.ts` prefix ternary** (`piano ? "p" : "g"`) → explicit `Record<Instrument, prefix>` map with `"d"` (recon flagged silent collision bug).
8. **`LessonMedia.InstrumentDefault`**: replace the 2-way branch with an explicit switch; drums default = PadVisual.
9. **Theming**: `data-instrument="drums"` accent ramp in `globals.css` — a warm **bronze/brass** family (drum hardware), light-first + dark variant, chosen against Warm Studio tokens (piano amber / guitar crimson / drums bronze).
10. **No storage migration needed** (recon-verified): `AppState.instrument` is already generic; `"piano"` appears only as a safe default. Onboarding gains a drums card + experience mapping (incl. `earLevelFloor`).
11. **contentAudit for drums** (mirror guitar's): forbid tonal/other-instrument terms in drums content: `chord`, `fret`, `strum`, `keyboard`, `pedal`, `melody`, `octave`, `left hand`/`right hand` is ALLOWED for drums (hands are the instrument) — forbid instead `treble`, `clef`, `scale` (the tonal sense; drums copy says "pattern"/"sticking").
12. **Bundled fix**: `src/app/print/page.tsx` renders warmup lines raw (no `fillWarmupLine`) — `{fiveFinger}`-style placeholders leak on paper. Route the print path through the same fill/render used on the stand (text-only there is fine — no chips on paper).

## Curriculum DAG (~16 nodes, from roadmap.json + rudiments.json)

**Tier 0 — foundations (sound before anything):**
| id | title | prereqs | core |
|---|---|---|---|
| d-t0-setup | Hold the Sticks | — | posture, pad height, matched grip, fulcrum ("OK-sign" ⅓ up the stick, loose finger cage) |
| d-t0-rebound | Let the Stick Bounce | d-t0-setup | rebound discovery — gravity does the work; the pad's consistent bounce is the teacher |
| d-t0-strokes | The Four Strokes | d-t0-rebound | full / down / tap / up — the dynamic vocabulary under everything |
| d-t0-click | Make Friends with the Click | d-t0-rebound | metronome ~60-80, one hand, quarters; drop out + re-enter on 1 |

**Tier 1:**
| d-t1-singles | Single Stroke Roll | d-t0-strokes, d-t0-click | RLRL; hands indistinguishable, 60→120 |
| d-t1-counting | Count It Out Loud | d-t0-click | quarters + 8ths with "1 & 2 &", each value paired with its rest; read the RhythmGrid |
| d-t1-doubles | Double Stroke Roll | d-t1-singles | RRLL via slow controlled half-stroke bounce (Stick Control p.5 style); both strokes even |
| d-t1-accents | Accents & Taps | d-t1-singles, d-t0-strokes | accent relocatable to any beat without taps changing volume |

**Tier 2:**
| d-t2-16ths | Sixteenths | d-t1-counting, d-t1-singles | "1-e-&-a" reading + playing at 70-90 |
| d-t2-paradiddle | Single Paradiddle | d-t1-doubles, d-t2-16ths | RLRR LRLL; even tone through the lead switch |
| d-t2-flam | The Flam | d-t1-accents | grace-note spacing; not two hits, one thick note |
| d-t2-five-stroke | Five Stroke Roll | d-t1-doubles, d-t1-accents | RRLLR/LLRRL, clean not buzzed, accented ends |
| d-t2-play-along | Play Along on the Pad | d-t2-16ths, d-t1-accents | play sticking patterns over real songs (motivation.json: the retention lever); the capstone-flavored fun node |

**Tier 3:**
| d-t3-drag | The Drag (Ruff) | d-t2-flam, d-t1-doubles | double grace notes into a tap |
| d-t3-paradiddle-family | Paradiddle Family | d-t2-paradiddle | double paradiddle + paradiddle-diddle (flam accent/flam tap live here as steps if they fit, else skip per rudiments.json) |
| d-t3-moeller | The Whip Stroke (Moeller) | d-t1-accents, d-t2-five-stroke | the four strokes chained into one whip; deliberately late per roadmap.json |
| d-t3-speed | Open–Close–Open | d-t2-paradiddle, d-t1-doubles | accelerando/decelerando speed building on singles/doubles/paradiddle |
| d-t3-buzz | Buzz Roll | d-t1-doubles | multiple-bounce/press roll |

(18 listed; builder may trim to ≥15 by folding d-t3-buzz or the paradiddle-family extras if content depth suffers. Every node: lesson (what/why/steps/goodWhen/watchOut/song) + chain drill with BPM ladder + unlock card + glossary links. `song` field for drums = a real song whose groove/subdivision the skill maps to (e.g. singles at 16ths → "Fifty Ways to Leave Your Lover" verse pattern feel) — motivation.json has candidates.)

**Rudiment of the Week rotation:** phase1: singles, doubles, accents (tokens C, G, D). phase2+: adds paradiddle, five-stroke, flam, drag, buzz (A, E, F, B, am).

**Warmups (pad, 2-4 min):** e.g. "8 on a hand" (8R 8L slow, full strokes), "rebound check" (drop + catch bounce, both hands), "this week's rudiment, slow, leading left". No tonal placeholders.

## Ear rounds (rhythm dictation) + gates

| Level | Round | Gate (nodes learned) |
|---|---|---|
| L1 | "How is it divided?" — hear 1 bar, choose quarters / 8ths / 16ths | d-t1-counting |
| L2 | "Which pattern?" — 2 choices as count-grids (8ths + rests) | d-t1-counting |
| L3 | "Which pattern?" — 3 choices, 16th patterns | d-t2-16ths |
| L4 | "Where's the accent?" | d-t1-accents |
| L5 | "Which rudiment?" — singles vs doubles vs paradiddle by ear | d-t2-paradiddle |

## Build plan (two stages, sequential)

**Stage A — spine + foundation** (senior-dev): decisions 1-12 above + drums module skeleton with the four Tier-0 nodes fully wired end-to-end (lessons, drills, warmups, unlocks, ear L1-L2, gates, onboarding card, theming, PadVisual + RhythmGrid, percussion audio, contentAudit-drums + module tests). Ship = a real, playable drums practice loop with 4 nodes.

**Stage B — curriculum fill** (senior-dev, after A merges): Tiers 1-3 content (~14 nodes) + glossary batch (fulcrum, rebound, stroke types, rudiment, each rudiment, subdivision, flam/drag/buzz, Moeller) + rotation completion + ear L3-L5 + RudimentLadder polish. Follows the proven batch-3b authoring pattern.

## 2026-07-22 — curriculum audit v1.1

A curriculum audit (owner learning drums from zero, pad-only) found the fundamentals well covered except four gaps. All closed in one lane; node count 18 → 20.

**1. Triplets — the used-but-untaught hole (`d-t2-triplets`, tier 2, rhythm).** The DAG *described* triplets it never *taught*: `d-t3-moeller`'s drill is "a clean triplet" (accent-tap-tap), and `d-t3-paradiddle-family` promises "triplet fills / shuffle feels / 6/8 grooves" — yet nothing taught splitting a beat into three. New node teaches "1-trip-let" counting, the rounder/rolling feel vs straight notes, and the doorway to shuffle + 6/8. Drill = single-stroke triplets to the click, 60–90 BPM, counting out loud; with alternating sticking the lead hand naturally swaps each beat (taught as a feature, not a bug). Song: *Hold the Line — Toto* (wall-to-wall triplet groove). Prereqs `d-t1-counting` + `d-t1-singles`. To make the DAG honest, `d-t2-triplets` was added to the prereqs of BOTH `d-t3-paradiddle-family` (six-note groups = two triplets) and `d-t3-moeller` (its drill IS an accent-tap-tap triplet). `d-t2-play-along` deliberately left ungated (don't gate the fun node).

- **Triplet audio decision:** `lib/audio.ts playSticking` is already subdivision-agnostic — it evenly spaces N cells at the given pulse rate and assumes nothing about duple vs triple. So a triplet is honestly represented as **3 cells per beat** (`TRIPLET_BAR`, counts "1 trip let 2 trip let…"), never faked on a 4-cell sixteenth grid; three evenly-spaced cells sound as true triplets with ZERO audio change, and the accent on each main beat makes the "1-trip-let" grouping audible even at the slow "Hear it" tempo. No `playSticking` modification was needed or made.
- **Future L-level:** triplet *ear-round dictation* ("quarters / eighths / triplets / sixteenths" as a division choice, or a triplet-vs-straight discrimination) is a natural next ear round but was intentionally deferred — the current L1 division round only offers quarter/eighth/sixteenth.

**2. Syncopation restored (`d-t2-offbeats`, "Offbeats & Syncopation", tier 2, rhythm).** Research `roadmap.json` stage 15 names syncopated playing as the pad-only ceiling; the v1 DAG dropped it entirely — one of the most musical/fun skills at this level. Teaches: the "&"s are the offbeats; syncopation = hits/accents where the beat ISN'T, resting where it IS; the click holds the beat while you play against it. Drill = eighth-note line resting on the beats and hitting the "&"s (`OFFBEAT_BAR`), then moving a single accent onto a chosen offbeat. Song: *Come Together — The Beatles*. Prereqs `d-t1-counting` + `d-t1-accents`. The glossary already had a (guitar) `syncopation` entry; the prose is written so the auto-linker chips it (no duplicate drums entry — would violate the no-shadow glossary invariant).

**3. Glossary batch — words that were untappable in existing prose.** Added `triplet`, `backbeat`, `ghost-note`, `grace-note`, `click` (the metronome sense). "backbeat" already appeared in flam/accents/play-along, "grace note" in flam/drag, "ghost notes" in doubles' why — all previously non-tappable. Also wove the NAME "ghost notes" into the `d-t1-accents` lesson (the quiet taps around an accent) so the concept gets its word where the mechanic is taught. All five are percussion (text SEE, `playSticking` "hear") and locked into the drums glossary contract test.

**4. "Go deeper" external resources layer.** The owner explicitly asked for links to high-quality outside resources. `NodeLesson.resources?: {name,url,note}[]` (instrument-agnostic; only drums populates it now), rendered by `components/LessonResources.tsx` as a quiet "Go deeper" footer in BOTH lesson surfaces (`PathView` + `SkillGraphPanel`) — external links, `target="_blank" rel="noopener noreferrer"`. Populated on six nodes (strokes → Vic Firth 40 Rudiments; singles → PAS rudiments; doubles → Stick Control walkthrough; paradiddle → Drumeo rudiments; moeller → Chapin Moeller exercises; play-along → Drumeo Beat). Every URL verified live 2026-07-22; the exact node set + URL shape are locked in `resources.test.ts` as a class invariant.
