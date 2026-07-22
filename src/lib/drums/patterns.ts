// Named drums reference stickings for the skills that don't map to a single
// rotation token (counting / sixteenths / play-along / double paradiddle /
// Moeller). Token-mapped rudiments (singles/doubles/accents/paradiddle/five-
// stroke/flam/drag/buzz) get their sticking from focus.ts — the ONE token
// interpreter. These non-token references live here so the RhythmGrid drill
// reference AND a glossary "hear" demo read from the same array (no re-authored,
// drifting stickings). Pure data; StickingCell.count is display-only (playSticking
// reads only hand/accent/rest).

import type { StickingCell } from "../types";

/** One bar of eighth notes, R L alternating — the counting drill reference. */
export const EIGHTHS_BAR: StickingCell[] = [
  { hand: "R", accent: true, count: "1" }, { hand: "L", count: "&" },
  { hand: "R", count: "2" }, { hand: "L", count: "&" },
  { hand: "R", count: "3" }, { hand: "L", count: "&" },
  { hand: "R", count: "4" }, { hand: "L", count: "&" },
];

/** One bar of sixteenth notes counted "1 e & a …", accent on each main beat. */
export const SIXTEENTHS_BAR: StickingCell[] = [
  "1", "e", "&", "a", "2", "e", "&", "a", "3", "e", "&", "a", "4", "e", "&", "a",
].map((count, i) => ({ hand: (i % 2 === 0 ? "R" : "L") as "R" | "L", accent: i % 4 === 0, count }));

/** Backbeat accents on beats 2 and 4 over eighths — the "play along" reference. */
export const BACKBEAT_BAR: StickingCell[] = [
  { hand: "R", count: "1" }, { hand: "L", count: "&" },
  { hand: "R", accent: true, count: "2" }, { hand: "L", count: "&" },
  { hand: "R", count: "3" }, { hand: "L", count: "&" },
  { hand: "R", accent: true, count: "4" }, { hand: "L", count: "&" },
];

/** Double paradiddle, R-lead group: R L R L R R across two beats of triplets. */
export const DOUBLE_PARADIDDLE_BAR: StickingCell[] = [
  { hand: "R", accent: true, count: "1" }, { hand: "L", count: "&" }, { hand: "R", count: "a" },
  { hand: "L", count: "2" }, { hand: "R", count: "&" }, { hand: "R", count: "a" },
];

/** Moeller whip: one accent-tap-tap triplet on a single hand (down / tap / up). */
export const MOELLER_BAR: StickingCell[] = [
  { hand: "R", accent: true, count: "1" }, { hand: "R", count: "&" }, { hand: "R", count: "a" },
];

/**
 * One bar of single-stroke triplets — THREE even cells per beat, counted
 * "1 trip let 2 trip let …", accent on each main beat. This is honest triplet
 * spacing: playSticking spaces N cells evenly at the pulse rate, so three cells
 * per beat sound as three equal notes (never faked on a four-cell sixteenth grid).
 * With alternating single strokes the lead hand naturally swaps each beat (beat 1
 * leads R, beat 2 leads L …) — a feature the lesson teaches, not a bug.
 */
export const TRIPLET_BAR: StickingCell[] = [
  "1", "trip", "let", "2", "trip", "let", "3", "trip", "let", "4", "trip", "let",
].map((count, i) => ({ hand: (i % 2 === 0 ? "R" : "L") as "R" | "L", accent: i % 3 === 0, count }));

/**
 * One bar of eighth notes where the HITS land on the offbeats (the "&"s) and the
 * main beats are rests — the syncopation reference. One offbeat carries an accent
 * (the "and of 2") to show a hit landing where the beat isn't. Rests advance the
 * clock silently in playSticking, so the ear hears the beats stay empty.
 */
export const OFFBEAT_BAR: StickingCell[] = [
  { rest: true, count: "1" }, { hand: "R", count: "&" },
  { rest: true, count: "2" }, { hand: "L", accent: true, count: "&" },
  { rest: true, count: "3" }, { hand: "R", count: "&" },
  { rest: true, count: "4" }, { hand: "L", count: "&" },
];
