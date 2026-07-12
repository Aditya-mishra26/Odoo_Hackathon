"use client";

import React from "react";

// NOTE: Reusable pulsating skeleton loader for visual feedback.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-200/85 dark:bg-slate-700/80 ${className}`} />
  );
}
