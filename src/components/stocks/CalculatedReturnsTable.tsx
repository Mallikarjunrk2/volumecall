"use client";

import { useEffect, useState } from "react";
import FinancialTable from "@/components/financials/FinancialTable";
import { calculateMetrics, CalculatedMetrics } from "@/lib/stocks/calculations";
import { formatPercent } from "@/lib/stocks/formatting";
import { Candle } from "@/lib/stocks/types";

interface CalculatedReturnsTableProps {
  initialCandles: Candle[];
  symbol: string;
}

function toRows(metrics: CalculatedMetrics, loadingLongTerm: boolean) {
  const longTermValue = (value: number | null) =>
    loadingLongTerm ? "Loading…" : formatPercent(value);

  return [
    { label: "1-Month Return", values: [formatPercent(metrics.return1M)] },
    { label: "6-Month Return", values: [formatPercent(metrics.return6M)] },
    { label: "1-Year Return", values: [formatPercent(metrics.return1Y)] },
    { label: "3-Year CAGR", values: [longTermValue(metrics.cagr3Y)] },
    { label: "5-Year CAGR", values: [longTermValue(metrics.cagr5Y)] },
    { label: "10-Year CAGR", values: [longTermValue(metrics.cagr10Y)] },
  ];
}

export default function CalculatedReturnsTable({
  initialCandles,
  symbol,
}: CalculatedReturnsTableProps) {
  const [metrics, setMetrics] = useState(() => calculateMetrics(initialCandles));
  const [loadingLongTerm, setLoadingLongTerm] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLongTermMetrics() {
      try {
        const response = await fetch(`/api/stocks/${symbol}/history?range=10y`, {
          signal: controller.signal,
        });
        if (!response.ok) return;

        const candles = (await response.json()) as Candle[];
        if (candles.length > 0) {
          setMetrics(calculateMetrics(candles));
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to load long-term return data:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingLongTerm(false);
        }
      }
    }

    loadLongTermMetrics();
    return () => controller.abort();
  }, [symbol]);

  return (
    <FinancialTable
      headers={["Timeframe", "Return / CAGR"]}
      rows={toRows(metrics, loadingLongTerm)}
    />
  );
}
