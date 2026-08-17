"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyLogo } from "@/components/stocks/CompanyLogo";
import { formatCurrency, formatPercent } from "@/lib/stocks/formatting";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

interface StockEmbedProps {
  symbol: string;
}

interface QuoteData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
}

export function StockEmbed({ symbol }: StockEmbedProps) {
  const cleanSym = symbol.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cleanSym) return;

    let isMounted = true;
    async function fetchQuote() {
      try {
        const res = await fetch("/api/stocks/ticker");
        if (res.ok) {
          const data = await res.json();
          const items: QuoteData[] = data.tickers || [];
          const found = items.find((item) => item.symbol?.toUpperCase() === cleanSym);
          if (found && isMounted) {
            setQuote(found);
          }
        }
      } catch (err) {
        console.error("Failed to load stock quote for embed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchQuote();
    return () => {
      isMounted = false;
    };
  }, [cleanSym]);

  if (!cleanSym) return null;

  const isPositive = (quote?.change ?? 0) >= 0;

  return (
    <div className="my-5 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-teal)]/40 transition-colors shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Logo & Company Name */}
        <div className="flex items-center space-x-3 min-w-0">
          <CompanyLogo
            symbol={cleanSym}
            companyName={quote?.name || cleanSym}
            className="w-10 h-10 rounded-md"
            textClassName="text-sm"
          />
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                {cleanSym}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                NSE
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {quote?.name || `${cleanSym} Ltd.`}
            </p>
          </div>
        </div>

        {/* Right: Live Price & Research Link */}
        <div className="flex items-center space-x-4 shrink-0">
          <div className="text-right">
            <p className="font-mono text-sm font-bold text-[var(--text-primary)]">
              {loading ? (
                <span className="animate-pulse opacity-50">₹—.—</span>
              ) : quote ? (
                formatCurrency(quote.price)
              ) : (
                "—"
              )}
            </p>
            {quote && (
              <p
                className={`text-[11px] font-mono flex items-center justify-end space-x-0.5 ${
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {formatCurrency(quote.change)} ({formatPercent(quote.changePercent)})
                </span>
              </p>
            )}
          </div>

          <Link
            href={`/stocks/${cleanSym}`}
            target="_blank"
            className="p-2 rounded-md bg-[var(--bg-base)] hover:bg-[var(--accent-teal)] hover:text-white border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
            title="Open Stock Research Terminal"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StockEmbed;
