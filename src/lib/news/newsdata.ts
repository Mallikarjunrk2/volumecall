import "server-only";
import { NewsDataResponseSchema } from "./schemas";
import { RecentDevelopment, normalizeArticle } from "./normalize";

export interface NewsFetchResult {
  developments: RecentDevelopment[];
  status: "success" | "error" | "rate_limited" | "invalid_key" | "no_news";
  fetchedCount: number;
  relevantCount: number;
  error: string | null;
}

interface CacheEntry {
  result: NewsFetchResult;
  expiresAt: number;
}

const newsCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function toTitleCase(str: string): string {
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

function cleanCompanyName(companyName: string): string {
  let name = companyName;
  name = name.replace(/\bSERV\b/gi, "Services");
  name = name.replace(/\bSERVIC\b/gi, "Services");
  name = name.replace(/\bSERVICES\b/gi, "Services");
  name = name.replace(/\bIND\b/gi, "Industries");
  name = name.replace(/\bINDUSTRIES\b/gi, "Industries");
  name = name.replace(/\b(LTD|LIMITED|LT|INC|PLC|CO|CORP|CORPORATION)\b/gi, "");
  name = name.replace(/\s+/g, " ").trim();
  return toTitleCase(name);
}

export async function getRecentDevelopments(
  symbol: string,
  companyName: string
): Promise<NewsFetchResult> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  const cacheKey = symbol.trim().toUpperCase();

  // 1. Check Cache
  const cached = newsCache[cacheKey];
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[NewsData Cache Hit] ${cacheKey}`);
    return cached.result;
  }

  if (!apiKey) {
    console.warn("[NewsData] NEWSDATA_API_KEY is missing. Skipping fetch.");
    return {
      developments: [],
      status: "invalid_key",
      fetchedCount: 0,
      relevantCount: 0,
      error: "API key is missing in environment configuration."
    };
  }

  // Build exact phrase query (under 100 chars query limit)
  const cleanedName = cleanCompanyName(companyName);
  const finalQuery = `"${cleanedName}"`;

  if (finalQuery.length > 100) {
    console.warn(`[NewsData] Query exceeds 100 characters: ${finalQuery}`);
  }

  const url = `https://newsdata.io/api/1/news?apikey=${encodeURIComponent(
    apiKey
  )}&q=${encodeURIComponent(finalQuery)}&country=in&language=en`;

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[NewsData] HTTP Error: ${response.status} ${response.statusText}`);
      return {
        developments: [],
        status: "error",
        fetchedCount: 0,
        relevantCount: 0,
        error: `HTTP Error ${response.status}: ${response.statusText}`
      };
    }

    const payload = await response.json();

    // Map explicit API errors
    if (payload.status === "error") {
      const code = payload.results?.code;
      const msg = payload.results?.message || "Unknown NewsData API error";
      console.error(`[NewsData API Error] Code: ${code} | Message: ${msg}`);

      let status: NewsFetchResult["status"] = "error";
      if (code === "InvalidApiKey") status = "invalid_key";
      else if (code === "RateLimitExceeded" || code === "QuotaExceeded") status = "rate_limited";

      return {
        developments: [],
        status,
        fetchedCount: 0,
        relevantCount: 0,
        error: `${code}: ${msg}`
      };
    }

    const validated = NewsDataResponseSchema.safeParse(payload);
    if (!validated.success) {
      console.error("[NewsData] Schema validation failed:", validated.error.format());
      return {
        developments: [],
        status: "error",
        fetchedCount: 0,
        relevantCount: 0,
        error: "Failed to validate NewsData API payload schema."
      };
    }

    const rawArticles = validated.data.results || [];
    const rawCount = rawArticles.length;

    const normalized: RecentDevelopment[] = [];
    const seenTitles = new Set<string>();

    const symbolLower = symbol.toLowerCase();
    const cleanNameLower = cleanedName.toLowerCase();
    const coreWords = cleanNameLower.split(" ").filter(w => w.length > 3);

    let matchedCount = 0;
    let resultsCount = 0;
    let businessCount = 0;

    for (const article of rawArticles) {
      const cleanTitle = article.title.trim().toLowerCase();
      if (seenTitles.has(cleanTitle)) {
        continue;
      }
      seenTitles.add(cleanTitle);

      // Relevance Filtering
      const text = `${article.title} ${article.description || ""}`.toLowerCase();
      const matchesSymbol = text.includes(symbolLower);
      const matchesNameWord = coreWords.some(word => text.includes(word));

      if (matchesSymbol || matchesNameWord) {
        matchedCount++;
        const dev = normalizeArticle(article, symbol, companyName);
        if (dev.category === "RESULTS") {
          resultsCount++;
        } else {
          businessCount++;
        }
        normalized.push(dev);
      }
    }

    // Diagnostics Logging
    console.log(
      `[NewsData Diagnostics] Symbol: ${symbol} | Cleaned Name: ${cleanedName} | Raw: ${rawCount} | Matched: ${matchedCount} | RESULTS: ${resultsCount} | BUSINESS: ${businessCount}`
    );

    const sorted = normalized
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);

    const result: NewsFetchResult = {
      developments: sorted,
      status: sorted.length > 0 ? "success" : "no_news",
      fetchedCount: rawCount,
      relevantCount: sorted.length,
      error: null
    };

    // Cache results
    newsCache[cacheKey] = {
      result,
      expiresAt: Date.now() + CACHE_TTL_MS
    };

    return result;
  } catch (error) {
    console.error(`[NewsData] Fetch error for ${symbol}:`, error);
    return {
      developments: [],
      status: "error",
      fetchedCount: 0,
      relevantCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
