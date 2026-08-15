"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateSwp } from "@/lib/financial/investments/swp";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Wallet, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

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
    question: "What is a Systematic Withdrawal Plan (SWP)?",
    answer:
      "A Systematic Withdrawal Plan (SWP) is a mutual fund facility that allows investors to withdraw a fixed sum of money at regular intervals (usually monthly) while the remaining balance continues to compound and generate returns.",
  },
  {
    question: "How does an SWP calculator work?",
    answer:
      "An SWP calculator simulates month-by-month cash flows: adding monthly investment returns to the opening balance and subtracting your monthly withdrawal to calculate total cash paid out, remaining corpus, and how long the funds will last.",
  },
  {
    question: "Why is SWP better than Fixed Deposit (FD) for monthly income?",
    answer:
      "In an FD, all interest earned is taxed annually at your slab rate (up to 30%+). In an SWP, each withdrawal is treated as a partial redemption of units, so only the capital gain portion is taxed at LTCG rates (12.5% above ₹1.25 Lakh for equity), resulting in far higher post-tax income.",
  },
  {
    question: "Can an SWP corpus run out or get exhausted?",
    answer:
      "Yes. If your withdrawal rate is higher than the rate of return earned by your fund, your capital will gradually decrease until the corpus is exhausted. A sustainable withdrawal rate of 4%–6% per annum is recommended to preserve principal.",
  },
  {
    question: "Can my SWP corpus grow even while withdrawing money?",
    answer:
      "Yes. If your fund generates a higher return (e.g. 10% to 12% p.a.) than your withdrawal rate (e.g. 6% p.a.), your remaining corpus balance can actually increase over time while still providing steady monthly cash flow.",
  },
  {
    question: "Which mutual fund categories are best suited for SWP?",
    answer:
      "Conservative hybrid funds, balanced advantage funds, multi-asset allocation funds, and short-duration debt funds are commonly used for SWP to minimize capital fluctuation while providing steady yields.",
  },
  {
    question: "Can I change my SWP withdrawal amount later?",
    answer:
      "Yes. Investors can increase, decrease, pause, or stop their SWP instructions at any time without penalty through their mutual fund platform.",
  },
  {
    question: "What is the 4% rule in retirement SWP planning?",
    answer:
      "The 4% rule is a widely recognized financial planning guideline suggesting that withdrawing 4% of your initial retirement portfolio in Year 1 (adjusted for inflation) gives a high probability that your corpus will last 30+ years.",
  },
  {
    question: "Are SWP payouts guaranteed?",
    answer:
      "No. Unlike fixed bank deposits, mutual fund returns depend on market performance. During prolonged market downturns, withdrawals can deplete the fund faster if invested in high-volatility assets.",
  },
  {
    question: "How are taxes calculated on SWP withdrawals in India?",
    answer:
      "Each SWP installment redemptions are subject to First-In First-Out (FIFO) taxation rules. For equity mutual funds held over 12 months, capital gains above ₹1.25 Lakh per financial year are taxed at 12.5% LTCG.",
  },
];

export default function SwpCalculatorPage() {
  const [corpusInput, setCorpusInput] = useState<string>("50,00,000");
  const [withdrawalInput, setWithdrawalInput] = useState<string>("30,000");
  const [returnInput, setReturnInput] = useState<string>("8");
  const [yearsInput, setYearsInput] = useState<string>("15");
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const handleCorpusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    setCorpusInput(clean === "" ? "" : formatRawDigits(clean));
  };

  const handleWithdrawalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
    setWithdrawalInput(clean === "" ? "" : formatRawDigits(clean));
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

  const parsedCorpus = useMemo(() => {
    const raw = corpusInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [corpusInput]);

  const parsedWithdrawal = useMemo(() => {
    const raw = withdrawalInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [withdrawalInput]);

  const parsedReturn = useMemo(() => {
    const raw = returnInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [returnInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [yearsInput]);

  const corpusWords = useMemo(() => numberToWordsIndian(parsedCorpus), [parsedCorpus]);
  const withdrawalWords = useMemo(() => numberToWordsIndian(parsedWithdrawal), [parsedWithdrawal]);
  const yearsWords = useMemo(() => formatDurationToWords(yearsInput), [yearsInput]);

  // SWP Result calculation using engine
  const result = useMemo(() => {
    return calculateSwp(
      parsedCorpus,
      parsedReturn / 100,
      parsedWithdrawal,
      parsedYears
    );
  }, [parsedCorpus, parsedReturn, parsedWithdrawal, parsedYears]);

  const annualWithdrawalRate = parsedCorpus > 0 ? ((parsedWithdrawal * 12) / parsedCorpus) * 100 : 0;
  const isCorpusSustainable = result.remainingCorpus > 0 && result.monthsSurvived >= parsedYears * 12;

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
          <span className="text-[var(--foreground)] font-medium">SWP Calculator</span>
        </div>

        {/* Page Title & Intro */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Wallet className="h-4 w-4" size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Regular Cashflow & Pension Planning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Systematic Withdrawal Plan (SWP) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate regular monthly cash withdrawals from your mutual fund portfolio, estimate total income payouts, and track remaining corpus longevity over time.
          </p>
        </div>

        {/* Calculator Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Input Form Controls */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Initial Corpus */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="swp-corpus" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Total Investment Corpus
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Starting capital available for withdrawals</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="swp-corpus"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={corpusInput}
                      onChange={handleCorpusChange}
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {corpusWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{corpusWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="20000000"
                step="50000"
                autoComplete="off"
                value={Math.min(20000000, Math.max(0, parsedCorpus))}
                onChange={(e) => setCorpusInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 2: Monthly Withdrawal */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="swp-withdrawal" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Monthly Withdrawal Amount
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Target monthly cash payout required</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="swp-withdrawal"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={withdrawalInput}
                      onChange={handleWithdrawalChange}
                      className="w-36 sm:w-44 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {withdrawalWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{withdrawalWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="1000"
                autoComplete="off"
                value={Math.min(200000, Math.max(0, parsedWithdrawal))}
                onChange={(e) => setWithdrawalInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 3: Expected Return */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="swp-return" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Expected Return (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Assumed annual rate of return on remaining corpus</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="swp-return"
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
                max="25"
                step="0.5"
                autoComplete="off"
                value={Math.min(25, Math.max(0, parsedReturn))}
                onChange={(e) => setReturnInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 4: Duration */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="swp-duration" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Withdrawal Period (Years)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Number of years you plan to withdraw cash</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <input
                      id="swp-duration"
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
          <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Total Withdrawals Paid Out</span>
              <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result.totalWithdrawals))}
              </span>
              <span className={`text-xs font-semibold mt-1 block ${isCorpusSustainable ? "text-teal-700 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>
                {isCorpusSustainable ? "✓ Corpus survives selected tenure" : "⚠ Corpus exhausted before end of tenure"}
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Initial Corpus</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(result.startingCorpus))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Remaining Final Corpus</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(result.remainingCorpus))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Annual Withdrawal Rate</span>
                <span className="font-bold tabular-nums">{annualWithdrawalRate.toFixed(2)}% p.a.</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                <span className="text-teal-700 dark:text-teal-400 font-medium">Corpus Longevity</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">{result.monthsSurvived} Months ({result.yearsSurvived.toFixed(1)} Years)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Alert */}
        <div className="flex items-start space-x-2.5 p-4 bg-amber-500/5 border border-amber-200/40 dark:border-amber-900/20 rounded-xl mb-12 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Disclaimer:</strong> SWP calculator outputs are illustrative projections based on an assumed constant rate of return. Mutual fund investments are subject to market risks, and actual portfolio returns fluctuate. Capital gains taxes and exit loads are not deducted in projections.
          </p>
        </div>

        {/* Comprehensive Educational Content Sections */}
        <div className="space-y-10 mb-12 border-t border-[var(--border)] pt-10">

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Systematic Withdrawal Plan (SWP)?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              A <strong>Systematic Withdrawal Plan (SWP)</strong> is a mutual fund facility that functions as the exact inverse of a Systematic Investment Plan (SIP). While an SIP channels regular monthly savings into mutual fund units, an SWP redeems a predetermined rupee amount from your mutual fund portfolio on a set date each month and credits it directly into your bank account.
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
              The remaining balance in your mutual fund scheme remains invested in the market, continuing to generate compound growth. This makes SWP one of the most effective, tax-efficient tools for retirees, freelancers, and individuals seeking dependable monthly cash flows in India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does an SWP Calculator Work?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              An SWP calculator simulates month-by-month portfolio progression through a sequential accounting algorithm:
            </p>
            <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
              <li><strong>Record Opening Balance:</strong> Tracks the current corpus at the beginning of Month <em>m</em>.</li>
              <li><strong>Calculate Monthly Growth:</strong> Applies the monthly effective compound return rate: <code className="text-xs bg-neutral-100 dark:bg-[#1a1a1a] px-1 py-0.5 rounded">Growth = Opening Balance × Monthly Rate</code>.</li>
              <li><strong>Deduct Monthly Withdrawal:</strong> Subtracts your specified cash payout from the balance.</li>
              <li><strong>Update Closing Balance:</strong> Transfers the remaining capital to the next month&apos;s opening balance.</li>
              <li><strong>Track Longevity:</strong> Repeats this process until the specified years finish or the corpus drops to zero.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is an SWP Calculated?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              The mathematical equation for the closing balance at the end of each month <em>m</em> is:
            </p>
            <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
              <div className="font-bold text-sm">Balance<sub>m</sub> = Balance<sub>m-1</sub> × (1 + r) - W</div>
              <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                <div><strong>Balance<sub>m</sub></strong> = Remaining corpus balance at end of Month <em>m</em></div>
                <div><strong>W</strong> = Fixed monthly withdrawal amount</div>
                <div><strong>r</strong> = Monthly periodic rate of return = (1 + Annual Return)<sup>1/12</sup> - 1</div>
                <div><strong>Total Payouts</strong> = Sum of all monthly withdrawals credited to bank account</div>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              If the monthly growth generated by your remaining capital exceeds your monthly withdrawal (<code className="text-xs bg-neutral-100 dark:bg-[#1a1a1a] px-1 py-0.5 rounded">Balance × r &gt; W</code>), your principal actually grows over time. Conversely, if <code className="text-xs bg-neutral-100 dark:bg-[#1a1a1a] px-1 py-0.5 rounded">W &gt; Balance × r</code>, the corpus experiences gradual drawdown.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">SWP Calculation Example</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              Let us evaluate a practical retirement income scenario in India:
            </p>
            <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1 list-disc list-inside mb-4">
              <li><strong>Initial Retirement Corpus:</strong> ₹50,00,000 (50 Lakhs)</li>
              <li><strong>Monthly Withdrawal Amount:</strong> ₹30,000 / month (Annual: ₹3,60,000)</li>
              <li><strong>Expected Annual Return:</strong> 8% p.a. (in a Conservative Hybrid Fund)</li>
              <li><strong>Withdrawal Horizon:</strong> 15 Years (180 months)</li>
            </ul>
            <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="font-semibold text-[var(--text-secondary)]">Total Monthly Cash Withdrawn (₹30,000 × 180)</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">₹54,00,000</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="font-semibold text-[var(--text-secondary)]">Remaining Final Corpus (after 15 Years)</span>
                <span className="font-bold tabular-nums">₹57,75,420</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span>Total Value Delivered (Cash Paid + Remaining Corpus)</span>
                <span className="tabular-nums">₹1,11,75,420</span>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Remarkably, because the initial annual withdrawal rate was a prudent <strong>7.2%</strong> and the fund generated <strong>8% p.a.</strong>, the retiree withdrew ₹54 Lakhs in cash over 15 years while their remaining capital actually grew from ₹50 Lakhs to ₹57.75 Lakhs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How to Use the SWP Calculator</h2>
            <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
              <li><strong>Enter Total Corpus:</strong> Input the lump sum amount you have invested or plan to allocate in mutual funds.</li>
              <li><strong>Specify Monthly Withdrawal:</strong> Enter the monthly cash sum you need transferred to your bank account.</li>
              <li><strong>Set Expected Return Rate:</strong> Choose an assumed annualized return based on your chosen fund category (e.g. 7% to 9% for hybrid funds).</li>
              <li><strong>Set Time Horizon:</strong> Specify how many years you want this monthly income stream to run.</li>
              <li><strong>Analyze Longevity:</strong> Review your total payouts and verify whether the remaining corpus balance stays positive.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Benefits of a Systematic Withdrawal Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
              <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">High Tax Efficiency</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Unlike bank FD interest which is taxed at your highest income slab, SWP withdrawals are treated as partial capital redemptions where only the gain component is taxed.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Continued Capital Growth</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  The unwithdrawn balance remains invested in equity and debt securities, providing a natural buffer against inflation.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Predictable Monthly Cashflow</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  You receive an automated credit on a predetermined date every month, creating a smooth pension-like monthly paycheck.
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Complete Liquidity & Control</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Unlike traditional annuities with lock-ins, your remaining mutual fund corpus can be redeemed or adjusted at any time.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">SWP vs Fixed Deposit (FD) vs Dividend Income</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              Compare why retirees and income seekers in India increasingly favor SWP over traditional monthly income plans:
            </p>
            <div className="overflow-x-auto">
              <table className="financial-table text-xs w-full">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left">Feature</th>
                    <th className="px-4 py-3 text-left">Mutual Fund SWP</th>
                    <th className="px-4 py-3 text-left">Bank Fixed Deposit (FD)</th>
                    <th className="px-4 py-3 text-left">Mutual Fund Dividend Plan (IDCW)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Payout Amount</td>
                    <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Fixed & customized by investor</td>
                    <td className="px-4 py-2.5">Fixed by bank interest rate</td>
                    <td className="px-4 py-2.5">Uncertain (depends on fund AMC)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Taxation</td>
                    <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Only gain portion taxed (LTCG 12.5%)</td>
                    <td className="px-4 py-2.5">100% interest taxed at slab rate</td>
                    <td className="px-4 py-2.5">100% dividend taxed at slab rate</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Capital Growth</td>
                    <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Possible if return &gt; withdrawal</td>
                    <td className="px-4 py-2.5">Zero (principal stays static)</td>
                    <td className="px-4 py-2.5">NAV drops by dividend amount</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Inflation Protection</td>
                    <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">High (via hybrid/equity growth)</td>
                    <td className="px-4 py-2.5">Low (loses purchasing power)</td>
                    <td className="px-4 py-2.5">Moderate</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Important Factors & Longevity Considerations</h2>
            <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
              <p>
                <strong>1. Safe Withdrawal Rate (SWR):</strong> To ensure your retirement corpus lasts 25 to 30 years, aim for an initial withdrawal rate of <strong>4% to 6% per annum</strong>. Withdrawing 10% or more annually increases the risk of premature corpus depletion during market downturns.
              </p>
              <p>
                <strong>2. Sequence of Returns Risk:</strong> Experiencing sharp market declines in the first few years of retirement can severely impact corpus longevity. To mitigate this risk, maintain 1 to 2 years of living expenses in liquid debt funds.
              </p>
              <p>
                <strong>3. Volatility Management:</strong> Avoid executing SWP exclusively from high-beta small-cap funds. Conservative hybrid or balanced advantage funds provide smoother volatility and consistent withdrawal sustainability.
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
        <RelatedCalculators currentRoute="/calculators/swp-calculator" />
      </main>
      <Footer />
    </div>
  );
}
