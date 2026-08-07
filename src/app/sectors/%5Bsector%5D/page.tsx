export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { StockDataService } from "@/lib/stocks/stockDataService";
import { formatCurrency } from "@/lib/stocks/formatting";

export async function generateMetadata(props: { params: Promise<{ sector: string }> }) {
  const { sector: sectorId } = await props.params;
  const name = sectorId.toUpperCase().replace(/-/g, " ");
  return {
    title: `${name} Sector Dashboard | VolumeCall`,
    description: `Analyze ${name} sector averages, median valuation multiples, capital returns efficiency, and top peer comparison stats.`,
  };
}

export default async function SectorDetailPage(props: {
  params: Promise<{ sector: string }>;
}) {
  const { sector: sectorId } = await props.params;
  
  // Find matched sector dynamically from the universe
  const universe = await StockDataService.getScreenerUniverse();
  
  const matchedSector = universe.find(
    (s) => s.sector.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") === sectorId
  );

  if (!matchedSector) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Sector Not Found</h1>
          <p className="text-xs text-[var(--text-secondary)]">The requested sector could not be located in our stock universe.</p>
          <Link href="/sectors" className="text-xs text-teal-600 hover:underline">Back to Sectors</Link>
        </main>
        <Footer />
      </>
    );
  }

  const sectorName = matchedSector.sector;
  const sectorData = await StockDataService.getSectorData(sectorName);

  if (!sectorData) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Sector Data Unavailable</h1>
          <p className="text-xs text-[var(--text-secondary)]">Unable to load metrics for the matched sector.</p>
        </main>
        <Footer />
      </>
    );
  }

  // Filter stocks in this sector
  const sectorStocks = universe.filter((s) => s.sector === sectorName);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[var(--background)]">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Link href="/sectors" className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase hover:underline">
              ← Sector Explorer
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mt-1">
              {sectorName}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1">
              Sector dashboard for {sectorData.companiesCount} benchmark companies.
            </p>
          </div>
          
          <div className="flex gap-4 border-t md:border-t-0 border-[var(--border)] pt-4 md:pt-0">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Sector Market Cap</span>
              <span className="text-sm font-extrabold text-[var(--foreground)] mt-0.5">
                ₹{sectorData.marketCap.toLocaleString("en-IN")} Cr
              </span>
            </div>
          </div>
        </div>

        {/* Sector Medians scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] flex flex-col justify-between min-h-[84px]">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Median P/E Ratio</span>
            <span className="text-2xl font-black text-[var(--foreground)] mt-1 font-mono">
              {sectorData.medianPE > 0 ? `${sectorData.medianPE.toFixed(1)}x` : "—"}
            </span>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] flex flex-col justify-between min-h-[84px]">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Median ROE %</span>
            <span className="text-2xl font-black text-[var(--foreground)] mt-1 font-mono">
              {sectorData.medianROE > 0 ? `${sectorData.medianROE.toFixed(1)}%` : "—"}
            </span>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] flex flex-col justify-between min-h-[84px]">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Median ROCE %</span>
            <span className="text-2xl font-black text-[var(--foreground)] mt-1 font-mono">
              {sectorData.medianROCE > 0 ? `${sectorData.medianROCE.toFixed(1)}%` : "—"}
            </span>
          </div>
        </div>

        {/* Top Gainers & Losers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gainers */}
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--background)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Top Sector Gainers</h3>
            <div className="space-y-3">
              {sectorData.gainers.map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center text-xs">
                  <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="font-bold text-[var(--foreground)] hover:underline font-mono">
                    {stock.symbol}
                  </Link>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                    +{stock.changePercent?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Losers */}
          <div className="border border-[var(--border)] rounded-lg p-5 bg-[var(--background)] space-y-4">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Top Sector Losers</h3>
            <div className="space-y-3">
              {sectorData.losers.map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center text-xs">
                  <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="font-bold text-[var(--foreground)] hover:underline font-mono">
                    {stock.symbol}
                  </Link>
                  <span className="text-red-600 dark:text-red-400 font-bold font-mono">
                    {stock.changePercent?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Peers List Table */}
        <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--background)]">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]">
                  <th className="py-2.5 px-4 font-bold text-[var(--text-secondary)] uppercase">Company</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">Price</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">Change %</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">P/E</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">ROE %</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">ROCE %</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">Debt/Eq</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--foreground)]">
                {sectorStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-[var(--background-secondary)]/30 transition-colors">
                    <td className="py-3 px-4 font-bold">
                      <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="hover:underline">
                        {stock.name} <span className="text-[10px] text-neutral-500 font-mono">({stock.symbol})</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {stock.price !== null ? formatCurrency(stock.price) : "—"}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums ${
                      stock.changePercent && stock.changePercent >= 0 ? "text-emerald-600" : "text-red-600"
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
                    <td className="py-3 px-4 text-right tabular-nums text-neutral-500">
                      {stock.debtToEquity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
