"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/hooks/useAppState";
import { KeyMap } from "@/components/KeyMap";
import { GuitarMap } from "@/components/GuitarMap";
import { SongShelf } from "@/components/SongShelf";
import { YourArc } from "@/components/YourArc";
import { SkillGraphView } from "@/components/SkillGraphView";
import { PathView } from "@/components/PathView";
import { useAppState } from "@/hooks/useAppState";
import { getModuleSync } from "@/lib/instrumentRegistry";
import { skillLearnedCount } from "@/lib/skillSummary";

type Tab = "path" | "map" | "graph" | "shelf" | "arc";

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
  // "path" is the default — it is the autonomous robot-mode spine the user sees first.
  const [tab, setTab] = useState<Tab>("path");
  const { state } = useAppState();
  const totalMin = (state.sessions ?? []).reduce((s, x) => s + x.minutes, 0);
  const timeStr = totalMin <= 0 ? "—" : totalMin < 60 ? `${totalMin} min` : `${Math.floor(totalMin / 60)}h${totalMin % 60 ? ` ${totalMin % 60}m` : ""}`;
  const sessions = (state.sessions ?? []).length;
  const pieces = (state.pieces ?? []).length;
  const nodes = getModuleSync(state.instrument)?.skillNodes ?? [];
  const skills = skillLearnedCount(nodes, state.skillProgress ?? {});
  const mapLabel =
    getModuleSync(state.instrument)?.progressMapKind === "fretboard" ? "Neck Map" : "Key Map";
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">The Tree</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]" style={{ fontVariationSettings: "'opsz' 40, 'SOFT' 50" }}>What You've Built</h1>
        <p className="text-sm text-[color:var(--ink-3)] italic">{timeStr} · {sessions} session{sessions === 1 ? "" : "s"} · {pieces} piece{pieces === 1 ? "" : "s"} on the shelf.</p>
        {skills.total > 0 && (
          <p data-testid="tree-skill-count" className="text-sm text-[color:var(--ink-2)]">
            <span className="living-number">{skills.learned}</span>
            <span className="text-[color:var(--ink-3)]"> of {skills.total} skills learned</span>
          </p>
        )}
      </header>
      <div className="flex gap-2 border-b border-[color:var(--rule)]">
        <TabButton active={tab === "path"}  onClickAction={() => setTab("path")}>Your Path</TabButton>
        <TabButton active={tab === "map"}   onClickAction={() => setTab("map")}>{mapLabel}</TabButton>
        <TabButton active={tab === "graph"} onClickAction={() => setTab("graph")}>Skill Graph</TabButton>
        <TabButton active={tab === "shelf"} onClickAction={() => setTab("shelf")}>Song Shelf</TabButton>
        <TabButton active={tab === "arc"}   onClickAction={() => setTab("arc")}>Your Arc</TabButton>
      </div>
      <div className="pt-2">
        {tab === "path" && <PathView />}
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
