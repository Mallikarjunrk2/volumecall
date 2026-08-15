"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { generateAmortizationSchedule } from "@/lib/financial/loans/amortization";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Banknote, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

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

interface YearlyRow {
  year: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  closingBalance: number;
}

const pageFaqItems = [
  {
    question: "What is a loan amortization schedule?",
    answer:
      "A loan amortization schedule is a complete tabular breakdown of every periodic payment over the life of a loan, detailing the exact amount allocated toward principal reduction, accrued interest, and closing balance.",
  },
  {
    question: "Why is loan interest front-loaded in the early years?",
    answer:
      "Interest is calculated on the outstanding loan balance. In the initial years, the remaining balance is large, so a large portion of your fixed monthly EMI goes toward interest. As the principal drops, monthly interest decreases.",
  },
  {
    question: "How is the monthly interest component calculated in an amortization schedule?",
    answer:
      "For any given month, Monthly Interest = Outstanding Loan Balance × (Annual Interest Rate / 12 / 100). The Principal Repayment component for that month is then equal to Monthly EMI minus Monthly Interest.",
  },
  {
    question: "Can I use an amortization schedule for income tax filing?",
    answer:
      "Yes. Indian home loan borrowers use annual amortization summaries to obtain interest certificates from banks to claim tax deductions under Section 24(b) and Section 80C.",
  },
  {
    question: "How does making early prepayments change the amortization schedule?",
    answer:
      "Any extra prepayment is deducted directly from the outstanding principal balance. This immediately reduces subsequent interest calculations, shortening the total number of amortization months significantly.",
  },
  {
    question: "What is negative amortization?",
    answer:
      "Negative amortization occurs if monthly payments are smaller than the accrued interest, causing the outstanding loan balance to grow over time instead of decreasing. Standard Indian home loans do not feature negative amortization.",
  },
  {
    question: "Does an amortization schedule change if floating interest rates increase?",
    answer:
      "Yes. If the RBI raises benchmark repo rates, banks typically extend the total number of remaining months (tenure) in the amortization schedule while keeping your EMI amount constant.",
  },
  {
    question: "What is the crossover point in loan amortization?",
    answer:
      "The crossover point is the month during the loan tenure where the monthly principal repayment amount surpasses the monthly interest payment amount.",
  },
  {
    question: "How does loan tenure impact total amortization interest?",
    answer:
      "A longer tenure spreads payments across more months, resulting in lower monthly EMIs but a far larger cumulative interest total in the amortization summary.",
  },
  {
    question: "Can I download or print the amortization schedule?",
    answer:
      "Yes, our amortization calculator generates both annual summary tables and detailed month-by-month schedules that can be reviewed or exported.",
  },
];

export default function LoanAmortizationPage() {
  const [principalInput, setPrincipalInput] = useState<string>("30,00,000");
  const [rateInput, setRateInput] = useState<string>("8.5");
  const [yearsInput, setYearsInput] = useState<string>("15");
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedPrincipal = useMemo(() => {
    const raw = principalInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [principalInput]);

  const parsedRate = useMemo(() => {
    const raw = rateInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [rateInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [yearsInput]);

  const principalWords = useMemo(() => numberToWordsIndian(parsedPrincipal), [parsedPrincipal]);
  const yearsWords = useMemo(() => formatDurationToWords(yearsInput), [yearsInput]);

  const result = useMemo(() => {
    const tenureMonths = parsedYears * 12;
    const scheduleRes = generateAmortizationSchedule(parsedPrincipal, parsedRate / 100, tenureMonths);
    const monthlyEmi = scheduleRes.rows[0]?.emi ?? 0;

    // Aggregate yearly summary
    const yearlySummary: YearlyRow[] = [];
    for (let yr = 1; yr <= parsedYears; yr++) {
      const yearRows = scheduleRes.rows.slice((yr - 1) * 12, yr * 12);
      if (yearRows.length === 0) break;
      const openingBalance = yearRows[0].openingBalance;
      const principalPaid = yearRows.reduce((acc, r) => acc + r.principal, 0);
      const interestPaid = yearRows.reduce((acc, r) => acc + r.interest, 0);
      const totalPayment = yearRows.reduce((acc, r) => acc + r.emi, 0);
      const closingBalance = yearRows[yearRows.length - 1].closingBalance;

      yearlySummary.push({
        year: yr,
        openingBalance,
        principalPaid,
        interestPaid,
        totalPayment,
        closingBalance,
      });
    }

    return {
      monthlyEmi,
      principal: parsedPrincipal,
      totalInterest: scheduleRes.totalInterest,
      totalPayment: scheduleRes.totalPayment,
      schedule: scheduleRes.rows,
      yearlySummary,
    };
  }, [parsedPrincipal, parsedRate, parsedYears]);

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
          <span className="text-[var(--foreground)] font-medium">Loan Amortization Calculator</span>
        </div>

        {/* Page Title */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Banknote className="h-4 w-4" size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Complete Payment Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Loan Amortization Schedule Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Generate an exact month-by-month and annual amortization schedule for your loan with detailed principal, interest, and remaining balance tracking.
          </p>
        </div>

        {/* Form Controls & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Principal */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="amort-principal" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Loan Amount
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Total loan principal borrowed</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="amort-principal"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={principalInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setPrincipalInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {principalWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{principalWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="20000000"
                step="50000"
                autoComplete="off"
                value={Math.min(20000000, Math.max(0, parsedPrincipal))}
                onChange={(e) => setPrincipalInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 2: Rate */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="amort-rate" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Interest Rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Annual reducing balance rate</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="amort-rate"
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
                max="25"
                step="0.1"
                autoComplete="off"
                value={Math.min(25, Math.max(0, parsedRate))}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 3: Tenure */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="amort-tenure" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Loan Tenure (Years)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Total loan repayment period</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <input
                      id="amort-tenure"
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

          {/* Right Column: Output Card */}
          <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Monthly Loan EMI</span>
              <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result.monthlyEmi))}
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Principal Repaid</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(result.principal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-700 dark:text-teal-400 font-medium">Total Interest Paid</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(result.totalInterest))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--border)] font-bold text-sm">
                <span>Total Payment</span>
                <span className="tabular-nums">₹{formatIndianNumber(Math.round(result.totalPayment))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amortization Schedule Table */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-4 mb-12 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-neutral-50">
                Amortization Schedule Breakdown
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Track how each payment reduces principal versus interest over time.
              </p>
            </div>
            <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-bold text-xs shrink-0">
              <button
                onClick={() => setViewMode("yearly")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "yearly" ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                }`}
              >
                Annual Summary
              </button>
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "monthly" ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                }`}
              >
                Monthly Schedule ({result.schedule.length} Months)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
            {viewMode === "yearly" ? (
              <table className="financial-table text-xs w-full">
                <thead className="sticky top-0 bg-neutral-50 dark:bg-[#121212] z-10">
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left">Year</th>
                    <th className="px-4 py-3 text-right">Opening Balance</th>
                    <th className="px-4 py-3 text-right">Principal Paid</th>
                    <th className="px-4 py-3 text-right">Interest Paid</th>
                    <th className="px-4 py-3 text-right">Total Payment</th>
                    <th className="px-4 py-3 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] tabular-nums">
                  {result.yearlySummary.map((yr: YearlyRow) => (
                    <tr key={yr.year} className="hover:bg-neutral-50 dark:hover:bg-[#121212]">
                      <td className="px-4 py-2.5 font-bold">Year {yr.year}</td>
                      <td className="px-4 py-2.5 text-right text-[var(--text-secondary)]">₹{formatIndianNumber(Math.round(yr.openingBalance))}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(yr.principalPaid))}</td>
                      <td className="px-4 py-2.5 text-right text-amber-600 dark:text-amber-400">₹{formatIndianNumber(Math.round(yr.interestPaid))}</td>
                      <td className="px-4 py-2.5 text-right">₹{formatIndianNumber(Math.round(yr.totalPayment))}</td>
                      <td className="px-4 py-2.5 text-right font-bold">₹{formatIndianNumber(Math.round(yr.closingBalance))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="financial-table text-xs w-full">
                <thead className="sticky top-0 bg-neutral-50 dark:bg-[#121212] z-10">
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left">Month</th>
                    <th className="px-4 py-3 text-right">Opening Balance</th>
                    <th className="px-4 py-3 text-right">Monthly EMI</th>
                    <th className="px-4 py-3 text-right">Principal Paid</th>
                    <th className="px-4 py-3 text-right">Interest Paid</th>
                    <th className="px-4 py-3 text-right">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] tabular-nums">
                  {result.schedule.map((m) => (
                    <tr key={m.month} className="hover:bg-neutral-50 dark:hover:bg-[#121212]">
                      <td className="px-4 py-2.5 font-bold">Month {m.month}</td>
                      <td className="px-4 py-2.5 text-right text-[var(--text-secondary)]">₹{formatIndianNumber(Math.round(m.openingBalance))}</td>
                      <td className="px-4 py-2.5 text-right font-medium">₹{formatIndianNumber(Math.round(m.emi))}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(m.principal))}</td>
                      <td className="px-4 py-2.5 text-right text-amber-600 dark:text-amber-400">₹{formatIndianNumber(Math.round(m.interest))}</td>
                      <td className="px-4 py-2.5 text-right font-bold">₹{formatIndianNumber(Math.round(m.closingBalance))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Comprehensive Educational Content Sections */}
        <div className="space-y-10 mb-12 border-t border-[var(--border)] pt-10">

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Loan Amortization Schedule?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              A <strong>Loan Amortization Schedule</strong> is a comprehensive financial table that outlines every periodic payment across the lifespan of a loan. It breaks down each monthly installment into the exact amount allocated toward principal repayment versus the amount absorbed by accrued interest charges, alongside the reducing balance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Why Is Loan Interest Front-Loaded?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Because monthly interest is calculated directly on the remaining loan principal, the interest burden is greatest when the loan balance is at its maximum (during the first 3 to 7 years of a 20-year loan). As monthly payments gradually reduce the principal balance, the interest charge shrinks, allowing a larger portion of each EMI to extinguish the principal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Loan Amortization Mathematical Methodology</h2>
            <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
              <div>Interest<sub>m</sub> = OpeningBalance<sub>m</sub> × (Annual Rate / 12 / 100)</div>
              <div>PrincipalPaid<sub>m</sub> = EMI - Interest<sub>m</sub></div>
              <div>ClosingBalance<sub>m</sub> = OpeningBalance<sub>m</sub> - PrincipalPaid<sub>m</sub></div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How to Use the Amortization Schedule for Financial Planning</h2>
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
              <p>
                <strong>1. Tax Deduction Certificates:</strong> You can see exact annual interest and principal payments to substantiate tax deduction claims under Section 24(b) (up to ₹2 Lakh) and Section 80C (up to ₹1.5 Lakh).
              </p>
              <p>
                <strong>2. Timing Prepayments:</strong> Prepayments made during the first 5 years save drastically more interest than prepayments made near the end of the loan tenure.
              </p>
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
        <RelatedCalculators currentRoute="/calculators/loan-amortization-calculator" />
      </main>
      <Footer />
    </div>
  );
}
