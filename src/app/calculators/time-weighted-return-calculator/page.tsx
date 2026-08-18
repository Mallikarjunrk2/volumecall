"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateTwr } from "@/lib/financial/returns/twr";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Gauge, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface SubPeriodRow {
  name: string;
  startVal: string;
  endValBeforeCf: string;
  cashFlow: string;
}

const pageFaqItems = [
  {
    question: "What is Time-Weighted Return (TWR)?",
    answer:
      "Time-Weighted Return (TWR) is a measure of the compound rate of growth in a portfolio that eliminates the distorting effects on growth rates created by external cash inflows and outflows (deposits and withdrawals).",
  },
  {
    question: "Why do fund managers prefer TWR over Money-Weighted Return (MWR / IRR)?",
    answer:
      "Fund managers have no control over when clients deposit or withdraw money. TWR isolates the pure investment performance of the manager's asset allocation and stock selection decisions.",
  },
  {
    question: "How is Time-Weighted Return calculated across sub-periods?",
    answer:
      "TWR breaks the overall period into sub-periods every time a cash flow occurs. It calculates the rate of return for each sub-period: R_i = (End Value Before Cash Flow - Start Value) / Start Value, and links them geometrically: TWR = (1 + R_1) × (1 + R_2) × ... × (1 + R_n) - 1.",
  },
  {
    question: "What is the difference between TWR and MWR (Money-Weighted Return / XIRR)?",
    answer:
      "TWR measures the manager's skill by giving equal weight to each time period. MWR/XIRR measures the investor's actual rupee return, giving greater weight to periods when more capital was invested.",
  },
  {
    question: "Is TWR required under GIPS (Global Investment Performance Standards)?",
    answer:
      "Yes. The CFA Institute's GIPS standards require investment managers to present portfolio performance using Time-Weighted Return to ensure fair, unbiased reporting.",
  },
  {
    question: "Can TWR be higher than MWR?",
    answer:
      "Yes. If an investor deposits large sums of money right before a market downturn, MWR will be significantly lower than TWR. Conversely, investing heavily right before a bull run makes MWR higher than TWR.",
  },
  {
    question: "When should an individual retail investor use TWR?",
    answer:
      "Use TWR when evaluating mutual fund performance against a benchmark index (like Nifty 50) to see if the fund manager outperformed the market.",
  },
  {
    question: "How often should sub-periods be created in TWR?",
    answer:
      "A new sub-period must be created every time an external deposit or withdrawal occurs, requiring a portfolio valuation immediately before the cash flow takes place.",
  },
  {
    question: "Can TWR be negative?",
    answer:
      "Yes. If the cumulative geometric product of sub-period returns is less than 1.0, the TWR will be negative, indicating a strategy drawdown.",
  },
  {
    question: "Does TWR account for dividends received inside the portfolio?",
    answer:
      "Yes. Internal dividends reinvested inside the fund naturally increase the ending sub-period valuation and are fully captured in the TWR calculation.",
  },
];

export default function TwrCalculatorPage() {
  const [periods, setPeriods] = useState<SubPeriodRow[]>([
    { name: "Period 1 (Pre-Deposit)", startVal: "1,00,000", endValBeforeCf: "1,20,000", cashFlow: "50,000" },
    { name: "Period 2 (Post-Deposit)", startVal: "1,70,000", endValBeforeCf: "1,53,000", cashFlow: "0" },
  ]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw.replace(/[^0-9]/g, ""));
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const handlePeriodChange = (index: number, field: keyof SubPeriodRow, val: string) => {
    const updated = [...periods];
    if (field === "name") {
      updated[index].name = val;
    } else {
      const clean = val.replace(/[^0-9]/g, "");
      updated[index][field] = clean === "" ? "" : formatRawDigits(clean);
    }
    setPeriods(updated);
  };

  const addPeriod = () => {
    const last = periods[periods.length - 1];
    const prevEnd = Number(last.endValBeforeCf.replace(/,/g, "")) || 100000;
    const prevCf = Number(last.cashFlow.replace(/,/g, "")) || 0;
    const newStart = formatIndianNumber(prevEnd + prevCf);
    setPeriods([
      ...periods,
      {
        name: `Period ${periods.length + 1}`,
        startVal: newStart,
        endValBeforeCf: newStart,
        cashFlow: "0",
      },
    ]);
  };

  const removePeriod = (index: number) => {
    if (periods.length <= 1) return;
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const result = useMemo(() => {
    try {
      const subPeriods = periods.map((p, idx) => ({
        startDate: new Date(2024, idx * 3, 1),
        endDate: new Date(2024, (idx + 1) * 3, 1),
        startValue: Number(p.startVal.replace(/,/g, "")) || 1,
        endValueBeforeCashFlow: Number(p.endValBeforeCf.replace(/,/g, "")) || 1,
        cashFlow: Number(p.cashFlow.replace(/,/g, "")) || 0,
      }));
      return calculateTwr(subPeriods);
    } catch {
      return { twr: 0, twrPercentage: 0, subPeriods: [] };
    }
  }, [periods]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Breadcrumb */}
        <div className="text-xs text-[var(--text-secondary)] mb-3 flex items-center space-x-1.5 font-normal">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/calculators" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Calculators</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium">Time-Weighted Return Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Gauge className="h-3.5 w-3.5" />
            <span>Fund Strategy Benchmark Performance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Time-Weighted Return (TWR) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate the true investment strategy performance of a portfolio across sub-periods, neutralizing the timing distortions of cash deposits and withdrawals.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--calc-border)]">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--calc-text-primary)]">Portfolio sub-periods</h3>
                <span className="text-[11px] text-[var(--calc-text-muted)]">Valuations at cash deposit/withdrawal events</span>
              </div>
              <button
                type="button"
                onClick={addPeriod}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--calc-border)] text-[var(--calc-accent)] rounded-lg text-xs font-semibold hover:border-[var(--calc-accent)] transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Sub-Period</span>
              </button>
            </div>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {periods.map((p, idx) => (
                <div key={idx} className="p-3.5 bg-[var(--bg-subtle)] border border-[var(--calc-border)] rounded-lg space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handlePeriodChange(idx, "name", e.target.value)}
                      className="font-bold text-[var(--calc-text-primary)] bg-transparent border-b border-transparent hover:border-[var(--calc-border)] focus:border-[var(--calc-accent)] focus:outline-none text-xs"
                    />
                    {periods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePeriod(idx)}
                        className="text-[var(--calc-text-muted)] hover:text-rose-600 transition-colors cursor-pointer p-1"
                        title="Remove period"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <span className="text-[10px] font-medium text-[var(--calc-text-muted)] block mb-1">Start Value (₹)</span>
                      <input
                        type="text"
                        value={p.startVal}
                        onChange={(e) => handlePeriodChange(idx, "startVal", e.target.value)}
                        className="w-full px-2.5 py-1 border border-[var(--calc-border-input)] bg-[var(--calc-card-bg)] text-right font-bold text-[var(--calc-text-primary)] rounded-md focus:outline-none focus:border-[var(--calc-accent)] tabular-nums"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-[var(--calc-text-muted)] block mb-1">End Value Pre-CF (₹)</span>
                      <input
                        type="text"
                        value={p.endValBeforeCf}
                        onChange={(e) => handlePeriodChange(idx, "endValBeforeCf", e.target.value)}
                        className="w-full px-2.5 py-1 border border-[var(--calc-border-input)] bg-[var(--calc-card-bg)] text-right font-bold text-[var(--calc-text-primary)] rounded-md focus:outline-none focus:border-[var(--calc-accent)] tabular-nums"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-[var(--calc-text-muted)] block mb-1">Net Cash Flow (₹)</span>
                      <input
                        type="text"
                        value={p.cashFlow}
                        onChange={(e) => handlePeriodChange(idx, "cashFlow", e.target.value)}
                        className="w-full px-2.5 py-1 border border-[var(--calc-border-input)] bg-[var(--calc-card-bg)] text-right font-bold text-[var(--calc-text-primary)] rounded-md focus:outline-none focus:border-[var(--calc-accent)] tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Output Summary Card */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Cumulative Time-Weighted Return (TWR)</span>
              <span className={`text-3xl sm:text-4xl font-extrabold tabular-nums block mt-1 ${result.twrPercentage >= 0 ? "text-[var(--calc-accent)]" : "text-rose-600 dark:text-rose-400"}`}>
                {result.twrPercentage >= 0 ? "+" : ""}{result.twrPercentage.toFixed(2)}%
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <span className="font-bold text-[var(--calc-text-primary)] block mb-1">Sub-Period Performance Breakdown</span>
              {result.subPeriods.map((sp, idx) => (
                <div key={idx} className="flex justify-between items-center text-[var(--calc-text-secondary)]">
                  <span className="font-medium">{periods[idx]?.name || `Period ${idx + 1}`}</span>
                  <span className={`font-bold tabular-nums ${sp.subPeriodReturn >= 0 ? "text-[var(--calc-accent)]" : "text-rose-600 dark:text-rose-400"}`}>
                    {sp.subPeriodReturn >= 0 ? "+" : ""}{(sp.subPeriodReturn * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-lg text-xs text-[var(--calc-text-secondary)] leading-relaxed">
              TWR neutralizes the impact of external capital additions/withdrawals to show pure investment skill.
            </div>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is Time-Weighted Return (TWR)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <strong>Time-Weighted Return (TWR)</strong> measures the compound growth rate of an investment portfolio by dividing the total holding period into discrete sub-periods whenever cash is added or withdrawn.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">TWR vs Money-Weighted Return (MWR)</h2>
              <div className="overflow-x-auto">
                <table className="financial-table text-xs w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left">Parameter</th>
                      <th className="px-4 py-3 text-left">Time-Weighted Return (TWR)</th>
                      <th className="px-4 py-3 text-left">Money-Weighted Return (MWR / IRR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">What It Measures</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Manager skill / Strategy efficiency</td>
                      <td className="px-4 py-2.5">Investor rupee return</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Cash Flow Sensitivity</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Neutralized (Unbiased by timing)</td>
                      <td className="px-4 py-2.5">Heavily influenced by deposit timing</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Industry Standard</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">GIPS Standard for Mutual Funds & PMS</td>
                      <td className="px-4 py-2.5">Personal wealth tracking</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* FAQ Accordion Section */}
            <div className="border-t border-[var(--border)] pt-8">
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {pageFaqItems.map((faq, idx) => (
                  <div key={idx} className="border border-[var(--border)] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full px-5 py-3.5 flex items-center justify-between text-left text-sm font-semibold text-neutral-900 dark:text-white bg-white dark:bg-[#0a0a0a] hover:bg-neutral-50 dark:hover:bg-[#121212]/50 transition-colors focus:outline-none"
                      aria-expanded={openFaq === idx}
                    >
                      <span>{faq.question}</span>
                      {openFaq === idx ? <ChevronUp className="h-4 w-4 shrink-0 ml-3" /> : <ChevronDown className="h-4 w-4 shrink-0 ml-3" />}
                    </button>
                    {openFaq === idx && (
                      <div className="px-5 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed bg-neutral-50/50 dark:bg-[#0a0a0a]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Related Calculators Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <RelatedCalculators currentRoute="/calculators/time-weighted-return-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
