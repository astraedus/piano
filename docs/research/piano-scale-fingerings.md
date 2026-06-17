# Piano Scale Fingerings — Verified Reference

Standard conservatory (ABRSM/RCM-aligned) one-octave fingerings for all 12 major and
12 (natural) minor scales, both hands, with thumb-tuck / cross-over points marked and
the grouping rules that explain the patterns. Built for the practice app's
`fingerings.ts` data table.

**Notation used throughout**
- Finger numbers: `1` = thumb, `2` = index, `3` = middle, `4` = ring, `5` = pinky (both hands).
- Each sequence is **one octave ASCENDING** (8 notes: scale degrees 1→8). **Descending is the exact reverse** of the ascending sequence (read the numbers right-to-left).
- `RH` = right hand, `LH` = left hand.
- Tuck/cross points are stated against the **ascending** motion (the moment the owner asked to surface: "when do I bring my thumb up?").

**Verification:** every non-obvious key was cross-checked against ≥2 independent
authoritative fingering charts. Sources are cited inline per key and listed at the
bottom. One documented conflict (B major LH) is flagged explicitly — one popular
source has it wrong; the correct, near-universal fingering is given.

---

## 1. General principles (the "why" the app should teach)

Scales have more notes (7–8) than fingers (5), so the hand must **shift position**
mid-scale. Two mechanics do this, and they are mirror images of each other:

1. **Thumb-under (thumb tuck).** The thumb passes *under* the palm to a new key
   while the longer fingers stay arched. This is the move on the way **up in the RH**
   and on the way **down in the LH**.
2. **Finger-over (crossing over).** A longer finger (usually 3, sometimes 4) crosses
   *over* the thumb to reach the next key. This is the move on the way **up in the LH**
   and on the way **down in the RH**.

Two rules decide *which* finger lands *where*:

- **Rule A — the thumb avoids the black keys.** The thumb is short; reaching it onto a
  black key forces the wrist forward and breaks legato. So fingerings are chosen so the
  **thumb plays white keys** (this is why flat/black-key scales get their odd-looking
  patterns — the whole sequence is arranged around keeping the thumb off the black keys).
  ([Practising the Piano — Principles of Scale Fingering](https://practisingthepiano.com/principles-scale-fingerings/), [Piano-Ology](https://piano-ology.com/piano-technique/fingering-charts-12-major-scales/))
- **Rule B — group the fingers 1-2-3 / 1-2-3-4 between thumbs.** The hand naturally
  falls into a "group of 3 then group of 4" (or 3+4) pattern; the thumb marks the start
  of each group. The black keys (which fall under 2-3 and 2-3-4) dictate where those
  groups must sit. ([PianoGroove](https://www.pianogroove.com/jazz-piano-lessons/major-scale-fingerings/))

**The big groupings (memorize these and you barely need the chart):**

- **White-key major scales C, G, D, A, E** — all share **RH `1 2 3 1 2 3 4 5`** and
  **LH `5 4 3 2 1 3 2 1`**. RH thumb tucks after degree 3; LH crosses 3-over-thumb after degree 5.
- **F major is the one white-key exception (RH):** **RH `1 2 3 4 1 2 3 4`** (tuck after
  degree 4, on Bb). Its LH is the standard `5 4 3 2 1 3 2 1`.
- **B major is the one white-key exception (LH):** RH is the standard `1 2 3 1 2 3 4 5`,
  but **LH is `4 3 2 1 4 3 2 1`** (starts on 4, not 5). This is the most-confused
  fingering — see §3.6.
- **Flat-key majors Bb, Eb, Ab, Db** — all share the **LH `3 2 1 4 3 2 1 3`** pattern
  (thumbs land on the white keys, 4 lands on a black key). Each has a *different* RH
  because the RH thumb must dodge the black keys at a different spot. Mnemonic: **"the
  thumb plays C and F"** (just like C major) in the flat scales.
  ([Piano-Ology](https://piano-ology.com/piano-technique/fingering-charts-12-major-scales/))
- **F#/Gb is the black-key major exception:** fingers 2-3 sit on the two-black-key group
  and 2-3-4 on the three-black-key group; **RH `2 3 4 1 2 3 1 2`**, **LH `4 3 2 1 3 2 1 4`**.
  ([PianoGroove](https://www.pianogroove.com/jazz-piano-lessons/major-scale-fingerings/))
- **Natural / harmonic / melodic minor of the same tonic use the SAME fingering.**
  Fingering follows the *physical key layout* (which white/black keys), and raising the
  6th/7th degree for harmonic/melodic minor does not move a note off-key onto a black key
  in a way that changes the standard fingering. So a key's natural-minor fingering below
  is also its harmonic and melodic minor fingering. (The only practical wrinkle: melodic
  minor descends as natural minor, but since descending = reverse of ascending anyway, the
  numbers are unchanged.) ([Hear and Play — minor scale fingering](https://www.hearandplay.com/main/the-fingering-of-the-melodic-minor-scale), [pianoscales.org](https://www.pianoscales.org/minor.html))

---

## 2. Quick-reference tables

### Major scales (RH / LH, ascending)

| Key | RH | LH | RH tuck after degree | LH cross after degree |
|-----|----|----|----------------------|------------------------|
| C   | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 | 3 (→4th note, F) | 5 (→6th note, A) |
| G   | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 | 3 | 5 |
| D   | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 | 3 | 5 |
| A   | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 | 3 | 5 |
| E   | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 | 3 | 5 |
| B   | 1 2 3 1 2 3 4 5 | **4 3 2 1 4 3 2 1** | 3 | 4 (→5th note, E) |
| F#/Gb | 2 3 4 1 2 3 1 2 | 4 3 2 1 3 2 1 4 | 4 (→5th, C#) | 4 (then thumb→4) |
| Db/C# | 2 3 1 2 3 4 1 2 | 3 2 1 4 3 2 1 3 | 3 (→4th, Gb) & 4 (→7th, C) | 3 (→4th) & 1→3 (→8th) |
| Ab  | 3 4 1 2 3 1 2 3 | 3 2 1 4 3 2 1 3 | 4 (→3rd, C) & 3 (→6th, F) | 3 & 1→3 |
| Eb  | 3 1 2 3 4 1 2 3 | 3 2 1 4 3 2 1 3 | 3 (→2nd, F) & 4 (→6th, C) | 3 & 1→3 |
| Bb  | 2 1 2 3 1 2 3 4 | 3 2 1 4 3 2 1 3 | 2 (→2nd, C) & 3 (→5th, F) | 3 & 1→3 |
| F   | 1 2 3 4 1 2 3 4 | 5 4 3 2 1 3 2 1 | 4 (→5th, C) | 5 |

### Minor scales — natural minor (RH / LH, ascending)

| Key | RH | LH |
|-----|----|----|
| A min  | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 |
| E min  | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 |
| B min  | 1 2 3 1 2 3 4 5 | **4 3 2 1 4 3 2 1** |
| F# min | 2 3 1 2 3 1 2 3 | 4 3 2 1 3 2 1 4 |
| C# min | 3 4 1 2 3 1 2 3 | 3 2 1 4 3 2 1 3 |
| G#/Ab min | 3 4 1 2 3 1 2 3 | 3 2 1 3 2 1 4 3 |
| D#/Eb min | 3 1 2 3 4 1 2 3 | 2 1 4 3 2 1 3 2 |
| Bb min | 2 1 2 3 1 2 3 4 | 2 1 3 2 1 4 3 2 |
| F min  | 1 2 3 4 1 2 3 4 | 5 4 3 2 1 3 2 1 |
| C min  | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 |
| G min  | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 |
| D min  | 1 2 3 1 2 3 4 5 | 5 4 3 2 1 3 2 1 |

> Reminder: these natural-minor fingerings are also correct for the **harmonic** and
> **melodic** minor of the same tonic.

---

## 3. Per-scale detail

For each scale: notes, RH sequence + tuck point, LH sequence + cross point, and the rule.

### 3.1 C major / A minor (the reference shape)

- **C major** — C D E F G A B C
  - RH `1 2 3 1 2 3 4 5` — **thumb tucks under after degree 3** (3 on E → 1 on F).
  - LH `5 4 3 2 1 3 2 1` — **3 crosses over thumb after degree 5** (1 on G → 3 on A).
  - Rule: the canonical "group of 3 then group of 4" pattern; every other white-key major
    is measured against this. ([PianoGroove](https://www.pianogroove.com/jazz-piano-lessons/major-scale-fingerings/), [pianoscales.org](https://www.pianoscales.org/major.html))
- **A minor** (natural) — A B C D E F G A — identical fingering to C major: RH `1 2 3 1 2 3 4 5`, LH `5 4 3 2 1 3 2 1`. ([pianoscales.org/minor](https://www.pianoscales.org/minor.html))

### 3.2 G major / E minor

- **G major** — G A B C D E F# G. RH `1 2 3 1 2 3 4 5` (tuck after deg 3), LH `5 4 3 2 1 3 2 1` (cross after deg 5).
- **E minor** — E F# G A B C D E. Same: RH `1 2 3 1 2 3 4 5`, LH `5 4 3 2 1 3 2 1`.
- Rule: white-key C-G-D-A-E group; the single black key (F#) falls under finger 4 (RH) / 2 (LH) and doesn't disturb the thumb. ([pianoscales.org](https://www.pianoscales.org/major.html))

### 3.3 D major / B minor

- **D major** — D E F# G A B C# D. RH `1 2 3 1 2 3 4 5`, LH `5 4 3 2 1 3 2 1`. Standard white-key group.
- **B minor** — B C# D E F# G A B. **RH `1 2 3 1 2 3 4 5`** (standard), but **LH `4 3 2 1 4 3 2 1`** — B minor's LH is the *minor* analogue of the B-major LH exception (starts on 4). ([pianoscales.org/minor](https://www.pianoscales.org/minor.html), [Hoffman Academy](https://www.hoffmanacademy.com/blog/b-minor-piano-scale))

### 3.4 A major / F# minor

- **A major** — A B C# D E F# G# A. RH `1 2 3 1 2 3 4 5`, LH `5 4 3 2 1 3 2 1`. Standard white-key group.
- **F# minor** — F# G# A B C# D E F#. **RH `2 3 1 2 3 1 2 3`**, **LH `4 3 2 1 3 2 1 4`** (same shape as F#/Gb major — the tonic is a black key, so the thumb avoids it; RH starts on 2). ([pianoscales.org/minor](https://www.pianoscales.org/minor.html))

### 3.5 E major / C# minor

- **E major** — E F# G# A B C# D# E. RH `1 2 3 1 2 3 4 5`, LH `5 4 3 2 1 3 2 1`. Standard white-key group (last of C-G-D-A-E).
- **C# minor** — C# D# E F# G# A B C#. **RH `3 4 1 2 3 1 2 3`**, **LH `3 2 1 4 3 2 1 3`** (RH starts 3-4 on the two black keys; LH is the standard flat/black-key LH shape). ([pianoscales.org/minor](https://www.pianoscales.org/minor.html))

### 3.6 B major / G# minor  — ⚠ flagged conflict (B major LH)

- **B major** — B C# D# E F# G# A# B.
  - **RH `1 2 3 1 2 3 4 5`** — identical to the white-key group; thumb tucks after degree 3 (3 on D# → 1 on E).
  - **LH `4 3 2 1 4 3 2 1`** — the **exception**. LH **starts on finger 4** (not 5), and finger **4 crosses over the thumb after degree 4** (1 on E → 4 on F#). Reason: starting on 5 would force the thumb onto a black key (C#); starting on 4 keeps the thumb on the white keys E and B.
  - **⚠ Source conflict:** [Learn Jazz Standards](https://www.learnjazzstandards.com/blog/piano-scales/) lists B major LH as `5 4 3 2 1 3 2 1` — **this is incorrect** (it just copied the white-key shape). Three independent authorities — [pianogroove.com](https://www.pianogroove.com/jazz-piano-lessons/major-scale-fingerings/) (which states explicitly "all white-note scales share the LH fingering *except B major*"), [piano-keyboard-guide.com](https://www.piano-keyboard-guide.com/b-major-scale.html), and [pianoscales.org](https://www.pianoscales.org/major.html) — agree the correct, standard B-major LH is **`4 3 2 1 4 3 2 1`**. Use `4 3 2 1 4 3 2 1`.
- **G# minor** (= Ab minor enharmonically) — G# A# B C# D# E F# G#. **RH `3 4 1 2 3 1 2 3`**, **LH `3 2 1 3 2 1 4 3`**. (RH same as C# minor; LH is a rotation of the flat-key LH shape with 4 near the top.) ([pianoscales.org/minor](https://www.pianoscales.org/minor.html))

### 3.7 F# major / D# (Eb) minor — black-key exception

- **F# major / Gb major** — F# G# A# B C# D# E# F# (= Gb Ab Bb Cb Db Eb F Gb).
  - **RH `2 3 4 1 2 3 1 2`** — thumb tucks under after degree 4 (4 on B → 1 on C#).
  - **LH `4 3 2 1 3 2 1 4`** — thumb crosses happen so the thumb lands on the two white keys (B and E#/F); 4 brackets both ends.
  - Rule: F#/Gb is the *black-key exception* — fingers 2-3 fall on the 2-black-key group, 2-3-4 on the 3-black-key group, and the thumb takes the only two white keys. Cross-confirmed by [piano-keyboard-guide.com](https://www.piano-keyboard-guide.com/f-sharp-major-scale.html) and [pianoscales.org](https://www.pianoscales.org/major.html).
- **D# minor / Eb minor** — Eb F Gb Ab Bb Cb Db Eb. **RH `3 1 2 3 4 1 2 3`** (same as Eb major RH), **LH `2 1 4 3 2 1 3 2`**. ([pianoscales.org/minor](https://www.pianoscales.org/minor.html))

### 3.8 Db major / Bb minor — flat-key group

- **Db major / C# major** — Db Eb F Gb Ab Bb C Db.
  - **RH `2 3 1 2 3 4 1 2`** — thumb tucks after degree 3 (1 on F) and again after degree 6 (1 on C). RH starts on 2 to keep the thumb off Db.
  - **LH `3 2 1 4 3 2 1 3`** — the standard flat-key LH shape (thumbs on the white keys F and C; 4 on Gb).
  - Rule: classic flat-key major — "thumb plays C and F." ([pianoscales.org](https://www.pianoscales.org/major.html), [OKTAV](https://www.oktav.com/en/c/d-flat-major-scale-piano))
- **Bb minor** — Bb C Db Eb F Gb Ab Bb. **RH `2 1 2 3 1 2 3 4`**, **LH `2 1 3 2 1 4 3 2`**. ([pianoscales.org/minor](https://www.pianoscales.org/minor.html), [piano.org](https://piano.org/scales/minor/b-flat/))

### 3.9 Ab major / F minor — flat-key group

- **Ab major** — Ab Bb C Db Eb F G Ab.
  - **RH `3 4 1 2 3 1 2 3`** — RH starts 3-4 on Ab-Bb (the two black keys), thumb tucks after degree 2 (1 on C) and again after degree 5 (1 on F).
  - **LH `3 2 1 4 3 2 1 3`** — standard flat-key LH shape.
  - Cross-confirmed by [littleredpiano.com](https://littleredpiano.com/ab-major-scale-piano/) and [pianoscales.org](https://www.pianoscales.org/major.html).
- **F minor** — F G Ab Bb C Db Eb F. **RH `1 2 3 4 1 2 3 4`** (same shape as F major RH — tuck after degree 4), **LH `5 4 3 2 1 3 2 1`** (standard white-key LH; F minor's LH tonic F is a white key). ([pianoscales.org/minor](https://www.pianoscales.org/minor.html))

### 3.10 Eb major / C minor — flat-key group

- **Eb major** — Eb F G Ab Bb C D Eb.
  - **RH `3 1 2 3 4 1 2 3`** — RH starts on 3 (Eb is a black key); thumb tucks after degree 1 (1 on F) and after degree 5 (1 on C).
  - **LH `3 2 1 4 3 2 1 3`** — standard flat-key LH shape.
  - ([piano.org](https://piano.org/scales/major/e-flat/), [pianoscales.org](https://www.pianoscales.org/major.html))
- **C minor** — C D Eb F G Ab Bb C. **RH `1 2 3 1 2 3 4 5`**, **LH `5 4 3 2 1 3 2 1`** — identical to C major (tonic C is a white key, the flats fall under fingers that don't disturb the thumb). ([Piano With Jonny](https://pianowithjonny.com/piano-lessons/c-natural-minor-scale-the-complete-guide/), [pianoscales.org/minor](https://www.pianoscales.org/minor.html))

### 3.11 Bb major / G minor — flat-key group

- **Bb major** — Bb C D Eb F G A Bb.
  - **RH `2 1 2 3 1 2 3 4`** — RH starts on 2 (Bb black key), thumb tucks after degree 1 (1 on C) and after degree 4 (1 on F); ends on 4 (a la F major's "no-pinky" top).
  - **LH `3 2 1 4 3 2 1 3`** — standard flat-key LH shape.
  - ([pianoscales.org](https://www.pianoscales.org/major.html), [piano-lessons-info.com](https://www.piano-lessons-info.com/bflatscale.html))
- **G minor** — G A Bb C D Eb F G. **RH `1 2 3 1 2 3 4 5`**, **LH `5 4 3 2 1 3 2 1`** — standard white-key shape (tonic G is a white key). ([pianoscales.org/minor](https://www.pianoscales.org/minor.html))

### 3.12 F major / D minor

- **F major** — F G A Bb C D E F.
  - **RH `1 2 3 4 1 2 3 4`** — the white-key **RH exception**: thumb tucks after degree **4** (4 on Bb → 1 on C), not after 3. Reason: the only black key (Bb) falls on degree 4, and putting 4 there (rather than the thumb) keeps the thumb off Bb.
  - **LH `5 4 3 2 1 3 2 1`** — standard white-key LH (no exception for the LH).
  - ([PianoGroove](https://www.pianogroove.com/jazz-piano-lessons/major-scale-fingerings/), [piano-lessons-info.com](https://www.piano-lessons-info.com/f-major-scale.html))
- **D minor** — D E F G A Bb C D. **RH `1 2 3 1 2 3 4 5`**, **LH `5 4 3 2 1 3 2 1`** — standard white-key shape (Bb under finger 4 RH / 2 LH, doesn't disturb the thumb). ([piano.org](https://piano.org/scales/minor/d/), [pianoscales.org/minor](https://www.pianoscales.org/minor.html))

---

## 4. Status vs the current `fingerings.ts`

`src/lib/piano/fingerings.ts` currently hardcodes **6 major keys** (C, G, D, A, E, F)
for both hands, and any unlisted key falls back to the C-major white-key shape via
`oneOctaveSequence`. That fallback is **wrong for every black-key and flat-key scale,
and for B major's LH** — it will display incorrect fingerings for those keys (and for
all minor keys whose layout differs).

| Key | RH in file? | Correct per this doc | Action |
|-----|-------------|----------------------|--------|
| C, G, D, A, E major | ✅ correct | `1 2 3 1 2 3 4 5` / LH `5 4 3 2 1 3 2 1` | keep |
| F major | ✅ correct | RH `1 2 3 4 1 2 3 4` / LH `5 4 3 2 1 3 2 1` | keep |
| **B major** | ❌ falls back to C | RH `1 2 3 1 2 3 4 5` / **LH `4 3 2 1 4 3 2 1`** | **add (LH differs!)** |
| **F#/Gb major** | ❌ | RH `2 3 4 1 2 3 1 2` / LH `4 3 2 1 3 2 1 4` | **add** |
| **Db/C# major** | ❌ | RH `2 3 1 2 3 4 1 2` / LH `3 2 1 4 3 2 1 3` | **add** |
| **Ab major** | ❌ | RH `3 4 1 2 3 1 2 3` / LH `3 2 1 4 3 2 1 3` | **add** |
| **Eb major** | ❌ | RH `3 1 2 3 4 1 2 3` / LH `3 2 1 4 3 2 1 3` | **add** |
| **Bb major** | ❌ | RH `2 1 2 3 1 2 3 4` / LH `3 2 1 4 3 2 1 3` | **add** |
| All 12 minors | ❌ (no minor entries) | see §2 minor table | **add all** |

> ⚠ **Important caveat about the current encoding.** The file keys `RH_ONE_OCTAVE` /
> `LH_ONE_OCTAVE` by **tonic letter** (`KEY_META.tonic`, e.g. `"C"`, `"F"`). A bare letter is
> too coarse for the full set of 24 scales, for two reasons:
> - **It cannot encode accidental tonics at all** — `"F"` cannot represent F# vs F, and there is
>   no way to spell F#/Gb, Db/C#, Ab, Eb, Bb as distinct keys with the right fingerings. (This is
>   exactly why those scales currently fall back to the wrong C-major shape.)
> - **It cannot distinguish major from minor on the same letter**, and some of those pairs have
>   **different fingerings** — e.g. tonic `"B"`: B *major* RH is the white-key `1 2 3 1 2 3 4 5`
>   while B *minor* RH is also `1 2 3 1 2 3 4 5`, but their relationship to other B-letter cases and
>   the general inability to carry a mode means a letter key is unsafe. (Most same-letter major/minor
>   pairs here happen to share fingering — C/Cm, G/Gm, D/Dm, A/Am, E/Em, F/Fm, B/Bm — but relying on
>   that coincidence is fragile.)
>
> **Fix: key the table by the full `KeyId` (tonic + accidental + mode), not by bare tonic letter** — see §5.

---

## 5. How to encode this in `fingerings.ts`

The current module stores `Record<tonicLetter, number[]>` and tiles the one-octave
sequence across octaves with a standard join (octave note → finger 1 for RH / 5 for LH,
final note → 5 RH / 1 LH). That tiling machinery is fine and can stay. Two changes:

**(1) Key by `KeyId`, not tonic letter.** A bare letter can't represent F#/Gb/Db/etc. or
distinguish major vs minor. Switch the lookup tables to `Record<KeyId, number[]>` (or
`Record<KeyId, { rh: number[]; lh: number[] }>`). Example shape:

```ts
// Each entry = ONE-OCTAVE ASCENDING sequence (8 fingers, degree 1..8).
// Descending is the reverse; multi-octave tiling reuses the existing join logic
// (octave-join note → 1 for RH / 5 for LH; final top note → 5 RH / 1 LH).
const SCALE_FINGERINGS: Record<KeyId, { rh: number[]; lh: number[] }> = {
  // --- Majors ---
  "C":      { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
  "G":      { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
  "D":      { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
  "A":      { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
  "E":      { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
  "B":      { rh: [1,2,3,1,2,3,4,5], lh: [4,3,2,1,4,3,2,1] }, // LH exception!
  "F#":     { rh: [2,3,4,1,2,3,1,2], lh: [4,3,2,1,3,2,1,4] }, // == Gb
  "Db":     { rh: [2,3,1,2,3,4,1,2], lh: [3,2,1,4,3,2,1,3] }, // == C#
  "Ab":     { rh: [3,4,1,2,3,1,2,3], lh: [3,2,1,4,3,2,1,3] },
  "Eb":     { rh: [3,1,2,3,4,1,2,3], lh: [3,2,1,4,3,2,1,3] },
  "Bb":     { rh: [2,1,2,3,1,2,3,4], lh: [3,2,1,4,3,2,1,3] },
  "F":      { rh: [1,2,3,4,1,2,3,4], lh: [5,4,3,2,1,3,2,1] },
  // --- Natural minors (same fingering for harmonic & melodic minor) ---
  "Am":     { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
  "Em":     { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
  "Bm":     { rh: [1,2,3,1,2,3,4,5], lh: [4,3,2,1,4,3,2,1] }, // LH exception
  "F#m":    { rh: [2,3,1,2,3,1,2,3], lh: [4,3,2,1,3,2,1,4] },
  "C#m":    { rh: [3,4,1,2,3,1,2,3], lh: [3,2,1,4,3,2,1,3] },
  "G#m":    { rh: [3,4,1,2,3,1,2,3], lh: [3,2,1,3,2,1,4,3] }, // == Abm
  "Ebm":    { rh: [3,1,2,3,4,1,2,3], lh: [2,1,4,3,2,1,3,2] }, // == D#m
  "Bbm":    { rh: [2,1,2,3,1,2,3,4], lh: [2,1,3,2,1,4,3,2] },
  "Fm":     { rh: [1,2,3,4,1,2,3,4], lh: [5,4,3,2,1,3,2,1] },
  "Cm":     { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
  "Gm":     { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
  "Dm":     { rh: [1,2,3,1,2,3,4,5], lh: [5,4,3,2,1,3,2,1] },
};
```

> Adjust the literal `KeyId` strings to match the project's actual `KeyId` union /
> `KEY_META` ids — confirm against `src/lib/music.ts` / `src/lib/types.ts` before pasting.
> The enharmonic pairs (F#/Gb, Db/C#, G#m/Abm, Ebm/D#m) share fingering, so map both ids to
> the same entry however `KeyId` spells them.

**(2) Representing the tuck/cross point (the owner's "bring my thumb up" cue).**
The tuck/cross point is **derivable, not separately stored**: in the ascending sequence it
is simply *the index where the finger number drops back to `1`* (RH thumb tuck) or, for the
LH, *the index where it jumps back up to `3`/`4`* after a `1` (the cross-over). Derive it
rather than hand-maintaining a second array:

```ts
// RH ascending: a tuck is any position (after the first) where finger === 1.
// LH ascending: a cross is any position where the finger jumps UP from the
// previous (e.g. 1 -> 3, or 1 -> 4) — the long finger crossing over the thumb.
function tuckIndices(seq: number[], hand: Hand): number[] {
  const out: number[] = [];
  for (let i = 1; i < seq.length; i++) {
    if (hand === "right" && seq[i] === 1) out.push(i);
    if (hand === "left" && seq[i] > seq[i - 1] && seq[i - 1] === 1) out.push(i);
  }
  return out;
}
```

This keeps a single source of truth (the finger array) and lets the UI mark the
"thumb comes up here" notes by computing `tuckIndices` on the fly. Keep the existing
multi-octave tiling join (`joinFinger`/`topFinger`) exactly as-is — it is correct and
hand-agnostic. Update `hasCanonicalFingering` to check membership in `SCALE_FINGERINGS`
by `KeyId` (now true for all 24 keys).

---

## Sources

- [Practising the Piano — The Principles of Scale Fingering](https://practisingthepiano.com/principles-scale-fingerings/) — thumb-under vs finger-over mechanics, thumb-avoids-black-keys rule.
- [PianoGroove — Major Scale Fingerings](https://www.pianogroove.com/jazz-piano-lessons/major-scale-fingerings/) — grouping rules; "all white-key scales share LH fingering except B major; all black-key scales share LH except Gb."
- [Piano-Ology — Major Scale Fingering Charts (12 keys)](https://piano-ology.com/piano-technique/fingering-charts-12-major-scales/) — sharp/flat grouping, "thumbs play C and F" flat-key rule, Gb exception.
- [pianoscales.org — Major scales](https://www.pianoscales.org/major.html) and [Minor scales](https://www.pianoscales.org/minor.html) — primary per-note fingering charts, both hands, all keys (major + natural minor).
- [piano-keyboard-guide.com — B major](https://www.piano-keyboard-guide.com/b-major-scale.html) and [F# major](https://www.piano-keyboard-guide.com/f-sharp-major-scale.html) — independent confirmation of the B-major LH exception and the F#/Gb pattern.
- [littleredpiano.com — Ab major](https://littleredpiano.com/ab-major-scale-piano/) — independent confirmation of Ab major both hands.
- [piano.org — Eb major](https://piano.org/scales/major/e-flat/), [D minor](https://piano.org/scales/minor/d/), [Bb minor](https://piano.org/scales/minor/b-flat/) — independent confirmation.
- [OKTAV — Db major scale](https://www.oktav.com/en/c/d-flat-major-scale-piano) — Db major both hands.
- [piano-lessons-info.com — F major](https://www.piano-lessons-info.com/f-major-scale.html), [Bb major](https://www.piano-lessons-info.com/bflatscale.html), [Ab major](https://www.piano-lessons-info.com/a-flat-major-scale.html).
- [Piano With Jonny — C natural minor](https://pianowithjonny.com/piano-lessons/c-natural-minor-scale-the-complete-guide/) — C minor confirmation.
- [Hoffman Academy — B minor](https://www.hoffmanacademy.com/blog/b-minor-piano-scale) — B minor LH exception confirmation.
- [Hear and Play — Fingering of the Melodic Minor Scale (12 keys)](https://www.hearandplay.com/main/the-fingering-of-the-melodic-minor-scale) — confirms natural/harmonic/melodic minor of a key share fingering.
- [Learn Jazz Standards — Piano Scales in 12 Keys](https://www.learnjazzstandards.com/blog/piano-scales/) — used for cross-check; **note its B-major LH (`5 4 3 2 1 3 2 1`) is an error** — see §3.6.

*Compiled 2026-06-17. All non-obvious keys cross-checked against ≥2 independent sources.*
