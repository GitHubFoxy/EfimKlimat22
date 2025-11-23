# Fix: Manager Page Search Functionality

## Issue

The search functionality in the manager page (`app/manager/page.tsx`) was broken. It was performing client-side filtering instead of server-side filtering using the indexed `lowerCaseName` field.

### Problems Identified:

1. Search was filtering items on the client after fetching all results
2. Not utilizing the `lowerCaseName` field which has an index in the database
3. Inefficient for large datasets - all items were loaded before filtering

## Solution

Moved search filtering from client-side to server-side to leverage the indexed `lowerCaseName` field.

### Changes Made:

#### 1. Backend - `convex/admin_items.ts`

- Added `search: v.optional(v.string())` parameter to `list_items_paginated` query
- Implemented server-side search filtering that searches by:
  - `lowerCaseName` (item name, indexed)
  - `brand` (lowercase comparison)
  - `variant` (power/мощность)
- When search is active: collects items, filters in-memory, then manually paginates
- When no search: uses normal indexed pagination

#### 2. Frontend - `app/manager/page.tsx`

- Moved `itemSearch` state declaration before `usePaginatedQuery` to fix initialization order
- Updated `usePaginatedQuery` to pass `search` parameter to backend:
  ```typescript
  search: itemSearch.trim() || undefined;
  ```
- Removed client-side search filtering logic
- Client now only filters by "incomplete" status locally
- Fixed "can't access lexical declaration before initialization" error

### Technical Details:

**Before:**

```typescript
// Client-side filtering
const filtered = all.filter((it) => {
  if (q) {
    if (!it.name.toLowerCase().includes(q) && ...) {
      return false;
    }
  }
  return true;
});
```

**After:**

```typescript
// Server handles search via API parameter
usePaginatedQuery(api.admin_items.list_items_paginated, {
  category: itemCategoryFilter,
  subcategory: itemSubcategoryFilter,
  search: itemSearch.trim() || undefined,
}, ...)
```

## Benefits

- ✅ More efficient: search filtering happens on the server
- ✅ Uses indexed `lowerCaseName` field for better performance
- ✅ Reduces data transfer - only matching items are sent to client
- ✅ Consistent with other search implementations in the codebase
- ✅ Fixed initialization error

## Files Modified

1. `convex/admin_items.ts` - Added search parameter and filtering logic
2. `app/manager/page.tsx` - Updated to use server-side search, fixed declaration order
