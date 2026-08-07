import { NextResponse } from "next/server";
import { getIndianCompanyDetails, getIndianFinancialStats } from "@/lib/providers/indianapi/provider";
import {
  normalizeRatios,
  normalizeFinancialPeriods,
  normalizeShareholdingHistory
} from "@/lib/providers/indianapi/normalize";
import { getOrFetchWithCache } from "@/lib/providers/indianapi/cache";

export async function GET(
  request: Request,
  props: { params: Promise<{ symbol: string }> }
) {
  try {
    const totalStart = Date.now();
    const { symbol: rawSymbol } = await props.params;
    const symbol = rawSymbol.toUpperCase();

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
      return NextResponse.json({ error: "AI service is currently not configured." }, { status: 500 });
    }

    // 1. Reconstruct verified trends context on server-side with timing instrumentation
    const fetchStart = Date.now();
    const [rawDetails, rawAnnual, rawShareholding] = await Promise.allSettled([
      (async () => {
        const start = Date.now();
        const res = await getIndianCompanyDetails(symbol);
        const elapsed = Date.now() - start;
        return { res, elapsed };
      })(),
      (async () => {
        const start = Date.now();
        const res = await getIndianFinancialStats(symbol, "yoy_results");
        const elapsed = Date.now() - start;
        return { res, elapsed };
      })(),
      (async () => {
        const start = Date.now();
        const res = await getIndianFinancialStats(symbol, "shareholding_pattern_quarterly");
        const elapsed = Date.now() - start;
        return { res, elapsed };
      })()
    ]);
    const totalFetchTime = Date.now() - fetchStart;

    let profileTime = 0;
    let financialsTime = 0;
    let shareholdingTime = 0;

    let raw: any = null;
    if (rawDetails.status === "fulfilled") {
      raw = rawDetails.value.res;
      profileTime = rawDetails.value.elapsed;
    }

    let annualPL: any[] = [];
    if (rawAnnual.status === "fulfilled") {
      annualPL = normalizeFinancialPeriods(rawAnnual.value.res);
      financialsTime = rawAnnual.value.elapsed;
    }

    let shareholding: any[] = [];
    if (rawShareholding.status === "fulfilled") {
      shareholding = normalizeShareholdingHistory(rawShareholding.value.res);
      shareholdingTime = rawShareholding.value.elapsed;
    }

    if (rawDetails.status === "rejected" && rawAnnual.status === "rejected") {
      throw new Error("Unable to load sufficient company profile or financial details for AI analysis.");
    }

    const ratios = raw ? normalizeRatios(raw) : null;

    // Extract core numbers for prompts
    const companyName = raw?.companyName || symbol;
    const industry = raw?.industry || "N/A";
    
    let description = "No description available.";
    if (raw && typeof raw === "object") {
      const profile = (raw as unknown as Record<string, unknown>).companyProfile;
      if (profile && typeof profile === "object" && profile !== null) {
        description = (profile as Record<string, unknown>).companyDescription as string || "No description available.";
      }
    }

    const revenueTrend = annualPL.length > 0
      ? annualPL.slice(-4).map(p => `${p.period}: ${p.sales !== null ? `₹${p.sales} Cr` : "—"}`).join(", ")
      : "No annual sales data available.";
    const profitTrend = annualPL.length > 0
      ? annualPL.slice(-4).map(p => `${p.period}: ${p.netProfit !== null ? `₹${p.netProfit} Cr` : "—"}`).join(", ")
      : "No annual net profit data available.";
    const promoterTrend = shareholding.length > 0
      ? shareholding.slice(-4).map(p => `${p.period}: ${p.promoter !== null ? `${p.promoter}%` : "—"}`).join(", ")
      : "No shareholding quarterly data available.";
    
    const debtRatio = ratios?.debtToEquity !== null && ratios?.debtToEquity !== undefined ? `${ratios.debtToEquity}` : "N/A";

    // Build the prompt context
    const trendsContext = {
      companyName,
      symbol,
      industry,
      description,
      revenueTrend,
      profitTrend,
      promoterTrend,
      debtToEquity: debtRatio,
      ratios: {
        pe: ratios?.pe ?? null,
        pb: ratios?.pb ?? null,
        roe: ratios?.roe ?? null,
        roce: ratios?.roce ?? null,
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
    console.log(`profile: ${profileTime} ms`);
    console.log(`financials: ${financialsTime} ms`);
    console.log(`shareholding: ${shareholdingTime} ms`);
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
