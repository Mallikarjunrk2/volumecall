import { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveSymbol, getHistoricalCandles } from "@/lib/upstox/service";
import { calculateMovingAverages } from "@/lib/stocks/calculations";
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
    };
  }

  const name = instrument.name.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  return {
    title: `${name} Share Price, Financials & Stock Analysis | VolumeCall`,
    description: `View ${name} share price, stock chart, P/E, ROE, ROCE, financial ratios and fundamental analysis on VolumeCall.`,
    alternates: {
      canonical: `https://volumecall.in/stocks/${symbol.toLowerCase()}`,
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

  // Fetch initial candles (for 50 DMA, 200 DMA, 52W High/Low calculations)
  const rawInitialCandles = await getHistoricalCandles(instrument.instrumentKey, "2y");
  const initialCandles = calculateMovingAverages(rawInitialCandles);

  return (
    <>
      <Header />
      <StockResearchClient
        symbol={instrument.symbol}
        exchange={instrument.exchange}
        isin={instrument.isin}
        name={instrument.name}
        initialCandles={initialCandles}
      />
      <Footer />
    </>
  );
}
