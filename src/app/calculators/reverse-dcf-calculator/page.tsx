"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateReverseDcf } from "@/lib/financial/valuation/reverseDcf";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { SearchCheck, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const pageFaqItems = [
  {
    question: "What is a Reverse DCF (Discounted Cash Flow)?",
    answer:
      "A Reverse DCF is a valuation technique pioneered by legendary investor Michael Mauboussin. Instead of forecasting future cash flows to calculate fair value, it starts with the current stock price and solves for the market's implied future growth rate.",
  },
  {
    question: "Why is Reverse DCF often superior to traditional DCF?",
    answer:
      "Traditional DCF requires predicting the exact future (which is impossible). Reverse DCF turns the question on its head: 'What growth is the market already expecting from this company, and is that expectation realistic?'",
  },
  {
    question: "How does the Reverse DCF solver work?",
    answer:
      "The solver uses numerical root-finding algorithms (Secant and Bisection) to find the exact annual FCF growth rate `g` that equates the DCF equity value to the company's current market cap.",
  },
  {
    question: "What does it mean if the implied growth rate is very high (e.g. 35% p.a.)?",
    answer:
      "A very high implied growth rate indicates that the stock is priced for perfection. If the company fails to grow FCF at 35% annually, its stock price will likely suffer a sharp valuation multiple de-rating.",
  },
  {
    question: "What does a negative or low implied growth rate mean?",
    answer:
      "A low or negative implied growth rate suggests extreme market pessimism. If the company achieves even modest 8%–10% growth, the stock has significant potential for upside re-rating.",
  },
  {
    question: "How should Base FCF (t=0) be selected?",
    answer:
      "Use trailing 12-month (TTM) Free Cash Flow, or a 3-year normalized average FCF if the company recently had temporary working capital spikes or unusual one-off capital expenditures.",
  },
  {
    question: "What role does WACC play in Reverse DCF?",
    answer:
      "WACC represents the required rate of return. A higher assumed WACC will require higher implied cash flow growth to justify the current market valuation.",
  },
  {
    question: "How does Terminal Growth Rate (g) affect the implied forecast growth?",
    answer:
      "A lower terminal growth assumption forces the 5-year explicit forecast period to deliver a higher implied growth rate to reach the current market price.",
  },
  {
    question: "How do value investors use Reverse DCF?",
    answer:
      "Value investors (like Warren Buffett and Charlie Munger) use Reverse DCF to avoid overpaying for growth stocks by checking whether market expectations are modest or egregiously exaggerated.",
  },
  {
    question: "Can Reverse DCF be applied to Indian mid-cap and small-cap stocks?",
    answer:
      "Yes. It is particularly effective for evaluating high-PE Indian growth stocks (e.g. consumer tech, chemical, EMS) to see if their 50x–80x P/E multiples are mathematically justifiable.",
  },
];

export default function ReverseDcfCalculatorPage() {
  const [baseFcfInput, setBaseFcfInput] = useState<string>("1,000");
  const [marketCapInput, setMarketCapInput] = useState<string>("35,000");
  const [waccInput, setWaccInput] = useState<string>("11.0");
  const [termGrowthInput, setTermGrowthInput] = useState<string>("3.5");
  const [netDebtInput, setNetDebtInput] = useState<string>("500");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const parsedBaseFcf = useMemo(() => {
    const raw = baseFcfInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 100 : Math.max(1, Number(raw));
  }, [baseFcfInput]);

  const parsedMarketCap = useMemo(() => {
    const raw = marketCapInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 1000 : Math.max(1, Number(raw));
  }, [marketCapInput]);

  const parsedWacc = useMemo(() => {
    const raw = waccInput.trim();
    return !raw || isNaN(Number(raw)) ? 11 : Number(raw);
  }, [waccInput]);

  const parsedTermGrowth = useMemo(() => {
    const raw = termGrowthInput.trim();
    return !raw || isNaN(Number(raw)) ? 3.5 : Number(raw);
  }, [termGrowthInput]);

  const parsedNetDebt = useMemo(() => {
    const raw = netDebtInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Number(raw);
  }, [netDebtInput]);

  const result = useMemo(() => {
    try {
      return calculateReverseDcf(
        parsedBaseFcf,
        parsedMarketCap,
        parsedWacc / 100,
        5,
        parsedTermGrowth / 100,
        parsedNetDebt
      );
    } catch {
      return null;
    }
  }, [parsedBaseFcf, parsedMarketCap, parsedWacc, parsedTermGrowth, parsedNetDebt]);

  const impliedGrowthPct = result?.impliedGrowthRate !== null && result?.impliedGrowthRate !== undefined
    ? result.impliedGrowthRate * 100
    : null;

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
          <span className="text-[var(--foreground)] font-medium">Reverse DCF Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <SearchCheck className="h-3.5 w-3.5" />
            <span>Expectations Investing Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Reverse DCF Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Deconstruct current stock prices and solve for the implied Free Cash Flow (FCF) annual growth rate priced in by the market over the next 5 years.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            {/* Input 1: Current Market Cap */}
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="rdcf-mcap" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Target market cap / equity value (₹ Cr)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Current market capitalization of the company</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                  <input
                    id="rdcf-mcap"
                    type="text"
                    inputMode="numeric"
                    value={marketCapInput}
                    onChange={(e) => setMarketCapInput(e.target.value)}
                    className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs font-medium text-[var(--calc-text-muted)] ml-1">Cr</span>
                </div>
              </div>
            </div>

            {/* Input 2: Current FCF */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="rdcf-fcf" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Base Free Cash Flow (TTM FCF) (₹ Cr)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Normalized trailing 12-month Free Cash Flow</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                  <input
                    id="rdcf-fcf"
                    type="text"
                    inputMode="numeric"
                    value={baseFcfInput}
                    onChange={(e) => setBaseFcfInput(e.target.value)}
                    className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-xs font-medium text-[var(--calc-text-muted)] ml-1">Cr</span>
                </div>
              </div>
            </div>

            {/* Input 3 & 4: Rates */}
            <div className="grid grid-cols-2 gap-4 pt-5 border-t border-[var(--calc-border)]">
              <div>
                <label htmlFor="rdcf-wacc" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Discount rate (WACC %)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="rdcf-wacc"
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
                <label htmlFor="rdcf-terminal" className="text-[13px] font-semibold text-[var(--calc-text-primary)] block mb-1">
                  Terminal growth rate (%)
                </label>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="rdcf-terminal"
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
          </div>

          {/* Primary Output Summary Card */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Implied FCF CAGR Priced In by Market</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-accent)] tabular-nums block mt-1">
                {impliedGrowthPct !== null ? `${impliedGrowthPct.toFixed(2)}% p.a.` : "N/A"}
              </span>
              {impliedGrowthPct !== null && (
                <span className={`text-xs font-semibold mt-1.5 block ${impliedGrowthPct > 25 ? "text-amber-600 dark:text-amber-400" : "text-[var(--calc-accent)]"}`}>
                  {impliedGrowthPct > 25
                    ? "⚠ High Growth Expectations (Priced for Perfection)"
                    : "✓ Moderate / Reasonable Growth Expectations"}
                </span>
              )}
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Market Equity Value Target</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(parsedMarketCap)} Cr</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Base Free Cash Flow (t=0)</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(parsedBaseFcf)} Cr</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Implied Year 5 FCF Target</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">
                  ₹{impliedGrowthPct !== null ? formatIndianNumber(Math.round(parsedBaseFcf * Math.pow(1 + (impliedGrowthPct / 100), 5))) : 0} Cr
                </span>
              </div>
            </div>

            <Link
              href="/calculators/pe-valuation-calculator"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-lg text-xs font-semibold text-[var(--calc-accent)] hover:border-[var(--calc-accent)] transition-all"
            >
              <span>Compare with P/E Multiples? Run P/E Calculator</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Reverse DCF Calculator?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A <strong>Reverse DCF Calculator</strong> reverses the standard discounted cash flow equation. Instead of estimating future cash flow growth, it inputs the current market price and determines the exact annual growth rate the market expects the company to achieve over the next 5 years.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How to Interpret Reverse DCF Results</h2>
              <div className="overflow-x-auto">
                <table className="financial-table text-xs w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left">Implied Growth Rate</th>
                      <th className="px-4 py-3 text-left">Market Sentiment</th>
                      <th className="px-4 py-3 text-left">Investor Risk Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">&gt; 25% p.a.</td>
                      <td className="px-4 py-2.5 text-amber-600 dark:text-amber-400">Extreme Optimism (Priced for Perfection)</td>
                      <td className="px-4 py-2.5">High risk of de-rating on small quarterly earnings misses</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">12% – 18% p.a.</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Realistic Compounder</td>
                      <td className="px-4 py-2.5">Balanced risk/reward for long-term compounders</td>
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
            <RelatedCalculators currentRoute="/calculators/reverse-dcf-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
