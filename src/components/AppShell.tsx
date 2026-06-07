"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { JustPlayButton } from "./JustPlayButton";
import { useAppState } from "@/hooks/useAppState";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { XPBar } from "./XPBar";
import { StreakFlame } from "./StreakFlame";
import { emptyStreak } from "@/lib/progression";

export function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  const path = usePathname();
  const { state } = useAppState();
  // Logo reads the active instrument's display name (lower-cased to match the
  // existing lowercase wordmark styling). Falls back to "piano" if unresolved.
  const logo = (getModuleSync(state.instrument)?.displayName ?? "piano").toLowerCase();
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && (
        <header className="no-print sticky top-0 z-20 bg-[color:var(--bg-base)]/85 backdrop-blur border-b border-[color:var(--bg-rule)]">
          <nav className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group" aria-label={`${logo} — home`}>
              <PianoMark />
              <span className="font-serif text-[color:var(--ink)] text-lg tracking-[-0.02em]">{logo}</span>
            </Link>
            <div className="flex items-center gap-5 text-sm text-[color:var(--ink-3)]">
              <NavLink href="/tree" active={path?.startsWith("/tree")}>the tree</NavLink>
              <NavLink href="/timeline" active={path?.startsWith("/timeline")}>timeline</NavLink>
              <NavLink href="/settings" active={path?.startsWith("/settings")}>settings</NavLink>
            </div>
            {/* Persistent gamification indicator — level + progress + streak.
                Compact so it sits quietly in the header; hidden on the narrowest
                widths so the nav never crowds. */}
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <XPBar xp={state.xp ?? 0} compact />
                <StreakFlame streak={state.streak ?? emptyStreak()} compact />
              </div>
              <JustPlayButton />
            </div>
          </nav>
        </header>
      )}
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-6">{children}</main>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={
        "transition-colors " +
        (active
          ? "text-[color:var(--ink)] font-medium"
          : "hover:text-[color:var(--ink-2)]")
      }
    >
      {children}
    </Link>
  );
}

/** A real SVG piano-key silhouette — three white keys with two black keys.
 *  Anti-AI-look: an actual instrument mark, never an emoji. The accent keys
 *  read from --instrument-accent so the mark recolors per instrument. */
function PianoMark() {
  return (
    <svg
      width="22" height="22" viewBox="0 0 22 22" aria-hidden
      className="shrink-0 transition-transform group-hover:-translate-y-0.5"
    >
      <rect x="1.5" y="2" width="19" height="18" rx="3" fill="var(--bg-surface-2)" stroke="var(--bg-rule)" />
      {/* white keys */}
      <line x1="8" y1="3" x2="8" y2="19" stroke="var(--bg-rule)" strokeWidth="1" />
      <line x1="14" y1="3" x2="14" y2="19" stroke="var(--bg-rule)" strokeWidth="1" />
      {/* black keys */}
      <rect x="6" y="3" width="4" height="9" rx="1" fill="var(--instrument-accent-deep)" />
      <rect x="12" y="3" width="4" height="9" rx="1" fill="var(--instrument-accent)" />
    </svg>
  );
}
