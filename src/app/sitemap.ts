import { MetadataRoute } from "next";
import { sql } from "@/lib/db";
import { UNIVERSE_TICKERS } from "@/lib/stocks/universe";

export const revalidate = 3600; // Background ISR revalidation every 1 hour

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

  // 1. Append published articles dynamically
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

  // 2. Append all valid stock symbols dynamically (combining UNIVERSE_TICKERS and DB companies)
  try {
    const stockSymbolSet = new Set<string>();

    // Add universe tickers
    for (const ticker of UNIVERSE_TICKERS) {
      if (ticker) stockSymbolSet.add(ticker.trim().toUpperCase());
    }

    // Add DB persisted companies
    const dbCompanies = await sql`
      SELECT symbol, updated_at
      FROM companies
      WHERE symbol IS NOT NULL AND symbol != '';
    `.catch(() => []);

    const dbSymbolMap = new Map<string, Date>();
    for (const row of dbCompanies) {
      if (row.symbol) {
        const norm = row.symbol.trim().toUpperCase();
        stockSymbolSet.add(norm);
        if (row.updated_at) {
          dbSymbolMap.set(norm, new Date(row.updated_at));
        }
      }
    }

    // Generate dynamic stock entries sorted alphabetically
    const sortedSymbols = Array.from(stockSymbolSet).sort();

    for (const symbol of sortedSymbols) {
      const lastMod = dbSymbolMap.get(symbol) || currentDate;
      entries.push({
        url: `${baseUrl}/stocks/${symbol}`,
        lastModified: lastMod,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error("[Sitemap Stocks Query Error]:", err);
  }

  // XML-escape special characters (& -> &amp;) in URLs so Next.js sitemap output parses as valid XML
  return entries.map((entry) => ({
    ...entry,
    url: entry.url.replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, "&amp;"),
  }));
}
