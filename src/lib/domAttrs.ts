// Centralized writer for the root <html> data-* attributes that drive the
// theme/phase/instrument CSS token swaps in globals.css.
//
// These writes were previously duplicated across the layout boot script,
// useAppState (hydrate / setState / patch) and settings/page.tsx. This module
// is the single source of truth for the React-side writes. The pre-paint boot
// script in layout.tsx mirrors the same logic inline (it must be self-contained
// JS that runs before any module loads), so keep the two in sync.

import type { Instrument, Phase } from "./types";

export interface RootAttrs {
  phase?: Phase;
  instrument?: Instrument;
  theme?: "dark" | "light";
}

/**
 * Write data-phase / data-instrument / data-theme onto the document root.
 * Each field is optional — only provided fields are written. Passing `theme`
 * sets data-theme explicitly ("light" or "dark"), which pins the theme even
 * when it disagrees with the OS preference (light is the default when unset).
 */
export function setRootAttrs(attrs: RootAttrs): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  try {
    if (attrs.phase != null) root.setAttribute("data-phase", String(attrs.phase));
    if (attrs.instrument != null) root.setAttribute("data-instrument", attrs.instrument);
    if (attrs.theme != null) root.setAttribute("data-theme", attrs.theme);
  } catch {
    // SSR / detached document — ignore.
  }
}

/**
 * Read the active instrument off the document root (the canonical global signal
 * that setRootAttrs / the boot script keep in sync). For CLIENT-ONLY surfaces
 * that lack app-state context — e.g. the singleton Explain card mounted above
 * the state provider — so a shared term's SEE visual matches the instrument the
 * learner is on. Returns undefined during SSR / when unset.
 */
export function readInstrument(): Instrument | undefined {
  if (typeof document === "undefined") return undefined;
  const v = document.documentElement.getAttribute("data-instrument");
  return v === "piano" || v === "guitar" ? v : undefined;
}
