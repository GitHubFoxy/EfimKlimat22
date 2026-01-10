# Feature 01: Convex Auth & Security

## Overview

Implement Phone + Password authentication using `@convex-dev/auth`.

## Tasks

- [x] **Setup**: `bun add @convex-dev/auth @auth/core@0.37.0`.
- [x] **Config**: `convex/auth.ts` with `Password.withPhoneNumber`.
- [x] **Middleware**: Create `proxy.ts` (Next.js middleware compatible) to protect `/manager/:path*`.
- [x] **UI**: `app/auth/signin/page.tsx` and `SignInForm.tsx`.
- [x] **Cart**: Update `useCartSession.ts` to support merging anonymous carts to authenticated users.

## Technical Details

- Users are invite-only (Admin creates them).
- First login requires password change if `tempPassword` exists.
- **Actions vs Mutations**: Credential management (`createManager`, `changePassword`) uses Convex **Actions** to interact with `@convex-dev/auth/server`.
- Role-based access: `manager` or `admin` required for `/manager`.
- Cart merging is secured using `getAuthUserId(ctx)` on the server.
