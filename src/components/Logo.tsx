import { Fraunces } from "next/font/google";

const display = Fraunces({ subsets: ["latin"], weight: ["600"] });

/** The Lookfor wordmark: a calm serif name with a small tagline underneath. */
export default function Logo() {
  return (
    // A full page load (not a client-side link) so clicking the logo always
    // returns to the default home page: today's occasion and a fresh chat.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a href="/" aria-label="Lookfor home" className="mx-auto flex w-fit select-none flex-col items-center py-4 text-white sm:py-6">
      <h1 className={`${display.className} text-5xl tracking-tight sm:text-6xl`}>Lookfor</h1>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-white/70 sm:text-sm">Gift ideas for everyone</p>
    </a>
  );
}
