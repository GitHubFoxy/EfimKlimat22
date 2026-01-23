import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server'
import { NextFetchEvent, NextRequest } from 'next/server'

const isManagerRoute = createRouteMatcher(['/manager(.*)'])
const isAuthRoute = createRouteMatcher(['/auth(.*)'])

const authMiddleware = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthenticated = await convexAuth.isAuthenticated()

    // Redirect authenticated users away from auth pages
    if (isAuthRoute(request) && isAuthenticated) {
      return nextjsMiddlewareRedirect(request, '/')
    }

    // Protect /manager routes - require authentication
    if (isManagerRoute(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, '/auth/signin')
    }

    // Note: Role-based authorization happens at the page level
    // because middleware cannot call Convex queries directly.
    // Server components use fetchQuery with convexAuthNextjsToken()
    // to verify manager role before rendering.
  },
  {
    cookieConfig: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
)

export function proxy(request: NextRequest, event?: NextFetchEvent) {
  return authMiddleware(request, event || ({} as NextFetchEvent))
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}
