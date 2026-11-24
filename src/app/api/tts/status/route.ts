import { rateLimited } from "@/lib/rateLimit";

/**
 * Voice setup check: visit /api/tts/status. Shows which settings are present
 * (never their values) and what ElevenLabs answers for a one-word test.
 */
export async function GET(request: Request) {
  if (rateLimited(request)) return Response.json({ error: "Too many requests" }, { status: 429 });

  const key = process.env.ELEVENLABS_API_KEY?.trim();
  const voice = (process.env.ELEVENLABS_VOICE_SANTA || process.env.ELEVENLABS_VOICE_ID)?.trim();
  const result: Record<string, unknown> = {
    apiKeySet: Boolean(key),
    santaVoiceSet: Boolean(process.env.ELEVENLABS_VOICE_SANTA),
    defaultVoiceSet: Boolean(process.env.ELEVENLABS_VOICE_ID),
  };
  if (!key || !voice) return Response.json({ ...result, verdict: "Missing settings in Vercel" });

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: "Ho", model_id: process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5" }),
  });
  result.elevenlabsStatus = res.status;
  if (res.ok) {
    result.verdict = "Voice works";
  } else {
    const text = await res.text();
    result.elevenlabsMessage = text.slice(0, 400);
    result.verdict = "ElevenLabs refused the request";
  }
  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}
