import Link from "next/link";
import { CookieSettings } from "./CookieBanner";

/** The small print at the very bottom of every chat page, under the occasion paragraph. */
export default function SiteFooter() {
  return (
    <footer className="bg-slate-900 px-4 pb-6 text-center text-xs text-white/60">
      <div className="mx-auto max-w-6xl border-t border-white/10 pt-4">
        Lookfor is for adults (18+). By chatting you agree to our{" "}
        <Link className="underline hover:text-white" href="/privacy">
          privacy notice
        </Link>
        . AI characters: check age ratings and details before you buy. We may earn a small commission when you buy
        through our links. ·{" "}
        <Link className="underline hover:text-white" href="/about">
          How it works
        </Link>{" "}
        ·{" "}
        <Link className="underline hover:text-white" href="/privacy">
          Privacy
        </Link>
        <CookieSettings className="ml-1 underline hover:text-white before:mr-1 before:content-['·']" />
      </div>
    </footer>
  );
}
