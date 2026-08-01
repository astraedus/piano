import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import type { MarketingInstrument } from "@/lib/seo";

/**
 * Server-rendered chrome for the public marketing pages (/piano, /guitar,
 * /drums, /about).
 *
 * Deliberately shares nothing with `AppShell`: `AppShell` is a client component
 * bound to `AppStateProvider` (localStorage, instrument switching, XP, streak),
 * none of which a crawler or a first-time visitor has. Mounting it here would
 * push these pages back into the hydrate-to-see-anything hole that made the app
 * routes invisible to search in the first place. Everything below renders on the
 * server as plain HTML.
 *
 * `accent` re-colours the page to the instrument being described by scoping the
 * `--instrument-accent-*` tokens (see the `[data-accent]` block in globals.css),
 * rather than touching the `data-instrument` attribute on `<html>`, which belongs
 * to the running app and is restored from localStorage before paint.
 */
export function MarketingShell({
  accent,
  children,
}: {
  accent?: MarketingInstrument;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" data-accent={accent}>
      <MarketingHeader />
      <main className="flex-1 shell-container w-full px-5 py-10 sm:py-14">{children}</main>
      <SiteFooter />
    </div>
  );
}

function MarketingHeader() {
  return (
    <header className="no-print border-b border-[color:var(--bg-rule)]">
      <nav className="shell-container px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          href="/"
          className="font-serif text-[length:var(--text-xl)] text-[color:var(--ink)] tracking-[-0.02em] shrink-0"
        >
          Music Practice
        </Link>
        <div className="flex items-center gap-4 sm:gap-5 text-sm text-[color:var(--ink-3)] whitespace-nowrap">
          <HeaderLink href="/piano">Piano</HeaderLink>
          <HeaderLink href="/guitar">Guitar</HeaderLink>
          <HeaderLink href="/drums">Drums</HeaderLink>
          <HeaderLink href="/about">About</HeaderLink>
        </div>
        <Link
          href="/"
          className="cta-pill ml-auto shrink-0 text-sm px-4 py-1.5"
          data-testid="marketing-open-app"
        >
          Open the app
        </Link>
      </nav>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="transition-colors hover:text-[color:var(--ink)]">
      {children}
    </Link>
  );
}

/**
 * The page's one `<h1>` plus its opening claim. `lede` is the sentence a search
 * result snippet and a first-time reader are both judged on, so it states what
 * the thing is and what it costs, in that order.
 */
export function MarketingHero({
  eyebrow,
  title,
  lede,
  ctaLabel = "Start practising",
  ctaHref = "/",
}: {
  eyebrow: string;
  title: string;
  lede: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    // `mx-auto`: the shell container is up to 1152px on desktop but prose caps at
    // 768px for readability, so without centring the whole page sits against the
    // left edge with a dead gutter beside it.
    <section className="max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--accent-deep)]">{eyebrow}</p>
      <h1 className="mt-3 font-serif text-[length:var(--text-4xl)] leading-[1.1] tracking-[-0.03em] text-[color:var(--ink)]">
        {title}
      </h1>
      <p className="mt-5 text-[length:var(--text-xl)] leading-relaxed text-[color:var(--ink-2)]">{lede}</p>
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Link href={ctaHref} className="cta-pill px-5 py-2.5">
          {ctaLabel}
        </Link>
        <span className="text-sm text-[color:var(--ink-3)]">
          No account, no install, no paywall.
        </span>
      </div>
    </section>
  );
}

/** A titled prose block. `id` gives the section a linkable anchor. */
export function MarketingSection({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-14 max-w-3xl mx-auto scroll-mt-8">
      <h2 className="font-serif text-[length:var(--text-2xl)] tracking-[-0.02em] text-[color:var(--ink)]">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[color:var(--ink-2)] leading-relaxed">{children}</div>
    </section>
  );
}

/**
 * A term/detail list. Used for curriculum breakdowns, where the term is the thing
 * being taught and the detail is why it earns its place in the sequence.
 */
export function FactList({ items }: { items: { term: string; detail: string }[] }) {
  return (
    <dl className="mt-2 space-y-4">
      {items.map((it) => (
        <div key={it.term} className="border-l-2 border-[color:var(--accent)] pl-4">
          <dt className="font-medium text-[color:var(--ink)]">{it.term}</dt>
          <dd className="mt-1 text-[color:var(--ink-2)] leading-relaxed">{it.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Small numeric callouts (node counts, review intervals). Numbers must be real. */
export function StatRow({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="warm-card px-4 py-3">
          <p className="font-serif text-[length:var(--text-2xl)] text-[color:var(--accent-deep)] tabular-nums">
            {s.value}
          </p>
          <p className="mt-0.5 text-sm text-[color:var(--ink-2)]">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
