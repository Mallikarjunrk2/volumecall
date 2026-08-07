import { NextResponse } from "next/server";
import { resolveSymbol, getStockPrice, getStockProfile, searchInstruments } from "@/lib/upstox/service";
import { getIndianCompanyDetails, getIndianFinancialStats } from "@/lib/providers/indianapi/provider";
import {
  normalizeCompanyIdentity,
  normalizeMarketSnapshot,
  normalizeRatios,
  normalizeCorporateActions,
  normalizeAnnouncements,
  normalizeFinancialPeriods,
  normalizeBalanceSheet,
  normalizeCashFlow,
  normalizeShareholdingHistory,
  normalizeLatestShareholding,
  getMetricValue
} from "@/lib/providers/indianapi/normalize";
import { calculateGrowth, calculateMedian } from "@/lib/stocks/calculations";
import {
  NormalizedCompanyIdentity,
  NormalizedMarketSnapshot,
  NormalizedRatios,
  NormalizedCorporateAction,
  NormalizedAnnouncement,
  FinancialPeriod,
  BalanceSheetPeriod,
  CashFlowPeriod,
  NormalizedShareholdingQuarter,
  RawIndianCompanyDetails
} from "@/lib/providers/indianapi/types";

// Helper mapping for symbol peers
const PEER_MAP: Record<string, string[]> = {
  RELIANCE: ["ONGC", "BPCL", "IOC", "HPCL", "OIL"],
  TCS: ["INFY", "WIPRO", "HCLTECH", "TECHM", "LTIM"],
  INFY: ["TCS", "WIPRO", "HCLTECH", "TECHM", "LTIM"],
  HDFCBANK: ["ICICIBANK", "AXISBANK", "SBIN", "KOTAKBANK", "INDUSINDBK"],
  LT: ["RELIANCE", "SIEMENS", "ABB", "HAL", "BEL"],
  AVANTEL: ["BEL", "HAL", "BDL", "NELCO", "CENTUM"],
};

function calculateDerivableMetrics(
  symbol: string,
  price: number | null,
  marketCap: number | null,
  ratios: NormalizedRatios,
  annualPL: FinancialPeriod[],
  balanceSheet: BalanceSheetPeriod[]
) {
  const updatedRatios = { ...ratios };
  
  // Resolve EPS from annual P&L if available
  let latestEPS: number | null = null;
  if (annualPL.length > 0) {
    const latestAnnual = annualPL[annualPL.length - 1];
    latestEPS = latestAnnual.eps;
  }

  // 1. Calculate P/E if null
  if (updatedRatios.pe === null && price && latestEPS && latestEPS > 0) {
    updatedRatios.pe = price / latestEPS;
  }

  // 2. Calculate Price to Sales if null
  let latestRevenue: number | null = null;
  if (annualPL.length > 0) {
    const latestAnnual = annualPL[annualPL.length - 1];
    latestRevenue = latestAnnual.sales;
  }
  if (updatedRatios.priceToSales === null && marketCap && latestRevenue && latestRevenue > 0) {
    updatedRatios.priceToSales = marketCap / latestRevenue;
  }

  // 3. Calculate Debt to Equity if null
  if (updatedRatios.debtToEquity === null && balanceSheet.length > 0) {
    const latestBS = balanceSheet[balanceSheet.length - 1];
    const totalEquity = (latestBS.equityCapital || 0) + (latestBS.reserves || 0);
    if (totalEquity > 0 && latestBS.borrowings !== null) {
      updatedRatios.debtToEquity = latestBS.borrowings / totalEquity;
    }
  }

  // 4. Calculate ROE if null
  if (updatedRatios.roe === null && annualPL.length > 0 && balanceSheet.length > 0) {
    const latestAnnual = annualPL[annualPL.length - 1];
    const latestBS = balanceSheet[balanceSheet.length - 1];
    const totalEquity = (latestBS.equityCapital || 0) + (latestBS.reserves || 0);
    if (totalEquity > 0 && latestAnnual.netProfit !== null) {
      updatedRatios.roe = (latestAnnual.netProfit / totalEquity) * 100;
    }
  }

  // 5. Calculate ROA if null
  if (updatedRatios.roa === null && annualPL.length > 0 && balanceSheet.length > 0) {
    const latestAnnual = annualPL[annualPL.length - 1];
    const latestBS = balanceSheet[balanceSheet.length - 1];
    if (latestBS.totalAssets && latestBS.totalAssets > 0 && latestAnnual.netProfit !== null) {
      updatedRatios.roa = (latestAnnual.netProfit / latestBS.totalAssets) * 100;
    }
  }

  // Calculate CAGRs
  let rev3Y: number | null = null;
  let rev5Y: number | null = null;
  let prof3Y: number | null = null;
  let prof5Y: number | null = null;

  if (annualPL.length >= 4) {
    const latest = annualPL[annualPL.length - 1];
    const prev3 = annualPL[annualPL.length - 4];
    if (latest.sales && prev3.sales && prev3.sales > 0) {
      rev3Y = (Math.pow(latest.sales / prev3.sales, 1 / 3) - 1) * 100;
    }
    if (latest.netProfit && prev3.netProfit && prev3.netProfit > 0) {
      prof3Y = (Math.pow(latest.netProfit / prev3.netProfit, 1 / 3) - 1) * 100;
    }
  }

  if (annualPL.length >= 6) {
    const latest = annualPL[annualPL.length - 1];
    const prev5 = annualPL[annualPL.length - 6];
    if (latest.sales && prev5.sales && prev5.sales > 0) {
      rev5Y = (Math.pow(latest.sales / prev5.sales, 1 / 5) - 1) * 100;
    }
    if (latest.netProfit && prev5.netProfit && prev5.netProfit > 0) {
      prof5Y = (Math.pow(latest.netProfit / prev5.netProfit, 1 / 5) - 1) * 100;
    }
  }

  return { ratios: updatedRatios, cagr: { rev3Y, rev5Y, prof3Y, prof5Y } };
}

function resolveLatestFinancials(
  rawDetails: RawIndianCompanyDetails | null,
  annualPL: FinancialPeriod[]
) {
  const result = {
    revenue: null as number | null,
    netProfit: null as number | null,
    eps: null as number | null,
    operatingMargin: null as number | null,
    revenueGrowth: null as number | null,
    profitGrowth: null as number | null,
  };

  // 1. Fallback default: Annual statements
  if (annualPL.length > 0) {
    const latest = annualPL[annualPL.length - 1];
    result.revenue = latest.sales;
    result.netProfit = latest.netProfit;
    result.eps = latest.eps;
    result.operatingMargin = latest.opmPercent;
    result.revenueGrowth = latest.yoyGrowth || null;
  }

  // 2. Fallback: Key metrics trailing/TTM data
  if (rawDetails && rawDetails.keyMetrics) {
    const getVal = (keys: string[]): number | null => {
      for (const k of keys) {
        const v = getMetricValue(rawDetails.keyMetrics, k);
        if (v !== null) return v;
      }
      return null;
    };

    const ttmRev = getVal(["revenueTrailing12Month", "revenueMostRecentFiscalYear"]);
    if (ttmRev !== null) result.revenue = ttmRev;

    const ttmProfit = getVal(["netIncomeAvailableToCommonTrailing12Months", "netIncomeAvailableToCommonMostRecentFiscalYear"]);
    if (ttmProfit !== null) result.netProfit = ttmProfit;

    const ttmEps = getVal(["earningsPerShareNormalizedExcludingExtraordinaryItemsAvgDilutedSharesOutstandingTTM", "ePSIncludingExtraOrdinaryItemsTrailing12Month", "ePSBasicExcludingExtraordinaryItemsItrailing12Month"]);
    if (ttmEps !== null) result.eps = ttmEps;

    const ttmMargin = getVal(["operatingMarginTrailing12Month", "operatingMarginMostRecentFiscalYear"]);
    if (ttmMargin !== null) result.operatingMargin = ttmMargin;

    const revGrowth = getVal(["revenueChangePercentTTMPOverTTM", "revenueChangePercentMostRecentQuarter1YearAgo"]);
    if (revGrowth !== null) result.revenueGrowth = revGrowth;

    const profGrowth = getVal(["ePSChangePercentTTMOverTTM", "ePSChangePercentMostRecentQuarter1YearAgo"]);
    if (profGrowth !== null) result.profitGrowth = profGrowth;
  }

  return result;
}

export async function GET(
  request: Request,
  props: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await props.params;
    const symbol = rawSymbol.toUpperCase();

    // Parse section query parameter
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "overview";

    // 1. Resolve ticker metadata from Upstox
    const instrument = await resolveSymbol(symbol);
    if (!instrument) {
      return NextResponse.json({ error: `Symbol ${symbol} not found.` }, { status: 404 });
    }

    if (section === "overview") {
      // Parallel loading for ALL profiles, fundamentals, & statements to preload and cache everything
      const [
        upstoxPrice,
        upstoxProfile,
        rawIndianDetails,
        quarterStats,
        annualStats,
        balanceStats,
        , // Cash flow stats preloaded in parallel but not directly required by overview
        shareholdingStats,
      ] = await Promise.allSettled([
        getStockPrice(instrument.instrumentKey),
        getStockProfile(instrument.isin),
        getIndianCompanyDetails(symbol),
        getIndianFinancialStats(symbol, "quarter_results"),
        getIndianFinancialStats(symbol, "yoy_results"),
        getIndianFinancialStats(symbol, "balancesheet"),
        getIndianFinancialStats(symbol, "cashflow"),
        getIndianFinancialStats(symbol, "shareholding_pattern_quarterly"),
      ]);

      const resolvedPrice = upstoxPrice.status === "fulfilled" ? upstoxPrice.value : null;
      const resolvedProfile = upstoxProfile.status === "fulfilled" ? upstoxProfile.value : null;
      
      let company: NormalizedCompanyIdentity = {
        tickerId: instrument.symbol,
        companyName: instrument.name,
        industry: resolvedProfile?.sector || "N/A",
        description: "No description available.",
        isin: instrument.isin,
        logoUrl: null,
        website: null,
      };

      let market: NormalizedMarketSnapshot = {
        priceBse: null,
        priceNse: resolvedPrice?.lastPrice ?? null,
        percentChange: resolvedPrice?.changePercent ?? null,
        yearHigh: null,
        yearLow: null,
        freshness: "LIVE",
        updatedAt: resolvedPrice?.timestamp || new Date().toISOString(),
      };

      let ratios: NormalizedRatios = {
        pe: null,
        pb: null,
        evebitda: null,
        priceToSales: null,
        dividendYield: null,
        roe: null,
        roce: null,
        roa: null,
        debtToEquity: null,
        currentRatio: null,
        quickRatio: null,
        interestCoverage: null,
      };

      let shareholdingLatest = {
        promoters: null as number | null,
        fii: null as number | null,
        dii: null as number | null,
        public: null as number | null,
      };

      let corporateActions: NormalizedCorporateAction[] = [];
      let announcements: NormalizedAnnouncement[] = [];

      let quarterlyResults: FinancialPeriod[] = [];
      let annualProfitLoss: FinancialPeriod[] = [];
      let balanceSheet: BalanceSheetPeriod[] = [];

      // Parse financials for growth and CAGR calculations
      try {
        if (quarterStats.status === "fulfilled" && quarterStats.value) {
          quarterlyResults = normalizeFinancialPeriods(quarterStats.value);
          for (let i = 0; i < quarterlyResults.length; i++) {
            const cur = quarterlyResults[i];
            if (i >= 4) {
              const prev = quarterlyResults[i - 4];
              cur.yoyGrowth = calculateGrowth(cur.sales, prev.sales);
            }
            if (i >= 1) {
              const prev = quarterlyResults[i - 1];
              cur.qoqGrowth = calculateGrowth(cur.sales, prev.sales);
            }
          }
        }
      } catch (err) {
        console.warn(`[Research API] ${symbol} overview quarterly stats parse failed:`, err);
      }

      try {
        if (annualStats.status === "fulfilled" && annualStats.value) {
          annualProfitLoss = normalizeFinancialPeriods(annualStats.value);
          for (let i = 0; i < annualProfitLoss.length; i++) {
            const cur = annualProfitLoss[i];
            if (i >= 1) {
              const prev = annualProfitLoss[i - 1];
              cur.yoyGrowth = calculateGrowth(cur.sales, prev.sales);
            }
          }
        }
      } catch (err) {
        console.warn(`[Research API] ${symbol} overview annual stats parse failed:`, err);
      }

      try {
        if (balanceStats.status === "fulfilled" && balanceStats.value) {
          balanceSheet = normalizeBalanceSheet(balanceStats.value);
          for (let i = 0; i < balanceSheet.length; i++) {
            const cur = balanceSheet[i];
            if (i >= 1) {
              const prev = balanceSheet[i - 1];
              cur.yoyGrowth = calculateGrowth(cur.totalAssets, prev.totalAssets);
            }
          }
        }
      } catch (err) {
        console.warn(`[Research API] ${symbol} overview balance sheet parse failed:`, err);
      }

      // Overlay IndianAPI details if successful
      if (rawIndianDetails.status === "fulfilled" && rawIndianDetails.value) {
        const raw = rawIndianDetails.value;
        // 1. Resilient parsing of Company Identity
        try {
          const normalizedCompany = normalizeCompanyIdentity(raw);
          company = {
            ...company,
            industry: normalizedCompany.industry !== "N/A" ? normalizedCompany.industry : company.industry,
            description: normalizedCompany.description,
            isin: normalizedCompany.isin || company.isin,
          };
        } catch (err) {
          console.warn(`[Research API] ${symbol} company identity parse failed:`, err);
        }

        // 2. Resilient parsing of Market Snapshot
        try {
          const normalizedMarket = normalizeMarketSnapshot(raw);
          market = {
            ...market,
            priceBse: normalizedMarket.priceBse,
            priceNse: market.priceNse ?? normalizedMarket.priceNse,
            percentChange: market.percentChange ?? normalizedMarket.percentChange,
            yearHigh: normalizedMarket.yearHigh,
            yearLow: normalizedMarket.yearLow,
            freshness: "DELAYED" as const,
            updatedAt: normalizedMarket.updatedAt,
          };
        } catch (err) {
          console.warn(`[Research API] ${symbol} market snapshot parse failed:`, err);
        }

        // 3. Resilient parsing of Key Ratios
        try {
          ratios = normalizeRatios(raw);
        } catch (err) {
          console.warn(`[Research API] ${symbol} ratios parse failed:`, err);
        }

        // 4. Resilient parsing of Shareholding Snapshot
        try {
          shareholdingLatest = normalizeLatestShareholding(raw.shareholding);
        } catch (err) {
          console.warn(`[Research API] ${symbol} latest shareholding parse failed:`, err);
        }

        // 5. Resilient parsing of Corporate Actions
        try {
          corporateActions = normalizeCorporateActions(raw);
        } catch (err) {
          console.warn(`[Research API] ${symbol} corporate actions parse failed:`, err);
        }

        // 6. Resilient parsing of Announcements
        try {
          announcements = normalizeAnnouncements(raw);
        } catch (err) {
          console.warn(`[Research API] ${symbol} announcements parse failed:`, err);
        }
      }

      // Shareholding fallback if mainDetails had empty shareholding
      if (
        (!shareholdingLatest.promoters && !shareholdingLatest.fii && !shareholdingLatest.dii) &&
        shareholdingStats.status === "fulfilled" &&
        shareholdingStats.value
      ) {
        try {
          const history = normalizeShareholdingHistory(shareholdingStats.value);
          if (history.length > 0) {
            const latest = history[history.length - 1];
            shareholdingLatest = {
              promoters: latest.promoter,
              fii: latest.fii,
              dii: latest.dii,
              public: latest.public,
            };
          }
        } catch (err) {
          console.warn(`[Research API] ${symbol} shareholdingStats fallback parse failed:`, err);
        }
      }

      // Resolve derivable ratios & CAGR
      const marketPrice = market.priceNse || market.priceBse || null;
      const mCapVal = rawIndianDetails.status === "fulfilled" && rawIndianDetails.value 
        ? getMetricValue(rawIndianDetails.value.keyMetrics, "marketCap") 
        : null;
        
      const resolvedDerivs = calculateDerivableMetrics(
        symbol,
        marketPrice,
        mCapVal,
        ratios,
        annualProfitLoss,
        balanceSheet
      );
      
      const enrichedRatios = resolvedDerivs.ratios;
      const cagr = resolvedDerivs.cagr;

      // Resolve financial snapshot values
      const latestFinancials = resolveLatestFinancials(
        rawIndianDetails.status === "fulfilled" ? rawIndianDetails.value : null,
        annualProfitLoss
      );

      return NextResponse.json({
        company,
        market,
        ratios: enrichedRatios,
        shareholdingLatest,
        corporateActions,
        announcements,
        latestFinancials,
        cagr,
        keyMetrics: rawIndianDetails.status === "fulfilled" && rawIndianDetails.value ? (rawIndianDetails.value as unknown as Record<string, unknown>).keyMetrics : null,
        source: rawIndianDetails.status === "fulfilled" ? "INDIAN_API" : "UPSTOX",
        retrievedAt: new Date().toISOString(),
      });
    }

    if (section === "financials") {
      // Fetch financial statements in parallel
      const [rawQuarters, rawAnnual, rawBS, rawCF] = await Promise.allSettled([
        getIndianFinancialStats(symbol, "quarter_results"),
        getIndianFinancialStats(symbol, "yoy_results"),
        getIndianFinancialStats(symbol, "balancesheet"),
        getIndianFinancialStats(symbol, "cashflow"),
      ]);

      let quarterlyResults: FinancialPeriod[] = [];
      let annualProfitLoss: FinancialPeriod[] = [];
      let balanceSheet: BalanceSheetPeriod[] = [];
      let cashFlow: CashFlowPeriod[] = [];

      try {
        if (rawQuarters.status === "fulfilled") {
          quarterlyResults = normalizeFinancialPeriods(rawQuarters.value);
        }
      } catch (err) {
        console.warn(`[Research API] ${symbol} quarterly results parse failed:`, err);
      }

      try {
        if (rawAnnual.status === "fulfilled") {
          annualProfitLoss = normalizeFinancialPeriods(rawAnnual.value);
        }
      } catch (err) {
        console.warn(`[Research API] ${symbol} annual profit loss parse failed:`, err);
      }

      try {
        if (rawBS.status === "fulfilled") {
          balanceSheet = normalizeBalanceSheet(rawBS.value);
        }
      } catch (err) {
        console.warn(`[Research API] ${symbol} balance sheet parse failed:`, err);
      }

      try {
        if (rawCF.status === "fulfilled") {
          cashFlow = normalizeCashFlow(rawCF.value);
        }
      } catch (err) {
        console.warn(`[Research API] ${symbol} cash flow parse failed:`, err);
      }

      // Calculate YoY and QoQ growth changes for Sales, Profit & Assets
      for (let i = 0; i < quarterlyResults.length; i++) {
        const cur = quarterlyResults[i];
        // YoY: match same quarter previous year (index - 4)
        if (i >= 4) {
          const prev = quarterlyResults[i - 4];
          cur.yoyGrowth = calculateGrowth(cur.sales, prev.sales);
        }
        // QoQ: match previous quarter (index - 1)
        if (i >= 1) {
          const prev = quarterlyResults[i - 1];
          cur.qoqGrowth = calculateGrowth(cur.sales, prev.sales);
        }
      }

      for (let i = 0; i < annualProfitLoss.length; i++) {
        const cur = annualProfitLoss[i];
        if (i >= 1) {
          const prev = annualProfitLoss[i - 1];
          cur.yoyGrowth = calculateGrowth(cur.sales, prev.sales);
        }
      }

      for (let i = 0; i < balanceSheet.length; i++) {
        const cur = balanceSheet[i];
        if (i >= 1) {
          const prev = balanceSheet[i - 1];
          cur.yoyGrowth = calculateGrowth(cur.totalAssets, prev.totalAssets);
        }
      }

      return NextResponse.json({
        quarterlyResults,
        annualProfitLoss,
        balanceSheet,
        cashFlow,
        retrievedAt: new Date().toISOString(),
      });
    }

    if (section === "shareholding") {
      let history: NormalizedShareholdingQuarter[] = [];
      try {
        const rawHistory = await getIndianFinancialStats(symbol, "shareholding_pattern_quarterly");
        history = normalizeShareholdingHistory(rawHistory);
      } catch (err) {
        console.warn(`[Research API] ${symbol} shareholding history parse failed:`, err);
      }

      return NextResponse.json({
        history,
        retrievedAt: new Date().toISOString(),
      });
    }

    if (section === "peers") {
      interface RawPeerCompany {
        tickerId?: string;
        companyName?: string;
        price?: number | string;
        marketCap?: number | string;
        priceToEarningsValueRatio?: number | string;
        priceToBookValueRatio?: number | string;
        returnOnAverageEquityTrailing12Month?: number | string;
        returnOnAverageEquity5YearAverage?: number | string;
        returnOnInvestmentTrailing12Month?: number | string;
        returnOnInvestment5YearAverage?: number | string;
        ltDebtPerEquityMostRecentFiscalYear?: number | string;
      }

      interface NormalizedPeerItem {
        symbol: string;
        isin: string;
        name: string;
        price: number | null;
        marketCap: number | null;
        pe: number | null;
        pb: number | null;
        roe: number | null;
        roce: number | null;
        debtToEquity: number | null;
      }

      let peerResults: NormalizedPeerItem[] = [];
      
      // Try to get peers list from main company details profile first
      try {
        const raw = await getIndianCompanyDetails(symbol);
        const profile = (raw.companyProfile || {}) as Record<string, unknown>;
        const rawPeersList = (profile.peerCompanyList || []) as RawPeerCompany[];

        if (Array.isArray(rawPeersList) && rawPeersList.length > 0) {
          const resolvePromises = rawPeersList.map(async (p: RawPeerCompany) => {
            const companyName = p.companyName || "";
            let resolvedSymbol = p.tickerId || "";
            let resolvedIsin = "";

            // If it is an internal S0... ID, dynamically resolve using Upstox search by company name
            if (resolvedSymbol.startsWith("S0") || !resolvedSymbol) {
              try {
                const searchResults = await searchInstruments(companyName);
                if (searchResults && searchResults.length > 0) {
                  // Find exact or closest match based on name inclusion
                  const bestMatch = searchResults.find(
                    (item) => item.name.toLowerCase().includes(companyName.toLowerCase()) ||
                              companyName.toLowerCase().includes(item.name.toLowerCase())
                  ) || searchResults[0];

                  resolvedSymbol = bestMatch.symbol;
                  resolvedIsin = bestMatch.isin || "";
                }
              } catch (searchErr) {
                console.warn(`[Peers Resolution] Failed to resolve name "${companyName}":`, searchErr);
              }
            }

            return {
              symbol: resolvedSymbol,
              isin: resolvedIsin,
              name: companyName,
              price: typeof p.price === "number" ? p.price : parseFloat(String(p.price || 0)) || null,
              marketCap: typeof p.marketCap === "number" ? p.marketCap : parseFloat(String(p.marketCap || 0)) || null,
              pe: typeof p.priceToEarningsValueRatio === "number" ? p.priceToEarningsValueRatio : parseFloat(String(p.priceToEarningsValueRatio || 0)) || null,
              pb: typeof p.priceToBookValueRatio === "number" ? p.priceToBookValueRatio : parseFloat(String(p.priceToBookValueRatio || 0)) || null,
              roe: typeof p.returnOnAverageEquityTrailing12Month === "number" ? p.returnOnAverageEquityTrailing12Month : parseFloat(String(p.returnOnAverageEquityTrailing12Month || p.returnOnAverageEquity5YearAverage || 0)) || null,
              roce: typeof p.returnOnInvestmentTrailing12Month === "number" ? p.returnOnInvestmentTrailing12Month : parseFloat(String(p.returnOnInvestmentTrailing12Month || p.returnOnInvestment5YearAverage || 0)) || null,
              debtToEquity: typeof p.ltDebtPerEquityMostRecentFiscalYear === "number" ? p.ltDebtPerEquityMostRecentFiscalYear : parseFloat(String(p.ltDebtPerEquityMostRecentFiscalYear || 0)) || null,
            };
          });

          peerResults = await Promise.all(resolvePromises);
        }
      } catch (err) {
        console.warn(`[Research API] Failed to extract peers from companyProfile:`, err);
      }

      // Fallback to PEER_MAP if no peers were extracted
      if (peerResults.length === 0) {
        const peersList = PEER_MAP[symbol] || [];
        const peerDataPromises = peersList.map(async (peerSym) => {
          try {
            const raw = await getIndianCompanyDetails(peerSym);
            const market = normalizeMarketSnapshot(raw);
            const ratios = normalizeRatios(raw);

            let isin = "";
            try {
              const instrument = await resolveSymbol(peerSym);
              if (instrument) isin = instrument.isin || "";
            } catch (err) {
              console.warn(`[Peers Fallback Resolution] Failed to resolve symbol ${peerSym}:`, err);
            }

            const getVal = (keys: string[]): number | null => {
              for (const k of keys) {
                const val = getMetricValue(raw.keyMetrics, k);
                if (val !== null) return val;
              }
              return null;
            };

            return {
              symbol: peerSym,
              name: raw.companyName || peerSym,
              isin,
              price: market.priceNse || market.priceBse || null,
              marketCap: getVal(["marketCap", "marketcap", "mcap"]),
              pe: ratios.pe,
              pb: ratios.pb,
              roe: ratios.roe,
              roce: ratios.roce,
              debtToEquity: ratios.debtToEquity,
            };
          } catch (err) {
            console.warn(`[Research API] Peer ${peerSym} load failed:`, err);
            return null;
          }
        });

        peerResults = (await Promise.all(peerDataPromises)).filter((p): p is NonNullable<typeof p> => p !== null);
      }

      // Log missing metrics in development
      if (process.env.NODE_ENV === "development") {
        peerResults.forEach((p) => {
          const metricsToCheck: (keyof NormalizedPeerItem)[] = ["price", "marketCap", "pe", "pb", "roe", "roce", "debtToEquity"];
          metricsToCheck.forEach((m) => {
            if (p[m] === null || p[m] === undefined) {
              const label = m === "debtToEquity" ? "D/E" : String(m).toUpperCase();
              console.log(`[Peers] Missing ${label} for ${p.name}`);
            }
          });
        });
      }

      // Compute medians
      const medians = {
        pe: calculateMedian(peerResults.map((p) => p.pe)),
        pb: calculateMedian(peerResults.map((p) => p.pb)),
        roe: calculateMedian(peerResults.map((p) => p.roe)),
        roce: calculateMedian(peerResults.map((p) => p.roce)),
        debtToEquity: calculateMedian(peerResults.map((p) => p.debtToEquity)),
      };

      return NextResponse.json({
        peers: peerResults,
        medians,
        retrievedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: `Unsupported section ${section}` }, { status: 400 });
  } catch (error: unknown) {
    console.error("[Research API Error]:", error);
    const message = (error as Error).message || "An unexpected error occurred retrieving research details.";
    const status = (error as { status?: number }).status || 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
