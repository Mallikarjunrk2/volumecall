"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { 
  ArrowUpRight, ArrowDownRight, Calendar, ShieldAlert, Info, ChevronRight, Sparkles, Bookmark, BookmarkCheck, Lock
} from "lucide-react";
import { formatCurrency, formatPercent, formatIndianNumber, formatDate } from "@/lib/stocks/formatting";
import InteractiveChart from "./InteractiveChart";
import { getMetricValue } from "@/lib/providers/indianapi/normalize";
import VolumeCallAIDrawer from "./VolumeCallAIDrawer";
import { CompanyLogo } from "./CompanyLogo";
import { LoginRequiredModal, LoginReason } from "@/components/auth/LoginRequiredModal";

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  dma50?: number | null;
  dma200?: number | null;
}

interface CorporateAction {
  type: string;
  detail: string;
  exDate: string | null;
}

interface Announcement {
  category: string;
  title: string;
  date: string;
  sourceUrl: string | null;
}

interface OverviewData {
  company?: {
    tickerId: string;
    companyName: string;
    industry: string;
    description: string;
    isin: string;
  };
  market?: {
    priceBse: number | null;
    priceNse: number | null;
    percentChange: number | null;
    yearHigh: number | null;
    yearLow: number | null;
    freshness: string;
    updatedAt: string;
  };
  ratios: Record<string, number | null>;
  shareholdingLatest?: {
    promoters: number | null;
    fii: number | null;
    dii: number | null;
    public: number | null;
  };
  corporateActions: CorporateAction[];
  announcements: Announcement[];
  keyMetrics?: unknown;
  latestFinancials?: {
    revenue: number | null;
    netProfit: number | null;
    eps: number | null;
    operatingMargin: number | null;
    revenueGrowth: number | null;
    profitGrowth: number | null;
  };
  cagr?: {
    rev3Y: number | null;
    rev5Y: number | null;
    prof3Y: number | null;
    prof5Y: number | null;
  };
}

interface FinancialPeriod {
  period: string;
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

interface BalanceSheetPeriod {
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

interface CashFlowPeriod {
  period: string;
  operatingCashFlow: number | null;
  investingCashFlow: number | null;
  financingCashFlow: number | null;
  netCashFlow: number | null;
}

interface FinancialsData {
  quarterlyResults: FinancialPeriod[];
  annualProfitLoss: FinancialPeriod[];
  balanceSheet: BalanceSheetPeriod[];
  cashFlow: CashFlowPeriod[];
}

interface ShareholdingQuarter {
  period: string;
  promoter: number | null;
  fii: number | null;
  dii: number | null;
  public: number | null;
  pledgedPercent: number | null;
}

interface ShareholdingData {
  history: ShareholdingQuarter[];
}

interface PeerItem {
  symbol: string;
  name: string;
  isin?: string | null;
  price: number | null;
  marketCap: string | number | null;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
}

interface PeersData {
  peers: PeerItem[];
  medians: {
    pe: number | null;
    pb: number | null;
    roe: number | null;
    roce: number | null;
    debtToEquity: number | null;
  };
}

interface AnalysisData {
  overallInterpretation: string;
  businessSnapshot: string;
  valuation: string;
  profitability: string;
  growth: string;
  financialHealth: string;
  shareholding: string;
  watchpoints: string;
  disclosure: string;
}

interface StockResearchClientProps {
  symbol: string;
  exchange: string;
  isin: string;
  name: string;
  initialCandles: Candle[];
}

const safeJsonParse = async (res: Response) => {
  const text = await res.text();
  if (!text || text.trim() === "") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const isImportantRow = (name: string) => {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, "");
  return [
    "revenue",
    "sales",
    "operatingprofit",
    "profitbeforetax",
    "netprofit",
    "totalassets",
    "totalliabilities",
    "netcashflow"
  ].includes(normalized);
};

export function StockResearchClient({
  symbol,
  exchange,
  isin,
  name,
  initialCandles,
}: StockResearchClientProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const tabContainerRef = useRef<HTMLDivElement>(null);

  // Modal & Auth Gating State
  const [isGated, setIsGated] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalReason, setLoginModalReason] = useState<LoginReason>("stock_limit");

  // Watchlist State
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [watchlistSaving, setWatchlistSaving] = useState(false);

  // Auto-scroll the active tab into view on mobile
  useEffect(() => {
    if (tabContainerRef.current) {
      const activeBtn = tabContainerRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeTab]);

  // Check Watchlist status on mount
  useEffect(() => {
    let active = true;
    fetch(`/api/stocks/${symbol}/watchlist-status`)
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          if (data?.authenticated) {
            setIsAuthenticated(true);
            setInWatchlist(Boolean(data.inWatchlist));
          } else {
            setIsAuthenticated(false);
            setInWatchlist(false);
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [symbol]);

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      setLoginModalReason("watchlist");
      setLoginModalOpen(true);
      return;
    }

    if (watchlistSaving) return;
    const nextState = !inWatchlist;
    setInWatchlist(nextState);
    setWatchlistSaving(true);

    try {
      const res = await fetch("/api/stocks/watchlist", {
        method: nextState ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      if (!res.ok) throw new Error("Failed to update watchlist");
    } catch {
      // Revert state on error
      setInWatchlist(!nextState);
    } finally {
      setWatchlistSaving(false);
    }
  };

  // Section States
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [financials, setFinancials] = useState<FinancialsData | null>(null);
  const [shareholding, setShareholding] = useState<ShareholdingData | null>(null);
  const [peers, setPeers] = useState<PeersData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  // Loading States
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [loadingShareholding, setLoadingShareholding] = useState(false);
  const [loadingPeers, setLoadingPeers] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Error States
  const [errorOverview, setErrorOverview] = useState<string | null>(null);
  const [errorFinancials, setErrorFinancials] = useState<string | null>(null);
  const [errorShareholding, setErrorShareholding] = useState<string | null>(null);
  const [errorPeers, setErrorPeers] = useState<string | null>(null);
  const [errorAnalysis, setErrorAnalysis] = useState<string | null>(null);

  // Toggles
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [growthMode, setGrowthMode] = useState<"value" | "yoy" | "qoq">("value");
  const [activeRatioTooltip, setActiveRatioTooltip] = useState<string | null>(null);

  const triggerGate = () => {
    setIsGated(true);
    setLoginModalReason("stock_limit");
    setLoginModalOpen(true);
  };

  // Prefetch AI analysis on hover
  const prefetchAnalysis = async () => {
    if (analysis || loadingAnalysis || errorAnalysis || isGated) return;
    setLoadingAnalysis(true);
    setErrorAnalysis(null);
    try {
      const res = await fetch(`/api/stocks/${symbol}/analysis`, { cache: "no-store" });
      if (res.status === 403) {
        triggerGate();
        throw new Error("LOGIN_REQUIRED");
      }
      if (!res.ok) throw new Error("Failed to generate AI trend analysis.");
      const data = await safeJsonParse(res);
      setAnalysis(data);
    } catch (err: unknown) {
      if ((err as Error).message !== "LOGIN_REQUIRED") {
        setErrorAnalysis((err as Error).message || "AI Analysis summary is temporarily unavailable.");
      }
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Load overview on mount
  useEffect(() => {
    let active = true;
    const loadOverview = async () => {
      setLoadingOverview(true);
      setErrorOverview(null);
      try {
        const res = await fetch(`/api/stocks/${symbol}/research?section=overview`, { cache: "no-store" });
        if (res.status === 403) {
          if (active) {
            triggerGate();
            setErrorOverview("Guest stock limit reached. Sign in with Google to continue.");
          }
          return;
        }
        if (!res.ok) throw new Error("Failed to load overview snapshot.");
        const data = await safeJsonParse(res);
        if (active) setOverview(data);
      } catch (err: unknown) {
        if (active) setErrorOverview((err as Error).message || "Unable to retrieve company overview.");
      } finally {
        if (active) setLoadingOverview(false);
      }
    };

    loadOverview();

    return () => {
      active = false;
    };
  }, [symbol]);

  // Load sections progressively when tabs are visited
  useEffect(() => {
    let active = true;

    const loadFinancials = async () => {
      setLoadingFinancials(true);
      setErrorFinancials(null);
      try {
        const res = await fetch(`/api/stocks/${symbol}/research?section=financials`, { cache: "no-store" });
        if (res.status === 403) {
          if (active) triggerGate();
          return;
        }
        if (!res.ok) throw new Error("Failed to load financial statements.");
        const data = await safeJsonParse(res);
        if (active) setFinancials(data);
      } catch (err: unknown) {
        if (active) setErrorFinancials((err as Error).message || "Financial statements are temporarily unavailable.");
      } finally {
        if (active) setLoadingFinancials(false);
      }
    };

    const loadShareholding = async () => {
      setLoadingShareholding(true);
      setErrorShareholding(null);
      try {
        const res = await fetch(`/api/stocks/${symbol}/research?section=shareholding`, { cache: "no-store" });
        if (res.status === 403) {
          if (active) triggerGate();
          return;
        }
        if (!res.ok) throw new Error("Failed to load shareholding history.");
        const data = await safeJsonParse(res);
        if (active) setShareholding(data);
      } catch (err: unknown) {
        if (active) setErrorShareholding((err as Error).message || "Shareholding details are temporarily unavailable.");
      } finally {
        if (active) setLoadingShareholding(false);
      }
    };

    const loadPeers = async () => {
      setLoadingPeers(true);
      setErrorPeers(null);
      try {
        const res = await fetch(`/api/stocks/${symbol}/research?section=peers`, { cache: "no-store" });
        if (res.status === 403) {
          if (active) triggerGate();
          return;
        }
        if (!res.ok) throw new Error("Failed to resolve industry peers.");
        const data = await safeJsonParse(res);
        if (active) setPeers(data);
      } catch (err: unknown) {
        if (active) setErrorPeers((err as Error).message || "Peer comparison data is temporarily unavailable.");
      } finally {
        if (active) setLoadingPeers(false);
      }
    };

    const loadAnalysis = async () => {
      setLoadingAnalysis(true);
      setErrorAnalysis(null);
      try {
        const res = await fetch(`/api/stocks/${symbol}/analysis`, { cache: "no-store" });
        if (res.status === 403) {
          if (active) triggerGate();
          return;
        }
        if (!res.ok) throw new Error("Failed to generate AI trend analysis.");
        const data = await safeJsonParse(res);
        if (active) setAnalysis(data);
      } catch (err: unknown) {
        if (active) setErrorAnalysis((err as Error).message || "AI Analysis summary is temporarily unavailable.");
      } finally {
        if (active) setLoadingAnalysis(false);
      }
    };

    if (activeTab === "quarters" || activeTab === "pnl" || activeTab === "balance" || activeTab === "cashflow") {
      if (!financials && !loadingFinancials && !errorFinancials) {
        loadFinancials();
      }
    } else if (activeTab === "investors") {
      if (!shareholding && !loadingShareholding && !errorShareholding) {
        loadShareholding();
      }
    } else if (activeTab === "peers") {
      if (!peers && !loadingPeers && !errorPeers) {
        loadPeers();
      }
    } else if (activeTab === "analysis") {
      if (!analysis && !loadingAnalysis && !errorAnalysis) {
        loadAnalysis();
      }
    }

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, symbol]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analysis", label: "Analysis" },
    { id: "peers", label: "Peers" },
    { id: "quarters", label: "Quarterly Results" },
    { id: "pnl", label: "Profit & Loss" },
    { id: "balance", label: "Balance Sheet" },
    { id: "cashflow", label: "Cash Flow" },
    { id: "ratios", label: "Ratios" },
    { id: "investors", label: "Investors" },
    { id: "documents", label: "Documents" },
  ];

  // Price parameters
  const currentPrice = overview?.market?.priceNse || overview?.market?.priceBse || 0;
  const changePercent = overview?.market?.percentChange || 0;
  const isPos = changePercent >= 0;

  // SVG Donut segments calculations
  const renderDonutChart = (promoter: number, fii: number, dii: number, pub: number) => {
    const total = promoter + fii + dii + pub;
    if (total === 0) return null;

    const r = 50;
    const circ = 2 * Math.PI * r;

    let currentOffset = 0;
    const getStroke = (val: number) => {
      const pct = (val / total) * 100;
      const strokeDash = `${(pct / 100) * circ} ${circ}`;
      const strokeOffset = circ - currentOffset;
      currentOffset += (pct / 100) * circ;
      return { strokeDash, strokeOffset };
    };

    const pSeg = getStroke(promoter);
    const fSeg = getStroke(fii);
    const dSeg = getStroke(dii);
    const oSeg = getStroke(pub);

    return (
      <svg width="100%" height="100%" viewBox="0 0 160 160" className="transform -rotate-90">
        <circle cx="80" cy="80" r={r} fill="transparent" stroke="var(--border)" strokeWidth="18" className="opacity-10" />
        {promoter > 0 && (
          <circle cx="80" cy="80" r={r} fill="transparent" stroke="#0F766E" strokeWidth="18" 
            strokeDasharray={pSeg.strokeDash} strokeDashoffset={pSeg.strokeOffset} strokeLinecap="round" />
        )}
        {fii > 0 && (
          <circle cx="80" cy="80" r={r} fill="transparent" stroke="#3B82F6" strokeWidth="18" 
            strokeDasharray={fSeg.strokeDash} strokeDashoffset={fSeg.strokeOffset} />
        )}
        {dii > 0 && (
          <circle cx="80" cy="80" r={r} fill="transparent" stroke="#F59E0B" strokeWidth="18" 
            strokeDasharray={dSeg.strokeDash} strokeDashoffset={dSeg.strokeOffset} />
        )}
        {pub > 0 && (
          <circle cx="80" cy="80" r={r} fill="transparent" stroke="#EC4899" strokeWidth="18" 
            strokeDasharray={oSeg.strokeDash} strokeDashoffset={oSeg.strokeOffset} />
        )}
      </svg>
    );
  };

  const ratioDefinitions: Record<string, string> = {
    pe: "Price to Earnings ratio measures market price relative to company earnings per share. Tooltip explanation: lower PE can mean discount, higher can represent premium.",
    pb: "Price to Book ratio evaluates equity capitalization against total balance sheet net asset book value.",
    evebitda: "Enterprise Value to EBITDA measures aggregate corporate valuation relative to operational cash earnings.",
    priceToSales: "Price to Sales measures market cap relative to top-line revenues.",
    dividendYield: "Percentage representing total annual dividend payments relative to the stock price.",
    roe: "Return on Equity evaluates profit generated from shareholder capital. Leveraged debt capital can inflate ROE.",
    roce: "Return on Capital Employed measures operational earnings generated relative to total debt and equity employed.",
    roa: "Return on Assets evaluates operational earnings efficiency relative to total corporate assets.",
    debtToEquity: "Debt-to-Equity measures aggregate borrowing leverage relative to shareholder net worth.",
    currentRatio: "Current assets divided by current liabilities to evaluate short-term liquidity balance.",
    quickRatio: "Acid test ratio measuring high-liquidity cash assets against current liabilities.",
    interestCoverage: "Operating profit relative to interest expenses to evaluate debt service safety margins.",
  };

  if (isGated) {
    return (
      <main className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-neutral-900 dark:text-neutral-100 min-h-screen">
        {/* HUD HEADER */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-neutral-200 dark:border-[#1f1f1f]">
          <div className="flex items-center space-x-3.5">
            <CompanyLogo
              symbol={symbol}
              isin={isin}
              companyName={name}
              className="h-10 w-10 md:h-12 md:w-12 rounded-lg"
              textClassName="text-base md:text-lg"
            />
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">{name}</h1>
              <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mt-1">
                <span className="font-bold text-[#0F766E] dark:text-teal-400 font-mono">{symbol}</span>
                <span>·</span>
                <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 rounded-xs font-mono uppercase text-[10px]">
                  {exchange}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* GUEST RESEARCH CONVERSION CARD */}
        <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 border border-[var(--border-subtle)] bg-[var(--bg-base)] rounded-xl shadow-xl space-y-6 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Keep exploring stocks
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
              You've explored 3 stocks as a guest. Sign in with Google to continue researching all stocks on VolumeCall with unlimited access.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                const callbackUrl = typeof window !== "undefined" ? window.location.href : "/";
                signIn("google", { callbackUrl });
              }}
              className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-sm font-semibold rounded-md flex items-center justify-center space-x-2.5 transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="text-xs text-[var(--text-muted)] font-medium">
              Free account · No payment required · Unlimited stock research
            </p>
          </div>
        </div>

        <LoginRequiredModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          reason="stock_limit"
        />
      </main>
    );
  }

  return (
    <main className="max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-neutral-900 dark:text-neutral-100 min-h-screen">
      
      {/* HUD HEADER */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 pb-4 md:pb-6 border-b border-neutral-200 dark:border-[#1f1f1f]">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center space-x-2.5 md:space-x-3.5">
            <CompanyLogo
                symbol={symbol}
                isin={isin}
                companyName={name}
                className="h-9 w-9 md:h-12 md:w-12 rounded-md md:rounded-lg"
                textClassName="text-sm md:text-lg"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-none break-words">{name}</h1>
                <button
                  onClick={handleWatchlistToggle}
                  disabled={watchlistSaving}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    inWatchlist
                      ? "bg-teal-50 dark:bg-teal-950/40 text-[#0F766E] dark:text-teal-400 border-teal-300 dark:border-teal-700"
                      : "bg-neutral-50 dark:bg-[#161616] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-teal-500"
                  }`}
                  title={inWatchlist ? "Remove from Watchlist" : "Save to Watchlist"}
                >
                  {inWatchlist ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 fill-current text-teal-600 dark:text-teal-400" />
                      <span>In Watchlist</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Add to Watchlist</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 mt-2 font-medium">
                <span className="font-bold text-[#0F766E] dark:text-teal-400 font-mono">{symbol}</span>
                <span className="text-neutral-350 dark:text-neutral-700">·</span>
                <span className="px-1.5 py-0.5 bg-neutral-50 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 rounded-sm font-mono uppercase text-[10px]">
                  {exchange}
                </span>
                {isin && (
                  <>
                    <span className="text-neutral-350 dark:text-neutral-700">·</span>
                    <span className="font-mono text-neutral-450">{isin}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end text-left md:text-right mt-2 md:mt-0">
          <div className="text-2xl sm:text-4xl font-black tabular-nums tracking-tight text-neutral-900 dark:text-white">
            {currentPrice ? formatCurrency(currentPrice) : "—"}
          </div>
          <div className="flex items-center space-x-2 mt-1 md:mt-1.5 text-sm font-bold">
            {changePercent !== 0 && (
              <span className={`flex items-center ${isPos ? "text-emerald-650" : "text-red-650"}`}>
                {isPos ? <ArrowUpRight className="h-4 w-4 mr-0.5" /> : <ArrowDownRight className="h-4 w-4 mr-0.5" />}
                {formatPercent(changePercent)}
              </span>
            )}
            <span className="text-[10px] bg-neutral-100 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 rounded-sm text-neutral-500 font-semibold uppercase tracking-wider">
              {overview?.market?.freshness || "LIVE"}
            </span>
          </div>
          <span className="text-[10px] text-neutral-450 mt-0.5 md:mt-1 font-normal">
            Updated {overview?.market?.updatedAt ? new Date(overview.market.updatedAt).toLocaleTimeString() : "—"}
          </span>
        </div>
      </section>

      {/* HORIZONTAL TAB NAVIGATION */}
      <nav className="border-b border-neutral-200 dark:border-[#1f1f1f] flex md:flex-wrap justify-between items-center py-1 gap-4 overflow-x-auto md:overflow-x-visible scrollbar-none w-full">
        <div ref={tabContainerRef} className="flex space-x-1.5 overflow-x-auto md:overflow-x-visible scrollbar-none py-1 snap-x snap-mandatory scroll-smooth w-full md:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => {
                if (tab.id === "analysis") {
                  prefetchAnalysis();
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border snap-center min-h-[44px] flex items-center justify-center ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#0a0a0a] text-[#0F766E] dark:text-teal-400 border-neutral-200 dark:border-[#1f1f1f] shadow-xs"
                  : "text-neutral-550 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 hover:border-teal-300 dark:bg-teal-950/20 dark:hover:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/30 dark:hover:border-teal-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[44px]"
        >
          <Sparkles className="h-4 w-4 fill-[#0F766E] dark:fill-teal-400" />
          Ask VolumeCall AI
        </button>
      </nav>

      {/* DYNAMIC TAB SWITCHBOARD */}
      <div className="space-y-12">

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stock Price Chart (FIRST major section) */}
            <div className="border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-bold mb-4">Stock Price Chart</h3>
              <InteractiveChart initialCandles={initialCandles} symbol={symbol.toLowerCase()} />
            </div>

            {loadingOverview && (
              <div className="py-16 text-center text-sm font-semibold text-neutral-500">Loading overview...</div>
            )}
            {errorOverview && (
              <div className="p-4 border border-red-500/20 bg-red-50/50 dark:bg-red-950/5 rounded-xl text-xs text-red-650 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5" />
                <span>{errorOverview}</span>
              </div>
            )}

            {!loadingOverview && overview && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left: About & Metrics */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About the Company */}
                  <div className="p-6 border border-neutral-200 dark:border-[#1f1f1f] rounded-2xl bg-neutral-50/50 dark:bg-[#0a0a0a] space-y-3">
                    <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider">About the Company</span>
                    <h3 className="text-lg font-bold">{overview.company?.companyName || name}</h3>
                    <p className="text-sm leading-relaxed font-normal text-neutral-600 dark:text-neutral-350">
                      {overview.company?.description || "No description available."}
                    </p>
                    {overview.company?.industry && (
                      <div className="text-xs text-neutral-450 font-semibold">
                        Sector/Industry: <span className="text-[#0F766E] dark:text-teal-400 font-bold">{overview.company.industry}</span>
                      </div>
                    )}
                  </div>

                  {/* Key Valuation & Ratios */}
                  <div className="space-y-4">
                    <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-2">
                      <h3 className="text-lg font-bold">Key Valuation & Ratios</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-5">
                      {[
                        { label: "Market Cap", val: getMetricValue(overview.keyMetrics, "marketCap") ? `${formatCurrency(getMetricValue(overview.keyMetrics, "marketCap"))} Cr` : "—" },
                        { label: "Current Price", val: overview.market?.priceNse ? formatCurrency(overview.market.priceNse) : (overview.market?.priceBse ? formatCurrency(overview.market.priceBse) : "—") },
                        { label: "52W High / Low", val: (overview.market?.yearHigh && overview.market?.yearLow) ? `₹${formatIndianNumber(Number(overview.market.yearHigh))} / ₹${formatIndianNumber(Number(overview.market.yearLow))}` : "—" },
                        { label: "Stock P/E", val: overview.ratios?.pe ? `${overview.ratios.pe.toFixed(1)}x` : "—" },
                        { label: "Price to Book (P/B)", val: overview.ratios?.pb ? `${overview.ratios.pb.toFixed(1)}x` : "—" },
                        { label: "Book Value", val: getMetricValue(overview.keyMetrics, "bookValuePerShareMostRecentQuarter") ? `₹${formatIndianNumber(Number(getMetricValue(overview.keyMetrics, "bookValuePerShareMostRecentQuarter")))}` : "—" },
                        { label: "Dividend Yield", val: overview.ratios?.dividendYield ? `${overview.ratios.dividendYield.toFixed(2)}%` : "—" },
                        { label: "ROE", val: overview.ratios?.roe ? `${overview.ratios.roe.toFixed(1)}%` : "—" },
                        { label: "ROCE", val: overview.ratios?.roce ? `${overview.ratios.roce.toFixed(1)}%` : "—" },
                        { label: "Debt to Equity", val: overview.ratios?.debtToEquity !== null && overview.ratios?.debtToEquity !== undefined ? `${overview.ratios.debtToEquity.toFixed(2)}` : "—" },
                      ].map((card, idx) => (
                        <div key={idx} className="p-3 md:p-4 border border-neutral-200 dark:border-[#1f1f1f] bg-neutral-50 dark:bg-[#161616] rounded-xl flex flex-col justify-between gap-1 min-h-[72px] md:min-h-[84px]">
                          <span className="text-[9px] md:text-[10px] uppercase font-bold text-neutral-450 tracking-wider block leading-snug">{card.label}</span>
                          <div className="text-sm xs:text-base md:text-lg font-black tabular-nums break-words leading-tight text-neutral-900 dark:text-white">{card.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SWOT, Pros & Cons, and Investment Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* SWOT Analysis */}
                    <div className="p-6 border border-neutral-200 dark:border-[#1f1f1f] rounded-2xl bg-neutral-50/50 dark:bg-[#0a0a0a] space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-[#1f1f1f] pb-2">SWOT Analysis</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                          <span className="font-bold text-emerald-600 block mb-1">Strengths</span>
                          <ul className="list-disc pl-3 text-neutral-600 dark:text-neutral-350 space-y-1 font-normal">
                            <li>Strong ROCE ({overview.ratios?.roce?.toFixed(1) || "15.0"}%)</li>
                            <li>Sound financial health</li>
                            <li>Market leader position</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                          <span className="font-bold text-red-650 block mb-1">Weaknesses</span>
                          <ul className="list-disc pl-3 text-neutral-600 dark:text-neutral-350 space-y-1 font-normal">
                            <li>Valuation multiplier ({overview.ratios?.pe?.toFixed(1) || "30.0"}x)</li>
                            <li>Susceptible to macro headwinds</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                          <span className="font-bold text-blue-600 block mb-1">Opportunities</span>
                          <ul className="list-disc pl-3 text-neutral-600 dark:text-neutral-350 space-y-1 font-normal">
                            <li>Expanding sector trends</li>
                            <li>Operational automation</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                          <span className="font-bold text-amber-600 block mb-1">Threats</span>
                          <ul className="list-disc pl-3 text-neutral-600 dark:text-neutral-350 space-y-1 font-normal">
                            <li>Stiff domestic competition</li>
                            <li>Regulatory policy changes</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="p-6 border border-neutral-200 dark:border-[#1f1f1f] rounded-2xl bg-neutral-50/50 dark:bg-[#0a0a0a] space-y-4 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 dark:border-[#1f1f1f] pb-2">Pros & Cons</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <span className="font-bold text-emerald-600 block">Pros</span>
                          <ul className="list-disc pl-3 text-neutral-600 dark:text-neutral-350 space-y-1 font-normal">
                            <li>Consistent return ratios</li>
                            <li>Stable business snapshot</li>
                            <li>Strong promoter support</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <span className="font-bold text-red-650 block">Cons</span>
                          <ul className="list-disc pl-3 text-neutral-600 dark:text-neutral-350 space-y-1 font-normal">
                            <li>Premium P/E over sector median</li>
                            <li>Raw material input inflation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Ownership & Quick Financial Snapshot */}
                <div className="space-y-8">
                  {/* Ownership Snapshot */}
                  <div className="p-6 border border-neutral-200 dark:border-[#1f1f1f] rounded-2xl bg-white dark:bg-[#0a0a0a] space-y-6">
                    <span className="text-sm font-bold uppercase text-neutral-500 tracking-wider">Ownership Snapshot</span>
                    
                    {overview.shareholdingLatest?.promoters !== null && overview.shareholdingLatest?.promoters !== undefined ? (
                      <div className="space-y-6 flex flex-col items-center">
                        <div className="h-32 w-32 md:h-44 md:w-44 mx-auto">
                          {renderDonutChart(
                            overview.shareholdingLatest.promoters,
                            overview.shareholdingLatest.fii || 0,
                            overview.shareholdingLatest.dii || 0,
                            overview.shareholdingLatest.public || 0
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 md:block md:space-y-2 text-xs font-semibold w-full">
                          <div className="flex justify-between items-center py-1.5 md:py-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none">
                            <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-[#0F766E] mr-2 shrink-0" />Promoters</span>
                            <span className="num-val">{formatIndianNumber(overview.shareholdingLatest.promoters, true)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 md:py-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none">
                            <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6] mr-2 shrink-0" />FIIs</span>
                            <span className="num-val">{formatIndianNumber(overview.shareholdingLatest.fii || 0, true)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 md:py-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none">
                            <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B] mr-2 shrink-0" />DIIs</span>
                            <span className="num-val">{formatIndianNumber(overview.shareholdingLatest.dii || 0, true)}%</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5 md:py-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none">
                            <span className="flex items-center"><span className="h-2.5 w-2.5 rounded-full bg-[#EC4899] mr-2 shrink-0" />Public</span>
                            <span className="num-val">{formatIndianNumber(overview.shareholdingLatest.public || 0, true)}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-neutral-450 italic">Shareholding data unavailable.</div>
                    )}
                  </div>

                  {/* Quick Financial Snapshot */}
                  <div className="p-6 border border-neutral-200 dark:border-[#1f1f1f] rounded-2xl bg-white dark:bg-[#0a0a0a] space-y-4">
                    <span className="text-sm font-bold uppercase text-neutral-500 tracking-wider">Quick Financial Snapshot</span>
                    
                    <div className="space-y-2 md:space-y-3 text-xs font-semibold">
                      <div className="flex justify-between items-center py-1.5 md:py-0 min-h-[32px] md:min-h-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none last:border-none">
                        <span className="text-neutral-500">Latest Revenue</span>
                        <span className="num-kpi text-neutral-900 dark:text-white">₹{overview.latestFinancials?.revenue !== null && overview.latestFinancials?.revenue !== undefined ? `${formatIndianNumber(overview.latestFinancials.revenue)} Cr` : "—"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 md:py-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none last:border-none">
                        <span className="text-neutral-500">Latest Net Profit</span>
                        <span className="num-kpi text-neutral-900 dark:text-white">₹{overview.latestFinancials?.netProfit !== null && overview.latestFinancials?.netProfit !== undefined ? `${formatIndianNumber(overview.latestFinancials.netProfit)} Cr` : "—"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 md:py-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none last:border-none">
                        <span className="text-neutral-500">EPS (TTM)</span>
                        <span className="num-kpi text-neutral-900 dark:text-white">₹{overview.latestFinancials?.eps !== null && overview.latestFinancials?.eps !== undefined ? formatIndianNumber(overview.latestFinancials.eps, true) : "—"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 md:py-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none last:border-none">
                        <span className="text-neutral-500">Operating Margin</span>
                        <span className="num-kpi text-neutral-900 dark:text-white">{overview.latestFinancials?.operatingMargin !== null && overview.latestFinancials?.operatingMargin !== undefined ? `${formatIndianNumber(overview.latestFinancials.operatingMargin, true)}%` : "—"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 md:py-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none last:border-none">
                        <span className="text-neutral-500">Revenue Growth (TTM)</span>
                        <span className="num-kpi text-neutral-900 dark:text-white">{overview.latestFinancials?.revenueGrowth !== null && overview.latestFinancials?.revenueGrowth !== undefined ? `${formatIndianNumber(overview.latestFinancials.revenueGrowth, true)}%` : "—"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 md:py-0 border-b border-neutral-100/50 dark:border-neutral-900/50 md:border-none last:border-none">
                        <span className="text-neutral-500">Profit Growth (TTM)</span>
                        <span className="num-kpi text-neutral-900 dark:text-white">{overview.latestFinancials?.profitGrowth !== null && overview.latestFinancials?.profitGrowth !== undefined ? `${formatIndianNumber(overview.latestFinancials.profitGrowth, true)}%` : "—"}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col space-y-2 text-center border-t border-neutral-200 dark:border-[#1f1f1f]">
                      <button onClick={() => setActiveTab("quarters")} className="text-xs text-[#0F766E] dark:text-teal-400 font-bold hover:underline cursor-pointer flex items-center justify-center">
                        View Quarterly Results <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                      <button onClick={() => setActiveTab("pnl")} className="text-xs text-[#0F766E] dark:text-teal-400 font-bold hover:underline cursor-pointer flex items-center justify-center">
                        View Profit & Loss <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 3. ANALYSIS TAB */}
        {activeTab === "analysis" && (
          <div className="space-y-6">
            {loadingAnalysis && (
              <div className="py-16 text-center text-sm font-semibold text-neutral-500">Generating AI analysis...</div>
            )}
            {errorAnalysis && (
              <div className="p-4 border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/5 rounded-xl text-xs text-neutral-500 flex items-center space-x-2">
                <Info className="h-5 w-5 text-amber-550" />
                <span>{errorAnalysis}</span>
              </div>
            )}

            {!loadingAnalysis && analysis && (
              <div className="border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl p-8 space-y-8 shadow-xs">
                
                {/* Overall interpretation banner */}
                <div className="border-l-4 border-[#0F766E] dark:border-teal-400 pl-4 py-2 bg-neutral-50 dark:bg-[#121212] rounded-r-xl">
                  <span className="text-[10px] font-black uppercase text-neutral-450 block mb-1">Overall Read</span>
                  <p className="text-base font-bold leading-relaxed">{analysis.overallInterpretation}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-neutral-800 dark:text-neutral-250 tracking-wider">Business Snapshot</span>
                    <p>{analysis.businessSnapshot}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-neutral-800 dark:text-neutral-250 tracking-wider">Valuation Analysis</span>
                    <p>{analysis.valuation}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-neutral-800 dark:text-neutral-250 tracking-wider">Profitability & Ratios</span>
                    <p>{analysis.profitability}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-neutral-800 dark:text-neutral-250 tracking-wider">Growth Vector</span>
                    <p>{analysis.growth}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-neutral-800 dark:text-neutral-250 tracking-wider">Financial Health</span>
                    <p>{analysis.financialHealth}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-neutral-800 dark:text-neutral-250 tracking-wider">Ownership Pattern</span>
                    <p>{analysis.shareholding}</p>
                  </div>
                  <div className="md:col-span-2 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-amber-700 dark:text-amber-500 tracking-wider">Risks & Watchpoints</span>
                    <p>{analysis.watchpoints}</p>
                  </div>
                </div>

                <p className="text-[12px] text-neutral-450 dark:text-neutral-500 pt-4 border-t border-neutral-200 dark:border-[#1f1f1f] leading-relaxed">
                  {analysis.disclosure}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. PEERS TAB */}
        {activeTab === "peers" && (
          <div className="space-y-6">
            {loadingPeers && (
              <div className="py-16 text-center text-sm font-semibold text-neutral-500">Loading peers...</div>
            )}
            {errorPeers && (
              <div className="p-4 border border-red-500/20 bg-red-50/50 dark:bg-red-950/5 rounded-xl text-xs text-red-650 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5" />
                <span>{errorPeers}</span>
              </div>
            )}

            {!loadingPeers && peers && (
              <div className="border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 overflow-x-auto shadow-xs">
                <table className="financial-table min-w-[700px]">
                  <thead>
                    <tr>
                      <th className="sticky-metric">Company</th>
                      <th className="text-right">Price</th>
                      <th className="text-right">Market Cap</th>
                      <th className="text-right">P/E</th>
                      <th className="text-right">P/B</th>
                      <th className="text-right">ROE</th>
                      <th className="text-right">ROCE</th>
                      <th className="text-right">D/E</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Main Company row */}
                    <tr className="bg-teal-500/5 text-[#0F766E] dark:text-teal-400 font-extrabold">
                      <td className="sticky-metric font-semibold text-[#0F766E] dark:text-teal-400">{symbol} (Self)</td>
                      <td className="text-right num-important">{currentPrice ? `₹${formatIndianNumber(currentPrice, true)}` : "—"}</td>
                      <td className="text-right num-important">{getMetricValue(overview?.keyMetrics, "marketCap") ? `₹${formatIndianNumber(getMetricValue(overview?.keyMetrics, "marketCap"))} Cr` : "—"}</td>
                      <td className="text-right num-important">{overview?.ratios?.pe ? `${formatIndianNumber(overview.ratios.pe, true)}x` : "—"}</td>
                      <td className="text-right num-important">{overview?.ratios?.pb ? `${formatIndianNumber(overview.ratios.pb, true)}x` : "—"}</td>
                      <td className="text-right num-important">{overview?.ratios?.roe ? `${formatIndianNumber(overview.ratios.roe, true)}%` : "—"}</td>
                      <td className="text-right num-important">{overview?.ratios?.roce ? `${formatIndianNumber(overview.ratios.roce, true)}%` : "—"}</td>
                      <td className="text-right num-important">{overview?.ratios?.debtToEquity ? `${formatIndianNumber(overview.ratios.debtToEquity, true)}` : "—"}</td>
                    </tr>

                    {/* Peers rows */}
                    {peers.peers?.map((p, idx) => {
                      const isRealSymbol = p.symbol && !p.symbol.startsWith("S0") && !/^[A-Z0-9]{8}$/.test(p.symbol);
                      return (
                        <tr key={idx}>
                          <td className="sticky-metric">
                            <div className="flex items-center space-x-2.5">
                              <CompanyLogo
                                symbol={p.symbol}
                                isin={p.isin}
                                companyName={p.name}
                                className="h-7 w-7 rounded-md"
                                textClassName="text-[9px]"
                              />
                              <div>
                                <div className="font-semibold text-neutral-900 dark:text-white leading-tight">{p.name}</div>
                                {isRealSymbol && (
                                  <span className="text-[10px] text-neutral-450 font-normal block leading-none mt-0.5">{p.symbol}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-right num-val text-neutral-700 dark:text-neutral-300">{p.price ? `₹${formatIndianNumber(p.price, true)}` : "—"}</td>
                          <td className="text-right num-val text-neutral-700 dark:text-neutral-300">{p.marketCap ? `₹${formatIndianNumber(Number(p.marketCap))} Cr` : "—"}</td>
                          <td className="text-right num-val text-neutral-700 dark:text-neutral-300">{p.pe ? `${formatIndianNumber(p.pe, true)}x` : "—"}</td>
                          <td className="text-right num-val text-neutral-700 dark:text-neutral-300">{p.pb ? `${formatIndianNumber(p.pb, true)}x` : "—"}</td>
                          <td className="text-right num-val text-neutral-700 dark:text-neutral-300">{p.roe ? `${formatIndianNumber(p.roe, true)}%` : "—"}</td>
                          <td className="text-right num-val text-neutral-700 dark:text-neutral-300">{p.roce ? `${formatIndianNumber(p.roce, true)}%` : "—"}</td>
                          <td className="text-right num-val text-neutral-700 dark:text-neutral-300">{p.debtToEquity ? `${formatIndianNumber(p.debtToEquity, true)}` : "—"}</td>
                        </tr>
                      );
                    })}

                    {/* Medians row */}
                    <tr className="bg-neutral-50 dark:bg-[#161616] text-neutral-500 font-bold border-t-2 border-neutral-200 dark:border-neutral-800">
                      <td className="sticky-metric font-bold text-neutral-500 dark:text-neutral-450">Peer Median</td>
                      <td className="text-right num-important text-neutral-550">—</td>
                      <td className="text-right num-important text-neutral-550">—</td>
                      <td className="text-right num-important text-neutral-500 dark:text-neutral-400">{peers.medians?.pe ? `${formatIndianNumber(peers.medians.pe, true)}x` : "—"}</td>
                      <td className="text-right num-important text-neutral-500 dark:text-neutral-400">{peers.medians?.pb ? `${formatIndianNumber(peers.medians.pb, true)}x` : "—"}</td>
                      <td className="text-right num-important text-neutral-500 dark:text-neutral-400">{peers.medians?.roe ? `${formatIndianNumber(peers.medians.roe, true)}%` : "—"}</td>
                      <td className="text-right num-important text-neutral-500 dark:text-neutral-400">{peers.medians?.roce ? `${formatIndianNumber(peers.medians.roce, true)}%` : "—"}</td>
                      <td className="text-right num-important text-neutral-500 dark:text-neutral-400">{peers.medians?.debtToEquity ? `${formatIndianNumber(peers.medians.debtToEquity, true)}` : "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. QUARTERLY RESULTS TAB */}
        {activeTab === "quarters" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
              <h3 className="text-lg font-bold">Quarterly Performance</h3>
              <div className="flex space-x-1 bg-neutral-50 dark:bg-[#161616] p-1 border border-neutral-250 dark:border-[#1f1f1f] rounded-lg text-xs font-semibold">
                <button onClick={() => setGrowthMode("value")} className={`px-3 py-1.5 rounded-md cursor-pointer ${growthMode === "value" ? "bg-white dark:bg-[#0a0a0a] shadow-2xs text-[#0F766E]" : "text-neutral-500"}`}>Total Figures</button>
                <button onClick={() => setGrowthMode("yoy")} className={`px-3 py-1.5 rounded-md cursor-pointer ${growthMode === "yoy" ? "bg-white dark:bg-[#0a0a0a] shadow-2xs text-[#0F766E]" : "text-neutral-500"}`}>YoY %</button>
                <button onClick={() => setGrowthMode("qoq")} className={`px-3 py-1.5 rounded-md cursor-pointer ${growthMode === "qoq" ? "bg-white dark:bg-[#0a0a0a] shadow-2xs text-[#0F766E]" : "text-neutral-500"}`}>QoQ %</button>
              </div>
            </div>

            {loadingFinancials && <div className="py-16 text-center text-sm font-semibold text-neutral-500">Loading statements...</div>}
            {errorFinancials && (
              <div className="p-4 border border-red-500/20 bg-red-50/50 dark:bg-red-950/5 rounded-xl text-xs text-red-650 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5" />
                <span>{errorFinancials}</span>
              </div>
            )}
            
            {!loadingFinancials && financials && (
              <div className="border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 overflow-x-auto shadow-xs">
                <table className="financial-table min-w-[650px]">
                  <thead>
                    <tr>
                      <th className="sticky-metric">Metric (in ₹ Crores)</th>
                      {financials.quarterlyResults?.map((q) => (
                        <th key={q.period} className="text-right">{q.period}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Revenue", key: "sales" as const },
                      { name: "Expenses", key: "expenses" as const },
                      { name: "Operating Profit", key: "operatingProfit" as const },
                      { name: "OPM %", key: "opmPercent" as const, suffix: "%" },
                      { name: "Net Profit", key: "netProfit" as const },
                      { name: "EPS in Rs", key: "eps" as const, suffix: "" },
                    ].map((row) => {
                      const isImportant = isImportantRow(row.name);
                      return (
                        <tr key={row.name}>
                          <td className={`sticky-metric ${isImportant ? 'font-semibold text-neutral-900 dark:text-white' : 'font-normal text-neutral-600 dark:text-neutral-450'}`}>{row.name}</td>
                          {financials.quarterlyResults?.map((q) => {
                            const val = q[row.key];
                            let display = "—";
                            let isGrowth = false;
                            let growthVal = 0;
                            if (growthMode === "yoy" && q.yoyGrowth !== undefined && q.yoyGrowth !== null && row.key === "sales") {
                              display = `${q.yoyGrowth > 0 ? "+" : ""}${formatIndianNumber(q.yoyGrowth, true)}%`;
                              isGrowth = true;
                              growthVal = q.yoyGrowth;
                            } else if (growthMode === "qoq" && q.qoqGrowth !== undefined && q.qoqGrowth !== null && row.key === "sales") {
                              display = `${q.qoqGrowth > 0 ? "+" : ""}${formatIndianNumber(q.qoqGrowth, true)}%`;
                              isGrowth = true;
                              growthVal = q.qoqGrowth;
                            } else if (val !== undefined && val !== null) {
                              const forceDec = row.key === "eps";
                              display = `${formatIndianNumber(val, forceDec)}${row.suffix ?? ""}`;
                            }
                            const textClass = isGrowth
                              ? (growthVal > 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : growthVal < 0 ? "text-red-600 dark:text-red-400 font-semibold" : "")
                              : (isImportant ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300");
                            return (
                              <td key={q.period} className={`text-right ${isImportant ? 'num-important' : 'num-val'} ${textClass}`}>{display}</td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 6. PROFIT & LOSS TAB */}
        {activeTab === "pnl" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
              <h3 className="text-lg font-bold">Annual Profit & Loss</h3>
              <div className="flex space-x-1 bg-neutral-50 dark:bg-[#161616] p-1 border border-neutral-250 dark:border-[#1f1f1f] rounded-lg text-xs font-semibold">
                <button onClick={() => setGrowthMode("value")} className={`px-3 py-1.5 rounded-md cursor-pointer ${growthMode === "value" ? "bg-white dark:bg-[#0a0a0a] shadow-2xs text-[#0F766E]" : "text-neutral-500"}`}>Total Figures</button>
                <button onClick={() => setGrowthMode("yoy")} className={`px-3 py-1.5 rounded-md cursor-pointer ${growthMode === "yoy" ? "bg-white dark:bg-[#0a0a0a] shadow-2xs text-[#0F766E]" : "text-neutral-500"}`}>YoY Growth</button>
              </div>
            </div>

            {loadingFinancials && <div className="py-16 text-center text-sm font-semibold text-neutral-500">Loading statements...</div>}
            {errorFinancials && (
              <div className="p-4 border border-red-500/20 bg-red-50/50 dark:bg-red-950/5 rounded-xl text-xs text-red-650 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5" />
                <span>{errorFinancials}</span>
              </div>
            )}
            
            {!loadingFinancials && financials && (
              <div className="border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 overflow-x-auto shadow-xs">
                <table className="financial-table min-w-[650px]">
                  <thead>
                    <tr>
                      <th className="sticky-metric">Metric (in ₹ Crores)</th>
                      {financials.annualProfitLoss?.map((a) => (
                        <th key={a.period} className="text-right">{a.period}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Revenue", key: "sales" as const },
                      { name: "Expenses", key: "expenses" as const },
                      { name: "Operating Profit", key: "operatingProfit" as const },
                      { name: "OPM %", key: "opmPercent" as const, suffix: "%" },
                      { name: "Net Profit", key: "netProfit" as const },
                      { name: "EPS in Rs", key: "eps" as const },
                      { name: "Dividend Payout %", key: "dividendPayoutPercent" as const, suffix: "%" },
                    ].map((row) => {
                      const isImportant = isImportantRow(row.name);
                      return (
                        <tr key={row.name}>
                          <td className={`sticky-metric ${isImportant ? 'font-semibold text-neutral-900 dark:text-white' : 'font-normal text-neutral-600 dark:text-neutral-450'}`}>{row.name}</td>
                          {financials.annualProfitLoss?.map((a) => {
                            const val = a[row.key];
                            let display = "—";
                            let isGrowth = false;
                            let growthVal = 0;
                            if (growthMode === "yoy" && a.yoyGrowth !== undefined && a.yoyGrowth !== null && row.key === "sales") {
                              display = `${a.yoyGrowth > 0 ? "+" : ""}${formatIndianNumber(a.yoyGrowth, true)}%`;
                              isGrowth = true;
                              growthVal = a.yoyGrowth;
                            } else if (val !== undefined && val !== null) {
                              const forceDec = row.key === "eps";
                              display = `${formatIndianNumber(val, forceDec)}${row.suffix ?? ""}`;
                            }
                            const textClass = isGrowth
                              ? (growthVal > 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : growthVal < 0 ? "text-red-600 dark:text-red-400 font-semibold" : "")
                              : (isImportant ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300");
                            return (
                              <td key={a.period} className={`text-right ${isImportant ? 'num-important' : 'num-val'} ${textClass}`}>{display}</td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 7. BALANCE SHEET TAB */}
        {activeTab === "balance" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
              <h3 className="text-lg font-bold">Consolidated Balance Sheet</h3>
            </div>

            {loadingFinancials && <div className="py-16 text-center text-sm font-semibold text-neutral-500">Loading Balance Sheet...</div>}
            {errorFinancials && (
              <div className="p-4 border border-red-500/20 bg-red-50/50 dark:bg-red-950/5 rounded-xl text-xs text-red-650 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5" />
                <span>{errorFinancials}</span>
              </div>
            )}
            
            {!loadingFinancials && financials && (
              <div className="border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 overflow-x-auto shadow-xs">
                <table className="financial-table min-w-[650px]">
                  <thead>
                    <tr>
                      <th className="sticky-metric">Metric (in ₹ Crores)</th>
                      {financials.balanceSheet?.map((b) => (
                        <th key={b.period} className="text-right">{b.period}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Share Capital", key: "equityCapital" as const },
                      { name: "Reserves", key: "reserves" as const },
                      { name: "Borrowings", key: "borrowings" as const },
                      { name: "Other Liabilities", key: "otherLiabilities" as const },
                      { name: "Total Liabilities", key: "totalLiabilities" as const },
                      { name: "Fixed Assets", key: "fixedAssets" as const },
                      { name: "CWIP", key: "cwip" as const },
                      { name: "Investments", key: "investments" as const },
                      { name: "Other Assets", key: "otherAssets" as const },
                      { name: "Total Assets", key: "totalAssets" as const },
                    ].map((row) => {
                      const isImportant = isImportantRow(row.name);
                      return (
                        <tr key={row.name}>
                          <td className={`sticky-metric ${isImportant ? 'font-semibold text-neutral-900 dark:text-white' : 'font-normal text-neutral-600 dark:text-neutral-450'}`}>{row.name}</td>
                          {financials.balanceSheet?.map((b) => {
                            const val = b[row.key];
                            const display = val !== undefined && val !== null ? formatIndianNumber(val) : "—";
                            return (
                              <td key={b.period} className={`text-right ${isImportant ? 'num-important' : 'num-val'} ${isImportant ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"}`}>{display}</td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 8. CASH FLOW TAB */}
        {activeTab === "cashflow" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
              <h3 className="text-lg font-bold">Consolidated Cash Flows</h3>
            </div>

            {loadingFinancials && <div className="py-16 text-center text-sm font-semibold text-neutral-500">Loading Cash Flows...</div>}
            {errorFinancials && (
              <div className="p-4 border border-red-500/20 bg-red-50/50 dark:bg-red-950/5 rounded-xl text-xs text-red-650 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5" />
                <span>{errorFinancials}</span>
              </div>
            )}
            
            {!loadingFinancials && financials && (
              <div className="border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 overflow-x-auto shadow-xs">
                <table className="financial-table min-w-[650px]">
                  <thead>
                    <tr>
                      <th className="sticky-metric">Metric (in ₹ Crores)</th>
                      {financials.cashFlow?.map((c) => (
                        <th key={c.period} className="text-right">{c.period}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Cash from Operating Activity", key: "operatingCashFlow" as const },
                      { name: "Cash from Investing Activity", key: "investingCashFlow" as const },
                      { name: "Cash from Financing Activity", key: "financingCashFlow" as const },
                      { name: "Net Cash Flow", key: "netCashFlow" as const },
                    ].map((row) => {
                      const isImportant = isImportantRow(row.name);
                      return (
                        <tr key={row.name}>
                          <td className={`sticky-metric ${isImportant ? 'font-semibold text-neutral-900 dark:text-white' : 'font-normal text-neutral-600 dark:text-neutral-450'}`}>{row.name}</td>
                          {financials.cashFlow?.map((c) => {
                            const val = c[row.key];
                            const display = val !== undefined && val !== null ? formatIndianNumber(val) : "—";
                            return (
                              <td key={c.period} className={`text-right ${isImportant ? 'num-important' : 'num-val'} ${isImportant ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"}`}>{display}</td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 9. RATIOS TAB */}
        {activeTab === "ratios" && (
          <div className="space-y-8">
            <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
              <h3 className="text-lg font-bold">Financial Ratio Directory</h3>
              <p className="text-xs text-neutral-500 mt-1">Detailed valuation, profitability, health, and CAGR growth calculations</p>
            </div>

            {overview ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* VALUATION */}
                <div className="p-6 border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl space-y-4">
                  <span className="text-xs font-bold uppercase text-[#0F766E] dark:text-teal-400 tracking-wider">Valuation ratios</span>
                  <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40 text-xs sm:text-sm">
                    {[
                      { name: "P/E Ratio", key: "pe", format: (v: number) => `${v.toFixed(1)}x` },
                      { name: "P/B Ratio", key: "pb", format: (v: number) => `${v.toFixed(1)}x` },
                      { name: "EV/EBITDA", key: "evebitda", format: (v: number) => `${v.toFixed(1)}x` },
                      { name: "Price to Sales", key: "priceToSales", format: (v: number) => `${v.toFixed(2)}x` },
                      { name: "Dividend Yield", key: "dividendYield", format: (v: number) => `${v.toFixed(2)}%` },
                    ].map((row) => {
                      const val = overview.ratios[row.key];
                      return (
                        <div key={row.key} className="py-3 flex justify-between items-center relative">
                          <span className="font-semibold text-neutral-600 dark:text-neutral-400 flex items-center">
                            {row.name}
                            <button onClick={() => setActiveRatioTooltip(activeRatioTooltip === row.key ? null : row.key)} className="ml-1 text-neutral-450 hover:text-[#0F766E] cursor-pointer">ⓘ</button>
                          </span>
                          <span className="tabular-nums font-bold text-base">{val !== null ? row.format(val) : "—"}</span>
                          {activeRatioTooltip === row.key && (
                            <div className="absolute left-0 bottom-full mb-1.5 z-40 p-3 bg-neutral-900 text-white rounded-lg text-xs leading-relaxed max-w-[280px]">
                              {ratioDefinitions[row.key]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PROFITABILITY */}
                <div className="p-6 border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl space-y-4">
                  <span className="text-xs font-bold uppercase text-[#0F766E] dark:text-teal-400 tracking-wider">Profitability & efficiency</span>
                  <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40 text-xs sm:text-sm">
                    {[
                      { name: "Return on Equity (ROE)", key: "roe", format: (v: number) => `${v.toFixed(1)}%` },
                      { name: "Return on Capital Employed (ROCE)", key: "roce", format: (v: number) => `${v.toFixed(1)}%` },
                      { name: "Return on Assets (ROA)", key: "roa", format: (v: number) => `${v.toFixed(2)}%` },
                    ].map((row) => {
                      const val = overview.ratios[row.key];
                      return (
                        <div key={row.key} className="py-3 flex justify-between items-center relative">
                          <span className="font-semibold text-neutral-600 dark:text-neutral-400 flex items-center">
                            {row.name}
                            <button onClick={() => setActiveRatioTooltip(activeRatioTooltip === row.key ? null : row.key)} className="ml-1 text-neutral-450 hover:text-[#0F766E] cursor-pointer">ⓘ</button>
                          </span>
                          <span className="tabular-nums font-bold text-base">{val !== null ? row.format(val) : "—"}</span>
                          {activeRatioTooltip === row.key && (
                            <div className="absolute left-0 bottom-full mb-1.5 z-40 p-3 bg-neutral-900 text-white rounded-lg text-xs leading-relaxed max-w-[280px]">
                              {ratioDefinitions[row.key]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FINANCIAL HEALTH */}
                <div className="p-6 border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl space-y-4">
                  <span className="text-xs font-bold uppercase text-[#0F766E] dark:text-teal-400 tracking-wider">Leverage & Liquidity</span>
                  <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40 text-xs sm:text-sm">
                    {[
                      { name: "Debt to Equity", key: "debtToEquity", format: (v: number) => `${v.toFixed(2)}` },
                      { name: "Current Ratio", key: "currentRatio", format: (v: number) => `${v.toFixed(2)}` },
                      { name: "Quick Ratio", key: "quickRatio", format: (v: number) => `${v.toFixed(2)}` },
                      { name: "Interest Coverage", key: "interestCoverage", format: (v: number) => `${v.toFixed(1)}x` },
                    ].map((row) => {
                      const val = overview.ratios[row.key];
                      return (
                        <div key={row.key} className="py-3 flex justify-between items-center relative">
                          <span className="font-semibold text-neutral-600 dark:text-neutral-400 flex items-center">
                            {row.name}
                            <button onClick={() => setActiveRatioTooltip(activeRatioTooltip === row.key ? null : row.key)} className="ml-1 text-neutral-450 hover:text-[#0F766E] cursor-pointer">ⓘ</button>
                          </span>
                          <span className="font-mono font-bold text-base">{val !== null ? row.format(val) : "—"}</span>
                          {activeRatioTooltip === row.key && (
                            <div className="absolute left-0 bottom-full mb-1.5 z-40 p-3 bg-neutral-900 text-white rounded-lg text-xs leading-relaxed max-w-[280px]">
                              {ratioDefinitions[row.key]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CAGR GROWTH */}
                <div className="p-6 border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl space-y-4">
                  <span className="text-xs font-bold uppercase text-[#0F766E] dark:text-teal-400 tracking-wider">Calculated CAGRs</span>
                  <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40 text-xs sm:text-sm">
                    {[
                      { name: "3-Year Revenue CAGR", val: overview.cagr?.rev3Y !== undefined && overview.cagr?.rev3Y !== null ? `${overview.cagr.rev3Y.toFixed(1)}%` : "—" },
                      { name: "5-Year Revenue CAGR", val: overview.cagr?.rev5Y !== undefined && overview.cagr?.rev5Y !== null ? `${overview.cagr.rev5Y.toFixed(1)}%` : "—" },
                      { name: "3-Year Profit CAGR", val: overview.cagr?.prof3Y !== undefined && overview.cagr?.prof3Y !== null ? `${overview.cagr.prof3Y.toFixed(1)}%` : "—" },
                      { name: "5-Year Profit CAGR", val: overview.cagr?.prof5Y !== undefined && overview.cagr?.prof5Y !== null ? `${overview.cagr.prof5Y.toFixed(1)}%` : "—" },
                    ].map((row, idx) => (
                      <div key={idx} className="py-3.5 flex justify-between items-center">
                        <span className="font-semibold text-neutral-600 dark:text-neutral-400">{row.name}</span>
                        <span className="tabular-nums font-bold text-base">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-450 italic">Ratio matrix data unavailable.</div>
            )}
          </div>
        )}

        {/* 10. INVESTORS / SHAREHOLDING TAB */}
        {activeTab === "investors" && (
          <div className="space-y-8">
            <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
              <h3 className="text-lg font-bold">Investors & Ownership</h3>
              <p className="text-xs text-neutral-500 mt-1">Institutional holdings, promoter pledge percentages, and historical records</p>
            </div>

            {loadingShareholding && <div className="py-16 text-center text-sm font-semibold text-neutral-500">Loading ownership records...</div>}
            {errorShareholding && (
              <div className="p-4 border border-red-500/20 bg-red-50/50 dark:bg-red-950/5 rounded-xl text-xs text-red-650 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5" />
                <span>{errorShareholding}</span>
              </div>
            )}

            {!loadingShareholding && shareholding && (
              <div className="space-y-8">
                {/* SVG Donut visualization for latest */}
                {shareholding.history?.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-neutral-50 dark:bg-[#161616] p-6 rounded-2xl border border-neutral-250 dark:border-[#1f1f1f]">
                    <div className="h-48 w-48 mx-auto col-span-1">
                      {(() => {
                        const latest = shareholding.history[shareholding.history.length - 1];
                        return renderDonutChart(latest.promoter || 0, latest.fii || 0, latest.dii || 0, latest.public || 0);
                      })()}
                    </div>
                    
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4 text-xs font-semibold">
                      {(() => {
                        const latest = shareholding.history[shareholding.history.length - 1];
                        return (
                          <>
                            <div className="p-3 border border-neutral-200 dark:border-neutral-850 rounded-xl bg-white dark:bg-[#0a0a0a] space-y-1">
                              <span className="text-[10px] text-[#0F766E] uppercase font-bold tracking-wider">Promoters</span>
                              <div className="text-lg font-black tabular-nums">{latest.promoter}%</div>
                            </div>
                            <div className="p-3 border border-neutral-200 dark:border-neutral-850 rounded-xl bg-white dark:bg-[#0a0a0a] space-y-1">
                              <span className="text-[10px] text-blue-650 uppercase font-bold tracking-wider">FII Holding</span>
                              <div className="text-lg font-black tabular-nums">{latest.fii}%</div>
                            </div>
                            <div className="p-3 border border-neutral-200 dark:border-neutral-850 rounded-xl bg-white dark:bg-[#0a0a0a] space-y-1">
                              <span className="text-[10px] text-amber-600 uppercase font-bold tracking-wider">DII Holding</span>
                              <div className="text-lg font-black tabular-nums">{latest.dii}%</div>
                            </div>
                            <div className="p-3 border border-neutral-200 dark:border-neutral-850 rounded-xl bg-white dark:bg-[#0a0a0a] space-y-1">
                              <span className="text-[10px] text-pink-650 uppercase font-bold tracking-wider">Public / Others</span>
                              <div className="text-lg font-black tabular-nums">{latest.public}%</div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ) : null}

                {/* History matrix table */}
                <div className="border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 overflow-x-auto shadow-xs">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111111] text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        <th className="py-3 px-4">Period</th>
                        <th className="py-3 px-4 text-right">Promoters</th>
                        <th className="py-3 px-4 text-right">FIIs</th>
                        <th className="py-3 px-4 text-right">DIIs</th>
                        <th className="py-3 px-4 text-right">Public</th>
                        <th className="py-3 px-4 text-right">Pledged %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/80 text-xs sm:text-sm font-semibold">
                      {shareholding.history?.map((s, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-[#161616]/30 font-medium">
                          <td className="py-3.5 px-4 font-bold text-[#0F766E]">{s.period}</td>
                          <td className="py-3.5 px-4 text-right tabular-nums">{s.promoter !== null ? `${s.promoter.toFixed(2)}%` : "—"}</td>
                          <td className="py-3.5 px-4 text-right tabular-nums">{s.fii !== null ? `${s.fii.toFixed(2)}%` : "—"}</td>
                          <td className="py-3.5 px-4 text-right tabular-nums">{s.dii !== null ? `${s.dii.toFixed(2)}%` : "—"}</td>
                          <td className="py-3.5 px-4 text-right tabular-nums">{s.public !== null ? `${s.public.toFixed(2)}%` : "—"}</td>
                          <td className="py-3.5 px-4 text-right tabular-nums text-amber-600">{s.pledgedPercent !== null ? `${s.pledgedPercent.toFixed(2)}%` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 11. DOCUMENTS / TIMELINE TAB */}
        {activeTab === "documents" && (
          <div className="space-y-8">
            <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
              <h3 className="text-lg font-bold">Announcements & Corporate Actions</h3>
              <p className="text-xs text-neutral-500 mt-1">Official filings, board meeting updates, dividends, and event schedules</p>
            </div>

            {overview ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* CORPORATE ACTIONS */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase text-[#0F766E] dark:text-teal-400 tracking-wider">Corporate Actions</span>
                  {overview.corporateActions?.length > 0 ? (
                    <div className="space-y-4">
                      {overview.corporateActions.map((act, idx) => (
                        <div key={idx} className="p-4 border border-neutral-200 dark:border-[#1f1f1f] bg-neutral-50 dark:bg-[#161616] rounded-xl flex justify-between items-center text-xs sm:text-sm">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 bg-[#0F766E]/10 dark:bg-teal-500/10 text-[#0F766E] dark:text-teal-400 font-extrabold rounded-sm text-[9px] uppercase tracking-wider">{act.type}</span>
                            <h4 className="font-bold text-neutral-900 dark:text-white pt-1">{act.detail}</h4>
                          </div>
                          <div className="flex items-center space-x-1.5 text-neutral-450 font-sans tabular-nums">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(act.exDate)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-50 dark:bg-[#161616] rounded-xl text-center text-xs text-neutral-450 italic">No corporate actions found.</div>
                  )}
                </div>

                {/* ANNOUNCEMENTS */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase text-[#0F766E] dark:text-teal-400 tracking-wider">Latest Announcements</span>
                  {overview.announcements?.length > 0 ? (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {overview.announcements.map((ann, idx) => (
                        <div key={idx} className="p-4 border border-neutral-200 dark:border-[#1f1f1f] bg-neutral-50 dark:bg-[#161616] rounded-xl space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{ann.category}</span>
                            <span className="tabular-nums text-neutral-450 text-[10px]">{formatDate(ann.date)}</span>
                          </div>
                          <h4 className="font-semibold leading-relaxed">{ann.title}</h4>
                          {ann.sourceUrl && (
                            <a href={ann.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#0F766E] dark:text-teal-400 hover:underline font-bold text-xs inline-flex items-center space-x-0.5">
                              <span>View document</span>
                              <ChevronRight className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-50 dark:bg-[#161616] rounded-xl text-center text-xs text-neutral-450 italic">No recent filings found.</div>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-450 italic">Documents feed unavailable.</div>
            )}
          </div>
        )}

      </div>

      {/* SEBI Filings / Exchange Announcements Section */}
      {!loadingOverview && overview && overview.announcements && overview.announcements.length > 0 && (
        <section className="mt-12 border border-neutral-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-200 dark:border-[#1f1f1f] pb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>SEBI Filings & Corporate Announcements</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">Official BSE/NSE disclosures and announcements in chronological order</p>
            </div>
            <button
              onClick={() => {
                setActiveTab("documents");
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              className="text-xs text-[#0F766E] dark:text-teal-400 hover:underline font-bold cursor-pointer"
            >
              View All Filings →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overview.announcements.slice(0, 3).map((ann, idx) => {
              const dateObj = new Date(ann.date);
              const formattedDate = isNaN(dateObj.getTime()) 
                ? ann.date 
                : dateObj.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
              
              const isNse = ann.category.toLowerCase().includes("nse") || !ann.category.toLowerCase().includes("bse");
              const exchangeLabel = isNse ? "NSE" : "BSE";

              return (
                <div key={idx} className="p-4 border border-neutral-200 dark:border-[#1f1f1f] bg-neutral-50 dark:bg-[#161616]/40 rounded-xl flex flex-col justify-between space-y-3 text-xs sm:text-sm font-semibold">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{ann.category || "Announcement"}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase bg-white dark:bg-zinc-805 border border-neutral-200 dark:border-zinc-700 text-[#667085] dark:text-neutral-450 rounded-sm">
                        {exchangeLabel}
                      </span>
                    </div>
                    <h4 className="font-semibold leading-relaxed text-neutral-900 dark:text-neutral-100 line-clamp-3">
                      {ann.title}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-200/50 dark:border-neutral-850">
                    <span className="tabular-nums text-neutral-450 text-[10px]">{formattedDate}</span>
                    {ann.sourceUrl && (
                      <a 
                        href={ann.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#0F766E] dark:text-teal-400 hover:underline font-bold text-xs inline-flex items-center space-x-0.5"
                      >
                        <span>View Document</span>
                        <ChevronRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <VolumeCallAIDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        context={{
          type: "stock",
          symbol: symbol,
          title: name,
        }}
      />

      <LoginRequiredModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        reason={loginModalReason}
      />

    </main>
  );
}
export default StockResearchClient;
