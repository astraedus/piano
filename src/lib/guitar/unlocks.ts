import type { UnlockCard } from "../types";

// Guitar capabilities the player gains — not task badges. Each tryLine points at
// a real riff/song that uses the new skill, mirroring the piano unlock voice.
// Ids match the `unlockCardId` set on GUITAR_NODES; every card here is earned by
// exactly one node (data-integrity test enforces this).
export const GUITAR_UNLOCK_LIBRARY: UnlockCard[] = [
  {
    id: "u-g-anatomy",
    phase: 1,
    title: "Tune up and find your way around.",
    tryLine: "Name all six strings, tune from cold in under 90 seconds. Now you speak guitar.",
  },
  {
    id: "u-g-tab",
    phase: 1,
    title: "Read any tab on the internet.",
    tryLine: "Pull up the Seven Nation Army tab. Six lines, fret numbers. You can read it now.",
  },
  {
    id: "u-g-first-riff",
    phase: 1,
    title: "Your first riff is playable.",
    tryLine: "Seven Nation Army — one string, seven notes, all downstrokes. Go play it.",
  },
  {
    id: "u-g-open-chords",
    phase: 1,
    title: "Play dozens of songs in E and A minor.",
    tryLine: "Em, Am, E, A. That's Knockin' on Heaven's Door territory. Strum through one.",
  },
  {
    id: "u-g-open-chords-full",
    phase: 1,
    title: "The full open-chord vocabulary is yours.",
    tryLine: "Em, Am, E, A, D, G, C. Most pop songs live in these seven shapes. Try Wonderwall.",
  },
  {
    id: "u-g-power-chords",
    phase: 1,
    title: "Rock rhythm — the whole punk/metal vocabulary.",
    tryLine: "E5, A5, D5, G5. That shape slides anywhere. Play the Iron Man riff with it.",
  },
  {
    id: "u-g-bend",
    phase: 2,
    title: "The blues voice — you can bend a string.",
    tryLine: "Bend the B string at fret 7 up a whole step. That cry is the blues. Try Whole Lotta Love.",
  },
  {
    id: "u-g-pentatonic",
    phase: 2,
    title: "You can solo over rock and blues.",
    tryLine: "Am pentatonic Box 1. Put on an Am backing track and just play. It'll sound right.",
  },
  {
    id: "u-g-barre",
    phase: 2,
    title: "Every major and minor chord, one shape.",
    tryLine: "F barre at fret 1, slide it up the neck. Any key, anywhere. Play a song in F now.",
  },
  {
    id: "u-g-blues12",
    phase: 3,
    title: "You can jam a 12-bar blues.",
    tryLine: "12-bar in A: power chords for rhythm, Box 1 for the solo. You can sit in with anyone now.",
  },
  {
    id: "u-g-phrasing",
    phase: 3,
    title: "Your solos sound musical.",
    tryLine: "Play a 4-note phrase, leave a bar of silence, answer it. Call and response. That's a solo.",
  },
];

export function guitarPendingForPhase(phase: number): UnlockCard[] {
  return GUITAR_UNLOCK_LIBRARY.filter((u) => u.phase <= phase);
}
