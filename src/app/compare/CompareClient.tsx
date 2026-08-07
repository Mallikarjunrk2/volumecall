"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X, AlertCircle, Sparkles } from "lucide-react";
import { SearchInstrument } from "@/lib/stocks/types";
import VolumeCallAIDrawer from "@/components/stocks/VolumeCallAIDrawer";
import { FightData, StockCompareResult } from "@/lib/stocks/compare";
import { ComparisonAnalysis } from "@/lib/ai/schemas";
import { formatCurrency } from "@/lib/stocks/formatting";


export function CompareClient() {
  const [selectedStocks, setSelectedStocks] = useState<SearchInstrument[]>([]);
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null);
  
  // Search query states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchInstrument[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Comparison flow states
  const [comparisonData, setComparisonData] = useState<FightData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [financialsError, setFinancialsError] = useState<string | null>(null);
  

  // Floating AI Widget State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modes
  const [isCompared, setIsCompared] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Run decoupled stock comparison
  const runComparison = useCallback(async (overrideStocks?: SearchInstrument[]) => {
    const stocksToCompare = overrideStocks || selectedStocks;
    if (stocksToCompare.length < 2) return;

    setLoadingFinancials(true);
    setLoadingAI(true);
    setFinancialsError(null);
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
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || "Failed to process stock comparison.");
      }

      const data = await res.json();
      setComparisonData(data.comparison);
      setLoadingFinancials(false);

      // Fetch Groq AI analysis
      try {
        const aiRes = await fetch("/api/stocks/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols, runAI: true }),
        });

        if (!aiRes.ok) {
          const errJson = await aiRes.json().catch(() => ({}));
          throw new Error(errJson?.error || "AI completion failed.");
        }

        const aiData = await aiRes.json();
        setAiAnalysis(aiData.aiResponse);
      } catch (err) {
        console.warn("[AI Comparison Request Failed]:", err);
      } finally {
        setLoadingAI(false);
      }
    } catch (err) {
      console.error("[Financials Comparison Request Failed]:", err);
      setFinancialsError((err as Error).message || "Unable to complete stock comparison.");
      setLoadingFinancials(false);
      setLoadingAI(false);
    }
  }, [selectedStocks]);

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
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setSearchResults([]);
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
      const symbols = selectedStocks.map((s) => s.symbol);
      try {
        const res = await fetch("/api/stocks/compare/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols }),
        });

        if (!res.ok) {
          console.error("Failed to fetch news route payload.");
        }
      } catch (err) {
        console.error("News query error:", err);
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
          const resolved: SearchInstrument[] = [];
          for (const sym of symbols) {
            try {
              const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(sym)}`);
              if (res.ok) {
                const data = await res.json();
                const exact = data.find((item: SearchInstrument) => item.symbol.toUpperCase() === sym);
                if (exact) resolved.push(exact);
                else if (data.length > 0) resolved.push(data[0]);
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

  const addStockSlot = (index: number, instrument: SearchInstrument) => {
    const updated = [...selectedStocks];
    updated[index] = instrument;
    setSelectedStocks(updated);
    setSearchingIndex(null);
    setSearchQuery("");
  };

  const removeStockSlot = (index: number) => {
    const updated = selectedStocks.filter((_, i) => i !== index);
    setSelectedStocks(updated);
    setIsCompared(false);
    setComparisonData(null);
    setAiAnalysis(null);

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

  const getRatioValue = (stock: StockCompareResult, aliases: string[]): string => {
    const item = stock.ratios?.find((r) => 
      aliases.some(alias => r.name.toLowerCase().replace(/[^a-z0-9]/g, "").includes(alias.toLowerCase()))
    );
    return item ? item.companyValue : "—";
  };

  // Winner calculation logic
  const getMetricWinner = (field: string, stocks: StockCompareResult[]): string | null => {
    if (stocks.length < 2) return null;

    const parseVal = (str: string): number | null => {
      if (!str || str === "—" || str === "N/A") return null;
      const num = parseFloat(str.replace(/[^0-9.-]/g, ""));
      return isNaN(num) ? null : num;
    };

    let bestValue = -Infinity;
    let bestSymbol: string | null = null;
    let isLowerBetter = false;

    if (field === "pe" || field === "pb" || field === "evebitda" || field === "debttoequity") {
      isLowerBetter = true;
      bestValue = Infinity;
    }

    stocks.forEach(stock => {
      let rawVal: number | null = null;
      if (field === "price") {
        rawVal = stock.price;
      } else if (field === "pe") {
        rawVal = parseVal(stock.pe.companyValue);
      } else if (field === "pb") {
        rawVal = parseVal(stock.pb.companyValue);
      } else if (field === "evebitda") {
        rawVal = parseVal(stock.evEbitda.companyValue);
      } else if (field === "roe") {
        rawVal = parseVal(stock.roe.companyValue);
      } else if (field === "roce") {
        rawVal = parseVal(stock.roce.companyValue);
      } else if (field === "roa") {
        rawVal = parseVal(stock.roa.companyValue);
      } else if (field === "marketcap") {
        const valStr = getRatioValue(stock, ["marketcap", "marketcapitalization"]);
        rawVal = parseVal(valStr);
      } else if (field === "debttoequity") {
        const valStr = getRatioValue(stock, ["debtoquity", "debtequity", "leverage"]);
        rawVal = parseVal(valStr);
      } else if (field === "revenuegrowth") {
        const valStr = getRatioValue(stock, ["revenuegrowth", "salesgrowth"]);
        rawVal = parseVal(valStr);
      } else if (field === "profitgrowth") {
        const valStr = getRatioValue(stock, ["profitgrowth", "netprofitgrowth"]);
        rawVal = parseVal(valStr);
      } else if (field === "eps") {
        const valStr = getRatioValue(stock, ["eps", "earnings per share"]);
        rawVal = parseVal(valStr);
      } else if (field === "dividendyield") {
        const valStr = getRatioValue(stock, ["dividendyield", "divyield"]);
        rawVal = parseVal(valStr);
      }

      if (rawVal !== null) {
        if (isLowerBetter) {
          if (rawVal > 0 && rawVal < bestValue) {
            bestValue = rawVal;
            bestSymbol = stock.symbol;
          }
        } else {
          if (rawVal > bestValue) {
            bestValue = rawVal;
            bestSymbol = stock.symbol;
          }
        }
      }
    });

    return bestSymbol;
  };

  const renderCellClass = (stockSymbol: string, winnerSymbol: string | null, isBold = false) => {
    const isWinner = winnerSymbol && stockSymbol === winnerSymbol;
    return `py-4 text-right tabular-nums ${
      isWinner 
        ? "text-teal-600 dark:text-teal-400 font-extrabold bg-teal-500/5 px-2 rounded-sm" 
        : isBold ? "text-[#111827] dark:text-neutral-100 font-bold" : "text-neutral-600 dark:text-neutral-200 font-medium"
    }`;
  };

  return (
    <div className="space-y-6">
      {/* Stock Slot Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map((index) => {
          const stock = selectedStocks[index];
          const isSearching = searchingIndex === index;

          return (
            <div key={index} className="relative border border-[var(--border)] rounded-lg p-4 bg-[var(--background)] flex flex-col justify-between min-h-[100px]">
              {stock ? (
                <>
                  <button
                    onClick={() => removeStockSlot(index)}
                    className="absolute top-2 right-2 p-1 text-[var(--text-secondary)] hover:text-[var(--foreground)] focus:outline-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Stock {index + 1}</span>
                    <h3 className="text-base font-extrabold text-[var(--foreground)] mt-1 font-mono">{stock.symbol}</h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate max-w-[150px]">{stock.name}</p>
                  </div>
                </>
              ) : isSearching ? (
                <div ref={containerRef} className="space-y-2">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Type ticker..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-teal-500 rounded bg-[var(--background-secondary)] text-[var(--foreground)] focus:outline-none"
                    />
                    {searchLoading && <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-2 text-teal-500" />}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded shadow-lg max-h-48 overflow-y-auto z-50">
                      {searchResults.map((item) => (
                        <button
                          key={item.instrumentKey}
                          onClick={() => addStockSlot(index, item)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--background-secondary)] text-[var(--foreground)] font-mono border-b border-[var(--border)] last:border-0"
                        >
                          <span className="font-bold">{item.symbol}</span> - <span className="text-neutral-500">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSearchingIndex(index)}
                  className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] hover:border-teal-500 rounded-lg py-4 text-xs font-semibold text-[var(--text-secondary)] hover:text-teal-500 transition-colors"
                >
                  <Search className="w-4 h-4 mb-1" />
                  + Select Stock
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Compare Button */}
      {selectedStocks.filter(Boolean).length >= 2 && !isCompared && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => runComparison()}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-md font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            Run Detailed Comparison
          </button>
        </div>
      )}

      {/* Loading States */}
      {isCompared && loadingFinancials && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" />
          <p className="text-xs text-[var(--text-secondary)] font-medium animate-pulse">Running comparison math & ratios...</p>
        </div>
      )}

      {/* Error Message */}
      {isCompared && financialsError && (
        <div className="p-4 border border-red-200/50 dark:border-red-900/50 rounded-lg bg-red-500/5 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Comparison Failed</span>
            <p>{financialsError}</p>
          </div>
        </div>
      )}

      {/* Comparison Grid Results */}
      {isCompared && !loadingFinancials && comparisonData && (
        <div className="space-y-8">
          {/* Main Summary Block */}
          <div className="p-5 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Deterministic Metric Scorecard
              </h3>
            </div>
            
            {/* Medians / Winners Scoreboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-3 border border-[var(--border)] rounded bg-[var(--background)] flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Valuation Leader</span>
                <span className="text-sm font-extrabold text-[var(--foreground)] mt-1 font-mono">
                  {getMetricWinner("pe", comparisonData.stocks) || "Mixed"}
                </span>
              </div>
              <div className="p-3 border border-[var(--border)] rounded bg-[var(--background)] flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Profitability Leader</span>
                <span className="text-sm font-extrabold text-[var(--foreground)] mt-1 font-mono">
                  {getMetricWinner("roe", comparisonData.stocks) || "Mixed"}
                </span>
              </div>
              <div className="p-3 border border-[var(--border)] rounded bg-[var(--background)] flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Efficiency Leader</span>
                <span className="text-sm font-extrabold text-[var(--foreground)] mt-1 font-mono">
                  {getMetricWinner("roce", comparisonData.stocks) || "Mixed"}
                </span>
              </div>
              <div className="p-3 border border-[var(--border)] rounded bg-[var(--background)] flex flex-col justify-between">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Lowest Debt</span>
                <span className="text-sm font-extrabold text-[var(--foreground)] mt-1 font-mono">
                  {getMetricWinner("debttoequity", comparisonData.stocks) || "Mixed"}
                </span>
              </div>
            </div>
          </div>

          {/* Ratios Comparison Table */}
          <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--background)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]">
                    <th className="py-3 px-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Metrics</th>
                    {comparisonData.stocks.map((stock) => (
                      <th key={stock.symbol} className="py-3 px-4 text-right text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                        {stock.symbol}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-xs">
                  {/* Prices */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">Current Price</td>
                    {comparisonData.stocks.map((stock) => (
                      <td key={stock.symbol} className={renderCellClass(stock.symbol, null, true)}>
                        {stock.price !== null ? formatCurrency(stock.price) : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Market Cap */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">Market Cap</td>
                    {comparisonData.stocks.map((stock) => {
                      const val = getRatioValue(stock, ["marketcap", "marketcapitalization"]);
                      const formatted = val !== "—" ? val : stock.profile?.sectorMarketCapInr?.formatted || "—";
                      return (
                        <td key={stock.symbol} className={renderCellClass(stock.symbol, getMetricWinner("marketcap", comparisonData.stocks))}>
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>

                  {/* P/E Ratio */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">Stock P/E</td>
                    {comparisonData.stocks.map((stock) => (
                      <td key={stock.symbol} className={renderCellClass(stock.symbol, getMetricWinner("pe", comparisonData.stocks), true)}>
                        {stock.pe.companyValue !== "N/A" ? `${stock.pe.companyValue}x` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* P/B Ratio */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">Price-to-Book (P/B)</td>
                    {comparisonData.stocks.map((stock) => (
                      <td key={stock.symbol} className={renderCellClass(stock.symbol, getMetricWinner("pb", comparisonData.stocks))}>
                        {stock.pb.companyValue !== "N/A" ? `${stock.pb.companyValue}x` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* ROE */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">ROE %</td>
                    {comparisonData.stocks.map((stock) => (
                      <td key={stock.symbol} className={renderCellClass(stock.symbol, getMetricWinner("roe", comparisonData.stocks), true)}>
                        {stock.roe.companyValue !== "N/A" ? `${stock.roe.companyValue}%` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* ROCE */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">ROCE %</td>
                    {comparisonData.stocks.map((stock) => (
                      <td key={stock.symbol} className={renderCellClass(stock.symbol, getMetricWinner("roce", comparisonData.stocks), true)}>
                        {stock.roce.companyValue !== "N/A" ? `${stock.roce.companyValue}%` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Dividend Yield */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">Dividend Yield %</td>
                    {comparisonData.stocks.map((stock) => (
                      <td key={stock.symbol} className={renderCellClass(stock.symbol, getMetricWinner("dividendyield", comparisonData.stocks))}>
                        {getRatioValue(stock, ["dividendyield", "divyield"])}
                      </td>
                    ))}
                  </tr>

                  {/* Debt to Equity */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">Debt to Equity</td>
                    {comparisonData.stocks.map((stock) => (
                      <td key={stock.symbol} className={renderCellClass(stock.symbol, getMetricWinner("debttoequity", comparisonData.stocks))}>
                        {getRatioValue(stock, ["debtoquity", "debtequity", "leverage"])}
                      </td>
                    ))}
                  </tr>

                  {/* Revenue Growth */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">Revenue Growth %</td>
                    {comparisonData.stocks.map((stock) => (
                      <td key={stock.symbol} className={renderCellClass(stock.symbol, getMetricWinner("revenuegrowth", comparisonData.stocks))}>
                        {getRatioValue(stock, ["revenuegrowth", "salesgrowth"])}
                      </td>
                    ))}
                  </tr>

                  {/* Profit Growth */}
                  <tr>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-semibold">Profit Growth %</td>
                    {comparisonData.stocks.map((stock) => (
                      <td key={stock.symbol} className={renderCellClass(stock.symbol, getMetricWinner("profitgrowth", comparisonData.stocks))}>
                        {getRatioValue(stock, ["profitgrowth", "netprofitgrowth"])}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AI-Assisted Research Insights */}
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[var(--foreground)]">AI Analyst Chat</span>
                <p className="text-[11px] text-[var(--text-secondary)]">Ask Groq Llama AI follow-up questions about this comparison.</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-4 py-2 bg-neutral-900 dark:bg-neutral-850 hover:bg-neutral-800 dark:hover:bg-neutral-800 border border-[var(--border)] text-teal-600 dark:text-teal-400 text-xs font-bold rounded cursor-pointer"
              >
                Open Chat
              </button>
            </div>

            {loadingAI && (
              <div className="py-8 text-center text-xs text-[var(--text-secondary)] font-medium animate-pulse">
                Consulting Groq Llama AI for research insights...
              </div>
            )}

            {!loadingAI && aiAnalysis && (
              <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--background)] space-y-6">
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Groq AI Comparison Breakdown
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-[var(--foreground)]">Overall Read</span>
                    <p>{aiAnalysis.overallRead}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-[var(--foreground)]">Valuation</span>
                    <p>{aiAnalysis.valuation}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-[var(--foreground)]">Profitability</span>
                    <p>{aiAnalysis.profitability}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold uppercase text-[10px] text-[var(--foreground)]">Growth</span>
                    <p>{aiAnalysis.growth}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Drawer */}
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
