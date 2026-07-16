import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GoalRail, ReviewDueBanner, SessionClosureOverlay, type ClosureData } from "./SessionGuidance";
import type { SkillNode } from "@/lib/types";

// next/link needs no router context here; render it as a plain anchor.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: unknown; children: React.ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>{children}</a>
  ),
}));

afterEach(cleanup);

const node = (id: string, title: string): SkillNode => ({
  id, instrument: "piano", title, tier: 1, category: "scales",
  prereqs: [], masteryDrill: "drill", unlock: "u",
});

describe("GoalRail, session progress cue", () => {
  it("renders a mobile NOW line with the slot label + Block N of M + minutes", () => {
    render(<GoalRail nowSlot="piece" blockIndex={2} blockTotal={5} elapsedMin={7} />);
    const mobile = screen.getByTestId("mobile-now-line");
    expect(mobile.textContent).toContain("Work your piece");
    expect(mobile.textContent).toContain("Block 2 of 5");
    expect(mobile.textContent).toContain("7 min in");
  });
  it("Block N of M reflects the passed index/total and hides minutes at 0", () => {
    render(<GoalRail nowSlot="warmup" blockIndex={1} blockTotal={4} elapsedMin={0} />);
    const block = screen.getByTestId("mobile-block").textContent ?? "";
    expect(block).toContain("Block 1 of 4");
    expect(block).not.toContain("min in");
  });
});

describe("ReviewDueBanner, top-of-stand due surface", () => {
  it("shows the count and the most-overdue title when reviews are due", () => {
    render(<ReviewDueBanner reviewSkills={[node("n1", "D Major Scale"), node("n2", "A Minor")]} />);
    const b = screen.getByTestId("review-due-banner");
    expect(b.textContent).toContain("2 skills");
    expect(b.textContent).toContain("D Major Scale first");
  });
  it("renders nothing when nothing is due (no nag)", () => {
    render(<ReviewDueBanner reviewSkills={[]} />);
    expect(screen.queryByTestId("review-due-banner")).toBeNull();
  });
});

describe("SessionClosureOverlay, end-of-session recap", () => {
  const data: ClosureData = {
    headline: "Nice session. +40 XP.",
    blocksCompleted: 3, blocksTotal: 5,
    minutes: 12, reps: 8, bestBpm: 90,
    earRight: 2, earTotal: 3, xpEarned: 40,
    nextTitle: "The Rock Chug",
  };

  it("shows tonight's stats + a forward pointer when unblocked", () => {
    render(<SessionClosureOverlay data={data} blocked={false} onClose={() => {}} />);
    expect(screen.getByTestId("session-closure")).toBeTruthy();
    const stats = screen.getByTestId("closure-stats").textContent ?? "";
    expect(stats).toContain("3 of 5 blocks");
    expect(stats).toContain("12 min");
    expect(stats).toContain("8 reps");
    expect(stats).toContain("90 BPM best");
    expect(stats).toContain("2/3 by ear");
    expect(stats).toContain("+40 XP");
    expect(screen.getByTestId("closure-next").textContent).toContain("The Rock Chug");
  });

  it("stays hidden while reward moments are still showing (blocked)", () => {
    render(<SessionClosureOverlay data={data} blocked={true} onClose={() => {}} />);
    expect(screen.queryByTestId("session-closure")).toBeNull();
  });

  it("renders no forward pointer when there is no next node", () => {
    render(<SessionClosureOverlay data={{ ...data, nextTitle: undefined }} blocked={false} onClose={() => {}} />);
    expect(screen.getByTestId("session-closure")).toBeTruthy();
    expect(screen.queryByTestId("closure-next")).toBeNull();
  });
});
