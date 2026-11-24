"use client";

import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Person, Region } from "@/lib/types";

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
      if (cancelled || error) return;
      const merged = mergePeople((data?.people as Person[]) ?? [], familyRef.current);
      const pending = localStorage.getItem(PENDING_OPT_IN) === "true";
      const marketing = Boolean(data?.marketing_opt_in) || pending;
      await supabase!.from("accounts").upsert({
        user_id: session.user.id,
        people: merged,
        region,
        marketing_opt_in: marketing,
        ...(pending && !data?.marketing_opt_in ? { marketing_opt_in_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      });
      localStorage.removeItem(PENDING_OPT_IN);
      if (cancelled) return;
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
        .then();
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
    optIn,
    sendLink,
    updateOptIn,
    signOut,
    deleteAccount,
  };
}
