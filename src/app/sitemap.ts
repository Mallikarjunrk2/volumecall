import { MetadataRoute } from "next";
import { sql } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://volumecall.in";
  const currentDate = new Date();

  const staticRoutes = [
    "",
    "/stocks",
    "/compare",
    "/ipo",
    "/markets",
    "/calculators",
    "/blog",
    // 27 Financial Calculators
    "/calculators/sip-calculator",
    "/calculators/goal-sip-calculator",
    "/calculators/step-up-sip-calculator",
    "/calculators/swp-calculator",
    "/calculators/stp-calculator",
    "/calculators/fd-calculator",
    "/calculators/rd-calculator",
    "/calculators/bond-calculator",
    "/calculators/emi-calculator",
    "/calculators/loan-amortization-calculator",
    "/calculators/loan-prepayment-calculator",
    "/calculators/cagr-calculator",
    "/calculators/absolute-return-calculator",
    "/calculators/irr-calculator",
    "/calculators/xirr-calculator",
    "/calculators/time-weighted-return-calculator",
    "/calculators/inflation-calculator",
    "/calculators/retirement-calculator",
    "/calculators/emergency-fund-calculator",
    "/calculators/compound-interest-calculator",
    "/calculators/future-value-calculator",
    "/calculators/present-value-calculator",
    "/calculators/dcf-calculator",
    "/calculators/reverse-dcf-calculator",
    "/calculators/pe-valuation-calculator",
    "/calculators/ev-ebitda-calculator",
    "/calculators/ddm-calculator",
    // Info / Legal
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" || route.startsWith("/markets") ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/calculators") || route === "/blog" ? 0.8 : 0.6,
  }));

  // Append published articles dynamically
  try {
    const publishedArticles = await sql`
      SELECT slug, updated_at, published_at
      FROM articles
      WHERE status = 'PUBLISHED';
    `.catch(() => []);

    for (const article of publishedArticles) {
      entries.push({
        url: `${baseUrl}/blog/${article.slug}`,
        lastModified: new Date(article.updated_at || article.published_at || currentDate),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (err) {
    console.error("[Sitemap Articles Query Error]:", err);
  }

  return entries;
}

