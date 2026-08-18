"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateEvEbitdaValuation } from "@/lib/financial/valuation/evEbitda";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { BarChart3, Layers, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const pageFaqItems = [
  {
    question: "What is EV/EBITDA?",
    answer:
      "EV/EBITDA (Enterprise Multiple) compares a company's Enterprise Value (market value of equity plus debt minus cash) to its annual Earnings Before Interest, Taxes, Depreciation, and Amortization (EBITDA).",
  },
  {
    question: "Why is EV/EBITDA preferred over P/E for capital-intensive companies?",
    answer:
      "EV/EBITDA is capital-structure-neutral and unaffected by differing depreciation policies or debt levels, making it the ideal valuation multiple for comparing companies across manufacturing, telecom, power, and infrastructure.",
  },
  {
    question: "How is Enterprise Value (EV) calculated?",
    answer:
      "Enterprise Value = Market Capitalization + Total Debt + Minority Interest + Preferred Stock - Cash & Cash Equivalents.",
  },
  {
    question: "How do you derive Fair Value Per Share from EV/EBITDA?",
    answer:
      "First calculate Enterprise Value = EBITDA × Target Multiple. Then derive Equity Value = Enterprise Value - Net Debt. Finally, Fair Value per share = Equity Value / Shares Outstanding.",
  },
  {
    question: "What is considered a 'good' or fair EV/EBITDA multiple in India?",
    answer:
      "A multiple below 8x–10x is often considered attractive for industrial/commodity companies, while high-margin growth sectors (consumer tech, branded retail, pharma) trade between 15x and 25x EV/EBITDA.",
  },
  {
    question: "How does Net Debt impact Equity Value in an EV/EBITDA valuation?",
    answer:
      "High net debt directly reduces equity value for shareholders. For a net-cash company (cash > debt), net debt is negative, which increases equity value above enterprise value.",
  },
  {
    question: "What is the difference between EBITDA and Operating Cash Flow?",
    answer:
      "EBITDA does not account for changes in working capital (inventories, receivables) or taxes paid, whereas Operating Cash Flow (OCF) reflects actual cash collected.",
  },
  {
    question: "Can EV/EBITDA be negative?",
    answer:
      "If a company suffers operating losses (negative EBITDA), the EV/EBITDA multiple is negative and cannot be meaningfully interpreted.",
  },
  {
    question: "Why is EV/EBITDA commonly used in Mergers & Acquisitions (M&A)?",
    answer:
      "Acquirers must buy out both equity holders and assume debt obligations. EV/EBITDA reveals the total acquisition price required relative to the target's operating cash generation.",
  },
  {
    question: "Can EV/EBITDA be used for banks and financial institutions?",
    answer:
      "No. For banks and NBFCs, interest is their primary operating cost and debt is their raw material inventory, making EBITDA and Enterprise Value inapplicable. Price-to-Book (P/B) is used instead.",
  },
];

export default function EvEbitdaCalculatorPage() {
  const [ebitdaInput, setEbitdaInput] = useState<string>("2,500");
  const [multipleInput, setMultipleInput] = useState<string>("12.0");
  const [netDebtInput, setNetDebtInput] = useState<string>("1,200");
  const [sharesInput, setSharesInput] = useState<string>("10");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const parsedEbitda = useMemo(() => {
    const raw = ebitdaInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [ebitdaInput]);

  const parsedMultiple = useMemo(() => {
    const raw = multipleInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [multipleInput]);

  const parsedNetDebt = useMemo(() => {
    const raw = netDebtInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Number(raw);
  }, [netDebtInput]);

  const parsedShares = useMemo(() => {
    const raw = sharesInput.trim();
    return !raw || isNaN(Number(raw)) ? 1 : Math.max(0.01, Number(raw));
  }, [sharesInput]);

  const result = useMemo(() => {
    try {
      return calculateEvEbitdaValuation(parsedEbitda, parsedMultiple, parsedNetDebt, parsedShares);
    } catch {
      return null;
    }
  }, [parsedEbitda, parsedMultiple, parsedNetDebt, parsedShares]);

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
          <span className="text-[var(--foreground)] font-medium">EV/EBITDA Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>Capital Structure Neutral Multiples</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            EV/EBITDA Valuation Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Determine enterprise and target equity valuation for capital-heavy, leveraged, or cross-border corporations using operating cash flow multiples.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            {/* Input 1: EBITDA */}
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="ev-ebitda-val" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Operating EBITDA (₹ Cr)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Earnings before Interest, Tax, Depreciation & Amortization</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                  <input
                    id="ev-ebitda-val"
                    type="text"
                    inputMode="numeric"
                    value={ebitdaInput}
                    onChange={(e) => setEbitdaInput(e.target.value)}
                    className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs font-medium text-[var(--calc-text-muted)] ml-1">Cr</span>
                </div>
              </div>
            </div>

            {/* Input 2: Target EV/EBITDA Multiple */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="ev-mult" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Target EV/EBITDA multiple
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Historical sector or peer benchmark multiple</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="ev-mult"
                    type="text"
                    inputMode="decimal"
                    value={multipleInput}
                    onChange={(e) => setMultipleInput(e.target.value)}
                    className="w-24 sm:w-32 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">x</span>
                </div>
              </div>
            </div>

            {/* Input 3 & 4: Net Debt & Shares */}
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-[var(--calc-border)] text-xs">
              <div>
                <label htmlFor="ev-debt" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Net debt (₹ Cr)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <span className="text-xs text-[var(--calc-text-muted)] mr-1 select-none">₹</span>
                  <input
                    id="ev-debt"
                    type="text"
                    inputMode="decimal"
                    value={netDebtInput}
                    onChange={(e) => setNetDebtInput(e.target.value)}
                    className="w-full bg-transparent text-right text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ev-shares" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Shares (Cr Shares)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="ev-shares"
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

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Enterprise Value (EV)</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result?.enterpriseValue ?? 0))} Cr</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Less: Net Debt</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result?.netDebt ?? 0))} Cr</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[var(--calc-border)] text-sm">
                <span className="text-[var(--calc-accent)]">Target Equity Value</span>
                <span className="tabular-nums font-bold text-[var(--calc-accent)]">₹{formatIndianNumber(Math.round(result?.equityValue ?? 0))} Cr</span>
              </div>
            </div>

            <Link
              href="/calculators/dcf-calculator"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-lg text-xs font-semibold text-[var(--calc-accent)] hover:border-[var(--calc-accent)] transition-all"
            >
              <span>Want a full intrinsic cash flow model? Run DCF Calculator</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is EV/EBITDA Valuation?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <strong>EV/EBITDA</strong> (Enterprise Value to Earnings Before Interest, Taxes, Depreciation, and Amortization) is a key financial metric used by investment bankers and analysts to compare the value of companies across identical industries, regardless of their capital structure (debt vs equity) or taxation regimes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">EV/EBITDA Valuation Formulas</h2>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div>Enterprise Value = EBITDA × Target Multiple</div>
                <div>Equity Value = Enterprise Value - Net Debt</div>
                <div>Fair Share Price = Equity Value / Diluted Shares Outstanding</div>
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
            <RelatedCalculators currentRoute="/calculators/ev-ebitda-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
