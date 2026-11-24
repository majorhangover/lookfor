"use client";

import { Outfit } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import AccountPanel from "./AccountPanel";
import Welcome from "./Welcome";
import FamilyPanel from "./FamilyPanel";
import { useAccount } from "./useAccount";
import Character from "./Character";
import Logo from "./Logo";
import ChristmasTree from "./ChristmasTree";
import Face from "./Face";
import Present from "./Present";
import EmptySack from "./EmptySack";
import { useLocalState } from "./useLocalState";
import { useHostVoice } from "./useHostVoice";
import { applyProfileUpdate, isSaved, toggleSavedGift } from "@/lib/profile";
import { CHARACTERS, OCCASIONS, getOccasion, seasonalOccasion, upcomingBirthdays } from "@/lib/occasions";
import type { ChatMessage, GiftIdea, Person, ProfileUpdate, Region, HostResponse } from "@/lib/types";

const outfit = Outfit({ subsets: ["latin"], weight: ["800"] });

const FIELD_LABELS: Record<ProfileUpdate["field"], string> = {
  age: "age",
  birthday: "birthday",
  interests: "loves",
  dislikes: "not keen on",
  sizes: "sizes",
  notes: "note:",
  relationship: "is your",
  budget: "budget",
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
  const firstName = character.name.split(" ")[0];
  const chatted = turns.some((t) => t.role === "user");
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

  const tree = character.id === "santa";

  const giftCard = (g: GiftIdea, j: number) => {
    const saved = isSaved(family, g);
    return (
      <div
        key={j}
        className={`group relative rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md ${tree ? "pt-6" : ""}`}
      >
        {/* The whole card opens Amazon; the save button sits above the link. */}
        <a
          href={g.url}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={() => account.logGifts("clicked", [g], occasionId)}
          className="absolute inset-0 z-0 rounded-xl"
          aria-label={`${g.title}: see options on Amazon`}
        />
        {tree && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-3 rounded-t-xl"
              style={{ background: ["#b91c1c", "#15803d", "#ca8a04", "#7c3aed"][j % 4] }}
            />
            <span aria-hidden className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
              🎀
            </span>
          </>
        )}
        <div className="pointer-events-none relative">
          <div className="flex items-start justify-between gap-2">
            <b className="group-hover:underline">{g.title}</b>
            <span className="shrink-0 text-slate-500">{g.priceBand}</span>
          </div>
          <div className="text-slate-500">For {g.forPerson}</div>
          <p className="mt-1">{g.reason}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-amber-400 px-3 py-1 font-semibold text-slate-900 group-hover:bg-amber-500">
              See options on Amazon
            </span>
            <button
              type="button"
              aria-pressed={saved}
              onClick={() => setFamily(toggleSavedGift(family, g, occasionId))}
              className={`pointer-events-auto relative z-10 rounded-full border px-3 py-1 font-semibold ${
                saved ? "border-rose-600 bg-rose-50 text-rose-700" : "border-slate-300 text-slate-700 hover:border-rose-400"
              }`}
            >
              {saved ? `♥ Saved for ${g.forPerson}` : `♡ Save for ${g.forPerson}`}
            </button>
          </div>
          <span className="mt-1 block text-xs text-slate-500">Ad · affiliate link</span>
        </div>
      </div>
    );
  };

  const showGifts = () => {
    const el = giftsRef.current;
    if (!el) return;
    // Bring the gift ideas up to the middle of the screen, so they can't be missed.
    const top = el.getBoundingClientRect().top;
    // Already in view (as on wide screens): leave the page where it is.
    if (top < window.innerHeight * 0.75) return;
    const target = window.innerHeight * 0.35;
    window.scrollBy({ top: top - target, behavior: "smooth" });
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
      {/* Phones: one column. Wide screens: occasions across the top, the ask box across the page under them, then three columns (people, chat, gifts), each with its picture above it, all in one row. */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-x-5 gap-y-3 p-4 [grid-template-areas:'nav'_'stage'_'name'_'chat'_'ask'_'treeicon'_'gifts'_'peopleicon'_'people'] lg:grid-cols-[300px_minmax(0,1fr)_340px] lg:grid-rows-[auto_auto_auto_auto_1fr] lg:[grid-template-areas:'nav_nav_nav'_'ask_ask_ask'_'peopleicon_stage_treeicon'_'._name_.'_'people_chat_gifts']">
          <nav className="flex flex-wrap gap-2 [grid-area:nav]" aria-label="Occasion">
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

          <div
            className={`rounded-3xl border-2 border-amber-300/70 bg-white/10 p-3 shadow-[0_0_40px_rgba(252,211,77,0.25)] backdrop-blur-sm [grid-area:ask] sm:p-4 lg:mt-2 ${
              chatted ? "" : "ask-glow"
            }`}
          >
            <label htmlFor="ask" className="mb-3 block text-center text-white">
              <span
                className={`${outfit.className} block bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-2xl leading-tight text-transparent drop-shadow sm:text-3xl lg:text-4xl`}
              >
                ✨ Talk to {firstName}! ✨
              </span>
              <span className="mt-1 block text-sm text-white/90 lg:text-base">
                Tell {firstName} who you’re shopping for, and the gift ideas will appear like magic.
              </span>
            </label>
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
                id="ask"
                className="min-w-0 flex-1 rounded-full bg-white px-4 py-3 text-slate-800 shadow-lg outline-none ring-4 ring-amber-300/60 focus:ring-amber-300 lg:px-6 lg:py-4 lg:text-lg"
                placeholder={`e.g. Ideas for my 7 year old who loves dinosaurs, about ${region === "UK" ? "£" : "$"}30`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={2000}
              />
              <button
                aria-label={`Ask ${firstName}`}
                className="shrink-0 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-5 font-bold text-slate-900 shadow-lg ring-2 ring-white/70 transition hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100 lg:px-7 lg:text-lg"
                disabled={busy || !input.trim()}
              >
                {busy ? "…" : (
                  <>
                    <span className="hidden sm:inline">Ask {firstName} </span>🎁
                  </>
                )}
              </button>
            </form>
          </div>

          {/* The three pictures share one row on wide screens, all the same height. */}
          <div className="flex justify-center self-end [grid-area:stage]">
            <div className="h-52 w-52 md:h-56 md:w-56">
              <Character
                id={character.id}
                mouth={voice.mouth}
                listening={voice.listening}
                speaking={voice.speaking}
                thinking={busy}
                waveKey={waveKey}
                pointUp={!chatted}
              />
            </div>
          </div>
          <div aria-hidden className="flex h-44 items-end justify-center self-end [grid-area:peopleicon] md:h-48">
            <div className="grid grid-cols-4 place-items-center">
              {(["grandma", "dad", "girl", "grandad", "mum", "boy", "baby", "friend"] as const).map((id, i) => (
                <div
                  key={id}
                  className={`-m-1 h-16 w-16 md:h-[4.5rem] md:w-[4.5rem] ${i >= 4 ? "-mt-3 translate-x-6" : ""}`}
                  style={{ rotate: `${((i * 5) % 3) * 6 - 6}deg` }}
                >
                  <Face id={id} />
                </div>
              ))}
            </div>
          </div>
          <div
            aria-hidden
            className={`mt-6 flex h-44 justify-center self-end [grid-area:treeicon] md:h-48 lg:mt-0 ${giftSets.length ? "" : "hidden lg:flex"}`}
          >
            <div className="relative h-full w-36 md:w-40">
              {tree ? <ChristmasTree lit={giftSets.length > 0} /> : <Present color={character.theme.accent} />}
            </div>
          </div>

          <div className="-mt-2 flex items-center justify-center gap-2 text-sm text-white/90 [grid-area:name]">
            <span className="font-medium">{character.name}</span>
            <button
              className="rounded-full bg-white/20 px-2 py-0.5 text-xs hover:bg-white/30"
              aria-pressed={voiceOn}
              onClick={toggleVoice}
            >
              {voiceOn ? "🔊 Voice on" : "🔇 Hear my voice"}
            </button>
          </div>
          <div className="flex min-w-0 flex-col gap-3 [grid-area:chat]">

          <div ref={chatBox} className={`min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white/90 p-4 text-slate-800 shadow-lg max-h-[45vh]`}>
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
                      {tree ? `🎁 I've popped ${t.gifts.length} under the tree ↓` : `🎁 ${t.gifts.length} gift ideas below ↓`}
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


          </div>

          <div className="flex min-w-0 flex-col self-start [grid-area:gifts]">
          {giftSets.length === 0 && (
            <section className="hidden rounded-2xl border-2 border-dashed border-white/40 p-6 text-center text-white/90 lg:block">
              {tree && (
                <div className="mx-auto mb-2 h-28 w-44">
                  <EmptySack />
                </div>
              )}
              <p className="mt-1 font-semibold">
                {tree ? "Santa\u2019s sack is empty… for now!" : "Gift ideas will appear here."}
              </p>
              <p className="text-sm opacity-80">
                {tree
                  ? "Tell Santa who you\u2019re shopping for, and he\u2019ll pop the ideas under the tree."
                  : `Tell ${character.name} who you\u2019re shopping for in the chat.`}
              </p>
            </section>
          )}
          {giftSets.length > 0 && (
            <section
              ref={giftsRef}
              className={`scroll-mt-4 rounded-2xl p-4 text-slate-800 shadow-lg ${tree ? "bg-white/95 ring-4 ring-red-700/70" : "bg-white/90"}`}
            >
              <h2 className="mb-2 text-lg font-bold">{tree ? "🎄 Under the tree" : "🎁 Gift ideas"}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{latestGifts.map(giftCard)}</div>
              {earlierGifts.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-600">
                    Earlier ideas ({earlierGifts.reduce((n, t) => n + (t.gifts?.length ?? 0), 0)})
                  </summary>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {earlierGifts.flatMap((t) => t.gifts ?? []).map(giftCard)}
                  </div>
                </details>
              )}
            </section>
          )}
          </div>

        <aside className="flex flex-col gap-4 self-start [grid-area:people]">
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
          <FamilyPanel family={family} setFamily={setFamily} currency={region === "UK" ? "£" : "$"} />
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
