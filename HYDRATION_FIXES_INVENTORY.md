# Hydration Error Fixes Inventory

**Last Updated**: 2026-01-14

## Summary

This document catalogs all instances of hydration error workarounds across the EfimKlimat22 project. These fixes handle the mismatch between server-side rendering (SSR) and client-side hydration in Next.js.

---

## 1. ClientOnly Component Usage

### Component Definition
**File**: [components/ClientOnly.tsx](file:///home/coder/Projects/EfimKlimat22/components/ClientOnly.tsx)

```typescript
"use client";

import { ReactNode, useEffect, useState } from "react";

export function ClientOnly({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;
  return <>{children}</>;
}
```

**Pattern**: Classic hydration fix using `useState(false)` + `useEffect` to set true on mount.

---

## 2. ClientOnly Usage in Project

### File 1: CatalogClient.tsx
**Path**: [app/catalog/CatalogClient.tsx](file:///home/coder/Projects/EfimKlimat22/app/catalog/CatalogClient.tsx)

**Import**: Line 13
```typescript
import { ClientOnly } from "@/components/ClientOnly";
```

**Usage**: Lines 291-310
```typescript
<ClientOnly>
  <CatalogFilters
    categories={categories}
    selectedCategoryId={selectedCategoryId}
    onCategoryChange={setSelectedCategoryId}
    subcategories={subcategories}
    selectedSubcategory={selectedSubcategory}
    onSubcategoryChange={setSelectedSubcategory}
    selectedFilter={selectedFilter}
    onFilterChange={setSelectedFilter}
    brands={brands}
    selectedBrand={selectedBrand}
    onBrandChange={setSelectedBrand}
    priceSort={priceSort}
    onPriceSortChange={setPriceSort}
    variantSort={variantSort}
    onVariantSortChange={setVariantSort}
    onClearAll={clearAllFilters}
  />
</ClientOnly>
```

**Wrapped Component**: `CatalogFilters`

---

### File 2: Footer.tsx
**Path**: [components/Footer.tsx](file:///home/coder/Projects/EfimKlimat22/components/Footer.tsx)

**Import**: Line 7
```typescript
import { ClientOnly } from "@/components/ClientOnly";
```

**Usage**: Lines 87-260
Wraps THREE Dialog components:
1. **Dialog 1 (Lines 88-149)**: "Пользовательское соглашение" (Terms of Service)
2. **Dialog 2 (Lines 151-237)**: "Условия возврата и отмены" (Return & Cancellation Conditions)
3. **Dialog 3 (Lines 239-259)**: "Лицензии и сертификаты" (Licenses & Certificates)

```typescript
<ClientOnly>
  <Dialog>
    <DialogTrigger asChild>
      <span className="underline cursor-pointer text-blue-700">
        Пользовательское соглашение
      </span>
    </DialogTrigger>
    {/* DialogContent... */}
  </Dialog>
  {/* Two more Dialog components */}
</ClientOnly>
```

**Wrapped Components**: `Dialog` UI components (3 instances)

---

## 3. Window Type-Checks (typeof window === "undefined")

### File 1: useRole.ts
**Path**: [hooks/useRole.ts](file:///home/coder/Projects/EfimKlimat22/hooks/useRole.ts)

**Usage 1**: Lines 8-13
```typescript
const [role, setRole] = useState<Role>(() => {
  if (typeof window === "undefined") return "user";
  const stored = window.localStorage.getItem("role") as Role | null;
  if (stored) return stored;
  return process.env.NODE_ENV === "development" ? "manager" : "user";
});
```

**Usage 2**: Lines 15-18
```typescript
const [managerId, setManagerId] = useState<string | null>(() => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("managerId");
});
```

**Purpose**: Guard localStorage access during SSR

---

### File 2: useCartSession.ts
**Path**: [hooks/useCartSession.ts](file:///home/coder/Projects/EfimKlimat22/hooks/useCartSession.ts)

**Usage 1**: Lines 10-21 (in `getOrCreateSessionId()`)
```typescript
function getOrCreateSessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.localStorage.getItem("cartSessionId");
    if (existing && existing.length > 0) return existing;
    const id = uuidv4();
    window.localStorage.setItem("cartSessionId", id);
    return id;
  } catch {
    return undefined;
  }
}
```

**Usage 2**: Line 56 (in `useMergeCartOnAuth()`)
```typescript
const sessionId = window.localStorage.getItem("cartSessionId");
```

**Purpose**: Guard localStorage access during SSR for cart session management

---

## 4. useSyncExternalStore Pattern (Modern Alternative)

### File: HeaderCart.tsx
**Path**: [components/Cart/HeaderCart.tsx](file:///home/coder/Projects/EfimKlimat22/components/Cart/HeaderCart.tsx)

**Pattern**: Lines 23-30
```typescript
const emptySubscribe = () => () => {};

export default function Cart({ className }: { className?: string }) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  // ...

  if (!isMounted) {
    return (
      <Button
        className={twMerge(
          "relative w-12 h-12 bg-light-orange rounded-full cursor-pointer",
          className,
        )}
      >
        <ShoppingCart />
      </Button>
    );
  }

  // Full cart dialog only rendered on client
  return (
    <Dialog>
      {/* ... */}
    </Dialog>
  );
}
```

**Method**: React 18's `useSyncExternalStore` hook
- Returns `true` on client
- Returns `false` on server
- No useEffect needed (more efficient)

---

## 5. ESLint Configuration

**File**: [eslint.config.mjs](file:///home/coder/Projects/EfimKlimat22/eslint.config.mjs)

**Line 25**: Disabled hydration-related rule
```javascript
rules: {
  // ... other rules
  "react-hooks/set-state-in-effect": "off",  // Line 25
  // ... other rules
}
```

**Rule Purpose**: Allows `setState` inside `useEffect` (used in ClientOnly pattern)

---

## 6. Summary Table

| File | Pattern Type | Lines | Component(s) Wrapped | Status |
|------|--------------|-------|----------------------|--------|
| `components/ClientOnly.tsx` | useState + useEffect | 5-13 | N/A (wrapper) | Active |
| `app/catalog/CatalogClient.tsx` | ClientOnly wrapper | 291-310 | CatalogFilters | Active |
| `components/Footer.tsx` | ClientOnly wrapper | 87-260 | 3x Dialog | Active |
| `hooks/useRole.ts` | typeof window check | 9, 16 | N/A (hook guard) | Active |
| `hooks/useCartSession.ts` | typeof window check | 11, 56 | N/A (hook guard) | Active |
| `components/Cart/HeaderCart.tsx` | useSyncExternalStore | 26-30 | Cart Dialog | Active |
| `eslint.config.mjs` | Rule disable | 25 | set-state-in-effect | Active |

---

## 7. Hydration Issues Addressed

### Issue 1: CatalogFilters
- **Problem**: Filters component uses URL params that may not match during SSR
- **Solution**: Wrapped in ClientOnly to defer rendering until client
- **File**: CatalogClient.tsx, lines 291-310

### Issue 2: Dialog Components (Footer)
- **Problem**: Dialog/DialogTrigger state inconsistency between server and client
- **Solution**: Wrapped all three Dialog modals in ClientOnly
- **File**: Footer.tsx, lines 87-260

### Issue 3: Cart Display
- **Problem**: Cart icon count may differ between server and client render
- **Solution**: useSyncExternalStore detects hydration, returns simplified UI on server
- **File**: HeaderCart.tsx, lines 26-30

### Issue 4: Role/Session Management
- **Problem**: localStorage is server-side inaccessible, SSR may render with wrong role
- **Solution**: Guard with `typeof window === "undefined"` checks
- **Files**: useRole.ts, useCartSession.ts

---

## 8. Best Practices Observed

✅ **Good**:
- ClientOnly wrapper properly delays rendering until client
- typeof window checks prevent SSR errors
- useSyncExternalStore is a modern, efficient alternative
- ESLint rule correctly disabled for patterns that require it

⚠️ **Concerns**:
- Multiple patterns used (ClientOnly + useSyncExternalStore + typeof window)
- ClientOnly could be replaced with useSyncExternalStore for consistency
- No centralized hydration detection utility
- Role/localStorage management stored client-side (security concern, separate issue)

---

## 9. Recommendations

### To Reduce Hydration Workarounds:
1. **Replace ClientOnly with useSyncExternalStore** for CatalogFilters and Dialog
2. **Create utility hook**: `useIsMounted()` for consistent hydration detection
3. **Move role/session logic server-side** (separate security hardening task)
4. **Suppress Hydration Errors in Development**: Add `suppressHydrationWarning` prop where needed

### Example Refactor:
```typescript
// hooks/useIsMounted.ts
"use client";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
```

Usage:
```typescript
"use client";
import { useIsMounted } from "@/hooks/useIsMounted";

export function CatalogFilters(props) {
  const isMounted = useIsMounted();
  
  if (!isMounted) return null;
  
  return <>{/* filter UI */}</>;
}
```

---

## Files to Review

1. ✅ [components/ClientOnly.tsx](file:///home/coder/Projects/EfimKlimat22/components/ClientOnly.tsx)
2. ✅ [app/catalog/CatalogClient.tsx](file:///home/coder/Projects/EfimKlimat22/app/catalog/CatalogClient.tsx)
3. ✅ [components/Footer.tsx](file:///home/coder/Projects/EfimKlimat22/components/Footer.tsx)
4. ✅ [hooks/useRole.ts](file:///home/coder/Projects/EfimKlimat22/hooks/useRole.ts)
5. ✅ [hooks/useCartSession.ts](file:///home/coder/Projects/EfimKlimat22/hooks/useCartSession.ts)
6. ✅ [components/Cart/HeaderCart.tsx](file:///home/coder/Projects/EfimKlimat22/components/Cart/HeaderCart.tsx)
7. ✅ [eslint.config.mjs](file:///home/coder/Projects/EfimKlimat22/eslint.config.mjs)
