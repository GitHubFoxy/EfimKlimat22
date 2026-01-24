# Convex Auth Guide for Self-Hosted Production

Complete guide for setting up Convex Auth with Password provider on self-hosted Convex.

**Sources**:
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Manual Setup](https://labs.convex.dev/auth/setup/manual)
- [Next.js Integration](https://labs.convex.dev/auth/authz/nextjs)
- [Debugging](https://labs.convex.dev/auth/debugging)

---

## Your Current Setup Analysis

Based on your codebase:
- Using Password provider with phone-based authentication
- `ConvexAuthNextjsProvider` in ConvexClientProvider.tsx
- Auth helpers in `convex/authHelpers.ts` with `requireRole`, `requirePermanentPassword`
- HTTP routes configured in `convex/http.ts`

**Common production issues:**
1. `SITE_URL` not set or incorrect
2. Missing JWT keys
3. Cookie domain/path issues with reverse proxy
4. CORS blocking auth requests

---

## Part 1: Required Environment Variables

### Backend VPS (Convex)

Set these in your Convex environment or docker-compose:

```bash
# CRITICAL: Must be your frontend URL (where users access the app)
SITE_URL=https://klimat22.com

# JWT keys (generate with script below)
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
JWKS='{"keys":[{"kty":"RSA","n":"...","e":"AQAB",...}]}'
```

### Generate JWT Keys

Create `generateKeys.mjs` and run with Node.js:

```javascript
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256");
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = { keys: [{ use: "sig", alg: "RS256", ...publicKey }] };

console.log(`JWT_PRIVATE_KEY="${privateKey.replace(/\n/g, "\\n")}"`);
console.log(`JWKS='${JSON.stringify(jwks)}'`);
```

Run:
```bash
node generateKeys.mjs
```

Copy the output to your Convex deployment environment variables.

### Frontend VPS (Next.js)

```bash
# .env.local / .env.production
NEXT_PUBLIC_CONVEX_URL=https://api.klimat22.com
```

---

## Part 2: Backend Configuration

### convex/auth.config.ts

Your current config needs the `domain` to match `SITE_URL`:

```typescript
export default {
  providers: [
    {
      // This MUST match CONVEX_SITE_ORIGIN on backend
      domain: process.env.CONVEX_SITE_URL ?? "https://api.klimat22.com",
      applicationID: "convex",
    },
  ],
}
```

**Note**: For self-hosted, `CONVEX_SITE_URL` is typically set to your backend URL.

### convex/auth.ts

Your current implementation is correct:

```typescript
import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'

function normalizePhone(raw: string): string {
  return raw.replace(/\s+/g, '').replace(/^\+7/, '8')
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      id: 'phone',
      profile(params) {
        const rawPhone = (params.phone as string) || ''
        const phone = normalizePhone(rawPhone)
        return {
          phone,
          email: phone, // Password provider uses email as account ID
        }
      },
    }),
  ],
})

export { normalizePhone }
```

### convex/http.ts

Your current setup is correct:

```typescript
import { httpRouter } from 'convex/server'
import { auth } from './auth'

const http = httpRouter()
auth.addHttpRoutes(http)

export default http
```

---

## Part 3: Frontend Configuration

### components/ConvexClientProvider.tsx

Your current implementation:

```typescript
'use client'

import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs'
import { ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  )
}
```

### middleware.ts

Create or update `middleware.ts` in project root:

```typescript
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/catalog(.*)",
  "/auth/(.*)",
  "/api/(.*)",
]);

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/manager(.*)",
  "/checkout(.*)",
  "/profile(.*)",
]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthenticated = await convexAuth.isAuthenticated();

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/auth/signin");
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith("/auth/") && isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/");
    }
  },
  {
    // Cookie config for production
    cookieConfig: {
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
    // Enable verbose logging for debugging
    verbose: process.env.NODE_ENV === "development",
  }
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
```

---

## Part 4: Caddy Configuration for Auth

### Backend VPS Caddyfile

Critical headers for auth cookies to work:

```caddyfile
api.klimat22.com {
    # CORS headers - MUST specify exact origin for credentials
    header {
        Access-Control-Allow-Origin https://klimat22.com
        Access-Control-Allow-Credentials true
        Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Access-Control-Allow-Headers "Content-Type, Authorization, Convex-Client, X-Convex-Client, Cookie"
        Access-Control-Expose-Headers "Set-Cookie, X-Convex-*"
    }

    # Handle preflight
    @options method OPTIONS
    handle @options {
        respond 204
    }

    # Proxy with proper header forwarding
    reverse_proxy backend:3210 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto https
        
        # Important: preserve cookies
        header_down Set-Cookie Set-Cookie
    }
}
```

### Frontend VPS Caddyfile

```caddyfile
klimat22.com {
    reverse_proxy app:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto https
    }
}

www.klimat22.com {
    redir https://klimat22.com{uri}
}
```

---

## Part 5: Common Auth Issues & Solutions

### Issue 1: `ctx.auth.getUserIdentity()` returns `null`

**Causes:**
1. Client not yet authenticated (async timing)
2. Token not being sent to backend
3. JWT key mismatch

**Solutions:**

Check if token is being sent:
```typescript
// In a component
const token = useAuthToken();
console.log("Auth token:", token);
```

Enable verbose logging:
```bash
# On Convex backend
AUTH_LOG_LEVEL=DEBUG
```

### Issue 2: Cookies Not Being Set

**Causes:**
1. `SameSite=None` requires HTTPS
2. Different domains need proper CORS
3. Cookie path mismatch

**Solutions:**

Ensure both frontend and backend use HTTPS.

Check browser cookies:
- DevTools → Application → Cookies
- Look for `__convexAuth*` or `__Host-convexAuth*` cookies

### Issue 3: CORS Errors

**Symptoms:**
```
Access to fetch at 'https://api.klimat22.com' from origin 'https://klimat22.com' 
has been blocked by CORS policy
```

**Solutions:**

1. `Access-Control-Allow-Origin` must match EXACTLY (no trailing slash)
2. Cannot use `*` with `Access-Control-Allow-Credentials: true`
3. Ensure OPTIONS preflight is handled

### Issue 4: Redirect Loop

**Causes:**
1. Middleware redirecting before auth state loads
2. Incorrect route matching

**Solutions:**

Check middleware is using `convexAuth.isAuthenticated()`:
```typescript
export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // Use convexAuth from context, NOT useConvexAuth hook
    const isAuthenticated = await convexAuth.isAuthenticated();
    // ...
  }
);
```

### Issue 5: Works Locally, Fails in Production

**Checklist:**
1. [ ] `SITE_URL` set to frontend production URL
2. [ ] `CONVEX_CLOUD_ORIGIN` set to backend production URL
3. [ ] `CONVEX_SITE_ORIGIN` set to backend production URL
4. [ ] JWT keys deployed to production
5. [ ] CORS headers include production domain
6. [ ] Both frontend and backend using HTTPS

---

## Part 6: Debugging Steps

### Step 1: Enable Verbose Logging

**Client (browser console):**
```typescript
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  verbose: true,
});
```

**Convex functions:**
```bash
npx convex env set AUTH_LOG_LEVEL DEBUG
```

**Next.js middleware:**
```typescript
convexAuthNextjsMiddleware(handler, { verbose: true });
```

### Step 2: Check Network Tab

1. Open DevTools → Network
2. Filter by `WS` (WebSocket)
3. Find `sync` connection
4. Check Messages tab for `type: "Authenticate"` with `value` containing JWT

### Step 3: Validate JWT Token

1. Copy the JWT token from network tab
2. Go to https://jwt.io
3. Paste token in "Encoded" field
4. Check payload has `aud`, `iss`, `sub` fields
5. Verify `iss` matches your `CONVEX_SITE_URL`

### Step 4: Clear Auth State

```typescript
// Clear all auth state
localStorage.clear();
// Clear cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
// Reload
location.reload();
```

Or use incognito window.

---

## Part 7: Production Deployment Checklist

```bash
# 1. Set environment variables on Convex backend
SITE_URL=https://klimat22.com
JWT_PRIVATE_KEY="..."
JWKS='...'
CONVEX_CLOUD_ORIGIN=https://api.klimat22.com
CONVEX_SITE_ORIGIN=https://api.klimat22.com

# 2. Deploy Convex functions
export CONVEX_SELF_HOSTED_URL=https://api.klimat22.com
export CONVEX_SELF_HOSTED_ADMIN_KEY=your_admin_key
bunx convex deploy

# 3. Set environment variables on Next.js
NEXT_PUBLIC_CONVEX_URL=https://api.klimat22.com

# 4. Build and deploy Next.js
bun run build
# Deploy via your preferred method
```

---

## Quick Reference: Your Specific Setup

### Files to Check

| File | Purpose |
|------|---------|
| `convex/auth.ts` | Auth configuration with Password provider |
| `convex/auth.config.ts` | Domain/application ID config |
| `convex/http.ts` | HTTP routes for auth endpoints |
| `convex/authHelpers.ts` | `requireRole`, `requirePermanentPassword` |
| `components/ConvexClientProvider.tsx` | Provider wrapper |
| `middleware.ts` | Route protection |
| `Caddyfile` | Reverse proxy configuration |

### Environment Variables Summary

| Variable | Where | Value |
|----------|-------|-------|
| `SITE_URL` | Convex env | `https://klimat22.com` |
| `JWT_PRIVATE_KEY` | Convex env | Generated RSA key |
| `JWKS` | Convex env | Generated public key |
| `CONVEX_CLOUD_ORIGIN` | Backend docker | `https://api.klimat22.com` |
| `CONVEX_SITE_ORIGIN` | Backend docker | `https://api.klimat22.com` |
| `NEXT_PUBLIC_CONVEX_URL` | Frontend | `https://api.klimat22.com` |
