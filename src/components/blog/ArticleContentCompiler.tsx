import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { CalloutBox } from "./embeds/CalloutBox";
import { CalculatorEmbed } from "./embeds/CalculatorEmbed";
import { StockEmbed } from "./embeds/StockEmbed";
import { StockComparisonEmbed } from "./embeds/StockComparisonEmbed";
import { SocialEmbed } from "./embeds/SocialEmbed";
import { isCalculatorAllowed } from "@/lib/cms/calculator-registry";
import { validateSocialEmbed } from "@/lib/cms/social-registry";

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface ArticleContentCompilerProps {
  content: string;
  className?: string;
  articleTitle?: string;
}

type ContentSegment =
  | { type: "markdown"; content: string }
  | { type: "callout"; calloutType: "tip" | "warning"; title?: string; content: string }
  | { type: "calculator"; id: string }
  | { type: "stock"; symbol: string }
  | { type: "comparison"; symbols: string }
  | { type: "social"; platform: string; typeAttr?: string; url: string };

/**
 * Extracts H2 and H3 headings from markdown for Table of Contents.
 */
export function extractTocHeadings(rawMarkdown: string): TocHeading[] {
  if (!rawMarkdown) return [];
  const lines = rawMarkdown.split("\n");
  const headings: TocHeading[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].replace(/[*_~`#]/g, "").trim();
      const id = rawText
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (id && rawText) {
        headings.push({ id, text: rawText, level });
      }
    }
  }

  return headings;
}

/**
 * Removes duplicate leading H1 from the article body if present,
 * ensuring the page maintains exactly one primary H1.
 */
function sanitizeLeadingH1(rawContent: string, articleTitle?: string): string {
  if (!rawContent) return "";
  const lines = rawContent.split("\n");
  const firstNonEmptyIdx = lines.findIndex((l) => l.trim().length > 0);

  if (firstNonEmptyIdx !== -1) {
    const firstLine = lines[firstNonEmptyIdx].trim();
    if (firstLine.startsWith("# ")) {
      const headingText = firstLine.replace(/^#\s+/, "").trim().toLowerCase();
      const cleanTitle = (articleTitle || "").trim().toLowerCase();

      // If the heading text matches the article title or is an isolated leading title H1
      if (!cleanTitle || headingText === cleanTitle || headingText.includes(cleanTitle.slice(0, 20))) {
        lines.splice(firstNonEmptyIdx, 1);
        return lines.join("\n");
      }
    }
  }
  return rawContent;
}

/**
 * Parses article markdown content into structured segments of markdown,
 * callouts (:::tip, :::warning), and VolumeCall directive embeds (::calculator, ::stock, ::comparison, ::social).
 */
function parseArticleContent(rawContent: string, articleTitle?: string): ContentSegment[] {
  const sanitized = sanitizeLeadingH1(rawContent, articleTitle);
  if (!sanitized || !sanitized.trim()) return [];

  const segments: ContentSegment[] = [];

  // Regex to match callout blocks: :::tip[Title] ... ::: or :::warning[Title] ... :::
  // and inline directives: ::calculator{id="..."}, ::stock{symbol="..."}, ::comparison{symbols="..."} ::social{platform="..." url="..."}
  const tokenRegex = /(?:::+(tip|warning)(?:\[(.*?)\])?\s*\n([\s\S]*?)\n:::+)|(?:^::(calculator|stock|comparison|social)\{(.*?)\}\s*$)/gm;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(sanitized)) !== null) {
    const matchStart = match.index;
    const matchEnd = tokenRegex.lastIndex;

    // 1. Push preceding normal markdown text if any
    if (matchStart > lastIndex) {
      const precedingMd = sanitized.slice(lastIndex, matchStart).trim();
      if (precedingMd) {
        segments.push({ type: "markdown", content: precedingMd });
      }
    }

    if (match[1]) {
      // 2. Callout Block
      const calloutType = match[1] as "tip" | "warning";
      const rawTitle = match[2] || "";
      const safeTitle = rawTitle.replace(/[<>{}[\]]/g, "").slice(0, 80).trim() || undefined;
      const body = match[3] || "";
      segments.push({
        type: "callout",
        calloutType,
        title: safeTitle,
        content: body,
      });
    } else if (match[4]) {
      // 3. Directive Tag
      const directive = match[4];
      const argsRaw = match[5] || "";

      if (directive === "calculator") {
        const idMatch = argsRaw.match(/id=["']([a-zA-Z0-9_-]+)["']/);
        const calcId = idMatch ? idMatch[1].toLowerCase() : "";
        if (isCalculatorAllowed(calcId)) {
          segments.push({ type: "calculator", id: calcId });
        } else {
          // Reject unknown calculator: fallback to safe markdown text
          segments.push({ type: "markdown", content: match[0] });
        }
      } else if (directive === "stock") {
        const symMatch = argsRaw.match(/symbol=["']([a-zA-Z0-9_-]+)["']/);
        const symbol = symMatch ? symMatch[1].toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20) : "";
        if (symbol) {
          segments.push({ type: "stock", symbol });
        } else {
          segments.push({ type: "markdown", content: match[0] });
        }
      } else if (directive === "comparison") {
        const symsMatch = argsRaw.match(/symbols=["'](.*?)["']/);
        const rawSymbols = symsMatch ? symsMatch[1] : "";
        const cleanList = rawSymbols
          .split(",")
          .map((s) => s.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 20))
          .filter(Boolean);

        if (cleanList.length >= 2 && cleanList.length <= 5) {
          segments.push({ type: "comparison", symbols: cleanList.join(",") });
        } else {
          // Invalid symbol count: fallback to safe markdown text
          segments.push({ type: "markdown", content: match[0] });
        }
      } else if (directive === "social") {
        const platformMatch = argsRaw.match(/platform=["']([a-zA-Z0-9_-]+)["']/);
        const typeMatch = argsRaw.match(/type=["']([a-zA-Z0-9_-]+)["']/);
        const urlMatch = argsRaw.match(/url=["'](.*?)["']/);

        const platform = platformMatch ? platformMatch[1].toLowerCase() : "";
        const typeAttr = typeMatch ? typeMatch[1].toLowerCase() : undefined;
        const rawUrl = urlMatch ? urlMatch[1].trim() : "";

        const parsed = validateSocialEmbed(platform, rawUrl, typeAttr);
        if (parsed && parsed.valid) {
          segments.push({
            type: "social",
            platform: parsed.platform,
            typeAttr: parsed.type,
            url: parsed.normalizedUrl,
          });
        } else {
          // Reject invalid social embed: fallback to safe markdown text
          segments.push({ type: "markdown", content: match[0] });
        }
      }
    }

    lastIndex = matchEnd;
  }

  // 4. Push remaining markdown text after last match
  if (lastIndex < sanitized.length) {
    const trailingMd = sanitized.slice(lastIndex).trim();
    if (trailingMd) {
      segments.push({ type: "markdown", content: trailingMd });
    }
  }

  return segments;
}

export function ArticleContentCompiler({
  content,
  className = "",
  articleTitle,
}: ArticleContentCompilerProps) {
  const segments = parseArticleContent(content, articleTitle);

  if (segments.length === 0) {
    return null;
  }

  return (
    <div className={`article-compiled-body w-full max-w-none space-y-6 ${className}`}>
      {segments.map((segment, index) => {
        switch (segment.type) {
          case "markdown":
            return <MarkdownRenderer key={`md-${index}`} content={segment.content} />;

          case "callout":
            return (
              <CalloutBox
                key={`callout-${index}`}
                type={segment.calloutType}
                title={segment.title}
                content={segment.content}
              />
            );

          case "calculator":
            return <CalculatorEmbed key={`calc-${index}-${segment.id}`} id={segment.id} />;

          case "stock":
            return <StockEmbed key={`stock-${index}-${segment.symbol}`} symbol={segment.symbol} />;

          case "comparison":
            return <StockComparisonEmbed key={`cmp-${index}-${segment.symbols}`} symbols={segment.symbols} />;

          case "social":
            return (
              <SocialEmbed
                key={`social-${index}-${segment.platform}-${segment.url}`}
                platform={segment.platform}
                type={segment.typeAttr}
                url={segment.url}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

export default ArticleContentCompiler;
