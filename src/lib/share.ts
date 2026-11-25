import type { GiftIdea, Region } from "./types";

/** Limits for shared gift links, so a link can't be used to show long made-up text. */
export const SHARE_LIMITS = { title: 80, query: 120, reason: 200, price: 30 };

/**
 * A link to a Lookfor page about one gift idea. We share this rather than the
 * Amazon link, because Amazon's rules say affiliate links must be clicked from
 * our own site.
 */
export function giftSharePath(g: GiftIdea, region: Region): string {
  const params = new URLSearchParams({
    t: g.title.slice(0, SHARE_LIMITS.title),
    q: g.searchQuery.slice(0, SHARE_LIMITS.query),
    r: g.reason.slice(0, SHARE_LIMITS.reason),
    p: g.priceBand.slice(0, SHARE_LIMITS.price),
    c: region.toLowerCase(),
  });
  return `/gift?${params.toString()}`;
}
