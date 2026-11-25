import type { Region } from "./types";

const STORES: Record<Region, { host: string; envTag: string; fallbackTag: string }> = {
  UK: { host: "www.amazon.co.uk", envTag: "AMAZON_TAG_UK", fallbackTag: "lookfor-21" },
  US: { host: "www.amazon.com", envTag: "AMAZON_TAG_US", fallbackTag: "lookfor00-20" },
};

/**
 * Builds a tagged Amazon search link. We link to search results rather than
 * specific products because the Creators API (needed for product data and
 * prices) only opens once the Associates account has qualifying sales.
 */
export function amazonSearchLink(query: string, region: Region): string {
  const store = STORES[region];
  const tag = process.env[store.envTag] || store.fallbackTag;
  const params = new URLSearchParams({ k: query.trim().slice(0, 120) });
  if (tag) params.set("tag", tag);
  return `https://${store.host}/s?${params.toString()}`;
}
