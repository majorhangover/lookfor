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
import Flag from "./Flag";
import Present from "./Present";
import EmptySack from "./EmptySack";
import { useLocalState } from "./useLocalState";
import { useHostVoice } from "./useHostVoice";
import { playJingle } from "@/lib/jingle";
import { giftSharePath } from "@/lib/share";
import { examplePrompts } from "@/lib/examples";
import { applyProfileUpdate, isSaved, toggleSavedGift } from "@/lib/profile";
import { track } from "@/lib/tracking";
import { buildNudge } from "@/lib/nudge";
import VoiceBubble from "./VoiceBubble";
import ProfileBuilder from "./ProfileBuilder";
import { CookieSettings } from "./CookieBanner";
import { CHARACTERS, OCCASIONS, getOccasion, seasonalOccasion, upcomingBirthdays } from "@/lib/occasions";
import type { ChatMessage, GiftIdea, Person, ProfileUpdate, Region, HostResponse } from "@/lib/types";

const outfit = Outfit({ subsets: ["latin"], weight: ["800"] });

interface Turn extends ChatMessage {
  gifts?: GiftIdea[];
  /** A prompt the character adds by itself when things go quiet (not sent to the AI). */
  nudge?: boolean;
  /** Quick replies shown under a nudge. */
  chips?: string[];
}

export default function LookforApp() {
  // "adult" now means "we know which shop to use" (from the IP, or the welcome step); the 18+ note sits under the chat box.
  const [adult, setAdult] = useLocalState("lookfor.adult", false);
  const [, setWelcomed] = useLocalState("lookfor.welcomed", false);
  const [savePromptHidden, setSavePromptHidden] = useLocalState("lookfor.savePromptHidden", false);
  const [region, setRegion] = useLocalState<Region>("lookfor.region", () =>
    navigator.language === "en-US" ? "US" : "UK",
  );
  const [family, setFamily] = useLocalState<Person[]>("lookfor.family", []);
  const [pending, setPending] = useState<ProfileUpdate[]>([]);
  // Set when the user shares something sad: no more cheerful nudges this visit.
  const [hush, setHush] = useState(false);
  // Shown (and kept on screen) if the user mentions suicide or self-harm.
  const [helpBox, setHelpBox] = useState(false);
  // Set when the user seems to be a child: the chat pauses for this browser tab.
  // (The page only renders once the account has loaded in the browser, so reading sessionStorage here is safe.)
  const [childLock, setChildLock] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("lookfor.child") === "1",
  );
  const [savedNote, setSavedNote] = useState<string | null>(null);
  /** Save everything learned about one person to My people. */
  const saveProfile = (name: string, face?: string) => {
    const same = (n: string) => n.trim().toLowerCase() === name.trim().toLowerCase();
    const mine = pending.filter((u) => same(u.personNickname));
    const updated = mine.reduce(applyProfileUpdate, family);
    setFamily(face ? updated.map((p) => (same(p.nickname) ? { ...p, face } : p)) : updated);
    setPending(pending.filter((u) => !mine.includes(u)));
    setSavedNote(name);
  };
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
  const [regionOpen, setRegionOpen] = useState(false);
  const voice = useHostVoice(region, character.id, character.voicePitch);
  const firstName = character.name.split(" ")[0];
  const chatted = turns.some((t) => t.role === "user");
  // Rotating example requests in the chat box, to show what you can ask.
  const examples = examplePrompts(occasionId, region);
  const [exampleIdx, setExampleIdx] = useState(0);
  // Each example is "typed" into the box letter by letter, held, rubbed out, then the next one.
  const [typed, setTyped] = useState(0);
  const [erasing, setErasing] = useState(false);
  const example = examples[exampleIdx % examples.length];
  useEffect(() => {
    // People who ask for less motion just see the examples change every few seconds.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const show = setTimeout(() => setTyped(example.length), 0);
      const next = setTimeout(() => setExampleIdx((i) => i + 1), 4000);
      return () => {
        clearTimeout(show);
        clearTimeout(next);
      };
    }
    let id: ReturnType<typeof setTimeout>;
    if (!erasing && typed < example.length) id = setTimeout(() => setTyped(typed + 1), 45 + Math.random() * 50);
    else if (!erasing) id = setTimeout(() => setErasing(true), 2200);
    else if (typed > 0) id = setTimeout(() => setTyped(typed - 1), 18);
    else
      id = setTimeout(() => {
        setErasing(false);
        setExampleIdx((i) => i + 1);
      }, 400);
    return () => clearTimeout(id);
  }, [typed, erasing, example]);
  // After the host has answered and finished talking, flash the chat bar to
  // show it's the user's turn again (until they start typing).
  const yourTurn =
    chatted && !busy && !voice.speaking && turns[turns.length - 1]?.role === "assistant" && !input;
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
  // Earlier ideas, grouped by who they're for, so nobody's ideas get lost in the pile.
  const earlierByPerson = new Map<string, GiftIdea[]>();
  for (const g of earlierGifts.flatMap((t) => t.gifts ?? [])) {
    const key = g.forPerson.trim() || "Someone";
    const list = earlierByPerson.get(key) ?? [];
    if (!list.some((x) => x.title === g.title)) earlierByPerson.set(key, [...list, g]);
  }
  const [openEarlier, setOpenEarlier] = useState<string | null>(null);
  const ideasFor = (name: string) =>
    giftSets.flatMap((t) => t.gifts ?? []).filter((g) => g.forPerson.trim().toLowerCase() === name.trim().toLowerCase());

  const tree = character.id === "santa";

  // Share a Lookfor page for the gift (not the Amazon link, which must be
  // clicked from our site). Phones open the share menu; elsewhere we copy it.
  const [sharedTitle, setSharedTitle] = useState<string | null>(null);
  const shareGift = async (g: GiftIdea) => {
    const url = `${window.location.origin}${giftSharePath(g, region)}`;
    const text = `Gift idea: ${g.title}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setSharedTitle(g.title);
      setTimeout(() => setSharedTitle(null), 2500);
    } catch {
      // Cancelled by the user, or sharing isn't available: nothing to do.
    }
  };

  // When every idea on show is for the same person, say so once in the heading instead of on each card.
  const oneRecipient = new Set(latestGifts.map((g) => g.forPerson)).size === 1 ? latestGifts[0].forPerson : null;
  const giftCard = (g: GiftIdea, j: number, drop = false, showFor = !oneRecipient) => {
    const saved = isSaved(family, g);
    return (
      <div
        key={j}
        className={`group relative rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md ${tree ? "pt-6" : ""} ${drop ? "gift-drop" : ""}`}
        style={drop ? { animationDelay: `${0.25 + j * 0.22}s` } : undefined}
      >
        {/* The whole card opens Amazon; the save button sits above the link. */}
        <a
          href={g.url}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={() => {
            account.logGifts("clicked", [g], occasionId);
            track("GiftClick", { occasion: occasionId, idea: g.title });
          }}
          className="absolute inset-0 z-0 rounded-xl"
          aria-label={`${g.title}: see options and prices`}
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
          <p className="text-slate-600">
            {showFor && <span className="text-slate-500">For {g.forPerson} · </span>}
            {g.reason}
          </p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="inline-block rounded-full bg-amber-400 px-3 py-1 font-semibold text-slate-900 group-hover:bg-amber-500">
              See options
            </span>
            <button
              type="button"
              aria-pressed={saved}
              aria-label={saved ? `Saved for ${g.forPerson}` : `Save for ${g.forPerson}`}
              title={saved ? `Saved for ${g.forPerson}` : `Save for ${g.forPerson}`}
              onClick={() => setFamily(toggleSavedGift(family, g, occasionId))}
              className={`pointer-events-auto relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-base ${
                saved ? "border-rose-600 bg-rose-50 text-rose-700" : "border-slate-300 text-slate-700 hover:border-rose-400"
              }`}
            >
              {saved ? "♥" : "♡"}
            </button>
            <button
              type="button"
              aria-label="Share this idea"
              title={sharedTitle === g.title ? "Link copied" : "Share"}
              onClick={() => shareGift(g)}
              className="pointer-events-auto relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-700 hover:border-emerald-500"
            >
              {sharedTitle === g.title ? "✓" : "↗"}
            </button>
            <span className="ml-auto text-[11px] leading-tight text-slate-400">Ad · affiliate link</span>
          </div>
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

  // A short celebration on the gift panel (and the tree) to draw the eye.
  const [celebrate, setCelebrate] = useState(0);
  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(0), 2600);
    return () => clearTimeout(t);
  }, [celebrate]);

  // When new ideas arrive, nudge the page so the ideas come into view.
  useEffect(() => {
    if (giftSets.length === 0) return;
    setTimeout(showGifts, 150);
  }, [giftSets.length]);

  /** Sends a chat message. `startOccasion` switches host first, with a fresh conversation. */
  const send = async (text: string, startOccasion?: string) => {
    const content = text.trim();
    if (!content || busy || childLock) return;
    setSavedNote(null);
    // A safety net in case the reply doesn't flag it: sad news means no cheerful nudges.
    if (/(suicid|kill myself|killing myself|take my own life|taking my own life|end my life|ending my life|end it all|self[- ]?harm|hurt myself|hurting myself|want to die|better off dead|overdos\w*)/i.test(content)) {
      setHelpBox(true);
      setHush(true);
    }
    if (/\b(died|dead|passed away|passed on|funeral|lost my|bereave\w*|terminal|cancer)\b/i.test(content)) setHush(true);
    const occasionKey = startOccasion ?? occasionId;
    const speaker = getOccasion(occasionKey).character;
    const base: Turn[] = startOccasion
      ? [{ role: "assistant", content: CHARACTERS[getOccasion(startOccasion).character].greeting }]
      : turns;
    if (startOccasion) {
      voice.stop();
      setOccasionId(startOccasion);
      setWaveKey((k) => k + 1);
    }
    const next: Turn[] = [...base, { role: "user", content }];
    setTurns(next);
    setInput("");
    setBusy(true);
    // Phones: the ask box is at the top, so bring the chat into view to see the answer arrive.
    if (window.matchMedia("(max-width: 1023px)").matches)
      setTimeout(() => chatBox.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          occasion: occasionKey,
          family,
          // Skip the canned greeting: the conversation must start with the user.
          messages: next.slice(1).filter((t) => !t.nudge).slice(-30).map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Something went wrong");
      }
      // The answer streams in: first Santa's words (so he can start talking
      // straight away), then the gift ideas.
      let data: HostResponse | null = null;
      let spoken = false;
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (value) buffer += value;
        const lines = buffer.split("\n");
        buffer = done ? "" : (lines.pop() ?? "");
        for (const line of lines) {
          if (!line.trim()) continue;
          const msg: { reply?: string; result?: HostResponse; error?: string } = JSON.parse(line);
          if (msg.error) throw new Error(msg.error);
          if (msg.reply !== undefined && !spoken) {
            spoken = true;
            setTurns([...next, { role: "assistant", content: msg.reply }]);
            if (voiceOn) voice.speak(msg.reply, speaker);
          }
          if (msg.result) data = msg.result;
        }
        if (done) break;
      }
      if (!data) throw new Error("Something went wrong");
      setTurns([...next, { role: "assistant", content: data.reply, gifts: data.gifts }]);
      if (!spoken && voiceOn) voice.speak(data.reply, speaker);
      if (data.gifts?.length) {
        setWaveKey((k) => k + 1);
        // Jingle and celebrate, to draw the eye to the new ideas.
        playJingle();
        setCelebrate((c) => c + 1);
      }
      if (data.sensitive) setHush(true);
      if (data.child) {
        setChildLock(true);
        setHush(true);
        sessionStorage.setItem("lookfor.child", "1");
      }
      if (data.profileUpdates?.length) setPending((p) => [...p, ...data!.profileUpdates]);
      if (data.gifts?.length) {
        account.logGifts("shown", data.gifts, occasionKey);
        // Retargeting (only if the visitor accepted cookies): broad info only, no nicknames or ages.
        const relationships = [
          ...new Set(
            data.gifts
              .map((g) => family.find((p) => p.nickname.toLowerCase() === g.forPerson.toLowerCase())?.relationship)
              .filter((r): r is string => !!r),
          ),
        ];
        track("GiftIdeas", { occasion: occasionKey, relationships, ideas: data.gifts.map((g) => g.title) });
      }
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

  // When things go quiet, the character speaks up: points to the ask box, offers
  // more ideas, or suggests someone else. At most 3 times, and never while busy or typing.
  // Only the one-tap country step; accounts are offered later, never as a pop-up.
  // Where we can tell the country from the IP address, skip the welcome step
  // entirely: the shop is set quietly and can be changed from the flag in the
  // header. The welcome step only appears when we can't tell (VPNs, elsewhere).
  const [whereChecked, setWhereChecked] = useState(false);
  useEffect(() => {
    if (adult) return;
    let live = true;
    fetch("/api/where")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { region?: Region | null } | null) => {
        if (!live) return;
        if (d?.region) {
          setRegion(d.region);
          setAdult(true);
          setWelcomed(true);
        }
        setWhereChecked(true);
      })
      .catch(() => live && setWhereChecked(true));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adult]);
  const inWelcome = !adult;
  const [nudges, setNudges] = useState(0);
  const lastTurn = turns[turns.length - 1];
  const quiet = account.ready && !inWelcome && !busy && !voice.speaking && !input && !hush && pending.length === 0 && nudges < 3 && !lastTurn?.nudge;
  const speakNudge = voice.speak;
  useEffect(() => {
    if (!quiet) return;
    const wait = !chatted ? 20000 : lastTurn?.gifts?.length ? 20000 : 30000;
    const t = setTimeout(() => {
      const n = buildNudge({
        chatted,
        lastGifts: giftSets[giftSets.length - 1]?.gifts,
        giftedNames: giftSets.flatMap((g) => (g.gifts ?? []).map((x) => x.forPerson)),
        family,
        tree,
        count: nudges,
      });
      setTurns((ts) => [...ts, { role: "assistant", content: n.content, nudge: true, chips: n.chips }]);
      setNudges((k) => k + 1);
      setWaveKey((k) => k + 1);
      if (voiceOn) speakNudge(n.content, character.id);
    }, wait);
    return () => clearTimeout(t);
    // Restart the quiet timer whenever the conversation moves on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiet, turns.length]);

  // Returning signed-in users, and anyone who has skipped, go straight to the chat.
  if (!account.ready) return null;
  if (inWelcome && !whereChecked) return null;
  if (inWelcome) {
    return (
      <Welcome
        character={character}
        account={account}
        needsWhere={!adult}
        onWhere={(r) => {
          setRegion(r);
          setAdult(true);
          setWelcomed(true);
          // Start the main page at the top (the welcome screen may have been scrolled on phones).
          setTimeout(() => window.scrollTo(0, 0), 0);
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
          {/* Country: shows which Amazon store the gift links go to, and switches it. */}
          <div className="relative">
            <button
              aria-expanded={regionOpen}
              aria-label={`Shopping in the ${region}. Change country`}
              title={`Gift links go to ${region} shops`}
              className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 font-semibold text-white shadow hover:bg-white/30"
              onClick={() => setRegionOpen(!regionOpen)}
            >
              <Flag region={region} />
              {region} <span aria-hidden className="text-xs">▾</span>
            </button>
            {regionOpen && (
              <>
                <button
                  aria-label="Close"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setRegionOpen(false)}
                />
                <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl bg-white p-2 text-slate-800 shadow-2xl">
                  <p className="px-2 pb-1 text-xs text-slate-500">Shop gifts from</p>
                  {(["UK", "US"] as const).map((r) => (
                    <button
                      key={r}
                      className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left hover:bg-slate-100 ${
                        r === region ? "font-semibold" : ""
                      }`}
                      onClick={() => {
                        setRegion(r);
                        setRegionOpen(false);
                      }}
                    >
                      <Flag region={r} className="h-4 w-6" />
                      <span className="flex-1">{r === "UK" ? "United Kingdom" : "United States"}</span>
                      {r === region && <span className="text-emerald-600">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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
                      <option value="UK">UK shops</option>
                      <option value="US">US shops</option>
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
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-x-5 gap-y-3 p-4 [grid-template-areas:'nav'_'ask'_'stage'_'chat'_'treeicon'_'gifts'_'peopleicon'_'people'] lg:grid-cols-[300px_minmax(0,1fr)_340px] lg:grid-rows-[auto_auto_auto_1fr] lg:[grid-template-areas:'nav_nav_nav'_'ask_ask_ask'_'peopleicon_stage_treeicon'_'people_chat_gifts']">
          <nav className="flex flex-wrap justify-center gap-2 [grid-area:nav]" aria-label="Occasion">
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
              !chatted || lastTurn?.nudge ? "ask-glow" : yourTurn ? "ask-nudge" : ""
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
            {helpBox && (
              <div role="alert" className="mb-3 rounded-2xl bg-white px-4 py-3 text-slate-800 shadow-lg ring-4 ring-sky-300">
                <p className="font-bold">You don&apos;t have to go through this alone.</p>
                {region === "UK" ? (
                  <p className="text-sm">
                    Talk to Samaritans, free, any time: call <a className="font-bold underline" href="tel:116123">116 123</a>. If
                    you&apos;re in danger now, call <a className="font-bold underline" href="tel:999">999</a>.
                  </p>
                ) : (
                  <p className="text-sm">
                    Call or text <a className="font-bold underline" href="tel:988">988</a>, free, any time. If you&apos;re in
                    danger now, call <a className="font-bold underline" href="tel:911">911</a>.
                  </p>
                )}
              </div>
            )}
            {childLock ? (
              <p className="rounded-2xl bg-white/90 px-4 py-3 text-center font-semibold text-slate-800 shadow-lg">
                Lookfor is for grown-ups. Please ask a parent or guardian to help you.
              </p>
            ) : (
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
                placeholder={`e.g. ${example.slice(0, typed)}${typed < example.length ? "|" : ""}`}
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
            )}
            <p className="mt-2 text-center text-xs text-white/70">
              Lookfor is for adults (18+). By chatting you agree to our{" "}
              <a className="underline" href="/privacy" target="_blank" rel="noopener">
                privacy notice
              </a>
              .
            </p>
          </div>

          {/* The three pictures share one row on wide screens, all the same height. */}
          <div className="flex justify-center self-end [grid-area:stage]">
            <div className="relative h-52 w-52 md:h-56 md:w-56">
              <VoiceBubble
                on={voiceOn}
                speaking={voice.speaking}
                name={firstName}
                accent={character.theme.accent}
                onToggle={toggleVoice}
              />
              <Character
                id={character.id}
                mouth={voice.mouth}
                listening={voice.listening}
                speaking={voice.speaking}
                thinking={busy}
                waveKey={waveKey}
                pointUp={!chatted || (!!lastTurn?.nudge && !busy)}
              />
            </div>
          </div>
          <div aria-hidden className="flex h-44 items-center justify-center self-end [grid-area:peopleicon] md:h-48">
            <div className="flex flex-col items-center">
              {([
                ["grandma", "dad", "girl"],
                ["grandad", "mum"],
                ["boy", "baby", "friend"],
              ] as const).map((row, r) => (
                <div key={r} className={`flex ${r ? "-mt-3" : ""}`}>
                  {row.map((id, c) => {
                    const i = r * 3 + c;
                    return (
                      <div
                        key={id}
                        className="people-bob -mx-0.5 h-16 w-16 md:h-[4.5rem] md:w-[4.5rem]"
                        style={{ rotate: `${((i * 5) % 3) * 6 - 6}deg`, animationDelay: `${-(i * 0.7) % 3.6}s` }}
                      >
                        <Face id={id} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div
            aria-hidden
            className={`mt-6 flex h-44 justify-center self-end [grid-area:treeicon] md:h-48 lg:mt-0 ${giftSets.length ? "" : "hidden lg:flex"}`}
          >
            <div
              className={`relative h-full w-36 md:w-40 ${celebrate ? "tree-hop" : ""} ${giftSets.length ? "tree-glow" : ""}`}
            >
              {tree ? (
                <div className="tree-sway absolute inset-0">
                  <ChristmasTree lit={giftSets.length > 0} />
                </div>
              ) : (
                <Present color={character.theme.accent} />
              )}
              {/* When ideas arrive, the tree shakes loose a shower of sparkles onto them below. */}
              {celebrate > 0 && (
                <div className="pointer-events-none absolute inset-x-0 top-1/3 z-30 h-0" key={`sparkle-${celebrate}`}>
                  {Array.from({ length: 16 }, (_, i) => (
                    <span
                      key={i}
                      className="sparkle-fall absolute text-base"
                      style={{
                        left: `${10 + ((i * 41) % 80)}%`,
                        animationDelay: `${(i % 8) * 0.12}s`,
                        ["--dx" as string]: `${((i * 29) % 60) - 30}px`,
                      }}
                    >
                      {["✨", "⭐", "❄️", "✦"][i % 4]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* On wide screens the chat fills its column to line up with the ideas beside it, and scrolls inside. */}
          <div className="flex min-w-0 flex-col gap-3 [grid-area:chat] lg:relative lg:min-h-[26rem]">

          <div ref={chatBox} className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white/90 p-4 text-slate-800 shadow-lg max-h-[45vh] lg:absolute lg:inset-0 lg:max-h-none">
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
                {t.nudge && t.chips && t.chips.length > 0 && i === turns.length - 1 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {t.chips.map((c) => (
                      <button
                        key={c}
                        className="rounded-full border-2 bg-white px-3 py-1 text-sm font-semibold hover:bg-slate-50"
                        style={{ borderColor: character.theme.accent, color: character.theme.accent }}
                        onClick={() => send(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* One simple offer per person; the details are saved quietly and can be edited in My people. */}
            {pending.length > 0 &&
              !busy &&
              [...new Set(pending.map((u) => u.personNickname))].map((name) => {
                const mine = pending.filter((u) => u.personNickname === name);
                const isNew = mine.some((u) => u.isNewPerson) && !family.some((f) => f.nickname.toLowerCase() === name.toLowerCase());
                return (
                  <div key={name} className="flex flex-wrap items-center gap-2 text-sm lg:hidden">
                    <button
                      className="rounded-full bg-emerald-700 px-3 py-1.5 font-semibold text-white shadow hover:bg-emerald-800"
                      onClick={() => saveProfile(name)}
                    >
                      {isNew ? `＋ Add ${name} to My people` : `＋ Add this to ${name}’s profile`}
                    </button>
                    <button
                      className="text-slate-500 underline"
                      onClick={() => setPending(pending.filter((u) => u.personNickname !== name))}
                    >
                      No thanks
                    </button>
                  </div>
                );
              })}
            {savedNote && !busy && (
              <div className="text-sm text-emerald-800">
                ✓ Saved to {savedNote}’s profile. You can change it any time in My people.
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
            {busy && (turns[turns.length - 1]?.role === "user" ? (
              <div className="text-slate-500 italic">{character.name} is thinking…</div>
            ) : (
              <div className="text-slate-500 italic">{character.name} is picking gift ideas…</div>
            ))}
          </div>
          {/* Phones: the ask box is at the top of the page, so offer a quick way back to it. */}
          {chatted && !busy && (
            <button
              className="self-center rounded-full bg-amber-400 px-5 py-2 font-bold text-slate-900 shadow lg:hidden"
              onClick={() => {
                const ask = document.getElementById("ask") as HTMLInputElement | null;
                ask?.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => ask?.focus({ preventScroll: true }), 400);
              }}
            >
              ✏️ Reply to {firstName}
            </button>
          )}


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
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  className="rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2 text-sm font-bold text-slate-900 shadow-lg ring-2 ring-white/70 transition hover:scale-105"
                  onClick={() => {
                    const ask = document.getElementById("ask");
                    ask?.scrollIntoView({ behavior: "smooth", block: "center" });
                    ask?.focus({ preventScroll: true });
                  }}
                >
                  Talk to {firstName} now
                </button>
                <button
                  className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-emerald-800 shadow-lg transition hover:scale-105"
                  onClick={() => {
                    const add = document.getElementById("add-person");
                    add?.scrollIntoView({ behavior: "smooth", block: "center" });
                    add?.click();
                  }}
                >
                  + Add a person
                </button>
              </div>
            </section>
          )}
          {giftSets.length > 0 && (
            <section
              ref={giftsRef}
              className={`relative scroll-mt-4 rounded-2xl p-4 text-slate-800 shadow-lg ${tree ? "bg-white/95 ring-4 ring-red-700/70" : "bg-white/90"} ${celebrate ? "gift-celebrate" : ""}`}
            >
              {celebrate > 0 && (
                <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-2 z-20 h-0" key={`confetti-${celebrate}`}>
                  {Array.from({ length: 18 }, (_, i) => (
                    <span
                      key={i}
                      className="gift-confetti absolute text-lg"
                      style={{
                        left: `${5 + ((i * 37) % 90)}%`,
                        animationDelay: `${(i % 6) * 0.08}s`,
                        ["--dx" as string]: `${((i * 53) % 120) - 60}px`,
                        ["--rot" as string]: `${((i * 97) % 720) - 360}deg`,
                      }}
                    >
                      {["✨", "⭐", "🎉", "❄️", "🔔", "🎁"][i % 6]}
                    </span>
                  ))}
                </div>
              )}
              <h2 className="mb-2 text-lg font-bold">
                {tree ? "🎄 Under the tree" : "🎁 Gift ideas"}
                {oneRecipient && <span className="font-normal text-slate-500"> for {oneRecipient}</span>}
              </h2>
              <div key={`gifts-${giftSets.length}`} className="grid gap-x-3 gap-y-5 pt-3 sm:grid-cols-2 lg:grid-cols-1">
                {latestGifts.map((g, j) => giftCard(g, j, true))}
              </div>
              <button
                className="mt-3 w-full rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2 text-sm font-bold text-slate-900 shadow ring-2 ring-white/70 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                disabled={busy}
                onClick={() => send("Show me more ideas, please. Different ones from those you've already suggested.")}
              >
                {busy ? `${firstName} is thinking…` : "🎁 Show me more ideas"}
              </button>
              {earlierByPerson.size > 0 && (
                <div className="mt-3 space-y-2">
                  <h3 className="text-sm font-semibold text-slate-600">Earlier ideas</h3>
                  {[...earlierByPerson].map(([name, list]) => (
                    <details
                      key={name}
                      id={`earlier-${name.toLowerCase()}`}
                      className="rounded-xl bg-white/60 px-3 py-2"
                      open={openEarlier === name.toLowerCase()}
                      onToggle={(e) => {
                        const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                        if (isOpen) setOpenEarlier(name.toLowerCase());
                        else if (openEarlier === name.toLowerCase()) setOpenEarlier(null);
                      }}
                    >
                      <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                        For {name} ({list.length})
                      </summary>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        {list.map((g, j) => giftCard(g, j, false, false))}
                      </div>
                    </details>
                  ))}
                </div>
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
                    <button
                      className="underline"
                      onClick={() => {
                        send(`Gift ideas for ${b.nickname}'s birthday, please`, "birthday");
                        document.getElementById("ask")?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                    >
                      Find gifts
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <FamilyPanel
            family={family}
            setFamily={setFamily}
            currency={region === "UK" ? "£" : "$"}
            onFind={(p) => {
              send(ideasFor(p.nickname).length ? `More gift ideas for ${p.nickname}, please` : `Gift ideas for ${p.nickname}, please`);
              document.getElementById("ask")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            earlierCount={(p) =>
              [...earlierByPerson].find(([k]) => k.toLowerCase() === p.nickname.trim().toLowerCase())?.[1].length ?? 0
            }
            onShowEarlier={(p) => {
              const id = `earlier-${p.nickname.trim().toLowerCase()}`;
              setOpenEarlier(p.nickname.trim().toLowerCase());
              setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
            }}
          />
          {/* Wide screens: the profile builds here as the character learns about someone. */}
          <div className="hidden flex-col gap-4 lg:flex">
            <ProfileBuilder
              family={family}
              pending={pending}
              accent={character.theme.accent}
              onSave={saveProfile}
              onDismiss={(name) => setPending(pending.filter((u) => u.personNickname.trim() !== name))}
            />
          </div>
        </aside>
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-white/70">
        AI characters: check age ratings and details before you buy. We may earn a small commission when you buy
        through our links. ·{" "}
        <a className="underline hover:text-white" href="/about" target="_blank" rel="noopener">
          How it works
        </a>{" "}
        ·{" "}
        <a className="underline hover:text-white" href="/privacy" target="_blank" rel="noopener">
          Privacy
        </a>
        <CookieSettings className="ml-1 underline hover:text-white before:mr-1 before:content-['·']" />
      </footer>
    </div>
  );
}
