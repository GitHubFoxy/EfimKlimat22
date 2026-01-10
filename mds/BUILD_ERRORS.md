# Build & Lint Errors Report

**Date**: 2026-01-09  
**Status**: ❌ FAILED

---

## Build Errors (TypeScript)

### 1. Type Error in `app/checkout/page.tsx:69`
```
Type 'string | undefined' is not assignable to type '{ details?: string | undefined; city: string; street: string; } | undefined'.
```
**File**: `app/checkout/page.tsx`  
**Line**: 69  
**Issue**: `formData.address` is a string but the API expects an object with `{ details?, city, street }` structure.

---

## Lint Errors (ESLint)

### 2. `app/catalog/CatalogClient.tsx`
- **Line 78**: `'loadMore'` should use `const` instead of `let`
- **Line 87**: `'sortedResults'` should use `const` instead of `let`
- **Line 131**: React Hook `usePreloadedQuery` called conditionally (must be called in same order every render)
- **Lines 183**: Unescaped quotes - use `&quot;` instead of `"`

### 3. `app/catalog/[slug]/ItemClient.tsx`
- **Line 111**: Use `<Image />` from `next/image` instead of `<img>`

### 4. `app/checkout/page.tsx`
- **Lines 252-253**: Unescaped quotes - use `&quot;` instead of `"`
- **Type Error**: Address field type mismatch (see build errors above)

### 5. `app/manager/data-table.tsx`
- **Line 28**: React Compiler warning - `useReactTable()` returns functions that cannot be memoized safely

### 6. `app/manager/items-table-content.tsx`
- **Line 28**: Avoid calling `setState()` directly in effect - causes cascading renders. Use callback pattern instead.

### 7. `components/Header/DesktopHeader.tsx`
- **Line 76**: Empty block statement `{}`

### 8. `components/Header/HeaderSearch.tsx`
- **Line 66**: Use `<Image />` from `next/image` instead of `<img>`

### 9. `components/app-sidebar.tsx`
- **Line 50**: Use `<Image />` from `next/image` instead of `<img>`

### 10. `components/manager/ManagerSidebar.tsx`
- **Line 32**: Use `<Image />` from `next/image` instead of `<img>`

### 11. `components/manager/items/ItemsList.tsx`
- **Line 453**: Empty block statement `{}`

### 12. `components/ui/sidebar.tsx`
- **Line 611**: Cannot call impure function `Math.random()` during render - move outside useMemo or use a stable seed

### 13. `convex/catalog.ts`
- **Line 75**: `'conditions'` should use `const` instead of `let`
- **Line 133**: `'conditions'` should use `const` instead of `let`

### 14. `ecosystem.config.js`
- **Line 1**: `'module'` is not defined (Node.js global not available in ESLint)

### 15. `hooks/useRole.ts`
- **Lines 23, 29**: Empty block statements `{}`

### 16. `scripts/seed.mjs`
- **Lines 18, 85, 94, 97, 108, 132, 136, 140**: `'console'` is not defined
- **Line 54**: `'fetch'` is not defined
- **Line 93**: Variable `'e'` is defined but never used

---

## Summary

| Category | Count |
|----------|-------|
| Build Errors | 1 |
| Lint Errors | 28 |
| Lint Warnings | 6 |
| **TOTAL** | **35** |

**Critical Issues** (blocking build):
1. Type mismatch in checkout page address field

**Major Issues** (React/performance):
1. Conditional hook calls in CatalogClient
2. setState in effect in items-table-content
3. Impure function in render (Math.random)

**Code Quality Issues**:
- 7 empty block statements
- 7 unescaped quote characters
- 4 `let` variables that should be `const`
- Multiple `<img>` tags that should be `<Image />`
- ESLint config issues for non-browser scripts
