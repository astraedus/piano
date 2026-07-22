// LessonResources — the "Go deeper" footer for a lesson panel.
//
// Renders a compact list of high-quality OUTSIDE resources (videos, books, free
// lesson libraries) when a NodeLesson carries `resources`. Shared by both lesson
// surfaces (Your Path + the Skill Graph panel) so they render identically.
// External links open in a new tab and are hardened with rel="noopener
// noreferrer". Styled quietly in the Warm Studio idiom — a muted section that
// never competes with the taught content above it. Renders nothing when there
// are no resources, so every instrument's lessons stay clean until populated.

import type { NodeLesson } from "@/lib/types";

export interface LessonResourcesProps {
  resources: NodeLesson["resources"];
}

export function LessonResources({ resources }: LessonResourcesProps) {
  if (!resources || resources.length === 0) return null;

  return (
    <div data-testid="lesson-resources" className="space-y-1.5 border-t pt-4" style={{ borderColor: "var(--rule)" }}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--ink-3)]">go deeper</p>
      <ul className="space-y-2">
        {resources.map((r) => (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline decoration-[color:var(--rule)] underline-offset-2 transition-colors hover:decoration-[color:var(--instrument-accent)]"
              style={{ color: "var(--instrument-accent-deep)" }}
            >
              {r.name}
              <span aria-hidden className="ml-1 text-[color:var(--ink-3)]">↗</span>
            </a>
            <p className="text-xs text-[color:var(--ink-3)] mt-0.5 leading-relaxed">{r.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
