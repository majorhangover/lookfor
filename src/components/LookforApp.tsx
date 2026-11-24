"use client";

import { useEffect, useRef, useState } from "react";
import AccountPanel from "./AccountPanel";
import Welcome from "./Welcome";
import FamilyPanel from "./FamilyPanel";
import { useAccount } from "./useAccount";
import Character from "./Character";
import Logo from "./Logo";
import { useLocalState } from "./useLocalState";
import { useHostVoice } from "./useHostVoice";
import { applyProfileUpdate } from "@/lib/profile";
import { CHARACTERS, OCCASIONS, getOccasion, seasonalOccasion, upcomingBirthdays } from "@/lib/occasions";
import type { ChatMessage, GiftIdea, Person, ProfileUpdate, Region, HostResponse } from "@/lib/types";

const FIELD_LABELS: Record<ProfileUpdate["field"], string> = {
  age: "age",
  birthday: "birthday",
  interests: "loves",
  dislikes: "not keen on",
  sizes: "sizes",
  notes: "note:",
  relationship: "is your",
};

interface Turn extends ChatMessage {
  gifts?: GiftIdea[];
}

export default function LookforApp() {
  // "adult" doubles as "has told us where they are": both are answered on the first welcome step.
  const [adult, setAdult] = useLocalState("lookfor.adult", false);
  const [welcomed, setWelcomed] = useLocalState("lookfor.welcomed", false);
  const [savePromptHidden, setSavePromptHidden] = useLocalState("lookfor.savePromptHidden", false);
  const [region, setRegion] = useLocalState<Region>("lookfor.region", () =>
    navigator.language === "en-US" ? "US" : "UK",
  );
  const [family, setFamily] = useLocalState<Person[]>("lookfor.family", []);
  const [pending, setPending] = useState<ProfileUpdate[]>([]);
  const [occasionId, setOccasionId] = useState(() => seasonalOccasion());
  const occasion = getOccasion(occasionId);
  const character = CHARACTERS[occasion.character];
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", content: character.greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // Bumped to make the character wave: on arrival, on a new occasion, and with each reply.
  const [waveKey, setWaveKey] = useState(1);
  // Off by default: saves voice costs and avoids surprising anyone with loud speakers.
  const [voiceOn, setVoiceOn] = useLocalState("lookfor.voiceOn", false);
  const [menuOpen, setMenuOpen] = useState(false);
  const voice = useHostVoice(region, character.id, character.voicePitch);
  const birthdays = upcomingBirthdays(family);
  const account = useAccount(family, setFamily, region);

  const changeOccasion = (id: string) => {
    voice.stop();
    setOccasionId(id);
    setWaveKey((k) => k + 1);
    const next = CHARACTERS[getOccasion(id).character];
    // A new host starts a fresh conversation; the family list is kept.
    setTurns([{ role: "assistant", content: next.greeting }]);
  };
  const chatBox = useRef<HTMLDivElement>(null);
  const giftsRef = useRef<HTMLElement>(null);

  // Keep the chat box scrolled to its newest message without moving the page.
  useEffect(() => {
    const box = chatBox.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [turns, busy, pending.length]);

  const giftSets = turns.filter((t) => t.gifts && t.gifts.length > 0);
  const latestGifts = giftSets[giftSets.length - 1]?.gifts ?? [];
  const earlierGifts = giftSets.slice(0, -1).reverse();

  const giftCard = (g: GiftIdea, j: number) => (
    <div key={j} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <b>{g.title}</b>
        <span className="shrink-0 text-slate-500">{g.priceBand}</span>
      </div>
      <div className="text-slate-500">For {g.forPerson}</div>
      <p className="mt-1">{g.reason}</p>
      <a
        href={g.url}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        onClick={() => account.logGifts("clicked", [g], occasionId)}
        className="mt-2 inline-block rounded-full bg-amber-400 px-3 py-1 font-semibold text-slate-900 hover:bg-amber-500"
      >
        See options on Amazon
      </a>
      <span className="ml-2 text-xs text-slate-500">Ad · affiliate link</span>
    </div>
  );

  const showGifts = () => {
    const el = giftsRef.current;
    if (!el) return;
    // Bring the gift ideas up to the middle of the screen, so they can't be missed.
    const top = el.getBoundingClientRect().top;
    const target = window.innerHeight * 0.35;
    if (top > target) window.scrollBy({ top: top - target, behavior: "smooth" });
  };

  // When new ideas arrive, nudge the page so the ideas come into view.
  useEffect(() => {
    if (giftSets.length > 0) setTimeout(showGifts, 150);
  }, [giftSets.length]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: Turn[] = [...turns, { role: "user", content }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          occasion: occasionId,
          family,
          // Skip the canned greeting: the conversation must start with the user.
          messages: next.slice(1).slice(-30).map(({ role, content }) => ({ role, content })),
        }),
      });
      const data: HostResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setTurns([...next, { role: "assistant", content: data.reply, gifts: data.gifts }]);
      if (data.gifts?.length) setWaveKey((k) => k + 1);
      if (data.profileUpdates?.length) setPending((p) => [...p, ...data.profileUpdates]);
      if (data.gifts?.length) account.logGifts("shown", data.gifts, occasionId);
      if (voiceOn) voice.speak(data.reply);
    } catch (e) {
      setTurns([
        ...next,
        { role: "assistant", content: e instanceof Error ? e.message : "Our gift helpers are busy. Try again." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const bg = {
    background: `linear-gradient(160deg, ${character.theme.from} 0%, ${character.theme.via} 50%, ${character.theme.to} 100%)`,
  };

  // Returning signed-in users, and anyone who has skipped, go straight to the chat.
  if (!account.ready) return null;
  if (!adult || (!welcomed && account.enabled && !account.email)) {
    return (
      <Welcome
        character={character}
        account={account}
        needsWhere={!adult}
        onWhere={(r) => {
          setRegion(r);
          setAdult(true);
          if (!account.enabled) setWelcomed(true);
        }}
        onDone={() => setWelcomed(true)}
      />
    );
  }

  const openSignUp = () => {
    setMenuOpen(true);
    // Wait for the account box to open before focusing the email field.
    setTimeout(() => {
      document.getElementById("account-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      document.getElementById("account-email")?.focus({ preventScroll: true });
    }, 50);
  };
  const toggleVoice = () => {
    if (voiceOn) voice.stop();
    setVoiceOn(!voiceOn);
  };

  const showSavePrompt =
    account.enabled && !account.email && !savePromptHidden && turns.some((t) => t.gifts && t.gifts.length > 0);

  return (
    <div className="min-h-screen transition-colors" style={bg}>
      <header className="relative mx-auto flex max-w-6xl justify-end gap-2 px-4 pt-3 text-white">
        <div className="flex items-center gap-2 text-sm">
          <a
            href="/about"
            target="_blank"
            rel="noopener"
            className="rounded-full bg-white/20 px-3 py-1 font-semibold text-white shadow hover:bg-white/30"
          >
            How it works
          </a>
          <button
            aria-expanded={menuOpen}
            title={account.email ? `Signed in as ${account.email}` : undefined}
            className={`rounded-full px-3 py-1 font-semibold shadow ${
              account.enabled && !account.email
                ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {!account.enabled ? (
              "⚙️ Settings"
            ) : account.email ? (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                <span className="max-w-[12rem] truncate">{account.email}</span>
              </span>
            ) : (
              "✨ Free account"
            )}
          </button>
          {menuOpen && (
            <>
              <button
                aria-label="Close"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-4 top-full z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] space-y-3 rounded-2xl bg-white p-3 text-slate-800 shadow-2xl">
                <AccountPanel account={account} />
                <section className="rounded-2xl bg-slate-50 p-4">
                  <h2 className="mb-2 font-bold">Settings</h2>
                  <label className="flex items-center justify-between gap-2 py-1">
                    <span>Shop</span>
                    <select
                      className="rounded border border-slate-300 bg-white px-1 py-0.5"
                      value={region}
                      onChange={(e) => setRegion(e.target.value as Region)}
                    >
                      <option value="UK">Amazon UK</option>
                      <option value="US">Amazon US</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between gap-2 py-1">
                    <span>{character.name}&apos;s voice</span>
                    <input type="checkbox" className="h-4 w-4" checked={voiceOn} onChange={toggleVoice} />
                  </label>
                  <button className="mt-2 text-xs underline" onClick={() => setMenuOpen(false)}>
                    Close
                  </button>
                </section>
              </div>
            </>
          )}
        </div>
      </header>
      <div className="px-4">
        <Logo />
      </div>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">

          <nav className="flex flex-wrap gap-2" aria-label="Occasion">
            {OCCASIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => changeOccasion(o.id)}
                className={`rounded-full px-3 py-1 text-sm ${
                  o.id === occasionId ? "bg-white font-semibold text-slate-900" : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {o.label}
              </button>
            ))}
          </nav>

          <div className="mx-auto h-52 w-52 md:h-60 md:w-60">
            <Character
              id={character.id}
              mouth={voice.mouth}
              listening={voice.listening}
              speaking={voice.speaking}
              thinking={busy}
              waveKey={waveKey}
            />
          </div>
          <div className="-mt-2 flex items-center justify-center gap-2 text-sm text-white/90">
            <span className="font-medium">{character.name}</span>
            <button
              className="rounded-full bg-white/20 px-2 py-0.5 text-xs hover:bg-white/30"
              aria-pressed={voiceOn}
              onClick={toggleVoice}
            >
              {voiceOn ? "🔊 Voice on" : "🔇 Hear my voice"}
            </button>
          </div>

          <div ref={chatBox} className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white/90 p-4 text-slate-800 shadow-lg max-h-[45vh]">
            {turns.map((t, i) => (
              <div key={i} className={t.role === "user" ? "text-right" : ""}>
                <div
                  className="inline-block max-w-[85%] rounded-2xl px-3 py-2 text-left"
                  style={
                    t.role === "user"
                      ? { background: character.theme.accent, color: "white" }
                      : { background: character.theme.bubble }
                  }
                >
                  {t.content}
                </div>
                {t.gifts && t.gifts.length > 0 && (
                  <div className="mt-1">
                    <button
                      className="rounded-full px-3 py-1 text-sm font-semibold text-white hover:opacity-90"
                      style={{ background: character.theme.accent }}
                      onClick={showGifts}
                    >
                      🎁 {t.gifts.length} gift ideas below ↓
                    </button>
                  </div>
                )}
              </div>
            ))}
            {turns.length === 1 && account.enabled && !account.email && !account.linkSentTo && (
              <div>
                <div className="inline-block max-w-[85%] rounded-2xl px-3 py-2" style={{ background: character.theme.bubble }}>
                  Psst… {character.id === "santa" ? "Santa" : character.name} never forgets! Make a free account with
                  just your email, and I&apos;ll remember everyone you buy for, plus their birthdays.
                  <div className="mt-2">
                    <button
                      className="rounded-full px-3 py-1 text-sm font-semibold text-white hover:opacity-90"
                      style={{ background: character.theme.accent }}
                      onClick={openSignUp}
                    >
                      Make my free account
                    </button>
                  </div>
                </div>
              </div>
            )}
            {pending.length > 0 && !busy && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm">
                <b>Shall I remember this for next time?</b>
                <ul className="mt-1 space-y-1">
                  {pending.map((u, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <span>
                        <b>{u.personNickname}</b>
                        {u.isNewPerson ? " (new)" : ""}: {FIELD_LABELS[u.field]} {u.value}
                      </span>
                      <span className="flex shrink-0 gap-1">
                        <button
                          className="rounded-full bg-emerald-700 px-2 text-white"
                          onClick={() => {
                            setFamily(applyProfileUpdate(family, u));
                            setPending(pending.filter((p) => p !== u));
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="rounded-full bg-slate-200 px-2"
                          onClick={() => setPending(pending.filter((p) => p !== u))}
                        >
                          Skip
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                {pending.length > 1 && (
                  <button
                    className="mt-2 rounded-full bg-emerald-700 px-3 py-1 font-semibold text-white"
                    onClick={() => {
                      setFamily(pending.reduce(applyProfileUpdate, family));
                      setPending([]);
                    }}
                  >
                    Save all
                  </button>
                )}
              </div>
            )}
            {showSavePrompt && !busy && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
                {account.linkSentTo ? (
                  <>
                    <b>Nearly there!</b> Open the sign-in link we sent to {account.linkSentTo} in this browser, and
                    I&apos;ll save your people.
                  </>
                ) : (
                  <>
                    <b>Want me to remember everyone for next time?</b> Save your people and get reminders before
                    birthdays. It&apos;s free.
                  </>
                )}
                <div className="mt-2 flex gap-3">
                  <button
                    className="rounded-full bg-slate-800 px-3 py-1 font-semibold text-white"
                    onClick={() => {
                      if (account.linkSentTo) account.clearLinkSent();
                      // Wait for the sign-up form to replace the "check your email" card before focusing it.
                      setTimeout(openSignUp, 0);
                    }}
                  >
                    {account.linkSentTo ? "Use a different email" : "Save my people"}
                  </button>
                  <button className="underline" onClick={() => setSavePromptHidden(true)}>
                    No thanks
                  </button>
                </div>
              </div>
            )}
            {busy && <div className="text-slate-500 italic">{character.name} is thinking…</div>}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            {voice.canListen && (
              <button
                type="button"
                aria-label={voice.listening ? "Stop listening" : `Talk to ${character.name}`}
                className={`rounded-full px-4 text-xl ${voice.listening ? "bg-amber-400" : "bg-white/90"}`}
                onClick={() => (voice.listening ? voice.stopListening() : voice.listen((text) => send(text)))}
              >
                🎤
              </button>
            )}
            <input
              className="min-w-0 flex-1 rounded-full bg-white px-4 py-3 text-slate-800 shadow"
              placeholder={`e.g. Ideas for my 7 year old who loves dinosaurs, about ${region === "UK" ? "£" : "$"}30`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
            />
            <button
              className="rounded-full px-5 font-semibold text-white hover:opacity-90 disabled:opacity-50"
              style={{ background: character.theme.accent }}
              disabled={busy || !input.trim()}
            >
              Send
            </button>
          </form>

          {giftSets.length > 0 && (
            <section ref={giftsRef} className="scroll-mt-4 rounded-2xl bg-white/90 p-4 text-slate-800 shadow-lg">
              <h2 className="mb-2 text-lg font-bold">🎁 Gift ideas</h2>
              <div className="grid gap-2 sm:grid-cols-2">{latestGifts.map(giftCard)}</div>
              {earlierGifts.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-600">
                    Earlier ideas ({earlierGifts.reduce((n, t) => n + (t.gifts?.length ?? 0), 0)})
                  </summary>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {earlierGifts.flatMap((t) => t.gifts ?? []).map(giftCard)}
                  </div>
                </details>
              )}
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {birthdays.length > 0 && (
            <section className="rounded-2xl bg-white/90 p-4 text-sm text-slate-800 shadow-lg">
              <h2 className="mb-1 font-bold">Coming up</h2>
              <ul>
                {birthdays.map((b) => (
                  <li key={b.nickname} className="flex items-center justify-between py-0.5">
                    <span>
                      {b.nickname}&apos;s birthday · {b.when}
                    </span>
                    <button className="underline" onClick={() => changeOccasion("birthday")}>
                      Find gifts
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <FamilyPanel family={family} setFamily={setFamily} />
        </aside>
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-white/70">
        AI characters: check age ratings and details before you buy. As an Amazon Associate we earn from qualifying
        purchases. ·{" "}
        <a className="underline hover:text-white" href="/about" target="_blank" rel="noopener">
          How it works
        </a>{" "}
        ·{" "}
        <a className="underline hover:text-white" href="/privacy" target="_blank" rel="noopener">
          Privacy
        </a>
      </footer>
    </div>
  );
}
