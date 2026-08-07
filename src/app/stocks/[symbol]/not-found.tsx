import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function StockNotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-950 dark:text-slate-50">Stock not found</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Search for an NSE equity by company name or trading symbol.
        </p>
        <Link className="text-sm font-semibold text-teal-700 dark:text-teal-400" href="/">
          Return to search
        </Link>
      </main>
      <Footer />
    </>
  );
}
