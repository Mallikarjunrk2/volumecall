"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateDcf } from "@/lib/financial/valuation/dcf";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { LineChart, Plus, Trash2, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const pageFaqItems = [
  {
    question: "What is Discounted Cash Flow (DCF) Valuation?",
    answer:
      "Discounted Cash Flow (DCF) is a valuation method that estimates the intrinsic value of an investment or company based on the present value of its expected future Free Cash Flows (FCF).",
  },
  {
    question: "How is Free Cash Flow to Firm (FCFF) calculated?",
    answer:
      "FCFF is calculated as: Operating Cash Flow (or EBIT × (1 - Tax Rate) + Depreciation & Amortization) minus Capital Expenditures (CapEx) minus Changes in Working Capital.",
  },
  {
    question: "What is WACC (Weighted Average Cost of Capital)?",
    answer:
      "WACC represents a company's blended cost of capital across equity and debt, serving as the required discount rate to discount future cash flows back to present value.",
  },
  {
    question: "How is Terminal Value calculated in a DCF model?",
    answer:
      "Terminal Value uses the Gordon Growth Model: Terminal Value = [ Final Year FCF × (1 + g) ] / (WACC - g), where g is the perpetual terminal growth rate (typically 2% to 4% matching long-term GDP).",
  },
  {
    question: "How do you derive Fair Value Per Share from Enterprise Value?",
    answer:
      "Equity Value is derived as: Enterprise Value - Net Debt (Total Debt - Cash & Cash Equivalents). Fair Value per share = Equity Value / Diluted Shares Outstanding.",
  },
  {
    question: "What is Margin of Safety in DCF valuation?",
    answer:
      "Margin of Safety is the discount (e.g. 20% to 30%) an investor demands below the DCF calculated intrinsic value before buying the stock, protecting against estimation errors.",
  },
  {
    question: "Why can Terminal Value make up 60%–80% of total DCF value?",
    answer:
      "Because a company is assumed to operate indefinitely (going concern), the perpetual cash flows beyond the 5–10 year forecast period compound into the majority of present enterprise value.",
  },
  {
    question: "What are the key limitations of DCF valuation?",
    answer:
      "DCF models are highly sensitive to small changes in inputs (such as WACC discount rate and terminal growth rate assumptions), which can dramatically swing the fair value per share.",
  },
  {
    question: "When is DCF valuation not suitable?",
    answer:
      "DCF is unsuitable for early-stage startups with negative cash flows, highly cyclical commodity firms with unpredictable earnings, and financial companies/banks (where cash flows cannot be separated from financing operations).",
  },
  {
    question: "What is the difference between DCF and Reverse DCF?",
    answer:
      "Standard DCF estimates cash flow growth to calculate intrinsic stock price. Reverse DCF takes the current market stock price and solves for the implied growth rate priced in by the market.",
  },
];

export default function DcfCalculatorPage() {
  const [fcfs, setFcfs] = useState<string[]>([
    "1000",
    "1150",
    "1320",
    "1500",
    "1700",
  ]);
  const [waccInput, setWaccInput] = useState<string>("11.0");
  const [termGrowthInput, setTermGrowthInput] = useState<string>("3.5");
  const [netDebtInput, setNetDebtInput] = useState<string>("500");
  const [sharesInput, setSharesInput] = useState<string>("10");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFcfChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    const updated = [...fcfs];
    updated[index] = clean;
    setFcfs(updated);
  };

  const addYear = () => {
    const lastVal = Number(fcfs[fcfs.length - 1]) || 1000;
    setFcfs([...fcfs, String(Math.round(lastVal * 1.12))]);
  };

  const removeYear = (index: number) => {
    if (fcfs.length <= 1) return;
    setFcfs(fcfs.filter((_, i) => i !== index));
  };

  const parsedFcfs = useMemo(() => {
    return fcfs.map((f) => {
      const num = Number(f);
      return isNaN(num) ? 0 : num;
    });
  }, [fcfs]);

  const parsedWacc = useMemo(() => {
    const raw = waccInput.trim();
    return !raw || isNaN(Number(raw)) ? 10 : Number(raw);
  }, [waccInput]);

  const parsedTermGrowth = useMemo(() => {
    const raw = termGrowthInput.trim();
    return !raw || isNaN(Number(raw)) ? 3 : Number(raw);
  }, [termGrowthInput]);

  const parsedNetDebt = useMemo(() => {
    const raw = netDebtInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Number(raw);
  }, [netDebtInput]);

  const parsedShares = useMemo(() => {
    const raw = sharesInput.trim();
    return !raw || isNaN(Number(raw)) ? 1 : Math.max(0.01, Number(raw));
  }, [sharesInput]);

  const result = useMemo(() => {
    try {
      return calculateDcf(
        parsedFcfs,
        parsedWacc / 100,
        parsedTermGrowth / 100,
        parsedNetDebt,
        parsedShares
      );
    } catch {
      return null;
    }
  }, [parsedFcfs, parsedWacc, parsedTermGrowth, parsedNetDebt, parsedShares]);

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
          <span className="text-[var(--foreground)] font-medium">DCF Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <LineChart className="h-3.5 w-3.5" />
            <span>Intrinsic Stock Valuation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Discounted Cash Flow (DCF) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate the fundamental Enterprise Value, Equity Value, and intrinsic Fair Value Per Share using multi-year Free Cash Flow (FCF) projections and terminal value.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--calc-border)]">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--calc-text-primary)]">Projected Free Cash Flows (FCF)</h3>
                <span className="text-[11px] text-[var(--calc-text-muted)]">Figures in ₹ Crores (or normalized units)</span>
              </div>
              <button
                type="button"
                onClick={addYear}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--calc-border)] text-[var(--calc-accent)] rounded-lg text-xs font-semibold hover:border-[var(--calc-accent)] transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Year</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {fcfs.map((f, idx) => (
                <div key={idx} className="flex items-center justify-between space-x-3 text-xs">
                  <span className="font-semibold text-[var(--calc-text-primary)] w-24 shrink-0">
                    Year {idx + 1} FCF
                  </span>
                  <div className="relative flex-grow flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-xs text-[var(--calc-text-muted)] font-medium mr-1 select-none">₹</span>
                    <input
                      type="text"
                      value={f}
                      onChange={(e) => handleFcfChange(idx, e.target.value)}
                      className="w-full bg-transparent text-right text-xs sm:text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                  {fcfs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeYear(idx)}
                      className="p-1.5 text-[var(--calc-text-muted)] hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                      title="Remove year"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Rates & Parameters */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--calc-border)] text-xs">
              <div>
                <label htmlFor="dcf-wacc" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Discount rate (WACC %)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="dcf-wacc"
                    type="text"
                    inputMode="decimal"
                    value={waccInput}
                    onChange={(e) => setWaccInput(e.target.value)}
                    className="w-full bg-transparent text-right text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs text-[var(--calc-text-muted)] ml-1">%</span>
                </div>
              </div>

              <div>
                <label htmlFor="dcf-g" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Terminal growth rate (%)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="dcf-g"
                    type="text"
                    inputMode="decimal"
                    value={termGrowthInput}
                    onChange={(e) => setTermGrowthInput(e.target.value)}
                    className="w-full bg-transparent text-right text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs text-[var(--calc-text-muted)] ml-1">%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label htmlFor="dcf-debt" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Net debt (₹ Cr)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <span className="text-xs text-[var(--calc-text-muted)] mr-1 select-none">₹</span>
                  <input
                    id="dcf-debt"
                    type="text"
                    inputMode="decimal"
                    value={netDebtInput}
                    onChange={(e) => setNetDebtInput(e.target.value)}
                    className="w-full bg-transparent text-right text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dcf-shares" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Shares (Cr Shares)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="dcf-shares"
                    type="text"
                    inputMode="decimal"
                    value={sharesInput}
                    onChange={(e) => setSharesInput(e.target.value)}
                    className="w-full bg-transparent text-right text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs text-[var(--calc-text-muted)] ml-1">Cr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Output Summary Card */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Estimated Fair Value Per Share</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-accent)] tabular-nums block mt-1">
                ₹{result?.fairValuePerShare !== undefined ? result.fairValuePerShare.toFixed(2) : "N/A"}
              </span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Enterprise Value (EV)</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result?.enterpriseValue ?? 0))} Cr</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Equity Value</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">₹{formatIndianNumber(Math.round(result?.equityValue ?? 0))} Cr</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">PV of Explicit Forecast FCFs</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result?.pvForecastFcf ?? 0))} Cr</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">PV of Terminal Value</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result?.pvTerminalValue ?? 0))} Cr</span>
              </div>
            </div>

            <Link
              href="/calculators/reverse-dcf-calculator"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-lg text-xs font-semibold text-[var(--calc-accent)] hover:border-[var(--calc-accent)] transition-all"
            >
              <span>Know the current market price? Run Reverse DCF</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is Discounted Cash Flow (DCF) Valuation?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A <strong>Discounted Cash Flow (DCF)</strong> valuation is an absolute valuation methodology that determines the fundamental intrinsic value of an entire business based on its ability to generate cash flow in the future. Future projected Free Cash Flows (FCF) are discounted back to today using the company&apos;s Weighted Average Cost of Capital (WACC).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">DCF Formulas & Mathematical Structure</h2>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div>Enterprise Value = ∑ [ FCF<sub>t</sub> / (1 + WACC)<sup>t</sup> ] + PV(Terminal Value)</div>
                <div>Terminal Value = [ FCF<sub>n</sub> × (1 + g) ] / ( WACC - g )</div>
                <div>Equity Value = Enterprise Value - Net Debt</div>
                <div>Fair Value Per Share = Equity Value / Shares Outstanding</div>
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
            <RelatedCalculators currentRoute="/calculators/dcf-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
