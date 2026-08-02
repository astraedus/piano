import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

// Metadata lives in a layout rather than the page because `page.tsx` here is a
// client component, and Next only reads the `metadata` export from server
// components. Same pattern for every app route.
export const metadata: Metadata = buildMetadata({
  path: "/tree",
  title: "The skill tree",
  description:
    "Every skill you have learned, the one thing to learn next, and the way back to anything you forgot. A real prerequisite curriculum for piano, electric guitar and drums.",
});

export default function TreeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
