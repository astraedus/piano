// Piano teaching content. Record<nodeId, NodeLesson> — the real lesson behind
// each skill-tree node (the one-line masteryDrill is only the success target).
//
// VOICE: capitalized, functional, warm, soul-first. Lead with the feeling and the
// payoff, then teach the how in plain steps. Use real term words ("C major",
// "triad", "tonic") so the glossary auto-chips them. No em-dashes. No fake hype.
// Every lesson must make a total beginner able to actually DO the thing.
//
// node ids must match PIANO_NODES in skillNodes.ts. Coverage is asserted in tests.

import type { NodeLesson } from "../types";

export const PIANO_LESSONS: Record<string, NodeLesson> = {
  // ── Gold-standard example (the quality bar for the rest) ───────────────────
  "p-key-C": {
    what: "C major is the home base of the piano. It is the scale you play using only the white keys, starting on the note C. Its three-note chord (a triad) is C, E, G played together. Almost every beginner song lives here because there are no black keys to worry about.",
    why: "Get C major under your hands and you can play a huge amount of music immediately. It is the key everything else is measured against, and the I, IV, V chords in C (the three chords behind countless songs) are all easy white-key shapes.",
    steps: [
      { do: "Find C: it is the white key just to the left of any group of two black keys.", feel: "Once you see the two-black-key landmark, C jumps out everywhere." },
      { do: "Play the C scale with your right hand: C, D, E, F, G, A, B, C, all white keys going up.", feel: "Thumb on C, tuck it under after E to keep going smoothly." },
      { do: "Now play the C triad: press C, E, and G together with thumb, middle, and pinky.", feel: "A full, resolved, happy sound. That is home." },
      { do: "Play the progression C, F, G, C as block chords, holding each for a count of four.", feel: "Hear how G pulls you back home to C. That pull is the engine of music." },
    ],
    goodWhen: "You can play the C scale hands-separately without hunting for keys, and move between the C, F, and G chords cleanly.",
    watchOut: "Do not look at your hands the whole time. Glance, then feel for the next key. Your fingers learn the distances faster than your eyes do.",
    song: { name: "Let It Be (The Beatles)", note: "The chorus is C, G, Am, F. You already have two of those four chords." },
  },

  "p-trans-am-F": {
    what: "This is a timed change drill, not a new chord. You already know Am and F. The job is to switch BETWEEN them, cleanly and in time, over and over for one minute, counting each clean landing. Am to F is the hard change inside the Pop Formula loop (Am, F, C, G), so it is the one worth drilling on its own.",
    why: "Knowing a chord and being able to change to it in tempo are weeks apart. A song does not wait while you reshape your hand. Once Am to F lands around thirty clean changes a minute, the change runs on its own and the song becomes playable instead of stuttering.",
    steps: [
      { do: "Set Am in your hand: A, C, E. Set F: F, A, C. Notice C is shared, so it can stay put.", feel: "Two of three fingers barely move. Find the smallest motion that works." },
      { do: "Start the minute. Switch Am to F to Am to F, slowly at first, both chords ringing fully each time.", feel: "Clean, not fast. A change that buzzes does not count." },
      { do: "Tap once for every CLEAN change you land. Watch the count climb.", feel: "The number going up is the only score that matters tonight." },
      { do: "When the minute ends, note your changes-per-minute. Next time, beat it.", feel: "You are racing only yesterday's you." },
    ],
    goodWhen: "You reach roughly thirty clean Am to F changes in a minute without looking, both chords ringing in time.",
    watchOut: "Do not trade clean for fast. Mark only changes where both chords actually ring. Honest counting is what builds the real motor program.",
    song: { name: "Someone Like You (Adele)", note: "Once Am to F is in tempo, its loop carries the whole verse." },
  },

  "p-t0-keyboard-map": {
    "what": "The keyboard looks like a wall of identical keys, but it is not. The black keys come in groups of two and three, over and over, and those groups are your map. Once you can read them, you can find any note instantly, anywhere on the piano.",
    "why": "Every scale, every chord, every song starts with knowing where the notes are. Nail this and you never hunt for a key again. You stop staring down at your hands and start playing. This one skill quietly speeds up everything you ever learn after it.",
    "steps": [
      {
        "do": "Look at the black keys. See them clump into groups of two and groups of three, repeating all the way along.",
        "feel": "Like reading words instead of letters. Patterns, not chaos."
      },
      {
        "do": "Find C: the white key just to the LEFT of every group of two black keys. Play every C up the piano.",
        "feel": "Same note, higher and higher. C is your anchor point."
      },
      {
        "do": "Now find F: the white key just to the LEFT of every group of three black keys. Play every F.",
        "feel": "A second landmark. Two-black-keys means C is near, three-black-keys means F is near."
      },
      {
        "do": "Name the rest by walking up from C: C, D, E, F, G, A, B, then C again. White keys only.",
        "feel": "After B it loops back to C. Seven letters, forever repeating."
      },
      {
        "do": "Test yourself: say a random letter out loud, then jab that key without looking for more than a glance.",
        "feel": "Fast and sure. If you have to count, slow down and find your landmark first."
      }
    ],
    "goodWhen": "You can close your eyes, pick any letter, and land your finger on a correct note in under a second using the two-and-three black-key groups to orient.",
    "watchOut": "The number one mistake is memorizing one C and counting up from it every time. Instead, learn BOTH landmarks (two-black-keys = C below, three-black-keys = F below) so you can teleport anywhere on the keyboard without counting.",
    "song": {
      "name": "Twinkle Twinkle Little Star",
      "note": "C C G G A A G uses only notes you just mapped. Find them by their black-key landmarks and you are already playing a melody."
    }
  },

  "p-t0-posture": {
    "what": "How you sit decides how you sound. Good piano tone does not come from finger strength, it comes from letting the weight of your relaxed arm drop into the key. This is arm weight, and it is the quiet foundation under every beautiful thing you will ever play.",
    "why": "Tension is the enemy. It makes you stiff, slow, sore, and tinny. Learn to play loose from day one and you avoid years of bad habits. Relaxed arm weight gives you a rich, full sound and lets you play for hours without your hands aching. This is the difference between hitting keys and making music.",
    "steps": [
      {
        "do": "Sit tall on the front half of the bench, feet flat on the floor, bench far enough back that your elbows are slightly in front of your body.",
        "feel": "Grounded and upright, like you could stand up easily."
      },
      {
        "do": "Let your arms hang dead at your sides for a moment. Feel how heavy and loose they are.",
        "feel": "That heaviness is the arm weight you are about to use."
      },
      {
        "do": "Bring your hands to the keys with curved fingers, as if holding a small ball. Knuckles up, wrists level, not collapsed.",
        "feel": "Relaxed curve, no flat fingers, no clawing."
      },
      {
        "do": "Play a five-finger pattern: thumb on C, then D E F G one finger each, up and back down. Let each key drop from the WEIGHT of your arm, not a finger push.",
        "feel": "The sound comes from sinking, not poking."
      },
      {
        "do": "Between each note, let your hand go completely soft for a split second.",
        "feel": "Tension in, release out. Your wrist should feel loose, never locked."
      }
    ],
    "goodWhen": "You can play the five-finger pattern up and down with your shoulders down, wrist loose, and zero tension between strikes. A hand resting on yours should feel soft, not braced.",
    "watchOut": "The biggest mistake is hunching forward and pressing keys with tight, locked fingers. Fix it by dropping your shoulders, breathing out, and imagining the sound falling out of your arm rather than being forced out of your fingertip.",
    "song": {
      "name": "Ode to Joy (Beethoven)",
      "note": "The main theme sits right under a five-finger hand position. Play it slowly with relaxed arm weight and every note rings full instead of thin."
    }
  },

  "p-t0-staff": {
    "what": "Written music is just a picture of which notes to play and when. The staff is the set of five lines the notes sit on. Piano uses two of them stacked: the treble clef for your right hand (higher notes) and the bass clef for your left hand (lower notes). Once the dots stop looking like code, the whole library of written music opens up.",
    "why": "Reading the staff means you can learn any song from sheet music, not just the few you find tabs or videos for. It is the written language of music, and it connects directly to the keys you already mapped. Decode the dots and you are no longer waiting for someone to show you how a piece goes.",
    "steps": [
      {
        "do": "Look at the treble clef (the curly one). Its five lines, bottom to top, are the notes E G B D F. Memorize them with 'Every Good Boy Deserves Fudge'.",
        "feel": "Bottom line is E, and you climb in thirds."
      },
      {
        "do": "The four spaces between those lines spell F A C E, bottom to top. That one is free, it just spells a word.",
        "feel": "Lines have a phrase, spaces spell FACE."
      },
      {
        "do": "Find Middle C: it sits on its own tiny line just BELOW the treble staff. It is the C nearest the middle of your piano, your bridge between both hands.",
        "feel": "Middle C is the meeting point of treble and bass."
      },
      {
        "do": "Now the bass clef (left hand). Lines bottom to top are G B D F A ('Good Boys Deserve Fudge Always'). Spaces are A C E G ('All Cows Eat Grass').",
        "feel": "Lower on the page means lower, leftward keys."
      },
      {
        "do": "Pick any single note on a simple score, name it by its line or space, then play that key. Repeat without counting up from a landmark each time.",
        "feel": "See the dot, know the letter, hit the key. Direct, not counted."
      }
    ],
    "goodWhen": "You can point at any note in the treble or bass clef on a beginner score and name it on sight, without slowly counting up line by line from a memorized landmark.",
    "watchOut": "The most common trap is always counting up from one anchor note (slow and error-prone). Instead, drill the line and space sets until each position is instantly recognized on its own, the way you read a word without sounding out every letter.",
    "song": {
      "name": "Mary Had a Little Lamb",
      "note": "Its few notes (E D C D E E E) are some of the first you will read on the treble staff. Naming and playing them is your first real act of reading music."
    }
  },

  "p-key-G": {
    "what": "G major is your second home on the piano. It works exactly like C major, except for one twist: instead of playing F as a white key, you play the black key just above it, F sharp. That single change is what gives G major its bright, slightly lifted sound.",
    "why": "Knowing two keys instead of one nearly doubles the songs you can play and lets you move music up or down to fit a singer or a mood. G major is one of the most common keys in pop, folk, and worship music. And it teaches the big idea behind every key: a scale is just a pattern, and the black keys are part of it.",
    "steps": [
      {
        "do": "Find G: it sits just to the RIGHT of F, between the first two black keys of any group of three. Put your right thumb on it.",
        "feel": "One white key up from your F landmark, tucked between the first two of the three black keys."
      },
      {
        "do": "Play up: G A B C D E, all white keys so far. Tuck your thumb under after B to keep going smoothly.",
        "feel": "Same smooth thumb-tuck you used in C major."
      },
      {
        "do": "Here is the one change: the next note is F SHARP, the black key just above F, not F itself. Then finish on G.",
        "feel": "Listen. That black key is what makes G major sound bright instead of off."
      },
      {
        "do": "Play the G triad: G, B, D together with thumb, middle, pinky.",
        "feel": "Full and resolved, just like the C chord but with a lift."
      },
      {
        "do": "Move between G, C, and D as block chords, four counts each. End on G.",
        "feel": "Hear how D pulls you home to G. Same homing pull as before, new key."
      }
    ],
    "goodWhen": "You can play the G scale hands-separately and stop hunting for keys, always remembering the F sharp, and move cleanly between the G, C, and D chords ending back on G.",
    "watchOut": "The number one mistake is forgetting the F sharp and playing a plain F, which makes the scale sound suddenly wrong. Fix it by saying 'F sharp' out loud as you reach it, and feel for that one black key every single time.",
    "song": {
      "name": "Knockin' on Heaven's Door (Bob Dylan)",
      "note": "It lives in G major and leans on the G, C, and D chords you just learned (plus a passing A minor). The whole song loops those few chords, exactly the homing pull you practiced."
    }
  },

  "p-key-F": {
    "what": "F major is the warm, gentle key behind countless ballads. It is built just like C major, but with one swap going the other direction: instead of B as a white key, you play the black key just below it, B flat. That softens the whole sound and gives F major its tender, settled feeling.",
    "why": "So many slow, emotional songs live in F major because it sits comfortably for singing and feels grounded. Learning it gives you a third key and, more importantly, your first FLAT (a note lowered to the black key below). Sharps raise, flats lower. Now you understand both directions, and the rest of the keys stop being mysterious.",
    "steps": [
      {
        "do": "Find F (the white key just to the LEFT of any group of three black keys) and put your right thumb on it.",
        "feel": "Three-black-keys means F is right there to its left."
      },
      {
        "do": "Play up: F G A, then tuck your thumb under to continue.",
        "feel": "The thumb tucks under A this time, a touch earlier than in C."
      },
      {
        "do": "Here is the change: after A comes B FLAT, the black key just BELOW B, not B itself. Then finish C D E F.",
        "feel": "Listen for how that flat makes everything sound rounder and warmer."
      },
      {
        "do": "Play the F triad: F, A, C together with thumb, middle, pinky.",
        "feel": "Soft and full. The home sound of a thousand love songs."
      },
      {
        "do": "Move between F, B flat, and C as block chords, four counts each, ending on F.",
        "feel": "C pulls you home to F. The flat lives inside that B flat chord too."
      }
    ],
    "goodWhen": "You can play the F scale with thumb starting on F (and again on C as you tuck) without hunting for keys, always catching the B flat, and move cleanly between F, B flat, and C ending on F.",
    "watchOut": "The most common slip is the thumb-tuck timing, which is earlier than in C major, plus forgetting the B flat. Fix both by going slow: thumb under after A, and say 'B flat' out loud as you reach for that black key.",
    "song": {
      "name": "Hey Jude (The Beatles)",
      "note": "Paul McCartney wrote it in F major, and its verses lean on F, C, and B flat, the warm colors you just built. Settle into those chords and you are sitting right in the home of countless ballads."
    }
  },

  "p-key-am": {
    "what": "A minor is the sound of longing. It uses the exact same white keys as C major, but starting on A instead of C, and that one change flips the whole feeling from happy to sad and yearning. Its three-note chord, A minor, is A, C, E. This is where you learn to hear major versus minor in your bones.",
    "why": "Major sounds bright, minor sounds emotional. Once you can hear and play the difference, you understand the single biggest lever of feeling in all of music. Sad songs, dramatic songs, beautiful aching songs all live in minor. And the bonus: A minor is free, it is the same white keys as C major you already know, just centered on a new home.",
    "steps": [
      {
        "do": "Find A (the white key between the second and third black keys of any three-black-key group). Put your right thumb on it.",
        "feel": "A is your new tonic, your new home base."
      },
      {
        "do": "Play the A natural minor scale, all white keys: A B C D E F G A. No sharps, no flats.",
        "feel": "Same keys as C major, but starting here it sounds suddenly sad. That is the magic."
      },
      {
        "do": "Play the A minor triad: A, C, E together with thumb, middle, pinky.",
        "feel": "Hollow and longing where C major was warm and resolved. That is major versus minor."
      },
      {
        "do": "Now hear it side by side: play C E G (happy), then A C E (sad), back and forth.",
        "feel": "Same hand, tiny shift, totally different emotion. Burn this contrast in."
      },
      {
        "do": "Play a i-iv-V-i progression: A minor, D minor, E (major), A minor, four counts each.",
        "feel": "Listen hard to that E chord. It strains, then RESOLVES home to A minor. That tension and release is the engine of sad music."
      }
    ],
    "goodWhen": "You can play the A natural minor scale and the A minor triad from memory, and reliably hear and name major versus minor when you alternate the C and A minor chords. The E chord resolving to A minor should feel like a sigh coming home.",
    "watchOut": "The most common confusion is thinking A minor needs different keys than C major. It does not, they share every white key. The ONLY thing that changes is your home note (A), so let your ear, not new fingerings, tell you it is minor.",
    "song": {
      "name": "Hallelujah (Leonard Cohen)",
      "note": "It moves between major and minor chords to ache and resolve over and over, and even names the minor fall and major lift in its own lyric. The C-to-A-minor shift you just practiced is the exact heartbeat of that song."
    }
  },

  "p-t1-first-improv": {
    "what": "This is the moment you stop copying and start creating. You hold ONE chord you already know, C major, under your left hand, and play a handful of safe notes with your right. That is enough to make up music that actually sounds good. No sheet, no rules, no new chords to learn, just you and the keys having a conversation.",
    "why": "Improvisation is freedom. It turns the piano from a thing you recite into a thing you speak through. Once you feel that any note in the safe group sounds good over your held chord, the fear vanishes and playing becomes play. This is the door to writing your own songs, jamming with others, and never being bored at a keyboard again.",
    "steps": [
      {
        "do": "Left hand: press and HOLD a C major chord (C, E, G). Let it ring. That single held chord is your whole backing tonight.",
        "feel": "A calm, steady bed of sound. Nothing else to manage."
      },
      {
        "do": "Right hand, find your safe notes, the C pentatonic: C, D, E, G, A (then back to C). Just five notes.",
        "feel": "Skip the F and the B. These five can NOT sound wrong over your held C."
      },
      {
        "do": "Over the held chord, play those five notes in any order, slowly, one at a time. Pause. Listen. Pick another.",
        "feel": "Surprised that it works. Every note lands. That is the pentatonic doing its job."
      },
      {
        "do": "Now play with TIMING and SPACE. Hold some notes long, leave gaps of silence, repeat a little three-note idea.",
        "feel": "Space is music too. Silence makes the next note matter."
      },
      {
        "do": "Try landing on C right when you want the phrase to feel finished.",
        "feel": "That coming-home feeling. Resolving on the tonic is how a musical sentence ends."
      }
    ],
    "goodWhen": "You can keep a C chord held in your left hand while your right hand noodles freely over the C pentatonic, and it sounds musical, with phrases that breathe and occasionally resolve home to C.",
    "watchOut": "The biggest beginner mistake is playing too many notes too fast to fill the silence out of nerves. Fix it by deliberately leaving gaps. Play one note, count to two, play another. Space and patience sound far more musical than a flurry.",
    "song": {
      "name": "Someone Like You (Adele)",
      "note": "Its piano part floats a melody on top of held chords, exactly what you are doing now. Your improvising is the same skill that song is built on."
    }
  },

  "p-t1-echo-ear": {
    "what": "This is ear training disguised as a game. Someone (or the app) plays a few notes, and you find them back on the keyboard by listening, not looking at a chart. It is how musicians learn to play what they hear in their head, and it grows fast once you start.",
    "why": "A trained ear is the secret weapon. It lets you figure out songs by listening, jam with other people, and eventually play whatever melody you imagine. Most beginners skip this and stay chained to sheet music forever. Build it early and you become the rare player who can just sit down and find a tune by ear.",
    "steps": [
      {
        "do": "Stay in C major (white keys only) so every note you hunt for is a white key. Less to search.",
        "feel": "A safe, small playground. No wrong rooms to wander into."
      },
      {
        "do": "Have 3 to 4 notes played for you (start with steps right next to each other, like C D E D). Listen to the whole little shape first.",
        "feel": "Hear it as one phrase, not four separate pings."
      },
      {
        "do": "Find the FIRST note by trial: tap a key, compare it to the sound in your memory, adjust up or down until it matches.",
        "feel": "Higher or lower? Your ear knows the direction even before your fingers do."
      },
      {
        "do": "Then chase the rest one at a time, asking 'did it go up or down from here, and by a little or a lot?'",
        "feel": "Music moves in steps and leaps. You are learning to feel the distance."
      },
      {
        "do": "Once you can echo it looking, do it again with your EYES CLOSED. Trust the sound, not the sight.",
        "feel": "Scary at first, then freeing. The ear takes over from the eyes."
      }
    ],
    "goodWhen": "You can hear a 3 to 4 note phrase in C and echo it back correctly, and then do it again with your eyes closed, letting your ear (not a glance at the keys) guide each note.",
    "watchOut": "The number one mistake is grabbing for keys randomly and hoping. Instead, always ask one question per note: 'did the sound go UP or DOWN from the last one?' Direction first, then distance. That turns guessing into listening.",
    "song": {
      "name": "Happy Birthday",
      "note": "Almost everyone already knows this tune in their head. Try to find it by ear in C, one note at a time. It is the perfect first song to pull out of memory and onto the keys."
    }
  },

  "p-t1-three-moods": {
    "what": "Here you discover that the same notes can sound completely different depending on HOW you play them. Touch and timing, not the notes themselves, carry the emotion. You take one simple line in C major, five notes you already know, and play it three ways: tender, restless, and resigned. Same notes, three different feelings.",
    "why": "This is the leap from playing notes to playing music. Once you control mood through touch and timing, you can make a bright little line sound heartbroken or make it sound urgent. It is why two people playing the identical notes can sound worlds apart. This is taste, expression, and dynamics, the soul of performance.",
    "steps": [
      {
        "do": "Play a simple line in C: C, D, E, F, G, then back down to C. All white keys, one hand. Get it flowing so the notes are second nature first.",
        "feel": "Easy and familiar. Your hand already knows this shape from C major."
      },
      {
        "do": "Play it TENDER: very soft, slow, let each note ring into the next, gentle and unhurried.",
        "feel": "Like a lullaby. Quiet and patient. Let the space around the notes breathe."
      },
      {
        "do": "Play the SAME notes RESTLESS: a little faster, a little brighter and louder, push the tempo forward and never quite settle.",
        "feel": "Anxious and forward-leaning. The same five notes, now in a hurry."
      },
      {
        "do": "Play it RESIGNED: slow again, but heavy and weary, let the notes sag, soft, with long gaps between them.",
        "feel": "Like a sigh at the end of a long day. Same notes, all the air let out."
      },
      {
        "do": "Run all three back to back without stopping and listen to how only your touch and timing changed.",
        "feel": "The notes never moved. YOU moved them."
      }
    ],
    "goodWhen": "You can play the same C, D, E, F, G line three distinct ways (tender, restless, resigned) using only changes in dynamics, speed, and touch, and a listener could feel the difference with their eyes closed.",
    "watchOut": "The most common mistake is changing the notes to chase a mood instead of changing how you play them. Keep the notes identical every time. The whole lesson is that touch and timing alone carry the feeling. If you reach for different notes, you have missed the point.",
    "song": {
      "name": "Ode to Joy (Beethoven)",
      "note": "Its famous theme uses only these few notes in C major. Play its opening line soft and tender, then bright and restless, and hear the same melody change character with your touch alone."
    }
  },

  "p-t2-chord-under-melody": {
    "what": "This is the moment piano becomes piano. Your left hand holds a chord still while your right hand plays a tune on top. Two hands doing two different jobs at the same time. It feels like magic the first time it clicks, and it is the foundation of almost everything you will ever play.",
    "why": "Until now both hands did the same thing. This splits them. Once your left hand can hold a chord on its own while the right hand sings a melody, you can accompany yourself, play any songbook, and sound like a real pianist instead of someone poking single notes.",
    "steps": [
      {
        "do": "Left hand: play a C triad and HOLD it down. Pinky on C, middle on E, thumb on G. Just hold. Do nothing else.",
        "feel": "Let the keys stay pressed. No re-hitting, no fidgeting. Dead still."
      },
      {
        "do": "While the left hand holds, play three slow right-hand notes on top: G, then A, then G. Use right thumb and index, any comfortable fingers.",
        "feel": "The held chord keeps ringing underneath the moving notes."
      },
      {
        "do": "Now alternate the attention: think LEFT (hold), then think RIGHT (move). Say it out loud if it helps.",
        "feel": "Each hand is a separate animal. The left one sleeps, the right one walks."
      },
      {
        "do": "Hold the C chord and play a tiny right-hand melody: C D E D C, one note per beat.",
        "feel": "Steady left hand, wandering right hand. That contrast is the whole skill."
      },
      {
        "do": "Change the left hand to an F chord (F A C) and play the same right-hand melody over it.",
        "feel": "Same tune, new colour underneath. Hear how the mood shifts."
      }
    ],
    "goodWhen": "You can hold a C chord dead still in the left hand and play a 5-note melody on top with the right, without the left hand twitching or releasing.",
    "watchOut": "The number-one mistake is the left hand accidentally re-pressing or letting go every time the right hand moves. Both hands try to sync up. Fix it by practicing the left hand holding alone for a full count of four, eyes closed, before adding the right hand at all.",
    "song": {
      "name": "Lean On Me (Bill Withers)",
      "note": "The left hand holds simple chords while the right hand carries the melody. It is the perfect first two-hands-together song."
    }
  },

  "p-t2-pop-formula": {
    "what": "This is the single most famous chord pattern in pop music: Am, F, C, G, looped over and over. They call it the pop formula because hundreds of hit songs are built on exactly these four chords in this order. Learn the loop and you are holding a master key.",
    "why": "Once Am-F-C-G is in your hands, you can play the backing for an absurd number of songs, and you can put any melody you like on top. This is the four-chord trick buskers and singer-songwriters live on. It is the highest-payoff progression on the piano.",
    "steps": [
      {
        "do": "Learn the four block chords, each as a triad, left hand: A minor (A C E), F major (F A C), C major (C E G), G major (G B D).",
        "feel": "Notice F and Am share two notes. Your hand barely moves between them."
      },
      {
        "do": "Play them in order, four counts each, slow: Am, F, C, G, then back to Am. Keep looping.",
        "feel": "A gentle, rolling cycle. It should start to feel hypnotic."
      },
      {
        "do": "Smooth the changes by keeping common fingers planted. From Am to F, only one finger really moves.",
        "feel": "Lazy hands. Move the least amount possible between chords."
      },
      {
        "do": "Once the loop is steady, add a simple right-hand melody on top using only white keys: C, E, G held over the changes.",
        "feel": "The same notes sound different over each chord. That is the pop formula doing the work for you."
      }
    ],
    "goodWhen": "You can loop Am-F-C-G four counts per chord at 80bpm without stopping to find keys, and play a few right-hand notes over the top.",
    "watchOut": "Most beginners pause and hunt for the next chord, breaking the loop. Fix it by practicing just the two HARDEST changes back and forth (often G back to Am) until that jump is automatic, then drop it into the full loop.",
    "song": {
      "name": "Save Tonight (Eagle-Eye Cherry)",
      "note": "The whole song loops exactly these four chords, Am, F, C, G, from the first bar to the last. Once the loop is steady, you can play along with the record start to finish."
    }
  },

  "p-t2-4-bar-improv": {
    "what": "Improvisation just means making up music as you go. It sounds terrifying and it is actually a safe little sandbox. You set a chord loop running underneath, and on top you can only play certain safe notes, so nothing you play can sound wrong. This is your first taste of playing without sheet music.",
    "why": "Improvising is the difference between a player who recites and a player who speaks. Once you trust that you cannot hit a wrong note inside the box, the panic vanishes and you start to actually enjoy the keys. Every great pianist started exactly here.",
    "steps": [
      {
        "do": "Set up the loop in A minor, left hand: Am (A C E), then Dm (D F A), then E (E G# B), four counts each. This is i-iv-V.",
        "feel": "A moody, cinematic cycle. Let it run on autopilot."
      },
      {
        "do": "For the right hand, your only safe notes are the A minor pentatonic: A, C, D, E, G. White keys, skip B and F.",
        "feel": "These five notes cannot sound wrong over the loop. That is your safety net."
      },
      {
        "do": "Play just ONE of those notes per bar, right hand, in time with the left. Nothing fancy.",
        "feel": "One note, held, breathing. Silence is allowed and sounds great."
      },
      {
        "do": "Now play two or three of the safe notes per bar, in any order. Wander up, wander down.",
        "feel": "You are making a melody out of thin air. No one wrote this."
      },
      {
        "do": "Improvise for a full eight bars without stopping, even if you repeat yourself.",
        "feel": "Keep going through any wrong-feeling moment. Momentum beats perfection."
      }
    ],
    "goodWhen": "You can keep the i-iv-V loop going in your left hand and improvise eight bars of right-hand notes from the A minor pentatonic without freezing or stopping.",
    "watchOut": "The big trap is panicking when something sounds off and slamming to a halt. Inside the pentatonic there are no wrong notes, only notes you lean on longer or shorter. When in doubt, hold one note and breathe. Never stop the left hand.",
    "song": {
      "name": "Mad World (Gary Jules)",
      "note": "Its haunting feel comes from a minor loop just like this one. Improvising over it is how you find your own version."
    }
  },

  "p-t2-transcribe": {
    "what": "This is playing by ear: hearing a tune in your head and finding it on the keys with no sheet music at all. It feels like a superpower and it is really just trial and error done patiently. You hum a note, you hunt for it, you keep the ones that match. Anyone can do it.",
    "why": "Playing by ear frees you from the page forever. You hear a melody on the radio, in a film, in your own head, and you can put it on the piano. It trains your ear and your hands to talk to each other, which is the deepest musical skill there is.",
    "steps": [
      {
        "do": "Start in C major, all white keys. Sing the first line of Happy Birthday out loud.",
        "feel": "Feel whether the tune goes UP, DOWN, or stays the SAME between words."
      },
      {
        "do": "Find the first note by hunting. Happy Birthday starts on G. Sing the word, press a white key, does it match? If not, slide up or down one key.",
        "feel": "Match the pitch in your voice to the pitch under your finger."
      },
      {
        "do": "Move one note at a time, matching each syllable. When a key is wrong, the wrongness is obvious. Slide until it is right, then keep it.",
        "feel": "Right notes click into place. Wrong ones grate. Trust your ear."
      },
      {
        "do": "Once Happy Birthday lands, do the same with Ode to Joy in C: it starts on E and mostly steps up and down by neighbours.",
        "feel": "Ode to Joy walks gently by single steps. Easy to hunt."
      },
      {
        "do": "Play each tune three times until your hand remembers the path without hunting.",
        "feel": "The melody becomes a route your fingers know, not a search."
      }
    ],
    "goodWhen": "You can play Happy Birthday and Ode to Joy by ear in C major, with no notation, finding the notes yourself.",
    "watchOut": "Beginners try to find every note instantly and give up when one is wrong. A wrong note is not failure, it is information: it tells you to slide up or down. Hunt patiently, one neighbour key at a time, and you will always find it.",
    "song": {
      "name": "Happy Birthday",
      "note": "The most useful tune in the world to know by ear, and a perfect first ear-training target in C major."
    }
  },

  "p-key-D": {
    "what": "D major is a bright, open, daylight kind of key. It is the scale starting on D, and it uses two black keys: F sharp and C sharp. Those two sharps are what give D major its lift and sparkle compared to plain old C major.",
    "why": "D major is the home of countless upbeat pop, folk, and worship songs. Learning it adds a brighter colour to your playing and gets you comfortable reaching for black keys, which is the next big step beyond all-white-key C major.",
    "steps": [
      {
        "do": "Find D: the white key right in the MIDDLE of the group of two black keys.",
        "feel": "D sits snug between the two blacks. It is the easiest landmark on the piano."
      },
      {
        "do": "Play the D scale, right hand, up: D, E, F#, G, A, B, C#, D. F# and C# are the black keys just above F and C.",
        "feel": "Two little lifts onto black keys. Thumb tucks under after F# to keep climbing."
      },
      {
        "do": "Play the D triad: D, F#, A together. Thumb on D, middle on F#, pinky on A.",
        "feel": "Bright and resolved. That sharp F# is what makes it shine."
      },
      {
        "do": "Play the four big pop chords in D: D, A, B minor (B D F#), G. That is I-V-vi-IV.",
        "feel": "Hear that classic, uplifting pop cycle. You have played this shape before, now in a brighter key."
      }
    ],
    "goodWhen": "You can play the D scale hands-separately hitting F# and C# without hunting, and move cleanly through the I-V-vi-IV chords D, A, Bm, G.",
    "watchOut": "The most common slip is forgetting the C sharp near the top of the scale and playing plain C, which sounds instantly sour. Say the two sharps out loud before you start: F sharp, C sharp. Make them a habit, not an afterthought.",
    "song": {
      "name": "With or Without You (U2)",
      "note": "It loops D, A, Bm, G in the key of D the whole way through, exactly the I-V-vi-IV family. D major is the bright home this song lives in."
    }
  },

  "p-key-em": {
    "what": "E minor is the dark, cinematic, emotional cousin of bright G major. It is the scale starting on E using only white keys plus one black key, F sharp. It is the sound of sad films, epic builds, and songs that ache. Same notes as G major, completely different mood.",
    "why": "E minor is where you reach when you want feeling: longing, tension, drama. It is the relative minor of G, so it shares the same notes but lands somewhere heavier. Learning it gives you an emotional gear to shift into whenever a major key feels too cheerful.",
    "steps": [
      {
        "do": "Find E: the white key just to the RIGHT of the group of two black keys.",
        "feel": "E sits right after the two-black-key group. Easy to spot."
      },
      {
        "do": "Play the E natural minor scale, right hand: E, F#, G, A, B, C, D, E. Only F# is black, the rest are white.",
        "feel": "It climbs like a sadder, more serious version of a major scale."
      },
      {
        "do": "Play the E minor triad: E, G, B together. Thumb on E, middle on G, pinky on B.",
        "feel": "Hollow and moody. Compare it to a happy major chord and feel the drop."
      },
      {
        "do": "Play a loop in Em: Em (E G B), C (C E G), G (G B D), D (D F# A). That is i-VI-III-VII.",
        "feel": "A swelling, cinematic cycle. Let it build."
      },
      {
        "do": "Play that same loop two ways: once soft and tender, once heavy and forceful. Only your touch changes.",
        "feel": "The notes are identical. The emotion is yours to set."
      }
    ],
    "goodWhen": "You can play the E natural minor scale hands-separately, hold an Em triad, and loop i-VI-III-VII in two clearly different moods just by changing your touch.",
    "watchOut": "Beginners play minor keys timid and quiet because they sound sad, which makes them lifeless. Minor is not weak, it is intense. Commit fully: play the soft version genuinely tender and the heavy version genuinely forceful. The drama lives in your touch.",
    "song": {
      "name": "Born to Die (Lana Del Rey)",
      "note": "It leans on Em, C, G, D, exactly this loop, for its aching, cinematic feel. It is the perfect proof that the E minor world carries the deepest emotion."
    }
  },

  "p-t3-lead-sheet": {
    "what": "A lead sheet is the cheat code real musicians use: just the melody written on the staff, with chord symbols like C, Am, F floating above it. No left-hand part is written out. You read the symbol, you build the chord yourself. This is how pros play thousands of songs from one thin book.",
    "why": "Lead sheets unlock the entire world of jazz, pop, and standards from fake books. Once you can comp a chord symbol with your left hand while your right hand reads the melody, you can sit down at any piano and play almost anything someone puts in front of you.",
    "steps": [
      {
        "do": "Take a simple lead sheet bar: the symbol above says C, the melody notes below are on the staff. Read the symbol first.",
        "feel": "Symbol equals left hand. Staff equals right hand. Two separate streams."
      },
      {
        "do": "Left hand, see C, play a C triad (C E G) and hold it for the whole bar. This is comping.",
        "feel": "One solid chord per bar, held. No rush."
      },
      {
        "do": "Right hand, read the melody note on the staff and play it on top while the chord holds.",
        "feel": "The written melody rides over your invented left-hand chord."
      },
      {
        "do": "When the symbol changes (say to Am), drop the old chord and grab the new triad (A C E) at the start of the next bar.",
        "feel": "Change the left hand exactly when the symbol changes, not before, not after."
      },
      {
        "do": "Play four bars in real time: read symbol, grab chord, read melody, play it. Keep a steady pulse.",
        "feel": "Eyes scan ahead. You are reading two lines at once and turning them into sound."
      }
    ],
    "goodWhen": "You can play through a short lead sheet in real time, comping each chord symbol in the left hand while your right hand reads and plays the written melody, changing chords on the right beat.",
    "watchOut": "The classic mistake is staring at the chord symbols and losing the melody, or freezing when a new symbol appears. Practice the chord changes alone first, hands-on the symbols only, until grabbing each triad is automatic. Then the right hand has room to read.",
    "song": {
      "name": "Fly Me to the Moon (Frank Sinatra)",
      "note": "A standard found in every fake book as a lead sheet. Comping its chord symbols while reading the melody is exactly this skill in action."
    }
  },

  "p-t3-three-moods": {
    "what": "Here is the secret that separates a musician from a typist: the SAME notes can break a heart, pick a fight, or shrug in defeat, depending entirely on HOW you play them. You take one chord progression and perform it three completely different ways, changing nothing but your touch and timing. The notes are just the words. You supply the meaning.",
    "why": "This is where you stop playing notes and start playing music. Once you feel that tender, angry, and resigned all live inside the same four chords, you own the emotional dial. Every song you ever play gets deeper because you decide what it means, not the page.",
    "steps": [
      {
        "do": "Learn the loop in C: Am (A C E), F (F A C), C (C E G), G (G B D). That is vi-IV-I-V. Memorise it cold.",
        "feel": "Get it automatic so your hands are free to FEEL instead of hunt."
      },
      {
        "do": "Play it TENDER: very soft, slightly behind the beat, let each chord linger and overlap.",
        "feel": "Like a lullaby. Gentle, slow, almost hesitant. The dynamics stay quiet."
      },
      {
        "do": "Play it ANGRY: loud, sharp, dead on the beat, hands hitting the keys hard and releasing fast.",
        "feel": "Aggressive and punchy. Same chords, now they want to fight."
      },
      {
        "do": "Play it RESIGNED: medium volume, dragging, slightly late, like a sigh that has given up.",
        "feel": "Heavy and tired. The energy drains out of each chord."
      },
      {
        "do": "Play all three back to back so you HEAR that only your touch and timing changed.",
        "feel": "Three emotions, one set of notes. That gap is where music actually lives."
      }
    ],
    "goodWhen": "You can play vi-IV-I-V three times so a listener could guess tender, angry, and resigned without you saying a word, with only touch and timing changing between them.",
    "watchOut": "Beginners think emotion comes from playing the right notes. It does not, it comes from dynamics and timing. If your three versions sound the same, you are not committing. Exaggerate wildly: make tender almost too soft and angry almost too hard. Subtlety comes later.",
    "song": {
      "name": "Hallelujah (Leonard Cohen)",
      "note": "Covered a thousand ways, raw to reverent to broken, all from nearly the same chords. It is living proof that touch and timing carry the whole meaning."
    }
  },

  "p-t3-pop-pull": {
    "what": "This is the real-world payoff: hearing a song you half-know on a speaker and pulling it onto the piano yourself, by ear, with no chord chart or tutorial. You find the melody, then you find a chord to sit under each line. It feels like decoding a secret, and after this node you can do it to almost any pop song.",
    "why": "This is musical independence. No more waiting for a tutorial. You hear something you love, you sit down, and you figure it out. It combines everything: ear training, chords, the pop formula, and trust in yourself. It is the skill that makes the piano truly yours.",
    "steps": [
      {
        "do": "Put on a song you half-know. Loop the chorus. First, just find the melody by ear, hunting one note at a time like you did with Happy Birthday.",
        "feel": "Get the tune under your right hand first. Ignore chords for now."
      },
      {
        "do": "Now find the key. Play the lowest, most settled-sounding melody note. That note is usually your tonic and names the key.",
        "feel": "The home note feels like rest. Everything wants to land there."
      },
      {
        "do": "For the first bar, try the obvious chords from that key under the melody. Pop songs almost always use the four-chord family.",
        "feel": "When the chord fits, it locks in and the melody glows. When it clashes, you hear it instantly."
      },
      {
        "do": "Move bar by bar, testing one chord per bar until each one clicks. Most pop choruses cycle through just three or four chords.",
        "feel": "It is a small guessing game with obvious right answers. Trust your ear's reaction."
      },
      {
        "do": "Play the whole chorus along with the record: your melody on top, your found chords underneath.",
        "feel": "You and the recording lining up. That is the proof you cracked it."
      }
    ],
    "goodWhen": "You can take a half-known pop song, find its melody by ear, and place a fitting chord under each bar of the chorus so it plays along convincingly with the recording.",
    "watchOut": "The biggest stall is trying to find chords and melody at the same time and drowning. Always get the melody first, alone. Then find the key. Then chords come fast because the four-chord family is nearly always the answer. Separate the jobs.",
    "song": {
      "name": "Let Her Go (Passenger)",
      "note": "A chorus built on the standard four-chord pop family. Pulling it off the record by ear is the perfect first target for this skill."
    }
  },

  "p-t3-ii-v-i": {
    "what": "The ii-V-I is the heartbeat of jazz. It is a three-chord move that creates tension and then releases it, like a question that gets a satisfying answer. You will play it with shell voicings, which means stripping each chord down to just two essential notes so your hands stay light and the harmony stays clear. This is your first real jazz cadence.",
    "why": "Once you hear and play a ii-V-I, you have the door key to jazz, standards, and bossa nova. This single progression appears in thousands of jazz tunes. Learning it with shells trains your ear to feel pull-and-resolve, the engine that makes jazz sound like jazz.",
    "steps": [
      {
        "do": "In the key of C, name the three chords: ii is Dm, V is G, I is C. Play their plain triads first to hear the question-and-answer shape.",
        "feel": "Dm leans into G, G pulls hard, C is home. Tension, more tension, rest."
      },
      {
        "do": "Now strip to shell voicings, left hand. For Dm7 play just D and C. For G7 play just F and B. For Cmaj7 play just E and B.",
        "feel": "Two notes per chord. Light and open, the sound of a jazz pianist's left hand."
      },
      {
        "do": "Move slowly: Dm shell, G shell, C shell. Notice how few fingers move between them. From G7 to Cmaj7, the F just slides down to E while the B stays put.",
        "feel": "Smooth, lazy hand. The notes glide rather than jump. That smoothness IS jazz."
      },
      {
        "do": "Right hand, play a tiny melody that LANDS on a chord tone when each chord changes: end your phrase on a note that is inside the new chord.",
        "feel": "Landing on a chord tone feels like the phrase clicks into place."
      },
      {
        "do": "Play the same ii-V-I in the key of F: ii is Gm, V is C, I is F. Same shapes, new home.",
        "feel": "The exact same pull-and-release feeling, transposed. Now you OWN the move."
      }
    ],
    "goodWhen": "You can play a ii-V-I in both C and F using shell voicings in the left hand, with a right-hand line that resolves onto a chord tone as each chord changes.",
    "watchOut": "Beginners play all the notes of each full chord and it gets muddy and stiff. The whole point of shells is restraint: two well-chosen notes say more than five. Keep the left hand light and let the right hand sing. Less is the sound you are after.",
    "song": {
      "name": "Autumn Leaves",
      "note": "The most famous ii-V-I teaching tune in jazz. Its whole skeleton is ii-V-I chains, so the moment you have this cadence you can start reading it."
    }
  },

  "p-t3-blues": {
    "what": "The 12-bar blues is a fixed 12-bar chord pattern that the entire blues, rock, and early jazz world is built on. Once it is in your hands, you have permission to just PLAY: roots in the left hand, a fistful of blue-sounding notes in the right, and you make it up as you go. No sheet music, no rules, only feel.",
    "why": "The 12-bar blues is the most generous form in music. The chords are always the same, so your right hand is free to improvise forever and it always sounds right. This is where you finally play loose, soulful, and free. It is the form that taught the whole world to jam.",
    "steps": [
      {
        "do": "Learn the 12-bar shape in C: four bars of C, two bars of F, two bars of C, one bar of G, one bar of F, two bars of C.",
        "feel": "It is a 12-bar loop that comes home every time. Count the bars out loud."
      },
      {
        "do": "Left hand plays just the root note of each chord: C for the C bars, F for the F bars, G for the G bar. Keep a steady pulse.",
        "feel": "A grounded, walking heartbeat under everything. Simple and solid."
      },
      {
        "do": "Right hand, your safe notes are the C minor pentatonic: C, Eb, F, G, Bb. Plus the blue note, the Gb between F and G, for grit.",
        "feel": "These notes cannot sound wrong over the blues. The blue note adds the ache."
      },
      {
        "do": "Improvise short right-hand licks from those notes over the moving left hand. Leave gaps, repeat ideas, bend the timing.",
        "feel": "Talk with the notes. A lick, a pause, an answer. Conversation, not a recital."
      },
      {
        "do": "Play it SWUNG: let each pair of beats fall long-then-short instead of even. That lazy lope is the blues feel.",
        "feel": "Loose and rolling, never stiff or square. Swing is the whole personality of the blues."
      }
    ],
    "goodWhen": "You can play the 12-bar blues in C with roots in the left hand and improvised C minor pentatonic licks plus the blue note in the right, all with a swung, relaxed feel.",
    "watchOut": "The killer mistake is playing it stiff and straight, which kills the blues stone dead. The blues lives in the swing and the space. Play your pairs of notes long-then-short, leave silence between licks, and let it breathe. Loose beats correct every time.",
    "song": {
      "name": "Hound Dog (Elvis Presley)",
      "note": "A straight-up 12-bar blues. The moment you have the 12-bar form and the pentatonic, you can jam over songs exactly like this all night."
    }
  },

  // ── Batch 3a — missing fundamentals ───────────────────────────────────────
  "p-t1-rhythm": {
    "what": "Every piece of music sits on top of a steady beat called the pulse, like a heartbeat you can tap along to. You lock onto it by counting: '1, 2, 3, 4' for the main beats, and '1 and 2 and 3 and 4 and' when you split each beat in half. This is rhythm, the skeleton every note you ever play hangs on.",
    "why": "A simple chord played exactly on the beat sounds right, and a beautiful chord played in the wrong spot in time sounds wrong. Locking onto a steady pulse is what makes you sound like you are playing with the music instead of just near it, and every song you will ever learn, from a nursery rhyme to a rock anthem, depends on this one skill first.",
    "steps": [
      {
        "do": "Turn on the app's metronome, set it to a comfortable 60 BPM, and just listen for a while. Don't play a note yet.",
        "feel": "Let your body find it before your fingers do: nod your head or tap your foot exactly on each click."
      },
      {
        "do": "Keep the metronome running and count out loud on every click, '1, 2, 3, 4, 1, 2, 3, 4,' but say the '1' a little louder and heavier than the rest. That '1' is the downbeat, the strongest beat in the group.",
        "feel": "The '1' should feel like a small stomp compared to the lighter '2, 3, 4' that follow it."
      },
      {
        "do": "Play one comfortable note, any key you like, exactly on every click for a full minute, still counting the numbers out loud and leaning on beat one.",
        "feel": "Boring on purpose. A rock solid, unshakeable lock is the entire goal here."
      },
      {
        "do": "Keep playing and counting, but now add an 'and' between each number: '1 and 2 and 3 and 4 and,' one word for every half beat.",
        "feel": "The 'and' should land exactly halfway between two clicks, not rushed toward the next number."
      },
      {
        "do": "Play a second, different note on every 'and' so your pattern now has two notes for every one click, evenly split.",
        "feel": "Like a smooth heartbeat that gained a little skip in the middle. Both notes should feel equally spaced."
      },
      {
        "do": "Raise the metronome to 90 BPM and repeat the whole pattern, counting out loud the entire time.",
        "feel": "If you rush or drag, slow the metronome back down. A slower, locked beat always beats a fast wobble."
      }
    ],
    "goodWhen": "You can hold a steady pulse and count both the quarter note beats and the eighth note subdivision out loud, locked to the metronome without drifting, at more than one tempo.",
    "watchOut": "The single most common mistake is speeding up on the exciting parts of a pattern and slowing down on the tricky ones. Fix it by trusting the click over your own sense of excitement, every time, even when the click feels too slow.",
    "song": {
      "name": "Symphony No. 5 (Beethoven)",
      "note": "Its famous opening motif is pure rhythm before it is melody: three short notes then one long note, repeated. Clap that exact pattern and you are already counting the same pulse you just built."
    }
  },

  "p-t2-pedal": {
    "what": "The sustain pedal is the right pedal under your foot. Press it and the sound keeps ringing even after you lift your fingers off the keys. The real skill is not just pressing it down, it is catching each new chord slightly late, a beat after your hand plays it, then lifting and pressing it again the instant the next chord arrives. Press it together with the chord and the old chord blurs into the new one. Lift it too early and there is a hole of silence. Timed right, one chord dissolves smoothly into the next with no gap and no smear.",
    "why": "Almost every ballad and piano cover you love owes its warm, flowing sound to this one foot movement. Play the same chords with no pedal, or with the pedal timed wrong, and it sounds thin, choppy, or muddy: nothing like the recording. Get the timing right and your playing suddenly sounds like a real pianist instead of someone just hitting keys.",
    "steps": [
      {
        "do": "Rest the ball of your right foot on the pedal, heel flat on the floor. Press it all the way down, then let it rise all the way back up. Do this slowly, ten times, with no hands on the keys yet.",
        "feel": "A smooth push from the ankle, not a stomp. Your heel never lifts."
      },
      {
        "do": "Play a C chord with your left hand and take your fingers off the keys. Listen to it die almost instantly. Now play it again, and this time press the pedal down right after the chord lands, not together with it.",
        "feel": "A small gap between the chord landing and your foot moving. That gap is the whole secret."
      },
      {
        "do": "Hold the pedal down under your C chord. Now play an F chord, and at the exact instant your hand strikes it, flick the pedal up and straight back down.",
        "feel": "Up and back down almost too fast to see. The old chord gets wiped clean and the new one gets caught, both in that one flick."
      },
      {
        "do": "Loop Am, F, C, G, one chord per bar. On every single change, flick the pedal up then down right as the new chord lands. Go around the loop four times without stopping.",
        "feel": "One continuous river of sound. A click of silence means you lifted too early. A muddy smear means you pressed back down too late."
      },
      {
        "do": "Play the opening of River Flows in You, or any slow song you know, using this same flick on every chord change.",
        "feel": "The pedal disappears completely. All you hear is the music flowing, which means it worked."
      }
    ],
    "goodWhen": "You can loop Am, F, C, G with the pedal flicking cleanly on every chord change, and a listener hears one smooth wash of sound with no gaps and no muddy overlap.",
    "watchOut": "The single biggest mistake is pressing the pedal down at the exact same instant your hand plays the new chord. That blends the old chord and the new one into a muddy mess. Fix it by hearing the new chord land first, then bringing the pedal down a beat behind it, every time, until the flick becomes automatic.",
    "song": {
      "name": "River Flows in You (Yiruma)",
      "note": "Its rippling patterns only sound washed and dreamy because the pedal catches each new harmony and clears the last one exactly on time. Play it with no pedal and it turns into a dry, choppy mess."
    }
  },

  "p-t2-inversions": {
    "what": "An inversion is the exact same chord, the same three notes, just rearranged so a different note sits on the bottom instead of the root. Play C, E, G with the C moved up an octave and you get E, G, C. Same chord, brand new bottom note.",
    "why": "This is what makes a chord change feel smooth instead of jumpy. Going from Am to F only truly takes one moving finger when F is played in its first inversion, not its root position. Learn this and every chord change in the pop formula gets shorter, calmer, and faster to reach.",
    "steps": [
      {
        "do": "Play a C major triad in root position: C, E, G, using thumb, middle finger, and pinky. Now move the bottom note up an octave so the order becomes E, G, C. That is first inversion, same chord, new bottom note.",
        "feel": "Same color, viewed from a new angle."
      },
      {
        "do": "Move the bottom note again: play G, C, E, with G now on the bottom. That is second inversion. A triad only has three notes, so it only has three possible bottoms, and you just played all of them.",
        "feel": "You ran out of new positions. Three notes, three inversions, one chord."
      },
      {
        "do": "Tour F the same way: root position F, A, C, then first inversion A, C, F, then second inversion C, F, A.",
        "feel": "The pattern repeats exactly. Every triad has the same three homes to live in."
      },
      {
        "do": "Tour G and A minor the same way. G: root G, B, D, first inversion B, D, G, second inversion D, G, B. A minor: root A, C, E, first inversion C, E, A, second inversion E, A, C.",
        "feel": "Four chords, twelve shapes total, and only one trick to learn."
      },
      {
        "do": "Now the real payoff. Play Am in root position: A, C, E. Instead of jumping down to F's root position, keep your thumb and middle finger exactly where they are, resting on A and C, and slide only your top finger up from E to F. You just played F, first inversion.",
        "feel": "One finger slides a short distance. The rest of your hand never left."
      },
      {
        "do": "Loop Am to F, first inversion, and back, four or five times: A, C, E, then A, C, F, then A, C, E again. Keep two fingers glued down the entire time.",
        "feel": "The change stops feeling like a leap and starts feeling like a small wiggle."
      }
    ],
    "goodWhen": "You can move from Am to F using F's first inversion so only one finger really travels, and you can find at least one other inversion for C, F, or G without hunting for it.",
    "watchOut": "The common mistake is treating an inversion as a brand new chord to memorize. It is not. The three notes are identical, only their order from bottom to top changes. If you catch yourself wondering whether it still counts as F, you are overthinking it. The note names in the chord never changed.",
    "song": {
      "name": "Let It Be (The Beatles)",
      "note": "Its chorus walks straight down C, G, Am, F, and that Am to F step is the exact move you just learned to soften: landing F in its nearest inversion instead of jumping to a new hand position each time."
    }
  },

  "p-t2-lh-patterns": {
    "what": "Your left hand does not have to sit frozen as one block chord all night. It can move: breaking a chord into single notes, alternating just the root and fifth, rolling a steady cycle, or bouncing between two octaves. Four different engines for the exact same chord.",
    "why": "A block chord that never moves is the reason your playing has felt stiff for weeks, the classic plateau where every note is correct but nothing sounds alive. These four moving patterns are what turn a held chord into real accompaniment, the difference between plunking notes and playing like an actual song.",
    "steps": [
      {
        "do": "Take the C chord you already hold as a block (C, E, G) and break it apart: play C, then E, then G, then C an octave up, one note at a time.",
        "feel": "The same chord, now flowing instead of frozen."
      },
      {
        "do": "Play the root-fifth pattern instead: just C, then G, alternating, and leave the E out entirely.",
        "feel": "Open and spacious, like the chord took a breath."
      },
      {
        "do": "Roll a simple arpeggio pattern under the chord: root, fifth, octave, fifth, on repeat in a steady loop.",
        "feel": "A gentle rocking motion, back and forth on the beat."
      },
      {
        "do": "Switch to octave bass: play low C, then the C an octave higher, back and forth, leaning into the low note each time.",
        "feel": "A driving pulse under everything, like a heartbeat."
      },
      {
        "do": "Loop C, F, G, C and pick a different left-hand pattern for each chord while your right hand plays the melody you already know.",
        "feel": "Same tune on top, a completely different engine underneath."
      }
    ],
    "goodWhen": "You can loop C, F, G, C switching between all four left-hand patterns without losing the beat or dropping a note.",
    "watchOut": "The biggest mistake is rushing a pattern until it turns to mush. Slow down until every note in the pattern rings clean and even, then speed up only once it is steady.",
    "song": {
      "name": "River Flows in You (Yiruma)",
      "note": "The left hand rolls a continuous broken chord pattern under the melody for almost the whole piece, exactly the moving accompaniment you just practiced."
    }
  },

  // ── Batch 3b — hands-together, more keys, articulation, whole-song milestone ──
  "p-t1-articulation": {
    "what": "Articulation is how you shape each note: do you hold it smooth and connected into the next one, or clip it short so there is a tiny silence before the next? Smooth and connected is called legato. Short and detached is called staccato. Same notes, same rhythm, completely different feeling, and you choose which one on purpose.",
    "why": "Touch is feeling. A melody played legato sounds tender, singing, and flowing; the exact same melody played staccato sounds crisp, light, and playful. Once you can switch between the two on command, you stop playing notes and start playing music. It is one of the simplest, most powerful expression levers you have, and it pairs with the pedal and dynamics you meet later.",
    "steps": [
      {
        "do": "Play the five-finger pattern C D E F G, and this time hold each key down right until your next finger presses, so there is never a gap of silence. That is legato: smooth and connected.",
        "feel": "The sound is one unbroken line, like drawing without lifting your pen."
      },
      {
        "do": "Now play the same C D E F G, but release each key the instant you press it, so a little silence sits between every note. That is staccato: short and detached.",
        "feel": "Bouncy and crisp, like the notes are hopping instead of walking."
      },
      {
        "do": "Alternate: play the pattern legato once, then staccato once, back and forth, keeping the notes and the tempo exactly the same. Only your touch changes.",
        "feel": "Same five notes, two totally different moods, and you are steering it."
      },
      {
        "do": "Take a tiny melody you know, like the first line of Twinkle Twinkle (C C G G A A G), and play it fully legato, then fully staccato.",
        "feel": "Legato makes it a lullaby; staccato makes it a music box. Hear the whole character flip."
      }
    ],
    "goodWhen": "You can play the same line clearly legato (smoothly connected, no gaps) and clearly staccato (short and detached, silence between notes), switching between the two on purpose without changing the notes or the speed.",
    "watchOut": "The most common mistake is a mushy in-between where legato has little gaps and staccato is not really short, so both sound the same. Fix it by exaggerating: for legato, keep each finger down until the next is fully pressed; for staccato, snap each finger up like the key is hot.",
    "song": {
      "name": "Für Elise (Beethoven)",
      "note": "Its famous opening trades between smooth legato runs and light detached notes. Once you can control articulation, you can shape those exact contrasts instead of playing every note the same way."
    }
  },

  "p-t2-hands-together": {
    "what": "Until now every scale you learned was hands-separate, one hand at a time, and you were only ever shown the right-hand fingering. This teaches the missing half: the LEFT-hand fingering for a scale, and how to play both hands on the same scale at once. The left hand has its own finger pattern, and going up it is a mirror of the right: the third finger crosses OVER the thumb instead of the thumb tucking under.",
    "why": "The C major fluency check already asks you to play the scale hands together, but nothing has taught you how. Two hands moving as one is the coordination almost every real piece needs. Learn the left-hand fingering and the trick of syncing both hands, and scales stop being a right-hand-only exercise and become something your whole body can do.",
    "steps": [
      {
        "do": "Left hand alone, C major going up: start with your PINKY (finger 5) on the low C, then 4, 3, 2, thumb on G, then cross your THIRD finger over the thumb onto A, then 2, then thumb on the top C. So the fingers are 5-4-3-2-1-3-2-1.",
        "feel": "Where the right thumb TUCKS UNDER, the left third finger CROSSES OVER. Same idea, mirrored."
      },
      {
        "do": "Play the left-hand C scale up and back down a few times, slow, watching that third-finger cross-over land smoothly on A going up.",
        "feel": "Smooth as a walk, no lurch at the cross-over point."
      },
      {
        "do": "Now the right hand alone, the fingering you already know: thumb on C, 2, 3, tuck the thumb under after E onto F, then 2, 3, 4, 5 on the top C. That is 1-2-3-1-2-3-4-5.",
        "feel": "The familiar right-hand tuck under, back in your fingers."
      },
      {
        "do": "Put them together VERY slowly: both thumbs would land on different notes, so just move one note at a time, both hands, up the scale together. Say each note out loud as both hands play it.",
        "feel": "Awkward at first, then it clicks. Both hands are climbing the same ladder."
      },
      {
        "do": "Once C is steady hands together, do the same with G major, remembering the F sharp in both hands.",
        "feel": "Same coordination, a new key. Now you own hands-together scales."
      }
    ],
    "goodWhen": "You can play the C and G major scales hands together, up and down, slow and even, using the correct left-hand fingering (third finger crossing over the thumb after the fifth note) without either hand stumbling at the cross-over or tuck.",
    "watchOut": "The number-one mistake is trying to play hands together at full speed before either hand is solid alone. Fix it by getting each hand fluent SEPARATELY first, then playing hands together painfully slowly, one note at a time. Speed comes free once the coordination is there.",
    "song": {
      "name": "Ode to Joy (Beethoven)",
      "note": "Playing its melody in the right hand with a simple chord or bass line in the left is a first real hands-together piece. The scale coordination you just built is exactly what lets both hands work at once."
    }
  },

  "p-key-A": {
    "what": "A major is a bright, ringing key built on three sharps: F sharp, C sharp, and G sharp. It is the scale starting on A, and those three black keys give it a clear, brilliant sound. It uses the exact same fingering pattern as C, G, and D major, so your fingers already know the moves, you just aim for three black keys instead.",
    "why": "A major is one of the most common keys in pop, rock, and worship music, because it sits perfectly for guitars and singers, and piano shares those songs. Learning it adds a bright colour and, more importantly, gets you comfortable with a key that has several sharps, proving the scale pattern stays the same no matter how many black keys join in.",
    "steps": [
      {
        "do": "Find A: the white key between the second and third black keys of a group of three (the same landmark as A minor). Put your right thumb on it.",
        "feel": "A sits snug just left of the last of the three black keys."
      },
      {
        "do": "Play the A scale going up: A, B, C sharp, D, E, F sharp, G sharp, A. The three sharps (C#, F#, G#) are the black keys just above C, F, and G. Tuck your thumb under after C sharp to keep climbing.",
        "feel": "Three little lifts onto black keys, but the thumb-tuck happens in the same spot as always."
      },
      {
        "do": "Play the A triad: A, C sharp, E together, thumb, middle, pinky.",
        "feel": "Bright and full. That C sharp in the middle is what makes it major and shining."
      },
      {
        "do": "Play the four big pop chords in A: A, E, F sharp minor (F# A C#), D. That is I-V-vi-IV.",
        "feel": "Hear that instantly familiar, uplifting pop cycle, now in a brighter home."
      }
    ],
    "goodWhen": "You can play the A major scale hands-separately hitting all three sharps (F#, C#, G#) without hunting, hold an A triad, and move through the I-V-vi-IV chords A, E, F#m, D.",
    "watchOut": "The most common slip is forgetting the G sharp near the top of the scale and playing plain G, which sounds instantly wrong. Say all three sharps out loud before you start: F sharp, C sharp, G sharp. Make them a habit, not a surprise.",
    "song": {
      "name": "Take Me Home, Country Roads (John Denver)",
      "note": "It lives in A major and leans on A, E, F#m, and D, the exact I-V-vi-IV family (in singalong order) you just built. A major is the warm, ringing home this classic sits in."
    }
  },

  "p-key-E": {
    "what": "E major is a ringing, anthemic key built on four sharps: F sharp, C sharp, G sharp, and D sharp. It is the scale starting on E, and it is one sharp brighter than A major, adding a D sharp on top of A's three sharps. Same fingering pattern as C, G, D, and A, just reaching for four black keys.",
    "why": "E major is the home of huge rock and pop anthems, again because it loves the guitar and the singing voice, and piano gets to play along. It is your most sharp-heavy key yet, and clearing it proves the big lesson for good: a major scale is one fixed pattern, and the number of black keys never changes how your fingers move.",
    "steps": [
      {
        "do": "Find E: the white key just to the RIGHT of a group of two black keys. Put your right thumb on it.",
        "feel": "E sits right after the two-black-key group, an easy landmark."
      },
      {
        "do": "Play the E scale going up: E, F sharp, G sharp, A, B, C sharp, D sharp, E. Four sharps (F#, G#, C#, D#). Tuck your thumb under after G sharp to keep climbing.",
        "feel": "Lots of black keys, but the thumb still tucks in the usual place."
      },
      {
        "do": "Play the E triad: E, G sharp, B together, thumb, middle, pinky.",
        "feel": "Big and bright. The G sharp in the middle rings like a bell."
      },
      {
        "do": "Play the four big pop chords in E: E, B, C sharp minor (C# E G#), A. That is I-V-vi-IV.",
        "feel": "The same uplifting cycle you know, now in the most anthemic key on the piano."
      }
    ],
    "goodWhen": "You can play the E major scale hands-separately hitting all four sharps (F#, G#, C#, D#) without hunting, hold an E triad, and move through the I-V-vi-IV chords E, B, C#m, A.",
    "watchOut": "With four sharps, the easy mistake is dropping one, usually the D sharp near the top, and landing on plain D. Say all four out loud first: F sharp, G sharp, C sharp, D sharp. Go slow enough that every black key is deliberate, not a scramble.",
    "song": {
      "name": "Don't Stop Believin' (Journey)",
      "note": "Its unmistakable verse loops E, B, C#m, A, exactly the I-V-vi-IV family you just built, in the key of E major. Learn the four chords and you are playing one of the most famous singalongs ever written."
    }
  },

  "p-key-dm": {
    "what": "D minor is the dark, cinematic cousin of the warm F major you already know. It uses the exact same one flat, B flat, but starts on D instead of F, which flips the whole feeling from gentle to sad and dramatic. Its three-note chord, D minor, is D, F, A. It is the relative minor of F, the sad twin of a happy key.",
    "why": "D minor is one of the most emotionally powerful early keys, the sound of film scores, tragic ballads, and brooding intros. Because it shares F major's single flat, it is nearly free once you know F: same notes, new home, completely different mood. It also deepens your ear for major versus minor, the biggest lever of feeling in music.",
    "steps": [
      {
        "do": "Find D: the white key right in the MIDDLE of a group of two black keys. Put your right thumb on it.",
        "feel": "D is the easiest landmark on the piano, snug between the two blacks."
      },
      {
        "do": "Play the D natural minor scale going up: D, E, F, G, A, B flat, C, D. Only one black key, B flat, the same flat as F major. Tuck your thumb under after F to keep climbing.",
        "feel": "It climbs like a serious, shadowed version of a major scale."
      },
      {
        "do": "Play the D minor triad: D, F, A together, thumb, middle, pinky.",
        "feel": "Hollow and aching, where the F major chord felt warm and settled. That drop is minor."
      },
      {
        "do": "Play a i-iv-V-i progression: D minor (D F A), G minor (G B flat D), A major (A C sharp E), back to D minor, four counts each.",
        "feel": "Listen hard to that A major chord. It strains with its C sharp, then RESOLVES home to D minor, just like the E chord did in A minor. Tension and release is the engine of sad music."
      }
    ],
    "goodWhen": "You can play the D natural minor scale catching the B flat, hold a D minor triad, and play the i-iv-V-i loop so the A major chord clearly pulls back home to D minor, sounding like a sigh coming to rest.",
    "watchOut": "The common confusion is thinking D minor needs different notes than F major. It does not, they share the same one flat, B flat. The only thing that changes is your home note, D. In the i-iv-V loop, remember the A chord is A MAJOR (with a C sharp), which is what gives it the strong pull home.",
    "song": {
      "name": "Mad World (Gary Jules)",
      "note": "Its haunting, aching feel lives in this D minor world. The dark triad and the pull back home you just practiced are the exact heartbeat of that kind of cinematic sadness."
    }
  },

  "p-t2-first-song": {
    "what": "This is the milestone everything else has been building toward: playing one whole song, all the way through, both hands, without stopping. Not a drill, not a fragment, a real complete song, start to finish. You pick it: any song the app has suggested to you, or one of your own you have always wanted to play.",
    "why": "Every skill so far has been a piece of the puzzle. This is the moment they come together into the thing you actually wanted: sitting down and playing a song for real. Finishing a whole piece, even a simple one, is the single biggest jolt of motivation in learning an instrument. It proves to you, in your own hands, that you are genuinely playing now.",
    "steps": [
      {
        "do": "Choose ONE song you can mostly handle: something from the songs the app has already suggested for the chords you know, or a simple song of your own. Pick something you love, not something impressive.",
        "feel": "Excitement, not pressure. This is the fun part."
      },
      {
        "do": "Break it into small sections (verse, chorus, bridge). Learn each section hands-separate first, then hands together, one section at a time. Do not move on until a section flows.",
        "feel": "Small wins stacking up. Each section that clicks makes the next feel closer."
      },
      {
        "do": "Stitch the sections together, playing from one straight into the next. Go slow enough that you never have to stop to think.",
        "feel": "The seams between sections disappear. It starts to feel like one piece."
      },
      {
        "do": "Now play the WHOLE song start to finish at a slow, steady tempo without stopping, even if you hit wrong notes. Keep going to the end no matter what.",
        "feel": "Momentum. Playing THROUGH mistakes instead of restarting is the real skill of performing."
      },
      {
        "do": "Do that full run-through again on your next practice session too, so it is not a one-time fluke. Two clean-ish complete passes on two different days means you truly have it.",
        "feel": "Solid and repeatable, not a lucky accident. This is yours now."
      }
    ],
    "goodWhen": "You can play your chosen song from beginning to end, both hands, at a slow steady tempo, without stopping, on two separate practice sessions. Small mistakes are fine as long as you keep going to the end.",
    "watchOut": "The biggest trap is restarting from the top every time you hit a wrong note, so you never actually reach the end. Fix it by making a rule: once you start a full run-through, you are not allowed to stop or go back. Play through every mistake to the final note.",
    "song": {
      "name": "Your song, your choice",
      "note": "This milestone is deliberately song-agnostic. Whatever you have been dreaming of playing, or whatever the app suggested for the chords you know, THAT is the song. Finishing it is the point."
    }
  },
};
