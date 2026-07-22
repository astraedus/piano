import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LessonResources } from "./LessonResources";

afterEach(cleanup);

const RESOURCES = [
  { name: "Vic Firth: 40 Essential Rudiments", url: "https://ae.vicfirth.com/education/40-essential-rudiments/", note: "free video demos of every rudiment" },
  { name: "PAS International Drum Rudiments", url: "https://pas.org/rudiments/", note: "the official list of all 40 rudiments" },
];

describe("LessonResources", () => {
  it("renders nothing when there are no resources", () => {
    const { container: none } = render(<LessonResources resources={undefined} />);
    expect(none.querySelector('[data-testid="lesson-resources"]')).toBeNull();
    cleanup();
    const { container: empty } = render(<LessonResources resources={[]} />);
    expect(empty.querySelector('[data-testid="lesson-resources"]')).toBeNull();
  });

  it("renders a 'Go deeper' section with each resource as a link + note", () => {
    render(<LessonResources resources={RESOURCES} />);
    expect(screen.getByTestId("lesson-resources").textContent).toContain("go deeper");
    for (const r of RESOURCES) {
      const link = screen.getByRole("link", { name: new RegExp(r.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
      expect(link.getAttribute("href")).toBe(r.url);
      expect(screen.getByText(r.note)).toBeTruthy();
    }
  });

  it("opens external links safely (new tab, noopener noreferrer)", () => {
    render(<LessonResources resources={RESOURCES} />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });
});
