"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/hooks/useAppState";
import { KeyMap } from "@/components/KeyMap";
import { SongShelf } from "@/components/SongShelf";
import { YourArc } from "@/components/YourArc";
import { useAppState } from "@/hooks/useAppState";

type Tab = "map" | "shelf" | "arc";

export default function TreePage() {
  return (
    <AppStateProvider>
      <AppShell>
        <TreeShell />
      </AppShell>
    </AppStateProvider>
  );
}

function TreeShell() {
  const [tab, setTab] = useState<Tab>("map");
  const { state } = useAppState();
  const hours = Math.round((state.sessions ?? []).reduce((s, x) => s + x.minutes, 0) / 60 * 10) / 10;
  const sessions = (state.sessions ?? []).length;
  const pieces = (state.pieces ?? []).length;
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">the tree</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]" style={{ fontVariationSettings: "'opsz' 40, 'SOFT' 50" }}>what you've built.</h1>
        <p className="text-sm text-[color:var(--ink-3)] italic">{hours}h · {sessions} sessions · {pieces} pieces on the shelf.</p>
      </header>
      <div className="flex gap-2 border-b border-[color:var(--rule)]">
        <TabButton active={tab === "map"}  onClickAction={() => setTab("map")}>the key map</TabButton>
        <TabButton active={tab === "shelf"} onClickAction={() => setTab("shelf")}>the song shelf</TabButton>
        <TabButton active={tab === "arc"}  onClickAction={() => setTab("arc")}>your arc</TabButton>
      </div>
      <div className="pt-2">
        {tab === "map" && <KeyMap />}
        {tab === "shelf" && <SongShelf />}
        {tab === "arc" && <YourArc />}
      </div>
    </div>
  );
}

function TabButton({ active, onClickAction, children }: { active: boolean; onClickAction: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClickAction}
      className={
        "px-4 py-2 text-sm transition-colors border-b-2 -mb-px " +
        (active
          ? "border-[color:var(--accent)] text-[color:var(--ink)]"
          : "border-transparent text-[color:var(--ink-3)] hover:text-[color:var(--ink-2)]")
      }
    >
      {children}
    </button>
  );
}
