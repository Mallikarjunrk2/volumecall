"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateCagr } from "@/lib/financial/returns/cagr";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { TrendingUp, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from "lucide-react";

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

        {/* Calculator Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Input 1: Initial Investment */}
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
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
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

            {/* Input 2: Final Value */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="cagr-final" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Final Investment Value
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Ending portfolio value / sale price</span>
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
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {finalWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{finalWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="20000000"
                step="10000"
                autoComplete="off"
                value={Math.min(20000000, Math.max(0, parsedFinal))}
                onChange={(e) => setFinalInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {/* Input 3: Duration */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="cagr-years" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Duration (Years)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Total investment holding period</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
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
                  {yearsWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{yearsWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="40"
                step="0.5"
                autoComplete="off"
                value={Math.min(40, Math.max(0.5, parsedYears))}
                onChange={(e) => setYearsInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>
          </div>

          {/* Right Column: Output Card */}
          <div className="lg:col-span-5 bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            <div>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Compound Annual Growth Rate (CAGR)</span>
              <span className="text-3xl sm:text-4xl font-black text-teal-700 dark:text-teal-400 tabular-nums block mt-1">
                {(result.cagr * 100).toFixed(2)}% p.a.
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Total Net Gain</span>
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

        {/* Comprehensive Educational Content Sections */}
        <div className="space-y-10 mb-12 border-t border-[var(--border)] pt-10">

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is Compound Annual Growth Rate (CAGR)?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              The <strong>Compound Annual Growth Rate (CAGR)</strong> is the annualized mean growth rate of an investment over a designated period longer than one year. It represents the hypothetical, steady geometric rate at which an investment would have grown if it climbed at a constant pace every single year with annual profits reinvested.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does a CAGR Calculator Work?</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              A CAGR calculator evaluates the geometric progression between your starting capital and ending portfolio valuation:
            </p>
            <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
              <li><strong>Input Initial Investment:</strong> The beginning purchase cost or capital deployed.</li>
              <li><strong>Input Final Value:</strong> The current market value or exit proceeds.</li>
              <li><strong>Input Tenure:</strong> The total holding horizon in years.</li>
              <li><strong>Calculate Geometric Mean:</strong> Derives the exact annualized compounding percentage rate.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">CAGR Formula & Mathematical Methodology</h2>
            <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
              <div className="font-bold text-sm">CAGR = ( Final Value / Initial Value )<sup>( 1 / n )</sup> - 1</div>
              <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                <div><strong>Final Value</strong> = Ending value of the investment</div>
                <div><strong>Initial Value</strong> = Beginning purchase cost</div>
                <div><strong>n</strong> = Total number of years the investment was held</div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">CAGR Calculation Example</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              Suppose you invested ₹1,00,000 in a mutual fund or stock portfolio that grew to ₹2,50,000 after 5 years:
            </p>
            <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="font-semibold text-[var(--text-secondary)]">Absolute Return ((2,50,000 - 1,00,000) / 1,00,000)</span>
                <span className="font-bold tabular-nums">150.00%</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border)] pb-2">
                <span className="font-semibold text-[var(--text-secondary)]">Growth Multiple</span>
                <span className="font-bold tabular-nums">2.5x</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span>Compound Annual Growth Rate (CAGR)</span>
                <span className="tabular-nums text-teal-700 dark:text-teal-400">20.11% p.a.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">CAGR vs Absolute Return vs IRR</h2>
            <div className="overflow-x-auto">
              <table className="financial-table text-xs w-full">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left">Metric</th>
                    <th className="px-4 py-3 text-left">Considers Time?</th>
                    <th className="px-4 py-3 text-left">Supports Multiple Cash Flows?</th>
                    <th className="px-4 py-3 text-left">Best Suited For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr>
                    <td className="px-4 py-2.5 font-bold">CAGR</td>
                    <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Yes (Annualized)</td>
                    <td className="px-4 py-2.5">No (Lump sum only)</td>
                    <td className="px-4 py-2.5">Lump sum stocks, mutual funds, real estate</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Absolute Return</td>
                    <td className="px-4 py-2.5 text-amber-600 dark:text-amber-400">No (Ignores tenure)</td>
                    <td className="px-4 py-2.5">No (Lump sum only)</td>
                    <td className="px-4 py-2.5">Short-term trades (&lt; 1 year)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">IRR / XIRR</td>
                    <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Yes (Annualized)</td>
                    <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Yes (Irregular cash flows)</td>
                    <td className="px-4 py-2.5">SIPs, SWPs, private equity, business projects</td>
                  </tr>
                </tbody>
              </table>
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
        <RelatedCalculators currentRoute="/calculators/cagr-calculator" />
      </main>
      <Footer />
    </div>
  );
}
