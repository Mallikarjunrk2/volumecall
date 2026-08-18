"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateFutureValue } from "@/lib/financial/compounding/futureValue";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Sparkles, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

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

function formatDurationToWords(valStr: string): string {
  if (valStr === "" || isNaN(Number(valStr))) return "";
  const num = Number(valStr);
  if (num <= 0) return "Zero Years";
  const words = numberToWordsIndian(num);
  return num === 1 ? `${words} Year` : `${words} Years`;
}

const pageFaqItems = [
  {
    question: "What is Future Value (FV)?",
    answer:
      "Future Value (FV) is the value of a current asset or sum of money at a specified date in the future, based on an assumed rate of growth or rate of return over time.",
  },
  {
    question: "How is Future Value calculated for a lump sum?",
    answer:
      "The formula for Future Value is: FV = PV × (1 + r)^n, where PV is Present Value, r is the interest rate per compounding period, and n is the total number of compounding periods.",
  },
  {
    question: "What is the Time Value of Money (TVM)?",
    answer:
      "The Time Value of Money is the fundamental financial concept that money available at the present time is worth more than the identical sum in the future due to its potential earning capacity.",
  },
  {
    question: "What is the difference between Future Value and Present Value?",
    answer:
      "Future Value compounds a current sum forward into the future. Present Value discounts a future sum backward to determine what it is worth in today's terms.",
  },
  {
    question: "How does inflation affect Future Value?",
    answer:
      "Future Value calculates nominal wealth. If prices rise by 6% annually while your FV grows by 10%, your real purchasing power growth is approximately 3.77% per year (via the Fisher equation).",
  },
  {
    question: "What will ₹5 Lakh be worth in 10 years at 12% annual return?",
    answer:
      "At a 12% compound annual return, an initial lump sum of ₹5,00,000 will grow to approximately ₹15,52,924 in 10 years (a 3.1x growth multiple).",
  },
  {
    question: "Can Future Value be calculated for periodic cash flows?",
    answer:
      "Yes. For periodic recurring deposits, the Future Value of an Ordinary Annuity formula is used (as in our SIP Calculator).",
  },
  {
    question: "How does compounding frequency change Future Value?",
    answer:
      "More frequent compounding (monthly or quarterly instead of annually) yields a slightly higher future value because earned interest is added back to the principal sooner.",
  },
  {
    question: "What is the difference between Future Value and Maturity Value in Bank FDs?",
    answer:
      "They are conceptually the same. Bank FD maturity values represent the future value of the deposit calculated with quarterly compounding.",
  },
  {
    question: "Why is calculating Future Value important in financial planning?",
    answer:
      "It allows investors to verify whether their current lump sum investments will sufficiently fund distant financial milestones like retirement, children's higher education, or buying a house.",
  },
];

export default function FutureValueCalculatorPage() {
  const [pvInput, setPvInput] = useState<string>("5,00,000");
  const [rateInput, setRateInput] = useState<string>("12");
  const [yearsInput, setYearsInput] = useState<string>("10");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedPv = useMemo(() => {
    const raw = pvInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [pvInput]);

  const parsedRate = useMemo(() => {
    const raw = rateInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [rateInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [yearsInput]);

  const pvWords = useMemo(() => numberToWordsIndian(parsedPv), [parsedPv]);
  const yearsWords = useMemo(() => formatDurationToWords(yearsInput), [yearsInput]);

  const result = useMemo(() => {
    return calculateFutureValue(parsedPv, parsedRate / 100, parsedYears);
  }, [parsedPv, parsedRate, parsedYears]);

  const pvPercent = Math.min(100, Math.max(0, (parsedPv / 10000000) * 100));
  const ratePercent = Math.min(100, Math.max(0, (parsedRate / 30) * 100));
  const yearsPercent = Math.min(100, Math.max(0, (parsedYears / 40) * 100));

  const getSliderTrackStyle = (percent: number) => ({
    background: `linear-gradient(to right, var(--calc-accent) 0%, var(--calc-accent) ${percent}%, var(--calc-track-bg) ${percent}%, var(--calc-track-bg) 100%)`,
  });

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
          <span className="text-[var(--foreground)] font-medium">Future Value Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Time Value of Money (TVM)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Future Value (FV) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate the future worth of any initial lump-sum investment based on expected annual compounding growth rates over your target holding period.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            {/* Input 1: Present Value */}
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="fv-pv" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Present value (initial sum)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Starting capital / current deposit</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                    <input
                      id="fv-pv"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={pvInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setPvInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
              {pvWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{pvWords}</div>}
              <input
                type="range"
                min="0"
                max="10000000"
                step="10000"
                autoComplete="off"
                value={Math.min(10000000, Math.max(0, parsedPv))}
                onChange={(e) => setPvInput(formatIndianNumber(Number(e.target.value)))}
                style={getSliderTrackStyle(pvPercent)}
                className="financial-slider"
              />
            </div>

            {/* Input 2: Rate */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="fv-rate" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Expected return rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Annual compounding growth rate</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="fv-rate"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="w-20 sm:w-28 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                autoComplete="off"
                value={Math.min(30, Math.max(0, parsedRate))}
                onChange={(e) => setRateInput(e.target.value)}
                style={getSliderTrackStyle(ratePercent)}
                className="financial-slider"
              />
            </div>

            {/* Input 3: Years */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="fv-years" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Time horizon (years)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Future period in years</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <input
                      id="fv-years"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={yearsInput}
                      onChange={(e) => setYearsInput(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-20 sm:w-28 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">Yr</span>
                  </div>
                </div>
              </div>
              {yearsWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{yearsWords}</div>}
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                autoComplete="off"
                value={Math.min(40, Math.max(0, parsedYears))}
                onChange={(e) => setYearsInput(e.target.value)}
                style={getSliderTrackStyle(yearsPercent)}
                className="financial-slider"
              />
            </div>
          </div>

          {/* Primary Output Card */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Estimated Future Value (FV)</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-text-primary)] tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result.futureValue))}
              </span>
              <span className="text-xs font-semibold text-[var(--calc-accent)] mt-1.5 block">
                Total Wealth Multiplier: {(parsedPv > 0 ? result.futureValue / parsedPv : 0).toFixed(2)}x
              </span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Present Value Invested</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result.presentValue))}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Capital Growth</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">₹{formatIndianNumber(Math.round(result.totalGrowth))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--calc-border)] text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Return</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">{((parsedPv > 0 ? result.totalGrowth / parsedPv : 0) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <Link
              href="/calculators/present-value-calculator"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[var(--border)] rounded-xl text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-neutral-50 transition-colors"
            >
              <span>Have a future goal amount? Calculate Present Value Needed</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is Future Value (FV)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <strong>Future Value (FV)</strong> measures how much a current sum of money will be worth in the future given an assumed interest rate or rate of return. It is a cornerstone of the Time Value of Money (TVM) theory.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is Future Value Calculated?</h2>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">FV = PV × ( 1 + r )<sup>n</sup></div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>PV</strong> = Present Value (initial deposit)</div>
                  <div><strong>r</strong> = Rate of return per period</div>
                  <div><strong>n</strong> = Number of compounding periods (years)</div>
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
            <RelatedCalculators currentRoute="/calculators/future-value-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
