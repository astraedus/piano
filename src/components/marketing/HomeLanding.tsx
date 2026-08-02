import Link from "next/link";
import {
  CtaLink,
  FactList,
  MarketingHero,
  MarketingSection,
  MarketingShell,
  StatRow,
} from "./MarketingShell";
import {
  BUILDER,
  REPO_URL,
  REVIEW_LADDER_DAYS,
  SKILL_NODE_COUNTS,
  reviewLadderPhrase,
} from "@/lib/seo";

/**
 * The home page as a stranger sees it.
 *
 * `/` used to redirect anyone without a profile straight into the onboarding
 * questionnaire, so every visitor from search, a link, or a directory listing was
 * asked what grade they play before being told what the app is. This is what they
 * get instead: what the thing is, what it costs, what makes it different from the
 * apps they have already tried, and one way in.
 *
 * Server-rendered on purpose. It is a plain component with no state and no hooks,
 * so it is in the HTML of the response, which is the only version of this page a
 * crawler or a reader with JavaScript off will ever see. Everything factual on it
 * comes from `lib/seo.ts`, which is test-guarded against the real curriculum, so
 * the numbers here cannot drift into being a lie.
 *
 * The returning user never sees this page. `HomeGate` swaps in the practice stand
 * once local state has hydrated, and the pre-paint boot script hides this subtree
 * before it can flash. See `docs/exec-plans/active/plan-home-landing.md`.
 */
export function HomeLanding() {
  return (
    <MarketingShell headerCta={{ href: "/onboarding", label: "Start practising" }}>
      <MarketingHero
        eyebrow="Free and open source"
        title="A free practice app for piano, guitar and drums that tells you what to learn next"
        lede="Music Practice picks the one skill you are ready for tonight, explains why it matters before you drill it, and brings back everything you have already learned before it has a chance to fade. It runs in the browser and it knows what you are working on."
      />

      {/* Same 768px column as the hero and every section below it. The shell is
          wider than that on desktop, so an unwrapped StatRow would start at the
          page edge while the sentence above it starts a third of the way in. */}
      <div className="max-w-3xl mx-auto">
        <StatRow
          stats={[
            { value: String(SKILL_NODE_COUNTS.piano), label: "piano skills, in prerequisite order" },
            { value: String(SKILL_NODE_COUNTS.guitar), label: "electric guitar skills" },
            { value: String(SKILL_NODE_COUNTS.drums), label: "drum skills, practice pad first" },
          ]}
        />
      </div>

      <MarketingSection title="It answers the two questions that eat practice time" id="why">
        <p>
          Most practice apps score how close you played to a reference recording, or hand you a
          streak for showing up. Neither one answers the question you actually have when you sit
          down, which is what to work on tonight, or the one you have three weeks later, which is
          what you learned and quietly forgot.
        </p>
        <FactList
          items={[
            {
              term: "A real prerequisite tree, not a level counter",
              detail: `${SKILL_NODE_COUNTS.piano} piano skills, ${SKILL_NODE_COUNTS.guitar} guitar and ${SKILL_NODE_COUNTS.drums} drums, each one gated behind the skills it genuinely depends on. Barre chords do not become your next lesson until fretboard note names and the open chords under them are actually learned, so the order you meet things in is the order they build in.`,
            },
            {
              term: "Drills that step up once you have earned it",
              detail:
                "Technique drills ladder by tempo. You start under speed and move up after a clean run at the one you are on, so speed sits on top of control instead of being guessed at.",
            },
            {
              term: "Spaced review, so nothing you learned rots",
              detail: `Anything you have learned comes back at ${reviewLadderPhrase()}. Miss a week and the review queue tells you exactly what needs a refresher before you move on. Nothing resets and there is no streak to protect.`,
            },
            {
              term: "Ear training that only asks what you have been taught",
              detail:
                "A round can only use the intervals, chord qualities and progressions the tree has actually covered, so it is always something you have a real shot at rather than a guess at material from a lesson you have not reached.",
            },
            {
              term: "Plain language, all the way down",
              detail:
                "Every musical term in a lesson is tappable for a plain explanation, so nothing you read assumes vocabulary nobody has given you yet. If a lesson cannot be followed by a total beginner reading it cold, it is not finished.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection title="Pick an instrument" id="instruments">
        <p>
          One curriculum engine, three instruments. Each keeps its own progress, so learning guitar
          does not disturb where you are on piano.
        </p>
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <InstrumentCard
            href="/piano"
            accent="piano"
            name="Piano"
            detail={`${SKILL_NODE_COUNTS.piano} skills, from finding a note on the keyboard to reading a lead sheet and comping a first jazz change.`}
          />
          <InstrumentCard
            href="/guitar"
            accent="guitar"
            name="Electric guitar"
            detail={`${SKILL_NODE_COUNTS.guitar} skills, with a fretboard map, chord diagrams and a capo module that does the transposing maths for you.`}
          />
          <InstrumentCard
            href="/drums"
            accent="drums"
            name="Drums"
            detail={`${SKILL_NODE_COUNTS.drums} skills for a practice pad, starting at grip and stick rebound and building through the rudiments.`}
          />
        </div>
      </MarketingSection>

      <MarketingSection title="Free, open source, and no account" id="free">
        <p>
          Nothing here is held back. There is no account to create, nothing to install and no
          paywall in front of a lesson. Progress lives in your browser, so you can start in the next
          thirty seconds and it is still there tomorrow. If you want the same progress on a second
          device, an optional sign-in adds cloud sync on top of the same local data, and the app
          works completely without it.
        </p>
        <p>
          The whole thing is open source under the MIT licence at{" "}
          <a
            href={REPO_URL}
            className="text-[color:var(--accent-deep)] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {REPO_URL.replace("https://", "")}
          </a>
          . Read exactly how the skill tree, the {REVIEW_LADDER_DAYS.join("/")} day review scheduler
          and the ear-training gates work instead of taking any of the above on faith. Built by{" "}
          {BUILDER} for his own nightly practice, and released because a real curriculum should not
          need a subscription to exist.
        </p>
      </MarketingSection>

      <MarketingSection title="Start tonight" id="start">
        <p>
          A few questions about which instrument you are on and roughly where you are, then the app
          puts you at the first thing you are ready for. On piano, night one is Map the Keyboard:
          finding any note in under a second, before a single scale.
        </p>
        <div className="pt-1">
          <CtaLink href="/onboarding">Start practising</CtaLink>
        </div>
        <p className="text-sm text-[color:var(--ink-3)]">
          Or read more about{" "}
          <Link href="/about" className="text-[color:var(--accent-deep)] hover:underline">
            why this exists and how it compares
          </Link>{" "}
          to the apps you have already tried.
        </p>
      </MarketingSection>
    </MarketingShell>
  );
}

/**
 * One instrument, one link. `data-accent` scopes the instrument accent tokens to
 * this card (the same mechanism the per-instrument marketing pages use), so the
 * three cards read as three instruments instead of three identical boxes. The
 * title reads `--instrument-accent-deep` rather than the `--accent-deep` alias
 * because only the former is re-bound by `[data-accent]`; the alias is owned by
 * the app's phase ramp on `:root`.
 */
function InstrumentCard({
  href,
  accent,
  name,
  detail,
}: {
  href: string;
  accent: "piano" | "guitar" | "drums";
  name: string;
  detail: string;
}) {
  return (
    <Link href={href} data-accent={accent} className="warm-card block px-4 py-4">
      <p className="font-serif text-[length:var(--text-xl)] text-[color:var(--instrument-accent-deep)] tracking-[-0.02em]">
        {name}
      </p>
      <p className="mt-1.5 text-sm text-[color:var(--ink-2)] leading-relaxed">{detail}</p>
    </Link>
  );
}
