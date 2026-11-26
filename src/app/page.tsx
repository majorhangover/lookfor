import ClientApp from "@/components/ClientApp";
import OccasionBlurb from "@/components/OccasionBlurb";
import SiteFooter from "@/components/SiteFooter";

// Structured data so search engines understand what Lookfor is.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Lookfor",
  url: "https://www.lookfor.co.uk/",
  description:
    "A free AI gift finder. Chat with Santa (or another character for each occasion) to get personalised gift ideas for family and friends.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ClientApp />
      {/* Plain words about the site, in the page itself, so search engines can read them. */}
      <OccasionBlurb />
      <SiteFooter />
    </>
  );
}
