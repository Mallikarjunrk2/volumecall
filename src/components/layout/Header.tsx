"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchAutocomplete } from "../stocks/SearchAutocomplete";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/stocks") {
      // Handles both /stocks landing and /stocks/[symbol] stock pages
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
    return `text-xs transition-colors duration-150 whitespace-nowrap ${
      active
        ? "text-[var(--foreground)] font-semibold"
        : "text-[var(--text-secondary)] font-normal hover:text-[var(--foreground)]"
    }`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center space-x-6 lg:space-x-8 shrink-0">
          <Link
            href="/"
            className="flex items-center space-x-2 focus:outline-none focus-visible:ring-1.5 focus-visible:ring-teal-600 dark:focus-visible:ring-teal-450 rounded-xs"
          >
            {/* Custom clean Chevron brand mark */}
            <svg
              className="w-4 h-4 text-teal-700 dark:text-teal-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
            <span className="text-sm font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
              VolumeCall
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-6">
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

        {/* Center Search Autocomplete */}
        <div className="flex-1 max-w-sm mx-auto hidden sm:block">
          <SearchAutocomplete placeholder="Search stocks..." />
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile/Tablet Navigation & Search */}
      <div className="md:hidden w-full px-4 pb-2.5 pt-1 bg-[var(--background)] border-b border-[var(--border)] space-y-2">
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
    </header>
  );
}
export default Header;
