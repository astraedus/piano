// Single source of truth for everything the public web (search crawlers, link
// preview bots, directory listings) is told about this app.
//
// Two rules govern this file:
//  1. Every factual claim here is derived from real code, not written by hand.
//     `REVIEW_LADDER_DAYS` re-exports the actual ladder used by the scheduler,
//     and `SKILL_NODE_COUNTS` is guarded by `seo.test.ts`, which counts the real
//     nodes in `lib/<instrument>/skillNodes.ts`. Curriculum growth fails the test
//     rather than silently turning our marketing copy into a lie.
//  2. No "AI" language and no invented numbers. There is no AI in this app.

import type { Metadata } from "next";
import { REVIEW_INTERVALS_DAYS } from "./skillReview";

export const SITE_URL = "https://music.raeduslabs.com";
export const SITE_NAME = "Music Practice";
/** Public builder identity. Never any other name. */
export const BUILDER = "Diven";
export const REPO_URL = "https://github.com/astraedus/piano";
export const ISSUES_URL = `${REPO_URL}/issues`;

/**
 * Skill-tree node counts per instrument. Guarded by `seo.test.ts` against the
 * real `skillNodes.ts` files, so this can never drift from the curriculum.
 */
export const SKILL_NODE_COUNTS = { piano: 32, guitar: 36, drums: 20 } as const;

export type MarketingInstrument = keyof typeof SKILL_NODE_COUNTS;

/** The real spaced-review ladder, re-exported from the scheduler that runs it. */
export const REVIEW_LADDER_DAYS: readonly number[] = REVIEW_INTERVALS_DAYS;

/** "1, 3, 7, and 14 days" — built from the live ladder, never hand-written. */
export function reviewLadderPhrase(): string {
  const d = [...REVIEW_LADDER_DAYS];
  const last = d.pop();
  return `${d.join(", ")}, and ${last} days`;
}

export const SITE_TAGLINE = "Free piano, guitar, and drums practice. No account.";

export const SITE_DESCRIPTION =
  "A free, open source practice app for piano, electric guitar, and drums that always tells you what to practice next, and why. No account, no install, no paywall.";

/** Alt text for the generated social card. Shared with `app/opengraph-image.tsx`. */
export const OG_IMAGE_ALT =
  "Music Practice: a free practice app for piano, electric guitar and drums.";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** Canonical public routes, in nav order. Drives the sitemap and the footer. */
export const MARKETING_ROUTES = ["/", "/piano", "/guitar", "/drums", "/about"] as const;

/** App routes that are real pages but carry no standalone search intent. */
export const APP_ROUTES = ["/tree", "/timeline", "/settings", "/onboarding"] as const;

type BuildMetadataInput = {
  /** Route path, e.g. "/piano". Used for the canonical URL. */
  path: string;
  /** Page title WITHOUT the site-name suffix; the template appends it. */
  title: string;
  description: string;
  keywords?: readonly string[];
};

/**
 * Build a complete, crawler-ready `Metadata` object for one route: canonical
 * URL, Open Graph, and a Twitter summary card. Every public page goes through
 * here so no route can ship with a half-filled head.
 *
 * The social image is attached here rather than left to the `opengraph-image.tsx`
 * file convention. That convention only decorates the segment it sits in, and a
 * child segment declaring its own `openGraph` replaces the parent's wholesale, so
 * relying on inheritance shipped /piano, /guitar, /drums and /about with no card
 * at all. Pointing every page at the one generated image keeps that impossible.
 */
export function buildMetadata({ path, title, description, keywords }: BuildMetadataInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const isHome = path === "/";
  const image = { url: "/opengraph-image", ...OG_IMAGE_SIZE, alt: OG_IMAGE_ALT };
  return {
    // The root layout's title template appends " | Music Practice". The home page
    // already carries the brand name, so it opts out via `absolute` rather than
    // rendering "Music Practice ... | Music Practice".
    title: isHome ? { absolute: title } : title,
    description,
    keywords: keywords ? [...keywords] : undefined,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title: isHome ? title : `${title} | ${SITE_NAME}`,
      description,
      locale: "en_US",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: isHome ? title : `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}

/**
 * JSON-LD `WebApplication` node. Declares the app free (`offers.price: "0"`) so
 * search engines can surface the "free" qualifier that most of our target
 * queries contain ("free piano practice app", "no subscription", ...).
 */
export function webApplicationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "EducationalApplication",
    applicationSubCategory: "Music Education",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript and a modern browser.",
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    author: { "@type": "Person", name: BUILDER },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      `Prerequisite skill tree: ${SKILL_NODE_COUNTS.piano} piano, ${SKILL_NODE_COUNTS.guitar} guitar, ${SKILL_NODE_COUNTS.drums} drums skills`,
      "BPM-laddered technique drills",
      `Spaced review at ${reviewLadderPhrase()}`,
      "Ear training gated to what the curriculum has taught",
      "Plain-language glossary on every musical term",
    ],
    codeRepository: REPO_URL,
  };
}

/**
 * Renderable `<script type="application/ld+json">` props. Kept here (rather than
 * inline at each call site) so the serialization is done one way everywhere.
 */
export function jsonLdScriptProps(data: Record<string, unknown>) {
  return {
    type: "application/ld+json",
    // JSON.stringify output cannot contain a raw "</script>"; escaping "<" is
    // the standard belt-and-braces guard against a future dynamic value.
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  } as const;
}
