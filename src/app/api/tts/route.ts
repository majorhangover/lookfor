import { z } from "zod";
import { rateLimited } from "@/lib/rateLimit";

const Body = z.object({
  text: z.string().min(1).max(800),
  character: z.enum(["santa", "bear", "bunny", "cupid", "lou"]).default("lou"),
});

/**
 * Character voices. Uses ElevenLabs when ELEVENLABS_API_KEY is set, with
 * ELEVENLABS_VOICE_<CHARACTER> (e.g. ELEVENLABS_VOICE_SANTA) or
 * ELEVENLABS_VOICE_ID as the default. Otherwise returns 204 and the browser
 * falls back to its built-in speech voice.
 */
export async function POST(request: Request) {
  if (rateLimited(request)) {
    return Response.json({ error: "You're going a bit fast! Please wait a few minutes and try again." }, { status: 429 });
  }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return new Response(null, { status: 204 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const voice =
    process.env[`ELEVENLABS_VOICE_${parsed.data.character.toUpperCase()}`] || process.env.ELEVENLABS_VOICE_ID;
  if (!voice) return new Response(null, { status: 204 });

  const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: parsed.data.text, model_id: process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5" }),
  });
  if (!upstream.ok || !upstream.body) return new Response(null, { status: 204 });
  return new Response(upstream.body, { headers: { "Content-Type": "audio/mpeg" } });
}
