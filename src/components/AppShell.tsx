"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { JustPlayButton } from "./JustPlayButton";
import { useAppState } from "@/hooks/useAppState";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { setRootAttrs } from "@/lib/domAttrs";
import type { Instrument } from "@/lib/types";
import { XPBar } from "./XPBar";
import { StreakFlame } from "./StreakFlame";
import { emptyStreak } from "@/lib/progression";

export function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  const path = usePathname();
  const { state } = useAppState();
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && (
        <header className="no-print sticky top-0 z-20 bg-[color:var(--bg-base)]/85 backdrop-blur border-b border-[color:var(--bg-rule)]">
          <nav className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="Home">
              <PianoMark />
            </Link>
            {/* The instrument wordmark is now a real switcher — the owner could
                not find another way to switch, so it lives right in the header. */}
            <InstrumentSwitcher current={state.instrument} />
            <div className="flex items-center gap-5 text-sm text-[color:var(--ink-3)]">
              <NavLink href="/tree" active={path?.startsWith("/tree")}>The Tree</NavLink>
              <NavLink href="/timeline" active={path?.startsWith("/timeline")}>Timeline</NavLink>
              <NavLink href="/settings" active={path?.startsWith("/settings")}>Settings</NavLink>
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

const INSTRUMENTS: { id: Instrument; label: string }[] = [
  { id: "piano", label: "Piano" },
  { id: "guitar", label: "Electric Guitar" },
];

/**
 * Header instrument switcher. The active instrument's name is the trigger; the
 * dropdown swaps `state.instrument` and immediately re-applies the data-instrument
 * accent (amber piano <-> crimson guitar) so the whole UI flips without a reload.
 * No data is lost — every instrument keeps its own progress in the same profile.
 */
function InstrumentSwitcher({ current }: { current: Instrument }) {
  const { state, patch } = useAppState();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const label = getModuleSync(current)?.displayName ?? "Piano";

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const switchTo = (id: Instrument) => {
    if (id !== current) {
      patch({ instrument: id });
      // Re-apply the accent immediately (phase/theme unchanged).
      setRootAttrs({ instrument: id, phase: state.phase, theme: state.theme });
    }
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 font-serif text-[color:var(--ink)] text-lg tracking-[-0.02em] hover:text-[color:var(--instrument-accent-deep)] transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Instrument: ${label}. Tap to switch.`}
      >
        <span>{label}</span>
        <Caret open={open} />
      </button>
      {open && (
        <div className="absolute left-0 mt-2 z-30 warm-card p-1.5 w-[min(220px,80vw)]" role="listbox">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--ink-3)] px-2.5 pt-1.5 pb-1">Switch Instrument</p>
          {INSTRUMENTS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={o.id === current}
              onClick={() => switchTo(o.id)}
              className={
                "w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between " +
                (o.id === current
                  ? "text-[color:var(--ink)] bg-[color:var(--accent)]/10"
                  : "text-[color:var(--ink-2)] hover:bg-[color:var(--bg-surface-2)]")
              }
            >
              {o.label}
              {o.id === current && <span className="text-[color:var(--accent-deep)] text-xs" aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Small chevron that rotates when the switcher is open. */
function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" aria-hidden
      className={"shrink-0 text-[color:var(--ink-3)] transition-transform " + (open ? "rotate-180" : "")}
    >
      <path d="M2 3.5 L5 6.5 L8 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
