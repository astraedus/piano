import type { Metadata } from "next";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
  FactList,
  StatRow,
} from "@/components/marketing/MarketingShell";
import { buildMetadata, SKILL_NODE_COUNTS, reviewLadderPhrase, BUILDER, REPO_URL, ISSUES_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/about",
  title: "About Music Practice: A Free Open Source Music Practice App",
  description:
    "Music Practice is a free, open source music practice app for piano, electric guitar, and drums, built by Diven. See how it compares to Simply Piano, Yousician, and Melodics.",
  keywords: [
    "simply piano alternative free",
    "yousician alternative free",
    "melodics alternative",
    "open source music practice app",
  ],
});

export default function AboutPage() {
  return (
    <MarketingShell>
      <MarketingHero
        eyebrow="About"
        title="Why Diven built a free, open source music practice app"
        lede={`Diven built Music Practice for his own nightly practice, because every piano and guitar app he tried scored how closely he played a song against a reference, streaks and stars included, without ever telling him what to actually work on next. This one always knows the next skill and explains why it matters before you drill it, and it grew from piano into electric guitar and now drums for the same reason: the gap it fixes is not specific to one instrument.`}
      />

      <MarketingSection id="how-it-works" title="How it works">
        <p>
          The curriculum for each instrument is a real prerequisite graph, not a list of levels. A skill tree
          resolver checks each skill&apos;s prerequisites and only offers it once they are actually learned, so the
          order you meet things in reflects how a skill genuinely builds on what came before, not an arbitrary
          difficulty ramp. A level system says spend two weeks here, then move on. A prerequisite tree says
          something more specific: this skill depends on that one, and it will not show up as ready until the
          dependency is actually there.
        </p>
        <StatRow
          stats={[
            { value: `${SKILL_NODE_COUNTS.piano}`, label: "piano skills" },
            { value: `${SKILL_NODE_COUNTS.guitar}`, label: "guitar skills" },
            { value: `${SKILL_NODE_COUNTS.drums}`, label: "drum skills" },
          ]}
        />
        <p>
          Technique drills use BPM laddering: you start under tempo and only step up once you can play a clean
          run, so speed is earned on top of control instead of bolted on separately. Once a skill is learned it
          goes on a spaced review schedule at {reviewLadderPhrase()}, so it keeps coming back instead of quietly
          fading the moment you have passed it once.
        </p>
        <p>
          Ear training is gated to what you have actually been taught. It never quizzes an interval, a chord
          quality, or a progression the tree has not covered yet, so a round is always something you have a real
          shot at, not a guess. Every musical term in a lesson, a drill, or the glossary is tappable for a
          plain-language explanation, so nothing assumes vocabulary you have not been given yet.
        </p>
      </MarketingSection>

      <MarketingSection id="compare" title="A free alternative to Simply Piano, Yousician, and Melodics">
        <p>
          If you have already tried one of the well-known practice apps, here is honestly where Music Practice is
          different, and where it is not.
        </p>
        <FactList
          items={[
            {
              term: "Simply Piano",
              detail:
                "Simply Piano is a piano-only app, subscription-priced at $13 to $20 a month, that scores how closely you played a song against a reference. Music Practice teaches the skill that lets you play it in the first place. Free and open source, no subscription.",
            },
            {
              term: "Yousician",
              detail:
                "Yousician covers piano, guitar, bass, and vocals on a subscription, with gamified scoring and streaks. Music Practice is a real prerequisite curriculum you can see laid out as a skill tree instead of a streak counter. Free and open source, no subscription.",
            },
            {
              term: "Melodics",
              detail:
                "Melodics is a pad or MIDI-keyboard rhythm trainer on a subscription, built around sample-based drills. Music Practice teaches drum fundamentals with real lessons and BPM-laddered drills on a practice pad. Free, no login.",
            },
            {
              term: "flowkey",
              detail:
                "flowkey is piano-only and subscription-based, teaching specific songs from sheet music. Music Practice builds the fundamentals first and also covers electric guitar and drums. Free and open source.",
            },
            {
              term: "Justin Guitar app",
              detail:
                "The Justin Guitar app is guitar-only and mostly video lessons you watch, with a free tier and a paid one. Music Practice is interactive drills with a spaced review system across piano, guitar, and drums. Free throughout, with nothing held back behind a paid tier.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection id="open-source" title="Free, open source, and no account">
        <p>
          None of this requires an account. Progress is stored in the browser through localStorage, so you can
          start practicing immediately and it is still there tomorrow. Local-first felt like the right default for
          a practice tool: the thing you actually need at 9pm on a Tuesday is to open the app and start, not to
          create a login first. If you want your progress on two devices, an optional sign-in adds cloud sync on
          top of the same local data. It is opt-in, and the app works completely without it.
        </p>
        <p>
          The whole codebase is open source under the MIT licence at{" "}
          <a href={REPO_URL} className="text-[color:var(--accent-deep)] hover:underline">
            {REPO_URL.replace("https://", "")}
          </a>
          . Read exactly how the skill tree, the review scheduler, and the ear-training gates work instead of
          taking it on faith.
        </p>
      </MarketingSection>

      <MarketingSection id="stack" title="The stack">
        <p>
          For the curious: Music Practice is built with Next.js and React in TypeScript, Tone.js for audio,
          VexFlow for piano and guitar notation, svguitar for chord diagrams, and @xyflow/react with dagre for
          laying out the skill graph itself. The instrument-specific logic is small and sits behind one shared
          skill tree engine, so adding drums did not mean rewriting how piano or guitar work, only adding a new
          instrument module and its own set of nodes and drills.
        </p>
      </MarketingSection>

      <MarketingSection id="feedback" title="Feedback">
        <p>
          Music Practice is free and open source, built by {BUILDER}. If you use it, even for five minutes, tell
          me what confused you or what you wished it did next, especially if you are partway through learning an
          instrument and bounced off something here. The repo is open and issues are welcome at{" "}
          <a href={ISSUES_URL} className="text-[color:var(--accent-deep)] hover:underline">
            {ISSUES_URL.replace("https://", "")}
          </a>
          .
        </p>
      </MarketingSection>
    </MarketingShell>
  );
}
