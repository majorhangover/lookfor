import { formatBirthday, nextBirthday } from "./birthday";
export type CharacterId =
  | "santa"
  | "bear"
  | "bunny"
  | "cupid"
  | "penguin"
  | "hen"
  | "dog"
  | "dove"
  | "stork"
  | "fox"
  | "lou";

export const CHARACTER_IDS: CharacterId[] = ["santa", "bear", "bunny", "cupid", "penguin", "hen", "dog", "dove", "stork", "fox", "lou"];

export interface Occasion {
  id: string;
  label: string;
  character: CharacterId;
}

export interface Character {
  id: CharacterId;
  name: string;
  persona: string;
  greeting: string;
  voicePitch: number;
  theme: { from: string; via: string; to: string; accent: string; bubble: string };
}

export const CHARACTERS: Record<CharacterId, Character> = {
  santa: {
    id: "santa",
    name: "Santa",
    persona:
      'You are Santa Claus: jolly, warm and brief, with the odd "ho ho ho" (at most once every few replies, never to open every reply). Gifts are for Christmas. When you suggest gifts, say you have popped them under the tree (they appear under your tree on the page).',
    greeting:
      "Ho ho ho! Welcome to my workshop. Tell me who you're shopping for, and I'll help you find something they'll love.",
    voicePitch: 0.7,
    theme: { from: "#0c2219", via: "#143528", to: "#7f1d1d", accent: "#8f1d1d", bubble: "#f5f1ea" },
  },
  bear: {
    id: "bear",
    name: "Bo the Birthday Bear",
    persona:
      "You are Bo, a cheerful birthday bear who loves parties, cake and surprises. Upbeat and brief. Gifts are for birthdays.",
    greeting: "Hello! I'm Bo the Birthday Bear. Whose birthday are we celebrating? Tell me about them!",
    voicePitch: 1.05,
    theme: { from: "#312e81", via: "#6d28d9", to: "#db2777", accent: "#7c3aed", bubble: "#f5f3ff" },
  },
  bunny: {
    id: "bunny",
    name: "Bea the Easter Bunny",
    persona:
      "You are Bea, a gentle, bouncy Easter bunny. Kind and brief. Gifts are for Easter: treats, baskets, spring activities.",
    greeting: "Hop hop, hello! I'm Bea. Who would you like to surprise this Easter?",
    voicePitch: 1.25,
    theme: { from: "#14532d", via: "#65a30d", to: "#f59e0b", accent: "#16a34a", bubble: "#f0fdf4" },
  },
  cupid: {
    id: "cupid",
    name: "Cupid",
    persona:
      "You are Cupid: romantic, playful and brief. Gifts are for Valentine's Day and loved ones. Keep it tasteful.",
    greeting: "Hello, lovebird! I'm Cupid. Who's the lucky one you're shopping for?",
    voicePitch: 1.15,
    theme: { from: "#4c0519", via: "#be123c", to: "#f472b6", accent: "#e11d48", bubble: "#fff1f2" },
  },
  penguin: {
    id: "penguin",
    name: "Penny the Penguin",
    persona:
      "You are Penny, a devoted penguin (penguins pick one partner for life). Sweet, a little sentimental and brief. Gifts are for anniversaries: celebrating years together, with a nod to traditional anniversary themes when the year is known.",
    greeting: "Hello! I'm Penny. Penguins stick together for life, so I adore an anniversary. Who's the lucky pair?",
    voicePitch: 1.15,
    theme: { from: "#0f172a", via: "#1e3a8a", to: "#be185d", accent: "#be185d", bubble: "#fdf2f8" },
  },
  hen: {
    id: "hen",
    name: "Hattie the Hen",
    persona:
      "You are Hattie, a warm, caring mother hen. Kind, a touch fussy and brief. Gifts are for Mother's Day: for mums, step-mums, grans and mother figures.",
    greeting: "Hello, my dear! I'm Hattie. Let's find something lovely to spoil a special mum. Who is she?",
    voicePitch: 1.1,
    theme: { from: "#831843", via: "#db2777", to: "#f9a8d4", accent: "#db2777", bubble: "#fdf2f8" },
  },
  dog: {
    id: "dog",
    name: "Barney the Dog",
    persona:
      "You are Barney, a loyal, easy-going dog in a flat cap. Friendly, a bit of a dad-joke fan and brief. Gifts are for Father's Day: for dads, step-dads, grandads and father figures.",
    greeting: "Woof, hello! I'm Barney. Let's sniff out a great gift for a great dad. Tell me about him!",
    voicePitch: 0.85,
    theme: { from: "#1e293b", via: "#1e40af", to: "#0369a1", accent: "#1d4ed8", bubble: "#eff6ff" },
  },
  dove: {
    id: "dove",
    name: "Darcy the Dove",
    persona:
      "You are Darcy, an elegant, gentle wedding dove. Graceful, warm and brief. Gifts are for weddings: for the couple, gifts off or alongside a registry, and for the wedding party.",
    greeting: "Hello! I'm Darcy. Weddings are my favourite. Who's getting married?",
    voicePitch: 1.1,
    theme: { from: "#44403c", via: "#a16207", to: "#eab308", accent: "#a16207", bubble: "#fefce8" },
  },
  stork: {
    id: "stork",
    name: "Stella the Stork",
    persona:
      "You are Stella, a cheerful stork who delivers babies. Gentle, excited and brief. Gifts are for new babies and new parents: practical, keepsake and treat-the-parents ideas.",
    greeting: "Hello! I'm Stella. I've just made a delivery! Who's the new arrival, and who are the lucky parents?",
    voicePitch: 1.2,
    theme: { from: "#0c4a6e", via: "#0284c7", to: "#f9a8d4", accent: "#0284c7", bubble: "#f0f9ff" },
  },
  fox: {
    id: "fox",
    name: "Finn the Fox",
    persona:
      "You are Finn, a polite, thoughtful fox. Warm, a little clever and brief. Gifts are thank-you gifts: for teachers, hosts, neighbours, colleagues and anyone who helped out.",
    greeting: "Hello! I'm Finn. A thank-you gift is a lovely thought. Who would you like to thank?",
    voicePitch: 1.0,
    theme: { from: "#7c2d12", via: "#c2410c", to: "#f59e0b", accent: "#c2410c", bubble: "#fff7ed" },
  },
  lou: {
    id: "lou",
    name: "Lou from Lookfor",
    persona:
      "You are Lou, the friendly Lookfor gift guide: warm, thoughtful and brief. You help with any occasion, including retirements, graduations, house-warmings and just-because gifts.",
    greeting: "Hi, I'm Lou! Tell me the occasion and who it's for, and let's find something they'll love.",
    voicePitch: 1.0,
    theme: { from: "#0c4a6e", via: "#0e7490", to: "#0d9488", accent: "#0e7490", bubble: "#ecfeff" },
  },
};

export const OCCASIONS: Occasion[] = [
  { id: "christmas", label: "Christmas", character: "santa" },
  { id: "birthday", label: "Birthday", character: "bear" },
  { id: "valentines", label: "Valentine's Day", character: "cupid" },
  { id: "anniversary", label: "Anniversary", character: "penguin" },
  { id: "easter", label: "Easter", character: "bunny" },
  { id: "mothers-day", label: "Mother's Day", character: "hen" },
  { id: "fathers-day", label: "Father's Day", character: "dog" },
  { id: "wedding", label: "Wedding", character: "dove" },
  { id: "new-baby", label: "New baby", character: "stork" },
  { id: "thank-you", label: "Thank you", character: "fox" },
  { id: "any", label: "Any occasion", character: "lou" },
];

export function getOccasion(id: string): Occasion {
  return OCCASIONS.find((o) => o.id === id) ?? OCCASIONS[OCCASIONS.length - 1];
}

/** Pick a sensible default from today's date. */
export function seasonalOccasion(now = new Date()): string {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  if ((m === 11 && d >= 1) || (m === 12 && d <= 25)) return "christmas";
  if ((m === 1 && d >= 20) || (m === 2 && d <= 14)) return "valentines";
  if (m === 3 || (m === 4 && d <= 20)) return "easter";
  return "birthday";
}

export interface UpcomingBirthday {
  nickname: string;
  /** e.g. "today", "tomorrow", "in 5 days", "24 December", "this month", "March" */
  when: string;
}

/** The next few birthdays, soonest first. */
export function upcomingBirthdays(people: { nickname: string; birthday: string }[], now = new Date()): UpcomingBirthday[] {
  return people
    .map((p) => {
      const next = p.birthday ? nextBirthday(p.birthday, now) : null;
      if (!next) return null;
      const { daysAway, monthsAway } = next;
      let when: string;
      if (daysAway === null) when = monthsAway === 0 ? "this month" : formatBirthday(p.birthday);
      else if (daysAway === 0) when = "today 🎂";
      else if (daysAway === 1) when = "tomorrow";
      else if (daysAway <= 14) when = `in ${daysAway} days`;
      else when = formatBirthday(p.birthday);
      // Sort by days; month-only birthdays count from the middle of their month.
      const sortKey = daysAway ?? monthsAway * 30.5 + 15;
      return { nickname: p.nickname, when, sortKey };
    })
    .filter((x): x is UpcomingBirthday & { sortKey: number } => x !== null)
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, 3)
    .map(({ nickname, when }) => ({ nickname, when }));
}
