export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { StockDataService } from "@/lib/stocks/stockDataService";

export const metadata = {
  title: "Sector Explorer | VolumeCall",
  description: "Browse Indian stock market sectors, aggregate market capitalization, and median financial valuation multiples.",
};

export default async function SectorsListPage() {
  const universe = await StockDataService.getScreenerUniverse();

  // Group by sector
  const sectorsMap: Record<string, typeof universe> = {};
  universe.forEach((s) => {
    if (!s.sector || s.sector === "N/A") return;
    if (!sectorsMap[s.sector]) {
      sectorsMap[s.sector] = [];
    }
    sectorsMap[s.sector].push(s);
  });

  const getMedian = (vals: number[]): number => {
    if (vals.length === 0) return 0;
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const parseVal = (str: string): number | null => {
    const num = parseFloat(str.replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? null : num;
  };

  const sectors = Object.keys(sectorsMap).map((sectorName) => {
    const stocks = sectorsMap[sectorName];
    const companiesCount = stocks.length;
    const totalMarketCap = stocks.reduce((sum, s) => sum + (s.marketCap || 0), 0);

    const peVals = stocks.map(s => parseVal(s.pe)).filter((v): v is number => v !== null);
    const roeVals = stocks.map(s => parseVal(s.roe)).filter((v): v is number => v !== null);
    const roceVals = stocks.map(s => parseVal(s.roce)).filter((v): v is number => v !== null);

    const sectorId = sectorName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    return {
      name: sectorName,
      sectorId,
      companiesCount,
      totalMarketCap,
      medianPE: getMedian(peVals),
      medianROE: getMedian(roeVals),
      medianROCE: getMedian(roceVals),
    };
  });

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[var(--background)]">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Sector Explorer
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1 max-w-2xl">
            Explore sector metrics, total market capitalization, and median financial valuation multiples across key Indian industry sectors.
          </p>
        </div>

        {/* Sectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sec) => (
            <Link
              key={sec.sectorId}
              href={`/sectors/${sec.sectorId}`}
              className="p-5 border border-[var(--border)] hover:border-teal-500 rounded-lg bg-[var(--background)] hover:bg-[var(--background-secondary)]/30 transition-all duration-150 group flex flex-col justify-between space-y-4"
            >
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {sec.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-normal mt-1">
                  {sec.companiesCount} Benchmark Companies
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Market Cap</span>
                  <span className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    ₹{sec.totalMarketCap.toLocaleString("en-IN")} Cr
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Median P/E</span>
                  <span className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    {sec.medianPE > 0 ? `${sec.medianPE.toFixed(1)}x` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Median ROE</span>
                  <span className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    {sec.medianROE > 0 ? `${sec.medianROE.toFixed(1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Median ROCE</span>
                  <span className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    {sec.medianROCE > 0 ? `${sec.medianROCE.toFixed(1)}%` : "—"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
