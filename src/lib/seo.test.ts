import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PIANO_NODES } from "./piano/skillNodes";
import { GUITAR_NODES } from "./guitar/skillNodes";
import { DRUMS_NODES } from "./drums/skillNodes";
import { REVIEW_INTERVALS_DAYS } from "./skillReview";
import {
  APP_ROUTES,
  MARKETING_ROUTES,
  REVIEW_LADDER_DAYS,
  SITE_URL,
  SKILL_NODE_COUNTS,
  buildMetadata,
  jsonLdScriptProps,
  reviewLadderPhrase,
  webApplicationJsonLd,
} from "./seo";

const APP_DIR = join(process.cwd(), "src", "app");

describe("SEO facts stay true", () => {
  // This is the point of the whole file. Marketing copy, the OG image, the
  // JSON-LD featureList and four public pages all quote these counts. The
  // curriculum grows, so the honest guard is not "remember to update the copy",
  // it is "the build fails until you do".
  it.each([
    ["piano", PIANO_NODES],
    ["guitar", GUITAR_NODES],
    ["drums", DRUMS_NODES],
  ] as const)("SKILL_NODE_COUNTS.%s matches the real skill tree", (instrument, nodes) => {
    expect(SKILL_NODE_COUNTS[instrument]).toBe(nodes.length);
  });

  it("the advertised review ladder is the ladder the scheduler actually runs", () => {
    expect(REVIEW_LADDER_DAYS).toEqual([...REVIEW_INTERVALS_DAYS]);
  });

  it("reviewLadderPhrase reads as prose and lists every real interval", () => {
    const phrase = reviewLadderPhrase();
    for (const d of REVIEW_INTERVALS_DAYS) expect(phrase).toContain(String(d));
    expect(phrase).toBe("1, 3, 7, and 14 days");
  });
});

describe("buildMetadata", () => {
  it("gives a sub-page a relative canonical and a brand-suffixed social title", () => {
    const m = buildMetadata({ path: "/piano", title: "Free piano practice app", description: "d" });
    expect(m.alternates?.canonical).toBe("/piano");
    expect(m.title).toBe("Free piano practice app");
    expect(m.openGraph?.title).toBe("Free piano practice app | Music Practice");
    expect(m.twitter?.title).toBe("Free piano practice app | Music Practice");
  });

  it("opts the home page out of the title template so it is not double-branded", () => {
    const m = buildMetadata({ path: "/", title: "Music Practice: free practice", description: "d" });
    expect(m.title).toEqual({ absolute: "Music Practice: free practice" });
    expect(m.openGraph?.title).toBe("Music Practice: free practice");
    expect(m.alternates?.canonical).toBe("/");
  });

  it("always sets a large-image Twitter card and an og:url on the real origin", () => {
    const m = buildMetadata({ path: "/drums", title: "t", description: "d" });
    // `Metadata["twitter"]` is a union whose narrower members lack `card`, so
    // this asserts on the object rather than reaching through the union.
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
    expect(m.openGraph?.url).toBe(`${SITE_URL}/drums`);
  });

  // Regression: the root `opengraph-image.tsx` file convention does not reach
  // child segments once they declare their own `openGraph`, so /piano, /guitar,
  // /drums and /about all shipped with no social card until the image was
  // attached here. Every page, home or not, must carry one.
  it.each([...MARKETING_ROUTES, ...APP_ROUTES])("%s carries a social card image", (path) => {
    const m = buildMetadata({ path, title: "t", description: "d" });
    expect(m.openGraph?.images).toEqual([
      { url: "/opengraph-image", width: 1200, height: 630, alt: expect.any(String) },
    ]);
    expect(m.twitter).toMatchObject({ images: [expect.objectContaining({ url: "/opengraph-image" })] });
  });

  it("omits keywords entirely rather than emitting an empty tag", () => {
    expect(buildMetadata({ path: "/x", title: "t", description: "d" }).keywords).toBeUndefined();
  });
});

describe("structured data", () => {
  it("declares the app free, which is the claim most of our queries contain", () => {
    const ld = webApplicationJsonLd() as {
      offers: { price: string };
      isAccessibleForFree: boolean;
      "@type": string;
    };
    expect(ld["@type"]).toBe("WebApplication");
    expect(ld.offers.price).toBe("0");
    expect(ld.isAccessibleForFree).toBe(true);
  });

  it("serializes to valid JSON with no script-closing sequence", () => {
    const html = jsonLdScriptProps(webApplicationJsonLd()).dangerouslySetInnerHTML.__html;
    expect(html).not.toContain("</script");
    expect(html).not.toContain("<");
    expect(JSON.parse(html.replace(/\\u003c/g, "<"))).toMatchObject({ "@type": "WebApplication" });
  });
});

describe("route lists match what is actually on disk", () => {
  // A route listed in the sitemap but missing from the app directory is a 404
  // handed straight to Google. A page on disk but missing from the list is a page
  // that never gets crawled. Both are silent, so both are tested.
  it.each([...MARKETING_ROUTES, ...APP_ROUTES])("%s has a page component", (route) => {
    const dir = route === "/" ? APP_DIR : join(APP_DIR, route.slice(1));
    const hasPage = [".tsx", ".ts", ".jsx", ".js"].some((ext) =>
      existsSync(join(dir, `page${ext}`)),
    );
    expect(hasPage).toBe(true);
  });

  it("lists no duplicate routes", () => {
    const all = [...MARKETING_ROUTES, ...APP_ROUTES];
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("public copy honours the voice rules", () => {
  // These rules are easy to state and easy to forget three months from now, and
  // every one of them is visible to a stranger. Testing the whole class of public
  // pages beats spot-checking whichever file was last edited.
  const publicSources = [
    "page.tsx",
    "piano/page.tsx",
    "guitar/page.tsx",
    "drums/page.tsx",
    "about/page.tsx",
  ]
    .map((rel) => join(APP_DIR, rel))
    .filter((p) => existsSync(p))
    .concat(
      [
        ["SiteFooter.tsx"],
        // The home page's own copy moved here when `/` stopped redirecting
        // strangers into onboarding. It is the first thing an external visitor
        // reads, so it is the last file that should escape these rules.
        ["marketing", "HomeLanding.tsx"],
        ["marketing", "MarketingShell.tsx"],
      ].map((rel) => join(process.cwd(), "src", "components", ...rel)),
    );

  /** Strip comments so the rules apply to rendered copy, not to code notes. */
  function proseOf(path: string): string {
    return readFileSync(path, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");
  }

  it("covers every file that renders public copy", () => {
    expect(publicSources.length).toBe(8);
  });

  it.each(publicSources)("%s never labels anything as AI", (path) => {
    expect(proseOf(path)).not.toMatch(/\bAI[- ]|artificial intelligence|AI-powered|AI-generated/i);
  });

  it.each(publicSources)("%s uses no em dashes or ellipses", (path) => {
    const prose = proseOf(path);
    expect(prose).not.toContain("—");
    expect(prose).not.toContain("…");
  });

  // The ban is absolute, including in denials like "not a free trial". Naming the
  // upsell vocabulary at all invites a search snippet that reads as if we have
  // one, and there is always a phrasing that simply does not raise the question.
  it.each(publicSources)("%s sells nothing: free means free", (path) => {
    expect(proseOf(path)).not.toMatch(/\bpremium\b|\bpro tier\b|\bupgrade to\b|\bfree trial\b/i);
  });
});
