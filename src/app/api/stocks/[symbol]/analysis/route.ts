import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { checkOrRecordStockResearch, VC_ANON_COOKIE_NAME } from "@/lib/user/research-gate-service";
import {
  normalizeFinancialPeriods,
  normalizeShareholdingHistory
} from "@/lib/providers/indianapi/normalize";
import { getOrFetchWithCache } from "@/lib/providers/indianapi/cache";
import { FinancialPeriod, NormalizedShareholdingQuarter } from "@/lib/providers/indianapi/types";
import { StockDataService } from "@/lib/stocks/stockDataService";
import { resolveFallbackMetric } from "@/lib/stocks/fallback";
import { getUpstoxIncomeStatement, getUpstoxShareholdings } from "@/lib/upstox/service";

export async function GET(
  request: Request,
  props: { params: Promise<{ symbol: string }> }
) {
  try {
    const totalStart = Date.now();
    const { symbol: rawSymbol } = await props.params;
    const symbol = rawSymbol.toUpperCase();

    // ── ANONYMOUS RESEARCH GATE ──
    const session = await auth();
    const authUserId = session?.user?.id || null;

    const cookieStore = await cookies();
    const existingAnonCookie = cookieStore.get(VC_ANON_COOKIE_NAME)?.value || null;

    const gateResult = await checkOrRecordStockResearch(symbol, existingAnonCookie, authUserId);

    if (!gateResult.allowed) {
      const response = NextResponse.json(
        { error: "LOGIN_REQUIRED", reason: "stock_limit" },
        { status: 403 }
      );
      if (gateResult.isNewAnonCookie && gateResult.anonId) {
        response.cookies.set({
          name: VC_ANON_COOKIE_NAME,
          value: gateResult.anonId,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 31536000,
          secure: process.env.NODE_ENV === "production",
        });
      }
      return response;
    }

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
      return NextResponse.json({ error: "AI service is currently not configured." }, { status: 500 });
    }

    // 1. Reconstruct verified trends context on server-side with timing instrumentation
    const startData = Date.now();
    const companyData = await StockDataService.getCompanyData(symbol);
    const dataElapsed = Date.now() - startData;

    if (!companyData) {
      throw new Error("Unable to load sufficient company profile or financial details for AI analysis.");
    }

    // Extract financials
    let annualPL: FinancialPeriod[] = [];
    if (companyData.indianApiYoyPL) {
      annualPL = normalizeFinancialPeriods(companyData.indianApiYoyPL);
    } else if (companyData.isin) {
      try {
        const upstoxIS = await getUpstoxIncomeStatement(companyData.isin, false);
        if (upstoxIS && upstoxIS.status === "success" && upstoxIS.data.income_statement) {
          const periodsMap: Record<string, { period: string; sales: number | null; netProfit: number | null; eps: number | null }> = {};
          upstoxIS.data.income_statement.forEach(cat => {
            const type = cat.category.toLowerCase();
            cat.history.forEach(item => {
              const period = item.period;
              if (!periodsMap[period]) {
                periodsMap[period] = { period, sales: null, netProfit: null, eps: null };
              }
              if (type === "revenue" || type === "sales") {
                periodsMap[period].sales = item.value ?? null;
              } else if (type === "net_profit" || type === "profit_after_tax") {
                periodsMap[period].netProfit = item.value ?? null;
              } else if (type === "eps" || type === "eps_-_basic" || type === "eps - basic") {
                periodsMap[period].eps = item.value ?? null;
              }
            });
          });
          annualPL = Object.values(periodsMap)
            .map(p => ({
              period: p.period,
              sales: p.sales,
              expenses: null,
              operatingProfit: null,
              opmPercent: null,
              otherIncome: null,
              interest: null,
              depreciation: null,
              profitBeforeTax: null,
              taxPercent: null,
              netProfit: p.netProfit,
              eps: p.eps,
            }))
            .sort((a, b) => {
              const yearA = parseInt(a.period.match(/\d+/)?.[0] || "0");
              const yearB = parseInt(b.period.match(/\d+/)?.[0] || "0");
              return yearA - yearB;
            });
        }
      } catch (err) {
        console.warn("[Analysis Upstox Fallback IS Failed]:", err);
      }
    }

    // Extract shareholdings
    let shareholding: NormalizedShareholdingQuarter[] = [];
    if (companyData.indianApiShareholding) {
      shareholding = normalizeShareholdingHistory(companyData.indianApiShareholding);
    } else if (companyData.isin) {
      try {
        const upstoxSH = await getUpstoxShareholdings(companyData.isin);
        if (upstoxSH && upstoxSH.status === "success" && Array.isArray(upstoxSH.data)) {
          const shPeriodsMap: Record<string, { period: string; promoter: number | null; fii: number | null; mutualFunds: number | null; otherDii: number | null; public: number | null }> = {};
          upstoxSH.data.forEach(cat => {
            const type = cat.category.toLowerCase();
            cat.history.forEach(item => {
              const period = item.period;
              if (!shPeriodsMap[period]) {
                shPeriodsMap[period] = { period, promoter: null, fii: null, mutualFunds: null, otherDii: null, public: null };
              }
              if (type === "promoters") {
                shPeriodsMap[period].promoter = item.value ?? null;
              } else if (type === "fii") {
                shPeriodsMap[period].fii = item.value ?? null;
              } else if (type === "mutual_funds") {
                shPeriodsMap[period].mutualFunds = item.value ?? null;
              } else if (type === "other_dii") {
                shPeriodsMap[period].otherDii = item.value ?? null;
              } else if (type === "retail_and_other" || type === "public") {
                shPeriodsMap[period].public = item.value ?? null;
              }
            });
          });
          shareholding = Object.values(shPeriodsMap)
            .map(p => {
              const diiVal = (p.mutualFunds !== null || p.otherDii !== null)
                ? (p.mutualFunds || 0) + (p.otherDii || 0)
                : null;
              return {
                period: p.period,
                promoter: p.promoter,
                fii: p.fii,
                dii: diiVal,
                public: p.public,
                pledged: null,
              };
            })
            .sort((a, b) => {
              const months = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
              const parsePeriod = (p: string) => {
                const parts = p.toLowerCase().split(" ");
                const month = months[parts[0] as keyof typeof months] || 0;
                const year = parseInt(parts[1] || "0");
                return year * 12 + month;
              };
              return parsePeriod(a.period) - parsePeriod(b.period);
            });
        }
      } catch (err) {
        console.warn("[Analysis Upstox Fallback Shareholding Failed]:", err);
      }
    }

    if (!companyData.profile && annualPL.length === 0) {
      throw new Error("Unable to load sufficient company profile or financial details for AI analysis.");
    }

    // Extract core numbers for prompts
    const companyName = companyData.name || symbol;
    const industry = companyData.profile?.sector || "N/A";
    const description = companyData.profile?.companyProfile || "No description available.";

    const revenueTrend = annualPL.length > 0
      ? annualPL.slice(-4).map(p => `${p.period}: ${p.sales !== null ? `₹${p.sales} Cr` : "—"}`).join(", ")
      : "No annual sales data available.";
    const profitTrend = annualPL.length > 0
      ? annualPL.slice(-4).map(p => `${p.period}: ${p.netProfit !== null ? `₹${p.netProfit} Cr` : "—"}`).join(", ")
      : "No annual net profit data available.";
    const promoterTrend = shareholding.length > 0
      ? shareholding.slice(-4).map(p => `${p.period}: ${p.promoter !== null ? `${p.promoter}%` : "—"}`).join(", ")
      : "No shareholding quarterly data available.";
    
    // Resolve ratios via fallback logic
    const peVal = resolveFallbackMetric("pe", symbol, companyData, companyData);
    const pbVal = resolveFallbackMetric("pb", symbol, companyData, companyData);
    const roeVal = resolveFallbackMetric("roe", symbol, companyData, companyData);
    const roceVal = resolveFallbackMetric("roce", symbol, companyData, companyData);
    const debtRatio = resolveFallbackMetric("debtToEquity", symbol, companyData, companyData);

    const parseRatio = (val: string): number | null => {
      const parsed = parseFloat(val.replace(/[^0-9.-]/g, ""));
      return isNaN(parsed) ? null : parsed;
    };

    // Build the prompt context
    const trendsContext = {
      companyName,
      symbol,
      industry,
      description,
      revenueTrend,
      profitTrend,
      promoterTrend,
      debtToEquity: debtRatio === "—" ? "N/A" : debtRatio,
      ratios: {
        pe: parseRatio(peVal),
        pb: parseRatio(pbVal),
        roe: parseRatio(roeVal),
        roce: parseRatio(roceVal),
      }
    };

    const systemPrompt = `You are VolumeCall AI, an elite institutional financial research assistant.
Your task is to analyze the verified financial trends context of the stock and write a structured, objective, plain-English analysis.

CRITICAL SAFETY & COMPLIANCE RULES:
1. NEVER output buy, sell, or hold recommendations, target prices, or price predictions.
2. Maintain a strict, neutral, educational research tone.
3. Add the following text to the bottom disclosure: "VolumeCall analysis is based on available financial and market data and is intended for research and educational use, not personalized investment advice."
4. Do NOT use generic preambles or introductions. Start directly with the analysis.

You must respond with a strictly formatted JSON object matching the following structure:
{
  "businessSnapshot": "Concise summary of what the company does and its market focus.",
  "valuation": "Objective evaluation of P/E and P/B multiples relative to typical thresholds.",
  "profitability": "Objective assessment of capital efficiencies (ROE/ROCE) and margin trends.",
  "growth": "Description of annual revenue and net profit trends (growing, flat, or declining).",
  "financialHealth": "Evaluation of leverage (Debt-to-Equity) and asset trends.",
  "shareholding": "Analysis of promoter holdings and any changes over recent quarters.",
  "watchpoints": "List 1-3 key risks or metrics that warrant close monitoring (e.g. rising debt, falling margins, pledge levels).",
  "overallInterpretation": "Short neutral summary of the company's financial condition based on the data.",
  "disclosure": "Standard educational disclaimer."
}`;

    const cacheKey = `indianapi:analysis:${symbol}`;
    const aiStart = Date.now();
    const analysis = await getOrFetchWithCache(cacheKey, 6 * 60 * 60 * 1000, async () => {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here is the verified trends context for ${symbol}: ${JSON.stringify(trendsContext, null, 2)}` }
          ],
          temperature: 0.1,
        }),
        cache: "no-store",
      });

      if (response.status === 429) {
        throw new Error("Groq API rate limit reached. Please retry in a few moments.");
      }

      if (!response.ok) {
        throw new Error(`Groq API returned error status: ${response.status}`);
      }

      const payload = await response.json();
      const answerStr = payload?.choices?.[0]?.message?.content;

      if (!answerStr) {
        throw new Error("Invalid response structure from AI completions.");
      }

      const cleanJson = answerStr.trim().replace(/^```json/, "").replace(/```$/, "").trim();
      return JSON.parse(cleanJson);
    });

    const aiTime = Date.now() - aiStart;
    const totalTime = Date.now() - totalStart;

    console.log(`\n[analysis]`);
    console.log(`data load: ${dataElapsed} ms`);
    console.log(`AI generation: ${aiTime} ms`);
    console.log(`TOTAL: ${totalTime} ms\n`);

    return NextResponse.json(analysis);
  } catch (error: unknown) {
    console.error("[Analysis API Error]:", error);
    return NextResponse.json(
      { error: (error as Error).message || "An unexpected error occurred generating AI analysis." },
      { status: 500 }
    );
  }
}
