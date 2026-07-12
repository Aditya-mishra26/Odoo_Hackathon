"use client";

import { ReactNode } from "react";

// NOTE: Custom Button wrapper.
// TODO: Add support for prefix/suffix icons or loading spinner states.
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string; // added to allow arbitrary positioning/override styles standard to human codebases
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  const styles = {
    primary: "bg-brand-medium text-white hover:bg-brand-dark focus:ring-brand-medium",
    secondary: "border border-brand-light text-brand-dark hover:bg-brand-cream/50 focus:ring-brand-medium",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-brand-medium text-white hover:bg-brand-dark focus:ring-brand-medium",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
