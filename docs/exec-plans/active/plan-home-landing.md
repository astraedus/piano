# Plan: serve a real landing pitch at `/` (PR #14 "Phase 2")

## The leak

`/` mounted `HomeGate`, which redirected any visitor without `state.firstOpenedAt`
straight to `/onboarding`. Every stranger arriving from search, Hacker News, or a
directory listing hit a questionnaire before being told what the app is. The
crawlable HTML at `/` was the app nav, a "Loading…" line, and a short intro block
under a practice stand that only exists after hydration.

## The shape of the fix

`/` becomes a router between two server-rendered outcomes, keyed off the signal
`HomeGate` already used, `state.firstOpenedAt`:

| Visitor | Sees |
| --- | --- |
| Crawler / JS disabled | the full pitch, in the initial HTML |
| First-time or un-onboarded | the full pitch, CTA into `/onboarding` |
| Onboarded (returning) | the practice stand, as before |

Nothing redirects any more. `/onboarding` is reached by clicking, which is what
makes the page worth crawling and worth linking to.

## Decisions

1. **The pitch is the server HTML, the app is the swap.** `HomeGate` renders the
   landing during SSR and the first client render (the existing hydration-safe
   mount gate), then swaps in `AppShell` + `PracticeStand` once state has
   hydrated and `firstOpenedAt` is set. The landing is a server component passed
   in as a prop, so it is real HTML in the response, not a hydration artifact.
2. **No pitch flash for the nightly user.** The layout's pre-paint boot script
   already parses `practice.state` to restore theme/phase/instrument. It now also
   sets `data-returning="1"` when `firstOpenedAt` is present, and CSS hides the
   landing (showing a small resume placeholder instead) under that attribute. A
   returning user never paints the pitch; a crawler, which runs no script, never
   hides it. `HomeGate` re-asserts the attribute after hydration so it can never
   drift from real state.
3. **`/onboarding` gains the mirror gate.** With `/` no longer bouncing people
   into onboarding, "Start practising" on the marketing pages should point at
   `/onboarding` rather than at `/` (where a first-timer would just meet a second
   pitch). For that to be safe for a returning user, `/onboarding` sends anyone
   already onboarded back to `/`. Settings' "clear all data" path is unaffected:
   it clears state before navigating, so there is nothing to bounce.
4. **No new design system.** The landing is built from the `MarketingShell`
   primitives PR #14 added, and every fact on it comes from `lib/seo.ts`, which is
   test-guarded against the real curriculum.

## Files

- `src/components/marketing/HomeLanding.tsx` (new) — the pitch.
- `src/components/HomeGate.tsx` — landing/app switcher, redirect removed.
- `src/components/OnboardingGate.tsx` (new) — the mirror gate.
- `src/app/page.tsx`, `src/app/onboarding/page.tsx` — composition.
- `src/components/marketing/MarketingShell.tsx` — header CTA override, shared CTA link,
  hero CTA now defaults to `/onboarding`.
- `src/app/layout.tsx`, `src/lib/domAttrs.ts`, `src/app/globals.css` — the
  `data-returning` pre-paint signal.

## Verification

- `HomeGate` / `OnboardingGate` / `HomeLanding` unit tests, plus the existing
  `seo.test.ts` voice rules extended to cover the new public copy.
- `npx tsc --noEmit`, `npm run test:run`, `npm run build`.
- `next start` + `curl -A Googlebot http://localhost:3000/`: the pitch copy and the
  primary CTA must be in the raw HTML, with no `noindex`.
