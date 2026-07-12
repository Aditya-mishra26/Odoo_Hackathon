"use client";

import { ReactNode } from "react";

// NOTE: Generic DataTable component for dashboard views.
// TODO(refactor): add pagination controls and page limits
interface DataTableProps {
  columns: { key: string; label: string; render?: (val: unknown, row: Record<string, unknown>) => ReactNode }[];
  data: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
}

export function DataTable({ columns, data, onRowClick }: DataTableProps) {
  const safeData = Array.isArray(data) ? data : [];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-cream/50 border-b border-brand-light/30">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-4 py-3 font-medium text-slate-600 select-none">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {safeData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-slate-400">
                  No data found
                </td>
              </tr>
            ) : (
              safeData.map((row, i) => (
                <tr
                  key={(row.id as string) || i}
                  className={`border-b border-brand-light/20 last:border-0 hover:bg-brand-cream/30 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-slate-700">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
