API Reference
nextjs
server
nextjs/server
ConvexAuthNextjsServerProvider()

Wrap your app with this provider in your root layout.tsx.
Parameters
Parameter	Type	Description

props
	

object
	

‐

props.apiRoute?
	

string
	

You can customize the route path that handles authentication actions via this prop and the apiRoute option to convexAuthNextjsMiddleWare.

Defaults to /api/auth.

props.storage?
	

"localStorage" | "inMemory"
	

Choose how the auth information will be stored on the client.

Defaults to "localStorage".

If you choose "inMemory", different browser tabs will not have a synchronized authentication state.

props.storageNamespace?
	

string
	

Optional namespace for keys used to store tokens. The keys determine whether the tokens are shared or not.

Any non-alphanumeric characters will be ignored.

Defaults to process.env.NEXT_PUBLIC_CONVEX_URL.

props.shouldHandleCode?
	

() => boolean
	

Callback to determine whether Convex Auth should handle the code parameter for a given request. If not provided, Convex Auth will handle all code parameters. If provided, Convex Auth will only handle code parameters when the callback returns true.

props.verbose?
	

boolean
	

Turn on debugging logs.

props.children
	

ReactNode
	

Children components can call Convex hooks and useAuthActions.
Returns

Promise<Element>
Defined in

src/nextjs/server/index.tsx:30
convexAuthNextjsToken()

Retrieve the token for authenticating calls to your Convex backend from Server Components, Server Actions and Route Handlers.
Returns

Promise<undefined | string>

The token if the client is authenticated, otherwise undefined.
Defined in

src/nextjs/server/index.tsx:100
isAuthenticatedNextjs()

Whether the client is authenticated, which you can check in Server Actions, Route Handlers and Middleware.

Avoid the pitfall of checking authentication state in layouts, since they won't stop nested pages from rendering.
Parameters
Parameter	Type

options
	

object

options.convexUrl?
	

string
Returns

Promise<boolean>
Defined in

src/nextjs/server/index.tsx:111
ConvexAuthNextjsMiddlewareContext

In convexAuthNextjsMiddleware, you can use this context to get the token and check if the client is authenticated in place of convexAuthNextjsToken and isAuthenticatedNextjs.

export function convexAuthNextjsMiddleware(handler, options) {
  return async (request, event, convexAuth) => {
    if (!(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
  };
}

Type declaration
getToken()
Returns

Promise<string | undefined>
isAuthenticated()
Returns

Promise<boolean>
Defined in

src/nextjs/server/index.tsx:135
ConvexAuthNextjsMiddlewareOptions

Options for the convexAuthNextjsMiddleware function.
Type declaration
convexUrl?

    optional convexUrl: string

The URL of the Convex deployment to use for authentication.

Defaults to process.env.NEXT_PUBLIC_CONVEX_URL.
apiRoute?

    optional apiRoute: string

You can customize the route path that handles authentication actions via this option and the apiRoute prop of ConvexAuthNextjsProvider.

Defaults to /api/auth.
cookieConfig?

The cookie config to use for the auth cookies.

maxAge is the number of seconds the cookie will be valid for. If this is not set, the cookie will be a session cookie.

See MDN Web Docs

for more information.
cookieConfig.maxAge
verbose?

    optional verbose: boolean

Turn on debugging logs.
shouldHandleCode()?

Callback to determine whether Convex Auth should handle the code parameter for a given request. If not provided, Convex Auth will handle all code parameters. If provided, Convex Auth will only handle code parameters when the callback returns true.
Parameters
Parameter	Type

request
	

NextRequest
Returns

boolean
Defined in

src/nextjs/server/index.tsx:143
convexAuthNextjsMiddleware()

Use in your middleware.ts to enable your Next.js app to use Convex Auth for authentication on the server.
Parameters
Parameter	Type	Description

handler?
	

(request, ctx) => NextMiddlewareResult | Promise<NextMiddlewareResult>
	

A custom handler, which you can use to decide which routes should be accessible based on the client's authentication.

options?
	

ConvexAuthNextjsMiddlewareOptions
	

‐
Returns

NextMiddleware

A Next.js middleware.
Defined in

src/nextjs/server/index.tsx:184
nextjsMiddlewareRedirect()

Helper for redirecting to a different route from a Next.js middleware.

return nextjsMiddlewareRedirect(request, "/login");

Parameters
Parameter	Type	Description

request
	

NextRequest
	

The incoming request handled by the middleware.

pathname
	

string
	

The route path to redirect to.
Returns

NextResponse<unknown>
Defined in

src/nextjs/server/index.tsx:301
RouteMatcherParam

See createRouteMatcher for more information.
Defined in

src/nextjs/server/routeMatcher.ts:44
createRouteMatcher()

Returns a function that accepts a Request object and returns whether the request matches the list of predefined routes that can be passed in as the first argument.

You can use glob patterns to match multiple routes or a function to match against the request object. Path patterns and limited regular expressions are supported. For more information, see: https://www.npmjs.com/package/path-to-regexp/v/6.3.0
Parameters
Parameter	Type

routes
	

RouteMatcherParam
Returns

Function
Parameters
Parameter	Type

req
	

NextRequest
Returns

boolean
Defined in

src/nextjs/server/routeMatcher.ts:58