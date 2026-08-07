import { NextRequest, NextResponse } from "next/server";
import { resolveSymbol, getStockPrice, getStockProfile, getKeyRatios, getHistoricalCandles } from "@/lib/upstox/service";
import { calculateMetrics } from "@/lib/stocks/calculations";
import { buildStockComparison, StockCompareInput } from "@/lib/stocks/compare";
import { aiProvider } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { symbols, runAI = false } = body;

    if (!symbols || !Array.isArray(symbols) || symbols.length < 2 || symbols.length > 5) {
      return NextResponse.json(
        { error: "Please select between 2 and 5 stocks for comparison." },
        { status: 400 }
      );
    }

    // 1. Resolve and fetch data for all stocks in parallel
    const stockPromises = symbols.map(async (symbol: string): Promise<StockCompareInput | null> => {
      try {
        const instrument = await resolveSymbol(symbol);
        if (!instrument) return null;

        // Fetch fundamental profiles and ratios
        const [price, profile, ratios, candles] = await Promise.all([
          getStockPrice(instrument.instrumentKey),
          getStockProfile(instrument.isin),
          getKeyRatios(instrument.isin),
          getHistoricalCandles(instrument.instrumentKey, "2y"),
        ]);

        // Perform local financial calculations (DMA, 52W range, 1M/6M/1Y returns)
        const metrics = calculateMetrics(candles);

        return {
          symbol: instrument.symbol,
          name: instrument.name,
          price,
          profile,
          ratios,
          metrics,
        };
      } catch (err) {
        console.error(`Failed to load details for stock ${symbol}:`, err);
        return null;
      }
    });

    const inputsRaw = await Promise.all(stockPromises);
    const inputs = inputsRaw.filter((item): item is StockCompareInput => item !== null);

    if (inputs.length < 2) {
      return NextResponse.json(
        { error: "Insufficient stock data resolved. At least 2 stocks are required." },
        { status: 422 }
      );
    }

    // 2. Perform deterministic comparison
    const comparison = buildStockComparison(inputs);

    // 3. Optional AI analysis integration
    let aiResponse = null;
    let aiError = null;

    if (runAI) {
      // Check if API key is present in process.env before making API call
      const hasApiKey = !!process.env.GROQ_API_KEY;
      const hasModel = !!process.env.GROQ_MODEL;

      if (!hasApiKey || !hasModel) {
        aiError = "Groq environment variables are not configured in .env.local.";
      } else {
        try {
          // Dynamic call with timeout of 10s
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          // We pass comparison payload to Groq
          aiResponse = await Promise.race([
            aiProvider.compareStocks(comparison),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("AI generation timed out.")), 11000)
            ),
          ]);
          clearTimeout(timeoutId);
        } catch (err: unknown) {
          console.error("AI generation failed or timed out:", err);
          const msg = err instanceof Error ? err.message : String(err);
          aiError = msg || "AI Analysis is temporarily unavailable.";
        }
      }
    }

    return NextResponse.json({
      comparison,
      aiResponse,
      aiError,
    });
  } catch (error: unknown) {
    console.error("Comparison endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during stock comparison." },
      { status: 500 }
    );
  }
}
