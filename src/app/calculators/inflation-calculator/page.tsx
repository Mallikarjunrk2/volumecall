"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateFutureCost, calculateInflationPresentValue, calculateRealReturn } from "@/lib/financial/planning/inflation";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Flame, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from "lucide-react";

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
    question: "What is inflation?",
    answer:
      "Inflation is the rate at which the general level of prices for goods and services rises over time, resulting in a continuous decrease in the purchasing power of money.",
  },
  {
    question: "How does inflation affect long-term savings and investments?",
    answer:
      "Inflation erodes the future purchasing power of your money. If your investment earns 6% interest while inflation is 6%, your real wealth growth is zero.",
  },
  {
    question: "What is the historical average inflation rate in India?",
    answer:
      "Over the past two decades, consumer price inflation (CPI) in India has averaged approximately 5.5% to 6.5% per annum, while lifestyle inflation (education and healthcare) has averaged 8% to 10% p.a.",
  },
  {
    question: "What is the Fisher Equation for Real Return?",
    answer:
      "The exact Fisher equation calculates real purchasing power growth as: Real Return = (1 + Nominal Return) / (1 + Inflation Rate) - 1.",
  },
  {
    question: "Why shouldn't I just subtract inflation from nominal return?",
    answer:
      "Simply subtracting (Nominal - Inflation) is an approximation that becomes increasingly inaccurate over higher inflation rates and multi-year compounding. The Fisher formula gives exact mathematical precision.",
  },
  {
    question: "What will ₹1 Lakh today be worth in 15 years at 6% inflation?",
    answer:
      "At 6% annual inflation, you will need approximately ₹2,39,656 in 15 years to purchase what ₹1,00,000 buys today. Conversely, ₹1 Lakh saved under a mattress will only have the purchasing power of ~₹41,727.",
  },
  {
    question: "Which asset classes historically beat inflation in India?",
    answer:
      "Equities (mutual funds/stocks), real estate, and physical gold have historically delivered long-term returns well in excess of retail inflation.",
  },
  {
    question: "What is education and healthcare inflation in India?",
    answer:
      "Higher education and private hospital healthcare in India experience inflation rates of 8% to 12% annually, requiring higher assumed rates when planning for child education or medical corpuses.",
  },
  {
    question: "How does an inflation calculator help in retirement planning?",
    answer:
      "It projects your current monthly household expenses (e.g. ₹50,00,000 retirement corpus target) to their actual inflated cost when you retire in 15 or 25 years.",
  },
  {
    question: "What is the Rule of 70 in inflation?",
    answer:
      "Dividing 70 by the annual inflation rate gives the approximate number of years it will take for prices to double and purchasing power to halve (e.g. 70 / 6% inflation ≈ 11.6 years).",
  },
];

export default function InflationCalculatorPage() {
  const [calcMode, setCalcMode] = useState<"futureCost" | "purchasingPower">("futureCost");
  const [amountInput, setAmountInput] = useState<string>("1,00,000");
  const [inflationInput, setInflationInput] = useState<string>("6.0");
  const [yearsInput, setYearsInput] = useState<string>("15");
  const [nominalReturnInput, setNominalReturnInput] = useState<string>("12.0");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedAmount = useMemo(() => {
    const raw = amountInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [amountInput]);

  const parsedInflation = useMemo(() => {
    const raw = inflationInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [inflationInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [yearsInput]);

  const parsedNominal = useMemo(() => {
    const raw = nominalReturnInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [nominalReturnInput]);

  const amountWords = useMemo(() => numberToWordsIndian(parsedAmount), [parsedAmount]);
  const yearsWords = useMemo(() => formatDurationToWords(yearsInput), [yearsInput]);

  // Calculations using single source of truth planning/inflation.ts
  const futureCostResult = useMemo(() => {
    return calculateFutureCost(parsedAmount, parsedInflation / 100, parsedYears);
  }, [parsedAmount, parsedInflation, parsedYears]);

  const purchasingPowerResult = useMemo(() => {
    return calculateInflationPresentValue(parsedAmount, parsedInflation / 100, parsedYears);
  }, [parsedAmount, parsedInflation, parsedYears]);

  const fisherRealReturn = useMemo(() => {
    return calculateRealReturn(parsedNominal / 100, parsedInflation / 100);
  }, [parsedNominal, parsedInflation]);

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
          <span className="text-[var(--foreground)] font-medium">Inflation Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Flame className="h-4 w-4" size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Purchasing Power & Cost of Living</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Inflation & Real Return Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate the future inflated cost of living, purchasing power erosion on cash savings, and exact Fisher real returns in India.
          </p>
        </div>

        {/* Calculator Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Mode Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                Inflation Calculation Mode
              </label>
              <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-bold text-xs">
                <button
                  onClick={() => setCalcMode("futureCost")}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    calcMode === "futureCost" ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Future Cost of Living
                </button>
                <button
                  onClick={() => setCalcMode("purchasingPower")}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    calcMode === "purchasingPower" ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Purchasing Power Erosion
                </button>
              </div>
            </div>

            {/* Input 1: Amount */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="inf-amount" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    {calcMode === "futureCost" ? "Today's Expense / Target Amount" : "Future Cash Sum to Discount"}
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Base financial value</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="inf-amount"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={amountInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setAmountInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {amountWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{amountWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="10000000"
                step="10000"
                autoComplete="off"
                value={Math.min(10000000, Math.max(0, parsedAmount))}
                onChange={(e) => setAmountInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 2: Inflation Rate */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="inf-rate" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Expected Inflation Rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Historical average: ~6% for CPI, ~10% for education/medical</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="inf-rate"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={inflationInput}
                    onChange={(e) => setInflationInput(e.target.value)}
                    className="w-36 sm:w-44 pr-6 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                  />
                  <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                autoComplete="off"
                value={Math.min(15, Math.max(0, parsedInflation))}
                onChange={(e) => setInflationInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 3: Duration */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="inf-years" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Time Horizon (Years)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Number of years into the future</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <input
                      id="inf-years"
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

          {/* Right Column: Output Card */}
          <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            {calcMode === "futureCost" ? (
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">
                  Future Cost in {parsedYears} Years (@ {parsedInflation}% Inflation)
                </span>
                <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                  ₹{formatIndianNumber(Math.round(futureCostResult.futureValue))}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1 block">
                  Prices rise by {(Math.pow(1 + parsedInflation / 100, parsedYears) * 100 - 100).toFixed(1)}% (+₹{formatIndianNumber(Math.round(futureCostResult.futureValue - parsedAmount))})
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">
                  Purchasing Power Value in Today&apos;s Terms
                </span>
                <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                  ₹{formatIndianNumber(Math.round(purchasingPowerResult.presentValue))}
                </span>
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1 block">
                  Purchasing power falls by {((1 - purchasingPowerResult.presentValue / (parsedAmount || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-900 dark:text-white">Calculate Real Return (Fisher Equation):</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">If Nominal Portfolio Return is</span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={nominalReturnInput}
                      onChange={(e) => setNominalReturnInput(e.target.value)}
                      className="w-16 px-1.5 py-0.5 text-right font-bold border border-[var(--border)] rounded bg-white dark:bg-[#1a1a1a]"
                    />
                    <span className="ml-1 text-[11px] text-[var(--text-secondary)]">%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center font-bold text-teal-700 dark:text-teal-400">
                  <span>Exact Real Return (Purchasing Power Growth)</span>
                  <span className="tabular-nums text-sm">{(fisherRealReturn.realReturn * 100).toFixed(2)}% p.a.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Educational Content Sections */}
        <div className="space-y-10 mb-12 border-t border-[var(--border)] pt-10">

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is Inflation?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              <strong>Inflation</strong> is the persistent increase in the general price level of goods and services over time. As prices rise, each unit of currency buys fewer goods, leading to a steady loss of purchasing power.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
              For Indian families, inflation acts as an invisible tax on cash savings. Leaving money in a standard savings account (yielding 2.5%–3.5%) while inflation runs at 6% results in a real wealth destruction of ~3% every year.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is Inflation & Future Cost Calculated?</h2>
            <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
              <div className="font-bold text-sm">Future Cost = Present Cost × ( 1 + i )<sup>n</sup></div>
              <div className="font-bold text-sm">Fisher Real Return = ( 1 + Nominal Return ) / ( 1 + Inflation ) - 1</div>
              <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                <div><strong>i</strong> = Annual inflation rate (e.g. 0.06 for 6%)</div>
                <div><strong>n</strong> = Number of years into future</div>
              </div>
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
        <RelatedCalculators currentRoute="/calculators/inflation-calculator" />
      </main>
      <Footer />
    </div>
  );
}
