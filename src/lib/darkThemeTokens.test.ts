// Invariant for the 2026-07-17 dark-mode QA bug: the per-instrument accent
// surface/text pair (--instrument-accent-bg / --instrument-accent-deep) was
// defined only in the LIGHT instrument blocks, so dark mode kept a pale cream
// card under theme-flipped ink (measured 1–3:1 on the highlighted /tree node).
//
// Contract enforced here: every instrument that defines a light accent-bg must
// also define accent-bg + accent-deep under BOTH dark mechanisms (the
// prefers-color-scheme media query and the explicit [data-theme="dark"] toggle).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8");

/** All `:root...{...}` blocks whose selector matches `sel`, concatenated. */
function blocksFor(sel: RegExp): string {
  const out: string[] = [];
  const re = /(:root[^{]*)\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    if (sel.test(m[1])) out.push(m[2]);
  }
  return out.join("\n");
}

const DARK_MEDIA = /:not\(\[data-theme="light"\]\)/;
const DARK_TOGGLE = /\[data-theme="dark"\]/;

describe("dark theme defines the instrument accent surface/text pair", () => {
  const instruments = ["guitar", "drums"];

  for (const [name, sel] of [
    ["prefers-color-scheme", DARK_MEDIA],
    ['data-theme="dark"', DARK_TOGGLE],
  ] as const) {
    it(`${name}: base (piano) dark block redefines accent-bg and accent-deep`, () => {
      const block = blocksFor(sel);
      expect(block).toMatch(/--instrument-accent-bg:/);
      expect(block).toMatch(/--instrument-accent-deep:/);
    });

    for (const inst of instruments) {
      it(`${name}: ${inst} dark block redefines accent-bg and accent-deep`, () => {
        const instSel = new RegExp(`${sel.source}.*\\[data-instrument="${inst}"\\]`);
        const block = blocksFor(instSel);
        expect(block, `missing dark ${inst} accent overrides`).toMatch(/--instrument-accent-bg:/);
        expect(block).toMatch(/--instrument-accent-deep:/);
      });
    }
  }

  it("dark accent-bg values are actually dark (not the light pastels)", () => {
    const darkBlocks = blocksFor(DARK_MEDIA) + blocksFor(DARK_TOGGLE);
    const bgs = [...darkBlocks.matchAll(/--instrument-accent-bg:\s*#([0-9a-fA-F]{6})/g)].map((m) => m[1]);
    expect(bgs.length).toBeGreaterThanOrEqual(6);
    for (const hex of bgs) {
      const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
      // relative luminance must be low — a light pastel here recreates the bug
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      expect(lum, `#${hex} is too light for a dark-mode surface`).toBeLessThan(80);
    }
  });
});
