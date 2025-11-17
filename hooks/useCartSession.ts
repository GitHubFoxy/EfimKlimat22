"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * Provides a stable anonymous cart sessionId stored in localStorage.
 * Generates once using `crypto.randomUUID()` and persists across refreshes.
 */
export function useCartSessionId() {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  // Generate synchronously during first render if possible.
  const getInitialId = () => {
    if (typeof window === "undefined") return undefined;
    const existing = window.localStorage.getItem("cartSessionId");
    if (existing && existing.length > 0) return existing;
    const id = uuidv4();
    window.localStorage.setItem("cartSessionId", id);
    return id;
  };

  const initialId = getInitialId();

  useEffect(() => {
    if (initialId && !sessionId) setSessionId(initialId);
  }, [initialId, sessionId]);

  return sessionId;
}
