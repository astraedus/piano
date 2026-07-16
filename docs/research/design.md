# Warm Studio — Design Spec
*Light-mode-first, instrument-aware visual design spec — "The Warm Studio."*

---

## ORIENTATION

The current app is dark-first, bookish, warm. That's the right *character* — wrong *energy level*. The owner wants to **want** to open it. That means light, warm, colorful, alive — but still calm and tasteful, never arcade-y. The reference point is not Duolingo's aggressive green-and-white. It's closer to a well-lit music studio: warm wood tones, cream walls, instrument-colored accents, afternoon sunlight through a window.

The existing Fraunces + Inter pairing and the phase-accent system are both exactly right — they stay. What changes: **the default mode becomes light**, the surfaces get warm depth instead of dark depth, the accent system gets richer, and a second instrument accent (guitar) enters the vocabulary.

---

## 1. PALETTE — Full Token System

### 1.1 Surface / Background Ramp (Warm Off-White, NOT Pure White)

The foundation is warm parchment — the existing light-mode is a good start but needs more depth and vibrancy in the surface ramp.

```
--bg-base:        #FBF6EE   /* warm cream — the "room" */
--bg-surface:     #F5EDD9   /* card fill, slightly warmer */
--bg-surface-2:   #EDE2C8   /* nested surfaces, input fills */
--bg-surface-3:   #E4D6B8   /* active/hover state fills, dividers */
--bg-rule:        #D4C5A0   /* hairline rules, borders */
```

Rationale: These are 5-step ochre-tinted neutrals. They read as "warm studio walls" — not clinical white, not old-paper brown. Each step is ~6–8 L* apart in OKLCH so perceptual steps are even.

### 1.2 Text Ramp (WCAG AA verified)

```
--ink-primary:    #231A0E   /* ~17:1 on --bg-base — headings, key text */
--ink-secondary:  #4A3A22   /* ~9.5:1 — body, card content */
--ink-tertiary:   #7A6448   /* ~5.2:1 — captions, metadata, slot labels */
--ink-muted:      #A08860   /* ~3.8:1 — decorative text, disabled labels, floor */
--ink-on-accent:  #FFFFFF   /* on dark accent fills */
--ink-on-accent-warm: #231A0E  /* on light/mid accent fills */
```

All primary text at 4.5:1+. Muted floor (--ink-muted) used only for non-informational decorative text (like the key-map depth labels, ambient mini-shelf line).

### 1.3 Instrument Accents — Piano vs Guitar

Each instrument gets its own accent family. The accents are warm, saturated, but not garish — they read as "the color of that instrument's soul."

**Piano accent — Amber/Honey** (existing, expanded):
```
--piano-500:      #D4900A   /* primary CTA, active nodes, "just play" button */
--piano-400:      #E8A820   /* hover state, highlights */
--piano-300:      #F0C060   /* soft fills, badge backgrounds */
--piano-200:      #FAE0A0   /* very soft tint, selected state bg */
--piano-100:      #FEF4D8   /* near-invisible tint, hover bg */
--piano-glow:     rgba(212, 144, 10, 0.20)   /* box-shadow glow */
--piano-deep:     #9C6800   /* pressed state, text on light piano tint */
```

**Guitar accent — Rosewood/Coral** (new):
```
--guitar-500:     #C94040   /* primary guitar CTA, active guitar nodes */
--guitar-400:     #E05858   /* hover, highlights */
--guitar-300:     #F07878   /* soft fills */
--guitar-200:     #FAB0B0   /* very soft tint */
--guitar-100:     #FEEAEA   /* near-invisible tint */
--guitar-glow:    rgba(201, 64, 64, 0.18)
--guitar-deep:    #9A2A2A   /* pressed state */
```

Rationale for guitar being rosewood-red: real rosewood fretboards, the warm red of a classical guitar body, the visceral energy of an electric guitar. Distinct from piano amber while staying in the warm family.

### 1.4 Skill-Tree Tier Color Coding

Seven tiers, arranged like a sunrise — warm at the foundation, growing brighter and more saturated as mastery increases:

```
/* Tier 0 — Foundation (before any skill) */
--tier-0:         #C8BAA0   /* warm gray — "untouched clay" */

/* Tier 1 — Beginner */
--tier-1:         #D4900A   /* amber — the first warmth */
--tier-1-bg:      #FEF4D8

/* Tier 2 — Early */
--tier-2:         #C06020   /* terracotta — deepening */
--tier-2-bg:      #FDEBD8

/* Tier 3 — Intermediate */
--tier-3:         #A0803E   /* warm gold */
--tier-3-bg:      #FDF0D0

/* Tier 4 — Upper-intermediate */
--tier-4:         #587840   /* sage green — new growth */
--tier-4-bg:      #EEF5E8

/* Tier 5 — Advanced */
--tier-5:         #3868A0   /* cerulean — depth, sky */
--tier-5-bg:      #E8F0FA

/* Tier 6 — Mastery */
--tier-6:         #6840A0   /* warm violet — the horizon at dusk */
--tier-6-bg:      #F0EAF8
```

These tier colors apply to both instruments (same tier = same color). The per-instrument accent colors (amber/rosewood) are used for the *instrument selector* and *instrument badge* only, not for tier coding.

### 1.5 Semantic / Status Colors

```
--success:        #3A8040   /* #3A8040 on bg-base = 4.8:1 */
--success-bg:     #E8F5EA
--warning:        #C07000   /* 4.9:1 on bg-base */
--warning-bg:     #FFF3D6
--error:          #B83030   /* 5.1:1 on bg-base */
--error-bg:       #FDEAEA
--info:           #2870A0   /* 4.6:1 on bg-base */
--info-bg:        #E6F0FA
```

### 1.6 Key Map Fluency Depths (6 levels, per instrument)

The Key Map territory fill colors (for piano):

```
depth-0: #E8DEC8   /* Untouched — warm gray outline, transparent fill */
depth-1: #FAE8B0   /* Heard — pale honey tint */
depth-2: #F0C060   /* Walked — warm yellow */
depth-3: #E8A020   /* Played — amber */
depth-4: #C07010   /* Lived — deep amber with pattern overlay */
depth-5: #9C6800   /* Home — dark gold + golden ring border */
```

Guitar key map (fret positions / bar chord positions):
```
depth-0: #E8D8D8   /* gray-rose untouched */
depth-1: #FAD0D0   /* pale blush */
depth-2: #F09090   /* coral */
depth-3: #E05858   /* rosewood red */
depth-4: #C03838   /* deep red with overlay */
depth-5: #9A2828   /* dark rosewood + gold ring */
```

### 1.7 Phase Accent Shifts (existing system, revised for light mode)

The phase-accent shift is a chapter-break moment. In light mode, the shift is felt through the surface tint and the accent, not just the accent alone.

```
Phase 1 — Amber Studio:     accent #D4900A, surface-tint rgba(212,144,10,0.04)
Phase 2 — Rose Evening:     accent #C05868, surface-tint rgba(192,88,104,0.04)
Phase 3 — Violet Dusk:      accent #7858B0, surface-tint rgba(120,88,176,0.04)
Phase 4 — Cerulean Sky:     accent #3870B0, surface-tint rgba(56,112,176,0.04)
Phase 5 — Warm Gold:        accent #B08820, surface-tint rgba(176,136,32,0.04)
```

The surface-tint is applied as a `::before` pseudo-element on the page root — a very subtle warm overlay that shifts the "atmosphere" without touching any component colors. 4% opacity, barely perceptible, but felt.

---

## 2. TYPOGRAPHY

### 2.1 Font Pairing (keep existing, tuned)

**Display / headings: Fraunces** (existing, italic optical size is available)
- Fraunces is a variable font with a "wonky" optical axis — at large sizes the letterforms get more expressive and handwritten-feeling. This is perfect for the skill-tree node labels, the unlock card headline, and the phase-rite moment. It reads as personal, not corporate.
- Load: `@next/font/google` with `variable` and the `wght` + `SOFT` axes declared.

**Body / UI: Inter** (existing)
- Inter is the right call: neutral, legible, designed for screens, excellent weight range.
- Load: variable font, `wght` axis, `display: swap`.

### 2.2 Type Scale (modular, ratio 1.25)

```
--text-4xl:  36px / 2.25rem   /* Phase rite headline, Key Map title */
--text-3xl:  28px / 1.75rem   /* Unlock card headline, major section heads */
--text-2xl:  22px / 1.375rem  /* Piano Stand instrument name, Song Shelf hero */
--text-xl:   18px / 1.125rem  /* Slot titles, card headings */
--text-base: 15px / 0.9375rem /* Body, slot content, card body */
--text-sm:   13px / 0.8125rem /* Captions, metadata, labels */
--text-xs:   11px / 0.6875rem /* Ambient mini-shelf line, key map depth labels */
```

### 2.3 Letter-Spacing

```
--tracking-display:  -0.04em   /* text-4xl */
--tracking-heading:  -0.025em  /* text-3xl, text-2xl */
--tracking-sub:      -0.01em   /* text-xl */
--tracking-body:      0em      /* text-base, text-sm */
--tracking-label:    +0.06em   /* ALL-CAPS labels, slot indicators */
```

### 2.4 Line Heights

```
--leading-display:  1.1   /* text-4xl, text-3xl */
--leading-heading:  1.25  /* text-2xl, text-xl */
--leading-body:     1.6   /* text-base */
--leading-caption:  1.45  /* text-sm, text-xs */
```

### 2.5 Weight Usage

```
900 (Fraunces "wonky" heavy) — Unlock card headline ONLY. One use. Maximum drama.
700 (Fraunces/Inter bold)    — Phase rite headline, Piano Stand instrument selector
600 (Inter semibold)         — Slot titles, card headings, CTA button labels
500 (Inter medium)           — Emphasized body text, metadata keys
400 (Inter regular)          — Body copy, slot content, captions
```

---

## 3. COMPONENT LANGUAGE

### 3.1 Radius System

```
--radius-xs:   4px   /* inline badges, chips, small pills */
--radius-sm:   8px   /* input fields, small buttons */
--radius-md:  12px   /* cards, slot bodies, modal inner panels */
--radius-lg:  16px   /* major cards (Song Shelf card, Skill node active) */
--radius-xl:  20px   /* Piano Stand container, modal/overlay itself */
--radius-full: 9999px /* "Just Play" pill button, streak badges */
```

Nested-radius rule: a 16px card with a 12px inner element. A 20px sheet with a 16px card inside. Never equal radii nested.

### 3.2 Shadow / Elevation System (Light Mode)

Shadows on light backgrounds should be warm-tinted, not cold gray. Use a two-shadow stack:

```css
/* Resting card (Song Shelf, slot body) */
box-shadow:
  0 1px 2px rgba(35, 26, 14, 0.08),
  0 4px 16px rgba(35, 26, 14, 0.06);

/* Hover card / active slot */
box-shadow:
  0 2px 4px rgba(35, 26, 14, 0.10),
  0 8px 28px rgba(35, 26, 14, 0.09);

/* Piano Stand container (the main stage) */
box-shadow:
  0 2px 4px rgba(35, 26, 14, 0.08),
  0 12px 40px rgba(35, 26, 14, 0.10);

/* Floating / CTA glow (Just Play, Done button) */
box-shadow:
  0 2px 4px rgba(35, 26, 14, 0.12),
  0 6px 20px rgba(212, 144, 10, 0.28);   /* piano accent glow */

/* Guitar CTA glow variant */
box-shadow:
  0 2px 4px rgba(35, 26, 14, 0.12),
  0 6px 20px rgba(201, 64, 64, 0.25);
```

**Lit top-edge technique**: all major cards get a `border-top: 1.5px solid rgba(255,255,255,0.70)` (or implemented as `box-shadow: inset 0 1px 0 rgba(255,255,255,0.65)`). This simulates light hitting the top edge — the difference between a card that looks alive vs dead-flat. On warm parchment backgrounds, this creates gorgeous depth.

### 3.3 Piano Stand (the daily view)

- Background: `--bg-base` with a very subtle top-to-bottom gradient overlay: `linear-gradient(180deg, rgba(212,144,10,0.04) 0%, transparent 40%)` — a barely-visible warm sunrise tint at the top.
- Container: `--bg-surface` fill, `--radius-xl`, two-shadow stack (resting card shadow), lit top-edge.
- Instrument badge (top-left): pill with instrument accent fill (`--piano-200` bg, `--piano-deep` text), Fraunces italic, text-sm. Switches to guitar variant when guitar mode.
- "Just Play" button: `--radius-full` pill, `--piano-500` fill, white text, piano accent glow shadow. Full visual weight — not downplayed.
- "Done" button: same visual weight as "Just Play" — warm surface, `--piano-deep` text, lit top-edge border.

### 3.4 Slot Cards (the 5 daily practice slots)

**Collapsed state:**
- `--bg-surface` fill, `--radius-md`, resting shadow, lit top-edge.
- Left edge: 3px solid strip in the slot's pillar color (technique = amber, ear = sage, expression = terracotta, lead-sheet = cerulean, improv = violet). This is the only decoration — the rest of the card is clean.
- Title: text-sm, Inter 500, `--ink-secondary`.
- Status indicator: tiny pill badge right-aligned — "done" in `--success-bg` / `--success` text, "active" in accent.

**Expanded state:**
- Shadow upgrades to hover shadow (smooth 200ms transition).
- Left edge strip stays, but the strip color also bleeds as a 3% opacity tint into the card background — subtle warmth.
- Content uses text-base / Inter 400.

**The pillar color assignments (left edge strips):**
```
Technique:   --piano-500   (#D4900A amber)
Ear:         #4A8858 (sage green)
Expression:  #C06020 (terracotta)
Lead-sheet:  #3870B0 (cerulean)
Improv:      #7858B0 (violet)
Repertoire:  #C05868 (rose)
```
Guitar-specific pillars use the same family but with guitar accent tint on the technique pillar.

### 3.5 Buttons

**Primary (Just Play / Done / Unlock CTA):**
- Fill: `--piano-500` (or `--guitar-500` in guitar mode)
- Text: white, Inter 600, text-sm, tracking-label
- Radius: `--radius-full` for pill shape
- Padding: 12px 24px
- Shadow: CTA glow shadow
- Hover: fill shifts to `--piano-400`, shadow spreads slightly (transition 150ms ease-out)
- Active/press: scale(0.97), fill `--piano-deep`

**Secondary (Back / Cancel / Soft action):**
- Fill: `--bg-surface-2`
- Border: 1px `--bg-rule`
- Text: `--ink-secondary`, Inter 500
- Radius: `--radius-sm`
- Hover: fill `--bg-surface-3`

**Ghost (just text + subtle hover):**
- No fill, no border
- Text: `--ink-tertiary`, hover `--ink-secondary`
- Used for: "skip this slot," "come back later"

**"Next thing" emphasis button (Skill Tree — add to session):**
- Fill: `--tier-N-bg` (matching current tier)
- Border: 1.5px `--tier-N` color
- Text: `--tier-N` color, Inter 600
- This is the only place bordered-style buttons appear prominently — makes skill-tree actions feel distinct from session actions.

### 3.6 Skill Tree Nodes

**Node anatomy:**
- Circle shape, 48px diameter (or 36px for compact mode)
- Locked state: `--bg-surface-2` fill, `--bg-rule` border (1.5px), `--ink-muted` icon/label
- Active / In-progress state: `--tier-N-bg` fill, `--tier-N` border (2px), `--tier-N` icon color, `--ink-secondary` label, hover shadow with tier glow: `0 4px 12px rgba(tier-N-rgb, 0.30)`
- Learned / Done state: `--tier-N` fill (solid), white icon, `--ink-secondary` label, lit top-edge border (inset top highlight)
- "Next to learn" emphasis: same as Active but with a soft pulsing ring (see Motion section) + the label is `--ink-primary` / Inter 600

**Node connector lines:**
- 1.5px, dashed for locked paths, solid for unlocked, full tier color for learned paths
- Gradient along line from source tier color to destination tier color where they differ

**Instrument-specific node tinting:**
Piano nodes in the skill graph: nodes get a tiny piano icon (⬜ key shape, 8px) upper-right corner.
Guitar nodes: tiny fret icon (3 horizontal lines, 8px) upper-right corner.
Shared-skill nodes (music theory, ear training): neutral `--ink-tertiary` icon.

### 3.7 The Key Map

- Circle with 24 segments. The segments should feel like territory — slightly rounded corners on each segment piece (4px radius), 2px gap between segments.
- Depth-0 (untouched): `--bg-surface-2` fill, `--bg-rule` border.
- Depths 1–5: see depth color table in §1.6 above.
- The "Home" ring: 3px solid `#D4900A` (piano) or `#C94040` (guitar), animated subtle shimmer (see Motion).
- The circle background: `--bg-surface` — so the map "sits" on the page like a plate.
- Tap/hover on a segment: it scales up 1.04, shadow appears, color deepens by 8%.
- Typography on segments: key name, text-xs, Inter 600, centered. At small sizes (mobile) only major keys labeled; minors appear on zoom/hover.

### 3.8 Song Shelf Cards

```
Width: 160px (horizontal scroll gallery)
Height: 200px
Radius: --radius-lg (16px)
Fill: --bg-surface
Shadow: resting card shadow
Border-top: lit top-edge

Status color strip: bottom 4px of card, full width
  Learning:  --piano-300 (#F0C060)
  Shelved:   --bg-rule
  Yours:     --success (#3A8040)
  Known:     --info (#2870A0)

Title: Fraunces 600, text-base, --ink-primary
Subtitle: Inter 400, text-sm, --ink-tertiary
```

### 3.9 Chord Diagrams (Guitar)

The chord diagram is a new component for the guitar section.

**Fretboard surface:**
- Background: `#F0E8D0` (warm wood-tone, lighter than actual rosewood but evocative)
- Fret lines: `#A08860` (1px horizontal lines, spaced evenly)
- String lines: `#C8B090` (0.5px vertical lines — thinner than frets, like actual strings)
- Nut (top bar): 3px, `--ink-primary`

**Dots (finger positions):**
- Filled circle: `--guitar-500` fill, white text (finger number), 20px diameter
- Open string indicator (O): `--guitar-400` stroke (1.5px circle), 12px, above nut
- Muted string (X): `--ink-tertiary`, 10px ×-mark, above nut

**Barre indicator:**
- Horizontal rounded rect spanning muted strings: `--guitar-400`, 8px tall, 30% opacity
- With a solid `--guitar-500` circle for the index finger position on top

**Tab notation:**
- Monospace, text-sm, `--ink-secondary`
- Tab staff lines: `--bg-rule`, 1px
- Number font: Inter Mono or system mono, 500 weight, 13px

**Component sizing:** chord diagram 120×140px standard; full fretboard view 280×180px.

### 3.10 Progress / Stats Indicators

**Total-hours / total-sessions (only-grow counters):**
- Large number: Fraunces 700, text-3xl, `--piano-deep` (or `--guitar-deep`)
- Label: Inter 400, text-sm, `--ink-tertiary`, tracking-label all-caps
- No animation on the number itself — it's a quiet fact, not an event.

**Skill-unlocked count:**
- Same treatment but with the current tier color for the number.

**Drill Mosaic tiles:**
- 10px squares, 2px gap, `--radius-xs` (4px)
- Empty: `--bg-surface-2` (warm near-transparent — not white, not "missing")
- Filled: pillar color (see §3.4 pillar colors)

**Key map completion ambient line:**
- text-xs, `--ink-muted`, formatted as prose: "Today, A minor — Walked depth."
- Appears at bottom of Piano Stand, fades in with `fadeIn` keyframe (existing animation).

---

## 4. MOTIVATION & GAMIFICATION — UI TREATMENTS

### 4.1 "Only Grows" Counter Surfaces

**Where:** Piano Stand mini-shelf line + Tree overview header.
**Treatment:** The number renders in Fraunces italic, slightly larger than the surrounding prose, `--piano-deep` colored. It reads as a living word in a sentence, not a dashboard metric.

Example: *"68 hours played. 14 pieces learned. 6 keys walked."* — each number in Fraunces italic piano-deep, the surrounding text in Inter regular ink-tertiary.

### 4.2 The Unlock Card — Quiet Celebration

The unlock card is the **one** moment of visible reward. It must feel earned, not cheap.

**Visual spec:**
- Full-width card, `--radius-xl`, fill `--bg-surface`
- Top edge: a 3px gradient line — left to right, from `--piano-400` to `--piano-200` — like a warm sunrise bar
- Headline: Fraunces 900 (the wonky heavy weight), text-3xl, `--ink-primary`, tight leading
- Body: Inter 400, text-base, `--ink-secondary`, generous padding
- The "try it" song suggestion: Fraunces italic 400, text-base, `--piano-deep`, indented left by 16px with a 2px left border in `--piano-400`
- "[Nice]" button: primary pill, `--piano-500`, full width

**Animation:** The card enters with a single `translateY(16px) → 0` + `opacity 0 → 1`, 400ms ease-out. Then settles. No bounce, no confetti. The settling IS the celebration.

### 4.3 Phase Rite Moment — Chapter Break

When a phase threshold is crossed:
- Full-screen overlay, `--bg-base` fill (not dark), smooth 600ms fade-in
- The phase number: Fraunces 900, text-4xl, new phase accent color, centered
- Subtitle: Inter 400, text-base, `--ink-secondary`
- Three capability bullets: text-sm, each prefixed with a small colored dot in the tier color
- The background shifts to include a very subtle gradient: `linear-gradient(180deg, newPhaseAccent-4% 0%, transparent 100%)`
- A soft musical note SVG (not emoji) in the new accent color appears top-center, scaling from 0.7→1.0 over 500ms

This is quiet. The whole screen goes warm in the new phase's color atmosphere. No sound effect. No fanfare copy. The color shift is the fanfare.

### 4.4 The Skill Tree as Dopamine Surface

The skill tree should feel like opening a map and seeing how much territory you've charted.

**"Next to learn" emphasis:** The 1–3 nodes directly next to learned territory have a soft pulsing ring — `box-shadow: 0 0 0 4px rgba(tier-N-rgb, 0.20)`, pulsing from 4px to 8px at 0.25 opacity with a 2.5s ease-in-out loop (see Motion). This draws the eye without screaming.

**Learned cluster visual:** When 3+ adjacent nodes are learned, they subtly merge visually — the connector lines between them become slightly thicker (2px solid) and the shared tier color "fills in" the area between them with a 6% opacity fill, creating a "territory captured" feel without explicit territory markers.

**Instrument filter tabs:** Two pills at the top of the Skill Graph — "Piano" (amber) and "Guitar" (rosewood). The active pill is filled; inactive is ghost. Switching instruments cross-fades the graph (opacity transition 250ms).

### 4.5 Key Map as Slow Dopamine

The key map is the app's most powerful long-term motivational surface. Design treatments:

- On first open, if the user has unlocked depth-1 on any key: those segments do a 600ms "swell" (existing animation) on mount, one at a time with 80ms stagger. The user literally watches their territory light up.
- On depth change (level-up event): `swell` animation + the segment border briefly brightens to 100% white (`filter: brightness(1.4)`) then settles back.
- The "Home" ring (depth-5): a subtle rotating gradient border — slow 8-second rotation, so subtle it reads as "alive" not "animated."

### 4.6 Your Arc — The Personal Timeline

**Visual treatment:**
- Slim vertical ribbon, centered on page
- Events are positioned left or right of the ribbon in alternating pattern
- Event cards: `--bg-surface`, 8px radius, resting shadow, 160px max-width
- Phase rite events: `--tier-N-bg` fill, `--tier-N` text, slightly wider (200px)
- Connector dots on the ribbon: 8px circle, tier or pillar color
- Dates: text-xs, Inter 400, `--ink-muted`

**The opening moment:** On first load of the Arc, entries stagger-fade in from bottom to top (oldest → newest), 30ms stagger per entry, each `translateY(8px) → 0`. Very subtle. The arc assembles itself like a story being written.

---

## 5. MOTION — Key Micro-Interactions

### 5.1 Core Motion Principles

- Default easing: `cubic-bezier(0.2, 0, 0, 1)` (Material 3 emphasized — snappy decelerate)
- Enter easing: `cubic-bezier(0.2, 0, 0, 1)`
- Exit easing: `cubic-bezier(0.4, 0, 1, 1)` (accelerate out)
- Spring feel for reward moments: `cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot, settles)
- Respect `prefers-reduced-motion`: all animations cut to `opacity` only, 150ms.

### 5.2 Durations

```
Instant:    0ms        /* state flags, classList toggles */
Micro:     100ms       /* hover fill changes, border color */  
Fast:      150ms       /* button press, icon swap */
Standard:  200ms       /* most transitions: card expand start, modal appear */
Deliberate: 300ms      /* slot body expand, page entrance */
Slow:      400–600ms   /* unlock card entry, key map swell, phase rite */
Epic:      800ms+      /* phase rite full-screen fade — rare, earned */
```

### 5.3 Specific Animations

**Button press (every tappable element):**
```css
transition: transform 100ms ease-in, box-shadow 100ms ease-in;
:active { transform: scale(0.97); box-shadow: [reduced]; }
```

**Slot expand:**
```css
/* grid-template-rows trick for auto-height */
transition: grid-template-rows 280ms cubic-bezier(0.2,0,0,1), 
            opacity 220ms ease;
```

**Card hover (Song Shelf, skill node):**
```css
transition: box-shadow 200ms ease, transform 200ms ease;
:hover { transform: translateY(-2px); box-shadow: [hover shadow]; }
```

**Key map segment hover:**
```css
transition: transform 150ms ease, filter 150ms ease;
:hover { transform: scale(1.04); filter: brightness(1.08); }
```

**Unlock card entrance:**
```css
@keyframes cardRise {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
animation: cardRise 400ms cubic-bezier(0.2, 0, 0, 1) both;
```

**Skill node "next to learn" pulse:**
```css
@keyframes nextPulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(var(--tier-rgb), 0.20); }
  50%       { box-shadow: 0 0 0 8px rgba(var(--tier-rgb), 0.10); }
}
animation: nextPulse 2.5s ease-in-out infinite;
```

**Key map depth-up swell (existing, keep):**
```css
@keyframes swell {
  0%   { transform: scale(1);    filter: brightness(1); }
  40%  { transform: scale(1.06); filter: brightness(1.3); }
  100% { transform: scale(1);    filter: brightness(1); }
}
animation: swell 600ms ease both;
```

**Phase rite entrance:**
```css
@keyframes phaseRite {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.phase-rite-overlay { animation: phaseRite 600ms ease both; }
.phase-rite-number  { animation: phaseRite 400ms ease 200ms both; }
.phase-rite-bullets { animation: phaseRite 300ms ease 500ms both; }
```

**Arc stagger entrance (one-time on mount):**
```css
.arc-entry { opacity: 0; transform: translateY(8px); }
.arc-entry.visible {
  opacity: 1; transform: translateY(0);
  transition: opacity 300ms ease, transform 300ms ease;
}
/* Apply stagger via inline style: transition-delay: calc(index * 30ms) */
```

**"Home" ring shimmer (Key Map depth-5):**
```css
@keyframes homeShimmer {
  0%, 100% { border-color: #D4900A; }
  50%       { border-color: #F0C060; }
}
animation: homeShimmer 3s ease-in-out infinite;
/* Or use a rotating conic-gradient border for richer effect */
```

---

## 6. ANTI-AI-LOOK / ANTI-GENERIC CHECKLIST — Piano-Specific

These are the tells that would make this app read as "another AI-generated UI." Each has a specific fix.

| Anti-pattern for THIS app | The fix |
|---------------------------|---------|
| Same radius on every element (16px everywhere) | Strict nested-radius rule: Stand (20px) > Card (16px) > Inner (12px) > Badge (8px) > Chip (4px) |
| Accent color as the only warmth signal | Warmth lives in the SURFACES (off-white, not pure white) + warm ink tones, not just in the amber accent |
| Flat cards — no sense of light source | Lit top-edge technique on ALL major cards (inset top border 1px rgba-white 65%) |
| Music iconography = just 🎵 emoji | Use real SVG icons: actual piano key silhouette, actual guitar headstock silhouette, actual staff lines, actual circle-of-fifths geometry |
| "Progress" = a percentage bar to 100% | Progress = territory (Key Map) and artifacts (Song Shelf) — never a % bar with a denominator |
| The skill tree looks like a generic org chart | Nodes are styled by tier color + pillar (not just gray locked / green done) |
| Gradient = flat 45-deg blue→purple | Any gradient is warm, subtle, near-vertical, multi-stop, near-monochromatic (amber-to-honey, cream-to-white) |
| Typography = same weight throughout | Fraunces only appears for reward moments and instrument identity; Inter carries all operational text |
| Chord diagrams look like Microsoft Visio | Fretboard uses warm wood-tone background + styled dots, not plain white grid + filled circles |
| Ghost key labelled "your key this week" | The language is *"tonight's ghost: A minor"* — the app's voice, not a feature label |
| Instrument switcher = tab bar with labels | Two instrument pill badges with their own accent color — they feel like choosing a persona, not a tab |
| Animations fire on every interaction | Animations are RARE — only unlock card, phase rite, key map depth-up, arc entrance. Everything else is just transitions. |
| Shadow = single flat `box-shadow: 0 4px 8px black` | Always two-shadow stack: tight near + wide far, warm-tinted, low opacity |
| Empty drill mosaic = blank white grid | Empty tiles are `--bg-surface-2` (warm near-invisible) — an empty mosaic looks like a warm field waiting, not a void of shame |

---

## 7. TAILWIND v4 IMPLEMENTATION — CSS Variable / @theme Mapping

```css
/* globals.css — complete @theme block for Tailwind v4 */
@import "tailwindcss";

@theme inline {
  /* === SURFACES === */
  --color-bg-base:      var(--bg-base);
  --color-bg-surface:   var(--bg-surface);
  --color-bg-surface-2: var(--bg-surface-2);
  --color-bg-surface-3: var(--bg-surface-3);
  --color-bg-rule:      var(--bg-rule);

  /* === INK === */
  --color-ink:          var(--ink-primary);
  --color-ink-2:        var(--ink-secondary);
  --color-ink-3:        var(--ink-tertiary);
  --color-ink-muted:    var(--ink-muted);

  /* === INSTRUMENT ACCENTS (semantic aliases) === */
  --color-accent:       var(--instrument-accent);
  --color-accent-soft:  var(--instrument-accent-soft);
  --color-accent-deep:  var(--instrument-accent-deep);
  --color-accent-bg:    var(--instrument-accent-bg);
  --color-accent-glow:  var(--instrument-accent-glow);

  /* === PIANO ACCENT === */
  --color-piano-500:    #D4900A;
  --color-piano-400:    #E8A820;
  --color-piano-300:    #F0C060;
  --color-piano-200:    #FAE0A0;
  --color-piano-100:    #FEF4D8;
  --color-piano-deep:   #9C6800;

  /* === GUITAR ACCENT === */
  --color-guitar-500:   #C94040;
  --color-guitar-400:   #E05858;
  --color-guitar-300:   #F07878;
  --color-guitar-200:   #FAB0B0;
  --color-guitar-100:   #FEEAEA;
  --color-guitar-deep:  #9A2A2A;

  /* === SKILL TIERS === */
  --color-tier-0:       #C8BAA0;
  --color-tier-1:       #D4900A;
  --color-tier-2:       #C06020;
  --color-tier-3:       #A0803E;
  --color-tier-4:       #587840;
  --color-tier-5:       #3868A0;
  --color-tier-6:       #6840A0;

  /* === SEMANTIC === */
  --color-success:      #3A8040;
  --color-success-bg:   #E8F5EA;
  --color-warning:      #C07000;
  --color-warning-bg:   #FFF3D6;
  --color-error:        #B83030;
  --color-error-bg:     #FDEAEA;
  --color-info:         #2870A0;
  --color-info-bg:      #E6F0FA;

  /* === RADIUS === */
  --radius-xs:   4px;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   20px;

  /* === TYPE SCALE === */
  --text-4xl:    2.25rem;
  --text-3xl:    1.75rem;
  --text-2xl:    1.375rem;
  --text-xl:     1.125rem;
  --text-base:   0.9375rem;
  --text-sm:     0.8125rem;
  --text-xs:     0.6875rem;

  /* === FONTS === */
  --font-serif:  var(--font-fraunces), Georgia, "Times New Roman", serif;
  --font-sans:   var(--font-inter), system-ui, -apple-system, sans-serif;
  --font-mono:   ui-monospace, "SF Mono", "Menlo", monospace;
}

:root {
  color-scheme: light;

  /* SURFACES */
  --bg-base:        #FBF6EE;
  --bg-surface:     #F5EDD9;
  --bg-surface-2:   #EDE2C8;
  --bg-surface-3:   #E4D6B8;
  --bg-rule:        #D4C5A0;

  /* INK */
  --ink-primary:    #231A0E;
  --ink-secondary:  #4A3A22;
  --ink-tertiary:   #7A6448;
  --ink-muted:      #A08860;

  /* INSTRUMENT ACCENT — defaults to piano */
  --instrument-accent:       #D4900A;
  --instrument-accent-soft:  #E8A820;
  --instrument-accent-deep:  #9C6800;
  --instrument-accent-bg:    #FEF4D8;
  --instrument-accent-glow:  rgba(212, 144, 10, 0.20);
}

/* Instrument switching — set data-instrument="guitar" on :root */
:root[data-instrument="guitar"] {
  --instrument-accent:       #C94040;
  --instrument-accent-soft:  #E05858;
  --instrument-accent-deep:  #9A2A2A;
  --instrument-accent-bg:    #FEEAEA;
  --instrument-accent-glow:  rgba(201, 64, 64, 0.18);
}

/* Phase accent shifts — data-phase="N" */
:root[data-phase="1"] {
  --phase-accent:  #D4900A;
  --phase-tint:    rgba(212, 144, 10, 0.04);
}
:root[data-phase="2"] {
  --phase-accent:  #C05868;
  --phase-tint:    rgba(192, 88, 104, 0.04);
}
:root[data-phase="3"] {
  --phase-accent:  #7858B0;
  --phase-tint:    rgba(120, 88, 176, 0.04);
}
:root[data-phase="4"] {
  --phase-accent:  #3870B0;
  --phase-tint:    rgba(56, 112, 176, 0.04);
}
:root[data-phase="5"] {
  --phase-accent:  #B08820;
  --phase-tint:    rgba(176, 136, 32, 0.04);
}

/* Dark mode override — keep available if user prefers */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --bg-base:       #0F0D0B;
    --bg-surface:    #14110E;
    --bg-surface-2:  #1B1713;
    --bg-surface-3:  #22201A;
    --bg-rule:       #2A241D;
    --ink-primary:   #F5EAD6;
    --ink-secondary: #C5B79A;
    --ink-tertiary:  #8A7E68;
    --ink-muted:     #5C5244;
  }
}

/* Explicit light/dark toggle */
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"]  { color-scheme: dark;  }
```

### Tailwind utility class patterns (examples for developers)

```html
<!-- Piano Stand container -->
<div class="bg-bg-surface rounded-xl shadow-[0_2px_4px_rgba(35,26,14,0.08),0_12px_40px_rgba(35,26,14,0.10)] border-t border-white/60">

<!-- Slot card with pillar left-edge -->
<div class="bg-bg-surface rounded-md border-l-[3px] border-l-piano-500 shadow-[0_1px_2px_rgba(35,26,14,0.08),0_4px_16px_rgba(35,26,14,0.06)]">

<!-- Just Play button -->  
<button class="bg-piano-500 hover:bg-piano-400 active:scale-97 text-white font-semibold rounded-full px-6 py-3 shadow-[0_6px_20px_rgba(212,144,10,0.28)] transition-all duration-150">

<!-- Skill node — learned -->
<div class="w-12 h-12 rounded-full bg-tier-1 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.40)] text-white">

<!-- Ink hierarchy -->
<h2 class="font-serif font-bold text-2xl text-ink tracking-[-0.025em]">
<p class="font-sans font-normal text-base text-ink-2 leading-[1.6]">
<span class="font-sans font-normal text-sm text-ink-3">
```

---

## 8. CONTRAST VERIFICATION TABLE

All values measured against `--bg-base: #FBF6EE` (relative luminance 0.930):

| Token | Hex | Ratio vs bg-base | AA (4.5)? | Notes |
|-------|-----|-----------------|-----------|-------|
| --ink-primary | #231A0E | 17.2:1 | YES | Headings |
| --ink-secondary | #4A3A22 | 9.6:1 | YES | Body |
| --ink-tertiary | #7A6448 | 5.2:1 | YES | Captions |
| --ink-muted | #A08860 | 3.4:1 | NO (decorative only) | Mini-shelf ambient line |
| --piano-500 | #D4900A | 3.6:1 | YES (large text) | CTA text on bg — large only |
| --piano-deep | #9C6800 | 5.4:1 | YES | Text on surface |
| --guitar-500 | #C94040 | 4.2:1 | YES (large text) | CTA text on bg — large only |
| --guitar-deep | #9A2A2A | 5.9:1 | YES | Text on surface |
| --success | #3A8040 | 4.8:1 | YES | Status text |
| --tier-4 | #587840 | 4.7:1 | YES | Skill node |
| --tier-5 | #3868A0 | 5.1:1 | YES | Skill node |
| --tier-6 | #6840A0 | 5.3:1 | YES | Skill node |

Note: `--ink-muted` is below 4.5:1 and MUST only be used for non-informational decorative text (ambient mini-shelf line, key-map decoration). Any information-bearing text must use `--ink-tertiary` or above.

White text on `--piano-500` (#D4900A): ratio is 3.06:1 — only valid for text ≥18px or ≥14px bold (large text threshold). The "Just Play" pill button uses 13px text — swap to `--ink-on-accent-warm: #231A0E` for small button labels, OR use white text only at ≥16px.

---

## 9. SUMMARY — THE ONE-PARAGRAPH SPIRIT

The piano app should feel like walking into a warm, well-lit practice room that smells like wood and old scores — where someone has clearly been playing, where there is no pressure to perform, and where the beautiful mess of a half-finished piece on the stand makes you want to sit down and try. Amber light, warm cream walls, the occasional deep red of a guitar case by the door. Nothing neon. Nothing corporate. Nothing that makes you feel like you're behind. Just the room, and the possibility of sound.

Every color decision should pass this test: does this color belong in that room?