import { fetchIndianApi } from "./client";
import { RawIndianCompanyDetailsSchema, RawIndianHistoricalStatsSchema, RawIndianCompanyLogoSchema } from "./schemas";
import { RawIndianCompanyDetails, RawIndianHistoricalStats } from "./types";
import { getOrFetchWithCache, getCacheEntry, setCacheEntry } from "./cache";

const PROFILE_TTL = 24 * 60 * 60 * 1000; // 24 Hours
const STATS_TTL = 6 * 60 * 60 * 1000; // 6 Hours

/**
 * Fetch company profile data from `/stock?name=<symbol>` with 24-hour cache.
 */
export async function getIndianCompanyDetails(symbol: string): Promise<RawIndianCompanyDetails> {
  const cacheKey = `indianapi:details:${symbol.toUpperCase()}`;
  return getOrFetchWithCache(cacheKey, PROFILE_TTL, async () => {
    return fetchIndianApi(
      `/stock?name=${encodeURIComponent(symbol.toUpperCase())}`,
      RawIndianCompanyDetailsSchema
    );
  });
}

/**
 * Fetch company statement history from `/historical_stats` with 6-hour cache.
 */
export async function getIndianFinancialStats(
  symbol: string,
  statsType: "quarter_results" | "yoy_results" | "balancesheet" | "cashflow" | "ratios" | "shareholding_pattern_quarterly" | "shareholding_pattern_yearly"
): Promise<RawIndianHistoricalStats> {
  const cacheKey = `indianapi:stats:${symbol.toUpperCase()}:${statsType}`;
  return getOrFetchWithCache(cacheKey, STATS_TTL, async () => {
    const raw = await fetchIndianApi(
      `/historical_stats?stock_name=${encodeURIComponent(symbol.toUpperCase())}&stats=${statsType}`,
      RawIndianHistoricalStatsSchema
    );
    return raw as RawIndianHistoricalStats;
  });
}

/**
 * Fetch company logo base64 image from `/logo?stock_name=<name>` with 7-day success cache
 * and 1-hour negative cache. Returns normalized base64 data URL string or null on failure.
 */
export async function getCompanyLogo(stockName: string): Promise<string | null> {
  const cacheKey = `indianapi:logo:${stockName.toLowerCase()}`;
  const cached = getCacheEntry<string | null>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const data = await fetchIndianApi(
      `/logo?stock_name=${encodeURIComponent(stockName.toLowerCase())}`,
      RawIndianCompanyLogoSchema
    );
    if (data && data.base64_image && data.content_type) {
      const dataUrl = `data:${data.content_type};base64,${data.base64_image}`;
      setCacheEntry(cacheKey, dataUrl, 7 * 24 * 60 * 60 * 1000); // 7 days success cache
      return dataUrl;
    }
    setCacheEntry(cacheKey, null, 1 * 60 * 60 * 1000); // 1 hour negative cache
    return null;
  } catch (err) {
    console.warn(`[IndianAPI Logo] Logo fetch failed for ${stockName}:`, err);
    setCacheEntry(cacheKey, null, 1 * 60 * 60 * 1000); // 1 hour negative cache
    return null;
  }
}
