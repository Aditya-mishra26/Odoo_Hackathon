"use client";

import React from "react";

// NOTE: Custom Select component with optional labels.
// Supporting both form controls (with labels) and inline dropdowns (like filters).
interface SelectProps {
  label?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function Select({
  label,
  name,
  value,
  onChange,
  options,
  required,
  placeholder = "Select...",
  className = "",
}: SelectProps) {
  const selectEl = (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`px-3 py-2 border border-brand-light rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-medium focus:border-brand-medium transition-shadow shadow-sm ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (label) {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500 font-semibold">*</span>}
        </label>
        <div className="w-full flex flex-col">{selectEl}</div>
      </div>
    );
  }

  return selectEl;
}
