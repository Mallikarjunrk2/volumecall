"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateEmergencyFund } from "@/lib/financial/planning/emergencyFund";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Umbrella, ChevronDown, ChevronUp } from "lucide-react";

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

  const expensePercent = Math.min(100, Math.max(0, (parsedExpense / 500000) * 100));
  const savingsPercent = Math.min(100, Math.max(0, (parsedSavings / 2000000) * 100));

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
          <span className="text-[var(--foreground)] font-medium">Emergency Fund Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Umbrella className="h-3.5 w-3.5" />
            <span>Financial Safety Net</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Emergency Fund Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate how many months of mandatory living expenses you should keep in safe, liquid savings to protect against medical emergencies and unforeseen job loss.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="ef-expense" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Monthly essential expenses
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Rent/EMI, groceries, bills, school fees, medicine</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
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
                      className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
              {expenseWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{expenseWords}</div>}
              <input
                type="range"
                min="0"
                max="500000"
                step="5000"
                autoComplete="off"
                value={Math.min(500000, Math.max(0, parsedExpense))}
                onChange={(e) => setExpenseInput(formatIndianNumber(Number(e.target.value)))}
                style={getSliderTrackStyle(expensePercent)}
                className="financial-slider"
              />
            </div>

            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <label className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                Coverage horizon (months)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "3 Mo (Dual Income)", val: 3 },
                  { label: "6 Mo (Standard)", val: 6 },
                  { label: "9 Mo (Single Income)", val: 9 },
                  { label: "12 Mo (Business)", val: 12 },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.val}
                    onClick={() => setMonthsInput(m.val)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border text-center ${
                      monthsInput === m.val
                        ? "bg-[var(--calc-accent)] border-[var(--calc-accent)] text-white font-bold shadow-xs"
                        : "bg-[var(--calc-card-bg)] border-[var(--calc-border)] text-[var(--calc-text-secondary)] hover:text-[var(--calc-text-primary)]"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="ef-savings" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Current liquid savings already set aside
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Savings account balance, sweep FDs, liquid funds</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
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
                      className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
              {savingsWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{savingsWords}</div>}
              <input
                type="range"
                min="0"
                max="2000000"
                step="10000"
                autoComplete="off"
                value={Math.min(2000000, Math.max(0, parsedSavings))}
                onChange={(e) => setCurrentSavingsInput(formatIndianNumber(Number(e.target.value)))}
                style={getSliderTrackStyle(savingsPercent)}
                className="financial-slider"
              />
            </div>
          </div>

          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">
                Total Recommended Emergency Fund ({monthsInput} Months)
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-text-primary)] tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result.requiredEmergencyFund))}
              </span>
              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-[var(--calc-text-secondary)]">
                  <span>Fund Progress</span>
                  <span className="font-bold text-[var(--calc-text-primary)]">{coverageProgress.toFixed(0)}% Funded</span>
                </div>
                <div className="w-full bg-[var(--calc-track-bg)] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[var(--calc-accent)] h-full rounded-full transition-all" style={{ width: `${coverageProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Already Saved</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result.currentSavings))}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Additional Savings Needed</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">₹{formatIndianNumber(Math.round(result.additionalSavingsNeeded))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          <div className="lg:col-span-8 space-y-10">
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

          <div className="lg:col-span-4 lg:sticky lg:top-20">
            <RelatedCalculators currentRoute="/calculators/emergency-fund-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
