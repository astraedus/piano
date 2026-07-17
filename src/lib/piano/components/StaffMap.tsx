"use client";
// StaffMap — a hand-rolled SVG teaching diagram of the grand staff.
//
// Purpose-built for the "Reading the Staff" lesson (p-t0-staff): it shows the
// treble + bass staves with EVERY line and space labelled by its letter, a
// climbing staircase of noteheads (up the staff = up in pitch, one letter at a
// time), Middle C on its own ledger line bridging the two staves, and the four
// mnemonics as captions. Line-notes are FILLED accent noteheads; space-notes are
// OUTLINED ink noteheads — two redundant cues (fill + colour) so the two classes
// read apart at a glance.
//
// Deterministic pure SVG (no VexFlow): full label control + fully testable. All
// colour comes from Warm Studio CSS tokens so light/dark both work. Responsive
// via viewBox + max-w; role="img" + aria-label for screen readers.

interface StaffNote {
  letter: string;
  isLine: boolean; // true = sits ON a staff line, false = sits IN a space
}

// Bottom → top. Treble: lines E G B D F ("Every Good Boy Deserves Fudge"),
// spaces F A C E ("FACE"). The array interleaves line, space, line, ... so index
// 0 is the bottom line and index 8 is the top line.
const TREBLE_NOTES: StaffNote[] = [
  { letter: "E", isLine: true },
  { letter: "F", isLine: false },
  { letter: "G", isLine: true },
  { letter: "A", isLine: false },
  { letter: "B", isLine: true },
  { letter: "C", isLine: false },
  { letter: "D", isLine: true },
  { letter: "E", isLine: false },
  { letter: "F", isLine: true },
];

// Bottom → top. Bass: lines G B D F A ("Good Boys Deserve Fudge Always"),
// spaces A C E G ("All Cows Eat Grass").
const BASS_NOTES: StaffNote[] = [
  { letter: "G", isLine: true },
  { letter: "A", isLine: false },
  { letter: "B", isLine: true },
  { letter: "C", isLine: false },
  { letter: "D", isLine: true },
  { letter: "E", isLine: false },
  { letter: "F", isLine: true },
  { letter: "G", isLine: false },
  { letter: "A", isLine: true },
];

// ── Geometry (viewBox units) ─────────────────────────────────────────────────
const W = 320;
const STEP = 13; // vertical gap between a line and its adjacent space
const NOTE_RX = 11;
const NOTE_RY = 8.5;
const LEFT = 40; // staff line start x (also the joining barline)
const RIGHT = 306; // staff line end x
const NOTE_X0 = 58; // first (lowest) notehead x
const NOTE_DX = 29.5; // horizontal step of the notehead staircase

const TREBLE_BOTTOM = 116; // y of the treble bottom line (E4)
const TREBLE_TOP = TREBLE_BOTTOM - 8 * STEP; // top line (F5) = 12
const MIDDLE_C_Y = TREBLE_BOTTOM + 2 * STEP; // ledger line below treble = 142
const BASS_TOP = MIDDLE_C_Y + 2 * STEP; // top line (A3) = 168
const BASS_BOTTOM = BASS_TOP + 8 * STEP; // bottom line (G2) = 272
const H = BASS_BOTTOM + 16;
const MID_X = W / 2;

// ── Colour tokens ────────────────────────────────────────────────────────────
// Line vs space is cued by FILLED (dark ink dot, light letter) vs OUTLINED
// (hollow, ink letter) — the classic notation convention. We deliberately keep
// the letters on ink/background tokens (NOT --accent-deep): --accent-deep shifts
// with data-phase to dark hues that fail WCAG on a dark surface in dark mode,
// and these letters are info-bearing. Ink↔background contrast is a design
// invariant (AA in both themes, phase-independent).
const LINE_FILL = "var(--ink)"; // filled line-note noteheads (boldest — they carry the mnemonic)
const LINE_LETTER = "var(--background)"; // light letter on the dark filled dot
const SPACE_STROKE = "var(--ink-2)"; // outline + letter of space-note noteheads
const STAFF_LINE = "var(--ink-3)"; // the staff + ledger + barline strokes
const CLEF_COLOR = "var(--ink-2)";

const ARIA_LABEL =
  "Grand staff diagram. Treble clef: lines bottom to top E G B D F, spaces F A C E. " +
  "Middle C on a ledger line below the treble staff. " +
  "Bass clef: lines bottom to top G B D F A, spaces A C E G.";

/** One labelled notehead. Filled = on a line; outlined = in a space. */
function NoteHead({ x, y, note }: { x: number; y: number; note: StaffNote }) {
  return (
    <g>
      <ellipse
        cx={x}
        cy={y}
        rx={NOTE_RX}
        ry={NOTE_RY}
        fill={note.isLine ? LINE_FILL : "var(--surface)"}
        stroke={note.isLine ? "none" : SPACE_STROKE}
        strokeWidth={note.isLine ? 0 : 2}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill={note.isLine ? LINE_LETTER : SPACE_STROKE}
      >
        {note.letter}
      </text>
    </g>
  );
}

/** A single stave: its 5 lines + the staircase of 9 labelled noteheads. */
function Stave({ notes, bottomLineY }: { notes: StaffNote[]; bottomLineY: number }) {
  return (
    <g>
      {/* 5 staff lines — one per line-note position. */}
      {notes.map((n, i) =>
        n.isLine ? (
          <line
            key={`line-${i}`}
            x1={LEFT}
            x2={RIGHT}
            y1={bottomLineY - i * STEP}
            y2={bottomLineY - i * STEP}
            stroke={STAFF_LINE}
            strokeWidth={1}
          />
        ) : null,
      )}
      {/* Noteheads climbing left → right, each on its line / in its space. */}
      {notes.map((n, i) => (
        <NoteHead key={`note-${i}`} x={NOTE_X0 + i * NOTE_DX} y={bottomLineY - i * STEP} note={n} />
      ))}
    </g>
  );
}

export function StaffMap() {
  return (
    <div data-testid="staff-map" className="w-full flex flex-col items-center gap-2.5">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[340px] block select-none"
        role="img"
        aria-label={ARIA_LABEL}
      >
        {/* Barline joining the two staves. */}
        <line
          x1={LEFT}
          y1={TREBLE_TOP}
          x2={LEFT}
          y2={BASS_BOTTOM}
          stroke={STAFF_LINE}
          strokeWidth={1.5}
        />

        {/* Clef glyphs (unicode). aria-hidden — the aria-label carries the meaning. */}
        <text
          x={22}
          y={(TREBLE_TOP + TREBLE_BOTTOM) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="62"
          fill={CLEF_COLOR}
          aria-hidden="true"
        >
          {"\u{1D11E}"}
        </text>
        <text
          x={22}
          y={(BASS_TOP + BASS_BOTTOM) / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="40"
          fill={CLEF_COLOR}
          aria-hidden="true"
        >
          {"\u{1D122}"}
        </text>

        <Stave notes={TREBLE_NOTES} bottomLineY={TREBLE_BOTTOM} />
        <Stave notes={BASS_NOTES} bottomLineY={BASS_BOTTOM} />

        {/* Middle C — its own ledger line + a distinct filled notehead + label. */}
        <line
          x1={MID_X - 20}
          y1={MIDDLE_C_Y}
          x2={MID_X + 20}
          y2={MIDDLE_C_Y}
          stroke={STAFF_LINE}
          strokeWidth={1}
        />
        <ellipse
          cx={MID_X}
          cy={MIDDLE_C_Y}
          rx={NOTE_RX}
          ry={NOTE_RY}
          fill={LINE_FILL}
          stroke="var(--accent)"
          strokeWidth={2.5}
        />
        <text
          x={MID_X}
          y={MIDDLE_C_Y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="11"
          fontWeight="700"
          fontFamily="var(--font-mono)"
          fill={LINE_LETTER}
        >
          C
        </text>
        <text
          x={MID_X + 30}
          y={MIDDLE_C_Y}
          textAnchor="start"
          dominantBaseline="central"
          fontSize="11"
          fontWeight="600"
          fill="var(--ink-2)"
        >
          Middle C
        </text>
      </svg>

      {/* Mnemonics — HTML captions (wrap responsively, unlike SVG text). Labels
          in --ink-2 (AA both themes); a filled-dot / hollow-dot glyph mirrors the
          notehead convention so the caption ties back to the diagram. */}
      <dl className="w-full max-w-[340px] space-y-1 text-[11px] leading-snug">
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <dt className="font-semibold text-[color:var(--ink)]">● Treble lines — E G B D F</dt>
          <dd className="text-[color:var(--ink-3)]">Every Good Boy Deserves Fudge</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <dt className="font-semibold text-[color:var(--ink-2)]">○ Treble spaces — F A C E</dt>
          <dd className="text-[color:var(--ink-3)]">they spell the word FACE</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <dt className="font-semibold text-[color:var(--ink)]">● Bass lines — G B D F A</dt>
          <dd className="text-[color:var(--ink-3)]">Good Boys Deserve Fudge Always</dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <dt className="font-semibold text-[color:var(--ink-2)]">○ Bass spaces — A C E G</dt>
          <dd className="text-[color:var(--ink-3)]">All Cows Eat Grass</dd>
        </div>
      </dl>
    </div>
  );
}
