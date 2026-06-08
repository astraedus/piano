// Guitar teaching content. Record<nodeId, NodeLesson> — the real lesson behind
// each skill-tree node (the one-line masteryDrill is only the success target).
//
// VOICE: capitalized, functional, warm, soul-first. Lead with the feeling and the
// payoff, then teach the how in plain steps. Use real term words ("power chord",
// "minor pentatonic") so the glossary auto-chips them — never explain a term inline
// that the glossary already covers. No em-dashes (use periods/commas). No fake
// hype. Every lesson must make a total beginner able to actually DO the thing.
//
// node ids must match GUITAR_NODES in skillNodes.ts. Coverage is asserted in tests.

import type { NodeLesson } from "../types";

export const GUITAR_LESSONS: Record<string, NodeLesson> = {
  // ── Gold-standard examples (the quality bar for the rest) ──────────────────
  "g-t0-anatomy": {
    what: "Your guitar has six strings. From the thickest (closest to the ceiling) to the thinnest, they are E, A, D, G, B, E. Tuning means setting each one to its correct pitch so the instrument sounds right under your fingers.",
    why: "An out-of-tune guitar teaches your ears the wrong thing and makes everything you play sound bad even when your hands are perfect. Tuning is the one ritual that comes before every session. Two minutes here saves every other minute you practice.",
    steps: [
      { do: "Say the string names out loud, thickest to thinnest: E, A, D, G, B, E.", feel: "A memory hook: Eddie Ate Dynamite, Good Bye Eddie." },
      { do: "Open a free tuner app (or a clip-on tuner) and pluck the thickest string. Turn its tuning peg until the tuner reads E.", feel: "Turn slowly. Sharp means too high, flat means too low." },
      { do: "Work across all six strings: E, A, D, G, B, E. Pluck, watch the needle, adjust.", feel: "The needle should settle dead center and stay." },
      { do: "Pluck each open string one more time and just listen to it ring.", feel: "A tuned guitar has a clean, settled sound. Learn what that sounds like." },
    ],
    goodWhen: "You can name all six strings without thinking, and tune the guitar from cold in under 90 seconds.",
    watchOut: "Tuning pegs are sensitive. Make small turns and re-pluck constantly. Big turns snap strings.",
    song: { name: "Any song", note: "Nothing sounds right until you do this first. It is the gate to everything." },
  },

  "g-t1-power": {
    what: "A power chord is just two notes (sometimes three) played together that sound huge, thick, and a little angry. It is the backbone of rock, punk, and metal. The magic: it is one shape you can slide anywhere on the neck to get any power chord.",
    why: "Learn this one shape and you can play the rhythm part of literally thousands of rock songs. Power chords are easier than full chords (only two fingers) and they sound massive with distortion. This is the single highest-payoff shape on the guitar.",
    steps: [
      { do: "Put your first finger on the thick E string, 3rd fret. That is your root note, G.", feel: "Press just behind the fret, not on top of it." },
      { do: "Add your third finger two frets up, on the A string, 5th fret.", feel: "Your fingers make a small box shape." },
      { do: "Strum only those two strings. Mute the rest by leaning your fingers against them.", feel: "Big and clean, no thin extra strings ringing." },
      { do: "Now slide the whole shape up two frets and strum again. You just played a different power chord without learning anything new.", feel: "Same shape, new home. That is the whole trick." },
      { do: "Practice moving E5 to A5 to D5 to G5, two beats each, slow.", feel: "Smooth jumps, no buzzing between chords." },
    ],
    goodWhen: "You can move the shape between E5, A5, D5, and G5 at 80bpm with both notes ringing clean and no stray strings.",
    watchOut: "The most common buzz comes from not pressing hard enough with the third finger. Push from the fingertip and keep the thumb behind the neck.",
    song: { name: "Smells Like Teen Spirit (Nirvana)", note: "The whole riff is four power chords moved around. You are minutes away from playing it." },
  },
};
