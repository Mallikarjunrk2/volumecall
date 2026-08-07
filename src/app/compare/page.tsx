export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CompareClient from "./CompareClient";

export const metadata = {
  title: "Compare Stocks | Fundamental Comparison Tool | VolumeCall",
  description:
    "Compare fundamental multiples, price performance, profitability, and capital efficiency for up to 5 NSE-listed equities head-to-head with structured AI-assisted explanations.",
};

export default function ComparePage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[var(--background)]">
        {/* Page Header */}
        <div className="border-b border-[var(--border)] pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Compare Stocks
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal mt-1 max-w-2xl">
            Put stocks head-to-head. Compare valuation, profitability, performance, and highlights to find the best opportunities.
          </p>
        </div>

        {/* Comparison Selector / Results Client */}
        <CompareClient />
      </main>
      <Footer />
    </>
  );
}
