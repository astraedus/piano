"use client";

// Tap feedback + accidental-re-tap guard for a "I did this rep" chip.
//
// WHY THIS EXISTS (PostHog, host music.raeduslabs.com, 2026-09-10..09-24): the
// warmup's "I Played It" chip was both the most-clicked element on `/` (342
// autocapture clicks, 40 people) AND the app's top rage-click target (10
// $rageclick events, 8 people — every one of them on Mobile Chrome, Mobile
// Safari or Samsung Internet). A rage-click is 3+ clicks on one spot inside
// about a second.
//
// Reproduced at 390x844: the tap changed NOTHING under the finger. `.chip` in
// globals.css defined a `:hover` state and no `:active` state, and touch devices
// do not hover — so the chip was pixel-identical before and after. The only
// feedback was a new `text-xs italic var(--ink-3)` line rendered BELOW the chip
// (i.e. behind the thumb that just tapped, in the lowest-contrast ink token),
// which also shoved every pixel beneath it down ~23px. It read as "nothing
// happened", so people tapped again — and every one of those taps silently
// incremented their own rep count (measured: 3 taps at 180ms intervals took a
// user's count from 1 to 4).
//
// The fix is two distinct signals, kept honest by never conflating them:
//   TAP RECEIVED  — every tap: the press/pulse animation + a haptic tick.
//   REP COUNTED   — guarded: the number rendered ON the chip changes.
// So a rage-tap always visibly registers, and the number on the chip is still
// the truth about what was recorded.

import { useCallback, useRef, useState } from "react";

/**
 * Taps landing within this window of a COUNTED tap are treated as the same rep.
 *
 * ASSUMPTION: multi-taps inside 400ms are accidental (a double/triple tap, or a
 * rage-tap at a button that looked dead). A deliberate second rep a second later
 * still counts. The window is measured from the last tap that COUNTED, never
 * from the last tap seen, so the guard can never suppress input for longer than
 * 400ms no matter how fast someone taps.
 */
export const REP_TAP_WINDOW_MS = 400;

/** Haptic tick length. Short enough to read as a tick, not a buzz. */
export const REP_TAP_HAPTIC_MS = 15;

/**
 * The two alternating pulse classes (defined in `globals.css`).
 *
 * There are two identical animations because a CSS animation only restarts when
 * its `animation-name` changes — flipping between two names is how a second tap
 * re-fires the pulse without remounting the button (a remount would drop
 * keyboard focus mid-interaction).
 */
export const REP_TAP_PULSE_CLASSES = ["chip-tap-pulse-a", "chip-tap-pulse-b"] as const;

/** Pure: does a tap at `now` record a rep, given when the last one was recorded? */
export function tapCounts(
  lastCountedAt: number | null,
  now: number,
  windowMs: number = REP_TAP_WINDOW_MS,
): boolean {
  return lastCountedAt === null || now - lastCountedAt >= windowMs;
}

/** Pure: which pulse class a given tap ordinal wears. `0` = never tapped yet. */
export function pulseClassFor(tapSeq: number): string {
  if (tapSeq <= 0) return "";
  return REP_TAP_PULSE_CLASSES[tapSeq % 2];
}

/**
 * Fire the haptic tick. Absent on desktop and iOS Safari, and blockable by a
 * permissions policy — a missing or refused vibrator must never break the rep,
 * so every failure path is swallowed. Returns whether the device buzzed.
 */
export function repTapHaptic(ms: number = REP_TAP_HAPTIC_MS): boolean {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  try {
    return navigator.vibrate(ms);
  } catch {
    return false;
  }
}

/**
 * Wire a rep chip: `onTap` on the button, `pulseClass` into its className.
 *
 * `onCount` runs only for taps that actually record a rep; it returns whether
 * this tap counted, so a caller can tell the two signals apart.
 */
export function useRepTap(
  onCount: () => void,
  windowMs: number = REP_TAP_WINDOW_MS,
): { onTap: () => boolean; pulseClass: string } {
  const lastCountedAt = useRef<number | null>(null);
  const [tapSeq, setTapSeq] = useState(0);

  const onTap = useCallback((): boolean => {
    // TAP RECEIVED — unconditional, so no tap ever looks dead.
    setTapSeq((n) => n + 1);
    repTapHaptic();

    // REP COUNTED — guarded.
    const now = Date.now();
    if (!tapCounts(lastCountedAt.current, now, windowMs)) return false;
    lastCountedAt.current = now;
    onCount();
    return true;
  }, [onCount, windowMs]);

  return { onTap, pulseClass: pulseClassFor(tapSeq) };
}
