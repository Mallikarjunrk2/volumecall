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

// 6. Upstox Company Fundamentals schemas for testing
export const UpstoxBalanceSheetItemSchema = z.object({
  total_asset: z.number().nullable().optional(),
  total_liability: z.number().nullable().optional(),
  period: z.string(),
});

export const UpstoxBalanceSheetHistorySchema = z.object({
  type: z.string(),
  time_period: z.string(),
  units_in: z.string(),
  history: z.array(UpstoxBalanceSheetItemSchema),
  full_statement: z.array(z.unknown()).nullable().optional(),
});

export const UpstoxBalanceSheetResponseSchema = z.object({
  status: z.string(),
  data: UpstoxBalanceSheetHistorySchema,
});

export const UpstoxIncomeStatementCategorySchema = z.object({
  category: z.string(),
  history: z.array(z.object({
    value: z.number().nullable().optional(),
    period: z.string(),
    change: z.string().nullable().optional(),
  })),
});

export const UpstoxIncomeStatementHistorySchema = z.object({
  type: z.string(),
  time_period: z.string(),
  units_in: z.string(),
  income_statement: z.array(UpstoxIncomeStatementCategorySchema),
  full_statement: z.array(z.unknown()).nullable().optional(),
});

export const UpstoxIncomeStatementResponseSchema = z.object({
  status: z.string(),
  data: UpstoxIncomeStatementHistorySchema,
});

export const UpstoxShareholdingsCategorySchema = z.object({
  category: z.string(),
  history: z.array(z.object({
    value: z.number().nullable().optional(),
    period: z.string(),
  })),
});

export const UpstoxShareholdingsResponseSchema = z.object({
  status: z.string(),
  data: z.array(UpstoxShareholdingsCategorySchema),
});

export const UpstoxCorporateActionItemSchema = z.object({
  name: z.string(),
  expiry_date: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  ratio: z.string().nullable().optional(),
  event_details: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })).nullable().optional(),
});

export const UpstoxCorporateActionsResponseSchema = z.object({
  status: z.string(),
  data: z.array(UpstoxCorporateActionItemSchema),
});

export const UpstoxCompetitorItemSchema = z.object({
  company_profile: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  sector_market_cap_inr: z.unknown().nullable().optional(),
  sector_market_cap_usd: z.unknown().nullable().optional(),
  instrument_key: z.string(),
});

export const UpstoxCompetitorsResponseSchema = z.object({
  status: z.string(),
  data: z.array(UpstoxCompetitorItemSchema),
});

export const UpstoxIpoItemSchema = z.object({
  id: z.string(),
  symbol: z.string().nullable().optional(),
  name: z.string(),
  status: z.string(),
  isin: z.string().nullable().optional(),
  issue_type: z.string().nullable().optional(),
  issue_size: z.number().nullable().optional(),
  industry: z.string().nullable().optional(),
  minimum_price: z.number().nullable().optional(),
  maximum_price: z.number().nullable().optional(),
  bidding_start_date: z.string().nullable().optional(),
  bidding_end_date: z.string().nullable().optional(),
  total_subscription: z.string().nullable().optional(),
});

export const UpstoxIposResponseSchema = z.object({
  status: z.string(),
  data: z.array(UpstoxIpoItemSchema),
});
