import "server-only";
import { fetchUpstox } from "./client";
import {
  UpstoxSearchResponseSchema,
  UpstoxOhlcResponseSchema,
  UpstoxProfileResponseSchema,
  UpstoxKeyRatiosResponseSchema,
  UpstoxHistoricalCandleResponseSchema,
} from "./schemas";
import { SearchInstrument, StockPrice, StockProfile, StockRatio, Candle } from "../stocks/types";

/**
 * Format Date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Search instruments on NSE Equity segment.
 */
export async function searchInstruments(query: string): Promise<SearchInstrument[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Upstox Search API
    const response = await fetchUpstox(
      `/v2/instruments/search?query=${encodeURIComponent(query)}&exchanges=NSE&segments=EQ`,
      UpstoxSearchResponseSchema,
      {
        next: { revalidate: 3600 }, // Cache search queries for 1 hour
      }
    );

    if (response.status !== "success" || !response.data) {
      return [];
    }

    return response.data
      .filter((item) => item.exchange === "NSE" && item.segment === "NSE_EQ")
      .map((item) => ({
        segment: item.segment,
        name: item.name,
        exchange: item.exchange,
        isin: item.isin || "",
        instrumentKey: item.instrument_key,
        symbol: item.trading_symbol,
      }));
  } catch (error) {
    console.error("Error in searchInstruments:", error);
    return [];
  }
}

/**
 * Resolves a symbol (e.g., RELIANCE) to its instrument key, ISIN, and name.
 */
export async function resolveSymbol(symbol: string): Promise<SearchInstrument | null> {
  const cleanSymbol = symbol.trim().toUpperCase();
  if (!cleanSymbol) return null;

  try {
    // Search for the symbol using the Upstox search endpoint
    const results = await searchInstruments(cleanSymbol);

    // Look for exact symbol match
    const exactMatch = results.find(
      (item) => item.symbol.toUpperCase() === cleanSymbol && item.exchange === "NSE"
    );

    if (exactMatch) {
      return exactMatch;
    }

    // Fallback: Return first partial match that shares the prefix or is closest
    if (results.length > 0) {
      return results[0];
    }

    return null;
  } catch (error) {
    console.error(`Error resolving symbol ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch current quote (OHLC) for an instrument key.
 */
export async function getStockPrice(instrumentKey: string): Promise<StockPrice | null> {
  try {
    const url = `/v3/market-quote/ohlc?instrument_key=${encodeURIComponent(instrumentKey)}&interval=1d`;
    
    // Quotes must be fresh: use no-store
    const response = await fetchUpstox(url, UpstoxOhlcResponseSchema, {
      cache: "no-store",
    });

    if (response.status !== "success" || !response.data) {
      return null;
    }

    // Upstox may key this object by a display value (for example,
    // `NSE_EQ:RELIANCE`) instead of the requested `NSE_EQ|ISIN` key.
    const item =
      response.data[instrumentKey] ??
      Object.values(response.data).find(
        (candidate) => candidate.instrument_token === instrumentKey
      );

    if (!item) {
      return null;
    }
    const live = item.live_ohlc;
    const prev = item.prev_ohlc;
    const ohlc = live ?? prev;

    // Do not turn incomplete provider data into believable zero-valued prices.
    // The caller renders an unavailable state when a complete quote is absent.
    if (
      !ohlc ||
      ohlc.open === null || ohlc.open === undefined ||
      ohlc.high === null || ohlc.high === undefined ||
      ohlc.low === null || ohlc.low === undefined ||
      ohlc.close === null || ohlc.close === undefined ||
      ohlc.volume === null || ohlc.volume === undefined ||
      ohlc.ts === null || ohlc.ts === undefined
    ) {
      return null;
    }

    const lastPrice = item.last_price ?? ohlc.close;
    const open = ohlc.open;
    const high = ohlc.high;
    const low = ohlc.low;
    const close = ohlc.close;
    const volume = ohlc.volume;
    const timestamp = new Date(ohlc.ts).toISOString();

    // Calculate change & changePercent relative to previous day's close
    let change = 0;
    let changePercent = 0;

    if (prev?.close && prev.close > 0) {
      change = lastPrice - prev.close;
      changePercent = (change / prev.close) * 100;
    } else if (open > 0) {
      // Fallback to open price if previous close is unavailable
      change = lastPrice - open;
      changePercent = (change / open) * 100;
    }

    return {
      lastPrice,
      change,
      changePercent,
      open,
      high,
      low,
      close,
      volume,
      timestamp,
    };
  } catch (error) {
    console.error(`Error fetching price for ${instrumentKey}:`, error);
    return null;
  }
}

/**
 * Fetch company profile.
 */
export async function getStockProfile(isin: string): Promise<StockProfile | null> {
  try {
    const url = `/v2/fundamentals/${isin}/profile`;
    const response = await fetchUpstox(url, UpstoxProfileResponseSchema, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (response.status !== "success" || !response.data) {
      return null;
    }

    const data = response.data;
    return {
      companyProfile: data.company_profile || "No description available.",
      sector: data.sector || "N/A",
      sectorMarketCapInr: {
        value: data.sector_market_cap_inr?.value ?? null,
        unit: data.sector_market_cap_inr?.unit ?? "crore",
        formatted: data.sector_market_cap_inr?.formatted ?? "N/A",
      },
      sectorMarketCapUsd: {
        value: data.sector_market_cap_usd?.value ?? null,
        unit: data.sector_market_cap_usd?.unit ?? "billion",
        formatted: data.sector_market_cap_usd?.formatted ?? "N/A",
      },
    };
  } catch (error) {
    console.error(`Error fetching profile for ${isin}:`, error);
    return null;
  }
}

/**
 * Fetch fundamental key ratios.
 */
export async function getKeyRatios(isin: string): Promise<StockRatio[]> {
  try {
    const url = `/v2/fundamentals/${isin}/key-ratios`;
    const response = await fetchUpstox(url, UpstoxKeyRatiosResponseSchema, {
      next: { revalidate: 21600 }, // Cache for 6 hours
    });

    if (response.status !== "success" || !response.data) {
      return [];
    }

    return response.data.map((item) => ({
      name: item.name,
      companyValue: item.company_value,
      sectorValue: item.sector_value,
    }));
  } catch (error) {
    console.error(`Error fetching key ratios for ${isin}:`, error);
    return [];
  }
}

/**
 * Fetch historical candle data.
 * Dynamic loading will fetch the appropriate range to populate the charts.
 */
export async function getHistoricalCandles(instrumentKey: string, range: string): Promise<Candle[]> {
  try {
    const toDate = new Date();
    const fromDate = new Date();

    // Map range to calendar years to ensure we have enough buffer for 200 DMA calculations
    switch (range.toLowerCase()) {
      case "2y": // Initial load: fetches 2 years (supports 1Y chart + 200 DMA)
        fromDate.setFullYear(toDate.getFullYear() - 2);
        break;
      case "3y": // Lazy load 3Y: fetch 4 years of history to compute DMA
        fromDate.setFullYear(toDate.getFullYear() - 4);
        break;
      case "5y": // Lazy load 5Y: fetch 6 years
        fromDate.setFullYear(toDate.getFullYear() - 6);
        break;
      case "10y": // Lazy load 10Y: fetch 10 years (Upstox decade limit)
        fromDate.setFullYear(toDate.getFullYear() - 10);
        break;
      default: // Fallback to 2 years
        fromDate.setFullYear(toDate.getFullYear() - 2);
    }

    const toStr = formatDate(toDate);
    const fromStr = formatDate(fromDate);
    const url = `/v3/historical-candle/${encodeURIComponent(instrumentKey)}/days/1/${toStr}/${fromStr}`;

    const response = await fetchUpstox(url, UpstoxHistoricalCandleResponseSchema, {
      next: { revalidate: 43200 }, // Cache daily historical data for 12 hours
    });

    if (response.status !== "success" || !response.data || !response.data.candles) {
      return [];
    }

    // Map candles to internal models and sort chronologically (oldest first)
    const rawCandles = response.data.candles.map((c) => ({
      time: c[0].split("T")[0], // Keep date portion only
      open: c[1],
      high: c[2],
      low: c[3],
      close: c[4],
      volume: c[5],
    }));

    // Upstox API returns newest first (reverse chronological), so we reverse it to chronological order.
    return rawCandles.reverse();
  } catch (error) {
    console.error(`Error fetching historical candles for ${instrumentKey}:`, error);
    return [];
  }
}
