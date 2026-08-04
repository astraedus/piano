# Plan: "Alternative-to" comparison SEO cluster

Three server-rendered, indexable comparison pages for the free/open-source Music Practice app,
targeting the highest-intent "alternative" long-tail queries. Under Anti's distribution/SEO mandate
for the route (2026-08-01).

## Routes (static, one per slug, DRY via a shared component + typed data)
- `/compare/simply-piano-alternative`
- `/compare/yousician-alternative`
- `/compare/melodics-alternative`

Static routes (not `/compare/[slug]`) because the repo's SEO test infra (`seo.test.ts`
"route lists match what is on disk") asserts a real `page.tsx` exists at each sitemap path, and every
marketing page is its own static file. Each wrapper is 3 lines and delegates to one shared
`<ComparePage data={...}>` server component; all per-competitor facts live in one typed data file.

## Files
- `src/data/compareData.ts` — typed `CompetitorComparison` per competitor + shared "Music Practice"
  cells (referencing `SKILL_NODE_COUNTS` so they can't drift). Single home for verified 2026 facts.
- `src/components/marketing/ComparePage.tsx` — shared server renderer: hero H1 "A free [X] alternative",
  intro, comparison table, "Where [X] is stronger" (honest), "Why you might prefer Music Practice"
  (the wedge), CTAs to `/onboarding`, FAQ, related internal links, + FAQPage & WebApplication JSON-LD.
  Exports `buildCompareMetadata(data)`.
- `src/app/compare/<slug>/page.tsx` (x3) — thin static wrappers: `export const metadata` + render.
- `src/app/compare/compare.test.ts` — compare-specific guards (route <-> page <-> sitemap <-> social
  card <-> data parity; FAQ present + valid JSON-LD; honesty section present; wedge present; facts).
- Edits: `src/lib/seo.ts` (+`COMPARE_ROUTES`, +`faqPageJsonLd`), `src/app/sitemap.ts` (register the 3),
  `src/components/SiteFooter.tsx` (reverse links: "Switching from" column on every page),
  `src/lib/seo.test.ts` (extend the voice-rule + route-list suites to cover the cluster).

## Guardrails honored
- Voice rules: no em-dash/ellipsis, no "AI", no "premium"/"free trial"/"upgrade to"/"pro tier".
  Competitor tiers described structurally (never by upsell name), prices framed "as of 2026".
- No fabricated Music Practice stats; instrument/count claims interpolate `SKILL_NODE_COUNTS`.
- Do NOT touch `verification.google` in `layout.tsx`.
- Honesty ("where the competitor is stronger") is required, not optional.

## Gate
`npx tsc --noEmit && npm run test:run && npm run build`. PR only, do not merge (CEO is merge authority).
