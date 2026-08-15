"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchAutocomplete } from "../stocks/SearchAutocomplete";
import { ThemeToggle } from "../ui/ThemeToggle";
import { MarketTicker } from "./MarketTicker";

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/stocks") {
      return pathname.startsWith("/stocks");
    }
    if (href === "/compare") {
      return pathname.startsWith("/compare") || pathname.startsWith("/fight");
    }
    if (href === "/ipo") {
      return pathname.startsWith("/ipo");
    }
    if (href === "/calculators") {
      return pathname.startsWith("/calculators");
    }
    return pathname === href;
  };

  const linkClass = (href: string) => {
    const active = isActive(href);
    return `text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
      active
        ? "text-[var(--text-primary)] font-semibold"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-base)]/95 backdrop-blur-md">
      {/* ─── LEVEL 1: MAIN NAVIGATION (~58–62px) ─────────────────────────── */}
      <div className="border-b border-[var(--border-subtle)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[58px] sm:h-[62px] flex items-center justify-between gap-4">
          {/* Brand Logo & Navigation */}
          <div className="flex items-center space-x-6 lg:space-x-8 shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded-xs"
            >
              {/* Crisp teal brand mark */}
              <span className="h-4 w-4 rounded-xs bg-[#0D9488] dark:bg-[#2DD4BF] flex items-center justify-center shrink-0">
                <span className="h-1.5 w-1.5 bg-white dark:bg-black rounded-xs" />
              </span>
              <span className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)] uppercase">
                VolumeCall
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/stocks" className={linkClass("/stocks")}>
                Stocks
              </Link>
              <Link href="/ipo" className={linkClass("/ipo")}>
                IPO
              </Link>
              <Link href="/compare" className={linkClass("/compare")}>
                Compare
              </Link>
              <Link href="/calculators" className={linkClass("/calculators")}>
                Calculators
              </Link>
            </nav>
          </div>

          {/* Center / Right Search Autocomplete */}
          <div className="flex-1 max-w-sm mx-auto hidden sm:block">
            <SearchAutocomplete placeholder="Search stocks (e.g. RELIANCE, TCS)..." />
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden w-full px-4 pb-2.5 pt-1 bg-[var(--bg-base)] border-t border-[var(--border-subtle)] space-y-2">
          <nav className="flex items-center space-x-5 overflow-x-auto py-0.5 text-xs">
            <Link href="/stocks" className={linkClass("/stocks")}>
              Stocks
            </Link>
            <Link href="/ipo" className={linkClass("/ipo")}>
              IPO
            </Link>
            <Link href="/compare" className={linkClass("/compare")}>
              Compare
            </Link>
            <Link href="/calculators" className={linkClass("/calculators")}>
              Calculators
            </Link>
          </nav>
          <div className="sm:hidden">
            <SearchAutocomplete placeholder="Search stocks..." />
          </div>
        </div>
      </div>

      {/* ─── LEVEL 2: STOCK MARKET TICKER RUNNER (~32–34px) ─────────────── */}
      <MarketTicker />
    </header>
  );
}

export default Header;


