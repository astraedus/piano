"use client";
import { useEffect } from "react";

export function UnlockCardModal({ unlock, onCloseAction }: { unlock: { id: string; title: string; tryLine: string }; onCloseAction: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseAction(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCloseAction]);

  return (
    <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 no-print">
      <div className="max-w-md w-full bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-2xl p-8 fade-in">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)] mb-6">you can now do this</p>
        <h2 className="font-serif text-2xl text-[color:var(--ink)] leading-tight mb-6">{unlock.title}</h2>
        <p className="text-sm text-[color:var(--ink-2)] italic border-l-2 border-[color:var(--accent-soft)] pl-3">{unlock.tryLine}</p>
        <div className="mt-8 flex justify-end">
          <button type="button" onClick={onCloseAction} className="px-4 py-1.5 rounded-full border border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)] hover:text-[color:var(--accent)] text-sm">nice</button>
        </div>
      </div>
    </div>
  );
}
