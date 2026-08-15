"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculatePrepayment } from "@/lib/financial/loans/prepayment";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";

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
    question: "What is loan part-prepayment?",
    answer:
      "Loan part-prepayment refers to paying a lump-sum amount toward your outstanding loan principal before the scheduled tenure ends, over and above your regular monthly EMIs.",
  },
  {
    question: "Is it better to reduce loan tenure or reduce EMI when prepaying?",
    answer:
      "Choosing to reduce loan tenure (while keeping your monthly EMI amount fixed) saves significantly more total interest because you extinguish the remaining debt faster.",
  },
  {
    question: "Are there penalties for home loan prepayment in India?",
    answer:
      "No. As per Reserve Bank of India (RBI) directives, commercial banks and housing finance companies cannot levy any prepayment or foreclosure charges on floating-rate home loans availed by individual borrowers.",
  },
  {
    question: "How does a prepayment save interest?",
    answer:
      "Every rupee you prepay is subtracted directly from the outstanding principal balance. Since interest is calculated monthly on the principal, reducing the principal immediately lowers all future monthly interest charges.",
  },
  {
    question: "When is the best time during loan tenure to make prepayments?",
    answer:
      "Making prepayments early in the loan tenure (during the first 3 to 7 years) yields maximum interest savings because the outstanding loan balance and interest component are at their highest.",
  },
  {
    question: "Can I make multiple prepayments in a year?",
    answer:
      "Yes. Most Indian banks allow borrowers to make multiple part-prepayments throughout the year through online banking or branch visits without restrictions.",
  },
  {
    question: "What is the 1-extra-EMI-per-year strategy?",
    answer:
      "Paying just 1 additional EMI every calendar year toward your principal can reduce a standard 20-year home loan tenure by approximately 3 to 4 years and save lakhs in interest.",
  },
  {
    question: "How does loan prepayment impact tax deductions under Section 24(b)?",
    answer:
      "While reducing total interest paid lowers your future interest tax deduction under Section 24(b), the guaranteed interest savings (e.g. 8.5% tax-free) far outweigh any tax benefit.",
  },
  {
    question: "Can I prepay fixed-rate loans without penalty?",
    answer:
      "For fixed-rate personal, auto, or business loans, lenders may levy a prepayment penalty of 2% to 5% plus GST on the prepaid amount.",
  },
  {
    question: "Does prepayment improve my credit score (CIBIL)?",
    answer:
      "Yes. Prepaying debt reduces your overall credit utilization and debt-to-income ratio, which positively impacts your CIBIL score.",
  },
];

export default function LoanPrepaymentPage() {
  const [balanceInput, setBalanceInput] = useState<string>("40,00,000");
  const [rateInput, setRateInput] = useState<string>("8.5");
  const [yearsInput, setYearsInput] = useState<string>("15");
  const [prepayInput, setPrepayInput] = useState<string>("5,00,000");
  const [prepayMethod, setPrepayMethod] = useState<"reduceTenure" | "reduceEmi">("reduceTenure");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedBalance = useMemo(() => {
    const raw = balanceInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [balanceInput]);

  const parsedRate = useMemo(() => {
    const raw = rateInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [rateInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [yearsInput]);

  const parsedPrepay = useMemo(() => {
    const raw = prepayInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Math.min(parsedBalance * 0.99, Number(raw)));
  }, [prepayInput, parsedBalance]);

  const balanceWords = useMemo(() => numberToWordsIndian(parsedBalance), [parsedBalance]);
  const prepayWords = useMemo(() => numberToWordsIndian(parsedPrepay), [parsedPrepay]);
  const yearsWords = useMemo(() => formatDurationToWords(yearsInput), [yearsInput]);

  const result = useMemo(() => {
    try {
      return calculatePrepayment(
        parsedBalance,
        parsedRate / 100,
        parsedYears * 12,
        parsedPrepay,
        prepayMethod
      );
    } catch {
      return null;
    }
  }, [parsedBalance, parsedRate, parsedYears, parsedPrepay, prepayMethod]);

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
          <span className="text-[var(--foreground)] font-medium">Loan Prepayment Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Zap className="h-4 w-4" />
            <span>Debt Acceleration & Interest Savings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Loan Prepayment Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate how much interest you can save and how many months or years you can cut off your loan tenure by making a part-prepayment on your home or personal loan.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-12">
          {/* Form Controls */}
          <div className="md:col-span-7 h-full bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Mode Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                Prepayment Strategy
              </label>
              <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-bold text-xs">
                <button
                  onClick={() => setPrepayMethod("reduceTenure")}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    prepayMethod === "reduceTenure" ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Reduce Tenure (Maximum Savings)
                </button>
                <button
                  onClick={() => setPrepayMethod("reduceEmi")}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    prepayMethod === "reduceEmi" ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Reduce Monthly EMI
                </button>
              </div>
            </div>

            {/* Input 1: Outstanding Loan Balance */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="lp-balance" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Outstanding Principal Balance (₹)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Current remaining loan principal</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="lp-balance"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={balanceInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setBalanceInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {balanceWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{balanceWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="20000000"
                step="50000"
                autoComplete="off"
                value={Math.min(20000000, Math.max(0, parsedBalance))}
                onChange={(e) => setBalanceInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 2: Prepayment Lump Sum */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="lp-prepay" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Part-Prepayment Lump Sum (₹)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Extra payment toward principal</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="lp-prepay"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={prepayInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setPrepayInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {prepayWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{prepayWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(100000, parsedBalance)}
                step="10000"
                autoComplete="off"
                value={Math.min(parsedBalance, Math.max(0, parsedPrepay))}
                onChange={(e) => setPrepayInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 3: Interest Rate */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="lp-rate" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Interest Rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Annual loan interest rate</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="lp-rate"
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
                min="1"
                max="20"
                step="0.1"
                autoComplete="off"
                value={Math.min(20, Math.max(1, parsedRate))}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 4: Remaining Tenure */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="lp-years" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Remaining Loan Tenure (Years)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Time left on loan</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <input
                      id="lp-years"
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
                max="30"
                step="1"
                autoComplete="off"
                value={Math.min(30, Math.max(0, parsedYears))}
                onChange={(e) => setYearsInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>
          </div>

          {/* Output Card */}
          <div className="md:col-span-5 h-full bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Total Interest Saved</span>
              <span className="text-3xl sm:text-4xl font-black text-teal-700 dark:text-teal-400 tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result?.interestSavings ?? 0))}
              </span>
              {prepayMethod === "reduceTenure" && result?.tenureReductionMonths !== undefined && (
                <span className="text-xs font-semibold text-neutral-900 dark:text-white mt-1 block">
                  Loan closes {(result.tenureReductionMonths / 12).toFixed(1)} years ({result.tenureReductionMonths} months) earlier!
                </span>
              )}
              {prepayMethod === "reduceEmi" && result?.newMonthlyEmi !== undefined && (
                <span className="text-xs font-semibold text-neutral-900 dark:text-white mt-1 block">
                  New Monthly EMI: ₹{formatIndianNumber(Math.round(result.newMonthlyEmi))} / month
                </span>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Original Total Interest</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(result?.originalSchedule.totalInterest ?? 0))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">New Total Interest</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(result?.newSchedule.totalInterest ?? 0))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--border)] font-bold text-sm">
                <span>New Total Loan Cost</span>
                <span className="tabular-nums">₹{formatIndianNumber(Math.round(result?.newSchedule.totalPayment ?? 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Loan Prepayment Calculator?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A <strong>Loan Prepayment Calculator</strong> helps borrowers estimate the substantial financial savings achieved by paying a lump sum toward their loan principal. It calculates the exact reduction in total interest payable and shows how much earlier your loan will close if you choose to reduce your tenure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Reduce Tenure vs Reduce EMI: Which Is Better?</h2>
              <div className="overflow-x-auto">
                <table className="financial-table text-xs w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left">Strategy</th>
                      <th className="px-4 py-3 text-left">How It Works</th>
                      <th className="px-4 py-3 text-left">Total Interest Savings</th>
                      <th className="px-4 py-3 text-left">Best For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Reduce Tenure (Recommended)</td>
                      <td className="px-4 py-2.5">Keep monthly EMI same, shorten tenure</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-bold">Maximum (saves lakhs in interest)</td>
                      <td className="px-4 py-2.5">Borrowers with stable monthly cash flow</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Reduce EMI</td>
                      <td className="px-4 py-2.5">Keep tenure same, lower monthly EMI</td>
                      <td className="px-4 py-2.5 text-[var(--text-secondary)]">Moderate</td>
                      <td className="px-4 py-2.5">Borrowers needing immediate monthly budget relief</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Prepayment Calculation Example</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Consider an outstanding home loan balance of ₹40 Lakhs at <strong>8.5% p.a.</strong> with 15 years remaining. Making a single lump-sum prepayment of <strong>₹5,00,000</strong> and choosing to reduce tenure results in:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-[var(--text-secondary)]">Interest Saved over Remaining Life</span>
                  <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹7,83,492</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-[var(--text-secondary)]">Tenure Cut</span>
                  <span className="font-bold tabular-nums">41 Months (~3.4 Years earlier!)</span>
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
            <RelatedCalculators currentRoute="/calculators/loan-prepayment-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
