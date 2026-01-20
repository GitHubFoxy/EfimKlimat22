# Brand References Audit

## Summary
Comprehensive mapping of all files that reference brand IDs, schema definitions, filtering logic, and URL parameter handling for brands.

---

## 1. SCHEMA DEFINITIONS

### [convex/schema.ts](file:///home/coder/Projects/EfimKlimat22/convex/schema.ts)

**Brand Table Definition** (L77-88)
```
- name: string
- slug: string
- logo: optional string
- description: optional string
- country: optional string
- status: "active" | "hidden"
- sortOrder: optional number
- legacyId: optional string
Indexes: by_status_sort, by_legacyId
```

**Item Table - Brand References** (L96, L137, L145-154)
- L96: `brandId: v.optional(v.id("brands"))` - Foreign key reference
- L137: Brand included in search index filterFields
- L145: `.index("by_brand_status", ["status", "brandId"])`
- L148: `.index("by_brand_no_status", ["brandId"])`
- L149-154: `.index("by_category_brand_collection", ["categoryId", "brandId", "status", "collection"])`

**Collection Groups Table - Brand References** (L347, L359)
- L347: `brandId: v.id("brands")` - Foreign key
- L359: `.index("by_category_brand", ["categoryId", "brandId"])`

---

## 2. CONVEX BACKEND QUERIES & MUTATIONS

### [convex/catalog.ts](file:///home/coder/Projects/EfimKlimat22/convex/catalog.ts)

**Query: show_all_brands** (L74-85)
- Fetches all active brands ordered by name
- Used for initial catalog brand list
- No category filtering

**Query: catalog_query_based_on_category_and_filter** (L88-190)
- L96: `brand: v.optional(v.id("brands"))` - Brand parameter
- L206: `brand: v.optional(v.id("brands"))` - Argument definition
- L227-230: Brand filtering logic with index
  ```
  if (brand) {
    groupsQuery = groupsQuery.filter((q) => q.eq(q.field("brandId"), brand));
  }
  ```
- L248-252: Fetches brand details during result enrichment

**Query: catalog_brands_by_category** (L438-483)
- Gets brands that have items in a specific category
- L440: `categoryId: v.id("categories")` parameter
- L442-461: Filters items by category and brand existence
- L463-469: Extracts unique brand IDs from items
- L471-477: Fetches full brand details
- L479-481: Filters for active brands only
- **Purpose**: Dynamic brand filtering based on selected category

**Query: show_items_by_brand_and_collection** (L382+)
- Returns items by brand and collection
- Used for related items display on product pages

**Query: get_variant_count** (L415-435)
- L417: `brandId: v.id("brands")` parameter
- L418: `categoryId: v.id("categories")` parameter
- Counts variants (items with same brand and category)

---

### [convex/manager.ts](file:///home/coder/Projects/EfimKlimat22/convex/manager.ts)

**Mutation: create_or_update_item** (L161, L173, L200-201)
- L161: `brandId: v.optional(v.id("brands"))` - Input parameter
- L173: Stored in item document
- L200-201: Included in filter conditions for duplicate checking

**Query: list_items_paginated** (L216-225)
- L216-220: Uses index "by_brand_status" when both brandId and status provided
- L222-225: Uses index "by_brand_no_status" when only brandId provided
- Index optimization for brand-based filtering

**Query: list_brands_all** (L791-793)
- Returns all brands from database
- Used in manager/admin interfaces for dropdowns

**Query: get_item_with_brand** (L281+)
- Enriches items with brand information

---

### [convex/dashboard.ts](file:///home/coder/Projects/EfimKlimat22/convex/dashboard.ts)

**Query: show_items_by_brand_and_collection** (L31-45)
- L34: `brandId: v.id("brands")` parameter
- Product page related items by brand

**Query: show_all_brands** (L57-66)
- Active brands filtered, ordered by status and sort order

---

### [convex/collection_groups_manager.ts](file:///home/coder/Projects/EfimKlimat22/convex/collection_groups_manager.ts)

**Uses brand filtering in multiple places:**
- L14, L22, L39, L60-63: Brand equality checks
- L83: Stores `brandId` in collection group
- L104, L109: Brand validation and filtering

---

### [convex/migrations.ts](file:///home/coder/Projects/EfimKlimat22/convex/migrations.ts)

**Brand migration & resolution** (L15-125)
- L15: `addMissingBrands` mutation
- L25: Query all brands
- L29-31: Check existing brand names
- L52: Fetch all brands for mapping
- L135, L179: Brand resolution by name to ID

---

## 3. FRONTEND - CATALOG PAGE

### [app/catalog/page.tsx](file:///home/coder/Projects/EfimKlimat22/app/catalog/page.tsx)

**Server Component** (L1-38)
- L29: Preloads all brands with `preloadQuery(api.catalog.show_all_brands)`
- Passes preloaded brands to CatalogClient

---

### [app/catalog/CatalogClient.tsx](file:///home/coder/Projects/EfimKlimat22/app/catalog/CatalogClient.tsx)

**URL Parameter Handling for Brands** (L151-225)

1. **URL Parameter Reading** (L171-176)
   ```typescript
   const brandParam = params.get("brand");
   const selectedBrand = useMemo<Id<"brands"> | null>(
     () => (brandParam as Id<"brands">) ?? null,
     [brandParam],
   );
   ```
   - Reads brand ID from URL query parameter

2. **Dynamic Brand Fetching** (L187-193)
   ```typescript
   const categoryBrandsQuery = useQuery(
     api.catalog.catalog_brands_by_category,
     selectedCategoryId ? { categoryId: selectedCategoryId } : "skip",
   );
   const brands = categoryBrandsQuery ?? brandsAll;
   ```
   - Fetches brands filtered by selected category
   - Falls back to all brands if no category selected

3. **URL Update Helper** (L214-220)
   ```typescript
   const updateParams = (updates: Record<string, string | null>) => {
     const newParams = new URLSearchParams(params.toString());
     for (const [key, value] of Object.entries(updates)) {
       if (value === null) {
         newParams.delete(key);
       } else {
         newParams.set(key, value);
       }
     }
   ```
   - Generic URL parameter update function

---

### [components/CatalogComponents/CatalogFilters.tsx](file:///home/coder/Projects/EfimKlimat22/components/CatalogComponents/CatalogFilters.tsx)

**Brand Filter UI** (L30-32, L52-54, L66, L77)
- L31: `selectedBrand: Id<"brands"> | null` - State prop
- L32: `onBrandChange: (brand: Id<"brands"> | null) => void` - Callback
- L52-54: Brand dropdown render
- L66: Checks for active brand filter
- L77: Clear brand filter when reset

---

### [components/CatalogComponents/CatalogResultsGrid.tsx](file:///home/coder/Projects/EfimKlimat22/components/CatalogComponents/CatalogResultsGrid.tsx)
- Displays items after brand filtering

---

### [components/CatalogComponents/CatalogResultsWrapper.tsx](file:///home/coder/Projects/EfimKlimat22/components/CatalogComponents/CatalogResultsWrapper.tsx)
- Wraps results with brand-filtered data

---

## 4. MANAGER PANEL - ITEMS MANAGEMENT

### [app/manager/items-table-content.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/items-table-content.tsx)

**Brand URL Parameter Handling** (L39-77)
- L39: Reads `useSearchParams()` hook
- L53-55: Brand ID from URL parameter
  ```typescript
  const [brandId, setBrandId] = useState<Id<"brands"> | undefined>(
    (searchParams.get("brandId") as Id<"brands">) ?? undefined,
  );
  ```
- L160: Adds brandId to query when filtering
- L65-75: URL sync utility for parameter updates

---

### [app/manager/items-filter-bar.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/items-filter-bar.tsx)

**Brand Filter Component** (L37)
- `const brands = useQuery(api.manager.list_brands_all);`
- Renders brand filter dropdown in manager items table

---

### [app/manager/item-form-dialog.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/item-form-dialog.tsx)

**Brand Selection in Item Form** (L39)
- `const brands = useQuery(api.manager.list_brands_all);`
- Dropdown for selecting brand when creating/editing items

---

### [app/manager/items/page.tsx](file:///home/coder/Projects/EfimKlimat22/app/manager/items/page.tsx)

**Preload Brands** (L28)
- `preloadQuery(api.manager.list_brands_all)`
- Server-side preload for manager page

---

## 5. DATA IMPORT & MIGRATION

### [import-clean.mts](file:///home/coder/Projects/EfimKlimat22/import-clean.mts)

**Brand references in data mapping** (L12, L24)
- L12: `"brands"` table name
- L24: `items: { brandId: "brands", categoryId: "categories" }` - Foreign key mapping

---

### [import-dev.mts](file:///home/coder/Projects/EfimKlimat22/import-dev.mts)

**Same structure as import-clean.mts**

---

### [import-driver.mts](file:///home/coder/Projects/EfimKlimat22/import-driver.mts)

**Brand import mapping** (L19, L33)
- L19: `"brands"` table
- L33: `brandId: "brands"` - Foreign key

---

## 6. MIGRATION & COLLECTION GROUPING

### [convex/migrations/init_collection_groups.ts](file:///home/coder/Projects/EfimKlimat22/convex/migrations/init_collection_groups.ts)

**Brand-aware collection grouping** (L17-66)
- L17: Comment about grouping by brandId
- L21: `brandId: Id<"brands">` type definition
- L33: Brand validation check
- L40, L44: Brand in grouping key
- L66: Brand stored in collection group

---

## 7. DEBUG & UTILITY

### [convex/debug.ts](file:///home/coder/Projects/EfimKlimat22/convex/debug.ts)

**Brand data inspection** (L7, L11-12, L21, L32, L46, L61)
- L7: Query all brands
- L11-12: Build brands ID mapping
- L21: Export brands map
- L32, L46: Include brands in database operations
- L61: Insert test brand

---

### [convex/main.ts](file:///home/coder/Projects/EfimKlimat22/convex/main.ts)

**Brand enrichment in search results** (L20-37, L86+)
- L20-27: Fetch brand name for each item by brandId
- L32: Include brandName in results
- Pattern repeated in multiple queries for data enrichment

---

## 8. DOCUMENTATION

### [mds/features/03-catalog.md](file:///home/coder/Projects/EfimKlimat22/mds/features/03-catalog.md)

**Feature specification for brand filtering:**
- L5: Dynamic brand fetching mentioned
- L9: URL params for all filters including brand
- L11: Dynamic brand list based on selected category
- L18: Task to create `catalog_brands_by_category` query (COMPLETED)
- L19: Task to update CatalogFilters (COMPLETED)

---

## URL PARAMETER PATTERNS

### Brand URL Parameter Names
- **Catalog**: `?brand={brandId}`
- **Manager Items**: `?brandId={brandId}`

### Sample URLs
- `/catalog?category=electronics&brand=sony&filter=Хиты продаж`
- `/catalog?category=electronics&subcategory=tvs&brand=lg`
- `/manager/items?brandId=abc123&status=active`

---

## INDEXING STRATEGY

### Indexes for Brand Queries
- `by_brand_status`: [status, brandId] - Used when filtering by both
- `by_brand_no_status`: [brandId] - Used when filtering by brand only
- `by_category_brand_collection`: [categoryId, brandId, status, collection] - Complex queries
- `by_category_brand`: [categoryId, brandId] - Related items queries

---

## KEY QUERIES SUMMARY

| Query | File | Purpose | Brand Filter |
|-------|------|---------|--------------|
| `show_all_brands` | catalog.ts | Get all active brands | No |
| `catalog_brands_by_category` | catalog.ts | Brands in specific category | By category ID |
| `catalog_query_based_on_category_and_filter` | catalog.ts | Filtered catalog results | Direct brand ID |
| `show_items_by_brand_and_collection` | catalog.ts, dashboard.ts | Related products | Direct brand ID |
| `list_brands_all` | manager.ts | Manager dropdown | No |
| `list_items_paginated` | manager.ts | Manager table with filters | Direct or via index |

---

## CRITICAL OBSERVATIONS

### 1. N+1 Query Problem
- **Location**: [convex/catalog.ts:L241-264](file:///home/coder/Projects/EfimKlimat22/convex/catalog.ts#L241-L264)
- **Issue**: Fetches brand details in Promise.all loop for each group
- **Impact**: One query per item + one per brand lookup
- **Solution**: Batch load brands or use denormalization

### 2. Dynamic Brand Filtering by Category
- **Location**: [app/catalog/CatalogClient.tsx:L187-193](file:///home/coder/Projects/EfimKlimat22/app/catalog/CatalogClient.tsx#L187-L193)
- **Status**: IMPLEMENTED
- **Query**: `catalog_brands_by_category` properly fetches brands for selected category

### 3. URL Parameter Sync
- **Catalog**: [app/catalog/CatalogClient.tsx:L214-220](file:///home/coder/Projects/EfimKlimat22/app/catalog/CatalogClient.tsx#L214-L220)
- **Manager**: [app/manager/items-table-content.tsx:L64-75](file:///home/coder/Projects/EfimKlimat22/app/manager/items-table-content.tsx#L64-L75)
- **Status**: IMPLEMENTED

### 4. Brand Data Enrichment
- **Pattern**: Manual brand name fetching in multiple queries
- **Files**: convex/catalog.ts, convex/main.ts, convex/dashboard.ts
- **Optimization**: Consider storing brand name in collection_groups for faster access

### 5. Manager Items Filtering
- **Location**: [convex/manager.ts:L216-225](file:///home/coder/Projects/EfimKlimat22/convex/manager.ts#L216-L225)
- **Status**: Uses proper indexes for brand + status combinations
- **Pattern**: Conditional index usage based on filter combination

---

## MISSING PATTERNS

1. **Brand slug URL support**: No routes like `/catalog?brand=sony-slug`
2. **Brand page**: No dedicated brand detail page
3. **Related brands**: No "customers also bought from X brand" feature
4. **Brand statistics**: No brand sales/popularity metrics
5. **Brand deprecation**: No soft-delete or deprecation workflow

