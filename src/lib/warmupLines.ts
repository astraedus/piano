// Warmup-line placeholder fill — pure, shared by the stand (WarmupSlot) and the
// printable sheet (print/page.tsx) so both render the SAME text. Previously this
// lived inline in WarmupSlot, so the print path leaked raw `{fiveFinger}`-style
// placeholders onto paper (the bundled bug this fixes).
//
// The only placeholder today is `{fiveFinger}`: the five-finger pattern
// (1-2-3-4-5-4-3-2-1, note names) for a key's scale, substituted so a warmup
// never hardcodes C in an A-major (etc.) week. Non-tonal instruments (drums) use
// no placeholders, so this is a harmless no-op for their warmup lines.

import type { KeyId } from "./types";
import { KEY_META, keyPrefersFlats, scale } from "./music";

/** The 1-2-3-4-5-4-3-2-1 five-finger pattern (note names, no octave) for the
 *  ghost key's scale. Pure. */
export function fiveFingerPattern(ghostKey: KeyId): string {
  const scaleNotes = scale(
    KEY_META[ghostKey].tonic,
    KEY_META[ghostKey].mode,
    2,
    4,
    keyPrefersFlats(ghostKey),
  );
  const deg = scaleNotes.slice(0, 5).map((n) => n.replace(/-?\d+$/, "")); // 1..5, no octave
  return [...deg, ...deg.slice(0, 4).reverse()].join(" ");
}

/** Substitute any warmup-line placeholders for the current ghost key. Currently
 *  handles `{fiveFinger}`. Plain text out (no chips) — safe for the print sheet. */
export function fillWarmupLine(line: string, ghostKey: KeyId): string {
  if (!line.includes("{fiveFinger}")) return line; // fast path — most lines + all drums
  return line.replace(/\{fiveFinger\}/g, fiveFingerPattern(ghostKey));
}
