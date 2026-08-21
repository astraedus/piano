// Guards for the "alternative to X" comparison cluster.
//
// The cluster only works if every layer agrees: a slug has a data entry, a static
// page on disk, a sitemap row, a social card, and a footer link back into it, and
// the page it renders actually contains the honest comparison it promises. Each of
// those is silent when it breaks, so each is tested. Voice rules (no "AI", no em
// dashes, no upsell vocabulary) are enforced over the compare prose in `seo.test.ts`
// alongside the rest of the public site; this file owns the structure and honesty.

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import sitemap from "@/app/sitemap";
import { ComparePage, buildCompareMetadata } from "@/components/marketing/ComparePage";
import {
  COMPARE_DATA,
  COMPARE_FEATURES,
  COMPARE_SLUGS,
  MUSIC_PRACTICE_CELLS,
  resolveComparePlaceholders,
  type CompetitorComparison,
} from "@/data/compareData";
import {
  APP_ROUTES,
  COMPARE_ROUTES,
  MARKETING_ROUTES,
  SITE_URL,
  SKILL_NODE_COUNTS,
  faqPageJsonLd,
  jsonLdScriptProps,
} from "@/lib/seo";

const ROOT = process.cwd();
const COMPARE_APP_DIR = join(ROOT, "src", "app", "compare");
const entries = Object.entries(COMPARE_DATA) as [string, CompetitorComparison][];

/** Render one comparison page to static HTML, the way a crawler first sees it. */
function markupFor(data: CompetitorComparison): string {
  return renderToStaticMarkup(createElement(ComparePage, { data }));
}
/**
 * The visible text of that markup, as a reader sees it. Entities are decoded
 * because React escapes apostrophes and ampersands on the way out, so a cell
 * reading "a pianist's hands" arrives as "a pianist&#x27;s hands" and a raw
 * `toContain` against the source string fails on punctuation rather than on
 * anything real. Decoding here keeps the assertions about copy, not about markup.
 */
const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&#x2F;": "/",
};
function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#x27|#39|#x2F);/g, (e) => ENTITIES[e] ?? e)
    .replace(/\s+/g, " ");
}

describe("every layer of the cluster lines up", () => {
  it("has one data entry per route, keyed by its own slug", () => {
    expect(COMPARE_SLUGS.map((slug) => `/compare/${slug}`)).toEqual([...COMPARE_ROUTES]);
    expect(Object.keys(COMPARE_DATA).sort()).toEqual([...COMPARE_SLUGS].sort());
    for (const [slug, data] of entries) {
      expect(data.slug).toBe(slug);
      expect(data.path).toBe(`/compare/${slug}`);
    }
  });

  it.each(COMPARE_ROUTES)("%s has a static page on disk", (route) => {
    const slug = route.replace("/compare/", "");
    expect(existsSync(join(COMPARE_APP_DIR, slug, "page.tsx"))).toBe(true);
  });

  it.each(COMPARE_ROUTES)("%s is listed in the sitemap", (route) => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}${route}`);
  });

  it("is linked back into from the site-wide footer, so a rename cannot orphan it", () => {
    const footer = readFileSync(join(ROOT, "src", "components", "SiteFooter.tsx"), "utf8");
    for (const route of COMPARE_ROUTES) expect(footer).toContain(route);
  });

  // The reverse of the check above. A footer link to a slug that no longer exists
  // is a 404 on every page of the site at once, which is worse than the orphan the
  // previous test catches, and just as silent.
  it("links to no compare route the footer has invented", () => {
    const footer = readFileSync(join(ROOT, "src", "components", "SiteFooter.tsx"), "utf8");
    const linked = [...footer.matchAll(/href="(\/compare\/[^"]*)"/g)].map((m) => m[1]);
    expect(linked.sort()).toEqual([...COMPARE_ROUTES].sort());
  });

  it("names every slug as an alternative, which is the query the page targets", () => {
    for (const slug of COMPARE_SLUGS) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*-alternative$/);
  });

  // Deliberately a hard number. Growing the cluster should be a decision someone
  // makes and records, not something a stray export does on the way past.
  it("is the size we think it is", () => {
    expect(COMPARE_SLUGS).toHaveLength(6);
  });

  it("covers each instrument with at least one page", () => {
    const accents = new Set(entries.map(([, d]) => d.accent).filter(Boolean));
    expect(accents).toEqual(new Set(["piano", "guitar", "drums"]));
  });

  // A typo in a "Keep reading" href is a dead end handed to a crawler mid-crawl,
  // and nothing else in the suite would notice. Every internal link must land on a
  // route we actually publish.
  it.each(entries)("%s links only to routes that exist", (_slug, data) => {
    const known = new Set<string>([...MARKETING_ROUTES, ...COMPARE_ROUTES, ...APP_ROUTES]);
    for (const link of data.related) {
      expect(known.has(link.href), `${link.href} is not a real route`).toBe(true);
      expect(link.href).not.toBe(data.path); // no page links to itself
    }
  });
});

describe("no two pages in the cluster are the same page", () => {
  // Six comparison pages built from one template is the exact shape that gets a
  // cluster collapsed as duplicate content: a search engine keeps one and drops the
  // rest. The table and the FAQ legitimately repeat (the same question about the
  // same app deserves the same answer), but the argument has to be written fresh
  // per competitor, so the body copy is what this guards.
  const BODY_FIELDS = ["lede", "intro"] as const;

  it.each(BODY_FIELDS)("shares no %s between two competitors", (field) => {
    const seen = new Map<string, string>();
    for (const [slug, data] of entries) {
      const value = data[field].trim();
      const clash = seen.get(value);
      expect(clash, `${slug} reuses the ${field} from ${clash}`).toBeUndefined();
      seen.set(value, slug);
    }
  });

  it.each(["stronger", "prefer"] as const)("shares no %s point between two competitors", (field) => {
    const seen = new Map<string, string>();
    for (const [slug, data] of entries) {
      for (const point of data[field]) {
        const clash = seen.get(point.trim());
        expect(clash, `${slug} reuses a ${field} point from ${clash}`).toBeUndefined();
        seen.set(point.trim(), slug);
      }
    }
  });

  it("gives every page its own title, description and lead keyword", () => {
    for (const field of ["title", "description"] as const) {
      const values = entries.map(([, d]) => d[field]);
      expect(new Set(values).size).toBe(values.length);
    }
    const leadKeywords = entries.map(([, d]) => d.keywords[0]);
    expect(new Set(leadKeywords).size).toBe(leadKeywords.length);
  });
});

describe("metadata is complete and canonical", () => {
  it.each(entries)("%s carries a canonical, a description and a social card", (_slug, data) => {
    const m = buildCompareMetadata(data);
    expect(m.alternates?.canonical).toBe(data.path);
    expect(m.title).toBe(data.title);
    expect(typeof m.description).toBe("string");
    expect((m.description as string).length).toBeGreaterThan(50);
    expect(m.keywords).toEqual([...data.keywords]);
    expect(m.openGraph?.images).toEqual([
      { url: "/opengraph-image", width: 1200, height: 630, alt: expect.any(String) },
    ]);
  });

  it("titles every page as a free, open-source alternative", () => {
    for (const [, data] of entries) {
      expect(data.title).toMatch(/free/i);
      expect(data.title).toContain(data.competitor);
      expect(data.title).toMatch(/open source/i);
    }
  });
});

describe("the rendered page keeps every promise in the anatomy", () => {
  it.each(entries)("%s leads with the exact H1 and pitches free + open source", (_slug, data) => {
    const html = markupFor(data);
    const h1s = html.match(/<h1[\s\S]*?<\/h1>/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect(textOf(h1s[0] ?? "")).toContain(`A free ${data.competitor} alternative`);
    expect(textOf(html)).toMatch(/open source/i);
  });

  it.each(entries)("%s renders one comparison table with every feature and both apps", (_slug, data) => {
    const html = markupFor(data);
    const text = textOf(html);
    expect((html.match(/<table/g) ?? [])).toHaveLength(1);
    expect(text).toContain(`Feature comparison of Music Practice and ${data.competitor}`);
    for (const { label } of COMPARE_FEATURES) expect(text).toContain(label);
    // Both columns' cells are present.
    expect(text).toContain(MUSIC_PRACTICE_CELLS.instruments);
    expect(text).toContain(data.cells.instruments);
  });

  it.each(entries)("%s states honestly where the competitor is stronger", (_slug, data) => {
    const html = markupFor(data);
    const text = textOf(html);
    expect(text).toContain(`Where ${data.competitor} is stronger`);
    expect(data.stronger.length).toBeGreaterThanOrEqual(3);
    for (const point of data.stronger) expect(text).toContain(point);
  });

  it.each(entries)("%s makes the wedge case and routes to onboarding", (_slug, data) => {
    const html = markupFor(data);
    const text = textOf(html);
    expect(text).toContain("Why you might prefer Music Practice");
    expect(data.prefer.length).toBeGreaterThanOrEqual(2);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    // Hero CTA plus the in-body CTA both land on onboarding.
    expect(hrefs.filter((h) => h === "/onboarding").length).toBeGreaterThanOrEqual(2);
  });

  it.each(entries)("%s renders every FAQ question and answer (3 to 5)", (_slug, data) => {
    const html = markupFor(data);
    const text = textOf(html);
    expect(data.faqs.length).toBeGreaterThanOrEqual(3);
    expect(data.faqs.length).toBeLessThanOrEqual(5);
    for (const faq of data.faqs) {
      expect(text).toContain(faq.question);
      expect(text).toContain(faq.answer);
    }
  });

  it.each(entries)("%s links to its related instrument pages, so the crawl continues", (_slug, data) => {
    const html = markupFor(data);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    for (const link of data.related) expect(hrefs).toContain(link.href);
  });

  it.each(entries)("%s quotes only real curriculum numbers and leaves no placeholder unfilled", (_slug, data) => {
    const text = textOf(markupFor(data));
    for (const count of Object.values(SKILL_NODE_COUNTS)) expect(text).toContain(String(count));
    expect(text).not.toMatch(/\{(piano|guitar|drums|ladder)\}/);
  });
});

describe("structured data", () => {
  it.each(entries)("%s emits a FAQPage node built from its own FAQ", (_slug, data) => {
    const ld = faqPageJsonLd(data.faqs) as {
      "@type": string;
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(data.faqs.length);
    expect(ld.mainEntity.map((q) => q.name)).toEqual(data.faqs.map((f) => f.question));
    expect(ld.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(data.faqs.map((f) => f.answer));
  });

  it.each(entries)("%s serializes its FAQ JSON-LD with no script-closing sequence", (_slug, data) => {
    const html = jsonLdScriptProps(faqPageJsonLd(data.faqs)).dangerouslySetInnerHTML.__html;
    expect(html).not.toContain("</script");
    expect(html).not.toContain("<");
    expect(JSON.parse(html.replace(/\\u003c/g, "<"))).toMatchObject({ "@type": "FAQPage" });
  });

  it.each(entries)("%s ships both a FAQPage and a WebApplication script in the page", (_slug, data) => {
    const scripts = markupFor(data).match(/application\/ld\+json/g) ?? [];
    expect(scripts.length).toBe(2);
  });
});

describe("competitor facts are stated durably and honestly", () => {
  it.each(entries)("%s frames price as a dated paid subscription", (_slug, data) => {
    // Lead with the durable structural truth (paid subscription), and date the
    // volatile figures so a stale number reads as stale, not as a lie.
    expect(data.cells.price).toMatch(/subscription/i);
    expect(data.cells.price).toContain("2026");
  });

  // Competitor pricing is researched off their own site, and the gap between
  // "researched" and "written down" is where a draft marker gets left behind. A
  // page that ships "[[FENDER_PRICE]]" to a crawler is worse than one that ships
  // nothing, so every authoring marker is refused at the data layer. `{piano}` and
  // friends are the one legitimate placeholder syntax, and only in wedge prose,
  // where `resolveComparePlaceholders` fills them from the live curriculum.
  it.each(entries)("%s leaves no authoring placeholder behind", (_slug, data) => {
    const preferProse = new Set(data.prefer.map((p) => p.trim()));
    const walk = (value: unknown, path: string): void => {
      if (typeof value === "string") {
        expect(value, `${path} still holds a draft marker`).not.toMatch(/\[\[|\]\]|\bTODO\b|\bTBD\b/);
        if (!preferProse.has(value.trim())) {
          expect(value, `${path} holds an unresolved brace placeholder`).not.toMatch(/\{[a-z]+\}/);
        }
        return;
      }
      if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`));
      if (value && typeof value === "object") {
        for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
      }
    };
    walk(data, data.slug);
  });

  it.each(entries)("%s fills every comparison cell for both apps", (_slug, data) => {
    for (const { key } of COMPARE_FEATURES) {
      expect(data.cells[key].trim().length).toBeGreaterThan(0);
      expect(MUSIC_PRACTICE_CELLS[key].trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps the shared Music Practice column honest about the real curriculum", () => {
    for (const count of Object.values(SKILL_NODE_COUNTS)) {
      expect(MUSIC_PRACTICE_CELLS.instruments).toContain(String(count));
    }
    expect(MUSIC_PRACTICE_CELLS.price).toMatch(/free/i);
    // We do not claim a song catalogue we do not have.
    expect(MUSIC_PRACTICE_CELLS.songLibrary).toMatch(/no licensed song catalogue/i);
  });

  it("resolves wedge placeholders to the live counts", () => {
    const sample = resolveComparePlaceholders("{piano}/{guitar}/{drums} at {ladder}");
    expect(sample).toContain(`${SKILL_NODE_COUNTS.piano}/${SKILL_NODE_COUNTS.guitar}/${SKILL_NODE_COUNTS.drums}`);
    expect(sample).not.toMatch(/[{}]/);
  });
});
