import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  path: "/settings",
  title: "Settings",
  description:
    "Switch instrument, choose your theme, manage optional cloud sync, and export or clear your practice data. Your progress stays on your machine unless you sign in.",
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
