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

  // ── Tier 1 ────────────────────────────────────────────────────────────────
  "d-t1-singles": {
    what:
      "The single stroke roll is the simplest rudiment: you alternate hands — right, left, right, left — one hit each. A rudiment is just a short, named sticking pattern, and this is the one every other pattern is built from.",
    why:
      "Almost everything you will ever play breaks down into single strokes: every fast hand pattern, every run around the drums, every other rudiment. Get your two hands sounding identical here and the foundation for all of it is laid.",
    steps: [
      { do: "Throw relaxed free strokes, alternating right and left to the click, one hit per beat to start.", feel: "the same trusted bounce, just handed back and forth between hands" },
      { do: "Keep both hands matched — same height, same volume, same spacing.", feel: "if you closed your eyes you could not tell which hand just played" },
      { do: "Start slow, around 60 BPM, and only nudge up 5 BPM at a time once it is genuinely even.", feel: "clean first, faster second — never the other way around" },
      { do: "Spend a round leading with your left hand too, since real fills start on either hand." },
    ],
    goodWhen:
      "Right and left are indistinguishable in tone and volume from 60 up toward 120 BPM, and you are just as comfortable starting on your left hand.",
    watchOut:
      "As the tempo climbs the hands drift uneven and the forearms tense up. Speed comes from letting the fingers help and staying loose, not from muscling harder — if one hand is louder, slow down until they match again.",
    song: { name: "Wipe Out — The Surfaris", note: "that runaway drum break is a flat-out single stroke roll — right, left, right, left, as fast as it stays even." },
  },

  "d-t1-counting": {
    what:
      "Counting out loud is saying where you are in the beat as you play: '1, 2, 3, 4' for the main beats, then '1 & 2 & 3 & 4 &' once you split each beat in half. Splitting a beat like that is called a subdivision — the '&' is the exact middle of the beat. Every note value also has a matching rest: a beat you deliberately leave silent.",
    why:
      "Once you can count and read the beat, every pattern you meet from here is something you can decode instead of just copy by ear — and honest timing starts with knowing exactly where each note sits.",
    steps: [
      { do: "Read the grid one column at a time: the count row sits at the bottom, the hits above it.", feel: "left to right, one cell at a time, like reading words" },
      { do: "Play the main beats and say '1, 2, 3, 4' out loud as you hit them.", feel: "your voice and your hand landing together" },
      { do: "Now split each beat: add the '&' halfway between, playing and saying '1 & 2 & 3 & 4 &'.", feel: "two even halves per beat, the '&' exactly in the middle" },
      { do: "Practice a rest — leave one beat silent on purpose while you keep counting through it.", feel: "the silence is part of the rhythm, not a mistake" },
    ],
    goodWhen:
      "You can sight-read a short, unseen line of quarter and eighth notes at a set tempo, counting out loud, with at most a stumble or two.",
    watchOut:
      "Rushing the eighth notes because they feel busier than the main beats. Keep saying the '&' evenly so the two halves of each beat stay the exact same size.",
    song: { name: "Seven Nation Army — The White Stripes", note: "the drums are pure countable pulse — say '1, 2, 3, 4' under that riff and you are already reading it." },
  },

  "d-t1-doubles": {
    what:
      "The double stroke roll is R R L L — two strokes per hand before switching. The trick is that the second stroke is not a fresh throw: you let the stick rebound off the pad once and catch that bounce with your fingers, so one motion gives you two even notes.",
    why:
      "Doubles are the engine behind fast fills, rolls, and quiet ghost notes. They are strictly harder than singles because one hand motion has to produce two matched strokes — which is exactly why they come after single strokes, not alongside them.",
    steps: [
      { do: "Stage one: play the doubles all from the wrist, no bounce, to build control.", feel: "two deliberate strokes per hand, a little effortful — that is fine here" },
      { do: "Stage two: throw once and let the pad give you the second stroke, guiding it with the fingers.", feel: "the second note falls out of the rebound almost for free" },
      { do: "Blend the two: enough wrist to stay even, enough bounce to stay relaxed.", feel: "'buh-buh buh-buh' — four even notes, not two loud and two soft" },
      { do: "Hold a slow, even tempo until both hands' doubles sound identical, then climb." },
    ],
    goodWhen:
      "R R L L sounds like two identical strokes per hand — an even 'buh-buh buh-buh', never 'bum-BUM' — clean at 80 to 100 BPM.",
    watchOut:
      "The second stroke of each hand coming out weaker (your fingers are choking the bounce), or muscling both notes purely from the wrist so you tire fast. Let the rebound do half the work.",
  },

  "d-t1-accents": {
    what:
      "An accent is one note played measurably louder than the notes around it, marked with a '>' wedge above it. Here you play a stream of quiet taps with a single accent, using the four strokes: a down stroke for the accent (loud, then stops low), taps for the quiet notes.",
    why:
      "An accent placed exactly where you want it is the whole basis of groove and feel. Without accent control every pattern comes out flat and mechanical — with it, dry taps turn into something that actually sounds like music.",
    steps: [
      { do: "Play a steady stream of quiet, even taps, low to the pad.", feel: "soft and level, no note louder than another" },
      { do: "Add one loud accent on beat 1 with a down stroke that stops low.", feel: "a deliberate catch at the bottom so the next note can stay quiet" },
      { do: "Keep every tap after the accent the same soft volume as before.", feel: "only the accent is loud — the taps never creep up" },
      { do: "Move the accent to a different beat each time through, so it walks through the bar." },
    ],
    goodWhen:
      "The accent clearly tops the taps, the taps never get louder, and you can relocate the accent to any beat in the bar without the quiet notes changing.",
    watchOut:
      "The accent 'bleeds' — the note right after a loud one is still loud, because the down stroke rebounded instead of stopping low. While drilling, exaggerate loud-versus-soft hard; you can make it subtle later.",
    song: { name: "Billie Jean — Michael Jackson", note: "that rock-solid snare on beats 2 and 4 is accent placement — the loud note landing in exactly the same spot every bar." },
  },

  // ── Tier 2 ────────────────────────────────────────────────────────────────
  "d-t2-16ths": {
    what:
      "Sixteenth notes split each beat into four instead of two, counted '1 e & a 2 e & a…'. That is twice as dense as eighth notes — the faster subdivision most real drum parts live in.",
    why:
      "Once you can count and play sixteenths evenly, real grooves and fills open up: the busy hand patterns, the driving verse feels, the quick runs are all built on this subdivision.",
    steps: [
      { do: "Count '1 e & a' out loud slowly before you play a note.", feel: "four even syllables squeezed into one beat" },
      { do: "Play single strokes, one hit per syllable, right and left alternating.", feel: "the same single stroke roll, just four notes per beat now" },
      { do: "Keep the four notes of each beat perfectly even — no squeezing the 'e' and 'a'.", feel: "all four the same size, like four equal steps" },
      { do: "Climb from around 70 toward 90 BPM only once each beat stays clean." },
    ],
    goodWhen:
      "You can count and play a sixteenth-note line evenly at 70 to 90 BPM, with each beat's four notes the same size.",
    watchOut:
      "The 'e' and 'a' get rushed so the beat sounds lumpy instead of even. Slow right down and make all four sixteenths of each beat equal before you add speed.",
    song: { name: "Fifty Ways to Leave Your Lover — Paul Simon", note: "the verse groove rides a steady stream of sixteenth notes — the exact subdivision you are drilling here." },
  },

  "d-t2-paradiddle": {
    what:
      "The single paradiddle is R L R R, L R L L: a single, a single, then a double, with the lead hand switching each time through. It fuses the single stroke roll and the double stroke roll into one repeating pattern.",
    why:
      "It is the most-used sticking in drumming. That doubled note lets you 'reset' a hand, which is what makes it possible to move a fill around the drums later in ways pure singles or pure doubles cannot.",
    steps: [
      { do: "Play it slow with a loud accent on the first note of each group: R L R R, L R L L.", feel: "the accent marks where each half of the pattern starts" },
      { do: "Keep the internal double even — never let it rush ahead of the two singles.", feel: "all four notes the same spacing, the double just a repeated hand" },
      { do: "Once the sticking is automatic, drop the accent and play it smooth and even.", feel: "a flat, even stream where the hands quietly swap lead" },
      { do: "Drill it starting on the left hand too — real fills often need a left lead." },
    ],
    goodWhen:
      "It loops continuously at 100 to 120 BPM without the double rushing or the accent hand tensing, and it is equally clean starting on either hand.",
    watchOut:
      "The two accented downbeats not matching hand to hand, and the double speeding up relative to the singles. Slow down until both leads sound identical.",
    song: { name: "Rosanna — Toto", note: "Jeff Porcaro's legendary half-time shuffle is built on paradiddle stickings — this is the pattern underneath it." },
  },

  "d-t2-flam": {
    what:
      "A flam is a soft grace note played a hair before a louder main note from the opposite hand — so close that you hear one thick note, not two separate hits. It is written as a small note tucked just before the main one.",
    why:
      "Flams add weight. Dropping a flam on the snare on beat 2 or 4 is the textbook way to make a plain backbeat hit harder and sound fuller.",
    steps: [
      { do: "Set the grace-note hand low (about an inch off the pad) and the main hand high.", feel: "two different starting heights — that stagger is the whole flam" },
      { do: "Drop both together, the low grace note landing a fraction before the high main note.", feel: "one thick 'thd', not a clean 'ta-ta'" },
      { do: "Isolate the grace note first — practice just the soft note — then add the accent.", feel: "soft note quiet and controlled before the loud one joins it" },
      { do: "Alternate which hand leads, so both directions are equally tight." },
    ],
    goodWhen:
      "The flam stays tight and thick at 100 to 110 BPM, the grace-and-main heard as one note, and both lead hands sound the same.",
    watchOut:
      "Two failure modes: 'too wide' (you hear two separate hits) or 'flat' (both land at exactly the same instant, so there is no thickness). Both come from starting the two sticks at the same height — stagger them.",
  },

  "d-t2-five-stroke": {
    what:
      "The five stroke roll is two doubles capped by a single accent: R R L L R, or L L R R L. A short, counted roll that resolves into one clear loud hit.",
    why:
      "It is the classic 'roll into a hit' shape you hear constantly — a quick roll building into an accent that ends a fill or sets up a crash.",
    steps: [
      { do: "Play the two doubles clean and even first, as a short double stroke roll.", feel: "four matched notes, R R L L" },
      { do: "Add the fifth note as a loud accent that clearly tops the roll.", feel: "the roll leans forward into that last hit" },
      { do: "Keep it un-buzzed — five distinct notes, not a smear.", feel: "you can count all five" },
      { do: "Drill both the right-lead and the left-lead versions." },
    ],
    goodWhen:
      "A clean, non-buzzing five stroke roll with the final note clearly the loudest of the five, at 100 to 120 BPM.",
    watchOut:
      "The final accent coming out weaker than the two doubles before it, so the roll never 'lands'. The whole point is that last note being the loudest in the phrase.",
  },

  "d-t2-play-along": {
    what:
      "Playing along is putting on a real song and playing its groove's sticking on the pad, in time with the track. The pad makes just one sound, so you are matching the timing, the subdivision, and the accents — not the drum voices.",
    why:
      "This is where dry drills turn into music you can feel, and it is the single biggest thing that keeps practice fun and keeps you coming back. Ending a session here — on something you enjoy — is why you show up tomorrow.",
    steps: [
      { do: "Pick a song with a simple, steady groove.", feel: "slow and locked beats flashy every time" },
      { do: "Find its subdivision — steady eighths or sixteenths — and tap that on the pad in time.", feel: "riding the pulse of the track, not fighting it" },
      { do: "Add the backbeat accents where the snare would land.", feel: "the loud notes falling exactly with the song's snare" },
      { do: "Play a whole section without dropping the beat — and end your session on it." },
    ],
    goodWhen:
      "You can play a song section's groove in time, with its accents, all the way through without losing the beat.",
    watchOut:
      "Chasing a song that is too fast or too busy. Start with a slow, simple groove — the win is staying locked in, not playing something impressive.",
    song: { name: "Back in Black — AC/DC", note: "Phil Rudd's groove is famously simple and rock-steady — the perfect first thing to lock onto on the pad." },
  },

  // ── Tier 3 ────────────────────────────────────────────────────────────────
  "d-t3-drag": {
    what:
      "The drag — also called a ruff — is two quick soft grace notes on one hand leading straight into a loud note on the other: a tiny 'brrp' just before the main hit. It is like a flam with two grace notes instead of one.",
    why:
      "The drag is tucked inside a dozen other patterns, so getting it clean now makes all of them mostly free. On its own it is the classic soft pickup into a fill or an accented backbeat.",
    steps: [
      { do: "Play the two grace notes as a quiet, controlled double on one hand.", feel: "the same bounce control as the double stroke roll, just softer and quicker" },
      { do: "Attach a loud tap on the other hand immediately after the two grace notes.", feel: "the soft double flowing straight into the accent" },
      { do: "Keep the grace notes soft and blurred — one little rip of sound, not two clear hits.", feel: "a 'brrp', not a 'tap-tap'" },
      { do: "Swap the lead hand every few reps so both directions are reliable." },
    ],
    goodWhen:
      "The drag lands clean as an eighth-note pickup at about 100 BPM, the two grace notes a soft blur into the accented note.",
    watchOut:
      "The grace notes coming out too loud or too separated, so it sounds like three clear notes instead of one ornament. Control of the quiet double is the whole game.",
  },

  "d-t3-paradiddle-family": {
    what:
      "The paradiddle family extends the single paradiddle into bigger stickings. The main one is the double paradiddle: R L R L R R, L R L R L L — four singles then a double, six notes per group.",
    why:
      "The six-note grouping lands a backbeat on a reliable hand every single cycle, which is exactly what shuffle feels, 6/8 grooves, and triplet-based fills need.",
    steps: [
      { do: "Count the six notes out loud until the extra pair of singles stops feeling foreign.", feel: "one-two-three-four-five-six, evenly" },
      { do: "Keep the front four singles even and the ending double clean.", feel: "six equal notes, only the sticking changing" },
      { do: "Land the accent on the same hand at the start of each group.", feel: "a dependable pulse you could set a backbeat on" },
      { do: "Drill leading with both hands, since the whole value is a reliable landing hand." },
    ],
    goodWhen:
      "Even execution at 90 to 100 BPM, landing the accent on the same hand every group without slipping back into a single paradiddle.",
    watchOut:
      "Defaulting back into a single-paradiddle feel and dropping the extra pair of singles. Count the six out loud against the beat until it locks.",
  },

  "d-t3-moeller": {
    what:
      "The whip stroke — the Moeller motion — chains a down stroke, a rebound tap, and an up stroke into one relaxed whip of the arm: one flowing motion that produces several notes, using gravity instead of muscle.",
    why:
      "It is how drummers get real speed and power for almost no effort. It comes late on purpose, because it is literally the four strokes and accents you already own joined into one motion — try it before those are automatic and you just get uncontrolled flailing.",
    steps: [
      { do: "Start with a slow accent-tap-tap group, no rush.", feel: "loud, soft, soft — three notes in one relaxed sweep" },
      { do: "Let the down stroke's rebound feed the tap, and the up stroke lift you to set up the next accent.", feel: "the arm whipping, the notes falling out of the motion" },
      { do: "Keep the wrist and arm loose — never force the whip.", feel: "relaxed and heavy, like cracking a towel, not stiff" },
      { do: "Stay slow and controlled — a clean triplet with no extra unwanted bounces." },
    ],
    goodWhen:
      "You can execute a controlled accent-tap-tap whip at a slow tempo, loose in the wrist and arm, with no extra unwanted bounces.",
    watchOut:
      "Leaning on the whip's efficiency before your basic strokes are automatic, which bakes in bad habits fast. Keep it slow and controlled until the motion is genuinely relaxed.",
  },

  "d-t3-speed": {
    what:
      "Open–close–open is a safe way to build speed: take a rudiment you already own, start slow ('open'), speed up evenly to your personal fastest ('close'), then slow back down the same way ('open').",
    why:
      "Speed is a multiplier you apply to already-clean technique, never a substitute for it. Force tempo onto a sloppy stroke and you just bake in tension you will have to un-learn later.",
    steps: [
      { do: "Pick a rudiment you can already play clean — single strokes, doubles, or the paradiddle.", feel: "solid before fast, always" },
      { do: "Start around 60 BPM and accelerate smoothly and evenly, not in jumps.", feel: "a gradual gliding climb, not sudden gear-changes" },
      { do: "Reach your max, then decelerate symmetrically all the way back down.", feel: "the same climb played in reverse" },
      { do: "Stop the instant the pattern breaks down — that ragged edge is your honest ceiling today." },
    ],
    goodWhen:
      "You can run the whole arc — slow up to your personal max and symmetrically back down — without the pattern falling apart at the top.",
    watchOut:
      "Gripping harder as you speed up, which is the exact opposite of what works: fast playing needs more relaxation, not more squeeze. Back off the moment it gets tense.",
  },

  "d-t3-buzz": {
    what:
      "The buzz roll — also the press or multiple-bounce roll — is a smooth sustained sound. You press each stroke lightly into the pad so the stick buzzes many times, alternating hands, and the buzzes blur into one continuous texture.",
    why:
      "It is the sound behind crescendos, swells, and soft builds. It is a control-and-dynamics skill, not a speed one — the goal is an even buzz you can make louder or softer at will.",
    steps: [
      { do: "Press one stick into the pad and listen for an even, sustained buzz.", feel: "light steady pressure, the stick buzzing many times per stroke" },
      { do: "Do the same with the other hand until both buzzes sound the same.", feel: "matched, even, no dead spots" },
      { do: "Alternate hands so each buzz overlaps into one smooth continuous sound.", feel: "no seams between the hands — one unbroken texture" },
      { do: "Practice growing from soft to loud and back, keeping the buzz even throughout." },
    ],
    goodWhen:
      "A sustained, even buzz you can crescendo from soft to loud and back over several counts, with no gaps or dead spots and no change in the hand alternation.",
    watchOut:
      "Over-pressing (it chokes into a dead thud) or under-pressing (it sounds like a clean double stroke roll instead of a buzz). Aim for a steady, even buzz at every volume.",
  },
};
