"use client";

import { ReactNode } from "react";

// NOTE: standard KPI Card for displaying metrics on the dashboard.
// TODO: add comparison indicator (e.g. +5% from last week)
interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

export function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}
