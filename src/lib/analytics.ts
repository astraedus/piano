// Analytics configuration, kept as pure functions so the "should this fire at
// all" decision is unit-testable rather than buried in a useEffect.
//
// We collect pageviews only. No practice data, no session logs, no localStorage
// contents: the app's whole promise is that your practice lives on your machine,
// and shipping that data to a third party would quietly break it.

/** PostHog US ingestion host. Events go here; the dashboard lives on `UI_HOST`. */
export const POSTHOG_API_HOST = "https://us.i.posthog.com";
export const POSTHOG_UI_HOST = "https://us.posthog.com";

/**
 * Fallback project token. A PostHog *client* token is public by design: it ships
 * in every browser bundle and can only write events into one project, so this is
 * not a secret and putting it in the repo leaks nothing.
 *
 * It still reads from `NEXT_PUBLIC_POSTHOG_KEY` first, for two reasons: a fork
 * can point at their own project without editing source, and if the token is ever
 * rotated the deploy is an env-var change rather than a code change and release.
 */
const FALLBACK_POSTHOG_KEY = "phc_Bi8Bn3pWHSTVUpikbu86twuHRhRwuh9aAnimQ5eyjV8o";

export type AnalyticsConfig = { key: string; apiHost: string; uiHost: string };

/**
 * Resolve the analytics config, or `null` when analytics must not run.
 *
 * `hostname` gates local and preview traffic out of the production project: dev
 * pageviews would otherwise show up alongside real ones and quietly inflate every
 * number we later make decisions on.
 */
export function resolveAnalyticsConfig(
  envKey: string | undefined,
  hostname: string | undefined,
): AnalyticsConfig | null {
  const key = (envKey ?? FALLBACK_POSTHOG_KEY).trim();
  if (!key) return null;
  if (!hostname || isLocalHostname(hostname)) return null;
  return { key, apiHost: POSTHOG_API_HOST, uiHost: POSTHOG_UI_HOST };
}

/** True for hostnames that are a developer's machine rather than the live site. */
export function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")
  );
}
