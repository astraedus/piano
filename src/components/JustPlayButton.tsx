"use client";
import { useRouter } from "next/navigation";
import { useAppState } from "@/hooks/useAppState";

export function JustPlayButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { patch } = useAppState();
  return (
    <button
      type="button"
      onClick={() => {
        patch({}); // ensures state exists
        router.push("/?mode=just-play");
      }}
      className={
        "inline-flex items-center gap-2 rounded-full border border-[color:var(--accent-soft)] text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10 transition-colors " +
        (compact ? "text-xs px-3 py-1" : "text-sm px-4 py-1.5")
      }
      aria-label="Just play — skip the structure and drop into the free slot."
    >
      just play
    </button>
  );
}
