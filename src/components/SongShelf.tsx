"use client";
import { useMemo, useState } from "react";
import { useAppState } from "@/hooks/useAppState";
import type { Piece, PieceStatus } from "@/lib/types";

const STATUSES: PieceStatus[] = ["learning", "shelved", "yours", "known"];

export function SongShelf() {
  const { state, patch } = useAppState();
  const [filter, setFilter] = useState<"all" | "yours" | "learning">("all");

  const pieces = useMemo(() => {
    const arr = [...(state.pieces ?? [])].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    if (filter === "yours") return arr.filter((p) => p.status === "yours");
    if (filter === "learning") return arr.filter((p) => p.status === "learning");
    return arr;
  }, [state.pieces, filter]);

  const pieceCount = (state.pieces ?? []).length;
  const yoursCount = (state.pieces ?? []).filter((p) => p.status === "yours").length;
  const livedCount = (state.pieces ?? []).filter((p) => p.status === "yours" || p.status === "known").length;
  const firstPiece = (state.pieces ?? [])[0];

  const promote = (id: string, status: PieceStatus) => {
    const next = (state.pieces ?? []).map((p) => p.id === id ? { ...p, status } : p);
    patch({ pieces: next });
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-[color:var(--ink-tertiary)]">
        {pieceCount === 0 ? (
          <span className="italic text-[color:var(--ink-muted)]">nothing on the shelf yet. add your first piece from the stand.</span>
        ) : (
          <>
            <span className="living-number">{pieceCount}</span> piece{pieceCount === 1 ? "" : "s"} on the shelf.{" "}
            <span className="living-number">{yoursCount}</span> yours.{" "}
            <span className="living-number">{livedCount}</span> lived in.
          </>
        )}
      </div>
      {firstPiece && (
        <div className="text-xs text-[color:var(--ink-3)]">
          first: <span className="text-[color:var(--ink-2)]">{firstPiece.title}</span> — {new Date(firstPiece.startedAt).toLocaleDateString()}
        </div>
      )}
      <div className="flex gap-2 no-print">
        {(["all", "yours", "learning"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "text-xs px-3 py-1 rounded-full border transition-colors " +
              (filter === f
                ? "border-[color:var(--accent)] text-[color:var(--accent-deep)] bg-[color:var(--accent)]/10"
                : "border-[color:var(--rule)] text-[color:var(--ink-3)] hover:border-[color:var(--accent-soft)]")
            }
          >
            {f}
          </button>
        ))}
      </div>
      {pieces.length === 0 ? (
        <div className="text-[color:var(--ink-3)] italic font-serif">nothing to show with this filter.</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {pieces.map((p) => (
            <PieceCard key={p.id} piece={p} onPromoteAction={(s: PieceStatus) => promote(p.id, s)} />
          ))}
        </ul>
      )}
    </div>
  );
}

const STATUS_STRIP: Record<PieceStatus, string> = {
  learning: "#f0c060", // piano-300 honey
  shelved: "var(--bg-rule)",
  yours: "#3a8040", // success
  known: "#2870a0", // info
};

function PieceCard({ piece, onPromoteAction }: { piece: Piece; onPromoteAction: (s: PieceStatus) => void }) {
  return (
    <li className="warm-card p-4 pb-5 relative overflow-hidden">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-serif text-lg text-[color:var(--ink)] tracking-[-0.01em]">{piece.title}</h4>
        <span className="text-[10px] uppercase tracking-wider text-[color:var(--instrument-accent-deep)] font-medium">{piece.status}</span>
      </div>
      <p className="text-xs text-[color:var(--ink-3)] mt-0.5">
        {piece.composer ?? "—"}{piece.grade ? " · " + piece.grade : ""}
      </p>
      <dl className="text-xs text-[color:var(--ink-3)] mt-3 space-y-0.5">
        <div className="flex gap-2"><dt>started:</dt><dd className="text-[color:var(--ink-2)]">{new Date(piece.startedAt).toLocaleDateString()}</dd></div>
        <div className="flex gap-2"><dt>time:</dt><dd className="text-[color:var(--ink-2)]">{fmtMinutes(piece.minutes)}</dd></div>
      </dl>
      <div className="flex gap-1.5 flex-wrap pt-3 no-print">
        {STATUSES.filter((s) => s !== piece.status).map((s) => (
          <button
            key={s}
            onClick={() => onPromoteAction(s)}
            className="chip text-[10px] px-2 py-0.5"
          >
            → {s}
          </button>
        ))}
      </div>
      {/* status color strip along the bottom edge */}
      <span
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: STATUS_STRIP[piece.status] }}
        aria-hidden
      />
    </li>
  );
}

function fmtMinutes(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
}
