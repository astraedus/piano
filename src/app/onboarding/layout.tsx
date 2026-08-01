import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/onboarding",
  title: "Get started",
  description:
    "A few questions to place you in the curriculum: which instrument you are here for, and roughly where you are starting from. No account needed.",
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
