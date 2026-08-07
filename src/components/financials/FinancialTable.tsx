import React from "react";

export interface FinancialTableRow {
  label: string;
  values: (string | number | React.ReactNode)[];
  isBold?: boolean;
}

interface FinancialTableProps {
  headers: string[];
  rows: FinancialTableRow[];
}

export function FinancialTable({ headers, rows }: FinancialTableProps) {
  return (
    <div className="w-full overflow-x-auto border border-[var(--border)] rounded-md bg-[var(--background)]">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--background-secondary)]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className={`py-2 px-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider ${
                  idx === 0 ? "text-left" : "text-right"
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`hover:bg-[var(--background-secondary)]/50 transition-colors ${
                row.isBold ? "font-semibold bg-[var(--background-secondary)]/20 text-[var(--foreground)]" : ""
              }`}
            >
              <td className="py-2.5 px-4 text-[var(--foreground)] font-normal">
                {row.label}
              </td>
              {row.values.map((val, valIdx) => (
                <td
                  key={valIdx}
                  className="py-2.5 px-4 text-right text-[var(--foreground)] font-medium tabular-nums"
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default FinancialTable;
