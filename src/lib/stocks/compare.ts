import { StockPrice, StockProfile, StockRatio } from "./types";
import { CalculatedMetrics } from "./calculations";

export interface StockCompareInput {
  symbol: string;
  name: string;
  price: StockPrice | null;
  profile: StockProfile | null;
  ratios: StockRatio[];
  metrics: CalculatedMetrics;
}

export interface MetricComparison {
  companyValue: string;
  sectorValue: string;
  diffPercent: number | null; // e.g. +15.5 meaning 15.5% above, -10.2 meaning 10.2% below sector
  position: "above-sector" | "below-sector" | "neutral" | "N/A";
  label: string; // e.g. "17.7% above sector" or "15.0% discount to sector"
}

export interface StockInsight {
  metric: string;
  actualValue: string;
  sectorValue: string;
  diffValue: string;
  diffPercent: number | null;
  position: string;
  classification: "positive" | "watchpoint" | "neutral";
  observation: string;
  explanation: string;
}

export interface StockCompareResult {
  symbol: string;
  name: string;
  sector: string;
  price: number | null;
  changePercent: number | null;
  pe: MetricComparison;
  pb: MetricComparison;
  evEbitda: MetricComparison;
  roe: MetricComparison;
  roce: MetricComparison;
  roa: MetricComparison;
  quickRatio: MetricComparison;
  return1M: number | null;
  return6M: number | null;
  return1Y: number | null;
  cagr3Y: number | null;
  cagr5Y: number | null;
  cagr10Y: number | null;
  dma50: number | null;
  dma200: number | null;
  dma50Position: "above-dma" | "below-dma" | "N/A";
  dma200Position: "above-dma" | "below-dma" | "N/A";
  range52WPosition: "near-high" | "near-low" | "mid-range" | "N/A";
  high52W: number | null;
  low52W: number | null;
  insights: StockInsight[];
  ratios: StockRatio[];
  profile: StockProfile | null;
}

export interface ComparisonSummary {
  crossIndustry: boolean;
  leaders: {
    valuation: string; // symbol or "Mixed"
    profitability: string; // symbol or "Mixed"
    capitalEfficiency: string; // symbol or "Mixed"
    performance: string; // symbol or "Mixed"
  };
  snapshot: {
    [symbol: string]: {
      valuation: "Premium" | "Discount" | "Inline" | "N/A";
      profitability: "Above Sector" | "Below Sector" | "Inline" | "N/A";
      capitalEfficiency: "Above Sector" | "Below Sector" | "Inline" | "N/A";
      historicalPerformance: string;
    };
  };
}

export interface FightData {
  stocks: StockCompareResult[];
  summary: ComparisonSummary;
}

/**
 * Safely parses ratio string value (like "20.09" or "8.94%" or "-") into number.
 */
function parseRatio(val: string | undefined): number | null {
  if (!val || val === "N/A" || val === "-" || val === "0" || val === "0.00") return null;
  const clean = val.replace("%", "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

function compareMetric(companyValStr: string | undefined, sectorValStr: string | undefined, isValuation = false): MetricComparison {
  const comp = companyValStr ? parseRatio(companyValStr) : null;
  const sect = sectorValStr ? parseRatio(sectorValStr) : null;

  const result: MetricComparison = {
    companyValue: companyValStr || "N/A",
    sectorValue: sectorValStr || "N/A",
    diffPercent: null,
    position: "N/A",
    label: "N/A",
  };

  // If valuation multiple (like P/E) and either value is negative or zero, mark position as N/A (not meaningful)
  if (isValuation && ((comp !== null && comp <= 0) || (sect !== null && sect <= 0))) {
    result.label = "Not meaningful (negative or zero multiple)";
    return result;
  }

  if (comp !== null && sect !== null && sect !== 0) {
    const diff = comp - sect;
    const diffPct = (diff / Math.abs(sect)) * 100;
    result.diffPercent = diffPct;

    if (diff > 0) {
      result.position = "above-sector";
      result.label = isValuation 
        ? `${Math.abs(diffPct).toFixed(1)}% premium to sector`
        : `${Math.abs(diffPct).toFixed(1)}% above sector`;
    } else if (diff < 0) {
      result.position = "below-sector";
      result.label = isValuation 
        ? `${Math.abs(diffPct).toFixed(1)}% discount to sector`
        : `${Math.abs(diffPct).toFixed(1)}% below sector`;
    } else {
      result.position = "neutral";
      result.label = "matching sector";
    }
  } else if (comp !== null) {
    result.label = "No sector average available";
  }

  return result;
}

/**
 * Builds the deterministic comparison payload for 2-5 stocks.
 */
export function buildStockComparison(inputs: StockCompareInput[]): FightData {
  // 1. Map individual stock calculations
  const stocks: StockCompareResult[] = inputs.map((input) => {
    const peRatio = input.ratios.find((r) => r.name.toLowerCase().includes("p/e"));
    const pbRatio = input.ratios.find((r) => r.name.toLowerCase() === "p/b");
    const evEbitdaRatio = input.ratios.find((r) => r.name.toLowerCase().includes("ev/ebitda"));
    const roeRatio = input.ratios.find((r) => r.name.toLowerCase() === "roe");
    const roceRatio = input.ratios.find((r) => r.name.toLowerCase() === "roce");
    const roaRatio = input.ratios.find((r) => r.name.toLowerCase() === "roa");
    const quickRatio = input.ratios.find((r) => r.name.toLowerCase().includes("quick"));

    const priceVal = input.price?.lastPrice ?? null;
    const dma50Val = input.metrics.dma50;
    const dma200Val = input.metrics.dma200;
    const high52 = input.metrics.high52W;
    const low52 = input.metrics.low52W;

    let dma50Position: "above-dma" | "below-dma" | "N/A" = "N/A";
    if (priceVal && dma50Val) {
      dma50Position = priceVal > dma50Val ? "above-dma" : "below-dma";
    }

    let dma200Position: "above-dma" | "below-dma" | "N/A" = "N/A";
    if (priceVal && dma200Val) {
      dma200Position = priceVal > dma200Val ? "above-dma" : "below-dma";
    }

    let range52WPosition: "near-high" | "near-low" | "mid-range" | "N/A" = "N/A";
    if (priceVal && high52 && low52 && high52 > low52) {
      const pct = (priceVal - low52) / (high52 - low52);
      if (pct >= 0.8) range52WPosition = "near-high";
      else if (pct <= 0.2) range52WPosition = "near-low";
      else range52WPosition = "mid-range";
    }

    // Generate deterministic insights layer
    const insights: StockInsight[] = [];

    // ROE Insight
    if (roeRatio) {
      const cVal = parseRatio(roeRatio.companyValue);
      const sVal = parseRatio(roeRatio.sectorValue);
      if (cVal !== null && sVal !== null) {
        const diff = cVal - sVal;
        const diffPercent = sVal !== 0 ? (diff / Math.abs(sVal)) * 100 : 0;
        const diffVal = `${diff > 0 ? "+" : ""}${diff.toFixed(2)}%`;
        if (diff >= 5.0) {
          insights.push({
            metric: "Return on Equity (ROE)",
            actualValue: roeRatio.companyValue,
            sectorValue: roeRatio.sectorValue,
            diffValue: `${diffVal} points`,
            diffPercent,
            position: `${Math.abs(diff).toFixed(2)}% above sector`,
            classification: "positive",
            observation: "ROE is materially above the sector average.",
            explanation: "The company generated stronger returns on shareholder equity compared to the industry benchmark.",
          });
        } else if (diff <= -5.0) {
          insights.push({
            metric: "Return on Equity (ROE)",
            actualValue: roeRatio.companyValue,
            sectorValue: roeRatio.sectorValue,
            diffValue: `${diffVal} points`,
            diffPercent,
            position: `${Math.abs(diff).toFixed(2)}% below sector`,
            classification: "watchpoint",
            observation: "ROE is materially below the sector average.",
            explanation: "The company generated weaker shareholder returns than industry peers during this period.",
          });
        }
      }
    }

    // ROCE Insight
    if (roceRatio) {
      const cVal = parseRatio(roceRatio.companyValue);
      const sVal = parseRatio(roceRatio.sectorValue);
      if (cVal !== null && sVal !== null) {
        const diff = cVal - sVal;
        const diffPercent = sVal !== 0 ? (diff / Math.abs(sVal)) * 100 : 0;
        const diffVal = `${diff > 0 ? "+" : ""}${diff.toFixed(2)}%`;
        if (diff >= 5.0) {
          insights.push({
            metric: "Return on Capital Employed (ROCE)",
            actualValue: roceRatio.companyValue,
            sectorValue: roceRatio.sectorValue,
            diffValue: `${diffVal} points`,
            diffPercent,
            position: `${Math.abs(diff).toFixed(2)}% above sector`,
            classification: "positive",
            observation: "Capital efficiency (ROCE) is materially above the sector average.",
            explanation: "The company is highly efficient at generating profits from its capital employed compared to industry averages.",
          });
        } else if (diff <= -5.0) {
          insights.push({
            metric: "Return on Capital Employed (ROCE)",
            actualValue: roceRatio.companyValue,
            sectorValue: roceRatio.sectorValue,
            diffValue: `${diffVal} points`,
            diffPercent,
            position: `${Math.abs(diff).toFixed(2)}% below sector`,
            classification: "watchpoint",
            observation: "Capital efficiency (ROCE) is materially below the sector average.",
            explanation: "The returns generated on total capital deployed are weaker than the sector benchmark.",
          });
        }
      }
    }

    // P/E Insight (Ensure non-negative valuation multiple comparison)
    if (peRatio) {
      const cVal = parseRatio(peRatio.companyValue);
      const sVal = parseRatio(peRatio.sectorValue);
      if (cVal !== null && sVal !== null && cVal > 0 && sVal > 0) {
        const ratio = cVal / sVal;
        const diffPct = ((cVal - sVal) / sVal) * 100;
        const diffVal = `${diffPct > 0 ? "+" : ""}${diffPct.toFixed(1)}%`;
        if (ratio <= 0.9) {
          insights.push({
            metric: "Price-to-Earnings (P/E)",
            actualValue: peRatio.companyValue,
            sectorValue: peRatio.sectorValue,
            diffValue: diffVal,
            diffPercent: diffPct,
            position: "Discount to Sector",
            classification: "positive",
            observation: "Trades at a valuation discount relative to its sector average.",
            explanation: "The stock trades at a lower P/E multiple than its sector average. While this suggests it may be cheaper, the discount should be weighed against growth expectations.",
          });
        } else if (ratio >= 1.1) {
          insights.push({
            metric: "Price-to-Earnings (P/E)",
            actualValue: peRatio.companyValue,
            sectorValue: peRatio.sectorValue,
            diffValue: diffVal,
            diffPercent: diffPct,
            position: "Premium to Sector",
            classification: "watchpoint",
            observation: "Trades at a valuation premium relative to its sector average.",
            explanation: "The stock trades at a higher P/E multiple than its sector benchmark. This valuation premium requires stronger fundamental growth or capital efficiency to justify.",
          });
        }
      }
    }

    // DMA Position Insight
    if (priceVal && dma200Val) {
      const diffVal = priceVal - dma200Val;
      const diffPct = (diffVal / dma200Val) * 100;
      if (priceVal < dma200Val) {
        insights.push({
          metric: "Price vs 200 DMA",
          actualValue: `₹${priceVal}`,
          sectorValue: `₹${dma200Val.toFixed(1)}`,
          diffValue: `${diffPct.toFixed(1)}%`,
          diffPercent: diffPct,
          position: "Below 200 DMA",
          classification: "neutral",
          observation: "Trading below its 200-day moving average.",
          explanation: "The stock is trading below its long-term average, which generally indicates a medium-to-long-term downward trend in price momentum.",
        });
      } else {
        insights.push({
          metric: "Price vs 200 DMA",
          actualValue: `₹${priceVal}`,
          sectorValue: `₹${dma200Val.toFixed(1)}`,
          diffValue: `+${diffPct.toFixed(1)}%`,
          diffPercent: diffPct,
          position: "Above 200 DMA",
          classification: "neutral",
          observation: "Trading above its 200-day moving average.",
          explanation: "The stock is trading above its long-term average, suggesting supportive upward pricing momentum.",
        });
      }
    }

    return {
      symbol: input.symbol,
      name: input.name,
      sector: input.profile?.sector ?? "N/A",
      price: priceVal,
      changePercent: input.price?.changePercent ?? null,
      pe: compareMetric(peRatio?.companyValue, peRatio?.sectorValue, true),
      pb: compareMetric(pbRatio?.companyValue, pbRatio?.sectorValue, true),
      evEbitda: compareMetric(evEbitdaRatio?.companyValue, evEbitdaRatio?.sectorValue, true),
      roe: compareMetric(roeRatio?.companyValue, roeRatio?.sectorValue),
      roce: compareMetric(roceRatio?.companyValue, roceRatio?.sectorValue),
      roa: compareMetric(roaRatio?.companyValue, roaRatio?.sectorValue),
      quickRatio: compareMetric(quickRatio?.companyValue, quickRatio?.sectorValue),
      return1M: input.metrics.return1M,
      return6M: input.metrics.return6M,
      return1Y: input.metrics.return1Y,
      cagr3Y: input.metrics.cagr3Y,
      cagr5Y: input.metrics.cagr5Y,
      cagr10Y: input.metrics.cagr10Y,
      dma50: dma50Val,
      dma200: dma200Val,
      dma50Position,
      dma200Position,
      range52WPosition,
      high52W: high52,
      low52W: low52,
      insights,
      ratios: input.ratios,
      profile: input.profile,
    };
  });

  // 2. Determine if it is a cross-industry comparison
  const uniqueSectors = new Set(stocks.map((s) => s.sector.toLowerCase()).filter((sec) => sec && sec !== "n/a"));
  const crossIndustry = uniqueSectors.size > 1;

  // 3. Determine category leaders
  let valuationLeader = "Mixed";
  let minPeRatioVal = Infinity;
  stocks.forEach((s) => {
    const compPe = parseRatio(s.pe.companyValue);
    const sectPe = parseRatio(s.pe.sectorValue);
    // Ignore negative PE in leadership calculation
    if (compPe !== null && compPe > 0 && sectPe !== null && sectPe > 0) {
      const score = compPe / sectPe;
      if (score < minPeRatioVal) {
        minPeRatioVal = score;
        valuationLeader = s.symbol;
      }
    }
  });

  let profitabilityLeader = "Mixed";
  let maxRoeVal = -Infinity;
  stocks.forEach((s) => {
    const compRoe = parseRatio(s.roe.companyValue);
    const sectRoe = parseRatio(s.roe.sectorValue);
    if (compRoe !== null) {
      const score = sectRoe !== null && sectRoe > 0 ? compRoe / sectRoe : compRoe;
      if (score > maxRoeVal) {
        maxRoeVal = score;
        profitabilityLeader = s.symbol;
      }
    }
  });

  let capitalEfficiencyLeader = "Mixed";
  let maxRoceVal = -Infinity;
  stocks.forEach((s) => {
    const compRoce = parseRatio(s.roce.companyValue);
    const sectRoce = parseRatio(s.roce.sectorValue);
    if (compRoce !== null) {
      const score = sectRoce !== null && sectRoce > 0 ? compRoce / sectRoce : compRoce;
      if (score > maxRoceVal) {
        maxRoceVal = score;
        capitalEfficiencyLeader = s.symbol;
      }
    }
  });

  let performanceLeader = "Mixed";
  let maxReturn = -Infinity;
  stocks.forEach((s) => {
    const ret = s.return1Y;
    if (ret !== null && ret > maxReturn) {
      maxReturn = ret;
      performanceLeader = s.symbol;
    }
  });

  // 4. Generate Snapshot maps (Valuation, Profitability, Capital Efficiency, Historical Performance)
  const snapshot: {
    [symbol: string]: {
      valuation: "Premium" | "Discount" | "Inline" | "N/A";
      profitability: "Above Sector" | "Below Sector" | "Inline" | "N/A";
      capitalEfficiency: "Above Sector" | "Below Sector" | "Inline" | "N/A";
      historicalPerformance: string;
    };
  } = {};

  stocks.forEach((s) => {
    let valClass: "Premium" | "Discount" | "Inline" | "N/A" = "N/A";
    if (s.pe.position === "above-sector") valClass = "Premium";
    else if (s.pe.position === "below-sector") valClass = "Discount";
    else if (s.pe.position === "neutral") valClass = "Inline";

    let profClass: "Above Sector" | "Below Sector" | "Inline" | "N/A" = "N/A";
    if (s.roe.position === "above-sector") profClass = "Above Sector";
    else if (s.roe.position === "below-sector") profClass = "Below Sector";
    else if (s.roe.position === "neutral") profClass = "Inline";

    let capClass: "Above Sector" | "Below Sector" | "Inline" | "N/A" = "N/A";
    if (s.roce.position === "above-sector") capClass = "Above Sector";
    else if (s.roce.position === "below-sector") capClass = "Below Sector";
    else if (s.roce.position === "neutral") capClass = "Inline";

    const perfStr = s.return1Y !== null ? `${s.return1Y > 0 ? "+" : ""}${s.return1Y.toFixed(1)}%` : "N/A";

    snapshot[s.symbol] = {
      valuation: valClass,
      profitability: profClass,
      capitalEfficiency: capClass,
      historicalPerformance: perfStr,
    };
  });

  return {
    stocks,
    summary: {
      crossIndustry,
      leaders: {
        valuation: valuationLeader,
        profitability: profitabilityLeader,
        capitalEfficiency: capitalEfficiencyLeader,
        performance: performanceLeader,
      },
      snapshot,
    },
  };
}
