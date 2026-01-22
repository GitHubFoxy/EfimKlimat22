/**
 * @deprecated
 *
 * This component is deprecated and should not be used for new code.
 *
 * Historical context: This was used as a workaround for Radix UI hydration errors
 * caused by non-deterministic ID generation between SSR and client renders.
 *
 * The proper modern solution is to use:
 * 1. Radix's IdProvider at the app root (via app/providers.tsx)
 * 2. React's useId hook for custom IDs
 * 3. Ensure deterministic component trees without environment-driven branching
 *
 * See: https://radix-ui.com/docs/primitives/utilities/id-provider
 * See: https://react.dev/reference/react/useId
 *
 * If you encounter hydration errors, the correct fix is:
 * - Wrap your app in IdProvider at the root level (done in app/providers.tsx)
 * - Replace ClientOnly with direct rendering
 * - Use React's useId for any custom ID generation
 */
'use client'

import { ReactNode, useEffect, useState } from 'react'

export function ClientOnly({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null
  return <>{children}</>
}
