ant to lose information when the session expires, you should store both the session ID and the user ID in your other document.
Custom callback and sign-in URLs

For ease of configuration, Convex Auth defaults to using the builtin CONVEX_SITE_URL value in callback and sign-in URLs. For some OAuth providers (Google, for example) this can lead to something like happy-animal-123.convex.site showing up to users on the OAuth consent screen.

If you're using a custom domain

for your production Convex deployment, you can configure Convex Auth to use that domain for the sign-in and callback URLs.

With your Production deployment selected in the Convex dashboard, navigate to Settings -> Environment Variables. Add a CUSTOM_AUTH_SITE_URL environment variable pointing to the custom domain you configured for the deployment. For example, if your custom HTTP Actions domain is convex.example.com then you'd set CUSTOM_AUTH_SITE_URL to https://convex.example.com (no trailing slash).

Make sure to update your OAuth provider config for your production deployment with your new callback URL. Otherwise it will refuse to redirect users to your application.
Handle custom OAuth flows

If you have custom OAuth flows that use the code query parameter, you can prevent Convex Auth from handling those codes by implementing shouldHandleCode as a boolean or a function returning a boolean. A false value will prevent Convex Auth from handling the code parameter.
React and Next.js Client

In React and Next.js client components, you can provide the value as a provider prop for either ConvexAuthProvider or ConvexAuthNextjsProvider.

import { ConvexAuthProvider } from "@convex-dev/auth/react";
 
<ConvexAuthProvider
  client={convex}
  shouldHandleCode={() => {
    // Skip handling code parameter on specific paths
    return location.pathname.startsWith("/auth");
  }}
>
  {children}
</ConvexAuthProvider>;

Next.js Middleware

In Next.js middleware, shouldHandleCode is provided as an option to the middleware function. shouldHandleCode also receives the request object as it's only parameter. In middleware, the function can be async.
middleware.ts

export default convexAuthNextjsMiddleware(
  (request, { convexAuth }) => {
    // ... route protection logic
  },
  {
    shouldHandleCode: (request) => {
      // Skip handling code parameter for Figma OAuth callback
      if (
        request.nextUrl.pathname.startsWith(
          "/settings/profile/figma-auth-callback",
        )
      ) {
        return false;
      }
      // Handle all other code parameters
      return true;
    },
  },
);