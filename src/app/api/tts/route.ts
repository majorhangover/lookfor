import { z } from "zod";
import { rateLimited } from "@/lib/rateLimit";
import { CHARACTER_IDS, type CharacterId } from "@/lib/occasions";

const Query = z.object({
  text: z.string().min(1).max(800),
  character: z.enum(CHARACTER_IDS as [CharacterId, ...CharacterId[]]).default("lou"),
});

/**
 * ElevenLabs ready-made voices to match each host, so the women don't speak
 * in Santa's voice. An ELEVENLABS_VOICE_<CHARACTER> setting in Vercel still
 * wins. Santa keeps ELEVENLABS_VOICE_SANTA or ELEVENLABS_VOICE_ID.
 */
const DEFAULT_VOICES: Partial<Record<CharacterId, string>> = {
  bear: "EXAVITQu4vr4xnSDxMaL", // Bella: Sarah, warm female
  bunny: "Xb7hH8MSUJpSbSDYk0k2", // Daisy: Alice, British female
  cupid: "XrExE9yKIg1WjnnlVkGX", // Rosa: Matilda, warm female
  penguin: "JBFqnCBsd6RMkjVDRZzb", // Henry: George, older British male
  hen: "pFZP5JQG7iQjIQuC4Bku", // Maggie: Lily, British female
  dog: "onwK4e9ZLuTAKqWW03F9", // Barney: Daniel, British male
  dove: "XB0fDUnXU5powFXDhCwa", // Darcy: Charlotte, elegant female
  stork: "cgSgspJ2msm6clMCkdW9", // Stella: Jessica, bright female
  fox: "N2lVS1w4EtoT3dr4eOWO", // Finn: Callum, male
  lou: "nPczCjzI2devNBz1zQrb", // Lou: Brian, friendly male
};

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
  if (rateLimited(request, "tts")) return new Response(null, { status: 429 });
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  if (!key) return new Response(null, { status: 204 });

  const params = new URL(request.url).searchParams;
  const parsed = Query.safeParse({ text: params.get("text") ?? "", character: params.get("character") ?? undefined });
  if (!parsed.success) return new Response(null, { status: 400 });
  const character = parsed.data.character;
  const voice = (
    process.env[`ELEVENLABS_VOICE_${character.toUpperCase()}`] ||
    DEFAULT_VOICES[character] ||
    process.env.ELEVENLABS_VOICE_ID
  )?.trim();
  if (!voice) return new Response(null, { status: 204 });

  // A touch quicker than normal by default, so replies don't drag. ELEVENLABS_SPEED overrides it.
  const speed = Number(process.env.ELEVENLABS_SPEED || 1.1);
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
