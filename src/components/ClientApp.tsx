"use client";

import dynamic from "next/dynamic";

// The app uses browser-only APIs (localStorage, speech), so render on the client.
const LookforApp = dynamic(() => import("./LookforApp"), { ssr: false });

export default function ClientApp() {
  return <LookforApp />;
}
