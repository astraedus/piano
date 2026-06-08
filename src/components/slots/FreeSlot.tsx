"use client";
import { useState } from "react";
import { Slot } from "../Slot";
import { useAppState } from "@/hooks/useAppState";

// onJournalChange / onUrlChange are plain function callbacks. FreeSlot is a
// 'use client' component rendered only by PracticeStand (also 'use client'), so
// these props never cross a server->client boundary. Next 16's serializable-prop
// warning is a false positive here; the *Action naming convention is for props a
// Server Component passes down, which never happens for this component.
export function FreeSlot({
  urlInitial, journalInitial, onJournalChange, onUrlChange, printAlways, expanded,
}: {
  urlInitial?: string;
  journalInitial?: string;
  onJournalChange?: (v: string) => void;
  onUrlChange?: (v: string) => void;
  printAlways?: boolean;
  expanded?: boolean;
}) {
  const { patch } = useAppState();
  const [url, setUrl] = useState(urlInitial ?? "");
  const [journal, setJournal] = useState(journalInitial ?? "");

  return (
    <Slot
      index={5}
      title="Free Play"
      pillar="expression"
      summary={<>Free play. Anything you want.</>}
      defaultOpen={expanded}
      printAlways={printAlways}
    >
      <div className="space-y-3 text-sm">
        <ul className="text-[color:var(--ink-2)] leading-relaxed space-y-1 font-serif text-base">
          <li>→ Play anything.</li>
          <li>→ Jump back into your piece.</li>
          <li>→ Pick up something you heard today.</li>
        </ul>
        <div className="pt-2 space-y-2 no-print">
          <label className="block">
            <span className="block text-xs text-[color:var(--ink-3)] mb-1 tracking-wide">A link you keep coming back to</span>
            <input
              className="w-full bg-[color:var(--bg-surface-2)] border border-[color:var(--rule)] rounded-sm px-3 py-1.5 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)]"
              value={url}
              onChange={(e) => { setUrl(e.target.value); onUrlChange?.(e.target.value); patch({ freeSlotUrl: e.target.value }); }}
              placeholder="MuseScore, YouTube, anything"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-[color:var(--ink-3)] mb-1 tracking-wide">What happened tonight?</span>
            <input
              className="w-full bg-[color:var(--bg-surface-2)] border border-[color:var(--rule)] rounded-sm px-3 py-1.5 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)]"
              value={journal}
              onChange={(e) => { setJournal(e.target.value); onJournalChange?.(e.target.value); }}
              placeholder="Optional. A line in your own words."
            />
          </label>
        </div>
      </div>
    </Slot>
  );
}
