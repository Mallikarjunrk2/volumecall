import { NextRequest, NextResponse } from "next/server";
import { resolveSymbol } from "@/lib/upstox/service";
import { newsProvider } from "@/lib/news/provider";
import { RecentDevelopment } from "@/lib/news/normalize";
import { NewsFetchResult } from "@/lib/news/newsdata";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { symbols } = body;

    if (!symbols || !Array.isArray(symbols) || symbols.length < 2 || symbols.length > 5) {
      return NextResponse.json(
        { error: "Symbols array required (2 to 5 items)." },
        { status: 400 }
      );
    }

    const newsPromises = symbols.map(async (symbol: string): Promise<NewsFetchResult> => {
      try {
        const instrument = await resolveSymbol(symbol);
        if (!instrument) {
          return {
            developments: [],
            status: "no_news",
            fetchedCount: 0,
            relevantCount: 0,
            error: `Symbol ${symbol} could not be resolved.`
          };
        }

        return await newsProvider.getDevelopments(instrument.symbol, instrument.name);
      } catch (err) {
        console.error(`Failed to load news for symbol ${symbol}:`, err);
        return {
          developments: [],
          status: "error",
          fetchedCount: 0,
          relevantCount: 0,
          error: err instanceof Error ? err.message : String(err)
        };
      }
    });

    const results = await Promise.all(newsPromises);

    // Aggregate developments
    const developments: RecentDevelopment[] = [];
    let status: NewsFetchResult["status"] = "success";
    let fetchedCount = 0;
    let relevantCount = 0;
    const errors: string[] = [];

    // Let's determine the combined status. If any is rate_limited/invalid_key, propagate that status
    let hasRateLimit = false;
    let hasInvalidKey = false;
    let hasError = false;
    let hasSuccess = false;

    for (const res of results) {
      developments.push(...res.developments);
      fetchedCount += res.fetchedCount;
      relevantCount += res.relevantCount;
      if (res.error) {
        errors.push(res.error);
      }

      if (res.status === "rate_limited") hasRateLimit = true;
      else if (res.status === "invalid_key") hasInvalidKey = true;
      else if (res.status === "error") hasError = true;
      else if (res.status === "success") hasSuccess = true;
    }

    if (hasInvalidKey) status = "invalid_key";
    else if (hasRateLimit) status = "rate_limited";
    else if (hasError) status = "error";
    else if (hasSuccess) status = "success";
    else status = "no_news";

    return NextResponse.json({
      developments,
      status,
      provider: "newsdata",
      fetchedCount,
      relevantCount,
      error: errors.length > 0 ? errors.join("; ") : null
    });
  } catch (error) {
    console.error("News comparison endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during news retrieval." },
      { status: 500 }
    );
  }
}
