/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from "./index";
import { ProviderCompanyData } from "@/lib/stocks/providers";
import {
  normalizeFinancialPeriods,
  normalizeBalanceSheet,
  normalizeCashFlow
} from "@/lib/providers/indianapi/normalize";
import {
  FinancialPeriod,
  BalanceSheetPeriod,
  CashFlowPeriod,
  RawIndianCompanyDetails
} from "@/lib/providers/indianapi/types";

export async function persistCompanyData(data: ProviderCompanyData): Promise<void> {
  try {
    // 1. Upsert Company metadata
    const sector = data.profile?.sector || data.indianApiDetails?.industry || "N/A";
    const industry = data.indianApiDetails?.industry || "N/A";
    
    let description = data.profile?.companyProfile || "No description available.";
    let website: string | null = null;
    let logoUrl: string | null = null;

    if (data.indianApiDetails && typeof data.indianApiDetails === "object") {
      const rawDetails = data.indianApiDetails as unknown as Record<string, unknown>;
      const profileObj = rawDetails.companyProfile;
      if (profileObj && typeof profileObj === "object") {
        const rawProfile = profileObj as Record<string, unknown>;
        if (!data.profile?.companyProfile) {
          description = (rawProfile.companyDescription as string) || description;
        }
        website = (rawProfile.website as string) || null;
        logoUrl = (rawProfile.logoUrl as string) || null;
      }
    }

    const companyRows = await sql`
      INSERT INTO companies (
        symbol, name, isin, sector, industry, description, website, logo_url, updated_at
      ) VALUES (
        ${data.symbol}, ${data.name}, ${data.isin}, ${sector}, ${industry}, ${description}, ${website}, ${logoUrl}, NOW()
      )
      ON CONFLICT (symbol) DO UPDATE SET
        name = EXCLUDED.name,
        isin = EXCLUDED.isin,
        sector = EXCLUDED.sector,
        industry = EXCLUDED.industry,
        description = EXCLUDED.description,
        website = EXCLUDED.website,
        logo_url = EXCLUDED.logo_url,
        updated_at = NOW()
      RETURNING id;
    `;

    const companyId = companyRows[0]?.id;
    if (!companyId) {
      throw new Error(`Failed to upsert company record for ${data.symbol}`);
    }

    // 2. Upsert Financial Periods
    let annualPL: FinancialPeriod[] = [];
    if (data.indianApiYoyPL) {
      annualPL = normalizeFinancialPeriods(data.indianApiYoyPL);
    }
    let quarterlyPL: FinancialPeriod[] = [];
    if (data.indianApiQuarterlyPL) {
      quarterlyPL = normalizeFinancialPeriods(data.indianApiQuarterlyPL);
    }

    const upsertPeriods = async (periods: FinancialPeriod[], type: "ANNUAL" | "QUARTERLY") => {
      for (const p of periods) {
        await sql`
          INSERT INTO financial_periods (
            company_id, type, period, sales, expenses, operating_profit, opm_percent,
            other_income, interest, depreciation, profit_before_tax, tax_percent, net_profit, eps, source, retrieved_at
          ) VALUES (
            ${companyId}, ${type}, ${p.period}, ${p.sales}, ${p.expenses}, ${p.operatingProfit}, ${p.opmPercent},
            ${p.otherIncome}, ${p.interest}, ${p.depreciation}, ${p.profitBeforeTax}, ${p.taxPercent}, ${p.netProfit}, ${p.eps},
            'INDIAN_API', NOW()
          )
          ON CONFLICT (company_id, type, period) DO UPDATE SET
            sales = EXCLUDED.sales,
            expenses = EXCLUDED.expenses,
            operating_profit = EXCLUDED.operating_profit,
            opm_percent = EXCLUDED.opm_percent,
            other_income = EXCLUDED.other_income,
            interest = EXCLUDED.interest,
            depreciation = EXCLUDED.depreciation,
            profit_before_tax = EXCLUDED.profit_before_tax,
            tax_percent = EXCLUDED.tax_percent,
            net_profit = EXCLUDED.net_profit,
            eps = EXCLUDED.eps,
            source = EXCLUDED.source,
            retrieved_at = NOW();
        `;
      }
    };

    await upsertPeriods(annualPL, "ANNUAL");
    await upsertPeriods(quarterlyPL, "QUARTERLY");

    // 3. Upsert Balance Sheets
    let balanceSheets: BalanceSheetPeriod[] = [];
    if (data.indianApiBalanceSheet) {
      balanceSheets = normalizeBalanceSheet(data.indianApiBalanceSheet);
    }

    for (const b of balanceSheets) {
      await sql`
        INSERT INTO balance_sheets (
          company_id, period, equity_capital, reserves, borrowings, other_liabilities, total_liabilities,
          fixed_assets, cwip, investments, other_assets, total_assets, source, retrieved_at
        ) VALUES (
          ${companyId}, ${b.period}, ${b.equityCapital}, ${b.reserves}, ${b.borrowings}, ${b.otherLiabilities}, ${b.totalLiabilities},
          ${b.fixedAssets}, ${b.cwip}, ${b.investments}, ${b.otherAssets}, ${b.totalAssets}, 'INDIAN_API', NOW()
        )
        ON CONFLICT (company_id, period) DO UPDATE SET
          equity_capital = EXCLUDED.equity_capital,
          reserves = EXCLUDED.reserves,
          borrowings = EXCLUDED.borrowings,
          other_liabilities = EXCLUDED.other_liabilities,
          total_liabilities = EXCLUDED.total_liabilities,
          fixed_assets = EXCLUDED.fixed_assets,
          cwip = EXCLUDED.cwip,
          investments = EXCLUDED.investments,
          other_assets = EXCLUDED.other_assets,
          total_assets = EXCLUDED.total_assets,
          source = EXCLUDED.source,
          retrieved_at = NOW();
      `;
    }

    // 4. Upsert Cash Flows
    let cashFlows: CashFlowPeriod[] = [];
    if (data.indianApiCashFlow) {
      cashFlows = normalizeCashFlow(data.indianApiCashFlow);
    }

    for (const c of cashFlows) {
      await sql`
        INSERT INTO cash_flows (
          company_id, period, operating_cash_flow, investing_cash_flow, financing_cash_flow, net_cash_flow, source, retrieved_at
        ) VALUES (
          ${companyId}, ${c.period}, ${c.operatingCashFlow}, ${c.investingCashFlow}, ${c.financingCashFlow}, ${c.netCashFlow}, 'INDIAN_API', NOW()
        )
        ON CONFLICT (company_id, period) DO UPDATE SET
          operating_cash_flow = EXCLUDED.operating_cash_flow,
          investing_cash_flow = EXCLUDED.investing_cash_flow,
          financing_cash_flow = EXCLUDED.financing_cash_flow,
          net_cash_flow = EXCLUDED.net_cash_flow,
          source = EXCLUDED.source,
          retrieved_at = NOW();
      `;
    }

    console.log(`[Database Persistence] Successfully persisted records for ${data.symbol}`);
  } catch (error) {
    console.error(`[Database Persistence Error] Failed to persist data for ${data.symbol}:`, error);
    throw error;
  }
}

export async function getCompanyFromDb(symbol: string): Promise<ProviderCompanyData | null> {
  try {
    const cleanSym = symbol.toUpperCase();
    
    // 1. Fetch company metadata
    const companies = await sql`
      SELECT * FROM companies WHERE symbol = ${cleanSym};
    `;
    const company = companies[0];
    if (!company) return null;

    // 2. Fetch related historical data
    const [periods, balanceSheets, cashFlows] = await Promise.all([
      sql`SELECT * FROM financial_periods WHERE company_id = ${company.id} ORDER BY period;`,
      sql`SELECT * FROM balance_sheets WHERE company_id = ${company.id} ORDER BY period;`,
      sql`SELECT * FROM cash_flows WHERE company_id = ${company.id} ORDER BY period;`
    ]);

    // 3. Completeness Verification
    if (periods.length === 0 || balanceSheets.length === 0 || cashFlows.length === 0) {
      console.warn(`[Database Read Cache] Record for ${cleanSym} is incomplete (Periods: ${periods.length}, BalanceSheets: ${balanceSheets.length}, CashFlows: ${cashFlows.length})`);
      return null;
    }

    // 4. Freshness Verification (24-hour window)
    const lastUpdated = new Date(company.updated_at).getTime();
    const ageMs = Date.now() - lastUpdated;
    if (ageMs > 24 * 60 * 60 * 1000) {
      console.log(`[Database Read Cache] Record for ${cleanSym} is stale (Age: ${(ageMs / 3600000).toFixed(2)} hours)`);
      return null;
    }

    // 5. Reconstruct RawIndianCompanyDetails
    const rawDetails = {
      tickerId: company.symbol,
      companyName: company.name,
      industry: company.industry,
      companyProfile: {
        companyDescription: company.description,
        website: company.website,
        logoUrl: company.logo_url,
        isInId: company.isin
      }
    };

    // 6. Reconstruct raw statistics dictionaries
    const reconstructStats = (rows: Record<string, unknown>[], metricFields: string[]): Record<string, Record<string, number>> => {
      const stats: Record<string, Record<string, number>> = {};
      rows.forEach(row => {
        metricFields.forEach(field => {
          const val = row[field];
          if (val !== undefined && val !== null) {
            const alias = field.replace(/_/g, "");
            if (!stats[alias]) stats[alias] = {};
            stats[alias][row.period as string] = Number(val);
          }
        });
      });
      return stats;
    };

    const yoyPL = reconstructStats(
      periods.filter(p => p.type === "ANNUAL") as Record<string, unknown>[],
      ["sales", "expenses", "operating_profit", "opm_percent", "other_income", "interest", "depreciation", "profit_before_tax", "tax_percent", "net_profit", "eps"]
    );

    const quarterlyPL = reconstructStats(
      periods.filter(p => p.type === "QUARTERLY") as Record<string, unknown>[],
      ["sales", "expenses", "operating_profit", "opm_percent", "other_income", "interest", "depreciation", "profit_before_tax", "tax_percent", "net_profit", "eps"]
    );

    const reconstructedBalanceSheet = reconstructStats(
      balanceSheets as Record<string, unknown>[],
      ["equity_capital", "reserves", "borrowings", "other_liabilities", "total_liabilities", "fixed_assets", "cwip", "investments", "other_assets", "total_assets"]
    );

    const reconstructedCashFlow = reconstructStats(
      cashFlows as Record<string, unknown>[],
      ["operating_cash_flow", "investing_cash_flow", "financing_cash_flow", "net_cash_flow"]
    );

    console.log(`[Database Read Cache] Successfully read and reconstructed fresh record for ${cleanSym}`);

    return {
      symbol: company.symbol,
      name: company.name,
      exchange: "NSE",
      isin: company.isin,
      price: null,
      profile: {
        companyProfile: company.description || "No description available.",
        sector: company.sector || "N/A",
        sectorMarketCapInr: { value: null, unit: "Cr", formatted: "—" },
        sectorMarketCapUsd: { value: null, unit: "Cr", formatted: "—" }
      },
      ratios: [],
      indianApiDetails: rawDetails as unknown as RawIndianCompanyDetails,
      indianApiYoyPL: yoyPL,
      indianApiQuarterlyPL: quarterlyPL,
      indianApiShareholding: null,
      indianApiBalanceSheet: reconstructedBalanceSheet,
      indianApiCashFlow: reconstructedCashFlow
    };
  } catch (error) {
    console.error(`[Database Read Cache Error] Failed to retrieve record for ${symbol}:`, error);
    return null;
  }
}

export interface IpoItem {
  symbol: string | null;
  name: string;
  status: string;
  is_sme: boolean;
  additional_text: string | null;
  min_price: number | null;
  max_price: number | null;
  issue_price: number | null;
  listing_gains: number | null;
  listing_price: number | null;
  bidding_start_date: string | null;
  bidding_end_date: string | null;
  listing_date: string | null;
  allotment_date: string | null;
  lot_size: number | null;
  min_bid_quantity: number | null;
  total_subscription_rate: number | null;
  document_url: string | null;
}

export interface IpoPayload {
  upcoming: IpoItem[];
  listed: IpoItem[];
  active: IpoItem[];
  closed: IpoItem[];
  pre_apply: IpoItem[];
}

export async function getIposFromDb(): Promise<IpoPayload | null> {
  try {
    const latestResult = await sql`
      SELECT MAX(retrieved_at) as max_retrieved 
      FROM ipos;
    `;
    
    if (!latestResult || latestResult.length === 0 || !latestResult[0].max_retrieved) {
      console.log("[IPO Database Cache] PostgreSQL cache miss");
      return null;
    }
    
    const maxRetrieved = new Date(latestResult[0].max_retrieved as string);
    const ageMs = Date.now() - maxRetrieved.getTime();
    
    if (ageMs > 24 * 60 * 60 * 1000) {
      console.log("[IPO Database Cache] PostgreSQL data stale");
      return null;
    }
    
    const rows = await sql`
      SELECT * 
      FROM ipos 
      WHERE retrieved_at = ${maxRetrieved};
    `;
    
    const payload: IpoPayload = {
      upcoming: [],
      listed: [],
      active: [],
      closed: [],
      pre_apply: []
    };
    
    rows.forEach((row) => {
      const category = row.category as keyof IpoPayload;
      if (category in payload) {
        payload[category].push({
          symbol: row.symbol as string | null,
          name: row.name as string,
          status: row.status as string,
          is_sme: Boolean(row.is_sme),
          additional_text: row.additional_text as string | null,
          min_price: row.min_price !== null ? Number(row.min_price) : null,
          max_price: row.max_price !== null ? Number(row.max_price) : null,
          issue_price: row.issue_price !== null ? Number(row.issue_price) : null,
          listing_gains: row.listing_gains !== null ? Number(row.listing_gains) : null,
          listing_price: row.listing_price !== null ? Number(row.listing_price) : null,
          bidding_start_date: row.bidding_start_date as string | null,
          bidding_end_date: row.bidding_end_date as string | null,
          listing_date: row.listing_date as string | null,
          allotment_date: row.allotment_date as string | null,
          lot_size: row.lot_size !== null ? Number(row.lot_size) : null,
          min_bid_quantity: row.min_bid_quantity !== null ? Number(row.min_bid_quantity) : null,
          total_subscription_rate: row.total_subscription_rate !== null ? Number(row.total_subscription_rate) : null,
          document_url: row.document_url as string | null
        });
      }
    });
    
    console.log("[IPO Database Cache] Served IPO data from PostgreSQL");
    return payload;
  } catch (error) {
    console.error("[IPO Database Cache] Error reading IPOs from PostgreSQL:", error);
    throw error;
  }
}

export async function saveIposToDb(ipoData: unknown): Promise<void> {
  try {
    if (!ipoData || typeof ipoData !== "object") {
      throw new Error("Invalid IPO data payload format");
    }
    
    const typedData = ipoData as Partial<IpoPayload>;
    const categories: (keyof IpoPayload)[] = ["upcoming", "listed", "active", "closed", "pre_apply"];
    const batchTime = new Date();
    
    for (const category of categories) {
      const items = typedData[category] || [];
      if (!Array.isArray(items)) continue;
      
      for (const item of items) {
        const symbol = item.symbol !== undefined && item.symbol !== null ? String(item.symbol) : null;
        const name = item.name || "";
        const isSme = Boolean(item.is_sme);
        const status = item.status || category;
        const additionalText = item.additional_text !== undefined && item.additional_text !== null ? String(item.additional_text) : null;
        
        const minPrice = item.min_price !== undefined && item.min_price !== null ? Number(item.min_price) : null;
        const maxPrice = item.max_price !== undefined && item.max_price !== null ? Number(item.max_price) : null;
        const issuePrice = item.issue_price !== undefined && item.issue_price !== null ? Number(item.issue_price) : null;
        const listingGains = item.listing_gains !== undefined && item.listing_gains !== null ? Number(item.listing_gains) : null;
        const listingPrice = item.listing_price !== undefined && item.listing_price !== null ? Number(item.listing_price) : null;
        
        const biddingStartDate = item.bidding_start_date !== undefined && item.bidding_start_date !== null ? String(item.bidding_start_date) : null;
        const biddingEndDate = item.bidding_end_date !== undefined && item.bidding_end_date !== null ? String(item.bidding_end_date) : null;
        const listingDate = item.listing_date !== undefined && item.listing_date !== null ? String(item.listing_date) : null;
        const allotmentDate = item.allotment_date !== undefined && item.allotment_date !== null ? String(item.allotment_date) : null;
        
        const lotSize = item.lot_size !== undefined && item.lot_size !== null ? Math.round(Number(item.lot_size)) : null;
        const minBidQuantity = item.min_bid_quantity !== undefined && item.min_bid_quantity !== null ? Math.round(Number(item.min_bid_quantity)) : null;
        const totalSubscriptionRate = item.total_subscription_rate !== undefined && item.total_subscription_rate !== null ? Number(item.total_subscription_rate) : null;
        const documentUrl = item.document_url !== undefined && item.document_url !== null ? String(item.document_url) : null;
        
        await sql`
          INSERT INTO ipos (
            symbol, name, category, is_sme, status, additional_text,
            min_price, max_price, issue_price, listing_gains, listing_price,
            bidding_start_date, bidding_end_date, listing_date, allotment_date,
            lot_size, min_bid_quantity, total_subscription_rate, document_url, retrieved_at
          ) VALUES (
            ${symbol}, ${name}, ${category}, ${isSme}, ${status}, ${additionalText},
            ${minPrice}, ${maxPrice}, ${issuePrice}, ${listingGains}, ${listingPrice},
            ${biddingStartDate}, ${biddingEndDate}, ${listingDate}, ${allotmentDate},
            ${lotSize}, ${minBidQuantity}, ${totalSubscriptionRate}, ${documentUrl},
            ${batchTime}
          );
        `;
      }
    }
    
    console.log(`[IPO Database Cache] Successfully persisted IPO data snapshot with retrieved_at: ${batchTime.toISOString()}`);
  } catch (error) {
    console.error("[IPO Database Cache] Error writing IPOs to PostgreSQL:", error);
    throw error;
  }
}

// ==========================================
// Phase 10.3 Stock Detail Cache Read/Write Helpers
// ==========================================

export async function getPeersFromDb(symbol: string): Promise<{ data: any; retrievedAt: Date } | null> {
  try {
    const rows = await sql`
      SELECT peers_data, peers_retrieved_at FROM companies WHERE symbol = ${symbol.toUpperCase()};
    `;
    if (rows.length === 0) return null;
    const row = rows[0];
    if (!row.peers_data || !row.peers_retrieved_at) return null;
    return { data: row.peers_data, retrievedAt: new Date(row.peers_retrieved_at) };
  } catch (err) {
    console.error(`[getPeersFromDb Error for ${symbol}]:`, err);
    return null;
  }
}

export async function savePeersToDb(symbol: string, data: any): Promise<void> {
  try {
    await sql`
      INSERT INTO companies (symbol, name, isin, peers_data, peers_retrieved_at, updated_at)
      VALUES (${symbol.toUpperCase()}, ${symbol.toUpperCase()}, '', ${JSON.stringify(data)}, NOW(), NOW())
      ON CONFLICT (symbol) DO UPDATE SET
        peers_data = EXCLUDED.peers_data,
        peers_retrieved_at = EXCLUDED.peers_retrieved_at,
        updated_at = NOW();
    `;
  } catch (err) {
    console.error(`[savePeersToDb Error for ${symbol}]:`, err);
  }
}

export async function getShareholdingFromDb(symbol: string): Promise<{ data: any; retrievedAt: Date } | null> {
  try {
    const rows = await sql`
      SELECT shareholding_data, shareholding_retrieved_at FROM companies WHERE symbol = ${symbol.toUpperCase()};
    `;
    if (rows.length === 0) return null;
    const row = rows[0];
    if (!row.shareholding_data || !row.shareholding_retrieved_at) return null;
    return { data: row.shareholding_data, retrievedAt: new Date(row.shareholding_retrieved_at) };
  } catch (err) {
    console.error(`[getShareholdingFromDb Error for ${symbol}]:`, err);
    return null;
  }
}

export async function saveShareholdingToDb(symbol: string, data: any): Promise<void> {
  try {
    await sql`
      INSERT INTO companies (symbol, name, isin, shareholding_data, shareholding_retrieved_at, updated_at)
      VALUES (${symbol.toUpperCase()}, ${symbol.toUpperCase()}, '', ${JSON.stringify(data)}, NOW(), NOW())
      ON CONFLICT (symbol) DO UPDATE SET
        shareholding_data = EXCLUDED.shareholding_data,
        shareholding_retrieved_at = EXCLUDED.shareholding_retrieved_at,
        updated_at = NOW();
    `;
  } catch (err) {
    console.error(`[saveShareholdingToDb Error for ${symbol}]:`, err);
  }
}

export async function getRatiosFromDb(symbol: string): Promise<{ data: any; retrievedAt: Date } | null> {
  try {
    const rows = await sql`
      SELECT ratios_data, ratios_retrieved_at FROM companies WHERE symbol = ${symbol.toUpperCase()};
    `;
    if (rows.length === 0) return null;
    const row = rows[0];
    if (!row.ratios_data || !row.ratios_retrieved_at) return null;
    return { data: row.ratios_data, retrievedAt: new Date(row.ratios_retrieved_at) };
  } catch (err) {
    console.error(`[getRatiosFromDb Error for ${symbol}]:`, err);
    return null;
  }
}

export async function saveRatiosToDb(symbol: string, data: any): Promise<void> {
  try {
    await sql`
      INSERT INTO companies (symbol, name, isin, ratios_data, ratios_retrieved_at, updated_at)
      VALUES (${symbol.toUpperCase()}, ${symbol.toUpperCase()}, '', ${JSON.stringify(data)}, NOW(), NOW())
      ON CONFLICT (symbol) DO UPDATE SET
        ratios_data = EXCLUDED.ratios_data,
        ratios_retrieved_at = EXCLUDED.ratios_retrieved_at,
        updated_at = NOW();
    `;
  } catch (err) {
    console.error(`[saveRatiosToDb Error for ${symbol}]:`, err);
  }
}

export async function getDocumentsFromDb(symbol: string): Promise<{ corporateActions: any; announcements: any; retrievedAt: Date } | null> {
  try {
    const rows = await sql`
      SELECT corporate_actions, announcements, documents_retrieved_at FROM companies WHERE symbol = ${symbol.toUpperCase()};
    `;
    if (rows.length === 0) return null;
    const row = rows[0];
    if (!row.documents_retrieved_at || (!row.corporate_actions && !row.announcements)) return null;
    return {
      corporateActions: row.corporate_actions || [],
      announcements: row.announcements || [],
      retrievedAt: new Date(row.documents_retrieved_at)
    };
  } catch (err) {
    console.error(`[getDocumentsFromDb Error for ${symbol}]:`, err);
    return null;
  }
}

export async function saveDocumentsToDb(symbol: string, data: { corporateActions: any; announcements: any }): Promise<void> {
  try {
    await sql`
      INSERT INTO companies (symbol, name, isin, corporate_actions, announcements, documents_retrieved_at, updated_at)
      VALUES (${symbol.toUpperCase()}, ${symbol.toUpperCase()}, '', ${JSON.stringify(data.corporateActions)}, ${JSON.stringify(data.announcements)}, NOW(), NOW())
      ON CONFLICT (symbol) DO UPDATE SET
        corporate_actions = EXCLUDED.corporate_actions,
        announcements = EXCLUDED.announcements,
        documents_retrieved_at = EXCLUDED.documents_retrieved_at,
        updated_at = NOW();
    `;
  } catch (err) {
    console.error(`[saveDocumentsToDb Error for ${symbol}]:`, err);
  }
}

export async function getFinancialsRetrievalTime(
  symbol: string,
  type: "QUARTERLY" | "ANNUAL" | "BALANCESHEET" | "CASHFLOW"
): Promise<Date | null> {
  try {
    let rows: any[] = [];
    if (type === "QUARTERLY" || type === "ANNUAL") {
      rows = await sql`
        SELECT MAX(p.retrieved_at) as max_time 
        FROM financial_periods p
        JOIN companies c ON p.company_id = c.id
        WHERE c.symbol = ${symbol.toUpperCase()} AND p.type = ${type};
      `;
    } else if (type === "BALANCESHEET") {
      rows = await sql`
        SELECT MAX(b.retrieved_at) as max_time 
        FROM balance_sheets b
        JOIN companies c ON b.company_id = c.id
        WHERE c.symbol = ${symbol.toUpperCase()};
      `;
    } else if (type === "CASHFLOW") {
      rows = await sql`
        SELECT MAX(f.retrieved_at) as max_time 
        FROM cash_flows f
        JOIN companies c ON f.company_id = c.id
        WHERE c.symbol = ${symbol.toUpperCase()};
      `;
    }
    return rows[0]?.max_time ? new Date(rows[0].max_time) : null;
  } catch (err) {
    console.error(`[getFinancialsRetrievalTime Error for ${symbol} - ${type}]:`, err);
    return null;
  }
}

export async function getQuarterlyResultsFromDb(symbol: string): Promise<any | null> {
  try {
    const rows = await sql`
      SELECT p.* 
      FROM financial_periods p
      JOIN companies c ON p.company_id = c.id
      WHERE c.symbol = ${symbol.toUpperCase()} AND p.type = 'QUARTERLY'
      ORDER BY p.period;
    `;
    if (rows.length === 0) return null;
    
    const stats: Record<string, Record<string, number | null>> = {
      sales: {},
      expenses: {},
      operatingprofit: {},
      opm: {},
      otherincome: {},
      interest: {},
      depreciation: {},
      profitbeforetax: {},
      tax: {},
      netprofit: {},
      eps: {}
    };
    
    for (const r of rows) {
      const p = r.period;
      stats.sales[p] = r.sales !== null ? Number(r.sales) : null;
      stats.expenses[p] = r.expenses !== null ? Number(r.expenses) : null;
      stats.operatingprofit[p] = r.operating_profit !== null ? Number(r.operating_profit) : null;
      stats.opm[p] = r.opm_percent !== null ? Number(r.opm_percent) : null;
      stats.otherincome[p] = r.other_income !== null ? Number(r.other_income) : null;
      stats.interest[p] = r.interest !== null ? Number(r.interest) : null;
      stats.depreciation[p] = r.depreciation !== null ? Number(r.depreciation) : null;
      stats.profitbeforetax[p] = r.profit_before_tax !== null ? Number(r.profit_before_tax) : null;
      stats.tax[p] = r.tax_percent !== null ? Number(r.tax_percent) : null;
      stats.netprofit[p] = r.net_profit !== null ? Number(r.net_profit) : null;
      stats.eps[p] = r.eps !== null ? Number(r.eps) : null;
    }
    return stats;
  } catch (err) {
    console.error(`[getQuarterlyResultsFromDb Error for ${symbol}]:`, err);
    return null;
  }
}

export async function getAnnualPLFromDb(symbol: string): Promise<any | null> {
  try {
    const rows = await sql`
      SELECT p.* 
      FROM financial_periods p
      JOIN companies c ON p.company_id = c.id
      WHERE c.symbol = ${symbol.toUpperCase()} AND p.type = 'ANNUAL'
      ORDER BY p.period;
    `;
    if (rows.length === 0) return null;
    
    const stats: Record<string, Record<string, number | null>> = {
      sales: {},
      expenses: {},
      operatingprofit: {},
      opm: {},
      otherincome: {},
      interest: {},
      depreciation: {},
      profitbeforetax: {},
      tax: {},
      netprofit: {},
      eps: {}
    };
    
    for (const r of rows) {
      const p = r.period;
      stats.sales[p] = r.sales !== null ? Number(r.sales) : null;
      stats.expenses[p] = r.expenses !== null ? Number(r.expenses) : null;
      stats.operatingprofit[p] = r.operating_profit !== null ? Number(r.operating_profit) : null;
      stats.opm[p] = r.opm_percent !== null ? Number(r.opm_percent) : null;
      stats.otherincome[p] = r.other_income !== null ? Number(r.other_income) : null;
      stats.interest[p] = r.interest !== null ? Number(r.interest) : null;
      stats.depreciation[p] = r.depreciation !== null ? Number(r.depreciation) : null;
      stats.profitbeforetax[p] = r.profit_before_tax !== null ? Number(r.profit_before_tax) : null;
      stats.tax[p] = r.tax_percent !== null ? Number(r.tax_percent) : null;
      stats.netprofit[p] = r.net_profit !== null ? Number(r.net_profit) : null;
      stats.eps[p] = r.eps !== null ? Number(r.eps) : null;
    }
    return stats;
  } catch (err) {
    console.error(`[getAnnualPLFromDb Error for ${symbol}]:`, err);
    return null;
  }
}

export async function getBalanceSheetFromDb(symbol: string): Promise<any | null> {
  try {
    const rows = await sql`
      SELECT b.* 
      FROM balance_sheets b
      JOIN companies c ON b.company_id = c.id
      WHERE c.symbol = ${symbol.toUpperCase()}
      ORDER BY b.period;
    `;
    if (rows.length === 0) return null;
    
    const stats: Record<string, Record<string, number | null>> = {
      sharecapital: {},
      reserves: {},
      borrowings: {},
      otherliabilities: {},
      totalliabilities: {},
      fixedassets: {},
      cwip: {},
      investments: {},
      otherassets: {},
      totalassets: {}
    };
    
    for (const r of rows) {
      const p = r.period;
      stats.sharecapital[p] = r.equity_capital !== null ? Number(r.equity_capital) : null;
      stats.reserves[p] = r.reserves !== null ? Number(r.reserves) : null;
      stats.borrowings[p] = r.borrowings !== null ? Number(r.borrowings) : null;
      stats.otherliabilities[p] = r.other_liabilities !== null ? Number(r.other_liabilities) : null;
      stats.totalliabilities[p] = r.total_liabilities !== null ? Number(r.total_liabilities) : null;
      stats.fixedassets[p] = r.fixed_assets !== null ? Number(r.fixed_assets) : null;
      stats.cwip[p] = r.cwip !== null ? Number(r.cwip) : null;
      stats.investments[p] = r.investments !== null ? Number(r.investments) : null;
      stats.otherassets[p] = r.other_assets !== null ? Number(r.other_assets) : null;
      stats.totalassets[p] = r.total_assets !== null ? Number(r.total_assets) : null;
    }
    return stats;
  } catch (err) {
    console.error(`[getBalanceSheetFromDb Error for ${symbol}]:`, err);
    return null;
  }
}

export async function getCashFlowFromDb(symbol: string): Promise<any | null> {
  try {
    const rows = await sql`
      SELECT f.* 
      FROM cash_flows f
      JOIN companies c ON f.company_id = c.id
      WHERE c.symbol = ${symbol.toUpperCase()}
      ORDER BY f.period;
    `;
    if (rows.length === 0) return null;
    
    const stats: Record<string, Record<string, number | null>> = {
      operatingcashflow: {},
      investingcashflow: {},
      financingcashflow: {},
      netcashflow: {}
    };
    
    for (const r of rows) {
      const p = r.period;
      stats.operatingcashflow[p] = r.operating_cash_flow !== null ? Number(r.operating_cash_flow) : null;
      stats.investingcashflow[p] = r.investing_cash_flow !== null ? Number(r.investing_cash_flow) : null;
      stats.financingcashflow[p] = r.financing_cash_flow !== null ? Number(r.financing_cash_flow) : null;
      stats.netcashflow[p] = r.net_cash_flow !== null ? Number(r.net_cash_flow) : null;
    }
    return stats;
  } catch (err) {
    console.error(`[getCashFlowFromDb Error for ${symbol}]:`, err);
    return null;
  }
}

async function ensureCompanyRecord(symbol: string): Promise<number | null> {
  try {
    const companyRows = await sql`SELECT id FROM companies WHERE symbol = ${symbol.toUpperCase()};`;
    let companyId = companyRows[0]?.id;
    if (!companyId) {
      const ins = await sql`
        INSERT INTO companies (symbol, name, isin, description, sector, industry, updated_at)
        VALUES (${symbol.toUpperCase()}, ${symbol.toUpperCase()}, '', 'No description available.', 'N/A', 'N/A', NOW())
        ON CONFLICT (symbol) DO UPDATE SET updated_at = NOW()
        RETURNING id;
      `;
      companyId = ins[0]?.id;
    }
    return companyId || null;
  } catch (err) {
    console.error(`[ensureCompanyRecord Error for ${symbol}]:`, err);
    return null;
  }
}

export async function saveQuarterlyResultsToDb(symbol: string, stats: any): Promise<void> {
  try {
    const companyId = await ensureCompanyRecord(symbol);
    if (!companyId) return;

    const quarterlyPL = normalizeFinancialPeriods(stats);
    for (const p of quarterlyPL) {
      await sql`
        INSERT INTO financial_periods (
          company_id, type, period, sales, expenses, operating_profit, opm_percent,
          other_income, interest, depreciation, profit_before_tax, tax_percent, net_profit, eps, source, retrieved_at
        ) VALUES (
          ${companyId}, 'QUARTERLY', ${p.period}, ${p.sales}, ${p.expenses}, ${p.operatingProfit}, ${p.opmPercent},
          ${p.otherIncome}, ${p.interest}, ${p.depreciation}, ${p.profitBeforeTax}, ${p.taxPercent}, ${p.netProfit}, ${p.eps},
          'INDIAN_API', NOW()
        )
        ON CONFLICT (company_id, type, period) DO UPDATE SET
          sales = EXCLUDED.sales,
          expenses = EXCLUDED.expenses,
          operating_profit = EXCLUDED.operating_profit,
          opm_percent = EXCLUDED.opm_percent,
          other_income = EXCLUDED.other_income,
          interest = EXCLUDED.interest,
          depreciation = EXCLUDED.depreciation,
          profit_before_tax = EXCLUDED.profit_before_tax,
          tax_percent = EXCLUDED.tax_percent,
          net_profit = EXCLUDED.net_profit,
          eps = EXCLUDED.eps,
          source = EXCLUDED.source,
          retrieved_at = NOW();
      `;
    }
  } catch (err) {
    console.error(`[saveQuarterlyResultsToDb Error for ${symbol}]:`, err);
  }
}

export async function saveAnnualPLToDb(symbol: string, stats: any): Promise<void> {
  try {
    const companyId = await ensureCompanyRecord(symbol);
    if (!companyId) return;

    const annualPL = normalizeFinancialPeriods(stats);
    for (const p of annualPL) {
      await sql`
        INSERT INTO financial_periods (
          company_id, type, period, sales, expenses, operating_profit, opm_percent,
          other_income, interest, depreciation, profit_before_tax, tax_percent, net_profit, eps, source, retrieved_at
        ) VALUES (
          ${companyId}, 'ANNUAL', ${p.period}, ${p.sales}, ${p.expenses}, ${p.operatingProfit}, ${p.opmPercent},
          ${p.otherIncome}, ${p.interest}, ${p.depreciation}, ${p.profitBeforeTax}, ${p.taxPercent}, ${p.netProfit}, ${p.eps},
          'INDIAN_API', NOW()
        )
        ON CONFLICT (company_id, type, period) DO UPDATE SET
          sales = EXCLUDED.sales,
          expenses = EXCLUDED.expenses,
          operating_profit = EXCLUDED.operating_profit,
          opm_percent = EXCLUDED.opm_percent,
          other_income = EXCLUDED.other_income,
          interest = EXCLUDED.interest,
          depreciation = EXCLUDED.depreciation,
          profit_before_tax = EXCLUDED.profit_before_tax,
          tax_percent = EXCLUDED.tax_percent,
          net_profit = EXCLUDED.net_profit,
          eps = EXCLUDED.eps,
          source = EXCLUDED.source,
          retrieved_at = NOW();
      `;
    }
  } catch (err) {
    console.error(`[saveAnnualPLToDb Error for ${symbol}]:`, err);
  }
}

export async function saveBalanceSheetToDb(symbol: string, stats: any): Promise<void> {
  try {
    const companyId = await ensureCompanyRecord(symbol);
    if (!companyId) return;

    const balanceSheets = normalizeBalanceSheet(stats);
    for (const b of balanceSheets) {
      await sql`
        INSERT INTO balance_sheets (
          company_id, period, equity_capital, reserves, borrowings, other_liabilities,
          total_liabilities, fixed_assets, cwip, investments, other_assets, total_assets, source, retrieved_at
        ) VALUES (
          ${companyId}, ${b.period}, ${b.equityCapital}, ${b.reserves}, ${b.borrowings}, ${b.otherLiabilities},
          ${b.totalLiabilities}, ${b.fixedAssets}, ${b.cwip}, ${b.investments}, ${b.otherAssets}, ${b.totalAssets},
          'INDIAN_API', NOW()
        )
        ON CONFLICT (company_id, period) DO UPDATE SET
          equity_capital = EXCLUDED.equity_capital,
          reserves = EXCLUDED.reserves,
          borrowings = EXCLUDED.borrowings,
          other_liabilities = EXCLUDED.other_liabilities,
          total_liabilities = EXCLUDED.total_liabilities,
          fixed_assets = EXCLUDED.fixed_assets,
          cwip = EXCLUDED.cwip,
          investments = EXCLUDED.investments,
          other_assets = EXCLUDED.other_assets,
          total_assets = EXCLUDED.total_assets,
          source = EXCLUDED.source,
          retrieved_at = NOW();
      `;
    }
  } catch (err) {
    console.error(`[saveBalanceSheetToDb Error for ${symbol}]:`, err);
  }
}

export async function saveCashFlowToDb(symbol: string, stats: any): Promise<void> {
  try {
    const companyId = await ensureCompanyRecord(symbol);
    if (!companyId) return;

    const cashFlows = normalizeCashFlow(stats);
    for (const f of cashFlows) {
      await sql`
        INSERT INTO cash_flows (
          company_id, period, operating_cash_flow, investing_cash_flow, financing_cash_flow, net_cash_flow, source, retrieved_at
        ) VALUES (
          ${companyId}, ${f.period}, ${f.operatingCashFlow}, ${f.investingCashFlow}, ${f.financingCashFlow}, ${f.netCashFlow},
          'INDIAN_API', NOW()
        )
        ON CONFLICT (company_id, period) DO UPDATE SET
          operating_cash_flow = EXCLUDED.operating_cash_flow,
          investing_cash_flow = EXCLUDED.investing_cash_flow,
          financing_cash_flow = EXCLUDED.financing_cash_flow,
          net_cash_flow = EXCLUDED.net_cash_flow,
          source = EXCLUDED.source,
          retrieved_at = NOW();
      `;
    }
  } catch (err) {
    console.error(`[saveCashFlowToDb Error for ${symbol}]:`, err);
  }
}

