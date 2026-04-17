"use client";
import { useState } from "react";
import { Slot } from "../Slot";
import type { Piece, KeyId } from "@/lib/types";
import { CIRCLE_MAJORS, CIRCLE_MINORS, KEY_META } from "@/lib/music";
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
  const [keyId, setKeyId] = useState<KeyId | "">(piece?.keyId ?? "");

  const save = () => {
    const now = new Date().toISOString();
    if (!piece) {
      const id = "piece-" + now.replace(/[^\d]/g, "").slice(0, 14);
      const np: Piece = { id, title: title.trim() || "Untitled", composer: composer.trim() || undefined, keyId: (keyId || undefined) as Piece["keyId"], section: section.trim() || undefined, sheetUrl: sheetUrl.trim() || undefined, referenceUrl: referenceUrl.trim() || undefined, notes: notes.trim() || undefined, status: "learning", startedAt: now, minutes: 0 };
      patch({ pieces: [...(state.pieces ?? []), np], currentPieceId: np.id });
    } else {
      const updated = state.pieces.map((p) => p.id === piece.id ? { ...p, title: title.trim(), composer: composer.trim() || undefined, keyId: (keyId || undefined) as Piece["keyId"], section: section.trim() || undefined, sheetUrl: sheetUrl.trim() || undefined, referenceUrl: referenceUrl.trim() || undefined, notes: notes.trim() || undefined } : p);
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
          <div className="text-[color:var(--ink-2)]">
            <span className="font-serif text-lg text-[color:var(--ink)]">{piece.title}</span>
            {piece.composer && <span className="text-[color:var(--ink-3)]"> — {piece.composer}</span>}
            {piece.section && <span className="text-[color:var(--ink-3)]"> · {piece.section}</span>}
          </div>
          {piece.notes && (
            <p className="text-[color:var(--ink-2)] whitespace-pre-wrap leading-relaxed">{piece.notes}</p>
          )}
          {youtubeIdFrom(piece.referenceUrl) && (
            <div className="aspect-video rounded-md overflow-hidden border border-[color:var(--rule)] bg-black/30 no-print">
              <iframe
                width="100%" height="100%"
                src={`https://www.youtube-nocookie.com/embed/${youtubeIdFrom(piece.referenceUrl)}?rel=0`}
                title={piece.title}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          )}
          <div className="flex gap-4 flex-wrap no-print">
            {piece.sheetUrl && (
              <a href={piece.sheetUrl} target="_blank" rel="noreferrer" className="text-[color:var(--accent)] hover:underline">sheet</a>
            )}
            {piece.referenceUrl && !youtubeIdFrom(piece.referenceUrl) && (
              <a href={piece.referenceUrl} target="_blank" rel="noreferrer" className="text-[color:var(--accent)] hover:underline">reference recording</a>
            )}
            {!piece.referenceUrl && !piece.sheetUrl && (
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(piece.title + " " + (piece.composer ?? "") + " piano")}`}
                target="_blank"
                rel="noreferrer"
                className="text-[color:var(--accent)] hover:underline"
              >
                find a recording →
              </a>
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
          <Field label="key">
            <select className={fieldCls} value={keyId} onChange={(e) => setKeyId(e.target.value as KeyId | "")}>
              <option value="">— unset —</option>
              <optgroup label="major">
                {CIRCLE_MAJORS.map((k) => (<option key={k} value={k}>{KEY_META[k].name}</option>))}
              </optgroup>
              <optgroup label="minor">
                {CIRCLE_MINORS.map((k) => (<option key={k} value={k}>{KEY_META[k].name}</option>))}
              </optgroup>
            </select>
          </Field>
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

function youtubeIdFrom(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace(/^\//, "");
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtube-nocookie.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.replace("/embed/", "");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.replace("/shorts/", "").split("/")[0];
    }
  } catch {}
  return null;
}
