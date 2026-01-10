# Feature 03: Catalog Refinement

## Overview

Enhance the `/catalog` experience with URL synchronization, dynamic brand filtering, and specifications display.

## Requirements

- **URL Search Params**: All filters (category, brand, price, collection) must be stored in URL parameters.
- **Back/Forward Navigation**: Users should be able to navigate back from an item page to the catalog with all previous filters intact.
- **Dynamic Brand Fetching**: Brands list in catalog must filter based on the currently selected category.
- **Specifications Display**: Show relevant specs (e.g., "Мощность" for boilers, "Кол-во секций" for radiators) in product list and item page.
- **Performance**: Use `usePaginatedQuery` with preloading for fast initial SSR. Default to all items if no category selected.

## Tasks

- [ ] Implement URL params sync for filters using `useRouter` and `useSearchParams`.
- [ ] Create `catalog_brands_by_category` query in `convex/catalog.ts`.
- [ ] Update `CatalogFilters.tsx` to fetch brands based on active category.
- [ ] Update product list to render `specifications` field values dynamically.
- [ ] Ensure SSR preloading handles URL parameters correctly.
