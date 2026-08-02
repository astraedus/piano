// `/onboarding` is now a link people click rather than a redirect they land in,
// so it has to be safe for both kinds of visitor: the stranger who just read the
// pitch gets the questions, and somebody who already has a profile gets sent back
// to their practice stand instead of being asked to describe themselves again.

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { OnboardingGate } from "./OnboardingGate";

const mocks = vi.hoisted(() => ({
  state: { arc: [], pieces: [], firstOpenedAt: undefined as string | undefined },
  ready: true,
  replace: vi.fn(),
  push: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
}));
vi.mock("@/hooks/useAppState", () => ({
  useAppState: () => ({ state: mocks.state, ready: mocks.ready, patch: mocks.patch }),
}));

beforeEach(() => {
  mocks.state = { arc: [], pieces: [], firstOpenedAt: undefined };
  mocks.ready = true;
  mocks.replace.mockClear();
});
afterEach(cleanup);

describe("a visitor who has not onboarded", () => {
  it("gets the questions and is left alone", () => {
    render(<OnboardingGate />);
    expect(screen.getByRole("heading", { name: /get started/i })).toBeTruthy();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});

describe("a visitor who already has a profile", () => {
  beforeEach(() => {
    mocks.state = { arc: [], pieces: [], firstOpenedAt: "2026-01-01T00:00:00.000Z" };
  });

  it("is sent back to the practice stand instead of re-onboarding", () => {
    render(<OnboardingGate />);
    expect(mocks.replace).toHaveBeenCalledWith("/");
    expect(screen.queryByRole("heading", { name: /get started/i })).toBeNull();
  });

  it("still sees the questions while localStorage is unread, rather than a bounce", () => {
    // Bouncing on an unread profile would send a genuine first-timer straight
    // back to the home page, which is the loop this whole change removes.
    mocks.ready = false;
    render(<OnboardingGate />);
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: /get started/i })).toBeTruthy();
  });
});
