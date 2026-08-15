"use client";

import { useState, useMemo } from "react";
import { calculateGoalSip, GoalPlanningResult } from "@/lib/financial/planning/goalPlanning";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { InvestmentFrequency } from "@/lib/financial/types";
import { Target, AlertCircle } from "lucide-react";

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

export default function GoalPlanner() {
  // Input states initialized to defaults (Goal: 5 Crores, Duration: 10 Years, Return: 12%, Frequency: Monthly)
  const [goalInput, setGoalInput] = useState<string>("5,00,00,000");
  const [yearsInput, setYearsInput] = useState<string>("10");
  const [scenarioMode, setScenarioMode] = useState<"10" | "12" | "15" | "custom">("12");
  const [customReturnInput, setCustomReturnInput] = useState<string>("12");
  const [frequency, setFrequency] = useState<InvestmentFrequency>("monthly");

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

  // Parsed numbers
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

  const frequencyLabel = frequency === "monthly" ? "Month" : frequency === "quarterly" ? "Quarter" : "Year";
  const frequencySuffix = frequency === "monthly" ? "month" : frequency === "quarterly" ? "quarter" : "year";

  return (
    <div id="goal-planner" className="bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-8 shadow-xs my-12">
      {/* Section Header */}
      <div className="flex items-start space-x-3 pb-4 border-b border-[var(--border)]">
        <div className="p-2.5 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-xl shrink-0 mt-1">
          <Target className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-neutral-50 tracking-tight">
            Plan Your Financial Goal
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            Know your goal target but not sure how much to invest? Calculate the regular investment amount you need to reach your target corpus.
          </p>
        </div>
      </div>

      {/* Calculator Form Controls & Main Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Goal Inputs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Input 1: Goal Amount */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <label htmlFor="goal-target-amount" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider pt-2">
                Target Goal Amount
              </label>
              <div className="flex flex-col items-end space-y-1">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                  <input
                    id="goal-target-amount"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={goalInput}
                    onChange={handleGoalChange}
                    className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                  />
                </div>
                {goalWords && (
                  <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">
                    {goalWords}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input 2: Investment Duration */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <label htmlFor="goal-duration-years" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider pt-2">
                Investment Duration
              </label>
              <div className="flex flex-col items-end space-y-1">
                <div className="relative flex items-center">
                  <input
                    id="goal-duration-years"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={yearsInput}
                    onChange={handleYearsChange}
                    className="w-36 sm:w-44 pr-12 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                  />
                  <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">Years</span>
                </div>
                {yearsWords && (
                  <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">
                    {yearsWords}
                  </div>
                )}
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

          {/* Input 3: Return Scenario Buttons */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
              Expected Return Scenario (p.a.)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "10%", value: "10" },
                { label: "12%", value: "12" },
                { label: "15%", value: "15" },
                { label: "Custom", value: "custom" },
              ].map((sc) => (
                <button
                  key={sc.value}
                  onClick={() => setScenarioMode(sc.value as "10" | "12" | "15" | "custom")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    scenarioMode === sc.value
                      ? "bg-teal-700 border-teal-700 text-white shadow-xs"
                      : "bg-neutral-50 dark:bg-[#121212] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>

            {scenarioMode === "custom" && (
              <div className="pt-2 flex items-center space-x-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">Custom Return Rate:</span>
                <div className="relative flex items-center">
                  <input
                    id="goal-custom-return"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={customReturnInput}
                    onChange={handleCustomReturnChange}
                    className="w-28 pr-6 pl-2.5 py-1 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-xs font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 tabular-nums"
                  />
                  <span className="absolute right-2 text-xs text-[var(--text-secondary)]">%</span>
                </div>
              </div>
            )}
            <p className="text-[10px] text-[var(--text-muted)]">
              Assumed return rates are illustrative scenarios for planning purposes only and are not guaranteed.
            </p>
          </div>

          {/* Input 4: Investment Frequency Segmented Control */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
              Investment Frequency
            </label>
            <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-bold text-xs">
              {[
                { label: "Monthly", value: "monthly" },
                { label: "Quarterly", value: "quarterly" },
                { label: "Yearly", value: "annual" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequency(f.value as InvestmentFrequency)}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    frequency === f.value
                      ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Goal Calculation Result Card */}
        <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
          <div>
            <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
              At {activeReturnPercent}% Expected Return
            </div>
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Required {frequencyLabel}ly Investment
            </h3>

            <div className="mt-3">
              <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block">
                ₹{formatIndianNumber(Math.ceil(mainGoalResult.requiredPayment))}
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">per {frequencySuffix}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)] font-medium">Target Goal Amount</span>
              <span className="font-bold tabular-nums">₹{formatIndianNumber(mainGoalResult.targetCorpus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)] font-medium">Total Amount Invested</span>
              <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(mainGoalResult.totalInvested))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-teal-700 dark:text-teal-400 font-medium">Estimated Growth</span>
              <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(mainGoalResult.estimatedGrowth))}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Scenario Comparison Table */}
      <div className="pt-6 border-t border-[var(--border)]">
        <h3 className="text-sm font-bold text-neutral-950 dark:text-neutral-50 mb-4">
          How much would I need to invest at different return rates?
        </h3>
        
        <div className="overflow-x-auto">
          <table className="financial-table text-xs w-full">
            <thead>
              <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left">Expected Return</th>
                <th className="px-4 py-3 text-right">Required Investment (per {frequencySuffix})</th>
                <th className="px-4 py-3 text-right">Total Invested</th>
                <th className="px-4 py-3 text-right">Estimated Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] tabular-nums">
              {[
                { rate: "10%", val: "10", res: scenario10Result },
                { rate: "12%", val: "12", res: scenario12Result },
                { rate: "15%", val: "15", res: scenario15Result },
              ].map((row) => (
                <tr
                  key={row.rate}
                  onClick={() => setScenarioMode(row.val as "10" | "12" | "15")}
                  className={`cursor-pointer transition-colors ${
                    scenarioMode === row.val
                      ? "bg-teal-500/10 font-bold"
                      : "hover:bg-neutral-50 dark:hover:bg-[#121212]"
                  }`}
                >
                  <td className="px-4 py-3 font-semibold flex items-center space-x-2">
                    <span>{row.rate}</span>
                    {scenarioMode === row.val && (
                      <span className="text-[10px] bg-teal-700 text-white px-2 py-0.5 rounded-full font-bold">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-teal-700 dark:text-teal-400">
                    ₹{formatIndianNumber(Math.ceil(row.res.requiredPayment))} / {frequencySuffix}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                    ₹{formatIndianNumber(Math.round(row.res.totalInvested))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    ₹{formatIndianNumber(Math.round(row.res.estimatedGrowth))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Small Disclaimer */}
      <div className="flex items-center space-x-2 text-[11px] text-[var(--text-muted)] pt-2">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>
          These calculations are illustrative estimates based on the assumed return rate. Actual market-linked returns may be higher or lower.
        </span>
      </div>
    </div>
  );
}
