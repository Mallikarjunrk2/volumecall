import { getCacheProvider } from "./cacheProvider";
import { after } from "next/server";
import { UpstoxProviderAdapter, IndianApiProviderAdapter, ProviderCompanyData } from "./providers";
import { resolveFallbackMetric } from "./fallback";
import { UNIVERSE_TICKERS } from "./universe";
import { persistCompanyData, getCompanyFromDb, getIposFromDb, saveIposToDb } from "@/lib/db/services";

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
      // 1. Attempt read-through from PostgreSQL first
      try {
        const dbCompany = await getCompanyFromDb(cleanSym);
        if (dbCompany) {
          // If valid database copy exists, query Upstox in parallel for live price & ratios
          const upstoxData = await this.upstoxAdapter.getCompanyData(cleanSym);
          
          const merged: ProviderCompanyData = {
            symbol: cleanSym,
            name: upstoxData?.name || dbCompany.name || cleanSym,
            exchange: upstoxData?.exchange || "NSE",
            isin: upstoxData?.isin || dbCompany.isin || "",
            price: upstoxData?.price || null,
            profile: upstoxData?.profile || dbCompany.profile || null,
            ratios: [...(upstoxData?.ratios || []), ...(dbCompany.ratios || [])],
            indianApiDetails: dbCompany.indianApiDetails || null,
            indianApiYoyPL: dbCompany.indianApiYoyPL || null,
            indianApiQuarterlyPL: dbCompany.indianApiQuarterlyPL || null,
            indianApiShareholding: dbCompany.indianApiShareholding || null,
            indianApiBalanceSheet: dbCompany.indianApiBalanceSheet || null,
            indianApiCashFlow: dbCompany.indianApiCashFlow || null,
          };
          
          // Cache in memory for 6 hours (21600 seconds)
          await cacheProvider.set(cacheKey, merged, 21600);
          console.log(`[Database Read Cache] Served ${cleanSym} using Postgres cached financials and Upstox live metrics`);
          return merged;
        }
      } catch (err) {
        console.error(`[Database Read Cache Query Error] Failed for ${cleanSym}, falling back to API:`, err);
      }

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
        indianApiBalanceSheet: indianApiData?.indianApiBalanceSheet || null,
        indianApiCashFlow: indianApiData?.indianApiCashFlow || null,
      };

      // Asynchronously trigger database persistence (non-blocking, serverless-hardened)
      try {
        after(() => {
          persistCompanyData(merged).catch((error) => {
            console.error(`[Database Persistence Background Error] Failed for ${cleanSym}:`, error);
          });
        });
      } catch {
        persistCompanyData(merged).catch((error) => {
          console.error(`[Database Persistence Background Error] Failed for ${cleanSym}:`, error);
        });
      }

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
   * Resolves price/change/volume metrics for Markets Dashboard using Upstox batching.
   * Consumes 0 IndianAPI requests.
   */
  static async getMoversUniverse(): Promise<ScreenerStock[]> {
    const cacheKey = "data:markets:movers";
    const cached = await this.cache.get<ScreenerStock[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { sql } = await import("@/lib/db");
      const dbCompanies = await sql`
        SELECT symbol, name, sector FROM companies;
      `.catch(() => []);
      const companyMap = new Map(
        dbCompanies.map((c) => [String(c.symbol).toUpperCase(), c])
      );

      const results: ScreenerStock[] = [];
      const batchSize = 10;
      const { resolveSymbol, getStockPrice } = await import("@/lib/upstox/service");

      for (let i = 0; i < UNIVERSE_TICKERS.length; i += batchSize) {
        const batch = UNIVERSE_TICKERS.slice(i, i + batchSize);
        const promises = batch.map(async (symbol) => {
          try {
            const cleanSym = symbol.toUpperCase();
            const dbComp = companyMap.get(cleanSym);
            const name = dbComp ? String(dbComp.name) : symbol;
            const sector = dbComp ? String(dbComp.sector) : "N/A";

            const instrument = await resolveSymbol(cleanSym);
            if (!instrument) return null;

            const price = await getStockPrice(instrument.instrumentKey).catch(() => null);
            if (!price) return null;

            return {
              symbol: cleanSym,
              name,
              exchange: "NSE",
              price: price.lastPrice,
              changePercent: price.changePercent,
              volume: price.volume,
              pe: "—",
              pb: "—",
              roe: "—",
              roce: "—",
              debtToEquity: "—",
              sector,
              high52W: price.high,
            } as ScreenerStock;
          } catch {
            return null;
          }
        });
        const items = await Promise.all(promises);
        results.push(...items.filter((item): item is ScreenerStock => item !== null));
      }

      await this.cache.set(cacheKey, results, 300); // 5 minutes TTL
      return results;
    } catch (error) {
      console.error("[getMoversUniverse Error]:", error);
      return [];
    }
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
   * Fetches IPO Center data from IndianAPI, cached for 1 hour (3600s) SWR
   * Backend cached in PostgreSQL for 24 hours.
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
          const data = JSON.parse(text);
          try {
            after(() => {
              saveIposToDb(data).catch(err => {
                console.error("[IPO Database Cache Error] SWR background save failed:", err);
              });
            });
          } catch {
            saveIposToDb(data).catch(err => {
              console.error("[IPO Database Cache Error] SWR background save failed:", err);
            });
          }
          return data;
        } catch {
          return {};
        }
      });
      return cached;
    }

    // Try reading from Postgres cache
    try {
      const dbData = await getIposFromDb();
      if (dbData) {
        // Postgres hit! Populate memory cache
        await this.cache.set(cacheKey, dbData, 3600);
        return dbData;
      }
    } catch (err) {
      console.warn("[IPO Database Cache Warning] Failed to read IPOs from Postgres, falling back to API:", err);
    }

    // Postgres miss/stale/error -> Call IndianAPI
    return this.orchestrateRequest(cacheKey, async () => {
      console.log("[IPO Database Cache] PostgreSQL cache miss");
      console.log("[IPO Database Cache] Fetching fresh IPO data from provider");
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
        
        // Persist to Postgres in background (serverless-hardened)
        try {
          after(() => {
            saveIposToDb(data).catch(err => {
              console.error("[IPO Database Cache Error] Failed to persist IPO data:", err);
            });
          });
        } catch {
          saveIposToDb(data).catch(err => {
            console.error("[IPO Database Cache Error] Failed to persist IPO data:", err);
          });
        }
        
        return data;
      } catch {
        throw new Error("Invalid response received from the IndianAPI provider. Rate limit might be exceeded.");
      }
    });
  }


}
