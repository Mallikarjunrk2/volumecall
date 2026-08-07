export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { StockDataService } from "@/lib/stocks/stockDataService";
import { formatCurrency } from "@/lib/stocks/formatting";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const name = id.toUpperCase().replace(/-/g, " ");
  return {
    title: `${name} Stocks Collection | VolumeCall`,
    description: `Browse the curated list of ${name} stocks, evaluate average financial metrics, capital return ratios, and share prices.`,
  };
}

export default async function CollectionDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const collectionData = await StockDataService.getCollectionsData(id);

  if (!collectionData) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Collection Not Found</h1>
          <p className="text-xs text-[var(--text-secondary)]">The requested theme collection could not be found.</p>
          <Link href="/collections" className="text-xs text-teal-600 hover:underline">Back to Collections</Link>
        </main>
        <Footer />
      </>
    );
  }

  const collectionNames: Record<string, string> = {
    nifty50: "Nifty 50 Index Stocks",
    sensex: "Sensex Index Stocks",
    midcap: "Midcap 100 Stocks",
    smallcap: "Smallcap Stocks",
    psu: "Public Sector (PSU) Stocks",
    railway: "Railway Sector Stocks",
    defence: "Defence Industry Stocks",
    ev: "Electric Vehicle (EV) Stocks",
    ai: "Artificial Intelligence (AI) Stocks",
    dividend: "High Dividend Yield Stocks",
  };

  const name = collectionNames[id.toLowerCase()] || id.toUpperCase().replace(/-/g, " ") + " Stocks";

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[var(--background)]">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6">
          <Link href="/collections" className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase hover:underline">
            ← All Collections
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mt-1 font-sans">
            {name}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1">
            Curated list of {collectionData.stocks.length} benchmark stocks.
          </p>
        </div>

        {/* Collection Averages Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] flex flex-col justify-between min-h-[84px]">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Average P/E Ratio</span>
            <span className="text-2xl font-black text-[var(--foreground)] mt-1 font-mono">
              {collectionData.averagePE > 0 ? `${collectionData.averagePE.toFixed(1)}x` : "—"}
            </span>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] flex flex-col justify-between min-h-[84px]">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Average ROE %</span>
            <span className="text-2xl font-black text-[var(--foreground)] mt-1 font-mono">
              {collectionData.averageROE > 0 ? `${collectionData.averageROE.toFixed(1)}%` : "—"}
            </span>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--background-secondary)] flex flex-col justify-between min-h-[84px]">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Average ROCE %</span>
            <span className="text-2xl font-black text-[var(--foreground)] mt-1 font-mono">
              {collectionData.averageROCE > 0 ? `${collectionData.averageROCE.toFixed(1)}%` : "—"}
            </span>
          </div>
        </div>

        {/* Stock List Table */}
        <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--background)]">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]">
                  <th className="py-2.5 px-4 font-bold text-[var(--text-secondary)] uppercase">Company</th>
                  <th className="py-2.5 px-4 font-bold text-[var(--text-secondary)] uppercase">Sector</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">Price</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">Change %</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">P/E</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">ROE %</th>
                  <th className="py-2.5 px-4 text-right font-bold text-[var(--text-secondary)] uppercase">ROCE %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--foreground)]">
                {collectionData.stocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-[var(--background-secondary)]/30 transition-colors">
                    <td className="py-3 px-4 font-bold">
                      <Link href={`/stocks/${stock.symbol.toLowerCase()}`} className="hover:underline">
                        {stock.name} <span className="text-[10px] text-neutral-500 font-mono">({stock.symbol})</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-left text-[var(--text-secondary)]">
                      {stock.sector}
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
