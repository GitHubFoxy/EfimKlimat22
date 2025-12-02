AGENT.md - Convex Auth Navigation Guide

This directory contains the documentation for @convex-dev/auth. Follow the workflow below to implement authentication, referring to the specific files listed for each step.
1. Installation & Initialization

Start here. These files cover the boilerplate setup, environment variables, and database configuration.

    Set Up Convex Auth.md: The primary guide. Follow this to install the package, run the initialization CLI, and wrap your application with the React provider.

    manual-setup.md: Use this only if the CLI command in the previous step fails. It details how to manually generate keys and configure auth.config.ts.

    custom-schema.md: Essential reading. Explains how to import authTables into your convex/schema.ts (required) and how to extend the users table with custom fields.

2. Configuring Providers

Choose your authentication strategy (OAuth, Passwords, Magic Links) and configure the backend.

    configuration.md: Read this to decide on an auth method (trade-offs between OAuth, OTP, etc.).

    password-configuration.md: Detailed guide for implementing Email + Password flows, including resets and email verification.

    api-refs-providers-*.md: specific syntax reference for provider configs:

        api-refs-providers-email.md / phone.md (Magic links/OTP)

        api-refs-provider-password.md (Passwords)

        api-refs-providers-anon.md (Anonymous sessions)

3. Implementation (Frontend & Backend)

Once configured, use these files to build the UI and secure your API.

    authorization.md: The core guide for:

        Frontend: Using useAuthActions to sign in/out and useAuthToken for HTTP requests.

        Backend: Using getAuthUserId and getAuthSessionId in Queries/Mutations.

    api-refs-react.md: Technical reference for React hooks (useAuthActions, ConvexAuthProvider).

    api-ref-server.md: Technical reference for backend helpers (convexAuth, getAuthUserId).

4. Next.js Specifics

If you are using Next.js (App Router or Pages Router), refer to these specialized files.

    authorization0nextjs.md: Guide for Server-Side Authentication (SSA), Middleware protection, and route handling.

    api-refs-nextjs.md: Reference for the ConvexAuthNextjsProvider.

    api-ref-nextjs-server.md: Reference for server-side helpers (isAuthenticatedNextjs, convexAuthNextjsMiddleware).

5. Operations & Advanced

Refer to these for deployment and troubleshooting.

    production.md: Steps for deploying to production (Environment variables, key generation).

    security.md: details on how tokens are stored (cookies vs localStorage), CSRF, and XSS protection.

    debugging.md: How to enable verbose logging for troubleshooting.

    advanced.md: Custom callbacks (createOrUpdateUser) and handling custom domains.

Recommended Setup Workflow

    Install: Follow Set Up Convex Auth.md.

    Schema: Update schema.ts using custom-schema.md.

    Config: Define providers in convex/auth.ts using password-configuration.md or api-refs-providers-*.md.

    UI: Build login forms using hooks from authorization.md.

    Protect: Secure backend queries using getAuthUserId from api-ref-server.md.

    Deploy: Follow production.md.