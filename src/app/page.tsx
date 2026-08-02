import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { HomeGate } from "@/components/HomeGate";
import { AppStateProvider } from "@/hooks/useAppState";
import {
  REPO_URL,
  SKILL_NODE_COUNTS,
  buildMetadata,
  jsonLdScriptProps,
  reviewLadderPhrase,
  webApplicationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/",
  title: "Music Practice: a free, open source practice app for piano, guitar and drums",
  description:
    "A free, open source music practice app for piano, electric guitar and drums. It always tells you what to practice next, and why. Runs in your browser, no account and no paywall.",
  keywords: [
    "open source music practice app",
    "learn piano guitar drums free web app",
    "music theory app no ads",
    "free music practice app",
    "practice app no account",
  ],
});

export default function Page() {
  return (
    <AppStateProvider>
      <AppShell>
        <Suspense fallback={null}>
          <HomeGate />
        </Suspense>
        <HomeIntro />
      </AppShell>
      <script {...jsonLdScriptProps(webApplicationJsonLd())} />
    </AppStateProvider>
  );
}

/**
 * A short, server-rendered description of the app, sitting under the practice
 * stand.
 *
 * It exists because everything above it is client-hydrated: `HomeGate` renders a
 * placeholder on the server and only becomes the practice stand after hydration,
 * so without this block the home page's crawlable HTML was the nav, a loading
 * line, and nothing else. It is also the homepage's route into the three
 * instrument pages, which are where the real content lives.
 *
 * Kept deliberately small. Somebody who practises here nightly should read it as
 * a quiet closing note, not as a marketing banner parked on their session.
 */
function HomeIntro() {
  return (
    <section className="mt-14 border-t border-[color:var(--bg-rule)] pt-8 max-w-3xl">
      <h2 className="font-serif text-[length:var(--text-xl)] tracking-[-0.02em] text-[color:var(--ink)]">
        A free practice app for piano, guitar and drums
      </h2>
      <p className="mt-3 text-[color:var(--ink-2)] leading-relaxed">
        Music Practice is a free, open source web app for learning{" "}
        <IntroLink href="/piano">piano</IntroLink>,{" "}
        <IntroLink href="/guitar">electric guitar</IntroLink> and{" "}
        <IntroLink href="/drums">drums</IntroLink>. It runs entirely in your browser. There is no
        account to make, nothing to install and nothing to pay.
      </p>
      <p className="mt-3 text-[color:var(--ink-2)] leading-relaxed">
        Instead of scoring how close you played to a reference, it sequences a real prerequisite
        curriculum: {SKILL_NODE_COUNTS.piano} piano skills, {SKILL_NODE_COUNTS.guitar} guitar and{" "}
        {SKILL_NODE_COUNTS.drums} drums, where each one opens only once the skills it depends on are
        actually learned. Technique drills step the tempo up after a clean run rather than leaving
        you to guess. Anything you have learned comes back for review at {reviewLadderPhrase()}, so
        it does not quietly rot once you have passed it.{" "}
        <IntroLink href="/about">More about how it works</IntroLink>, or{" "}
        <IntroLink href={REPO_URL} external>
          read the source
        </IntroLink>
        .
      </p>
    </section>
  );
}

function IntroLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className = "text-[color:var(--accent-deep)] hover:underline";
  return external ? (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
