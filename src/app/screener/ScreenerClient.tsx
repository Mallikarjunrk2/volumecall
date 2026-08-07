"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUpDown, X, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/stocks/formatting";
import VolumeCallAIDrawer from "@/components/stocks/VolumeCallAIDrawer";
import { ScreenerStock } from "@/lib/stocks/stockDataService";

interface ScreenerClientProps {
  initialStocks: ScreenerStock[];
}

function parseNum(val: string): number | null {
  if (!val || val === "N/A" || val === "—" || val === "-") return null;
  const clean = val.replace("%", "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

export function ScreenerClient({ initialStocks }: ScreenerClientProps) {
  const [selectedSector, setSelectedSector] = useState("All");
  const [maxPe, setMaxPe] = useState("");
  const [maxPb, setMaxPb] = useState("");
  const [minRoe, setMinRoe] = useState("");
  const [minRoce, setMinRoce] = useState("");
  const [maxDebtToEquity, setMaxDebtToEquity] = useState("");
  const [minPromoter, setMinPromoter] = useState("");
  const [minMarketCap, setMinMarketCap] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState<keyof ScreenerStock>("symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get unique list of sectors
  const sectors = useMemo(() => {
    const set = new Set(initialStocks.map((s) => s.sector).filter((sec) => sec && sec !== "N/A"));
    return ["All", ...Array.from(set)];
  }, [initialStocks]);

  // Handle click sorting
  const handleSort = (column: keyof ScreenerStock) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Filter and sort the stocks list
  const filteredStocks = useMemo(() => {
    let list = [...initialStocks];

    // 1. Filter by Sector
    if (selectedSector !== "All") {
      list = list.filter((s) => s.sector === selectedSector);
    }

    // 2. Filter by Max P/E
    if (maxPe.trim() !== "") {
      const maxVal = parseFloat(maxPe);
      if (!isNaN(maxVal)) {
        list = list.filter((s) => {
          const num = parseNum(s.pe);
          return num !== null && num <= maxVal;
        });
      }
    }

    // 3. Filter by Max P/B
    if (maxPb.trim() !== "") {
      const maxVal = parseFloat(maxPb);
      if (!isNaN(maxVal)) {
        list = list.filter((s) => {
          const num = parseNum(s.pb);
          return num !== null && num <= maxVal;
        });
      }
    }

    // 4. Filter by Min ROE
    if (minRoe.trim() !== "") {
      const minVal = parseFloat(minRoe);
      if (!isNaN(minVal)) {
        list = list.filter((s) => {
          const num = parseNum(s.roe);
          return num !== null && num >= minVal;
        });
      }
    }

    // 5. Filter by Min ROCE
    if (minRoce.trim() !== "") {
      const minVal = parseFloat(minRoce);
      if (!isNaN(minVal)) {
        list = list.filter((s) => {
          const num = parseNum(s.roce);
          return num !== null && num >= minVal;
        });
      }
    }

    // 6. Filter by Max Debt to Equity
    if (maxDebtToEquity.trim() !== "") {
      const maxVal = parseFloat(maxDebtToEquity);
      if (!isNaN(maxVal)) {
        list = list.filter((s) => {
          const num = parseNum(s.debtToEquity);
          return num !== null && num <= maxVal;
        });
      }
    }

    // 7. Filter by Min Promoter
    if (minPromoter.trim() !== "") {
      const minVal = parseFloat(minPromoter);
      if (!isNaN(minVal)) {
        list = list.filter((s) => {
          const num = parseNum(s.promoter);
          return num !== null && num >= minVal;
        });
      }
    }

    // 8. Filter by Min Market Cap
    if (minMarketCap.trim() !== "") {
      const minVal = parseFloat(minMarketCap);
      if (!isNaN(minVal)) {
        list = list.filter((s) => s.marketCap !== null && s.marketCap >= minVal);
      }
    }

    // 9. Filter by Price Range
    if (minPrice.trim() !== "") {
      const minVal = parseFloat(minPrice);
      if (!isNaN(minVal)) {
        list = list.filter((s) => s.price !== null && s.price >= minVal);
      }
    }
    if (maxPrice.trim() !== "") {
      const maxVal = parseFloat(maxPrice);
      if (!isNaN(maxVal)) {
        list = list.filter((s) => s.price !== null && s.price <= maxVal);
      }
    }

    // 10. Sort by Column
    list.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      // Numerical comparisons
      if (["price", "pe", "pb", "roe", "roce", "evebitda", "marketCap", "debtToEquity"].includes(sortBy)) {
        const aNum = typeof aVal === "number" ? aVal : parseNum(aVal as string);
        const bNum = typeof bVal === "number" ? bVal : parseNum(bVal as string);

        if (aNum === null) return 1;
        if (bNum === null) return -1;
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }

      // String fallback comparison
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
      if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [initialStocks, selectedSector, maxPe, maxPb, minRoe, minRoce, maxDebtToEquity, minPromoter, minMarketCap, minPrice, maxPrice, sortBy, sortOrder]);

  const clearFilters = () => {
    setSelectedSector("All");
    setMaxPe("");
    setMaxPb("");
    setMinRoe("");
    setMinRoce("");
    setMaxDebtToEquity("");
    setMinPromoter("");
    setMinMarketCap("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("symbol");
    setSortOrder("asc");
  };

  return (
    <div className="space-y-6">
      
      {/* Filters Toolbar */}
      <div className="p-4 border border-[var(--border)] rounded-md bg-[var(--background)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          {/* Sector dropdown */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full text-xs py-1.5 px-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 cursor-pointer"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>{sec === "All" ? "All Sectors" : sec}</option>
              ))}
            </select>
          </div>

          {/* Max P/E input */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Max P/E Ratio</label>
            <input
              type="number"
              value={maxPe}
              placeholder="e.g. 30"
              onChange={(e) => setMaxPe(e.target.value)}
              className="w-full text-xs py-1.5 px-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            />
          </div>

          {/* Min ROE input */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Min ROE (%)</label>
            <input
              type="number"
              value={minRoe}
              placeholder="e.g. 15"
              onChange={(e) => setMinRoe(e.target.value)}
              className="w-full text-xs py-1.5 px-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            />
          </div>

          {/* Min ROCE input */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Min ROCE (%)</label>
            <input
              type="number"
              value={minRoce}
              placeholder="e.g. 15"
              onChange={(e) => setMinRoce(e.target.value)}
              className="w-full text-xs py-1.5 px-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
            />
          </div>

          {/* Controls button */}
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex-1 text-xs py-1.5 px-3 bg-[var(--background-secondary)] hover:bg-[var(--border)] border border-[var(--border)] rounded-md text-[var(--foreground)] transition-colors flex items-center justify-center space-x-1 cursor-pointer font-medium"
            >
              <span>Filters</span>
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={clearFilters}
              className="text-xs p-1.5 bg-[var(--background-secondary)] hover:bg-red-500/10 border border-[var(--border)] hover:border-red-500/25 rounded-md text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-[var(--border)]">
            {/* Max P/B */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Max P/B Ratio</label>
              <input
                type="number"
                value={maxPb}
                placeholder="e.g. 5"
                onChange={(e) => setMaxPb(e.target.value)}
                className="w-full text-xs py-1.5 px-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
            </div>

            {/* Max Debt to Equity */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Max Debt-to-Equity</label>
              <input
                type="number"
                value={maxDebtToEquity}
                placeholder="e.g. 1.0"
                step="0.1"
                onChange={(e) => setMaxDebtToEquity(e.target.value)}
                className="w-full text-xs py-1.5 px-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
            </div>

            {/* Min Promoter */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Min Promoter %</label>
              <input
                type="number"
                value={minPromoter}
                placeholder="e.g. 50"
                onChange={(e) => setMinPromoter(e.target.value)}
                className="w-full text-xs py-1.5 px-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
            </div>

            {/* Min Market Cap */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Min Market Cap (Cr)</label>
              <input
                type="number"
                value={minMarketCap}
                placeholder="e.g. 10000"
                onChange={(e) => setMinMarketCap(e.target.value)}
                className="w-full text-xs py-1.5 px-3 bg-[var(--background-secondary)] border border-[var(--border)] rounded-md text-[var(--foreground)] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Count & Ask AI Button */}
      <div className="flex justify-between items-center px-1">
        <div className="text-[11px] text-[var(--text-secondary)] font-normal">
          Showing <span className="font-semibold text-[var(--foreground)]">{filteredStocks.length}</span> of {initialStocks.length} companies
        </div>
        
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="text-xs px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 hover:border-teal-300 dark:bg-teal-950/20 dark:hover:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/30 dark:hover:border-teal-700 rounded-md font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="h-3.5 w-3.5 fill-[#0F766E] dark:fill-teal-450" />
          <span>Ask VolumeCall AI</span>
        </button>
      </div>

      {/* Screened Stocks Table */}
      <div className="w-full overflow-x-auto border border-[var(--border)] rounded-md bg-[var(--background)]">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)] select-none">
              <th 
                onClick={() => handleSort("symbol")}
                className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-left cursor-pointer hover:text-[var(--foreground)] transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Company</span>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("sector")}
                className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-left cursor-pointer hover:text-[var(--foreground)] transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Sector</span>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("price")}
                className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right cursor-pointer hover:text-[var(--foreground)] transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Price</span>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("marketCap")}
                className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right cursor-pointer hover:text-[var(--foreground)] transition-colors hidden md:table-cell"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Mkt Cap (Cr)</span>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("pe")}
                className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right cursor-pointer hover:text-[var(--foreground)] transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>P/E</span>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("pb")}
                className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right cursor-pointer hover:text-[var(--foreground)] transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>P/B</span>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("roe")}
                className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right cursor-pointer hover:text-[var(--foreground)] transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>ROE</span>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("roce")}
                className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right cursor-pointer hover:text-[var(--foreground)] transition-colors hidden sm:table-cell"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>ROCE</span>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                </div>
              </th>
              <th 
                onClick={() => handleSort("debtToEquity")}
                className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right cursor-pointer hover:text-[var(--foreground)] transition-colors hidden lg:table-cell"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Debt/Eq</span>
                  <ArrowUpDown className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <tr 
                  key={stock.symbol}
                  className="hover:bg-[var(--background-secondary)]/50 transition-colors"
                >
                  <td className="py-3 px-4 text-left font-semibold">
                    <Link 
                      href={`/stocks/${stock.symbol.toLowerCase()}`}
                      className="flex flex-col focus:outline-none hover:underline"
                    >
                      <span className="font-bold text-[var(--foreground)]">{stock.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{stock.symbol} · {stock.exchange}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-left text-[var(--text-secondary)] font-normal">
                    {stock.sector}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--foreground)] font-semibold tabular-nums">
                    {stock.price !== null ? formatCurrency(stock.price) : "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--text-secondary)] font-medium tabular-nums hidden md:table-cell">
                    {stock.marketCap !== null ? stock.marketCap.toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--foreground)] font-medium tabular-nums">
                    {stock.pe !== "—" ? `${stock.pe}x` : "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--foreground)] font-medium tabular-nums">
                    {stock.pb !== "—" ? `${stock.pb}x` : "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--foreground)] font-medium tabular-nums">
                    {stock.roe !== "—" ? `${stock.roe}%` : "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--foreground)] font-medium tabular-nums hidden sm:table-cell">
                    {stock.roce !== "—" ? `${stock.roce}%` : "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--text-secondary)] font-medium tabular-nums hidden lg:table-cell">
                    {stock.debtToEquity}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-[var(--text-secondary)]">
                  No stocks match the selected filters. Click Reset Filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <VolumeCallAIDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        context={{
          type: "screener",
          filters: {
            selectedSector,
            maxPe,
            minRoe,
            minRoce,
            maxPb,
            maxDebtToEquity,
            minPromoter,
          }
        }}
      />
    </div>
  );
}
export default ScreenerClient;
