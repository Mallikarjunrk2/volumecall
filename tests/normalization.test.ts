import { describe, it, expect } from "vitest";
import {
  normalizeBalanceSheet,
  normalizeFinancialPeriods,
  normalizeLatestShareholding,
  normalizeShareholdingHistory,
} from "../src/lib/providers/indianapi/normalize";

describe("IndianAPI Data Normalization Fixes", () => {
  it("correctly extracts singular 'Borrowing' into borrowings in balance sheet", () => {
    const rawBalanceSheet = {
      "Equity Capital": { "Mar 2015": 501, "Mar 2016": 506 },
      "Reserves": { "Mar 2015": 62653, "Mar 2016": 73798 },
      "Borrowing": { "Mar 2015": 59478, "Mar 2016": 103714 },
      "Other Liabilities": { "Mar 2015": 34181, "Mar 2016": 38321 },
      "Total Liabilities": { "Mar 2015": 607097, "Mar 2016": 762212 },
    };

    const normalized = normalizeBalanceSheet(rawBalanceSheet);
    expect(normalized).toHaveLength(2);
    expect(normalized[0].period).toBe("Mar 2015");
    expect(normalized[0].borrowings).toBe(59478);
    expect(normalized[1].borrowings).toBe(103714);
  });

  it("correctly maps banking 'Financing Profit' and 'Financing Margin %' to operating profit & margin", () => {
    const rawPnl = {
      "Revenue": { "Mar 2015": 50666, "Mar 2016": 63162 },
      "Expenses": { "Mar 2015": 16164, "Mar 2016": 20055 },
      "Financing Profit": { "Mar 2015": 7214, "Mar 2016": 9037 },
      "Financing Margin %": { "Mar 2015": 14, "Mar 2016": 14 },
      "Net Profit": { "Mar 2015": 10703, "Mar 2016": 12821 },
      "EPS in Rs": { "Mar 2015": 10.66, "Mar 2016": 12.66 },
      "Dividend Payout %": { "Mar 2015": 19, "Mar 2016": 19 },
    };

    const normalized = normalizeFinancialPeriods(rawPnl);
    expect(normalized).toHaveLength(2);
    expect(normalized[0].sales).toBe(50666);
    expect(normalized[0].operatingProfit).toBe(7214);
    expect(normalized[0].opmPercent).toBe(14);
    expect(normalized[0].dividendPayoutPercent).toBe(19);
  });

  it("correctly extracts shareholding percentage when field is named percentage", () => {
    const rawShareholding = [
      {
        displayName: "Promoter",
        categories: [{ holdingDate: "2023-06-30", percentage: "25.52" }],
      },
      {
        displayName: "FII",
        categories: [{ holdingDate: "2026-09-30", percentage: "39.39" }],
      },
      {
        displayName: "MF",
        categories: [{ holdingDate: "2026-09-30", percentage: "31.88" }],
      },
      {
        displayName: "Other",
        categories: [{ holdingDate: "2026-09-30", percentage: "28.73" }],
      },
    ];

    const latest = normalizeLatestShareholding(rawShareholding);
    expect(latest.promoters).toBe(25.52);
    expect(latest.fii).toBe(39.39);
    expect(latest.dii).toBe(31.88);
    expect(latest.public).toBe(28.73);
  });

  it("defaults missing promoter to 0% for professionally managed institutions", () => {
    const rawQuarterlyStats = {
      "FIIs": { "Sep 2024": 48.02 },
      "DIIs": { "Sep 2024": 35.05 },
      "Public": { "Sep 2024": 16.75 },
    };

    const history = normalizeShareholdingHistory(rawQuarterlyStats);
    expect(history).toHaveLength(1);
    expect(history[0].promoter).toBe(0);
    expect(history[0].fii).toBe(48.02);
    expect(history[0].dii).toBe(35.05);
    expect(history[0].public).toBe(16.75);
  });
});
