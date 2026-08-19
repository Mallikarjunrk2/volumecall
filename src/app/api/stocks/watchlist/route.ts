import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUserWatchlist,
  addToUserWatchlist,
  removeFromUserWatchlist,
} from "@/lib/user/watchlist-service";
import { StockDataService } from "@/lib/stocks/stockDataService";

/**
 * GET /api/stocks/watchlist
 * Authenticated public users only.
 * Returns user's saved watchlist with screener stock details.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve saved symbols from Neon PostgreSQL DB
    const savedSymbols = await getUserWatchlist(userId);

    const { searchParams } = new URL(req.url);
    const filterSymbolsStr = searchParams.get("symbols");

    let symbolsToFetch = savedSymbols;
    if (filterSymbolsStr) {
      const requestedSymbols = filterSymbolsStr
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      symbolsToFetch = savedSymbols.filter((s) => requestedSymbols.includes(s));
    }

    const promises = symbolsToFetch.map(async (symbol) => {
      try {
        return await StockDataService.getStockScreenerItem(symbol);
      } catch (err) {
        console.error(`Failed to load watchlist stock details for ${symbol}:`, err);
        return {
          symbol,
          name: symbol,
          price: null,
          changePercent: null,
          marketCap: "—",
          pe: "—",
          roe: "—",
          roce: "—",
        };
      }
    });

    const results = await Promise.all(promises);
    return NextResponse.json(results.filter(Boolean));
  } catch (error: unknown) {
    console.error("[Watchlist GET API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stocks/watchlist
 * Body: { symbol: string }
 * Authenticated public users only.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const symbol = body?.symbol ? String(body.symbol).trim().toUpperCase() : "";

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await addToUserWatchlist(userId, symbol);

    return NextResponse.json({ success: true, symbol });
  } catch (error: unknown) {
    console.error("[Watchlist POST API Error]:", error);
    return NextResponse.json(
      { error: "Failed to add stock to watchlist." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stocks/watchlist?symbol=XYZ
 * Authenticated public users only.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let symbol = searchParams.get("symbol");

    if (!symbol) {
      try {
        const body = await req.json();
        symbol = body?.symbol;
      } catch {}
    }

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    const normalizedSymbol = String(symbol).trim().toUpperCase();
    await removeFromUserWatchlist(userId, normalizedSymbol);

    return NextResponse.json({ success: true, symbol: normalizedSymbol });
  } catch (error: unknown) {
    console.error("[Watchlist DELETE API Error]:", error);
    return NextResponse.json(
      { error: "Failed to remove stock from watchlist." },
      { status: 500 }
    );
  }
}
