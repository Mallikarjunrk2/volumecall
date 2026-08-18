"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateRd } from "@/lib/financial/fixedIncome/rd";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { Landmark, ChevronDown, ChevronUp } from "lucide-react";

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
    question: "What is a Recurring Deposit (RD)?",
    answer:
      "A Recurring Deposit (RD) is a special term deposit offered by banks and the Post Office in India that allows people to deposit a fixed amount every month for a predetermined period and earn guaranteed interest compounded quarterly.",
  },
  {
    question: "How is RD interest calculated in Indian banks?",
    answer:
      "Indian banks calculate RD interest based on Reserve Bank of India (RBI) guidelines using quarterly compounding. Each monthly installment earns compound interest for the exact number of months remaining until maturity.",
  },
  {
    question: "What is the difference between RD and SIP?",
    answer:
      "In an RD, your capital is deposited into a bank with a fixed, guaranteed interest rate and zero market risk. In a mutual fund SIP, your monthly installment is invested in market-linked equities or bonds with variable returns and higher long-term wealth potential.",
  },
  {
    question: "What is the minimum tenure for a Recurring Deposit?",
    answer:
      "Bank RDs generally have a minimum tenure of 6 months up to a maximum of 10 years (120 months). Post Office RDs have a standard 5-year tenure.",
  },
  {
    question: "Is TDS applicable on RD interest?",
    answer:
      "Yes. Under Section 194A of the Income Tax Act, banks deduct 10% TDS if total interest from RDs and FDs across branches exceeds ₹40,000 per financial year (₹50,000 for senior citizens).",
  },
  {
    question: "Can I miss or skip an RD monthly installment?",
    answer:
      "Skipping an installment incurs a small penalty (typically ₹1 to ₹2 per ₹100 per month). If consecutive installments are missed, the bank may prematurely close the RD account.",
  },
  {
    question: "Can I withdraw money prematurely from an RD?",
    answer:
      "Yes, premature closure of an RD is allowed, subject to a penalty of 0.50% to 1.00% reduction in the applicable interest rate for the period the deposit was maintained.",
  },
  {
    question: "Do senior citizens get preferential rates on RDs?",
    answer:
      "Yes, most Indian banks offer an additional 0.50% to 0.75% per annum on RDs for senior citizens aged 60 and above.",
  },
  {
    question: "Are Post Office RDs different from Bank RDs?",
    answer:
      "Post Office RDs are sovereign-backed with rates fixed quarterly by the Ministry of Finance and feature a mandatory 5-year tenure, whereas bank RDs offer flexible tenures from 6 months to 10 years.",
  },
  {
    question: "Can I take a loan against my Recurring Deposit?",
    answer:
      "Yes, most banks permit loans or overdraft facilities up to 80%–90% of the accumulated RD value at an interest rate 1%–2% above the RD rate.",
  },
];

export default function RdCalculatorPage() {
  const [monthlyInput, setMonthlyInput] = useState<string>("5,000");
  const [rateInput, setRateInput] = useState<string>("7.0");
  const [monthsInput, setMonthsInput] = useState<string>("36");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedMonthly = useMemo(() => {
    const raw = monthlyInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [monthlyInput]);

  const parsedRate = useMemo(() => {
    const raw = rateInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [rateInput]);

  const parsedMonths = useMemo(() => {
    const raw = monthsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [monthsInput]);

  const monthlyWords = useMemo(() => numberToWordsIndian(parsedMonthly), [parsedMonthly]);

  // Using single source of truth fixedIncome/rd.ts
  const result = useMemo(() => {
    return calculateRd(
      parsedMonthly,
      parsedRate / 100,
      parsedMonths,
      "quarterly"
    );
  }, [parsedMonthly, parsedRate, parsedMonths]);

  const monthlyPercent = Math.min(100, Math.max(0, (parsedMonthly / 500000) * 100));
  const ratePercent = Math.min(100, Math.max(0, (parsedRate / 15) * 100));
  const monthsPercent = Math.min(100, Math.max(0, (parsedMonths / 120) * 100));

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
          <span className="text-[var(--foreground)] font-medium">RD Calculator</span>
        </div>

        {/* Page Title & Header */}
        <div className="mb-6 max-w-3xl">
          <div className="flex items-center space-x-2 text-[var(--calc-accent)] font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Landmark className="h-3.5 w-3.5" />
            <span>Guaranteed Monthly Savings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Recurring Deposit (RD) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Calculate maturity values and total interest earned on your monthly recurring deposits with Indian banks and Post Office using RBI quarterly compounding.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-10">
          <div className="lg:col-span-7 h-full bg-[var(--calc-card-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="rd-monthly" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Monthly installment
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Fixed sum deposited every month</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                    <span className="text-sm font-medium text-[var(--calc-text-muted)] mr-1.5 select-none">₹</span>
                    <input
                      id="rd-monthly"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={monthlyInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setMonthlyInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-32 sm:w-40 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
              {monthlyWords && <div className="text-xs font-medium text-[var(--calc-accent)] text-right">{monthlyWords}</div>}
              <input
                type="range"
                min="0"
                max="500000"
                step="1000"
                autoComplete="off"
                value={Math.min(500000, Math.max(0, parsedMonthly))}
                onChange={(e) => setMonthlyInput(formatIndianNumber(Number(e.target.value)))}
                style={getSliderTrackStyle(monthlyPercent)}
                className="financial-slider"
              />
            </div>

            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="rd-rate" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Interest rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Bank or Post Office contracted annual interest rate</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="rd-rate"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
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

            <div className="space-y-3 pt-5 border-t border-[var(--calc-border)]">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <label htmlFor="rd-tenure" className="text-[15px] font-semibold text-[var(--calc-text-primary)] block">
                    Tenure (months)
                  </label>
                  <span className="text-[11px] text-[var(--calc-text-muted)]">Total deposit duration</span>
                </div>
                <div className="flex items-center rounded-lg border border-[var(--calc-border-input)] bg-[var(--calc-input-bg)] px-3 py-1.5 focus-within:border-[var(--calc-accent)] focus-within:ring-1 focus-within:ring-[var(--calc-accent)] transition-all">
                  <input
                    id="rd-tenure"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={monthsInput}
                    onChange={(e) => setMonthsInput(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-20 sm:w-28 bg-transparent text-right text-base sm:text-lg font-bold text-[var(--calc-text-primary)] focus:outline-none tabular-nums"
                  />
                  <span className="text-sm font-medium text-[var(--calc-text-muted)] ml-1.5 select-none">Mo</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="1"
                autoComplete="off"
                value={Math.min(120, Math.max(0, parsedMonths))}
                onChange={(e) => setMonthsInput(e.target.value)}
                style={getSliderTrackStyle(monthsPercent)}
                className="financial-slider"
              />
            </div>
          </div>

          <div className="lg:col-span-5 h-full bg-[var(--calc-result-bg)] border border-[var(--calc-border)] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 min-h-[360px]">
            <div>
              <span className="text-[11px] font-semibold text-[var(--calc-text-muted)] uppercase tracking-wider block">Estimated Maturity Amount</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[var(--calc-text-primary)] tabular-nums block mt-1">
                ₹{formatIndianNumber(Math.round(result.maturityAmount))}
              </span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--calc-border)] text-xs font-semibold">
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Amount Deposited</span>
                <span className="font-bold text-[var(--calc-text-primary)] tabular-nums">₹{formatIndianNumber(Math.round(result.totalInvested))}</span>
              </div>
              <div className="flex justify-between text-[var(--calc-text-secondary)]">
                <span className="font-medium">Total Interest Earned</span>
                <span className="font-bold text-[var(--calc-accent)] tabular-nums">₹{formatIndianNumber(Math.round(result.interestEarned))}</span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-[var(--calc-border)] text-[var(--calc-text-secondary)]">
                <span className="font-medium">Compounding Basis</span>
                <span className="font-bold text-[var(--calc-text-primary)]">Quarterly (RBI Banking Standard)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Recurring Deposit (RD)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A <strong>Recurring Deposit (RD)</strong> is a structured savings scheme offered by Indian commercial banks and the India Post Office. It enables individuals to deposit a predetermined sum of money every month for a fixed tenure (from 6 months up to 10 years) at a guaranteed interest rate.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                Unlike a Fixed Deposit which requires a large lump sum upfront, an RD is designed for salaried earners who wish to build a guaranteed corpus through disciplined monthly contributions without exposing their principal to equity market volatility.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does an RD Calculator Work?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                An RD calculator models the precise compound interest accrued on every individual monthly deposit:
              </p>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>First Installment:</strong> Compounds interest for the full tenure of <em>n</em> months.</li>
                <li><strong>Second Installment:</strong> Compounds interest for <em>n - 1</em> months.</li>
                <li><strong>Final Installment:</strong> Compounds interest for 1 month.</li>
              </ol>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-3">
                By summing the compound values of all installments, the calculator provides the exact maturity payout.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">RD Compound Interest Formula</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                In India, banks compound RD interest on a quarterly basis. The standard mathematical formula for RD maturity value is:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">M = P × [ (1 + i)<sup>n</sup> - 1 ] / [ 1 - (1 + i)<sup>-1/3</sup> ]</div>
                <div className="text-[11px] text-[var(--text-secondary)] font-sans">
                  Where <strong>M</strong> = Maturity Value, <strong>P</strong> = Monthly Installment, <strong>i</strong> = Quarterly Interest Rate (R / 400), and <strong>n</strong> = Number of Quarters (Tenure in Months / 3).
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Key Benefits of Recurring Deposits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-neutral-50/50 dark:bg-[#121212]/40 border border-[var(--border)] rounded-xl space-y-1">
                  <h3 className="font-bold text-neutral-900 dark:text-white">Guaranteed Payout</h3>
                  <p className="text-[var(--text-secondary)]">Interest rates are locked in at opening, fully insulating your capital from interest rate cycles.</p>
                </div>
                <div className="p-4 bg-neutral-50/50 dark:bg-[#121212]/40 border border-[var(--border)] rounded-xl space-y-1">
                  <h3 className="font-bold text-neutral-900 dark:text-white">Disciplined Savings</h3>
                  <p className="text-[var(--text-secondary)]">Automated monthly auto-debits foster structured wealth accumulation for short-term goals.</p>
                </div>
                <div className="p-4 bg-neutral-50/50 dark:bg-[#121212]/40 border border-[var(--border)] rounded-xl space-y-1">
                  <h3 className="font-bold text-neutral-900 dark:text-white">Low Minimum Deposit</h3>
                  <p className="text-[var(--text-secondary)]">Start with as little as ₹100/month at Post Office or major public and private sector banks.</p>
                </div>
                <div className="p-4 bg-neutral-50/50 dark:bg-[#121212]/40 border border-[var(--border)] rounded-xl space-y-1">
                  <h3 className="font-bold text-neutral-900 dark:text-white">Senior Citizen Premium</h3>
                  <p className="text-[var(--text-secondary)]">Senior citizens enjoy an extra 0.50% to 0.75% p.a. interest rate across all tenure options.</p>
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
            <RelatedCalculators currentRoute="/calculators/rd-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
