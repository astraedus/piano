// Verified facts for the "alternative to X" comparison cluster.
//
// This is the single home for everything the comparison pages state about a
// competitor. Two rules, the same two that govern `lib/seo.ts`:
//
//  1. No invented Music Practice numbers. The "Music Practice" column and the wedge
//     interpolate `SKILL_NODE_COUNTS` and the real review ladder, so they cannot
//     drift from the curriculum (`seo.test.ts` guards those counts against the real
//     `skillNodes.ts` files).
//  2. Honest and neutral about competitors. Every "stronger" list is real, prices are
//     framed "as of 2026" because they move, and paid tiers are described by what they
//     cover, never by their upsell name. Facts here were verified 2026-08 and reflect
//     each product's own public pricing and feature set at the time of writing.
//
// A third rule the cluster itself imposes: no two pages may share body copy. Six
// near-identical pages are six pages a search engine folds into one, so `lede`,
// `intro`, `stronger` and `prefer` are written from scratch per competitor and
// `compare.test.ts` fails on a copy-paste between them.
//
// The voice rules that cover the rest of the public site cover this file too
// (`seo.test.ts` "public copy honours the voice rules"): no "AI", no em dashes or
// ellipses, and none of the upsell vocabulary the app itself never uses.

import { SKILL_NODE_COUNTS, reviewLadderPhrase } from "@/lib/seo";
import type { MarketingInstrument } from "@/lib/seo";

/** One row of the "Music Practice vs X" table. */
export interface CompareCells {
  price: string;
  instruments: string;
  tellsYouWhatNext: string;
  openSource: string;
  accountRequired: string;
  adsOrTimeLimits: string;
  songLibrary: string;
}

/** A single frequently-asked question, rendered on the page and as FAQPage JSON-LD. */
export interface CompareFaq {
  question: string;
  answer: string;
}

/** A crawlable internal link out of a comparison page (to an instrument page, etc.). */
export interface CompareLink {
  href: string;
  label: string;
}

export interface CompetitorComparison {
  /** URL slug, e.g. "simply-piano-alternative". */
  slug: string;
  /** Full route path, e.g. "/compare/simply-piano-alternative". */
  path: string;
  /** The competitor's product name, exactly as they write it. */
  competitor: string;
  /** Instrument accent for the page chrome, or undefined for a neutral multi-instrument page. */
  accent?: MarketingInstrument;
  // ── SEO ──
  title: string;
  description: string;
  keywords: readonly string[];
  // ── Hero + intro ──
  lede: string;
  intro: string;
  // ── The comparison table (competitor column; the Music Practice column is shared) ──
  cells: CompareCells;
  // ── Honest "where the competitor is stronger" (required, not optional) ──
  stronger: readonly string[];
  // ── The wedge: why you might prefer Music Practice ──
  prefer: readonly string[];
  // ── FAQ (also emitted as FAQPage structured data) ──
  faqs: readonly CompareFaq[];
  // ── Crawlable internal links to the most relevant instrument pages ──
  related: readonly CompareLink[];
}

/** Column labels for the comparison table, in render order. */
export const COMPARE_FEATURES = [
  { key: "price", label: "Price" },
  { key: "instruments", label: "Instruments" },
  { key: "tellsYouWhatNext", label: "Tells you what to learn next" },
  { key: "openSource", label: "Open source" },
  { key: "accountRequired", label: "Account required" },
  { key: "adsOrTimeLimits", label: "Ads or time limits" },
  { key: "songLibrary", label: "Song library" },
] as const satisfies readonly { key: keyof CompareCells; label: string }[];

/**
 * The "Music Practice" column, shared by every page so it can never say one
 * thing on one page and something else on another. Interpolates the real skill
 * counts, so a curriculum change updates every comparison table at once.
 */
export const MUSIC_PRACTICE_CELLS: CompareCells = {
  price: "Free. Open source under the MIT licence, with no subscription.",
  instruments: `Piano (${SKILL_NODE_COUNTS.piano} skills), electric guitar (${SKILL_NODE_COUNTS.guitar}), and drums (${SKILL_NODE_COUNTS.drums}).`,
  tellsYouWhatNext:
    "Yes. A prerequisite skill tree picks the one skill you are ready for and explains why it matters before you drill it.",
  openSource: "Yes, MIT licensed, with the full source on GitHub.",
  accountRequired: "No. It runs in your browser; an optional sign-in only adds cloud sync.",
  adsOrTimeLimits: "None. No ads, no daily limit, and no lesson locked away.",
  songLibrary:
    "No licensed song catalogue. It teaches the skills to play songs rather than giving you a library to play along to.",
};

const SIMPLY_PIANO: CompetitorComparison = {
  slug: "simply-piano-alternative",
  path: "/compare/simply-piano-alternative",
  competitor: "Simply Piano",
  accent: "piano",
  title: "Free Simply Piano Alternative (Open Source)",
  description:
    "Looking for a free Simply Piano alternative? Music Practice is a free, open source piano app with no account and no paywall. It teaches the skill behind a song instead of scoring how closely you played one. Here is an honest comparison.",
  keywords: [
    "simply piano alternative",
    "free simply piano alternative",
    "simply piano alternative free",
    "open source piano practice app",
    "simply piano vs",
  ],
  lede: "Music Practice is a free, open source piano app. If you have tried Simply Piano, the difference is simple: Simply Piano scores how closely you played a song, and Music Practice teaches the skill that lets you play it in the first place. Here is where each one is stronger, stated plainly.",
  intro:
    "Music Practice runs in your browser with no account and no paywall. It is built around a real prerequisite curriculum, a skill tree that picks the one thing you are ready to learn next and explains why it matters, rather than a catalogue of songs to grade you against. It also covers electric guitar and drums, where Simply Piano is piano only.",
  cells: {
    price:
      "Paid subscription. As of 2026, about US$17.90 a month or US$169.90 a year for an individual, and about US$209.90 a year for a family plan. A 14-day trial is offered.",
    instruments: "Piano only.",
    tellsYouWhatNext:
      "It scores how closely you play a song against a reference recording, grading a performance rather than sequencing the skills that lead up to it.",
    openSource: "No.",
    accountRequired: "Yes.",
    adsOrTimeLimits:
      "The free tier stops after the third song, with a prompt to unlock the full course to continue.",
    songLibrary: "A large catalogue of licensed songs to play along to.",
  },
  stronger: [
    "A large catalogue of licensed songs, so you always have real music to play along to. Music Practice has no song library.",
    "Note-detection scoring that listens to your playing and tells you which notes you missed. Music Practice does not grade a performance against a reference.",
    "A polished native app for iPhone and Android. Music Practice runs in the browser and has no app-store build.",
    "Years of refinement, a full content team, and production values that a single developer cannot match.",
  ],
  prefer: [
    "Music Practice answers the question Simply Piano leaves open: what should I actually work on tonight. A prerequisite skill tree of {piano} piano skills picks the next one you are ready for, explains why it matters, and gates it behind the skills it genuinely depends on, so you are never scored on something you were never taught.",
    "Anything you learn comes back on a spaced review schedule at {ladder}, so a scale or a chord change does not quietly fade the moment you move on. There is no streak to protect and nothing resets if you miss a night.",
    "It is free and open source, with no account and no paywall, and it covers electric guitar and drums as well as piano. You can read exactly how the skill tree and the review scheduler work instead of taking any of it on faith.",
  ],
  faqs: [
    {
      question: "Is Music Practice really free?",
      answer:
        "Yes. It is free and open source under the MIT licence, with no subscription, no ads, and no lesson held behind a paywall. The full source is public on GitHub.",
    },
    {
      question: "Is Music Practice as good as Simply Piano?",
      answer:
        "In some ways no, and it is honest about that. Simply Piano has a large licensed song catalogue, note-detection scoring, and a polished native app that Music Practice does not. What Music Practice does that Simply Piano does not is tell you the one skill to learn next and why, then bring it back on a spaced review schedule so you do not forget it. It is newer and smaller.",
    },
    {
      question: "Does Music Practice need an account?",
      answer:
        "No. It runs in your browser and stores progress locally, so you can start straight away. An optional sign-in adds cloud sync across devices, and the app works completely without it.",
    },
    {
      question: "Does it only teach piano?",
      answer: `No. Music Practice covers piano, electric guitar, and drums, each with its own prerequisite skill tree (${SKILL_NODE_COUNTS.piano} piano skills, ${SKILL_NODE_COUNTS.guitar} guitar, and ${SKILL_NODE_COUNTS.drums} drums). Simply Piano is piano only.`,
    },
  ],
  related: [
    { href: "/piano", label: "The free piano curriculum in detail" },
    { href: "/compare/flowkey-alternative", label: "Music Practice vs flowkey" },
    { href: "/compare/yousician-alternative", label: "Music Practice vs Yousician" },
    { href: "/compare/melodics-alternative", label: "Music Practice vs Melodics" },
    { href: "/about", label: "Why this app exists" },
  ],
};

const FLOWKEY: CompetitorComparison = {
  slug: "flowkey-alternative",
  path: "/compare/flowkey-alternative",
  competitor: "flowkey",
  accent: "piano",
  title: "Free flowkey Alternative (Open Source)",
  description:
    "Looking for a free flowkey alternative? Music Practice is a free, open source piano app with no account and no paywall. Where flowkey hands you a song catalogue, it sequences the skills underneath the songs. Here is an honest comparison.",
  keywords: [
    "flowkey alternative",
    "free flowkey alternative",
    "flowkey alternative free",
    "flowkey alternative reddit",
    "open source piano practice app",
    "flowkey vs",
  ],
  lede: "Music Practice is a free, open source piano app. The two are built around opposite questions: flowkey starts from a piece of music and waits for you to play its notes, and Music Practice starts from the skill underneath and tells you which one you are ready for. Here is where each one is stronger, stated plainly.",
  intro:
    "Music Practice runs in your browser with no account and no paywall. It is built around a real prerequisite curriculum, a skill tree that picks the one thing you are ready to learn next and explains why it matters, then brings it back later so it sticks. That is a different shape of product from a catalogue of pieces with note detection over the top, and it is worth being clear about which one you actually want. It also covers electric guitar and drums, where flowkey is piano only.",
  cells: {
    price:
      "Paid subscription in several tiers, sitting on top of a limited free account. As of 2026 the entry paid tier is roughly US$20 a month, with annual plans nearer US$150 a year, and flowkey's own listing quotes EUR 24.99 a month and EUR 149.99 a year. What you are quoted depends on your region and on where you buy. A 7-day trial comes with the yearly plans, and card details are required.",
    instruments: "Piano only, on an acoustic piano, a digital piano, or a MIDI keyboard.",
    tellsYouWhatNext:
      "You choose a piece from the catalogue, and optional courses group lessons by topic. Nothing gates one skill behind the skills it depends on, or names the single thing to work on tonight.",
    openSource: "No.",
    accountRequired: "Yes, including to open the free songs.",
    adsOrTimeLimits:
      "No ads, and no daily limit. A free account opens a small set of songs indefinitely; the rest of the catalogue, the courses and the exercises need a paid plan.",
    songLibrary:
      "A large catalogue of licensed songs, each filmed as a split-screen video of a pianist's hands from above.",
  },
  stronger: [
    "A large catalogue of licensed songs filmed as split-screen video, so you can watch a real pianist's hands from above while the notes scroll past. Music Practice has no song library and no video of anyone playing.",
    "Note detection that listens through your microphone or reads a connected MIDI keyboard, waits until you have played the right note, and can loop a bar until it lands. Music Practice never listens to your playing.",
    "Score-based practice tools on real repertoire: slow the tempo, loop a section, work hands separately through a piece you want to perform. Music Practice drills the technique rather than the repertoire.",
    "Polished native apps for iPhone, iPad and Android, with years of refinement and a full content team behind the catalogue. Music Practice is browser only and built by one developer.",
  ],
  prefer: [
    "Playing a piece is not the same as knowing what to learn next, and the second question is the one Music Practice exists to answer. A prerequisite tree of {piano} piano skills picks the single skill you are ready for, explains why it matters before you drill it, and gates it behind the skills it genuinely builds on, so nothing arrives before the thing it stands on.",
    "Getting a piece under your fingers this week says nothing about still having it in June. Everything Music Practice teaches returns on a spaced review schedule at {ladder}, so the technique underneath your repertoire keeps being rehearsed long after you moved on to the next piece.",
    "It is free and open source, with no account, no card, and no part of the curriculum held back, and the same engine covers electric guitar and drums as well as piano. You can read exactly how the skill tree and the review scheduler decide things instead of taking either on faith.",
  ],
  faqs: [
    {
      question: "Is Music Practice really free?",
      answer:
        "Yes. It is free and open source under the MIT licence. There is no subscription, no card, no ads, and no lesson held back. The full source is public on GitHub if you want to check that for yourself.",
    },
    {
      question: "Is Music Practice as good as flowkey?",
      answer:
        "For learning songs, no, and it is honest about that. The flowkey catalogue is large and licensed, with hands-from-above video, note detection through a microphone or MIDI keyboard, and polished native apps that Music Practice has no answer to. What Music Practice does instead is name the one skill you are ready for and why, then bring it back so it sticks. If you mainly want a catalogue to play through, flowkey is the better fit.",
    },
    {
      question: "Do I need a MIDI keyboard?",
      answer:
        "No. Music Practice does not listen to your playing at all, so any piano or keyboard works and nothing needs to be plugged in. A MIDI connection is what gives flowkey its most accurate note detection, and that is a real feature Music Practice has no equivalent for.",
    },
    {
      question: "Does it only teach piano?",
      answer: `No. Music Practice covers piano, electric guitar, and drums, each with its own prerequisite skill tree (${SKILL_NODE_COUNTS.piano} piano skills, ${SKILL_NODE_COUNTS.guitar} guitar, and ${SKILL_NODE_COUNTS.drums} drums), and each keeps its own progress. By contrast flowkey is piano only.`,
    },
  ],
  related: [
    { href: "/piano", label: "The free piano curriculum in detail" },
    { href: "/compare/simply-piano-alternative", label: "Music Practice vs Simply Piano" },
    { href: "/compare/yousician-alternative", label: "Music Practice vs Yousician" },
    { href: "/about", label: "Why this app exists" },
  ],
};

const YOUSICIAN: CompetitorComparison = {
  slug: "yousician-alternative",
  path: "/compare/yousician-alternative",
  competitor: "Yousician",
  title: "Free Yousician Alternative (Open Source)",
  description:
    "Looking for a free Yousician alternative? Music Practice is a free, open source app for piano, guitar, and drums with no account and no paywall. It shows you a real prerequisite path instead of a streak. Here is an honest comparison.",
  keywords: [
    "yousician alternative",
    "free yousician alternative",
    "yousician alternative free",
    "yousician alternative reddit",
    "open source music practice app",
    "yousician vs",
  ],
  lede: "Music Practice is a free, open source app for piano, electric guitar, and drums. Where Yousician gamifies practice with scoring and streaks across a subscription, Music Practice gives you a visible prerequisite path, the one skill to learn next and why, for nothing. Here is where each one is stronger, stated plainly.",
  intro:
    "Music Practice runs in your browser with no account and no paywall. Like Yousician it is multi-instrument, but instead of scoring your playing and rewarding streaks, it is built around a prerequisite skill tree that decides what you are ready for and explains why before you drill it. Everything is free, with nothing held back behind a paid plan.",
  cells: {
    price:
      "Paid subscription. As of 2026, one plan is about US$9.99 a month and covers a single instrument; a broader plan is about US$19.99 a month or US$119.99 a year and covers piano, guitar, bass, ukulele, voice, and drums.",
    instruments: "Piano, guitar, bass, ukulele, voice, and drums.",
    tellsYouWhatNext:
      "It listens through your microphone or cable and scores your playing, with gamified lessons and streaks, rather than gating each skill behind the ones it depends on.",
    openSource: "No.",
    accountRequired: "Yes.",
    adsOrTimeLimits: "The free tier limits how long you can play each day.",
    songLibrary: "A large catalogue of licensed songs and backing tracks across instruments.",
  },
  stronger: [
    "A large licensed song catalogue across several instruments, with backing tracks to play along to. Music Practice has no song library.",
    "Real-time scoring that listens through your microphone or a cable and grades what you actually played. Music Practice does not score a performance.",
    "Gamification, streaks, and challenges that many people find genuinely motivating.",
    "Native mobile apps and a large, long-running content library. Music Practice is browser only and much newer.",
  ],
  prefer: [
    "Yousician tells you how well you played what it put in front of you. Music Practice tells you what to play next and why. A prerequisite tree of {piano} piano, {guitar} guitar, and {drums} drums skills gates each one behind the skills it genuinely builds on, so the order you meet things in is the order they actually build, not a level ramp with a streak attached.",
    "Progress is a skill tree you can see laid out end to end, not a streak you have to protect. Anything you learn returns on a spaced review schedule at {ladder}, and missing a day breaks nothing.",
    "It is free and open source, with no account, no daily time limit, and no plan to pick between. One curriculum engine covers piano, electric guitar, and drums, and each instrument keeps its own progress.",
  ],
  faqs: [
    {
      question: "Is Music Practice really free?",
      answer:
        "Yes. It is free and open source under the MIT licence, with no subscription, no ads, and no daily time limit. The full source is public on GitHub, so you can check that for yourself.",
    },
    {
      question: "Is Music Practice as good as Yousician?",
      answer:
        "In some ways no, and it is honest about that. Yousician has a large licensed song catalogue, real-time scoring, mature native apps, and years of content that Music Practice does not. What Music Practice does that Yousician does not is show you a visible prerequisite path, the one skill to learn next and why, and review what you learned so it sticks. It is newer and smaller.",
    },
    {
      question: "Which instruments does Music Practice cover?",
      answer: `Piano, electric guitar, and drums, each with its own prerequisite skill tree (${SKILL_NODE_COUNTS.piano} piano skills, ${SKILL_NODE_COUNTS.guitar} guitar, and ${SKILL_NODE_COUNTS.drums} drums). Progress is kept separately per instrument.`,
    },
    {
      question: "Does Music Practice have a daily time limit?",
      answer:
        "No. There is no daily limit and no lesson locked away. You can practise for as long as you like, and no account is required to start.",
    },
  ],
  related: [
    { href: "/piano", label: "The free piano curriculum in detail" },
    { href: "/guitar", label: "The free electric guitar curriculum" },
    { href: "/drums", label: "The free drums curriculum" },
    { href: "/compare/fender-play-alternative", label: "Music Practice vs Fender Play" },
    { href: "/compare/simply-piano-alternative", label: "Music Practice vs Simply Piano" },
  ],
};

const FENDER_PLAY: CompetitorComparison = {
  slug: "fender-play-alternative",
  path: "/compare/fender-play-alternative",
  competitor: "Fender Play",
  accent: "guitar",
  title: "Free Fender Play Alternative (Open Source)",
  description:
    "Looking for a free Fender Play alternative? Music Practice is a free, open source guitar app with no account and no paywall. Instead of a curated video path, it computes the next skill you are ready for. Here is an honest comparison.",
  keywords: [
    "fender play alternative",
    "free fender play alternative",
    "fender play alternative free",
    "fender play alternative reddit",
    "open source guitar practice app",
    "fender play vs",
  ],
  lede: "Music Practice is a free, open source app for electric guitar, piano, and drums. Fender Play teaches guitar through instructor videos along a path picked for your level and the genre you chose at sign-up. Music Practice has no video at all, and instead computes which single skill you are ready for from the ones you already have. Here is where each one is stronger, stated plainly.",
  intro:
    "Music Practice runs in your browser with no account, no card, and no paywall. Its guitar curriculum is a prerequisite graph: each skill is locked behind the skills it genuinely builds on, the app names the one you are ready for tonight and explains why it matters, and it comes back later on a review schedule. Fender Play is the video-lesson model done well, with real instructors and real songs. These are different products for different appetites, and the comparison below tries to make that choice easy rather than to win it.",
  cells: {
    price:
      "Paid subscription, with no permanently free tier at all. As of 2026 it is around US$20 a month in the United States, or nearer US$150 a year if you pay annually; other regions are priced separately. A trial is offered, 7 days on the monthly plan and 14 on the annual one, and card details are required.",
    instruments: "Acoustic and electric guitar, bass, and ukulele.",
    tellsYouWhatNext:
      "You pick an instrument and a genre when you sign up, then follow a curated path of instructor videos through levels. The path is chosen for a level rather than computed from the specific skills you have and have not got.",
    openSource: "No.",
    accountRequired: "Yes.",
    adsOrTimeLimits:
      "No ads. Access is a trial, after which a subscription is required to continue.",
    songLibrary:
      "A large catalogue of licensed songs, taught riff by riff alongside the lesson videos.",
  },
  stronger: [
    "Professional instructors on video, filmed from several angles, showing you exactly what a technique looks and sounds like when it is done right. Music Practice teaches in text and diagrams and has no video of anyone playing.",
    "A large catalogue of licensed songs broken into riffs and parts, so what you practise is music you already wanted to play. Music Practice has no song library.",
    "It teaches acoustic guitar, bass and ukulele as well as electric. The Music Practice guitar tree is written for electric guitar only.",
    "A feedback mode that listens through your microphone and scores your note and rhythm accuracy on its song and riff courses. Music Practice does not listen to your playing at all.",
    "Fender's production values, a full content team, native apps, and a deep back catalogue of lessons. Music Practice is browser only and built by one developer.",
  ],
  prefer: [
    "A curated path is picked for a beginner in general. Music Practice picks for you in particular. A prerequisite tree of {guitar} electric guitar skills locks each one behind the skills it actually builds on, so the order you meet things in is the order they stack, and the app can name the single skill you are ready for tonight and say why it is worth the twenty minutes.",
    "Following along with a lesson is not the same as keeping it. Everything Music Practice teaches returns on a spaced review schedule at {ladder}, so the chord change you drilled last month is put back in front of you before it slips. Nothing is lost by missing a night, because there is no streak in the app at all.",
    "It is free and open source, with no account, no card, and no subscription to remember to cancel, and the same curriculum engine also covers piano and drums, each keeping its own progress. The skill tree and the scheduler are both readable source rather than a black box.",
  ],
  faqs: [
    {
      question: "Is Music Practice really free?",
      answer:
        "Yes. It is free and open source under the MIT licence, with no subscription, no card, no ads, and nothing held back. The full source is public on GitHub, so the claim is checkable rather than something you have to believe.",
    },
    {
      question: "Is Music Practice as good as Fender Play?",
      answer:
        "As a lesson library, no, and it is honest about that. Fender Play has professional instructors on video, a large licensed song catalogue, microphone feedback on its song courses, and mature native apps that Music Practice does not. What Music Practice adds is a computed prerequisite path that names your next skill and why, plus spaced review so it stays. It is newer, smaller, and text based.",
    },
    {
      question: "Does Music Practice teach acoustic guitar?",
      answer:
        "The guitar curriculum is written for electric guitar, and that is how it should be judged. Most of the fundamentals it teaches, fretting hand technique, chord shapes, the fretboard and rhythm, transfer straight to an acoustic, but the app does not treat acoustic as its own instrument the way Fender Play does, and it covers no bass or ukulele.",
    },
    {
      question: "Does Music Practice need an account?",
      answer:
        "No. It runs in your browser and stores progress on your own device, so you can start playing within a minute of landing on it. An optional sign-in only adds cloud sync between devices, and everything works without it.",
    },
  ],
  related: [
    { href: "/guitar", label: "The free electric guitar curriculum in detail" },
    { href: "/compare/yousician-alternative", label: "Music Practice vs Yousician" },
    { href: "/compare/flowkey-alternative", label: "Music Practice vs flowkey" },
    { href: "/about", label: "Why this app exists" },
  ],
};

const MELODICS: CompetitorComparison = {
  slug: "melodics-alternative",
  path: "/compare/melodics-alternative",
  competitor: "Melodics",
  accent: "drums",
  title: "Free Melodics Alternative (Open Source)",
  description:
    "Looking for a free Melodics alternative? Music Practice is a free, open source drums and music app with no account and no paywall, and it needs no MIDI hardware. It teaches why each rudiment comes next. Here is an honest comparison.",
  keywords: [
    "melodics alternative",
    "free melodics alternative",
    "melodics alternative free",
    "melodics alternative no midi",
    "open source drum practice app",
    "melodics vs",
  ],
  lede: "Music Practice is a free, open source app for drums, piano, and electric guitar. Melodics is a subscription rhythm trainer built around MIDI pads and electronic kits; Music Practice teaches drum fundamentals on a plain practice pad and explains why each rudiment comes next, for nothing. Here is where each one is stronger, stated plainly.",
  intro:
    "Music Practice runs in your browser with no account, no paywall, and no hardware to buy. Where Melodics is built around a MIDI controller or an electronic kit and scores your timing note by note, Music Practice teaches the drum rudiments on a practice pad through a prerequisite skill tree that decides what you are ready for and explains why. It also covers piano and electric guitar.",
  cells: {
    price:
      "Paid subscription. As of 2026, about US$12.49 a month on the standard plan, with higher tiers around US$20 to US$30 a month. A 7-day trial is offered.",
    instruments: "Drums, keys, and pads, played through a MIDI controller or electronic kit.",
    tellsYouWhatNext:
      "It scores your timing on sample-based drills as you play along, rather than gating each skill behind the ones it depends on and explaining why it comes next.",
    openSource: "No.",
    accountRequired: "Yes.",
    adsOrTimeLimits: "No ads. Access is a 7-day trial, after which a subscription is required to continue.",
    songLibrary: "A large catalogue of licensed grooves and lessons for pads and drums.",
  },
  stronger: [
    "Deep MIDI-hardware integration: it reads your pads, electronic drums, or MIDI keyboard directly and scores your timing note by note. Music Practice has no MIDI input.",
    "A large catalogue of licensed grooves and lessons built for pad and drum controllers. Music Practice has no such library.",
    "Timing feedback tuned to electronic kits, which a practice-pad curriculum does not attempt.",
    "A mature, polished product with native apps. Music Practice is browser based, and drums are practice-pad only in this version.",
  ],
  prefer: [
    "Melodics scores how well you played a groove. Music Practice teaches the {drums} drum skills that let you play it, on a plain practice pad, and it explains why each rudiment comes next instead of dropping you into a scored drill. No MIDI pad, electronic kit, or hardware of any kind is required.",
    "It is a real prerequisite path, not a scored playlist. Each rudiment is gated behind the ones it builds on, and anything you learn returns on a spaced review schedule at {ladder}, so your hands keep what they built.",
    "It is free and open source, with no account and no hardware to buy, and the same curriculum engine also covers piano and electric guitar, each keeping its own progress.",
  ],
  faqs: [
    {
      question: "Is Music Practice really free?",
      answer:
        "Yes. It is free and open source under the MIT licence, with no subscription, no ads, and no lesson held behind a paywall. The full source is public on GitHub.",
    },
    {
      question: "Do I need a MIDI controller or an electronic kit?",
      answer:
        "No. Music Practice teaches the drum rudiments on a plain practice pad and needs no MIDI pad, electronic drums, or hardware of any kind. Melodics is built around MIDI hardware; this is the difference most people are weighing.",
    },
    {
      question: "Is Music Practice as good as Melodics?",
      answer:
        "In some ways no, and it is honest about that. Melodics reads your MIDI hardware directly, scores your timing note by note, and has a large licensed groove library and mature native apps that Music Practice does not. What Music Practice does that Melodics does not is teach why each rudiment comes next and review what you learned so it sticks, with no hardware and no subscription. It is newer and smaller.",
    },
    {
      question: "Does Music Practice only teach drums?",
      answer: `No. Drums are one of three instruments; it also covers piano and electric guitar, each with its own prerequisite skill tree (${SKILL_NODE_COUNTS.drums} drum skills, ${SKILL_NODE_COUNTS.piano} piano, and ${SKILL_NODE_COUNTS.guitar} guitar).`,
    },
  ],
  related: [
    { href: "/drums", label: "The free drums curriculum in detail" },
    { href: "/piano", label: "The free piano curriculum" },
    { href: "/compare/drumeo-alternative", label: "Music Practice vs Drumeo" },
    { href: "/compare/yousician-alternative", label: "Music Practice vs Yousician" },
    { href: "/about", label: "Why this app exists" },
  ],
};

const DRUMEO: CompetitorComparison = {
  slug: "drumeo-alternative",
  path: "/compare/drumeo-alternative",
  competitor: "Drumeo",
  accent: "drums",
  title: "Free Drumeo Alternative (Open Source)",
  description:
    "Looking for a free Drumeo alternative? Music Practice is a free, open source drum app with no account, no paywall, and no kit required. It teaches the rudiments on a practice pad and explains why each one comes next. Here is an honest comparison.",
  keywords: [
    "drumeo alternative",
    "free drumeo alternative",
    "drumeo alternative free",
    "drumeo alternative reddit",
    "free drum practice app no subscription",
    "drumeo vs",
  ],
  lede: "Music Practice is a free, open source app for drums, piano, and electric guitar. Drumeo is a large subscription library of video lessons taught by working drummers, aimed squarely at getting you around a kit. Music Practice teaches the rudiments on a plain practice pad, with no hardware at all, and explains why each one comes next. Here is where each one is stronger, stated plainly.",
  intro:
    "Music Practice runs in your browser with no account, no subscription, and nothing to buy. Its drum curriculum is a prerequisite graph on a practice pad: each rudiment is gated behind the ones it builds on, the app names the single next one and why it matters, and it returns later on a review schedule. Drumeo is a far larger product with real teachers, and the honest way to frame the choice is what you have in front of you: a pad and twenty minutes, or a kit and a budget.",
  cells: {
    price:
      "Paid subscription. As of 2026, about US$25 a month or US$229 a year on the standard plan, and about US$30 a month or US$279 a year on a broader one. A 7-day trial is offered and card details are required.",
    instruments:
      "Drums, on an acoustic or electronic kit. The same subscription also opens the wider platform's piano, guitar, bass, and voice lessons.",
    tellsYouWhatNext:
      "A leveled video method sits alongside a very large course library you browse yourself. The sequence is curated by teachers rather than gated skill by skill, and nothing checks which skills you personally already have.",
    openSource: "No.",
    accountRequired: "Yes.",
    adsOrTimeLimits:
      "No ads. A free account opens a small number of lessons; the method and the library need a subscription.",
    songLibrary:
      "A large catalogue of licensed play-along songs with charts, alongside thousands of video lessons.",
  },
  stronger: [
    "Working professional drummers teaching on video, thousands of lessons deep, with live sessions on top. Music Practice has no video and no instructors, only written lessons and a count grid.",
    "Real human feedback: you can send in a video of your playing and have a teacher watch it and tell you what to fix. Nothing in Music Practice ever looks at how you actually played.",
    "It teaches the whole kit, including the bass drum pedal, the hi-hat foot, and coordination between all four limbs. Music Practice teaches drums on a practice pad in this version and covers no footwork whatsoever.",
    "A large catalogue of licensed play-along songs with charts, so you spend your time drumming to real music. Music Practice has no song library.",
    "One subscription also covers piano, guitar, bass and voice on the wider platform, taught to the same standard, with a large and active community around it.",
  ],
  prefer: [
    "Drumeo assumes you are heading for a kit, and its method reaches pedals and hi-hat work early. Music Practice teaches {drums} drum skills on a plain practice pad, with no kit, no pedals, no electronics and nothing to plug in, so a pad on the kitchen table and twenty minutes is a real curriculum rather than a holding pattern until you can afford the rest.",
    "It is a computed prerequisite path, not a library to browse. Each rudiment is locked behind the ones it builds on, the app names the single next one and explains why it matters before you drill it, and it comes back on a spaced review schedule at {ladder} so your hands keep what they built.",
    "It is free and open source, with no account and nothing to cancel, and the same curriculum engine also covers piano and electric guitar, each keeping its own progress. How the tree sequences a rudiment and when the scheduler brings it back are both things you can go and read.",
  ],
  faqs: [
    {
      question: "Is Music Practice really free?",
      answer:
        "Yes. It is free and open source under the MIT licence, with no subscription, no card, no ads, and no lesson held back. The full source is public on GitHub, so none of that has to be taken on trust.",
    },
    {
      question: "Do I need a drum kit?",
      answer:
        "No. Music Practice teaches the drum rudiments on a plain practice pad, and a pad is all this version expects or supports. That is also its limit: it does not teach the bass drum pedal, the hi-hat foot, or four-limb coordination, and Drumeo does. If you already have a kit and want to play songs on it, Drumeo is the better fit.",
    },
    {
      question: "Is Music Practice as good as Drumeo?",
      answer:
        "No, and the gap is not close on content. Drumeo has professional drummers teaching on video, thousands of lessons, live sessions, real human review of your playing, and a licensed play-along library that Music Practice has none of. What Music Practice offers is a free prerequisite path that names why each rudiment comes next and reviews it so it sticks, on a practice pad, with nothing to buy.",
    },
    {
      question: "Does Music Practice only teach drums?",
      answer: `No. Drums are one of three instruments; it also covers piano and electric guitar, each with its own prerequisite skill tree (${SKILL_NODE_COUNTS.drums} drum skills, ${SKILL_NODE_COUNTS.piano} piano, and ${SKILL_NODE_COUNTS.guitar} guitar), and each keeps its own progress.`,
    },
  ],
  related: [
    { href: "/drums", label: "The free drums curriculum in detail" },
    { href: "/compare/melodics-alternative", label: "Music Practice vs Melodics" },
    { href: "/compare/fender-play-alternative", label: "Music Practice vs Fender Play" },
    { href: "/piano", label: "The free piano curriculum" },
  ],
};

/** Every comparison, keyed by slug. Drives the static routes and the sitemap. */
export const COMPARE_DATA: Record<string, CompetitorComparison> = {
  [SIMPLY_PIANO.slug]: SIMPLY_PIANO,
  [FLOWKEY.slug]: FLOWKEY,
  [YOUSICIAN.slug]: YOUSICIAN,
  [FENDER_PLAY.slug]: FENDER_PLAY,
  [MELODICS.slug]: MELODICS,
  [DRUMEO.slug]: DRUMEO,
};

/** Slugs in stable render order, grouped by the instrument each page leads with. */
export const COMPARE_SLUGS = [
  SIMPLY_PIANO.slug,
  FLOWKEY.slug,
  YOUSICIAN.slug,
  FENDER_PLAY.slug,
  MELODICS.slug,
  DRUMEO.slug,
] as const;

/**
 * Fill the `{piano}` / `{guitar}` / `{drums}` / `{ladder}` placeholders in wedge
 * prose from the real curriculum, so the numbers on these pages are the ones the
 * skill trees actually hold and cannot be hand-edited into a lie.
 */
export function resolveComparePlaceholders(text: string): string {
  return text
    .replaceAll("{piano}", String(SKILL_NODE_COUNTS.piano))
    .replaceAll("{guitar}", String(SKILL_NODE_COUNTS.guitar))
    .replaceAll("{drums}", String(SKILL_NODE_COUNTS.drums))
    .replaceAll("{ladder}", reviewLadderPhrase());
}
