import type { Metadata } from "next";
import Link from "next/link";
import {
  CtaLink,
  MarketingHero,
  MarketingSection,
  MarketingShell,
} from "@/components/marketing/MarketingShell";
import {
  buildMetadata,
  faqPageJsonLd,
  jsonLdScriptProps,
  webApplicationJsonLd,
} from "@/lib/seo";
import {
  COMPARE_FEATURES,
  MUSIC_PRACTICE_CELLS,
  resolveComparePlaceholders,
  type CompetitorComparison,
} from "@/data/compareData";

/**
 * Metadata for one comparison page. A thin wrapper over `buildMetadata` so the
 * canonical URL, Open Graph card, and Twitter card come from the one source every
 * other public page uses. The brand suffix is added by the layout title template,
 * so `data.title` stays brand-free, exactly like the instrument pages.
 */
export function buildCompareMetadata(data: CompetitorComparison): Metadata {
  return buildMetadata({
    path: data.path,
    title: data.title,
    description: data.description,
    keywords: data.keywords,
  });
}

/**
 * The shared renderer for every "alternative to X" page. All three routes are thin
 * static wrappers that pass one `CompetitorComparison` here, so the page anatomy,
 * the honesty section, and the structured data are written once and cannot drift
 * between competitors.
 *
 * Server-rendered on purpose (no hooks, no client state): the whole point of the
 * cluster is that a crawler and a reader with JavaScript off see the full argument
 * in the HTML, the same reason the instrument pages are plain server components.
 *
 * Two JSON-LD blocks ship with every page: a `WebApplication` node declaring the
 * app free (the qualifier most of these queries contain) and a `FAQPage` node built
 * from the same questions rendered below, which makes the page eligible for the FAQ
 * rich result.
 */
export function ComparePage({ data }: { data: CompetitorComparison }) {
  return (
    <MarketingShell accent={data.accent}>
      <MarketingHero
        eyebrow={`Alternative to ${data.competitor}`}
        title={`A free ${data.competitor} alternative`}
        lede={data.lede}
      />

      <MarketingSection title="What Music Practice is" id="intro">
        <p>{data.intro}</p>
      </MarketingSection>

      <MarketingSection title={`Music Practice vs ${data.competitor}`} id="comparison">
        <CompareTable competitor={data.competitor} data={data} />
        <p className="text-sm text-[color:var(--ink-3)]">
          {data.competitor} pricing and features are as of 2026 and set by {data.competitor}. Check
          their site for current details.
        </p>
      </MarketingSection>

      <MarketingSection title={`Where ${data.competitor} is stronger`} id="stronger">
        <p>
          A comparison is only useful if it is honest, so here is where {data.competitor} does things
          Music Practice does not. It is newer, smaller, and built by one developer.
        </p>
        <ul className="mt-2 space-y-3">
          {data.stronger.map((point) => (
            <li key={point} className="border-l-2 border-[color:var(--bg-rule)] pl-4 text-[color:var(--ink-2)] leading-relaxed">
              {point}
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection title="Why you might prefer Music Practice" id="prefer">
        {data.prefer.map((para) => (
          <p key={para}>{resolveComparePlaceholders(para)}</p>
        ))}
        <div className="pt-2">
          <CtaLink href="/onboarding" testId="compare-cta">
            Try it free tonight
          </CtaLink>
          <span className="ml-4 text-sm text-[color:var(--ink-3)]">
            No account, no install, no paywall.
          </span>
        </div>
      </MarketingSection>

      <MarketingSection title="Frequently asked questions" id="faq">
        <dl className="space-y-6">
          {data.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="font-medium text-[color:var(--ink)]">{faq.question}</dt>
              <dd className="mt-1.5 text-[color:var(--ink-2)] leading-relaxed">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </MarketingSection>

      <MarketingSection title="Keep reading" id="related">
        <ul className="space-y-2">
          {data.related.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[color:var(--accent-deep)] hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <script {...jsonLdScriptProps(webApplicationJsonLd())} />
      <script {...jsonLdScriptProps(faqPageJsonLd(data.faqs))} />
    </MarketingShell>
  );
}

/**
 * The "Music Practice vs X" table. A real `<table>` (not a styled grid of divs) so
 * the comparison is legible to a crawler and to a screen reader: a column header per
 * app and a row header per feature. The Music Practice column is shared across all
 * three pages via `MUSIC_PRACTICE_CELLS`, so it can never disagree with itself.
 */
function CompareTable({
  competitor,
  data,
}: {
  competitor: string;
  data: CompetitorComparison;
}) {
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Feature comparison of Music Practice and {competitor}.
        </caption>
        <thead>
          <tr className="border-b border-[color:var(--bg-rule)]">
            <th scope="col" className="py-2 pr-4 text-left font-medium text-[color:var(--ink-3)]">
              Feature
            </th>
            <th scope="col" className="py-2 px-3 text-left font-medium text-[color:var(--accent-deep)]">
              Music Practice
            </th>
            <th scope="col" className="py-2 pl-3 text-left font-medium text-[color:var(--ink)]">
              {competitor}
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARE_FEATURES.map(({ key, label }) => (
            <tr key={key} className="border-b border-[color:var(--bg-rule)] align-top">
              <th scope="row" className="py-3 pr-4 text-left font-medium text-[color:var(--ink)]">
                {label}
              </th>
              <td className="py-3 px-3 text-[color:var(--ink-2)] leading-relaxed">
                {MUSIC_PRACTICE_CELLS[key]}
              </td>
              <td className="py-3 pl-3 text-[color:var(--ink-2)] leading-relaxed">
                {data.cells[key]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
