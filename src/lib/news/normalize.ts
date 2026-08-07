import { NewsDataArticle } from "./schemas";

export type DevelopmentCategory =
  | "RESULTS"
  | "BUSINESS"
  | "ORDER_OR_DEAL"
  | "MANAGEMENT"
  | "REGULATORY"
  | "CORPORATE_ACTION"
  | "OTHER";

export interface RecentDevelopment {
  companySymbol: string;
  companyName: string;
  headline: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
  retrievedAt: string;
  category: DevelopmentCategory;
}

/**
 * Deterministically categorizes an article based on title & description keywords.
 */
export function categorizeArticle(title: string, desc: string): DevelopmentCategory {
  const text = `${title} ${desc}`.toLowerCase();

  // 1. RESULTS
  if (
    text.includes("quarter") ||
    text.includes("earnings") ||
    text.includes("q1") ||
    text.includes("q2") ||
    text.includes("q3") ||
    text.includes("q4") ||
    text.includes("net profit") ||
    text.includes("net loss") ||
    text.includes("revenue") ||
    text.includes("profit rose") ||
    text.includes("profit falls") ||
    text.includes("operating profit") ||
    text.includes("ebitda") ||
    text.includes("financial results")
  ) {
    return "RESULTS";
  }

  // 2. ORDER_OR_DEAL
  if (
    text.includes("order") ||
    text.includes("deal") ||
    text.includes("contract") ||
    text.includes("win") ||
    text.includes("secured") ||
    text.includes("partnership") ||
    text.includes("agreement")
  ) {
    return "ORDER_OR_DEAL";
  }

  // 3. REGULATORY
  if (
    text.includes("regulatory") ||
    text.includes("sebi") ||
    text.includes("fine") ||
    text.includes("penalty") ||
    text.includes("tax") ||
    text.includes("compliance") ||
    text.includes("investigation") ||
    text.includes("probe")
  ) {
    return "REGULATORY";
  }

  // 4. MANAGEMENT
  if (
    text.includes("appoint") ||
    text.includes("resigns") ||
    text.includes("ceo") ||
    text.includes("cfo") ||
    text.includes("board member") ||
    text.includes("md & ceo") ||
    text.includes("exit") ||
    text.includes("hire")
  ) {
    return "MANAGEMENT";
  }

  // 5. CORPORATE_ACTION
  if (
    text.includes("dividend") ||
    text.includes("bonus") ||
    text.includes("stock split") ||
    text.includes("buyback") ||
    text.includes("merger") ||
    text.includes("acquisition") ||
    text.includes("takeover")
  ) {
    return "CORPORATE_ACTION";
  }

  // 6. BUSINESS
  if (
    text.includes("launch") ||
    text.includes("expand") ||
    text.includes("business") ||
    text.includes("factory") ||
    text.includes("plant") ||
    text.includes("technology") ||
    text.includes("product")
  ) {
    return "BUSINESS";
  }

  return "OTHER";
}

/**
 * Normalizes a raw NewsDataArticle into a domain-specific RecentDevelopment.
 */
export function normalizeArticle(
  article: NewsDataArticle,
  companySymbol: string,
  companyName: string
): RecentDevelopment {
  const headline = article.title.trim();
  const description = article.description?.trim() || "No description available.";
  const sourceName = article.source_id || "News";
  const sourceUrl = article.link || article.source_url || "";
  const publishedAt = article.pubDate || new Date().toISOString();
  const retrievedAt = new Date().toISOString();
  
  const category = categorizeArticle(headline, description);

  return {
    companySymbol: companySymbol.toUpperCase(),
    companyName,
    headline,
    description,
    sourceName,
    sourceUrl,
    publishedAt,
    retrievedAt,
    category,
  };
}
