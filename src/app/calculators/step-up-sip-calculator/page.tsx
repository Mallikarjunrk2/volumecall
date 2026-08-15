"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateStepUpSip } from "@/lib/financial/investments/stepUpSip";
import { calculateSip } from "@/lib/financial/investments/sip";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { TrendingUp, ChevronDown, ChevronUp, AlertTriangle, ArrowRight } from "lucide-react";

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
    question: "What is a Step-Up SIP (Top-Up SIP)?",
    answer:
      "A Step-Up SIP (also called a Top-Up SIP) is an automated mutual fund feature that increases your monthly investment contribution by a fixed percentage (e.g. 10%) or fixed rupee amount every year, aligning your investments with annual salary appraisals.",
  },
  {
    question: "How does a Step-Up SIP calculator work?",
    answer:
      "A Step-Up SIP calculator simulates month-by-month compounding where your monthly installment increases at the start of every 12-month cycle. It computes the total capital invested, estimated compound returns, and final maturity corpus.",
  },
  {
    question: "How is Step-Up SIP different from a regular SIP?",
    answer:
      "A regular SIP keeps your monthly deposit constant throughout the tenure (e.g. ₹10,000/month for 15 years). A Step-Up SIP increases the monthly deposit each year (e.g. ₹10,000 in Year 1, ₹11,000 in Year 2, ₹12,100 in Year 3), resulting in a significantly larger final corpus.",
  },
  {
    question: "What is the recommended annual step-up percentage?",
    answer:
      "A 10% annual step-up is widely recommended by financial advisors in India. It matches typical corporate salary appraisal rates and ensures that inflation does not erode your savings rate.",
  },
  {
    question: "How does stepping up my SIP help beat inflation?",
    answer:
      "As the cost of living rises each year, a flat SIP contribution effectively represents a smaller proportion of your real income. Increasing your SIP annually ensures your savings rate keeps pace with or exceeds inflation.",
  },
  {
    question: "Can I choose a fixed rupee increase instead of a percentage?",
    answer:
      "Yes, most Indian mutual fund platforms allow you to choose either a percentage increase (e.g., 10% or 15%) or a fixed rupee increase (e.g., ₹1,000 or ₹2,000 extra per month each year).",
  },
  {
    question: "Does stepping up an SIP double the returns?",
    answer:
      "Over long tenures (15–20 years), a 10% annual step-up can nearly double your final wealth compared to a flat SIP, because higher contributions in later years compound upon a substantial existing portfolio base.",
  },
  {
    question: "Can I stop or modify the step-up feature later?",
    answer:
      "Yes, mutual fund houses allow investors to pause, modify, or cancel the automated top-up instruction without stopping the underlying monthly SIP.",
  },
  {
    question: "Are Step-Up SIP return estimates guaranteed?",
    answer:
      "No, all calculations are illustrative projections based on an assumed constant annual return rate. Mutual fund returns fluctuate based on market movements and are subject to market risks.",
  },
  {
    question: "Are taxes deducted from Step-Up SIP calculator results?",
    answer:
      "No, calculator results show gross pre-tax estimated wealth. In India, equity mutual fund capital gains above ₹1.25 Lakh per financial year are taxed under Long-Term Capital Gains (LTCG) at 12.5%.",
  },
];

export default function StepUpSipCalculatorPage() {
  const [sipInput, setSipInput] = useState<string>("10,000");
  const [stepUpInput, setStepUpInput] = useState<string>("10");
  const [returnInput, setReturnInput] = useState<string>("12");
  const [yearsInput, setYearsInput] = useState<string>("10");
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const handleSipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    setSipInput(clean === "" ? "" : formatRawDigits(clean));
  };

  const handleStepUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let clean = e.target.value.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) clean = parts[0] + "." + parts.slice(1).join("");
    setStepUpInput(clean);
  };

  const handleReturnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let clean = e.target.value.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) clean = parts[0] + "." + parts.slice(1).join("");
    setReturnInput(clean);
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    setYearsInput(clean);
  };

  const parsedSip = useMemo(() => {
    const raw = sipInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [sipInput]);

  const parsedStepUp = useMemo(() => {
    const raw = stepUpInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [stepUpInput]);

  const parsedReturn = useMemo(() => {
    const raw = returnInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [returnInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [yearsInput]);

  const sipWords = useMemo(() => numberToWordsIndian(parsedSip), [parsedSip]);
  const yearsWords = useMemo(() => formatDurationToWords(yearsInput), [yearsInput]);

  // Step-Up SIP result using engine
  const stepUpResult = useMemo(() => {
    return calculateStepUpSip(
      parsedSip,
      parsedStepUp / 100,
      parsedReturn / 100,
      parsedYears,
      "end"
    );
  }, [parsedSip, parsedStepUp, parsedReturn, parsedYears]);

  // Baseline flat SIP comparison
  const flatSipResult = useMemo(() => {
    return calculateSip(
      parsedSip,
      parsedReturn / 100,
      parsedYears,
      "monthly",
      "end"
    );
  }, [parsedSip, parsedReturn, parsedYears]);

  const finalMonthlySip = stepUpResult.schedule.length > 0
    ? stepUpResult.schedule[stepUpResult.schedule.length - 1].monthlySip
    : parsedSip;

  const extraWealth = stepUpResult.totalValue - flatSipResult.totalValue;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb Navigation */}
        <div className="text-xs text-[var(--text-secondary)] mb-4 flex items-center space-x-1.5 font-normal">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/calculators" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Calculators</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] font-medium">Step-Up SIP Calculator</span>
        </div>

        {/* Page Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <TrendingUp className="h-4 w-4" />
            <span>Wealth Escalator Planning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Step-Up SIP Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Estimate how much your wealth can grow when you automatically increase your monthly SIP deposit every year to match annual salary appraisals.
          </p>
        </div>

        {/* Calculator Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 calc-grid mb-12">
          {/* Left Column: Input Form Controls */}
          <div className="lg:col-span-7 h-full bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Starting SIP */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="starting-sip" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Starting Monthly SIP
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Initial monthly contribution in Year 1</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="starting-sip"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={sipInput}
                      onChange={handleSipChange}
                      className="w-36 sm:w-44 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {sipWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{sipWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="1000"
                autoComplete="off"
                value={Math.min(500000, Math.max(0, parsedSip))}
                onChange={(e) => setSipInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 2: Annual Step-Up % */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="annual-stepup" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Annual Step-Up Rate (%)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Percentage increase in monthly deposit each year</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="annual-stepup"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={stepUpInput}
                    onChange={handleStepUpChange}
                    className="w-36 sm:w-44 pr-6 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                  />
                  <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                autoComplete="off"
                value={Math.min(50, Math.max(0, parsedStepUp))}
                onChange={(e) => setStepUpInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 3: Expected Return */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="stepup-return" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Expected Return (p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Assumed annual growth rate of mutual fund portfolio</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="stepup-return"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={returnInput}
                    onChange={handleReturnChange}
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
                value={Math.min(30, Math.max(0, parsedReturn))}
                onChange={(e) => setReturnInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 4: Duration */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="stepup-duration" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Investment Duration
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Total investment period in years</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <input
                      id="stepup-duration"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={yearsInput}
                      onChange={handleYearsChange}
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
          <div className="lg:col-span-5 h-full bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Estimated Maturity Corpus</span>
              <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(stepUpResult.totalValue))}
              </span>
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-1 block">
                +₹{formatIndianNumber(Math.round(extraWealth))} more than a flat SIP
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Total Amount Invested</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(stepUpResult.investedAmount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-700 dark:text-teal-400 font-medium">Estimated Returns</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(stepUpResult.estimatedReturns))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--text-secondary)] font-medium">Final Monthly SIP (Year {parsedYears})</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(finalMonthlySip))} / month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step-Up vs Flat SIP Comparison Table */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-4 mb-12 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-950 dark:text-neutral-50">
            Step-Up SIP vs Regular Flat SIP Comparison ({parsedYears} Years @ {parsedReturn}% p.a.)
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Compare how a {parsedStepUp}% annual top-up accelerates long-term wealth creation compared to maintaining a flat monthly deposit.
          </p>

          <div className="overflow-x-auto">
            <table className="financial-table text-xs w-full">
              <thead>
                <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left">SIP Strategy</th>
                  <th className="px-4 py-3 text-right">Total Invested</th>
                  <th className="px-4 py-3 text-right">Estimated Growth</th>
                  <th className="px-4 py-3 text-right">Final Maturity Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] tabular-nums">
                <tr className="hover:bg-neutral-50 dark:hover:bg-[#121212]">
                  <td className="px-4 py-3 font-semibold">Flat SIP (₹{formatIndianNumber(parsedSip)}/mo)</td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">₹{formatIndianNumber(Math.round(flatSipResult.investedAmount))}</td>
                  <td className="px-4 py-3 text-right text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(flatSipResult.estimatedReturns))}</td>
                  <td className="px-4 py-3 text-right font-bold">₹{formatIndianNumber(Math.round(flatSipResult.totalValue))}</td>
                </tr>
                <tr className="bg-teal-500/10 font-bold">
                  <td className="px-4 py-3 text-teal-900 dark:text-teal-200">Step-Up SIP (+{parsedStepUp}%/yr)</td>
                  <td className="px-4 py-3 text-right">₹{formatIndianNumber(Math.round(stepUpResult.investedAmount))}</td>
                  <td className="px-4 py-3 text-right text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(stepUpResult.estimatedReturns))}</td>
                  <td className="px-4 py-3 text-right text-teal-800 dark:text-teal-300 font-extrabold">₹{formatIndianNumber(Math.round(stepUpResult.totalValue))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="flex items-start space-x-2.5 p-4 bg-amber-500/5 border border-amber-200/40 dark:border-amber-900/20 rounded-xl mb-12 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Disclaimer:</strong> Step-Up SIP calculator outputs are illustrative estimates based on an assumed constant rate of return. Mutual fund investments are subject to market risks. Actual market returns fluctuate and are not guaranteed. Capital gains taxes and expense ratios are not deducted in projections.
          </p>
        </div>

        {/* Educational Content & Related Calculators Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Step-Up SIP?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A <strong>Step-Up SIP</strong> (also known as a Top-Up SIP) is an automated facility in mutual funds that increases your regular monthly investment contribution at scheduled annual intervals. Instead of keeping your monthly installment fixed for decades, a Step-Up SIP automatically raises your contribution by a predetermined percentage (e.g. 10%) or fixed rupee sum (e.g. ₹1,000) every 12 months.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                In India, working professionals typically receive annual salary increments. A Step-Up SIP harnesses this income growth by allocating a fraction of your annual pay raise directly into disciplined compounding before lifestyle inflation absorbs the surplus cash.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does a Step-Up SIP Calculator Work?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                A Step-Up SIP calculator performs an exact period-by-period financial simulation using four straightforward user inputs:
              </p>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Starting Monthly SIP:</strong> The initial amount you invest per month in Year 1 (e.g., ₹10,000).</li>
                <li><strong>Annual Step-Up Rate:</strong> The percentage by which your monthly deposit escalates each year (e.g., 10%).</li>
                <li><strong>Expected Annual Return:</strong> The assumed annual compounded growth rate of your portfolio (e.g., 12% p.a.).</li>
                <li><strong>Investment Duration:</strong> The total time horizon in years (e.g., 10 years).</li>
              </ol>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                At the beginning of each 12-month cycle, the calculator steps up your monthly installment and applies the effective monthly compound interest rate to compute the cumulative investment, returns, and final maturity corpus.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is a Step-Up SIP Calculated?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Unlike a flat SIP which uses a single annuity formula, a Step-Up SIP is calculated as the sum of sequential annuity streams where the periodic contribution increases every 12 months:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">SIP<sub>Year k</sub> = SIP<sub>Initial</sub> × (1 + s)<sup>k - 1</sup></div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>SIP<sub>Year k</sub></strong> = Monthly investment amount during Year <em>k</em></div>
                  <div><strong>s</strong> = Annual step-up percentage rate (e.g., 0.10 for 10%)</div>
                  <div><strong>r</strong> = Monthly periodic rate of return = (1 + Annual Return)<sup>1/12</sup> - 1</div>
                  <div><strong>Total Corpus</strong> = Sum of all monthly contributions compounded to the end of tenure</div>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Our financial engine (<code className="text-xs bg-neutral-100 dark:bg-[#1a1a1a] px-1 py-0.5 rounded">calculateStepUpSip</code>) simulates this exact monthly progression to guarantee 100% mathematical precision without relying on approximations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Step-Up SIP Calculation Example</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Consider an investor starting with a monthly SIP of ₹10,000 and stepping up by 10% each year for 10 years at an assumed 12% annual return:
              </p>
              <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1 list-disc list-inside mb-4">
                <li><strong>Year 1 Monthly SIP:</strong> ₹10,000/month (Annual Total: ₹1,20,000)</li>
                <li><strong>Year 2 Monthly SIP:</strong> ₹11,000/month (Annual Total: ₹1,32,000)</li>
                <li><strong>Year 3 Monthly SIP:</strong> ₹12,100/month (Annual Total: ₹1,45,200)</li>
                <li><strong>Year 10 Monthly SIP:</strong> ₹23,579/month (Annual Total: ₹2,82,954)</li>
              </ul>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-[var(--text-secondary)]">Total Invested (with 10% Step-Up)</span>
                  <span className="font-bold tabular-nums">₹19,12,491</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-teal-700 dark:text-teal-400">Estimated Returns</span>
                  <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹14,94,845</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm">
                  <span>Total Maturity Value</span>
                  <span className="tabular-nums">₹34,07,336</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                In contrast, a flat ₹10,000 SIP without step-up yields ₹22.19 Lakhs. Stepping up by 10% annually creates nearly <strong>₹11.88 Lakhs in additional wealth</strong> over the same 10-year timeline.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How to Use the Step-Up SIP Calculator</h2>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Enter Starting Monthly SIP:</strong> Input the amount you can comfortably invest each month today.</li>
                <li><strong>Select Annual Step-Up Rate:</strong> Enter your expected annual percentage raise (10% is standard).</li>
                <li><strong>Set Expected Return Rate:</strong> Choose an assumed long-term annualized return (e.g., 12% to 15% for equity mutual funds).</li>
                <li><strong>Set Investment Duration:</strong> Use the slider or type your investment time horizon in years.</li>
                <li><strong>Review Wealth Projections:</strong> View your estimated maturity corpus, total capital deposited, and final monthly installment.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Benefits of a Step-Up SIP</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Beats Lifestyle Inflation</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    As incomes rise, lifestyle expenses naturally expand. Automating annual SIP increases ensures your savings rate climbs proportionally with earnings.
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Accelerates Compounding</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Stepping up contributions channels substantially more capital into mutual fund units during intermediate and later years, generating exponential returns.
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Low Starting Barrier</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Young investors can start small (e.g. ₹5,000/month) and still accumulate multi-crore wealth by committing to annual top-ups as their careers advance.
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Automated Financial Discipline</h4>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    Once configured with your bank and mutual fund platform, top-ups happen automatically without requiring manual paperwork each year.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Step-Up SIP vs Regular SIP vs Lumpsum</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Understanding how different investment styles compare helps you choose the right strategy for your personal cash flow:
              </p>
              <div className="overflow-x-auto">
                <table className="financial-table text-xs w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left">Feature</th>
                      <th className="px-4 py-3 text-left">Step-Up SIP</th>
                      <th className="px-4 py-3 text-left">Regular Flat SIP</th>
                      <th className="px-4 py-3 text-left">Lumpsum Investment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Contribution Amount</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Increases annually</td>
                      <td className="px-4 py-2.5">Fixed throughout</td>
                      <td className="px-4 py-2.5">One-time payment</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Income Alignment</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Matches annual salary increments</td>
                      <td className="px-4 py-2.5">Static monthly budget</td>
                      <td className="px-4 py-2.5">Windfall / bonus dependent</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Rupee Cost Averaging</td>
                      <td className="px-4 py-2.5">Yes (enhanced in later years)</td>
                      <td className="px-4 py-2.5">Yes (constant rate)</td>
                      <td className="px-4 py-2.5">No (subject to market timing risk)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Final Wealth Potential</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Highest among recurring modes</td>
                      <td className="px-4 py-2.5">Moderate</td>
                      <td className="px-4 py-2.5">High (if invested early)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Important Factors to Consider</h2>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
                <p>
                  <strong>1. Cash Flow Affordability:</strong> In later years (e.g. Year 15 or 20), stepping up by 10% annually results in significant monthly contributions. Ensure your career growth or business cash flows can sustain the stepped-up installment.
                </p>
                <p>
                  <strong>2. Step-Up Cap:</strong> Many fund houses allow setting a maximum upper limit on your top-up amount so your monthly debit doesn&apos;t exceed your budget ceiling.
                </p>
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
            <RelatedCalculators currentRoute="/calculators/step-up-sip-calculator" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
