import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { HomeGate } from "@/components/HomeGate";
import { PracticeStand } from "@/components/PracticeStand";
import { HomeLanding } from "@/components/marketing/HomeLanding";
import { AppStateProvider } from "@/hooks/useAppState";
import { buildMetadata, jsonLdScriptProps, webApplicationJsonLd } from "@/lib/seo";

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

/**
 * `/` is two pages behind one URL, and `HomeGate` picks which one.
 *
 * A stranger, and every crawler, gets `HomeLanding`: a server-rendered pitch that
 * says what the app is, what it costs, and how it differs from the apps they have
 * already tried, with one link into onboarding. Until now this route redirected
 * anyone without a profile straight to `/onboarding`, so a visitor from search or
 * Hacker News met a questionnaire and the crawlable HTML here was a nav and a
 * loading line.
 *
 * Somebody who has already onboarded gets what they have always got: the practice
 * stand. Both branches are built here, in a server component, so the pitch is real
 * HTML rather than something hydration has to assemble.
 */
export default function Page() {
  return (
    <AppStateProvider>
      {/* The stand reads searchParams (the free-play toggle), so it needs a
          boundary above it. The landing has no hooks and never suspends. */}
      <Suspense fallback={null}>
        <HomeGate
          landing={<HomeLanding />}
          app={
            <AppShell>
              <PracticeStand />
            </AppShell>
          }
        />
      </Suspense>
      <script {...jsonLdScriptProps(webApplicationJsonLd())} />
    </AppStateProvider>
  );
}
