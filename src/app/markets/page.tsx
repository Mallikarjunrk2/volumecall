export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { StockDataService, ScreenerStock } from "@/lib/stocks/stockDataService";
import { formatCurrency } from "@/lib/stocks/formatting";
import { TrendingUp, TrendingDown, Activity, Award } from "lucide-react";

export const metadata = {
  title: "Markets Dashboard | Live Market Movers | VolumeCall",
  description: "Monitor leading indexes like NIFTY 50 and SENSEX. Discover today's top gainers, top losers, active stocks, and volume leaders in the Indian markets.",
};

export default async function MarketsDashboardPage() {
  let universe: ScreenerStock[] = [];
  try {
    universe = await StockDataService.getScreenerUniverse() || [];
  } catch (err) {
    console.error("[Markets Page Load Error]:", err);
    universe = [];
  }

  // 1. Calculate movers dynamically from universe
  const activePriceStocks = universe.filter(s => s.price !== null && s.changePercent !== null);

  const topGainers = [...activePriceStocks]
    .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
    .slice(0, 5);

  const topLosers = [...activePriceStocks]
    .sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0))
    .slice(0, 5);

  const volumeLeaders = [...activePriceStocks]
    .sort((a, b) => (b.volume || 0) - (a.volume || 0))
    .slice(0, 5);

  const highs52W = [...activePriceStocks]
    .filter(s => s.high52W !== null)
    .sort((a, b) => {
      // Find how close to 52W high
      const aGap = a.high52W && a.price ? (a.high52W - a.price) / a.high52W : Infinity;
      const bGap = b.high52W && b.price ? (b.high52W - b.price) / b.high52W : Infinity;
      return aGap - bGap;
    })
    .slice(0, 5);

  const indices = [
    { name: "NIFTY 50", value: "24,310.25", change: "+115.30", changePercent: "+0.48%", isPositive: true },
    { name: "SENSEX", value: "79,845.60", change: "+382.40", changePercent: "+0.48%", isPositive: true },
    { name: "BANK NIFTY", value: "51,480.90", change: "-120.50", changePercent: "-0.23%", isPositive: false },
    { name: "NIFTY MIDCAP", value: "12,650.35", change: "+98.15", changePercent: "+0.78%", isPositive: true },
    { name: "NIFTY SMALLCAP", value: "16,420.70", change: "+168.40", changePercent: "+1.04%", isPositive: true },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[var(--background)]">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Markets Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1 max-w-2xl">
            Monitor Indian indexes, sector trends, and live top movers calculated dynamically across our equity research database.
          </p>
        </div>

        {/* Index Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {indices.map((idx, i) => (
            <div key={i} className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background)] flex flex-col justify-between min-h-[96px]">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">{idx.name}</span>
                <h3 className="text-base font-extrabold text-[var(--foreground)] mt-1 font-mono">{idx.value}</h3>
              </div>
              <span className={`text-xs font-bold font-mono mt-2 ${
                idx.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}>
                {idx.change} ({idx.changePercent})
              </span>
            </div>
          ))}
        </div>

        {/* Movers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {/* Top Gainers */}
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--background)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Top Gainers
            </h3>
            <div className="divide-y divide-[var(--border)]">
              {topGainers.map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center py-2.5 text-xs first:pt-0 last:pb-0">
                  <div className="flex flex-col">
                    <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="font-bold text-[var(--foreground)] hover:underline font-mono">
                      {stock.symbol}
                    </Link>
                    <span className="text-[10px] text-neutral-500 font-normal truncate max-w-[130px]">{stock.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[var(--foreground)] tabular-nums block">{formatCurrency(stock.price || 0)}</span>
                    <span className="text-emerald-600 font-bold font-mono text-[10px]">+{stock.changePercent?.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--background)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-red-600" />
              Top Losers
            </h3>
            <div className="divide-y divide-[var(--border)]">
              {topLosers.map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center py-2.5 text-xs first:pt-0 last:pb-0">
                  <div className="flex flex-col">
                    <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="font-bold text-[var(--foreground)] hover:underline font-mono">
                      {stock.symbol}
                    </Link>
                    <span className="text-[10px] text-neutral-500 font-normal truncate max-w-[130px]">{stock.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[var(--foreground)] tabular-nums block">{formatCurrency(stock.price || 0)}</span>
                    <span className="text-red-600 font-bold font-mono text-[10px]">{stock.changePercent?.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volume Leaders */}
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--background)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              Volume Leaders
            </h3>
            <div className="divide-y divide-[var(--border)]">
              {volumeLeaders.map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center py-2.5 text-xs first:pt-0 last:pb-0">
                  <div className="flex flex-col">
                    <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="font-bold text-[var(--foreground)] hover:underline font-mono">
                      {stock.symbol}
                    </Link>
                    <span className="text-[10px] text-neutral-500 font-normal truncate max-w-[130px]">{stock.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[var(--foreground)] tabular-nums block">{formatCurrency(stock.price || 0)}</span>
                    <span className="text-neutral-500 font-mono text-[10px]">{(stock.volume || 0).toLocaleString()} sh</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Near 52W High */}
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--background)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Near 52W High
            </h3>
            <div className="divide-y divide-[var(--border)]">
              {highs52W.map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center py-2.5 text-xs first:pt-0 last:pb-0">
                  <div className="flex flex-col">
                    <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="font-bold text-[var(--foreground)] hover:underline font-mono">
                      {stock.symbol}
                    </Link>
                    <span className="text-[10px] text-neutral-500 font-normal truncate max-w-[130px]">{stock.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[var(--foreground)] tabular-nums block">{formatCurrency(stock.price || 0)}</span>
                    <span className="text-amber-600 font-bold font-mono text-[10px] sm:text-[9px] uppercase">Peak: ₹{stock.high52W?.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
