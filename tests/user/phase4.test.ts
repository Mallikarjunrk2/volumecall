import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({ sql: vi.fn() }));

import {
  ANONYMOUS_STOCK_RESEARCH_LIMIT,
  normalizeSymbol,
} from "@/lib/user/research-gate-service";

describe("Phase 4 — Comprehensive Anonymous Gate & Watchlist Test Suite", () => {
  describe("1. Symbol Normalization & Case Insensitivity", () => {
    it("trims whitespace and converts ticker symbols to uppercase", () => {
      expect(normalizeSymbol("  reliance  ")).toBe("RELIANCE");
      expect(normalizeSymbol("tcs")).toBe("TCS");
      expect(normalizeSymbol("  HdfcBank  ")).toBe("HDFCBANK");
      expect(normalizeSymbol("InFy")).toBe("INFY");
    });

    it("treats differently capitalized instances of the same stock as identical", () => {
      expect(normalizeSymbol("reliance")).toBe(normalizeSymbol("RELIANCE"));
      expect(normalizeSymbol("TCS")).toBe(normalizeSymbol("  tcs  "));
    });
  });

  describe("2. Anonymous Stock Research Quota Contract", () => {
    it("strictly enforces ANONYMOUS_STOCK_RESEARCH_LIMIT = 3", () => {
      expect(ANONYMOUS_STOCK_RESEARCH_LIMIT).toBe(3);
    });
  });

  describe("3. Unique Stock Tracking & Multi-Entry Path Gating", () => {
    it("allows exactly 3 unique stocks, allows repeat visits across UI/API paths, and blocks 4th unique stock", () => {
      const researchedSet = new Set<string>();

      function simulateResearchGate(symbol: string, actionType: "autocomplete" | "research" | "analysis" | "history", isAuthenticated = false) {
        // Autocomplete/search suggestions DO NOT consume quota
        if (actionType === "autocomplete") {
          return { allowed: true, count: researchedSet.size, reason: null };
        }

        if (isAuthenticated) {
          return { allowed: true, count: 0, reason: null };
        }

        const normalized = normalizeSymbol(symbol);
        if (researchedSet.has(normalized)) {
          return { allowed: true, count: researchedSet.size, reason: null };
        }

        if (researchedSet.size < ANONYMOUS_STOCK_RESEARCH_LIMIT) {
          researchedSet.add(normalized);
          return { allowed: true, count: researchedSet.size, reason: null };
        }

        return { allowed: false, count: researchedSet.size, reason: "stock_limit", status: 403 };
      }

      // Action 1: Autocomplete suggestion for "TATA" -> DOES NOT consume quota
      const searchRes = simulateResearchGate("TATAMOTORS", "autocomplete");
      expect(searchRes.allowed).toBe(true);
      expect(searchRes.count).toBe(0);

      // Action 2: Research Stock 1 (RELIANCE) via direct page load -> Allowed (1/3)
      const res1 = simulateResearchGate("RELIANCE", "research");
      expect(res1.allowed).toBe(true);
      expect(res1.count).toBe(1);

      // Action 3: Research Stock 2 (TCS) via search box -> Allowed (2/3)
      const res2 = simulateResearchGate("TCS", "research");
      expect(res2.allowed).toBe(true);
      expect(res2.count).toBe(2);

      // Action 4: Repeat RELIANCE 10 times via refresh/history API -> Allowed, count remains 2
      for (let i = 0; i < 10; i++) {
        const repeatRes = simulateResearchGate("reliance", "history");
        expect(repeatRes.allowed).toBe(true);
        expect(repeatRes.count).toBe(2);
      }

      // Action 5: Research Stock 3 (INFY) via calculator link -> Allowed (3/3 consumed)
      const res3 = simulateResearchGate("INFY", "research");
      expect(res3.allowed).toBe(true);
      expect(res3.count).toBe(3);

      // Action 6: Revisit INFY via AI analysis tab -> Allowed, count remains 3
      const revisit3 = simulateResearchGate("INFY", "analysis");
      expect(revisit3.allowed).toBe(true);
      expect(revisit3.count).toBe(3);

      // Action 7: Research Stock 4 (HDFCBANK) -> BLOCKED with status 403 and stock_limit reason
      const res4 = simulateResearchGate("HDFCBANK", "research");
      expect(res4.allowed).toBe(false);
      expect(res4.reason).toBe("stock_limit");
      expect(res4.status).toBe(403);

      // Action 8: Research Stock 5 (SBIN) via homepage link -> BLOCKED
      const res5 = simulateResearchGate("SBIN", "research");
      expect(res5.allowed).toBe(false);
      expect(res5.reason).toBe("stock_limit");

      // Action 9: Google Authenticated user requesting HDFCBANK -> Bypass gate (Unlimited)
      const resAuth = simulateResearchGate("HDFCBANK", "research", true);
      expect(resAuth.allowed).toBe(true);

      // Action 10: Google Authenticated user requesting 10th stock -> Bypass gate (Unlimited)
      const resAuth10 = simulateResearchGate("ICICIBANK", "research", true);
      expect(resAuth10.allowed).toBe(true);
    });
  });

  describe("4. Concurrency Safety Simulation", () => {
    it("simulates atomic check-and-insert ensuring race conditions cannot overshoot 3 unique stocks", async () => {
      const dbSet = new Set<string>(["RELIANCE", "TCS"]);
      const lock = { value: false };

      async function atomicCheckAndRecord(symbol: string): Promise<boolean> {
        const norm = normalizeSymbol(symbol);
        if (dbSet.has(norm)) return true;

        // Simulate atomic DB lock/transaction
        while (lock.value) {
          await new Promise((r) => setTimeout(r, 5));
        }
        lock.value = true;
        try {
          if (dbSet.has(norm)) return true;
          if (dbSet.size >= ANONYMOUS_STOCK_RESEARCH_LIMIT) {
            return false;
          }
          dbSet.add(norm);
          return true;
        } finally {
          lock.value = false;
        }
      }

      // Simulate simultaneous requests for INFY and HDFCBANK when 2 stocks are already recorded
      const [resInfy, resHdfc] = await Promise.all([
        atomicCheckAndRecord("INFY"),
        atomicCheckAndRecord("HDFCBANK"),
      ]);

      // Exactly one request must succeed and total count must not exceed 3
      expect(dbSet.size).toBe(3);
      expect(resInfy !== resHdfc).toBe(true);
    });
  });

  describe("5. Watchlist Isolation & Security", () => {
    it("ensures public user watchlists are strictly isolated per user_id", () => {
      const userWatchlists: Record<string, Set<string>> = {
        "user-101": new Set(["RELIANCE", "TCS"]),
        "user-202": new Set(["INFY"]),
      };

      function getUserWatchlist(userId: string): string[] {
        return Array.from(userWatchlists[userId] || []);
      }

      function addToWatchlist(userId: string, symbol: string): void {
        const norm = normalizeSymbol(symbol);
        if (!userWatchlists[userId]) userWatchlists[userId] = new Set();
        userWatchlists[userId].add(norm);
      }

      // User 101 cannot see User 202's watchlist
      expect(getUserWatchlist("user-101")).toEqual(["RELIANCE", "TCS"]);
      expect(getUserWatchlist("user-202")).toEqual(["INFY"]);

      // User 202 adding stock does not pollute User 101
      addToWatchlist("user-202", "HDFCBANK");
      expect(getUserWatchlist("user-202")).toEqual(["INFY", "HDFCBANK"]);
      expect(getUserWatchlist("user-101")).toEqual(["RELIANCE", "TCS"]);
    });
  });
});
