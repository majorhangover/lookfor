import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lookfor · gift ideas for everyone",
  description: "Chat with a friendly AI character to find gift ideas for everyone you buy for, whatever the occasion. For adults.",
  // Stops the Dark Reader browser extension recolouring the site (it turned
  // Santa's white beard black). The site already has its own dark colours.
  other: { "darkreader-lock": "true" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
