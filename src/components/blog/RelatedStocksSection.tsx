"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CompanyLogo } from "@/components/stocks/CompanyLogo";
import { formatCurrency, formatPercent } from "@/lib/stocks/formatting";
import { TrendingUp, ArrowUpRight } from "lucide-react";

interface RelatedStocksSectionProps {
  symbols?: string[] | null;
}

interface QuoteData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
}

export function RelatedStocksSection({ symbols }: RelatedStocksSectionProps) {
  const cleanSymbols = useMemo(() => {
    if (!symbols || !Array.isArray(symbols)) return [];
    return symbols
      .map((s) => s.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
      .filter(Boolean)
      .slice(0, 5);
  }, [symbols]);

  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cleanSymbols.length === 0) return;

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
            if (sym && cleanSymbols.includes(sym)) {
              map[sym] = item;
            }
          });
          if (isMounted) {
            setQuotes(map);
          }
        }
      } catch (err) {
        console.error("Failed to load quotes for related stocks:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchQuotes();
    return () => {
      isMounted = false;
    };
  }, [cleanSymbols]);

  if (cleanSymbols.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg">
      <div className="flex items-center space-x-2 pb-2 border-b border-[var(--border-subtle)]">
        <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-primary)]">
          Related Stocks
        </h3>
      </div>

      <div className="space-y-2">
        {cleanSymbols.map((sym) => {
          const quote = quotes[sym];
          const isPositive = (quote?.change ?? 0) >= 0;

          return (
            <Link
              key={sym}
              href={`/stocks/${sym}`}
              className="p-2.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-teal)]/40 rounded-md transition-all group block shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <CompanyLogo
                    symbol={sym}
                    companyName={quote?.name || sym}
                    className="w-6 h-6 rounded-xs shrink-0"
                    textClassName="text-[10px]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="font-mono text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors">
                        {sym}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.1 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        NSE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 font-mono text-xs shrink-0">
                  <span className="font-bold text-[var(--text-primary)]">
                    {loading ? "..." : quote ? formatCurrency(quote.price) : "—"}
                  </span>
                  {quote && (
                    <span
                      className={`text-[10px] font-semibold ${
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPercent(quote.changePercent)}
                    </span>
                  )}
                  <ArrowUpRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-[var(--accent-teal)] transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RelatedStocksSection;
