/**
 * Simple per-visitor rate limit to cap AI spend. Counts are kept in memory
 * per server instance, so this is a basic guard, not a hard limit. For a
 * hard cap, also set a monthly spend limit in the Anthropic console.
 */
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 40; // per visitor, per route, per window
const hits = new Map<string, number[]>();

export function rateLimited(request: Request, bucket = "default"): boolean {
  const ip = `${bucket}:${request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"}`;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) {
    for (const [key, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
  }
  return recent.length > MAX_REQUESTS;
}
