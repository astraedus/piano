"use client";
import { AppShell } from "@/components/AppShell";
import { AppStateProvider } from "@/hooks/useAppState";
import { useAppState } from "@/hooks/useAppState";
import type { SessionLog } from "@/lib/types";
import { KEY_META } from "@/lib/music";

export default function TimelinePage() {
  return (
    <AppStateProvider>
      <AppShell>
        <Timeline />
      </AppShell>
    </AppStateProvider>
  );
}

function Timeline() {
  const { state } = useAppState();
  const sessions = [...(state.sessions ?? [])].sort((a: SessionLog, b: SessionLog) => b.startedAt.localeCompare(a.startedAt));
  const totalMin = sessions.reduce((s, x) => s + x.minutes, 0);
  const timeStr = fmtTime(totalMin);

  // Build a factual list: last 30 days with gaps marked.
  const rows = buildRows(sessions);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">timeline</p>
        <h1 className="font-serif text-3xl text-[color:var(--ink)]">what's been here.</h1>
        <p className="text-sm text-[color:var(--ink-3)] italic mt-1">{timeStr} total · {sessions.length} sessions.</p>
      </header>
      {sessions.length === 0 ? (
        <p className="text-[color:var(--ink-3)] font-serif italic">nothing yet. the first session writes the first line.</p>
      ) : (
        <ul className="divide-y divide-[color:var(--rule)]">
          {rows.map((r, i) => (
            <li key={i} className="py-3 flex items-baseline gap-4">
              <span className="w-28 text-sm text-[color:var(--ink-3)] tabular-nums">{r.dateLabel}</span>
              {r.session ? (
                <div className="flex-1 flex items-baseline gap-3">
                  <span className="text-[color:var(--ink)] tabular-nums text-sm">{r.session.minutes} min</span>
                  <span className="text-[color:var(--ink-3)] text-sm">{KEY_META[r.session.ghostKey]?.name ?? r.session.ghostKey}</span>
                  {r.session.journal && (
                    <span className="text-[color:var(--ink-2)] italic text-sm">— {r.session.journal}</span>
                  )}
                  {r.session.mode !== "full" && r.session.mode !== "short" && r.session.mode !== "long" && (
                    <span className="text-[10px] uppercase tracking-wider text-[color:var(--ink-3)]">{r.session.mode}</span>
                  )}
                </div>
              ) : (
                <span className="flex-1 text-[color:var(--ink-3)] text-sm">—</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface Row { dateLabel: string; session: SessionLog | null; }

function buildRows(sessions: SessionLog[]): Row[] {
  if (sessions.length === 0) return [];
  const byDay = new Map<string, SessionLog>();
  for (const s of sessions) {
    const d = new Date(s.startedAt);
    const key = d.toISOString().slice(0, 10);
    const existing = byDay.get(key);
    // Prefer the longest session on that day for one line summary
    if (!existing || existing.minutes < s.minutes) byDay.set(key, s);
  }
  const first = new Date(sessions[sessions.length - 1].startedAt);
  const today = new Date();
  const rows: Row[] = [];
  const d = new Date(today);
  for (let i = 0; i < 45 && d >= first; i++) {
    const key = d.toISOString().slice(0, 10);
    const label = formatDayLabel(d);
    rows.push({ dateLabel: label, session: byDay.get(key) ?? null });
    d.setDate(d.getDate() - 1);
  }
  return rows;
}

function fmtTime(totalMin: number) {
  if (totalMin <= 0) return "—";
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatDayLabel(d: Date) {
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  const isYest = d.toDateString() === yest.toDateString();
  if (isToday) return "today";
  if (isYest) return "yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toLowerCase();
}
