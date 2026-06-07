import { describe, it, expect } from "vitest";
import { guitarFocusFor, guitarFocusLabel } from "./focus";
import { GUITAR_GHOST_ROTATION } from "./curriculum";
import { KEY_META } from "../music";
import type { KeyId } from "../types";

const FOCUS_IDS: KeyId[] = Array.from(
  new Set(Object.values(GUITAR_GHOST_ROTATION).flat()),
);

describe("guitar focus labels", () => {
  it("every ghost-rotation KeyId has a curated, non-empty guitar label + blurb", () => {
    for (const id of FOCUS_IDS) {
      const f = guitarFocusFor(id);
      expect(f.label.length, `label for ${id}`).toBeGreaterThan(0);
      expect(f.blurb.length, `blurb for ${id}`).toBeGreaterThan(0);
    }
  });

  it("labels read as guitar concepts, never as a bare piano key name", () => {
    // The placeholder this replaces returned KEY_META[id].name ("E minor", "C major").
    // A guitar-native label must NOT be exactly that key name.
    for (const id of FOCUS_IDS) {
      const keyName = KEY_META[id]?.name ?? id;
      expect(guitarFocusLabel(id), `label for ${id}`).not.toBe(keyName);
    }
  });

  it("guitar-native labels mention chords / changes / riffs / boxes, not 'major'/'minor' key names", () => {
    const guitarWords = /chord|riff|power|pentatonic|box|barre|strum|change|→|open/i;
    for (const id of FOCUS_IDS) {
      expect(guitarFocusLabel(id), `label for ${id}: "${guitarFocusLabel(id)}"`).toMatch(guitarWords);
    }
  });

  it("unknown focus ids fall back to a guitar-native label, never crash", () => {
    const f = guitarFocusFor("zz-unknown");
    expect(f.label).toMatch(/riff|focus/i);
    expect(f.blurb.length).toBeGreaterThan(0);
  });
});
