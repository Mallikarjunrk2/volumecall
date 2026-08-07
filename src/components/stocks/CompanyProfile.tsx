import React from "react";
import { StockProfile } from "@/lib/stocks/types";

interface CompanyProfileProps {
  name: string;
  profile: StockProfile | null;
}

export function CompanyProfile({ name, profile }: CompanyProfileProps) {
  if (!profile) {
    return (
      <div className="border border-[var(--border)] rounded-md p-6 text-center text-[var(--text-secondary)] text-xs">
        Company profile information is currently unavailable.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Description Section */}
      <div className="md:col-span-2 space-y-3">
        <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
          About {name}
        </h3>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-line font-normal">
          {profile.companyProfile}
        </p>
      </div>

      {/* Meta Details List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
          Profile Details
        </h3>
        <div className="divide-y divide-[var(--border)] text-xs">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-[var(--text-secondary)]">Sector</span>
            <span className="font-semibold text-[var(--foreground)]">
              {profile.sector}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <span className="text-[var(--text-secondary)]">Sector Market Cap (INR)</span>
            <span className="font-semibold text-[var(--foreground)] tabular-nums">
              {profile.sectorMarketCapInr.formatted}
            </span>
          </div>

          <div className="flex justify-between items-center py-2.5">
            <span className="text-[var(--text-secondary)]">Sector Market Cap (USD)</span>
            <span className="font-semibold text-[var(--foreground)] tabular-nums">
              {profile.sectorMarketCapUsd.formatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CompanyProfile;
