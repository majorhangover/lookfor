"use client";

import dynamic from "next/dynamic";

// The app uses browser-only APIs (localStorage, speech), so render on the client.
const LookforApp = dynamic(() => import("./LookforApp"), { ssr: false });

/** `occasion` is set on an occasion's own page (e.g. /birthday) to open on that host. */
export default function ClientApp({ occasion }: { occasion?: string }) {
  return <LookforApp initialOccasion={occasion} />;
}
