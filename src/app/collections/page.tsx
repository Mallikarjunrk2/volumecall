export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { THEME_MAP } from "@/lib/stocks/universe";

export const metadata = {
  title: "Stock Collections | Thematic Research Directory | VolumeCall",
  description: "Browse thematic lists of Indian stocks including Nifty 50, PSU, Railway, Defence, EV, AI, and dividend stocks.",
};

interface CollectionItem {
  id: string;
  name: string;
  description: string;
  count: number;
}

export default function CollectionsListPage() {
  const collections: CollectionItem[] = [
    { id: "nifty50", name: "Nifty 50", description: "India's benchmark index of top 50 blue-chip companies.", count: THEME_MAP.nifty50?.length || 0 },
    { id: "sensex", name: "Sensex", description: "Benchmark index of the top 30 BSE-listed market leaders.", count: THEME_MAP.sensex?.length || 0 },
    { id: "midcap", name: "Midcap 100", description: "Leading mid-sized companies with strong growth potential.", count: THEME_MAP.midcap?.length || 0 },
    { id: "smallcap", name: "Smallcap", description: "High-risk, high-growth potential small companies.", count: THEME_MAP.smallcap?.length || 0 },
    { id: "psu", name: "PSU Stocks", description: "Public Sector Undertakings with strong government backing.", count: THEME_MAP.psu?.length || 0 },
    { id: "railway", name: "Railway Stocks", description: "Companies driving India's railway infrastructure boom.", count: THEME_MAP.railway?.length || 0 },
    { id: "defence", name: "Defence Stocks", description: "Key players in India's defence indigenisation push.", count: THEME_MAP.defence?.length || 0 },
    { id: "ev", name: "EV Stocks", description: "Stocks positioned to benefit from electric vehicle adoption.", count: THEME_MAP.ev?.length || 0 },
    { id: "ai", name: "AI Stocks", description: "Companies leading tech, AI, and digital transformation.", count: THEME_MAP.ai?.length || 0 },
    { id: "dividend", name: "Dividend Stocks", description: "High-yield dividend companies offering stable cash returns.", count: THEME_MAP.dividend?.length || 0 },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[var(--background)]">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Stock Collections
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1 max-w-2xl">
            Browse handpicked thematic collections and index lists to discover and compare companies aligned with popular investment themes.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="p-5 border border-[var(--border)] hover:border-teal-500 rounded-lg bg-[var(--background)] hover:bg-[var(--background-secondary)]/30 transition-all duration-150 group flex flex-col justify-between space-y-3"
            >
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-normal mt-1.5 leading-relaxed">
                  {col.description}
                </p>
              </div>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase pt-2 border-t border-[var(--border)]/50">
                {col.count} Stocks →
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
