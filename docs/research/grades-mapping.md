# Grades Mapping — Syllabus Requirements → Our Curriculum DAG

*Research for a "grades" feature on the piano+guitar practice app (repo `~/Projects/piano`). Goal: let the app honestly say "your technical work is at ~Grade N" — and now, per Anti's scope expansion, "your ear/aural work is at ~Grade N" and "your musicianship is at ~Grade N" separately — using data it already tracks (`SkillProgress.status`, `.maxBpm`/`.bpmReached`, `.bestChanges`, `.fluent`, `earLevel`). This is NOT "prep the user to sit an exam" — it's borrowing an externally-validated, internationally-recognised sequencing of difficulty as an honest yardstick, across ALL the axes the syllabuses actually test: technique, ear, and musicianship/improvisation — not just scales.*

*Sources: Trinity College London (the named "structural backbone" per `~/Shared/Piano/The Progression — Skill Tree.md`) for piano, cross-checked against ABRSM; RSL/Rockschool (the electric-guitar-specific board) for guitar, cross-checked against Trinity Rock & Pop Guitar. Repertoire/song lists are NOT reproduced — only technical/aural/session-skill requirements (facts, not copyrightable content).*

*§5 is a consolidated appendix pulling the aural/ear/session-skills data already sourced in §1.2, §1.3, §1.5, and §1.7 into one cross-board, per-grade view, plus the ear-system alignment and Tone.js-implementability findings from §2.4 — built for anyone who wants the "what does the app hear/test" picture without reading all four sub-sections.*

---

## 1. Grade requirement tables

### 1.1 Piano — Trinity College London (2021–2023 syllabus): TECHNICAL WORK (scales & arpeggios)

Source: `~/Shared/Piano/Piano Syllabus 2021-2023 Trinity.pdf` (98pp, read directly), cross-checked against `~/Shared/Piano/The Progression — Skill Tree.md` §3.

**Exam structure (every grade):** 3 pieces + Technical Work (scales/arpeggios + 3 exercises) + Supporting Tests — Initial through Grade 5 the candidate picks **2 of 4**: Sight Reading, Aural, Improvisation, Musical Knowledge; Grade 6–8 the structure fixes to **Sight Reading (mandatory) + (Aural OR Improvisation)**, i.e. Musical Knowledge drops out and the choice narrows.

#### Detail: Initial → Grade 5

| Grade | Scales required | Scale spec | Arpeggios required | Arpeggio spec | What this grade means |
|---|---|---|---|---|---|
| **Initial** | C major; A minor (candidate's choice harmonic/melodic/natural) | 1 octave, hands **separately**, ♩=60, *mf*, legato. Broken triads in C maj/A min, same tempo | — (broken triads only) | — | Find any note fast, one scale per hand alone, hold a simple chord. ~40h total. |
| **Grade 1** | F and G major; D and E minor | 1 octave, hands **separately**, ♩=70, *mf*, legato. Plus chromatic (contrary motion from D) and C major contrary-motion, hands together | F and G major; D and E minor | 1 octave, hands separately, ♩.=50 (broken chords) | Two more keys, a bit faster, hands can move in contrary motion together. ~60h cumulative. |
| **Grade 2** | Bb and D major; G and B minor | 2 octaves, hands **TOGETHER**, ♩=80, *f* or *p*, legato. Plus chromatic (similar motion from Bb), C major contrary-motion | Bb and D major; G and B minor | 2 octaves, hands separately, ♩=60, *mf*, legato | **Hands-together is the headline new skill** — everything before was hands-separate. ~90h cumulative. |
| **Grade 3** | Eb and A major; C and F# minor | 2 octaves, hands together, ♩=90, *f* or *p*, legato. Plus Eb contrary-motion, chromatic similar-motion from F# | Eb and A major; C and F# minor | 2 octaves, hands separately, ♩=70, *mf*, legato | Faster hands-together; *f*/*p* choice enters technical (not just musical) work. Pedal introduced this grade. ~120h. |
| **Grade 4** | Ab and E major; F and C# minor | 2 octaves, hands together, ♩=100, *f* or *p*, **legato OR staccato**. Plus E contrary-motion, chromatic similar-motion from B, chromatic contrary-motion (1 oct) from Ab | Ab and E major; F and C# minor | 2 octaves, hands separately, ♩=80, *f* or *p*, legato | Staccato joins legato as a required articulation choice on the scale itself. Modulation + full interval-naming enter musical knowledge. ~150h. |
| **Grade 5** | Db and B major; Bb and G# minor. Plus G harmonic-minor contrary-motion | 2 octaves, hands together, ♩=110, *f* or *p*, legato or staccato. Chromatic similar-motion from Db, contrary-motion (LH from C, RH from E) | Db and B major; Bb and G# minor. Plus diminished 7th from B | 2 octaves, **hands together** (arpeggios catch up), ♩=90, *f* or *p*, legato or staccato | Arpeggios go hands-together too. Last "Initial–5" scale-book grade. 6/8 time, expressive pedalling arrive. ~180h. |

#### Summary: Grade 6 → 8

| Grade | Scales | Arpeggios | Notes |
|---|---|---|---|
| **Grade 6** | Bb and D major; Bb and D minor. Chromatic (Bb, D similar-motion; Eb contrary). C major in 3rds (1 oct, HS, ♩=60) | Bb/D major, Bb/D minor, dim 7ths (Bb,D), dom 7ths (Bb,D) | **4 octaves, hands together, ♩=120** (scales) / ♩=100 (arpeggios), *f/mf/p*. Counterpoint, ornaments, complex pedalling. |
| **Grade 7** | Ab and E major; G# and E minor. E major in 3rds (2 oct HS ♩=70). Chromatic minor-3rd-apart | Ab/E major, G#/E minor, dim/dom 7ths | 4 octaves, ♩=130 (scales) / ♩=110 (arpeggios), explicit crescendo/diminuendo (*p→f→p*). Modulates within a piece; ii–V–I fluency. |
| **Grade 8** | F#, Eb, B major; F#, Eb, B minor. B major in 3rds, C harmonic-minor in 3rds (2 oct HS ♩=80) | F#/Eb/B major/minor, dim/dom 7ths | 4 octaves, ♩=140 (scales) / ♩=120 (arpeggios). Top of Trinity's graded system before diploma tiers (ATCL/LTCL/FTCL). |

**Illustrative repertoire (context only — not exhaustive):** pieces like Beethoven's arrangement of a Russian folk song and Diabelli's Bagatelle at Grade 1; Bartók's "Children at Play" and a Petzold Minuet in G minor at Grade 2; Bach two-part-invention-level pieces by Grade 6. Full lists are copyrighted publisher content, in the Trinity PDF — not reproduced further.

### 1.2 Piano — Trinity College London: AURAL TESTS + IMPROVISATION (the supporting tests)

**This is the section Anti's scope expansion is really about** — the syllabus doesn't just gate scales, it gates *listening* and *making something up*, and those map far more directly onto our app's actual ear/expression system than the scale ladder does.

#### 1.2.1 Aural test — full progression, Initial → 8 (read directly from the source PDF)

Every grade's Aural test starts with the SAME first task shape — **clap the pulse, stressing the strong beat** — across every single grade, Initial through 8. This is the single most universal aural task in the whole syllabus and it is currently **absent from our app entirely** (see §2.4).

| Grade | Source | Length | Key | Tasks (in order presented) |
|---|---|---|---|---|
| **Initial** | Melody only | 4 bars | Major only | Clap pulse (3 plays) → ID dynamic as *forte*/*piano* → ID articulation legato/staccato → ID highest/lowest of first 3 notes |
| **Grade 1** | Melody only | 4 bars | Major only | Clap pulse (3 plays) → ID dynamic + articulation together → ID last note higher/lower than first (2 bars) → **spot rhythm-or-pitch change** between two playings |
| **Grade 2** | Melody only | 4 bars | Major **or minor** (minor introduced) | Clap pulse (3 plays) → describe *varying* dynamics + articulation → ID last note higher/lower → spot rhythm-or-pitch change |
| **Grade 3** | Melody only | 4 bars | Major or minor | Clap pulse (**2 plays**, reduced from 3) → ID tonality major/minor → **ID interval by number** (2nd–6th) between first two notes → spot which bar a change occurred in |
| **Grade 4** | **Harmonised** (chords added) | 4 bars | Major or minor | Clap pulse (2 plays) → ID tonality + **ID final cadence perfect/imperfect** → ID interval **by quality** (minor/major 2nd/3rd, perfect 4th/5th, minor/major 6th) → spot bar of rhythm change AND bar of pitch change (now two separate answers) |
| **Grade 5** | Harmonised | **8 bars** (doubled) | Major or minor | Clap pulse + **ID time signature** → ID tonality + cadence → interval range extends to **minor/major 7th, octave** → spot bar of rhythm change + bar of pitch change (both in melody line) |
| **Grade 6** | Harmonised | 8 bars | Major only | ID time sig + comment on dynamics + comment on articulation (3 things, "comment" not just "identify" — more open-ended) → identify 2 other characteristics → **ID modulation direction** (subdominant/dominant/relative minor, from first 4 bars) → spot **TWO simultaneous changes** to the melody line |
| **Grade 7** | Harmonised | 8 bars | Major **or minor** | Same structure as G6 → spot **THREE simultaneous changes**, described as pitch (melody line only) or rhythm |
| **Grade 8** | Harmonised | **12–16 bars**, heard **once** (not twice) for the first task | Major or minor | ID time sig + dynamics + articulation (once only) → identify **3** other characteristics (up from 2) → spot 3 changes, pitch or rhythm |

**Escalation pattern across all 9 grades:** melody-only → harmonised (G4+); 4 bars → 8 bars (G5+) → 12-16 bars (G8); major-only → major-or-minor (G2+); crude "higher/lower" → interval-by-number (G3) → interval-by-quality (G4) → full 7th/octave range (G5); single change to spot → two simultaneous (G6) → three simultaneous (G7-8); "identify" → "comment on" (G6+, more open-ended/analytical).

#### 1.2.2 Improvisation test — harmonic + motivic stimulus (already extracted in the app's own reference doc)

The Improvisation supporting test (one of the 2-of-4 choices, Initial–G5; fixed alongside Aural at G6-8) gives the candidate a **harmonic stimulus** (a chord set to play over) or a **motivic stimulus** (a melodic fragment to continue) — both tables already fully captured in `~/Shared/Piano/The Progression — Skill Tree.md` §3.3–3.4, summarized here:

- **Harmonic stimulus** escalates: Initial = C major, I/V only, 4 bars, 1 play → Grade 2 = F/G major + A minor, I-IV-V / i-iv-V, 8 bars, 2 plays → Grade 5 = A/Eb major + 4 minor keys, adds vi, 12 bars → Grade 6+ adds 7th chords, 16 bars.
- **Motivic stimulus** escalates: Initial = 2-bar stimulus → 4-6 bar response, up to a minor 3rd → Grade 8 = 1-bar stimulus → 12-16 bar response, up to a major 10th, with triplets/duplets/sforzando.

This ladder is the single closest syllabus analogue to our app's **improvisation/expression node family** (`p-t1-first-improv`, `p-t2-4-bar-improv`, `p-t3-blues`, the whole Expression Ladder E1-E7 in the original skill-tree spec) — see §2.4/§3.2 for the mapping onto the Generation axis.

#### 1.2.3 Sight-reading — brief (per task instructions, low priority: the app cannot administer this)

Already fully tabulated in `~/Shared/Piano/The Progression — Skill Tree.md` §3.2: keys/time-signatures/note-values/dynamics/articulation all cumulative per grade, from "C major, 2/4, crotchets" at Initial to "B/Db major, G#/F minor, double sharps/flats, 2/2 + changing time, differing LH/RH dynamics" at Grade 8. Sight-reading is a live, unseen-extract, examiner-judged test — structurally impossible for a self-paced app to replicate, so this table is retained only as descriptive context, not as a design input.

### 1.3 Piano — ABRSM cross-reference (now full detail, high confidence)

Official ABRSM Piano Practical Grades syllabus (2025/2026 edition), text-extracted in full and cross-checked against 2+ independent sources. **Terminology note:** ABRSM's current pre-Grade-1 tier is called **"Initial Grade"** (added 2018/19); their older, now-discontinued "Prep Test" is a different, separate thing — don't conflate the two.

**Metronome convention gotcha:** ABRSM references the MM to the **crotchet** (quarter note) for Initial–Grade 3, then switches to the **minim** (half note) for Grade 4–8, with scales always in even quavers. A Grade 4 "minim=52" is the SAME speed as "crotchet=104" — apparent tempo drops between sources are usually just this notation switch, not a real slowdown. Table below is normalized to ABRSM's own reference note per grade.

#### Scales & arpeggios (technical work)

| Grade | Keys (major) | Keys (minor) | Octaves | Hands | Metronome mark | Notes |
|---|---|---|---|---|---|---|
| Initial | C | D (any form) | 1 (5th for contrary motion/arpeggios) | Separate (contrary-motion HT unison) | ♩=54 scales, ♩=52 arpeggios | Arpeggios: C major, D minor, over a 5th, HS |
| Grade 1 | C (1oct); G, F (2oct) | A, D (2oct, any form) | 1 (C major); 2 (rest) | HT for C major; HS for G/F/A/D | ♩=60 scales; ♩=58 arpeggios | Contrary-motion C major 1oct HT unison |
| Grade 2 | G, F (HT); D, A (HS) | A, D (HT); E, G (HS) | 2 | mixed per key group | ♩=66 scales; ♩=63 arpeggios | Chromatic from D, 1oct, HS |
| Grade 3 | D, A (HT); Bb, Eb (HS) | E, G (HT); B, C (HS) | 2 | mixed | ♩=80 scales; ~♩=70±2 arpeggios (2 sources disagree 69 vs 72) | Contrary-motion E major HT unison |
| Grade 4 | Bb, Eb (HT); B, F#, Ab (HS) | B, C (HT); F#, F (HS) | 2 | mixed | minim=52 scales (=crotchet-equiv 104, high confidence); arpeggios ~76–80 crotchet-equiv (medium confidence, 2 sources disagree) | Chromatic from F#, 2oct HT |
| Grade 5 | A, E, B, F#, Db (HT, legato) | F#, C#, G#, Eb, Bb (HT) | 2 | HT main group; HS for staccato group (Ab major, F minor) | minim=63 scales (crotchet-equiv 126); minim=44 arpeggios (crotchet-equiv 88) — both high confidence | Diminished 7th from B, 2oct HS. Arpeggios now cover all 12 keys HT |
| Grade 6 | D, F, Ab, B (4oct HT, legato OR staccato) | D, F, G#, B (4oct HT, harm+mel) | 4 (2 for contrary motion) | HT | minim=76 scales (crotchet-equiv 152); minim=50 arpeggios | "Key-centre" system starts: 4 keys/grade cycling all 12 across G6-8 |
| Grade 7 | Db, E, G, Bb (4oct HT) | C#, E, G, Bb (4oct HT) | 4 (2 for contrary/thirds) | HT; HS for thirds group | minim=80 scales (crotchet-equiv 160); minim=56 arpeggios; scales-a-3rd-apart minim=60 | Arpeggios now 1st inversion only |
| Grade 8 | C, Eb, F#, A (4oct HT) | C, Eb, F#, A (4oct HT) | 4 (2 for contrary/thirds/sixths) | HT; HS for thirds/sixths | minim=88 scales (crotchet-equiv 176); minim=66 arpeggios; 3rd/6th-apart minim=63 | **Whole-tone scales first appear** (unique to Grade 8) |

**Universal rules (confirmed, all grades):** scales/arpeggios from memory, even note-values, no pedal; legato unless a group is marked staccato; any fingering acceptable if musically successful.

#### Aural (brief — ABRSM's own structure, confirmed but not itemized per-grade in this pass)

ABRSM's aural test is a fixed 4-test-type structure at every grade (clap-back/rhythm task, pitch/scale-degree recognition, a "how does this differ" before/after comparison, and a characterization/general-knowledge question), worth 18/150 at every grade — structurally similar in shape to Trinity's aural test (both open with a clap-back task) but ABRSM's own per-grade escalation wasn't itemized to the same depth as Trinity's in this research pass (secondary priority per the original task scope).

#### Mark scheme & grade-track structure

- **150 total, identical structure every grade:** Pieces 90 (30×3) + Scales 21 + Sight-Reading 21 + Aural 18. Pass 100–119, Merit 120–129, Distinction 130–150.
- **Practical Grades** (above) vs **Performance Grades** (newer, since ~2018): Performance Grades = 4 pieces ONLY, video-submitted, **NO scales/arpeggios, NO sight-reading, NO aural** — ABRSM states the two tracks are "equivalent in demand," just different emphasis. If Trinity ever offers an analogous no-technical-work track, Performance Grades is ABRSM's counterpart; Practical Grades (with its scale/aural ladder) is the relevant comparison for this app.

### 1.4 Electric guitar — RSL (Rockschool) syllabus: TECHNICAL WORK

Source: official RSL "Guitar Syllabus Specification" (78pp, primary source, read in full), cross-checked against the predecessor 2012–2018 spec.

**Exam structure (every grade):** 3 performance pieces + Technical Exercises + 1 unprepared test (§1.5) + 2 Ear Tests (§1.5) + 5 GMQ (§1.5).

#### Detail: Debut → Grade 5

| Grade | Scales/modes | Chords | Techniques introduced | Tempo | What this grade means |
|---|---|---|---|---|---|
| **Debut** | Major: C. Minor pentatonic: A, E | Open: Major A,D,C,G; Minor A,E | Basic riff work, low-E only; no named technique yet | 70bpm | "Learning a short time, learnt the basic skills." |
| **Grade 1** | + Natural minor (A); major pentatonic (G) | Powerchords (2-note, first appearance). Major A,D,E,C,G; Minor A,D,E | Doublestops, staccato, accents, slides | 70bpm | "6mo–1yr, mastered the key basic skills." |
| **Grade 2** | + C,G major/minor pentatonic pairs | Powerchords (3-note). Major C,F,G; Minor7th A,D,E; Major7th A,C,D | Palm muting, alternate picking, arpeggiated chords | 80bpm | "1–1.5yr, solid basic techniques." |
| **Grade 3** | + Blues scale; G,A,B, 2 octaves | Major/minor barre chords (first appearance). Dominant 7th A,C,D,E | Bends, pre-bends, cross picking, open-string pedal tones | 90bpm | "1.5–2yr… beginnings of stylistic awareness through articulation and solo/improv work." |
| **Grade 4** | A,B,C,D 2oct in 8ths, 2 fingerings from 6th string | Chords on both E and A strings: Maj7/Min7/Dom7 B,C,D | **Amp/tone reasoning first tested** ("tone settings on the amp, and why") | Scales/arpeggios 80bpm; riff 100bpm | "2–2.5yr… stylistic conviction through developed solo/improv work and use of varied sounds." |
| **Grade 5** | + Harmonic minor, 2oct, 2 positions | Major/minor triads in 3 inversions (key of C) | GMQ vocabulary names hammer-ons/pull-offs/accents/vibrato | 80–100bpm | "Intermediate skills… increasing rhythmic complexity and convincing solo/improv work." |

#### Summary: Grade 6 → 8

| Grade | Scales/modes | Chords | Techniques | Tempo |
|---|---|---|---|---|
| **Grade 6** | All 5 pentatonic-minor box shapes; Dorian, Mixolydian (first modes) | Min7♭5, dim; 7th arpeggios 2oct/2 positions | Natural + pinched harmonics, two-handed tapping; Stylistic Study (rock/metal=tapping+legato) | 100bpm |
| **Grade 7** | Lydian, Phrygian; Jazz melodic minor | Maj9/Min9/Dom9 | Stylistic Study: pinch+natural harmonics (rock), embellishments+double-stops (funk), crossing strings+octaves (jazz) | 100bpm |
| **Grade 8** | Whole tone, diminished, altered scales | Dom7♯5/♭5/♯9/♭9, diminished | Stylistic Study: crossing strings+alt picking (rock), embellishments+muted strings (funk), legato+alt picking (jazz) | 100bpm |

**Amp/tone progression:** G1-2 identify guitar parts → G3 locate amp volume/gain → G4 choose+justify tone settings → G6-8 achieve tone *changes within* a song.

**Flagged low-confidence:** third-party claims of RSL Grade 8 "sweep picking" are NOT found anywhere in the official 78-page spec — treat as unconfirmed marketing copy.

### 1.5 Electric guitar — RSL: EAR TESTS, UNPREPARED TEST, GMQ

**This is the section that answers Anti's expansion for guitar** — RSL keeps ear/aural work as its own dedicated exam component (unlike Trinity, which folds it into "Session Skills," §1.7). Ear Tests are worth 6-10/10, marked on "Accuracy & Understanding."

#### 1.5.1 Ear Tests — Melodic Recall + Rhythmic/Harmonic Recall

Debut–Grade 3 pairs **Melodic Recall + Rhythmic Recall**; Grade 4–8 pairs **Melodic Recall + Harmonic Recall** (rhythmic recall is dropped in favor of chord/harmony recall starting Grade 4).

| Grade | Melodic Recall | Rhythmic/Harmonic Recall |
|---|---|---|
| **Debut** | ♩=85. Two half notes; ID 2nd note higher/lower than 1st. Heard twice (1-bar count-in each). | **Rhythmic**, ♩=80, low-E string. 2-bar rhythm (half/quarter notes, drum backing), heard twice, played back, then IDed from 2 written examples. |
| **Grade 1** | ♩=85. Three notes; ID direction of 2nd-vs-1st and 3rd-vs-2nd. Heard twice. | **Rhythmic**, ♩=90, low-E. 2-bar rhythm (quarter/8th notes + quarter rests), played twice, played back, IDed from 2 examples. |
| **Grade 2** | Key: C minor pentatonic, ♩=85. **2-bar melody** w/ drum backing (root note first, ascending 1st interval); played back after 2 hearings. | **Rhythmic**, E string, ♩=90. 2-bar rhythm, played twice, played back, IDed from 2 examples. |
| **Grade 3** | Key: G minor pentatonic, ♩=85. Same 2-bar-melody format. | **Rhythmic**, E string, ♩=90. Rhythm vocabulary expands (adds 8th-note rests). |
| **Grade 4** | Key: C major or B minor pentatonic, ♩=90. 2-bar melody, **1st interval now descending** (reversed from G2-3). | **Harmonic Recall (NEW, replaces rhythmic).** Key C major, ♩=90. Tonic chord, then **2-bar chord sequence** (I/IV/V combos) w/ bass+drum. Play back in rhythm, then **name the chords**. |
| **Grade 5** | Key: D major or A minor pentatonic, ♩=90. Same format. | **Harmonic Recall.** Key G major, ♩=90. 2-bar sequence from I,IV,V,**vi** (adds vi vs G4). |
| **Grade 6** | 3 key options now (D major/minor pentatonic or G natural minor), ♩=90. 1st note = root **or fifth**; direction no longer told in advance. | **Harmonic Recall.** Key D major, ♩=90. Sequence now **4 bars** (was 2), adds ii,iii,vi + **V7**. |
| **Grade 7** | Key options: A major pentatonic, C minor pentatonic, or A natural minor. Same format. | **Harmonic Recall.** Key A major, ♩=90. 4-bar sequence adds **iim7, iiim7, vim7**. |
| **Grade 8** | 1st note now = root, third, **or** fifth (3 options). | **Harmonic Recall.** Key E major, ♩=90. 4-bar sequence adds **Imaj7, IVmaj7**. |

**Progression pattern:** bar-length doubles 2→4 bars at harmonic recall Grade 6; key/scale choices widen from 1 fixed key to 2-3 options; chord vocabulary accumulates 7th extensions; melodic recall shifts "identify direction only" (Debut/G1) → "play back a 2-bar melody" (G2+) → ambiguous start-note/direction (G6+, harder).

#### 1.5.2 Unprepared test — Sight Reading / Improvisation & Interpretation (Debut–5), Quick Study Piece (6–8)

**Debut:** Sight Reading only (no choice yet) — unseen 4-bar rhythm, low-E string, half/quarter notes, 4/4, ♩=70, 90s prep.

Grade 1–5: candidate **chooses** Sight Reading (notated) OR Improvisation & Interpretation (backing track). Both structurally converge by Grade 4-5 — even "Sight Reading" gets a 2-bar improvised ending, and "Improvisation" gets a 2-bar notated-rhythm intro to read first.

| Grade | Sight Reading | Improvisation & Interpretation |
|---|---|---|
| Grade 1 | Key A minor, ♩=70. 4 bars, half/quarter notes. | Key C major/A minor, ♩=70-80. Lead-line or rhythm-line choice, 4 bars. |
| Grade 2 | Key C/G major, ♩=70. 4 bars, +8th notes & quarter rests. | Key G major/E minor, ♩=80-90. 4 bars. |
| Grade 3 | Key G major/A minor, ♩=75-85. 4 bars. | Key G major/A minor, ♩=80-90. 4 bars. |
| Grade 4 | Key D/G major, D/A minor, ♩=80-90. **8 bars**, chord symbols throughout, **2-bar improvised ending**. | Key D/G major, D/A minor, ♩=90-100. 2-bar notated-rhythm intro to READ, then improvised completion over 8-bar backing. |
| Grade 5 | Key F/G major, E/G minor, ♩=90. 8 bars, 2-bar improvised ending. | Key A/G major, E/G minor, ♩=90-100. Same structure as G4. |

**Grade 6-8: Quick Study Piece** (replaces the choice entirely). A **12-bar** unseen piece in the style of the candidate's own Stylistic Study choice (Rock/Metal, Funk, or Jazz/Latin/Blues). Examiner demonstrates the notated parts once (improvised bars NOT demonstrated) → candidate gets 3 min to study → backing plays twice more (practice, then examined). A QSP is a **lead sheet** — hybrid sight-reading + improvisation, not a pure ear test.

#### 1.5.3 GMQ — ear/theory-adjacent items (excluding the amp/gear ones already covered in §1.4)

| Grade | Music-knowledge questions (ear/theory) |
|---|---|
| Debut | Stave/TAB; treble clef; half/quarter note values |
| Grade 1 | + time signature; whole/half/quarter/8th values; major-vs-minor chord difference |
| Grade 2-3 | + pitch names; rest values; major/minor chord CONSTRUCTION |
| Grade 4 | + key signature; repeat marks/D.C./D.S.; triplet values; major/minor/dom7 chord construction; **which scale fits the solo section and why** |
| Grade 5 | + accidentals; swing-time markings; hammer-on/pull-off/accent/vibrato markings; min7/maj7/dom7 construction |
| Grade 6-8 | Expressive markings (palm mute, accents, staccato, legato, vibrato); dynamics; **scale-to-harmony relation** (narrows/stabilizes rather than broadening further) |

No GMQ item at any grade tests interval/chord recognition **by ear** — all live-ear content lives in the Ear Tests (§1.5.1), not GMQ.

### 1.6 Electric guitar — Trinity Rock & Pop: TECHNICAL cross-check

Trinity embeds technical content in 3 songs (Song 3 = "Technical Focus," 2 named techniques, 30/100 marks — highest-weighted single component).

| Grade | Chords | Techniques ("other directions") | Descriptor |
|---|---|---|---|
| Initial | Simple keys/chords, **2-note power chords** | none named yet | "power chords, rhythm off the riff, melodic playing and chord accuracy" |
| Grade 1 | as Initial | Staccato, accents, pause on last note | "single note riff, power chord riff, articulation and picking precision" |
| Grade 2 | wider range | **LH damping, palm mute, ring, slides, occasional hammer-on/pull-off** | "left hand damping, switching between single notes and chords, palm muting" |
| Grade 3 | 3-note power chords, half/partial barre | **Fingerstyle, quarter/semitone/whole-step bends, vibrato**, hammer-on/pull-off now fluent | "articulation, solo playing, rhythmic accuracy and dexterity" |
| Grade 4 | more regular full barre | Heavy distortion, clean↔distortion switching, slurred octaves; ~4-bar improvised solos begin | "bends, riff playing, dynamic control and soloistic variety" |
| Grade 5 | sus4 | Mandolin-style picking, more sophisticated FX/bends; ~8-bar solos | "unison bends, counting, complex soloing and hybrid picking" |
| Grade 6 | power/6th/slash chords | **Pinch harmonics**, flanger/phase/chorus/wah; hammer-ons within chords, rapid picking, octaves; **must tune/set up unaided from here** | "hammer-ons within chords, stylistic solo, rapid picking and octaves" |
| Grade 7 | 9ths, dim/aug | Complex syncopation; ~16-bar solos | "control of sounds, tremolo picking, 'galloping' rhythm and extreme dynamics" |
| Grade 8 | any common chords incl. jazz-funk/Latin-soul/samba | "Any standard guitar technique" | "legato, tapping, trills and extended soloing" |

**RSL vs Trinity technique-timing disagreements:** power chords (Trinity Initial vs RSL G1); hammer-ons/pull-offs (Trinity explicit G2, fluent G3 vs RSL vocabulary only from G5 — Trinity is the better source for technique-introduction timing); bends and barre chords: both agree Grade 3; vibrato (Trinity G3 vs RSL G5); tapping (RSL G6 vs Trinity's G8 descriptor — RSL earlier here); modes (RSL-only, names Dorian/Mixolydian from G6).

### 1.7 Electric guitar — Trinity Rock & Pop: SESSION SKILLS (Playback / Improvising)

**The direct guitar analogue to the aural expansion.** Every exam: Songs (80 marks) + Session Skills (20 marks). Candidate picks **either Playback or Improvising** as their one Session Skills test — Trinity never forces both, unlike RSL's fixed 2-test Ear Tests structure. All requirements are **cumulative** (each grade carries forward everything from lower grades).

**Marking:** 0-20, Distinction 17-20, Merit 15-16, Pass 12-14. Playback assessed on security/fluency/sound-quality; Improvising on stylistic communication/development/command of the instrument.

#### Playback — listen once/twice, then repeat back the phrase exactly (no variation allowed)

Candidate gets a song chart + 30s to study, examiner plays the backing (count-in + continuous backing rhythm); 1st run-through = practice, 2nd = assessed.

| Grade | Total length | Repeated-section length | New this grade |
|---|---|---|---|
| Initial | 8 bars | 2 bars | 4/4, semibreves/minims/crotchets, D major/E minor, 1st position, no chords |
| Grade 1 | (carried) | (carried) | 2/4, quavers, minims, *p*/*f*, G major/A minor |
| Grade 2 | (carried) | (carried) | 3/4, dotted minims, accents, C major/D minor, ties |
| Grade 3 | **8–12 bars** | **2–4 bars** | dotted crotchets/16ths/swung 8ths, F major/B minor, blues scale, 2-note chords, 2nd position, hammer-on/pull-off |
| Grade 4 | (carried) | (carried) | 6/8, 8th triplets, crescendo/dim, A major/C minor, 3-note chords, slides, palm muting, syncopation |
| Grade 5 | **12–16 bars** | (carried) | 12/8, *pp*/*ff*/*sfz*, E major/G minor, vibrato, bends, up to 5th position, **chord symbols now on the chart** |
| Grade 6 | **16–20 bars** | **4–8 bars** | 2/2, 9/8, 3/8, B major + any key to 4♯/♭, up to 7th position, harmonics |
| Grade 7 | (carried) | (carried) | 7/4, 7/8, 5/4, 5/8, any key to 5♯/♭, full fretboard range |
| Grade 8 | **20–24 bars** | (carried) | changing time signatures, any key, any expressive technique |

#### Improvising — listen to a looped backing (4 loops), improvise over it in style

Chord chart given + 30s to study; 1st run = practice, 2nd = assessed.

| Grade | Total bars | New harmonic/rhythmic vocabulary | Keys | Chords | Styles |
|---|---|---|---|---|---|
| Initial | 4 | 1 chord/bar, 4/4 | D major, A minor | I, IV, V | simple rock, pop |
| Grade 1 | (carried) | — | C major, E minor | any diatonic degree (no dim/aug) | ballad, heavy rock |
| Grade 2 | (carried) | 3/4 | A major, D minor | (carried) | country |
| Grade 3 | **8** | 2/2, swung 8ths | F major, G major | 7th chords | blues |
| Grade 4 | (carried) | 6/8, syncopation, ~2 chords/bar | E major, C minor | maj7/min7 | reggae, R&B |
| Grade 5 | **12** | 12/8 | B major, F minor | sus4 | funk, shuffle, disco |
| Grade 6 | **16** | 9/8, **up to 2-bar solo break** | any key | power, add6, slash chords | Latin, metal |
| Grade 7 | (carried) | 5/4, 7/8 | (carried) | maj9/min9, dim/aug | jazz, boogie-woogie |
| Grade 8 | (carried) | changing time sigs, **up to 4-bar solo break** | (carried) | any common chord incl. hybrids | jazz-funk, Latin soul, samba |

**Cross-board contrast:** RSL separates "read something new" from "reproduce something heard" into two distinct, independently-marked exam sections; Trinity collapses both into one Session Skills choice. Trinity's Playback is the closer analogue to RSL's Melodic Recall (listen→reproduce) but over far more bars, scored holistically rather than via identification questions. RSL's Harmonic Recall (chord-sequence-by-name, from G4) has no direct Trinity equivalent — Trinity's harmonic content lives inside the Improvising chord-chart task instead.

---

## 2. Mapping onto our DAG

### 2.1 Piano nodes → grade band

| Node id | Title | Best-fit grade band | Basis |
|---|---|---|---|
| `p-t0-keyboard-map` | Map the Keyboard | pre-Initial | Note-finding is a prerequisite, not itself a Trinity item |
| `p-t0-posture` | Posture & Arm Weight | pre-Initial | Foundational, not graded |
| `p-t0-staff` | Reading the Staff | Initial | Trinity musical-knowledge Initial: "pitch letter names, note durations, clefs/staves/barlines" |
| `p-key-C` | C major is yours | **Initial** | Exact match: Trinity Initial scale = C major, 1 oct, HS, ♩=60 |
| `p-key-am` | A minor longing | **Initial** | Exact match: Trinity Initial's paired minor |
| `p-key-G` | G major | **Grade 1** | Trinity Grade 1 pair = F and G major |
| `p-key-F` | F major | **Grade 1** | Same pair |
| `p-t1-first-improv` | First Improvisation (C–F–G–C) | content is Grade 1–2 level | The I–IV–V–I stimulus matches Trinity's Grade 2 harmonic-stimulus table more than Initial's I,V-only/4-bar spec |
| `p-t1-echo-ear` | The Echo (ear) | Initial–Grade 1 aural; also the app's Playback/Melodic-Recall analogue | Trinity aural Initial/G1: dynamic/articulation ID; structurally this node is our closest match to Trinity's Playback / RSL's Melodic Recall (§2.4) |
| `p-t1-three-moods` | Three Moods | Grade 1–2 | Expression E1/E2 — no formal Trinity grade tag |
| `p-t2-chord-under-melody` | Chord Under Melody | **Grade 2–3** | Matches Phase 2: "hold a 3-note chord in LH while RH plays a moving line" |
| `p-t2-pop-formula` | The Pop Formula (Am–F–C–G) | **Grade 2** | Matches Trinity's Grade 2 harmonic-stimulus chord set |
| `p-t2-4-bar-improv` | 4-Bar Improv | **Grade 2** | Same stimulus band |
| `p-t2-transcribe` | Put a Melody on the Keys | Grade 2–3, ear ladder L4 | No Trinity transcription requirement — entirely app-original "hidden curriculum" |
| `p-key-D` | D major daylight | **Grade 2** | D major is in Trinity's Grade 2 pair — **but our node drills hands-separate; Trinity's Grade 2 spec is hands-TOGETHER, ♩=80** (see §2.3) |
| `p-key-em` | E minor mood | Grade 1 by Trinity's scale list, Grade 2-3 pedagogically in our tree | Minor discrepancy, defensible ordering |
| `p-t3-lead-sheet` | Read a Lead Sheet | Grade 2–3, no Trinity equivalent | App's own "hidden curriculum" (§4.6 of original skill-tree spec) |
| `p-t3-three-moods` | Same Progression, Three Ways | Grade 4–5 | Expression E4/E5 |
| `p-t3-pop-pull` | Pull a Song from a Recording | Grade 4–6, ear ladder L6 | No formal Trinity equivalent — closest RSL/Trinity analogue is RSL's Harmonic Recall or Trinity's Improvising test, both of which involve identifying/reproducing chords under a melody |
| `p-t3-ii-v-i` | ii–V–I (first jazz) | conceptually Grade 6+ | 7ths first appear formally in Trinity's improvisation table at Grade 6; our node is an intentionally simplified early taste |
| `p-t3-blues` | 12-Bar Blues | Grade 4–5 | Syncopation appears in Trinity's rhythmic demands ~Grade 4-5 |
| `p-trans-am-F` | Am → F, in time | cross-cutting (Grade 1–2 fluency), not a Trinity item | App-original |

### 2.2 Guitar nodes → grade band

| Node id | Title | Best-fit grade band | Basis |
|---|---|---|---|
| `g-t0-anatomy` | Guitar Anatomy & Tuning | **Debut** | RSL Debut: "learnt the basic skills"; GMQ tests parts ID from G1-2 |
| `g-t0-posture` | Holding & Pick Grip | Debut | Foundational |
| `g-t0-tab` | Reading Tab Basics | Debut | Notation literacy |
| `g-t1-fretting` | Fretting Hand Placement | Debut | Foundational |
| `g-t1-downpick` | Down-Picking | Debut | RSL Debut: "basic riff work on lowest E string only" |
| `g-t1-altpick` | Alternate Picking | **Grade 2** | RSL names alternate picking explicitly at Grade 2 |
| `g-t1-openEM` | Open Chords Em/Am/E/A | **Debut** | Matches RSL Debut's open-chord list almost exactly |
| `g-t1-openDGC` | Open Chords D/G/C | **Grade 1** | RSL Grade 1 adds Major D,E,C,G / Minor D,E |
| `g-t1-capo` | The Capo | **no grade equivalent** | Neither board tests capo use — app-specific "key multiplier," not a syllabus item |
| `g-t1-strum` | Basic Strumming | Debut–1 | Trinity: "rhythm off the riff" — RSL doesn't formally test strum patterns |
| `g-t1-power` | Power Chords | **Grade 1 (RSL) / Initial (Trinity)** | Boards disagree by a full grade; matches Trinity's earlier placement |
| `g-t1-palmmute` | Palm Muting | **Grade 2** | Exact match both boards |
| `g-t1-tabrhythm` | Tab Rhythm Reading | no formal grade equivalent | Cross-cutting notation literacy |
| `g-t2-hammer` | Hammer-Ons | **Grade 2–3** | Trinity: occasional G2, fluent G3 (higher-confidence source — RSL doesn't name it until GMQ vocabulary at G5) |
| `g-t2-pulloff` | Pull-Offs | **Grade 2–3** | Same Trinity band |
| `g-t2-slide` | Slides | **Grade 2** | Trinity Grade 2 |
| `g-t2-bend` | String Bending (whole step) | **Grade 3** | Both boards agree |
| `g-t2-vibrato` | Vibrato | **Grade 3** | Trinity Grade 3 (earlier/more explicit than RSL's G5 vocabulary mention) |
| `g-t2-pent-box1` | Minor Pentatonic Box 1 | **Grade 1–3** | RSL introduces at Debut, expands through Grade 2; "first improv vocabulary" fits RSL Grade 3's stylistic-awareness milestone best |
| `g-t2-pent-box2` | Pentatonic Box 2 + Connect | **Grade 3–4** | RSL Grade 4: "two fingerings from the 6th string" |
| `g-t2-barre-E` | Barre Chords (E shape) | **Grade 3** | Both boards agree |
| `g-t2-barre-A` | Barre Chords (A shape) | **Grade 3–4** | Trinity: "more regular full barre" Grade 4 |
| `g-t3-blues12` | 12-Bar Blues | **Grade 3–4** | RSL blues scale G3; jam-readiness descriptor fits G3-4 |
| `g-t3-phrasing` | Lead Phrasing Q&A | **Grade 4–5** | RSL/Trinity Grade 4 "soloistic variety" |
| `g-t3-licks` | Pentatonic Licks Box 1 | **Grade 4–5** | Same band |
| `g-t3-fullneck` | Full-Neck Pentatonic | **Grade 5–6** | Near-exact match: RSL Grade 6 = "all 5 positions/shapes of minor pentatonic" |
| `g-t3-bendaccuracy` | Bending Accuracy + Expression | **Grade 5** | RSL G5 GMQ names bends/vibrato; Trinity G5 "unison bends... complex soloing" |
| `g-t3-syncopation` | Rhythm Syncopation & Accents | **Grade 6–7** | Trinity Grade 7 explicit: "complex syncopation" |
| `g-trans-G-C` | G → C, in time | cross-cutting (Debut–Grade1 fluency), not a syllabus item | App-original |

### 2.3 Gap cross-reference — Initial/Debut → Grade 3 (technical)

**Piano:**
- **P5 (hands-together)** is the biggest concrete honesty problem. Trinity's Grade 2 scale requirement is "2 octaves, **hands together**, ♩=80" — `p-key-D` (mapped to Grade 2) currently only drills hands-**separate**. We cannot honestly claim Grade 2 technical coverage for any key until hands-together is tracked and tested, not assumed.
- **P1 (sustain pedal)** — Trinity introduces pedal at Grade 3. Untaught entirely; blocks an honest Grade 3 claim.
- **P3 (rhythm foundation)** — Trinity's demands step up every grade (crotchet/quaver/minim → dotted rhythms/ties → syncopation). No rhythm-foundation node before Tier 3 blues.
- **P2 (inversions)** — not formally graded by Trinity, but load-bearing for the already-mapped Grade 2 pop-formula content.
- **B1 (prereq bug)** sits at exactly the Grade 1→2 boundary.

**Electric guitar:**
- **G2 (fretboard note names)** — needed to honestly claim even Grade 1 coverage; currently absent.
- **G1 (amp/gear)** — RSL tests amp reasoning from Grade 3-4; we have zero amp/gain content anywhere in the tree.
- **G5 (mini-barre)** — both boards place full barre at Grade 3; scaffold matches the real difficulty cliff there.
- **G3 (noise control)** — Trinity's Grade 2 damping/ring-control items assume noise control under gain; unaddressed.

### 2.4 Our ear system vs. the aural/session-skills ladders

**The code:** `earProgression.ts` defines `EarLevel` 1-7, capped in practice at `MAX_EAR_LEVEL = 5` (levels 6-7 have no authored content — an honest cap, not a TODO). Auto-advances one level when the last 3 sessions clear ≥80% accuracy over ≥5 rounds. `earRounds.ts` (piano) generates, per level: **L1** major-vs-minor triad ID, **L2** scale-degree ID (1st-5th, absolute — "which degree is this note"), **L3** chord-quality ID (maj/min/dim/aug, mixed with interval rounds ~1-in-3 from L3+), **L4** cadence ID (V-I / IV-I / ii-V-I), **L5** progression ID. `guitar/earRounds.ts` has its own `generateGuitarEarRound` generator with the same level shape — **but the guitar skill-tree DAG has ZERO nodes tagged `category: "ear"`** (piano has 3: `p-t1-echo-ear`, `p-t2-transcribe`, `p-t3-pop-pull`). The generator code exists for guitar; there's no node in the tree that surfaces it as a named, trackable skill. This is a concrete, previously-unflagged gap worth adding to the curriculum-gaps backlog alongside G1-G10.

**Mapping our levels onto the syllabus ladders:**

| Our level | What it tests | Closest syllabus analogue | Grade band | Note |
|---|---|---|---|---|
| L1 (major-vs-minor) | Absolute triad quality | Trinity aural "ID tonality major/minor" (formal at G3); our own Phase-1 "hidden curriculum" front-loads this to Initial | Initial (by design) vs Trinity G3 (formal) | Deliberate front-loading is a stated app design principle (ear/expression get "equal billing from Phase 1," per the original skill-tree spec) — not an error, but worth stating explicitly in any UI copy since it means our L1 is "ahead of" Trinity's formal schedule, not behind |
| L2 (scale-degree ID, absolute) | Which scale degree a note is, out of context | No close Trinity/RSL equivalent — Trinity's closest is the crude "last note higher/lower than first" (G1-2); RSL's Debut/G1 Melodic Recall is the same crude "higher/lower" shape | Initial-1 (RSL/Trinity's crude version) | Our version is more sophisticated (5 degrees, not just up/down) than either board's grade-1-equivalent test |
| L3 (chord-quality ID, absolute) | maj/min/dim/aug in isolation | RSL's Harmonic Recall (from Grade 4: "identify the chords by name" from a 2-bar sequence) is the closest, but tests chords **in a key/functional context**, not context-free. Trinity has no direct chord-quality-by-ear test. | Grade 4 (RSL) | **Real design gap**: both boards test chord ID *within a harmonic context* (this chord in this key, following this other chord), while ours tests quality in isolation. Context-free is a reasonable simpler first step, but a functional/in-key version (closer to RSL's Harmonic Recall) would be the natural next rung and doesn't exist yet |
| L4 (cadence ID: V-I/IV-I/ii-V-I) | Cadence type | Direct match: Trinity's "ID final cadence perfect/imperfect" (G4-5), expanding to "perfect, plagal, imperfect, interrupted" (G6+). V-I≈perfect, IV-I≈plagal | Grade 4-5 | Good structural match; our ii-V-I option is a functional-progression tail rather than a classical cadence type, slightly ahead of Trinity's own G4-5 cadence vocabulary |
| L5 (progression ID) | Canonical 4-chord loops | Matches Trinity's improvisation harmonic-stimulus chord-set escalation and RSL's Harmonic Recall at Grade 6-8 (4-bar sequences with ii/iii/vi/V7/maj7) | Grade 4-6 | Reasonable Phase-3 placement; RSL's top-grade harmonic recall is more sophisticated (adds specific 7th-chord identification) than our progression round currently attempts |

**Aural test TYPES present in BOTH boards, at EVERY grade, that our ear system has NO equivalent for:**
1. **Rhythm clap-back / pulse ID** — Trinity's very first aural task at literally every grade, Initial through 8 ("clap the pulse, stressing the strong beat"); RSL's dedicated Rhythmic Recall test, Debut-3. **Zero equivalent anywhere in our ear system.** This directly reinforces curriculum-gap **P3 (rhythm foundation)** — it's not just a piano-technique gap, it's an aural-training gap too, at the highest possible priority (present at every single grade of the primary source).
2. **"Spot the change"** (a melody is played twice, once with a rhythm-or-pitch alteration; candidate identifies where/what changed) — present at every single Trinity piano grade, escalating from one change to three simultaneous changes by Grade 7-8. No equivalent round type exists in `earRounds.ts`. Not currently named in the curriculum-gaps doc — worth adding as a new item, since "detect a change against a known reference" is a distinct skill from "identify a static thing" (which is all our current 5 levels do).
3. **Time-signature / metre ID** — appears from Trinity Grade 5 and RSL playback tests generally. Lower priority (Phase 4+ territory).
4. **Modulation/key-change detection** — Trinity Grade 6+. Already named as a Phase-3+ aspiration in the original skill-tree doc's ear ladder (L6 "hear a modulation... name its direction") but has no node or round type built yet.

**Tone.js implementability** — the app already synthesizes audio, so every aural test type above IS renderable as an interactive test, with the following notes:
- **Rhythm clap-back**: fully implementable — play a click/drum pattern via Tone.js, capture tap timing via touch/click events, compare against the pattern. No new audio synthesis needed, just a rhythm-input capture UI (doesn't exist yet).
- **Spot-the-change**: fully implementable — generate a melody, play it twice with a randomized single-note pitch or duration change on the 2nd playback, ask "which bar / was it pitch or rhythm." Straightforward extension of the existing scale-degree/interval round generators.
- **Chord-in-context recall (RSL Harmonic Recall style)**: implementable using the existing `progressionChords()` helper already in `music.ts` — play a tonic-establishing chord, then a short sequence, ask the user to name each chord by function (I/IV/V) rather than absolute quality. This would upgrade our L3/L5 from "identify in isolation" to "identify in context," closing the gap noted above.
- **Modulation detection**: implementable but harder — requires generating a melody that pivots key mid-phrase, which is a bigger content-generation lift than the others. Lower priority, matches its Grade 6+ placement.
- **Sight-reading and repertoire-performance quality**: NOT implementable as an interactive test — these require either a human judge or reading comprehension the app can't score. Correctly excluded from any grade-estimate design (see §3.3).

---

## 3. Grade-estimation design sketch (per-component, per Anti's scope expansion)

### 3.1 What the app already tracks (real fields)

- `SkillProgress.status` (`locked|available|in-progress|learned`), `.maxBpm`/`.bpmReached`, `.bestChanges` (transition-fluency nodes), `.fluent`/`.fluentAt` — per node, in `AppState.skillProgress` (`src/lib/types.ts`).
- `AppState.keyDepths: Partial<Record<KeyId, KeyDepth 0-5>>` — per-key depth, independent of the node graph.
- `earLevel` (1-7, capped at 5) + the underlying accuracy-window logic in `earProgression.ts`, already driving the **Pattern Recognition** axis in `threeAxis.ts`.
- `generationAxis()` in `threeAxis.ts` — improv/expression nodes learned, pieces marked "yours," first-improv milestone — already the **Generation** axis, rendered as discrete milestones (not a %) because the underlying signal is loose, by design.
- **The three-axis system already exists and is exactly the right shape for this feature**: `threeAxis.ts` defines Ability (technical), Pattern Recognition (ear), and Generation (musicianship/improv) as the app's own decomposition of "music" — this maps almost one-to-one onto the syllabus's own three components (Technical Work, Aural, Improvisation), which is a strong signal the app's model was already pointed the right direction before this research.

### 3.2 The rule: per-component, not blended

**Do not produce one blended "Grade N" number.** Anti's framing is right and the syllabuses themselves support it structurally — Trinity's own mark scheme keeps Pieces/Technical/Aural/Improvisation as separate scored components, never averaged into a single "musicality index." Mirror that: report three independent estimates.

**Technical (Ability axis) — "technical work at ~Grade N":**
- Static content map `GRADE_BAND_NODES[instrument][grade]` from §2.1/§2.2, `GRADE_SCALE_TEMPO[instrument][grade]` from §1.1/§1.4.
- Met when: every node in the band is `learned`, AND every scale/technique node with a tempo ladder has `maxBpm`/`bpmReached` ≥ the grade's metronome mark, AND transition-fluency nodes hit `bestChanges` ≥ their authored target.

**Aural (Pattern Recognition axis) — "ear work at ~Grade N":**
- Static map `GRADE_AURAL_LEVEL[grade]` translating Trinity/RSL's aural escalation (§1.2.1, §1.5.1) into our `earLevel` 1-5 scale, using the mapping table in §2.4 (e.g. `earLevel` 4 ≈ "aural at Grade 4-5" based on the cadence-ID match).
- Because our current 5 levels don't cover rhythm clap-back or spot-the-change (§2.4), an honest aural estimate today is capped lower than the technical estimate would suggest, until those round types are built — the design should surface this explicitly ("ear training covers chord/interval recognition; rhythm dictation isn't tracked yet") rather than silently overclaiming.

**Musicianship (Generation axis) — "musicianship at ~Grade N":**
- Drive from `generationAxis()`'s existing milestones (first improv, improv-category nodes learned, pieces made "yours") plus the improvisation-stimulus complexity a learned improv node corresponds to (§1.2.2 harmonic/motivic stimulus tables, §1.7 Trinity Session Skills Improvising table for guitar).
- Since Generation is explicitly a milestone tracker (no honest %, per the code comment in `threeAxis.ts`), the musicianship grade-estimate should follow the same shape — "you've reached the Grade 2-equivalent improvisation milestone" rather than a precise number.

**Repertoire — explicitly NOT a graded axis:**
- Frame the user's own song shelf (custom songs, pieces marked "yours") as **"repertoire is yours, not examined"** — a deliberate, honest inversion of the syllabus model rather than a gap. The app doesn't need to gate this against Trinity's piece lists at all; it's the one component where the app's philosophy (self-directed, no faking) is simply better than an exam board's for a self-taught adult, and the copy should say so plainly rather than apologize for not tracking it.

### 3.3 Honesty constraints, per component

- **Technical**: cannot verify tone quality, hand position, or musicality of the scale performance — only speed and node completion. Say "technical work," never "your scale would pass."
- **Aural**: our ear rounds test recognition in isolation or in a simplified game format, not the live, once-or-twice-heard, examiner-scored format of a real aural test — and (per §2.4) don't yet cover rhythm dictation or change-detection at all. Say "ear training at ~Grade N for [the specific skills we test]," naming the gap rather than implying full aural coverage.
- **Musicianship/Generation**: milestone-based, not a graded fluency measure — say "reached the Grade N-equivalent improvisation milestone," never "you'd pass Grade N's improvisation test."
- **Never assessed at all, by design**: repertoire performance, sight-reading, examiner judgment of touch/dynamics/stagecraft. State this plainly in a footnote wherever any grade estimate is shown, so it can never be mistaken for exam-readiness. This mirrors the app's own stated principle (CLAUDE.md: "It is not trying to be anything else... honest progress numbers, real teaching... no faking").

---

## 4. Sources

**Local (read directly):**
- `~/Shared/Piano/Piano Syllabus 2021-2023 Trinity.pdf` — official Trinity 2021-2023 syllabus, 98pp, Technical Work AND Aural-test sections read in full per grade (Initial through 8)
- `~/Shared/Piano/The Progression — Skill Tree.md` — existing app-team extraction of Trinity's hours/sight-reading/improvisation-stimulus/musical-knowledge tables, cross-checked
- `~/Projects/piano/src/lib/piano/skillNodes.ts`, `src/lib/guitar/skillNodes.ts`, `src/lib/types.ts`, `src/lib/earProgression.ts`, `src/lib/earRounds.ts`, `src/lib/guitar/earRounds.ts`, `src/lib/threeAxis.ts` — current DAG + ear system + three-axis data model
- `~/.ccs/instances/neuraplan/jobs/115452e8/tmp/curriculum-gaps-2026-07-16.md` — batch-3 gap audit, cross-referenced in §2.3/§2.4

**Web (ABRSM piano):**
- ABRSM official 2025/2026 Piano Practical Grades syllabus PDF: https://www.abrsm.org/sites/default/files/2024-06/Piano%202025%20&%202026%20Prac%20syllabus%2020240524_access.pdf (direct fetch blocked by DNS from this environment; text-extracted via proxy)
- ABRSM 2021 scales guide (mirror): https://pdfcoffee.com/piano-scales-2021-guide-final-pdf-free.html
- PianoTV.net grade-by-grade technique articles: https://www.pianotv.net/2016/02/abrsm-grade-1-piano-technique-requirements/, .../2018/02/abrsm-grade-4-piano-technique-requirements/, .../2018/11/abrsm-grade-5-piano-technique-requirements/ (+ grade 2/3/6/7/8 equivalents)
- Piano World forum, ABRSM minimum-speeds table: https://forum.pianoworld.com/ubbthreads.php/topics/1475374/ABRSM_minimum_speeds_for_scale.html
- ABRSM "How we mark exams": https://us.abrsm.org/en/exam-support/your-guide-to-abrsm-exams/how-we-mark-exams/
- ABRSM Performance vs Practical Grades: https://www.abrsm.org/en-gb/performance-grades/about-performance-grades, https://www.abrsm.org/en-gb/practical-grades/about-practical-grades

**Web (RSL/Rockschool electric guitar):**
- RSL Guitar Syllabus Specification (March 2025 rev. of Sept 2018 syllabus, 78pp, primary): https://www.rslawards.com.cn/downloads/RSL_Guitar_Syllabus_Specification_March_2025-1.pdf
- Rockschool Guitar Syllabus Guide 2012-2018 (predecessor, cross-validation): https://rockschool.ameb.edu.au/wp-content/uploads/2016/04/RockschoolGuitar2012SyllabusAus.pdf
- RSL syllabus downloads index: https://www.rslawards.com/syllabus-downloads/
- RSL Electric Guitar grades narrative + product pages: https://www.rslawards.com/learn-electric-guitar/, .../products/electric-guitar-grade-1-2024/, .../grade-3/, .../grade-6/, .../grade-8-2024/

**Web (Trinity Rock & Pop Guitar):**
- Trinity Rock & Pop Guitar Syllabus — Qualification specification (63pp, primary, incl. "Parameters for own-choice songs" pp.53-63 and Session Skills Playback/Improvising tables pp.57-63): https://www.trinitycollege.com/resource?id=7899
- Trinity Rock & Pop per-grade pages: https://www.trinityrock.com/instruments/guitar/{initial,grade1..grade8}

---

## 5. Aural & Session-Skills Ladder (consolidated appendix)

*No new sources — this section cross-references §1.2 (Trinity piano aural/improv), §1.3 (ABRSM aural), §1.5 (RSL guitar ear tests/unprepared test), §1.7 (Trinity R&P session skills), and §2.4 (our ear-system alignment), laid out side-by-side per grade so the "what does the app hear/test" picture doesn't require reading all four sub-sections separately.*

### 5.1 Per-grade aural/session-skills content, all four sources side-by-side

**Detail: Initial/Debut → Grade 5**

| Grade | Trinity Piano — Aural (§1.2.1) | ABRSM Piano — Aural (§1.3, general structure) | RSL Guitar — Ear Tests (§1.5.1) | Trinity R&P Guitar — Session Skills (§1.7) |
|---|---|---|---|---|
| **Initial/Debut** | Melody only, 4 bars, major. Clap pulse ×3 → ID dynamic f/p → ID articulation legato/staccato → ID highest/lowest of first 3 notes | Same 4-test-type structure (clap-back, pitch/scale recognition, before/after comparison, characterization question) at its simplest form; per-grade task wording not itemized in this pass | Melodic Recall (♩=85, two half notes, higher/lower ID) + Rhythmic Recall (♩=80, 2-bar rhythm on low E, play back + ID from 2 written examples) | **Playback**: 8 bars, 2-bar repeat, 4/4, D major/E minor, 1st position, no chords. OR **Improvising**: 4 bars, 1 chord/bar, D major/A minor, I-IV-V, simple rock/pop |
| **Grade 1** | Melody only, 4 bars, major. Clap pulse ×3 → dynamic+articulation together → last-note higher/lower → **spot rhythm-or-pitch change** | Same structure, complexity ticks up one notch | Melodic Recall (♩=85, 3-note direction chain) + Rhythmic Recall (♩=90, low E, quarter/8th notes + quarter rests) | **Playback**: 2/4, quavers, minims, *p*/*f*, G major/A minor. OR **Improvising**: C major/E minor, any diatonic degree (no dim/aug), ballad/heavy rock |
| **Grade 2** | Melody only, 4 bars, major **or minor**. Clap pulse ×3 → describe *varying* dynamics+articulation → last-note higher/lower → spot change | Same structure | Melodic Recall (C minor pentatonic, ♩=85, 2-bar melody w/ drum backing) + Rhythmic Recall (E string, ♩=90) | **Playback**: 3/4, dotted minims, accents, C major/D minor, ties. OR **Improvising**: 3/4, A major/D minor, country style |
| **Grade 3** | Melody only, 4 bars. Clap pulse ×2 (reduced) → ID tonality maj/min → **ID interval by number** (2nd-6th) → spot which bar changed | Same structure | Melodic Recall (G minor pentatonic, ♩=85) + Rhythmic Recall (E string, ♩=90, expanded rhythm vocabulary incl. 8th-note rests) | **Playback**: 8-12 bars, 2-4 bar repeat, F major/B minor, blues scale, hammer-on/pull-off. OR **Improvising**: 8 bars, 2/2 swung 8ths, F/G major, 7th chords, blues style |
| **Grade 4** | **Harmonised** (chords added), 4 bars. Clap pulse ×2 → ID tonality+**final cadence** perfect/imperfect → **interval by quality** → spot bar of rhythm change AND bar of pitch change (two separate answers) | Same structure (coincides with ABRSM's own crotchet→minim MM-reference switch, unrelated) | Melodic Recall (C major/B minor pentatonic, ♩=90, **descending** 1st interval) + **Harmonic Recall (NEW, replaces Rhythmic)**: C major, 2-bar chord sequence (I/IV/V), play back + **name the chords** | **Playback**: 6/8, 8th triplets, cresc/dim, A major/C minor, 3-note chords, slides, palm muting, syncopation. OR **Improvising**: 6/8 syncopation, E major/C minor, maj7/min7, reggae/R&B |
| **Grade 5** | Harmonised, **8 bars** (doubled). Clap pulse + **ID time signature** → tonality+cadence → interval range to **7th/octave** → spot bar of rhythm change + bar of pitch change | Same structure | Melodic Recall (D major/A minor pentatonic, ♩=90) + Harmonic Recall (G major, 2-bar sequence adds **vi**) | **Playback**: 12-16 bars, 12/8, *pp/ff/sfz*, E major/G minor, vibrato, bends, **chord symbols now on chart**. OR **Improvising**: 12 bars, 12/8, B major/F minor, sus4, funk/shuffle/disco |

**Summary: Grade 6 → 8**

| Grade band | Trinity Piano Aural | ABRSM Aural | RSL Guitar Ear Tests | Trinity R&P Session Skills |
|---|---|---|---|---|
| **6-8** | Harmonised, 8→12-16 bars. Shifts from "identify" to "**comment on**" dynamics/articulation (more open-ended); **ID modulation direction** from G6; spot **2→3 simultaneous changes** (G6→G7-8); G8 heard **once** not twice for the opening task | Same 4-test structure presumed to scale similarly; not itemized per-grade in this research pass | Harmonic Recall grows 2→**4 bars**, adds ii/iii/vi/V7 (G6) then 7th-chord extensions iim7/iiim7/vim7/maj7 (G7-8); Melodic Recall widens to 2-3 key/scale options, direction no longer told in advance (harder) | Playback grows to 16-24 bars, any key to 5♯/♭, full fretboard range, changing time signatures. Improvising grows to 16 bars + solo breaks up to 4 bars, 9th/dim/aug chords, jazz/Latin styles. RSL's unprepared test converts to the hybrid **Quick Study Piece** (lead-sheet, sight-read + improvise) at G6-8 — no more separate Sight-Reading/Improv choice |

**Cross-board pattern, all four sources:** every board escalates on the same three axes — **length** (bars roughly double from Initial/Debut to Grade 5, double again by Grade 8), **source complexity** (melody-only → harmonised/chord-backed; single fixed key → candidate-facing key/scale choices), and **task sophistication** ("identify a static fact" → "detect a change against a reference" → "name/reproduce a sequence in context"). Trinity (both instruments) and RSL diverge mainly in *structure*: Trinity always offers a candidate choice between two test types (Aural/Improvisation for piano, Playback/Improvising for guitar) and never forces both; RSL fixes two mandatory Ear Tests every grade and treats the unprepared test (Sight Reading/Improv/QSP) as a third, separate axis.

### 5.2 Alignment with our ear system

*Full node-by-node/level-by-level detail lives in §2.4 — this is the condensed "where do we sit" answer.*

Our `earLevel` (1-7, capped at 5 in practice) auto-advances via `earProgression.ts`'s accuracy-window rule. The five authored levels (`earRounds.ts`) sit against the ladders above as: **L1** (major/minor ID) ≈ Trinity's formal G3 tonality test, but we deliberately front-load it to Initial as a stated design principle (ear gets "equal billing from Phase 1"); **L2** (absolute scale-degree ID) is more sophisticated than either board's Grade-1-equivalent "higher/lower" test; **L3** (absolute chord-quality ID) sits below RSL's Grade-4 Harmonic Recall, which tests chord identity *in a key/functional context* rather than in isolation — this is the clearest structural gap; **L4** (cadence ID: V-I/IV-I/ii-V-I) matches Trinity's Grade 4-5 cadence-naming almost exactly; **L5** (progression ID) sits around Grade 4-6, below RSL's Grade 6-8 Harmonic Recall sophistication (which adds specific 7th-chord naming).

**Test TYPES we have zero equivalent for, present at every grade of the primary sources:**
- **Rhythm clap-back / pulse ID** — Trinity's literal first task at every single piano grade Initial-8; RSL's dedicated Rhythmic Recall (Debut-3). Reinforces curriculum-gap **P3 (rhythm foundation)** as an aural gap, not just a technique gap.
- **"Spot the change"** (melody played twice, one altered; identify where/what) — present at every Trinity piano grade, 1→3 simultaneous changes by Grade 7-8. Not currently named anywhere in the curriculum-gaps doc; worth adding as a new item.
- **Chord-in-context recall** (RSL Harmonic Recall / Trinity Improvising's chord chart) — we test quality in isolation, not chords following one another within a key.
- Lower-priority, Phase 4+: **time-signature/metre ID** (Trinity G5+), **modulation/key-change detection** (Trinity G6+, already named as an aspiration in the original skill-tree ear ladder's L6 but never built).

**Guitar-specific finding:** `guitar/earRounds.ts` has its own working round generator, but the guitar skill-tree DAG has **zero** `category: "ear"` nodes (piano has three: `p-t1-echo-ear`, `p-t2-transcribe`, `p-t3-pop-pull`). The code exists; nothing in the tree names or tracks it. Concrete, previously-unflagged gap.

### 5.3 Tone.js implementability, per aural test type

The app already synthesizes piano/guitar audio via Tone.js, so most of the above IS renderable as an interactive in-app test. Rated on what exists today, not what's theoretically possible:

| Test type | Status | Why |
|---|---|---|
| Interval ID (by number/quality) | **Implementable now — already built** | `intervalRound` exists, mixed into rounds from L3+ |
| Cadence ID (V-I/IV-I/ii-V-I) | **Implementable now — already built** | `cadenceRound` (L4) |
| Chord-quality ID (isolated) | **Implementable now — already built** | `chordQualityRound` (L3) |
| Melodic Recall / Trinity Playback (listen, play it back) | **Implementable now — partially built** | Piano's `p-t1-echo-ear` "Echo" chain drill already does this (compares the user's played-back notes on the instrument itself, no audio pitch-detection needed). Guitar has no equivalent node (see §5.2) |
| Harmonic Recall / chord-in-context ID | **Needs work, but straightforward** | `progressionChords()` already exists in `music.ts`; play a tonic-establishing chord then a short sequence, ask the user to name each chord by function (I/IV/V) instead of absolute quality — upgrades L3/L5 from isolated to contextual |
| Rhythm clap-back / pulse ID | **Needs work** | No new synthesis needed (Tone.js already handles click/drum patterns) — the missing piece is a rhythm-input capture UI (tap timing vs. a pattern), which doesn't exist yet |
| Spot-the-change | **Needs work, straightforward** | Generate a melody, play it twice with one randomized pitch/duration change on the 2nd pass, ask "which bar / pitch or rhythm" — a direct extension of the existing scale-degree/interval generators |
| Time-signature / metre ID | **Needs work** | Lower priority (Phase 4+), no blocking technical reason, just not built |
| Modulation/key-change detection | **Needs work — harder** | Requires generating a melody that pivots key mid-phrase; a bigger content-generation lift than the others, matches its Grade 6+ placement |
| GMQ-style "which scale fits this progression" (RSL G4+) | **Needs work** | Conceptually a quiz question tied to already-taught scale/chord relationships, not a new synthesis problem — just doesn't exist as a UI yet |
| Sight-reading (notated, unseen, timed) | **Not verifiable in-app** | Requires reading comprehension the app can't score, plus performance judgment |
| Repertoire/piece performance (tone, touch, musicality) | **Not verifiable in-app** | Requires human judgment; explicitly excluded from any grade-estimate design (§3.3) |
| Amp/tone GMQ ("why these settings") | **Not verifiable as an ear test** | Could become a text/multiple-choice quiz question about gear reasoning, but that's a knowledge check, not an aural test — Tone.js doesn't model real amp gain-staging behavior anyway |
