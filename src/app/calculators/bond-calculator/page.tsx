"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RelatedCalculators from "@/components/calculators/RelatedCalculators";
import { calculateBondPrice, calculateBondYtm } from "@/lib/financial/fixedIncome/bonds";
import { formatIndianNumber } from "@/lib/stocks/formatting";
import { ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

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
    question: "What is Yield to Maturity (YTM) on a bond?",
    answer:
      "Yield to Maturity (YTM) is the total annualized rate of return anticipated on a bond if it is held until maturity, accounting for all periodic coupon payments and the difference between current purchase price and face value.",
  },
  {
    question: "How is bond price related to bond yield?",
    answer:
      "Bond prices and yields have an inverse relationship. When market yields rise, existing bond prices fall. When market yields fall, existing bond prices rise.",
  },
  {
    question: "What is the difference between Coupon Rate and Current Yield?",
    answer:
      "The Coupon Rate is the fixed annual interest paid on the face value. Current Yield is the annual coupon payment divided by the bond's current market price.",
  },
  {
    question: "What does it mean if a bond trades at a Premium or Discount?",
    answer:
      "A bond trades at a Premium when its market price is above face value (YTM < Coupon Rate). It trades at a Discount when its market price is below face value (YTM > Coupon Rate).",
  },
  {
    question: "What is an Indian Government Security (G-Sec)?",
    answer:
      "G-Secs are sovereign debt instruments issued by the Reserve Bank of India on behalf of the Central Government with virtually zero credit default risk.",
  },
  {
    question: "How often are bond coupons paid in India?",
    answer:
      "Most Indian corporate bonds and government securities pay coupon interest semi-annually (twice a year) or annually.",
  },
  {
    question: "How are bond returns taxed in India?",
    answer:
      "Coupon interest is taxed at your income tax slab rate. Capital gains on listed bonds held over 12 months are taxed as long-term capital gains at 12.5% without indexation.",
  },
  {
    question: "What is credit risk in corporate bonds?",
    answer:
      "Credit risk is the probability that the bond issuer may default on coupon payments or principal repayment at maturity. Credit rating agencies (CRISIL, ICRA, CARE) assign ratings like AAA, AA, BBB to indicate safety.",
  },
  {
    question: "Can I sell a bond before its maturity date?",
    answer:
      "Yes. Listed bonds can be traded in the secondary market on NSE/BSE or specialized online bond platforms at prevailing market prices.",
  },
  {
    question: "What is modified duration in bond investing?",
    answer:
      "Modified duration measures a bond's price sensitivity to changes in interest rates. A duration of 5 means the bond price will change approximately 5% for every 1% change in yield.",
  },
];

export default function BondCalculatorPage() {
  const [calcMode, setCalcMode] = useState<"price" | "ytm">("price");
  const [faceValueInput, setFaceValueInput] = useState<string>("1,000");
  const [couponRateInput, setCouponRateInput] = useState<string>("8.5");
  const [ytmInput, setYtmInput] = useState<string>("8.0");
  const [priceInput, setPriceInput] = useState<string>("1,020");
  const [tenureInput, setTenureInput] = useState<string>("5");
  const [frequency, setFrequency] = useState<number>(2); // 2 = semi-annual
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formatRawDigits = (raw: string) => {
    if (!raw) return "";
    const num = Number(raw);
    return isNaN(num) ? raw : formatIndianNumber(num);
  };

  const parsedFaceValue = useMemo(() => {
    const raw = faceValueInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 1000 : Math.max(1, Number(raw));
  }, [faceValueInput]);

  const parsedCouponRate = useMemo(() => {
    const raw = couponRateInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [couponRateInput]);

  const parsedYtm = useMemo(() => {
    const raw = ytmInput.trim();
    return !raw || isNaN(Number(raw)) ? 0 : Math.max(0, Number(raw));
  }, [ytmInput]);

  const parsedPrice = useMemo(() => {
    const raw = priceInput.replace(/,/g, "").trim();
    return !raw || isNaN(Number(raw)) ? 1000 : Math.max(1, Number(raw));
  }, [priceInput]);

  const parsedTenure = useMemo(() => {
    const raw = tenureInput.trim();
    return !raw || isNaN(Number(raw)) ? 1 : Math.max(0.5, Number(raw));
  }, [tenureInput]);

  const faceValueWords = useMemo(() => numberToWordsIndian(parsedFaceValue), [parsedFaceValue]);
  const tenureWords = useMemo(() => formatDurationToWords(tenureInput), [tenureInput]);

  const priceResult = useMemo(() => {
    try {
      return calculateBondPrice(parsedFaceValue, parsedCouponRate / 100, parsedYtm / 100, parsedTenure, frequency);
    } catch {
      return parsedFaceValue;
    }
  }, [parsedFaceValue, parsedCouponRate, parsedYtm, parsedTenure, frequency]);

  const ytmResult = useMemo(() => {
    try {
      const res = calculateBondYtm(parsedFaceValue, parsedCouponRate / 100, parsedPrice, parsedTenure, frequency);
      return res.ytm !== null ? res.ytm * 100 : null;
    } catch {
      return null;
    }
  }, [parsedFaceValue, parsedCouponRate, parsedPrice, parsedTenure, frequency]);

  const annualCouponAmount = (parsedFaceValue * parsedCouponRate) / 100;
  const currentYield = calcMode === "price"
    ? (annualCouponAmount / priceResult) * 100
    : (annualCouponAmount / parsedPrice) * 100;

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
          <span className="text-[var(--foreground)] font-medium">Bond Calculator</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center space-x-2 text-teal-700 dark:text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Debt Securities Valuation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50">
            Bond Price & Yield to Maturity (YTM) Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            Calculate bond market prices, Yield to Maturity (YTM), and coupon cash flows for Indian government securities (G-Secs) and corporate bonds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-12">
          <div className="md:col-span-7 h-full bg-white dark:bg-[#0a0a0a] border border-[var(--border)] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                Calculation Mode
              </label>
              <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-bold text-xs">
                <button
                  onClick={() => setCalcMode("price")}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    calcMode === "price" ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Calculate Fair Bond Price
                </button>
                <button
                  onClick={() => setCalcMode("ytm")}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    calcMode === "ytm" ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Calculate YTM (Yield)
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="bond-fv" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Face Value / Par Value
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Principal amount repaid at maturity</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                    <input
                      id="bond-fv"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={faceValueInput}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
                        setFaceValueInput(clean === "" ? "" : formatRawDigits(clean));
                      }}
                      className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                  </div>
                  {faceValueWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{faceValueWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                autoComplete="off"
                value={Math.min(100000, Math.max(100, parsedFaceValue))}
                onChange={(e) => setFaceValueInput(formatIndianNumber(Number(e.target.value)))}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="bond-coupon" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Annual Coupon Rate (% p.a.)
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Fixed interest rate on face value</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="bond-coupon"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={couponRateInput}
                    onChange={(e) => setCouponRateInput(e.target.value)}
                    className="w-36 sm:w-44 pr-6 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                  />
                  <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
                autoComplete="off"
                value={Math.min(20, Math.max(0, parsedCouponRate))}
                onChange={(e) => setCouponRateInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            {calcMode === "price" ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <label htmlFor="bond-ytm-req" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                      Required Yield to Maturity (% p.a.)
                    </label>
                    <span className="text-[11px] text-[var(--text-muted)]">Market discount rate / investor required return</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="bond-ytm-req"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={ytmInput}
                      onChange={(e) => setYtmInput(e.target.value)}
                      className="w-36 sm:w-44 pr-6 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                    <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="25"
                  step="0.1"
                  autoComplete="off"
                  value={Math.min(25, Math.max(0.1, parsedYtm))}
                  onChange={(e) => setYtmInput(e.target.value)}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <label htmlFor="bond-price-curr" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                      Current Traded Market Price (₹)
                    </label>
                    <span className="text-[11px] text-[var(--text-muted)]">Current clean price in the market</span>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-xs text-[var(--text-secondary)] font-medium">₹</span>
                      <input
                        id="bond-price-curr"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-40 sm:w-48 pl-6 pr-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <label htmlFor="bond-tenure" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Tenure / Years to Maturity
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)]">Remaining time until principal repayment</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="relative flex items-center">
                    <input
                      id="bond-tenure"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={tenureInput}
                      onChange={(e) => setTenureInput(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-36 sm:w-44 pr-12 pl-2.5 py-1.5 border border-[var(--border)] bg-neutral-50/50 dark:bg-[#121212]/50 text-right text-sm sm:text-base font-bold rounded-lg focus:outline-none focus:ring-1.5 focus:ring-teal-650 transition-all tabular-nums"
                    />
                    <span className="absolute right-2.5 text-xs text-[var(--text-secondary)] font-medium">Years</span>
                  </div>
                  {tenureWords && <div className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-right">{tenureWords}</div>}
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                autoComplete="off"
                value={Math.min(30, Math.max(1, parsedTenure))}
                onChange={(e) => setTenureInput(e.target.value)}
                className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-700 dark:accent-teal-400"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                Coupon Payout Frequency
              </label>
              <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-bold text-xs">
                <button
                  onClick={() => setFrequency(1)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    frequency === 1 ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Annual (1x)
                </button>
                <button
                  onClick={() => setFrequency(2)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    frequency === 2 ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Semi-Annual (2x)
                </button>
                <button
                  onClick={() => setFrequency(4)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    frequency === 4 ? "bg-white dark:bg-[#1a1a1a] text-teal-700 dark:text-teal-400 shadow-xs" : "text-[var(--text-secondary)]"
                  }`}
                >
                  Quarterly (4x)
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 h-full bg-neutral-50 dark:bg-[#121212]/60 border border-[var(--border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs min-h-[380px]">
            {calcMode === "price" ? (
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Estimated Fair Bond Price</span>
                <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                  ₹{priceResult.toFixed(2)}
                </span>
                <span className={`text-xs font-semibold mt-1 block ${priceResult > parsedFaceValue ? "text-teal-700 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {priceResult > parsedFaceValue ? "Trading at a Premium (Price > Face Value)" : priceResult < parsedFaceValue ? "Trading at a Discount (Price < Face Value)" : "Trading at Par (Price = Face Value)"}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider block">Yield to Maturity (YTM)</span>
                <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-neutral-50 tabular-nums block mt-1">
                  {ytmResult !== null ? `${ytmResult.toFixed(2)}% p.a.` : "N/A"}
                </span>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Annual Coupon Payout</span>
                <span className="font-bold tabular-nums">₹{annualCouponAmount.toFixed(2)} / year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Periodic Coupon Payout</span>
                <span className="font-bold tabular-nums">₹{(annualCouponAmount / frequency).toFixed(2)} / period</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)] font-medium">Current Yield</span>
                <span className="font-bold tabular-nums text-teal-700 dark:text-teal-400">{currentYield.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 border-t border-[var(--border)] pt-10 mb-12 items-start">
          <div className="lg:col-span-8 space-y-10">
            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">What Is a Bond Calculator?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                A <strong>Bond Calculator</strong> is a specialized fixed-income valuation tool used to compute either the fair intrinsic market price of a bond given a required yield, or the exact <strong>Yield to Maturity (YTM)</strong> based on its current traded market price.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2">
                In India, retail investors actively participate in Sovereign Gold Bonds (SGBs), Government Securities (G-Secs via RBI Retail Direct), state development loans (SDLs), and listed corporate debentures (NCDs). Knowing how to price bonds and calculate YTM is fundamental to fixed-income investing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">How Does a Bond Calculator Work?</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                A bond&apos;s value is equal to the present discounted value of all its future cash flows:
              </p>
              <ol className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-decimal list-inside font-normal">
                <li><strong>Coupon Cash Flows:</strong> The fixed periodic interest payments received throughout the life of the bond.</li>
                <li><strong>Face Value Redemption:</strong> The par value repaid in full to the bondholder on the maturity date.</li>
                <li><strong>Discounting Mechanism:</strong> Future cash flows are discounted back to today&apos;s present value at the market discount rate (YTM).</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Bond Pricing Formula & Methodology</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                The bond pricing formula calculates the sum of discounted coupons and face value:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl font-mono text-xs text-teal-800 dark:text-teal-400 space-y-2 mb-3">
                <div className="font-bold text-sm">Price = ∑<sub>t=1</sub><sup>N</sup> [ C / (1 + y/m)<sup>t</sup> ] + FV / (1 + y/m)<sup>N</sup></div>
                <div className="text-[var(--text-muted)] font-sans text-[11px] space-y-0.5 pt-2">
                  <div><strong>C</strong> = Periodic coupon payment = (FV × Coupon Rate) / m</div>
                  <div><strong>FV</strong> = Face / par value of the bond (e.g. ₹1,000)</div>
                  <div><strong>y</strong> = Annual Yield to Maturity (YTM as a decimal)</div>
                  <div><strong>m</strong> = Coupon frequency per year (1 for annual, 2 for semi-annual)</div>
                  <div><strong>N</strong> = Total number of coupon periods = Years × m</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Bond Calculation Example</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Consider a 5-year corporate bond with ₹1,000 face value, <strong>8.5% annual coupon</strong> paid semi-annually, when market YTM is <strong>8.0%</strong>:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-[#121212] border border-[var(--border)] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-[var(--text-secondary)]">Semi-Annual Coupon (₹1,000 × 8.5% / 2)</span>
                  <span className="font-bold tabular-nums">₹42.50 per period (10 periods)</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-[var(--text-secondary)]">Present Value of Coupons</span>
                  <span className="font-bold tabular-nums">₹344.71</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border)] pb-2">
                  <span className="font-semibold text-[var(--text-secondary)]">Present Value of Par Value (₹1,000)</span>
                  <span className="font-bold tabular-nums">₹675.56</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-sm">
                  <span>Fair Market Price (Trading at Premium)</span>
                  <span className="tabular-nums text-teal-700 dark:text-teal-400">₹1,020.27</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-neutral-50 mb-3">Bonds vs Fixed Deposits (FD)</h2>
              <div className="overflow-x-auto">
                <table className="financial-table text-xs w-full">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#121212] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left">Parameter</th>
                      <th className="px-4 py-3 text-left">Bonds / G-Secs</th>
                      <th className="px-4 py-3 text-left">Bank Fixed Deposits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Secondary Market Liquidity</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Tradable on stock exchange (NSE/BSE)</td>
                      <td className="px-4 py-2.5">Non-tradable (must break with bank)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Price Fluctuation</td>
                      <td className="px-4 py-2.5">Price changes inversely with interest rates</td>
                      <td className="px-4 py-2.5">Fixed principal (zero price change)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Capital Gains Potential</td>
                      <td className="px-4 py-2.5 text-teal-700 dark:text-teal-400 font-semibold">Yes (if interest rates fall)</td>
                      <td className="px-4 py-2.5">No (interest only)</td>
                    </tr>
                  </tbody>
                </table>
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
            <RelatedCalculators currentRoute="/calculators/bond-calculator" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
