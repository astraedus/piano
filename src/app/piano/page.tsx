import type { Metadata } from "next";
import {
  MarketingShell,
  MarketingHero,
  MarketingSection,
  FactList,
  StatRow,
} from "@/components/marketing/MarketingShell";
import {
  buildMetadata,
  SKILL_NODE_COUNTS,
  reviewLadderPhrase,
  REVIEW_LADDER_DAYS,
  REPO_URL,
  BUILDER,
} from "@/lib/seo";

const description = `Music Practice is a free piano practice app with no account and no paywall. A real ${SKILL_NODE_COUNTS.piano}-skill prerequisite curriculum tells you what to practice next, and why.`;

export const metadata: Metadata = buildMetadata({
  path: "/piano",
  title: "Free Piano Practice App With No Account Needed",
  description,
  keywords: [
    "free piano practice app",
    "piano practice app no account",
    "piano lessons app free no signup",
  ],
});

export default function PianoPage() {
  return (
    <MarketingShell accent="piano">
      <MarketingHero
        eyebrow="Piano"
        title="The Free Piano Practice App That Tells You What's Next"
        lede="Music Practice is a free piano practice app built around a real curriculum instead of a score or a level counter. It decides what you should practice tonight, explains why that skill matters, and keeps track of what you already know so nothing gets forgotten."
      />

      <MarketingSection title="What the piano curriculum actually covers" id="curriculum">
        <p>
          The piano skill tree in Music Practice has {SKILL_NODE_COUNTS.piano} nodes, and every one of them
          is a real prerequisite: you cannot reach a skill until the skills under it are actually learned.
          It starts before you have played a single note and ends with reading a lead sheet in real time and
          comping your first jazz change.
        </p>
        <FactList
          items={[
            {
              term: "Find the keyboard, then sit right",
              detail:
                "The tree opens with Map the Keyboard, finding any note in under a second, and Posture & Arm Weight, so the first thing you learn is how to touch the instrument without tension, before a single scale.",
            },
            {
              term: "Your first keys, by hand and by ear",
              detail:
                "C major is yours, G major (one sharp), F major (one flat), and A minor longing give you four home keys. Rhythm Foundation locks a steady pulse, The Echo starts real ear training, and Reading the Staff comes only after the first key is under your hands, not before.",
            },
            {
              term: "Chords that move, and the pop formula",
              detail:
                "Chord Under Melody and Chord Inversions lead into Am to F, in time, a timed chord-change drill that gates The Pop Formula, the Am-F-C-G loop behind a large share of pop music. The Sustain Pedal and Left-Hand Accompaniment Patterns round out the hands, and Play a Whole Song closes the tier: one song, both hands, start to finish.",
            },
            {
              term: "More keys, real jazz, real blues",
              detail:
                "D major, A major, E major, D minor, and E minor extend the key vocabulary. Read a Lead Sheet and ii-V-I (first jazz) are the two theory nodes for a learner who wants to go deep, and 12-Bar Blues gives you permission to play blues without asking.",
            },
            {
              term: "Playing by ear, on purpose",
              detail:
                "The Echo grows into Put a Melody on the Keys and Pull a Song from a Recording: transcribing Happy Birthday and Ode to Joy first, then pulling a half-known pop song off a recording once the ear and the chord vocabulary can support it.",
            },
          ]}
        />
        <StatRow
          stats={[
            { value: String(SKILL_NODE_COUNTS.piano), label: "prerequisite skills in the piano tree" },
            { value: `${REVIEW_LADDER_DAYS.join(", ")} days`, label: "spaced review ladder for anything learned" },
            { value: "$0", label: "forever, no account required" },
          ]}
        />
      </MarketingSection>

      <MarketingSection title="How a practice session actually works" id="how-it-works">
        <p>
          Open the app and it already knows what you should do tonight. The stand shows the one skill you
          are ready to learn next, the drill that teaches it, and how you will know you are done, instead
          of a menu of songs to pick from.
        </p>
        <p>
          Technique drills use BPM laddering: you start under tempo, and the app only lets you step up once
          you have played a clean run at the current speed. The Am to F transition drill, for example, has a
          real target, roughly thirty clean changes a minute, before The Pop Formula becomes the next lesson.
        </p>
        <p>
          Once a skill is learned it does not just sit there. Music Practice reviews it again at{" "}
          {reviewLadderPhrase()}, so a scale or a chord change you learned three weeks ago comes back before
          you have had the chance to forget it, instead of quietly fading the moment you move on. Ear
          training respects the same honesty: it only quizzes intervals, chords, and progressions the tree
          has actually taught you, never material from a lesson you have not reached yet. And every musical
          term in a lesson, from inversion to legato, is tappable for a plain-language explanation, so
          nothing you read assumes vocabulary you do not have.
        </p>
      </MarketingSection>

      <MarketingSection title="Why it isn't a game" id="not-a-game">
        <p>
          Most piano apps score how closely you played a reference performance, or reward you with streaks
          and stars for showing up. Neither one tells you what to practice or when you are actually ready
          for the next thing.
        </p>
        <p>
          Music Practice does the opposite. There is no scoring against a reference recording and no streak
          to protect. Progress is a skill tree you can see laid out end to end, which skills you have
          learned, at what tempo, and the one thing to learn next. Miss a night and nothing resets. Come back
          after a month and the review queue tells you exactly which skills need a refresher before you move
          forward.
        </p>
      </MarketingSection>

      <MarketingSection title="A free piano practice app with no account and no paywall" id="free">
        <p>
          Music Practice runs entirely in your browser. There is no account to create, nothing to install,
          and no paywall behind a lesson. If you want your progress on a second device, an optional
          signed-in cloud sync is there, but it stays opt-in, never required.
        </p>
        <p>
          The code is open source under MIT and lives at {REPO_URL.replace("https://", "")}. Built by one
          developer, {BUILDER}, for his own nightly practice, and released because a real piano curriculum
          should not need a subscription to exist.
        </p>
      </MarketingSection>

      <MarketingSection title="Try it tonight" id="feedback">
        <p>
          Open the app and it will place you exactly where you left off, or at Map the Keyboard if this is
          night one. If you use it, even for five minutes, tell me what confused you or what you wished it
          did next. The repo is open and issues are welcome: {REPO_URL.replace("https://", "")}.
        </p>
      </MarketingSection>
    </MarketingShell>
  );
}
