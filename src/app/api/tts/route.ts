import { z } from "zod";
import { rateLimited } from "@/lib/rateLimit";

const Query = z.object({
  text: z.string().min(1).max(800),
  character: z.enum(["santa", "bear", "bunny", "cupid", "lou"]).default("lou"),
});

/**
 * Character voices, streamed so playback starts as soon as the first audio
 * arrives. The browser loads this as an <audio> source:
 *   /api/tts?text=...&character=santa
 * Uses ElevenLabs when ELEVENLABS_API_KEY is set, with
 * ELEVENLABS_VOICE_<CHARACTER> (e.g. ELEVENLABS_VOICE_SANTA) or
 * ELEVENLABS_VOICE_ID as the default. Optional ELEVENLABS_SPEED (0.7 to 1.2)
 * changes how fast the characters talk. Otherwise returns 204 and the
 * browser falls back to its built-in speech voice.
 */
export async function GET(request: Request) {
  if (rateLimited(request)) return new Response(null, { status: 429 });
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) return new Response(null, { status: 204 });

  const params = new URL(request.url).searchParams;
  const parsed = Query.safeParse({ text: params.get("text") ?? "", character: params.get("character") ?? undefined });
  if (!parsed.success) return new Response(null, { status: 400 });
  const voice = (
    process.env[`ELEVENLABS_VOICE_${parsed.data.character.toUpperCase()}`] || process.env.ELEVENLABS_VOICE_ID
  )?.trim();
  if (!voice) return new Response(null, { status: 204 });

  const speed = Number(process.env.ELEVENLABS_SPEED);
  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/stream?output_format=mp3_44100_64`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: parsed.data.text,
        model_id: process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5",
        ...(speed >= 0.7 && speed <= 1.2 ? { voice_settings: { speed } } : {}),
      }),
    },
  );
  if (!upstream.ok || !upstream.body) {
    console.error("ElevenLabs TTS failed", upstream.status, (await upstream.text()).slice(0, 300));
    return new Response(null, { status: 204 });
  }
  return new Response(upstream.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
