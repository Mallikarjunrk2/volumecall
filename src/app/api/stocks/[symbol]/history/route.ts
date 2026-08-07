import { NextRequest, NextResponse } from "next/server";
import { resolveSymbol, getHistoricalCandles } from "@/lib/upstox/service";
import { calculateMovingAverages } from "@/lib/stocks/calculations";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  const params = await context.params;
  const symbol = params.symbol;
  
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "2y";

  try {
    const instrument = await resolveSymbol(symbol);
    if (!instrument) {
      return NextResponse.json(
        { error: `Stock symbol ${symbol} not found.` },
        { status: 404 }
      );
    }

    const candles = await getHistoricalCandles(instrument.instrumentKey, range);
    const candlesWithMA = calculateMovingAverages(candles);

    return NextResponse.json(candlesWithMA);
  } catch (error) {
    console.error(`Error in History Route for ${symbol}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch stock history data" },
      { status: 500 }
    );
  }
}
