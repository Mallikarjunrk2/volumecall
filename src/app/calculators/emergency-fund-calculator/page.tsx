"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateEmergencyFund } from "@/lib/financial/planning/emergencyFund";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Umbrella, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from "lucide-react";

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
    question: "What is an Emergency Fund?",
    answer:
      "An Emergency Fund is a dedicated pool of highly liquid cash set aside to cover essential living expenses and unforeseen financial crises such as medical emergencies, job loss, or sudden home repairs.",
  },
  {
    question: "How many months of expenses should I keep in an emergency fund?",
    answer:
      "Financial advisors generally recommend keeping 3 to 6 months of mandatory living expenses for salaried employees with dual-income households, and 9 to 12 months for freelancers, business owners, or single-earner families.",
  },
  {
    question: "Where should I keep my emergency fund in India?",
    answer:
      "Keep your emergency fund divided across high-yield savings accounts, sweep-in bank fixed deposits (FDs), and liquid mutual funds to ensure instant 24/7 liquidity with moderate capital protection.",
  },
  {
    question: "What expenses should be included in the emergency fund calculation?",
    answer:
      "Include only non-negotiable mandatory expenses: rent/home loan EMI, grocery and utility bills, health and life insurance premiums, children's school fees, and essential medicine costs.",
  },
  {
    question: "Should I invest my emergency fund in stocks or equity mutual funds?",
    answer:
      "No. An emergency fund must never be invested in volatile equity markets or real estate because you may be forced to sell units at a severe loss during a market crash.",
  },
  {
    question: "How quickly should an emergency fund be accessible?",
    answer:
      "At least 1 to 2 months of expenses should be instantly withdrawable via ATM or UPI within minutes, with the remainder accessible within 24 to 48 hours via liquid funds or online FD liquidation.",
  },
  {
    question: "What is the difference between an emergency fund and a sinking fund?",
    answer:
      "An emergency fund is for unforeseen crises (e.g. hospital admission, sudden layoff). A sinking fund is for planned future expenses (e.g. annual car insurance renewal, festive travel, home repainting).",
  },
  {
    question: "Should I build an emergency fund before starting stock or SIP investments?",
    answer:
      "Yes. Establishing a minimum 3-month emergency fund is the foundational Step 1 of personal finance. It prevents you from breaking long-term equity SIPs when emergencies occur.",
  },
  {
    question: "How often should I review and update my emergency fund?",
    answer:
      "Review your emergency fund once a year or whenever your monthly expenses change significantly (e.g., getting married, having a baby, taking a new home loan EMI).",
  },
  {
    question: "Can I use a credit card as an emergency fund?",
    answer:
      "Credit cards can be used as a temporary payment bridge for immediate hospital billing, but relying on credit cards as an emergency fund risks high revolving debt (36%–42% p.a. interest).",
  },
];

export default function EmergencyFundCalculatorPage() {
  const [expenseInput, setExpenseInput] = useState<string>("40,000");
  const [monthsInput, setMonthsInput] = useState<number>(6);
  const [currentSavingsInput, setCurrentSavingsInput] = useState<string>("50,000");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedExpense = useMemo(() => {
    const raw = expenseInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [expenseInput]);

  const parsedSavings = useMemo(() => {
    const raw = currentSavingsInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [currentSavingsInput]);

  const expenseWords = useMemo(() => numberToWordsIndian(parsedExpense), [parsedExpense]);
  const savingsWords = useMemo(() => numberToWordsIndian(parsedSavings), [parsedSavings]);

  const result = useMemo(() => {
    return calculateEmergencyFund(parsedExpense, monthsInput, parsedSavings);
  }, [parsedExpense, monthsInput, parsedSavings]);

  const coverageProgress = result.requiredEmergencyFund > 0
    ? Math.min(100, (parsedSavings / result.requiredEmergencyFund) * 100)
    : 100;

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
          <span className="text-[var(--foreground)] font-medium">Emergency Fund Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Umbrella className="h-4 w-4" />
            <span>Financial Safety Net</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Emergency Fund Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate how many months of mandatory living expenses you should keep in safe, liquid savings to protect against medical emergencies and unforeseen job loss.
          </p>
        </div>

        {/* Calculator Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Monthly Essential Expenses */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="ef-expense" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Monthly Essential Expenses
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Rent/EMI, groceries, bills, school fees, medicine</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="ef-expense"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={expenseInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setExpenseInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {expenseWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{expenseWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="500000"
                step="5000"
                autoComplete="off"
                value={Math.min(500000, Math.max(0, parsedExpense))}
                onChange={(e) => setExpenseInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 2: Months of Coverage */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                Coverage Horizon (Months)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "3 Months (Dual Income)", val: 3 },
                  { label: "6 Months (Standard)", val: 6 },
                  { label: "9 Months (Single Income)", val: 9 },
                  { label: "12 Months (Business)", val: 12 },
                ].map((m) => (
                  <button
                    key={m.val}
                    onClick={() => setMonthsInput(m.val)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                      monthsInput === m.val
                        ? "bg-teal-700 border-teal-700 text-white shadow-xs"
                        : "bg-neutral-50 dark:bg-[#121212] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {m.val} Mo
                  </button>
                ))}
              </div>
            </div>

            {/* Input 3: Current Savings */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="ef-savings" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Current Liquid Savings Already Set Aside
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Savings account balance, sweep FDs, liquid funds</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="ef-savings"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={currentSavingsInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setCurrentSavingsInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {savingsWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{savingsWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="2000000"
                step="10000"
                autoComplete="off"
                value={Math.min(2000000, Math.max(0, parsedSavings))}
                onChange={(e) => setCurrentSavingsInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>
          </div>

          {/* Right Column: Output Card */}
          <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">
                Total Recommended Emergency Fund ({monthsInput} Months)
              </span>
              <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result.requiredEmergencyFund))}
              </span>
              <div className="mt-3">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Fund Progress</span>
                  <span>{coverageProgress.toFixed(0)}% Funded</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-700 dark:bg-teal-400 h-full rounded-full transition-all" style={{ width: `${coverageProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Already Saved</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(result.currentSavings))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-700 dark:text-teal-400 font-medium">Additional Savings Needed</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(result.additionalSavingsNeeded))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Educational Content Sections */}
        <div className="space-y-10 mb-12 border-t border-[var(--border)] pt-10">

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is an Emergency Fund?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              An <strong>Emergency Fund</strong> is an essential cash buffer preserved in high-liquidity, low-risk accounts. Its sole purpose is to keep your household afloat during sudden life disruptions (such as medical crises, economic layoffs, or major family emergencies) without taking high-interest loans or liquidating long-term equity mutual fund SIPs at market bottoms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Where Should You Keep Your Emergency Fund in India?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-normal">
              <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">1. High-Yield Savings Account</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Keep 1 to 2 months of expenses in your primary bank account for instant ATM / UPI access 24/7.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">2. Sweep-in Bank FDs</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Keep 2 to 3 months of expenses in auto-sweep fixed deposits that earn 6.5%–7.5% interest with zero break penalty.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">3. Liquid Mutual Funds</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Keep the remainder in AAA-rated overnight or liquid mutual funds offering insta-redemption up to ₹50,000 per day.
                </p>
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
        <RelatedCalculators currentRoute="/calculators/emergency-fund-calculator" />
      </main>
      <Footer />
    </div>
  );
}
