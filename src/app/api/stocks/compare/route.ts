import { NextRequest, NextResponse } from "next/server";
import { resolveSymbol, getStockPrice, getStockProfile, getKeyRatios, getHistoricalCandles } from "@/lib/upstox/service";
import { getIndianCompanyDetails } from "@/lib/providers/indianapi/provider";
import { getMetricValue } from "@/lib/providers/indianapi/normalize";
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

        // Fetch fundamental profiles, ratios, and IndianAPI details in parallel
        const [price, profile, ratiosRaw, candles, indianDetails] = await Promise.all([
          getStockPrice(instrument.instrumentKey).catch(() => null),
          getStockProfile(instrument.isin).catch(() => null),
          getKeyRatios(instrument.isin).catch(() => []),
          getHistoricalCandles(instrument.instrumentKey, "2y").catch(() => []),
          getIndianCompanyDetails(instrument.symbol).catch(() => null),
        ]);

        // Perform local financial calculations (DMA, 52W range, 1M/6M/1Y returns)
        const metrics = calculateMetrics(candles);

        // Fallback 52W range from IndianAPI if candles did not yield 52W high/low
        if (metrics.high52W === null && indianDetails) {
          const val = getMetricValue(indianDetails.keyMetrics, ["52WeekHigh", "yearHigh"]) ??
            (typeof indianDetails.yearHigh === "number" ? indianDetails.yearHigh : parseFloat(String(indianDetails.yearHigh || "").replace(/[^0-9.-]/g, "")) || null);
          if (val && !isNaN(val)) metrics.high52W = val;
        }
        if (metrics.low52W === null && indianDetails) {
          const val = getMetricValue(indianDetails.keyMetrics, ["52WeekLow", "yearLow"]) ??
            (typeof indianDetails.yearLow === "number" ? indianDetails.yearLow : parseFloat(String(indianDetails.yearLow || "").replace(/[^0-9.-]/g, "")) || null);
          if (val && !isNaN(val)) metrics.low52W = val;
        }

        // Merge Upstox ratios with IndianAPI fundamental ratios
        const ratios = [...ratiosRaw];
        if (indianDetails) {
          const km = indianDetails.keyMetrics;
          const addRatioIfMissing = (alias: string, name: string, value: number | string | null, suffix: string = "") => {
            const exists = ratios.some(r => r.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(alias));
            if (!exists && value !== null && value !== undefined && value !== "null") {
              const strVal = typeof value === "number" ? (suffix === "%" ? `${value.toFixed(2)}%` : value.toFixed(2)) : `${value}${suffix}`;
              ratios.push({ name, companyValue: strVal, sectorValue: "—" });
            }
          };

          const mCap = getMetricValue(km, ["marketCap"]);
          if (mCap !== null) {
            addRatioIfMissing("marketcap", "Market Cap", `₹${Number(mCap).toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`);
          }

          const bv = getMetricValue(km, ["bookValuePerShareMostRecentFiscalYear", "bookValuePerShareMostRecentQuarter", "bookValue"]);
          if (bv !== null) {
            addRatioIfMissing("bookvalue", "Book Value", `₹${Number(bv).toFixed(2)}`);
          }

          const divYield = getMetricValue(km, ["dividendYieldIndicatedAnnualDividendDividedByClosingprice", "currentDividendYieldCommonStockPrimaryIssueLTM", "dividendYield"]);
          if (divYield !== null) {
            addRatioIfMissing("dividendyield", "Dividend Yield", Number(divYield), "%");
          }

          const debtEquity = getMetricValue(km, ["totalDebtPerTotalEquityMostRecentQuarter", "totalDebtPerTotalEquityMostRecentFiscalYear", "debtToEquity"]);
          if (debtEquity !== null) {
            addRatioIfMissing("debtequity", "Debt-to-Equity", Number(debtEquity));
          }

          const revGrowth = getMetricValue(km, ["revenueChangePercentTTMPOverTTM", "revenueChangePercentMostRecentQuarter1YearAgo", "revenueGrowth"]);
          if (revGrowth !== null) {
            addRatioIfMissing("revenuegrowth", "Revenue Growth", Number(revGrowth), "%");
          }

          const profGrowth = getMetricValue(km, ["ePSChangePercentTTMOverTTM", "netIncomeChangePercentTTMOverTTM", "profitGrowth"]);
          if (profGrowth !== null) {
            addRatioIfMissing("profitgrowth", "Profit Growth", Number(profGrowth), "%");
          }

          const eps = getMetricValue(km, ["ePSBasicExcludingExtraordinaryItemsItrailing12Month", "ePSNormalizedMostRecentFiscalYear", "eps"]);
          if (eps !== null) {
            addRatioIfMissing("eps", "EPS", Number(eps));
          }

          const opm = getMetricValue(km, ["operatingMarginTrailing12Month", "operatingMarginMostRecentFiscalYear"]);
          if (opm !== null) {
            addRatioIfMissing("operatingmargin", "Operating Margin", Number(opm), "%");
          }

          const npm = getMetricValue(km, ["netProfitMarginPercentTrailing12Month", "netProfitMargin5YearAverage"]);
          if (npm !== null) {
            addRatioIfMissing("netprofitmargin", "Net Profit Margin", Number(npm), "%");
          }
        }

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
