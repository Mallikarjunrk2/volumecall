import { z } from "zod";

// 1. Key Ratios Schema
export const UpstoxKeyRatioItemSchema = z.object({
  name: z.string(),
  company_value: z.string(),
  sector_value: z.string(),
});

export const UpstoxKeyRatiosResponseSchema = z.object({
  status: z.string(),
  data: z.array(UpstoxKeyRatioItemSchema),
});

// 2. Company Profile Schema
export const MarketCapDetailSchema = z.object({
  value: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  formatted: z.string().nullable().optional(),
});

export const UpstoxProfileDataSchema = z.object({
  company_profile: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  sector_market_cap_inr: MarketCapDetailSchema.nullable().optional(),
  sector_market_cap_usd: MarketCapDetailSchema.nullable().optional(),
});

export const UpstoxProfileResponseSchema = z.object({
  status: z.string(),
  data: UpstoxProfileDataSchema,
});

// 3. Market Quote OHLC Schema
export const LiveOhlcSchema = z.object({
  open: z.number().nullable().optional(),
  high: z.number().nullable().optional(),
  low: z.number().nullable().optional(),
  close: z.number().nullable().optional(),
  volume: z.number().nullable().optional(),
  // Upstox V3 returns the candle start time as a Unix timestamp in milliseconds.
  ts: z.number().int().nullable().optional(),
});

export const UpstoxOhlcItemSchema = z.object({
  last_price: z.number().nullable().optional(),
  instrument_token: z.string(),
  live_ohlc: LiveOhlcSchema.nullable().optional(),
  prev_ohlc: LiveOhlcSchema.nullable().optional(),
});

export const UpstoxOhlcResponseSchema = z.object({
  status: z.string(),
  data: z.record(z.string(), UpstoxOhlcItemSchema),
});

// 4. Historical Candles Schema
// Array items represent: [timestamp, open, high, low, close, volume, open_interest]
export const UpstoxCandleTupleSchema = z.tuple([
  z.string(), // timestamp
  z.number(), // open
  z.number(), // high
  z.number(), // low
  z.number(), // close
  z.number(), // volume
  z.number().nullable().optional(), // open_interest
]);

export const UpstoxHistoricalCandleDataSchema = z.object({
  candles: z.array(UpstoxCandleTupleSchema),
});

export const UpstoxHistoricalCandleResponseSchema = z.object({
  status: z.string(),
  data: UpstoxHistoricalCandleDataSchema,
});

// 5. Instrument Search Schema
export const UpstoxSearchItemSchema = z.object({
  segment: z.string(),
  name: z.string(),
  exchange: z.string(),
  isin: z.string().nullable().optional(),
  instrument_type: z.string().nullable().optional(),
  instrument_key: z.string(),
  trading_symbol: z.string(),
  short_name: z.string().nullable().optional(),
});

export const UpstoxSearchResponseSchema = z.object({
  status: z.string(),
  data: z.array(UpstoxSearchItemSchema),
});
