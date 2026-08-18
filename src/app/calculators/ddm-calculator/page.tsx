"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateDdmValuation } from "@/lib/financial/valuation/ddm";
import { Coins, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const pageFaqItems = [
  {
    question: "What is the Dividend Discount Model (DDM)?",
    answer:
      "The Dividend Discount Model (DDM) is a fundamental valuation method that estimates the fair value of a company's stock by calculating the present value of all its future expected dividend payments.",
  },
  {
    question: "How is the Gordon Growth Model calculated?",
    answer:
      "The Gordon Growth Model formula is: Fair Value = D_1 / (Ke - g), where D_1 is the expected next year dividend [D_0 × (1 + g)], Ke is the Cost of Equity (required rate of return), and g is the constant perpetual dividend growth rate.",
  },
  {
    question: "Why must Cost of Equity (Ke) be greater than Dividend Growth Rate (g)?",
    answer:
      "If growth rate (g) exceeds the cost of equity (Ke), the denominator becomes zero or negative, resulting in a mathematically impossible infinite valuation. In reality, no firm can outgrow the broad economy forever.",
  },
  {
    question: "Which companies are best valued using the Dividend Discount Model?",
    answer:
      "Mature, cash-generative blue-chip companies with established track records of consistent dividend payouts (e.g. PSU utilities, FMCG majors, ITC, REITs, and steady banking leaders).",
  },
  {
    question: "Can DDM be used for companies that do not pay dividends?",
    answer:
      "No. For growth companies or technology firms that reinvest 100% of profits instead of paying dividends, use Discounted Cash Flow (DCF) or P/E Multiple valuation instead.",
  },
  {
    question: "What is the difference between Dividend Yield and Dividend Growth?",
    answer:
      "Dividend yield is the immediate cash return (Annual Dividend / Current Price). Dividend growth is the rate at which the annual rupee dividend payout expands year over year.",
  },
  {
    question: "How is Cost of Equity (Ke) estimated?",
    answer:
      "Ke is typically calculated using the Capital Asset Pricing Model (CAPM): Ke = Risk-Free Rate + Beta × (Equity Risk Premium). In India, Ke for large caps typically ranges between 10% and 13%.",
  },
  {
    question: "How are dividend taxes handled in India?",
    answer:
      "Dividends are added to the investor's total income and taxed at their applicable income tax slab rates, with 10% TDS deducted at source by companies on annual dividend payouts exceeding ₹5,000.",
  },
  {
    question: "What are the limitations of the Gordon Growth Model?",
    answer:
      "The model assumes that dividend growth remains constant in perpetuity, which can be unrealistic over changing economic cycles and competitive disruptions.",
  },
  {
    question: "What is a multi-stage Dividend Discount Model?",
    answer:
      "A multi-stage DDM allows for a high-growth phase (e.g. 15% dividend growth for 5 years) followed by a transition to a stable perpetual growth rate (e.g. 5%), providing greater accuracy for expanding companies.",
  },
];

export default function DdmCalculatorPage() {
  const [d0Input, setD0Input] = useState<string>("15.0");
  const [growthInput, setGrowthInput] = useState<string>("6.0");
  const [keInput, setKeInput] = useState<string>("11.0");
  const [currentPriceInput, setCurrentPriceInput] = useState<string>("280");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const parsedD0 = useMemo(() => {
    const raw = d0Input.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [d0Input]);

  const parsedGrowth = useMemo(() => {
    const raw = growthInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Number(raw);
  }, [growthInput]);

  const parsedKe = useMemo(() => {
    const raw = keInput.trim();
    return !raw || isNaN(Number(raw)) ? 10 : Number(raw);
  }, [keInput]);

  const parsedCurrentPrice = useMemo(() => {
    const raw = currentPriceInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [currentPriceInput]);

  const result = useMemo(() => {
    try {
      return calculateDdmValuation(parsedD0, parsedGrowth / 100, parsedKe / 100);
    } catch {
      return null;
    }
  }, [parsedD0, parsedGrowth, parsedKe]);

  const currentYield = parsedCurrentPrice > 0 ? (parsedD0 / parsedCurrentPrice) * 100 : 0;
  const upsideDownside = parsedCurrentPrice > 0 && result
    ? ((result.fairValue - parsedCurrentPrice) / parsedCurrentPrice) * 100
    : 0;

  const getSliderTrackStyle = (percent: number) => ({
    background: `linear-gradient(to right, var(--calc-accent) 0%, var(--calc-accent) ${percent}%, var(--calc-track-bg) ${percent}%, var(--calc-track-bg) 100%)`,
  });

  const d0Percent = Math.min(100, Math.max(0, (Math.min(200, Math.max(0, parsedD0)) / 200) * 100));
  const growthPercent = Math.min(100, Math.max(0, (Math.min(20, Math.max(0, parsedGrowth)) / 20) * 100));

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
          <span className="text-[var(--foreground)] font-medium">DDM Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Coins className="h-3.5 w-3.5" />
            <span>Gordon Growth Valuation Model</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Dividend Discount Model (DDM) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Estimate intrinsic fair value for dividend-paying companies using perpetual dividend growth forecasts and cost of equity.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            {/* Input 1: Current Annual Dividend (D0) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="ddm-d0" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Current annual dividend per share (D₀)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Total dividend paid per share over last 12 months</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                  <input
                    id="ddm-d0"
                    type="text"
                    inputMode="decimal"
                    value={d0Input}
                    onChange={(e) => setD0Input(e.target.value)}
                    className="w-28 sm:w-36 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="0.5"
                value={Math.min(200, Math.max(0, parsedD0))}
                onChange={(e) => setD0Input(e.target.value)}
                style={getSliderTrackStyle(d0Percent)}
                className="financial-slider w-full"
                aria-label="Current Annual Dividend Per Share"
              />
            </div>

            {/* Input 2: Dividend Growth Rate */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="ddm-g" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Perpetual dividend growth rate (g % p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Expected long-term annual dividend growth</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="ddm-g"
                    type="text"
                    inputMode="decimal"
                    value={growthInput}
                    onChange={(e) => setGrowthInput(e.target.value)}
                    className="w-24 sm:w-32 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.25"
                value={Math.min(20, Math.max(0, parsedGrowth))}
                onChange={(e) => setGrowthInput(e.target.value)}
                style={getSliderTrackStyle(growthPercent)}
                className="financial-slider w-full"
                aria-label="Perpetual Dividend Growth Rate"
              />
            </div>

            {/* Input 3 & 4: Cost of Equity & Current Price */}
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-[var(--calc-border)] text-xs">
              <div>
                <label htmlFor="ddm-ke" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Cost of equity / required return (Kₑ %)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="ddm-ke"
                    type="text"
                    inputMode="decimal"
                    value={keInput}
                    onChange={(e) => setKeInput(e.target.value)}
                    className="w-full bg-transparent text-right text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs text-[var(--calc-text-muted)] ml-1">%</span>
                </div>
              </div>

              <div>
                <label htmlFor="ddm-curr-price" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Current price (₹) (Optional)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <span className="text-xs text-[var(--calc-text-muted)] mr-1 select-none">₹</span>
                  <input
                    id="ddm-curr-price"
                    type="text"
                    inputMode="decimal"
                    value={currentPriceInput}
                    onChange={(e) => setCurrentPriceInput(e.target.value)}
                    className="w-full bg-transparent text-right text-sm font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Output Summary Card */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Estimated Fair Intrinsic Value</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-accent)] tabular-nums block mt-1">
                ₹{result ? result.fairValue.toFixed(2) : "N/A (Ke must be > g)"}
              </span>
              {result && parsedCurrentPrice > 0 && (
                <span className={`text-xs font-semibold mt-1.5 block ${upsideDownside >= 0 ? "text-[var(--calc-accent)]" : "text-rose-600 dark:text-rose-400"}`}>
                  {upsideDownside >= 0 ? "+" : ""}{upsideDownside.toFixed(1)}% {upsideDownside >= 0 ? "Potential Upside" : "Potential Overvaluation"}
                </span>
              )}
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Expected Next Year Dividend (D₁)</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{result ? result.d1.toFixed(2) : "0.00"}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Current Trailing Dividend Yield</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">{currentYield.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Equity Risk Spread (Ke - g)</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">{((parsedKe - parsedGrowth)).toFixed(2)}%</span>
              </div>
            </div>

            <Link
              href="/calculators/dcf-calculator"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-lg text-xs font-semibold text-[var(--calc-accent)] hover:border-[var(--calc-accent)] transition-all"
            >
              <span>For non-dividend growth stocks, use DCF Model</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is the Dividend Discount Model (DDM)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The <strong>Dividend Discount Model (DDM)</strong>, specifically the Gordon Growth Model, evaluates the intrinsic worth of a stock based on the premise that an equity share is worth the sum of all future dividend payouts discounted back to their present value.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Gordon Growth Model Formula</h2>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div>Fair Value = D<sub>1</sub> / ( K<sub>e</sub> - g )</div>
                <div>D<sub>1</sub> = D<sub>0</sub> × ( 1 + g )</div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>D₀</strong> = Current annual dividend per share</div>
                  <div><strong>D₁</strong> = Expected dividend next year</div>
                  <div><strong>K<sub>e</sub></strong> = Cost of Equity (required rate of return)</div>
                  <div><strong>g</strong> = Perpetual dividend growth rate</div>
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
            <RelatedCalculators currentRoute="/calculators/ddm-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
