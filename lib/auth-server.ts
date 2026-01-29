import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { fetchQuery } from 'convex/nextjs'
import { redirect } from 'next/navigation'
import { api } from '@/convex/_generated/api'

export type ServerRole = 'guest' | 'user' | 'manager' | 'admin'

export interface ServerAuthState {
  role: ServerRole
  mustChangePassword: boolean
}

async function getServerAuthState(): Promise<ServerAuthState> {
  try {
    const token = await convexAuthNextjsToken()
    if (!token) {
      return { role: 'guest', mustChangePassword: false }
    }

    const [role, user] = await Promise.all([
      fetchQuery(api.users.getUserRole, {}, { token }),
      fetchQuery(api.users.getCurrentUserWithTempPassword, {}, { token }),
    ])

    return {
      role: (role as ServerRole) ?? 'guest',
      mustChangePassword: Boolean(user?.mustChangePassword),
    }
  } catch {
    return { role: 'guest', mustChangePassword: false }
  }
}

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

export async function requireManagerRoleWithTempPassword(): Promise<ServerAuthState> {
  const authState = await getServerAuthState()

  if (authState.role !== 'manager' && authState.role !== 'admin') {
    redirect('/')
  }

  return authState
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

export async function requireAdminRoleWithTempPassword(): Promise<ServerAuthState> {
  const authState = await getServerAuthState()

  if (authState.role !== 'admin') {
    redirect('/')
  }

  return authState
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
