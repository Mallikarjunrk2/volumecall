import { ProviderCompanyData } from "./providers";
import { normalizeRatios } from "../providers/indianapi/normalize";

export interface FallbackContext {
  price?: number | null;
  quarterlyResults?: unknown[];
  annualPL?: unknown[];
  balanceSheet?: unknown[];
  cashFlow?: unknown[];
}

export function resolveFallbackMetric(
  field: string,
  symbol: string,
  upstoxData: ProviderCompanyData | null,
  indianApiData: ProviderCompanyData | null,
  context?: FallbackContext
): string {
  const cleanSymbol = symbol.toUpperCase();
  
  // Upstox Key Ratios helper
  const getUpstoxRatio = (aliases: string[]): number | null => {
    if (!upstoxData?.ratios) return null;
    const ratio = upstoxData.ratios.find(r => {
      const name = r.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return aliases.some(alias => name.includes(alias.toLowerCase().replace(/[^a-z0-9]/g, "")));
    });
    if (!ratio) return null;
    const num = parseFloat(ratio.companyValue.replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? null : num;
  };

  // IndianAPI Ratios helper
  const getIndianApiRatio = (): ReturnType<typeof normalizeRatios> | null => {
    if (!indianApiData?.indianApiDetails) return null;
    try {
      return normalizeRatios(indianApiData.indianApiDetails);
    } catch {
      return null;
    }
  };

  const indianRatios = getIndianApiRatio();

  // Price helper
  const getPrice = (): number | null => {
    if (context?.price) return context.price;
    if (upstoxData?.price) return upstoxData.price.lastPrice;
    return null;
  };

  let value: number | null = null;
  let source = "—";

  switch (field.toLowerCase()) {
    case "pe":
    case "p/e": {
      const val = getUpstoxRatio(["pe", "p/e", "pricetoearnings"]);
      if (val !== null) {
        value = val;
        source = "Upstox";
        break;
      }
      if (indianRatios?.pe !== null && indianRatios?.pe !== undefined) {
        value = indianRatios.pe;
        source = "Indian API";
        break;
      }
      // Calculated: Price / EPS (if available)
      const price = getPrice();
      const eps = getUpstoxRatio(["eps", "earningspershare"]) || (context?.annualPL && (context.annualPL.slice(-1)[0] as Record<string, unknown> | undefined)?.eps as number | undefined);
      if (price !== null && eps && eps > 0) {
        value = price / eps;
        source = "Calculated (Price / EPS)";
        break;
      }
      break;
    }

    case "pb":
    case "p/b": {
      const val = getUpstoxRatio(["pb", "p/b", "pricetobook"]);
      if (val !== null) {
        value = val;
        source = "Upstox";
        break;
      }
      if (indianRatios?.pb !== null && indianRatios?.pb !== undefined) {
        value = indianRatios.pb;
        source = "Indian API";
        break;
      }
      break;
    }

    case "roe": {
      const val = getUpstoxRatio(["roe", "returnonequity"]);
      if (val !== null) {
        value = val;
        source = "Upstox";
        break;
      }
      if (indianRatios?.roe !== null && indianRatios?.roe !== undefined) {
        value = indianRatios.roe;
        source = "Indian API";
        break;
      }
      break;
    }

    case "roce": {
      const val = getUpstoxRatio(["roce", "returnoncapitalemployed"]);
      if (val !== null) {
        value = val;
        source = "Upstox";
        break;
      }
      if (indianRatios?.roce !== null && indianRatios?.roce !== undefined) {
        value = indianRatios.roce;
        source = "Indian API";
        break;
      }
      break;
    }

    case "debttoequity":
    case "debt/equity": {
      const val = getUpstoxRatio(["debttoequity", "debt/equity"]);
      if (val !== null) {
        value = val;
        source = "Upstox";
        break;
      }
      if (indianRatios?.debtToEquity !== null && indianRatios?.debtToEquity !== undefined) {
        value = indianRatios.debtToEquity;
        source = "Indian API";
        break;
      }
      break;
    }

    case "currentratio": {
      const val = getUpstoxRatio(["currentratio"]);
      if (val !== null) {
        value = val;
        source = "Upstox";
        break;
      }
      if (indianRatios?.currentRatio !== null && indianRatios?.currentRatio !== undefined) {
        value = indianRatios.currentRatio;
        source = "Indian API";
        break;
      }
      break;
    }

    case "interestcoverage": {
      const val = getUpstoxRatio(["interestcoverage"]);
      if (val !== null) {
        value = val;
        source = "Upstox";
        break;
      }
      if (indianRatios?.interestCoverage !== null && indianRatios?.interestCoverage !== undefined) {
        value = indianRatios.interestCoverage;
        source = "Indian API";
        break;
      }
      break;
    }

    case "dividendyield":
    case "dividend_yield": {
      const val = getUpstoxRatio(["dividendyield", "divyield"]);
      if (val !== null) {
        value = val;
        source = "Upstox";
        break;
      }
      if (indianRatios?.dividendYield !== null && indianRatios?.dividendYield !== undefined) {
        value = indianRatios.dividendYield;
        source = "Indian API";
        break;
      }
      break;
    }

    case "bookvalue":
    case "book_value": {
      const val = getUpstoxRatio(["bookvalue", "bv", "bookvaluepershare"]);
      if (val !== null) {
        value = val;
        source = "Upstox";
        break;
      }
      break;
    }
  }

  if (value !== null && !isNaN(value)) {
    console.log(`[Fallback Engine] ${cleanSymbol} ${field} resolved from ${source}: ${value}`);
    return value.toFixed(2);
  }

  return "—";
}
