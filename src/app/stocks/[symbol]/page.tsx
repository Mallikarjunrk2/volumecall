import { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveSymbol, getHistoricalCandles } from "@/lib/upstox/service";
import { calculateMovingAverages } from "@/lib/stocks/calculations";
import { getInitialOverview } from "@/lib/stocks/serverOverview";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StockResearchClient from "@/components/stocks/StockResearchClient";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

/**
 * Dynamic SEO metadata generation
 */
export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const params = await props.params;
  const symbol = params.symbol.toUpperCase();
  
  const instrument = await resolveSymbol(symbol);
  if (!instrument) {
    return {
      title: `${symbol} - Stock Not Found | VolumeCall`,
      description: `Stock search for ${symbol} on VolumeCall.`,
      robots: { index: false, follow: false },
    };
  }

  const name = instrument.name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const canonicalUrl = `https://volumecall.in/stocks/${symbol}`;
  const title = `${name} (${symbol}) Share Price, Ratios & Fundamental Analysis | VolumeCall`;
  const description = `Analyze ${name} (${symbol}) share price, interactive stock charts, P/E, ROE, ROCE, financial ratios, quarterly results, and shareholding patterns on VolumeCall.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "VolumeCall",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function StockPage(props: PageProps) {
  const params = await props.params;
  const symbol = params.symbol.toUpperCase();

  // Resolve the symbol to instrument key
  const instrument = await resolveSymbol(symbol);
  if (!instrument) {
    return notFound();
  }

  // Fetch initial candles & server-side overview snapshot in parallel
  const [rawInitialCandles, initialOverview] = await Promise.all([
    getHistoricalCandles(instrument.instrumentKey, "2y"),
    getInitialOverview(instrument.symbol, instrument.instrumentKey, instrument.isin, instrument.name),
  ]);
  const initialCandles = calculateMovingAverages(rawInitialCandles);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://volumecall.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Stocks",
        item: "https://volumecall.in/stocks",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${instrument.name} (${instrument.symbol})`,
        item: `https://volumecall.in/stocks/${instrument.symbol}`,
      },
    ],
  };

  const financialProductSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: `${instrument.name} (${instrument.symbol})`,
    tickerSymbol: instrument.symbol,
    exchange: instrument.exchange,
    description: `Fundamental research, financial statements, and technical price indicators for ${instrument.name} (${instrument.symbol}) on VolumeCall.`,
    url: `https://volumecall.in/stocks/${instrument.symbol}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }}
      />
      <Header />
      <StockResearchClient
        symbol={instrument.symbol}
        exchange={instrument.exchange}
        isin={instrument.isin}
        name={instrument.name}
        initialCandles={initialCandles}
        initialOverview={initialOverview}
      />
      <Footer />
    </>
  );
}
