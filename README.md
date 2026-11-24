# Lookfor

Gift ideas for every occasion, from a friendly AI character. Santa hosts Christmas, Bo the Birthday Bear hosts birthdays, Bea the Bunny hosts Easter, Cupid hosts Valentine's Day and anniversaries, and Lou covers everything else. Gift ideas link to Amazon UK or US with your Associates tag.

For adults only: Amazon's Associates rules exclude services aimed at children.

## Run it

```bash
cp .env.example .env.local   # add keys (all optional; without them it runs in demo mode)
npm install
npm run dev                  # http://localhost:3000
```

## How it works

- `src/app/api/chat/route.ts` sends the chat and the saved people to Claude (`claude-haiku-5-5` by default) and gets back structured JSON: the spoken reply, up to 4 gift ideas and suggested profile updates. The server turns each idea into a tagged Amazon search link, so the model never writes URLs.
- `src/app/api/tts/route.ts` gives each character an ElevenLabs voice if configured. Otherwise the browser's own voice is used.
- `src/components/Character.tsx` draws the five original cartoon hosts in SVG. The mouth follows the speech audio.
- `src/lib/occasions.ts` holds the occasions, characters, personas and colour themes. Add a new occasion or character there.
- Family details are stored only in the visitor's browser (localStorage). Nothing is kept on the server, and no audio is recorded.

## Before launch

- Add real Amazon tags (`AMAZON_TAG_UK`, `AMAZON_TAG_US`) and an `ANTHROPIC_API_KEY`.
- Fill in the business details in the privacy notice and get it reviewed.
- Add rate limiting on `/api/chat` (for example, Vercel's firewall or Upstash) to cap AI spend.
