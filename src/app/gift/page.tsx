import type { Metadata } from "next";
import { amazonSearchLink } from "@/lib/amazon";
import { SHARE_LIMITS } from "@/lib/share";
import type { Region } from "@/lib/types";

// Each shared link is different, so render on request (link previews need the gift in the page head).
export const instant = false;

type Search = Promise<{ [key: string]: string | string[] | undefined }>;

function readGift(sp: { [key: string]: string | string[] | undefined }) {
  const get = (k: string, max: number) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : (v ?? "")).trim().slice(0, max);
  };
  const title = get("t", SHARE_LIMITS.title);
  const query = get("q", SHARE_LIMITS.query) || title;
  const region: Region = get("c", 2) === "us" ? "US" : "UK";
  return {
    title,
    query,
    reason: get("r", SHARE_LIMITS.reason),
    price: get("p", SHARE_LIMITS.price),
    region,
  };
}

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const g = readGift(await searchParams);
  return {
    title: g.title ? `Gift idea: ${g.title} · Lookfor` : "Gift idea · Lookfor",
    description: g.reason || "A gift idea shared from Lookfor, gift ideas for everyone.",
    // Shared pages are made from link text, so keep them out of search engines.
    robots: { index: false, follow: false },
  };
}

export default async function SharedGift({ searchParams }: { searchParams: Search }) {
  const g = readGift(await searchParams);
  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg, #0f3d2e 0%, #14532d 50%, #7f1d1d 100%)" }}
    >
      <article className="w-full max-w-md space-y-5 rounded-3xl bg-white/95 p-6 text-center text-slate-800 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">🎁 Someone shared a gift idea with you</p>
        {g.title ? (
          <>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-left">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-xl font-bold">{g.title}</h1>
                {g.price && <span className="shrink-0 text-slate-500">{g.price}</span>}
              </div>
              {g.reason && <p>{g.reason}</p>}
              <a
                href={amazonSearchLink(g.query, g.region)}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="inline-block rounded-full bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-500"
              >
                See options on Amazon
              </a>
              <span className="block text-xs text-slate-500">Ad · affiliate link</span>
            </div>
          </>
        ) : (
          <h1 className="text-xl font-bold">This gift link looks incomplete.</h1>
        )}
        <div className="space-y-2">
          <p className="font-semibold">Need ideas for someone else?</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-block rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-2 font-bold text-slate-900 shadow ring-2 ring-white/70"
          >
            Ask Lookfor for gift ideas
          </a>
        </div>
        <p className="text-xs text-slate-500">
          As an Amazon Associate we earn from qualifying purchases, at no extra cost to you.
        </p>
      </article>
    </main>
  );
}
