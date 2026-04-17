# Piano — Builder Brief

Ground truth specs (read these first): `~/Shared/Piano/`
- `Agent Context.md` — orientation + non-negotiables
- `Piano.md` — vision + MVP scope + layers
- `The Progression — Skill Tree.md` — curriculum, Trinity backbone, 5 phases, ladders (ear/expression/improv), chain logic
- `The Practice Loop.md` — 5-slot Piano Stand, warmup rotations, chain drill library spec, ghost key, first-session-back
- `The Tree — Visible Progression.md` — Key Map / Song Shelf / Your Arc / Drill Mosaic / Skill Graph; MVP ships Key Map + Song Shelf + Your Arc
- `Anti-Dropoff Design.md` — language rules, no streaks, [Just play] escape hatch, accumulation-gamification, done lines
- `Evidence & Pedagogy.md` — research substrate (only skim if pushing back on a spec)

## Non-negotiables

1. **Permission-giving language only.** "Open the file." "Come in." "That counts." NEVER: "Start your session", "Keep your streak", "Great job! +50 XP", "Complete today's routine", "You haven't played in N days".
2. **No streaks. No XP. No badges. No percent-to-next-grade. No confetti. No emojis in UI copy.**
3. **Accumulation-only metrics.** Total hours, sessions, pieces — only grow, never decrease, never reset.
4. **[Just play] always visible top-right.** Bypasses 5-slot view, drops into Free slot, counts as full session.
5. **Chain drills always end with a song reference** (instant musicality).
6. **First-session-back protocol:** on 3+ day gap, downshift session, silence ear moment, one warm acknowledgment.
7. **Decision elimination:** app picks ghost key, warmup, chain drill, ear round. User picks pieces + whether to show up.
8. **Tone:** thoughtful older sibling, calm warm presence, never preachy, never hype.

## Stack

- Next.js 16 (App Router, Turbopack default)
- TypeScript strict
- Tailwind v4 (tokens in `globals.css` via `@theme inline`)
- Tone.js for audio
- localStorage for persistence (no backend)
- Deploys to Vercel

## Types

See `src/lib/types.ts` — `AppState`, `SessionLog`, `ChainDrill`, `Warmup`, `EarRound`, `Piece`, `UnlockCard`, `ArcEvent`, etc.
See `src/lib/music.ts` — scale/triad/progression helpers, `KEY_META`, circle of fifths arrays.
