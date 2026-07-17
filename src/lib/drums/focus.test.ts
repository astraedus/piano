import { describe, it, expect } from "vitest";
import { drumsFocusFor, drumsFocusLabel } from "./focus";
import { DRUMS_GHOST_ROTATION } from "./curriculum";
import { KEY_META } from "../music";
import type { KeyId } from "../types";

// Every token the rotation actually emits (Stage A: just "C"), plus the full map
// of tokens the interpreter defines (ready for Stage B).
const ROTATION_TOKENS: KeyId[] = Array.from(new Set(Object.values(DRUMS_GHOST_ROTATION).flat()));
const ALL_MAP_TOKENS: KeyId[] = ["C", "G", "D", "A", "E", "F", "B", "am"];

describe("drums focus (the token → rudiment interpreter)", () => {
  it("every rotation token resolves to a curated rudiment focus", () => {
    for (const t of ROTATION_TOKENS) {
      const f = drumsFocusFor(t);
      expect(f.label.length, `label for ${t}`).toBeGreaterThan(0);
      expect(f.blurb.length, `blurb for ${t}`).toBeGreaterThan(0);
      expect(f.pattern.length, `pattern for ${t}`).toBeGreaterThan(0);
    }
  });

  it("the full map (ready for Stage B) resolves every designed token", () => {
    for (const t of ALL_MAP_TOKENS) {
      const f = drumsFocusFor(t);
      expect(f.label.length, `label for ${t}`).toBeGreaterThan(0);
      expect(f.pattern.length, `pattern for ${t}`).toBeGreaterThan(0);
    }
  });

  it("labels read as rudiments, never as a tonal key name", () => {
    for (const t of ALL_MAP_TOKENS) {
      const keyName = KEY_META[t]?.name ?? t;
      expect(drumsFocusLabel(t), `label for ${t}`).not.toBe(keyName);
      expect(drumsFocusLabel(t)).not.toMatch(/major|minor/i);
    }
  });

  it("labels mention rudiment concepts (roll / stroke / paradiddle / flam / drag / buzz)", () => {
    const rudimentWords = /roll|stroke|paradiddle|flam|drag|buzz|accent|rudiment/i;
    for (const t of ALL_MAP_TOKENS) {
      expect(drumsFocusLabel(t), `label for ${t}: "${drumsFocusLabel(t)}"`).toMatch(rudimentWords);
    }
  });

  it("patterns only contain R/L hands (or rests), never a note name", () => {
    for (const t of ALL_MAP_TOKENS) {
      for (const cell of drumsFocusFor(t).pattern) {
        if (!cell.rest) expect(["R", "L"]).toContain(cell.hand);
      }
    }
  });

  it("unknown tokens fall back to a rudiment-native focus, never crash", () => {
    const f = drumsFocusFor("zz-unknown");
    expect(f.label).toMatch(/rudiment/i);
    expect(f.pattern.length).toBeGreaterThan(0);
  });
});
