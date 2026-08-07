import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchAutocomplete from "@/components/stocks/SearchAutocomplete";

export const metadata = {
  title: "Stocks Search & Index Directory | VolumeCall",
  description: "Search and research NSE-listed companies. Access share price quotes, fundamental ratios, and financial charts.",
};

export default function StocksIndexPage() {
  const popularStocks = [
    { symbol: "RELIANCE", name: "Reliance Industries" },
    { symbol: "TCS", name: "Tata Consultancy Services" },
    { symbol: "HDFCBANK", name: "HDFC Bank" },
    { symbol: "INFY", name: "Infosys Limited" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel" },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col justify-center items-center py-16 sm:py-24 px-4 max-w-2xl mx-auto w-full space-y-8 bg-[var(--background)]">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Stocks
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-normal max-w-md mx-auto">
            Search and research NSE-listed companies to analyze their financials, moving averages, and sector performance.
          </p>
        </div>

        {/* Large Visually Dominant Search */}
        <div className="w-full pt-4">
          <SearchAutocomplete
            size="large"
            placeholder="Enter company name, symbol or ISIN..."
          />
        </div>

        {/* Popular Stocks Grid */}
        <div className="w-full pt-6 space-y-3">
          <h3 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-center">
            Popular Equities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularStocks.map((stock) => (
              <Link
                key={stock.symbol}
                href={`/stocks/${stock.symbol.toLowerCase()}`}
                className="flex items-center justify-between p-3 border border-[var(--border)] rounded-md bg-[var(--background)] hover:bg-[var(--background-secondary)] transition-all duration-150 group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--foreground)] font-mono">
                    {stock.symbol}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] truncate max-w-[180px]">
                    {stock.name}
                  </span>
                </div>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  View →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
