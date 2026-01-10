"use client";

import { useEffect, useState, useCallback } from "react";
import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { v4 as uuidv4 } from "uuid";

function getOrCreateSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const existing = window.localStorage.getItem("cartSessionId");
  if (existing && existing.length > 0) return existing;
  const id = uuidv4();
  window.localStorage.setItem("cartSessionId", id);
  return id;
}

export function useCartSessionId() {
  return getOrCreateSessionId();
}

export function useCartSession() {
  const { isAuthenticated } = useConvexAuth();
  const sessionId = useCartSessionId();

  return {
    sessionId,
    isAuthenticated,
  };
}

/**
 * Hook to merge anonymous cart to authenticated user after login.
 * Call this after successful authentication to transfer cart items.
 */
export function useMergeCartOnAuth() {
  const { isAuthenticated } = useConvexAuth();
  const mergeCarts = useMutation(api.cart.mergeSessionCartToUser);
  const [hasMerged, setHasMerged] = useState(false);

  const merge = useCallback(
    async (userId: string) => {
      if (hasMerged) return;

      const sessionId = window.localStorage.getItem("cartSessionId");
      if (!sessionId) return;

      try {
        await mergeCarts({ sessionId });
        setHasMerged(true);
      } catch (error) {
        console.error("Failed to merge cart:", error);
      }
    },
    [mergeCarts, hasMerged],
  );

  const clearSessionCart = useCallback(() => {
    window.localStorage.removeItem("cartSessionId");
  }, []);

  return { merge, clearSessionCart, hasMerged };
}
