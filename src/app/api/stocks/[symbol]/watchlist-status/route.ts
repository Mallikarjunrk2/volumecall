import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSymbolInUserWatchlist } from "@/lib/user/watchlist-service";

export async function GET(
  request: Request,
  props: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await props.params;
    const symbol = rawSymbol ? rawSymbol.trim().toUpperCase() : "";

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        inWatchlist: false,
      });
    }

    const inWatchlist = await isSymbolInUserWatchlist(userId, symbol);

    return NextResponse.json({
      authenticated: true,
      inWatchlist,
    });
  } catch (error: unknown) {
    console.error("[Watchlist Status API Error]:", error);
    return NextResponse.json({
      authenticated: false,
      inWatchlist: false,
    });
  }
}
