"use client";
import { useAppState } from "@/hooks/useAppState";
import type { ArcEvent } from "@/lib/types";

export function YourArc() {
  const { state } = useAppState();
  const events = [...(state.arc ?? [])].sort((a, b) => b.at.localeCompare(a.at));
  const unlocks = [...(state.unlocks ?? [])].sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));

  // Merge arc + unlocks into one timeline
  const combined: Array<{ at: string; label: string; kind: string; detail?: string }> = [
    ...events.map((e: ArcEvent) => ({ at: e.at, label: e.label, kind: e.kind, detail: typeof e.detail?.detail === "string" ? e.detail.detail : undefined })),
    ...unlocks.map((u) => ({ at: u.addedAt ?? "", label: u.title, kind: "unlock", detail: u.tryLine })),
  ].filter((x) => x.at).sort((a, b) => b.at.localeCompare(a.at));

  if (combined.length === 0) {
    return (
      <div className="text-[color:var(--ink-3)] font-serif italic">
        your arc starts with the first session. come back after playing.
      </div>
    );
  }

  // Stagger newest→oldest from the top so the arc writes itself in.
  const last = combined.length - 1;
  return (
    <ol className="space-y-5">
      {combined.map((ev, i) => {
        const highlight = ev.kind === "phase-begins" || ev.kind === "unlock";
        return (
          <li
            key={i}
            className="flex gap-4 arc-entry"
            style={{ animationDelay: `${Math.min(i, 18) * 30}ms` }}
          >
            <div className="w-24 shrink-0 text-right">
              <div className="text-[color:var(--ink-3)] text-xs tabular-nums">{fmtDate(ev.at)}</div>
            </div>
            <div className="w-px bg-[color:var(--bg-rule)] relative">
              <span className={`absolute -left-1.5 top-1.5 block w-3 h-3 rounded-full border border-[color:var(--bg-rule)] ${dotClass(ev.kind)}`} />
            </div>
            <div className={"flex-1 " + (highlight ? "warm-card px-4 py-3 -mt-1" : "")}>
              <div className="font-serif text-[color:var(--ink)] tracking-[-0.01em]">{labelPrefix(ev.kind)}<span>{ev.label}</span></div>
              {ev.detail && <p className="text-sm text-[color:var(--ink-3)] italic mt-0.5">{ev.detail}</p>}
            </div>
          </li>
        );
      })}
      {last >= 0 && <li className="text-xs text-[color:var(--ink-muted)] italic pl-28">the arc only grows from here.</li>}
    </ol>
  );
}

function labelPrefix(kind: string) {
  switch (kind) {
    case "instrument-begins":
    case "piano-begins": return <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)] mr-3">begins</span>;
    case "phase-begins": return <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--accent-deep)] font-medium mr-3">phase</span>;
    case "unlock":       return <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--accent-deep)] font-medium mr-3">unlock</span>;
    case "piece-yours":  return <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)] mr-3">yours</span>;
    case "first-improv": return <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)] mr-3">first</span>;
    case "piece-started":return <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-3)] mr-3">piece</span>;
    default:             return null;
  }
}

function dotClass(kind: string) {
  if (kind === "phase-begins" || kind === "unlock") return "bg-[color:var(--accent)]";
  return "bg-[color:var(--surface-2)]";
}

function fmtDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
