import type { NodeLesson } from "../types";

// Drums teaching content — the four Tier-0 lessons. Grounded in the research
// corpus (docs/research/drums/technique.json for grip/rebound/stroke cues +
// self-diagnosis, roadmap.json for the teaching order, reading.json for the
// click/counting). Voice: zero unexplained jargon — every term is either plain
// or a tappable glossary word. The watchOut fields lean on OBSERVABLE, self-
// checkable criteria (sound / bounce / fatigue), because this learner is solo
// and pad-only with no teacher to eyeball their hands.
export const DRUMS_LESSONS: Record<string, NodeLesson> = {
  "d-t0-setup": {
    what:
      "The stick pivots on one hinge point, called the fulcrum. It sits about a third of the way up from the butt end, pinched lightly between the pad of your thumb and the side of your index finger — a loose 'OK' sign. Your other three fingers curl softly around the stick like a cage that guides it, never a clamp. Both hands hold it exactly the same way: that is matched grip.",
    why:
      "The fulcrum is the hinge every single stroke rotates around. Get it right and relaxed now and every drill afterward builds on solid ground; get it wrong and each one quietly drills the wrong thing. And a loose grip is where all your speed and stamina come from — squeezing is the number-one thing that holds beginners back.",
    steps: [
      { do: "Hold a stick loosely about a third up from the butt end and let it hang, then bounce it once on the pad.", feel: "at the right spot it rebounds two or three times on its own before settling — that spot is your fulcrum" },
      { do: "Pinch there with the pad of your thumb and the side of your index finger, a loose 'OK' shape.", feel: "firm enough to steer the stick, loose enough that it can still bounce" },
      { do: "Curl your other three fingers softly around the stick, guiding it, never squeezing.", feel: "hold it like a small bird — tight enough it can't fly away, loose enough you don't crush it" },
      { do: "Sit or stand tall with the pad at a height where your forearms sit roughly level and your shoulders stay relaxed. Set both hands up identically." },
    ],
    goodWhen:
      "You can hold the grip for a whole short session with your shoulders relaxed, and a light tap makes the stick spring back on its own instead of dying dead in your hand.",
    watchOut:
      "The death grip — squeezing too tight. The self-checks: the pad sounds dead and choked instead of open and ringing; the stick bounces once and stops flat, like dribbling on carpet; or a blister starts or your forearm tires within a few minutes. Any of those means loosen up. More speed comes from less squeeze, not more.",
  },

  "d-t0-rebound": {
    what:
      "The free stroke: you throw the stick down at the pad and let it bounce all the way back up on its own — you never lift it back yourself. It is exactly like dribbling a basketball. You only push down; the surface sends it back to you.",
    why:
      "This is the whole reason a practice pad exists: its tight, springy surface hands the stick back to you for free, over and over, so you can feel a clean bounce. Learn to trust that now and everything fast or quiet you play later costs almost no effort. Fight the bounce and you glue tension onto every note.",
    steps: [
      { do: "Start with the stick tip up a few inches off the pad, then throw it down toward the pad in one relaxed motion.", feel: "like letting go of control for a split second after the throw" },
      { do: "Do nothing on the way up — let the bounce carry the tip back to where it started.", feel: "the stick returns to within about an inch of its start height all by itself" },
      { do: "Let your back fingers relax open on the rebound instead of catching the stick dead.", feel: "soft and giving, never clamped" },
      { do: "Alternate hands slowly, one throw at a time, pausing to watch each stick return before the next throw." },
    ],
    goodWhen:
      "After a single throw the stick springs back near its starting height on its own, in both hands, with a loose grip — you are steering the bounce, not lifting the stick.",
    watchOut:
      "Lifting the stick back up yourself after the hit — that re-adds the exact tension the free stroke removes. If the stick only bounces once and stops flat, your grip is too tight: loosen the fulcrum until the bounce comes back.",
  },

  "d-t0-strokes": {
    what:
      "The four strokes are the same bounce played at four named heights. Full: start high, end high — a loud note that leaves you ready for another loud one. Down: start high, end low — a loud accent that stops low so the next note can be quiet. Tap: start low, end low — a quiet note. Up: start low, end high — a quiet note that lifts the stick, getting you ready for the next accent. Loud versus soft is really just how high the stick starts.",
    why:
      "Every rhythm, accent, and groove you will ever play is these four strokes in some order. Once your hands know all four, playing a loud note and then a quiet one cleanly stops being a mystery — you just pick the right stroke for what comes next.",
    steps: [
      { do: "Full stroke: throw from high and let it rebound back up to high — a confident, loud free stroke.", feel: "the same bounce you already trust from rebound practice" },
      { do: "Down stroke: throw from high, but squeeze the back fingers gently closed at the bottom so the stick stops low.", feel: "a deliberate catch at the very bottom of the stroke" },
      { do: "Tap: a small quiet stroke, low to low.", feel: "barely lifting off the pad" },
      { do: "Up stroke: start low and lift the stick to high on the way up — a quiet note that leaves you set for the next accent.", feel: "preparation, not really a hit" },
      { do: "Loop them slowly — full, down, tap, up — and keep your right and left hands matched." },
    ],
    goodWhen:
      "You can loop full, down, tap, up at a slow tempo with clearly different heights, and the quiet note right after a loud accent is actually quiet — proof the down stroke caught the stick low.",
    watchOut:
      "Playing every note the same size. The tell: your accents 'bleed' — the note right after a loud hit is still loud. That means the down stroke rebounded instead of stopping low, so catch it with the back fingers. While drilling, exaggerate loud versus soft hard; you can make it subtle later.",
  },

  "d-t0-click": {
    what:
      "A metronome — the click — ticks a steady beat for you to play along to. Here you play just one hand, one hit on each tick (the main beats, counted '1, 2, 3, 4'), saying the count out loud, so your timing has something solid to lock onto.",
    why:
      "A steady beat is the floor every rhythm sits on — lose it and nothing else lines up. Building the lock with one hand first means you are learning pure timing on its own, not tangled up with a tricky sticking pattern at the same time.",
    steps: [
      { do: "Set the click to a comfortable tempo, around 60 to 80 BPM.", feel: "slow enough that landing on every tick feels easy" },
      { do: "Play one hand, one hit exactly on each tick, and count '1, 2, 3, 4' out loud.", feel: "your hit and the click land as one single sound, not two" },
      { do: "When it feels locked, stop playing but keep counting in your head — then drop back in exactly on beat 1.", feel: "you never actually lost the beat" },
      { do: "Switch hands and do the same, so neither hand owns the timing." },
    ],
    goodWhen:
      "You can stay glued to the click for a full minute without drifting, and you can drop out and re-enter cleanly on beat 1.",
    watchOut:
      "Rushing — creeping ahead of the click as you get comfortable. If your hit lands a hair before each tick, you are rushing; aim to bury the click so you hear one sound, not two.",
    song: { name: "We Will Rock You — Queen", note: "stomp, stomp, clap on a rock-solid steady beat — the exact pulse you are locking to here." },
  },
};
