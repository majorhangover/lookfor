import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const SITE = "https://www.lookfor.co.uk";
const TITLE = "Lookfor: free Christmas gift ideas for family and friends";
const DESCRIPTION =
  "Stuck for gift ideas? Tell Santa who you're buying for, what they love and your budget, and get personalised Christmas gift ideas for mum, dad, kids, grandparents and friends. Free, in seconds.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · Lookfor" },
  description: DESCRIPTION,
  applicationName: "Lookfor",
  keywords: [
    "Christmas gift ideas",
    "gift ideas",
    "gift finder",
    "present ideas",
    "gifts for mum",
    "gifts for dad",
    "gifts for kids",
    "gifts for grandparents",
    "Secret Santa ideas",
    "stocking fillers",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Lookfor",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  // Stops the Dark Reader browser extension recolouring the site (it turned
  // Santa's white beard black). The site already has its own dark colours.
  other: { "darkreader-lock": "true" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
        {/* Cookieless visitor stats (Vercel Web Analytics): pages, referrers, countries, devices. */}
        <Analytics />
      </body>
    </html>
  );
}
