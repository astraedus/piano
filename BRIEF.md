> NOTE: partially superseded — see "2026-06+ amendments" below. The soul + decision-elimination principles still hold.

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

## 2026-06+ amendments (current truth)

This brief is the original vision. Shipped reality has moved on it in a few places — these amendments are authoritative where they conflict with the list above.

- **(a) Non-negotiable #2 was deliberately overridden in V2 (2026-06-08, Anti-directed).** Confident gamification is now IN: XP, levels, and a forgiving streak, celebrated at session end. The rewrite was intentional, not drift. What stays banned: shame framing, "you haven't played in N days" guilt, and percent-to-next-grade.
- **(b) #1's spirit still holds even with gamification.** The language is still permission-giving and never nagging — gamification lives at the reward/end-of-session layer, it does not turn into pressure, guilt, or hype.
- **(c) Storage is localStorage-first with optional signed-in cloud sync.** localStorage remains the live working copy; a signed-in user gets optional cloud sync (Clerk + Neon) as the durable save. This supersedes "localStorage for persistence (no backend)" in the Stack section.
- **(d) Everything else in the brief still stands** — the soul, decision elimination, [Just play], accumulation metrics, first-session-back, chain-drills-end-with-a-song, and the tone all remain the contract.

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
