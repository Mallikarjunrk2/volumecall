"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateCompoundInterest } from "@/lib/financial/compounding/compoundInterest";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { CompoundingFrequency } from "@/lib/financial/types";
import { TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

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
    question: "What is Compound Interest?",
    answer:
      "Compound Interest is the addition of interest to the principal sum of a loan or deposit, or in other words, interest on principal plus interest accumulated over previous periods ('interest on interest').",
  },
  {
    question: "How is Compound Interest calculated?",
    answer:
      "The compound interest formula is: A = P × (1 + r / n)^(n × t), where A is Final Amount, P is Principal, r is annual interest rate (decimal), n is compounding frequency per year, and t is tenure in years.",
  },
  {
    question: "What is the difference between Simple Interest and Compound Interest?",
    answer:
      "Simple interest is calculated exclusively on the original principal throughout the term. Compound interest calculates interest on the growing balance (principal + previously earned interest), growing exponentially over time.",
  },
  {
    question: "Which compounding frequency yields the highest return?",
    answer:
      "More frequent compounding (e.g. daily > monthly > quarterly > annual) generates a higher effective annual rate (EAR) because interest is reinvested sooner.",
  },
  {
    question: "What is the Rule of 72 in compound interest?",
    answer:
      "The Rule of 72 is a quick mental math rule to estimate how long it takes an investment to double: Years to Double ≈ 72 / Interest Rate (e.g. 72 / 12% = ~6 years).",
  },
  {
    question: "How does time duration impact compounding?",
    answer:
      "Because compound interest is exponential, the true explosion of wealth occurs in the later years of an investment (the 'hockey stick' curve). Doubling your investment horizon can increase your total returns fourfold or more.",
  },
  {
    question: "What is Effective Annual Rate (EAR)?",
    answer:
      "The Effective Annual Rate (EAR) is the actual annual interest rate earned after taking into account the effects of intra-year compounding (e.g. 10% compounded monthly produces an EAR of 10.47%).",
  },
  {
    question: "Can I add regular monthly deposits to compound interest?",
    answer:
      "Yes. When you add regular periodic monthly deposits to a compounding lump sum, you create an investment annuity (like an SIP), accelerating wealth creation even faster.",
  },
  {
    question: "Does inflation reduce the benefit of compound interest?",
    answer:
      "Yes. Inflation erodes future purchasing power. To calculate real purchasing power growth, evaluate your Real Compound Rate using the Fisher equation.",
  },
  {
    question: "Which financial products in India utilize compound interest?",
    answer:
      "Public Provident Fund (PPF - annual compounding), Bank Fixed Deposits (quarterly compounding), Recurring Deposits (quarterly compounding), and Mutual Funds (daily NAV compounding).",
  },
];

export default function CompoundInterestPage() {
  const [principalInput, setPrincipalInput] = useState<string>("1,00,000");
  const [rateInput, setRateInput] = useState<string>("12");
  const [yearsInput, setYearsInput] = useState<string>("10");
  const [frequency, setFrequency] = useState<CompoundingFrequency>("annual");
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
    return calculateCompoundInterest(parsedPrincipal, parsedRate / 100, parsedYears, frequency);
  }, [parsedPrincipal, parsedRate, parsedYears, frequency]);

  const simpleInterest = parsedPrincipal * (parsedRate / 100) * parsedYears;
  const compoundingBonus = result.interest - simpleInterest;

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
          <span className="text-[var(--foreground)] font-medium">Compound Interest Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <TrendingUp className="h-4 w-4" />
            <span>Exponential Wealth Creation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Compound Interest Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate the future value of your lump sum investments and witness the power of compound growth across annual, semi-annual, quarterly, and monthly compounding frequencies.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-12">
          {/* Form Controls */}
          <div className="md:col-span-7 h-full bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Principal */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="ci-principal" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Principal Deposit
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Initial lump sum investment</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="ci-principal"
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
                max="10000000"
                step="10000"
                autoComplete="off"
                value={Math.min(10000000, Math.max(0, parsedPrincipal))}
                onChange={(e) => setPrincipalInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 2: Rate */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="ci-rate" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Interest Rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Annual compounding interest rate</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="ci-rate"
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
                step="0.1"
                autoComplete="off"
                value={Math.min(30, Math.max(0, parsedRate))}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 3: Tenure */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="ci-tenure" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Time Period (Years)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Investment duration</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <input
                      id="ci-tenure"
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

            {/* Compounding Frequency Selector */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                Compounding Frequency
              </label>
              <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-bold text-xs">
                {(["annual", "semi-annual", "quarterly", "monthly"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer capitalize ${
                      frequency === f ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {f === "semi-annual" ? "Half-Yearly" : f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Output Summary Card */}
          <div className="md:col-span-5 h-full bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Total Compound Future Value</span>
              <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result.totalAmount))}
              </span>
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 mt-1 block">
                Includes ₹{formatIndianNumber(Math.round(compoundingBonus))} from &apos;Interest on Interest&apos;
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Principal Invested</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(result.principal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-700 dark:text-teal-400 font-medium">Total Compound Interest</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹{formatIndianNumber(Math.round(result.interest))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Compounding Periods / Year</span>
                <span className="font-bold tabular-nums">{result.compoundingPeriodsPerYear}x / Year</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is Compound Interest?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <strong>Compound Interest</strong> is interest calculated on the initial principal, which also includes all of the accumulated interest from previous periods on a deposit or loan. Coined as the &apos;Eighth Wonder of the World&apos;, compounding allows your money to work for you exponentially over time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is Compound Interest Calculated?</h2>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">A = P × ( 1 + r / n )<sup>(n × t)</sup></div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>A</strong> = Final compound amount</div>
                  <div><strong>P</strong> = Principal deposit amount</div>
                  <div><strong>r</strong> = Annual interest rate (in decimal)</div>
                  <div><strong>n</strong> = Compounding frequency per year</div>
                  <div><strong>t</strong> = Investment horizon in years</div>
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
            <RelatedCalculators currentRoute="/calculators/compound-interest-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
