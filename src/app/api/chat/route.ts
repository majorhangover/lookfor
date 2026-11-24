import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { rateLimited } from "@/lib/rateLimit";
import { amazonSearchLink } from "@/lib/amazon";
import { HostSchema, familyContext, systemPrompt } from "@/lib/host";
import { OCCASIONS } from "@/lib/occasions";
import type { HostResponse } from "@/lib/types";

const RequestSchema = z.object({
  region: z.enum(["UK", "US"]),
  occasion: z.string().refine((id) => OCCASIONS.some((o) => o.id === id)),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .min(1)
    .max(40),
  family: z
    .array(
      z.object({
        id: z.string(),
        nickname: z.string().max(60),
        relationship: z.string().max(60),
        age: z.string().max(20),
        birthday: z.string().max(20),
        interests: z.string().max(500),
        dislikes: z.string().max(500),
        sizes: z.string().max(200),
        notes: z.string().max(500),
      }),
    )
    .max(30),
});

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
const MODEL = process.env.CHAT_MODEL || "claude-haiku-5-5";

export async function POST(request: Request) {
  if (rateLimited(request, "chat")) {
    return Response.json({ error: "You're going a bit fast! Please wait a few minutes and try again." }, { status: 429 });
  }
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { region, occasion, messages, family } = parsed.data;

  // The reply is streamed as newline-delimited JSON so the browser can start
  // Santa talking as soon as his words are written, while the gift ideas are
  // still being generated:
  //   {"reply": "..."}            as soon as the reply text is complete
  //   {"result": {...}}           the full answer, with gifts and links
  //   {"error": "..."}            if something went wrong
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: object) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      const finish = (result: HostResponse) => {
        result.gifts = result.gifts.slice(0, 4).map((g) => ({ ...g, url: amazonSearchLink(g.searchQuery, region) }));
        send({ result });
      };
      try {
        if (!client) {
          const result = demoReply(messages[messages.length - 1].content, region);
          send({ reply: result.reply });
          finish(result);
          return;
        }
        const stream = client.messages.stream({
          model: MODEL,
          max_tokens: 2000,
          output_config: { effort: "low", format: zodOutputFormat(HostSchema) },
          system: [
            { type: "text", text: systemPrompt(region, occasion), cache_control: { type: "ephemeral" } },
            { type: "text", text: familyContext(family) },
          ],
          messages,
        });
        let text = "";
        let replySent = false;
        stream.on("text", (delta) => {
          if (replySent) return;
          text += delta;
          const reply = completedReply(text);
          if (reply !== null) {
            replySent = true;
            send({ reply });
          }
        });
        const message = await stream.finalMessage();
        const block = message.content.find((b) => b.type === "text");
        const parsed =
          message.stop_reason === "refusal" || !block || block.type !== "text"
            ? null
            : HostSchema.safeParse(safeJson(block.text));
        if (!parsed?.success) {
          const fallback = "Let's keep our chat on gifts and celebrations. Who are we shopping for?";
          if (!replySent) send({ reply: fallback });
          finish({ reply: fallback, gifts: [], profileUpdates: [] });
        } else {
          if (!replySent) send({ reply: parsed.data.reply });
          finish(parsed.data);
        }
      } catch (err) {
        console.error("Chat failed", err);
        send({ error: "Our gift helpers are busy. Please try again in a moment." });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** The "reply" string from the start of a partly written JSON answer, once its closing quote has arrived. */
function completedReply(partial: string): string | null {
  const m = /^\s*\{\s*"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(partial);
  if (!m) return null;
  try {
    return JSON.parse(`"${m[1]}"`) as string;
  } catch {
    return null;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Canned replies so the app works end to end before an API key is set. */
function demoReply(text: string, region: Region): HostResponse {
  const cur = region === "UK" ? "£" : "$";
  const lower = text.toLowerCase();
  if (/idea|gift|present|suggest|buy/.test(lower)) {
    return {
      reply:
        "Here are a few example ideas. (Demo mode: add an AI key for real suggestions.)",
      gifts: [
        { forPerson: "Example", title: "Dinosaur dig kit", searchQuery: "dinosaur dig kit kids", priceBand: `${cur}10-20`, reason: "Hands-on fun for young explorers." },
        { forPerson: "Example", title: "Cosy reading socks", searchQuery: "fluffy reading socks", priceBand: `${cur}8-15`, reason: "A snug stocking filler for book lovers." },
      ],
      profileUpdates: [],
    };
  }
  return {
    reply:
      "Tell me who you're shopping for, their age and what they love, and ask me for gift ideas. (Demo mode: add an AI key for real suggestions.)",
    gifts: [],
    profileUpdates: [],
  };
}

type Region = "UK" | "US";
