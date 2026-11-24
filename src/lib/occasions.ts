export type CharacterId = "santa" | "bear" | "bunny" | "cupid" | "lou";

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
      'You are Santa Claus: jolly, warm and brief, with a light "ho ho ho" now and then. Gifts are for Christmas.',
    greeting:
      "Ho ho ho! Welcome to my workshop. Tell me who you're shopping for, and I'll help you find something they'll love.",
    voicePitch: 0.7,
    theme: { from: "#0f3d2e", via: "#14532d", to: "#7f1d1d", accent: "#b91c1c", bubble: "#fef2f2" },
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
      "You are Cupid: romantic, playful and brief. Gifts are for Valentine's Day, anniversaries and loved ones. Keep it tasteful.",
    greeting: "Hello, lovebird! I'm Cupid. Who's the lucky one you're shopping for?",
    voicePitch: 1.15,
    theme: { from: "#4c0519", via: "#be123c", to: "#f472b6", accent: "#e11d48", bubble: "#fff1f2" },
  },
  lou: {
    id: "lou",
    name: "Lou from Lookfor",
    persona:
      "You are Lou, the friendly Lookfor gift guide: warm, thoughtful and brief. You help with any occasion: Mother's Day, Father's Day, weddings, new babies, thank-yous and just-because gifts.",
    greeting: "Hi, I'm Lou! Tell me the occasion and who it's for, and let's find something they'll love.",
    voicePitch: 1.0,
    theme: { from: "#0c4a6e", via: "#0e7490", to: "#0d9488", accent: "#0e7490", bubble: "#ecfeff" },
  },
};

export const OCCASIONS: Occasion[] = [
  { id: "christmas", label: "Christmas", character: "santa" },
  { id: "birthday", label: "Birthday", character: "bear" },
  { id: "valentines", label: "Valentine's Day", character: "cupid" },
  { id: "anniversary", label: "Anniversary", character: "cupid" },
  { id: "easter", label: "Easter", character: "bunny" },
  { id: "mothers-day", label: "Mother's Day", character: "lou" },
  { id: "fathers-day", label: "Father's Day", character: "lou" },
  { id: "wedding", label: "Wedding", character: "lou" },
  { id: "new-baby", label: "New baby", character: "lou" },
  { id: "thank-you", label: "Thank you", character: "lou" },
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

/** Upcoming birthdays from "YYYY-MM" values, soonest first. */
export function upcomingBirthdays(
  people: { nickname: string; birthday: string }[],
  now = new Date(),
): { nickname: string; monthsAway: number; monthName: string }[] {
  const thisMonth = now.getMonth();
  return people
    .map((p) => {
      const match = /^(\d{4})-(\d{1,2})$/.exec(p.birthday.trim()) || /^(\d{1,2})$/.exec(p.birthday.trim());
      if (!match) return null;
      const month = Number(match[match.length - 1]) - 1;
      if (month < 0 || month > 11) return null;
      const monthsAway = (month - thisMonth + 12) % 12;
      const monthName = new Date(2000, month, 1).toLocaleString("en-GB", { month: "long" });
      return { nickname: p.nickname, monthsAway, monthName };
    })
    .filter((x): x is { nickname: string; monthsAway: number; monthName: string } => x !== null)
    .sort((a, b) => a.monthsAway - b.monthsAway)
    .slice(0, 3);
}
