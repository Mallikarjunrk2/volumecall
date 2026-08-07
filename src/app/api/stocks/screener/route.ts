import { NextResponse } from "next/server";
import { StockDataService } from "@/lib/stocks/stockDataService";

export async function GET() {
  try {
    const data = await StockDataService.getScreenerUniverse();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("[Screener API Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch screener universe.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
