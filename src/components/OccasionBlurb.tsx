"use client";

import { useEffect, useState } from "react";
import { GENERAL_PAGE, OCCASION_PAGES } from "@/lib/occasionPages";

/**
 * The paragraph under the app. It is in the page's HTML for search engines,
 * and follows the visitor when they switch occasion in the app.
 */
export default function OccasionBlurb({ initial }: { initial?: string }) {
  const [id, setId] = useState(initial);
  useEffect(() => {
    const onChange = (e: Event) => setId((e as CustomEvent<string>).detail);
    window.addEventListener("lookfor:occasion", onChange);
    return () => window.removeEventListener("lookfor:occasion", onChange);
  }, []);
  const page = (id && OCCASION_PAGES[id]) || GENERAL_PAGE;
  return (
    <section className="bg-slate-900 px-6 py-8 text-center text-sm text-white/75">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-base font-semibold text-white">{page.heading}</h2>
        <p className="mt-2">{page.text}</p>
      </div>
    </section>
  );
}
