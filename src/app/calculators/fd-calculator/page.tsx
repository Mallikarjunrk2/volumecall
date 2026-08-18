"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateFd } from "@/lib/financial/fixedIncome/fd";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { CompoundingFrequency } from "@/lib/financial/types";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";

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
    question: "What is a Fixed Deposit (FD) calculator?",
    answer:
      "An FD calculator is a financial tool that computes the maturity amount and total interest earned on a bank fixed deposit based on deposit amount, interest rate, tenure, and compounding frequency.",
  },
  {
    question: "How is compound interest calculated on bank FDs in India?",
    answer:
      "In India, commercial banks compound FD interest on a quarterly basis (4 times a year). The formula used is A = P × (1 + r/4)^(4 × t), where P is principal, r is nominal annual interest rate, and t is tenure in years.",
  },
  {
    question: "What is the difference between Cumulative and Non-Cumulative FD?",
    answer:
      "In a Cumulative FD, interest is reinvested every quarter and paid out with the principal at maturity, maximizing compound growth. In a Non-Cumulative FD, interest is paid out periodically (monthly, quarterly, or annually) as regular income.",
  },
  {
    question: "Do senior citizens get higher FD interest rates?",
    answer:
      "Yes, Indian banks typically offer 0.50% to 0.75% additional interest per annum to senior citizens (aged 60 and above) across most tenure buckets.",
  },
  {
    question: "How is FD interest taxed in India?",
    answer:
      "FD interest is fully taxable as 'Income from Other Sources' at your applicable income tax slab rate. Banks deduct 10% TDS if interest income exceeds ₹40,000 per year (₹50,000 for senior citizens).",
  },
  {
    question: "Are bank fixed deposits safe?",
    answer:
      "Yes. Bank deposits in all scheduled commercial and cooperative banks in India are insured up to ₹5,0,000 per depositor per bank by the DICGC (Deposit Insurance and Credit Guarantee Corporation, an RBI subsidiary).",
  },
  {
    question: "What happens if I break my FD before maturity?",
    answer:
      "Premature withdrawal of an FD is allowed by most banks, but is subject to a penalty (typically 0.50% to 1.00% lower interest rate than the applicable contracted rate for the period held).",
  },
  {
    question: "What is a 5-Year Tax Saver FD?",
    answer:
      "A Tax Saver FD has a mandatory 5-year lock-in and offers tax deduction under Section 80C up to ₹1.5 Lakh per financial year. Premature withdrawal or loan against tax-saving FDs is not permitted.",
  },
  {
    question: "Can I take a loan against my Fixed Deposit?",
    answer:
      "Yes. Most banks permit loans or overdraft facilities up to 90%–95% of your FD balance at an interest rate typically 1%–2% higher than the FD rate.",
  },
  {
    question: "Which compounding frequency gives higher FD returns?",
    answer:
      "More frequent compounding (e.g. monthly vs quarterly vs annual) yields slightly higher effective returns. In India, quarterly compounding is standard for cumulative bank FDs.",
  },
];

export default function FdCalculatorPage() {
  const [principalInput, setPrincipalInput] = useState<string>("1,00,000");
  const [rateInput, setRateInput] = useState<string>("7.5");
  const [yearsInput, setYearsInput] = useState<string>("5");
  const [frequency] = useState<CompoundingFrequency>("quarterly");
  const [isCumulative, setIsCumulative] = useState<boolean>(true);
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
    return calculateFd(
      parsedPrincipal,
      parsedRate / 100,
      parsedYears,
      frequency,
      isCumulative
    );
  }, [parsedPrincipal, parsedRate, parsedYears, frequency, isCumulative]);

  const principalPercent = Math.min(100, Math.max(0, (parsedPrincipal / 10000000) * 100));
  const ratePercent = Math.min(100, Math.max(0, (parsedRate / 15) * 100));
  const yearsPercent = Math.min(100, Math.max(0, (parsedYears / 20) * 100));

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
          <span className="text-[var(--foreground)] font-medium">FD Calculator</span>
        </div>

        {/* Page Title & Intro */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Fixed Income & Savings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Fixed Deposit (FD) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate maturity amounts, quarterly compound interest earned, and regular periodic payouts for bank fixed deposits.
          </p>
        </div>

        {/* Top Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          {/* Form Controls */}
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            {/* Type Switcher: Cumulative vs Non-Cumulative */}
            <div className="space-y-2">
              <label className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                FD payout structure
              </label>
              <div className="inline-flex p-1 bg-[var(--bg-subtle)] border border-[var(--calc-border)] rounded-lg font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => setIsCumulative(true)}
                  className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    isCumulative ? "bg-[var(--calc-card-bg)] text-[var(--calc-accent)] font-bold shadow-xs" : "text-[var(--calc-text-secondary)] hover:text-[var(--calc-text-primary)]"
                  }`}
                >
                  Cumulative FD (Reinvestment)
                </button>
                <button
                  type="button"
                  onClick={() => setIsCumulative(false)}
                  className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                    !isCumulative ? "bg-[var(--calc-card-bg)] text-[var(--calc-accent)] font-bold shadow-xs" : "text-[var(--calc-text-secondary)] hover:text-[var(--calc-text-primary)]"
                  }`}
                >
                  Non-Cumulative (Regular Payout)
                </button>
              </div>
            </div>

            {/* Input 1: Principal */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="fd-principal" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Deposit amount
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Initial lump sum deposited</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                    <input
                      id="fd-principal"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={principalInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setPrincipalInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
              {principalWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{principalWords}</div>}
              <input
                type="range"
                min="0"
                max="10000000"
                step="10000"
                autoComplete="off"
                value={Math.min(10000000, Math.max(0, parsedPrincipal))}
                onChange={(e) => setPrincipalInput(formatIndianNumber(Number(e.target.value)))}
                style={getSliderTrackStyle(principalPercent)}
                className="financial-slider"
              />
            </div>

            {/* Input 2: Rate */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="fd-rate" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Interest rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Bank contracted annual interest rate</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="fd-rate"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={rateInput}
                    onChange={(e) => {
                      let clean = e.target.value.replace(/[^0-9.]/g, "");
                      const parts = clean.split(".");
                      if (parts.length > 2) clean = parts[0] + "." + parts.slice(1).join("");
                      setRateInput(clean);
                    }}
                    className="w-20 sm:w-28 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                autoComplete="off"
                value={Math.min(15, Math.max(0, parsedRate))}
                onChange={(e) => setRateInput(e.target.value)}
                style={getSliderTrackStyle(ratePercent)}
                className="financial-slider"
              />
            </div>

            {/* Input 3: Duration */}
            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="fd-years" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Tenure (years)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Fixed deposit duration</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <input
                      id="fd-years"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={yearsInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setYearsInput(clean);
                      }}
                      className="w-20 sm:w-28 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">Yr</span>
                  </div>
                </div>
              </div>
              {yearsWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{yearsWords}</div>}
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                autoComplete="off"
                value={Math.min(20, Math.max(0, parsedYears))}
                onChange={(e) => setYearsInput(e.target.value)}
                style={getSliderTrackStyle(yearsPercent)}
                className="financial-slider"
              />
            </div>
          </div>

          {/* Output Card */}
          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">
                {isCumulative ? "Maturity Amount (at End of Tenure)" : "Principal Returned at Maturity"}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-text-primary)] tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result.maturityAmount))}
              </span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Principal Deposited</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result.principal))}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Interest Earned</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">₹{formatIndianNumber(Math.round(result.interestEarned))}</span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-[var(--calc-border)] text-[var(--calc-text-secondary)]">
                <span className="font-medium">Compounding Convention</span>
                <span className="font-bold text-[var(--calc-text-primary)]">Quarterly (4x / year)</span>
              </div>
              {!isCumulative && result.periodicPayout !== undefined && (
                <div className="flex justify-between pt-2 border-t border-[var(--calc-border)] text-[var(--calc-text-secondary)]">
                  <span className="font-medium">Periodic Payout (per quarter)</span>
                  <span className="font-bold tabular-nums text-[var(--calc-accent)]">₹{formatIndianNumber(Math.round(result.periodicPayout))}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comprehensive Educational Content & FAQs Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          {/* Left Column: Educational Content & FAQs */}
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Fixed Deposit (FD)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A <strong>Fixed Deposit (FD)</strong> is a traditional financial instrument provided by banks and Non-Banking Financial Companies (NBFCs) in India where an investor deposits a lump sum for a predetermined period at a guaranteed, fixed interest rate.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                Unlike market-linked instruments (like mutual funds or stocks), bank fixed deposits offer 100% capital safety and assured returns unaffected by market movements. Furthermore, deposits across scheduled banks in India are protected up to ₹5 Lakh per depositor by the <strong>DICGC</strong> (an RBI subsidiary).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does an FD Calculator Work?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                An FD calculator uses your deposit principal, interest rate, and tenure to compute the final returns based on standard Indian banking compounding rules:
              </p>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Cumulative Option:</strong> Interest is calculated and added to your principal every quarter, compounding over the full tenure and paid at maturity.</li>
                <li><strong>Non-Cumulative Option:</strong> Interest is calculated as simple periodic yield and paid directly into your savings account each month or quarter.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Is Fixed Deposit Interest Calculated?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                For standard <strong>Cumulative FDs</strong> compounded quarterly in Indian banks:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">A = P × (1 + r / n)<sup>(n × t)</sup></div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>A</strong> = Final maturity amount payable</div>
                  <div><strong>P</strong> = Principal deposit amount</div>
                  <div><strong>r</strong> = Nominal annual interest rate (e.g. 0.075 for 7.5%)</div>
                  <div><strong>n</strong> = Compounding frequency per year (n = 4 for quarterly compounding)</div>
                  <div><strong>t</strong> = Deposit duration in years</div>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                For <strong>Non-Cumulative FDs</strong>, interest is paid out periodically: <code className="text-xs bg-neutral-100 dark:bg-[#1a1a1a] px-1 py-0.5 rounded">Periodic Payout = (P × r) / n</code>, and the original principal <strong>P</strong> is returned at maturity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Fixed Deposit Calculation Example</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Let us compare a 5-year ₹1,00,000 bank deposit at <strong>7.5% p.a.</strong> under both modes:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal mb-3">
                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-2">
                  <span className="font-bold text-neutral-900 dark:text-white text-sm block">Cumulative FD (Reinvestment)</span>
                  <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                    <span className="text-[var(--text-secondary)]">Deposit Principal</span>
                    <span className="font-bold">₹1,00,000</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                    <span className="text-[var(--text-secondary)]">Total Compound Interest</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">₹44,995</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1">
                    <span>Maturity Amount</span>
                    <span>₹1,44,995</span>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-xl space-y-2">
                  <span className="font-bold text-neutral-900 dark:text-white text-sm block">Non-Cumulative FD (Payout)</span>
                  <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                    <span className="text-[var(--text-secondary)]">Quarterly Payout</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">₹1,875 / quarter</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-1.5">
                    <span className="text-[var(--text-secondary)]">Total Interest Paid</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">₹37,500</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1">
                    <span>Principal Returned</span>
                    <span>₹1,00,000</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Quarterly compounding in the cumulative option generates <strong>₹7,495 in extra interest</strong> because accrued interest is reinvested every 3 months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How to Use the FD Calculator</h2>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Select Payout Option:</strong> Choose &apos;Cumulative&apos; for maximum growth or &apos;Non-Cumulative&apos; for regular income.</li>
                <li><strong>Enter Principal Deposit:</strong> Type the initial amount you want to place in the fixed deposit.</li>
                <li><strong>Enter Interest Rate:</strong> Input the contracted annual interest rate offered by your bank (add 0.50% if senior citizen).</li>
                <li><strong>Set Tenure in Years:</strong> Select the lock-in duration.</li>
                <li><strong>View Maturity Breakdown:</strong> Review your total interest earned, final payout, and effective yield.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Cumulative FD vs Non-Cumulative FD</h2>
              <div className="overflow-x-auto">
                <table className="financial-table text-xs w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left">Parameter</th>
                      <th className="px-4 py-3 text-left">Cumulative FD</th>
                      <th className="px-4 py-3 text-left">Non-Cumulative FD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Interest Payout</td>
                      <td className="px-4 py-2.5">Paid at maturity along with principal</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Paid monthly, quarterly, or annually</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Compounding Benefit</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Full quarterly compounding</td>
                      <td className="px-4 py-2.5">No compounding (simple interest)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Best Suited For</td>
                      <td className="px-4 py-2.5">Wealth accumulation & long-term goals</td>
                      <td className="px-4 py-2.5">Retirees needing monthly pension income</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Important Tax & Regulatory Factors</h2>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
                <p>
                  <strong>1. Income Tax Slab:</strong> FD interest is added to your total income under &apos;Income from Other Sources&apos; and taxed at your marginal slab rate (e.g. 10%, 20%, 30%).
                </p>
                <p>
                  <strong>2. TDS Deductions:</strong> Banks deduct 10% TDS if your total annual FD interest exceeds ₹40,000 (₹50,000 for senior citizens). If total income is below the taxable threshold, submit Form 15G / 15H to avoid TDS.
                </p>
                <p>
                  <strong>3. Premature Penalties:</strong> Breaking an FD before maturity incurs a penalty of 0.50%–1.00% lower interest.
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
            <RelatedCalculators currentRoute="/calculators/fd-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
