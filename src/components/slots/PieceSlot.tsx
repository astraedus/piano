"use client";
import { useState } from "react";
import { Slot } from "../Slot";
import type { Piece } from "@/lib/types";
import { useAppState } from "@/hooks/useAppState";

export function PieceSlot({ piece, printAlways }: { piece?: Piece; printAlways?: boolean }) {
  const { patch, state } = useAppState();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(piece?.title ?? "");
  const [composer, setComposer] = useState(piece?.composer ?? "");
  const [section, setSection] = useState(piece?.section ?? "");
  const [sheetUrl, setSheetUrl] = useState(piece?.sheetUrl ?? "");
  const [referenceUrl, setReferenceUrl] = useState(piece?.referenceUrl ?? "");
  const [notes, setNotes] = useState(piece?.notes ?? "");

  const save = () => {
    const now = new Date().toISOString();
    if (!piece) {
      const id = "piece-" + now.replace(/[^\d]/g, "").slice(0, 14);
      const np: Piece = { id, title: title.trim() || "Untitled", composer: composer.trim() || undefined, section: section.trim() || undefined, sheetUrl: sheetUrl.trim() || undefined, referenceUrl: referenceUrl.trim() || undefined, notes: notes.trim() || undefined, status: "learning", startedAt: now, minutes: 0 };
      patch({ pieces: [...(state.pieces ?? []), np], currentPieceId: np.id });
    } else {
      const updated = state.pieces.map((p) => p.id === piece.id ? { ...p, title: title.trim(), composer: composer.trim() || undefined, section: section.trim() || undefined, sheetUrl: sheetUrl.trim() || undefined, referenceUrl: referenceUrl.trim() || undefined, notes: notes.trim() || undefined } : p);
      patch({ pieces: updated });
    }
    setEditing(false);
  };

  const summary = piece ? (
    <>
      {piece.title}
      {piece.composer ? ` · ${piece.composer}` : ""}
      {piece.section ? ` · ${piece.section}` : ""}
    </>
  ) : (
    <span className="text-[color:var(--ink-3)]">pick a piece to keep with you.</span>
  );

  return (
    <Slot index={2} title="The piece" summary={summary} printAlways={printAlways}>
      {!editing && piece && (
        <div className="space-y-3 text-sm">
          {piece.notes && (
            <p className="text-[color:var(--ink-2)] whitespace-pre-wrap leading-relaxed">{piece.notes}</p>
          )}
          <div className="flex gap-4 flex-wrap no-print">
            {piece.sheetUrl && (
              <a href={piece.sheetUrl} target="_blank" rel="noreferrer" className="text-[color:var(--accent)] hover:underline">sheet</a>
            )}
            {piece.referenceUrl && (
              <a href={piece.referenceUrl} target="_blank" rel="noreferrer" className="text-[color:var(--accent)] hover:underline">reference recording</a>
            )}
            <button type="button" onClick={() => setEditing(true)} className="text-[color:var(--ink-3)] hover:text-[color:var(--ink)]">edit</button>
          </div>
        </div>
      )}
      {(!piece || editing) && (
        <form
          onSubmit={(e) => { e.preventDefault(); save(); }}
          className="space-y-2 text-sm"
        >
          <Field label="title"><input className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tickery Tockery" /></Field>
          <Field label="composer"><input className={fieldCls} value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Charlton" /></Field>
          <Field label="section"><input className={fieldCls} value={section} onChange={(e) => setSection(e.target.value)} placeholder="bars 9–16" /></Field>
          <Field label="sheet url"><input className={fieldCls} value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} placeholder="musescore / pdf / flat link" /></Field>
          <Field label="reference"><input className={fieldCls} value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} placeholder="youtube / soundcloud url" /></Field>
          <Field label="notes"><textarea className={fieldCls + " min-h-[90px]"} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="fingerings, rough spots, the bit you always lose focus in…" /></Field>
          <div className="flex gap-3 pt-1 no-print">
            <button type="submit" className="text-xs px-3 py-1 rounded-full bg-[color:var(--accent-deep)] text-[color:var(--ink)] hover:bg-[color:var(--accent-soft)] transition-colors">keep</button>
            {piece && (
              <button type="button" onClick={() => setEditing(false)} className="text-xs text-[color:var(--ink-3)]">cancel</button>
            )}
          </div>
        </form>
      )}
    </Slot>
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
const fieldCls = "w-full bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-md px-3 py-1.5 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)]";
