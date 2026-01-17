import { NextRequest, NextFetchEvent, NextResponse } from "next/server";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/manager(.*)"]);

const authMiddleware = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/auth/signin");
    }
  },
);

export function proxy(request: NextRequest, event?: NextFetchEvent) {
  return authMiddleware(request, event || ({} as NextFetchEvent));
}

export const config = {
  matcher: ["/manager((?!.*\\..*).*)", "/api/auth/:path*"],
};
