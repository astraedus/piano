import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/timeline",
  title: "Practice timeline",
  description:
    "An honest record of every practice session: what you worked on, how long you played, and what you learned along the way.",
});

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
