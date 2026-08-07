import { z } from "zod";

const missingValues = new Set(["", "-", "—", "NA", "N/A"]);

export const looseNumberSchema = z.preprocess((val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    const cleaned = val.trim();
    if (missingValues.has(cleaned) || missingValues.has(cleaned.toUpperCase())) {
      return null;
    }
    // Remove common characters like space, comma, and rupee symbol
    const cleanedNumStr = cleaned.replace(/[₹\s,]/g, "");
    if (/^-?\d+(\.\d+)?$/.test(cleanedNumStr)) {
      const num = parseFloat(cleanedNumStr);
      return isNaN(num) ? null : num;
    }
  }
  if (typeof val === "number") {
    return isNaN(val) ? null : val;
  }
  return val;
}, z.number().nullable());

export const RawIndianCompanyDetailsSchema = z.object({
  tickerId: z.string().optional().nullable(),
  companyName: z.string(),
  industry: z.string().optional().nullable(),
  companyProfile: z.unknown().optional().nullable(),
  currentPrice: z.unknown().optional().nullable(),
  percentChange: z.union([z.number(), z.string()]).optional().nullable(),
  yearHigh: z.union([z.number(), z.string()]).optional().nullable(),
  yearLow: z.union([z.number(), z.string()]).optional().nullable(),
  keyMetrics: z.unknown().optional().nullable(),
  shareholding: z.unknown().optional().nullable(),
  stockCorporateActionData: z.unknown().optional().nullable(),
  recentNews: z.unknown().optional().nullable(),
});

export const RawIndianHistoricalStatsSchema = z.record(
  z.string(),
  z.record(z.string(), looseNumberSchema)
);

export const RawIndianCompanyLogoSchema = z.object({
  content_type: z.string().refine((val) => val.startsWith("image/"), {
    message: "content_type must start with image/",
  }),
  base64_image: z.string().min(1, {
    message: "base64_image must not be empty",
  }),
});

