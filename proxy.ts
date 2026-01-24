import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from '@convex-dev/auth/nextjs/server'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'

const isManagerRoute = createRouteMatcher(['/manager(.*)'])
const isAuthRoute = createRouteMatcher(['/auth(.*)'])

const authMiddleware = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthenticated = await convexAuth.isAuthenticated()

    // Redirect authenticated users away from auth pages
    if (isAuthRoute(request) && isAuthenticated) {
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/'
      const url = request.nextUrl.clone()
      url.pathname = redirectTo
      url.search = ''
      return NextResponse.redirect(url)
    }

    // Protect /manager routes - require authentication
    if (isManagerRoute(request) && !isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
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
  matcher: ['/manager(.*)', '/auth(.*)', '/(api|trpc)(.*)'],
}
