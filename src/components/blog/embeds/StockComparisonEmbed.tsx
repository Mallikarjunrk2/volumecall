"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CompanyLogo } from "@/components/stocks/CompanyLogo";
import { formatCurrency, formatPercent } from "@/lib/stocks/formatting";
import { ArrowRight, BarChart3 } from "lucide-react";

interface StockComparisonEmbedProps {
  symbols: string;
}

interface QuoteData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
}

export function StockComparisonEmbed({ symbols }: StockComparisonEmbedProps) {
  // Parse, clean, and limit to 5 symbols max
  const symbolList = useMemo(() => {
    return symbols
      .split(",")
      .map((s) => s.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
      .filter(Boolean)
      .slice(0, 5);
  }, [symbols]);

  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (symbolList.length === 0) return;

    let isMounted = true;
    async function fetchQuotes() {
      try {
        const res = await fetch("/api/stocks/ticker");
        if (res.ok) {
          const data = await res.json();
          const items: QuoteData[] = data.tickers || [];
          const map: Record<string, QuoteData> = {};
          items.forEach((item) => {
            const sym = item.symbol?.toUpperCase();
            if (sym && symbolList.includes(sym)) {
              map[sym] = item;
            }
          });
          if (isMounted) {
            setQuotes(map);
          }
        }
      } catch (err) {
        console.error("Failed to load quotes for comparison embed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchQuotes();
    return () => {
      isMounted = false;
    };
  }, [symbolList]);

  if (symbolList.length === 0) return null;

  return (
    <div className="my-6 p-4 sm:p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-[var(--accent-teal)]" />
          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
            Sector Benchmark Comparison
          </h4>
        </div>
        <Link
          href={`/compare?symbols=${symbolList.join(",")}`}
          target="_blank"
          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[var(--accent-teal)] hover:underline"
        >
          <span>Open Side-by-Side Compare</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {symbolList.map((sym) => {
          const quote = quotes[sym];
          const isPositive = (quote?.change ?? 0) >= 0;

          return (
            <Link
              key={sym}
              href={`/stocks/${sym}`}
              target="_blank"
              className="p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)]/40 rounded-md transition-colors block group"
            >
              <div className="flex items-center space-x-2.5 mb-2">
                <CompanyLogo
                  symbol={sym}
                  companyName={quote?.name || sym}
                  className="w-8 h-8 rounded-sm"
                  textClassName="text-xs"
                />
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors">
                    {sym}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">
                    {quote?.name || `${sym} Ltd.`}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-[var(--text-primary)]">
                  {loading ? "..." : quote ? formatCurrency(quote.price) : "—"}
                </span>
                {quote && (
                  <span
                    className={`text-[11px] ${
                      isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatPercent(quote.changePercent)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default StockComparisonEmbed;
