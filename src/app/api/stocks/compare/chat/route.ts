import { NextRequest, NextResponse } from "next/server";
import { resolveSymbol, getStockPrice, getStockProfile, getKeyRatios, getHistoricalCandles } from "@/lib/upstox/service";
import { calculateMetrics } from "@/lib/stocks/calculations";
import { buildStockComparison, StockCompareInput } from "@/lib/stocks/compare";
import { newsProvider } from "@/lib/news/provider";
import { z } from "zod";

const ChatRequestSchema = z.object({
  symbols: z.array(z.string()).min(2).max(5),
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
        { error: "Invalid request parameters: " + validatedBody.error.message },
        { status: 400 }
      );
    }

    const { symbols, userMessage, history } = validatedBody.data;

    // 1. Reconstruct trusted financial comparison context on the server
    const stockPromises = symbols.map(async (symbol: string): Promise<StockCompareInput | null> => {
      try {
        const instrument = await resolveSymbol(symbol);
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
      } catch (err) {
        console.error(`Failed to load details for stock ${symbol} in chat context:`, err);
        return null;
      }
    });

    const inputsRaw = await Promise.all(stockPromises);
    const inputs = inputsRaw.filter((item): item is StockCompareInput => item !== null);

    if (inputs.length < 2) {
      return NextResponse.json(
        { error: "Could not reconstruct trusted data context for comparison." },
        { status: 422 }
      );
    }

    const comparison = buildStockComparison(inputs);

    // 2. Reconstruct news context on the server
    const newsPromises = symbols.map(async (symbol: string) => {
      const inputStock = inputs.find(i => i.symbol === symbol);
      if (!inputStock) return [];
      const fetchResult = await newsProvider.getDevelopments(symbol, inputStock.name);
      return fetchResult.developments;
    });
    const newsRaw = await Promise.all(newsPromises);
    const developments = newsRaw.flat();

    // 3. Consult Groq client securely
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL;

    if (!apiKey || !model) {
      return NextResponse.json(
        { error: "AI service is currently not configured in the environment." },
        { status: 500 }
      );
    }

    // Build the system instructions
    const systemPrompt = `You are VolumeCall AI, an elite institutional financial research assistant.
You are in a follow-up conversation with a user about a comparative stock study.

Here is the VERIFIED, TRUSTED financial data calculated by VolumeCall:
${JSON.stringify(comparison, null, 2)}

Here is the RECENT NEWS-REPORTED CONTEXT retrieved by VolumeCall:
${JSON.stringify(developments, null, 2)}

CRITICAL COMPLIANCE RULES:
1. NEVER issue Buy, Sell, Hold, or investment recommendations.
2. NEVER predict future prices, target prices, or guarantee returns.
3. If asked about numbers, events, or facts NOT present in the verified context, state clearly that the available VolumeCall dataset cannot answer it. DO NOT invent numbers or facts.
4. When talking about news headlines or quarterly releases from the news context, clearly label them as "news-reported context" rather than verified fundamental data.
5. Answer questions in simple, beginner-friendly language, explaining financial terms (e.g. P/E, ROE, ROCE, 200 DMA) if relevant to the answer.
6. Mute any generic developer notes; keep answers concise and professional.`;

    // Filter history to latest 6 messages to keep context window small & secure
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
      const text = await response.text().catch(() => "");
      console.error("Groq chat API failed:", text);
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

    return NextResponse.json({
      answer,
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during chat completions." },
      { status: 500 }
    );
  }
}
