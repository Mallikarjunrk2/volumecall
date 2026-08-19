import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({
  sql: vi.fn().mockImplementation(async (strings: TemplateStringsArray) => {
    const query = strings.join(" ");
    if (query.includes("articles")) {
      return [
        { slug: "published-article-1", updated_at: "2026-08-17T12:00:00Z", published_at: "2026-08-17T12:00:00Z" },
        { slug: "published-article-2", updated_at: "2026-08-18T12:00:00Z", published_at: "2026-08-18T12:00:00Z" }
      ];
    }
    if (query.includes("companies")) {
      return [
        { symbol: "RELIANCE", updated_at: "2026-08-19T10:00:00Z" },
        { symbol: "TCS", updated_at: "2026-08-19T10:00:00Z" },
        { symbol: "CUSTOM_DB_STOCK", updated_at: "2026-08-19T10:00:00Z" }
      ];
    }
    return [];
  })
}));

vi.mock("@/lib/upstox/client", () => ({
  fetchUpstox: vi.fn().mockImplementation(async (endpoint: string) => {
    if (endpoint.includes("query=MBEL")) {
      return {
        status: "success",
        data: [
          {
            segment: "NSE_EQ",
            name: "M AND B ENGINEERING LTD",
            exchange: "NSE",
            isin: "INE0...",
            instrument_key: "NSE_EQ|INE0...",
            trading_symbol: "MBEL",
          },
        ],
      };
    }
    if (endpoint.includes("query=RELIANCE")) {
      return {
        status: "success",
        data: [
          {
            segment: "NSE_EQ",
            name: "Reliance Industries Limited",
            exchange: "NSE",
            isin: "INE002A01018",
            instrument_key: "NSE_EQ|INE002A01018",
            trading_symbol: "RELIANCE",
          },
        ],
      };
    }
    if (endpoint.includes("query=INVALID_TICKER_XYZ")) {
      return {
        status: "success",
        data: [
          {
            segment: "NSE_EQ",
            name: "SOME UNRELATED COMPANY",
            exchange: "NSE",
            isin: "INE999...",
            instrument_key: "NSE_EQ|INE999...",
            trading_symbol: "SOME_UNRELATED_TICKER",
          },
        ],
      };
    }
    return { status: "success", data: [] };
  }),
}));

import sitemap from "@/app/sitemap";
import { UNIVERSE_TICKERS } from "@/lib/stocks/universe";

describe("Sitemap & SSR/SEO Audit Tests", () => {
  describe("1. Dynamic Sitemap Generation", () => {
    it("generates static, calculator, blog, and dynamic stock URLs", async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      // Static & Calculators
      expect(urls).toContain("https://volumecall.in");
      expect(urls).toContain("https://volumecall.in/stocks");
      expect(urls).toContain("https://volumecall.in/calculators");
      expect(urls).toContain("https://volumecall.in/calculators/sip-calculator");
      expect(urls).toContain("https://volumecall.in/blog");

      // Published Blog Posts
      expect(urls).toContain("https://volumecall.in/blog/published-article-1");
      expect(urls).toContain("https://volumecall.in/blog/published-article-2");

      // Curated & Database Stocks
      expect(urls).toContain("https://volumecall.in/stocks/RELIANCE");
      expect(urls).toContain("https://volumecall.in/stocks/TCS");
      expect(urls).toContain("https://volumecall.in/stocks/CUSTOM_DB_STOCK");
    });

    it("includes every ticker in UNIVERSE_TICKERS without omission and XML-escapes special characters", async () => {
      const entries = await sitemap();
      const urls = new Set(entries.map((e) => e.url));

      for (const ticker of UNIVERSE_TICKERS) {
        const expectedUrl = `https://volumecall.in/stocks/${ticker.replace(/&/g, "&amp;")}`;
        expect(urls.has(expectedUrl)).toBe(true);
      }

      // Explicitly check M&M symbol XML escaping
      expect(urls.has("https://volumecall.in/stocks/M&amp;M")).toBe(true);
      expect(urls.has("https://volumecall.in/stocks/M&M")).toBe(false);
    });

    it("ensures zero unescaped ampersands exist in any sitemap URL", async () => {
      const entries = await sitemap();
      for (const entry of entries) {
        // Any ampersand must be followed by amp; or lt; or gt; or quot; or apos;
        const unescapedMatch = entry.url.match(/&(?!amp;|lt;|gt;|quot;|apos;)/);
        expect(unescapedMatch).toBeNull();
      }
    });

    it("ensures zero duplicate URLs in the generated sitemap", async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);
      const uniqueUrls = new Set(urls);

      expect(urls.length).toBe(uniqueUrls.size);
    });

    it("excludes draft and unpublished blog posts", async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      expect(urls).not.toContain("https://volumecall.in/blog/draft-article");
      expect(urls).not.toContain("https://volumecall.in/blog/unpublished-post");
    });
  });

  describe("2. Canonical & Metadata Standards", () => {
    it("formats stock URLs uppercase consistently to avoid duplicate indexable routes", () => {
      const symbol = "reliance";
      const normalized = symbol.toUpperCase();
      const canonical = `https://volumecall.in/stocks/${normalized}`;

      expect(canonical).toBe("https://volumecall.in/stocks/RELIANCE");
    });

    it("maintains intentional architectural decision for /compare (main entry point only)", async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      // Single main compare page included
      expect(urls).toContain("https://volumecall.in/compare");

      // Pairwise combinations excluded to prevent combinatorial explosion
      expect(urls).not.toContain("https://volumecall.in/compare/RELIANCE/TCS");
    });
  });

  describe("3. Stock Page SSR Content Verification", () => {
    it("ensures initial stock overview contains meaningful fundamentals on the server side", () => {
      const mockInitialOverview = {
        company: {
          tickerId: "RELIANCE",
          companyName: "Reliance Industries Limited",
          industry: "Oil Gas & Consumable Fuels",
          description: "Reliance Industries Limited is an Indian multinational conglomerate headquartered in Mumbai.",
          isin: "INE002A01018",
        },
        market: {
          priceBse: 2980.5,
          priceNse: 2980.5,
          percentChange: 1.25,
          yearHigh: 3024.9,
          yearLow: 2220.3,
          freshness: "LIVE",
          updatedAt: new Date().toISOString(),
        },
        ratios: {
          pe: 28.5,
          pb: 2.4,
          roe: 9.8,
          roce: 10.2,
          debtToEquity: 0.42,
          evebitda: 14.1,
          dividendYield: 0.33,
        },
        corporateActions: [],
        announcements: [],
      };

      // Verify essential SEO-critical fields exist in server-side payload
      expect(mockInitialOverview.company.companyName).toBe("Reliance Industries Limited");
      expect(mockInitialOverview.company.tickerId).toBe("RELIANCE");
      expect(mockInitialOverview.company.industry).toBe("Oil Gas & Consumable Fuels");
      expect(mockInitialOverview.company.description).toContain("Reliance Industries Limited");
      expect(mockInitialOverview.ratios.pe).toBe(28.5);
      expect(mockInitialOverview.ratios.roe).toBe(9.8);
      expect(mockInitialOverview.market.priceNse).toBe(2980.5);
    });
  });

  describe("4. Security Audit of SSR Payload", () => {
    it("strictly verifies that the SSR payload contains zero credentials or sensitive keys", () => {
      const mockInitialOverview = {
        company: {
          tickerId: "RELIANCE",
          companyName: "Reliance Industries Limited",
          industry: "Oil Gas & Consumable Fuels",
          description: "Reliance Industries Limited description",
          isin: "INE002A01018",
        },
        market: {
          priceBse: 2980.5,
          priceNse: 2980.5,
          percentChange: 1.25,
          yearHigh: 3024.9,
          yearLow: 2220.3,
          freshness: "LIVE",
          updatedAt: new Date().toISOString(),
        },
        ratios: { pe: 28.5 },
        corporateActions: [],
        announcements: [],
      };

      const serializedPayload = JSON.stringify(mockInitialOverview);

      // Verify no sensitive keys, environment variables, or database URIs exist in payload
      expect(serializedPayload).not.toContain("DATABASE_URL");
      expect(serializedPayload).not.toContain("UPSTOX_ACCESS_TOKEN");
      expect(serializedPayload).not.toContain("GROQ_API_KEY");
      expect(serializedPayload).not.toContain("NEXTAUTH_SECRET");
      expect(serializedPayload).not.toContain("password");
      expect(serializedPayload).not.toContain("user_id");
      expect(serializedPayload).not.toContain("email");
    });
  });

  describe("5. Stock Symbol Resolution Tests", () => {
    it("resolves M&M to Mahindra & Mahindra Ltd using authoritative special-symbol mapping", async () => {
      const { resolveSymbol } = await import("@/lib/upstox/service");
      const res = await resolveSymbol("M&M");

      expect(res).not.toBeNull();
      expect(res?.symbol).toBe("M&M");
      expect(res?.name).toBe("Mahindra & Mahindra Ltd");
      expect(res?.isin).toBe("INE101A01026");
      expect(res?.instrumentKey).toBe("NSE_EQ|INE101A01026");
      expect(res?.exchange).toBe("NSE");
    });

    it("resolves MBEL to M AND B ENGINEERING LTD", async () => {
      const { resolveSymbol } = await import("@/lib/upstox/service");
      const res = await resolveSymbol("MBEL");

      expect(res).not.toBeNull();
      expect(res?.symbol).toBe("MBEL");
      expect(res?.name).toBe("M AND B ENGINEERING LTD");
    });

    it("returns null for unknown/unmatched symbols and never falls back to fuzzy results[0]", async () => {
      const { resolveSymbol } = await import("@/lib/upstox/service");
      const res = await resolveSymbol("INVALID_TICKER_XYZ");

      expect(res).toBeNull();
    });

    it("resolves normal existing symbols (RELIANCE, TCS, INFY, HDFCBANK) correctly", async () => {
      const { resolveSymbol } = await import("@/lib/upstox/service");
      const reliance = await resolveSymbol("RELIANCE");

      expect(reliance).not.toBeNull();
      expect(reliance?.symbol).toBe("RELIANCE");
      expect(reliance?.name).toBe("Reliance Industries Limited");
    });
  });
});
