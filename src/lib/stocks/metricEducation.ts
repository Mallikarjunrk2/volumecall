export interface MetricEducationItem {
  key: string;
  title: string;
  shortDefinition: string;
  whyItMatters: string;
  searchKeywords: string[];
}

export const METRIC_EDUCATION_MAP: Record<string, MetricEducationItem> = {
  pe: {
    key: "pe",
    title: "Price-to-Earnings Ratio (P/E)",
    shortDefinition: "Compares a company's share price relative to its annual earnings per share (EPS).",
    whyItMatters: "Helps investors determine if a stock is undervalued, fairly valued, or overvalued relative to peers and historical averages.",
    searchKeywords: ["pe ratio", "p/e", "price to earnings", "price-to-earnings"]
  },
  pb: {
    key: "pb",
    title: "Price-to-Book Ratio (P/B)",
    shortDefinition: "Compares a company's market valuation against the net asset value (book value) on its balance sheet.",
    whyItMatters: "Indicates how much investors are willing to pay for each rupee of net corporate asset value.",
    searchKeywords: ["pb ratio", "p/b", "price to book", "price-to-book"]
  },
  roe: {
    key: "roe",
    title: "Return on Equity (ROE)",
    shortDefinition: "Measures net profit generated as a percentage of total shareholder equity.",
    whyItMatters: "Reflects management's efficiency at generating profits using shareholder capital.",
    searchKeywords: ["roe", "return on equity"]
  },
  roce: {
    key: "roce",
    title: "Return on Capital Employed (ROCE)",
    shortDefinition: "Evaluates operating profit generated relative to total capital (debt + equity) employed in the business.",
    whyItMatters: "Shows how effectively a company allocates capital across all funding sources to generate operating income.",
    searchKeywords: ["roce", "return on capital employed"]
  },
  debtToEquity: {
    key: "debtToEquity",
    title: "Debt to Equity Ratio (D/E)",
    shortDefinition: "Compares total outstanding debt borrowings relative to total shareholder equity.",
    whyItMatters: "Indicates corporate financial leverage and insolvency risk. Lower values generally signify greater financial stability.",
    searchKeywords: ["debt-to-equity", "debt to equity", "d/e ratio"]
  },
  dividendYield: {
    key: "dividendYield",
    title: "Dividend Yield",
    shortDefinition: "Annual dividend payout per share expressed as a percentage of the current share price.",
    whyItMatters: "Measures cash return generated directly from dividends for income-focused investors.",
    searchKeywords: ["dividend yield", "dividend investing"]
  },
  eps: {
    key: "eps",
    title: "Earnings Per Share (EPS)",
    shortDefinition: "Portion of a company's net profit allocated to each individual outstanding share of common stock.",
    whyItMatters: "A fundamental driver of share price growth; rising EPS generally signals improving corporate profitability.",
    searchKeywords: ["eps", "earnings per share"]
  },
  marketCap: {
    key: "marketCap",
    title: "Market Capitalization",
    shortDefinition: "Total aggregate market value of all outstanding shares of a publicly traded company.",
    whyItMatters: "Determines company size class (Large Cap, Mid Cap, Small Cap) and helps assess liquidity and risk profile.",
    searchKeywords: ["market cap", "market capitalization"]
  },
  bookValue: {
    key: "bookValue",
    title: "Book Value Per Share",
    shortDefinition: "Net asset value per share if all corporate liabilities were paid off using total balance sheet assets.",
    whyItMatters: "Provides a baseline floor valuation for asset-rich companies.",
    searchKeywords: ["book value"]
  },
  opmPercent: {
    key: "opmPercent",
    title: "Operating Margin (OPM %)",
    shortDefinition: "Percentage of revenue remaining after covering operating costs and raw materials.",
    whyItMatters: "Measures core operational efficiency before interest, taxes, and non-operating income.",
    searchKeywords: ["operating margin", "opm"]
  },
  revenueGrowth: {
    key: "revenueGrowth",
    title: "Revenue Growth (YoY)",
    shortDefinition: "Percentage change in top-line sales over two comparable annual or quarterly reporting periods.",
    whyItMatters: "Indicates top-line demand expansion and business scale growth.",
    searchKeywords: ["revenue growth", "sales growth"]
  },
  profitGrowth: {
    key: "profitGrowth",
    title: "Profit Growth (YoY)",
    shortDefinition: "Percentage change in bottom-line net profit over two comparable annual or quarterly reporting periods.",
    whyItMatters: "Reflects bottom-line earnings momentum and margin expansion.",
    searchKeywords: ["profit growth", "net profit growth"]
  },
  cagr: {
    key: "cagr",
    title: "Compound Annual Growth Rate (CAGR)",
    shortDefinition: "Annualized rate of growth required for an investment or metric to grow from its beginning value to its ending value.",
    whyItMatters: "Smooths out annual volatility to provide a clear long-term multi-year growth trajectory.",
    searchKeywords: ["cagr", "compound annual growth rate"]
  },
  promoters: {
    key: "promoters",
    title: "Promoter Holding",
    shortDefinition: "Percentage of company equity owned by the founding promoters or parent group.",
    whyItMatters: "High promoter holding demonstrates strong founder commitment and confidence in the business.",
    searchKeywords: ["promoter holding", "promoter"]
  },
  fii: {
    key: "fii",
    title: "FII Holding (Foreign Institutional Investors)",
    shortDefinition: "Percentage of company equity held by foreign institutional investment funds and foreign portfolios.",
    whyItMatters: "Signals international institutional interest and global capital inflow confidence.",
    searchKeywords: ["fii holding", "foreign institutional"]
  },
  dii: {
    key: "dii",
    title: "DII Holding (Domestic Institutional Investors)",
    shortDefinition: "Percentage of company equity held by Indian mutual funds, insurance companies, and domestic institutions.",
    whyItMatters: "Reflects domestic institutional backing and local fund manager sentiment.",
    searchKeywords: ["dii holding", "domestic institutional"]
  }
};

/**
 * Utility to match published CMS articles against metric education keywords.
 */
export function matchMetricArticles(articles: { title: string; slug: string; tags?: string[] | null }[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [metricKey, ed] of Object.entries(METRIC_EDUCATION_MAP)) {
    const matchedArticle = articles.find((article) => {
      const titleLower = article.title.toLowerCase();
      const slugLower = article.slug.toLowerCase();
      const tagsLower = Array.isArray(article.tags) ? article.tags.map((t) => t.toLowerCase()) : [];

      return ed.searchKeywords.some((kw) => {
        const cleanKw = kw.toLowerCase();
        return titleLower.includes(cleanKw) || slugLower.includes(cleanKw.replace(/[^a-z0-9]/g, "-")) || tagsLower.includes(cleanKw);
      });
    });

    if (matchedArticle) {
      result[metricKey] = `/blog/${matchedArticle.slug}`;
    }
  }

  return result;
}
