# Stock Detail Cache TTL & Refresh Boundary Design

This document establishes the permanent specification for the caching, TTL, and refresh boundary system for individual stock-detail sections on the dynamic research pages of VolumeCall.

---

## 1. Purpose
The purpose of this specification is to prevent redundant calls to IndianAPI by establishing a **durable PostgreSQL cache** backed by a **fixed-time calendar-day refresh boundary** instead of a relative rolling expiration (e.g. `retrieved_at + N hours`).

All future development must strictly conform to this calendar-day refresh boundary specification.

---

## 2. Official Section Refresh Policy

| Section | TTL | Refresh Time | Data Type | Refresh Behavior |
|---|---:|---|---|---|
| **Peers** | 7 days | 9:15 AM IST | Semi-static | 7-day calendar refresh |
| **Quarterly Results** | 7 days | 9:15 AM IST | Financial | 7-day calendar refresh |
| **Profit & Loss** | 7 days | 9:15 AM IST | Financial | 7-day calendar refresh |
| **Balance Sheet** | 90 days | 9:15 AM IST | Slow-changing | 90-day calendar refresh |
| **Cash Flow** | 90 days | 9:15 AM IST | Slow-changing | 90-day calendar refresh |
| **Investors / Shareholding** | 7 days | 9:15 AM IST | Ownership | 7-day calendar refresh |
| **Documents** | 30 days | 9:15 AM IST | Announcements | 30-day calendar refresh |
| **Ratios** | 1 day | 9:15 AM IST | Fundamental | Daily calendar refresh |
| **Live Price** | Live | Market Hours | Real-time | Real-time Upstox quote |

---

## 3. Core Concept: Calendar-Day Refresh Boundaries
The `retrieved_at` timestamp stored in PostgreSQL represents the actual time the snapshot was successfully retrieved. It does **not** act as a starting point for a relative time addition (e.g. `retrieved_at + N × 24 hours`). 

Instead, expiration is anchored to the fixed daily boundary:
```text
09:15 AM IST (Asia/Kolkata timezone)
```
on the calculated calendar refresh date. The exact hour or minute of the original retrieval is irrelevant to the expiration time.

---

## 4. How Freshness Is Calculated

Freshness is evaluated step-by-step using calendar boundaries:

1. **Timezone Conversion**: Convert `retrievedAt` and `now` (current time) to the `Asia/Kolkata` (+05:30) timezone.
2. **Find Reference Boundary**: On the calendar day of `retrievedAt`, locate the `09:15 AM IST` timestamp:
   * If `retrievedAt` was fetched **on or after** `09:15 AM IST` on that calendar day, the reference boundary is **today at 09:15 AM IST**.
   * If `retrievedAt` was fetched **before** `09:15 AM IST` on that calendar day, the reference boundary is **yesterday at 09:15 AM IST**.
3. **Calculate Expiration Date**: Add `ttlDays` calendar days to the reference boundary date.
4. **Set Expiration Time**: Force the expiration timestamp to `09:15:00.000` on the calculated expiration day in `Asia/Kolkata` time.
5. **Freshness Comparison**:
   * If `now < expirationBoundary`, the data is **FRESH** (read from PostgreSQL).
   * If `now >= expirationBoundary`, the data is **STALE** (trigger demand-driven refresh).

---

## 5. Expiration Examples by TTL

### 1-Day TTL (Ratios)
* **Retrieved**: Monday at 1:00 PM IST
* **Reference Boundary**: Monday 9:15 AM IST
* **Expiration Boundary**: Tuesday 9:15 AM IST
```text
Monday 8:00 PM IST   →  FRESH
Tuesday 8:00 AM IST  →  FRESH
Tuesday 9:14 AM IST  →  FRESH
Tuesday 9:15 AM IST  →  STALE (First subsequent request refreshes)
```

### 7-Day TTL (Peers, Quarterly, P&L, Shareholding)
* **Retrieved**: Monday at 1:00 PM IST
* **Reference Boundary**: Monday 9:15 AM IST
* **Expiration Boundary**: Next Monday 9:15 AM IST
```text
Monday Evening       →  FRESH
Sunday (Day 6)       →  FRESH
Next Monday 9:14 AM  →  FRESH
Next Monday 9:15 AM  →  STALE
```

### 30-Day TTL (Documents)
* **Retrieved**: August 10 at 1:00 PM IST
* **Reference Boundary**: August 10 at 9:15 AM IST
* **Expiration Boundary**: September 9 at 9:15 AM IST
```text
September 8          →  FRESH
September 9 9:14 AM  →  FRESH
September 9 9:15 AM  →  STALE
```

### 90-Day TTL (Balance Sheet, Cash Flow)
* **Retrieved**: January 10 at 1:00 PM IST
* **Reference Boundary**: January 10 at 9:15 AM IST
* **Expiration Boundary**: April 10 at 9:15 AM IST (adds exactly 90 calendar days)
```text
April 9              →  FRESH
April 10 9:14 AM     →  FRESH
April 10 9:15 AM     →  STALE
```

---

## 6. Visual Timeline Diagrams

### 1-Day Daily Boundary
```text
MONDAY                                          TUESDAY
09:15 AM                                       09:15 AM
   │                                              │
   ├── [1:00 PM] retrieved_at                     │
   │                                              │
   ├─────────────── REMAINS FRESH ────────────────┤
   │                                              │
   └─────────────────────────────────────────────→│ (stale boundary)
                                                  ▼
                                            User requests data
                                                  ↓
                                              IndianAPI
                                                  ↓
                                              PostgreSQL
                                                  ↓
                                               Website
```

### 7-Day Boundary
```text
MONDAY [1:00 PM]                                             NEXT MONDAY
retrieved_at                                                  09:15 AM
   │                                                             │
   ├─────────────────────── REMAINS FRESH ───────────────────────┤
   │                                                             │
   └────────────────────────────────────────────────────────────→│ (stale boundary)
                                                                 ▼
                                                           User requests
                                                                 ↓
                                                             IndianAPI
                                                                 ↓
                                                             PostgreSQL
```

---

## 7. Important Edge Cases

* **Retrieval Before 9:15 AM IST**:
  If data is successfully fetched on Monday at 9:00 AM IST (e.g. before the daily market open hour/refresh threshold), the reference boundary rolls back to **Sunday at 09:15 AM IST**. For a 1-day TTL, it will expire on **Monday at 09:15 AM IST** (allowing a refresh after 15 minutes if requested, to capture post-market-open updates).
* **DST and Timezones**:
  India does not observe Daylight Saving Time. The timezone offset is **always UTC +5:30**. 
* **UTC Servers / Serverless environment**:
  If the application is running in a Vercel serverless function (which typically runs in UTC timezone), the time calculations must convert dates using an explicit offset or the `Intl.DateTimeFormat` API for `Asia/Kolkata` to prevent timezone shift bugs.

---

## 8. Section Independence
Every stock detail section maintains its own independent cache retrieval and refresh lifecycle.
```
WIPRO Section Request
  ├── Peers (stale)        → Calls IndianAPI for Peers only
  ├── Balance Sheet (fresh) → Served from PostgreSQL immediately
  └── Ratios (fresh)        → Served from PostgreSQL + Upstox Price recalculation
```
Loading one stale tab must **never** trigger a cascading fetch of other sections.

---

## 9. Live Price Isolation
* Live price is **never** subject to PostgreSQL TTL persistence.
* Always query Upstox Quotes API dynamically during market hours to resolve live prices, changes, and volumes.
* Never call IndianAPI to resolve current stock price quotes.

---

## 10. Concurrency Protection (Parallel request lock)
To prevent simultaneous users from triggering duplicate requests on cache misses (e.g. at 9:16 AM), requests are synchronized via the application's in-flight request lock map (`orchestrateRequest`). Parallel requests for the same symbol and section will block and resolve to the same single in-flight IndianAPI fetch.

---

## 11. Failed Refresh Safety
If the provider/IndianAPI request fails:
1. **Preserve Database**: Keep the existing PostgreSQL rows intact. Do not overwrite valid numbers with null or delete the snapshot.
2. **Graceful Fallback**: Serve the stale PostgreSQL snapshot to the client.
3. **Retry Flag**: Do not update `retrieved_at`, leaving the cache eligible for retry on subsequent requests.

---

## 12. Intended Centralized Configuration
Centralize configuration and boundary methods in `src/lib/stocks/ttl.ts`:

```typescript
export const SECTION_TTL_DAYS = {
  PEERS: 7,
  QUARTERLY_RESULTS: 7,
  PROFIT_LOSS: 7,
  BALANCE_SHEET: 90,
  CASH_FLOW: 90,
  SHAREHOLDING: 7,
  DOCUMENTS: 30,
  RATIOS: 1,
};
```

### Expiration Pseudocode
```typescript
function getNextRefreshBoundary(retrievedAt: Date, ttlDays: number): Date {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const retrievedAtIst = new Date(retrievedAt.getTime() + IST_OFFSET);

  const boundaryIst = new Date(retrievedAtIst);
  boundaryIst.setUTCHours(9, 15, 0, 0);

  // If fetched before 9:15 AM today, reference boundary is 9:15 AM yesterday
  if (retrievedAtIst.getTime() < boundaryIst.getTime()) {
    boundaryIst.setUTCDate(boundaryIst.getUTCDate() - 1);
  }

  // Add TTL days
  boundaryIst.setUTCDate(boundaryIst.getUTCDate() + ttlDays);

  return new Date(boundaryIst.getTime() - IST_OFFSET);
}

function isSectionFresh(retrievedAt: Date, ttlDays: number): boolean {
  const expiry = getNextRefreshBoundary(retrievedAt, ttlDays);
  return Date.now() < expiry.getTime();
}
```

---

## 13. Test Matrix

| Section | TTL | Retrieved Time (IST) | Check Time (IST) | Expected State |
|---|---:|---|---|---|
| **Ratios** | 1 day | Mon 1:00 PM | Tue 9:14 AM | **FRESH** |
| **Ratios** | 1 day | Mon 1:00 PM | Tue 9:15 AM | **STALE** |
| **Peers** | 7 days | Mon 1:00 PM | Sun 11:00 PM | **FRESH** |
| **Peers** | 7 days | Mon 1:00 PM | Next Mon 9:14 AM | **FRESH** |
| **Peers** | 7 days | Mon 1:00 PM | Next Mon 9:15 AM | **STALE** |
| **Balance Sheet** | 90 days | Jan 10 1:00 PM | Apr 10 9:14 AM | **FRESH** |
| **Balance Sheet** | 90 days | Jan 10 1:00 PM | Apr 10 9:15 AM | **STALE** |
| **Documents** | 30 days | Aug 10 1:00 PM | Sep 9 9:14 AM | **FRESH** |
| **Documents** | 30 days | Aug 10 1:00 PM | Sep 9 9:15 AM | **STALE** |

---

## 14. Cache Architecture Diagram

```text
                     ===================================================
                                         VOLUMECALL
                     ===================================================
                                             │
                                          Next.js
                                             │
                                             ▼
                             [ API Route (/api/stocks/[symbol]/research) ]
                                             │
                                     (Query Parameter: section=...)
                                             │
                       ┌─────────────────────┼─────────────────────┐
                       ▼                     ▼                     ▼
                  [ section=financials ]   [ section=overview ]  [ section=peers ]
                       │                     │                     │
                       │                     ├────────────────┐    │
                       │                     │                │    │
                       ▼                     ▼                ▼    ▼
                 PostgreSQL (Neon)      PostgreSQL        PostgreSQL
                       │                     │                │
               Check Freshness?       Check Freshness?   Check Freshness?
               (90d BS/CF, 7d PL)       (1d Ratios)       (7d Peers)
                 /           \            /       \        /       \
              [YES]          [NO]      [YES]      [NO]  [YES]      [NO]
               /               \        /          \     /          \
        Read PostgreSQL        │  Read PostgreSQL  │ Read PostgreSQL │
               │               ▼        │          ▼     │          ▼
               │          IndianAPI     │     IndianAPI  │     IndianAPI
               │         (historical)   │     (profile)  │     (profile)
               │               │        │          │     │          │
               │         Save to Neon   │     Save to DB │     Save to DB
               │               │        │          │     │          │
               └──────┬────────┘        └─────┬────┘     └─────┬────┘
                      │                       │                │
                      │                       ▼                │
                      │               Upstox Price Query       │
                      │                (Live Market Price)     │
                      │                       │                │
                      │               Recalculate ratios       │
                      │               (PE, PB, Price/Sales)    │
                      │                       │                │
                      ▼                       ▼                ▼
             [ quarterlyResults ]       [ ratios_data ]   [ peers_data ]
             [ annualProfitLoss ]       [ corporate_actions ]
             [ balanceSheet ]           [ announcements ]
             [ cashFlow ]
```

