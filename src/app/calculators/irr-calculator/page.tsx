"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateIrr, calculateNpv } from "@/lib/financial/returns/irr";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Activity, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const pageFaqItems = [
  {
    question: "What is Internal Rate of Return (IRR)?",
    answer:
      "Internal Rate of Return (IRR) is the annual discount rate at which the Net Present Value (NPV) of all future cash flows (both positive and negative) from an investment or project equals zero.",
  },
  {
    question: "How is IRR calculated?",
    answer:
      "IRR is solved numerically through iteration from the equation: NPV = ∑ [ CF_t / (1 + IRR)^t ] = 0, where CF_t is the net cash flow at period t.",
  },
  {
    question: "What is the difference between IRR and XIRR?",
    answer:
      "IRR assumes cash flows occur at equal, regular periodic intervals (e.g. exactly once a year or once a month). XIRR allows exact specific calendar dates for irregular cash flows.",
  },
  {
    question: "How is IRR used in capital budgeting and business decisions?",
    answer:
      "If a project's IRR exceeds the company's cost of capital (or hurdle rate / WACC), the project is considered economically profitable and acceptable.",
  },
  {
    question: "Can an investment have multiple IRRs?",
    answer:
      "Yes. If cash flows switch signs more than once (e.g., negative, positive, negative), the polynomial equation can produce multiple mathematical roots (multiple IRRs).",
  },
  {
    question: "What is the reinvestment rate assumption in IRR?",
    answer:
      "Standard IRR inherently assumes that all intermediate cash inflows are reinvested at the same rate as the IRR, which may be unrealistic for exceptionally high IRRs.",
  },
  {
    question: "What is the difference between IRR and ROI?",
    answer:
      "ROI (Return on Investment) only calculates total percentage gain without accounting for time or the timing of cash flows, whereas IRR discounts all cash flows over their exact time periods.",
  },
  {
    question: "Can IRR be negative?",
    answer:
      "Yes. If total cash inflows over the project life are less than the initial investment outlay, the resulting IRR will be negative.",
  },
  {
    question: "How does Net Present Value (NPV) relate to IRR?",
    answer:
      "When the discount rate equals the IRR, the project's NPV is exactly zero. When the discount rate is below IRR, NPV is positive.",
  },
  {
    question: "Which investments are best analyzed using IRR?",
    answer:
      "Private equity investments, real estate rental development, infrastructure projects, corporate capital expenditure, and regular-interval insurance endowment plans.",
  },
];

export default function IrrCalculatorPage() {
  const [cashFlows, setCashFlows] = useState<string[]>([
    "-10,00,000",
    "2,50,000",
    "3,50,000",
    "4,00,000",
    "4,50,000",
  ]);
  const [discountRateInput, setDiscountRateInput] = useState<string>("10");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const isNeg = raw.startsWith("-");
    const digits = raw.replace(/[^0-9]/g, "");
    const num = Number(digits);
    if (isNaN(num)) return raw;
    return (isNeg ? "-" : "") + formatIndianNumber(num);
  };

  const handleFlowChange = (index: number, val: string) => {
    let clean = val.replace(/[^0-9-]/g, "");
    if (clean.indexOf("-") > 0) clean = "-" + clean.replace(/-/g, "");
    const updated = [...cashFlows];
    updated[index] = clean;
    setCashFlows(updated);
  };

  const addFlow = () => {
    setCashFlows([...cashFlows, "2,00,000"]);
  };

  const removeFlow = (index: number) => {
    if (cashFlows.length <= 2) return;
    setCashFlows(cashFlows.filter((_, i) => i !== index));
  };

  const parsedFlows = useMemo(() => {
    return cashFlows.map((cf) => {
      const clean = cf.replace(/,/g, "").trim();
      return !clean || isNaN(Number(clean)) ? 0 : Number(clean);
    });
  }, [cashFlows]);

  const parsedDiscountRate = useMemo(() => {
    const raw = discountRateInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Number(raw);
  }, [discountRateInput]);

  const irrResult = useMemo(() => {
    return calculateIrr(parsedFlows);
  }, [parsedFlows]);

  const irrVal = irrResult.irr !== null ? irrResult.irr * 100 : null;

  const npvAtDiscount = useMemo(() => {
    return calculateNpv(parsedDiscountRate / 100, parsedFlows);
  }, [parsedDiscountRate, parsedFlows]);

  const totalInflows = parsedFlows.filter((cf) => cf > 0).reduce((acc, c) => acc + c, 0);
  const totalOutflows = Math.abs(parsedFlows.filter((cf) => cf < 0).reduce((acc, c) => acc + c, 0));
  const netCashProfit = totalInflows - totalOutflows;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Breadcrumbs */}
        <div className="text-xs text-[var(--text-secondary)] mb-3 flex items-center space-x-1.5 font-normal">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/calculators" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Calculators</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium">IRR Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>Capital Budgeting & Project Return</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Internal Rate of Return (IRR) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate the Internal Rate of Return (IRR) and Net Present Value (NPV) for multi-year capital investments, real estate projects, and irregular cash flow streams.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--calc-border)]">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--calc-text-primary)]">Cash flow streams</h3>
                <span className="text-[11px] text-[var(--calc-text-muted)]">Year 0 is initial outlay (negative)</span>
              </div>
              <button
                type="button"
                onClick={addFlow}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--calc-border)] text-[var(--calc-accent)] rounded-lg text-xs font-semibold hover:border-[var(--calc-accent)] transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Year</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {cashFlows.map((cf, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <span className="w-16 text-xs font-bold text-[var(--calc-text-secondary)] shrink-0">
                    {idx === 0 ? "Year 0" : `Year ${idx}`}
                  </span>
                  <div className="relative flex-grow flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-xs text-[var(--calc-text-muted)] font-medium mr-1 select-none">₹</span>
                    <input
                      type="text"
                      value={cf}
                      onChange={(e) => handleFlowChange(idx, e.target.value)}
                      placeholder="-10,00,000"
                      className="w-full bg-transparent text-right text-xs sm:text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                  {cashFlows.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeFlow(idx)}
                      className="p-1.5 text-[var(--calc-text-muted)] hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--calc-border)] flex justify-between items-center">
              <label htmlFor="irr-hurdle" className="text-[15px] font-semibold text-[var(--calc-text-primary)]">
                Discount rate / hurdle rate (% p.a.)
              </label>
              <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                <input
                  id="irr-hurdle"
                  type="text"
                  inputMode="decimal"
                  value={discountRateInput}
                  onChange={(e) => setDiscountRateInput(e.target.value)}
                  className="w-20 bg-transparent text-right text-base font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                />
                <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">%</span>
              </div>
            </div>
          </div>

          {/* Primary Output Summary Card */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Internal Rate of Return (IRR)</span>
              <span className={`text-3xl sm:text-4xl font-extrabold tabular-nums block mt-1 ${
                irrVal !== null && irrVal >= parsedDiscountRate ? "text-[var(--calc-accent)]" : "text-amber-600 dark:text-amber-400"
              }`}>
                {irrVal !== null ? `${irrVal.toFixed(2)}%` : "N/A"}
              </span>
              <span className="text-xs font-semibold text-[var(--calc-text-secondary)] mt-1.5 block">
                {irrVal !== null && irrVal >= parsedDiscountRate ? "Exceeds Hurdle Rate (Feasible Project)" : "Below Hurdle Rate"}
              </span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Net Present Value (NPV @ {parsedDiscountRate}%)</span>
                <span className={`font-bold tabular-nums ${npvAtDiscount >= 0 ? "text-[var(--calc-accent)]" : "text-rose-600 dark:text-rose-400"}`}>
                  ₹{formatIndianNumber(Math.round(npvAtDiscount))}
                </span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Inflows</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">₹{formatIndianNumber(Math.round(totalInflows))}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Outlay (Investment)</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(totalOutflows))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--calc-border)] text-[var(--calc-text-secondary)] font-bold">
                <span>Net Cash Profit</span>
                <span className="tabular-nums text-[var(--calc-text-primary)]">₹{formatIndianNumber(Math.round(netCashProfit))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is Internal Rate of Return (IRR)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The <strong>Internal Rate of Return (IRR)</strong> is a core financial metric used in corporate finance and investment analysis to evaluate the profitability of capital investments or projects. It is the exact discount rate at which the Net Present Value (NPV) of all cash inflows equals the initial investment outlay.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is IRR Calculated?</h2>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">NPV = ∑<sub>t=0</sub><sup>N</sup> [ CF<sub>t</sub> / (1 + IRR)<sup>t</sup> ] = 0</div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>CF<sub>t</sub></strong> = Net cash flow at period t (negative for outlays, positive for inflows)</div>
                  <div><strong>IRR</strong> = Internal Rate of Return solving the equation</div>
                  <div><strong>N</strong> = Total number of time periods</div>
                </div>
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
            <RelatedCalculators currentRoute="/calculators/irr-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
