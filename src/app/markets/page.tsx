import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchAutocomplete from "@/components/stocks/SearchAutocomplete";
import Link from "next/link";
import { resolveSymbol, getStockPrice, getStockProfile, getKeyRatios } from "@/lib/upstox/service";
import { formatCurrency, formatPercent } from "@/lib/stocks/formatting";

export const metadata = {
  title: "Markets Overview | VolumeCall",
  description: "Track price quotes, daily returns, sectors, and fundamental ratios for leading NSE equities.",
};

// We define the list of popular equities that we have access to via the Upstox API
const POPULAR_TICKERS = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "BHARTIARTL"];

async function getMarketData() {
  const dataPromises = POPULAR_TICKERS.map(async (symbol) => {
    try {
      const instrument = await resolveSymbol(symbol);
      if (!instrument) return null;

      // Fetch quote, profile, and ratios in parallel
      const [price, profile, ratios] = await Promise.all([
        getStockPrice(instrument.instrumentKey),
        getStockProfile(instrument.isin),
        getKeyRatios(instrument.isin),
      ]);

      const peRatio = ratios.find((r) => r.name.toLowerCase().includes("p/e"))?.companyValue || "N/A";
      const roeRatio = ratios.find((r) => r.name.toLowerCase() === "roe")?.companyValue || "N/A";
      const roceRatio = ratios.find((r) => r.name.toLowerCase() === "roce")?.companyValue || "N/A";

      return {
        symbol: instrument.symbol,
        name: instrument.name,
        exchange: instrument.exchange,
        price: price ? price.lastPrice : null,
        change: price ? price.change : null,
        changePercent: price ? price.changePercent : null,
        sector: profile ? profile.sector : "N/A",
        pe: peRatio,
        roe: roeRatio,
        roce: roceRatio,
      };
    } catch (err) {
      console.error(`Failed to fetch market data for ${symbol}:`, err);
      return null;
    }
  });

  const results = await Promise.all(dataPromises);
  return results.filter((item): item is NonNullable<typeof item> => item !== null);
}

export default async function MarketsPage() {
  const marketList = await getMarketData();

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[var(--background)]">
        
        {/* Markets Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
              Markets
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal">
              Explore key financial metrics and daily price changes of popular Indian equities.
            </p>
          </div>
          <div className="w-full max-w-xs shrink-0">
            <SearchAutocomplete placeholder="Search equities..." />
          </div>
        </div>

        {/* Informative Alert explaining Phase 1 scope */}
        <div className="p-4 border border-[var(--border)] rounded-md bg-[var(--background-secondary)] text-xs text-[var(--text-secondary)] leading-relaxed">
          <span className="font-semibold text-[var(--foreground)]">Markets Scope Note:</span> This list displays live, authenticated metrics fetched from the Upstox API for frequently researched equities. Direct, market-wide indices tracking and multi-exchange scanners are planned for future database updates. No mock data is presented.
        </div>

        {/* High Density Table */}
        <div className="w-full overflow-x-auto border border-[var(--border)] rounded-md bg-[var(--background)]">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]">
                <th className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-left">Company</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-left">Sector</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Price</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Change (%)</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">P/E</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">ROE</th>
                <th className="py-2.5 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">ROCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {marketList.length > 0 ? (
                marketList.map((stock) => {
                  const isPositive = stock.change !== null && stock.change >= 0;
                  const changeColor = stock.changePercent === null
                    ? "text-[var(--text-secondary)]"
                    : isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400";
                  
                  return (
                    <tr 
                      key={stock.symbol}
                      className="hover:bg-[var(--background-secondary)]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-left">
                        <Link 
                          href={`/stocks/${stock.symbol.toLowerCase()}`}
                          className="flex flex-col focus:outline-none hover:underline"
                        >
                          <span className="font-bold text-[var(--foreground)]">{stock.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">{stock.symbol} · {stock.exchange}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-left text-[var(--text-secondary)]">
                        {stock.sector}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[var(--foreground)] font-semibold tabular-nums">
                        {stock.price !== null ? formatCurrency(stock.price) : "N/A"}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold tabular-nums ${changeColor}`}>
                        {stock.changePercent !== null 
                          ? `${isPositive ? "+" : ""}${formatPercent(stock.changePercent)}` 
                          : "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[var(--foreground)] font-medium tabular-nums">
                        {stock.pe}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[var(--foreground)] font-medium tabular-nums">
                        {stock.roe}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[var(--foreground)] font-medium tabular-nums">
                        {stock.roce}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--text-secondary)]">
                    Failed to load market data. Please verify your Upstox connection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
