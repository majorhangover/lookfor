"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AccountPanel from "./AccountPanel";
import Welcome from "./Welcome";
import FamilyPanel from "./FamilyPanel";
import { useAccount } from "./useAccount";
import Character from "./Character";
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
  const [voiceOn, setVoiceOn] = useLocalState("lookfor.voice", true);
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
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

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
    document.getElementById("account-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("account-email")?.focus({ preventScroll: true });
  };

  const showSavePrompt =
    account.enabled && !account.email && !savePromptHidden && turns.some((t) => t.gifts && t.gifts.length > 0);

  return (
    <div className="min-h-screen transition-colors" style={bg}>
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 p-4 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          <header className="flex flex-wrap items-center justify-between gap-2 text-white">
            <h1 className="text-2xl font-bold">
              Lookfor <span className="text-base font-normal opacity-80">· gift ideas for every occasion</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {account.enabled && !account.email && (
                <button
                  className="rounded-full bg-amber-400 px-3 py-1 font-semibold text-slate-900 shadow hover:bg-amber-300"
                  onClick={openSignUp}
                >
                  ✨ Free account
                </button>
              )}
              <label className="flex items-center gap-1">
                Shop
                <select
                  className="rounded bg-white/90 px-1 py-0.5 text-slate-800"
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                >
                  <option value="UK">Amazon UK</option>
                  <option value="US">Amazon US</option>
                </select>
              </label>
              <button
                className="rounded-full bg-white/20 px-3 py-1 hover:bg-white/30"
                onClick={() => {
                  if (voiceOn) voice.stop();
                  setVoiceOn(!voiceOn);
                }}
              >
                {voiceOn ? "🔊 Voice on" : "🔇 Voice off"}
              </button>
            </div>
          </header>

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
          <p className="-mt-2 text-center text-sm font-medium text-white/90">{character.name}</p>

          <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white/90 p-4 text-slate-800 shadow-lg max-h-[45vh]">
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
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {t.gifts.map((g, j) => (
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
                    ))}
                  </div>
                )}
              </div>
            ))}
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
            <div ref={bottom} />
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
          {!account.email && <AccountPanel account={account} />}
          <FamilyPanel family={family} setFamily={setFamily} />
          {account.email && <AccountPanel account={account} />}
          <p className="rounded-2xl bg-white/80 p-3 text-xs text-slate-700">
            Our characters are AI and their suggestions are generated automatically. Check age ratings and details
            before you buy. As an Amazon Associate we earn from qualifying purchases. Your family list is stored on this
            device, and in your account if you sign in. <Link className="underline" href="/privacy">Privacy</Link>
          </p>
        </aside>
      </main>
    </div>
  );
}
