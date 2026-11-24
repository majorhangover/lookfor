import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
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
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { region, occasion, messages, family } = parsed.data;

  let result: HostResponse;
  if (!client) {
    result = demoReply(messages[messages.length - 1].content, region);
  } else {
    try {
      const response = await client.messages.parse({
        model: MODEL,
        max_tokens: 2000,
        output_config: { effort: "low", format: zodOutputFormat(HostSchema) },
        system: [
          { type: "text", text: systemPrompt(region, occasion), cache_control: { type: "ephemeral" } },
          { type: "text", text: familyContext(family) },
        ],
        messages,
      });
      if (response.stop_reason === "refusal" || !response.parsed_output) {
        result = {
          reply: "Let's keep our chat on gifts and celebrations. Who are we shopping for?",
          gifts: [],
          profileUpdates: [],
        };
      } else {
        result = response.parsed_output;
      }
    } catch (err) {
      console.error("Chat failed", err);
      return Response.json(
        { error: "Our gift helpers are busy. Please try again in a moment." },
        { status: 503 },
      );
    }
  }

  result.gifts = result.gifts.slice(0, 4).map((g) => ({ ...g, url: amazonSearchLink(g.searchQuery, region) }));
  return Response.json(result);
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
