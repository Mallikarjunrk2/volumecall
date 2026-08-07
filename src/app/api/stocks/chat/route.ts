import { NextRequest, NextResponse } from "next/server";
import { resolveSymbol, getStockPrice, getStockProfile, getKeyRatios, getHistoricalCandles } from "@/lib/upstox/service";
import { getIndianCompanyDetails, getIndianFinancialStats } from "@/lib/providers/indianapi/provider";
import { normalizeRatios, normalizeFinancialPeriods, normalizeShareholdingHistory } from "@/lib/providers/indianapi/normalize";
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
      // Reconstruct single stock context using IndianAPI + Upstox fallbacks
      const [rawDetails, rawAnnual, rawShareholding] = await Promise.allSettled([
        getIndianCompanyDetails(symbol),
        getIndianFinancialStats(symbol, "yoy_results"),
        getIndianFinancialStats(symbol, "shareholding_pattern_quarterly"),
      ]);

      const raw = rawDetails.status === "fulfilled" ? rawDetails.value : null;
      const ratios = raw ? normalizeRatios(raw) : null;
      const annualPL = rawAnnual.status === "fulfilled" ? normalizeFinancialPeriods(rawAnnual.value) : [];
      const shareholding = rawShareholding.status === "fulfilled" ? normalizeShareholdingHistory(rawShareholding.value) : [];

      const companyName = raw?.companyName || symbol;
      const industry = raw?.industry || "N/A";
      
      let description = "N/A";
      if (raw && typeof raw === "object") {
        const profile = (raw as unknown as Record<string, unknown>).companyProfile;
        if (profile && typeof profile === "object" && profile !== null) {
          description = (profile as Record<string, unknown>).companyDescription as string || "N/A";
        }
      }

      const revenueTrend = annualPL.length > 0
        ? annualPL.slice(-3).map(p => `${p.period}: ₹${p.sales} Cr`).join(", ")
        : "N/A";
      const profitTrend = annualPL.length > 0
        ? annualPL.slice(-3).map(p => `${p.period}: ₹${p.netProfit} Cr`).join(", ")
        : "N/A";
      const promoterTrend = shareholding.length > 0
        ? shareholding.slice(-3).map(p => `${p.period}: ${p.promoter}%`).join(", ")
        : "N/A";

      const details = {
        symbol,
        companyName,
        industry,
        description,
        revenueTrend,
        profitTrend,
        promoterTrend,
        ratios: {
          pe: ratios?.pe ?? "N/A",
          pb: ratios?.pb ?? "N/A",
          roe: ratios?.roe ?? "N/A",
          roce: ratios?.roce ?? "N/A",
          debtToEquity: ratios?.debtToEquity ?? "N/A",
          currentRatio: ratios?.currentRatio ?? "N/A",
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
