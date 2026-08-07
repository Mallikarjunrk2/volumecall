"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X, AlertCircle, Sparkles, Info, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { SearchInstrument } from "@/lib/stocks/types";
import VolumeCallAIDrawer from "@/components/stocks/VolumeCallAIDrawer";
import { FightData, MetricComparison, StockCompareResult } from "@/lib/stocks/compare";
import { ComparisonAnalysis } from "@/lib/ai/schemas";
import { RecentDevelopment } from "@/lib/news/normalize";
import { formatCurrency } from "@/lib/stocks/formatting";



interface NewsAPIResponse {
  developments: RecentDevelopment[];
  status: "success" | "error" | "rate_limited" | "invalid_key" | "no_news";
  provider: string;
  fetchedCount: number;
  relevantCount: number;
  error: string | null;
}

const safeJsonParse = async (res: Response) => {
  if (!res.ok) return null;
  const text = await res.text();
  if (!text || text.trim() === "") return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export function CompareClient() {
  const [selectedStocks, setSelectedStocks] = useState<SearchInstrument[]>([]);
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null);
  
  // Search query states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchInstrument[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Comparison flow states
  const [comparisonData, setComparisonData] = useState<FightData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [financialsError, setFinancialsError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Decoupled Progressive News states
  const [newsResponse, setNewsResponse] = useState<NewsAPIResponse | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);

  // Floating AI Widget State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Accordion raw table toggle
  const [rawTableOpen, setRawTableOpen] = useState(false);

  // Methodology block toggle
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  // Modes
  const [viewMode, setViewMode] = useState<"simple" | "detailed">("simple");
  const [isCompared, setIsCompared] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSearchingIndex(null);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when activated
  useEffect(() => {
    if (searchingIndex !== null) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchingIndex]);

  // Debounced Search API call
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await safeJsonParse(res);
          setSearchResults(data || []);
          setActiveIndex(-1);
        } else {
          setSearchResults([]);
          setSearchError("Failed to fetch stocks.");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSearchResults([]);
          setSearchError("Connection error.");
        }
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(delayDebounce);
    };
  }, [searchQuery]);

  // Progressive background load for Developments
  useEffect(() => {
    if (!isCompared || selectedStocks.length < 2) {
      return;
    }

    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsResponse(null);

      const symbols = selectedStocks.map((s) => s.symbol);
      try {
        const res = await fetch("/api/stocks/compare/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols }),
        });

        if (res.ok) {
          const data: NewsAPIResponse = await safeJsonParse(res);
          setNewsResponse(data);
          console.log(`[NewsData Pipeline Verified] status: ${data.status} | fetchedCount: ${data.fetchedCount} | relevantCount: ${data.relevantCount}`);
        } else {
          console.error("Failed to fetch news route payload.");
          setNewsResponse({
            developments: [],
            status: "error",
            provider: "newsdata",
            fetchedCount: 0,
            relevantCount: 0,
            error: "HTTP error returned from route."
          });
        }
      } catch (err) {
        console.error("News API request failed:", err);
        setNewsResponse({
          developments: [],
          status: "error",
          provider: "newsdata",
          fetchedCount: 0,
          relevantCount: 0,
          error: String(err)
        });
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, [isCompared, selectedStocks]);

  // URL Sharing support: Load symbols on mount if present in query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const stocksParam = searchParams.get("stocks") || searchParams.get("symbols");
    if (stocksParam) {
      const symbols = stocksParam.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
      if (symbols.length >= 2 && symbols.length <= 5) {
        const loadInitialStocks = async () => {
          setLoadingFinancials(true);
          const resolved = [];
          for (const sym of symbols) {
            try {
              const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(sym)}`);
              if (res.ok) {
                const data = await safeJsonParse(res);
                const exact = (data || []).find((item: any) => item.symbol.toUpperCase() === sym);
                if (exact) resolved.push(exact);
                else if (data && data.length > 0) resolved.push(data[0]);
              }
            } catch (err) {
              console.error(err);
            }
          }
          if (resolved.length >= 2) {
            setSelectedStocks(resolved);
            // Trigger comparison automatically
            runComparison(resolved);
          } else {
            setLoadingFinancials(false);
          }
        };
        loadInitialStocks();
      }
    }
  }, [runComparison]);

  const selectStock = (instrument: SearchInstrument, index: number) => {
    if (selectedStocks.some((s) => s.symbol === instrument.symbol)) {
      setSearchingIndex(null);
      setSearchQuery("");
      return;
    }

    setSelectedStocks((prev) => {
      const copy = [...prev];
      if (index < copy.length) {
        copy[index] = instrument;
      } else {
        copy.push(instrument);
      }
      return copy;
    });

    setSearchingIndex(null);
    setSearchQuery("");
  };

  const removeStock = (symbol: string) => {
    const updated = selectedStocks.filter((s) => s.symbol !== symbol);
    setSelectedStocks(updated);
    setComparisonData(null);
    setAiAnalysis(null);
    setNewsResponse(null);
    setIsCompared(false);

    // Update URL query parameters silently
    if (typeof window !== "undefined") {
      if (updated.length >= 2) {
        const symbols = updated.map(s => s.symbol);
        window.history.replaceState(null, "", `/compare?stocks=${symbols.join(",")}`);
      } else {
        window.history.replaceState(null, "", "/compare");
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < searchResults.length) {
        selectStock(searchResults[activeIndex], index);
      }
    } else if (e.key === "Escape") {
      setSearchingIndex(null);
      setSearchQuery("");
    }
  };

  // Run decoupled stock comparison
  const runComparison = useCallback(async (overrideStocks?: SearchInstrument[]) => {
    const stocksToCompare = overrideStocks || selectedStocks;
    if (stocksToCompare.length < 2) return;

    setLoadingFinancials(true);
    setLoadingAI(true);
    setFinancialsError(null);
    setAiError(null);
    setComparisonData(null);
    setAiAnalysis(null);
    setIsCompared(true);

    const symbols = stocksToCompare.map((s) => s.symbol);

    // Update URL query parameters silently
    if (typeof window !== "undefined") {
      const newUrl = `/compare?stocks=${symbols.join(",")}`;
      window.history.replaceState(null, "", newUrl);
    }

    try {
      const res = await fetch("/api/stocks/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols, runAI: false }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let errJson: any = {};
        try { errJson = JSON.parse(text); } catch {}
        throw new Error(errJson?.error || "Failed to process stock comparison.");
      }

      const data = await safeJsonParse(res);
      setComparisonData(data ? data.comparison : null);
      setLoadingFinancials(false);

      // Fetch Groq AI analysis
      try {
        const aiRes = await fetch("/api/stocks/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols, runAI: true }),
        });

        if (!aiRes.ok) {
          const text = await aiRes.text().catch(() => "");
          let errJson: any = {};
          try { errJson = JSON.parse(text); } catch {}
          throw new Error(errJson?.error || "AI completion failed.");
        }

        const aiData = await safeJsonParse(aiRes);
        if (aiData && aiData.aiError) {
          setAiError(aiData.aiError);
        } else if (aiData) {
          setAiAnalysis(aiData.aiResponse);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setAiError(msg || "AI Analysis is temporarily unavailable.");
      } finally {
        setLoadingAI(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFinancialsError(msg || "An error occurred during comparison.");
      setLoadingFinancials(false);
      setLoadingAI(false);
    }
  }, [selectedStocks]);

  // Helper values for rendering the selector slots
  const slots = Array.from({ length: Math.max(3, Math.min(5, selectedStocks.length + 1)) });

  // Simple Mode translators for key metrics
  const getSimpleLabel = (comp: MetricComparison, name: string): string => {
    if (comp.position === "N/A") return "N/A";
    
    const isValuation = ["pe", "pb", "evebitda"].includes(name.toLowerCase());
    
    if (isValuation) {
      if (comp.position === "above-sector") return "Premium to Sector";
      if (comp.position === "below-sector") return "Discount to Sector";
      return "Inline with Sector";
    }

    // Profitability/Capital Efficiency
    if (comp.position === "above-sector") return `Above Sector`;
    if (comp.position === "below-sector") return `Below Sector`;
    return `Inline with Sector`;
  };

  // Ratio search helper
  const getRatioValue = (stock: StockCompareResult, aliases: string[]): string => {
    const item = stock.ratios?.find((r) => 
      aliases.some(alias => r.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(alias.toLowerCase()))
    );
    return item ? item.companyValue : "—";
  };

  const getPEValuationLabel = (comp: MetricComparison): string => {
    if (comp.position === "N/A" || !comp.diffPercent) return "N/A";
    const diffVal = Math.abs(comp.diffPercent);
    if (comp.diffPercent <= -25) return `${diffVal.toFixed(1)}% Strong Discount`;
    if (comp.diffPercent < -10) return `${diffVal.toFixed(1)}% Discount`;
    if (comp.diffPercent >= 25) return `${diffVal.toFixed(1)}% Strong Premium`;
    if (comp.diffPercent > 10) return `${diffVal.toFixed(1)}% Premium`;
    return "Balanced / Sector Level";
  };

  // Slider marker offset calculation
  const getValuationOffset = (comp: MetricComparison): number => {
    if (comp.position === "N/A" || !comp.diffPercent) return 50;
    const cap = Math.max(-40, Math.min(40, comp.diffPercent));
    return 50 + (cap / 40) * 40;
  };

  // Deterministic Key Differences
  const generateKeyDifferences = (stocks: StockCompareResult[]) => {
    const list: { type: "positive" | "warning" | "neutral"; text: string }[] = [];
    if (stocks.length === 2) {
      const [s1, s2] = stocks;
      const pe1 = parseFloat(s1.pe.companyValue);
      const pe2 = parseFloat(s2.pe.companyValue);
      const roe1 = parseFloat(s1.roe.companyValue);
      const roe2 = parseFloat(s2.roe.companyValue);
      const roce1 = parseFloat(s1.roce.companyValue);
      const roce2 = parseFloat(s2.roce.companyValue);
      const ret1 = s1.return1Y ?? 0;
      const ret2 = s2.return1Y ?? 0;

      if (!isNaN(roe1) && !isNaN(roe2) && Math.abs(roe1 - roe2) > 1) {
        const winner = roe1 > roe2 ? s1 : s2;
        const loser = roe1 > roe2 ? s2 : s1;
        const valW = roe1 > roe2 ? roe1 : roe2;
        const valL = roe1 > roe2 ? roe2 : roe1;
        list.push({
          type: "positive",
          text: `${winner.symbol} has stronger ROE: ${valW.toFixed(1)}% vs ${loser.symbol} (${valL.toFixed(1)}%)`,
        });
      }

      if (!isNaN(roce1) && !isNaN(roce2) && Math.abs(roce1 - roce2) > 1) {
        const winner = roce1 > roce2 ? s1 : s2;
        const loser = roce1 > roce2 ? s2 : s1;
        const valW = roce1 > roce2 ? roce1 : roce2;
        const valL = roce1 > roce2 ? roce2 : roce1;
        list.push({
          type: "positive",
          text: `${winner.symbol} has stronger ROCE: ${valW.toFixed(1)}% vs ${loser.symbol} (${valL.toFixed(1)}%)`,
        });
      }

      if (!isNaN(pe1) && !isNaN(pe2) && pe1 > 0 && pe2 > 0 && Math.abs(pe1 - pe2) > 1) {
        const cheaper = pe1 < pe2 ? s1 : s2;
        const costlier = pe1 < pe2 ? s2 : s1;
        list.push({
          type: "positive",
          text: `${cheaper.symbol} trades at a lower P/E multiplier (${cheaper.pe.companyValue}x) compared to ${costlier.symbol} (${costlier.pe.companyValue}x)`,
        });
      }

      if (Math.abs(ret1 - ret2) > 1) {
        const winner = ret1 > ret2 ? s1 : s2;
        const loser = ret1 > ret2 ? s2 : s1;
        const valW = ret1 > ret2 ? ret1 : ret2;
        const valL = ret1 > ret2 ? ret2 : ret1;
        list.push({
          type: "neutral",
          text: `${winner.symbol} delivered better 1-year historical return: ${valW > 0 ? "+" : ""}${valW.toFixed(1)}% vs ${loser.symbol} (${valL > 0 ? "+" : ""}${valL.toFixed(1)}%)`,
        });
      }

      if (s1.dma200Position === "below-dma" && s2.dma200Position === "below-dma") {
        list.push({
          type: "warning",
          text: `Both stocks are trading below their long-term 200 DMA, suggesting downward price momentum.`,
        });
      }
    }
    return list;
  };

  const keyDifferences = comparisonData ? generateKeyDifferences(comparisonData.stocks) : [];
  const sectorList = comparisonData?.stocks.map((s) => `${s.symbol} (${s.sector})`).join(", ");



  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 bg-[#F7F8FA] dark:bg-black text-[#111827] dark:text-neutral-100 min-h-screen">
      
      {/* 1. STOCK SELECTOR */}
      <section className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 shadow-xs border border-neutral-200 dark:border-[#1f1f1f]">
        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#667085] dark:text-neutral-400 mb-4">
          Select Equities to Compare
        </h2>

        {isCompared ? (
          <div className="flex flex-wrap items-center gap-3">
            {selectedStocks.map((stock) => (
              <div 
                key={stock.symbol} 
                className="flex items-center space-x-3 bg-[#F7F8FA] dark:bg-[#161616] px-4 py-2 border border-neutral-200 dark:border-[#1f1f1f] rounded-lg text-sm font-semibold"
              >
                <div className="flex flex-col">
                  <span className="text-[#0F766E] dark:text-teal-400 font-bold">{stock.symbol}</span>
                  <span className="text-[11px] text-[#667085] dark:text-neutral-500 font-normal truncate max-w-[120px]">
                    {stock.name}
                  </span>
                </div>
                <button 
                  onClick={() => removeStock(stock.symbol)} 
                  className="text-[#667085] hover:text-red-500 transition-colors p-1 cursor-pointer rounded-full hover:bg-neutral-200 dark:hover:bg-zinc-800"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {selectedStocks.length < 5 && (
              <button 
                onClick={() => {
                  setIsCompared(false);
                  setNewsResponse(null);
                  setSearchingIndex(selectedStocks.length);
                }}
                className="text-sm text-[#0F766E] dark:text-teal-400 hover:text-teal-650 dark:hover:text-teal-300 font-bold px-3 py-2 cursor-pointer border border-dashed border-[#0F766E]/20 rounded-lg bg-[#0F766E]/5 hover:bg-[#0F766E]/10"
              >
                + Add Stock
              </button>
            )}
            <button
              onClick={runComparison}
              disabled={selectedStocks.length < 2 || loadingFinancials}
              className="ml-auto text-sm bg-[#0F766E] text-white hover:bg-teal-800 px-6 py-2.5 font-bold rounded-lg transition-colors flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              {loadingFinancials ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>Compare</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6" ref={containerRef}>
            {slots.map((_, idx) => {
              const stock = selectedStocks[idx];
              const isSearching = searchingIndex === idx;

              if (stock) {
                return (
                  <div 
                    key={stock.symbol}
                    className="h-32 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl p-4 bg-[#F7F8FA] dark:bg-[#161616] flex flex-col justify-between group relative"
                  >
                    <button
                      onClick={() => removeStock(stock.symbol)}
                      className="absolute top-3 right-3 text-[#667085] hover:text-red-500 transition-colors p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Remove stock"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="space-y-1">
                      <span className="text-[10px] tabular-nums text-[#667085] dark:text-neutral-400 uppercase bg-white dark:bg-zinc-800 px-2 py-0.5 border border-neutral-200 dark:border-zinc-700 rounded-md tracking-wider">
                        {stock.exchange}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-[#111827] dark:text-neutral-100 truncate pr-6 mt-2">
                        {stock.name}
                      </h3>
                    </div>
                    <div className="text-[11px] tabular-nums text-[#667085] dark:text-neutral-450 flex justify-between items-center">
                      <span className="font-bold text-[#0F766E] dark:text-teal-400">{stock.symbol}</span>
                      <span className="truncate max-w-[80px] text-[10px]">{stock.isin}</span>
                    </div>
                  </div>
                );
              }

              if (isSearching) {
                return (
                  <div 
                    key={`searching-${idx}`}
                    className="h-32 border border-neutral-400 dark:border-neutral-600 rounded-xl p-4 bg-white dark:bg-[#0a0a0a] flex flex-col justify-between relative shadow-sm"
                  >
                    <div className="relative flex items-center">
                      <Search className="absolute left-2.5 h-4 w-4 text-neutral-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchQuery(val);
                          if (val.trim().length < 2) {
                            setSearchResults([]);
                            setSearchError(null);
                          }
                        }}
                        onKeyDown={(e) => handleSearchKeyDown(e, idx)}
                        placeholder="Type symbol..."
                        className="w-full pl-9 pr-2 py-1 text-xs sm:text-sm bg-transparent border-b border-neutral-200 dark:border-zinc-700 focus:outline-none focus:border-[#0f766e] text-[#111827] dark:text-neutral-100"
                      />
                      {searchLoading && (
                        <Loader2 className="absolute right-2 h-4 w-4 text-neutral-400 animate-spin" />
                      )}
                    </div>

                    {searchQuery.trim().length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {searchError ? (
                          <div className="px-3 py-3 text-xs text-red-500 text-center">
                            {searchError}
                          </div>
                        ) : searchResults.length > 0 ? (
                          <ul className="py-1">
                            {searchResults.map((item, sIdx) => (
                              <li
                                key={item.instrumentKey}
                                onClick={() => selectStock(item, idx)}
                                onMouseEnter={() => setActiveIndex(sIdx)}
                                className={`px-4 py-2.5 text-xs sm:text-sm cursor-pointer flex justify-between items-center transition-colors ${
                                  sIdx === activeIndex
                                    ? "bg-[#F7F8FA] dark:bg-zinc-800 text-[#111827] dark:text-neutral-100"
                                    : "text-[#667085] dark:text-neutral-400"
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold">{item.symbol}</span>
                                  <span className="text-[10px] truncate max-w-[140px]">{item.name}</span>
                                </div>
                                <span className="text-[9px] uppercase tracking-wider bg-[#F7F8FA] dark:bg-zinc-850 px-2 py-0.5 rounded-md border border-[#E5E7EB] dark:border-zinc-700 text-[#667085] dark:text-neutral-450">
                                  {item.exchange}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          !searchLoading && (
                            <div className="px-3 py-3 text-xs text-[#667085] text-center">
                              No stocks found.
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setSearchingIndex(null);
                        setSearchQuery("");
                      }}
                      className="text-xs text-[#667085] hover:text-[#111827] dark:hover:text-neutral-100 transition-colors self-end mt-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                );
              }

              return (
                <div 
                  key={`empty-${idx}`}
                  onClick={() => {
                    setSearchingIndex(idx);
                    setSearchQuery("");
                  }}
                  className="h-32 border border-dashed border-neutral-200 dark:border-[#1f1f1f] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-neutral-450 dark:hover:border-neutral-550 transition-all duration-150 bg-[#F7F8FA] hover:bg-neutral-100 dark:bg-[#161616]/40 dark:hover:bg-[#161616]/80 group"
                >
                  <span className="text-xs font-semibold text-[#667085] dark:text-neutral-450 group-hover:text-[#111827] dark:group-hover:text-neutral-100 transition-colors">
                    + Add Stock
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {!isCompared && (
          <div className="pt-4">
            <button
              onClick={runComparison}
              disabled={selectedStocks.length < 2 || loadingFinancials}
              className={`px-8 py-3 text-sm font-bold rounded-xl transition-all flex items-center space-x-2 cursor-pointer ${
                selectedStocks.length >= 2 && !loadingFinancials
                  ? "bg-[#0F766E] text-white hover:bg-teal-850 shadow-sm"
                  : "bg-[#F7F8FA] dark:bg-[#161616] text-[#667085] dark:text-neutral-500 border border-neutral-200 dark:border-[#1f1f1f] cursor-not-allowed opacity-60"
              }`}
            >
              {loadingFinancials ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Comparing Metrics...</span>
                </>
              ) : (
                <span>Compare Stocks</span>
              )}
            </button>
          </div>
        )}
      </section>

      {/* 2. RESULTS CONTAINER */}
      {isCompared && (
        <div className="space-y-16">
          
          {loadingFinancials && (
            <div className="py-24 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-neutral-200 dark:border-[#1f1f1f] shadow-xs">
              <Loader2 className="h-10 w-10 text-[#0F766E] dark:text-teal-400 animate-spin" />
              <span className="text-sm font-bold text-[#667085] dark:text-neutral-400">Assembling side-by-side fundamentals...</span>
            </div>
          )}

          {financialsError && (
            <div className="p-5 border border-red-500/20 rounded-xl bg-red-50/50 dark:bg-red-950/5 text-sm text-red-650 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-550" />
              <span>{financialsError}</span>
            </div>
          )}

          {!loadingFinancials && comparisonData && (
            <div className="space-y-16">

              {/* View Mode & Subtitle Header */}
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-[#1f1f1f] pb-4">
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-neutral-100 tracking-tight">
                    Fight of Stocks Comparison
                  </h1>
                  <p className="text-xs sm:text-sm text-[#667085] dark:text-neutral-400 font-normal mt-1">
                    Nifty Equities sector-relative benchmarking and visual fundamentals
                  </p>
                </div>
                <div className="flex space-x-1 bg-[#F7F8FA] dark:bg-[#161616] p-1 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setViewMode("simple")}
                    className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      viewMode === "simple"
                        ? "bg-white dark:bg-[#0a0a0a] text-[#111827] dark:text-neutral-100 shadow-xs border border-neutral-200 dark:border-[#1f1f1f]"
                        : "text-[#667085] dark:text-neutral-400 hover:text-[#111827] dark:hover:text-neutral-100"
                    }`}
                  >
                    Simple Mode
                  </button>
                  <button
                    onClick={() => setViewMode("detailed")}
                    className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      viewMode === "detailed"
                        ? "bg-white dark:bg-[#0a0a0a] text-[#111827] dark:text-neutral-100 shadow-xs border border-neutral-200 dark:border-[#1f1f1f]"
                        : "text-[#667085] dark:text-neutral-400 hover:text-[#111827] dark:hover:text-neutral-100"
                    }`}
                  >
                    Detailed Mode
                  </button>
                </div>
              </div>

              {/* Cross-Industry Warn Banner */}
              {comparisonData.summary.crossIndustry && (
                <div className="p-5 border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/5 rounded-xl text-xs sm:text-sm text-[#667085] dark:text-neutral-400 flex items-start space-x-3 leading-relaxed shadow-2xs">
                  <AlertTriangle className="h-5 w-5 text-amber-550 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#111827] dark:text-neutral-100 block mb-1">Cross-Industry comparison Active</span>
                    {comparisonData.stocks.map(s=>s.symbol).join(" & ")} operate in structurally different sectors ({sectorList}). Direct comparisons of absolute percentages (e.g. ROE) can be misleading. VolumeCall emphasizes each company&apos;s position relative to its own sector.
                  </div>
                </div>
              )}

              {/* 2. FIGHT HEADER / VS HERO (FOR 2 STOCKS ONLY) */}
              {comparisonData.stocks.length === 2 && (
                <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-8">
                  <div className="grid grid-cols-7 gap-6 items-center">
                    
                    {/* Stock 1 */}
                    <div className="col-span-3 text-left space-y-2">
                      <span className="text-[11px] font-bold text-[#667085] dark:text-neutral-400 uppercase tracking-wider bg-[#F7F8FA] dark:bg-[#161616] px-2.5 py-1 border border-neutral-200 dark:border-[#1f1f1f] rounded-lg">
                        {comparisonData.stocks[0].sector}
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-neutral-100 tracking-tight mt-3">
                        {comparisonData.stocks[0].symbol}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#667085] dark:text-neutral-400 truncate">
                        {comparisonData.stocks[0].name}
                      </p>
                      <div className="text-2xl font-bold tabular-nums text-[#111827] dark:text-neutral-100 pt-1">
                        {comparisonData.stocks[0].price !== null ? formatCurrency(comparisonData.stocks[0].price) : "—"}
                      </div>
                    </div>
                    
                    {/* VS marker */}
                    <div className="col-span-1 text-center">
                      <span className="px-4 py-2 bg-[#F7F8FA] dark:bg-[#161616] border border-neutral-200 dark:border-[#1f1f1f] rounded-full text-xs font-black text-[#667085] dark:text-neutral-400">
                        VS
                      </span>
                    </div>

                    {/* Stock 2 */}
                    <div className="col-span-3 text-right space-y-2">
                      <span className="text-[11px] font-bold text-[#667085] dark:text-neutral-400 uppercase tracking-wider bg-[#F7F8FA] dark:bg-[#161616] px-2.5 py-1 border border-neutral-200 dark:border-[#1f1f1f] rounded-lg">
                        {comparisonData.stocks[1].sector}
                      </span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-neutral-100 tracking-tight mt-3">
                        {comparisonData.stocks[1].symbol}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#667085] dark:text-neutral-400 truncate">
                        {comparisonData.stocks[1].name}
                      </p>
                      <div className="text-2xl font-bold tabular-nums text-[#111827] dark:text-neutral-100 pt-1">
                        {comparisonData.stocks[1].price !== null ? formatCurrency(comparisonData.stocks[1].price) : "—"}
                      </div>
                    </div>
                  </div>

                  {/* 5 Key Differences list inside VS hero */}
                  <div className="border-t border-neutral-200 dark:border-[#1f1f1f] pt-6 divide-y divide-neutral-200/40 dark:divide-[#1f1f1f]/40 text-xs sm:text-sm">
                    {/* Valuation row */}
                    <div className="grid grid-cols-7 py-3.5 items-center">
                      <div className="col-span-3 font-bold text-[#111827] dark:text-neutral-200">
                        {getSimpleLabel(comparisonData.stocks[0].pe, "Valuation")}
                      </div>
                      <div className="col-span-1 text-center text-[10px] sm:text-xs font-bold text-[#667085] dark:text-neutral-500 uppercase tracking-wider">Valuation</div>
                      <div className="col-span-3 text-right font-bold text-[#111827] dark:text-neutral-200">
                        {getSimpleLabel(comparisonData.stocks[1].pe, "Valuation")}
                      </div>
                    </div>
                    {/* Profitability row */}
                    <div className="grid grid-cols-7 py-3.5 items-center">
                      <div className="col-span-3 font-bold text-[#111827] dark:text-zinc-200">
                        {getSimpleLabel(comparisonData.stocks[0].roe, "ROE")}
                      </div>
                      <div className="col-span-1 text-center text-[10px] sm:text-xs font-bold text-[#667085] dark:text-neutral-500 uppercase tracking-wider">Profitability</div>
                      <div className="col-span-3 text-right font-bold text-[#111827] dark:text-zinc-200">
                        {getSimpleLabel(comparisonData.stocks[1].roe, "ROE")}
                      </div>
                    </div>
                    {/* Capital efficiency row */}
                    <div className="grid grid-cols-7 py-3.5 items-center">
                      <div className="col-span-3 font-bold text-[#111827] dark:text-zinc-200">
                        {getSimpleLabel(comparisonData.stocks[0].roce, "ROCE")}
                      </div>
                      <div className="col-span-1 text-center text-[10px] sm:text-xs font-bold text-[#667085] dark:text-neutral-500 uppercase tracking-wider">Efficiency</div>
                      <div className="col-span-3 text-right font-bold text-[#111827] dark:text-zinc-200">
                        {getSimpleLabel(comparisonData.stocks[1].roce, "ROCE")}
                      </div>
                    </div>
                    {/* Returns */}
                    <div className="grid grid-cols-7 py-3.5 items-center">
                      <div className={`col-span-3 tabular-nums font-bold ${
                        (comparisonData.stocks[0].return1Y ?? 0) < 0 ? "text-red-650" : "text-emerald-650"
                      }`}>
                        {comparisonData.stocks[0].return1Y !== null ? `${comparisonData.stocks[0].return1Y > 0 ? "+" : ""}${comparisonData.stocks[0].return1Y.toFixed(1)}%` : "—"}
                      </div>
                      <div className="col-span-1 text-center text-[10px] sm:text-xs font-bold text-[#667085] dark:text-neutral-500 uppercase tracking-wider">1Y Return</div>
                      <div className={`col-span-3 text-right tabular-nums font-bold ${
                        (comparisonData.stocks[1].return1Y ?? 0) < 0 ? "text-red-650" : "text-emerald-650"
                      }`}>
                        {comparisonData.stocks[1].return1Y !== null ? `${comparisonData.stocks[1].return1Y > 0 ? "+" : ""}${comparisonData.stocks[1].return1Y.toFixed(1)}%` : "—"}
                      </div>
                    </div>
                    {/* Market positioning */}
                    <div className="grid grid-cols-7 py-3.5 items-center">
                      <div className="col-span-3 font-bold text-[#111827] dark:text-zinc-200 capitalize">
                        {comparisonData.stocks[0].dma200Position.replace("-", " ")}
                      </div>
                      <div className="col-span-1 text-center text-[10px] sm:text-xs font-bold text-[#667085] dark:text-neutral-500 uppercase tracking-wider">200 DMA</div>
                      <div className="col-span-3 text-right font-bold text-[#111827] dark:text-zinc-200 capitalize">
                        {comparisonData.stocks[1].dma200Position.replace("-", " ")}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 3. ESSENTIAL COMPANY COMPARISON */}
              <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-6">
                <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-neutral-100">
                    Essential Comparison
                  </h3>
                  <p className="text-xs text-[#667085] dark:text-neutral-450 mt-1">
                    Authoritative financial metrics and calculated returns
                  </p>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-[#1f1f1f]">
                        <th className="py-3 text-[11px] font-bold text-[#667085] dark:text-neutral-450 uppercase tracking-wider">Financial Metric</th>
                        {comparisonData.stocks.map((stock) => (
                          <th key={stock.symbol} className="py-3 text-sm font-extrabold text-[#111827] dark:text-neutral-100 text-right">{stock.symbol}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/40 dark:divide-[#1f1f1f]/40 text-xs sm:text-sm">
                      {/* Price */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Current Price</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-extrabold tabular-nums text-[#111827] dark:text-neutral-100 text-base sm:text-lg">
                            {stock.price !== null ? formatCurrency(stock.price) : "—"}
                          </td>
                        ))}
                      </tr>
                      {/* Market Cap */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Market Cap</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-200">
                            {getRatioValue(stock, ["marketcap", "marketcapitalization"]) !== "—" 
                              ? getRatioValue(stock, ["marketcap", "marketcapitalization"]) 
                              : stock.profile?.sectorMarketCapInr?.formatted || "—"}
                          </td>
                        ))}
                      </tr>
                      {/* 52W High */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">52-Week High</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-bold text-[#111827] dark:text-neutral-200 tabular-nums">
                            {stock.high52W !== null ? `₹${stock.high52W.toFixed(0)}` : "—"}
                          </td>
                        ))}
                      </tr>
                      {/* 52W Low */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">52-Week Low</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-bold text-[#111827] dark:text-neutral-200 tabular-nums">
                            {stock.low52W !== null ? `₹${stock.low52W.toFixed(0)}` : "—"}
                          </td>
                        ))}
                      </tr>
                      {/* P/E */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Stock P/E</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-extrabold text-[#111827] dark:text-neutral-100 text-base tabular-nums">
                            {stock.pe.companyValue !== "N/A" ? `${stock.pe.companyValue}x` : "—"}
                          </td>
                        ))}
                      </tr>
                      {/* P/B */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Price-to-Book (P/B)</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-bold text-[#111827] dark:text-neutral-200 tabular-nums">
                            {stock.pb.companyValue !== "N/A" ? `${stock.pb.companyValue}x` : "—"}
                          </td>
                        ))}
                      </tr>
                      {/* Book Value */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Book Value</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-200">
                            {getRatioValue(stock, ["bookvalue", "bvps"])}
                          </td>
                        ))}
                      </tr>
                      {/* Dividend Yield */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Dividend Yield</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-200 tabular-nums">
                            {getRatioValue(stock, ["dividendyield", "divyield"])}
                          </td>
                        ))}
                      </tr>
                      {/* ROE */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">ROE</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-extrabold text-[#111827] dark:text-neutral-100 text-base tabular-nums">
                            {stock.roe.companyValue}
                          </td>
                        ))}
                      </tr>
                      {/* ROCE */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">ROCE</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-extrabold text-[#111827] dark:text-neutral-100 text-base tabular-nums">
                            {stock.roce.companyValue}
                          </td>
                        ))}
                      </tr>
                      {/* ROA */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">ROA</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-100 tabular-nums">
                            {stock.roa.companyValue}
                          </td>
                        ))}
                      </tr>
                      {/* EV/EBITDA */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">EV/EBITDA</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-100 tabular-nums">
                            {stock.evEbitda.companyValue !== "N/A" ? `${stock.evEbitda.companyValue}x` : "—"}
                          </td>
                        ))}
                      </tr>
                      {/* Quick Ratio */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Quick Ratio</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-100 tabular-nums">
                            {stock.quickRatio.companyValue !== "N/A" ? stock.quickRatio.companyValue : "—"}
                          </td>
                        ))}
                      </tr>
                      {/* Debt-to-Equity */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Debt-to-Equity</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-100 tabular-nums">
                            {getRatioValue(stock, ["debtoquity", "debtequity", "leverage"])}
                          </td>
                        ))}
                      </tr>
                      {/* Revenue Growth */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Revenue Growth</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-100 tabular-nums">
                            {getRatioValue(stock, ["revenuegrowth", "salesgrowth"])}
                          </td>
                        ))}
                      </tr>
                      {/* Profit Growth */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Profit Growth</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-100 tabular-nums">
                            {getRatioValue(stock, ["profitgrowth", "netprofitgrowth"])}
                          </td>
                        ))}
                      </tr>
                      {/* EPS */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">EPS</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-100 tabular-nums">
                            {getRatioValue(stock, ["eps", "earnings per share"])}
                          </td>
                        ))}
                      </tr>
                      {/* Operating Margin */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Operating Margin</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-100 tabular-nums">
                            {getRatioValue(stock, ["operatingmargin", "opm", "ebitdamargin"])}
                          </td>
                        ))}
                      </tr>
                      {/* Net Profit Margin */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">Net Profit Margin</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className="py-4 text-right font-semibold text-[#111827] dark:text-neutral-100 tabular-nums">
                            {getRatioValue(stock, ["netprofitmargin", "npm", "profitmargin"])}
                          </td>
                        ))}
                      </tr>
                      {/* 1Y Return */}
                      <tr>
                        <td className="py-4 text-[#667085] dark:text-neutral-400 font-medium">1-Year Return</td>
                        {comparisonData.stocks.map((stock) => (
                          <td key={stock.symbol} className={`py-4 text-right font-extrabold text-base tabular-nums ${
                            (stock.return1Y ?? 0) < 0 ? "text-red-650" : "text-emerald-650"
                          }`}>
                            {stock.return1Y !== null ? `${stock.return1Y > 0 ? "+" : ""}${stock.return1Y.toFixed(1)}%` : "—"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* HOW THIS COMPARISON IS CALCULATED (METHODOLOGY FORMULAS) */}
              <div className="border border-neutral-200 dark:border-[#1f1f1f] rounded-2xl bg-white dark:bg-[#0a0a0a] p-6 shadow-xs space-y-4">
                <button 
                  onClick={() => setMethodologyOpen(!methodologyOpen)} 
                  className="w-full flex justify-between items-center text-left font-bold text-base sm:text-lg text-neutral-800 dark:text-neutral-100 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-[#0F766E] dark:text-teal-400" />
                    <span>How this comparison is calculated (methodology & formulas)</span>
                  </div>
                  {methodologyOpen ? <ChevronUp className="h-5 w-5 text-neutral-500" /> : <ChevronDown className="h-5 w-5 text-neutral-500" />}
                </button>
                
                {methodologyOpen && (
                  <div className="pt-4 border-t border-neutral-200 dark:border-[#1f1f1f] space-y-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-250">Valuation & P/E positioning</h4>
                        <p>
                          Company P/E is calculated as <code>Market Price / Earnings Per Share (EPS)</code>. 
                          The relative difference with sector benchmark is computed as:
                          <code className="block my-1.5 p-2 bg-neutral-50 dark:bg-[#161616] rounded border border-neutral-200 dark:border-[#1f1f1f] tabular-nums text-xs">
                            Relative Difference % = ((Company P/E - Sector P/E) / Sector P/E) * 100
                          </code>
                          If company P/E is &le; 0 or sector P/E is &le; 0, valuation comparison is unavailable (multiple is not meaningful).
                          If the relative difference is &le; -10%, it is classified as a <strong>Discount</strong>. If &ge; +10%, it is classified as a <strong>Premium</strong>. Otherwise, it is <strong>Balanced / Near Sector</strong>.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-250">Profitability (ROE)</h4>
                        <p>
                          Return on Equity is calculated as <code>(Net Profit / Shareholders&apos; Equity) * 100</code>.
                          It measures the profit generated per unit of shareholder capital. Leverage (debt) can inflate ROE, so it should be evaluated alongside debt-to-equity levels.
                          An ROE &ge; 5.0 percentage points above the sector average is highlighted as a strength; &le; -5.0 percentage points below is a watchpoint.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-250">Capital Efficiency (ROCE)</h4>
                        <p>
                          Return on Capital Employed measures returns generated relative to total capital deployed (debt + equity).
                          It is highly useful for comparing capital efficiency across capital-intensive businesses. 
                          A ROCE &ge; 5.0 percentage points above the sector average is flagged as a strength; &le; -5.0 percentage points below is a watchpoint.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-250">Price-to-Book (P/B)</h4>
                        <p>
                          The P/B ratio compares market capitalization to the company&apos;s book assets value.
                          A lower P/B is not automatically &quot;better,&quot; as it can reflect low asset utilization or poor asset quality.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-250">Dividend Yield</h4>
                        <p>
                          Represents annual dividend payouts divided by share price. Higher yield is not always better; it can indicate stagnant growth or declining share price.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-250">52-Week Range & Market Cap</h4>
                        <p>
                          The 52-week high and low indicate price range positioning relative to historical boundaries, which is a momentum indicator rather than fundamental quality.
                          Market Cap measures the equity market value of the company; a larger market capitalization does not automatically imply fundamental superiority.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. KEY DIFFERENCES */}
              {keyDifferences.length > 0 && (
                <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-neutral-100">
                    Key Differences
                  </h3>
                  <div className="grid grid-cols-1 gap-3.5 pt-1">
                    {keyDifferences.map((diff, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start space-x-3 p-4 rounded-xl text-sm leading-relaxed ${
                          diff.type === "positive" 
                            ? "bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-800 dark:text-emerald-450 border border-emerald-500/10" 
                            : diff.type === "warning"
                            ? "bg-amber-50/50 dark:bg-amber-950/10 text-amber-800 dark:text-amber-450 border border-amber-500/10"
                            : "bg-neutral-50 dark:bg-[#161616] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#1f1f1f]"
                        }`}
                      >
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                        <span className="font-semibold">{diff.text}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 5. VALUATION SECTION (REDESIGNED) */}
              <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-6">
                <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-neutral-100">
                    Valuation positioning
                  </h3>
                  <p className="text-xs text-[#667085] dark:text-neutral-400">
                    Multiples analyzed relative to sector averages
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {comparisonData.stocks.map((stock) => {
                    const offset = getValuationOffset(stock.pe);
                    const isN_A = stock.pe.position === "N/A" || !stock.pe.diffPercent;

                    return (
                      <div key={stock.symbol} className="space-y-4 p-5 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616]">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-base">{stock.symbol}</span>
                          <span className="text-xs tabular-nums text-[#667085] dark:text-neutral-400">
                            P/E: {stock.pe.companyValue} (Sector: {stock.pe.sectorValue})
                          </span>
                        </div>

                        {!isN_A ? (
                          <div className="space-y-2 pt-2">
                            <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full relative overflow-hidden flex border border-neutral-200 dark:border-neutral-700">
                              <div className="h-full flex-1 border-r border-neutral-200/25 bg-emerald-500/10" title="Discount" />
                              <div className="h-full flex-1 border-r border-neutral-200/25 bg-teal-500/5" title="Balanced" />
                              <div className="h-full flex-1 bg-amber-500/10" title="Premium" />
                              <div 
                                className="absolute top-0 bottom-0 w-3.5 bg-[#0F766E] dark:bg-teal-400 rounded-full shadow-md transition-all duration-300"
                                style={{ left: `calc(${offset}% - 7px)` }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] font-bold text-[#667085] dark:text-neutral-500 uppercase tracking-wider">
                              <span className="text-emerald-600 dark:text-emerald-400">Cheaper / Discount</span>
                              <span>Balanced</span>
                              <span className="text-amber-600 dark:text-amber-500">Premium / Costlier</span>
                            </div>
                            <span className="text-xs text-[#0F766E] dark:text-teal-400 font-bold block pt-1">
                              {getPEValuationLabel(stock.pe)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-[#667085] dark:text-neutral-400 italic pt-2">
                            Valuation comparison unavailable because P/E is not meaningful when earnings or the benchmark multiple is non-positive.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-[#1f1f1f]">
                  <span className="text-xs font-bold text-[#111827] dark:text-zinc-200 block uppercase tracking-wider mb-2">How to read this</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#667085] dark:text-neutral-400 leading-relaxed font-normal">
                    <p>
                      <strong>Premium:</strong> The stock trades at a higher valuation multiple than its sector. This may reflect stronger growth expectations, quality, margins, or market expectations and does not automatically mean the stock is overvalued.
                    </p>
                    <p>
                      <strong>Discount:</strong> The stock trades at a lower valuation multiple than its sector. This can indicate a cheaper valuation, but may also reflect slower growth, weaker profitability or higher perceived risk.
                    </p>
                  </div>
                </div>
              </section>

              {/* 6. PROFITABILITY & CAPITAL EFFICIENCY */}
              <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-6">
                <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-neutral-100">
                    Profitability & Capital Efficiency
                  </h3>
                  <p className="text-xs text-[#667085] dark:text-neutral-400">
                    Return metrics bench-marked against specific sector averages
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* ROE Card */}
                  <div className="p-5 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#667085] dark:text-neutral-400">ROE</span>
                    <div className="space-y-3 pt-1">
                      {comparisonData.stocks.map((stock) => {
                        const scoreStr = stock.roe.companyValue;
                        const isAbove = stock.roe.position === "above-sector";
                        return (
                          <div key={stock.symbol} className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="font-semibold text-[#667085] dark:text-neutral-400">{stock.symbol}</span>
                            <div className="flex flex-col items-end">
                              <span className="font-extrabold text-base text-[#111827] dark:text-neutral-100 tabular-nums">{scoreStr}</span>
                              <span className={`text-[10px] font-bold ${
                                isAbove ? "text-emerald-600 dark:text-emerald-455" : "text-amber-605 dark:text-amber-500"
                              }`}>
                                {stock.roe.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ROCE Card */}
                  <div className="p-5 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#667085] dark:text-neutral-400">ROCE</span>
                    <div className="space-y-3 pt-1">
                      {comparisonData.stocks.map((stock) => {
                        const scoreStr = stock.roce.companyValue;
                        const isAbove = stock.roce.position === "above-sector";
                        return (
                          <div key={stock.symbol} className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="font-semibold text-[#667085] dark:text-neutral-400">{stock.symbol}</span>
                            <div className="flex flex-col items-end">
                              <span className="font-extrabold text-base text-[#111827] dark:text-neutral-100 tabular-nums">{scoreStr}</span>
                              <span className={`text-[10px] font-bold ${
                                isAbove ? "text-emerald-600 dark:text-emerald-455" : "text-amber-605 dark:text-amber-500"
                              }`}>
                                {stock.roce.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ROA Card */}
                  <div className="p-5 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#667085] dark:text-neutral-400">ROA</span>
                    <div className="space-y-3 pt-1">
                      {comparisonData.stocks.map((stock) => {
                        const scoreStr = stock.roa.companyValue;
                        const isAbove = stock.roa.position === "above-sector";
                        return (
                          <div key={stock.symbol} className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="font-semibold text-[#667085] dark:text-neutral-400">{stock.symbol}</span>
                            <div className="flex flex-col items-end">
                              <span className="font-extrabold text-base text-[#111827] dark:text-neutral-100 tabular-nums">{scoreStr}</span>
                              <span className={`text-[10px] font-bold ${
                                isAbove ? "text-emerald-600 dark:text-emerald-455" : "text-amber-650 dark:text-amber-500"
                              }`}>
                                {stock.roa.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-[#1f1f1f] text-xs text-[#667085] dark:text-neutral-400 leading-relaxed font-normal">
                  <p>
                    <strong>ROE (Return on Equity):</strong> Measures how effectively the company turns shareholder equity into net income. It is an excellent indicator of shareholder returns. Note that high debt leverage can inflate ROE.
                  </p>
                  <p className="mt-2">
                    <strong>ROCE (Return on Capital Employed):</strong> Evaluates profits relative to total capital (debt + equity) deployed. Sector averages vary heavily depending on structural capital cycles.
                  </p>
                </div>
              </section>

              {/* 7. GROWTH SECTION */}
              {viewMode === "detailed" && (
                <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-6">
                  <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-neutral-100">
                      Growth Indicators
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] text-xs text-[#667085] dark:text-neutral-400">
                      <span className="font-bold text-[#111827] dark:text-neutral-100 block mb-1">Revenue Growth</span>
                      {comparisonData.stocks.map((stock) => (
                        <div key={stock.symbol} className="flex justify-between py-1 border-b border-neutral-200 dark:border-zinc-800">
                          <span>{stock.symbol}</span>
                          <span className="tabular-nums font-bold text-[#111827] dark:text-neutral-200">{getRatioValue(stock, ["revenuegrowth", "salesgrowth"])}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] text-xs text-[#667085] dark:text-neutral-400">
                      <span className="font-bold text-[#111827] dark:text-neutral-100 block mb-1">Net Profit Growth</span>
                      {comparisonData.stocks.map((stock) => (
                        <div key={stock.symbol} className="flex justify-between py-1 border-b border-neutral-200 dark:border-zinc-800">
                          <span>{stock.symbol}</span>
                          <span className="tabular-nums font-bold text-[#111827] dark:text-neutral-200">{getRatioValue(stock, ["profitgrowth", "netprofitgrowth"])}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] text-xs text-[#667085] dark:text-neutral-500 flex flex-col justify-center text-center">
                      <span className="italic block">Multi-year CAGRs (3Y/5Y) are currently unavailable from Upstox.</span>
                    </div>
                  </div>
                </section>
              )}

              {/* 8. FINANCIAL HEALTH */}
              {viewMode === "detailed" && (
                <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-6">
                  <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-neutral-100">
                      Financial Health
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Debt / Equity */}
                    <div className="p-5 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#667085] dark:text-neutral-400">Debt-to-Equity</span>
                      <div className="space-y-2 pt-1 text-xs">
                        {comparisonData.stocks.map((stock) => {
                          const val = getRatioValue(stock, ["debtoquity", "debtequity", "leverage"]);
                          const num = parseFloat(val);
                          const isLow = !isNaN(num) && num < 0.5;
                          return (
                            <div key={stock.symbol} className="flex justify-between items-center py-1">
                              <span className="font-bold">{stock.symbol}</span>
                              <div className="flex items-center space-x-2">
                                <span className="tabular-nums font-bold text-sm text-[#111827] dark:text-neutral-200">{val}</span>
                                {val !== "—" && (
                                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-extrabold uppercase ${
                                    isLow ? "bg-emerald-50 text-emerald-700 border border-emerald-500/10" : "bg-amber-50 text-amber-700 border border-amber-500/10"
                                  }`}>
                                    {isLow ? "Low Debt" : "Leveraged"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Ratio */}
                    <div className="p-5 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#667085] dark:text-neutral-400">Quick Ratio</span>
                      <div className="space-y-2 pt-1 text-xs">
                        {comparisonData.stocks.map((stock) => {
                          const val = stock.quickRatio.companyValue;
                          const num = parseFloat(val);
                          const isStrong = !isNaN(num) && num >= 1.0;
                          return (
                            <div key={stock.symbol} className="flex justify-between items-center py-1">
                              <span className="font-bold">{stock.symbol}</span>
                              <div className="flex items-center space-x-2">
                                <span className="tabular-nums font-bold text-sm text-[#111827] dark:text-neutral-200">{val}</span>
                                {val !== "N/A" && (
                                  <span className={`px-2 py-0.5 rounded-sm text-[9px] font-extrabold uppercase ${
                                    isStrong ? "bg-emerald-50 text-emerald-700 border border-emerald-500/10" : "bg-amber-50 text-amber-700 border border-amber-500/10"
                                  }`}>
                                    {isStrong ? "Strong Cash" : "Tight Liquidity"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* FCF / cash flow */}
                    <div className="p-5 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] flex flex-col justify-center text-xs text-[#667085] dark:text-neutral-500 italic text-center">
                      <span>Interest coverage and free cash flows are currently not provided by Upstox key ratios.</span>
                    </div>
                  </div>
                </section>
              )}



              {/* 10. POSITIVE INDICATORS & WATCHPOINTS (STRENGTHS SUMMARY) */}
              <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-6">
                <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-neutral-100">
                    Strengths & Watchpoints summary
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {comparisonData.stocks.map((stock) => {
                    const strengths = stock.insights.filter(i => i.classification === "positive");
                    const watch = stock.insights.filter(i => i.classification === "watchpoint");

                    return (
                      <div key={stock.symbol} className="p-5 border border-neutral-200 dark:border-[#1f1f1f] rounded-xl bg-neutral-50 dark:bg-[#161616] space-y-4">
                        <span className="font-extrabold text-sm border-b border-neutral-200 dark:border-neutral-700 pb-1.5 block text-[#0F766E] dark:text-teal-400">
                          {stock.symbol} Highlights
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Strengths */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-450 block">Strengths</span>
                            {strengths.length > 0 ? (
                              <ul className="space-y-2 text-xs">
                                {strengths.map((s, idx) => (
                                  <li key={idx} className="flex items-start space-x-1.5 leading-relaxed font-medium">
                                    <span className="text-emerald-600">✓</span>
                                    <span>{s.metric}: {s.actualValue}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-xs text-[#667085] italic">No highlights resolved.</span>
                            )}
                          </div>

                          {/* Watchpoints */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 block">Watchpoints</span>
                            {watch.length > 0 ? (
                              <ul className="space-y-2 text-xs">
                                {watch.map((w, idx) => (
                                  <li key={idx} className="flex items-start space-x-1.5 leading-relaxed font-medium">
                                    <span className="text-amber-500">⚠</span>
                                    <span>{w.metric}: {w.actualValue}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-xs text-[#667085] italic">No warnings resolved.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 11. RECENT RESULTS & DEVELOPMENTS */}
              <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-6">
                <div className="border-b border-neutral-200 dark:border-[#1f1f1f] pb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-neutral-100">
                    Recent Results & Developments
                  </h3>
                  <p className="text-xs text-[#667085] dark:text-neutral-400">
                    Latest quarterly results and corporate events matched from NewsData.io
                  </p>
                </div>

                {newsLoading && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-neutral-50 dark:bg-[#161616] border border-dashed border-neutral-200 dark:border-[#1f1f1f] rounded-xl">
                    <Loader2 className="h-6 w-6 text-[#0F766E] animate-spin" />
                    <span className="text-xs text-[#667085] font-semibold">Finding recent company developments...</span>
                  </div>
                )}

                {!newsLoading && newsResponse && (
                  <div className="space-y-6">
                    {newsResponse.status === "invalid_key" && (
                      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-500/10 text-amber-800 dark:text-amber-450 text-xs sm:text-sm rounded-xl">
                        Recent developments are temporarily unavailable due to missing configuration key.
                      </div>
                    )}
                    {newsResponse.status === "rate_limited" && (
                      <div className="p-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-500/10 text-amber-800 dark:text-amber-450 text-xs sm:text-sm rounded-xl">
                        Recent developments are temporarily unavailable due to provider limits.
                      </div>
                    )}
                    {newsResponse.status === "error" && (
                      <div className="p-4 bg-red-50/50 dark:bg-red-950/15 border border-red-500/10 text-red-800 dark:text-red-450 text-xs sm:text-sm rounded-xl">
                        Recent developments are temporarily unavailable.
                      </div>
                    )}
                    {newsResponse.status === "no_news" && (
                      <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-neutral-200 dark:border-neutral-800 text-xs text-[#667085] dark:text-neutral-400 rounded-xl text-center">
                        No relevant developments were found in the available news window.
                      </div>
                    )}

                    {newsResponse.status === "success" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {selectedStocks.map((stock) => {
                          const stockNews = newsResponse.developments.filter((n) => n.companySymbol === stock.symbol);
                          const resultsNews = stockNews.filter((n) => n.category === "RESULTS");
                          const otherNews = stockNews.filter((n) => n.category !== "RESULTS");

                          return (
                            <div key={stock.symbol} className="border border-neutral-200 dark:border-[#1f1f1f] p-5 rounded-xl space-y-6 bg-neutral-50 dark:bg-[#121212]">
                              <h4 className="font-extrabold text-sm border-b border-neutral-200 dark:border-neutral-800 pb-2 flex justify-between">
                                <span className="text-[#0F766E] dark:text-teal-400">{stock.symbol} developments</span>
                              </h4>

                              {stockNews.length === 0 ? (
                                <div className="p-4 bg-neutral-100/50 dark:bg-[#161616]/40 border border-neutral-200 dark:border-[#222] text-xs text-neutral-550 dark:text-neutral-400 rounded-xl text-center font-normal">
                                  No relevant recent developments found in the available news window.
                                </div>
                              ) : (
                                <>
                                  {/* RESULTS */}
                                  <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-450 block">
                                      RECENT RESULTS
                                    </span>
                                    {resultsNews.length > 0 ? (
                                      <div className="space-y-4 divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
                                        {resultsNews.map((art, idx) => (
                                          <div key={idx} className="text-xs sm:text-sm space-y-1.5 pt-3 first:pt-0">
                                            <a href={art.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-extrabold hover:underline text-neutral-900 dark:text-neutral-100 hover:text-[#0F766E] dark:hover:text-teal-400 block leading-snug">
                                              {art.headline}
                                            </a>
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed font-normal">{art.description}</p>
                                            <div className="flex justify-between items-center text-[10px] text-neutral-400 dark:text-neutral-500 pt-1 tabular-nums">
                                              <span>Source: {art.sourceName} • {new Date(art.publishedAt).toLocaleDateString()}</span>
                                              <a href={art.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#0F766E] dark:text-teal-400 hover:underline font-bold">Read source →</a>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-[#667085] dark:text-neutral-500 italic block">No recent earnings reports matched.</span>
                                    )}
                                  </div>

                                  {/* BUSINESS DEVELOPMENTS */}
                                  <div className="space-y-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-800">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#667085] dark:text-neutral-450 block">
                                      BUSINESS DEVELOPMENTS
                                    </span>
                                    {otherNews.length > 0 ? (
                                      <div className="space-y-4 divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
                                        {otherNews.map((art, idx) => (
                                          <div key={idx} className="text-xs sm:text-sm space-y-1.5 pt-3 first:pt-0">
                                            <a href={art.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-extrabold hover:underline text-neutral-900 dark:text-neutral-100 hover:text-[#0F766E] dark:hover:text-teal-400 block leading-snug">
                                              {art.headline}
                                            </a>
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed font-normal">{art.description}</p>
                                            <div className="flex justify-between items-center text-[10px] text-neutral-400 dark:text-neutral-500 pt-1 tabular-nums">
                                              <span>Source: {art.sourceName} • {new Date(art.publishedAt).toLocaleDateString()}</span>
                                              <a href={art.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#0F766E] dark:text-teal-400 hover:underline font-bold">Read source →</a>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-[#667085] dark:text-neutral-500 italic block">No material corporate actions found in feed.</span>
                                    )}
                                  </div>
                                </>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* 12. VOLUMECALL AI ANALYSIS */}
              <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] p-8 rounded-2xl shadow-xs space-y-4 relative overflow-hidden">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-[#0F766E] dark:text-teal-400" />
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-neutral-100">
                    VolumeCall AI Analysis
                  </h3>
                </div>
                <p className="text-xs text-[#667085] dark:text-neutral-400 mt-1">
                  AI explanation based on the financial comparison and available recent developments.
                </p>

                {loadingAI && (
                  <div className="py-8 flex items-center space-x-2 text-xs sm:text-sm text-[#667085] dark:text-neutral-450 font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0F766E] dark:text-teal-400" />
                    <span>Consulting Groq AI completions (llama-3.3-70b-versatile)...</span>
                  </div>
                )}

                {aiError && (
                  <div className="py-2 text-xs text-[#667085] dark:text-neutral-450 flex items-start space-x-1.5 leading-relaxed font-normal">
                    <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span>AI summary is temporarily unavailable. Financial comparison data remains fully functional. (Error: {aiError})</span>
                  </div>
                )}

                {!loadingAI && aiAnalysis && (
                  <div className="space-y-6 pt-2">
                    
                    {/* Overall Read */}
                    <div className="border-l-4 border-[#0F766E] dark:border-teal-400 pl-4 py-3 bg-neutral-50 dark:bg-[#121212] rounded-r-xl">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#667085] dark:text-neutral-400 block mb-1">OVERALL READ</span>
                      <p className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-150 leading-relaxed">{aiAnalysis.overallRead}</p>
                    </div>
                    
                    {/* Concise Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-200 dark:border-[#1f1f1f] text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="space-y-1">
                        <span className="font-bold text-[#111827] dark:text-neutral-100 uppercase tracking-wider text-[10px]">VALUATION</span>
                        <p className="leading-relaxed font-normal">{aiAnalysis.valuation}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-[#111827] dark:text-neutral-100 uppercase tracking-wider text-[10px]">PROFITABILITY</span>
                        <p className="leading-relaxed font-normal">{aiAnalysis.profitability}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-[#111827] dark:text-neutral-100 uppercase tracking-wider text-[10px]">CAPITAL EFFICIENCY</span>
                        <p className="leading-relaxed font-normal">{aiAnalysis.capitalEfficiency}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-[#111827] dark:text-neutral-100 uppercase tracking-wider text-[10px]">FINANCIAL HEALTH</span>
                        <p className="leading-relaxed font-normal">{aiAnalysis.financialHealth}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-[#111827] dark:text-neutral-100 uppercase tracking-wider text-[10px]">GROWTH</span>
                        <p className="leading-relaxed font-normal">{aiAnalysis.growth}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-[#111827] dark:text-neutral-100 uppercase tracking-wider text-[10px]">MARKET POSITION</span>
                        <p className="leading-relaxed font-normal">{aiAnalysis.marketPosition}</p>
                      </div>
                      <div className="space-y-1 md:col-span-2 pt-2 border-t border-neutral-100 dark:border-neutral-850">
                        <span className="font-bold text-[#111827] dark:text-neutral-100 uppercase tracking-wider text-[10px]">RECENT DEVELOPMENTS</span>
                        <p className="leading-relaxed font-normal">{aiAnalysis.recentDevelopments}</p>
                      </div>
                    </div>

                    {/* Comparison Read */}
                    <div className="pt-4 border-t border-neutral-200 dark:border-[#1f1f1f] bg-neutral-50 dark:bg-[#121212]/50 p-4 rounded-xl space-y-1">
                      <span className="font-bold text-[#111827] dark:text-neutral-100 uppercase tracking-wider text-[10px]">COMPARISON READ</span>
                      <p className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed">{aiAnalysis.comparisonRead}</p>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[12px] sm:text-xs text-neutral-450 dark:text-neutral-500 font-normal leading-relaxed pt-2">
                      VolumeCall AI explains and compares the available financial data and recent developments. It does not provide investment advice or a buy/sell recommendation. Verify important information independently and do your own research before making investment decisions.
                    </p>
                  </div>
                )}
              </section>



              {/* 14. DETAILED FINANCIAL DATA (COLLAPSIBLE ACCORDION) */}
              <section className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-[#1f1f1f] rounded-2xl shadow-xs overflow-hidden">
                <button
                  onClick={() => setRawTableOpen(!rawTableOpen)}
                  className="w-full px-8 py-5 flex justify-between items-center hover:bg-[#F7F8FA] dark:hover:bg-zinc-800/30 transition-colors text-left cursor-pointer"
                >
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#111827] dark:text-neutral-100">
                      View Detailed Financial Data (Raw table)
                    </h3>
                    <p className="text-xs text-[#667085] dark:text-neutral-450 mt-0.5 font-normal">Absolute gaps, ratios and sector calculations</p>
                  </div>
                  {rawTableOpen ? <ChevronUp className="h-5 w-5 text-[#667085]" /> : <ChevronDown className="h-5 w-5 text-[#667085]" />}
                </button>

                {rawTableOpen && (
                  <div className="px-8 pb-8 border-t border-[#E5E7EB]/60 dark:border-zinc-800/60 overflow-x-auto pt-6">
                    <table className="w-full text-xs sm:text-sm text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-[#1f1f1f] bg-neutral-50 dark:bg-[#121212]">
                          <th className="py-2.5 px-4 text-[10px] font-bold text-[#667085] dark:text-zinc-450 uppercase tracking-wider">Metric Detail</th>
                          {comparisonData.stocks.map((stock) => (
                            <th key={stock.symbol} className="py-2.5 px-4 text-[10px] font-bold text-[#111827] dark:text-zinc-100 text-right uppercase tracking-wider">{stock.symbol}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200/40 dark:divide-[#1f1f1f]/40 font-normal text-xs sm:text-sm">
                        <tr>
                          <td className="py-3.5 px-4 text-[#667085] dark:text-zinc-400 font-medium">Price-to-Earnings (P/E)</td>
                          {comparisonData.stocks.map((stock) => (
                            <td key={stock.symbol} className="py-3.5 px-4 text-right text-[#111827] dark:text-zinc-100 tabular-nums font-semibold">
                              <div>{stock.pe.companyValue}</div>
                              <span className="text-[9px] text-[#667085] dark:text-zinc-500 font-sans font-normal mt-0.5">
                                Sector: {stock.pe.sectorValue} ({stock.pe.diffPercent !== null ? `${stock.pe.diffPercent > 0 ? "+" : ""}${stock.pe.diffPercent.toFixed(1)}%` : "N/A"})
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-[#667085] dark:text-zinc-400 font-medium">Price-to-Book (P/B)</td>
                          {comparisonData.stocks.map((stock) => (
                            <td key={stock.symbol} className="py-3.5 px-4 text-right text-[#111827] dark:text-zinc-100 tabular-nums font-semibold">
                              <div>{stock.pb.companyValue}</div>
                              <span className="text-[9px] text-[#667085] dark:text-zinc-500 font-sans font-normal mt-0.5">
                                Sector: {stock.pb.sectorValue} ({stock.pb.diffPercent !== null ? `${stock.pb.diffPercent > 0 ? "+" : ""}${stock.pb.diffPercent.toFixed(1)}%` : "N/A"})
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-[#667085] dark:text-zinc-400 font-medium">EV/EBITDA</td>
                          {comparisonData.stocks.map((stock) => (
                            <td key={stock.symbol} className="py-3.5 px-4 text-right text-[#111827] dark:text-zinc-100 tabular-nums font-semibold">
                              <div>{stock.evEbitda.companyValue}</div>
                              <span className="text-[9px] text-[#667085] dark:text-zinc-500 font-sans font-normal mt-0.5">
                                Sector: {stock.evEbitda.sectorValue} ({stock.evEbitda.diffPercent !== null ? `${stock.evEbitda.diffPercent > 0 ? "+" : ""}${stock.evEbitda.diffPercent.toFixed(1)}%` : "N/A"})
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-[#667085] dark:text-zinc-400 font-medium">Return on Equity (ROE)</td>
                          {comparisonData.stocks.map((stock) => (
                            <td key={stock.symbol} className="py-3.5 px-4 text-right text-[#111827] dark:text-zinc-100 tabular-nums font-semibold">
                              <div>{stock.roe.companyValue}</div>
                              <span className="text-[9px] text-[#667085] dark:text-zinc-500 font-sans font-normal mt-0.5">
                                Sector: {stock.roe.sectorValue} ({stock.roe.diffPercent !== null ? `${stock.roe.diffPercent > 0 ? "+" : ""}${stock.roe.diffPercent.toFixed(1)}%` : "N/A"})
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3.5 px-4 text-[#667085] dark:text-zinc-400 font-medium">Return on Capital Employed (ROCE)</td>
                          {comparisonData.stocks.map((stock) => (
                            <td key={stock.symbol} className="py-3.5 px-4 text-right text-[#111827] dark:text-zinc-100 tabular-nums font-semibold">
                              <div>{stock.roce.companyValue}</div>
                              <span className="text-[9px] text-[#667085] dark:text-zinc-500 font-sans font-normal mt-0.5">
                                Sector: {stock.roce.sectorValue} ({stock.roce.diffPercent !== null ? `${stock.roce.diffPercent > 0 ? "+" : ""}${stock.roce.diffPercent.toFixed(1)}%` : "N/A"})
                              </span>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* 16. METHODOLOGY & DISCLAIMERS */}
              <section className="space-y-2 text-[11px] sm:text-xs text-[#667085] dark:text-neutral-500 leading-relaxed font-normal pt-2">
                <span className="font-bold text-[#111827] dark:text-zinc-300 block uppercase tracking-wider">Methodology & Limits</span>
                <p>
                  AI summaries, categorization, and answers are powered by Groq (llama-3.3-70b-versatile) based on deterministic calculations. Explanations do not constitute investment advice.
                </p>
                <p>
                  Returns are computed dynamically from official Upstox daily candle sets. Sector averages are resolved dynamically from fundamental indicators. news feeds are loaded in the background from NewsData.io Latest News API and cached locally in-memory for 2 hours (process-local).
                </p>
              </section>

            </div>
          )}
        </div>
      )}

      {/* 17. FLOATING ASK VOLUMECALL AI LAUNCHER BUTTON */}
      {isCompared && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center space-x-2 bg-[#0F766E] hover:bg-teal-850 text-white font-bold px-4 py-3 rounded-full shadow-lg cursor-pointer transition-all duration-150 transform hover:scale-105"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-xs sm:text-sm">Ask VolumeCall AI</span>
          </button>
        </div>
      )}

      {/* FLOATING CHAT DRAWER */}
      <VolumeCallAIDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        context={{
          type: "comparison",
          symbols: selectedStocks.map((s) => s.symbol),
        }}
      />

    </div>
  );
}
export default CompareClient;
