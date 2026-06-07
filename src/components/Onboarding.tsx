"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/hooks/useAppState";
import { weekIdOf } from "@/lib/ghostKey";
import type { Phase, Grade, KeyId, Instrument } from "@/lib/types";

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
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [northStar, setNorthStar] = useState("");
  const [keyboardChoice, setKeyboardChoice] = useState<"now" | "elsewhere" | "not-yet" | null>(null);
  const [name, setName] = useState("");

  const isGuitar = instrument === "guitar";
  const instrumentNoun = isGuitar ? "guitar" : "piano";
  const haveNoun = isGuitar ? "guitar" : "keyboard or piano";

  const finish = () => {
    const option = PHASE_OPTIONS[selected ?? 0];
    const now = new Date().toISOString();
    const chosen: Instrument = instrument ?? "piano";
    const guitar = chosen === "guitar";

    // Piano-only seeds: the Key Map depths + Anti's personal piece history are
    // piano repertoire and don't apply to a guitar profile. A fresh guitar profile
    // starts clean (its progress lives in the skill graph + chain drills).
    const seedDepths: Record<string, number> = {};
    if (!guitar) {
      if (option.phase >= 1) { seedDepths.C = 2; seedDepths.am = 1; }
      if (option.phase >= 2) { seedDepths.C = 3; seedDepths.am = 2; seedDepths.G = 2; seedDepths.F = 1; }
      if (option.phase >= 3) { seedDepths.C = 3; seedDepths.am = 3; seedDepths.G = 3; seedDepths.F = 2; seedDepths.D = 2; seedDepths.dm = 1; seedDepths.em = 1; }
    }

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
      referenceUrl: "https://www.youtube.com/results?search_query=Tickery+Tockery+Charlton+Trinity+piano",
      startedAt: now,
      minutes: 0,
    };
    const pianoPieces = [seededOnceUponATime, defaultCurrentPiece];

    const arc = [
      ...(state.arc ?? []),
      {
        id: "instrument-begins-" + now.slice(0, 10),
        at: now,
        kind: "instrument-begins" as const,
        instrument: chosen,
        label: guitar ? "electric guitar begins" : "piano begins",
      },
    ];
    if (!guitar) {
      arc.push({
        id: "once-upon-a-time-yours",
        at: "2019-11-01T00:00:00.000Z",
        kind: "piece-yours" as const,
        instrument: "piano" as const,
        label: "Once Upon A Time — yours",
      });
    }

    patch({
      instrument: chosen,
      firstOpenedAt: state.firstOpenedAt ?? now,
      name: name.trim() || undefined,
      northStar: northStar.trim() || undefined,
      hasKeyboardNow: keyboardChoice !== "not-yet",
      phase: option.phase,
      grade: option.grade,
      earLevel: option.earLevel,
      // weekId must be a real ISO-week id (matches ghostKeyFor) so the seeded
      // ghost actually applies this first week, then naturally expires (B5).
      ghostOverride: { key: option.ghost, weekId: weekIdOf(new Date()) },
      // Only seed piano repertoire for a piano profile.
      pieces: guitar ? state.pieces : (state.pieces.length > 0 ? state.pieces : pianoPieces),
      currentPieceId: guitar ? state.currentPieceId : (state.currentPieceId ?? defaultCurrentPiece.id),
      keyDepths: { ...(state.keyDepths ?? {}), ...seedDepths },
      arc,
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
            which one are you here for?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { v: "piano" as const, label: "piano", sub: "keys, harmony, the full range." },
              { v: "guitar" as const, label: "electric guitar", sub: "riffs, chords, the rock spine." },
            ]).map((o) => (
              <button
                key={o.v}
                type="button"
                data-instrument-choice={o.v}
                onClick={() => setInstrument(o.v)}
                className={
                  "text-left px-4 py-5 rounded-lg border transition-colors " +
                  (instrument === o.v
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--ink)]"
                    : "border-[color:var(--rule)] text-[color:var(--ink-2)] hover:border-[color:var(--accent-soft)]")
                }
              >
                <span className="block font-serif text-lg text-[color:var(--ink)]">{o.label}</span>
                <span className="block text-sm text-[color:var(--ink-3)] mt-1">{o.sub}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-[color:var(--ink-3)] italic">you can switch later in settings.</p>
          <Nav onBack={null} onNext={() => setStep(1)} disabled={instrument === null} />
        </section>
      )}

      {step === 1 && (
        <section className="fade-in space-y-6">
          <p className="font-serif text-xl text-[color:var(--ink)]">
            where are you on the {instrumentNoun} today?
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
          <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} disabled={selected === null} />
        </section>
      )}

      {step === 2 && (
        <section className="fade-in space-y-6">
          <p className="font-serif text-xl text-[color:var(--ink)]">
            what do you want to play, eventually?
          </p>
          <p className="text-sm text-[color:var(--ink-3)] italic">no right answer. one line.</p>
          <textarea
            value={northStar}
            onChange={(e) => setNorthStar(e.target.value)}
            rows={3}
            placeholder="to play hallelujah without crying. / to pick up songs i hear. / to feel at home at an instrument."
            className="w-full bg-[color:var(--surface)] border border-[color:var(--rule)] rounded-lg px-4 py-3 text-[color:var(--ink)] placeholder:text-[color:var(--ink-3)] focus:outline-none focus:border-[color:var(--accent-soft)] font-serif"
          />
          <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </section>
      )}

      {step === 3 && (
        <section className="fade-in space-y-6">
          <p className="font-serif text-xl text-[color:var(--ink)]">
            do you have a {haveNoun} right now?
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
              {isGuitar
                ? "okay. read the tree, learn the shapes by eye. come back when you have a guitar in your hands. it'll be worth the wait."
                : "okay. the theory side of this is free and useful. come back when you have keys under your fingers. the piano will be worth the wait."}
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
          <Nav onBack={() => setStep(2)} onNext={finish} nextLabel="open the file" disabled={keyboardChoice === null} />
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
