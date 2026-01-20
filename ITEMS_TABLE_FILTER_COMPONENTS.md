# Items Table Filter Components - Complete Reference

## Overview
The items table filter system is composed of several interconnected components in the `/manager` section that handle filtering, searching, sorting, and pagination of items.

---

## 1. Items Table Component
**File:** [app/manager/items-table-content.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/items-table-content.tsx)

### Key Responsibilities:
- Main container component for items table
- Manages all filter state (brandId, categoryId, status)
- Handles URL parameter synchronization (router.replace)
- Manages pagination cursor and sorting state
- Delegates filter UI to ItemsFilterBar component
- Fetches data using either preloaded query or reactive query

### Filter State Management (Lines 42-62):
```typescript
const [cursor, setCursor] = useState<string | null>(...)
const [sortBy, setSortBy] = useState<SortBy>(...)
const [sortOrder, setSortOrder] = useState<SortOrder>(...)
const [brandId, setBrandId] = useState<Id<"brands"> | undefined>(...)
const [categoryId, setCategoryId] = useState<Id<"categories"> | undefined>(...)
const [status, setStatus] = useState<ItemStatus | undefined>(...)
```

### Key Handlers (Lines 79-132):
- `handleSortChange()` - Lines 79-86: Toggles sort order and updates URL params
- `handleFilterChange()` - Lines 89-92: Resets cursor when filters change
- `handleClearFilters()` - Lines 94-105: Clears all filters
- `handleBrandChange()` - Lines 107-113: Updates brand filter
- `handleCategoryChange()` - Lines 115-124: Updates category filter
- `handleStatusChange()` - Lines 126-132: Updates status filter

### Query Building (Lines 154-172):
- Constructs query arguments conditionally based on filter state
- Switches between `api.manager.search_items` (when searching) and `api.manager.list_items` (when filtering)
- Uses preloaded query for initial load, reactive query for updates

---

## 2. Filter Bar Component
**File:** [app/manager/items-filter-bar.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/items-filter-bar.tsx)

### Key Responsibilities:
- UI component for all three filters: Brand, Category, Status
- Renders Select dropdowns for each filter
- Displays active filter count
- Shows "Clear Filters" button when filters are active
- Fetches list of available brands and categories from backend

### Props Interface (Lines 18-26):
```typescript
interface ItemsFilterBarProps {
  brandId: Id<"brands"> | undefined;
  categoryId: Id<"categories"> | undefined;
  status: ItemStatus | undefined;
  onBrandChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
}
```

### Filter Elements:
1. **Brand Filter** (Lines 46-59): Uses `list_brands_all` query to populate options
2. **Category Filter** (Lines 61-74): Uses `list_categories_all` query to populate options
3. **Status Filter** (Lines 76-87): Hardcoded options (active, draft, preorder)
4. **Clear Button** (Lines 90-100): Appears only when filters are active

### Data Fetching (Lines 37-38):
```typescript
const brands = useQuery(api.manager.list_brands_all);
const categories = useQuery(api.manager.list_categories_all);
```

---

## 3. Column Definitions
**File:** [app/manager/columns.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/columns.tsx)

### Item Columns Factory (Lines 112-192):
- **Function:** `getItemColumns(handlers?)`
- **Purpose:** Creates column definitions for the DataTable component
- **Columns Defined:**
  1. **Name** (Lines 119-131): Displays item name with SKU
  2. **Brand** (Lines 133-140): Shows brand name
  3. **Quantity** (Lines 141-144): Display-only numeric field
  4. **Price** (Lines 145-155): Formatted as RUB currency
  5. **Actions** (Lines 157-190): Dropdown menu for Edit/Delete operations

### Handlers (Lines 112-116):
- `onEdit` - Called when user clicks "Редактировать товар"
- `onDelete` - Called when user clicks "Удалить товар"

---

## 4. Category/Subcategory Data Structure
**File:** [convex/schema.ts](file:///home/coder/Projects/EfimKlimat22/convex/schema.ts)

### Categories Table Definition (Lines 158-176):
```typescript
const categoryTable = defineTable({
  name: v.string(),
  slug: v.string(),
  parentId: v.optional(v.id("categories")),  // For subcategories
  level: v.number(),                          // Category hierarchy level
  order: v.number(),                          // Sort order
  icon: v.optional(v.string()),
  imagesUrl: v.optional(v.string()),
  imageStorageIds: v.optional(v.id("_storage")),
  description: v.optional(v.string()),
  isVisible: v.boolean(),
  legacyId: v.optional(v.string()),
})
  .searchIndex("search_name", { searchField: "name" })
  .index("by_parent_order", ["parentId", "order"])
  .index("by_slug", ["slug"])
  .index("by_legacyId", ["legacyId"]);
```

### Items Table - Category Link (Lines 91-156):
```typescript
categoryId: v.optional(v.id("categories")), // Links items to categories
```

### Key Indexes for Category Queries (Lines 140-156):
- `"by_category_price"` - categoryId, status, price
- `"by_category_orders"` - categoryId, status, ordersCount
- `"by_category_created"` - categoryId, status
- `"by_category_discount"` - categoryId, status, discountAmount
- `"by_category_no_status"` - categoryId (for filtering without status)
- `"by_category_brand_collection"` - categoryId, brandId, status, collection

---

## 5. Backend Queries
**File:** [convex/manager.ts](file:///home/coder/Projects/EfimKlimat22/convex/manager.ts)

### list_items Query (Lines 147-250):
- **Args:** paginationOpts, sortBy, sortOrder, brandId, categoryId, status
- **Category Filter Logic** (Lines 182-185):
  - Calls `getDescendantCategoryIds()` to get all subcategories
  - Builds OR condition for all descendant categories
  - Uses this to filter items from entire category tree
- **Sorting:** Client specifies field + direction
- **Pagination:** Uses cursor-based pagination (numItems: 24)

### search_items Query (Lines 325-410):
- **Args:** query (search string), paginationOpts, sortBy, sortOrder, brandId, categoryId, status
- **Search Mechanism:** Full-text search via `withSearchIndex("search_main")`
- **Category Filter Logic** (Lines 359-361):
  - Same descendant category lookup as list_items
  - Applied as post-search filter
- **Flow:** Search all items → apply filters → paginate → sort

### list_brands_all Query (Lines 791-795):
- Returns all brands without filtering
- Called by ItemsFilterBar to populate brand dropdown

### list_categories_all Query (Lines 797-801):
- Returns all categories without filtering
- Called by ItemsFilterBar to populate category dropdown
- **Issue:** Returns all categories including subcategories, flattened list

---

## 6. Category Hierarchy Helper
**File:** [convex/manager.ts](file:///home/coder/Projects/EfimKlimat22/convex/manager.ts)

### getDescendantCategoryIds Function:
- **Purpose:** Recursively fetches all subcategories of a parent
- **Used by:** list_items and search_items queries
- **Logic:** Handles hierarchical category structure with parentId references
- **Key for Filter:** Ensures filtering by parent category includes all child categories

---

## URL Parameter Synchronization
**Location:** [items-table-content.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/items-table-content.tsx#L64-L77)

Parameters persisted in URL query string:
- `cursor` - Pagination cursor
- `sortBy` - Current sort field
- `sortOrder` - asc or desc
- `brandId` - Selected brand filter
- `categoryId` - Selected category filter
- `status` - Selected status filter

This allows:
- Bookmarkable filtered views
- Browser back/forward navigation through filter states
- Sharing filtered URLs with other users

---

## Data Flow Diagram

```
User Interaction
    ↓
ItemsTableContent (State Manager)
    ├─ Updates URL params (router.replace)
    ├─ Updates local state (brand/category/status)
    └─ Calls appropriate backend query
        ├─ search_items (if search text present)
        └─ list_items (if only filters)
            ├─ Applies category → getDescendantCategoryIds()
            ├─ Applies brand filter
            ├─ Applies status filter
            ├─ Sorts results
            └─ Returns paginated results

ItemsFilterBar (UI Layer)
    ├─ Receives current filter values as props
    ├─ Fetches brands & categories for dropdowns
    ├─ Calls onBrandChange/onCategoryChange/onStatusChange
    └─ Displays active filter count

DataTable (Display Layer)
    ├─ Receives transformed item data
    ├─ Uses getItemColumns() for column definitions
    └─ Renders with Edit/Delete actions
```

---

## Current Limitations & Issues

1. **list_categories_all returns flat list** - No hierarchy in dropdown
   - All categories shown equally, subcategories not grouped
   - Potential UX issue with many categories

2. **Subcategory filtering works in backend** - But UI doesn't expose it
   - getDescendantCategoryIds() handles hierarchy correctly
   - Filter bar just shows flat category list

3. **No subcategory selection in UI** - Would need changes to:
   - ItemsFilterBar to show hierarchical category selector
   - Potentially add grouped Select with category groups

4. **Category dropdown not organized** - Consider:
   - Grouping by parent category
   - Indentation in dropdown
   - Hierarchical tree component instead of flat Select

---

## File Index

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| [app/manager/items-table-content.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/items-table-content.tsx) | Component | 1-309 | Main table container, filter state, URL sync |
| [app/manager/items-filter-bar.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/items-filter-bar.tsx) | Component | 1-111 | Filter UI dropdowns |
| [app/manager/columns.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/columns.tsx) | Config | 103-192 | Item table column definitions |
| [convex/schema.ts](file:///home/coder/Projects/EfimKlimat22/convex/schema.ts) | Schema | 158-176 | Category table definition |
| [convex/manager.ts](file:///home/coder/Projects/EfimKlimat22/convex/manager.ts) | Backend | 147-250, 325-410, 791-801 | list_items, search_items, list_brands_all, list_categories_all queries |
