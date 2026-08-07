export interface StockPrice {
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface StockRatio {
  name: string;
  companyValue: string; // Keep as string to preserve formatted metrics like % or N/A
  sectorValue: string;
}

export interface MarketCapValue {
  value: number | null;
  unit: string;
  formatted: string;
}

export interface StockProfile {
  companyProfile: string;
  sector: string;
  sectorMarketCapInr: MarketCapValue;
  sectorMarketCapUsd: MarketCapValue;
}

export interface Candle {
  time: string; // YYYY-MM-DD format for lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  dma50?: number | null;
  dma200?: number | null;
}

export interface SearchInstrument {
  segment: string;
  name: string;
  exchange: string;
  isin: string;
  instrumentKey: string;
  symbol: string;
}

export interface StockDetails {
  symbol: string;
  name: string;
  exchange: string;
  isin: string;
  instrumentKey: string;
  price: StockPrice | null;
  profile: StockProfile | null;
  ratios: StockRatio[];
  initialCandles: Candle[];
}
