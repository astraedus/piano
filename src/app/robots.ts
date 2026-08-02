import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt. Everything public is crawlable; the two exclusions are routes with
 * no standalone value to a searcher:
 *  - /api/  is data, not a page.
 *  - /print is a print-stylesheet view of the current session, generated from the
 *    visitor's own localStorage. To a crawler it renders empty, so indexing it
 *    would only add a thin duplicate of /.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/print"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
