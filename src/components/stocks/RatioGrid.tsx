import React from "react";
import { StockRatio } from "@/lib/stocks/types";

interface RatioGridProps {
  ratios: StockRatio[];
}

/**
 * Parses financial values (stripping '%' or formatting) into numbers for scaling.
 */
function parseValue(valStr: string): number | null {
  if (!valStr || valStr === "N/A" || valStr === "-") return null;
  const clean = valStr.replace("%", "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

export function RatioGrid({ ratios }: RatioGridProps) {
  if (!ratios || ratios.length === 0) {
    return (
      <div className="border border-[var(--border)] rounded-md p-6 text-center text-[var(--text-secondary)] text-xs">
        No key ratios available.
      </div>
    );
  }

  return (
    <div className="border border-[var(--border)] rounded-md p-4 sm:p-6 bg-[var(--background)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
        {ratios.map((ratio, index) => {
          const cNum = parseValue(ratio.companyValue);
          const sNum = parseValue(ratio.sectorValue);

          let cPct = 50;
          let sPct = 50;
          let showBar = false;

          if (cNum !== null && sNum !== null) {
            const maxVal = Math.max(Math.abs(cNum), Math.abs(sNum));
            if (maxVal > 0) {
              showBar = true;
              cPct = (Math.abs(cNum) / (maxVal * 1.25)) * 100;
              sPct = (Math.abs(sNum) / (maxVal * 1.25)) * 100;
            }
          }

          // We draw a subtle border bottom for all items except the last row
          const isLastRow = index >= ratios.length - 2;

          return (
            <div
              key={ratio.name}
              className={`flex items-center justify-between py-3 border-b border-[var(--border)] ${
                isLastRow ? "md:border-b-0" : ""
              } ${index === ratios.length - 1 ? "border-b-0" : ""}`}
            >
              <span className="text-xs font-medium text-[var(--foreground)]">
                {ratio.name}
              </span>
              
              <div className="flex items-center space-x-6 shrink-0">
                {/* Company Value */}
                <span className="text-xs font-bold text-[var(--foreground)] tabular-nums w-12 text-right">
                  {ratio.companyValue}
                </span>

                {/* Sector Value */}
                <span className="text-[11px] text-[var(--text-secondary)] tabular-nums w-20">
                  Sector: {ratio.sectorValue}
                </span>

                {/* Neutral Relative Position Tracker */}
                {showBar && (
                  <div className="relative h-1 w-14 bg-neutral-100 dark:bg-neutral-900 rounded-full hidden sm:block">
                    {/* Sector Node (Slate) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-600 border border-[var(--background)]"
                      style={{ left: `calc(${sPct}% - 4px)` }}
                      title={`Sector: ${ratio.sectorValue}`}
                    />
                    {/* Company Node (Teal) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-teal-600 dark:bg-teal-400 border border-[var(--background)] shadow-xs"
                      style={{ left: `calc(${cPct}% - 5px)` }}
                      title={`Company: ${ratio.companyValue}`}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default RatioGrid;
