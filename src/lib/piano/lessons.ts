// Piano teaching content. Record<nodeId, NodeLesson> — the real lesson behind
// each skill-tree node (the one-line masteryDrill is only the success target).
//
// VOICE: capitalized, functional, warm, soul-first. Lead with the feeling and the
// payoff, then teach the how in plain steps. Use real term words ("C major",
// "triad", "tonic") so the glossary auto-chips them. No em-dashes. No fake hype.
// Every lesson must make a total beginner able to actually DO the thing.
//
// node ids must match PIANO_NODES in skillNodes.ts. Coverage is asserted in tests.

import type { NodeLesson } from "../types";

export const PIANO_LESSONS: Record<string, NodeLesson> = {
  // ── Gold-standard example (the quality bar for the rest) ───────────────────
  "p-key-C": {
    what: "C major is the home base of the piano. It is the scale you play using only the white keys, starting on the note C. Its three-note chord (a triad) is C, E, G played together. Almost every beginner song lives here because there are no black keys to worry about.",
    why: "Get C major under your hands and you can play a huge amount of music immediately. It is the key everything else is measured against, and the I, IV, V chords in C (the three chords behind countless songs) are all easy white-key shapes.",
    steps: [
      { do: "Find C: it is the white key just to the left of any group of two black keys.", feel: "Once you see the two-black-key landmark, C jumps out everywhere." },
      { do: "Play the C scale with your right hand: C, D, E, F, G, A, B, C, all white keys going up.", feel: "Thumb on C, tuck it under after E to keep going smoothly." },
      { do: "Now play the C triad: press C, E, and G together with thumb, middle, and pinky.", feel: "A full, resolved, happy sound. That is home." },
      { do: "Play the progression C, F, G, C as block chords, holding each for a count of four.", feel: "Hear how G pulls you back home to C. That pull is the engine of music." },
    ],
    goodWhen: "You can play the C scale hands-separately without hunting for keys, and move between the C, F, and G chords cleanly.",
    watchOut: "Do not look at your hands the whole time. Glance, then feel for the next key. Your fingers learn the distances faster than your eyes do.",
    song: { name: "Let It Be (The Beatles)", note: "The chorus is C, G, Am, F. You already have two of those four chords." },
  },
};
