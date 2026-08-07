import { resolveSymbol, getStockPrice, getStockProfile, getKeyRatios } from "@/lib/upstox/service";
import { getIndianCompanyDetails, getIndianFinancialStats } from "@/lib/providers/indianapi/provider";
import { StockPrice, StockProfile, StockRatio } from "./types";
import { RawIndianCompanyDetails, RawIndianHistoricalStats } from "@/lib/providers/indianapi/types";

export interface ProviderCompanyData {
  symbol: string;
  name: string;
  exchange: string;
  isin: string;
  price: StockPrice | null;
  profile: StockProfile | null;
  ratios: StockRatio[];
  indianApiDetails: RawIndianCompanyDetails | null;
  indianApiYoyPL: RawIndianHistoricalStats | null;
  indianApiQuarterlyPL: RawIndianHistoricalStats | null;
  indianApiShareholding: RawIndianHistoricalStats | null;
}

export interface IStockDataProvider {
  getCompanyData(symbol: string): Promise<ProviderCompanyData | null>;
}

export class UpstoxProviderAdapter implements IStockDataProvider {
  async getCompanyData(symbol: string): Promise<ProviderCompanyData | null> {
    try {
      const instrument = await resolveSymbol(symbol);
      if (!instrument) return null;

      const [price, profile, ratios] = await Promise.all([
        getStockPrice(instrument.instrumentKey).catch(() => null),
        getStockProfile(instrument.isin).catch(() => null),
        getKeyRatios(instrument.isin).catch(() => []),
      ]);

      return {
        symbol: instrument.symbol,
        name: instrument.name,
        exchange: instrument.exchange,
        isin: instrument.isin,
        price,
        profile,
        ratios,
        indianApiDetails: null,
        indianApiYoyPL: null,
        indianApiQuarterlyPL: null,
        indianApiShareholding: null,
      };
    } catch (err) {
      console.error(`[UpstoxProviderAdapter] Error loading ${symbol}:`, err);
      return null;
    }
  }
}

export class IndianApiProviderAdapter implements IStockDataProvider {
  async getCompanyData(symbol: string): Promise<ProviderCompanyData | null> {
    try {
      const [details, yoy, quarterly, shareholding] = await Promise.all([
        getIndianCompanyDetails(symbol).catch(() => null),
        getIndianFinancialStats(symbol, "yoy_results").catch(() => null),
        getIndianFinancialStats(symbol, "quarter_results").catch(() => null),
        getIndianFinancialStats(symbol, "shareholding_pattern_quarterly").catch(() => null),
      ]);

      if (!details) return null;

      // Extract ISIN safely
      const profile = details.companyProfile as Record<string, unknown> | undefined;
      const isin = (profile?.isin as string) || "";

      return {
        symbol: symbol.toUpperCase(),
        name: details.companyName || symbol,
        exchange: "NSE",
        isin,
        price: null,
        profile: null,
        ratios: [],
        indianApiDetails: details,
        indianApiYoyPL: yoy,
        indianApiQuarterlyPL: quarterly,
        indianApiShareholding: shareholding,
      };
    } catch (err) {
      console.error(`[IndianApiProviderAdapter] Error loading ${symbol}:`, err);
      return null;
    }
  }
}
