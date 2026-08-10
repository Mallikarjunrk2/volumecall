"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getWatchlistStorage } from "@/lib/stocks/watchlistStorage";
import { ScreenerStock } from "@/lib/stocks/stockDataService";
import { formatCurrency } from "@/lib/stocks/formatting";
import { Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";

export default function WatchlistPage() {
  const storage = getWatchlistStorage();
  
  const [watchlists, setWatchlists] = useState<string[]>(["Default"]);
  const [activeList, setActiveList] = useState("Default");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [newListName, setNewListName] = useState("");
  const [newSymbolInput, setNewSymbolInput] = useState("");

  const [universe, setUniverse] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);

  // Load indices and lists
  useEffect(() => {
    const init = async () => {
      const lists = await storage.getWatchlists();
      setWatchlists(lists);
      if (lists.length > 0) {
        setActiveList(lists[0]);
      }
    };
    init();
  }, [storage]);

  // Fetch watchlisted stocks details reactively when symbols change
  useEffect(() => {
    if (symbols.length === 0) {
      Promise.resolve().then(() => {
        setUniverse([]);
        setLoading(false);
      });
      return;
    }
    Promise.resolve().then(() => {
      setLoading(true);
    });
    fetch(`/api/stocks/watchlist?symbols=${symbols.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUniverse(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [symbols]);

  // Sync symbols when active watchlist changes
  useEffect(() => {
    const loadList = async () => {
      const syms = await storage.getWatchlist(activeList);
      setSymbols(syms);
    };
    loadList();
  }, [activeList, storage]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;

    await storage.createWatchlist(name);
    const lists = await storage.getWatchlists();
    setWatchlists(lists);
    setActiveList(name);
    setNewListName("");
  };

  const handleDeleteList = async (name: string) => {
    if (confirm(`Are you sure you want to delete the watchlist "${name}"?`)) {
      await storage.deleteWatchlist(name);
      const lists = await storage.getWatchlists();
      setWatchlists(lists);
      if (lists.length > 0) {
        setActiveList(lists[0]);
      }
    }
  };

  const handleAddSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSymbolInput.trim().toUpperCase();
    if (!sym) return;

    // Check if symbol exists in universe or resolve it
    if (!symbols.includes(sym)) {
      const updated = [...symbols, sym];
      setSymbols(updated);
      await storage.saveWatchlist(activeList, updated);
    }
    setNewSymbolInput("");
  };

  const handleRemoveSymbol = async (sym: string) => {
    const updated = symbols.filter((s) => s !== sym);
    setSymbols(updated);
    await storage.saveWatchlist(activeList, updated);
  };

  const watchlistedStocks = universe.filter((s) => symbols.includes(s.symbol));

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[var(--background)]">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
              My Watchlists
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1">
              Create watchlists, track valuations, and monitor real-time stock returns.
            </p>
          </div>
        </div>

        {/* Sidebar + Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Panel: Watchlist Selector */}
          <div className="md:col-span-1 border border-[var(--border)] rounded-lg p-5 bg-[var(--background)] space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Select Watchlist</h3>
              <div className="flex flex-col space-y-1">
                {watchlists.map((name) => (
                  <div key={name} className="flex justify-between items-center group">
                    <button
                      onClick={() => setActiveList(name)}
                      className={`text-left text-xs font-semibold py-2 px-3 rounded-md flex-1 ${
                        activeList === name
                          ? "bg-teal-700 text-white"
                          : "text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
                      }`}
                    >
                      {name}
                    </button>
                    {name !== "Default" && (
                      <button
                        onClick={() => handleDeleteList(name)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-opacity focus:outline-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create Watchlist Form */}
            <form onSubmit={handleCreateList} className="space-y-2 border-t border-[var(--border)] pt-4">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">New Watchlist</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="List name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-[var(--border)] rounded bg-[var(--background-secondary)] text-[var(--foreground)] focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Panel: Watchlist Table */}
          <div className="md:col-span-3 space-y-6">
            {/* Add Stock to list Form */}
            <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--foreground)]">Watchlist: {activeList}</h4>
                <p className="text-[10px] text-[var(--text-secondary)]">Enter a stock symbol to add to this list.</p>
              </div>

              <form onSubmit={handleAddSymbol} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="e.g. INFY, TCS..."
                  value={newSymbolInput}
                  onChange={(e) => setNewSymbolInput(e.target.value)}
                  className="text-xs px-2.5 py-1.5 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-teal-500 uppercase font-mono w-full sm:w-36"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Stock
                </button>
              </form>
            </div>

            {/* Table */}
            <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--background)]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  <p className="text-[11px] text-[var(--text-secondary)] animate-pulse">Loading watchlisted stocks...</p>
                </div>
              ) : watchlistedStocks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Company</th>
                        <th className="py-2.5 px-4 text-right">Price</th>
                        <th className="py-2.5 px-4 text-right">Change %</th>
                        <th className="py-2.5 px-4 text-right">P/E</th>
                        <th className="py-2.5 px-4 text-right">ROE %</th>
                        <th className="py-2.5 px-4 text-right">ROCE %</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--foreground)]">
                      {watchlistedStocks.map((stock) => (
                        <tr key={stock.symbol} className="hover:bg-[var(--background-secondary)]/30 transition-colors">
                          <td className="py-3 px-4 font-bold">
                            <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="hover:underline flex flex-col">
                              <span className="font-bold text-[var(--foreground)]">{stock.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">{stock.symbol}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">
                            {stock.price !== null ? formatCurrency(stock.price) : "—"}
                          </td>
                          <td className={`py-3 px-4 text-right font-bold tabular-nums ${
                            stock.changePercent !== null && stock.changePercent >= 0 ? "text-emerald-600" : "text-red-600"
                          }`}>
                            {stock.changePercent !== null ? `${stock.changePercent >= 0 ? "+" : ""}${stock.changePercent.toFixed(2)}%` : "—"}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">
                            {stock.pe !== "—" ? `${stock.pe}x` : "—"}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">
                            {stock.roe !== "—" ? `${stock.roe}%` : "—"}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">
                            {stock.roce !== "—" ? `${stock.roce}%` : "—"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleRemoveSymbol(stock.symbol)}
                              className="text-red-500 hover:text-red-600 focus:outline-none p-1 cursor-pointer"
                              title="Remove from list"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center space-y-4">
                  <p className="text-xs text-[var(--text-secondary)] font-normal">This watchlist is currently empty. Add stocks above or check some popular stocks.</p>
                  <Link
                    href="/stocks"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline"
                  >
                    Browse Stocks <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
