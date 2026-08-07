"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function StockError({ reset }: { reset: () => void }) {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-slate-50">
          Stock data is temporarily unavailable
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please retry in a moment. We do not substitute unavailable provider data with estimates.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-2 text-sm font-semibold rounded-sm bg-teal-700 dark:bg-teal-400 text-white dark:text-slate-950"
        >
          Retry
        </button>
      </main>
      <Footer />
    </>
  );
}
