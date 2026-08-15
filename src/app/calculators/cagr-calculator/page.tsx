"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateCagr } from "@/lib/financial/returns/cagr";
import { formatIndianNumber } from "@/lib/stocks/formatting";
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
    question: "What is Compound Annual Growth Rate (CAGR)?",
    answer:
      "Compound Annual Growth Rate (CAGR) represents the annualized constant rate of return required for an investment to grow from its beginning initial balance to its ending final balance over a specified number of years.",
  },
  {
    question: "How is CAGR calculated?",
    answer:
      "CAGR is calculated using the formula: CAGR = (Final Value / Initial Value)^(1 / Years) - 1. It geometric-averages annual returns over time, smoothing out market fluctuations.",
  },
  {
    question: "When should I use CAGR instead of Absolute Return?",
    answer:
      "Use CAGR whenever evaluating investments held for longer than one year. Absolute return ignores the time horizon, whereas CAGR annualizes growth to allow direct apples-to-apples comparisons.",
  },
  {
    question: "Can CAGR be negative?",
    answer:
      "Yes. If the final value of an investment is lower than its initial purchase price, the CAGR will be negative, reflecting an annualized loss.",
  },
  {
    question: "Can I use CAGR for SIP investments?",
    answer:
      "No. CAGR is designed exclusively for one-time lump sum investments. For recurring or periodic investments like SIPs with multiple cash flows, use XIRR (Extended Internal Rate of Return) instead.",
  },
  {
    question: "What is considered a good CAGR for equity mutual funds in India?",
    answer:
      "Historically, broad Indian equity indices (such as the Nifty 50 and BSE Sensex) and diversified equity mutual funds have delivered long-term CAGRs between 12% and 15% over 10+ year horizons.",
  },
  {
    question: "Does CAGR reflect actual year-by-year volatility?",
    answer:
      "No. CAGR provides an imaginary smoothed annual rate. It does not reveal whether the investment experienced sharp market drawdowns or sudden surges during intermediate years.",
  },
  {
    question: "How does inflation affect my CAGR?",
    answer:
      "CAGR measures nominal return. To determine your Real CAGR (purchasing power growth), subtract the average annual inflation rate from your nominal CAGR using the Fisher equation.",
  },
  {
    question: "Is CAGR the same as IRR?",
    answer:
      "For a single initial cash outflow followed by a single final cash inflow at maturity, CAGR and IRR are mathematically identical. For multiple cash flows at irregular intervals, IRR/XIRR must be used.",
  },
  {
    question: "What is the Rule of 72 in relation to CAGR?",
    answer:
      "The Rule of 72 is a quick estimation shortcut: dividing 72 by the CAGR gives the approximate number of years required for your investment capital to double (e.g. 72 / 12% CAGR ≈ 6 years).",
  },
];

export default function CagrCalculatorPage() {
  const [initialInput, setInitialInput] = useState<string>("1,00,000");
  const [finalInput, setFinalInput] = useState<string>("2,50,000");
  const [yearsInput, setYearsInput] = useState<string>("5");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedInitial = useMemo(() => {
    const raw = initialInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [initialInput]);

  const parsedFinal = useMemo(() => {
    const raw = finalInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [finalInput]);

  const parsedYears = useMemo(() => {
    const raw = yearsInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0.1, Number(raw));
  }, [yearsInput]);

  const initialWords = useMemo(() => numberToWordsIndian(parsedInitial), [parsedInitial]);
  const finalWords = useMemo(() => numberToWordsIndian(parsedFinal), [parsedFinal]);
  const yearsWords = useMemo(() => formatDurationToWords(yearsInput), [yearsInput]);

  // Using returns/cagr.ts engine
  const result = useMemo(() => {
    try {
      return calculateCagr(parsedInitial, parsedFinal, parsedYears);
    } catch {
      return { cagr: 0, absoluteReturn: 0, totalGain: 0 };
    }
  }, [parsedInitial, parsedFinal, parsedYears]);

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
          <span className="text-[var(--foreground)] font-medium">CAGR Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <TrendingUp className="h-4 w-4" size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Investment Performance Metric</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Compound Annual Growth Rate (CAGR) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate the annualized compound growth rate of your lump sum investments across stocks, mutual funds, gold, and real estate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-12">
          <div className="md:col-span-7 h-full bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="cagr-initial" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Initial Investment Value
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Starting capital / buy price</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="cagr-initial"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={initialInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setInitialInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-36 sm:w-44 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {initialWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{initialWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="10000000"
                step="10000"
                autoComplete="off"
                value={Math.min(10000000, Math.max(0, parsedInitial))}
                onChange={(e) => setInitialInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="cagr-final" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Final Investment Value
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Ending portfolio balance / sell price</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="cagr-final"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={finalInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setFinalInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-36 sm:w-44 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {finalWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{finalWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50000000"
                step="50000"
                autoComplete="off"
                value={Math.min(50000000, Math.max(0, parsedFinal))}
                onChange={(e) => setFinalInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="cagr-years" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Duration (Years)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Time horizon held</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="cagr-years"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={yearsInput}
                    onChange={(e) => setYearsInput(e.target.value)}
                    className="w-36 sm:w-44 pr-12 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                  />
                  <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">Years</span>
                </div>
              </div>
              <input
                type="range"
                min="0.1"
                max="40"
                step="0.5"
                autoComplete="off"
                value={Math.min(40, Math.max(0.1, parsedYears))}
                onChange={(e) => setYearsInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>
          </div>

          <div className="md:col-span-5 h-full bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Compound Annual Growth Rate</span>
              <span className={`text-3xl sm:text-4xl font-black tabular-nums block mt-1 ${result.cagr >= 0 ? "text-teal-700 dark:text-teal-400" : "text-red-600 dark:text-red-400"}`}>
                {result.cagr.toFixed(2)}%
              </span>
              <span className="text-[11px] text-[var(--text-muted)] mt-1 block">Annualized geometric rate of return</span>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Total Net Gain / Loss</span>
                <span className="font-bold tabular-nums">₹{formatIndianNumber(Math.round(parsedFinal - parsedInitial))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Absolute Return</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">{((parsedInitial > 0 ? (parsedFinal - parsedInitial) / parsedInitial : 0) * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Growth Multiple</span>
                <span className="font-bold tabular-nums">{(parsedInitial > 0 ? parsedFinal / parsedInitial : 0).toFixed(2)}x</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is Compound Annual Growth Rate (CAGR)?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The <strong>Compound Annual Growth Rate (CAGR)</strong> is the annualized mean growth rate of an investment over a designated period longer than one year. It represents the hypothetical, steady geometric rate at which an investment would have grown if it climbed at a constant pace every single year with annual profits reinvested.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does a CAGR Calculator Work?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                A CAGR calculator evaluates the geometric progression between an initial purchase price and a final maturity value over a specified multi-year timeline.
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">CAGR = ( Final Value / Initial Value )<sup>(1 / Years)</sup> - 1</div>
                <div className="text-[11px] text-[var(--text-secondary)] font-sans">
                  Where <strong>Final Value</strong> = Ending market value, <strong>Initial Value</strong> = Starting purchase cost, and <strong>Years</strong> = Investment duration.
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
            <RelatedCalculators currentRoute="/calculators/cagr-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
