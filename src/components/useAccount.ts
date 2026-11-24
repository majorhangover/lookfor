"use client";

import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { GiftIdea, Person, Region } from "@/lib/types";

const PENDING_OPT_IN = "lookfor.pendingOptIn";

/** Combine two lists: the account's people plus any on this device not already there. */
function mergePeople(remote: Person[], local: Person[]): Person[] {
  const seen = new Set(remote.map((p) => p.nickname.trim().toLowerCase()));
  return [...remote, ...local.filter((p) => !seen.has(p.nickname.trim().toLowerCase()))];
}

/**
 * Optional account: email sign-in link, family list synced to Supabase,
 * and a separate opt-in for marketing emails.
 */
export function useAccount(family: Person[], setFamily: (f: Person[]) => void, region: Region) {
  const [session, setSession] = useState<Session | null>(null);
  // True once we know whether someone is signed in (avoids a flash of the welcome screen).
  const [ready, setReady] = useState(!supabase);
  const [optIn, setOptIn] = useState(false);
  // The user id whose saved list has been loaded and merged.
  const [syncedFor, setSyncedFor] = useState<string | null>(null);
  const synced = Boolean(session && syncedFor === session.user.id);
  const [saveError, setSaveError] = useState(false);
  const familyRef = useRef(family);
  useEffect(() => {
    familyRef.current = family;
  }, [family]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // On sign-in: load the saved list, merge with this device, save the result.
  useEffect(() => {
    if (!supabase || !session) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase!
        .from("accounts")
        .select("people, marketing_opt_in")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("Loading saved list failed", error);
        setSaveError(true);
        return;
      }
      const merged = mergePeople((data?.people as Person[]) ?? [], familyRef.current);
      const pending = localStorage.getItem(PENDING_OPT_IN) === "true";
      const marketing = Boolean(data?.marketing_opt_in) || pending;
      const { error: saveErr } = await supabase!.from("accounts").upsert({
        user_id: session.user.id,
        people: merged,
        region,
        marketing_opt_in: marketing,
        ...(pending && !data?.marketing_opt_in ? { marketing_opt_in_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      });
      if (cancelled) return;
      if (saveErr) {
        console.error("Saving list failed", saveErr);
        setSaveError(true);
        return;
      }
      localStorage.removeItem(PENDING_OPT_IN);
      setSaveError(false);
      setFamily(merged);
      setOptIn(marketing);
      setSyncedFor(session.user.id);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  // After the first sync, save changes to the list (debounced).
  useEffect(() => {
    if (!supabase || !session || !synced) return;
    const t = setTimeout(() => {
      supabase!
        .from("accounts")
        .update({ people: family, region, updated_at: new Date().toISOString() })
        .eq("user_id", session.user.id)
        .then(({ error }) => {
          if (error) console.error("Saving list failed", error);
          setSaveError(Boolean(error));
        });
    }, 800);
    return () => clearTimeout(t);
  }, [family, region, session, synced]);

  const sendLink = useCallback(async (email: string, wantsEmails: boolean) => {
    if (!supabase) return "Accounts are not available yet.";
    localStorage.setItem(PENDING_OPT_IN, String(wantsEmails));
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return error ? "Sorry, we couldn't send the link. Please check the email address and try again." : null;
  }, []);

  const updateOptIn = useCallback(
    async (value: boolean) => {
      if (!supabase || !session) return;
      setOptIn(value);
      await supabase
        .from("accounts")
        .update({
          marketing_opt_in: value,
          marketing_opt_in_at: value ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.user.id);
    },
    [session],
  );

  /** Record gift ideas shown or clicked, for signed-in users only, to improve suggestions. */
  const logGifts = useCallback(
    (kind: "shown" | "clicked", gifts: GiftIdea[], occasion: string) => {
      if (!supabase || !session) return;
      supabase
        .from("gift_events")
        .insert(
          gifts.map((g) => ({
            user_id: session.user.id,
            kind,
            occasion,
            region,
            for_person: g.forPerson.slice(0, 100),
            title: g.title.slice(0, 200),
            search_query: g.searchQuery.slice(0, 200),
            price_band: g.priceBand.slice(0, 50),
          })),
        )
        .then(({ error }) => {
          if (error) console.error("Recording gift ideas failed", error);
        });
    },
    [session, region],
  );

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!supabase) return;
    await supabase.rpc("delete_my_account");
    await supabase.auth.signOut();
    setFamily([]);
  }, [setFamily]);

  return {
    enabled: Boolean(supabase),
    ready,
    email: session?.user.email ?? null,
    synced,
    saveError,
    optIn,
    logGifts,
    sendLink,
    updateOptIn,
    signOut,
    deleteAccount,
  };
}
