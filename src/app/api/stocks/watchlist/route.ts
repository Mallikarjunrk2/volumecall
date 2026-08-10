import { NextRequest, NextResponse } from "next/server";
import { StockDataService } from "@/lib/stocks/stockDataService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams = new URL(req.url).searchParams } = new URL(req.url);
    const symbolsStr = searchParams.get("symbols") || "";
    if (!symbolsStr) {
      return NextResponse.json([]);
    }
    const symbols = symbolsStr.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);

    const promises = symbols.map(async (symbol) => {
      try {
        return await StockDataService.getStockScreenerItem(symbol);
      } catch (err) {
        console.error(`Failed to load watchlist details for ${symbol}:`, err);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return NextResponse.json(results.filter(Boolean));
  } catch (error: unknown) {
    console.error("[Watchlist API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist details." },
      { status: 500 }
    );
  }
}
