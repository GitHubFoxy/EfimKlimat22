# Agents Guide for EfimKlimat22

This project is a Next.js 16 application with TypeScript, Convex backend, shadcn/ui components, and Tailwind CSS v4. Use this guide when working on this codebase.

## Build & Development Commands

### Available Scripts (from package.json)

```bash
# Development
bun run dev                    # Start both frontend and backend
bun run dev:frontend           # Start Next.js dev server with Turbopack
bun run dev:backend            # Start Convex dev server
bun run predev                 # Run convex dev --until-success before dev

# Code Quality
bun run lint                   # Run ESLint
bun run typecheck              # Run TypeScript type checking (tsc --noEmit)
```

### Running Tests

No test framework is currently configured. The project doesn't have test files. Consider adding Vitest or Jest if needed.

### Environment Setup

- Uses Bun as runtime (check package.json scripts)
- Requires `.env.local` with `NEXT_PUBLIC_CONVEX_URL`
- Convex backend configured in `/convex` directory

## Code Style Guidelines

### TypeScript Configuration

- Strict mode enabled (`"strict": true`)
- Target: ES2017
- Module resolution: bundler
- Path alias: `@/*` -> `./*`
- React JSX transform
- Incremental builds enabled

### ESLint Rules

- Extends Next.js core web vitals and TypeScript config
- Disabled rules:
  - `@typescript-eslint/no-unused-vars`: off
  - `@typescript-eslint/no-explicit-any`: off
- Run linting with: `bun run lint`

### Prettier

- Empty config (`{}`) - uses default Prettier settings
- No custom formatting rules specified

### Import Order & Structure

1. React/Next.js imports
2. External library imports
3. Internal imports with `@/` alias
4. Relative imports
5. CSS imports

Example from layout.tsx:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Description, Icon, Title } from "@/lib/consts";
```

### Naming Conventions

- **Files**: kebab-case for component files (`item-card.tsx`), PascalCase for React components
  - **⚠️ CRITICAL - Convex files**: Only alphanumeric, underscores, or periods. NO DASHES! Use snake_case (`test_category_filter.ts`), NOT kebab-case for `/convex` directory
- **Components**: PascalCase (`ItemCard`, `ConvexClientProvider`)
- **Constants**: camelCase for regular constants, UPPER_SNAKE_CASE for exported constants
- **Types/Interfaces**: PascalCase
- **Hooks**: `use` prefix (`useCartSession`, `useRole`)

### React/Next.js Patterns

- Use React 19 with React Compiler enabled (`reactCompiler: true` in next.config.ts)
- App Router structure (`/app` directory)
- Server Components by default, Client Components with `"use client"` directive
  -d TypeScript interfaces for props with `Readonly<{children: React.ReactNode}>`
- Metadata exports for SEO

Example client component:

```typescript
"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export default function Component({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

### Tailwind CSS v4

- Uses `@tailwindcss/postcss` plugin (Tailwind v4)
- No custom `tailwind.config.js` found
- Utility classes in `app/globals.css`
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui `new-york` style

Example:

```tsx
import { cn } from "@/lib/utils";

function Example({ className }: { className?: string }) {
  return <div className={cn("bg-background text-foreground", className)} />;
}
```

### shadcn/ui Components

- Configured in `components.json`
- Component location: `@/components/ui`
- Style: `new-york`
- CSS variables enabled
- Base color: `gray`
- Icon library: `lucide`

Use existing UI components from `@/components/ui`:

```tsx
import { Button } from "@/components/ui/button";
```

### Convex Backend

- Schema defined in `/convex/schema.ts`
- Database operations in `/convex/manager.ts`
- Use environment variable `NEXT_PUBLIC_CONVEX_URL`
- Client provider wraps application

### Error Handling

- No explicit error boundaries found
- Consider adding try/catch for async operations
- Use TypeScript strict mode for type safety

### Internationalization

- Russian locale default (`ru-RU`)
- Format prices with Russian thousands separator by default
- Use `formatPrice()` utility from `@/lib/utils`

### File Structure

```
├── app/                 # Next.js App Router pages
│   ├── catalog/
│   ├── checkout/
│   ├── manager/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── CatalogComponents/
│   ├── Cart/
│   ├── Header/
│   └── Main/
├── convex/             # Backend logic
│   ├── schema.ts
│   ├── manager.ts
│   └── _generated/
├── hooks/              # Custom React hooks
├── lib/                # Utilities and constants
└── public/             # Static assets
```

### Code Examples

**Utility Functions** (`/lib/utils.ts`):

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number,
  options?: { locale?: string; currency?: string },
) {
  const locale = options?.locale || "ru-RU";
  return new Intl.NumberFormat(locale, {
    style: options?.currency ? "currency" : undefined,
    currency: options?.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
```

**Constants** (`/lib/consts.ts`):

```typescript
export const Title =
  "Климат 22: газовые котлы и инженерная сантехника в Барнауле";
export const Description = "Профессиональная продажа и установка...";
export const Phone = "+7 (993) 399-99-63";
export const FILTERS = ["Хиты продаж", "Новинки", "Со скидкой"] as const;
```

### Git Hooks

No Husky or pre-commit hooks configured. Linting should be run manually before commits.

### Deployment Notes

- Production build: `bun run build`
- Convex deployment: `bun run deploy` (builds Next.js and deploys Convex)
- Uses PM2 ecosystem config (`ecosystem.config.js`)

## Project Weaknesses

### Testing Coverage

- **No testing infrastructure**: No test framework (Jest, Vitest, etc.) configured
- **Zero test coverage**: No unit, integration, or e2e tests
- **Critical areas untested**: Cart/checkout flows, authentication, business logic in Convex functions
- **Recommendation**: Implement Vitest for Unit tests, integration tests with convex-test, aim for 75%+ coverage

### Security Vulnerabilities

- **Critical**: Manager/admin mutations lack authorization checks (`update_item`, `delete_item`, `update_order_status`)
- **Critical**: Role management via `localStorage` (manipulable by client: `useRole.ts`)
- **Critical**: Weak password policy (6 chars minimum vs 8-12+ recommended)
- **High**: Missing input validation on checkout (phone/email format)
- **High**: No rate limiting on mutations
- **Medium**: PII exposure in manager queries returning all user data
- **Recommendation**: Add `requireManager()` middleware, fetch roles from server only, enforce strong passwords, implement input validation schemas

### Performance Issues

- **Images**: `hero.jpg` (252KB) unoptimized, no lazy loading except one instance, 7.3MB+ images in `public/`
- **N+1 Queries**: Brand/category lookups in `catalog.ts` create queries for each item
- **Missing Code Splitting**: No `dynamic()` imports, all components load eagerly
- **Re-renders**: `ItemCard` and other heavy components lack `React.memo()`
- **Bundle Size**: `@tanstack/react-table`, `sharp`, all `lucide-react` icons bundled
- **Client-side sorting**: Price/sorting happens in browser instead of database
- **Recommendation**: Convert images to WebP, use `next/image` with lazy loading, implement loadMany() for batch lookups, add React.memo()

### Code Quality Issues

- **Code duplication**: Navigation links duplicated between DesktopHeader/MobileHeader/Footer, debounce logic in ItemCard/HeaderCart
- **Large files**: `convex/manager.ts` (619 lines), `convex/cart.ts` (566 lines), `app/checkout/page.tsx` (531 lines), `components/Footer.tsx` (267 lines)
- **Excessive `any` usage**: 49+ instances across codebase, especially in `items-table-content.tsx`, `columns.tsx`, manager components
- **Magic numbers**: Hardcoded `350px` heights, `300ms` debounce delays, `99` max quantity, `1500ms` toast durations
- **Error handling**: `alert()` calls in checkout, silent empty catch blocks, no error boundaries
- **Missing documentation**: Complex Convex query logic lacks comments explaining optimization strategy
- **Recommendation**: Extract constants to shared files, create `/types/index.ts`, add error boundaries, consolidate duplicate logic

### Architecture Concerns

- **Scattered feature code**: Catalog/Manager/ Cart logic spread across `app/`, `components/`, and `convex/` directories
- **No service layer**: Components directly call Convex mutations without abstraction
- **State management fragmentation**: Each component fetches data independently, no global state for cart/auth
- **Tight coupling**: Business logic mixed with UI components (validation, data transformation in View layers)
- **Inconsistent naming**: Mixed Russian/English (`FullAdress` typo vs clear English), inconsistent query prefixes
- **Scaling issues**: Client-side sorting for large datasets, no caching strategy, no permission-based auth
- **Recommendation**: Adopt feature-based structure (`/features/catalog`, `/features/cart`), create service layer, implement React Query pattern, separate business logic

### Monitoring & Observability

- **No error tracking**: No Sentry or similar service
- **No performance monitoring**: No visibility into slow queries or bundle sizes
- **No analytics**: No user behavior tracking
- **Recommendation**: Add error tracking (Sentry), implement logging for critical operations, set up performance monitoring

### Agent Reminders

1. Always run `bun run lint` AND `bun run typecheck` after making changes (do NOT build)
2. Use TypeScript strict mode - avoid `any` unless necessary
3. Follow existing import patterns and aliases
4. Check for existing utilities in `/lib` before creating new ones
5. Maintain Russian locale defaults for formatting
6. Use shadcn/ui components when possible for consistency
7. Add `"use client"` directive only when browser APIs are needed
8. Test both development (`bun run dev`)
9. **When renaming files, use `mv` command, NOT `rm` + recreate**
10. **Do NOT create summary documents** - just implement changes, let code speak
