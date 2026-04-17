"use client";
import { useState } from "react";
import { Slot } from "../Slot";
import { useAppState } from "@/hooks/useAppState";

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
      title="Free slot"
      summary={<>play anything. you're home.</>}
      defaultOpen={expanded}
      printAlways={printAlways}
    >
      <div className="space-y-3 text-sm">
        <ul className="text-[color:var(--ink-2)] leading-relaxed space-y-1 font-serif text-base">
          <li>→ play anything.</li>
          <li>→ pop back into your piece.</li>
          <li>→ pick up something you heard today.</li>
        </ul>
        <div className="pt-2 space-y-2 no-print">
          <label className="block">
            <span className="block text-xs text-[color:var(--ink-3)] mb-1 lowercase tracking-wide">a url you keep coming back to</span>
            <input
              className="w-full bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-md px-3 py-1.5 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)]"
              value={url}
              onChange={(e) => { setUrl(e.target.value); onUrlChange?.(e.target.value); patch({ freeSlotUrl: e.target.value }); }}
              placeholder="musescore / youtube / anything"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-[color:var(--ink-3)] mb-1 lowercase tracking-wide">what happened tonight?</span>
            <input
              className="w-full bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-md px-3 py-1.5 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)]"
              value={journal}
              onChange={(e) => { setJournal(e.target.value); onJournalChange?.(e.target.value); }}
              placeholder="optional. your voice."
            />
          </label>
        </div>
      </div>
    </Slot>
  );
}
