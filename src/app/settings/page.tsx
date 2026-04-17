"use client";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/hooks/useAppState";
import { useAppState } from "@/hooks/useAppState";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Grade, KeyId, Phase } from "@/lib/types";
import { CIRCLE_MAJORS, CIRCLE_MINORS, KEY_META } from "@/lib/music";
import { exportStateJson, importStateJson, clearState } from "@/lib/storage";

export default function SettingsPage() {
  return (
    <AppStateProvider>
      <AppShell>
        <Settings />
      </AppShell>
    </AppStateProvider>
  );
}

const GRADES: { id: Grade; phase: Phase; label: string }[] = [
  { id: "initial", phase: 1, label: "Initial" },
  { id: "g1", phase: 1, label: "Grade 1" },
  { id: "g2", phase: 2, label: "Grade 2" },
  { id: "g3", phase: 2, label: "Grade 3" },
  { id: "g4", phase: 3, label: "Grade 4" },
  { id: "g5", phase: 3, label: "Grade 5" },
  { id: "g6", phase: 4, label: "Grade 6" },
  { id: "g7", phase: 4, label: "Grade 7" },
  { id: "g8", phase: 5, label: "Grade 8" },
];

function Settings() {
  const { state, patch } = useAppState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [northStar, setNorthStar] = useState(state.northStar ?? "");
  const [name, setName] = useState(state.name ?? "");
  const focusGhost = searchParams?.get("focus") === "ghost";

  useEffect(() => {
    setNorthStar(state.northStar ?? "");
    setName(state.name ?? "");
  }, [state.northStar, state.name]);

  const saveNorthStar = () => patch({ northStar: northStar.trim() || undefined });
  const saveName = () => patch({ name: name.trim() || undefined });

  const moveToGrade = (g: Grade) => {
    const target = GRADES.find((x) => x.id === g);
    if (!target) return;
    patch({
      grade: g,
      phase: target.phase,
      arc: target.phase !== state.phase ? [
        ...(state.arc ?? []),
        { id: `phase-${target.phase}-${Date.now()}`, at: new Date().toISOString(), kind: "phase-begins", label: `phase ${target.phase} begins` },
      ] : state.arc,
    });
    // set data-phase attribute live
    document.documentElement.setAttribute("data-phase", String(target.phase));
  };

  const setGhostNow = (k: KeyId) => {
    const now = new Date();
    const weekId = `${now.getUTCFullYear()}-W${Math.ceil(now.getUTCDate() / 7)}`;
    patch({ ghostOverride: { key: k, weekId } });
  };

  const doExport = () => {
    const json = exportStateJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `piano-state-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      const text = await f.text();
      const ok = importStateJson(text);
      if (ok) window.location.reload();
    };
    input.click();
  };

  const doReset = () => {
    if (!confirm("clear all state? this cannot be undone.")) return;
    clearState();
    window.location.href = "/onboarding";
  };

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">settings</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">the room</h1>
      </header>

      <Section title="the person">
        <Field label="a name (optional)">
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} className={fieldCls} placeholder="what the app calls you" />
        </Field>
        <Field label="north star — why you're here">
          <textarea value={northStar} onChange={(e) => setNorthStar(e.target.value)} onBlur={saveNorthStar} rows={2} className={fieldCls + " font-serif"} placeholder="to play hallelujah without crying." />
          <p className="text-xs text-[color:var(--ink-3)] italic mt-1">shown quietly once a month. edit anytime.</p>
        </Field>
      </Section>

      <Section title="where you are">
        <p className="text-xs text-[color:var(--ink-3)] italic mb-3">pick the grade band you want to work with. no gatekeeping.</p>
        <div className="flex gap-2 flex-wrap">
          {GRADES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => moveToGrade(g.id)}
              className={
                "text-sm px-3 py-1.5 rounded-full border transition-colors " +
                (state.grade === g.id
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--ink)]"
                  : "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]")
              }
            >
              {g.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title={focusGhost ? "tonight's ghost" : "ghost override"}>
        <p className="text-xs text-[color:var(--ink-3)] italic mb-3">the app picks a ghost key each week. override for this week if you want.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
          {[...CIRCLE_MAJORS, ...CIRCLE_MINORS].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setGhostNow(k)}
              className={
                "text-xs px-2 py-1 rounded border transition-colors " +
                (state.ghostOverride?.key === k
                  ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                  : "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]")
              }
            >
              {KEY_META[k].name.replace(" major", "").replace(" minor", "m")}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => router.push("/")} className="mt-4 text-sm text-[color:var(--ink-3)] hover:text-[color:var(--ink-2)]">← back to the stand</button>
      </Section>

      <Section title="quiet nudge">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!state.notifyAfter5Days}
            onChange={(e) => patch({ notifyAfter5Days: e.target.checked })}
            className="accent-[color:var(--accent)]"
          />
          <span className="text-sm text-[color:var(--ink-2)]">
            one note after five days away: <span className="italic text-[color:var(--ink-3)]">"the piano is here when you are."</span>
          </span>
        </label>
        <p className="text-xs text-[color:var(--ink-3)] italic mt-1">off by default. nothing else, ever.</p>
      </Section>

      <Section title="theme">
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                patch({ theme: t });
                if (t === "light") document.documentElement.setAttribute("data-theme", "light");
                else document.documentElement.removeAttribute("data-theme");
              }}
              className={
                "text-sm px-4 py-1.5 rounded-full border transition-colors " +
                ((state.theme ?? "dark") === t
                  ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                  : "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="your data">
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={doExport} className="text-sm px-4 py-1.5 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]">export json</button>
          <button type="button" onClick={doImport} className="text-sm px-4 py-1.5 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]">import json</button>
          <button type="button" onClick={doReset} className="text-sm px-4 py-1.5 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-3)] hover:border-red-400 hover:text-red-300">reset app</button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-[color:var(--ink-3)] mb-1 lowercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}
const fieldCls = "w-full bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-md px-3 py-2 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)]";
