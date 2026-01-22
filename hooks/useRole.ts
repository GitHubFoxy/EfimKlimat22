'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export type Role = 'guest' | 'user' | 'manager' | 'admin'

/**
 * Fetch user role from server (authoritative source)
 * CRITICAL: Never trust client-side role - server is authority
 * Used only for UI rendering (show/hide buttons, menu items, etc.)
 * All authorization decisions must happen server-side
 *
 * @returns Role fetched from database, defaults to "guest" if loading/unauthenticated
 */
export function useRole(): Role {
  const role = useQuery(api.users.getUserRole)

  // undefined = loading, null/empty becomes guest
  return (role as Role) ?? 'guest'
}
