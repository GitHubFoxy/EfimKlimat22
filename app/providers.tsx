"use client";

import { ReactNode } from "react";
import ConvexClientProvider from "@/components/ConvexClientProvider";

/**
 * AppProviders wraps the application with essential client-side providers.
 *
 * Includes:
 * - ConvexClientProvider: For Convex backend integration and React Query
 *
 * Radix UI Hydration Fix:
 * Radix UI components use React's useId hook (React 18+) for generating stable IDs
 * across SSR and client renders. Since we're using React 19 with App Router,
 * no explicit IdProvider wrapper is needed - Radix automatically uses React's
 * built-in useId which generates consistent IDs during SSR and hydration.
 *
 * See: https://react.dev/reference/react/useId
 * See: https://radix-ui.com/docs/primitives/utilities/id-provider
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
