"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/hooks/useAppState";
import { KeyMap } from "@/components/KeyMap";
import { GuitarMap } from "@/components/GuitarMap";
import { SongShelf } from "@/components/SongShelf";
import { YourArc } from "@/components/YourArc";
import { SkillGraphView } from "@/components/SkillGraphView";
import { useAppState } from "@/hooks/useAppState";
import { getModuleSync } from "@/lib/instrumentRegistry";

type Tab = "map" | "graph" | "shelf" | "arc";

// Instrument-aware progress map: render the keymap for "keymap" instruments
// (piano) and the fretboard territory map for "fretboard" instruments (guitar).
// Falls back to the keymap if the module isn't registered yet (SSR / first paint).
function ProgressMap() {
  const { state } = useAppState();
  const kind = getModuleSync(state.instrument)?.progressMapKind ?? "keymap";
  return kind === "fretboard" ? <GuitarMap /> : <KeyMap />;
}

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
  const totalMin = (state.sessions ?? []).reduce((s, x) => s + x.minutes, 0);
  const timeStr = totalMin <= 0 ? "—" : totalMin < 60 ? `${totalMin} min` : `${Math.floor(totalMin / 60)}h${totalMin % 60 ? ` ${totalMin % 60}m` : ""}`;
  const sessions = (state.sessions ?? []).length;
  const pieces = (state.pieces ?? []).length;
  const mapLabel =
    getModuleSync(state.instrument)?.progressMapKind === "fretboard" ? "the neck map" : "the key map";
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">the tree</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]" style={{ fontVariationSettings: "'opsz' 40, 'SOFT' 50" }}>what you've built.</h1>
        <p className="text-sm text-[color:var(--ink-3)] italic">{timeStr} · {sessions} session{sessions === 1 ? "" : "s"} · {pieces} piece{pieces === 1 ? "" : "s"} on the shelf.</p>
      </header>
      <div className="flex gap-2 border-b border-[color:var(--rule)]">
        <TabButton active={tab === "map"}   onClickAction={() => setTab("map")}>{mapLabel}</TabButton>
        <TabButton active={tab === "graph"} onClickAction={() => setTab("graph")}>skill graph</TabButton>
        <TabButton active={tab === "shelf"} onClickAction={() => setTab("shelf")}>the song shelf</TabButton>
        <TabButton active={tab === "arc"}   onClickAction={() => setTab("arc")}>your arc</TabButton>
      </div>
      <div className="pt-2">
        {tab === "map" && <ProgressMap />}
        {tab === "graph" && <SkillGraphView />}
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
