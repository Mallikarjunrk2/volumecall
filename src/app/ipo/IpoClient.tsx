"use client";

import { useState } from "react";
import { AlertCircle, FileText, Calendar, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

interface IpoItem {
  symbol: string;
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

interface IpoClientProps {
  initialData: {
    upcoming: IpoItem[];
    listed: IpoItem[];
    active: IpoItem[];
    closed: IpoItem[];
    pre_apply: IpoItem[];
  } | null;
  error: string | null;
}

export function IpoClient({ initialData, error }: IpoClientProps) {
  const [activeTab, setActiveTab] = useState<"open" | "upcoming" | "listed" | "closed">("open");

  if (error || !initialData) {
    return (
      <div className="p-4 border border-red-200/50 dark:border-red-900/50 rounded-lg bg-red-500/5 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Error Loading IPOs</span>
          <p>{error || "IPO listing data is currently unavailable."}</p>
        </div>
      </div>
    );
  }

  // Combine active and pre_apply for Open IPOs
  const openIpos = [...(initialData.active || []), ...(initialData.pre_apply || [])];
  const upcomingIpos = initialData.upcoming || [];
  const listedIpos = initialData.listed || [];
  const closedIpos = initialData.closed || [];

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap cursor-pointer ${
      activeTab === tab
        ? "bg-teal-700 text-white shadow-sm"
        : "text-[var(--text-secondary)] hover:text-[var(--foreground)] bg-[var(--background-secondary)]"
    }`;

  const renderStatusBadge = (isSme: boolean) => (
    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm tracking-wider ${
      isSme 
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20" 
        : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
    }`}>
      {isSme ? "SME" : "Mainboard"}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex space-x-2 border-b border-[var(--border)] pb-3 overflow-x-auto scrollbar-none">
        <button onClick={() => setActiveTab("open")} className={tabClass("open")}>
          Open / Pre-Apply ({openIpos.length})
        </button>
        <button onClick={() => setActiveTab("upcoming")} className={tabClass("upcoming")}>
          Upcoming ({upcomingIpos.length})
        </button>
        <button onClick={() => setActiveTab("listed")} className={tabClass("listed")}>
          Listed ({listedIpos.length})
        </button>
        <button onClick={() => setActiveTab("closed")} className={tabClass("closed")}>
          Closed ({closedIpos.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--background)]">
        <div className="overflow-x-auto">
          {activeTab === "open" && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Company</th>
                  <th className="py-2.5 px-4">Bidding Dates</th>
                  <th className="py-2.5 px-4 text-right">Price Band</th>
                  <th className="py-2.5 px-4 text-right">Lot Size</th>
                  <th className="py-2.5 px-4 text-right">Subscription</th>
                  <th className="py-2.5 px-4 text-center">Prospectus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--foreground)]">
                {openIpos.length > 0 ? (
                  openIpos.map((ipo, i) => (
                    <tr key={i} className="hover:bg-[var(--background-secondary)]/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col space-y-1">
                          <span className="font-bold">{ipo.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-neutral-500 font-mono">{ipo.symbol}</span>
                            {renderStatusBadge(ipo.is_sme)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-normal">
                        {ipo.bidding_start_date ? `${ipo.bidding_start_date} to ${ipo.bidding_end_date || "—"}` : "—"}
                        {ipo.additional_text && (
                          <span className="block text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">{ipo.additional_text}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {ipo.min_price && ipo.max_price ? `₹${ipo.min_price} - ₹${ipo.max_price}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {ipo.lot_size ? `${ipo.lot_size} shares` : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                        {ipo.total_subscription_rate !== null ? `${ipo.total_subscription_rate.toFixed(2)}x` : "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {ipo.document_url ? (
                          <a href={ipo.document_url} target="_blank" rel="noreferrer" className="inline-flex text-teal-700 dark:text-teal-400 hover:underline">
                            <FileText className="w-4 h-4" />
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">No IPOs currently open for bidding.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "upcoming" && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Company</th>
                  <th className="py-2.5 px-4">Listing Date</th>
                  <th className="py-2.5 px-4 text-right">Price Band</th>
                  <th className="py-2.5 px-4 text-center">Prospectus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--foreground)]">
                {upcomingIpos.length > 0 ? (
                  upcomingIpos.map((ipo, i) => (
                    <tr key={i} className="hover:bg-[var(--background-secondary)]/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col space-y-1">
                          <span className="font-bold">{ipo.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-neutral-500 font-mono">{ipo.symbol}</span>
                            {renderStatusBadge(ipo.is_sme)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-normal">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {ipo.listing_date || "To be announced"}
                        </span>
                        {ipo.additional_text && (
                          <span className="block text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">{ipo.additional_text}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {ipo.min_price && ipo.max_price ? `₹${ipo.min_price} - ₹${ipo.max_price}` : "To be announced"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {ipo.document_url ? (
                          <a href={ipo.document_url} target="_blank" rel="noreferrer" className="inline-flex text-teal-700 dark:text-teal-400 hover:underline">
                            <FileText className="w-4 h-4" />
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[var(--text-secondary)]">No upcoming IPOs announced.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "listed" && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Company</th>
                  <th className="py-2.5 px-4 text-right">Issue Price</th>
                  <th className="py-2.5 px-4 text-right">Listing Price</th>
                  <th className="py-2.5 px-4 text-right">Listing Gains</th>
                  <th className="py-2.5 px-4 text-right">Listing Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--foreground)]">
                {listedIpos.length > 0 ? (
                  listedIpos.map((ipo, i) => {
                    const gains = ipo.listing_gains || 0;
                    const isPositive = gains >= 0;
                    return (
                      <tr key={i} className="hover:bg-[var(--background-secondary)]/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex flex-col space-y-1">
                            <span className="font-bold">{ipo.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-neutral-500 font-mono">{ipo.symbol}</span>
                              {renderStatusBadge(ipo.is_sme)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">
                          {ipo.issue_price ? `₹${ipo.issue_price}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">
                          {ipo.listing_price ? `₹${ipo.listing_price}` : "—"}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold tabular-nums flex items-center justify-end gap-1 ${
                          isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        }`}>
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {gains ? `${isPositive ? "+" : ""}${gains.toFixed(2)}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[var(--text-secondary)] font-normal">
                          {ipo.listing_date || "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[var(--text-secondary)]">No listed IPO performance data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "closed" && (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Company</th>
                  <th className="py-2.5 px-4">Listing Date</th>
                  <th className="py-2.5 px-4 text-right">Price Band</th>
                  <th className="py-2.5 px-4 text-center">Prospectus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--foreground)]">
                {closedIpos.length > 0 ? (
                  closedIpos.map((ipo, i) => (
                    <tr key={i} className="hover:bg-[var(--background-secondary)]/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col space-y-1">
                          <span className="font-bold">{ipo.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] text-neutral-500 font-mono">{ipo.symbol}</span>
                            {renderStatusBadge(ipo.is_sme)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)] font-normal">
                        <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Listing: {ipo.listing_date || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {ipo.min_price && ipo.max_price ? `₹${ipo.min_price} - ₹${ipo.max_price}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {ipo.document_url ? (
                          <a href={ipo.document_url} target="_blank" rel="noreferrer" className="inline-flex text-teal-700 dark:text-teal-400 hover:underline">
                            <FileText className="w-4 h-4" />
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[var(--text-secondary)]">No closed IPO listings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default IpoClient;
