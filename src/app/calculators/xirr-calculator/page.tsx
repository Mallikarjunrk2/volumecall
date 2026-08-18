"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateXirr } from "@/lib/financial/returns/xirr";
import { CashFlow } from "@/lib/financial/types";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Activity, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface FlowRow {
  date: string;
  amount: string;
}

const pageFaqItems = [
  {
    question: "What is XIRR (Extended Internal Rate of Return)?",
    answer:
      "XIRR (Extended Internal Rate of Return) is an annualized return metric that calculates the exact internal rate of return for a series of cash flows occurring at irregular calendar dates.",
  },
  {
    question: "Why is XIRR used for mutual fund SIP returns instead of CAGR?",
    answer:
      "CAGR can only measure return on a single lump sum. Because an SIP involves multiple purchases on different calendar dates over months or years, XIRR is required to account for the unique holding period of each installment.",
  },
  {
    question: "How is XIRR calculated?",
    answer:
      "XIRR is solved numerically using Brent's algorithm from the equation: ∑ [ CF_i / (1 + XIRR)^((date_i - date_0) / 365) ] = 0, where CF_i are cash inflows and outflows.",
  },
  {
    question: "What is the difference between IRR and XIRR?",
    answer:
      "IRR assumes all cash flows happen at fixed, equal intervals (e.g. exactly every 365 days). XIRR uses exact calendar dates, making it accurate for real-world investments with weekends, holidays, and irregular deposits.",
  },
  {
    question: "Can XIRR be calculated for stock trading portfolios?",
    answer:
      "Yes. Whenever you buy stocks on different dates and redeem partial or total holdings later, XIRR gives the true annualized performance of your invested capital.",
  },
  {
    question: "What does a negative XIRR mean?",
    answer:
      "A negative XIRR indicates that your current portfolio valuation is lower than the net capital invested, representing an annualized loss across your cash flow history.",
  },
  {
    question: "How should current portfolio value be entered in an XIRR calculation?",
    answer:
      "The current market value of your portfolio should be entered as a positive (+) cash flow on today's date, representing the hypothetical redemption value.",
  },
  {
    question: "Why does XIRR look unusually high for investments held under 1 year?",
    answer:
      "XIRR annualizes all returns to a 365-day basis. If an investment gains 10% in 15 days, annualizing that short burst produces an artificially extreme XIRR. For holding periods under 1 year, absolute return is more meaningful.",
  },
  {
    question: "Does XIRR account for mutual fund dividends or STCG/LTCG taxes?",
    answer:
      "XIRR calculates returns based on the actual cash flows entered. If you receive dividends, include them as positive cash inflows on their payout dates. Taxes are not deducted unless net post-tax cash flows are entered.",
  },
  {
    question: "Is XIRR the standard performance metric shown by Indian mutual fund apps?",
    answer:
      "Yes. Major Indian mutual fund platforms, registrar portals (CAMS, KFintech), and fund houses universally display XIRR as the official annualized return on SIP portfolios.",
  },
];

export default function XirrCalculatorPage() {
  const [rows, setRows] = useState<FlowRow[]>([
    { date: "2023-01-01", amount: "-50,000" },
    { date: "2023-04-01", amount: "-50,000" },
    { date: "2023-07-01", amount: "-50,000" },
    { date: "2023-10-01", amount: "-50,000" },
    { date: "2024-01-01", amount: "2,35,000" },
  ]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleRowChange = (index: number, field: "date" | "amount", val: string) => {
    const updated = [...rows];
    if (field === "amount") {
      let clean = val.replace(/[^0-9-]/g, "");
      if (clean.indexOf("-") > 0) clean = "-" + clean.replace(/-/g, "");
      updated[index].amount = clean;
    } else {
      updated[index].date = val;
    }
    setRows(updated);
  };

  const addRow = () => {
    const today = new Date().toISOString().split("T")[0];
    setRows([...rows, { date: today, amount: "50,000" }]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 2) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const parsedCashFlows: CashFlow[] = useMemo(() => {
    return rows
      .map((r) => {
        const cleanAmt = r.amount.replace(/,/g, "").trim();
        const amt = !cleanAmt || isNaN(Number(cleanAmt)) ? 0 : Number(cleanAmt);
        const dt = new Date(r.date);
        return {
          date: isNaN(dt.getTime()) ? new Date() : dt,
          amount: amt,
        };
      })
      .filter((cf) => cf.amount !== 0);
  }, [rows]);

  const result = useMemo(() => {
    try {
      return calculateXirr(parsedCashFlows);
    } catch {
      return { success: false, xirr: null, iterations: 0, error: "Calculation failed" };
    }
  }, [parsedCashFlows]);

  const totalInvested = Math.abs(parsedCashFlows.filter((c) => c.amount < 0).reduce((acc, c) => acc + c.amount, 0));
  const finalValue = parsedCashFlows.filter((c) => c.amount > 0).reduce((acc, c) => acc + c.amount, 0);
  const netGain = finalValue - totalInvested;

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
          <span className="text-[var(--foreground)] font-medium">XIRR Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Activity className="h-3.5 w-3.5" size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>SIP & Irregular Cash Flow Return</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Extended Internal Rate of Return (XIRR) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate the exact annualized XIRR for mutual fund SIPs, staggered stock purchases, and multiple cash flow transactions on specific calendar dates.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Left Column: Cash Flow Table */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--calc-border)]">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--calc-text-primary)]">Transaction dates & amounts</h3>
                <span className="text-[11px] text-[var(--calc-text-muted)]">Negative (-) for investments/buys, Positive (+) for current value/sales</span>
              </div>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--calc-border)] text-[var(--calc-accent)] rounded-lg text-xs font-semibold hover:border-[var(--calc-accent)] transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Date</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {rows.map((r, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs">
                  <input
                    type="date"
                    value={r.date}
                    onChange={(e) => handleRowChange(idx, "date", e.target.value)}
                    className="w-36 px-2.5 py-1.5 border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] text-xs font-semibold text-[var(--calc-text-primary)] rounded-lg focus:outline-none focus:border-[var(--calc-accent)] shrink-0"
                  />
                  <div className="relative flex-grow flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-xs text-[var(--calc-text-muted)] font-medium mr-1 select-none">₹</span>
                    <input
                      type="text"
                      value={r.amount}
                      onChange={(e) => handleRowChange(idx, "amount", e.target.value)}
                      placeholder="-50,000"
                      className="w-full bg-transparent text-right text-xs sm:text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                  {rows.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-1.5 text-[var(--calc-text-muted)] hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Primary Output Summary Card */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Extended Internal Rate of Return (XIRR)</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-accent)] tabular-nums block mt-1">
                {result.success && result.xirr !== null
                  ? `${(result.xirr * 100).toFixed(2)}% p.a.`
                  : "N/A (Check Inputs)"}
              </span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Capital Invested</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(totalInvested))}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Current Portfolio / Exit Value</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(finalValue))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--calc-border)] text-[var(--calc-text-secondary)]">
                <span className="font-medium">Net Profit Earned</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">₹{formatIndianNumber(Math.round(netGain))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is XIRR (Extended Internal Rate of Return)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <strong>XIRR (Extended Internal Rate of Return)</strong> is the industry standard for measuring the annualized return on investments involving multiple transactions occurring at irregular calendar dates.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                Unlike a fixed lump-sum investment (which uses CAGR), a Mutual Fund SIP or stock portfolio involves multiple installments spread across different months. Since each deposit is invested for a different duration, XIRR calculates the single unified discount rate that equates all cash flows to zero.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">XIRR vs CAGR vs IRR</h2>
              <div className="overflow-x-auto">
                <table className="financial-table text-xs w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left">Metric</th>
                      <th className="px-4 py-3 text-left">Transaction Timing</th>
                      <th className="px-4 py-3 text-left">Best Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">XIRR</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Exact irregular calendar dates</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Mutual Fund SIPs, multiple stock buys & sales</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">CAGR</td>
                      <td className="px-4 py-2.5">Single start & single end date</td>
                      <td className="px-4 py-2.5">One-time lump sum investments</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">IRR</td>
                      <td className="px-4 py-2.5">Fixed periodic intervals (annual/monthly)</td>
                      <td className="px-4 py-2.5">Capital budgeting, corporate projects</td>
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
            <RelatedCalculators currentRoute="/calculators/xirr-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
