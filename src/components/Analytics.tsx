"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { resolveAnalyticsConfig } from "@/lib/analytics";

/**
 * Pageview analytics. Mounted once in the root layout.
 *
 * `capture_pageview: 'history_change'` is doing real work here: PostHog's plain
 * `true` mode only fires on a document load, and the app router navigates by
 * pushState, so /tree and /timeline would never register a view. `'history_change'`
 * captures the initial load *and* every pushState/replaceState/popstate, which is
 * exactly the app router's navigation model.
 *
 * Deliberately not driven by `usePathname`/`useSearchParams`: reading search
 * params opts the subtree into client rendering, and an unsuspended
 * `useSearchParams` in the root layout would pull every route out of static
 * generation. Emptying the pre-rendered HTML to add analytics would undo the
 * point of this work.
 */
export function Analytics() {
  useEffect(() => {
    const config = resolveAnalyticsConfig(
      process.env.NEXT_PUBLIC_POSTHOG_KEY,
      window.location.hostname,
    );
    if (!config) return;
    posthog.init(config.key, {
      api_host: config.apiHost,
      ui_host: config.uiHost,
      defaults: "2025-05-24",
      capture_pageview: "history_change",
      capture_pageleave: true,
      // Anonymous visitors stay anonymous. Nobody signs in to practise, so a
      // person profile per visitor would only burn quota and store nothing useful.
      person_profiles: "identified_only",
    });
  }, []);

  return null;
}
