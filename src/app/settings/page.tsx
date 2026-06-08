"use client";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/hooks/useAppState";
import { useAppState } from "@/hooks/useAppState";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Grade, KeyId, Phase } from "@/lib/types";
import { CIRCLE_MAJORS, CIRCLE_MINORS, KEY_META } from "@/lib/music";
import { exportStateJson, importStateJson, clearState } from "@/lib/storage";
import { weekIdOf } from "@/lib/ghostKey";
import { setRootAttrs } from "@/lib/domAttrs";
import type { Instrument } from "@/lib/types";
import { learningPathPatch, PATH_OPTIONS } from "@/components/Onboarding";

const INSTRUMENTS: { id: Instrument; label: string }[] = [
  { id: "piano", label: "Piano" },
  { id: "guitar", label: "Electric Guitar" },
];

export default function SettingsPage() {
  return (
    <AppStateProvider>
      <AppShell>
        <Suspense fallback={null}>
          <Settings />
        </Suspense>
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
  const [northStar, setNorthStar] = useState(state.northStar ?? "");
  const [name, setName] = useState(state.name ?? "");

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
    setRootAttrs({ phase: target.phase });
  };

  const switchInstrument = (id: Instrument) => {
    if (id === state.instrument) return;
    // Switching takes effect immediately: the module re-resolves via
    // getModuleSync(state.instrument) on the next render, and the data-instrument
    // accent flips amber <-> crimson. No data is lost — each instrument keeps its
    // own progress in the same profile.
    patch({ instrument: id });
    setRootAttrs({ instrument: id, phase: state.phase, theme: state.theme });
  };

  const setGhostNow = (k: KeyId) => {
    // Must use the same ISO-week id that ghostKeyFor compares against (B5).
    // The old `Math.ceil(date/7)` week-of-month calc never matched weekIdOf,
    // so the override was silently ignored.
    const weekId = weekIdOf(new Date());
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
    if (!confirm("Clear all data? This cannot be undone.")) return;
    clearState();
    window.location.href = "/onboarding";
  };

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">Settings</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">The Room</h1>
      </header>

      <Section title="Instrument">
        <p className="text-xs text-[color:var(--ink-3)] mb-3">Switch between piano and electric guitar. Your progress for each is kept separately.</p>
        <div className="inline-flex rounded-full border border-[color:var(--rule)] p-1 bg-[color:var(--surface)]">
          {INSTRUMENTS.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={state.instrument === o.id}
              onClick={() => switchInstrument(o.id)}
              className={
                "text-sm px-4 py-1.5 rounded-full transition-colors " +
                (state.instrument === o.id
                  ? "bg-[color:var(--accent)]/15 text-[color:var(--ink)] font-medium"
                  : "text-[color:var(--ink-2)] hover:text-[color:var(--ink)]")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Your Learning Path">
        <p className="text-xs text-[color:var(--ink-3)] mb-3">What you want to do shapes which skills the tree leads with. Change it anytime.</p>
        <div className="flex gap-2 flex-wrap" data-testid="settings-path-pills">
          {PATH_OPTIONS.map((o) => (
            <button
              key={o.tag}
              type="button"
              data-path-choice={o.tag}
              aria-pressed={state.learningPath === o.tag}
              onClick={() => patch(learningPathPatch(o.tag, state.theoryEnabled))}
              className={
                "text-sm px-4 py-1.5 rounded-full border transition-colors " +
                (state.learningPath === o.tag
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--ink)]"
                  : "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
        <label className="flex items-start gap-3 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={!!state.theoryEnabled}
            onChange={(e) => patch({ theoryEnabled: e.target.checked })}
            className="accent-[color:var(--accent)] mt-0.5"
            data-testid="settings-theory-toggle"
          />
          <span className="text-sm text-[color:var(--ink-2)]">
            Show the theory, the why behind what you're playing.
            <span className="block text-xs text-[color:var(--ink-3)] italic mt-0.5">
              Off by default. Go Deep turns it on; turn it off here anytime.
            </span>
          </span>
        </label>
      </Section>

      <Section title="Profile">
        <Field label="Name (optional)">
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} className={fieldCls} placeholder="What the app calls you" />
        </Field>
        <Field label="North star: why you're here">
          <textarea value={northStar} onChange={(e) => setNorthStar(e.target.value)} onBlur={saveNorthStar} rows={2} className={fieldCls + " font-serif"} placeholder="To play Hallelujah without crying." />
          <p className="text-xs text-[color:var(--ink-3)] italic mt-1">Shown quietly once a month. Edit anytime.</p>
        </Field>
      </Section>

      <Section title="Your Progress">
        <p className="text-xs text-[color:var(--ink-3)] mb-3">Pick the grade band you want to work with. No gatekeeping.</p>
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

      <Section title="Key of the Week">
        <p className="text-xs text-[color:var(--ink-3)] mb-3">The app picks a key each week. Override it for this week if you want.</p>
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
        <button type="button" onClick={() => router.push("/")} className="mt-4 text-sm text-[color:var(--ink-3)] hover:text-[color:var(--ink-2)]">← Back to the Stand</button>
      </Section>

      <Section title="Reminders">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!state.notifyAfter5Days}
            onChange={(e) => patch({ notifyAfter5Days: e.target.checked })}
            className="accent-[color:var(--accent)]"
          />
          <span className="text-sm text-[color:var(--ink-2)]">
            One note after five days away: <span className="italic text-[color:var(--ink-3)]">"The piano is here when you are."</span>
          </span>
        </label>
        <p className="text-xs text-[color:var(--ink-3)] italic mt-1">Off by default. Nothing else, ever.</p>
      </Section>

      <Section title="Theme">
        <div className="flex gap-2">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                patch({ theme: t });
                setRootAttrs({ theme: t });
              }}
              className={
                "text-sm px-4 py-1.5 rounded-full border transition-colors " +
                ((state.theme ?? "light") === t
                  ? "border-[color:var(--accent)] text-[color:var(--accent)] bg-[color:var(--accent)]/10"
                  : "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]")
              }
            >
              {t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
        <p className="text-xs text-[color:var(--ink-3)] italic mt-1">The studio is warm and light by default. Dark is here for late nights.</p>
      </Section>

      <Section title="Your Data">
        <div className="flex gap-3 flex-wrap">
          <button type="button" onClick={doExport} className="text-sm px-4 py-1.5 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]">Export JSON</button>
          <button type="button" onClick={doImport} className="text-sm px-4 py-1.5 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]">Import JSON</button>
          <button type="button" onClick={doReset} className="text-sm px-4 py-1.5 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-3)] hover:border-red-400 hover:text-red-300">Reset App</button>
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
      <span className="block text-xs text-[color:var(--ink-3)] mb-1 tracking-wide">{label}</span>
      {children}
    </label>
  );
}
const fieldCls = "w-full bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-md px-3 py-2 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)]";
