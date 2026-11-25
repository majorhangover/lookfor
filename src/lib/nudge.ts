import type { GiftIdea, Person } from "./types";

export interface Nudge {
  content: string;
  chips: string[];
}

/**
 * What the character says when things go quiet: point a first-timer at the
 * ask box, offer more ideas after a batch, or suggest someone on their list
 * who hasn't had ideas yet.
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
        'Psst! Pop who you\'re shopping for in the box up there ☝️ Something like "my nan, 80, loves gardening".',
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
  if (waiting)
    return {
      content: `What about ${waiting.nickname}? Shall I find something for them too?`,
      chips: [`Ideas for ${waiting.nickname}`, "Someone new"],
    };
  return {
    content: `Tell me a little more: their age, what they love and your budget, and I'll ${tree ? "pop some ideas under the tree" : "find some ideas"}.`,
    chips: [],
  };
}
