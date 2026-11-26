import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientApp from "@/components/ClientApp";
import OccasionBlurb from "@/components/OccasionBlurb";
import { OCCASION_PAGES } from "@/lib/occasionPages";

// One page per occasion (/christmas, /birthday ...), each with its own words for search engines.
// Unknown addresses show the not-found page.
export function generateStaticParams() {
  return Object.keys(OCCASION_PAGES).map((occasion) => ({ occasion }));
}

type Params = Promise<{ occasion: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { occasion } = await params;
  const page = OCCASION_PAGES[occasion];
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${occasion}` },
    openGraph: { url: `/${occasion}`, title: page.title, description: page.description },
    twitter: { title: page.title, description: page.description },
  };
}

export default async function OccasionPage({ params }: { params: Params }) {
  const { occasion } = await params;
  if (!OCCASION_PAGES[occasion]) notFound();
  return (
    <>
      <ClientApp occasion={occasion} />
      <OccasionBlurb initial={occasion} />
    </>
  );
}
