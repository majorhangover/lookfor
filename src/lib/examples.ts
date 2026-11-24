import type { Region } from "./types";

/**
 * Example requests shown (and rotated) in the chat box placeholder, so
 * visitors see the kinds of things they can ask: different people, ages,
 * interests and budgets. Built deterministically so the server and browser
 * render the same first example.
 */

type Who = { who: string; likes: string[] };

// People, each with interests that suit them.
const PEOPLE: Who[] = [
  { who: "my 3 year old son", likes: ["diggers", "dinosaurs", "trains"] },
  { who: "my 4 year old granddaughter", likes: ["unicorns", "dressing up", "Peppa Pig"] },
  { who: "my 6 year old daughter", likes: ["drawing", "horses", "slime"] },
  { who: "my 7 year old nephew", likes: ["dinosaurs", "Lego", "football"] },
  { who: "my 8 year old niece", likes: ["crafts", "animals", "science experiments"] },
  { who: "my 9 year old son", likes: ["Minecraft", "magic tricks", "football"] },
  { who: "my 10 year old granddaughter", likes: ["baking", "gymnastics", "Harry Potter"] },
  { who: "my 11 year old grandson", likes: ["space", "coding", "rugby"] },
  { who: "my 13 year old daughter", likes: ["make-up", "K-pop", "art"] },
  { who: "my 14 year old son", likes: ["gaming", "basketball", "music"] },
  { who: "my 16 year old niece", likes: ["fashion", "photography", "skincare"] },
  { who: "my 17 year old nephew", likes: ["the gym", "cars", "music"] },
  { who: "my brother in his 20s", likes: ["cooking", "board games", "running"] },
  { who: "my sister", likes: ["yoga", "reading", "candles"] },
  { who: "my husband", likes: ["golf", "whisky", "gadgets"] },
  { who: "my wife", likes: ["gardening", "jewellery", "true crime podcasts"] },
  { who: "my boyfriend", likes: ["coffee", "cycling", "vinyl records"] },
  { who: "my girlfriend", likes: ["plants", "pottery", "travel"] },
  { who: "my dad in his 60s", likes: ["fishing", "history", "DIY"] },
  { who: "my mum", likes: ["gardening", "baking", "crosswords"] },
  { who: "my grandad who's 80", likes: ["birdwatching", "cricket", "jigsaws"] },
  { who: "my nan", likes: ["knitting", "tea", "puzzles"] },
  { who: "my best friend", likes: ["gin", "festivals", "pampering"] },
  { who: "a work colleague", likes: ["coffee", "desk plants", "chocolate"] },
  { who: "my son's teacher", likes: ["reading", "tea", "stationery"] },
];

const BUDGETS = [10, 15, 20, 25, 30, 40, 50, 75, 100];

/** Fixed examples for occasions with a natural recipient. */
const SPECIFIC: Record<string, string[]> = {
  valentines: [
    "Something romantic for my girlfriend who loves travel, about {£}40",
    "Valentine's ideas for my husband who's into cooking, under {£}50",
    "A sweet surprise for my boyfriend who loves gaming, around {£}25",
    "Something thoughtful for my wife who loves candles and books, {£}30",
  ],
  anniversary: [
    "25th wedding anniversary gift for my wife, about {£}100",
    "First anniversary (paper) ideas for my husband, under {£}40",
    "Anniversary present for my parents' ruby wedding, around {£}60",
    "Something special for 5 years together, my partner loves hiking, {£}50",
  ],
  "mothers-day": [
    "Mother's Day ideas for my mum who loves gardening, about {£}30",
    "Something pampering for my wife from the kids, under {£}25",
    "A gift for my nan who loves knitting, around {£}20",
    "Mother's Day for my mother-in-law who loves baking, {£}35",
  ],
  "fathers-day": [
    "Father's Day ideas for my dad who loves golf, about {£}40",
    "Something fun from the kids for my husband who loves BBQs, under {£}30",
    "A gift for my grandad who loves fishing, around {£}25",
    "Father's Day for my father-in-law who's into whisky, {£}50",
  ],
  wedding: [
    "Wedding gift for my cousin and her husband, about {£}75",
    "Present for friends who love cooking and are getting married, under {£}100",
    "Something personal for my best friend's wedding, around {£}50",
    "Wedding gift for a work colleague, about {£}30",
  ],
  "new-baby": [
    "New baby girl gift for my friend, about {£}30",
    "Something useful for new parents of twins, under {£}50",
    "A keepsake for my sister's baby boy, around {£}40",
    "Gift for a colleague's new baby, about {£}20",
  ],
  "thank-you": [
    "Thank you gift for my son's teacher, about {£}15",
    "Something to say thanks to my neighbour for watering the plants, under {£}20",
    "Thank you for a friend who helped us move house, around {£}30",
    "A thank-you for our childminder, about {£}25",
  ],
};

/** Small seeded random number generator, so every visit shows the same order. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function seedFor(text: string) {
  let h = 7;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return h;
}

const PHRASES = [
  (w: string, l: string, b: string) => `Ideas for ${w} who loves ${l}, about ${b}`,
  (w: string, l: string, b: string) => `Something for ${w} who's into ${l}, under ${b}`,
  (w: string, l: string, b: string) => `What can I get ${w}? Loves ${l}, around ${b}`,
  (w: string, l: string, b: string) => `Gift for ${w}, mad about ${l}, budget ${b}`,
];

/** A list of example requests for this occasion, in a stable shuffled order. */
export function examplePrompts(occasionId: string, region: Region, count = 30): string[] {
  const cur = region === "UK" ? "£" : "$";
  const specific = SPECIFIC[occasionId];
  if (specific) return specific.map((s) => s.replaceAll("{£}", cur));

  const rand = seeded(seedFor(occasionId));
  const out: string[] = [];
  const people = [...PEOPLE];
  for (let i = 0; i < count; i++) {
    const p = people[Math.floor(rand() * people.length)];
    const like = p.likes[Math.floor(rand() * p.likes.length)];
    const budget = `${cur}${BUDGETS[Math.floor(rand() * BUDGETS.length)]}`;
    const phrase = PHRASES[Math.floor(rand() * PHRASES.length)];
    const text = phrase(p.who, like, budget);
    if (!out.includes(text)) out.push(text);
  }
  // Keep the familiar example first.
  out.unshift(`Ideas for my 7 year old who loves dinosaurs, about ${cur}30`);
  return out;
}
