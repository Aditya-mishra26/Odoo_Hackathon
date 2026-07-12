"use client";

// NOTE: Custom status badges mapped to vehicle, driver, and trip states.
// FIXME: Add a fallback styling for unexpected statuses.
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Available: "bg-brand-medium/20 text-brand-dark",
    "On Trip": "bg-brand-light/30 text-brand-dark",
    "In Shop": "bg-yellow-100 text-yellow-800",
    Retired: "bg-red-100 text-red-700",
    Draft: "bg-brand-cream text-slate-500 border border-brand-light/30",
    Dispatched: "bg-brand-light/30 text-brand-dark",
    Completed: "bg-brand-medium/20 text-brand-dark",
    Cancelled: "bg-red-100 text-red-700",
    Active: "bg-yellow-100 text-yellow-800",
    "Off Duty": "bg-brand-cream text-slate-500 border border-brand-light/30",
    Suspended: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}
