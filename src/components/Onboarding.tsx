"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/hooks/useAppState";
import type { Phase, Grade, KeyId } from "@/lib/types";

const PHASE_OPTIONS: { label: string; phase: Phase; grade: Grade; ghost: KeyId; earLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 }[] = [
  { label: "never touched one.", phase: 1, grade: "initial", ghost: "C", earLevel: 1 },
  { label: "know a few things — some scales, some pieces.", phase: 1, grade: "g1", ghost: "C", earLevel: 2 },
  { label: "grade 2 or 3-ish, trying to go further.", phase: 2, grade: "g2", ghost: "am", earLevel: 3 },
  { label: "higher than that. mostly want to improvise + play by ear.", phase: 3, grade: "g4", ghost: "A", earLevel: 5 },
];

export function Onboarding() {
  const router = useRouter();
  const { state, patch } = useAppState();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [northStar, setNorthStar] = useState("");
  const [keyboardChoice, setKeyboardChoice] = useState<"now" | "elsewhere" | "not-yet" | null>(null);
  const [name, setName] = useState("");

  const finish = () => {
    const option = PHASE_OPTIONS[selected ?? 0];
    const now = new Date().toISOString();

    // Seed the shelf with Once Upon A Time (Anti's first-ever piece, Nov 2019).
    const seededOnceUponATime = {
      id: "piece-once-upon-a-time",
      title: "Once Upon A Time",
      composer: "(your first piece)",
      keyId: "C" as const,
      status: "yours" as const,
      startedAt: "2019-11-01T00:00:00.000Z",
      minutes: 0,
    };
    // Suggest Tickery Tockery as the current working piece (Anti's Trinity Initial piece).
    const defaultCurrentPiece = {
      id: "piece-tickery-tockery",
      title: "Tickery Tockery",
      composer: "Charlton",
      grade: "initial" as const,
      keyId: "C" as const,
      status: "learning" as const,
      section: "bars 9–16",
      startedAt: now,
      minutes: 0,
    };
    const pieces = [seededOnceUponATime, defaultCurrentPiece];

    patch({
      firstOpenedAt: state.firstOpenedAt ?? now,
      name: name.trim() || undefined,
      northStar: northStar.trim() || undefined,
      hasKeyboardNow: keyboardChoice !== "not-yet",
      phase: option.phase,
      grade: option.grade,
      earLevel: option.earLevel,
      ghostOverride: { key: option.ghost, weekId: "seed" },
      pieces: state.pieces.length > 0 ? state.pieces : pieces,
      currentPieceId: state.currentPieceId ?? defaultCurrentPiece.id,
      arc: [
        ...(state.arc ?? []),
        { id: "piano-begins-" + now.slice(0, 10), at: now, kind: "piano-begins", label: "piano begins" },
        { id: "once-upon-a-time-yours", at: "2019-11-01T00:00:00.000Z", kind: "piece-yours", label: "Once Upon A Time — yours" },
      ],
    });
    router.push("/");
  };

  return (
    <div className="space-y-12">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)]">welcome</p>
        <h1 className="font-serif text-4xl text-[color:var(--ink)]">come in.</h1>
        <p className="text-[color:var(--ink-2)] font-serif italic mt-2">three questions. nothing you get wrong.</p>
      </header>

      {step === 0 && (
        <section className="fade-in space-y-6">
          <p className="font-serif text-xl text-[color:var(--ink)]">
            where are you on the piano today?
          </p>
          <ul className="space-y-2">
            {PHASE_OPTIONS.map((o, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  className={
                    "w-full text-left px-4 py-3 rounded-lg border transition-colors " +
                    (selected === i
                      ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--ink)]"
                      : "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]")
                  }
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
          <Nav onBack={null} onNext={() => setStep(1)} disabled={selected === null} />
        </section>
      )}

      {step === 1 && (
        <section className="fade-in space-y-6">
          <p className="font-serif text-xl text-[color:var(--ink)]">
            what do you want to play, eventually?
          </p>
          <p className="text-sm text-[color:var(--ink-3)] italic">no right answer. one line.</p>
          <textarea
            value={northStar}
            onChange={(e) => setNorthStar(e.target.value)}
            rows={3}
            placeholder="to play hallelujah without crying. / to pick up songs i hear. / to feel at home at a keyboard."
            className="w-full bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-lg px-4 py-3 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)] font-serif"
          />
          <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </section>
      )}

      {step === 2 && (
        <section className="fade-in space-y-6">
          <p className="font-serif text-xl text-[color:var(--ink)]">
            do you have a keyboard or piano right now?
          </p>
          <div className="flex gap-3 flex-wrap">
            {([
              { label: "yes, next to me", v: "now" as const },
              { label: "yes, somewhere else", v: "elsewhere" as const },
              { label: "not yet", v: "not-yet" as const },
            ]).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => { setKeyboardChoice(o.v); }}
                className={
                  "px-4 py-2 rounded-full border transition-colors " +
                  (keyboardChoice === o.v
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--ink)]"
                    : "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]")
                }
              >
                {o.label}
              </button>
            ))}
          </div>
          {keyboardChoice === "not-yet" && (
            <p className="text-sm text-[color:var(--ink-3)] italic fade-in">
              okay. the theory side of this is free and useful. come back when you have keys under your fingers. the piano will be worth the wait.
            </p>
          )}
          <div className="pt-4">
            <label className="block">
              <span className="block text-xs text-[color:var(--ink-3)] mb-1 lowercase tracking-wide">a name, if you want (optional)</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-md px-3 py-1.5 text-[color:var(--ink)] focus:outline-none focus:border-[color:var(--accent-soft)]"
                placeholder="what the app calls you — or leave blank."
              />
            </label>
          </div>
          <Nav onBack={() => setStep(1)} onNext={finish} nextLabel="open the file" disabled={keyboardChoice === null} />
        </section>
      )}
    </div>
  );
}

function Nav({ onBack, onNext, disabled, nextLabel }: { onBack: (() => void) | null; onNext: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="flex items-center gap-4 pt-2">
      {onBack && (
        <button type="button" onClick={onBack} className="text-sm text-[color:var(--ink-3)] hover:text-[color:var(--ink-2)]">back</button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="ml-auto px-5 py-2 rounded-full bg-[color:var(--accent-deep)] text-[color:var(--ink)] hover:bg-[color:var(--accent-soft)] transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {nextLabel ?? "next"}
      </button>
    </div>
  );
}
