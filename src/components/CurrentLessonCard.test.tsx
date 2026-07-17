// CurrentLessonCard tests — the stand→tree bridge card.
//  - renders with a resolved node (drill match + frontier fallback), links to
//    the right /tree?node= URL, and shows the learned-count.
//  - renders nothing when there is no node to point at.

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CurrentLessonCard } from "./CurrentLessonCard";
import type { ChainDrill, SkillNode, SkillProgress } from "@/lib/types";

// next/link → plain anchor so we can read the href (no router context needed).
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: unknown; children: React.ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>{children}</a>
  ),
}));

afterEach(cleanup);

// ── Fixtures ────────────────────────────────────────────────────────────────

const node = (id: string, tier: SkillNode["tier"], extra: Partial<SkillNode> = {}): SkillNode => ({
  id,
  instrument: "piano",
  title: id,
  tier,
  category: "scales",
  prereqs: [],
  masteryDrill: "drill",
  unlock: "The capability sentence.",
  ...extra,
});

const drill = (id: string): ChainDrill => ({
  id,
  instrument: "piano",
  phase: 1,
  name: id,
  minutes: 5,
  ghostKey: "C",
  pillar: "technique",
  steps: [],
  closingNote: "done",
});

const learned = (): SkillProgress => ({ status: "learned", reps: 5, learnedAt: "2026-01-01" });

// ── Tests ─────────────────────────────────────────────────────────────────

describe("CurrentLessonCard — resolved node", () => {
  it("renders the drilled node with title, count, and a /tree?node= deep-link", () => {
    const nodes = [
      node("p-key-C", 1, { chainDrillId: "p1-c-major-chain", soulTitle: "The Home Shape" }),
      node("p-key-G", 1), // learned → drives the fraction denominator/numerator
    ];
    const progress = { "p-key-G": learned() };
    render(
      <CurrentLessonCard
        nodes={nodes}
        progress={progress}
        chainDrill={drill("p1-c-major-chain")}
        instrument="piano"
      />,
    );

    expect(screen.getByTestId("current-lesson-card")).toBeTruthy();
    expect(screen.getByTestId("current-lesson-title").textContent).toBe("The Home Shape");

    // 1 of 2 learned (p-key-G learned, p-key-C available).
    expect(screen.getByTestId("current-lesson-count").textContent).toContain("1 of 2 learned");

    const cta = screen.getByTestId("current-lesson-cta");
    expect(cta.getAttribute("href")).toBe("/tree?node=p-key-C");
    expect(cta.textContent).toContain("Open lesson");
  });

  it("falls back to the frontier node when there is no chain drill", () => {
    const nodes = [
      node("a", 1, { soulTitle: "First Thing" }),
      node("b", 2, { prereqs: ["a"] }),
    ];
    render(
      <CurrentLessonCard nodes={nodes} progress={{}} chainDrill={null} instrument="piano" />,
    );

    // Frontier is the lowest-tier available node (a).
    expect(screen.getByTestId("current-lesson-title").textContent).toBe("First Thing");
    expect(screen.getByTestId("current-lesson-cta").getAttribute("href")).toBe("/tree?node=a");
  });

  it("shows a one-line context from the node's capability sentence when no lesson exists", () => {
    // A synthetic id maps to no authored lesson → context comes from node.unlock.
    const nodes = [node("synthetic-x", 1, { unlock: "Rock rhythm unlocked." })];
    render(
      <CurrentLessonCard nodes={nodes} progress={{}} chainDrill={null} instrument="piano" />,
    );
    expect(screen.getByTestId("current-lesson-context").textContent).toContain("Rock rhythm unlocked.");
  });
});

describe("CurrentLessonCard — nothing to point at", () => {
  it("renders nothing when every node is learned and there is no drill", () => {
    const nodes = [node("a", 1)];
    const progress = { a: learned() };
    render(
      <CurrentLessonCard nodes={nodes} progress={progress} chainDrill={null} instrument="piano" />,
    );
    expect(screen.queryByTestId("current-lesson-card")).toBeNull();
  });

  it("renders nothing when there are no nodes (no module)", () => {
    render(<CurrentLessonCard nodes={[]} progress={{}} chainDrill={null} instrument="piano" />);
    expect(screen.queryByTestId("current-lesson-card")).toBeNull();
  });
});
