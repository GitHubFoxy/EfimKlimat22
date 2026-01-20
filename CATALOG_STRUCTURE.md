# Catalog Feature Structure

Comprehensive documentation of all catalog-related components, files, queries, and relationships.

---

## 1. Page Routes & Layouts

### [/app/catalog/page.tsx](file:///home/coder/Projects/EfimKlimat22/app/catalog/page.tsx)
- **Purpose**: Server component that preloads catalog data and initializes the catalog page
- **Type**: Server Component (async)
- **Key Responsibilities**:
  - Parses search params to get filter type (`Хиты продаж`, `Новинки`, `Со скидкой`)
  - Preloads category and brand data for SEO and performance
  - Routes to `CatalogClient` with preloaded data
- **Preloaded Data**:
  - `catalog_list_all_categories` - all visible categories
  - `show_all_brands` - all active brands

### [/app/catalog/layout.tsx](file:///home/coder/Projects/EfimKlimat22/app/catalog/layout.tsx)
- **Purpose**: Layout wrapper for catalog routes
- **Type**: Server Component
- **Key Features**: Force-dynamic to avoid caching issues

### [/app/catalog/[slug]/page.tsx](file:///home/coder/Projects/EfimKlimat22/app/catalog/[slug]/page.tsx)
- **Purpose**: Dynamic route for individual item detail pages
- **Type**: Server Component
- **Key Responsibilities**:
  - Takes `slug` from URL params
  - Preloads item data via `show_item_by_slug` for SEO
  - Routes to `ItemClient` for rendering
- **Preloaded Data**: Item details by slug

---

## 2. Client Components

### [/app/catalog/CatalogClient.tsx](file:///home/coder/Projects/EfimKlimat22/app/catalog/CatalogClient.tsx)
- **Purpose**: Main catalog browsing interface - filters, results grid, pagination
- **Type**: Client Component (`"use client"`)
- **Key State Management**:
  - `selectedCategoryId` - selected top-level category filter
  - `selectedSubcategory` - selected subcategory filter
  - `selectedFilter` - active filter type (Hits/New/Discount)
  - `selectedBrand` - selected brand ID
  - `selectedBrandSlug` - selected brand slug for URL
  - `priceSort` - price sort direction (asc/desc/null)
  - `groupByCollection` - toggle grouped by collection view
- **Key Features**:
  - Preloaded categories & brands for initial render
  - `CatalogResultsInner` component for paginated results with lazy loading
  - Category/subcategory hierarchy management
  - Brand filtering with slug resolution
  - Price sorting
  - Collection grouping toggle
- **Dependencies**:
  - `CatalogFilters` - filter UI
  - `CatalogResultsWrapper` - results container
  - `CatalogResultsGrid` - items display grid
  - `FloatingCheckoutButton` - floating checkout button
  - `DisclaimerMessage` - category-specific disclaimers
  - `ItemCard` - individual item card
  - `EmptyState` - no results state
  - `Header` & `Footer` - page layout
  - `useCartSessionId` - cart session tracking

### [/app/catalog/[slug]/ItemClient.tsx](file:///home/coder/Projects/EfimKlimat22/app/catalog/[slug]/ItemClient.tsx)
- **Purpose**: Single item detail page with related items
- **Type**: Client Component
- **Key Features**:
  - Displays item details (name, price, specs, images)
  - Shows breadcrumb navigation
  - Displays related items by brand/category/collection
  - Fetches related items client-side for reactivity
  - Add-to-cart functionality
- **Preloaded Data**: Item by slug
- **Client Queries**:
  - `show_items_by_brand_and_collection` - related items
- **Dependencies**:
  - `ItemCard` - item display
  - `Header` & `Footer` - layout
  - `FreeConsultant` - consultation CTA
  - Breadcrumb UI components

---

## 3. Catalog Components

### [/components/CatalogComponents/CatalogFilters.tsx](file:///home/coder/Projects/EfimKlimat22/components/CatalogComponents/CatalogFilters.tsx)
- **Purpose**: Filter sidebar/panel for catalog browsing
- **Type**: Client Component
- **Features**:
  - Category dropdown select
  - Subcategory dropdown select
  - Filter type radio/select (Хиты продаж, Новинки, Со скидкой)
  - Brand dropdown select
  - Price sort dropdown (asc, desc, none)
  - Optional variant sort
  - "Clear All" button
- **Props**: Category, subcategory, filter, brand, price sort handlers
- **Dependencies**: `@/components/ui/select`, `@/components/ui/label`, `@/components/ui/button`

### [/components/CatalogComponents/CatalogResultsWrapper.tsx](file:///home/coder/Projects/EfimKlimat22/components/CatalogComponents/CatalogResultsWrapper.tsx)
- **Purpose**: Container component that normalizes props and passes to results component
- **Type**: Client Component
- **Responsibility**: Bridge between filter state and results display
- **Props**: All filter selections + results component to render

### [/components/CatalogComponents/CatalogResultsGrid.tsx](file:///home/coder/Projects/EfimKlimat22/components/CatalogComponents/CatalogResultsGrid.tsx)
- **Purpose**: Displays catalog items in a responsive grid with pagination
- **Type**: Client Component
- **Features**:
  - Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
  - Loading state
  - Empty state (with brand filter info)
  - "Load More" pagination button
  - Gap and padding responsive design
- **Props**: Items array, loading state, pagination handlers
- **Dependencies**: `ItemCard`, `EmptyState`

### [/components/CatalogComponents/FloatingCheckoutButton.tsx](file:///home/coder/Projects/EfimKlimat22/components/CatalogComponents/FloatingCheckoutButton.tsx)
- **Purpose**: Floating button showing cart total and item count
- **Type**: Client Component
- **Features**:
  - Fixed position bottom-right
  - Shows cart item count & subtotal
  - Routes to checkout on click
  - Hides if cart is empty
- **Dependencies**: `useCartSessionId`, `api.cart.listItems`, `formatPrice`

### [/components/CatalogComponents/DisclaimerMessage.tsx](file:///home/coder/Projects/EfimKlimat22/components/CatalogComponents/DisclaimerMessage.tsx)
- **Purpose**: Displays category-specific disclaimer messages
- **Type**: Client Component
- **Current Disclaimers**:
  - Gas subcategory (ID: `k974vfejt24xdkaf0dvmx731957se0s5`) shows "All prices include chimney"
- **Implementation**: Hardcoded subcategory IDs (potential refactoring needed)

---

## 4. Shared Components Used by Catalog

### [/components/ItemCard.tsx](file:///home/coder/Projects/EfimKlimat22/components/ItemCard.tsx)
- **Purpose**: Individual product card display
- **Type**: Client Component
- **Features**:
  - Product image with lazy loading
  - Product name and brand
  - Price display (with discount if applicable)
  - Variant count badge
  - Add to cart button with quantity selector
  - Debounced quantity input to prevent excessive mutations
- **Props**: `item` (product data), `variantCount` (optional)
- **Dependencies**: `useCartSessionId`, `api.cart.addToCart`, `formatPrice`

---

## 5. Backend Queries (Convex)

### [/convex/catalog.ts](file:///home/coder/Projects/EfimKlimat22/convex/catalog.ts)

#### Brand Resolution
**`brand_resolve_from_url_param`** (Query)
- **Args**: `brand` (string - slug or legacy ID)
- **Returns**: `{ brandId, slug }` or null
- **Purpose**: Resolve brand slug or ID to brandId + canonical slug
- **Used By**: Brand filtering in product queries

**`brand_resolve_from_url_param_internal`** (Internal Function)
- Same as above but for internal use in other queries

#### Category Navigation
**`catalog_list_all_categories`** (Query)
- **Args**: none
- **Returns**: Array of top-level visible categories
- **Purpose**: Build category filter dropdowns and navigation
- **Used By**: `page.tsx` preload, filter selects

**`show_subcategories_by_category`** (Query)
- **Args**: `parent` (category ID)
- **Returns**: `{ subcategories }`
- **Purpose**: Fetch subcategories for a parent category
- **Used By**: Category filter UI

#### Brand Filtering
**`show_all_brands`** (Query)
- **Args**: none
- **Returns**: Array of all active brands
- **Purpose**: Populate brand filter dropdown
- **Used By**: `page.tsx` preload, brand filter select
- **Filter**: Only active brands

**`catalog_brands_by_category`** (Query)
- **Args**: `categoryId`
- **Returns**: Array of brands with items in this category (+ subcategories)
- **Purpose**: Show only relevant brands for selected category
- **Note**: Respects category hierarchy

#### Product Querying & Filtering
**`catalog_query_based_on_category_and_filter`** (Query)
- **Args**: `category` (optional), `filter` (enum), `brand` (optional slug/ID), `priceSort` (optional), `cursor` (offset)
- **Returns**: `{ page, nextCursor, total, isDone }`
- **Purpose**: Core product listing query with filters and pagination
- **Filters Applied**:
  - Active status & in-stock
  - Category hierarchy (descendant IDs)
  - Brand match
  - Discount filter (oldPrice > price OR discountAmount > 0)
- **Sorting Options**:
  - `priceSort: "asc"/"desc"` - price sorting
  - Filter-based: `Хиты продаж` (by ordersCount), `Новинки` (by creation time), `Со скидкой` (by discount amount)
- **Pagination**: Manual offset-based, 24 items per page
- **Brand Details**: Enriches items with brand names

**`catalog_query_grouped_by_collection`** (Query)
- **Args**: Same as above
- **Returns**: Same as above but grouped items
- **Purpose**: Grouped display of items by collection (variants view)
- **Process**:
  1. Queries `collectionGroups` table (not items)
  2. Fetches representative item for each group
  3. Includes variant count & price range per group
- **Note**: Not used for `Хиты продаж` or `Со скидкой` filters

#### Product Details
**`show_item`** (Query)
- **Args**: `id` (item ID)
- **Returns**: Item with enriched brand name
- **Purpose**: Fetch single item by ID

**`show_item_by_slug`** (Query)
- **Args**: `slug` (string)
- **Returns**: Item with brand name and variant count
- **Purpose**: Fetch item for detail page
- **Variant Count Logic**: Looks up `collectionGroups` by brand+category+collection

**`show_items_by_brand_and_collection`** (Query)
- **Args**: `itemId`, `brandId`, `categoryId`, `collection` (optional)
- **Returns**: Array of up to 8 related items
- **Purpose**: Show related products on detail page
- **Filters**: Same brand, same category, active & in-stock, exclude current item
- **Collection Filter**: If collection provided, only variants in that collection

#### Variant Management
**`get_variant_count`** (Query)
- **Args**: `brandId`, `categoryId`
- **Returns**: Number of variants (items) for this brand/category combo
- **Purpose**: Get total variant count for a product

#### Category-Specific Queries
**`catalog_brands_by_category`** (Query - see above)
- Gets only brands available in a specific category

---

## 6. Hooks

### [/hooks/useCartSessionId.ts](file:///home/coder/Projects/EfimKlimat22/hooks/useCartSessionId.ts)
- **`useCartSessionId()`** - Returns the cart session ID from localStorage or generates new UUID
- **`useCartSession()`** - Returns `{ sessionId, isAuthenticated }`
- **`useMergeCartOnAuth()`** - Merges anonymous cart to authenticated user post-login
- **Purpose**: Manage anonymous cart sessions before authentication
- **Implementation**: Uses `useSyncExternalStore` for localStorage sync

### [/hooks/useRole.ts](file:///home/coder/Projects/EfimKlimat22/hooks/useRole.ts)
- **`useRole()`** - Manages user role (user/manager/admin)
- **Returns**: `{ role, setRole, managerId, setManagerId }`
- **⚠️ SECURITY ISSUE**: Role is stored in localStorage (client-side, easily manipulated)
- **Not used directly by catalog** but used by manager features

### [/hooks/use-mobile.ts](file:///home/coder/Projects/EfimKlimat22/hooks/use-mobile.ts)
- Used for responsive layout decisions across catalog components

---

## 7. Data Model Schema

### Items Table
```typescript
const itemsTable = defineTable({
  name: v.string(),
  slug: v.string(),
  price: v.number(),
  oldPrice: v.optional(v.number()),
  discountAmount: v.optional(v.number()),
  inStock: v.boolean(),
  status: v.union(v.literal("active"), v.literal("inactive")),
  brandId: v.optional(v.id("brands")),
  categoryId: v.optional(v.id("categories")),
  collection: v.optional(v.string()), // e.g., "Standard", "Premium"
  specifications: v.optional(v.object({ /* ... */ })),
  ordersCount: v.optional(v.number()), // For popularity sorting
  variantsCount: v.optional(v.number()), // Count of related items
  // ... other fields
})
.index("by_slug", ["slug"])
.index("by_category", ["categoryId"])
.index("by_status_stock", ["status", "inStock"])
```

### Brands Table
```typescript
const brandsTable = defineTable({
  name: v.string(),
  slug: v.string(),
  status: v.union(v.literal("active"), v.literal("inactive")),
  // ... other fields
})
.index("by_slug", ["slug"])
.index("by_status", ["status"])
```

### Categories Table
```typescript
const categoriesTable = defineTable({
  name: v.string(),
  parentId: v.optional(v.id("categories")), // For hierarchy
  isVisible: v.boolean(),
  order: v.number(),
  // ... other fields
})
.index("by_parent_order", ["parentId", "order"])
```

### Collection Groups Table
```typescript
const collectionGroupsTable = defineTable({
  brandId: v.id("brands"),
  categoryId: v.id("categories"),
  collection: v.string(),
  representativeItemId: v.id("items"),
  variantsCount: v.number(),
  priceMin: v.number(),
  priceMax: v.number(),
  hasDiscount: v.boolean(),
  // ... stats fields
})
.index("by_category_brand", ["categoryId", "brandId"])
```

---

## 8. Component Hierarchy & Data Flow

```
CatalogPage (Server)
  ↓ preloads: categories, brands
  ↓
CatalogClient (Client)
  ├─ CatalogFilters
  │   ├─ Category select
  │   ├─ Subcategory select
  │   ├─ Filter type select
  │   ├─ Brand select
  │   └─ Price sort select
  │
  ├─ CatalogResultsWrapper
  │   ↓ renders
  │   └─ CatalogResultsInner (dynamic)
  │       ├─ useQuery: catalog_query_based_on_category_and_filter
  │       │   OR catalog_query_grouped_by_collection
  │       │   (based on groupByCollection flag)
  │       ├─ Pagination with cursor-based loading
  │       ├─ Results accumulation & deduplication
  │       └─ Renders CatalogResultsGrid
  │           └─ ItemCard × N items
  │
  ├─ FloatingCheckoutButton
  │   └─ useQuery: cart.listItems
  │
  ├─ DisclaimerMessage
  │
  ├─ Header
  ├─ Footer
  └─ FreeConsultant

ItemPage (Server)
  ↓ preloads: item by slug
  ↓
ItemClient (Client)
  ├─ Item detail display
  │   ├─ Breadcrumbs
  │   ├─ Image gallery
  │   ├─ Price & specs
  │   └─ Add to cart
  │
  └─ useQuery: show_items_by_brand_and_collection
      └─ ItemCard × (up to 8 related items)
```

---

## 9. Filter & Sort Logic

### Filter Types
1. **Хиты продаж** (Best Sellers) - Sorted by `ordersCount` desc
2. **Новинки** (New Items) - Sorted by `_creationTime` desc
3. **Со скидкой** (Discounted) - Items where `oldPrice > price` or `discountAmount > 0`, sorted by discount amount desc

### Sort Options
- **Price**: Ascending or Descending
- **Filter-based**: Applied by default based on selected filter
- **Manual offset pagination**: 24 items per page

### Category Hierarchy
- Top-level categories shown in main dropdown
- Subcategories fetched based on parent selection
- Queries respect hierarchy: descendant categories included in filters
- Utility: `getDescendantCategoryIds()` recursively finds all child categories

### Brand Filtering
- Shows all active brands in main catalog
- `catalog_brands_by_category` shows only brands available in selected category
- Brand param can be slug or legacy ID (backward compatibility)

---

## 10. Performance Optimizations

1. **Server Preloading**: Categories & brands preloaded on server
2. **Offset Pagination**: Manual 24-item pagination to avoid large result sets
3. **Deduplication**: Results deduplicated when loading more pages
4. **Collection Grouping**: Optional grouped view reduces displayed items
5. **Brand Details Fetching**: Done in parallel with Promise.all
6. **Lazy Loading**: ItemCard images use next/image with lazy loading
7. **Debouncing**: ItemCard quantity input debounced (in component)

---

## 11. Search & Discovery Flow

1. User lands on `/catalog` → **CatalogPage** preloads data
2. **CatalogClient** renders with default filters (`Хиты продаж`)
3. User selects category → Subcategories populate, results update
4. User selects brand → Results filtered to brand items
5. User selects sort/filter → Results re-query via Convex
6. User scrolls down → "Load More" button appears, cursor increments
7. User clicks item → Routes to `/catalog/[slug]`
8. **ItemClient** shows item details + related items
9. Related items fetched by brand/category/collection

---

## 12. Potential Issues & Improvements

### Known Issues
1. **Hardcoded Disclaimers**: DisclaimerMessage uses hardcoded subcategory IDs
2. **N+1 Brand Lookups**: Brand details fetched individually (use Promise.all as current workaround)
3. **Client-side Sorting**: All sorting done in-memory after collection (should move to index/database)
4. **No Variant Filtering UI**: User can't filter by variant/collection without grouping toggle
5. **Empty ItemCard**: If item data missing, card may break

### Scaling Concerns
1. **Large Category Results**: Collecting all items then sorting is O(n log n) in memory
2. **No Caching**: Every filter change re-queries all data
3. **Pagination Limit**: 24 items/page is hardcoded, user must click "Load More" many times for large catalogs

### Recommended Improvements
1. Add database indexes for common filter combinations
2. Implement server-side sorting for better performance
3. Cache frequently accessed categories/brands
4. Add pagination options (items per page)
5. Refactor hardcoded disclaimer IDs to dynamic config
6. Add search functionality (full-text or by partial name match)
7. Add price range slider instead of fixed sort
8. Add spec/attribute filtering (if items have rich specs)

---

## 13. File Location Reference

| File | Path | Type | Purpose |
|------|------|------|---------|
| Catalog Page | `app/catalog/page.tsx` | Server | Main catalog page, preloads data |
| Catalog Client | `app/catalog/CatalogClient.tsx` | Client | Filter UI + results grid |
| Item Page | `app/catalog/[slug]/page.tsx` | Server | Item detail page, preloads item |
| Item Client | `app/catalog/[slug]/ItemClient.tsx` | Client | Item detail display + related |
| Filters | `components/CatalogComponents/CatalogFilters.tsx` | Client | Filter controls |
| Results Wrapper | `components/CatalogComponents/CatalogResultsWrapper.tsx` | Client | Props bridge |
| Results Grid | `components/CatalogComponents/CatalogResultsGrid.tsx` | Client | Grid display |
| Floating Button | `components/CatalogComponents/FloatingCheckoutButton.tsx` | Client | Floating checkout button |
| Disclaimer | `components/CatalogComponents/DisclaimerMessage.tsx` | Client | Category disclaimer |
| Item Card | `components/ItemCard.tsx` | Client | Product card |
| Catalog Queries | `convex/catalog.ts` | Backend | All catalog queries |
| Cart Hook | `hooks/useCartSessionId.ts` | Hook | Cart session management |
| Role Hook | `hooks/useRole.ts` | Hook | User role management |

---

**Last Updated**: January 20, 2026
**Status**: Complete mapping of catalog feature structure
