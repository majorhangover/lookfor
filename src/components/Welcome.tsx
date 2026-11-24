"use client";

import Link from "next/link";
import { useState } from "react";
import Character from "./Character";
import type { useAccount } from "./useAccount";
import type { Character as Host } from "@/lib/occasions";
import type { Region } from "@/lib/types";

type Account = ReturnType<typeof useAccount>;

/**
 * Two quick steps on arrival: where the visitor is (picks the Amazon shop and
 * confirms they're an adult), then an optional free account. Skipping the
 * account never blocks the chat.
 */
export default function Welcome({
  character,
  account,
  needsWhere,
  onWhere,
  onDone,
}: {
  character: Host;
  account: Account;
  needsWhere: boolean;
  onWhere: (region: Region) => void;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [wantsEmails, setWantsEmails] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [elsewhere, setElsewhere] = useState(false);
  const bg = {
    background: `linear-gradient(160deg, ${character.theme.from} 0%, ${character.theme.via} 50%, ${character.theme.to} 100%)`,
  };
  const santa = character.id === "santa";

  const card = (children: React.ReactNode) => (
    <main className="flex min-h-screen items-center justify-center p-6" style={bg}>
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 text-center text-slate-800 shadow-xl">
        <div
          className="mx-auto h-44 w-44 rounded-full p-2 shadow-inner"
          style={{ background: `radial-gradient(circle at 50% 40%, ${character.theme.via} 0%, ${character.theme.from} 100%)` }}
        >
          <Character id={character.id} mouth={0} listening={false} waveKey={1} />
        </div>
        {children}
      </div>
    </main>
  );

  if (needsWhere) {
    const choice = (region: Region, label: string, flag: string) => (
      <button
        className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white hover:opacity-90"
        style={{ background: character.theme.accent }}
        onClick={() => onWhere(region)}
      >
        <span aria-hidden>{flag}</span> {label}
      </button>
    );
    return card(
      <>
        <h1 className="mt-2 text-3xl font-bold" style={{ color: character.theme.accent }}>
          Lookfor
        </h1>
        <p className="mt-1 font-medium">Gift ideas for everyone</p>
        <p className="mt-4 text-lg">
          {santa ? "Ho ho ho! " : "Hello! "}Where in the world are you?{" "}
          {santa ? "I need to know where to deliver!" : "Then I can find gifts in the right shop."}
        </p>
        <div className="mt-4 space-y-2">
          {choice("UK", "United Kingdom", "🇬🇧")}
          {choice("US", "United States", "🇺🇸")}
          {!elsewhere ? (
            <button className="w-full rounded-full bg-slate-100 px-6 py-3 font-semibold hover:bg-slate-200" onClick={() => setElsewhere(true)}>
              <span aria-hidden>🌍</span> Somewhere else
            </button>
          ) : (
            <div className="rounded-2xl bg-slate-100 p-3 text-sm">
              <p>We link to Amazon UK and Amazon US for now. Which suits you best?</p>
              <div className="mt-2 flex gap-2">
                <button className="flex-1 rounded-full bg-white px-3 py-2 font-semibold" onClick={() => onWhere("UK")}>
                  Amazon UK (Europe)
                </button>
                <button className="flex-1 rounded-full bg-white px-3 py-2 font-semibold" onClick={() => onWhere("US")}>
                  Amazon US (rest of world)
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="mt-5 text-xs text-slate-500">
          Lookfor is for adults. By continuing you confirm you&apos;re 18 or over and agree to our{" "}
          <Link className="underline" href="/privacy" target="_blank" rel="noopener">
            privacy notice
          </Link>
          .{" "}
          <Link className="underline" href="/about" target="_blank" rel="noopener">
            How Lookfor works
          </Link>
        </p>
      </>,
    );
  }

  if (status === "sent") {
    return card(
      <>
        <h2 className="mt-2 text-2xl font-bold">Check your email</h2>
        <p className="mt-2">
          We&apos;ve sent a sign-in link to <b>{email}</b>. Open it on this device whenever you&apos;re ready. You can
          start chatting now.
        </p>
        <button
          className="mt-5 w-full rounded-full px-6 py-3 font-semibold text-white hover:opacity-90"
          style={{ background: character.theme.accent }}
          onClick={onDone}
        >
          Start chatting
        </button>
      </>,
    );
  }

  return card(
    <>
      <h2 className="mt-2 text-2xl font-bold">
        {santa ? "Ho ho ho! Santa never forgets!" : `${character.name} never forgets!`}
      </h2>
      <p className="mt-2">
        Pop in your email and I&apos;ll remember everyone you buy for, so next time is even easier.
      </p>
      <p className="mt-1 text-sm text-slate-500">Free, no password, and you can delete it any time.</p>
      <p className="mt-1 text-sm text-slate-500">
        🎄 Kept safe under the tree: stored securely in the UK, only you can see it, and we never sell it.
      </p>
      <ul className="mx-auto mt-3 max-w-xs space-y-1 text-left text-sm">
        <li>🎁 Everyone&apos;s ages, likes and sizes, saved for next time</li>
        <li>📅 Reminders before birthdays and big days</li>
        <li>📱 Your list on your phone and computer</li>
      </ul>
      <form
        className="mt-4 space-y-2 text-left"
        onSubmit={async (e) => {
          e.preventDefault();
          setStatus("sending");
          setError(null);
          const err = await account.sendLink(email.trim(), wantsEmails);
          if (err) {
            setError(err);
            setStatus("idle");
          } else {
            setStatus("sent");
          }
        }}
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          aria-label="Email address"
          className="w-full rounded-full border border-slate-300 px-4 py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={wantsEmails} onChange={(e) => setWantsEmails(e.target.checked)} />
          <span>Also send me reminders and gift ideas by email (optional)</span>
        </label>
        <button
          className="w-full rounded-full px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          style={{ background: character.theme.accent }}
          disabled={status === "sending" || !email.trim()}
        >
          {status === "sending" ? "Sending…" : "Make my free account"}
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </form>
      <button className="mt-3 text-sm text-slate-600 underline" onClick={onDone}>
        Not now, just let me chat
      </button>
    </>,
  );
}
