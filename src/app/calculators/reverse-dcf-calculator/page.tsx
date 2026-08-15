"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateReverseDcf } from "@/lib/financial/valuation/reverseDcf";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { SearchCheck, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from "lucide-react";

function numberToWordsIndian(num: number): string {
  if (isNaN(num) || num < 0) return "";
  if (num === 0) return "Zero";
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertBelowThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return units[n];
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return tens[ten] + (unit ? " " + units[unit] : "");
  }

  function convertUnderThousandWithHundred(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = "";
    if (hundred > 0) str += units[hundred] + " Hundred";
    if (rest > 0) {
      if (str) str += " ";
      str += convertBelowThousand(rest);
    }
    return str;
  }

  let n = Math.floor(num);
  let result = "";
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  const remaining = n % 1000;

  if (crore > 0) result += (crore < 100 ? convertBelowThousand(crore) : convertUnderThousandWithHundred(crore)) + " Crore ";
  if (lakh > 0) result += convertBelowThousand(lakh) + " Lakh ";
  if (thousand > 0) result += convertBelowThousand(thousand) + " Thousand ";
  if (remaining > 0) result += convertUnderThousandWithHundred(remaining);

  return result.trim();
}

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

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw.replace(/[^0-9]/g, ""));
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

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
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="text-xs text-[var(--text-secondary)] mb-4 flex items-center space-x-1.5 font-normal">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/calculators" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Calculators</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium">Reverse DCF Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <SearchCheck className="h-4 w-4" />
            <span>Expectations Investing Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Reverse DCF Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Deconstruct current stock prices and solve for the implied Free Cash Flow (FCF) annual growth rate priced in by the market over the next 5 years.
          </p>
        </div>

        {/* Calculator Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Current Market Cap */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="rdcf-mcap" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Current Target Market Cap / Equity Value (₹ Cr)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Current market capitalization of the company</span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                  <input
                    id="rdcf-mcap"
                    type="text"
                    inputMode="numeric"
                    value={marketCapInput}
                    onChange={(e) => setMarketCapInput(e.target.value)}
                    className="w-36 sm:w-44 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Input 2: Current FCF */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="rdcf-fcf" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Base Free Cash Flow (TTM FCF) (₹ Cr)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Normalized trailing 12-month Free Cash Flow</span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                  <input
                    id="rdcf-fcf"
                    type="text"
                    inputMode="numeric"
                    value={baseFcfInput}
                    onChange={(e) => setBaseFcfInput(e.target.value)}
                    className="w-36 sm:w-44 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <label htmlFor="rdcf-wacc" className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block mb-1">
                  Discount Rate (WACC %)
                </label>
                <input
                  id="rdcf-wacc"
                  type="text"
                  inputMode="decimal"
                  value={waccInput}
                  onChange={(e) => setWaccInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 tabular-nums"
                />
              </div>

              <div>
                <label htmlFor="rdcf-terminal" className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block mb-1">
                  Terminal Growth (g %)
                </label>
                <input
                  id="rdcf-terminal"
                  type="text"
                  inputMode="decimal"
                  value={termGrowthInput}
                  onChange={(e) => setTermGrowthInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 tabular-nums"
                />
              </div>

              <div>
                <label htmlFor="rdcf-debt" className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block mb-1">
                  Net Debt (₹ Cr)
                </label>
                <input
                  id="rdcf-debt"
                  type="text"
                  inputMode="decimal"
                  value={netDebtInput}
                  onChange={(e) => setNetDebtInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Output Card */}
          <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Implied 5-Year FCF Growth Rate</span>
              <span className="text-3xl sm:text-4xl font-black text-teal-700 dark:text-teal-400 tabular-nums block mt-1">
                {impliedGrowthPct !== null ? `${impliedGrowthPct.toFixed(2)}% p.a.` : "N/A"}
              </span>
              {impliedGrowthPct !== null && (
                <span className={`text-xs font-semibold mt-1 block ${impliedGrowthPct > 25 ? "text-amber-600 dark:text-amber-400" : "text-teal-700 dark:text-teal-400"}`}>
                  {impliedGrowthPct > 25
                    ? "⚠ High Growth Expectations (Priced for Perfection)"
                    : "✓ Moderate / Reasonable Growth Expectations"}
                </span>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Market Equity Value Target</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(parsedMarketCap)} Cr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Base Free Cash Flow (t=0)</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(parsedBaseFcf)} Cr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Implied Year 5 FCF Target</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">
                  ₹{impliedGrowthPct !== null ? formatIndianNumber(Math.round(parsedBaseFcf * Math.pow(1 + (impliedGrowthPct / 100), 5))) : 0} Cr
                </span>
              </div>
            </div>

            <Link
              href="/calculators/pe-valuation-calculator"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[var(--border)] rounded-xl text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-neutral-50 transition-colors"
            >
              <span>Compare with P/E Multiples? Run P/E Calculator</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Comprehensive Educational Content Sections */}
        <div className="space-y-10 mb-12 border-t border-[var(--border)] pt-10">

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
                    <td className="px-4 py-2.5">Balanced risk-reward for quality franchises</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">&lt; 8% p.a.</td>
                    <td className="px-4 py-2.5">Pessimistic / Out-of-Favor</td>
                    <td className="px-4 py-2.5">Potential deep-value opportunity with margin of safety</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* FAQ Accordion Section */}
        <div className="mb-12 border-t border-[var(--border)] pt-10">
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

        {/* Related Calculators Navigation */}
        <RelatedCalculators currentRoute="/calculators/reverse-dcf-calculator" />
      </main>
      <Footer />
    </div>
  );
}
