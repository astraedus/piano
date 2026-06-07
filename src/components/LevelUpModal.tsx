"use client";
import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { titleForLevel } from "@/lib/progression";

/**
 * The Level-Up reward moment — sibling to the Unlock Card. Same visual grammar:
 * a Fraunces-900 "wonky heavy" headline, a sunrise top-bar, a single translateY
 * rise (no bounce, no confetti — the settling IS the celebration), reduced-motion
 * honored. Shows the level number + its musician-journey title.
 */
export function LevelUpModal({ level, onCloseAction }: { level: number; onCloseAction: () => void }) {
  const reduce = useReducedMotion();
  const title = titleForLevel(level);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseAction(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCloseAction]);

  return (
    <motion.div
      className="fixed inset-0 z-30 bg-[rgba(35,26,14,0.45)] backdrop-blur-sm flex items-center justify-center p-6 no-print"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
      onClick={onCloseAction}
    >
      <motion.div
        className="relative max-w-md w-full bg-[color:var(--bg-surface)] rounded-[20px] p-8 overflow-hidden text-center"
        style={{ boxShadow: "var(--shadow-stage), var(--lit-edge)" }}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.15 : 0.4, ease: [0.2, 0, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sunrise top-bar: warm gradient hairline (matches the Unlock Card). */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, var(--color-piano-400, #e8a820), var(--color-piano-200, #fae0a0))" }}
          aria-hidden
        />
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-3)] mb-5">you leveled up</p>
        <span
          className="xp-badge xp-badge-lg mx-auto mb-5 inline-flex items-center justify-center rounded-full font-semibold tabular-nums"
          aria-hidden
        >
          {level}
        </span>
        <h2
          className="font-serif text-[length:var(--text-3xl)] text-[color:var(--ink)] leading-[1.1] tracking-[-0.025em] mb-3"
          style={{ fontWeight: 900, fontVariationSettings: "'opsz' 40, 'SOFT' 60" }}
        >
          Level {level} — {title}
        </h2>
        <p className="font-serif italic text-[length:var(--text-base)] text-[color:var(--instrument-accent-deep)] leading-relaxed">
          the practice is adding up. keep going.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={onCloseAction}
            className="cta-pill w-full text-sm font-semibold tracking-[0.04em] py-2.5"
          >
            nice
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
