import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

// The print sheet is generated from the visitor's own localStorage, so to a
// crawler it renders empty. Indexing it would add a thin duplicate of the home
// page and nothing else, hence the explicit noindex to match robots.ts.
export const metadata: Metadata = {
  ...buildMetadata({
    path: "/print",
    title: "Tonight's practice sheet",
    description: "A printable version of tonight's practice plan.",
  }),
  robots: { index: false, follow: false },
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return children;
}
