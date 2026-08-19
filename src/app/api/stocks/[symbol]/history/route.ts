import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { checkOrRecordStockResearch, VC_ANON_COOKIE_NAME } from "@/lib/user/research-gate-service";
import { resolveSymbol, getHistoricalCandles } from "@/lib/upstox/service";
import { calculateMovingAverages } from "@/lib/stocks/calculations";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  const params = await context.params;
  const symbol = params.symbol ? params.symbol.toUpperCase() : "";
  
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "2y";

  try {
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
