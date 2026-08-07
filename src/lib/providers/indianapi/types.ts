
export interface RawIndianCompanyDetails {
  tickerId?: string | null;
  companyName: string;
  industry?: string | null;
  companyProfile?: unknown;
  currentPrice?: unknown;
  percentChange?: number | string | null;
  yearHigh?: number | string | null;
  yearLow?: number | string | null;
  keyMetrics?: unknown;
  shareholding?: unknown;
  stockCorporateActionData?: unknown;
  recentNews?: unknown;
}

export type RawIndianHistoricalStats = Record<string, Record<string, number | null>>;

// Normalized Internal Types
export interface NormalizedCompanyIdentity {
  tickerId: string;
  companyName: string;
  industry: string;
  description: string;
  isin: string;
  logoUrl: string | null;
  website: string | null;
}

export interface NormalizedMarketSnapshot {
  priceBse: number | null;
  priceNse: number | null;
  percentChange: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  freshness: "LIVE" | "DELAYED" | "REPORTED";
  updatedAt: string;
}

export interface FinancialPeriod {
  period: string; // e.g. "Jun 2025" or "FY2026"
  sales: number | null;
  expenses: number | null;
  operatingProfit: number | null;
  opmPercent: number | null;
  otherIncome: number | null;
  interest: number | null;
  depreciation: number | null;
  profitBeforeTax: number | null;
  taxPercent: number | null;
  netProfit: number | null;
  eps: number | null;
  dividendPayoutPercent?: number | null;
  yoyGrowth?: number | null;
  qoqGrowth?: number | null;
}

export interface BalanceSheetPeriod {
  period: string;
  equityCapital: number | null;
  reserves: number | null;
  borrowings: number | null;
  otherLiabilities: number | null;
  totalLiabilities: number | null;
  fixedAssets: number | null;
  cwip: number | null;
  investments: number | null;
  otherAssets: number | null;
  totalAssets: number | null;
  yoyGrowth?: number | null;
}

export interface CashFlowPeriod {
  period: string;
  operatingCashFlow: number | null;
  investingCashFlow: number | null;
  financingCashFlow: number | null;
  netCashFlow: number | null;
}

export interface NormalizedShareholdingQuarter {
  period: string;
  promoter: number | null;
  fii: number | null;
  dii: number | null;
  public: number | null;
  pledgedPercent?: number | null;
}

export interface NormalizedRatios {
  pe: number | null;
  pb: number | null;
  evebitda: number | null;
  priceToSales: number | null;
  dividendYield: number | null;
  roe: number | null;
  roce: number | null;
  roa: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  interestCoverage: number | null;
}

export interface NormalizedPeerItem {
  symbol: string;
  name: string;
  price: number | null;
  marketCap: number | null;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
}

export interface NormalizedCorporateAction {
  type: "DIVIDEND" | "SPLIT" | "BONUS" | "RIGHTS" | "BUYBACK" | "OTHER";
  detail: string;
  exDate: string | null;
}

export interface NormalizedAnnouncement {
  title: string;
  date: string;
  category: string;
  sourceUrl: string | null;
}

export interface NormalizedStockResearchData {
  company: NormalizedCompanyIdentity;
  market: NormalizedMarketSnapshot;
  quarterlyResults: FinancialPeriod[];
  annualProfitLoss: FinancialPeriod[];
  balanceSheet: BalanceSheetPeriod[];
  cashFlow: CashFlowPeriod[];
  ratios: NormalizedRatios;
  shareholding: {
    latest: {
      promoters: number | null;
      fii: number | null;
      dii: number | null;
      public: number | null;
    };
    history: NormalizedShareholdingQuarter[];
  };
  peers: NormalizedPeerItem[];
  corporateActions: NormalizedCorporateAction[];
  announcements: NormalizedAnnouncement[];
  source: "INDIAN_API";
  retrievedAt: string;
}

export interface RawIndianCompanyLogo {
  content_type: string;
  base64_image: string;
}
