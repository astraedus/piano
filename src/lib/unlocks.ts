import type { UnlockCard } from "./types";

// Capabilities the user gains, not task-completion badges.
// Each tryLine points at real, playable music — "here's a song that uses this".
export const UNLOCK_LIBRARY: UnlockCard[] = [
  {
    id: "u-p1-keyboard-map",
    phase: 1,
    title: "Find any note in under a second.",
    tryLine: "Try it: close your eyes, pick a letter, touch it. That quick.",
  },
  {
    id: "u-p1-c-map",
    phase: 1,
    title: "C major is yours.",
    tryLine: "Play Let It Be. The chords are C, G, Am, F. All in your key.",
  },
  {
    id: "u-p1-first-improv",
    phase: 1,
    title: "Make something up that sounds good.",
    tryLine: "Loop C–F–G–C with your left hand. Right hand, C pentatonic. It will sound right.",
  },
  {
    id: "u-p1-minor-feeling",
    phase: 1,
    title: "Hear major vs minor reliably.",
    tryLine: "Play a C major triad then an A minor triad. Your ear can name them now.",
  },
  {
    id: "u-p2-chord-under-melody",
    phase: 2,
    title: "Hold a chord with the left hand while the right plays a melody.",
    tryLine: "Try it: play any song you know in C. It'll sound right.",
  },
  {
    id: "u-p2-pop-formula",
    phase: 2,
    title: "You can play half of pop music.",
    tryLine: "Am–F–C–G. That's Someone Like You. Let Her Go. A hundred more. Try one.",
  },
  {
    id: "u-p2-4-bar-improv",
    phase: 2,
    title: "Improvise a 4-bar idea without panicking.",
    tryLine: "Loop i–iv–V in A minor. Play eight bars. Something will sound like you.",
  },
  {
    id: "u-p2-first-transcribe",
    phase: 2,
    title: "Put a melody you heard onto the piano.",
    tryLine: "Try Happy Birthday. Then Ode to Joy. You can do it.",
  },
  {
    id: "u-p3-ii-v-i",
    phase: 3,
    title: "You can read and play a ii–V–I.",
    tryLine: "That's the skeleton of every jazz standard. Autumn Leaves is waiting.",
  },
  {
    id: "u-p3-pop-pull",
    phase: 3,
    title: "Pick up a pop song from a recording.",
    tryLine: "Put on a song you half-know. Find the melody. Find a chord. It lives in your hands now.",
  },
  {
    id: "u-p3-three-moods",
    phase: 3,
    title: "Play the same progression three ways.",
    tryLine: "Tender. Angry. Resigned. Same four chords. Only touch and timing change.",
  },
  {
    id: "u-p3-lead-sheet",
    phase: 3,
    title: "Read a lead sheet in real time.",
    tryLine: "Pull up any pop chord chart. LH comps, RH finds the melody. It works now.",
  },
];

export function pendingForPhase(phase: number): UnlockCard[] {
  return UNLOCK_LIBRARY.filter((u) => u.phase <= phase);
}
