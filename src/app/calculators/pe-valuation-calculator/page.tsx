"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculatePeValuation, calculatePegRatio } from "@/lib/financial/valuation/pe";
import { DollarSign, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const pageFaqItems = [
  {
    question: "What is the Price-to-Earnings (P/E) Ratio?",
    answer:
      "The P/E ratio measures a company's current share price relative to its per-share earnings (EPS). It indicates how many rupees investors are willing to pay for one rupee of company profit.",
  },
  {
    question: "How is Fair Stock Value calculated using the P/E multiple?",
    answer:
      "The formula is: Target Fair Value = Expected Forward EPS × Target Fair P/E Multiple.",
  },
  {
    question: "What is the PEG (Price/Earnings-to-Growth) Ratio?",
    answer:
      "The PEG ratio refines the P/E ratio by factoring in earnings growth: PEG = P/E Ratio / Annual EPS Growth Rate (%). A PEG below 1.0 is traditionally considered undervalued (GARP - Growth at a Reasonable Price).",
  },
  {
    question: "What is the difference between Trailing P/E and Forward P/E?",
    answer:
      "Trailing P/E uses past 12-month historical reported EPS. Forward P/E uses estimated projected EPS for the upcoming fiscal year, reflecting future earning power.",
  },
  {
    question: "Why do different sectors trade at vastly different P/E multiples in India?",
    answer:
      "Sectors with high return on capital (ROCE), high reinvestment runways, and steady earnings (like FMCG and IT) command 40x–60x P/E, while cyclical capital-intensive sectors (like metals and power) trade at 8x–15x P/E.",
  },
  {
    question: "Can P/E valuation be used for loss-making companies?",
    answer:
      "No. When a company has negative net income (EPS < 0), the P/E ratio is undefined or meaningless. Use Price-to-Sales (P/S) or EV/EBITDA instead.",
  },
  {
    question: "How should I choose a 'Fair P/E' for a company?",
    answer:
      "Use the stock's 5-year or 10-year historical median P/E multiple, or compare it against top industry peer averages adjusted for growth differences.",
  },
  {
    question: "What are the pitfalls of relying solely on P/E ratios?",
    answer:
      "P/E ratios can be artificially distorted by one-time exceptional gains, aggressive accounting, cyclical earnings peaks (the 'value trap'), or high debt levels.",
  },
  {
    question: "What is Peter Lynch's Fair Value Formula?",
    answer:
      "Legendary investor Peter Lynch stated that a fairly valued company typically has a P/E multiple equal to its long-term sustainable percentage earnings growth rate (PEG = 1.0).",
  },
  {
    question: "How does interest rate environment affect market P/E multiples?",
    answer:
      "When central banks raise interest rates, fixed income yields rise, causing equity discount rates to rise and stock market P/E multiples to contract (compress).",
  },
];

export default function PeValuationPage() {
  const [epsInput, setEpsInput] = useState<string>("45.0");
  const [targetPeInput, setTargetPeInput] = useState<string>("25.0");
  const [currentPriceInput, setCurrentPriceInput] = useState<string>("950");
  const [growthInput, setGrowthInput] = useState<string>("20.0");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const parsedEps = useMemo(() => {
    const raw = epsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [epsInput]);

  const parsedTargetPe = useMemo(() => {
    const raw = targetPeInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [targetPeInput]);

  const parsedCurrentPrice = useMemo(() => {
    const raw = currentPriceInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [currentPriceInput]);

  const parsedGrowth = useMemo(() => {
    const raw = growthInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Number(raw);
  }, [growthInput]);

  const peResult = useMemo(() => {
    return calculatePeValuation(parsedEps, parsedTargetPe);
  }, [parsedEps, parsedTargetPe]);

  const currentPe = parsedEps > 0 ? parsedCurrentPrice / parsedEps : 0;

  const pegResult = useMemo(() => {
    try {
      return parsedGrowth > 0 ? calculatePegRatio(currentPe, parsedGrowth) : null;
    } catch {
      return null;
    }
  }, [currentPe, parsedGrowth]);

  const upsideDownside = parsedCurrentPrice > 0
    ? ((peResult.fairValue - parsedCurrentPrice) / parsedCurrentPrice) * 100
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="text-xs text-[var(--text-secondary)] mb-4 flex items-center space-x-1.5 font-normal">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/calculators" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Calculators</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium">P/E Valuation Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <DollarSign className="h-4 w-4" />
            <span>Relative Equity Multiples & PEG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            P/E Multiple & PEG Valuation Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate target fair stock prices, implied earnings multiples, and PEG ratios based on forward Earnings Per Share (EPS) and sector P/E benchmarks.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-12">
          {/* Form Controls */}
          <div className="md:col-span-7 h-full bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Expected EPS */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="pe-eps" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Expected Forward Earnings Per Share (EPS)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Projected next 12-month net profit per share</span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                  <input
                    id="pe-eps"
                    type="text"
                    inputMode="decimal"
                    value={epsInput}
                    onChange={(e) => setEpsInput(e.target.value)}
                    className="w-36 sm:w-44 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="1"
                value={Math.min(500, Math.max(0, parsedEps))}
                onChange={(e) => setEpsInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 2: Target P/E Multiple */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="pe-target" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Target Fair P/E Multiple (x)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Historical median P/E or peer group benchmark</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="pe-target"
                    type="text"
                    inputMode="decimal"
                    value={targetPeInput}
                    onChange={(e) => setTargetPeInput(e.target.value)}
                    className="w-36 sm:w-44 pr-8 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                  />
                  <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">x</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="150"
                step="1"
                value={Math.min(150, Math.max(1, parsedTargetPe))}
                onChange={(e) => setTargetPeInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 3 & 4: Current Price & EPS Growth Rate */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
              <div>
                <label htmlFor="pe-curr-price" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block mb-1">
                  Current Market Price (₹) (Optional)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                  <input
                    id="pe-curr-price"
                    type="text"
                    inputMode="decimal"
                    value={currentPriceInput}
                    onChange={(e) => setCurrentPriceInput(e.target.value)}
                    className="w-full pl-6 pr-2 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pe-growth" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block mb-1">
                  EPS Growth Rate (% p.a.) (PEG)
                </label>
                <div className="relative flex items-center">
                  <input
                    id="pe-growth"
                    type="text"
                    inputMode="decimal"
                    value={growthInput}
                    onChange={(e) => setGrowthInput(e.target.value)}
                    className="w-full pr-6 pl-2 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 tabular-nums"
                  />
                  <span className="absolute right-2 text-xs text-[var(--text-secondary)] font-medium">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Output Summary Card */}
          <div className="md:col-span-5 h-full bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Estimated Fair Value Per Share</span>
              <span className="text-3xl sm:text-4xl font-black text-teal-700 dark:text-teal-400 tabular-nums block mt-1">
                ₹{peResult.fairValue.toFixed(2)}
              </span>
              {parsedCurrentPrice > 0 && (
                <span className={`text-xs font-semibold mt-1 block ${upsideDownside >= 0 ? "text-teal-700 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {upsideDownside >= 0 ? "+" : ""}{upsideDownside.toFixed(1)}% {upsideDownside >= 0 ? "Potential Upside" : "Potential Overvaluation"}
                </span>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Current Trailing P/E</span>
                <span className="font-bold tabular-nums">{currentPe.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Target Fair P/E</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">{parsedTargetPe.toFixed(1)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">PEG Ratio (Peter Lynch Metric)</span>
                <span className={`font-bold tabular-nums ${pegResult && pegResult.pegRatio <= 1.0 ? "text-teal-700 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {pegResult ? `${pegResult.pegRatio.toFixed(2)}x` : "N/A"}
                </span>
              </div>
            </div>

            <Link
              href="/calculators/ev-ebitda-calculator"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[var(--border)] rounded-xl text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-neutral-50 transition-colors"
            >
              <span>Evaluate capital-intensive firms with EV/EBITDA</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is P/E Ratio Valuation?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The <strong>Price-to-Earnings (P/E) Multiple</strong> is the most widely used relative valuation metric in global equity markets. It compares a company&apos;s stock price with its per-share net profit, establishing what premium investors are paying for current and future earnings power.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">P/E and PEG Valuation Formulas</h2>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div>Fair Target Price = Forward EPS × Target Fair P/E</div>
                <div>PEG Ratio = Current P/E / EPS Growth Rate (%)</div>
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
            <RelatedCalculators currentRoute="/calculators/pe-valuation-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
