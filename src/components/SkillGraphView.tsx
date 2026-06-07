"use client";
// Client-only entry point for the skill graph.
//
// @xyflow/react touches browser-only APIs (window, ResizeObserver) at module
// scope, so it must never be server-rendered. Per the Next 16 lazy-loading guide
// (node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md, "Skipping SSR"):
// `ssr: false` with next/dynamic is ONLY valid inside a Client Component — using
// it in a Server Component throws. This wrapper is that Client Component: the
// 'use client' boundary + dynamic(..., { ssr:false }) is the correct Next 16
// pattern, and the tree page (also a client component) imports THIS, never
// SkillGraph directly.

import dynamic from "next/dynamic";

const SkillGraph = dynamic(
  () => import("@/components/SkillGraph").then((m) => m.SkillGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[clamp(420px,60vh,640px)] items-center justify-center rounded-xl border border-[color:var(--rule)] bg-[color:var(--surface)] text-sm text-[color:var(--ink-3)]">
        drawing the tree…
      </div>
    ),
  },
);

export function SkillGraphView() {
  return <SkillGraph />;
}
