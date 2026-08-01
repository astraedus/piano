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

const description = `Music Practice is a free electric guitar practice app with no subscription and no account. A real ${SKILL_NODE_COUNTS.guitar}-skill prerequisite curriculum, a capo module, a fretboard map, and chord diagrams tell you what to practice next.`;

export const metadata: Metadata = buildMetadata({
  path: "/guitar",
  title: "Free Electric Guitar Practice App, No Subscription",
  description,
  keywords: [
    "free guitar practice app",
    "electric guitar practice app free",
    "guitar lessons app no subscription",
  ],
});

export default function GuitarPage() {
  return (
    <MarketingShell accent="guitar">
      <MarketingHero
        eyebrow="Electric Guitar"
        title="The Free Guitar Practice App With a Capo, Not a Subscription"
        lede="Music Practice is a free electric guitar practice app: a real prerequisite curriculum, a capo module, a fretboard map, and chord diagrams, all running in the browser with no subscription and no account."
      />

      <MarketingSection title="What the guitar curriculum actually covers" id="curriculum">
        <p>
          The guitar skill tree has {SKILL_NODE_COUNTS.guitar} nodes across four tiers, built on real
          prerequisites. Barre Chords (E Shape), for instance, will not show up as your next lesson until
          fretboard note names, a two-string mini barre, and the full set of open chords are already learned.
        </p>
        <FactList
          items={[
            {
              term: "Setup, tuning, and tab",
              detail:
                "Guitar Anatomy & Tuning, Holding & Pick Grip, and Reading Tab Basics come before you fret a single note. Fretting Hand Placement follows so every string rings clean, fingertip only, before picking technique starts.",
            },
            {
              term: "First chords, picking, and the capo",
              detail:
                "Down-Picking and Alternate Picking lead into Open Chords, Em, Am, E, A, then D, G, C. The Capo arrives once you own the full open set: it treats the capo as a key multiplier, one moving bar over shapes you already know. G to C, in time is the timed chord-change drill behind Basic Strumming and most open-chord songs.",
            },
            {
              term: "Rock rhythm: power chords and drive",
              detail:
                "Power Chords, Palm Muting, and Driving Rhythm (down-picked eighths and the palm-muted gallop) build the electric rhythm vocabulary. Amp & Gain Basics and Fretboard Note Names sit alongside them, and Fmaj7 and the Small F scaffolds the jump into Barre Chords, E Shape then A Shape.",
            },
            {
              term: "Lead technique: bends, legato, and the pentatonic boxes",
              detail:
                "Hammer-Ons, Pull-Offs, and Slides build legato. String Bending, Vibrato, and Half-Step, Unison & Held Bends teach the electric guitar's signature expressive moves. Minor Pentatonic Box 1 gives you a first improvising shape, The Blues Note adds the flat five, and Minor Pentatonic Box 2 + Connect and Noise Control Under Gain move you off the first position.",
            },
            {
              term: "Playing with other people",
              detail:
                "12-Bar Blues, Lead Phrasing (Q&A), Pentatonic Licks (Box 1), Full-Neck Pentatonic, Bending Accuracy + Expression, and Rhythm Syncopation & Accents are the tier that turns technique into something you can jam over.",
            },
          ]}
        />
        <p>
          Three tools carry weight beyond a single lesson. The capo module treats the capo as a key
          multiplier, not just a folk-song crutch: the five open CAGED shapes you already know, C, A, G, E,
          D, sound in every key once you can place the capo and name the key you are sounding in. A
          fretboard map fills in as you learn positions and note names instead of staying blank until you
          have memorized the whole neck at once. And every chord in the tree, from Em to a movable
          E-shape barre, renders as a real chord diagram, not a text shape you have to decode.
        </p>
        <StatRow
          stats={[
            { value: String(SKILL_NODE_COUNTS.guitar), label: "prerequisite skills in the guitar tree" },
            { value: `${REVIEW_LADDER_DAYS.join(", ")} days`, label: "spaced review ladder for anything learned" },
            { value: "$0", label: "forever, no subscription" },
          ]}
        />
      </MarketingSection>

      <MarketingSection title="How a practice session actually works" id="how-it-works">
        <p>
          Open the app and it already knows what you should do tonight: the one skill you are ready to
          learn next, the drill that teaches it, and how you will know you are done, instead of a stack of
          song tabs to sort through yourself.
        </p>
        <p>
          Technique drills use BPM laddering: you start under tempo, and the app only lets you step up once
          you have played a clean run at the current speed. The G to C transition drill, for example, has a
          real target, roughly thirty clean changes a minute, the wall most beginners stall on, before it
          moves you toward 12-Bar Blues.
        </p>
        <p>
          Once a skill is learned it does not just sit there. Music Practice reviews it again at{" "}
          {reviewLadderPhrase()}, so a chord change or a bend you learned three weeks ago comes back before
          you have had the chance to forget it. Ear training respects the same honesty: it only quizzes
          intervals, chords, and progressions the tree has actually taught you, never material from a lesson
          you have not reached yet. And every musical term in a lesson, from palm mute to pentatonic, is
          tappable for a plain-language explanation, so nothing you read assumes vocabulary you do not have.
        </p>
      </MarketingSection>

      <MarketingSection title="Why it isn't a game" id="not-a-game">
        <p>
          Most guitar apps turn practice into a game: streaks to protect, stars for showing up, points for
          strumming somewhere near the beat. None of that tells you why a technique matters or when you are
          actually ready to move past it.
        </p>
        <p>
          Music Practice does the opposite. There is no streak to protect and no score to chase. Progress is
          a skill tree you can see laid out end to end, which techniques you have learned, at what tempo,
          and the one thing to learn next. Miss a night and nothing resets. Pick the guitar back up after a
          month and the review queue tells you exactly which chords and bends need a refresher first.
        </p>
      </MarketingSection>

      <MarketingSection title="A free guitar practice app, no subscription, ever" id="free">
        <p>
          Music Practice runs entirely in your browser. There is no account to create, nothing to install,
          and no subscription behind a lesson, a chord diagram, or the capo module. If you want your
          progress on a second device, an optional signed-in cloud sync is there, but it stays opt-in, never
          required.
        </p>
        <p>
          The code is open source under MIT and lives at {REPO_URL.replace("https://", "")}. Built by one
          developer, {BUILDER}, for his own nightly practice, and released because a real electric guitar
          curriculum should not need a monthly fee to exist.
        </p>
      </MarketingSection>

      <MarketingSection title="Try it tonight" id="feedback">
        <p>
          Open the app and it will place you exactly where you left off, or at Guitar Anatomy & Tuning if
          this is night one. If you use it, even for five minutes, tell me what confused you or what you
          wished it did next. The repo is open and issues are welcome: {REPO_URL.replace("https://", "")}.
        </p>
      </MarketingSection>
    </MarketingShell>
  );
}
