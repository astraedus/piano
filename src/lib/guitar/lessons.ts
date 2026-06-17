// Guitar teaching content. Record<nodeId, NodeLesson> — the real lesson behind
// each skill-tree node (the one-line masteryDrill is only the success target).
//
// VOICE: capitalized, functional, warm, soul-first. Lead with the feeling and the
// payoff, then teach the how in plain steps. Use real term words ("power chord",
// "minor pentatonic") so the glossary auto-chips them — never explain a term inline
// that the glossary already covers. No em-dashes (use periods/commas). No fake
// hype. Every lesson must make a total beginner able to actually DO the thing.
//
// node ids must match GUITAR_NODES in skillNodes.ts. Coverage is asserted in tests.

import type { NodeLesson } from "../types";

export const GUITAR_LESSONS: Record<string, NodeLesson> = {
  // ── Gold-standard examples (the quality bar for the rest) ──────────────────
  "g-t0-anatomy": {
    what: "Your guitar has six strings. From the thickest (closest to the ceiling) to the thinnest, they are E, A, D, G, B, E. Tuning means setting each one to its correct pitch so the instrument sounds right under your fingers.",
    why: "An out-of-tune guitar teaches your ears the wrong thing and makes everything you play sound bad even when your hands are perfect. Tuning is the one ritual that comes before every session. Two minutes here saves every other minute you practice.",
    steps: [
      { do: "Say the string names out loud, thickest to thinnest: E, A, D, G, B, E.", feel: "A memory hook: Eddie Ate Dynamite, Good Bye Eddie." },
      { do: "Open a free tuner app (or a clip-on tuner) and pluck the thickest string. Turn its tuning peg until the tuner reads E.", feel: "Turn slowly. Sharp means too high, flat means too low." },
      { do: "Work across all six strings: E, A, D, G, B, E. Pluck, watch the needle, adjust.", feel: "The needle should settle dead center and stay." },
      { do: "Pluck each open string one more time and just listen to it ring.", feel: "A tuned guitar has a clean, settled sound. Learn what that sounds like." },
    ],
    goodWhen: "You can name all six strings without thinking, and tune the guitar from cold in under 90 seconds.",
    watchOut: "Tuning pegs are sensitive. Make small turns and re-pluck constantly. Big turns snap strings.",
    song: { name: "Any song", note: "Nothing sounds right until you do this first. It is the gate to everything." },
  },

  "g-t1-power": {
    what: "A power chord is just two notes (sometimes three) played together that sound huge, thick, and a little angry. It is the backbone of rock, punk, and metal. The magic: it is one shape you can slide anywhere on the neck to get any power chord.",
    why: "Learn this one shape and you can play the rhythm part of literally thousands of rock songs. Power chords are easier than full chords (only two fingers) and they sound massive with distortion. This is the single highest-payoff shape on the guitar.",
    steps: [
      { do: "Put your first finger on the thick E string, 3rd fret. That is your root note, G.", feel: "Press just behind the fret, not on top of it." },
      { do: "Add your third finger two frets up, on the A string, 5th fret.", feel: "Your fingers make a small box shape." },
      { do: "Strum only those two strings. Mute the rest by leaning your fingers against them.", feel: "Big and clean, no thin extra strings ringing." },
      { do: "Now slide the whole shape up two frets and strum again. You just played a different power chord without learning anything new.", feel: "Same shape, new home. That is the whole trick." },
      { do: "Practice moving E5 to A5 to D5 to G5, two beats each, slow.", feel: "Smooth jumps, no buzzing between chords." },
    ],
    goodWhen: "You can move the shape between E5, A5, D5, and G5 at 80bpm with both notes ringing clean and no stray strings.",
    watchOut: "The most common buzz comes from not pressing hard enough with the third finger. Push from the fingertip and keep the thumb behind the neck.",
    song: { name: "Smells Like Teen Spirit (Nirvana)", note: "The whole riff is four power chords moved around. You are minutes away from playing it." },
  },

  "g-t0-posture": {
    "what": "This is how you hold the guitar and the pick so it works WITH your body instead of fighting it. It feels boring for about a week, then it disappears, and everything you ever play afterward is easier because of it. Bad posture is the silent reason most beginners quit with sore wrists and buzzy notes.",
    "why": "Get this right once and it pays off in every single note you play for the rest of your life. A relaxed wrist lets you fret faster and longer without pain, and a good pick grip is the difference between a thin, slippy sound and a confident attack. This is the unglamorous foundation that makes the fun stuff possible.",
    "steps": [
      {
        "do": "Sit upright on the edge of a chair, feet flat. Rest the curve of the guitar on your right leg, body pulled gently back against your chest.",
        "feel": "The guitar should stay put even if you let go with both hands."
      },
      {
        "do": "Put your left thumb flat on the BACK of the neck, roughly behind your first finger. Not wrapped over the top.",
        "feel": "Like a soft clamp. Thumb and fingers gently squeeze the neck between them."
      },
      {
        "do": "Let your left wrist relax and drop slightly forward, so your fingers can curl down onto the strings from above.",
        "feel": "No sharp bend. A bent wrist is the number one source of pain. Keep it loose and almost straight."
      },
      {
        "do": "Hold the pick: lay it flat on the side of your curled first finger, press your thumb on top. Only a few millimeters of tip sticks out.",
        "feel": "Firm enough that it does not fly out, loose enough that it could be plucked from your hand."
      },
      {
        "do": "Tilt the pick to about 45 degrees against the strings, not flat-on. Run a slow body check head to toe: shoulders down, neck loose, thumb behind, wrist relaxed.",
        "feel": "Tilted pick glides across the string instead of slapping it."
      }
    ],
    "goodWhen": "You can sit for 30 seconds in playing position with relaxed shoulders, thumb behind the neck, a near-straight wrist, and the pick held at 45 degrees, all without thinking or tensing up.",
    "watchOut": "The number one mistake is wrapping the thumb over the top of the neck like gripping a baseball bat. It locks your wrist and kills your reach. Fix: slide the thumb to the flat back of the neck and feel your fingers suddenly free up.",
    "song": {
      "name": "Wish You Were Here (Pink Floyd)",
      "note": "A slow, relaxed acoustic intro that is impossible to play well with a tense wrist. Nailing posture first is what makes it sound calm instead of cramped."
    }
  },

  "g-t0-tab": {
    "what": "Tab is the secret map guitarists actually use instead of sheet music. Six lines stand for the six strings, and numbers tell you exactly which fret to press. Once you can read it, the entire internet of free song tabs opens up to you, and you never need to know a single thing about a staff.",
    "why": "This is the skill that turns you from someone who watches lessons into someone who teaches themselves any song. Learn to read tab and you can pull up the riff to almost any rock song ever written and decode it on your own, for free, forever. It is the single most empowering thing a beginner can learn before even playing.",
    "steps": [
      {
        "do": "Look at the six horizontal lines. The bottom line is your thickest string (low E). The top line is your thinnest string (high E). Yes, it is upside-down from how it looks when you look down at the guitar.",
        "feel": "Bottom line = fattest, lowest-sounding string. Top line = skinniest, highest."
      },
      {
        "do": "Read a number on a line as one instruction: press THAT string at THAT fret and play it. A 0 means play the open-string with no finger pressing.",
        "feel": "Number tells you the fret, line tells you the string. That is the whole code."
      },
      {
        "do": "Read left to right, in time, like words on a page. Numbers stacked vertically mean play those strings together at once.",
        "feel": "Stacked = strum together. Spread out = one after another."
      },
      {
        "do": "Now read the Seven Nation Army riff out loud by fret number only, no guitar: 7, 7, 10, 7, 5, 3, 2. All on the A string, the second-thickest string.",
        "feel": "Say the numbers in rhythm. You are sight-reading a famous riff already."
      },
      {
        "do": "Point at each number as you say it and remind yourself it sits on the A string. Do not play yet. Just prove you can decode the map.",
        "feel": "When the numbers turn into a tune in your head, you can read tab."
      }
    ],
    "goodWhen": "You can look at the Seven Nation Army tab and call out every fret number in order, knowing each one sits on the A string, without touching the guitar.",
    "watchOut": "The number one mistake is reading the lines upside down, thinking the top line is the low E. It is the opposite. Fix: remember the lines match the strings as they SOUND, thinnest string on top, so the top line is the high, thin E.",
    "song": {
      "name": "Seven Nation Army (The White Stripes)",
      "note": "The most famous beginner riff in the world, and the entire main line lives on one string (the A string) as a short row of fret numbers. Reading its tab is your first real win."
    }
  },

  "g-t1-fretting": {
    "what": "This is the move that makes a note ring out clean and clear instead of buzzing or thudding. It is all about pressing with the very tip of your finger, right behind the metal fret, with just enough force. Get this and the guitar finally starts sounding like a guitar.",
    "why": "Clean fretting is the skill underneath every chord, every riff, every solo you will ever play. Without it, even simple things sound buzzy and discouraging. With it, you sound good immediately, and that good sound is what keeps you practicing. This is where the guitar stops fighting you.",
    "steps": [
      {
        "do": "Curl your first finger and press the thin high E string at the 1st fret using only the hard tip, like you are pointing at the floor.",
        "feel": "Fingertip, not the flat pad. The pad mutes neighbor strings."
      },
      {
        "do": "Press just BEHIND the fret wire, on the side closer to the body, never directly on top of the metal.",
        "feel": "Right behind the fret needs the least pressure for the cleanest tone."
      },
      {
        "do": "Pick that string. Adjust pressure until it rings clear with no buzz. Press only as hard as you need, no harder.",
        "feel": "Too soft buzzes, too hard tires you out. Find the lightest touch that rings clean."
      },
      {
        "do": "Keep your knuckles arched so the rest of your fingers float clear of the other strings.",
        "feel": "A tall arch means each finger lands on its own string and chokes nothing else."
      },
      {
        "do": "Walk one finger up the same string, frets 1 through 5, picking each. Then do all six strings the same way.",
        "feel": "Every single one should ring like a bell, tip-pressed, right behind the fret."
      }
    ],
    "goodWhen": "You can fret every string at frets 1 through 5 using only your fingertip and have each note ring clean with zero buzz and zero muted neighbors.",
    "watchOut": "The number one cause of buzz is pressing with the flat pad of the finger or pressing in the middle of the fret space. Fix: stand the finger up on its tip and move your press closer to the fret wire ahead of it.",
    "song": {
      "name": "Nothing Else Matters (Metallica)",
      "note": "The gentle fingerpicked intro exposes every buzzy or muted note. Clean single-note fretting is exactly what makes it sound beautiful instead of messy."
    }
  },

  "g-t1-downpick": {
    "what": "Down-picking is hitting the string with a single, controlled downward stroke of the pick, over and over, dead even. It sounds simple, and it is, but its steadiness is the heartbeat under aggressive rock and punk and metal rhythm. This is where you build your timing and your attack.",
    "why": "A clean, even downstroke is the engine of tight rhythm playing. Master it and your riffs sound powerful and locked-in instead of sloppy and lopsided. Down-picking also builds the right-hand control and stamina that everything else, strumming, riffing, soloing, is built on top of.",
    "steps": [
      {
        "do": "Rest the pick lightly on the thick open E string, tip pointed slightly down toward the floor.",
        "feel": "Pick already touching the string before you move. No winding up."
      },
      {
        "do": "Push straight down through the string in one short motion, then let your hand settle ready for the next.",
        "feel": "The motion comes from a small wrist flick, not a big arm swing."
      },
      {
        "do": "Set a steady 60bpm beat. Play one downstroke on every single click of the open E string.",
        "feel": "Pick lands exactly on the beat, every time. Lock to the metronome."
      },
      {
        "do": "Listen closely and match the VOLUME of every stroke. No loud ones, no quiet ones.",
        "feel": "Even loudness is the real skill. It means your hand is in control."
      },
      {
        "do": "Keep it going for one full minute without stopping or drifting off the beat.",
        "feel": "Relaxed and even. If your forearm burns, you are using too much arm. Use the wrist."
      }
    ],
    "goodWhen": "You can play steady downstrokes on the open E string at 60bpm for a full minute, every stroke landing on the beat at the same even volume.",
    "watchOut": "The number one mistake is digging too deep and swinging from the whole arm, which makes the volume jump around and tires you fast. Fix: barely catch the string, flick from the wrist, and aim for control over force.",
    "song": {
      "name": "Iron Man (Black Sabbath)",
      "note": "That famous heavy main riff is driven by slow, deliberate downstrokes. Even, controlled down-picking is literally the sound of the song."
    }
  },

  "g-t1-altpick": {
    "what": "Alternate picking is down, up, down, up, letting the pick hit the string on the way back instead of resetting every time. It feels weird for a day, then it doubles your speed and smooths everything out. This is how you play fast lines without your hand falling apart.",
    "why": "Alternate picking is the key that unlocks fast scales, runs, and solos. By using the upstroke instead of wasting it, your hand does half the work for the same notes. Every guitarist who plays anything quick lives on this motion. Learn it now and speed stops being scary later.",
    "steps": [
      {
        "do": "Start on the thick low E string. Press fret 1 with your first finger and pick it with a DOWN stroke.",
        "feel": "Plain downstroke to begin. Nothing new yet."
      },
      {
        "do": "Press fret 2 with your second finger and pick it with an UP stroke, catching the string on the way back.",
        "feel": "The pick brushes up through the string. Do not lift and reset, just reverse."
      },
      {
        "do": "Fret 3 with your third finger, down. Fret 4 with your fourth finger, up. So the pattern is down-up-down-up.",
        "feel": "One finger per fret, strict down-up-down-up. Let it become automatic."
      },
      {
        "do": "Set 80bpm and play 1-2-3-4 on the low E string, one note per click, strictly alternating.",
        "feel": "Down on the odd clicks, up on the even ones. Lock the pick to the beat."
      },
      {
        "do": "Without breaking the down-up pattern, move 1-2-3-4 up to the A string, then D, all the way to the thin high E, then come back down.",
        "feel": "Keep the alternation unbroken even when crossing to a new string. That crossing is the whole point."
      }
    ],
    "goodWhen": "You can play the 1-2-3-4 chromatic pattern across all six strings and back at 80bpm with strict down-up-down-up picking, every note clean and on the beat.",
    "watchOut": "The number one mistake is sneaking in two downstrokes in a row when changing strings, which breaks the whole efficiency. Fix: slow down and say down-up out loud, never letting the same stroke happen twice no matter what string you land on.",
    "song": {
      "name": "Eye of the Tiger (Survivor)",
      "note": "That driving main riff is pure down-up-down-up alternate picking from start to finish. The 1-2-3-4 drill is the exact motion that gets you playing lines like that."
    }
  },

  "g-t1-openEM": {
    "what": "Em, Am, E, and A are the four open chords that carry the moody, emotional side of the guitar. They use open strings ringing out behind your fingers, so they sound full and rich with very little effort. Em and Am are the two saddest, most beautiful shapes a beginner can make, and they live in almost every campfire and pop song.",
    "why": "These four chords unlock dozens of real songs in the keys of E minor and A minor. Em and Am are the easiest chords on the whole instrument, and E and A are just one finger away from them. Learn this cluster and you can sit down and actually accompany yourself singing.",
    "steps": [
      {
        "do": "Em: put your second finger on the A string (5th string), 2nd fret, and your third finger on the D string (4th string), 2nd fret. Strum all six strings.",
        "feel": "Dark and full. Two fingers, everything rings."
      },
      {
        "do": "Am: keep those two fingers but slide them up one string each (D string 2nd fret, G string 2nd fret), then add your first finger on the B string, 1st fret. Strum from the A string down, skip the thick E.",
        "feel": "Sad and sweet. The most useful minor chord on the guitar."
      },
      {
        "do": "E: take your Em shape and add your first finger on the G string (3rd string), 1st fret. Strum all six.",
        "feel": "Em with one finger added flips sad to bright."
      },
      {
        "do": "A: put first, second, third fingers all in a row on the D, G, B strings, all at the 2nd fret. Strum from the A string down.",
        "feel": "Three fingers squeezed into one fret. Bright and open."
      },
      {
        "do": "Switch Em to Am over and over, slow, four strums each, checking every string rings clean.",
        "feel": "Fingers learn the tiny jump. No string should buzz or thud."
      }
    ],
    "goodWhen": "In one minute you can change between Em and Am at least 30 times, and between E and A at least 30 times, with every fretted note and open-string ringing clean.",
    "watchOut": "The #1 killer is a finger lying flat and deadening the string next to it. Curl every finger so you press with the very tip, and keep your thumb low behind the neck so your fingers stand tall.",
    "song": {
      "name": "Horse with No Name (America)",
      "note": "The entire song is just two chords, Em and a simple second shape, strummed gently. You will basically know it after this node."
    }
  },

  "g-trans-G-C": {
    "what": "This is a timed change drill, not a new shape. You already know G and C. The job is to switch BETWEEN them, cleanly and in time, for one minute, counting every clean change. G to C is the change almost every beginner stalls on, because both shapes need all four fingers to move at once.",
    "why": "A chord you can form but cannot change to in tempo is not yet usable in a song. The song keeps moving while your hand reshapes. Drill G to C to around thirty clean changes a minute and the change starts to run without thinking, which is the exact moment open-chord songs become playable.",
    "steps": [
      { "do": "Form G, then C, slowly. Watch your third finger, which can stay near the same area between the two shapes.", "feel": "Find the lazy path. Move the fewest fingers." },
      { "do": "Start the minute. Switch G to C to G to C, slowly at first, every string ringing on each shape.", "feel": "Clean beats fast. A buzzing change does not count." },
      { "do": "Count every CLEAN change you land, both chords ringing, in time.", "feel": "The rising count is the whole game tonight." },
      { "do": "At the end, note your changes-per-minute. Next session, beat that number.", "feel": "You are only racing yesterday's you." }
    ],
    "goodWhen": "You hit roughly thirty clean G to C changes in a minute without looking, every string ringing.",
    "watchOut": "Do not sacrifice clean for fast. Only count changes where both chords actually ring out. Honest counting is what builds the real change.",
    "song": { "name": "Wonderwall (Oasis)", "note": "Its progression leans on this change; once G to C is in tempo, the song opens up." }
  },

  "g-t1-openDGC": {
    "what": "D, G, and C are the three bright, happy open chords that complete your beginner toolkit. Together with the minor chords you already have, these are the workhorse shapes of folk, pop, and country. C and G are the two chords nearly every singer-songwriter leans on, and D is the sunny one that makes a progression feel like it is lifting off.",
    "why": "Add these three and you have the full open-chord vocabulary. The most common chord progression in popular music, G to C to D, is now entirely in your hands. This is the moment guitar stops being shapes and starts being songs.",
    "steps": [
      {
        "do": "D: first finger on the G string (3rd string), 2nd fret. Second finger on the high E string (1st string), 2nd fret. Third finger on the B string (2nd string), 3rd fret. Strum from the D string down (top four strings only).",
        "feel": "A tight little triangle. Bright and ringing."
      },
      {
        "do": "G: second finger on the thick E string (6th string), 3rd fret. First finger on the A string (5th string), 2nd fret. Third finger on the high E string (1st string), 3rd fret. Strum all six.",
        "feel": "Big and full, your fingers stretched wide across the neck."
      },
      {
        "do": "C: third finger on the A string (5th string), 3rd fret. Second finger on the D string (4th string), 2nd fret. First finger on the B string (2nd string), 1st fret. Strum from the A string down.",
        "feel": "Warm and stacked, fingers climbing diagonally up the neck."
      },
      {
        "do": "Change G to C slowly, four strums each, and notice your third finger can stay near the same area between them.",
        "feel": "Find the lazy path. Move the least number of fingers."
      },
      {
        "do": "Now change D to G repeatedly, watching that the open strings still ring and nothing buzzes.",
        "feel": "A bigger jump. Aim your fingers as a group, not one at a time."
      }
    ],
    "goodWhen": "In one minute you can change between G and C at least 30 times, and between D and G at least 30 times, with all the right strings ringing and the muted strings staying quiet.",
    "watchOut": "On G and C the classic mistake is the strumming hand hitting the thick low strings you meant to skip. For C, start your strum on the A string, not the E string. Let your fretting fingers gently lean against strings you do not want ringing.",
    "song": {
      "name": "Knockin' on Heaven's Door (Bob Dylan)",
      "note": "The whole song cycles through G, D, and C with simple strums. You now hold every chord it needs."
    }
  },

  "g-t1-capo": {
    what: "A capo is a clamp you put across all the strings at one fret. It works like a moveable nut: it raises every open string, so the open shapes you already know sound in a higher key without you changing a single finger. One small bar turns your five open shapes into every key.",
    why: "This is the biggest payoff for the least effort on the whole guitar. You spent weeks learning open chords. The capo lets that handful of shapes play in all twelve keys, so you can match any singer's range and play along with almost any recording. Knowing C, A, G, E, and D shapes plus a capo covers most of the popular song catalog.",
    steps: [
      { do: "Clamp the capo just behind a fret (not on top of it), pressing all six strings evenly.", feel: "Every string should ring clean. If a string buzzes or sounds dead, the capo is crooked or too far from the fret." },
      { do: "Capo on the 2nd fret, then play your G shape exactly as you learned it. Listen: it now sounds A, not G.", feel: "Same fingers, same shape, higher key. The shape did not change, only where it lives." },
      { do: "Still on the 2nd fret, play your C and D shapes too. They now sound D and E.", feel: "Use the chart and the calculator below to read every shape and fret combination." },
      { do: "Use the calculator: pick the key you want and a shape you know, and it tells you which fret to clamp.", feel: "Pick a song that sits a little too high to sing and capo up until it fits your voice." },
      { do: "Run one minute changes between two shapes with the capo on, the same way you drilled open chords.", feel: "Your open-chord fluency carries straight over. The capo costs almost no new motor learning." },
    ],
    goodWhen: "With the capo on the 2nd fret you can play your G, C, and D shapes and correctly name the keys they sound in (A, D, E), and you can use the calculator to find the fret for any target key.",
    watchOut: "Place the capo right behind the fret, not in the middle of the gap, or the strings buzz and pull sharp. Re-check tuning after clamping, since a tight capo can bend strings slightly sharp.",
    song: { name: "Hey There Delilah / most singer-songwriter songs", note: "Countless recordings use a capo so open shapes land in the right key. Capo up and play the open-chord version." },
  },

  "g-t1-strum": {
    "what": "Strumming is the engine that turns chords into music. It is the rhythm of your hand brushing the strings, down and up, that makes a song feel like a song instead of a slideshow of shapes. The pattern down, down-up, up-down-up is the single most common strum in pop and folk, and once your arm knows it, your hand keeps time on its own.",
    "why": "Holding chords is silent until you can strum. This one pattern lets you accompany a huge swath of real songs and sing over the top. It is the difference between knowing chords and playing the guitar.",
    "steps": [
      {
        "do": "Hold an Em. Keep your strumming arm loose and let it swing from the elbow, not the wrist alone, brushing all the strings on every downstroke.",
        "feel": "Relaxed and bouncing, like your arm is gently keeping a beat."
      },
      {
        "do": "Count out loud: 1, 2, 3, 4 at a slow 80bpm. Strum a downstroke on every number, all downs, until it is steady.",
        "feel": "Even and metronomic. Same volume every hit."
      },
      {
        "do": "Now add upstrokes between the beats, brushing only the top few thin strings on the way back up.",
        "feel": "Upstrokes are lighter, a flick, not a full swing."
      },
      {
        "do": "Build the pattern: Down (1), Down-Up (2 and), Up-Down-Up (3 and 4 and). Say it out loud as you do it.",
        "feel": "Your arm never stops moving. Down on the beats, up on the and."
      },
      {
        "do": "Loop the pattern through Em, Am, C, G, one bar each, at 80bpm, for two minutes straight.",
        "feel": "The strum keeps flowing even while your fretting hand jumps chords."
      }
    ],
    "goodWhen": "You can play the D-DU-UDU pattern continuously over Em to Am to C to G at 80bpm for two minutes without the rhythm stumbling when you change chords.",
    "watchOut": "The biggest mistake is freezing the strumming hand every time you change chords, which kills the groove. Keep the arm swinging through the chord change even if you ghost-strum (miss the strings) for a beat. The rhythm must never stop.",
    "song": {
      "name": "Wonderwall (Oasis)",
      "note": "Famous for exactly this kind of steady down-up strum over a small set of chords. Master this pattern and the song falls into place."
    }
  },

  "g-t1-palmmute": {
    "what": "Palm muting is how you make the guitar go from ringing and open to tight, chunky, and percussive. You rest the edge of your strumming hand lightly on the strings near the bridge, choking them just enough to get a muffled chug. It is the sound of nearly every rock and metal verse, the controlled tension before a chorus explodes open.",
    "why": "Palm muting gives your playing dynamics and rhythmic punch. The same power chord can whisper a tight chug or blast wide open, and the contrast between the two is what makes a riff feel alive. This is the skill that makes rhythm guitar sound professional instead of flat.",
    "steps": [
      {
        "do": "Hold an E5 power chord (first finger on the thick E string, root note E; this is your low open-position power shape).",
        "feel": "The big, heavy two-note shape you already know."
      },
      {
        "do": "Find the bridge, where the strings meet the body. Rest the fleshy edge of your picking-hand palm right on the strings there.",
        "feel": "Light contact at the bridge, not crushing, just resting."
      },
      {
        "do": "Down-pick the chord. If it rings fully, slide your palm a hair toward the bridge. If it is a dead thud, slide a hair away.",
        "feel": "Hunt for the chug: muffled but still pitched, like a heartbeat."
      },
      {
        "do": "Play four muted down-picks, then lift your palm off and play four open down-picks. Hear the door swing open.",
        "feel": "Tight and choked, then suddenly huge and ringing."
      },
      {
        "do": "At 80bpm play two bars muted, two bars open, looping, so the contrast is obvious and clean.",
        "feel": "A clear on-off switch between chug and roar."
      }
    ],
    "goodWhen": "At 80bpm you can play two bars of palm-muted E5 followed by two bars of open E5 with a clearly audible difference, the muted part chugging and the open part ringing full.",
    "watchOut": "Beginners park the palm too far up the neck and get a lifeless thud with no note left. Keep the palm right at the bridge so you mute the ring but keep the pitch. It should sound like a muffled note, not a dead click.",
    "song": {
      "name": "Master of Puppets (Metallica)",
      "note": "The main riff is relentless palm-muted down-picking that opens up at the peaks. This node is the exact technique behind it."
    }
  },

  "g-t1-tabrhythm": {
    "what": "Tab tells you WHERE to put your fingers, but on its own it does not tell you the rhythm, the WHEN. Reading tab rhythm means learning to see how long each note lasts and tapping that timing out before you play a single string. It is the skill that lets you learn a song from a piece of paper even if you have never heard it.",
    "why": "Most guitarists hit a wall where they can find the notes but the song still sounds wrong, because they guessed the rhythm. Once you can read note values off tab, you can learn riffs and licks from any tab online accurately, without relying on a recording to copy. You become independent.",
    "steps": [
      {
        "do": "Learn the four core note values: a whole note lasts 4 counts, a half note 2 counts, a quarter note 1 count, an eighth note half a count.",
        "feel": "Each note is a length of time, like words long or short."
      },
      {
        "do": "Pick a 4-bar tab. Before touching the guitar, count 1, 2, 3, 4 for each bar out loud at a slow steady bpm.",
        "feel": "Steady ticking, four beats to every bar, no rushing."
      },
      {
        "do": "Tap each note on your leg exactly where it falls in the count. Quarter notes land on 1, 2, 3, 4. Eighth notes land on the and between them.",
        "feel": "Your tapping hand becomes the rhythm, separate from any pitch."
      },
      {
        "do": "Say the rhythm as you tap: 1, 2, 3-and-4, matching the spacing the tab shows between numbers.",
        "feel": "The gaps between taps are the music, just as much as the taps."
      },
      {
        "do": "Only after the tapped rhythm is correct and steady, play the actual notes on the strings.",
        "feel": "Rhythm first, fingers second. Now the riff sounds right."
      }
    ],
    "goodWhen": "You can tap out the rhythm of a 4-bar tab on your leg, with the right note values and steady timing, before you ever play it on the strings.",
    "watchOut": "The number one mistake is reading only the fret numbers and ignoring the spacing and stems that show timing, so every note comes out the same length. Always solve the rhythm by tapping and counting first; treat the pitch as the second, separate problem.",
    "song": {
      "name": "Seven Nation Army (The White Stripes)",
      "note": "Its famous riff is simple to fret but lives or dies on the rhythm and the held notes. Tap the timing first and it clicks; rush it and it falls apart."
    }
  },

  "g-t2-hammer": {
    "what": "A hammer-on lets you sound a second, higher note without picking it again. You pick the first note, then slam a finger down hard onto a higher fret on the same string, and the new note rings from the force of your finger alone. One pick, two notes.",
    "why": "This is the first piece of legato, the smooth connected sound that makes solos and licks flow like a voice instead of sounding choppy. Once you have hammer-ons, your phrasing stops being stiff and starts to sing. Almost every memorable guitar solo leans on this move.",
    "steps": [
      {
        "do": "On the G string, put your first finger on the 5th fret and pick it once. Let that note ring.",
        "feel": "A clear, steady note. That is your launch pad."
      },
      {
        "do": "While it is still ringing, slam your third finger straight down onto the 7th fret of the same G string. Do not pick again.",
        "feel": "Hammer from the knuckle, fast and firm, like a tiny hammer striking."
      },
      {
        "do": "Listen: the 7th-fret note should jump out just as loud as the picked one.",
        "feel": "If the second note is quiet, you hit too soft or too slow."
      },
      {
        "do": "Do it 10 times in a row on the G string, then move to the other strings and do 10 each.",
        "feel": "Land right behind the fret, never on top of it, or it buzzes."
      },
      {
        "do": "Keep your first finger pressed down the whole time. It anchors the string so the hammer has something to push against.",
        "feel": "Two fingers down at the end, both pressing."
      }
    ],
    "goodWhen": "On the G string you can pick 5, hammer to 7, and both notes ring at equal volume, ten times in a row, on every string.",
    "watchOut": "The number one mistake is hammering too softly and too slowly, so the second note comes out weak and muffled. Fix it with speed and commitment: snap the finger down fast from a little height, striking like a hammer, not gently placing it.",
    "song": {
      "name": "Nothing Else Matters (Metallica)",
      "note": "The gentle intro melody is full of hammer-ons. Once this move is clean, that intro opens up to you."
    }
  },

  "g-t2-pulloff": {
    "what": "A pull-off is the reverse of a hammer-on. You start on a higher fret, then yank that finger off the string sideways so a lower note that is already fretted underneath rings out. You pick once and the note falls down to a lower pitch on its own.",
    "why": "Pair this with the hammer-on and you have the full legato vocabulary: you can run up AND down a string smoothly without picking every note. This is the engine behind fast, fluid licks and the trills and runs that make a solo feel alive.",
    "steps": [
      {
        "do": "On the G string, set your first finger on the 5th fret AND your third finger on the 7th fret at the same time. Both pressed down.",
        "feel": "Two anchors set before you make a sound."
      },
      {
        "do": "Pick the string once so the 7th-fret note rings.",
        "feel": "Clear note, third finger doing the work."
      },
      {
        "do": "Now flick your third finger off the string with a slight downward tug, not a straight lift. The 5th-fret note rings underneath.",
        "feel": "Pull sideways toward the floor, like plucking the string with your fretting finger."
      },
      {
        "do": "Listen: the 5th-fret note should sound full and clear, not a dead thud.",
        "feel": "If it is silent, your first finger was not pressing hard enough."
      },
      {
        "do": "Do 10 clean pull-offs on the G string, then 10 on each of the other strings.",
        "feel": "Tug and snap, never a lazy lift straight up."
      }
    ],
    "goodWhen": "On the G string you can pick the 7th fret and pull off so the 5th fret rings clearly, ten times in a row, on every string.",
    "watchOut": "The number one mistake is lifting the finger straight up, which just stops the sound instead of plucking the lower note. Fix it by pulling slightly down and across the string, so your fretting finger gives the string a little snap on the way off.",
    "song": {
      "name": "Crazy Train (Ozzy Osbourne)",
      "note": "Randy Rhoads' famous riffs string hammer-ons and pull-offs together. This move is the missing half of that sound."
    }
  },

  "g-t2-slide": {
    "what": "A slide connects two notes by keeping a finger pressed and dragging it along the string from one fret to another. You pick once and the pitch glides smoothly up or down to the new fret, with no gap between the notes.",
    "why": "Slides give your playing a vocal, expressive glide that picking each note can never match. They are how you connect phrases, ease into a target note, and add that smooth, soulful slip between positions. A single slide can make a plain line sound like a real melody.",
    "steps": [
      {
        "do": "On the B string, press your third finger on the 5th fret and pick it once.",
        "feel": "Firm pressure. You will keep this exact pressure the whole slide."
      },
      {
        "do": "Without picking again, drag that finger up the string to the 7th fret, staying pressed the whole way.",
        "feel": "Glide along the string, keep the weight on. The pitch rises smoothly."
      },
      {
        "do": "Stop dead on the 7th fret and let it ring full for a whole beat.",
        "feel": "Land and hold. The arrival note should sustain, not fizzle out."
      },
      {
        "do": "Now slide back down: pick the 7th fret, glide to the 5th, and let it ring a full beat.",
        "feel": "Same motion, opposite direction. Same steady pressure."
      },
      {
        "do": "Set a metronome to 80bpm and slide 5 to 7 and 7 to 5, landing exactly on the beat each time.",
        "feel": "The slide is fast, the landing is right on the click and rings out."
      }
    ],
    "goodWhen": "At 80bpm on the B string you can slide 5 to 7 and 7 to 5, with the landing note ringing full for a whole beat each time.",
    "watchOut": "The number one mistake is easing off the pressure mid-slide, so the note dies before you arrive. Fix it by keeping firm, even fingertip weight the entire glide, then pressing slightly harder as you land on the target fret.",
    "song": {
      "name": "Sweet Home Alabama (Lynyrd Skynyrd)",
      "note": "The signature licks slide between notes for that easy Southern roll. This is exactly the move you just learned."
    }
  },

  "g-t2-bend": {
    "what": "A bend is when you push a string sideways across the fretboard to raise its pitch while it rings. Bend far enough and a note literally rises to match a higher note. A whole-step bend raises the pitch by two frets' worth, so a bent note can be made to sound like the note two frets up.",
    "why": "This is the crying, vocal, blues voice of the guitar. It is the difference between playing notes and making the guitar sing and weep. Every great blues, rock, and soul lead player lives on bends. Nothing else sounds this human.",
    "steps": [
      {
        "do": "On the B string, fret the 9th fret and pick it. Listen hard and remember that pitch. That is your target.",
        "feel": "Burn the sound of fret 9 into your ear. You are aiming for it."
      },
      {
        "do": "Now fret the 7th fret with your third finger, and put your first and second fingers on the string behind it for backup strength.",
        "feel": "Three fingers stacked, pushing together. The bend is a team effort."
      },
      {
        "do": "Pick the 7th fret, then push the string toward the ceiling, rolling from your wrist, until the pitch rises to match the 9th-fret note you memorized.",
        "feel": "Turn from the wrist like turning a doorknob, do not just squeeze with the fingers."
      },
      {
        "do": "Compare: pick the real 9th fret, then bend the 7th up and check they match exactly.",
        "feel": "When they are identical, the bend is in tune. If it sounds sour, you went too far or not far enough."
      },
      {
        "do": "Repeat 10 times, checking against the 9th-fret reference each time. Aim for at least 8 of 10 dead in tune.",
        "feel": "Your ear is the judge, not your hand."
      }
    ],
    "goodWhen": "On the B string you can bend the 7th fret up to match the pitch of the 9th fret, in tune at least 8 out of 10 tries against the reference note.",
    "watchOut": "The number one mistake is bending with just one finger, which is weak and lands out of tune. Fix it by stacking your first two fingers behind the bending finger for support and rotating from your wrist, using your whole hand to push the string.",
    "song": {
      "name": "Sunshine of Your Love (Cream)",
      "note": "Eric Clapton's solo is built on expressive whole-step bends. Get this in tune and that crying tone is yours."
    }
  },

  "g-t2-vibrato": {
    "what": "Vibrato is a small, steady wobble in pitch that you add to a note while it rings, by rapidly bending the string a tiny bit up and releasing it, over and over. It makes a held note shimmer and breathe instead of sitting flat and dead.",
    "why": "Vibrato is a player's fingerprint. It is what makes a single sustained note sound alive and emotional, and it is how legends are recognized in one note. Add it to the end of a phrase and a plain line suddenly sounds finished and expressive.",
    "steps": [
      {
        "do": "On the B string, fret the 7th fret with your third finger and pick it so it rings.",
        "feel": "Let it sustain. You are about to make it breathe."
      },
      {
        "do": "Gently push the string up a tiny amount, then release back to pitch, then push again, in a smooth repeating wobble.",
        "feel": "Tiny bends, not big ones. Roll from the wrist, like a slow shiver."
      },
      {
        "do": "Keep the wobble even in size and speed. Every up-and-down should match the last.",
        "feel": "Steady and controlled, never random or shaky."
      },
      {
        "do": "Set a metronome to 60bpm and oscillate four times per beat: up-down, up-down, up-down, up-down on each click.",
        "feel": "Lock the wobble to the click so it is even, not panicked."
      },
      {
        "do": "Hold one note with steady vibrato for 8 full seconds without it speeding up, slowing down, or dying.",
        "feel": "The note should feel like it is singing the whole time."
      }
    ],
    "goodWhen": "On the B string at 7th fret you can hold even vibrato at four oscillations per beat at 60bpm for a full 8 seconds, staying steady the whole time.",
    "watchOut": "The number one mistake is uneven, jittery vibrato that speeds up and dies out. Fix it by driving the motion from your wrist, not just your fingertip, and locking the wobble to a metronome so every push and release is the same size and speed.",
    "song": {
      "name": "Comfortably Numb (Pink Floyd)",
      "note": "David Gilmour's long sustained notes live and die on his slow, even vibrato. This skill is the heart of that tone."
    }
  },

  "g-t2-pent-box1": {
    "what": "Box 1 of the minor pentatonic is the single most-used shape for guitar solos. It is a small five-fret box of notes that all sound good together over rock and blues. Learn this one box and every note inside it is a 'safe' note. You cannot really play a wrong one.",
    "why": "This is your first improvisation vocabulary. The moment you have this box under your fingers you can solo over a backing track and sound like you know what you are doing. Almost every famous rock and blues lead lick lives in here. This is where guitar stops being chords and starts being YOU talking.",
    "steps": [
      {
        "do": "Move your hand up to the 5th fret. Your first finger covers the 5th fret across all strings, your third finger covers the 8th fret.",
        "feel": "Two fingers, two frets apart. The box is only that wide."
      },
      {
        "do": "Play the low E string: first finger 5th fret, then third finger 8th fret. That is the A root note then the next pentatonic note.",
        "feel": "One low, one a bit higher. Hear the gap."
      },
      {
        "do": "Move to the A string: first finger 5th fret, third finger 7th fret. Then D string: 5th and 7th. Keep climbing this pattern string by string.",
        "feel": "Your hand stays anchored. Only fingers move, not the whole arm."
      },
      {
        "do": "Climb all six strings up, then come back down. That whole journey is the Am pentatonic box.",
        "feel": "Smooth and even, like walking up and down stairs."
      },
      {
        "do": "Now play random notes inside the box over a slow Am backing track. Hold some, skip some.",
        "feel": "Every note fits. You are improvising. That is the whole magic."
      }
    ],
    "goodWhen": "You can play the Am Box 1 cleanly up and down at 100bpm, and improvise freely inside it over an Am track for two minutes without it ever sounding wrong.",
    "watchOut": "Beginners race up and down the box like a scale drill and it sounds robotic. The fix: play FEWER notes. Hold one note, breathe, then play the next. Music is the space between notes, not how many you cram in.",
    "song": {
      "name": "Stairway to Heaven solo (Led Zeppelin)",
      "note": "The famous solo lives almost entirely in this one Am pentatonic box. You are learning the exact room it was written in."
    }
  },

  "g-t2-pent-box2": {
    "what": "Box 2 is the minor pentatonic shape that sits right next to Box 1, higher up the neck. Learning it lets you keep soloing as you move your hand up the fretboard instead of being trapped in one tiny spot. Box 1 and Box 2 share notes, so they lock together like puzzle pieces.",
    "why": "This is how you leave first position and stop sounding stuck. Connecting two boxes doubles your playground and lets your solos climb higher and brighter. It is the first real step toward owning the whole neck instead of one corner of it.",
    "steps": [
      {
        "do": "Start in your familiar Am Box 1 at the 5th fret. Play it once to ground yourself.",
        "feel": "Home base. You know this room."
      },
      {
        "do": "Find Box 2: it starts around the 7th and 8th frets. Your first finger now covers the 7th fret, your fourth finger reaches up to the 10th.",
        "feel": "Same kind of box, just shifted up and slightly stretched."
      },
      {
        "do": "Spot the shared notes: the top of Box 1 IS the bottom of Box 2. Play the connecting note in both shapes so your ear hears they overlap.",
        "feel": "A door between the two rooms, not a wall."
      },
      {
        "do": "Play from the bottom of Box 1, cross through the shared note into Box 2, and keep climbing without stopping.",
        "feel": "One unbroken line, no hiccup at the seam."
      },
      {
        "do": "Descend all the way back down through Box 2 into Box 1 to where you started.",
        "feel": "A round trip. Up the neck and home again, smooth."
      }
    ],
    "goodWhen": "You can run from Box 1 up into Box 2 as one unbroken line at 80bpm with no pause at the join, then descend cleanly back to where you started.",
    "watchOut": "The most common stumble is freezing at the seam where the boxes meet, hunting for the next note. The fix: drill ONLY the four notes around the connecting point, back and forth, until that join is automatic. Then the whole climb flows.",
    "song": {
      "name": "Sunshine of Your Love solo (Cream)",
      "note": "Clapton famously climbs the pentatonic boxes up the neck in this solo. Connecting boxes is exactly the move you are learning."
    }
  },

  "g-t2-barre-E": {
    "what": "The E-shape barre chord takes an open E chord and slides it up the neck, with your first finger laid flat across all six strings acting like a movable nut. One shape, dragged to any fret, gives you any major or minor chord. It is the chord version of the power chord trick.",
    "why": "This unlocks every major and minor chord on the guitar from a single shape. No more being stuck with only the easy open chords. Want B flat? F sharp minor? Any chord a song throws at you? Slide this shape to the right fret and it is yours. This is the shape that turns 'I know five chords' into 'I can play anything.'",
    "steps": [
      {
        "do": "Lay your first finger flat across all six strings at the 1st fret, pressing them all down. This is the barre.",
        "feel": "Push from the bony side of the finger, not the soft flat pad. Roll it slightly toward the headstock."
      },
      {
        "do": "On top of that, build an E chord shape with your other three fingers: third finger A string 3rd fret, fourth finger D string 3rd fret, second finger G string 2nd fret.",
        "feel": "It is the open E shape, just shifted up one fret with the barre behind it."
      },
      {
        "do": "Strum all six strings slowly, one at a time, listening for any that buzz or thud.",
        "feel": "Find the dead string, press a hair harder there."
      },
      {
        "do": "Now strum all six together. That is F major. Slide the whole shape up two frets and it becomes G major.",
        "feel": "Same grip, new chord. The barre is a movable nut."
      },
      {
        "do": "Lift the second finger off the G string to turn any of these into a minor chord, then put it back.",
        "feel": "One finger is the whole difference between major vs minor."
      }
    ],
    "goodWhen": "You can play an F barre chord at the 1st fret with all six strings ringing clean, and switch between Bm and F#m fifteen or more times in one minute without notes dying out.",
    "watchOut": "The number one killer is the barre finger laying flat and muting strings with its soft pad. The fix: roll the finger slightly onto its side toward the headstock so the harder edge presses, and pull your elbow in tight to your body for leverage. This chord is brutal at first for everyone. It clicks with reps, not force.",
    "song": {
      "name": "Should I Stay or Should I Go (The Clash)",
      "note": "The whole song cycles D, G, F, and A using movable E-shape barre grips. Learn the shape and you can play the entire progression by sliding it up and down the neck."
    }
  },

  "g-t2-barre-A": {
    "what": "The A-shape barre chord is the second movable chord shape. It is built from an open A chord with your first finger barring across the strings, and it lives on a different set of strings than the E shape. Having both means every chord on the neck is now reachable in two different spots.",
    "why": "Two barre shapes equals total chord freedom. Any key, any fret, no exceptions. When a song's chord is awkward to reach with the E shape, the A shape grabs it nearby instead, so you stop jumping wildly up and down the neck. This is the moment the whole fretboard opens up and you can play in any key a singer needs.",
    "steps": [
      {
        "do": "Barre your first finger across the A, D, G, B, and high E strings at the 2nd fret. Leave the low E string out.",
        "feel": "Five strings under the barre this time, not all six."
      },
      {
        "do": "Stack the A shape on top: use your third finger (or a smaller barre with the ring finger) across the D, G, and B strings at the 4th fret.",
        "feel": "Three notes in a row, one fret group higher than the barre."
      },
      {
        "do": "Strum from the A string down, avoiding the low E. That is B major.",
        "feel": "Full and bright. Skip that thickest string."
      },
      {
        "do": "Slide the whole shape up so the barre sits at the 5th fret. Now it is E major, the same chord you can also grab with the E shape lower down.",
        "feel": "Two ways to the same chord. That is the freedom."
      },
      {
        "do": "Switch back and forth between B (barre at 2nd fret) and E (barre at 5th fret), feeling the short slide between them.",
        "feel": "A small, smooth shift, not a leap across the neck."
      }
    ],
    "goodWhen": "You can play a B barre chord with the barre at the 2nd fret cleanly, and switch between B and E fifteen or more times in a minute with the low E string staying silent.",
    "watchOut": "The most common mess is the low E string ringing out and muddying the chord. The fix: let the very tip of your barre finger lean against that low E to deaden it, or just aim your strum to start on the A string. Train your strumming hand to skip the thickest string.",
    "song": {
      "name": "Wild Thing (The Troggs)",
      "note": "Its three chords are A, D, and E, which sit close together as movable A-shape barres. Grabbing them all in one spot instead of leaping around the neck is exactly what this shape buys you."
    }
  },

  "g-t3-blues12": {
    "what": "The 12-bar blues is a 12-bar musical pattern that uses just three chords in a fixed, repeating order. It is the most famous chord progression in popular music. Once you know the order, you can sit down with any blues or early rock band in the world and play along without ever having heard the song.",
    "why": "This is the harmonic spine of blues, rock and roll, and a huge slice of pop. Learn the 12-bar shape and you can jam with anyone, anywhere. It is also the perfect backing to solo over with your pentatonic box, so it ties your rhythm and your lead together into actual music.",
    "steps": [
      {
        "do": "Pick your three chords in the key of A: A5 (the I), D5 (the IV), and E5 (the V), all as power chords you already know.",
        "feel": "Three power chords, three homes on the neck."
      },
      {
        "do": "Play four bars of A5, four beats each. This is the 'home' section.",
        "feel": "Settled, grounded. This is base camp."
      },
      {
        "do": "Play two bars of D5, then two bars back on A5.",
        "feel": "A trip away from home and back. You feel the lift on D5."
      },
      {
        "do": "Play one bar of E5, one bar of D5, then two bars of A5 to finish. That is all 12 bars.",
        "feel": "The E5 to D5 to A5 ending is the part that makes it sound unmistakably like the blues."
      },
      {
        "do": "Loop the whole 12 bars around and around at 75bpm. Then put on a backing version and solo over it with your Am pentatonic Box 1.",
        "feel": "Rhythm underneath, lead on top. You are making a whole song alone."
      }
    ],
    "goodWhen": "You can play a full 12-bar blues in A with power chords at 75bpm, loop it without losing your place, and then solo over a backing track using Box 1.",
    "watchOut": "Beginners lose count and the chord changes drift, so the form falls apart. The fix: count out loud, '1-2-3-4' per bar, and say the chord name on beat one of every bar. The form is a clock. Keep time and it plays itself.",
    "song": {
      "name": "Johnny B. Goode (Chuck Berry)",
      "note": "It is a 12-bar blues, the blueprint for rock and roll. Learn the form once and this entire song is already under your fingers."
    }
  },

  "g-t3-phrasing": {
    "what": "Call and answer phrasing is the secret that makes a solo sound like a conversation instead of a finger exercise. You play a short musical idea (the question), leave a gap of silence, then play a second idea that answers it. It is how singers and great soloists make you actually feel something.",
    "why": "This is what separates noodling from real music. Notes alone do not move people, but a question and its answer do. The silence is the most powerful tool you have. Learn to ask and answer and your solos start to breathe and tell a story, even with the same handful of pentatonic notes.",
    "steps": [
      {
        "do": "In your Am pentatonic Box 1, play a tiny four-note phrase. Keep it simple, end it on a note that feels unfinished, like a question hanging in the air.",
        "feel": "Like raising your voice at the end of a question."
      },
      {
        "do": "Now do nothing for a full bar. Count it out, four silent beats. Just let the question sit.",
        "feel": "Uncomfortable at first. That silence is the point. Trust it."
      },
      {
        "do": "Play a second four-note phrase that 'answers' the first, ending on the A root note so it feels resolved and settled.",
        "feel": "Like the voice coming back down to finish the sentence."
      },
      {
        "do": "Do the whole thing over a 12-bar blues: question, silence, answer, repeat.",
        "feel": "A back-and-forth dialogue, not a wall of notes."
      },
      {
        "do": "Keep the same rhythm in both phrases but change a couple of notes in the answer.",
        "feel": "Like echoing the question but with a reply."
      }
    ],
    "goodWhen": "You can play a four-note question, hold a full bar of silence without rushing to fill it, then play a four-note answer that resolves, all the way through a 12-bar blues.",
    "watchOut": "The number one mistake is fear of silence, so you cram notes in and the conversation disappears. The fix: literally count the silent bar out loud. The gap is not empty, it is the listener waiting for your answer. Great solos are mostly space.",
    "song": {
      "name": "The Thrill Is Gone (B.B. King)",
      "note": "B.B. King is the master of leaving space and answering himself. Every phrase is a question and a reply. This is the skill you are building."
    }
  },

  "g-t3-licks": {
    "what": "A lick is a short, ready-made musical sentence you can drop into any solo. Instead of inventing every note in the moment, you build a small vocabulary of licks you know cold and use them like words. Great players have a personal collection of these they pull from instinctively.",
    "why": "This is how you solo with intent instead of hoping for the best. A few memorized licks give you confident, musical phrases you can fire off and connect on the fly. And because they live in the pentatonic box, you can move a lick to a new key by sliding it, so three licks become a vocabulary you can speak in any song.",
    "steps": [
      {
        "do": "Learn lick one in Am Box 1: hit the G string 7th fret, bend it up a whole step, then play 5th fret on the B and high E strings.",
        "feel": "A classic crying blues phrase. Let the bend sing."
      },
      {
        "do": "Learn lick two: a fast hammer-on and pull-off on the high E string between the 5th and 8th frets, then land on the B string 5th fret.",
        "feel": "Bubbly and quick. The notes trill, your pick barely moves."
      },
      {
        "do": "Learn lick three: a descending run down the box, four notes, ending with vibrato on the A root note.",
        "feel": "Like a sentence coming to rest with a sigh at the end."
      },
      {
        "do": "Play all three back to back until each one is automatic and you do not have to think about the fingering.",
        "feel": "They become single words, not sequences of notes."
      },
      {
        "do": "Now slide each lick to a new key. Move the whole box up to the 7th fret for Bm and play the same three licks.",
        "feel": "Same words, new sentence. The lick travels with you."
      }
    ],
    "goodWhen": "You have three licks memorized so well you can fire each one without thinking, and you can transpose all three into at least two different keys by sliding the box.",
    "watchOut": "Beginners memorize licks then dump them out one after another with no space, which sounds like a checklist. The fix: play ONE lick, leave a gap, let it land, then choose the next. A lick is a sentence, not a paragraph. Use them to say something, not to fill time.",
    "song": {
      "name": "Sweet Home Alabama (Lynyrd Skynyrd)",
      "note": "The lead is built from short, repeatable pentatonic licks strung together. Build your own handful of licks and you are playing in this exact tradition."
    }
  },

  "g-t3-fullneck": {
    "what": "The full-neck pentatonic is the five connected pentatonic boxes that together cover the entire fretboard. Each box overlaps the next, so they chain into one continuous highway of safe notes running from the lowest fret to the highest. This is the map that frees you from one little corner of the neck.",
    "why": "This is total fretboard freedom. No more being trapped in one box. You can start a solo low and growly and climb all the way to the screaming high frets, or land anywhere instantly because you always know where the next safe note is. Every player you admire has this map. It is the difference between knowing a room and knowing the whole house.",
    "steps": [
      {
        "do": "Anchor yourself in Box 1 at the 5th fret, then Box 2 just above it. You already connect those two.",
        "feel": "Two rooms you know. Now extend the hallway."
      },
      {
        "do": "Add Box 3 around the 9th and 10th frets, Box 4 around the 12th, and Box 5 around the 14th to 17th. Learn each one as its own small shape first.",
        "feel": "Five rooms, each its own shape, all on the same floor."
      },
      {
        "do": "Find the shared notes where each box overlaps the next, just like Box 1 met Box 2. Those overlaps are the doorways.",
        "feel": "No walls between boxes, only doors."
      },
      {
        "do": "Run the 'Pentatonic Highway': start at the 5th fret and climb through all five boxes up to the 17th fret as one line.",
        "feel": "Driving up the neck, never stopping, never lost."
      },
      {
        "do": "Now descend all the way back down through the five boxes to the 5th fret.",
        "feel": "The whole neck in one breath, up and back."
      }
    ],
    "goodWhen": "You can run the Pentatonic Highway through all five boxes from the 5th fret up to the 17th fret and back down as one unbroken line, without hunting for any note.",
    "watchOut": "Trying to learn all five boxes at once overwhelms everyone and nothing sticks. The fix: master the doorway between two adjacent boxes before adding the next box. Connections are the real skill, not the boxes themselves. Build the highway one bridge at a time.",
    "song": {
      "name": "Comfortably Numb solo (Pink Floyd)",
      "note": "Gilmour roams across the neck in B minor pentatonic, sliding between positions instead of staying in one box. The full-neck map is exactly what lets a solo travel like that."
    }
  },

  "g-t3-bendaccuracy": {
    "what": "Bending accuracy is pushing a string up to raise its pitch and landing it dead in tune on the note you are aiming for. A bend is the guitar's voice. It is how the instrument cries, soars, and sounds human. But a bend that lands flat or sharp sounds painful, so the whole skill is hitting the target pitch exactly.",
    "why": "This is the heart of real blues-rock lead. A perfectly placed bend is the single most expressive thing you can do on a guitar, the moment a solo stops sounding like notes and starts sounding like a singer. Get your bends in tune and even a simple pentatonic lick will give people chills.",
    "steps": [
      {
        "do": "First, learn the target. Play the G string 7th fret, then separately play the 9th fret. That 9th-fret pitch is where a whole-step bend from the 7th must land.",
        "feel": "Burn that target pitch into your ear before you bend."
      },
      {
        "do": "Now fret the 7th fret with your third finger, and back it up by placing your first and second fingers on the same string behind it for strength.",
        "feel": "Three fingers pushing as one. Bending is not a one-finger job."
      },
      {
        "do": "Push the string up toward the ceiling, using your wrist rotating like turning a key, not just finger muscle, until the pitch matches that 9th-fret target.",
        "feel": "Rotate from the wrist and forearm. The fingers just hold on."
      },
      {
        "do": "Check yourself: bend up, then play the actual 9th fret. They should be the exact same pitch.",
        "feel": "If your bend is lower, push further. Higher, ease off. Hunt the match."
      },
      {
        "do": "Try a pre-bend: bend the string up silently first, THEN pick it, then release down to the unbent pitch.",
        "feel": "The note appears already high and falls. A surprise the ear loves."
      }
    ],
    "goodWhen": "Your whole-step bends land in tune nine times out of ten when checked against the target fret, and you can pre-bend so the note arrives at pitch before it falls.",
    "watchOut": "Beginners bend by curling one finger and the string only goes part way, landing flat and sour. The fix: support with extra fingers behind the bend and rotate from the wrist, not the fingertip. And always, always check the bend against the real target note. Your ear is the only judge that matters.",
    "song": {
      "name": "Since I've Been Loving You (Led Zeppelin)",
      "note": "Page's bends are wrung out and bent to perfect pitch, the whole emotion of the solo. In-tune bending is precisely what makes it weep like that."
    }
  },

  "g-t3-syncopation": {
    "what": "Syncopation is putting the punch of your strum on the off-beats, the spaces between the main counts, instead of always landing on the obvious '1-2-3-4'. Combined with muted strokes (deadened strums that go 'chick'), it gives your rhythm groove and attitude instead of a stiff, on-the-beat march.",
    "why": "This is what makes rhythm playing feel alive and want to make people move. The same chords played stiff are boring, but pushed off the beat with a muted chuck in the gaps, they groove. Funk, reggae, and tight rock rhythm all live here. This is the difference between strumming and actually grooving.",
    "steps": [
      {
        "do": "Hold an Em chord. Keep your strumming hand moving down-up-down-up like a constant pendulum, even when you do not hit the strings.",
        "feel": "The hand never stops. It floats over the strings between hits."
      },
      {
        "do": "Learn the muted stroke: lay your fretting hand flat to deaden the strings, then strum to get a percussive 'chick' with no clear pitch.",
        "feel": "A drum hit on guitar. Sharp and short, no ring."
      },
      {
        "do": "Play this pattern slowly: Down, mute, Down-Up, mute, Down-Up. The mutes fill the gaps where you used to play nothing.",
        "feel": "The 'chick' is the snare drum keeping the groove tight."
      },
      {
        "do": "Now accent: hit the down-up strums a little harder and keep the mutes light. That dynamic contrast is the groove.",
        "feel": "Loud-soft-loud-soft. The bounce comes from the contrast, not the speed."
      },
      {
        "do": "Loop it over and over at 90bpm, keeping every muted stroke even and steady.",
        "feel": "Once it locks, your head starts nodding on its own. That is the groove arriving."
      }
    ],
    "goodWhen": "You can play 'Down, mute, Down-Up, mute, Down-Up' over an Em chord at 90bpm for two minutes with every muted stroke landing even and the accented strums clearly louder.",
    "watchOut": "The classic mistake is stopping the strumming hand during the mutes, which kills the timing instantly. The fix: keep the hand swinging like a pendulum the WHOLE time, hitting or missing the strings, but never pausing. The constant motion is the metronome that holds the groove together.",
    "song": {
      "name": "Another One Bites the Dust feel (or any funk-rock rhythm)",
      "note": "That relentless, muted, off-beat chuck is pure syncopation and muting. Lock this pattern in and you can drive a groove like that with one guitar."
    }
  },
};
