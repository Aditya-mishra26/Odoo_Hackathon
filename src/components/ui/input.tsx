"use client";

import React from "react";

// NOTE: Custom Input component with standardized layouts and labels.
interface InputProps {
  label: string;
  name: string;
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  step?: string;
}

export function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  step,
}: InputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500 font-semibold">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={step}
        className="w-full px-3 py-2 border border-brand-light rounded-lg text-sm bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-medium focus:border-brand-medium transition-shadow shadow-sm"
      />
    </div>
  );
}
