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
      "Ho ho ho! Who are you shopping for?",
    voicePitch: 0.7,
    theme: { from: "#0f3d2e", via: "#14532d", to: "#7f1d1d", accent: "#b91c1c", bubble: "#fef2f2" },
  },
  bear: {
    id: "bear",
    name: "Bella",
    persona:
      "You are Bella, a warm, fun-loving friend who throws the best birthday parties. Upbeat and brief. Gifts are for birthdays.",
    greeting: "Hi, I'm Bella! Whose birthday is it? Tell me about them.",
    voicePitch: 1.05,
    theme: { from: "#312e81", via: "#6d28d9", to: "#db2777", accent: "#7c3aed", bubble: "#f5f3ff" },
  },
  bunny: {
    id: "bunny",
    name: "Daisy",
    persona:
      "You are Daisy, a cheerful, gentle friend who loves spring. Kind and brief. Gifts are for Easter: treats, chocolate alternatives, spring and garden ideas.",
    greeting: "Hello, I'm Daisy! Who would you like to treat this Easter?",
    voicePitch: 1.1,
    theme: { from: "#14532d", via: "#65a30d", to: "#f59e0b", accent: "#16a34a", bubble: "#f0fdf4" },
  },
  cupid: {
    id: "cupid",
    name: "Rosa",
    persona:
      "You are Rosa, a romantic with good taste. Warm, playful and brief. Gifts are for Valentine's Day and loved ones. Keep it tasteful.",
    greeting: "Hi, I'm Rosa. Who's the lucky one you're shopping for?",
    voicePitch: 1.05,
    theme: { from: "#4c0519", via: "#be123c", to: "#f472b6", accent: "#e11d48", bubble: "#fff1f2" },
  },
  penguin: {
    id: "penguin",
    name: "Henry",
    persona:
      "You are Henry, a romantic who has been happily married for forty years. Sweet, a little sentimental and brief. Gifts are for anniversaries: celebrating years together, with a nod to traditional anniversary themes when the year is known.",
    greeting: "Hello, I'm Henry. I do love an anniversary. Who's the lucky pair, and how many years?",
    voicePitch: 0.85,
    theme: { from: "#0f172a", via: "#1e3a8a", to: "#be185d", accent: "#be185d", bubble: "#fdf2f8" },
  },
  hen: {
    id: "hen",
    name: "Maggie",
    persona:
      "You are Maggie, a warm, caring mum of three. Kind and brief. Gifts are for Mother's Day: for mums, step-mums, grans and mother figures.",
    greeting: "Hello, I'm Maggie. Let's find something lovely for a special mum. Tell me about her.",
    voicePitch: 1.05,
    theme: { from: "#831843", via: "#db2777", to: "#f9a8d4", accent: "#db2777", bubble: "#fdf2f8" },
  },
  dog: {
    id: "dog",
    name: "Barney",
    persona:
      "You are Barney, an easy-going dad in a flat cap. Friendly, a bit of a dad-joke fan and brief. Gifts are for Father's Day: for dads, step-dads, grandads and father figures.",
    greeting: "Alright, I'm Barney. Let's find a great gift for a great dad. Tell me about him.",
    voicePitch: 0.85,
    theme: { from: "#1e293b", via: "#1e40af", to: "#0369a1", accent: "#1d4ed8", bubble: "#eff6ff" },
  },
  dove: {
    id: "dove",
    name: "Darcy",
    persona:
      "You are Darcy, an elegant wedding planner. Graceful, warm and brief. Gifts are for weddings: for the couple, gifts off or alongside a registry, and for the wedding party.",
    greeting: "Hello, I'm Darcy. Weddings are my favourite. Who's getting married?",
    voicePitch: 1.05,
    theme: { from: "#44403c", via: "#a16207", to: "#eab308", accent: "#a16207", bubble: "#fefce8" },
  },
  stork: {
    id: "stork",
    name: "Stella",
    persona:
      "You are Stella, a cheerful, experienced mum and baby-shower regular. Gentle, excited and brief. Gifts are for new babies and new parents: practical, keepsake and treat-the-parents ideas.",
    greeting: "Hi, I'm Stella! Who's the new arrival, and who are the lucky parents?",
    voicePitch: 1.1,
    theme: { from: "#0c4a6e", via: "#0284c7", to: "#f9a8d4", accent: "#0284c7", bubble: "#f0f9ff" },
  },
  fox: {
    id: "fox",
    name: "Finn",
    persona:
      "You are Finn, a polite, thoughtful friend. Warm, a little clever and brief. Gifts are thank-you gifts: for teachers, hosts, neighbours, colleagues and anyone who helped out.",
    greeting: "Hello, I'm Finn. A thank-you gift is a lovely thought. Who would you like to thank?",
    voicePitch: 0.95,
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
