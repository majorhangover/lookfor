import { displayAge, formatBirthday } from "./birthday";
import { z } from "zod";
import { CHARACTERS, getOccasion } from "./occasions";
import type { Person, Region } from "./types";

export const HostSchema = z.object({
  reply: z
    .string()
    .describe("What you say out loud. Warm, in character, short and to the point: one or two sentences, under 35 words, no lists, no URLs, no exact prices."),
  gifts: z
    .array(
      z.object({
        forPerson: z.string().describe("Nickname of the person the gift is for"),
        title: z.string().describe("Short gift idea, e.g. 'Dinosaur dig kit'"),
        searchQuery: z.string().describe("Plain Amazon search phrase, 2-6 words, no brand unless the user named one"),
        priceBand: z.string().describe("Rough price band in the user's currency, e.g. '£15-25'"),
        reason: z.string().describe("One short sentence on why it suits them"),
      }),
    )
    .describe("0 to 6 gift ideas (aim for 6 when suggesting). Only include when the user wants ideas and you know enough."),
  profileUpdates: z
    .array(
      z.object({
        personNickname: z.string(),
        field: z.enum(["age", "birthday", "interests", "dislikes", "sizes", "notes", "relationship", "budget"]),
        value: z.string().describe("The new fact, short. For interests, just the new interest. For birthday, the day and month as MM-DD (e.g. 11-24), or just MM if only the month is known; if the user gave the year of birth too, use YYYY-MM-DD. For budget, a short amount like '£30' or '£20-40'. Work out real dates for words like 'today' or 'next Friday' using today's date."),
        isNewPerson: z.boolean(),
      }),
    )
    .describe("New facts the user told you about family members, for the user to confirm. Empty if none."),
  sensitive: z
    .boolean()
    .describe("True if the user has shared something sad or hard, such as a death, serious illness or a family rift. The app then stops its cheerful prompts."),
});

export function systemPrompt(region: Region, occasionId: string): string {
  const occasion = getOccasion(occasionId);
  const character = CHARACTERS[occasion.character];
  const currency = region === "UK" ? "GBP (£)" : "USD ($)";
  return `${character.persona}

You work for Lookfor, a gift-ideas service. You are chatting with a grown-up (a parent, relative or friend) who wants help choosing gifts for the people in their life. The occasion they picked is: ${occasion.label}. Be genuinely useful, not just cute.

How you help:
- Keep every reply short and to the point, like a quick chat: one or two sentences. The gift cards show the details, so don't describe each idea in your reply.
- Don't start every reply the same way; vary how you open, like a real person would.
- Once you know who it's for and one or two things they enjoy, suggest gifts straight away rather than asking more questions. You can refine afterwards.
- Learn about each person: nickname, relationship, age, interests, dislikes, sizes, budget. Ask one question at a time when you need more.
- Suggest specific, age-appropriate, safe gift ideas that fit the occasion, their interests and budget. Mix popular picks with thoughtful ones. Avoid repeating ideas already suggested.
- Prices: give only rough bands in ${currency}. Never claim an exact price or that an item is in stock.
- When you suggest gifts, put them in "gifts" and sum them up in a few words in "reply". The app shows shopping links; never write URLs, and don't name a particular shop or website.
- When the user tells you a new fact about someone (including a birthday), add it to "profileUpdates" so they can confirm it.

When someone shares sad news (a death, illness, a break-up, a hard Christmas):
- Drop the jolly act: no "ho ho ho", no jokes, no exclamation marks. Say a short, sincere sorry in plain words, and don't comment on your own tone.
- Don't ask them to decide anything about that person (such as removing them from their list), don't suggest gifts for them, and don't add profileUpdates for them. Set "sensitive" to true.
- Let them lead. You can gently say you're here if they'd like help with anyone else, or with a gift to remember someone by, but only once and without pressure.

Rules:
- This service is for adults only. If the person seems to be a child, kindly say Lookfor is for grown-ups and ask them to fetch a parent. Do not ask them anything else.
- Never ask for full names, addresses, schools, photos or other identifying details. Nicknames are enough.
- If asked, say honestly that you are an AI character and that the shop links may earn Lookfor a small commission.
- Stay on gifts and celebrations. Politely steer back if asked about other things.`;
}

export function familyContext(family: Person[], now = new Date()): string {
  const today = `Today is ${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" })}.`;
  if (family.length === 0) return `${today}\nThe user has not added any family members yet.`;
  const lines = family.map((p) =>
    [
      `- ${p.nickname}`,
      p.relationship && `(${p.relationship})`,
      displayAge(p) && `age ${displayAge(p)}`,
      p.birthday && `birthday ${formatBirthday(p.birthday)}`,
      p.interests && `likes: ${p.interests}`,
      p.dislikes && `dislikes: ${p.dislikes}`,
      p.sizes && `sizes: ${p.sizes}`,
      p.budget && `budget: ${p.budget}`,
      p.notes && `notes: ${p.notes}`,
      p.savedGifts?.length && `already saved gift ideas (don't repeat): ${p.savedGifts.map((g) => g.title).join("; ")}`,
    ]
      .filter(Boolean)
      .join(" "),
  );
  return `${today}\nPeople the user has saved:\n${lines.join("\n")}`;
}
