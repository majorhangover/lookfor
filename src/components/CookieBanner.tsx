"use client";

import { useEffect, useState } from "react";
import { CONSENT_EVENT, PIXEL_ID, getConsent, loadPixel, setConsent, type Consent } from "@/lib/tracking";

/**
 * Asks before any advertising cookies are set, and loads the Meta Pixel only
 * after "Accept". Shows nothing at all while no Pixel ID is set.
 */
export default function CookieBanner() {
  const [consent, setLocal] = useState<Consent | "unknown">("unknown");

  useEffect(() => {
    if (!PIXEL_ID) return;
    const sync = () => {
      const c = getConsent();
      setLocal(c);
      if (c === "yes") loadPixel();
    };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!PIXEL_ID || consent !== null) return null;
  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-w-xl flex-col gap-3 rounded-2xl bg-white p-4 text-sm text-slate-800 shadow-2xl ring-1 ring-black/10 sm:bottom-5 sm:flex-row sm:items-center"
    >
      <p className="min-w-0 flex-1">
        Can we use cookies to show you Lookfor ads on Facebook and Instagram, based on the gift ideas you look at? We
        never share names or ages.{" "}
        <a className="underline" href="/privacy" target="_blank" rel="noopener">
          More
        </a>
      </p>
      <div className="flex shrink-0 justify-end gap-2">
        <button
          className="rounded-full bg-slate-100 px-4 py-2 font-semibold hover:bg-slate-200"
          onClick={() => setConsent("no")}
        >
          No thanks
        </button>
        <button
          className="rounded-full bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
          onClick={() => setConsent("yes")}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

/** "Cookie settings" link: clears the choice so the banner asks again. */
export function CookieSettings({ className }: { className?: string }) {
  if (!PIXEL_ID) return null;
  return (
    <button className={className} onClick={() => setConsent(null)}>
      Cookie settings
    </button>
  );
}
