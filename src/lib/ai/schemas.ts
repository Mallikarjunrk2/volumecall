import { z } from "zod";

export const ComparisonAnalysisSchema = z.object({
  overallRead: z.string(),
  valuation: z.string(),
  profitability: z.string(),
  capitalEfficiency: z.string(),
  financialHealth: z.string(),
  growth: z.string(),
  marketPosition: z.string(),
  recentDevelopments: z.string(),
  comparisonRead: z.string(),
});

export type ComparisonAnalysis = z.infer<typeof ComparisonAnalysisSchema>;
