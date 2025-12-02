Security
Keep your authentication secure

It will likely be paramount to your app that your authentication stays secure. Secure means that malicious actors cannot impersonate other users, to retrieve their data or act on their behalf.

The authentication methods your choose will impact security, see the Configuration page.

This page focuses on the core mechanisms Convex Auth uses, and how to make sure they stay secure.
Client secrets storage

Convex Auth lets you authenticate your React app, which talks to your Convex backend over a WebSocket. Convex auth makes client credentials available to your JavaScript because:

    For web-apps, your Convex backend is a third-party server - it does not host your web app, and so any cookie would be considered third-party and blocked by some browsers such as Safari.
    Browsers do not support server-only cookies for WebSocket connections.
    React Native does not have good support for cookies - they don't work in Expo Go for example.

Convex Auth makes two values available to the client JavaScript:

    A refresh token, used to maintain a session (including across page loads)
    A JWT access token, which is sent over the WebSocket connection back to the backend

To allow immediate authentication across page loads, both are stored in localStorage

by default, but you can choose a different storage mechanism via the storage prop.

The refresh token can be used only once to get a new access token. And using an "old" refresh token will invalidate the whole session (this is called refresh token reuse detection).

Since these tokens are accessible via JavaScript, to keep your authentication secure you should take every precaution to avoid XSS

and similar vulnerabilities.
Preventing XSS

Since your app uses React, you are already protected from typical XSS attacks, as long as you don't circumvent

React's protections.

You should also carefully review and frequently update any dependencies to prevent supply-chain attacks

.

Make sure to further protect more sensitive actions the user can take by requiring a recent sign-in.
Handling XSS vulnerability

If you discover an XSS vulnerability in your app, and you're relying on Convex Auth, you should take the following steps, in order:
Fix the XSS vulnerability

This depends on the vulnerability, but it's usually fixable on the server, even in cases where the client is to blame for improper sanitization.
Delete all existing sessions

You can do this by clearing the authSessions table in the Convex dashboard.

This will immediately prevent any authenticated clients from getting new access tokens, and will force all users to sign in again.
Rotate your private and public key

You can run:

npx @convex-dev/auth --prod

and answer Yes to reset the keys on your production deployment, or do this manually.

This will immediately invalidate all existing access tokens, although existing WebSocket connections will stay authenticated until the token expires (1 hour by default), unless your code validates the session ID.
Next.js

If your app uses @convex-dev/auth/nextjs, it will also use server-only cookies to store the session ID and access token, to make them accessible by your Next.js server on an initial page load.
Protecting refresh tokens

With @convex-dev/auth/nextjs, only the access token is made available to client-side JavaScript. This makes refresh tokens even more secure, since an attacker cannot steal a refresh token via an XSS vulnerability.
Preventing CSRF

Since cookies are used, the library takes care of protecting your app against CSRF
, as long as you follow the rules mentioned here.