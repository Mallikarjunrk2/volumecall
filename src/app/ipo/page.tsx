export const dynamic = "force-dynamic";

import { ComponentProps } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { StockDataService } from "@/lib/stocks/stockDataService";
import IpoClient from "./IpoClient";

export const metadata = {
  title: "IPO Center | Indian Stock Market IPO Tracker | VolumeCall",
  description: "Track upcoming, open/active, closed, and listed IPOs in India. Monitor bidding price bands, subscription rates, lot sizes, and listing dates.",
};

export default async function IpoPage() {
  let ipoData: ComponentProps<typeof IpoClient>["initialData"] = null;
  let ipoError: string | null = null;

  try {
    ipoData = await StockDataService.getIPOData() as ComponentProps<typeof IpoClient>["initialData"];
    if (!ipoData) {
      ipoData = { upcoming: [], listed: [], active: [], closed: [], pre_apply: [] };
    }
  } catch (err) {
    console.error("[IPO Page Load Error]:", err);
    ipoData = { upcoming: [], listed: [], active: [], closed: [], pre_apply: [] };
    ipoError = (err as Error).message || "Unable to fetch IPO listings.";
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[var(--background)]">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            IPO Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1 max-w-2xl">
            Track upcoming initial public offerings, monitor active bidding status, view lot sizes, check subscription updates, and research listed IPO performance.
          </p>
        </div>

        {/* IPO Content Client */}
        <IpoClient initialData={ipoData} error={ipoError} />
      </main>
      <Footer />
    </>
  );
}
