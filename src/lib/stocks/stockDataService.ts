import { getCacheProvider } from "./cacheProvider";
import { UpstoxProviderAdapter, IndianApiProviderAdapter, ProviderCompanyData } from "./providers";
import { resolveFallbackMetric } from "./fallback";
import { UNIVERSE_TICKERS, THEME_MAP } from "./universe";

export interface ScreenerStock {
  symbol: string;
  name: string;
  exchange: string;
  price: number | null;
  changePercent: number | null;
  volume: number | null;
  sector: string;
  industry: string;
  marketCap: number | null;
  pe: string;
  pb: string;
  roe: string;
  roce: string;
  evebitda: string;
  dividendYield: string;
  debtToEquity: string;
  currentRatio: string;
  interestCoverage: string;
  operatingMargin: string;
  netMargin: string;
  promoter: string;
  fii: string;
  dii: string;
  public: string;
  high52W: number | null;
  low52W: number | null;
  peg?: string;
  averageVolume?: number | null;
  movingAverage?: string;
}

export class StockDataService {
  private static cache = getCacheProvider();
  private static upstoxAdapter = new UpstoxProviderAdapter();
  private static indianApiAdapter = new IndianApiProviderAdapter();
  private static activeRequests = new Map<string, Promise<unknown>>();

  /**
   * Safe helper to orchestrate deduplicated fetches
   */
  private static async orchestrateRequest<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const active = this.activeRequests.get(key);
    if (active) {
      return active as Promise<T>;
    }

    const promise = fetchFn().finally(() => {
      this.activeRequests.delete(key);
    });

    this.activeRequests.set(key, promise);
    return promise;
  }

  /**
   * Fetches full metrics for a single stock, caching dynamically
   */
  static async getCompanyData(symbol: string): Promise<ProviderCompanyData | null> {
    const cleanSym = symbol.toUpperCase();
    const cacheKey = `data:company:${cleanSym}`;
    const cacheProvider = this.cache;

    const cached = await cacheProvider.get<ProviderCompanyData>(cacheKey);
    if (cached) {
      return cached;
    }

    return this.orchestrateRequest(cacheKey, async () => {
      const [upstoxData, indianApiData] = await Promise.all([
        this.upstoxAdapter.getCompanyData(cleanSym),
        this.indianApiAdapter.getCompanyData(cleanSym),
      ]);

      if (!upstoxData && !indianApiData) {
        return null;
      }

      // Merge data
      const merged: ProviderCompanyData = {
        symbol: cleanSym,
        name: upstoxData?.name || indianApiData?.name || cleanSym,
        exchange: upstoxData?.exchange || "NSE",
        isin: upstoxData?.isin || indianApiData?.isin || "",
        price: upstoxData?.price || null,
        profile: upstoxData?.profile || indianApiData?.profile || null,
        ratios: [...(upstoxData?.ratios || []), ...(indianApiData?.ratios || [])],
        indianApiDetails: indianApiData?.indianApiDetails || null,
        indianApiYoyPL: indianApiData?.indianApiYoyPL || null,
        indianApiQuarterlyPL: indianApiData?.indianApiQuarterlyPL || null,
        indianApiShareholding: indianApiData?.indianApiShareholding || null,
      };

      // Cache Fundamentals for 6 hours (21600 seconds)
      await cacheProvider.set(cacheKey, merged, 21600);
      return merged;
    });
  }

  /**
   * Compiles Screener fields for a stock using fallback engines
   */
  static async getStockScreenerItem(symbol: string): Promise<ScreenerStock | null> {
    const cleanSym = symbol.toUpperCase();
    const data = await this.getCompanyData(cleanSym);
    if (!data) return null;

    const priceVal = data.price?.lastPrice ?? null;
    const changePct = data.price?.changePercent ?? null;
    const vol = data.price?.volume ?? null;
    const sector = data.profile?.sector || data.indianApiDetails?.industry || "N/A";
    const industry = data.indianApiDetails?.companyProfile
      ? (data.indianApiDetails.companyProfile as Record<string, unknown>).mgIndustry as string || "N/A"
      : "N/A";

    let capVal = data.profile?.sectorMarketCapInr?.value ?? null;
    if (capVal === null && data.indianApiDetails?.keyMetrics) {
      const rawCap = (data.indianApiDetails.keyMetrics as Record<string, unknown>).marketCap;
      if (rawCap) {
        const num = typeof rawCap === "number" ? rawCap : parseFloat(String(rawCap).replace(/[^0-9.-]/g, ""));
        if (!isNaN(num)) {
          capVal = num;
        }
      }
    }

    // Ratios fallback
    const pe = resolveFallbackMetric("pe", cleanSym, data, data);
    const pb = resolveFallbackMetric("pb", cleanSym, data, data);
    const roe = resolveFallbackMetric("roe", cleanSym, data, data);
    const roce = resolveFallbackMetric("roce", cleanSym, data, data);
    const evebitda = resolveFallbackMetric("evebitda", cleanSym, data, data);
    const dividendYield = resolveFallbackMetric("dividendyield", cleanSym, data, data);
    const debtToEquity = resolveFallbackMetric("debttoequity", cleanSym, data, data);
    const currentRatio = resolveFallbackMetric("currentratio", cleanSym, data, data);
    const interestCoverage = resolveFallbackMetric("interestcoverage", cleanSym, data, data);

    // Shareholding ratios
    let promoter = "—";
    let fii = "—";
    let dii = "—";
    let publicHold = "—";

    if (data.indianApiShareholding) {
      const periods = Object.keys(data.indianApiShareholding);
      if (periods.length > 0) {
        const latestPeriod = periods[periods.length - 1];
        const sh = data.indianApiShareholding[latestPeriod];
        if (sh) {
          promoter = sh.promoters !== null && sh.promoters !== undefined ? `${sh.promoters}%` : "—";
          fii = sh.fii !== null && sh.fii !== undefined ? `${sh.fii}%` : "—";
          dii = sh.dii !== null && sh.dii !== undefined ? `${sh.dii}%` : "—";
          publicHold = sh.public !== null && sh.public !== undefined ? `${sh.public}%` : "—";
        }
      }
    }

    // 52W extremes
    const high52W = data.price?.high || null;
    const low52W = data.price?.low || null;

    return {
      symbol: cleanSym,
      name: data.name,
      exchange: data.exchange,
      price: priceVal,
      changePercent: changePct,
      volume: vol,
      sector,
      industry,
      marketCap: capVal,
      pe,
      pb,
      roe,
      roce,
      evebitda,
      dividendYield,
      debtToEquity,
      currentRatio,
      interestCoverage,
      operatingMargin: "—",
      netMargin: "—",
      promoter,
      fii,
      dii,
      public: publicHold,
      high52W,
      low52W,
      peg: "—",
      averageVolume: vol,
      movingAverage: "—",
    };
  }

  /**
   * Returns complete screener universe, cached for 5m (300 seconds) SWR
   */
  static async getScreenerUniverse(): Promise<ScreenerStock[]> {
    const cacheKey = "data:screener:universe";
    const cacheProvider = this.cache;

    const cached = await cacheProvider.get<ScreenerStock[]>(cacheKey);
    if (cached) {
      // SWR: Async refresh if expired in background
      this.triggerSWRRefresh(cacheKey, async () => this.fetchFreshUniverse());
      return cached;
    }

    return this.orchestrateRequest(cacheKey, async () => {
      const data = await this.fetchFreshUniverse();
      await cacheProvider.set(cacheKey, data, 300); // 5 minutes TTL
      return data;
    });
  }

  private static async fetchFreshUniverse(): Promise<ScreenerStock[]> {
    // Process universe stocks sequentially/parallel with batches to avoid rate limit
    const results: ScreenerStock[] = [];
    const batchSize = 5;
    for (let i = 0; i < UNIVERSE_TICKERS.length; i += batchSize) {
      const batch = UNIVERSE_TICKERS.slice(i, i + batchSize);
      const promises = batch.map(sym => this.getStockScreenerItem(sym));
      const items = await Promise.all(promises);
      for (const item of items) {
        if (item) results.push(item);
      }
      // Brief sleep between batches to respect rate limits
      await new Promise(r => setTimeout(r, 100));
    }
    return results;
  }

  private static triggerSWRRefresh(key: string, fetchFn: () => Promise<unknown>) {
    // Background validation
    fetchFn()
      .then(async (fresh) => {
        await this.cache.set(key, fresh, 300);
      })
      .catch((err) => {
        console.warn(`[SWR Background Refresh] Failed to refresh ${key}:`, err);
      });
  }

  /**
   * Aggregates stats for specific sector
   */
  static async getSectorData(sectorId: string) {
    const universe = await this.getScreenerUniverse();
    const sectorStocks = universe.filter(
      s => s.sector.toLowerCase().replace(/[^a-z0-9]/g, "") === sectorId.toLowerCase().replace(/[^a-z0-9]/g, "")
    );

    if (sectorStocks.length === 0) return null;

    const marketCap = sectorStocks.reduce((sum, s) => sum + (s.marketCap || 0), 0);

    const getMedian = (vals: number[]): number => {
      if (vals.length === 0) return 0;
      const sorted = [...vals].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const parseVal = (str: string): number | null => {
      const num = parseFloat(str.replace(/[^0-9.-]/g, ""));
      return isNaN(num) ? null : num;
    };

    const peVals = sectorStocks.map(s => parseVal(s.pe)).filter((v): v is number => v !== null);
    const roeVals = sectorStocks.map(s => parseVal(s.roe)).filter((v): v is number => v !== null);
    const roceVals = sectorStocks.map(s => parseVal(s.roce)).filter((v): v is number => v !== null);

    // Sorted gainers/losers
    const gainers = [...sectorStocks]
      .filter(s => s.changePercent !== null)
      .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
      .slice(0, 5);

    const losers = [...sectorStocks]
      .filter(s => s.changePercent !== null)
      .sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0))
      .slice(0, 5);

    return {
      sectorName: sectorStocks[0].sector,
      marketCap,
      companiesCount: sectorStocks.length,
      medianPE: getMedian(peVals),
      medianROE: getMedian(roeVals),
      medianROCE: getMedian(roceVals),
      topCompanies: sectorStocks.slice(0, 5),
      gainers,
      losers,
    };
  }

  /**
   * Fetches IPO Center data from IndianAPI, cached for 1 hour (3600s) SWR
   */
  static async getIPOData(): Promise<unknown> {
    const cacheKey = "data:ipo:listings";
    const cached = await this.cache.get<unknown>(cacheKey);
    if (cached) {
      this.triggerSWRRefresh(cacheKey, async () => {
        const res = await fetch("https://stock.indianapi.in/ipo", {
          headers: { "X-Api-Key": process.env.INDIAN_API_KEY || "", "Accept": "application/json" },
        });
        if (!res.ok) {
          throw new Error(`SWR background refresh failed with status: ${res.status}`);
        }
        const text = await res.text();
        if (!text || text.trim() === "") {
          return {};
        }
        try {
          return JSON.parse(text);
        } catch {
          return {};
        }
      });
      return cached;
    }

    return this.orchestrateRequest(cacheKey, async () => {
      const res = await fetch("https://stock.indianapi.in/ipo", {
        headers: { "X-Api-Key": process.env.INDIAN_API_KEY || "", "Accept": "application/json" },
      });
      if (res.status === 429) {
        throw new Error("Rate limit exceeded on the IndianAPI provider. Please try again in a few minutes.");
      }
      if (!res.ok) {
        throw new Error(`IPO fetch failed with status: ${res.status}`);
      }
      const text = await res.text();
      if (!text || text.trim() === "") {
        return {};
      }
      try {
        const data = JSON.parse(text);
        await this.cache.set(cacheKey, data, 3600); // 1 hour TTL
        return data;
      } catch {
        throw new Error("Invalid response received from the IndianAPI provider. Rate limit might be exceeded.");
      }
    });
  }

  /**
   * Filters screener universe by theme collection
   */
  static async getCollectionsData(collectionId: string) {
    const tickers = THEME_MAP[collectionId.toLowerCase()];
    if (!tickers) return null;

    const universe = await this.getScreenerUniverse();
    const stocks = universe.filter(s => tickers.includes(s.symbol));

    const parseVal = (str: string): number | null => {
      const num = parseFloat(str.replace(/[^0-9.-]/g, ""));
      return isNaN(num) ? null : num;
    };

    const peVals = stocks.map(s => parseVal(s.pe)).filter((v): v is number => v !== null);
    const roeVals = stocks.map(s => parseVal(s.roe)).filter((v): v is number => v !== null);
    const roceVals = stocks.map(s => parseVal(s.roce)).filter((v): v is number => v !== null);

    const avg = (vals: number[]): number => (vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);

    return {
      stocks,
      averagePE: avg(peVals),
      averageROE: avg(roeVals),
      averageROCE: avg(roceVals),
    };
  }
}
