import type { GiftIdea, Person } from "./types";

export interface Nudge {
  content: string;
  chips: string[];
}

/**
 * What the character says when things go quiet: point a first-timer at the
 * ask box, offer more ideas after a batch, or ask if there's anyone else
 * (without naming anyone).
 */
export function buildNudge(opts: {
  chatted: boolean;
  lastGifts: GiftIdea[] | undefined;
  giftedNames: string[];
  family: Person[];
  tree: boolean;
  count: number;
}): Nudge {
  const { chatted, lastGifts, giftedNames, family, tree, count } = opts;
  if (!chatted)
    return {
      content:
        'Psst! Try "my nan, 80, loves gardening" in the box up there ☝️',
      chips: [],
    };
  const lower = giftedNames.map((n) => n.toLowerCase());
  const waiting = family.find((p) => !lower.includes(p.nickname.toLowerCase()));
  const last = lastGifts?.[lastGifts.length - 1]?.forPerson;
  // Alternate: first offer more for the last person, then suggest someone still waiting.
  if (last && (count % 2 === 0 || !waiting))
    return {
      content: `How are those looking? I can find more ideas for ${last}, or we can sort someone else on your list.`,
      chips: [`More ideas for ${last}`, `Cheaper ideas for ${last}`, "Someone else"],
    };
  // Never name a particular person here: they may have died or fallen out, and an
  // unprompted "What about Mum?" can hurt. Let the user choose.
  if (waiting)
    return {
      content: "Is there anyone else you'd like to find something for?",
      chips: ["Someone else"],
    };
  return {
    content: `Tell me a little more: their age, what they love and your budget, and I'll ${tree ? "pop some ideas under the tree" : "find some ideas"}.`,
    chips: [],
  };
}
