// Regression tests for the "I Played It" rage-click fix (PostHog 2026-09: that
// chip was the app's #1 rage-click target on mobile, and every wasted tap
// silently incremented the user's own rep count).
//
// The contract under test is deliberately two-sided:
//   - EVERY tap produces feedback (pulse class advances, haptic fires), so no tap
//     ever looks dead — that is what stops the rage loop.
//   - Only the first tap inside REP_TAP_WINDOW_MS records a rep — that is what
//     keeps the number honest.
// Plus a source-level check that the CSS the hook names actually exists, so the
// TS and the stylesheet cannot drift apart silently.

import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  REP_TAP_HAPTIC_MS,
  REP_TAP_PULSE_CLASSES,
  REP_TAP_WINDOW_MS,
  pulseClassFor,
  repTapHaptic,
  tapCounts,
  useRepTap,
} from "./useRepTap";

afterEach(() => {
  vi.restoreAllMocks();
  delete (navigator as { vibrate?: unknown }).vibrate;
});

/** Install a Date.now we drive by hand, so the 400ms window is exact, not flaky. */
function fakeClock(start = 1_000_000) {
  let t = start;
  vi.spyOn(Date, "now").mockImplementation(() => t);
  return {
    advance(ms: number) {
      t += ms;
    },
  };
}

/** Install a spy vibrator (jsdom has no navigator.vibrate at all). */
function fakeVibrator(impl: (ms: number) => boolean = () => true) {
  const vibrate = vi.fn(impl);
  Object.defineProperty(navigator, "vibrate", { value: vibrate, configurable: true, writable: true });
  return vibrate;
}

describe("tapCounts — the accidental-re-tap guard", () => {
  it("counts the very first tap (nothing recorded yet)", () => {
    expect(tapCounts(null, 5_000)).toBe(true);
  });

  it("rejects a re-tap inside the window", () => {
    expect(tapCounts(5_000, 5_000 + REP_TAP_WINDOW_MS - 1)).toBe(false);
  });

  it("accepts a re-tap exactly at the window boundary", () => {
    expect(tapCounts(5_000, 5_000 + REP_TAP_WINDOW_MS)).toBe(true);
  });

  it("accepts a deliberate second rep a second later", () => {
    expect(tapCounts(5_000, 6_000)).toBe(true);
  });

  it("measures from the last COUNTED tap, so the guard can never suppress longer than the window", () => {
    // Someone tapping every 250ms forever: with a debounce measured from the last
    // tap SEEN they would be locked out indefinitely. Measured from the last tap
    // COUNTED, they get a rep every other tap.
    let lastCounted: number | null = null;
    let counted = 0;
    for (let i = 0; i < 8; i++) {
      const now = 1_000 + i * 250;
      if (tapCounts(lastCounted, now)) {
        lastCounted = now;
        counted++;
      }
    }
    expect(counted).toBe(4);
  });
});

describe("pulseClassFor — the animation-restart alternation", () => {
  it("renders no pulse class before the first tap", () => {
    expect(pulseClassFor(0)).toBe("");
  });

  it("alternates between the two classes so consecutive taps re-fire the animation", () => {
    const seen = [1, 2, 3, 4].map(pulseClassFor);
    expect(new Set(seen).size).toBe(2);
    for (let i = 1; i < seen.length; i++) expect(seen[i]).not.toBe(seen[i - 1]);
  });

  it("only ever emits classes the stylesheet knows about", () => {
    for (let i = 1; i <= 10; i++) {
      expect(REP_TAP_PULSE_CLASSES as readonly string[]).toContain(pulseClassFor(i));
    }
  });
});

describe("repTapHaptic — guarded for availability", () => {
  it("buzzes for 15ms when the device has a vibrator", () => {
    const vibrate = fakeVibrator();
    expect(repTapHaptic()).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(15);
    expect(REP_TAP_HAPTIC_MS).toBe(15);
  });

  it("is a no-op (never throws) on a device with no vibrator — desktop, iOS Safari", () => {
    expect("vibrate" in navigator).toBe(false);
    expect(() => repTapHaptic()).not.toThrow();
    expect(repTapHaptic()).toBe(false);
  });

  it("swallows a vibrator blocked by a permissions policy", () => {
    fakeVibrator(() => {
      throw new Error("blocked by permissions policy");
    });
    expect(() => repTapHaptic()).not.toThrow();
    expect(repTapHaptic()).toBe(false);
  });
});

describe("useRepTap — feedback on every tap, a rep only once per window", () => {
  it("records ONE rep for a triple-tap inside the window, but pulses and buzzes three times", () => {
    const clock = fakeClock();
    const vibrate = fakeVibrator();
    const onCount = vi.fn();
    const { result } = renderHook(() => useRepTap(onCount));

    const pulses: string[] = [];
    for (const gap of [0, 150, 150]) {
      clock.advance(gap);
      act(() => {
        result.current.onTap();
      });
      pulses.push(result.current.pulseClass);
    }

    expect(onCount).toHaveBeenCalledTimes(1); // the honest count
    expect(vibrate).toHaveBeenCalledTimes(3); // every tap registers
    expect(pulses[1]).not.toBe(pulses[0]); // ...and re-fires the animation
    expect(pulses[2]).not.toBe(pulses[1]);
  });

  it("counts a deliberate second rep a second later", () => {
    const clock = fakeClock();
    fakeVibrator();
    const onCount = vi.fn();
    const { result } = renderHook(() => useRepTap(onCount));

    act(() => {
      result.current.onTap();
    });
    clock.advance(1_000);
    act(() => {
      result.current.onTap();
    });

    expect(onCount).toHaveBeenCalledTimes(2);
  });

  it("reports whether the tap counted, so the two signals stay distinguishable", () => {
    const clock = fakeClock();
    const { result } = renderHook(() => useRepTap(() => {}));

    let first = false;
    let second = false;
    let third = false;
    act(() => {
      first = result.current.onTap();
    });
    clock.advance(100);
    act(() => {
      second = result.current.onTap();
    });
    clock.advance(REP_TAP_WINDOW_MS);
    act(() => {
      third = result.current.onTap();
    });

    expect([first, second, third]).toEqual([true, false, true]);
  });

  it("works on a device with no vibrator", () => {
    fakeClock();
    const onCount = vi.fn();
    const { result } = renderHook(() => useRepTap(onCount));
    act(() => {
      result.current.onTap();
    });
    expect(onCount).toHaveBeenCalledTimes(1);
  });
});

describe("the CSS contract the hook depends on", () => {
  const css = readFileSync(join(__dirname, "../../app/globals.css"), "utf8");

  /** The declaration body of a named @keyframes block. */
  function keyframeBody(name: string): string | null {
    const m = new RegExp(`@keyframes\\s+${name}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(css);
    return m ? m[1].replace(/\s+/g, " ").trim() : null;
  }

  it("defines a :active press state on the tap chip (touch devices never :hover)", () => {
    expect(css).toMatch(/\.chip-tap:active\s*\{[^}]*transform:/);
  });

  it("defines every pulse class the hook can emit", () => {
    for (const cls of REP_TAP_PULSE_CLASSES) {
      expect(css).toMatch(new RegExp(`\\.${cls}\\s*\\{[^}]*animation:`));
    }
  });

  it("keeps the twin keyframes byte-identical — they exist only to restart the animation", () => {
    const a = keyframeBody("chipTapPulse");
    const b = keyframeBody("chipTapPulseAlt");
    expect(a).toBeTruthy();
    expect(b).toEqual(a);
  });

  it("honours prefers-reduced-motion for the press and both pulses", () => {
    const reduced = /@media \(prefers-reduced-motion: reduce\)([\s\S]*)$/.exec(css)?.[1] ?? "";
    for (const cls of [".chip-tap", ...REP_TAP_PULSE_CLASSES.map((c) => `.${c}`)]) {
      expect(reduced).toContain(cls);
    }
    expect(reduced).toMatch(/\.chip-tap:active[^{]*\{[^}]*transform: none/);
  });
});
