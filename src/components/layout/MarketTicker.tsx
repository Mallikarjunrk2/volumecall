"use client";

import Link from "next/link";
import { CompanyLogo } from "@/components/stocks/CompanyLogo";

interface TickerItem {
  symbol: string;
  displayName: string;
  companyName: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const DEFAULT_TICKERS: TickerItem[] = [
  { symbol: "AXISBANK", displayName: "AXIS BANK", companyName: "Axis Bank Ltd", price: "₹1,198.60", change: "+0.85%", isPositive: true },
  { symbol: "MARUTI", displayName: "MARUTI", companyName: "Maruti Suzuki India Ltd", price: "₹12,840.00", change: "+0.29%", isPositive: true },
  { symbol: "RELIANCE", displayName: "RELIANCE", companyName: "Reliance Industries Ltd", price: "₹2,847.60", change: "+1.22%", isPositive: true },
  { symbol: "TCS", displayName: "TCS", companyName: "Tata Consultancy Services Ltd", price: "₹4,102.15", change: "-0.34%", isPositive: false },
  { symbol: "HDFCBANK", displayName: "HDFC BANK", companyName: "HDFC Bank Ltd", price: "₹1,678.90", change: "+0.58%", isPositive: true },
  { symbol: "INFY", displayName: "INFOSYS", companyName: "Infosys Ltd", price: "₹1,849.25", change: "+0.91%", isPositive: true },
  { symbol: "BHARTIARTL", displayName: "BHARTI AIRTEL", companyName: "Bharti Airtel Ltd", price: "₹1,590.40", change: "-0.12%", isPositive: false },
  { symbol: "ICICIBANK", displayName: "ICICI BANK", companyName: "ICICI Bank Ltd", price: "₹1,245.50", change: "+1.05%", isPositive: true },
  { symbol: "SBIN", displayName: "SBI", companyName: "State Bank of India", price: "₹814.20", change: "+0.42%", isPositive: true },
  { symbol: "BAJFINANCE", displayName: "BAJAJ FINANCE", companyName: "Bajaj Finance Ltd", price: "₹6,980.00", change: "-0.65%", isPositive: false },
  { symbol: "LT", displayName: "L&T", companyName: "Larsen & Toubro Ltd", price: "₹3,620.50", change: "+1.15%", isPositive: true },
  { symbol: "ITC", displayName: "ITC", companyName: "ITC Ltd", price: "₹492.30", change: "+0.18%", isPositive: true },
  { symbol: "TATAMOTORS", displayName: "TATA MOTORS", companyName: "Tata Motors Ltd", price: "₹975.80", change: "+1.45%", isPositive: true },
  { symbol: "SUNPHARMA", displayName: "SUN PHARMA", companyName: "Sun Pharmaceutical Industries Ltd", price: "₹1,740.10", change: "-0.22%", isPositive: false },
  { symbol: "KOTAKBANK", displayName: "KOTAK BANK", companyName: "Kotak Mahindra Bank Ltd", price: "₹1,785.40", change: "+0.35%", isPositive: true },
];

export function MarketTicker() {
  // Duplicated list creates a mathematically seamless continuous loop without jump
  const tickerList = [...DEFAULT_TICKERS, ...DEFAULT_TICKERS];

  return (
    <div className="w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#050505] border-t border-b border-[#E2E8F0] dark:border-[#1A1A1A] select-none h-[48px] sm:h-[52px] flex items-center">
      <div className="animate-ticker-marquee flex items-center whitespace-nowrap">
        {tickerList.map((item, idx) => (
          <Link
            key={`${item.symbol}-${idx}`}
            href={`/stocks/${item.symbol.toLowerCase()}`}
            className="inline-flex items-center space-x-3 px-4 sm:px-6 h-[48px] sm:h-[52px] border-r border-[#E2E8F0] dark:border-[#1A1A1A] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
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
              {item.price}
            </span>

            {/* Formatted percentage change */}
            <span
              className={`font-mono text-xs sm:text-[13px] font-semibold ${
                item.isPositive
                  ? "text-[#059669] dark:text-[#10B981]"
                  : "text-[#DC2626] dark:text-[#EF4444]"
              }`}
            >
              {item.change}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MarketTicker;



