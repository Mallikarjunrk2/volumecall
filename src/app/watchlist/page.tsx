"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { formatCurrency } from "@/lib/stocks/formatting";
import { Plus, Trash2, ArrowRight, Loader2, Bookmark, Lock } from "lucide-react";
import { SearchAutocomplete } from "@/components/stocks/SearchAutocomplete";

interface WatchlistStockItem {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
  marketCap: string | number | null;
  pe: string | number | null;
  roe: string | number | null;
  roce: string | number | null;
}

export default function WatchlistPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user);

  const [watchlistStocks, setWatchlistStocks] = useState<WatchlistStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSymbolInput, setNewSymbolInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/stocks/watchlist");
      if (!res.ok) throw new Error("Failed to load watchlist.");
      const data = await res.json();
      if (Array.isArray(data)) {
        setWatchlistStocks(data);
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Unable to retrieve your watchlist.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (status !== "loading") {
      fetchWatchlist();
    }
  }, [status, fetchWatchlist]);

  const handleAddSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSymbolInput.trim().toUpperCase();
    if (!sym || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/stocks/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to add stock.");
      }

      setNewSymbolInput("");
      await fetchWatchlist();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to add stock.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSymbol = async (sym: string) => {
    // Optimistic UI update
    setWatchlistStocks((prev) => prev.filter((s) => s.symbol !== sym));

    try {
      const res = await fetch(`/api/stocks/watchlist?symbol=${encodeURIComponent(sym)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to remove stock.");
      }
    } catch (err: unknown) {
      console.error(err);
      // Re-fetch to restore state on failure
      fetchWatchlist();
    }
  };

  const handleGoogleLogin = () => {
    const callbackUrl = typeof window !== "undefined" ? window.location.href : "/watchlist";
    signIn("google", { callbackUrl });
  };

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[var(--bg-base)] text-[var(--text-primary)] min-h-[calc(100vh-140px)]">
        {/* Page Title */}
        <div className="border-b border-[var(--border-subtle)] pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              My Watchlist
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1">
              Track your favorite Indian equities, price changes, and valuation ratios in one place.
            </p>
          </div>
        </div>

        {/* LOADING STATE */}
        {status === "loading" ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" />
            <p className="text-xs text-[var(--text-secondary)]">Checking authentication...</p>
          </div>
        ) : !isAuthenticated ? (
          /* LOGGED OUT STATE — CLEAN SIGN-IN CARD */
          <div className="max-w-lg mx-auto my-12 p-8 sm:p-10 border border-[var(--border-subtle)] bg-[var(--bg-base)] rounded-xl shadow-xl space-y-6 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Bookmark className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                My Watchlist
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                Sign in to save stocks and access your watchlist across VolumeCall.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleGoogleLogin}
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
                Free account · No payment required
              </p>
            </div>
          </div>
        ) : (
          /* LOGGED IN STATE — REAL POSTGRESQL WATCHLIST */
          <div className="space-y-6">
            {/* Quick Add Bar */}
            <div className="p-4 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-secondary)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Add Stock to Watchlist
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Type an NSE stock symbol (e.g. RELIANCE, TCS, INFY) to add it instantly.
                </p>
              </div>

              <form onSubmit={handleAddSymbol} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="e.g. RELIANCE"
                  value={newSymbolInput}
                  onChange={(e) => setNewSymbolInput(e.target.value)}
                  className="text-xs px-3 py-2 border border-[var(--border-subtle)] rounded-md bg-[var(--bg-base)] text-[var(--text-primary)] focus:outline-none focus:border-teal-500 uppercase font-mono w-full sm:w-44"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold rounded-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add Stock</span>
                </button>
              </form>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-md">
                {errorMsg}
              </div>
            )}

            {/* Watchlist Table */}
            <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--bg-base)]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600 dark:text-teal-400" />
                  <p className="text-xs text-[var(--text-secondary)] animate-pulse">Loading your saved stocks...</p>
                </div>
              ) : watchlistStocks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4 text-right">Price</th>
                        <th className="py-3 px-4 text-right">1D Change</th>
                        <th className="py-3 px-4 text-right">Market Cap</th>
                        <th className="py-3 px-4 text-right">P/E</th>
                        <th className="py-3 px-4 text-right">ROE %</th>
                        <th className="py-3 px-4 text-right">ROCE %</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] font-medium text-[var(--text-primary)]">
                      {watchlistStocks.map((stock) => (
                        <tr key={stock.symbol} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold">
                            <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="hover:underline flex flex-col">
                              <span className="font-bold text-[var(--text-primary)] text-xs sm:text-sm">{stock.name || stock.symbol}</span>
                              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">{stock.symbol}</span>
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-right tabular-nums font-semibold">
                            {stock.price !== null && stock.price !== undefined ? formatCurrency(stock.price) : "—"}
                          </td>
                          <td className={`py-3.5 px-4 text-right font-bold tabular-nums ${
                            stock.changePercent !== null && stock.changePercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }`}>
                            {stock.changePercent !== null && stock.changePercent !== undefined
                              ? `${stock.changePercent >= 0 ? "+" : ""}${stock.changePercent.toFixed(2)}%`
                              : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right tabular-nums text-[var(--text-secondary)]">
                            {stock.marketCap ? String(stock.marketCap) : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right tabular-nums text-[var(--text-secondary)]">
                            {stock.pe !== "—" && stock.pe !== null ? `${stock.pe}x` : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right tabular-nums text-[var(--text-secondary)]">
                            {stock.roe !== "—" && stock.roe !== null ? `${stock.roe}%` : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right tabular-nums text-[var(--text-secondary)]">
                            {stock.roce !== "—" && stock.roce !== null ? `${stock.roce}%` : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleRemoveSymbol(stock.symbol)}
                              className="text-red-500 hover:text-red-600 p-1.5 rounded hover:bg-red-500/10 transition-colors focus:outline-none cursor-pointer"
                              title="Remove from Watchlist"
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
                  <p className="text-xs text-[var(--text-secondary)] font-normal">Your watchlist is empty. Search and add stocks above or browse popular equities.</p>
                  <Link
                    href="/stocks"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    <span>Browse Stocks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
