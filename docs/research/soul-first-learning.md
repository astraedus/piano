# Soul-First Learning — Execution-Ready Build Spec

Status: LOCKED. This is the single source of truth merging four research deliverables (glossary content, guitar reframe, piano reframe, paths/lens UX). Conflicts are reconciled below with explicit decisions. Build against the CURRENT codebase: `AppState.version` is `4`, `SkillNode` lives in `src/lib/types.ts` with no soul/path fields yet, `KEY_META` lives in `src/lib/music.ts`, there is no `src/components/explain/` or `src/lib/explain/` directory yet.

## 0. The Problem and the Model

The app currently assumes theory the owner does not have. "Warmup: G major" or "minor pentatonic" is meaningless to a beginner who never learned what those are. The owner wants to play with SOUL, expressively, without being forced into theory. Theory must be OPTIONAL. The tree already encodes how fundamentals build on each other; we layer three things on top:

1. NOTHING UNEXPLAINED — every musical term in the UI is tappable to a plain-language explainer card: WHAT (1 jargon-free sentence), HEAR (a concrete Tone.js sound), SEE (where it sits on fretboard/keyboard), WHY (why it matters for sounding good).
2. SOUL-FIRST LABELS — lead with the feeling/sound/outcome; the theory name is a small tappable subtitle. "Power Chords" becomes "The Rock Chug"; "String Bending" becomes "Make a Note Cry".
3. THEORY-OPTIONAL PATHS — the user picks intent (Just Play / Play With Soul / Go Deep). The tree highlights on-path nodes, dims off-path, and surfaces theory nodes only when opted in. Changeable anytime.

---

## 1. Data Model (LOCKED)

### 1.1 SkillNode additions (`src/lib/types.ts`)

Add these OPTIONAL fields to the existing `SkillNode` interface. All optional means every change is backward-compatible; when a soul field is absent the existing `title` is the fallback, so nothing breaks if content lags.

```ts
// Added to SkillNode
soulTitle?: string;   // feeling/outcome-first label, e.g. "The Rock Chug", "Make a Note Cry"
keepTitle?: string;   // the theory name kept as a tappable subtitle; defaults to `title`
pathTags?: Array<"just-play" | "play-with-soul" | "go-deep">; // path membership; untagged = shown on every path
theory?: boolean;     // true = node only renders when theoryEnabled is on

// Phase 2 (content) — optional rich, term-annotated variants of plain strings.
// The plain `masteryDrill` / `unlock` strings remain the always-present fallback.
richMasteryDrill?: React.ReactNode;
richUnlock?: React.ReactNode;
```

DECISION (reconcile): the four reframe deliverables sometimes used `plainWhy` and `terms` on the node. We do NOT add those to `SkillNode`. Rationale: `plainWhy` duplicates the glossary `why` and the existing `unlock`; `terms` duplicates what the TermChip scanner derives from rendered text. The reframe tables' `plainWhy`/`terms` columns become source material for glossary `why` fields and for which TermChips to wire, not node fields. This keeps the node shape minimal and avoids two sources of truth.

### 1.2 Warmup / ChainDrill / EarChoice additions (`src/lib/types.ts`)

```ts
// Warmup
soulSummary?: string;   // "Loosen up in the home shape" instead of "G major scale"

// ChainDrill
soulName?: string;      // "Your First Solo" instead of "Am Pentatonic Chain"

// ChainStep (Phase 2 content)
richInstruction?: React.ReactNode;  // term-annotated instruction; plain `instruction` is the fallback

// EarChoice
termId?: string;        // glossary key so an ear-round choice label is tappable
```

### 1.3 AppState additions (`src/lib/types.ts`)

```ts
// Added to AppState
learningPath?: "just-play" | "play-with-soul" | "go-deep"; // undefined = show everything (back-compat)
theoryEnabled?: boolean;                                    // independent of path; forced true when go-deep
```

DECISION (reconcile): one deliverable wrote a `migrateV4toV5` and bumped VERSION to 5. Both new AppState fields are OPTIONAL with safe defaults, so a version bump is NOT strictly required for correctness — `loadState`'s current-version branch already does `{ ...defaultState(), ...parsed }` which backfills new optional fields. HOWEVER we bump to v5 anyway for clean provenance and to follow the established migration-ladder pattern. Both must be done:

- Bump `const VERSION = 5 as const;` in `storage.ts`.
- Change `AppState.version` type from `4` to `5`.
- Add `learningPath: undefined` and `theoryEnabled: false` to `defaultState()`.
- Add `migrateV4toV5` and thread it onto the end of `migrateToCurrent` (after `migrateV3toV4`), mirroring `migrateV3toV4` exactly:

```ts
export function migrateV4toV5(old: Record<string, unknown>): AppState {
  const o = old as Partial<AppState>;
  return {
    ...defaultState(),
    ...o,
    version: 5,
    learningPath: o.learningPath ?? undefined,
    theoryEnabled: o.theoryEnabled ?? false,
  } as AppState;
}
// in migrateToCurrent:  return migrateV4toV5(migrateV3toV4(...) as unknown as Record<string, unknown>);
```

Also update the inline `version === VERSION` fast-path constant usage (it already references `VERSION`, so bumping the const is enough).

### 1.4 GlossaryEntry interface (LOCKED) — `src/lib/explain/glossary.ts`

DECISION (reconcile): the deliverables proposed two GlossaryEntry shapes — one with `plain/hear(string)/see(string)/why/aliases`, another with `what/why/hear()/seeKind/seeNotes`. We lock the SECOND, executable shape because `hear` as a callable and `seeKind` as a discriminated render hint are directly wireable; we KEEP `aliases` from the first shape because the TermChip text scanner needs them. `plain` is renamed to `what` for consistency.

```ts
export interface GlossaryEntry {
  id: string;            // "power-chords", "g-major", "tonic"
  title: string;         // "Power Chords"
  aliases: string[];     // for the inline text scanner: ["power chord", "5 chord", "rock chord"]
  what: string;          // 1 sentence, zero jargon
  why: string;           // 1 sentence on why it matters for sounding good
  hear: () => Promise<void>;  // calls ensureAudio() then audio.ts helpers
  seeKind: "fretboard" | "keyboard" | "chord-diagram" | "text";
  seeNotes?: string[];   // scientific pitch for fretboard/keyboard highlight
  seeChordShape?: number[]; // for chord-diagram (matches SkillNode.chordShape convention, -1 = muted)
  seeText?: string;      // for seeKind: "text"
  instrument?: "guitar" | "piano" | "both"; // omit = both
}

export const GLOSSARY: GlossaryEntry[] = [ /* see Section 2 */ ];

export function lookupTerm(query: string): GlossaryEntry | undefined {
  const q = query.toLowerCase().trim();
  return GLOSSARY.find(
    (e) => e.id === q || e.title.toLowerCase() === q || e.aliases.some((a) => a.toLowerCase() === q),
  );
}
```

`hear` functions call audio helpers from `src/lib/*/audio` (clean electric voice for technique demos, distorted for power chords / palm muting). For piano entries use the piano module's voice. Note names are Scientific Pitch Notation; scale/sequence helpers may reference `lib/music.ts` (e.g. `pentatonic("A","minor",4)`).

---

## 2. The GLOSSARY (full content, ready to become the TS data file)

Every term below is one `GlossaryEntry`. `what` = `plain`, `why` = `why`. `hear` is the audio spec to wire. `see` is the visual spec; map it onto `seeKind`/`seeNotes`/`seeChordShape`/`seeText`. Aliases drive the inline scanner. Ordered fundamental → advanced within clusters, mirroring the tier progression.

### Cluster 1 — Basics of Sound and the Instrument

- **note** — Note (aliases: pitch, tone). what: A single musical sound with a specific highness or lowness, named by a letter A–G. why: Every melody, chord, and scale is built from notes; their names are the alphabet of music. hear: C4 then A4, 1s each. see: keyboard C4 / fretboard A-string fret 5.
- **pitch** — Pitch (highness, lowness). what: How high or low a note sounds. why: Hearing pitch differences is the raw material of music; every bend, slide, vibrato controls pitch. hear: E2 then E4. see: keyboard low vs high / thick vs thin strings.
- **open-string** — Open String (open note). what: A guitar string played without pressing any fret. why: Open strings ring fuller and anchor many famous riffs and chords. hear: E2 A2 D3 G3 B3 E4 in sequence. see: fretboard, no fingers.
- **fret** — Fret (fret number, position). what: A metal bar across the neck; pressing behind one raises pitch a half-step. why: Frets are your pitch control system and let you read tab. hear: low E open, then frets 1,2,3. see: fretboard frets 1–5 low E.
- **tuning** — Tuning (standard tuning, in tune). what: Setting each string to E A D G B E so everything sounds right. why: Ten minutes out of tune trains your ears wrong; tuning first is the highest-value habit. hear: E2 A2 D3 G3 B3 E4. see: fretboard with string names.
- **tab** — Tab (tablature, guitar tab). what: Six lines for six strings, numbers for frets; no music reading needed. why: Tab opens the entire internet of guitar music; the guitar player's cheat code. hear: Seven Nation Army low-E riff. see: text tab staff.
- **tab-rhythm** — Tab Rhythm. what: Timing layered on tab showing how long each note lasts. why: Rhythm is what makes a riff sound like the song. hear: same riff even vs short-long. see: tab with rhythm stems.
- **staff** — Staff (the stave, grand staff). what: Five lines written music lives on; note position shows pitch. why: Reading staff unlocks sheet music and lead sheets. hear: C4 with treble-clef position. see: treble clef E-G-B-D-F, bass below.
- **treble-clef** — Treble Clef (G clef). what: Marks the second line from bottom as G4. why: Lets you find any top-staff note from landmarks. hear: E4 G4 B4 D5 F5. see: treble clef labeled.
- **bass-clef** — Bass Clef (F clef). what: Marks the second line from top as F3 for lower notes. why: Left-hand piano lives here. hear: G2 B2 D3 F3 A3. see: bass clef labeled.
- **bpm** — BPM (tempo, speed, metronome). what: Beats per minute; higher = faster. why: A target BPM is an honest progress measure; clean at 70 beats sloppy at 120. hear: a note 4x at 60 then 120. see: metronome 60→120.
- **beat** — Beat (pulse, downbeat). what: The steady underlying pulse you tap your foot to. why: Playing in time is the one skill that makes everything sound musical. hear: progression at 80 BPM with click. see: four lighting circles.
- **bar** — Bar (measure). what: A group of (usually four) beats that repeats as the basic unit of time. why: Bars let you follow a song and change chords on time. hear: two four-beat chords. see: bar lines on tab/staff.

### Cluster 2 — Scales

- **scale** — Scale (the notes in a key). what: An ordered set of notes that sound good together and give a key its character. why: A scale is the palette you improvise from; stay in it and it sounds intentional. hear: C major up/down (white keys). see: keyboard C–C / Am pentatonic box 1.
- **major-scale** — Major Scale (the happy scale, do-re-mi). what: The bright, stable, resolved "happy" scale. why: The foundation everything else makes sense against. hear: C major then A minor. see: white keys C–C / G major pattern.
- **minor-scale** — Minor Scale (natural minor, the sad scale). what: A darker scale, same notes as a major but starting from a different root. why: Most emotional music lives in minor. hear: A natural minor vs C major. see: white keys A–A.
- **pentatonic** — Pentatonic Scale (the five-note scale, the solo scale). what: A five-note scale stripped of the notes likely to clash. why: Forgiving, expressive, in nearly every rock/blues/pop solo. hear: Am pentatonic A4 C5 D5 E5 G5 A5 then improvise. see: Am box 1.
- **minor-pentatonic** — Minor Pentatonic (minor pent, box scale). what: The five-note minor scale most electric players learn first; naturally bluesy. why: Behind almost every rock/blues solo; five notes, infinite expression. hear: A minor pentatonic up/down, guitar tone. see: Am box 1 frets 5–8.
- **pentatonic-box** — Pentatonic Box (box position, position). what: One of five fingering patterns covering a small neck area, connecting to the others. why: Learning boxes one at a time gives freedom over the whole neck. hear: Box 1 then Box 2. see: two boxes side by side.
- **scale-degree** — Scale Degree (the 1, the 5, the root). what: The numbered position of a note in a scale; 1 is the root, 5 the fifth. why: A shorthand that works in every key. hear: C major stop on C, then on G. see: scale numbered 1–7.
- **sharp-flat** — Sharp and Flat (# and b, black keys). what: A sharp raises a note one half-step, a flat lowers it; these are the black keys. why: Lets you name and find every note. hear: C→C#, E→Eb. see: C and C# / one fret apart.

### Cluster 3 — Chords

- **chord** — Chord (shape, voicing). what: Three or more notes played together that sound good. why: The harmonic foundation under every melody; a progression IS a song. hear: C major block then arpeggiated. see: three keys / open G diagram.
- **triad** — Triad (three-note chord). what: The simplest chord: three notes stacked in a pattern. why: The fundamental unit of harmony; major vs minor is heard here. hear: C major triad then A minor triad. see: three keys each / simplified diagram.
- **major-chord** — Major Chord (major triad, the happy chord). what: A bright, resolved three-note chord (root, +4 half-steps, +3). why: The warm resolved foundation; a map to every chord. hear: C, G, E major. see: C-E-G / E major [0,2,2,1,0,0].
- **minor-chord** — Minor Chord (minor triad, the sad chord). what: A darker three-note chord; like major but the middle note a half-step lower. why: One of the most trainable ear skills. hear: E major then E minor. see: C-Eb-G / Em [0,2,2,0,0,0].
- **open-chord** — Open Chord (open position chord, cowboy chord). what: A chord near the first frets with open strings ringing. why: Seven open shapes cover most pop/folk/rock. hear: Em, D, G open. see: Em Am E A D G C diagrams.
- **power-chord** — Power Chord (5 chord, rock chord). what: A two-note chord (root + fifth), no major/minor character, raw and powerful. why: The fundamental sound of rock/punk/metal; one moveable shape. hear: E5 (E2-B2) → A5 → D5. see: E5 shape, slides up intact.
- **barre-chord** — Barre Chord (bar chord, moveable chord). what: Index finger flat across the strings as a moveable capo so any shape plays anywhere. why: Unlocks every key, not just open-chord keys. hear: open E → F barre → G barre. see: F major E-shape barre arc.
- **caged-system** — CAGED System (CAGED, the five shapes). what: Five repeating shapes (C A G E D) up the neck so every major chord plays in five positions. why: The visual map that makes the fretboard make sense. hear: G as E-shape (fret 3) then A-shape (fret 10). see: five CAGED positions for G.
- **chord-diagram** — Chord Diagram (chord chart, box diagram). what: A grid showing strings, frets, and finger dots for a chord. why: Learn a new chord without anyone showing you. hear: read Em diagram then play it. see: Em diagram.
- **block-chord** — Block Chord (straight chords, chord stabs). what: All chord notes played at exactly the same time. why: The simplest left-hand harmony foundation. hear: Am block then arpeggiated. see: three keys + bracket.
- **arpeggio** — Arpeggio (broken chord, rolled chord). what: Chord notes one at a time in sequence; a chord that ripples. why: Gives harmony texture and movement; core accompaniment. hear: C block then C4 E4 G4 C5. see: keys lighting in sequence.
- **seventh-chord** — Seventh Chord (7 chord, dominant/major/minor 7). what: A four-note chord adding a seventh above the root. why: The color of jazz and advanced pop. hear: G then G7. see: four keys / shell diagram.
- **shell-voicing** — Shell Voicing (rootless/jazz/3-and-7 voicing). what: A stripped chord using only root, third, seventh. why: Clean, sophisticated comping with room for melody. hear: G7 full then shell G3 B3 F4. see: three keys skipping the fifth.

### Cluster 4 — Keys, Tonality, Harmony

- **key** — Key (home key, tonal center). what: The home base of a piece; which notes belong and what "home" sounds like. why: The single most useful concept for improvising and songwriting. hear: C major ending on C vs stopping on D. see: key signature.
- **root** — Root (root note, the 1, home note). what: The note a chord/scale is named after and built from. why: Tells you where home is; the anchor for improv. hear: G chord then isolate G. see: root marked in a diagram.
- **tonic** — Tonic (home note, root of the key). what: The note a key is built around and where music rests. why: Every melody is a journey to and from the tonic. hear: C major pause on B then resolve to C. see: C marked as home.
- **fifth** — Fifth (perfect fifth, the 5). what: The note five scale steps above the root; open and powerful. why: Backbone of power chords and open-string playing. hear: C4 then G4, then a power chord. see: C and G / two-string power chord.
- **major-vs-minor** — Major vs Minor (happy vs sad, bright vs dark). what: Major sounds bright/stable, minor darker; the difference is one half-step in the third. why: The most ear-trainable distinction in music. hear: C major triad then C minor; E major then E minor. see: C-E-G vs C-Eb-G.
- **relative-key** — Relative Key (relative minor/major). what: A major and minor key sharing all the same notes (C major = A minor). why: Explains why Am pentatonic works over C major music. hear: C major then A minor scale. see: white keys labeled both.
- **chord-progression** — Chord Progression (progression, changes). what: A repeating chord sequence forming a song's harmonic backbone. why: Most pop uses a handful; recognizing them speeds up learning songs. hear: Am-F-C-G x4. see: chord symbols in a loop.
- **roman-numeral** — Roman Numerals (chord numbers, the I-IV-V). what: Naming chords by position in a key (I home, V tension, IV lift) so ideas transpose. why: Knowing V always resolves to I never changes across keys. hear: I-IV-V-I in C then in G. see: C major chart I–vi.
- **i-iv-v** — I–IV–V Progression (one-four-five). what: The three most important chords in a key, used together. why: The universal language of popular music; jam-session ready. hear: C-F-G-C loop. see: I IV V in C.
- **pop-formula** — The Pop Formula (I-V-vi-IV, Am-F-C-G, the four chords). what: A four-chord loop under hundreds of pop songs. why: Unlocks half of modern pop; play a recognizable song in weeks. hear: Am-F-C-G x4. see: circular loop diagram.
- **12-bar-blues** — 12-Bar Blues (blues form, twelve bar). what: A 12-bar pattern (I-I-I-I-IV-IV-I-I-V-IV-I-I), the spine of blues/rock. why: Jam with any blues/rock/jazz musician. hear: 12-bar in A (A5-D5-E5) at 75 BPM. see: 12-bar grid.
- **cadence** — Cadence (resolution, ending). what: A short chord sequence signaling arrival or rest. why: How music creates and releases tension; V-I says "we're home". hear: V-I in C then IV-I. see: V→I arrows.
- **ii-v-i** — ii–V–I (two-five-one, jazz turnaround). what: The 2nd, 5th, 1st chords of a key; the most common jazz phrase. why: Skeleton of nearly every jazz standard. hear: Dm7-G7-Cmaj7. see: ii V7 I arrows.
- **modulation** — Modulation (key change). what: A piece shifting its home base to another key. why: Creates lift/drama (e.g. Hey Jude); helps you hear structure. hear: I-V-vi-IV in C then in G. see: key signature before/after.
- **voice-leading** — Voice Leading (smooth chord movement, top voice). what: Moving between chords with minimal motion so notes lead smoothly. why: Makes simple chords sing and feel connected. hear: F→Dm jumpy vs top-note held. see: top note staying, lower notes moving.

### Cluster 5 — Guitar Technique

- **fretting** — Fretting (pressing, left-hand technique). what: Pressing a string against a fret with the fingertip for a clean note. why: The foundation of every guitar note sounding musical. hear: same note buzzing/muted/clean. see: fingertip just behind a fret.
- **picking** — Picking (plucking, right-hand technique). what: Striking a string with pick or finger; the basis of rhythm and tone. why: Controls tone, volume, speed; relaxed beats tense. hear: low E weak/aggressive/controlled. see: pick at 45°, loose wrist.
- **down-picking** — Down-Picking (downstrokes). what: Picking every note downward only; heavier, consistent attack. why: The sound of metal rhythm; builds pick control first. hear: E5 8x downstrokes at 80 BPM. see: down arrows.
- **alternate-picking** — Alternate Picking (down-up picking). what: Continuous down-up alternation; the efficient way to play fast. why: The engine of every fast melody and solo. hear: chromatic 1-2-3-4 at 80 BPM. see: alternating arrows.
- **strumming** — Strumming (strum pattern, right-hand rhythm). what: Sweeping the pick across strings to sound a chord in a pattern. why: The most direct route from knowing chords to playing songs. hear: Em with D-DU-UDU at 80 BPM. see: down/up arrow pattern.
- **palm-muting** — Palm Muting (palm mute, PM, the chug). what: Resting the picking-hand edge near the bridge for a muffled chug. why: Core texture of punk/metal/hard rock; turns loud into alive. hear: E5 muted 4 then open 4. see: heel on strings at bridge.
- **hammer-on** — Hammer-On (legato, h). what: Sounding a higher note by hammering a finger down, no re-pick. why: Makes melodies flow; key to legato blues/rock. hear: pick fret 5 G string, hammer to 7. see: tab 5h7 arc.
- **pull-off** — Pull-Off (p, PO). what: Pulling a finger off to pluck the lower note without picking. why: The descending half of legato. hear: pick fret 7, pull to 5. see: tab 7p5 arc.
- **legato** — Legato (smooth playing, slurs). what: Notes flowing into each other via hammers/pulls, not picks. why: Gives solos a vocal, flowing quality. hear: pentatonic run picked vs legato. see: tab with arc symbols.
- **slide** — Slide (technique) (gliding, glide). what: Moving a fretting finger along a string while keeping pressure. why: Adds a vocal, bluesy quality fast. hear: pick fret 5 B string, slide to 7. see: tab 5/7 or 7\5.
- **string-bending** — String Bending (bend, blues bend). what: Pushing a string sideways to raise pitch smoothly, like a singer. why: The blues voice; the "crying" quality of electric solos. hear: fret 7 B string bend to match fret 9. see: B string pushed up at fret 7.
- **vibrato** — Vibrato (note shake, oscillation). what: Small repeated bend-and-release giving a warm pulsating wobble. why: Makes a held note sing; the signature of expressive playing. hear: fret 7 B string with ~4 wobbles/beat. see: string oscillating, ~ symbol.
- **riff** — Riff (main riff, the hook). what: A short repeated guitar phrase that is a song's backbone. why: Entry point to real playing; something you can show people. hear: Seven Nation Army, then Iron Man. see: tab with phrase bracketed.
- **lick** — Lick (phrase, vocabulary). what: A short memorized melodic phrase used as a solo building block. why: The sentences of improvisation; something to say. hear: B bend fret 7 then high-E 5/7 hammers. see: Box 1 lick tab.
- **syncopation** — Syncopation (off-beat accents, push rhythm). what: Accenting notes between the main beats for push and pull. why: Makes rhythm feel alive and human. hear: even downstrokes vs D-x-DU. see: off-beats highlighted.

### Cluster 6 — Piano Technique

- **arm-weight** — Arm Weight (weight transfer, arm-drop). what: Using relaxed-arm weight to press keys, not tense fingers. why: The foundation of tone and endurance; tension kills tone. hear: C scale tense vs loose. see: relaxed forearm drop.
- **five-finger-pattern** — Five-Finger Pattern (five-finger exercise). what: Each finger plays one adjacent note (C-D-E-F-G) for even movement. why: Builds the coordination scales and pieces depend on. hear: C-D-E-F-G-F-E-D-C at 60 BPM. see: five keys numbered 1–5.
- **hands-separate** — Hands Separate (HS, one hand at a time). what: Practicing one hand before combining; the most effective way to learn. why: The direct path to music beyond your comfort zone. hear: C scale RH, LH, then both. see: one hand active.
- **hands-together** — Hands Together (HT, two hands). what: Playing both hands after each is learned alone. why: The goal, but only after each hand is reliable. hear: C scale both hands octave apart. see: both hands active.
- **sustain-pedal** — Sustain Pedal (damper pedal, the pedal). what: The right pedal lifting dampers so keys ring after release. why: Creates the lush flowing sound of ballads and classical. hear: C chord no pedal vs pedal. see: pedal depressed, wavy lines.
- **dynamics** — Dynamics (soft and loud, touch control). what: Loudness variation, set on piano by how hard you press. why: The primary vehicle for emotion; touch IS feeling. hear: C scale pp→crescendo→pp. see: dynamic arc.
- **crescendo** — Crescendo (getting louder, swelling). what: A gradual increase from soft to loud. why: Creates motion and anticipation. hear: four-bar phrase soft to loud. see: hairpin wedge.

### Cluster 7 — Musical Concepts and Expression

- **improvisation** — Improvisation (improv, soloing, noodling). what: Creating music in the moment, guided by feel and harmony. why: Where playing becomes your own voice; a skill, not a talent. hear: Am-F-C-G loop, play freely in C pentatonic. see: scale as the "safe zone".
- **phrasing** — Phrasing (musical sentences, call and answer). what: Grouping notes into sentences with beginnings, ends, and silences. why: Space is music; phrasing makes a line sound composed. hear: four-note idea, silence, four-note response. see: bracketed question/answer.
- **call-and-answer** — Call and Answer (question and answer, call-response). what: A musical conversation: a call phrase then a responding answer. why: The structural logic behind blues/jazz solos. hear: call, silence, answer. see: alternating labeled sections.
- **legato-expression** — Legato (expression) (smooth, connected, cantabile). what: Playing notes smoothly connected with no silence between. why: Gives melodies a singing, emotional quality. hear: phrase staccato then legato. see: slur line.
- **three-moods** — Playing With Mood (mood playing, touch and timing). what: Changing emotional character of the same notes via touch, timing, dynamics. why: Proof that music lives in the player, not the notes. hear: Am-F-C-G tender / restless / resigned. see: same chart, three markings.
- **shuffle** — Shuffle Feel (swing, long-short). what: A long-short timing on note pairs; the lilt of blues and swing. why: What makes blues and jazz groove. hear: even eighths then shuffle. see: dotted-eighth + sixteenth.
- **blue-note** — Blue Note (the blues note, flat 5/3). what: A flattened note giving blues its tension and ache (flat 3 or 5). why: The single note most responsible for the "crying" blues sound. hear: Am pentatonic adding Eb between D and E. see: pentatonic + one blue note.
- **ear-training** — Ear Training (listening, the echo game). what: Learning to identify sounds by ear (major vs minor, sing back a melody). why: Figure out songs without tab; improvise musically. hear: major chord then minor chord, identify. see: Major/Minor choice UI.
- **interval** — Interval (distance between notes, 3rd, 5th). what: The pitch distance between two notes, each with a distinct character. why: Lets you figure out melodies and chord quality by ear. hear: C-E (major 3rd), C-Eb (minor 3rd), C-G (fifth). see: two keys + half-step count.
- **transcribing** — Transcribing (playing by ear, figuring out a song). what: Working out notes by ear alone, no sheet music or tab. why: Songs you love become yours without waiting for a chart. hear: first four notes of Happy Birthday from C4. see: waveform → keys.
- **lead-sheet** — Lead Sheet (chord chart, fake book page). what: A score with just the melody line and chord symbols above it. why: The professional shorthand; play any song from a chart. hear: G-Em-C-D from symbols over a melody. see: one melody line + chord symbols.
- **comping** — Comping (accompanying, backing). what: Playing chords rhythmically to support a melody or soloist. why: The most socially useful piano skill. hear: Am-F-C-G block chords under a melody. see: two-staff LH chords + RH melody.
- **key-of-the-week** — Key of the Week (ghost key, focus key). what: The one key the app focuses practice on for the week. why: One key per week builds real "lived" fluency, not bouncing across 12. hear: the week's scale and triad, then improvise. see: weekly key with scale/triad.
- **spaced-review** — Spaced Review (spaced repetition, review). what: Revisiting learned skills at widening intervals to lock long-term memory. why: Motor skills consolidate during rest; gaps strengthen more than daily drilling. hear: play a two-week-old skill cold. see: timeline day 1, 3, 7, 14.
- **fluency-test** — Fluency Test (autonomous/dual-task test). what: Performing a skill while doing something else, to prove it is automatic. why: Freedom means a skill is in your hands, not your head. hear: C scale hands together while counting aloud. see: prompt with a secondary task.
- **bpm-ladder** — BPM Ladder (tempo/speed ladder). what: Starting slow and raising speed only after clean reps at the current tempo. why: Builds speed honestly; jumping fast ingrains mistakes. hear: chromatic 1-2-3-4 at 60, 65, 70. see: progress bar with tick marks.
- **micro-rest** — Micro-Rest (rep block, rest between reps). what: A short ~12s pause between rep sets so the motor system consolidates. why: Consolidation happens during rest, not repetition. hear: 3 reps, 12s rest, repeat. see: timer 3 reps → rest countdown.

### Quick-Reference Appendix (labels and categories)

- **tier** — Tier (skill tier, T0–T3). what: A grouping of skills by difficulty (T0 setup → T3 expression/reward). why: See where you are without overwhelm. seeKind: text. see: sunrise color ramp.
- **skill-node** — Skill (skill node, tree node). what: A single thing you are mastering, connected by arrows to prereqs and unlocks. why: Makes growth visible; each checkmark is real evidence. seeKind: text.
- **prerequisite** — Prerequisite (prereq, must learn first). what: A skill needed before another becomes available. why: Skills genuinely build on each other (fret cleanly before barre). seeKind: text.
- **xp** — XP (experience points). what: Points earned for practicing that raise your level. why: Makes invisible progress visible. seeKind: text.
- **streak** — Streak (practice streak, days in a row). what: Consecutive days practiced; resets if you miss a day. why: Builds the habit of showing up. seeKind: text.
- **unlock** — Unlock (capability unlock). what: A real musical capability gained on completing a skill, not a badge. why: Reframes practice as gaining capabilities. seeKind: text.

### Cross-deliverable glossary reconciliation

The piano deliverable defined extra ids: `keyboard`, `octave`, `note-names`, `key-signature`, `hand-position`, `tension`, `relative-minor`, `chord-loop`, `pitch-matching`, `articulation`, `touch`, `expression`, `melody`, `hand-independence`, `accompaniment`, `blues-scale`, `chord-symbol`, `real-time-reading`, `interpretation`, `jazz-chord`, `resolution`, `chord-tones`, `chord-detection`, `left-hand-right-hand`. DECISION: include these as additional `GlossaryEntry` rows (piano `instrument: "piano"` where piano-specific). Where a piano id overlaps a Cluster term, MERGE into one entry and add the piano alias rather than duplicating:

- `relative-minor` → fold into `relative-key` (add aliases "relative minor", "relative major").
- `chord-loop` → fold into `chord-progression` (add alias "chord loop").
- `pitch-matching` → fold into `ear-training` (add alias "pitch matching").
- `articulation`, `touch`, `expression`, `interpretation` → fold into `three-moods`/`dynamics` family as aliases OR keep `articulation`/`touch` as thin standalone entries; lock: keep `articulation` and `touch` standalone (they appear as distinct labels), fold `expression` and `interpretation` as aliases of `three-moods`.
- `resolution` → fold into `cadence` (add alias "resolution"); `chord-tones` standalone; `jazz-chord` → fold into `seventh-chord` (alias "jazz chord"); `blues-scale` standalone (distinct from `pentatonic`); `chord-symbol`, `real-time-reading`, `chord-detection`, `melody`, `accompaniment`, `hand-independence`, `left-hand-right-hand`, `keyboard`, `octave`, `note-names`, `key-signature`, `hand-position`, `tension` → standalone piano entries.

This keeps one entry per concept and avoids the two competing shapes shipping side by side.

### Phase 1 minimum ship set (guitar-first, the stated pain)

Ship these 18 entries first so the explain system is useful immediately, then backfill the rest:
`power-chords`(power-chord), `minor-pentatonic`, `pentatonic-box`(box1), `string-bending`, `vibrato`, `palm-muting`, `barre-chord`, `hammer-on`, `g-major`(major-scale in G), `a-minor`(minor-scale in A), `tonic`, `chord-progression`, `12-bar-blues`, `c-major`, `major-vs-minor`(minor-key), `triad`, `scale`, `improvisation`.

`hear` specs for the ship set:
- g-major: sequence G4 A4 B4 C5 D5 E5 F#5 G5
- a-minor: sequence A4 B4 C5 D5 E5 F5 G5 A5
- power-chord: chord [E2,B2] then [A2,E3]
- minor-pentatonic / pentatonic-box: sequence A4 C5 D5 E5 G5 A5
- string-bending: sequence G4→A4 ~150ms apart (approximate a bend)
- vibrato: A4 A4 A4 with short gaps (simulate oscillation)
- palm-muting: E2 E2 E2 E2 short duration, no sustain
- barre-chord: chord [F2,C3,F3,A3,C4,F4] (F major barre)
- hammer-on: G4→A4 ~80ms gap
- tonic: cadence in Am, V-I
- chord-progression: progression i-iv-V-i in Am [[A3,E4,A4],[D3,F3,A3],[E3,G3,B3],[A3,E4,A4]]
- 12-bar-blues: abbreviated 4-chord progression
- c-major / scale: sequence C4 D4 E4 F4 G4 A4 B4 C5
- major-vs-minor: chord [A3,C4,E4] then [A3,C#4,E4]
- triad: chord [C4,E4,G4]
- improvisation: progression + a short solo sequence back to back

---

## 3. Per-Node Soul-First Reframe (ready to apply)

Apply `soulTitle` and `keepTitle` to every node. The reframe deliverables gave two slightly different soulTitle sets (a long-form "plainWhy" set and a short tree-label set). DECISION: the SHORT set is what renders in the tree/panel (`soulTitle`); the long-form `plainWhy` text is source material for the glossary `why` and node `unlock`, NOT a node field. `keepTitle` = the theory name; defaults to existing `title` if omitted. `pathTags`/`theory` per the tables.

### Guitar nodes (`src/lib/guitar/skillNodes.ts`)

| Node ID | soulTitle | keepTitle | pathTags | theory |
|---|---|---|---|---|
| g-t0-anatomy | Your Guitar's Names | Guitar Anatomy & Tuning | just-play, play-with-soul, go-deep | false |
| g-t0-posture | Hold It Right | Holding & Pick Grip | just-play, play-with-soul, go-deep | false |
| g-t0-tab | Read the Map | Reading Tab Basics | just-play, play-with-soul, go-deep | false |
| g-t1-fretting | Clean Notes | Fretting Hand Placement | just-play, play-with-soul, go-deep | false |
| g-t1-downpick | Hit It Once | Down-Picking | just-play, play-with-soul, go-deep | false |
| g-t1-altpick | Pick in Both Directions | Alternate Picking | lead (play-with-soul, go-deep) | false |
| g-t1-openEM | The Minor Heart | Open Chords (Em, Am, E, A) | just-play, play-with-soul, go-deep | false |
| g-t1-openDGC | The Full Chord Set | Open Chords (D, G, C) | just-play, play-with-soul, go-deep | false |
| g-t1-strum | The Strum Pattern | Basic Strumming | just-play, play-with-soul, go-deep | false |
| g-t1-power | The Rock Chug | Power Chords | just-play, play-with-soul, go-deep | false |
| g-t1-palmmute | Muted Crunch | Palm Muting | just-play, play-with-soul, go-deep | false |
| g-t1-tabrhythm | Read the Rhythm | Tab Rhythm Reading | go-deep | true |
| g-t2-hammer | One Pick, Two Notes | Hammer-Ons | play-with-soul, go-deep | false |
| g-t2-pulloff | Pull Back Into Sound | Pull-Offs | play-with-soul, go-deep | false |
| g-t2-slide | Glide Between Notes | Slides | play-with-soul, go-deep | false |
| g-t2-bend | Make a Note Cry | String Bending (Whole Step) | play-with-soul, go-deep | false |
| g-t2-vibrato | Make a Note Breathe | Vibrato | play-with-soul, go-deep | false |
| g-t2-pent-box1 | Your First Solo | Minor Pentatonic (Box 1) | play-with-soul, go-deep | false |
| g-t2-pent-box2 | Move Up the Neck | Minor Pentatonic (Box 2 + Connect) | play-with-soul, go-deep | false |
| g-t2-barre-E | The Shape That Moves | Barre Chords (E Shape) | just-play, play-with-soul, go-deep | false |
| g-t2-barre-A | Any Key, Any Fret | Barre Chords (A Shape) | just-play, play-with-soul, go-deep | false |
| g-t3-blues12 | The Spine of Rock | 12-Bar Blues | play-with-soul, go-deep | false |
| g-t3-phrasing | Ask and Answer | Lead Phrasing (Q&A) | play-with-soul, go-deep | false |
| g-t3-licks | Musical Sentences | Pentatonic Licks (Box 1) | play-with-soul, go-deep | false |
| g-t3-fullneck | The Whole Fretboard | Full-Neck Pentatonic | play-with-soul, go-deep | false |
| g-t3-bendaccuracy | Feel the Pitch | Bending Accuracy + Expression | play-with-soul, go-deep | false |
| g-t3-syncopation | Rhythm With Attitude | Rhythm Syncopation & Accents | just-play, play-with-soul, go-deep | false |

Note: `g-t1-altpick` was tagged `lead`-only in the reframe but `lead` is not a pathTag value. Lock: `pathTags: ["play-with-soul", "go-deep"]` (lead column maps to play-with-soul + go-deep). Same mapping rule applies wherever a deliverable wrote `rhythm`/`lead`/`theory`: rhythm → just-play+play-with-soul+go-deep; lead → play-with-soul+go-deep; theory → go-deep with `theory: true`.

### Piano nodes (`src/lib/piano/skillNodes.ts`)

| Node ID | soulTitle | keepTitle | pathTags | theory |
|---|---|---|---|---|
| p-t0-keyboard-map | Find Any Note | Keyboard Map | just-play, play-with-soul, go-deep | false |
| p-t0-posture | Sit and Settle | Posture and Arm Weight | just-play, play-with-soul, go-deep | false |
| p-t0-staff | (none — theory) | Reading the Staff | go-deep | true |
| p-key-C | The Home Shape | C major | just-play, play-with-soul, go-deep | false |
| p-key-G | One Sharp | G major (one sharp) | just-play, play-with-soul, go-deep | false |
| p-key-F | One Flat | F major (one flat) | just-play, play-with-soul, go-deep | false |
| p-key-am | The Sad Shape | A minor | just-play, play-with-soul, go-deep | false |
| p-key-D | Bright and Wide Open | D major | play-with-soul, go-deep | false |
| p-key-em | Dark and Cinematic | E minor | play-with-soul, go-deep | false |
| p-t1-first-improv | Make It Up | First Improvisation | play-with-soul, go-deep | false |
| p-t1-echo-ear | Echo It Back | The Echo (ear training) | play-with-soul, go-deep | false |
| p-t1-three-moods | Same Notes, Three Feelings | Three Moods | play-with-soul, go-deep | false |
| p-t2-chord-under-melody | Two Hands Together | Chord Under Melody | just-play, play-with-soul, go-deep | false |
| p-t2-pop-formula | Half of All Pop | The Pop Formula | just-play, play-with-soul, go-deep | false |
| p-t2-4-bar-improv | Improvise Without Panic | 4-Bar Improvisation | play-with-soul, go-deep | false |
| p-t2-transcribe | Play It By Ear | Transcribing by Ear | play-with-soul, go-deep | false |
| p-t3-lead-sheet | (none — theory) | Reading a Lead Sheet | go-deep | true |
| p-t3-three-moods | Feel, Not Notes | Same Progression, Three Ways | play-with-soul, go-deep | false |
| p-t3-pop-pull | Pull a Song Off a Record | Transcribing Pop Songs | play-with-soul, go-deep | false |
| p-t3-ii-v-i | (none — theory) | ii-V-I (jazz foundation) | go-deep | true |
| p-t3-blues | Blues Permission | 12-Bar Blues | play-with-soul, go-deep | false |

DECISION (reconcile piano path conflict): one deliverable put `p-key-C`/`p-key-G`/`p-key-F`/`p-key-am` on all three paths and another implied theory for keys. Lock: the four foundation keys are on ALL paths and are NOT theory (a beginner needs a home key to play in). Reading-the-staff, lead-sheet, and ii-V-I are the only piano `theory: true` nodes. Theory-tagged nodes get NO `soulTitle` (they only show in Go Deep, where the theory name is correct).

### Chain drills and warmups (Phase 2 content)

- Add `soulName` to chain drills (e.g. "Am Pentatonic Chain" → "Your First Solo") in `src/lib/guitar/chainDrills.ts` and `src/lib/piano/chainDrills.ts`.
- Add `soulSummary` to warmups (e.g. "G major scale" → "Loosen up in the home shape") in `src/lib/guitar/warmups.ts` and `src/lib/piano/warmups.ts`.
- Add `termId` to ear-round choices where a label is a glossary term, in the earRounds generators.
- Add `richInstruction` to chain steps whose `instruction` contains a glossary term (annotated React node; plain string stays the fallback).

---

## 4. The Explain System (component contract + surfacing)

### 4.1 TermChip — `src/components/explain/TermChip.tsx`

```ts
interface TermChipProps {
  term: string;       // glossary lookup key, e.g. "power-chords", "g-major"
  label?: string;     // display override; defaults to glossary entry title
  variant?: "inline" | "subtitle";  // inline = mid-sentence; subtitle = below a node title
}
```

Renders a small underlined span (dotted underline in `var(--ink-3)`, `cursor-help`, NOT a button look). On tap/click opens `<Explain>` anchored to the chip; Enter/Space also open. A11y: `role="button"`, `tabIndex={0}`, `aria-label={"Explain: " + title}`. If `lookupTerm(term)` returns nothing, render the label as plain text (graceful degrade).

### 4.2 Explain — `src/components/explain/Explain.tsx`

```ts
interface ExplainProps {
  entry: GlossaryEntry;
  anchor: HTMLElement;   // the triggering chip, for positioning
  onClose: () => void;
}
```

Floating panel anchored below the chip, z-index above the graph. Four sections, always in order:
1. WHAT IT IS — `entry.what`, `font-serif text-base text-ink`.
2. HEAR IT — a single "Play it" button (`.chip .chip-accent`) that calls `ensureAudio()` then `entry.hear()`.
3. SEE IT — renders per `entry.seeKind`: `fretboard` → module `<Fretboard notes={seeNotes}>`; `keyboard` → piano `<Keyboard>`; `chord-diagram` → `<ChordDiagram shape={seeChordShape}>`; `text` → `seeText`.
4. WHY IT MATTERS — `entry.why`, `text-sm text-ink-2 italic`.

Dismiss: click outside, Escape, or × button.

### 4.3 useExplain — `src/components/explain/useExplain.ts`

A context/hook owning the single open entry (only one popover at a time). TermChip calls `open(entry, anchorEl)`; Explain reads the open entry and calls `close()`. Provider wraps the app shell so chips anywhere can open the singleton.

### 4.4 Where TermChips surface (exhaustive)

1. **Key/Chord of the Week header** (`PracticeStand.tsx` Header, uses `KEY_META[plan.ghostKey].name` as `ghostName`): wrap `focusName` in `<TermChip term={ghostKeyToTermId(plan.ghostKey)} label={focusName} />`. Add helper `ghostKeyToTermId(key: KeyId): string` mapping `"G"→"g-major"`, `"am"→"a-minor"`, etc.
2. **WarmupSlot summary** (`WarmupSlot.tsx`, currently `{warmup.label} · {ghostName}`): when `warmup.soulSummary` present, title = soulSummary and the theory name is a `subtitle` TermChip; otherwise wrap `ghostName` inline: `{warmup.label} · <TermChip term={ghostKeyToTermId(ghostKey)} label={ghostName} />`.
3. **ChainDrillSlot** (`ChainDrillSlot.tsx`): when `drill.soulName` present, render it as the heading and `drill.name` as a `subtitle` TermChip. Step instructions use `richInstruction` when present (annotated), else plain `instruction`.
4. **EarMomentSlot** (`EarMomentSlot.tsx`): wrap `round.prompt` terms and `choice.label` (when `choice.termId` set) in TermChips; fallback to plain text.
5. **SkillGraphPanel** (`SkillGraphPanel.tsx`): `h3` = `node.soulTitle ?? node.title`; when `soulTitle` present, render `node.keepTitle ?? node.title` as a `subtitle` TermChip via `nodeToTermId(node.id)`. `masteryDrill`/`unlock` use `richMasteryDrill`/`richUnlock` when present.
6. **SkillGraphNode** (`SkillGraphNode.tsx`): primary label = `node.soulTitle ?? node.title`; when soulTitle present and not locked, show `node.keepTitle ?? node.title` as a small dotted-underline subtitle. The card subtitle is visual affordance ONLY — the actual TermChip fires from the panel (the card is too small; tapping the card opens the panel). Add `nodeToTermId(nodeId): string | undefined` to the glossary helpers.

`ghostKeyToTermId` and `nodeToTermId` live in `src/lib/pathFilter.ts` (or a small `explain/links.ts`); lock them in `pathFilter.ts` to keep one helpers home.

---

## 5. Paths, Onboarding, Tree Filtering, Settings (LOCKED)

### 5.1 Path model

| ID | User name | Tagline | Covers |
|---|---|---|---|
| `just-play` | Just Play | Riffs, chords, songs. No theory required. | rhythm/chords/strumming/power chords/repertoire; hides `theory: true`. |
| `play-with-soul` | Play With Soul | Express yourself. Solo. Make a note cry. | Just Play + full lead/expression/improv column; still hides theory unless opted in. |
| `go-deep` | Go Deep | Understand everything you're playing. | both above + notation/theory/ear theory/ii-V-I; implies `theoryEnabled: true`. |

Theory is a DIMENSION on top of any path, not a fourth path. A Just Play user can turn theory on without switching intent. `learningPath: undefined` = show everything (back-compat for existing users), who get a one-time nudge card on the Practice Stand ("Want to focus your tree? Choose a path in Settings.") rather than forced re-onboarding.

### 5.2 pathFilter helpers — `src/lib/pathFilter.ts` (new)

```ts
import type { SkillNode, AppState } from "./types";
export type LearningPath = NonNullable<AppState["learningPath"]>;

export function nodeIsVisible(node: SkillNode, path: LearningPath | undefined, theoryEnabled: boolean): boolean {
  if (node.theory && !theoryEnabled) return false;
  if (!path) return true;                          // no path = show everything
  return node.pathTags?.includes(path) ?? true;    // untagged nodes show everywhere
}

export type PathTreatment = "on-path" | "off-path" | "theory-hidden";
export function nodePathTreatment(node: SkillNode, path: LearningPath | undefined, theoryEnabled: boolean): PathTreatment {
  if (node.theory && !theoryEnabled) return "theory-hidden";
  if (!path) return "on-path";
  return node.pathTags?.includes(path) ? "on-path" : "off-path";
}

export function ghostKeyToTermId(key: KeyId): string { /* "G"→"g-major", "am"→"a-minor", ... */ }
export function nodeToTermId(nodeId: string): string | undefined { /* node→glossary id where a direct map exists */ }
```

### 5.3 Onboarding (`Onboarding.tsx`)

Insert a new path-picker as step index 2, between "Where are you today?" and the north-star step:
- 0 Which instrument? · 1 Where are you today? · 2 (NEW) What do you want to do? · 3 North star · 4 Do you have a [instrument]?

Step copy (same large card-button style as instrument selection; selected = accent border + tinted bg):
```
What matters most to you right now?
[Just Play]        Riffs, chords, real songs. No music theory needed, ever.
[Play With Soul]   Express yourself. Solo. Learn to make a note cry, bend, and breathe. (Builds on Just Play.)
[Go Deep]          Understand everything you play. Theory, reading, the full picture. (Adds the why behind every sound.)
You can change this anytime in Settings.
```
Add `learningPath` to local onboarding state. In `finish()`:
```ts
learningPath: learningPath ?? "just-play",
theoryEnabled: learningPath === "go-deep",
```

### 5.4 Tree rendering (`SkillGraph.tsx`, `SkillGraphNode.tsx`, `skillGraphLayout.ts`)

- Add `pathTreatment: PathTreatment` to `SkillGraphNodeData`.
- Compute in `SkillGraph.tsx`'s `rfNodes` `useMemo` via `nodePathTreatment(sourceNode, state.learningPath, state.theoryEnabled ?? false)`.
- `theory-hidden`: FILTER the node out of `rfNodes` AND its edges out of `rfEdges` before passing to ReactFlow (keeps the dagre layout clean — do not render hidden divs).
- `off-path`: add `opacity-30` + `grayscale`, suppress the pulse ring, show only a faint lock-diamond glyph.
- `on-path`: unchanged.
- Header pills above the existing instrument filter: `[All] [Just Play] [Play With Soul] [Go Deep]`, defaulting to `state.learningPath` on mount. These are a LOCAL view filter only (do NOT persist), matching the existing instrument-filter pattern. Add a small "Theory" toggle chip defaulting to `state.theoryEnabled` that shows/hides theory nodes in the view.

### 5.5 Settings (`src/app/settings/page.tsx`)

New "Your Learning Path" section using the existing Section + pill pattern:
```
Your Learning Path
[Just Play]  [Play With Soul]  [Go Deep]
[ ] Show music theory nodes
    Theory nodes explain the "why" behind what you're playing. Off by default. Turn on when you're curious.
```
Path buttons = rounded-full pills, active = accent border + tinted bg. Theory toggle = checkbox matching the existing "Reminders" toggle. On change:
```ts
patch({ learningPath: chosen, theoryEnabled: chosen === "go-deep" ? true : state.theoryEnabled });
```
Switching AWAY from Go Deep does NOT auto-disable theory; the checkbox is the explicit control (the user turned it on, they turn it off).

---

## 6. Phased Build Roadmap (file-level, with parallelization)

```
Phase 1:  [A Types+Storage]  [B pathFilter]  [C Glossary data]   <- all parallel
Phase 2:  [D Node/drill/warmup content]                          <- after A
Phase 3:  [E Explain components]  [F Tree path rendering]        <- after A+B+C, E and F independent
Phase 4:  [G TermChip integration]  [H Onboarding+Settings]      <- after D+E+F, G and H independent
Phase 5:  [Tests + full gate]                                    <- after all
```
Critical path: A → (B,C) → (E,F) → (G,H) → tests. Content D can land any time after A; components degrade gracefully without soul titles (`title` is always the fallback).

### Phase 1 — Foundation (parallel, pure logic / small types)
- **Track A** (`src/lib/types.ts`, `src/lib/storage.ts`): add `soulTitle/keepTitle/pathTags/theory/richMasteryDrill/richUnlock` to `SkillNode`; `soulSummary` to `Warmup`; `soulName` to `ChainDrill`; `richInstruction` to `ChainStep`; `termId` to `EarChoice`; `learningPath/theoryEnabled` to `AppState`; change `AppState.version` to `5`; bump `VERSION=5`; write `migrateV4toV5`; thread it into `migrateToCurrent`; update `defaultState()`.
- **Track B** (`src/lib/pathFilter.ts` new + `pathFilter.test.ts`): `nodeIsVisible`, `nodePathTreatment`, `ghostKeyToTermId`, `nodeToTermId`. Pure, no DOM.
- **Track C** (`src/lib/explain/glossary.ts` new): `GlossaryEntry` + `GLOSSARY` (ship set first, then full) + `lookupTerm`. Pure data + async `hear` functions wired to audio helpers.

### Phase 2 — Content (after A)
- **Track D** (`src/lib/guitar/skillNodes.ts`, `src/lib/piano/skillNodes.ts`, both `chainDrills.ts`, both `warmups.ts`, earRounds generators): apply soulTitle/keepTitle/pathTags/theory per Section 3 tables; add soulName/soulSummary/termId; annotate step instructions with `richInstruction` where theory terms appear. Content only, no logic.

### Phase 3 — UI (after A+B+C; E and F independent)
- **Track E** (`src/components/explain/`): `TermChip.tsx`, `Explain.tsx`, `useExplain.ts` + provider in the app shell.
- **Track F** (`SkillGraph.tsx`, `SkillGraphNode.tsx`, `skillGraphLayout.ts`): `pathTreatment` on node data, compute in `useMemo`, apply opacity/grayscale/hidden, filter theory-hidden nodes+edges, add path pills + theory toggle to the graph header.

### Phase 4 — Integration (after D+E+F; G and H independent)
- **Track G** (`PracticeStand.tsx`, `WarmupSlot.tsx`, `ChainDrillSlot.tsx`, `EarMomentSlot.tsx`, `SkillGraphPanel.tsx`, `SkillGraphNode.tsx`): wire TermChips into every surface in Section 4; soul labels in slot summaries and drill headings.
- **Track H** (`Onboarding.tsx`, `src/app/settings/page.tsx`): onboarding step 2 path picker; Settings "Your Learning Path" section; one-time nudge card for path-less existing users; wire `learningPath`/`theoryEnabled` through `patch()`.

### Phase 5 — Tests + gate
- Vitest: `pathFilter.test.ts` (visibility/treatment matrix across path × theory × tagged/untagged/theory nodes; verify `learningPath: undefined` shows everything and theory nodes hide when `theoryEnabled: false`).
- RTL: `TermChip` renders, opens Explain on click/Enter, closes on Escape/outside-click; unknown term degrades to plain text.
- RTL: `SkillGraph` — off-path nodes carry `opacity-30`, theory nodes absent from DOM when `theoryEnabled: false`.
- RTL: new onboarding step renders, selection flows to `finish()` with correct `learningPath`/`theoryEnabled`.
- Storage: `migrateV4toV5` is idempotent and preserves existing fields; a v4 blob upgrades to v5 with `theoryEnabled: false`, `learningPath: undefined`.
- Full gate: `npx tsc --noEmit && npm run test:run && npm run build`.

---

## 7. Locked Decisions Summary

1. SkillNode gains `soulTitle/keepTitle/pathTags/theory` (+ optional `richMasteryDrill/richUnlock`). It does NOT gain `plainWhy` or `terms` — those become glossary content and TermChip wiring.
2. GlossaryEntry uses the executable shape (`what/why/hear()/seeKind/seeNotes/seeChordShape/seeText/aliases`). Overlapping piano-deliverable ids are merged via aliases; a small set stays standalone.
3. AppState gains `learningPath` (undefined = show all) + `theoryEnabled`. VERSION bumps 4→5 with `migrateV4toV5` even though fields are optional, for clean provenance.
4. Three paths + an orthogonal theory toggle. Go Deep forces theory on; switching away does not force it off.
5. rhythm→just-play+play-with-soul+go-deep; lead→play-with-soul+go-deep; theory→go-deep with `theory:true`. The four piano foundation keys are all-paths, non-theory. Only staff/lead-sheet/ii-V-I/tab-rhythm are theory nodes; theory nodes carry no soulTitle.
6. Tree: theory-hidden nodes filtered out of nodes+edges; off-path dimmed (opacity-30 grayscale); header path pills + theory chip are local view filters, not persisted.
7. Build order A → (B,C) → (E,F) → (G,H) → tests; content (D) anytime after A; components degrade gracefully without soul titles.
