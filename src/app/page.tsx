import ClientApp from "@/components/ClientApp";

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
      <section className="bg-slate-900 px-6 py-8 text-center text-sm text-white/75">
        <div className="mx-auto max-w-3xl">
        <h2 className="text-base font-semibold text-white">Free Christmas gift ideas for everyone you buy for</h2>
        <p className="mt-2">
          Lookfor is a free gift finder. Tell Santa who you&apos;re shopping for, what they&apos;re into and roughly what
          you want to spend, and he&apos;ll suggest gift ideas you can buy on Amazon. Find presents for mum and dad,
          grandparents, children and teenagers, partners, friends, Secret Santa and stocking fillers. There are
          characters for birthdays, Valentine&apos;s Day, Mother&apos;s Day, Father&apos;s Day, Easter, weddings,
          anniversaries and new babies too.
        </p>
        </div>
      </section>
    </>
  );
}
