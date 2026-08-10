import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchAutocomplete from "@/components/stocks/SearchAutocomplete";

export const metadata = {
  title: "VolumeCall | Indian Stock Research & Valuation Ratios",
  description:
    "An Indian stock research and analysis platform. View stock price quotes, fundamentals, key valuation ratios, interactive charts, and monitor custom watchlists.",
};

export default function Home() {
  const popularStocks = [
    { symbol: "RELIANCE" },
    { symbol: "TCS" },
    { symbol: "HDFCBANK" },
    { symbol: "INFY" },
    { symbol: "BHARTIARTL" },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col justify-center py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto w-full space-y-16 sm:space-y-24 bg-[var(--background)]">
        
        {/* Search-First Hero Section */}
        <section className="text-left md:text-center space-y-6 w-full max-w-3xl mx-auto pt-4 sm:pt-10">
          <div className="space-y-3">
            {/* Minimal Sub-brand Header */}
            <span className="text-xs font-semibold tracking-wider text-teal-700 dark:text-teal-400 uppercase font-mono">
              VolumeCall
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-[1.1]">
              Research Indian stocks <br className="hidden md:inline" />
              without the noise.
            </h1>
          </div>
          
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl md:mx-auto leading-relaxed font-normal">
            Search companies, compare fundamentals, study valuations and analyze long-term price performance.
          </p>
          
          {/* Large stock search bar */}
          <div className="w-full max-w-xl md:mx-auto pt-6">
            <SearchAutocomplete 
              size="large" 
              placeholder="Search companies, symbols (e.g. RELIANCE, TCS, HDFCBANK)..." 
            />
            
            {/* Popular stocks quick entry points */}
            <div className="flex flex-wrap items-center md:justify-center gap-x-2 gap-y-1.5 mt-4 text-xs font-normal">
              <span className="text-[var(--text-secondary)]">Popular:</span>
              {popularStocks.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/stocks/${stock.symbol.toLowerCase()}`}
                  className="font-medium text-[var(--foreground)] hover:text-teal-700 dark:hover:text-teal-400 transition-colors bg-[var(--background-secondary)] px-2 py-0.5 border border-[var(--border)] rounded-sm text-[11px] font-mono"
                >
                  {stock.symbol}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Capability Overview - Borderless & High Density */}
        <section className="border-t border-[var(--border)] pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 w-full">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider font-mono">01</span>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Interactive Charting
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                Analyze daily stock prices using line or candlestick charts. Toggle moving averages (50 DMA / 200 DMA) and query longer periods (3Y, 5Y, 10Y) dynamically.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider font-mono">02</span>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Key Fundamental Ratios
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                Compare valuation metrics (P/E, P/B, EV/EBITDA) and returns (ROE, ROCE, ROA) directly against sector averages with interactive relative trackers.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider font-mono">03</span>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Return Calculations & CAGR
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                Study performance history with local return calculations ranging from short-term (1M, 6M) to long-term (1Y, 3Y, 5Y, and 10Y CAGR).
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
