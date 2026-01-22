import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { fetchQuery } from 'convex/nextjs'
import { redirect } from 'next/navigation'
import { api } from '@/convex/_generated/api'

export type ServerRole = 'guest' | 'user' | 'manager' | 'admin'

/**
 * Get current user's role from database (server-side)
 * Uses convexAuthNextjsToken for authenticated server-side queries
 */
export async function getServerRole(): Promise<ServerRole> {
  try {
    const token = await convexAuthNextjsToken()
    if (!token) {
      return 'guest'
    }

    const role = await fetchQuery(api.users.getUserRole, {}, { token })
    return (role as ServerRole) ?? 'guest'
  } catch {
    return 'guest'
  }
}

/**
 * Require manager or admin role for server components
 * Redirects to home if user doesn't have required role
 */
export async function requireManagerRole(): Promise<ServerRole> {
  const role = await getServerRole()

  if (role !== 'manager' && role !== 'admin') {
    redirect('/')
  }

  return role
}

/**
 * Require admin role for server components
 * Redirects to home if user doesn't have admin role
 */
export async function requireAdminRole(): Promise<ServerRole> {
  const role = await getServerRole()

  if (role !== 'admin') {
    redirect('/')
  }

  return role
}

/**
 * Require any authenticated user (not guest)
 * Redirects to auth page if not authenticated
 */
export async function requireAuth(): Promise<ServerRole> {
  const role = await getServerRole()

  if (role === 'guest') {
    redirect('/auth')
  }

  return role
}
