import { describe, expect, it } from "vitest";
import {
  POSTHOG_API_HOST,
  POSTHOG_UI_HOST,
  isLocalHostname,
  resolveAnalyticsConfig,
} from "./analytics";

describe("isLocalHostname", () => {
  it.each(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "studio.local"])(
    "treats %s as a developer machine",
    (h) => expect(isLocalHostname(h)).toBe(true),
  );

  it.each(["music.raeduslabs.com", "piano.vercel.app", "example.com"])(
    "treats %s as a real host",
    (h) => expect(isLocalHostname(h)).toBe(false),
  );
});

describe("resolveAnalyticsConfig", () => {
  it("prefers the env var so the token can be rotated without a code change", () => {
    const c = resolveAnalyticsConfig("phc_from_env", "music.raeduslabs.com");
    expect(c?.key).toBe("phc_from_env");
  });

  it("falls back to the built-in project token when no env var is set", () => {
    const c = resolveAnalyticsConfig(undefined, "music.raeduslabs.com");
    expect(c?.key).toMatch(/^phc_/);
    expect(c?.apiHost).toBe(POSTHOG_API_HOST);
    expect(c?.uiHost).toBe(POSTHOG_UI_HOST);
  });

  it("stays off on localhost so dev traffic never pollutes real numbers", () => {
    expect(resolveAnalyticsConfig("phc_from_env", "localhost")).toBeNull();
  });

  it("stays off when the hostname is unknown, rather than guessing", () => {
    expect(resolveAnalyticsConfig("phc_from_env", undefined)).toBeNull();
  });

  it("stays off when the key is explicitly blanked out", () => {
    expect(resolveAnalyticsConfig("   ", "music.raeduslabs.com")).toBeNull();
  });
});
