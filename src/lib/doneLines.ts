// Rotating warm exit lines. No hype. No XP. Thoughtful older sibling energy.

export const DONE_LINES: string[] = [
  "That counts.",
  "Hands were here today.",
  "Good session.",
  "Five minutes is five minutes more than zero.",
  "The piece is a little more yours than it was this morning.",
  "The pianist shows up.",
  "You were the pianist for a while.",
  "A small deposit. That's all this ever is.",
  "The hands will remember.",
  "That sounded like you.",
  "Nothing dramatic. Something real.",
  "You didn't need to play today. You did anyway.",
  "Come back whenever.",
  "One more thread added to the rope.",
  "You opened the file. That was the hardest part.",
  "Night playing counts twice.",
  "The keys were warmer when you left.",
  "Something in there is closer than before.",
  "Your ear was awake tonight.",
  "You tried a thing. It's in the bank.",
  "Neither bad nor good. Just — played.",
  "Quiet work. That's the whole craft.",
  "Tiny progress. The right kind.",
  "Keep going. Or don't. Either way.",
  "Stay a pianist. See you next time.",
  "A bar was a bar tonight.",
];

export function doneLineFor({ minutes, ghostKeyName, pieceTitle }: { minutes: number; ghostKeyName: string; pieceTitle?: string }): string {
  // Lightly contextual — prefer specific lines sometimes.
  const options: string[] = [...DONE_LINES];
  if (minutes <= 3) options.push("Two minutes on the bench counts as a session here.");
  if (minutes >= 45) options.push(`You were the pianist for ${minutes} minutes.`);
  if (ghostKeyName) options.push(`${ghostKeyName} got a little more familiar.`);
  if (pieceTitle) options.push(`${pieceTitle} is a little more yours than it was this morning.`);
  const idx = (Math.floor(Date.now() / 1000) + minutes) % options.length;
  return options[Math.max(0, idx)] ?? "That counts.";
}
