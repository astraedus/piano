import { ImageResponse } from "next/og";
import { OG_IMAGE_ALT, OG_IMAGE_SIZE, SITE_TAGLINE, SKILL_NODE_COUNTS } from "@/lib/seo";

// Alt and size come from `lib/seo` because `buildMetadata` also emits them on
// every page's og:image tag; declaring them twice would let the two drift.
export const alt = OG_IMAGE_ALT;
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

// Warm Studio palette, light variant. Hard-coded rather than read from
// globals.css because Satori (the renderer behind ImageResponse) resolves no CSS
// variables and loads no stylesheet: it only sees the inline styles below.
const CREAM = "#FBF6EE";
const SURFACE = "#F5EDD9";
const RULE = "#D4C5A0";
const INK = "#231A0E";
const INK_2 = "#4A3A22";
const INK_3 = "#7A6448";
const PIANO = "#D4900A";
const GUITAR = "#C0432E";
const DRUMS = "#A87722";

/**
 * The 1200x630 card every shared link renders as. Before this existed, a link to
 * the app previewed as a bare URL with no image and no title, which is most of
 * why sharing it looked broken.
 *
 * Satori supports flexbox only (no grid, no float), so every layout below is
 * explicit flex with explicit `display`.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          padding: "72px 80px",
          // A soft warm wash from the top-left so the card is not a flat slab.
          backgroundImage: `radial-gradient(1000px 600px at 0% 0%, ${SURFACE} 0%, ${CREAM} 65%)`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <PianoMark />
            <div
              style={{
                display: "flex",
                fontSize: 30,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: INK_3,
              }}
            >
              music.raeduslabs.com
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 44,
              fontSize: 92,
              lineHeight: 1.05,
              letterSpacing: -3,
              color: INK,
              fontWeight: 700,
            }}
          >
            Music Practice
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 40,
              lineHeight: 1.3,
              color: INK_2,
              maxWidth: 900,
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Chip color={PIANO} label={`Piano · ${SKILL_NODE_COUNTS.piano} skills`} />
          <Chip color={GUITAR} label={`Guitar · ${SKILL_NODE_COUNTS.guitar} skills`} />
          <Chip color={DRUMS} label={`Drums · ${SKILL_NODE_COUNTS.drums} skills`} />
          <div
            style={{
              display: "flex",
              marginLeft: "auto",
              paddingLeft: 24,
              fontSize: 26,
              color: INK_3,
              // Without this the label wraps to two lines and crowds the chips.
              whiteSpace: "nowrap",
            }}
          >
            Free and open source
          </div>
        </div>
      </div>
    ),
    size,
  );
}

/** A chip, drawn with a leading accent dot in the instrument's colour. */
function Chip({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: SURFACE,
        border: `2px solid ${RULE}`,
        borderRadius: 999,
        padding: "12px 24px",
        fontSize: 26,
        color: INK_2,
      }}
    >
      <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, background: color }} />
      {label}
    </div>
  );
}

/**
 * The app's piano-key mark, rebuilt in flex boxes. The real one is an inline SVG
 * with CSS-variable fills; neither survives Satori, so this is a plain-div
 * reconstruction of the same silhouette (three white keys, two accent keys).
 */
function PianoMark() {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: 64,
        height: 60,
        background: SURFACE,
        border: `3px solid ${RULE}`,
        borderRadius: 10,
      }}
    >
      <div style={{ display: "flex", position: "absolute", left: 19, top: 0, width: 3, height: 54, background: RULE }} />
      <div style={{ display: "flex", position: "absolute", left: 38, top: 0, width: 3, height: 54, background: RULE }} />
      <div style={{ display: "flex", position: "absolute", left: 12, top: 0, width: 12, height: 28, borderRadius: 3, background: "#9C6800" }} />
      <div style={{ display: "flex", position: "absolute", left: 33, top: 0, width: 12, height: 28, borderRadius: 3, background: PIANO }} />
    </div>
  );
}
