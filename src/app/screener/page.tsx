export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScreenerClient from "./ScreenerClient";

export const metadata = {
  title: "Stock Screener | VolumeCall",
  description: "Screen Indian stocks by valuation metrics, returns ratios, and industry sector.",
};

import { StockDataService } from "@/lib/stocks/stockDataService";

async function getScreenerData() {
  return StockDataService.getScreenerUniverse();
}

export default async function ScreenerPage() {
  const stocks = await getScreenerData();

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[var(--background)]">
        
        {/* Screener Header */}
        <div className="border-b border-[var(--border)] pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Quick Stock Screener
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1">
            Filter, sort, and analyze leading Indian companies based on fundamental valuation and performance ratios.
          </p>
        </div>

        {/* Informative Alert explaining Phase 1 scope */}
        <div className="p-4 border border-[var(--border)] rounded-md bg-[var(--background-secondary)] text-xs text-[var(--text-secondary)] leading-relaxed">
          <span className="font-semibold text-[var(--foreground)]">Screener Scope Note:</span> To ensure real-time query performance and protect API rate integrity, this screener filters from the benchmark equities list. Market-wide scanning with custom financial query rules will be enabled in a future database update. No mock values are presented.
        </div>

        {/* Client side interactive screen table */}
        <ScreenerClient initialStocks={stocks} />

      </main>
      <Footer />
    </>
  );
}
