import type { Metadata } from "next";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
  FactList,
  StatRow,
} from "@/components/marketing/MarketingShell";
import { buildMetadata, SKILL_NODE_COUNTS, reviewLadderPhrase, REPO_URL, ISSUES_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/drums",
  title: "Free Drum Practice App for Rudiments and Timing",
  description:
    "A free drum practice app for rudiments, sticking, and timing on a practice pad. No account, no download. Spaced review and honest rhythm ear training.",
  keywords: ["free drum practice app", "drum pad practice app free", "drum rudiments practice app"],
});

export default function DrumsPage() {
  return (
    <MarketingShell accent="drums">
      <MarketingHero
        eyebrow="Drums, practice pad, v1"
        title="A free drum practice app for rudiments and timing"
        lede="Music Practice teaches drum fundamentals on a practice pad: grip, stroke control, the core rudiments, and the subdivisions real grooves are built from. It runs in the browser, needs no kit, and costs nothing."
      />

      <MarketingSection id="curriculum" title="What this free drum practice app teaches first">
        <p>
          The curriculum is a real prerequisite tree, not a leveled list. {SKILL_NODE_COUNTS.drums} drum skills
          sit across four tiers, and a skill only becomes available once the ones under it are actually learned.
          Grip and stroke control come first because everything else, every rudiment and every fill, depends on
          them.
        </p>
        <FactList
          items={[
            {
              term: "Grip, rebound, and the four strokes",
              detail:
                "Hold the Sticks, Let the Stick Bounce, The Four Strokes, and Make Friends with the Click come before any rudiment, because a loose grip and a trustworthy rebound are what make the rest possible without your hands cramping.",
            },
            {
              term: "Single and double stroke rudiments",
              detail:
                "Single Stroke Roll, Count It Out Loud, Double Stroke Roll, and Accents & Taps build the alternating hand control and the counted subdivision every later pattern reuses.",
            },
            {
              term: "Subdivisions and the first combined rudiments",
              detail:
                "Sixteenths, Triplets, and Offbeats & Syncopation teach the timing grid, alongside Single Paradiddle, The Flam, Five Stroke Roll, and Play Along on the Pad, which puts the sticking to work over a real track.",
            },
            {
              term: "Combination rudiments and speed",
              detail:
                "The Drag, Paradiddle Family, The Whip Stroke (Moeller), Open-Close-Open, and Buzz Roll chain the earlier rudiments together and build real tempo on top of clean technique instead of tension.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection id="how-practice-works" title="How practice actually works">
        <p>
          Each night the app builds a short session from wherever you left off: a technique drill, sometimes a new
          rudiment, and a rhythm ear round if one is due. Technique drills use BPM laddering, so you start well
          under tempo and only step up after a clean run, which means speed gets built on top of control instead
          of replacing it.
        </p>
        <p>
          Learned skills do not just sit there once you have passed them. They come back on a spaced review
          schedule at {reviewLadderPhrase()}, so a rudiment you nailed weeks ago gets a chance to prove it is
          still there before it quietly slips.
        </p>
        <p>
          Ear training here is rhythm dictation: you hear a short pattern and have to identify or play back its
          subdivision. It only ever draws on subdivisions the tree has actually taught you, so a round never tests
          something you have not been shown yet.
        </p>
      </MarketingSection>

      <MarketingSection id="not-yet" title="What it does not do yet">
        <p>
          Drums in Music Practice is practice-pad-only in this version. There is no full kit, no hi-hat pedal, no
          bass drum, and no kick pattern. Everything here is grip, sticking, accents, and rudiments played on a
          single pad surface, which is also why notation renders as a count grid instead of a drum staff.
        </p>
        <p>
          That is a real, current limit, not a caveat buried in fine print. If you already own a kit, treat this
          as the technique and rudiment layer underneath what you play on it.
        </p>
      </MarketingSection>

      <StatRow
        stats={[
          { value: `${SKILL_NODE_COUNTS.drums}`, label: "drum skills in the prerequisite tree" },
          { value: "4", label: "tiers, from grip to combination rudiments" },
          { value: "0", label: "kits or pedals required" },
        ]}
      />

      <MarketingSection id="cost" title="What it costs">
        <p>
          Nothing. Music Practice is free, with no account required and no paywall anywhere in it. The code is
          open source under the MIT licence and lives at{" "}
          <a href={REPO_URL} className="text-[color:var(--accent-deep)] hover:underline">
            {REPO_URL.replace("https://", "")}
          </a>
          , so you can read exactly how the rudiment progression and the review schedule work instead of taking
          it on faith.
        </p>
      </MarketingSection>

      <MarketingSection id="try-it" title="Try it tonight">
        <p>
          Open the app and work through the first tier tonight, no account needed. If something is confusing, or
          a rudiment&apos;s drill does not feel right on a pad, say so. The repo takes issues at{" "}
          <a href={ISSUES_URL} className="text-[color:var(--accent-deep)] hover:underline">
            {ISSUES_URL.replace("https://", "")}
          </a>
          , and feedback from people who actually practice drums is exactly what this needs next.
        </p>
      </MarketingSection>
    </MarketingShell>
  );
}
