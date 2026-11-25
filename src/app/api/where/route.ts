/**
 * Which Amazon shop to suggest, from the visitor's country. Vercel adds the
 * country (from the IP address) to every request; nothing is stored.
 */
const UK = new Set(["GB", "IE", "IM", "JE", "GG"]);

export function GET(request: Request) {
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase() ?? "";
  const region = UK.has(country) ? "UK" : country === "US" ? "US" : null;
  return Response.json({ country, region }, { headers: { "Cache-Control": "private, no-store" } });
}
