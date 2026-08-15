"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateEmi } from "@/lib/financial/loans/emi";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Home, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from "lucide-react";

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
    question: "What is an Equated Monthly Installment (EMI)?",
    answer:
      "An Equated Monthly Installment (EMI) is a fixed monthly payment made by a borrower to a bank or lender on a specified date to repay an outstanding loan over a predetermined tenure.",
  },
  {
    question: "How is loan EMI calculated?",
    answer:
      "Loan EMI is calculated using the reducing balance formula: E = P × r × (1 + r)^n / [ (1 + r)^n - 1 ], where P is Principal Loan Amount, r is Monthly Interest Rate (Annual Rate / 12 / 100), and n is Loan Tenure in Months.",
  },
  {
    question: "How does the EMI split between interest and principal work?",
    answer:
      "In the early years of a loan, a major portion of each monthly EMI goes toward paying accrued interest, with a smaller portion reducing the principal. As the principal diminishes over time, the interest component decreases and the principal repayment component increases.",
  },
  {
    question: "What is the difference between Fixed and Floating interest rate loans?",
    answer:
      "A Fixed rate loan maintains the same interest rate and EMI throughout the tenure. A Floating rate loan is linked to a benchmark (like the RBI Repo Rate) where interest rates and EMIs or loan tenures adjust automatically as benchmark rates change.",
  },
  {
    question: "How does increasing loan tenure affect total interest paid?",
    answer:
      "Increasing the loan tenure reduces your monthly EMI, making it easier on your monthly budget, but substantially increases the cumulative interest paid to the bank over the entire loan life.",
  },
  {
    question: "Can I prepay my home loan to reduce EMI or tenure?",
    answer:
      "Yes. According to RBI guidelines, individual borrowers with floating rate home loans face zero prepayment or foreclosure penalties and can make partial prepayments to reduce their tenure or monthly EMI.",
  },
  {
    question: "What is the recommended EMI-to-Income ratio?",
    answer:
      "Financial experts generally recommend keeping total monthly EMI obligations under 40%–50% of your net take-home salary to maintain financial stability and emergency savings.",
  },
  {
    question: "Does taking a longer tenure reduce borrowing risk?",
    answer:
      "A longer tenure provides a safety cushion by keeping monthly mandatory commitments low, but you should actively make periodic prepayments to eliminate the loan early and save on interest.",
  },
  {
    question: "Are processing fees and insurance included in the EMI?",
    answer:
      "Typically, one-time processing fees, documentation charges, and stamp duties are paid upfront at loan sanction, though some lenders offer the option to bundle loan insurance into the EMI.",
  },
  {
    question: "What tax benefits are available on home loan EMIs in India?",
    answer:
      "Under the Old Tax Regime in India, borrowers can claim up to ₹1.5 Lakh per year for principal repayment under Section 80C, and up to ₹2.0 Lakh per year for interest repayment under Section 24(b).",
  },
];

export default function EmiCalculatorPage() {
  const [principalInput, setPrincipalInput] = useState<string>("50,00,000");
  const [rateInput, setRateInput] = useState<string>("8.5");
  const [yearsInput, setYearsInput] = useState<string>("20");
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

  // Using single source of truth loans/emi.ts
  const result = useMemo(() => {
    return calculateEmi(parsedPrincipal, parsedRate / 100, parsedYears);
  }, [parsedPrincipal, parsedRate, parsedYears]);

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
          <span className="text-[var(--foreground)] font-medium">EMI Calculator</span>
        </div>

        {/* Page Title & Intro */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Home className="h-4 w-4" size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Loan Installment Planning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Loan EMI Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate your monthly loan EMI, total interest payable, and total loan cost for home loans, car loans, and personal loans in India.
          </p>
        </div>

        {/* Calculator Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Loan Amount */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="emi-principal" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Loan Amount (Principal)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Total borrowed capital</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="emi-principal"
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
                  <label htmlFor="emi-rate" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Interest Rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Annual reducing balance interest rate</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="emi-rate"
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
                  <label htmlFor="emi-tenure" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Loan Tenure (Years)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Total repayment duration</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <input
                      id="emi-tenure"
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
              <span className="text-xs font-semibold text-[var(--text-secondary)] mt-1 block">
                for {parsedYears * 12} monthly installments
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Principal Amount</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(result.principal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-700 dark:text-teal-400 font-medium">Total Interest Payable</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(result.totalInterest))}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--border)] font-bold text-sm">
                <span>Total Payment (Principal + Interest)</span>
                <span className="tabular-nums">₹{formatIndianNumber(Math.round(result.totalPayment))}</span>
              </div>
            </div>

            <Link
              href="/calculators/loan-amortization-calculator"
              className="inline-flex items-center justify-between px-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[var(--border)] rounded-xl text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-neutral-50 transition-colors"
            >
              <span>View Full Month-by-Month Amortization Schedule</span>
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Comprehensive Educational Content Sections */}
        <div className="space-y-10 mb-12 border-t border-[var(--border)] pt-10">

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is an Equated Monthly Installment (EMI)?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              An <strong>Equated Monthly Installment (EMI)</strong> is a fixed monthly cash amount paid by a borrower to a bank or financial institution on a specified date each month. It repays both the principal loan amount and accrued interest in a steady, predictable schedule over a designated loan tenure.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
              EMIs are universally used in India for home loans, car loans, personal loans, and education loans. Using an EMI calculator allows borrowers to test various loan amounts and tenures to find a comfortable monthly payment before applying with lenders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does an EMI Calculator Work?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              An EMI calculator models reducing balance loan accounting using three basic inputs:
            </p>
            <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
              <li><strong>Loan Principal (P):</strong> The total amount borrowed from the bank.</li>
              <li><strong>Annual Interest Rate (R):</strong> The contracted interest rate per annum.</li>
              <li><strong>Loan Tenure (N):</strong> The repayment duration in years or months.</li>
            </ol>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
              The calculator computes the exact monthly installment, splits the total cost between principal and interest, and determines the total repayment burden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is Loan EMI Calculated?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              The standard reducing balance formula used by Indian banks and NBFCs is:
            </p>
            <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
              <div className="font-bold text-sm">E = P × r × (1 + r)<sup>n</sup> / [ (1 + r)<sup>n</sup> - 1 ]</div>
              <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                <div><strong>E</strong> = Equated Monthly Installment (EMI)</div>
                <div><strong>P</strong> = Principal Loan Amount</div>
                <div><strong>r</strong> = Monthly interest rate = (Annual Interest Rate / 12) / 100</div>
                <div><strong>n</strong> = Total number of monthly installments (Tenure in Years × 12)</div>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Our financial calculation engine (<code className="text-xs bg-neutral-100 dark:bg-[#1a1a1a] px-1 py-0.5 rounded">calculateEmi</code>) executes this exact reducing balance formula with full precision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Loan EMI Calculation Example</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              Let us evaluate a typical Indian home loan scenario:
            </p>
            <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1 list-disc list-inside mb-4">
              <li><strong>Loan Principal:</strong> ₹50,00,000 (50 Lakhs)</li>
              <li><strong>Interest Rate:</strong> 8.5% p.a. (reducing balance)</li>
              <li><strong>Loan Tenure:</strong> 20 Years (240 months)</li>
            </ul>
            <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="font-semibold text-[var(--text-secondary)]">Monthly EMI</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹43,391 / month</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="font-semibold text-[var(--text-secondary)]">Total Principal Repaid</span>
                <span className="font-bold tabular-nums">₹50,00,000</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="font-semibold text-[var(--text-secondary)]">Total Interest Paid to Bank</span>
                <span className="font-bold tabular-nums text-amber-600 dark:text-amber-400">₹54,13,879</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span>Total Loan Repayment Burden</span>
                <span className="tabular-nums">₹1,04,13,879</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Notice that over a 20-year term at 8.5%, the total interest paid (₹54.13 Lakhs) actually exceeds the original borrowed principal (₹50 Lakhs). Making occasional partial prepayments can save tens of lakhs in interest.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Home Loan vs Personal Loan vs Car Loan EMIs</h2>
            <div className="overflow-x-auto">
              <table className="financial-table text-xs w-full">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left">Loan Type</th>
                    <th className="px-4 py-3 text-left">Typical Interest Rate</th>
                    <th className="px-4 py-3 text-left">Typical Tenure</th>
                    <th className="px-4 py-3 text-left">Collateral Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Home Loan</td>
                    <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">8.3% – 9.5% p.a.</td>
                    <td className="px-4 py-2.5">15 to 30 Years</td>
                    <td className="px-4 py-2.5">Secured (Property mortgage)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Car Loan</td>
                    <td className="px-4 py-2.5">8.7% – 11.0% p.a.</td>
                    <td className="px-4 py-2.5">3 to 7 Years</td>
                    <td className="px-4 py-2.5">Secured (Vehicle hypothecation)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Personal Loan</td>
                    <td className="px-4 py-2.5">10.5% – 18.0% p.a.</td>
                    <td className="px-4 py-2.5">1 to 5 Years</td>
                    <td className="px-4 py-2.5 text-amber-600 dark:text-amber-400">Unsecured (Income-based)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Important Loan Factors to Consider</h2>
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
              <p>
                <strong>1. 50% FOIR Rule:</strong> Fixed Obligation to Income Ratio (FOIR) is used by banks to assess loan eligibility. Ensure all your EMIs combined do not exceed 40%–50% of your net monthly income.
              </p>
              <p>
                <strong>2. Floating vs Fixed Interest Rates:</strong> Floating rate loans adjust with RBI benchmark rate revisions. If the repo rate drops, your tenure or EMI decreases.
              </p>
              <p>
                <strong>3. Tax Deductions on Home Loans:</strong> Under the Old Tax Regime in India, borrowers can claim up to ₹1.5 Lakh under Section 80C for principal repayment, and up to ₹2.0 Lakh under Section 24(b) for interest paid on self-occupied property.
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
        <RelatedCalculators currentRoute="/calculators/emi-calculator" />
      </main>
      <Footer />
    </div>
  );
}
