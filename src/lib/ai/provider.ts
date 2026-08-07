import "server-only";
import { generateAIComparison } from "./groq";
import { ComparisonAnalysis } from "./schemas";

export interface AIProvider {
  compareStocks(comparisonData: unknown): Promise<ComparisonAnalysis>;
}

export const aiProvider: AIProvider = {
  compareStocks: async (comparisonData: unknown) => {
    return generateAIComparison(comparisonData);
  },
};
export default aiProvider;
