"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculatePresentValue } from "@/lib/financial/compounding/presentValue";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { History, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

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
    question: "What is Present Value (PV)?",
    answer:
      "Present Value (PV) is the current worth of a future sum of money or stream of cash flows given a specified rate of return (discount rate).",
  },
  {
    question: "How is Present Value calculated?",
    answer:
      "The formula for Present Value is: PV = FV / (1 + r)^n, where FV is Future Value, r is the discount rate per period, and n is the number of periods.",
  },
  {
    question: "What is a discount rate?",
    answer:
      "A discount rate represents the opportunity cost of capital or expected annual return you could earn on an alternative investment of similar risk.",
  },
  {
    question: "Why is a rupee today worth more than a rupee tomorrow?",
    answer:
      "Because a rupee in hand today can be invested to earn interest or capital gains, and because inflation erodes future purchasing power.",
  },
  {
    question: "How much do I need to invest today to get ₹1 Crore in 15 years at 12% return?",
    answer:
      "At 12% CAGR, you need to invest a lump sum of approximately ₹18,26,964 today to reach ₹1,00,00,000 (₹1 Crore) in 15 years.",
  },
  {
    question: "What is the relationship between Present Value and Discount Rate?",
    answer:
      "They have an inverse relationship: as the discount rate rises, the present value decreases because money grows faster, requiring less initial capital today.",
  },
  {
    question: "What is the difference between Present Value and Net Present Value (NPV)?",
    answer:
      "Present Value evaluates a single future sum or cash flow. Net Present Value (NPV) subtracts the initial cash investment outlay from the sum of all discounted future cash inflows.",
  },
  {
    question: "Can Present Value be calculated for an annuity stream?",
    answer:
      "Yes. The Present Value of an Annuity formula discounts a regular recurring series of equal payments over time.",
  },
  {
    question: "How is Present Value used in bond valuation?",
    answer:
      "A bond's fair market price is the present value of all its future semi-annual coupon payments plus the present value of its face value paid at maturity, discounted at current market yields.",
  },
  {
    question: "How does inflation affect Present Value calculations?",
    answer:
      "If you wish to calculate purchasing power in today's real terms, you can use the expected inflation rate as your discount rate.",
  },
];

export default function PresentValueCalculatorPage() {
  const [fvInput, setFvInput] = useState<string>("1,00,00,000");
  const [rateInput, setRateInput] = useState<string>("12");
  const [yearsInput, setYearsInput] = useState<string>("15");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedFv = useMemo(() => {
    const raw = fvInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [fvInput]);

  const parsedRate = useMemo(() => {
    const raw = rateInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [rateInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [yearsInput]);

  const fvWords = useMemo(() => numberToWordsIndian(parsedFv), [parsedFv]);
  const yearsWords = useMemo(() => formatDurationToWords(yearsInput), [yearsInput]);

  const result = useMemo(() => {
    return calculatePresentValue(parsedFv, parsedRate / 100, parsedYears);
  }, [parsedFv, parsedRate, parsedYears]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumbs */}
        <div className="text-xs text-[var(--text-secondary)] mb-4 flex items-center space-x-1.5 font-normal">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/calculators" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Calculators</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium">Present Value Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <History className="h-4 w-4" />
            <span>Discounted Cash Flow Principle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Present Value (PV) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate the exact lump-sum amount required today to reach a target future financial sum or goal based on discount rates and time duration.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-12">
          {/* Form Controls */}
          <div className="md:col-span-7 h-full bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Future Value Goal */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="pv-fv" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Target Future Value (FV)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Future target amount desired</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="pv-fv"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={fvInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setFvInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {fvWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{fvWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50000000"
                step="50000"
                autoComplete="off"
                value={Math.min(50000000, Math.max(0, parsedFv))}
                onChange={(e) => setFvInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 2: Rate */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="pv-rate" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Discount / Return Rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Assumed annual discount or return rate</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="pv-rate"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="w-36 sm:w-44 pr-6 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                  />
                  <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">%</span>
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
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 3: Years */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="pv-years" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Time Horizon (Years)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Number of years until target date</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <input
                      id="pv-years"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={yearsInput}
                      onChange={(e) => setYearsInput(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-36 sm:w-44 pr-12 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                    <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">Years</span>
                  </div>
                  {yearsWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{yearsWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                autoComplete="off"
                value={Math.min(40, Math.max(0, parsedYears))}
                onChange={(e) => setYearsInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>
          </div>

          {/* Primary Output Card */}
          <div className="md:col-span-5 h-full bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Required Present Value (PV)</span>
              <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result.presentValue))}
              </span>
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-1 block">
                Invest this lump sum today to reach your target ₹{formatIndianNumber(parsedFv)} goal.
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Target Future Value</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(result.futureValue))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-700 dark:text-teal-400 font-medium">Compounded Growth Earned</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(result.discountAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Discount Factor</span>
                <span className="font-bold tabular-nums">{(parsedFv > 0 ? result.presentValue / parsedFv : 0).toFixed(4)}</span>
              </div>
            </div>

            <Link
              href="/calculators/future-value-calculator"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[var(--border)] rounded-xl text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-neutral-50 transition-colors"
            >
              <span>Have a lump sum today? Calculate Future Value</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is Present Value (PV)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <strong>Present Value (PV)</strong> is the current worth of a future sum of money or stream of cash flows, discounted at a specific rate of return. It answers the fundamental question: <em>&quot;How much money must I invest today to have ₹X in Y years?&quot;</em>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is Present Value Calculated?</h2>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">PV = FV / ( 1 + r )<sup>n</sup></div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>FV</strong> = Future Value desired</div>
                  <div><strong>r</strong> = Annual discount / return rate</div>
                  <div><strong>n</strong> = Total number of years</div>
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
            <RelatedCalculators currentRoute="/calculators/present-value-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
