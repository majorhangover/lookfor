/**
 * Facebook/Instagram retargeting (Meta Pixel), only after the visitor accepts
 * cookies. It is off until NEXT_PUBLIC_META_PIXEL_ID is set in Vercel.
 *
 * We send broad gift info only (occasion, relationship like "Grandad", gift
 * idea titles), never nicknames, ages, birthdays or anything from notes.
 */
export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";
export const CONSENT_KEY = "lookfor-cookie-consent";
export const CONSENT_EVENT = "lookfor-consent-change";

type Fbq = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: Fbq & { callMethod?: Fbq; queue?: unknown[]; loaded?: boolean; version?: string; push?: Fbq };
    _fbq?: unknown;
  }
}

export type Consent = "yes" | "no" | null;

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: Consent) {
  try {
    if (v) localStorage.setItem(CONSENT_KEY, v);
    else localStorage.removeItem(CONSENT_KEY);
  } catch {}
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Meta's standard loader, run only once the visitor has said yes. */
export function loadPixel() {
  if (!PIXEL_ID || window.fbq) return;
  const n = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue!.push(args);
  } as NonNullable<Window["fbq"]>;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  window.fbq = n;
  window._fbq = n;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

/** Send an event, if the pixel is on (consent given). Otherwise does nothing. */
export function track(event: string, params: Record<string, string | string[]>, custom = true) {
  if (!window.fbq || getConsent() !== "yes") return;
  window.fbq(custom ? "trackCustom" : "track", event, params);
}
