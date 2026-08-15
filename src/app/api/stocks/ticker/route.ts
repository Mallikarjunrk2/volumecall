import { NextResponse } from "next/server";
import { fetchUpstox } from "@/lib/upstox/client";
import { UpstoxOhlcResponseSchema } from "@/lib/upstox/schemas";

export const dynamic = "force-dynamic";

export interface TickerStockItem {
  symbol: string;
  displayName: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

interface TickerResponsePayload {
  tickers: TickerStockItem[];
  updatedAt: string;
}

const TICKER_UNIVERSE = [
  { symbol: "RELIANCE", displayName: "RELIANCE", companyName: "Reliance Industries Ltd", instrumentKey: "NSE_EQ|INE002A01018" },
  { symbol: "TCS", displayName: "TCS", companyName: "Tata Consultancy Services Ltd", instrumentKey: "NSE_EQ|INE467B01029" },
  { symbol: "HDFCBANK", displayName: "HDFC BANK", companyName: "HDFC Bank Ltd", instrumentKey: "NSE_EQ|INE040A01034" },
  { symbol: "BHARTIARTL", displayName: "BHARTI AIRTEL", companyName: "Bharti Airtel Ltd", instrumentKey: "NSE_EQ|INE397D01024" },
  { symbol: "ICICIBANK", displayName: "ICICI BANK", companyName: "ICICI Bank Ltd", instrumentKey: "NSE_EQ|INE090A01021" },
  { symbol: "INFY", displayName: "INFOSYS", companyName: "Infosys Ltd", instrumentKey: "NSE_EQ|INE009A01021" },
  { symbol: "SBIN", displayName: "SBI", companyName: "State Bank of India", instrumentKey: "NSE_EQ|INE062A01020" },
  { symbol: "LT", displayName: "L&T", companyName: "Larsen & Toubro Ltd", instrumentKey: "NSE_EQ|INE018A01030" },
  { symbol: "ITC", displayName: "ITC", companyName: "ITC Ltd", instrumentKey: "NSE_EQ|INE154A01025" },
  { symbol: "BAJFINANCE", displayName: "BAJAJ FINANCE", companyName: "Bajaj Finance Ltd", instrumentKey: "NSE_EQ|INE296A01024" },
  { symbol: "MARUTI", displayName: "MARUTI", companyName: "Maruti Suzuki India Ltd", instrumentKey: "NSE_EQ|INE585B01010" },
  { symbol: "AXISBANK", displayName: "AXIS BANK", companyName: "Axis Bank Ltd", instrumentKey: "NSE_EQ|INE238A01034" },
  { symbol: "TATAMOTORS", displayName: "TATA MOTORS", companyName: "Tata Motors Ltd", instrumentKey: "NSE_EQ|INE155A01022" },
  { symbol: "SUNPHARMA", displayName: "SUN PHARMA", companyName: "Sun Pharmaceutical Industries Ltd", instrumentKey: "NSE_EQ|INE044A01036" },
  { symbol: "KOTAKBANK", displayName: "KOTAK BANK", companyName: "Kotak Mahindra Bank Ltd", instrumentKey: "NSE_EQ|INE237A01028" },
];

// In-memory short-lived cache (60-second TTL)
let cachedTickerData: TickerResponsePayload | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// In-flight concurrency lock to prevent duplicate upstream requests
let pendingTickerRequest: Promise<TickerResponsePayload> | null = null;

async function fetchTickerQuotes(): Promise<TickerResponsePayload> {
  const keysParam = TICKER_UNIVERSE.map((item) => item.instrumentKey).join(",");
  const url = `/v3/market-quote/ohlc?instrument_key=${encodeURIComponent(keysParam)}&interval=1d`;

  const response = await fetchUpstox(url, UpstoxOhlcResponseSchema, {
    cache: "no-store",
  });

  if (response.status !== "success" || !response.data) {
    throw new Error("Invalid or empty response from Upstox batch OHLC");
  }

  const quotesMap = response.data;

  const tickers: TickerStockItem[] = TICKER_UNIVERSE.map((stock) => {
    // Upstox response keys may match instrumentKey or symbol prefix format
    const item =
      quotesMap[stock.instrumentKey] ??
      quotesMap[`NSE_EQ:${stock.symbol}`] ??
      Object.values(quotesMap).find(
        (candidate) => candidate.instrument_token === stock.instrumentKey
      );

    const live = item?.live_ohlc;
    const prev = item?.prev_ohlc;
    const ohlc = live ?? prev;

    const lastPrice = item?.last_price ?? ohlc?.close ?? 0;
    const prevClose = prev?.close ?? ohlc?.open ?? lastPrice;

    let change = 0;
    let changePercent = 0;

    if (prevClose && prevClose > 0 && lastPrice > 0) {
      change = Number((lastPrice - prevClose).toFixed(2));
      changePercent = Number(((change / prevClose) * 100).toFixed(2));
    }

    return {
      symbol: stock.symbol,
      displayName: stock.displayName,
      companyName: stock.companyName,
      price: lastPrice,
      change,
      changePercent,
      isPositive: change >= 0,
    };
  }).filter((item) => item.price > 0);

  return {
    tickers,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  const now = Date.now();

  // 1. Serve from in-memory cache if within 60-second TTL
  if (cachedTickerData && now - lastCacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedTickerData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  }

  // 2. Coalesce concurrent requests to a single Upstox batch request
  if (!pendingTickerRequest) {
    pendingTickerRequest = fetchTickerQuotes()
      .then((data) => {
        cachedTickerData = data;
        lastCacheTimestamp = Date.now();
        pendingTickerRequest = null;
        return data;
      })
      .catch((error) => {
        pendingTickerRequest = null;
        console.error("[Ticker Route] Upstox batch quote error:", error);
        if (cachedTickerData) {
          // Serve stale cache if available upon upstream error
          return cachedTickerData;
        }
        throw error;
      });
  }

  try {
    const data = await pendingTickerRequest;
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch live market ticker data from Upstox" },
      { status: 502 }
    );
  }
}
