// The home pitch, as a crawler receives it.
//
// `HomeLanding` is server-rendered on purpose, so the assertion that matters is
// about static markup: the copy, the primary CTA and the internal links have to
// be in the HTML without a single effect running. Rendering to a string is the
// closest a unit test gets to `curl -A Googlebot`.

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HomeLanding } from "./HomeLanding";
import { REVIEW_LADDER_DAYS, SKILL_NODE_COUNTS, reviewLadderPhrase } from "@/lib/seo";

const html = renderToStaticMarkup(<HomeLanding />);
/** The rendered copy with tags stripped, for phrase assertions. */
const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

describe("what the pitch says without JavaScript", () => {
  it("leads with one h1 that names the app and the three instruments", () => {
    const h1s = html.match(/<h1[\s\S]*?<\/h1>/g) ?? [];
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toMatch(/piano/i);
    expect(h1s[0]).toMatch(/guitar/i);
    expect(h1s[0]).toMatch(/drums/i);
    expect(h1s[0]).toMatch(/free/i);
  });

  it("states the price and the absence of an account", () => {
    expect(text).toContain("No account, no install, no paywall.");
    expect(text).toMatch(/open source/i);
  });

  it("carries the three differentiators a stranger is actually choosing on", () => {
    expect(text).toMatch(/prerequisite/i);
    expect(text).toContain(reviewLadderPhrase());
    expect(text).toMatch(/ear training/i);
  });

  // Every number on this page comes from lib/seo.ts, which seo.test.ts pins to
  // the real skill trees. Asserting the rendered values keeps a future hand-typed
  // count from sneaking into the copy.
  it("quotes only real curriculum numbers", () => {
    for (const count of Object.values(SKILL_NODE_COUNTS)) {
      expect(text).toContain(String(count));
    }
    for (const day of REVIEW_LADDER_DAYS) expect(text).toContain(String(day));
  });
});

describe("where the pitch sends people", () => {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

  it("offers a primary CTA into onboarding", () => {
    expect(hrefs.filter((h) => h === "/onboarding").length).toBeGreaterThanOrEqual(2);
    expect(text).toContain("Start practising");
  });

  it("links every instrument page and the about page, so the crawl continues", () => {
    for (const path of ["/piano", "/guitar", "/drums", "/about"]) {
      expect(hrefs).toContain(path);
    }
  });

  it("links the source repository", () => {
    expect(hrefs.some((h) => h.startsWith("https://github.com/"))).toBe(true);
  });

  it("never links the header CTA back at the page it is on", () => {
    // The shared marketing header defaults its pill to "/" ("Open the app"),
    // which on the home page would be a link to nowhere.
    const cta = html.match(/<a[^>]*data-testid="marketing-open-app"[^>]*>/)?.[0];
    expect(cta).toBeTruthy();
    expect(cta).not.toMatch(/href="\/"/);
    expect(cta).toMatch(/href="\/onboarding"/);
  });
});
