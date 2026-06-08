// Soul-First Learning (V4) — Explain system public surface.
//
// P-C (UI integration) imports from here:
//   import { TermChip, ExplainProvider, useExplain } from "@/components/explain";
// ExplainProvider wraps the app shell; TermChips anywhere open the singleton card.

export { TermChip } from "./TermChip";
export type { TermChipProps } from "./TermChip";
export { Explain } from "./Explain";
export type { ExplainProps } from "./Explain";
export { ExplainProvider, useExplain } from "./useExplain";
export { linkTerms } from "./linkTerms";
export { TermVisual, termHasVisual } from "./TermVisual";
export type { TermVisualProps } from "./TermVisual";
