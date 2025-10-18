"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Provides a stable anonymous cart sessionId stored in localStorage.
 * Generates once using `crypto.randomUUID()` and persists across refreshes.
 */
export function useCartSessionId() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  // Generate synchronously during first render if possible.
  const initialId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const existing = window.localStorage.getItem("cartSessionId");
    if (existing && existing.length > 0) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem("cartSessionId", id);
    return id;
  }, []);

  useEffect(() => {
    if (initialId && !sessionId) setSessionId(initialId);
  }, [initialId, sessionId]);

  return sessionId;
}
