import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { resolveSymbol, getStockPrice, getStockProfile, getKeyRatios } from "@/lib/upstox/service";
import ScreenerClient from "./ScreenerClient";

export const metadata = {
  title: "Stock Screener | VolumeCall",
  description: "Screen Indian stocks by valuation metrics, returns ratios, and industry sector.",
};

const POPULAR_TICKERS = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "BHARTIARTL"];

async function getScreenerData() {
  const promises = POPULAR_TICKERS.map(async (symbol) => {
    try {
      const instrument = await resolveSymbol(symbol);
      if (!instrument) return null;

      const [price, profile, ratios] = await Promise.all([
        getStockPrice(instrument.instrumentKey),
        getStockProfile(instrument.isin),
        getKeyRatios(instrument.isin),
      ]);

      const getVal = (name: string) => ratios.find((r) => r.name.toLowerCase() === name.toLowerCase())?.companyValue || "N/A";
      const peRatio = ratios.find((r) => r.name.toLowerCase().includes("p/e"))?.companyValue || "N/A";

      return {
        symbol: instrument.symbol,
        name: instrument.name,
        exchange: instrument.exchange,
        price: price ? price.lastPrice : null,
        sector: profile ? profile.sector : "N/A",
        pe: peRatio,
        pb: getVal("P/B"),
        roe: getVal("ROE"),
        roce: getVal("ROCE"),
        evEbitda: getVal("EV/EBITDA"),
      };
    } catch (err) {
      console.error(`Screener failed to load ${symbol}:`, err);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((item): item is NonNullable<typeof item> => item !== null);
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
