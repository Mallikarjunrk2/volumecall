import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { checkOrRecordStockResearch, VC_ANON_COOKIE_NAME } from "@/lib/user/research-gate-service";
import { resolveSymbol, getStockPrice, getStockProfile, getKeyRatios, getHistoricalCandles, getUpstoxIncomeStatement, getUpstoxShareholdings } from "@/lib/upstox/service";
import { normalizeFinancialPeriods, normalizeShareholdingHistory } from "@/lib/providers/indianapi/normalize";
import { StockDataService } from "@/lib/stocks/stockDataService";
import { resolveFallbackMetric } from "@/lib/stocks/fallback";
import { FinancialPeriod, NormalizedShareholdingQuarter } from "@/lib/providers/indianapi/types";
import { calculateMetrics } from "@/lib/stocks/calculations";
import { buildStockComparison, StockCompareInput } from "@/lib/stocks/compare";
import { newsProvider } from "@/lib/news/provider";
import { z } from "zod";

const ChatRequestSchema = z.object({
  type: z.enum(["stock", "comparison", "screener"]),
  symbol: z.string().optional(),
  symbols: z.array(z.string()).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  userMessage: z.string().min(1),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validatedBody = ChatRequestSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "Invalid parameters: " + validatedBody.error.message },
        { status: 400 }
      );
    }

    const { type, symbol, symbols, filters, userMessage, history } = validatedBody.data;

    let systemPrompt = "";
    let contextSummary = "";

    // 1. Context Builders
    if (type === "stock" && symbol) {
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

      // Reconstruct single stock context using IndianAPI + Upstox fallbacks
      const companyData = await StockDataService.getCompanyData(symbol);
      if (!companyData) {
        return NextResponse.json(
          { error: "Unable to load stock context for chat." },
          { status: 500 }
        );
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
          console.warn("[Chat Upstox Fallback IS Failed]:", err);
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
          console.warn("[Chat Upstox Fallback Shareholding Failed]:", err);
        }
      }

      const companyName = companyData.name || symbol;
      const industry = companyData.profile?.sector || "N/A";
      const description = companyData.profile?.companyProfile || "N/A";

      const revenueTrend = annualPL.length > 0
        ? annualPL.slice(-3).map(p => `${p.period}: ₹${p.sales} Cr`).join(", ")
        : "N/A";
      const profitTrend = annualPL.length > 0
        ? annualPL.slice(-3).map(p => `${p.period}: ₹${p.netProfit} Cr`).join(", ")
        : "N/A";
      const promoterTrend = shareholding.length > 0
        ? shareholding.slice(-3).map(p => `${p.period}: ${p.promoter}%`).join(", ")
        : "N/A";

      // Resolve ratios via fallback logic
      const peVal = resolveFallbackMetric("pe", symbol, companyData, companyData);
      const pbVal = resolveFallbackMetric("pb", symbol, companyData, companyData);
      const roeVal = resolveFallbackMetric("roe", symbol, companyData, companyData);
      const roceVal = resolveFallbackMetric("roce", symbol, companyData, companyData);
      const debtRatio = resolveFallbackMetric("debtToEquity", symbol, companyData, companyData);
      const currentRatioVal = resolveFallbackMetric("currentratio", symbol, companyData, companyData);

      const details = {
        symbol,
        companyName,
        industry,
        description,
        revenueTrend,
        profitTrend,
        promoterTrend,
        ratios: {
          pe: peVal === "—" ? "N/A" : peVal,
          pb: pbVal === "—" ? "N/A" : pbVal,
          roe: roeVal === "—" ? "N/A" : roeVal,
          roce: roceVal === "—" ? "N/A" : roceVal,
          debtToEquity: debtRatio === "—" ? "N/A" : debtRatio,
          currentRatio: currentRatioVal === "—" ? "N/A" : currentRatioVal,
        }
      };

      contextSummary = JSON.stringify(details, null, 2);

      systemPrompt = `You are VolumeCall AI, an elite institutional financial research assistant.
You are in a follow-up conversation with a user about the stock: ${companyName} (${symbol}).

Here is the VERIFIED, TRUSTED financial data context for the stock:
${contextSummary}

CRITICAL COMPLIANCE RULES:
1. NEVER issue Buy, Sell, Hold, or investment recommendations.
2. NEVER predict future prices, target prices, or guarantee returns.
3. If asked about numbers, events, or facts NOT present in the verified context, state clearly that the available VolumeCall dataset cannot answer it. DO NOT invent numbers or facts.
4. Answer questions in simple, beginner-friendly language, explaining financial terms (e.g. P/E, ROE, ROCE) if relevant.
5. Mute any generic developer notes; keep answers concise and professional.`;

    } else if (type === "comparison" && symbols && symbols.length >= 2) {
      // Reconstruct comparison context
      const stockPromises = symbols.map(async (sym: string): Promise<StockCompareInput | null> => {
        try {
          const instrument = await resolveSymbol(sym);
          if (!instrument) return null;

          const [price, profile, ratios, candles] = await Promise.all([
            getStockPrice(instrument.instrumentKey),
            getStockProfile(instrument.isin),
            getKeyRatios(instrument.isin),
            getHistoricalCandles(instrument.instrumentKey, "2y"),
          ]);

          const metrics = calculateMetrics(candles);

          return {
            symbol: instrument.symbol,
            name: instrument.name,
            price,
            profile,
            ratios,
            metrics,
          };
        } catch {
          return null;
        }
      });

      const inputsRaw = await Promise.all(stockPromises);
      const inputs = inputsRaw.filter((item): item is StockCompareInput => item !== null);
      const comparison = inputs.length >= 2 ? buildStockComparison(inputs) : null;

      // Reconstruct news context
      const newsPromises = symbols.map(async (sym: string) => {
        const inputStock = inputs.find(i => i.symbol === sym);
        const nameVal = inputStock ? inputStock.name : sym;
        const fetchResult = await newsProvider.getDevelopments(sym, nameVal);
        return fetchResult.developments;
      });
      const newsRaw = await Promise.all(newsPromises);
      const developments = newsRaw.flat();

      contextSummary = `Comparison Data:\n${JSON.stringify(comparison, null, 2)}\n\nNews Developments:\n${JSON.stringify(developments, null, 2)}`;

      systemPrompt = `You are VolumeCall AI, an elite institutional financial research assistant.
You are in a follow-up conversation with a user about a comparative stock study comparing: ${symbols.join(", ")}.

Here is the VERIFIED, TRUSTED financial comparison context:
${JSON.stringify(comparison, null, 2)}

Here is the RECENT NEWS-REPORTED CONTEXT:
${JSON.stringify(developments, null, 2)}

CRITICAL COMPLIANCE RULES:
1. NEVER issue Buy, Sell, Hold, or investment recommendations.
2. NEVER predict future prices, target prices, or guarantee returns.
3. If asked about numbers, events, or facts NOT present in the verified context, state clearly that the available VolumeCall dataset cannot answer it. DO NOT invent numbers or facts.
4. When talking about news headlines or quarterly releases from the news context, clearly label them as "news-reported context" rather than verified fundamental data.
5. Answer questions in simple, beginner-friendly language, explaining financial terms (e.g. P/E, ROE, ROCE) if relevant.
6. Mute any generic developer notes; keep answers concise and professional.`;

    } else if (type === "screener") {
      // Reconstruct screener filters
      const filterSummary = Object.entries(filters || {})
        .map(([key, val]) => `- ${key}: ${JSON.stringify(val)}`)
        .join("\n");

      contextSummary = `Screener Criteria:\n${filterSummary}`;

      systemPrompt = `You are VolumeCall AI, an elite institutional financial research assistant.
You are in a conversation with a user viewing the VolumeCall Stock Screener.

Here is the user's active screen criteria:
${filterSummary}

Your task is to explain:
1. What does this screen look for?
2. Which metrics are most restrictive?
3. How should a user interpret the results?

CRITICAL COMPLIANCE RULES:
1. NEVER issue Buy, Sell, Hold, or investment recommendations.
2. NEVER recommend specific stocks as "buy targets".
3. Mute any generic developer notes; keep answers concise and professional.`;
    } else {
      return NextResponse.json(
        { error: "Insufficient parameters to build context for selected type." },
        { status: 400 }
      );
    }

    // 2. Call Groq
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL;

    if (!apiKey || !model) {
      return NextResponse.json(
        { error: "AI service is currently not configured in the environment." },
        { status: 500 }
      );
    }

    const filteredHistory = history.slice(-6).map((h) => ({
      role: h.role,
      content: h.content,
    }));

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
          ...filteredHistory,
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
      }),
      cache: "no-store",
    });

    if (response.status === 429) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a few moments before asking another question." },
        { status: 429 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI service failed to generate an answer." },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const answer = payload?.choices?.[0]?.message?.content;

    if (!answer) {
      return NextResponse.json(
        { error: "Invalid AI response structure." },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during chat completions." },
      { status: 500 }
    );
  }
}
