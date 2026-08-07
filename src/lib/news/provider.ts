import "server-only";
import { getRecentDevelopments, NewsFetchResult } from "./newsdata";

export interface NewsProvider {
  getDevelopments(symbol: string, companyName: string): Promise<NewsFetchResult>;
}

export const newsProvider: NewsProvider = {
  getDevelopments: async (symbol: string, companyName: string) => {
    return getRecentDevelopments(symbol, companyName);
  },
};

export default newsProvider;
