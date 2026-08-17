"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getCalculatorMeta } from "@/lib/cms/calculator-registry";
import { calculateSip } from "@/lib/financial/investments/sip";
import { calculateSwp } from "@/lib/financial/investments/swp";
import { calculateEmi } from "@/lib/financial/loans/emi";
import { calculateFd } from "@/lib/financial/fixedIncome/fd";
import { calculateCagr } from "@/lib/financial/returns/cagr";
import { calculateDcf } from "@/lib/financial/valuation/dcf";
import { formatCurrency, formatIndianNumber, formatPercent } from "@/lib/stocks/formatting";
import { Calculator, ExternalLink, ArrowRight } from "lucide-react";

interface CalculatorEmbedProps {
  id: string;
}

export function CalculatorEmbed({ id }: CalculatorEmbedProps) {
  const meta = getCalculatorMeta(id);

  // 1. SIP State
  const [sipMonthly, setSipMonthly] = useState(10000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // 2. SWP State
  const [swpInitial, setSwpInitial] = useState(2500000);
  const [swpMonthlyWithdrawal, setSwpMonthlyWithdrawal] = useState(20000);
  const [swpRate, setSwpRate] = useState(8);
  const [swpYears, setSwpYears] = useState(10);

  // 3. EMI State
  const [emiPrincipal, setEmiPrincipal] = useState(3000000);
  const [emiRate, setEmiRate] = useState(8.5);
  const [emiTenureYears, setEmiTenureYears] = useState(20);

  // 4. FD State
  const [fdDeposit, setFdDeposit] = useState(100000);
  const [fdRate, setFdRate] = useState(7.1);
  const [fdYears, setFdYears] = useState(5);

  // 5. CAGR State
  const [cagrInitial, setCagrInitial] = useState(100000);
  const [cagrFinal, setCagrFinal] = useState(300000);
  const [cagrYears, setCagrYears] = useState(5);

  // 6. DCF State
  const [dcfFcf, setDcfFcf] = useState(1000); // in Crores
  const [dcfGrowthRate, setDcfGrowthRate] = useState(12);
  const [dcfWacc, setDcfWacc] = useState(11);
  const [dcfTerminalGrowth, setDcfTerminalGrowth] = useState(4);

  // Computed results using core financial engines
  const sipResult = useMemo(() => {
    try {
      return calculateSip(sipMonthly, sipRate / 100, sipYears);
    } catch {
      return null;
    }
  }, [sipMonthly, sipRate, sipYears]);

  const swpResult = useMemo(() => {
    try {
      return calculateSwp(swpInitial, swpMonthlyWithdrawal, swpRate / 100, swpYears);
    } catch {
      return null;
    }
  }, [swpInitial, swpMonthlyWithdrawal, swpRate, swpYears]);

  const emiResult = useMemo(() => {
    try {
      return calculateEmi(emiPrincipal, emiRate / 100, emiTenureYears * 12);
    } catch {
      return null;
    }
  }, [emiPrincipal, emiRate, emiTenureYears]);

  const fdResult = useMemo(() => {
    try {
      return calculateFd(fdDeposit, fdRate / 100, fdYears, "quarterly", true);
    } catch {
      return null;
    }
  }, [fdDeposit, fdRate, fdYears]);

  const cagrResult = useMemo(() => {
    try {
      return calculateCagr(cagrInitial, cagrFinal, cagrYears);
    } catch {
      return null;
    }
  }, [cagrInitial, cagrFinal, cagrYears]);

  const dcfResult = useMemo(() => {
    try {
      const fcfList: number[] = [];
      let cur = dcfFcf;
      for (let i = 0; i < 5; i++) {
        cur *= 1 + dcfGrowthRate / 100;
        fcfList.push(cur);
      }
      return calculateDcf(fcfList, dcfWacc / 100, dcfTerminalGrowth / 100);
    } catch {
      return null;
    }
  }, [dcfFcf, dcfGrowthRate, dcfWacc, dcfTerminalGrowth]);

  const renderContent = () => {
    switch (id) {
      case "sip-calculator":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Monthly SIP (₹)</label>
                <input
                  type="number"
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Math.max(100, Number(e.target.value) || 0))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Expected Return (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sipRate}
                  onChange={(e) => setSipRate(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Duration (Years)</label>
                <input
                  type="number"
                  value={sipYears}
                  onChange={(e) => setSipYears(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
            </div>

            {sipResult && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-base)] rounded-md border border-[var(--border-subtle)] text-center">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Invested</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
                    {formatCurrency(sipResult.investedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Est. Returns</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(sipResult.estimatedReturns)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Total Value</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--accent-teal)]">
                    {formatCurrency(sipResult.totalValue)}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "swp-calculator":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Total Corpus (₹)</label>
                <input
                  type="number"
                  value={swpInitial}
                  onChange={(e) => setSwpInitial(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Monthly Withdrawal (₹)</label>
                <input
                  type="number"
                  value={swpMonthlyWithdrawal}
                  onChange={(e) => setSwpMonthlyWithdrawal(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Return Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={swpRate}
                  onChange={(e) => setSwpRate(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Tenure (Years)</label>
                <input
                  type="number"
                  value={swpYears}
                  onChange={(e) => setSwpYears(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
            </div>

            {swpResult && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-base)] rounded-md border border-[var(--border-subtle)] text-center">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Total Withdrawn</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
                    {formatCurrency(swpResult.totalWithdrawals)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Remaining Corpus</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--accent-teal)]">
                    {formatCurrency(swpResult.remainingCorpus)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Period Survived</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {swpResult.yearsSurvived} Years
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "emi-calculator":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={emiPrincipal}
                  onChange={(e) => setEmiPrincipal(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={emiRate}
                  onChange={(e) => setEmiRate(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Tenure (Years)</label>
                <input
                  type="number"
                  value={emiTenureYears}
                  onChange={(e) => setEmiTenureYears(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
            </div>

            {emiResult && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-base)] rounded-md border border-[var(--border-subtle)] text-center">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Monthly EMI</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--accent-teal)]">
                    {formatCurrency(emiResult.monthlyEmi)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Total Interest</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                    {formatCurrency(emiResult.totalInterest)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Total Payment</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
                    {formatCurrency(emiResult.totalPayment)}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "fd-calculator":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Total Deposit (₹)</label>
                <input
                  type="number"
                  value={fdDeposit}
                  onChange={(e) => setFdDeposit(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Rate of Interest (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={fdRate}
                  onChange={(e) => setFdRate(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Time Period (Years)</label>
                <input
                  type="number"
                  value={fdYears}
                  onChange={(e) => setFdYears(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
            </div>

            {fdResult && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-base)] rounded-md border border-[var(--border-subtle)] text-center">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Invested</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
                    {formatCurrency(fdResult.principal)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Interest Earned</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(fdResult.interestEarned)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Maturity Value</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--accent-teal)]">
                    {formatCurrency(fdResult.maturityAmount)}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "cagr-calculator":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Initial Investment (₹)</label>
                <input
                  type="number"
                  value={cagrInitial}
                  onChange={(e) => setCagrInitial(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Final Value (₹)</label>
                <input
                  type="number"
                  value={cagrFinal}
                  onChange={(e) => setCagrFinal(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Years (t)</label>
                <input
                  type="number"
                  value={cagrYears}
                  onChange={(e) => setCagrYears(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
            </div>

            {cagrResult && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-base)] rounded-md border border-[var(--border-subtle)] text-center">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Initial & Final</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
                    {formatCurrency(cagrResult.initialValue)} → {formatCurrency(cagrResult.finalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Total Gain</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(cagrResult.finalValue - cagrResult.initialValue)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Compound CAGR</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--accent-teal)]">
                    {formatPercent(cagrResult.cagr * 100)}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "dcf-calculator":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Base FCF (₹ Cr)</label>
                <input
                  type="number"
                  value={dcfFcf}
                  onChange={(e) => setDcfFcf(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Growth Rate (%)</label>
                <input
                  type="number"
                  value={dcfGrowthRate}
                  onChange={(e) => setDcfGrowthRate(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">WACC Discount (%)</label>
                <input
                  type="number"
                  value={dcfWacc}
                  onChange={(e) => setDcfWacc(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text-secondary)]">Terminal Growth (%)</label>
                <input
                  type="number"
                  value={dcfTerminalGrowth}
                  onChange={(e) => setDcfTerminalGrowth(Number(e.target.value) || 0)}
                  className="w-full mt-1 px-2 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--accent-teal)]"
                />
              </div>
            </div>

            {dcfResult && (
              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-base)] rounded-md border border-[var(--border-subtle)] text-center">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">PV of 5-Yr FCF</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--text-primary)]">
                    ₹{formatIndianNumber(dcfResult.pvForecastFcf)} Cr
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Terminal Value</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{formatIndianNumber(dcfResult.pvTerminalValue)} Cr
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase">Enterprise Value</p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[var(--accent-teal)]">
                    ₹{formatIndianNumber(dcfResult.enterpriseValue)} Cr
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {meta?.description || "Explore interactive models, cashflow schedules, and calculations in the dedicated research tool."}
            </p>
            <Link
              href={`/calculators/${id}`}
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[var(--accent-teal)] text-white text-xs font-semibold hover:bg-[#0EA5E9] transition-colors shrink-0"
            >
              <span>Launch Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        );
    }
  };

  const title = meta?.name || "Financial Calculator";

  return (
    <div className="my-6 p-4 sm:p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
        <div className="flex items-center space-x-2 min-w-0">
          <Calculator className="w-4 h-4 text-[var(--accent-teal)] shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
            {title}
          </h4>
          {meta?.category && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-subtle)] hidden sm:inline-block shrink-0">
              {meta.category}
            </span>
          )}
        </div>
        <Link
          href={`/calculators/${id}`}
          target="_blank"
          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[var(--accent-teal)] hover:underline shrink-0 ml-2"
        >
          <span>Open Full Tool</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {renderContent()}
    </div>
  );
}

export default CalculatorEmbed;
