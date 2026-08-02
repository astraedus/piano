// What `/` shows to whom.
//
// The regression these lock down is a conversion bug, not a rendering one: this
// route used to redirect anyone without a profile to /onboarding, so every
// visitor from search, Hacker News or a directory listing was asked what grade
// they play before being told what the app was, and the crawlable HTML at the
// site root was a nav and a loading line.

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { act } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { HomeGate } from "./HomeGate";

const mocks = vi.hoisted(() => ({
  state: { firstOpenedAt: undefined as string | undefined },
  ready: true,
  replace: vi.fn(),
  push: vi.fn(),
}));

// HomeGate no longer imports the router at all. The mock stays so that
// re-introducing a redirect out of the home page fails these tests instead of
// quietly shipping.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
}));
vi.mock("@/hooks/useAppState", () => ({
  useAppState: () => ({ state: mocks.state, ready: mocks.ready }),
}));

const LANDING = <p>the crawlable pitch</p>;
const APP = <p>the practice stand</p>;

beforeEach(() => {
  mocks.state = { firstOpenedAt: undefined };
  mocks.ready = true;
  mocks.replace.mockClear();
  mocks.push.mockClear();
  document.documentElement.removeAttribute("data-returning");
});
afterEach(cleanup);

describe("what a crawler gets", () => {
  it("server-renders the pitch, even for a profile that has onboarded", () => {
    // Nothing about the visitor is knowable on the server: localStorage is a
    // client fact. So the HTML of the response is always the pitch, which is the
    // only version of this page a crawler or a reader with JavaScript off sees.
    mocks.state = { firstOpenedAt: "2026-01-01T00:00:00.000Z" };
    const html = renderToStaticMarkup(<HomeGate landing={LANDING} app={APP} />);
    expect(html).toContain("the crawlable pitch");
    expect(html).not.toContain("the practice stand");
  });
});

describe("a first-time visitor", () => {
  it("gets the pitch and is not redirected into the questionnaire", () => {
    render(<HomeGate landing={LANDING} app={APP} />);
    expect(screen.getByText("the crawlable pitch")).toBeTruthy();
    expect(screen.queryByText("the practice stand")).toBeNull();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("leaves the root without the returning-visitor flag, so the pitch stays visible", () => {
    document.documentElement.setAttribute("data-returning", "1"); // stale/wrong guess
    render(<HomeGate landing={LANDING} app={APP} />);
    expect(document.documentElement.hasAttribute("data-returning")).toBe(false);
  });
});

describe("a returning visitor", () => {
  beforeEach(() => {
    mocks.state = { firstOpenedAt: "2026-01-01T00:00:00.000Z" };
  });

  it("still lands in the app, never on the pitch", () => {
    render(<HomeGate landing={LANDING} app={APP} />);
    expect(screen.getByText("the practice stand")).toBeTruthy();
    expect(screen.queryByText("the crawlable pitch")).toBeNull();
  });

  it("flags the root so the pre-paint script can hide the pitch on the next load", () => {
    render(<HomeGate landing={LANDING} app={APP} />);
    expect(document.documentElement.getAttribute("data-returning")).toBe("1");
  });

  it("shows the resume placeholder, not the stand, until localStorage has been read", () => {
    // `ready` false means the profile is still unknown. Classifying an onboarded
    // user as new here is what would put a pitch in front of somebody who opens
    // this app every night.
    mocks.ready = false;
    const { container } = render(<HomeGate landing={LANDING} app={APP} />);
    expect(screen.queryByText("the practice stand")).toBeNull();
    expect(container.querySelector("[data-home-resume]")).toBeTruthy();
    expect(container.querySelector("[data-home-landing]")).toBeTruthy();
  });
});

describe("hydration", () => {
  it("adopts the server HTML without a mismatch, then swaps in the stand", async () => {
    // The reason the swap is gated on `useHydrated` rather than on state alone.
    // Rendering the browser-specific branch on the first client pass is React
    // #418, which QA hit on this exact component: the server said one thing, the
    // client said another, and React threw away the DOM. An onboarded profile is
    // the case that can diverge, so that is the one hydrated here.
    mocks.state = { firstOpenedAt: "2026-01-01T00:00:00.000Z" };
    const container = document.createElement("div");
    container.innerHTML = renderToString(<HomeGate landing={LANDING} app={APP} />);
    document.body.appendChild(container);
    expect(container.textContent).toContain("the crawlable pitch");

    const errors: unknown[][] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args);
    });
    const root = await act(async () =>
      hydrateRoot(container, <HomeGate landing={LANDING} app={APP} />),
    );
    spy.mockRestore();

    expect(errors).toEqual([]);
    expect(container.textContent).toContain("the practice stand");
    await act(async () => root.unmount());
    container.remove();
  });
});

describe("the landing wrapper", () => {
  it("marks the pitch subtree so CSS can hide it before paint", () => {
    // The marker is the whole no-flash mechanism: globals.css hides
    // [data-home-landing] under :root[data-returning="1"], which the boot script
    // sets before anything paints. Renaming one half silently breaks it.
    const { container } = render(<HomeGate landing={LANDING} app={APP} />);
    const wrapper = container.querySelector("[data-home-landing]");
    expect(wrapper?.textContent).toBe("the crawlable pitch");
  });
});
