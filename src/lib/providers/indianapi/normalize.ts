import {
  RawIndianCompanyDetails,
  RawIndianHistoricalStats,
  NormalizedCompanyIdentity,
  NormalizedMarketSnapshot,
  NormalizedRatios,
  NormalizedCorporateAction,
  NormalizedAnnouncement,
  FinancialPeriod,
  BalanceSheetPeriod,
  CashFlowPeriod,
  NormalizedShareholdingQuarter
} from "./types";

/**
 * Parses date periods like "Jun 2021" or "Mar 2022" or "FY26" into Date objects for sorting.
 */
export function parsePeriodToDate(period: string): Date {
  const clean = period.trim();
  const parts = clean.split(/\s+/);
  
  if (parts.length === 1) {
    // E.g. "FY2026" or "2026" or "FY26"
    const num = parseInt(parts[0].replace(/[^0-9]/g, ""), 10);
    const year = num < 100 ? 2000 + num : num;
    return new Date(year, 2, 31); // March 31 of fiscal year
  }

  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  const mStr = parts[0].toLowerCase().substring(0, 3);
  const month = monthMap[mStr] !== undefined ? monthMap[mStr] : 0;
  const year = parseInt(parts[1], 10);
  return new Date(year, month, 15);
}

/**
 * Helper to extract values from stats object using term aliases.
 */
function findValue(
  stats: RawIndianHistoricalStats,
  aliases: string[],
  period: string
): number | null {
  const matchKey = Object.keys(stats).find((key) => {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    return aliases.some(
      (alias) => cleanKey.includes(alias.toLowerCase().replace(/[^a-z0-9]/g, ""))
    );
  });

  if (!matchKey) return null;
  const val = stats[matchKey]?.[period];
  return val !== undefined ? val : null;
}

/**
 * Collects and chronologically sorts all unique periods from the stats categories.
 */
function getSortedPeriods(stats: RawIndianHistoricalStats): string[] {
  const periods = new Set<string>();
  Object.values(stats).forEach((metricData) => {
    if (metricData) {
      Object.keys(metricData).forEach((p) => periods.add(p));
    }
  });

  return Array.from(periods).sort((a, b) => {
    const dateA = parsePeriodToDate(a);
    const dateB = parsePeriodToDate(b);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Helper to lookup metric values from flat objects or nested keyMetrics groups, supporting single key or alias array
 */
export function getMetricValue(keyMetrics: unknown, keyName: string | string[]): number | null {
  if (!keyMetrics || typeof keyMetrics !== "object") return null;
  const targets = (Array.isArray(keyName) ? keyName : [keyName]).map((k) =>
    k.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  const metrics = keyMetrics as Record<string, unknown>;

  // 1. Direct flat object properties
  for (const k of Object.keys(metrics)) {
    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (targets.includes(cleanK)) {
      const val = metrics[k];
      if (val !== undefined && val !== null && val !== "null") {
        const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ""));
        if (!isNaN(num)) return num;
      }
    }
  }

  // 2. Nested category arrays: { valuation: [{ key: "marketCap", value: "1770000" }] }
  for (const cat of Object.keys(metrics)) {
    const items = metrics[cat];
    if (Array.isArray(items)) {
      for (const item of items) {
        const it = item as Record<string, unknown>;
        if (!it || !it.key) continue;
        const currentKey = String(it.key).toLowerCase().replace(/[^a-z0-9]/g, "");
        if (targets.includes(currentKey)) {
          if (it.value !== undefined && it.value !== null && it.value !== "null") {
            const num = typeof it.value === "number" ? it.value : parseFloat(String(it.value).replace(/[^0-9.-]/g, ""));
            if (!isNaN(num)) return num;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Normalize Company Identity metadata
 */
export function normalizeCompanyIdentity(
  raw: RawIndianCompanyDetails
): NormalizedCompanyIdentity {
  const profile = (raw.companyProfile || {}) as Record<string, unknown>;
  return {
    tickerId: raw.tickerId || "",
    companyName: raw.companyName,
    industry: raw.industry || (profile.mgIndustry as string) || "N/A",
    description: (profile.companyDescription as string) || "No description available.",
    isin: (profile.isInId as string) || "",
    logoUrl: null,
    website: null,
  };
}

/**
 * Normalize current price market snapshot
 */
export function normalizeMarketSnapshot(
  raw: RawIndianCompanyDetails
): NormalizedMarketSnapshot {
  const getPrice = (val: unknown): number | null => {
    if (val === undefined || val === null) return null;
    const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? null : num;
  };

  const current = (raw.currentPrice || {}) as Record<string, unknown>;
  const priceBse = current ? getPrice(current.BSE) : null;
  const priceNse = current ? getPrice(current.NSE) : null;

  // 52-Week High / Low MUST come from keyMetrics or raw 52W fields, NEVER intraday!
  const high52W = getMetricValue(raw.keyMetrics, ["52WeekHigh", "yearHigh", "fiftyTwoWeekHigh"]) ?? getPrice(raw.yearHigh);
  const low52W = getMetricValue(raw.keyMetrics, ["52WeekLow", "yearLow", "fiftyTwoWeekLow"]) ?? getPrice(raw.yearLow);

  return {
    priceBse,
    priceNse,
    percentChange: getPrice(raw.percentChange),
    yearHigh: high52W,
    yearLow: low52W,
    freshness: "DELAYED",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Normalize fundamental ratios
 */
export function normalizeRatios(raw: RawIndianCompanyDetails): NormalizedRatios {
  const getMetric = (keys: string[]): number | null => {
    return getMetricValue(raw.keyMetrics, keys);
  };

  return {
    pe: getMetric(["pPerEBasicExcludingExtraordinaryItemsTTM", "pPerEIncludingExtraordinaryItemsTTM", "pPerEExcludingExtraordinaryItemsMostRecentFiscalYearQuarter", "pPerENormalizedMostRecentFiscalYear", "pe", "peRatio"]),
    pb: getMetric(["priceToBookMostRecentQuarter", "priceToBookMostRecentFiscalYear", "priceToBook", "pb"]),
    bookValue: getMetric(["bookValuePerShareMostRecentQuarter", "bookValuePerShareMostRecentFiscalYear", "bookValuePerShare", "bookValue"]),
    evebitda: getMetric(["currentEVPerEBITDATrailing12Months", "currentEVPerEBITDALFY", "enterpriseValueToEBITDA", "evebitda"]),
    priceToSales: getMetric(["priceToSalesTrailing12Month", "priceToSalesMostRecentFiscalYear", "priceToSales"]),
    dividendYield: getMetric(["dividendYieldIndicatedAnnualDividendDividedByClosingprice", "currentDividendYieldCommonStockPrimaryIssueLTM", "dividendYield"]),
    roe: getMetric(["returnOnAverageEquityTrailing12Month", "returnOnAverageEquityMostRecentFiscalYear", "roe"]),
    roce: getMetric(["returnOnInvestmentTrailing12Month", "returnOnInvestmentMostRecentFiscalYear", "roce"]),
    roa: getMetric(["returnOnAverageAssetsTrailing12Month", "returnOnAverageAssetsMostRecenFiscalYear", "roa"]),
    debtToEquity: getMetric(["totalDebtPerTotalEquityMostRecentQuarter", "totalDebtPerTotalEquityMostRecentFiscalYear", "debtToEquity"]),
    currentRatio: getMetric(["currentRatioMostRecentQuarter", "currentRatioMostRecentFiscalYear", "currentRatio"]),
    quickRatio: getMetric(["quickRatioMostRecentQuarter", "quickRatioMostRecentFiscalYear", "quickRatio"]),
    interestCoverage: getMetric(["netInterestCoverageTrailing12Month", "netInterestCoverageMostRecentFiscalYear", "interestCoverage"]),
  };
}

/**
 * Normalize Corporate Actions lists
 */
export function normalizeCorporateActions(
  raw: RawIndianCompanyDetails
): NormalizedCorporateAction[] {
  const actions: NormalizedCorporateAction[] = [];
  const actionData = raw.stockCorporateActionData as Record<string, unknown>;

  if (actionData && typeof actionData === "object") {
    const divData = actionData.dividend || actionData.dividends;
    if (Array.isArray(divData)) {
      divData.forEach((d: unknown) => {
        if (d && typeof d === "object") {
          const item = d as Record<string, unknown>;
          actions.push({
            type: "DIVIDEND",
            detail: `${item.dividendType || "Dividend"}: ₹${item.amount ?? ""}`,
            exDate: (item.exDate as string) || null,
          });
        }
      });
    }

    const splitData = actionData.splits || actionData.split;
    if (Array.isArray(splitData)) {
      splitData.forEach((s: unknown) => {
        if (s && typeof s === "object") {
          const item = s as Record<string, unknown>;
          actions.push({
            type: "SPLIT",
            detail: `Stock Split ratio ${item.splitRatio ?? ""}`,
            exDate: (item.exDate as string) || null,
          });
        }
      });
    }

    const bonusData = actionData.bonus || actionData.bonuses;
    if (Array.isArray(bonusData)) {
      bonusData.forEach((b: unknown) => {
        if (b && typeof b === "object") {
          const item = b as Record<string, unknown>;
          actions.push({
            type: "BONUS",
            detail: `Bonus shares ratio ${item.bonusRatio ?? ""}`,
            exDate: (item.exDate as string) || null,
          });
        }
      });
    }

    const boardData = actionData.boardMeetings || actionData.boardMeeting;
    if (Array.isArray(boardData)) {
      boardData.forEach((b: unknown) => {
        if (b && typeof b === "object") {
          const item = b as Record<string, unknown>;
          actions.push({
            type: "OTHER",
            detail: `Board Meeting: ${item.purpose || "General updates"}`,
            exDate: (item.meetingDate as string) || (item.exDate as string) || null,
          });
        }
      });
    }

    const agmData = actionData.annualGeneralMeeting;
    if (Array.isArray(agmData)) {
      agmData.forEach((a: unknown) => {
        if (a && typeof a === "object") {
          const item = a as Record<string, unknown>;
          actions.push({
            type: "OTHER",
            detail: `AGM: ${item.purpose || "Annual General Meeting"}`,
            exDate: (item.agmDate as string) || (item.exDate as string) || null,
          });
        }
      });
    }
  }

  return actions.sort((a, b) => {
    if (!a.exDate) return 1;
    if (!b.exDate) return -1;
    return new Date(b.exDate).getTime() - new Date(a.exDate).getTime(); // Newest first
  });
}
export function cleanHtmlText(text: string | null | undefined): string {
  if (!text) return "";
  let cleaned = text.replace(/<[^>]*>/g, "");
  cleaned = cleaned
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  return cleaned.trim();
}

/**
 * Resolves explicit, verified publisher-domain mapping based on source/publisher name.
 */
function getPublisherDomain(article: Record<string, unknown>): string | null {
  const explicitDomain = (article.domain as string) || (article.publisherDomain as string);
  if (explicitDomain && (explicitDomain.startsWith("http://") || explicitDomain.startsWith("https://"))) {
    return explicitDomain.trim();
  }

  const source = String(article.source || article.publisher || "").toLowerCase();
  const domainMap: Record<string, string> = {
    "livemint": "https://www.livemint.com",
    "mint": "https://www.livemint.com",
    "moneycontrol": "https://www.moneycontrol.com",
    "economic times": "https://economictimes.indiatimes.com",
    "et": "https://economictimes.indiatimes.com",
    "business standard": "https://www.business-standard.com",
    "cnbc": "https://www.cnbctv18.com",
  };

  for (const key in domainMap) {
    if (source.includes(key)) {
      return domainMap[key];
    }
  }

  return null;
}

/**
 * Normalizes external article URLs securely.
 * Rejects invalid protocols and returns null if a trustworthy domain is not found.
 */
export function normalizeExternalArticleUrl(article: Record<string, unknown>): string | null {
  const rawUrl = (article.url as string) || (article.link as string) || (article.sourceUrl as string) || (article.articleUrl as string) || (article.path as string) || null;
  if (!rawUrl) return null;

  const cleanedUrl = rawUrl.trim();

  // CASE 1: Absolute URL
  if (/^https?:\/\//i.test(cleanedUrl)) {
    try {
      const parsed = new URL(cleanedUrl);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
    } catch {
      return null;
    }
    return null;
  }

  // Reject invalid protocols
  if (/^(javascript|data|file|blob|chrome|about):/i.test(cleanedUrl)) {
    return null;
  }

  // CASE 2: Relative URL + Trustworthy Source Domain
  let domain = getPublisherDomain(article);

  // If path contains 'mark-to-market' or 'livemint', we can resolve it to Livemint as a verified mapping
  if (!domain && (cleanedUrl.includes("mark-to-market") || cleanedUrl.includes("livemint"))) {
    domain = "https://www.livemint.com";
  }

  if (!domain) {
    // CASE 3: Relative URL without reliable domain -> return null
    return null;
  }

  try {
    const resolvedUrl = new URL(cleanedUrl.startsWith("/") ? cleanedUrl : `/${cleanedUrl}`, domain).toString();
    const parsed = new URL(resolvedUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Normalize Announcements and News
 */
export function normalizeAnnouncements(
  raw: RawIndianCompanyDetails
): NormalizedAnnouncement[] {
  const news = raw.recentNews;
  if (!Array.isArray(news)) return [];
  return news.map((item: unknown) => {
    const it = item as Record<string, unknown>;
    const sourceUrl = normalizeExternalArticleUrl(it);

    return {
      title: cleanHtmlText((it.headline as string) || "Announcement"),
      date: (it.date as string) || new Date().toISOString(),
      category: (it.source as string) || "Corporate Action",
      sourceUrl,
    };
  });
}


/**
 * Parse latest shareholding from details payload array
 */
export function normalizeLatestShareholding(rawShareholding: unknown) {
  const result = { promoters: null as number | null, fii: null as number | null, dii: null as number | null, public: null as number | null };
  if (!Array.isArray(rawShareholding)) return result;

  const findValue = (displayName: string): number | null => {
    const cat = rawShareholding.find((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const it = item as Record<string, unknown>;
      return typeof it.displayName === "string" && it.displayName.toLowerCase().includes(displayName.toLowerCase());
    }) as Record<string, unknown> | undefined;

    if (cat && Array.isArray(cat.categories) && cat.categories.length > 0) {
      const latestValObj = cat.categories[cat.categories.length - 1] as Record<string, unknown>;
      if (latestValObj && latestValObj.value !== undefined && latestValObj.value !== null && latestValObj.value !== "null") {
        const num = parseFloat(String(latestValObj.value).replace(/[^0-9.-]/g, ""));
        if (!isNaN(num)) return num;
      }
    }
    return null;
  };

  return {
    promoters: findValue("Promoter"),
    fii: findValue("FII"),
    dii: findValue("MF") || findValue("DII"),
    public: findValue("Other") || findValue("Public")
  };
}

/**
 * Normalize Financial Periods (Income Statement / Quarterly Results)
 */
export function normalizeFinancialPeriods(
  stats: RawIndianHistoricalStats
): FinancialPeriod[] {
  const periods = getSortedPeriods(stats);

  return periods.map((period) => {
    const sales = findValue(stats, ["sales", "revenue", "revenuefromoperations"], period);
    const expenses = findValue(stats, ["expenses", "totalexpenses"], period);
    const operatingProfit = findValue(stats, ["operatingprofit", "op"], period);
    const opmPercent = findValue(stats, ["opm", "operatingmargin"], period);
    const otherIncome = findValue(stats, ["otherincome"], period);
    const interest = findValue(stats, ["interest", "financecosts"], period);
    const depreciation = findValue(stats, ["depreciation", "amortization"], period);
    const profitBeforeTax = findValue(stats, ["profitbeforetax", "pbt", "pretaxprofit"], period);
    const taxPercent = findValue(stats, ["taxpercent", "tax"], period);
    const netProfit = findValue(stats, ["netprofit", "pat", "profitaftertax"], period);
    const eps = findValue(stats, ["eps", "earningspershare"], period);
    const dividendPayoutPercent = findValue(stats, ["dividendpayout"], period);

    return {
      period,
      sales,
      expenses,
      operatingProfit,
      opmPercent,
      otherIncome,
      interest,
      depreciation,
      profitBeforeTax,
      taxPercent,
      netProfit,
      eps,
      dividendPayoutPercent,
    };
  });
}

/**
 * Normalize Balance Sheet history
 */
export function normalizeBalanceSheet(
  stats: RawIndianHistoricalStats
): BalanceSheetPeriod[] {
  const periods = getSortedPeriods(stats);

  return periods.map((period) => {
    const equityCapital = findValue(stats, ["equitycapital", "sharecapital"], period);
    const reserves = findValue(stats, ["reserves", "retainedearnings", "otherequity"], period);
    const borrowings = findValue(stats, ["borrowings", "debt", "totaldebt"], period);
    const otherLiabilities = findValue(stats, ["otherliabilities", "currentliabilities"], period);
    const totalLiabilities = findValue(stats, ["totalliabilities"], period);
    const fixedAssets = findValue(stats, ["fixedassets", "propertyplant", "ppe"], period);
    const cwip = findValue(stats, ["cwip", "capitalworkinprogress"], period);
    const investments = findValue(stats, ["investments", "noncurrentinvestments"], period);
    const otherAssets = findValue(stats, ["otherassets", "currentassets"], period);
    const totalAssets = findValue(stats, ["totalassets"], period);

    return {
      period,
      equityCapital,
      reserves,
      borrowings,
      otherLiabilities,
      totalLiabilities,
      fixedAssets,
      cwip,
      investments,
      otherAssets,
      totalAssets,
    };
  });
}

/**
 * Normalize Cash Flow history
 */
export function normalizeCashFlow(stats: RawIndianHistoricalStats): CashFlowPeriod[] {
  const periods = getSortedPeriods(stats);

  return periods.map((period) => {
    const operatingCashFlow = findValue(stats, ["operatingcashflow", "cashfromoperating", "operatingactivities"], period);
    const investingCashFlow = findValue(stats, ["investingcashflow", "cashfrominvesting", "investingactivities"], period);
    const financingCashFlow = findValue(stats, ["financingcashflow", "cashfromfinancing", "financingactivities"], period);
    const netCashFlow = findValue(stats, ["netcashflow", "netchangeincash"], period);

    return {
      period,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
    };
  });
}

/**
 * Normalize shareholding history quarters
 */
export function normalizeShareholdingHistory(
  stats: RawIndianHistoricalStats
): NormalizedShareholdingQuarter[] {
  const periods = getSortedPeriods(stats);

  return periods.map((period) => {
    const promoter = findValue(stats, ["promoters", "promoter"], period);
    const fii = findValue(stats, ["fii", "fiis", "foreigninstitutional"], period);
    const dii = findValue(stats, ["dii", "diis", "domesticinstitutional"], period);
    const publicHold = findValue(stats, ["public", "others"], period);
    const pledgedPercent = findValue(stats, ["pledged", "promoterpledged"], period);

    return {
      period,
      promoter,
      fii,
      dii,
      public: publicHold,
      pledgedPercent,
    };
  });
}
