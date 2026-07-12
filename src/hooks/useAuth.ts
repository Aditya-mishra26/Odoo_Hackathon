"use client";

import { useAuthContext } from "@/context/AuthContext";

// NOTE: Custom hook shortcut to access current user context.
// Avoids nested imports of context directly and mimics real project styles.
export function useAuth() {
  return useAuthContext();
}
