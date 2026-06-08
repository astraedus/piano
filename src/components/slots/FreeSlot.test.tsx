import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { FreeSlot } from "./FreeSlot";
import { AppStateProvider } from "@/hooks/useAppState";
import type { SkillNode } from "@/lib/types";

afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
});

const reviewNode: SkillNode = {
  id: "n1",
  instrument: "piano",
  title: "C Major Scale",
  tier: 1,
  category: "scales",
  prereqs: [],
  masteryDrill: "Hands together, two octaves.",
  unlock: "Plays in C.",
};

function renderFree(props: Parameters<typeof FreeSlot>[0]) {
  return render(
    <AppStateProvider>
      <FreeSlot {...props} />
    </AppStateProvider>,
  );
}

describe("FreeSlot — R7 spaced-retrieval review prompts", () => {
  it("renders a 'Bring back' card for each due review skill (expanded)", () => {
    renderFree({ reviewSkills: [reviewNode], expanded: true });
    expect(screen.getByTestId("free-reviews")).toBeTruthy();
    expect(screen.getByText("Bring back: C Major Scale")).toBeTruthy();
    expect(screen.getByTestId("free-review-n1")).toBeTruthy();
  });

  it("removes the card once marked done", () => {
    renderFree({ reviewSkills: [reviewNode], expanded: true });
    fireEvent.click(screen.getByTestId("free-review-done-n1"));
    expect(screen.queryByTestId("free-review-n1")).toBeNull();
  });

  it("shows nothing when there are no due reviews (no regression)", () => {
    renderFree({ reviewSkills: [], expanded: true });
    expect(screen.queryByTestId("free-reviews")).toBeNull();
  });

  it("shows nothing when reviewSkills is absent", () => {
    renderFree({ expanded: true });
    expect(screen.queryByTestId("free-reviews")).toBeNull();
  });
});
