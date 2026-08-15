"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyLogo } from "@/components/stocks/CompanyLogo";

interface TickerItem {
  symbol: string;
  displayName: string;
  companyName: string;
  price?: number;
  change?: number;
  changePercent?: number;
  isPositive?: boolean;
}

const INITIAL_UNIVERSE: TickerItem[] = [
  { symbol: "RELIANCE", displayName: "RELIANCE", companyName: "Reliance Industries Ltd" },
  { symbol: "TCS", displayName: "TCS", companyName: "Tata Consultancy Services Ltd" },
  { symbol: "HDFCBANK", displayName: "HDFC BANK", companyName: "HDFC Bank Ltd" },
  { symbol: "BHARTIARTL", displayName: "BHARTI AIRTEL", companyName: "Bharti Airtel Ltd" },
  { symbol: "ICICIBANK", displayName: "ICICI BANK", companyName: "ICICI Bank Ltd" },
  { symbol: "INFY", displayName: "INFOSYS", companyName: "Infosys Ltd" },
  { symbol: "SBIN", displayName: "SBI", companyName: "State Bank of India" },
  { symbol: "LT", displayName: "L&T", companyName: "Larsen & Toubro Ltd" },
  { symbol: "ITC", displayName: "ITC", companyName: "ITC Ltd" },
  { symbol: "BAJFINANCE", displayName: "BAJAJ FINANCE", companyName: "Bajaj Finance Ltd" },
  { symbol: "MARUTI", displayName: "MARUTI", companyName: "Maruti Suzuki India Ltd" },
  { symbol: "AXISBANK", displayName: "AXIS BANK", companyName: "Axis Bank Ltd" },
  { symbol: "TATAMOTORS", displayName: "TATA MOTORS", companyName: "Tata Motors Ltd" },
  { symbol: "SUNPHARMA", displayName: "SUN PHARMA", companyName: "Sun Pharmaceutical Industries Ltd" },
  { symbol: "KOTAKBANK", displayName: "KOTAK BANK", companyName: "Kotak Mahindra Bank Ltd" },
];

export function MarketTicker() {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_UNIVERSE);

  useEffect(() => {
    let isMounted = true;

    async function loadLiveQuotes() {
      try {
        const res = await fetch("/api/stocks/ticker", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.tickers && Array.isArray(data.tickers) && data.tickers.length > 0) {
          setTickers(data.tickers);
        }
      } catch (err) {
        console.error("[MarketTicker] Live ticker load failed:", err);
      }
    }

    loadLiveQuotes();

    return () => {
      isMounted = false;
    };
  }, []);

  // Duplicated list creates a mathematically seamless continuous loop without jump
  const tickerList = [...tickers, ...tickers];

  return (
    <div className="w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#050505] border-t border-b border-[#E2E8F0] dark:border-[#1A1A1A] select-none h-[58px] sm:h-[62px] flex items-center">
      <div className="animate-ticker-marquee flex items-center whitespace-nowrap">
        {tickerList.map((item, idx) => {
          const hasPrice = typeof item.price === "number" && item.price > 0;
          const formattedPrice = hasPrice
            ? `₹${item.price!.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "—";

          const hasChange = typeof item.changePercent === "number";
          const formattedChange = hasChange
            ? `${item.isPositive ? "+" : ""}${item.changePercent!.toFixed(2)}%`
            : "—";

          return (
            <Link
              key={`${item.symbol}-${idx}`}
              href={`/stocks/${item.symbol.toLowerCase()}`}
              className="inline-flex items-center space-x-3 px-4 sm:px-6 h-[58px] sm:h-[62px] border-r border-[#E2E8F0] dark:border-[#1A1A1A] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
            >
              {/* Compact circular 32px logo presentation */}
              <CompanyLogo
                symbol={item.symbol}
                companyName={item.companyName}
                className="h-8 w-8 rounded-full shrink-0"
                textClassName="text-[10px] font-bold font-mono"
              />

              {/* Human-readable display label (e.g. L&T, SBI, BAJAJ FINANCE) */}
              <span className="font-bold font-mono text-xs sm:text-[13px] text-[#0F172A] dark:text-[#EDEDED] tracking-tight">
                {item.displayName}
              </span>

              {/* Muted tabular price */}
              <span className="font-mono text-xs sm:text-[13px] text-[#64748B] dark:text-[#96969C]">
                {formattedPrice}
              </span>

              {/* Formatted percentage change */}
              <span
                className={`font-mono text-xs sm:text-[13px] font-semibold ${
                  hasChange
                    ? item.isPositive
                      ? "text-[#059669] dark:text-[#10B981]"
                      : "text-[#DC2626] dark:text-[#EF4444]"
                    : "text-[#64748B] dark:text-[#96969C]"
                }`}
              >
                {formattedChange}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default MarketTicker;




