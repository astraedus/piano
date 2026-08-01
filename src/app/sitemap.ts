import type { MetadataRoute } from "next";
import { APP_ROUTES, MARKETING_ROUTES, SITE_URL } from "@/lib/seo";

/**
 * sitemap.xml, generated from the route lists in `lib/seo.ts` rather than a
 * hand-kept copy, so a new marketing page is listed the moment it is added to
 * `MARKETING_ROUTES` and cannot be forgotten here.
 *
 * Priority reflects search intent, not our fondness for the page: the marketing
 * pages are what a stranger can actually land on and read, the app routes are
 * hydrated shells that only make sense once you are using the thing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const marketing = MARKETING_ROUTES.map((path) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : path === "/about" ? 0.8 : 0.9,
  }));

  const app = APP_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...marketing, ...app];
}
