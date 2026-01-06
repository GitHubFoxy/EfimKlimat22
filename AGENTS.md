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

# Build & Deployment
bun run build                  # Build Next.js application with linting
bun run quick-build            # Build without linting
bun run start                  # Start production server
bun run deploy                 # Build and deploy to Convex

# Code Quality
bun run lint                   # Run Next.js ESLint
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

### Agent Reminders

1. Always run `bun run lint` after making changes
2. Use TypeScript strict mode - avoid `any` unless necessary
3. Follow existing import patterns and aliases
4. Check for existing utilities in `/lib` before creating new ones
5. Maintain Russian locale defaults for formatting
6. Use shadcn/ui components when possible for consistency
7. Add `"use client"` directive only when browser APIs are needed
8. Test both development (`bun run dev`)
