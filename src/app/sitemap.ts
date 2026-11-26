import type { MetadataRoute } from "next";
import { OCCASION_PAGES } from "@/lib/occasionPages";

const SITE = "https://www.lookfor.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    ...Object.keys(OCCASION_PAGES).map((id) => ({
      url: `${SITE}/${id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
