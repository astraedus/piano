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

---

# Wave 2 (2026-08-21): one more spoke per instrument

Wave 1 shipped three spokes and validated the architecture, so wave 2 only adds data and
three 9-line wrappers. Nothing in `ComparePage.tsx` changed: the shared renderer, the
metadata builder and the sitemap generator all picked the new routes up from
`COMPARE_ROUTES` + `COMPARE_DATA` with no edit, which is the design working as intended.

## Routes added
- `/compare/flowkey-alternative`    (piano)
- `/compare/fender-play-alternative` (guitar)
- `/compare/drumeo-alternative`      (drums)

Chosen to widen instrument coverage without re-fighting a wave-1 page: flowkey is a
song-library-plus-note-detection product (a different wedge from Simply Piano's scoring),
Fender Play is instructor-led video (guitar was previously only covered by the
multi-instrument Yousician page), and Drumeo is human video teaching (a different wedge
from Melodics, which is MIDI-hardware timing).

## Pricing provenance (verify again before editing a price cell)
Prices move, most of these vendors block scraping, and all of them geo-price, so record HOW
each figure was obtained, not just the figure.

**The trap that nearly shipped a wrong number: reading a price in a browser from this machine
yields AUD**, because our IP is Australian, and an unlabelled AUD figure published to a
mostly-US audience is simply wrong. A live browser render showed flowkey at A$44.99/mo and
Fender Play at A$31.99/mo, both far off the US rate; Fender's own embedded plan data reads
`"currency":"AUD"` outright. Neither vendor offers a currency switcher, so no USD figure is
reachable from here by rendering. Rules that follow: never publish a figure straight off a
live render on this machine, always label the currency, and prefer a conservative anchor
("around US$20 a month") over false precision when the US figure is not directly verifiable.
The shared footnote in `ComparePage.tsx` carries the region caveat for every page, so
individual cells never repeat it.

Useful technique (cheaper than walking a checkout): grep `document.documentElement.outerHTML`
for the fact before clicking anything. Embedded page state routinely carries the ISO currency
code, trial lengths and plan IDs that the rendered UI omits.

- **flowkey**: no public pricing page exists at all. `/en/pricing` is a hard 404 and pricing
  renders only inside the logged-in app, so a reader cannot easily check it either. Two
  usable sources: `schema.org/Offer` JSON-LD embedded in the homepage HTML (grep for
  `{"@type":"Offer"`) quoting EUR 24.99/mo and EUR 149.99/yr, and the US App Store SKUs.
  Several tiers exist; there is no 3-month or 6-month plan and no lifetime option. Published
  as a conservative USD anchor plus flowkey's own EUR figures, both labelled.
- **Drumeo**: US$25/mo or US$229/yr standard, US$30/mo or US$279/yr broader. Read straight
  off `drumeo.com/choose-plan`, which serves prices in plain HTML to a normal browser UA.
  (The $19.08 and $23.25 also on that page are the per-month-billed-annually figures.)
- **Fender Play**: fender.com hard-403s every non-browser fetch (Akamai), including with a
  full browser UA, and the plan table only renders authenticated. The defensible US source is
  Fender's own IAP SKUs published via Apple (`itunes.apple.com/lookup` -> App Store page
  id1226057939), which lists the current rate alongside legacy and promo SKUs. Trial is 7
  days monthly / 14 days annual, card required, and there is no permanently free tier.

One consistency trap worth naming: "no free plan" was briefly written into all three price
cells at once, which contradicted the same rows' own "ads or time limits" cells for flowkey
and Drumeo, both of which do run a limited permanent free account. Only Fender Play has no
free tier. A claim repeated across cells has to be checked per competitor.

## Guards added (all class-level, so wave 3 is covered without new tests)
- No two pages may share a `lede`, `intro`, `stronger` point or `prefer` point, and titles,
  descriptions and lead keywords must be unique. Six pages off one template is exactly the
  shape a search engine collapses as duplicate content.
- Every `related` href must resolve to a real published route and may not self-link.
- The footer must link exactly `COMPARE_ROUTES`, in both directions (no orphan, no 404).
- No authoring placeholder (`[[...]]`, TODO, TBD) may survive into shipped data. Added
  because the two blocked prices were drafted as tokens; the test refused the commit until
  they were replaced with researched figures.
- Slug shape, cluster size, and instrument coverage are asserted.
- `compare.test.ts`'s `textOf` helper now decodes HTML entities. It did not before, so any
  copy containing an apostrophe failed a `toContain` on punctuation rather than substance.
  Wave-1 copy happened to contain none, which hid the bug.

## Candidates for wave 3
Pianote (piano), Justin Guitar (guitar, but it is largely free so the "free alternative"
wedge is incoherent and it should probably be skipped), Ultimate Guitar, Playground Sessions,
Skoove. Check "<X> alternative" demand before committing, and keep the wedge honest: the
page only works if the competitor genuinely charges.
