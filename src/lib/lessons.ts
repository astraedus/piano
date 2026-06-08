// Teaching-content registry. Looks up a NodeLesson by instrument + node id.
//
// Content lives per-instrument in lib/<instrument>/lessons.ts as a plain-data
// Record<nodeId, NodeLesson> (JSON-serializable strings — see types.ts NodeLesson).
// This module is the single read path the UI uses (panel, stand, path view), so a
// node with no authored lesson simply returns undefined and the caller falls back
// to the masteryDrill/unlock one-liners. No node ever renders a blank teaching pane.

import type { Instrument, NodeLesson } from "./types";
import { GUITAR_LESSONS } from "./guitar/lessons";
import { PIANO_LESSONS } from "./piano/lessons";

const BY_INSTRUMENT: Record<Instrument, Record<string, NodeLesson>> = {
  guitar: GUITAR_LESSONS,
  piano: PIANO_LESSONS,
};

/** The authored lesson for a node, or undefined if none exists yet. */
export function getLesson(instrument: Instrument, nodeId: string): NodeLesson | undefined {
  return BY_INSTRUMENT[instrument]?.[nodeId];
}

/** True when the node has a full authored lesson (used to decide panel layout). */
export function hasLesson(instrument: Instrument, nodeId: string): boolean {
  return Boolean(getLesson(instrument, nodeId));
}

/** All node ids with authored lessons for an instrument (coverage checks/tests). */
export function lessonNodeIds(instrument: Instrument): string[] {
  return Object.keys(BY_INSTRUMENT[instrument] ?? {});
}
