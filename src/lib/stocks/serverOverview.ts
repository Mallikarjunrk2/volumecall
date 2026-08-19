import "server-only";
import { getStockPrice, getStockProfile } from "@/lib/upstox/service";
import { getRatiosFromDb, getDocumentsFromDb } from "@/lib/db/services";

export interface InitialOverviewData {
  company?: {
    tickerId: string;
    companyName: string;
    industry: string;
    description: string;
    isin: string;
  };
  market?: {
    priceBse: number | null;
    priceNse: number | null;
    percentChange: number | null;
    yearHigh: number | null;
    yearLow: number | null;
    freshness: string;
    updatedAt: string;
  };
  ratios: Record<string, number | null>;
  shareholdingLatest?: {
    promoters: number | null;
    fii: number | null;
    dii: number | null;
    public: number | null;
  };
  corporateActions: Array<{ type: string; detail: string; exDate: string | null }>;
  announcements: Array<{ category: string; title: string; date: string; sourceUrl: string | null }>;
}

export async function getInitialOverview(
  symbol: string,
  instrumentKey: string,
  isin: string,
  name: string
): Promise<InitialOverviewData | null> {
  try {
    const cleanSym = symbol.toUpperCase();

    // Fetch live market quote, profile, and database ratios in parallel
    const [priceData, profileData, cachedRatios, cachedDocs] = await Promise.all([
      getStockPrice(instrumentKey).catch(() => null),
      getStockProfile(isin).catch(() => null),
      getRatiosFromDb(cleanSym).catch(() => null),
      getDocumentsFromDb(cleanSym).catch(() => null),
    ]);

    const ratios = cachedRatios?.data || {
      pe: null,
      pb: null,
      evebitda: null,
      priceToSales: null,
      dividendYield: null,
      roe: null,
      roce: null,
      roa: null,
      debtToEquity: null,
      currentRatio: null,
      quickRatio: null,
      interestCoverage: null,
    };

    return {
      company: {
        tickerId: cleanSym,
        companyName: name,
        industry: profileData?.sector || "NSE Equity",
        description:
          profileData?.companyProfile ||
          `Analyze ${name} (${cleanSym}) share price, interactive stock charts, valuation ratios, quarterly results, balance sheet, and shareholding pattern on VolumeCall.`,
        isin: isin,
      },
      market: {
        priceBse: priceData?.lastPrice || null,
        priceNse: priceData?.lastPrice || null,
        percentChange: priceData?.changePercent || null,
        yearHigh: priceData?.high || null,
        yearLow: priceData?.low || null,
        freshness: priceData ? "LIVE" : "SNAPSHOT",
        updatedAt: new Date().toISOString(),
      },
      ratios: ratios,
      shareholdingLatest: {
        promoters: null,
        fii: null,
        dii: null,
        public: null,
      },
      corporateActions: cachedDocs?.corporateActions || [],
      announcements: cachedDocs?.announcements || [],
    };
  } catch (err) {
    console.error(`[getInitialOverview Error for ${symbol}]:`, err);
    return null;
  }
}
