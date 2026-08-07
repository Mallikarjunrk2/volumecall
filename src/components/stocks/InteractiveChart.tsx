"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  createChart,
  HistogramSeries,
  LineSeries,
} from "lightweight-charts";
import { Loader2 } from "lucide-react";
import { Candle } from "@/lib/stocks/types";

interface InteractiveChartProps {
  initialCandles: Candle[];
  symbol: string;
}

type ChartType = "line" | "candlestick";

export function InteractiveChart({ initialCandles, symbol }: InteractiveChartProps) {
  const [range, setRange] = useState<"1M" | "6M" | "1Y" | "3Y" | "5Y" | "10Y">("1Y");
  const [chartType, setChartType] = useState<ChartType>("line");
  const [showDMA50, setShowDMA50] = useState(false);
  const [showDMA200, setShowDMA200] = useState(false);
  
  const [candles, setCandles] = useState<Candle[]>(initialCandles);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Local cache of historical data to avoid repeated network calls
  const [cache, setCache] = useState<Record<string, Candle[]>>({
    "2y": initialCandles, // 2y contains enough for 1y, 6m, 1m
  });

  const chartContainerRef = useRef<HTMLDivElement>(null);
  // Refs for high-performance direct-DOM tooltip updating
  const dateRef = useRef<HTMLSpanElement>(null);
  const openRef = useRef<HTMLSpanElement>(null);
  const highRef = useRef<HTMLSpanElement>(null);
  const lowRef = useRef<HTMLSpanElement>(null);
  const closeRef = useRef<HTMLSpanElement>(null);
  const volumeRef = useRef<HTMLSpanElement>(null);

  // Detect and track dark mode changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch / Filter candles based on range selection
  useEffect(() => {
    const updateData = async () => {
      if (range === "1M" || range === "6M" || range === "1Y") {
        // These can be filtered from the 2Y initial load data
        const initial = cache["2y"] || initialCandles;
        if (initial.length === 0) return;

        const latestDate = new Date(initial[initial.length - 1].time);
        const cutoff = new Date(latestDate);

        if (range === "1M") cutoff.setMonth(cutoff.getMonth() - 1);
        else if (range === "6M") cutoff.setMonth(cutoff.getMonth() - 6);
        else if (range === "1Y") cutoff.setFullYear(cutoff.getFullYear() - 1);

        const filtered = initial.filter((c) => new Date(c.time) >= cutoff);
        setCandles(filtered);
      } else {
        // 3Y, 5Y, 10Y require lazy loading
        const cacheKey = range.toLowerCase();
        if (cache[cacheKey]) {
          setCandles(cache[cacheKey]);
          return;
        }

        setLoading(true);
        try {
          const res = await fetch(`/api/stocks/${symbol}/history?range=${cacheKey}`);
          if (res.ok) {
            const data: Candle[] = await res.ok ? await res.json() : [];
            setCache((prev) => ({ ...prev, [cacheKey]: data }));
            setCandles(data);
          }
        } catch (error) {
          console.error(`Failed to fetch ${range} history for ${symbol}:`, error);
        } finally {
          setLoading(false);
        }
      }
    };

    updateData();
  }, [range, symbol, cache, initialCandles]);

  // Render & Configure Chart
  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    // Dimensions
    const container = chartContainerRef.current;
    const width = container.clientWidth;
    const height = 400;

    // Styling colors based on theme
    const themeColors = {
      bg: isDark ? "#000000" : "#ffffff",
      text: isDark ? "#a3a3a3" : "#666666",
      grid: isDark ? "#111111" : "#fafafa",
      crosshair: isDark ? "#333333" : "#e5e5e5",
      teal: isDark ? "#2dd4bf" : "#0f766e",
    };

    // Create Chart Instance
    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { color: themeColors.bg },
        textColor: themeColors.text,
        fontFamily: 'var(--font-sans), system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: themeColors.grid },
        horzLines: { color: themeColors.grid },
      },
      crosshair: {
        vertLine: {
          color: themeColors.crosshair,
          width: 1,
          style: 2, // Dashed
          labelVisible: false,
        },
        horzLine: {
          color: themeColors.crosshair,
          width: 1,
          style: 2,
          labelVisible: true,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: false,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
    });

    // 1. Primary Series (Line or Candlestick)
    if (chartType === "line") {
      const mainSeries = chart.addSeries(AreaSeries, {
        lineColor: themeColors.teal,
        topColor: isDark ? "rgba(45, 212, 191, 0.05)" : "rgba(15, 118, 110, 0.04)",
        bottomColor: "transparent",
        lineWidth: 2,
        priceFormat: { type: "price", precision: 2, minMove: 0.05 },
      });
      mainSeries.setData(candles.map((candle) => ({ time: candle.time, value: candle.close })));

      mainSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.1, bottom: 0.25 },
      });
    } else {
      const mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#10b981",
        downColor: "#ef4444",
        borderUpColor: "#10b981",
        borderDownColor: "#ef4444",
        wickUpColor: "#10b981",
        wickDownColor: "#ef4444",
        priceFormat: { type: "price", precision: 2, minMove: 0.05 },
      });
      mainSeries.setData(candles);
      mainSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.1, bottom: 0.25 },
      });
    }

    // 2. Volume Series (drawn on bottom)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(71, 85, 105, 0.15)",
      priceFormat: { type: "volume" },
      priceScaleId: "volume-scale",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = candles.map((c) => ({
      time: c.time,
      value: c.volume,
      color: c.close >= c.open ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)",
    }));
    volumeSeries.setData(volumeData);

    // 3. DMA overlays
    if (showDMA50) {
      const dma50Series = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 1,
        priceScaleId: "right",
      });
      const dma50Data = candles
        .filter((c) => c.dma50 !== undefined && c.dma50 !== null)
        .map((c) => ({ time: c.time, value: c.dma50 as number }));
      dma50Series.setData(dma50Data);
    }

    if (showDMA200) {
      const dma200Series = chart.addSeries(LineSeries, {
        color: "#f59e0b",
        lineWidth: 1,
        priceScaleId: "right",
      });
      const dma200Data = candles
        .filter((c) => c.dma200 !== undefined && c.dma200 !== null)
        .map((c) => ({ time: c.time, value: c.dma200 as number }));
      dma200Series.setData(dma200Data);
    }

    // Set initial values in tooltip
    const setTooltipValues = (c: Candle) => {
      if (dateRef.current) dateRef.current.innerText = c.time;
      if (openRef.current) openRef.current.innerText = `₹${c.open.toFixed(2)}`;
      if (highRef.current) highRef.current.innerText = `₹${c.high.toFixed(2)}`;
      if (lowRef.current) lowRef.current.innerText = `₹${c.low.toFixed(2)}`;
      if (closeRef.current) closeRef.current.innerText = `₹${c.close.toFixed(2)}`;
      if (volumeRef.current) volumeRef.current.innerText = c.volume.toLocaleString("en-IN");
    };

    const latestCandle = candles[candles.length - 1];
    setTooltipValues(latestCandle);

    // Handle Crosshair hover
    chart.subscribeCrosshairMove((param) => {
      if (
        !param.time ||
        !param.point ||
        param.point.x < 0 ||
        param.point.x > width ||
        param.point.y < 0 ||
        param.point.y > height
      ) {
        setTooltipValues(latestCandle);
        return;
      }

      const activeCandle = candles.find((c) => c.time === param.time);
      if (activeCandle) {
        setTooltipValues(activeCandle);
      }
    });

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(chartContainerRef.current.clientWidth, height);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candles, chartType, showDMA50, showDMA200, isDark]);

  return (
    <div className="border border-[var(--border)] rounded-md bg-[var(--background)] p-4 sm:p-5">
      {/* Chart Header Tools */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border)] mb-4">
        {/* Timeframes */}
        <div className="flex items-center space-x-0.5 bg-[var(--background-secondary)] p-0.5 rounded-md border border-[var(--border)]">
          {(["1M", "6M", "1Y", "3Y", "5Y", "10Y"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-sm transition-all cursor-pointer ${
                range === t
                  ? "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] shadow-xs font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className="flex items-center space-x-4 text-[10px] font-medium">
          {/* Chart type */}
          <div className="flex items-center space-x-0.5 bg-[var(--background-secondary)] p-0.5 rounded-md border border-[var(--border)]">
            <button
              onClick={() => setChartType("line")}
              className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                chartType === "line"
                  ? "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] shadow-xs font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType("candlestick")}
              className={`px-2 py-0.5 rounded-sm transition-all cursor-pointer ${
                chartType === "candlestick"
                  ? "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] shadow-xs font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              }`}
            >
              Candle
            </button>
          </div>

          {/* Indicators */}
          <div className="flex items-center space-x-3 text-[var(--text-secondary)]">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showDMA50}
                onChange={(e) => setShowDMA50(e.target.checked)}
                className="rounded-xs border-neutral-300 text-teal-600 focus:ring-teal-500 h-3 w-3 accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">DMA 50</span>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showDMA200}
                onChange={(e) => setShowDMA200(e.target.checked)}
                className="rounded-xs border-neutral-300 text-teal-600 focus:ring-teal-500 h-3 w-3 accent-teal-600 cursor-pointer"
              />
              <span className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">DMA 200</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            </label>
          </div>
        </div>
      </div>

      {/* Tooltip HUD */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-[var(--text-secondary)] mb-3 border-b border-[var(--border)] pb-2">
        <div>
          Date: <span ref={dateRef} className="font-semibold text-[var(--foreground)] font-mono" />
        </div>
        <div className="flex gap-4">
          <div>
            O: <span ref={openRef} className="font-semibold text-[var(--foreground)] tabular-nums" />
          </div>
          <div>
            H: <span ref={highRef} className="font-semibold text-[var(--foreground)] tabular-nums" />
          </div>
          <div>
            L: <span ref={lowRef} className="font-semibold text-[var(--foreground)] tabular-nums" />
          </div>
          <div>
            C: <span ref={closeRef} className="font-semibold text-[var(--foreground)] tabular-nums" />
          </div>
          <div>
            V: <span ref={volumeRef} className="font-semibold text-[var(--foreground)] tabular-nums" />
          </div>
        </div>
      </div>

      {/* Chart DOM node wrapper */}
      <div className="relative w-full">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-slate-950/70">
            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600 dark:text-teal-400" />
              <span>Fetching {range} historical range...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-[400px]" />
      </div>
    </div>
  );
}
export default InteractiveChart;
