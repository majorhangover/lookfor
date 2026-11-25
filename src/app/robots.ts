import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/gift"] },
    sitemap: "https://www.lookfor.co.uk/sitemap.xml",
  };
}
