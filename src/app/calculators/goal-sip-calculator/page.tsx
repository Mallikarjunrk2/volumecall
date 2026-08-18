"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateGoalSip, GoalPlanningResult } from "@/lib/financial/planning/goalPlanning";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { InvestmentFrequency } from "@/lib/financial/types";
import { Target, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from "lucide-react";

/**
 * Converts a positive number to Indian numbering words (Thousand, Lakh, Crore).
 */
function numberToWordsIndian(num: number): string {
  if (isNaN(num) || num < 0) return "";
  if (num === 0) return "Zero";

  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

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
    if (hundred > 0) {
      str += units[hundred] + " Hundred";
    }
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

  if (crore > 0) {
    result += (crore < 100 ? convertBelowThousand(crore) : convertUnderThousandWithHundred(crore)) + " Crore ";
  }
  if (lakh > 0) {
    result += convertBelowThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    result += convertBelowThousand(thousand) + " Thousand ";
  }
  if (remaining > 0) {
    result += convertUnderThousandWithHundred(remaining);
  }

  return result.trim();
}

/**
 * Format duration string to words.
 */
function formatDurationToWords(valStr: string): string {
  if (valStr === "" || isNaN(Number(valStr))) return "";
  const num = Number(valStr);
  if (num < 0) return "";
  if (num === 0) return "Zero Years";
  const words = numberToWordsIndian(num);
  if (!words) return "";
  return num === 1 ? `${words} Year` : `${words} Years`;
}

const pageFaqItems = [
  {
    question: "What is a Goal SIP Calculator?",
    answer:
      "A Goal SIP Calculator is a reverse financial calculator that estimates the regular monthly, quarterly, or yearly investment amount required to reach a specific target goal corpus (such as ₹1 Crore or ₹5 Crore) over your chosen investment period.",
  },
  {
    question: "How does a Goal SIP Calculator work?",
    answer:
      "A Goal SIP Calculator works in reverse compared to a standard SIP calculator. You enter your desired target amount, investment duration, assumed return rate, and investment frequency. The calculator then computes the required periodic contribution needed to accumulate that goal.",
  },
  {
    question: "How much SIP do I need to reach ₹1 crore?",
    answer:
      "The monthly SIP required to reach ₹1 Crore depends on your investment period and expected return. At an assumed 12% annual return, you need approximately ₹43,000/month for 10 years, ₹15,000/month for 15 years, or ₹6,500/month for 20 years.",
  },
  {
    question: "How much SIP do I need to reach ₹5 crore?",
    answer:
      "To reach a target goal of ₹5 Crore at an assumed 12% annual return, you need approximately ₹2,15,000/month for 10 years, ₹75,000/month for 15 years, or ₹32,000/month for 20 years.",
  },
  {
    question: "Does a higher expected return reduce the required SIP?",
    answer:
      "Yes, assuming a higher return rate reduces the calculated monthly SIP required because compound growth generates a larger portion of your target goal. However, higher expected returns generally involve higher market risk.",
  },
  {
    question: "Can I calculate quarterly or yearly investments?",
    answer:
      "Yes, our Goal SIP Calculator supports Monthly, Quarterly, and Yearly investment frequencies, using exact periodic compound interest rates from our financial engine.",
  },
  {
    question: "Are the returns shown by the calculator guaranteed?",
    answer:
      "No, all return rates used in the calculator are illustrative assumptions. Mutual fund and equity market returns fluctuate over time and are not guaranteed.",
  },
  {
    question: "Can I change my goal amount later?",
    answer:
      "Yes, financial goals can be adjusted at any time. You can recalculate your required SIP as your income, savings capacity, or financial targets change.",
  },
  {
    question: "Why does the required SIP change when I change the investment period?",
    answer:
      "Extending your investment duration gives compound interest more time to work, significantly reducing the monthly investment needed to hit the same financial goal.",
  },
  {
    question: "Is a Goal SIP Calculator suitable for mutual fund investments?",
    answer:
      "Yes, the Goal SIP Calculator is ideally suited for planning systematic investments in equity, hybrid, or debt mutual funds.",
  },
];

export default function GoalSipCalculatorPage() {
  const [goalInput, setGoalInput] = useState<string>("5,00,00,000");
  const [yearsInput, setYearsInput] = useState<string>("10");
  const [scenarioMode, setScenarioMode] = useState<"10" | "12" | "15" | "custom">("12");
  const [customReturnInput, setCustomReturnInput] = useState<string>("12");
  const [frequency, setFrequency] = useState<InvestmentFrequency>("monthly");

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string): string => {
    if (!raw) return "";
    const num = Number(raw);
    if (isNaN(num)) return raw;
    return formatIndianNumber(num);
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanDigits = val.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    if (cleanDigits === "") {
      setGoalInput("");
      return;
    }
    setGoalInput(formatRawDigits(cleanDigits));
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanDigits = val.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    setYearsInput(cleanDigits);
  };

  const handleCustomReturnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    let clean = val.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("");
    }
    if (clean.startsWith("0") && clean.length > 1 && clean[1] !== ".") {
      clean = clean.replace(/^0+/, "");
    }
    setCustomReturnInput(clean);
  };

  // Parsed numeric inputs
  const parsedGoal = useMemo(() => {
    const raw = goalInput.replace(/,/g, "").trim();
    if (!raw || isNaN(Number(raw))) return 0;
    return Math.max(0, Number(raw));
  }, [goalInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    if (!raw || isNaN(Number(raw))) return 0;
    return Math.max(0, Number(raw));
  }, [yearsInput]);

  const activeReturnPercent = useMemo(() => {
    if (scenarioMode === "10") return 10;
    if (scenarioMode === "12") return 12;
    if (scenarioMode === "15") return 15;
    const raw = customReturnInput.trim();
    if (!raw || isNaN(Number(raw))) return 0;
    return Math.max(0, Number(raw));
  }, [scenarioMode, customReturnInput]);

  // Derived words
  const goalWords = useMemo(() => numberToWordsIndian(parsedGoal), [parsedGoal]);
  const yearsWords = useMemo(() => formatDurationToWords(yearsInput), [yearsInput]);

  // Goal calculation results using single source of truth goalPlanning.ts
  const mainGoalResult: GoalPlanningResult = useMemo(() => {
    return calculateGoalSip(
      parsedGoal,
      0, // no initial lump sum
      activeReturnPercent / 100,
      parsedYears,
      "end",
      frequency
    );
  }, [parsedGoal, activeReturnPercent, parsedYears, frequency]);

  // Scenario comparisons for 10%, 12%, 15%
  const scenario10Result = useMemo(() => calculateGoalSip(parsedGoal, 0, 0.10, parsedYears, "end", frequency), [parsedGoal, parsedYears, frequency]);
  const scenario12Result = useMemo(() => calculateGoalSip(parsedGoal, 0, 0.12, parsedYears, "end", frequency), [parsedGoal, parsedYears, frequency]);
  const scenario15Result = useMemo(() => calculateGoalSip(parsedGoal, 0, 0.15, parsedYears, "end", frequency), [parsedGoal, parsedYears, frequency]);

  const frequencySuffix = frequency === "monthly" ? "month" : frequency === "quarterly" ? "quarter" : "year";

  const yearsPercent = Math.min(100, Math.max(0, (parsedYears / 40) * 100));
  const returnPercent = Math.min(100, Math.max(0, (activeReturnPercent / 30) * 100));

  const getSliderTrackStyle = (percent: number) => ({
    background: `linear-gradient(to right, var(--calc-accent) 0%, var(--calc-accent) ${percent}%, var(--calc-track-bg) ${percent}%, var(--calc-track-bg) 100%)`,
  });

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
          <span className="text-[var(--foreground)] font-medium">Goal SIP Calculator</span>
        </div>

        {/* Header Title & Simple Introduction */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Target className="h-3.5 w-3.5" />
            <span>Goal-Based Wealth Planning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Goal SIP Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Have a financial goal in mind? Find out how much you may need to invest regularly to reach your target amount. Tell us your target goal amount, time horizon, and assumed return rate to estimate the required investment.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Left Sub-card: Input Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            {/* Input 1: Target Goal Amount */}
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="goal-target-amount" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Target goal amount
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Target wealth corpus needed</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                    <input
                      id="goal-target-amount"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={goalInput}
                      onChange={handleGoalChange}
                      className="w-36 sm:w-44 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
              {goalWords && (
                <div className="text-xs font-medium text-[var(--calc-accent)] text-right">
                  {goalWords}
                </div>
              )}
            </div>

            {/* Input 2: Investment Duration */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="goal-duration-years" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Investment duration
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Years to reach your goal</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <input
                      id="goal-duration-years"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={yearsInput}
                      onChange={handleYearsChange}
                      className="w-20 sm:w-28 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">Yr</span>
                  </div>
                </div>
              </div>
              {yearsWords && (
                <div className="text-xs font-medium text-[var(--calc-accent)] text-right">
                  {yearsWords}
                </div>
              )}
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                autoComplete="off"
                value={Math.min(40, Math.max(1, parsedYears))}
                onChange={(e) => setYearsInput(e.target.value)}
                style={getSliderTrackStyle(yearsPercent)}
                className="financial-slider"
              />
            </div>

            {/* Input 3: Assumed Annual Return Rate */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div>
                <label htmlFor="goal-return-rate" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                  Expected return rate (p.a.)
                </label>
                <span className="text-[11px] text-[var(--calc-text-muted)]">Select scenario or enter custom rate</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  { label: "10% Conservative", val: "10" },
                  { label: "12% Moderate", val: "12" },
                  { label: "15% Aggressive", val: "15" },
                ].map((btn) => (
                  <button
                    key={btn.val}
                    type="button"
                    onClick={() => setScenarioMode(btn.val as "10" | "12" | "15")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                      scenarioMode === btn.val
                        ? "bg-[var(--calc-accent)] text-white border-[var(--calc-accent)] font-bold"
                        : "bg-[var(--calc-input-bg)] text-[var(--calc-text-secondary)] border-[var(--calc-border-input)] hover:text-[var(--calc-text-primary)]"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[var(--calc-text-secondary)]">Custom Return Rate</span>
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)]">
                    <input
                      id="goal-return-rate"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={customReturnInput}
                      onChange={handleCustomReturnChange}
                      className="w-16 bg-transparent text-right text-xs font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                    <span className="text-xs font-medium text-[var(--calc-text-muted)] ml-1 select-none">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  autoComplete="off"
                  value={Math.min(30, Math.max(1, activeReturnPercent))}
                  onChange={(e) => {
                    setScenarioMode("custom");
                    setCustomReturnInput(e.target.value);
                  }}
                  style={getSliderTrackStyle(returnPercent)}
                  className="financial-slider"
                />
              </div>
            </div>

            {/* Input 4: Investment Frequency Toggle */}
            <div className="pt-5 border-t border-[var(--calc-border)] space-y-3">
              <label className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                Investment frequency
              </label>
              <div className="inline-flex p-1 bg-[var(--bg-subtle)] border border-[var(--calc-border)] rounded-lg font-semibold text-xs">
                {[
                  { id: "monthly", label: "Monthly" },
                  { id: "quarterly", label: "Quarterly" },
                  { id: "annual", label: "Yearly" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFrequency(item.id as InvestmentFrequency)}
                    className={`py-1.5 px-4 rounded-md transition-all cursor-pointer ${
                      frequency === item.id
                        ? "bg-[var(--calc-card-bg)] text-[var(--calc-accent)] font-bold shadow-xs"
                        : "text-[var(--calc-text-secondary)] hover:text-[var(--calc-text-primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sub-card: Primary Result Display */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">
                Required Regular Investment
              </span>

              <div className="mt-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-text-primary)] tabular-nums block">
                  ₹{formatIndianNumber(Math.ceil(mainGoalResult.requiredPayment))}
                </span>
                <span className="text-xs font-medium text-[var(--calc-text-muted)]">per {frequencySuffix}</span>
              </div>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Target Goal Amount</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(mainGoalResult.targetCorpus)}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Amount Invested</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(mainGoalResult.totalInvested))}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Estimated Growth</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">₹{formatIndianNumber(Math.round(mainGoalResult.estimatedGrowth))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Return Scenario Comparison Table */}
        <div className="bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-4 mb-10">
          <h3 className="text-sm font-bold text-[var(--calc-text-primary)]">
            See how the assumed return changes the required investment
          </h3>
          <p className="text-xs text-[var(--calc-text-secondary)]">
            These are illustrative scenarios, not guaranteed returns.
          </p>

          <div className="overflow-x-auto">
            <table className="financial-table text-xs w-full">
              <thead>
                <tr className="bg-[var(--bg-surface)] border-b border-[var(--calc-border)]">
                  <th className="px-4 py-3 text-left">Expected Return</th>
                  <th className="px-4 py-3 text-right">Required Investment (per {frequencySuffix})</th>
                  <th className="px-4 py-3 text-right">Total Invested</th>
                  <th className="px-4 py-3 text-right">Estimated Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--calc-border)] tabular-nums">
                {[
                  { rate: "10% Conservative", val: "10", res: scenario10Result },
                  { rate: "12% Moderate", val: "12", res: scenario12Result },
                  { rate: "15% Aggressive", val: "15", res: scenario15Result },
                ].map((sc) => (
                  <tr
                    key={sc.rate}
                    onClick={() => setScenarioMode(sc.val as "10" | "12" | "15")}
                    className={`cursor-pointer transition-colors ${
                      scenarioMode === sc.val
                        ? "bg-teal-500/10 font-bold"
                        : "hover:bg-[var(--bg-surface)]"
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold flex items-center space-x-2">
                      <span>{sc.rate}</span>
                      {scenarioMode === sc.val && (
                        <span className="text-[10px] bg-[var(--calc-accent)] text-white px-2 py-0.5 rounded-full font-bold">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[var(--calc-accent)]">
                      ₹{formatIndianNumber(Math.ceil(sc.res.requiredPayment))} / {frequencySuffix}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--calc-text-secondary)]">
                      ₹{formatIndianNumber(Math.round(sc.res.totalInvested))}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--calc-text-primary)]">
                      ₹{formatIndianNumber(Math.round(sc.res.estimatedGrowth))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Educational Content & Related Calculators Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Goal SIP Calculator?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                If you know that you want ₹1 Crore after 15 years, a normal SIP calculator tells you what a given monthly deposit could grow into over time. A <strong>Goal SIP Calculator</strong> works in the opposite direction — it estimates how much you may need to invest regularly (monthly, quarterly, or yearly) to target a specific financial goal.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                Whether you are planning for a child&apos;s higher education, purchasing a home, building a retirement corpus, or accumulating ₹5 Crore, a Goal SIP Calculator eliminates guesswork by computing the precise periodic investment required.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does a Goal SIP Calculator Work?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                A Goal SIP Calculator solves the compound interest annuity equation in reverse based on five primary parameters:
              </p>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Target Goal Amount:</strong> The future wealth corpus you wish to accumulate (e.g. ₹5,00,00,000).</li>
                <li><strong>Investment Duration:</strong> The number of years available before you need the funds (e.g. 10 Years).</li>
                <li><strong>Assumed Return Rate:</strong> The annualized rate of return expected from your selected mutual fund asset class (e.g. 12% p.a.).</li>
                <li><strong>Investment Frequency:</strong> Your deposit schedule (Monthly, Quarterly, or Yearly).</li>
                <li><strong>Required Periodic Contribution:</strong> The exact deposit amount calculated by solving the annuity future value equation.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is the Required Goal SIP Calculated?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                The calculator uses the inverse of the ordinary annuity future value formula:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">P = Target Corpus / [ ((1 + r)<sup>n</sup> - 1) / r ]</div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>P</strong> = Required periodic investment contribution (e.g., Monthly SIP)</div>
                  <div><strong>Target Corpus</strong> = Target future financial goal</div>
                  <div><strong>r</strong> = Periodic interest rate = (1 + Annual Rate)<sup>1/periodsPerYear</sup> - 1</div>
                  <div><strong>n</strong> = Total number of investment deposits (Years × periodsPerYear)</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Much SIP Do I Need to Reach ₹1 Crore?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                The monthly SIP needed to accumulate ₹1 Crore depends heavily on your investment period and assumed return rate. Here are benchmark estimates at an assumed <strong>12% p.a.</strong> return:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium my-4">
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1">
                  <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold block">10-Year Horizon</span>
                  <span className="text-lg font-extrabold text-neutral-950 dark:text-neutral-50 block">~₹43,000 / mo</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Total Invested: ~₹51.6 Lakhs</span>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1">
                  <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold block">15-Year Horizon</span>
                  <span className="text-lg font-extrabold text-neutral-950 dark:text-neutral-50 block">~₹15,000 / mo</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Total Invested: ~₹27.0 Lakhs</span>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1">
                  <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold block">20-Year Horizon</span>
                  <span className="text-lg font-extrabold text-neutral-950 dark:text-neutral-50 block">~₹6,500 / mo</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Total Invested: ~₹15.6 Lakhs</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Notice how extending your investment horizon from 10 years to 20 years reduces your required monthly contribution from ₹43,000 down to ₹6,500.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Much SIP Do I Need to Reach ₹5 Crore?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Accumulating a target goal of ₹5 Crore requires dedicated wealth planning. Benchmark estimated requirements at <strong>12% p.a.</strong> return:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium my-4">
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1">
                  <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold block">10-Year Horizon</span>
                  <span className="text-lg font-extrabold text-neutral-950 dark:text-neutral-50 block">~₹2,15,000 / mo</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Total Invested: ~₹2.58 Crore</span>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1">
                  <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold block">15-Year Horizon</span>
                  <span className="text-lg font-extrabold text-neutral-950 dark:text-neutral-50 block">~₹75,000 / mo</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Total Invested: ~₹1.35 Crore</span>
                </div>
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1">
                  <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold block">20-Year Horizon</span>
                  <span className="text-lg font-extrabold text-neutral-950 dark:text-neutral-50 block">~₹32,000 / mo</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Total Invested: ~₹76.8 Lakhs</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Goal SIP vs Regular SIP</h2>
              <div className="overflow-x-auto">
                <table className="financial-table text-xs w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left">Feature</th>
                      <th className="px-4 py-3 text-left">Goal SIP Calculator</th>
                      <th className="px-4 py-3 text-left">Standard SIP Calculator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Starting Point</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Target Goal Amount (₹1 Cr, ₹5 Cr)</td>
                      <td className="px-4 py-2.5">Monthly Investment Amount (₹5,000/mo)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Calculation Direction</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Reverse (Solves for required installment)</td>
                      <td className="px-4 py-2.5">Forward (Solves for future maturity value)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Primary Use Case</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Milestone-based financial planning</td>
                      <td className="px-4 py-2.5">General wealth estimation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Important Things to Remember</h2>
              <div className="flex items-start space-x-2.5 p-4 bg-amber-500/5 border border-amber-200/40 dark:border-amber-900/20 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Disclaimer:</strong> Goal SIP calculator outputs are illustrative projections based on assumed return rates. Mutual fund investments are subject to market risks, and actual market returns fluctuate. Capital gains taxes, fund expense ratios, and inflation are not deducted in standard projections.
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
            <RelatedCalculators currentRoute="/calculators/goal-sip-calculator" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
