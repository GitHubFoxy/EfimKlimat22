# Tasks: Add Subcategory Selector with "Газовые" Disclaimer

## Implementation Tasks

### 1. Add subcategory state management
**Status:** Completed ✓
**Type:** Frontend
**File:** app/catalog/page.tsx
**Details:**
- Add state variable for selected subcategory (string or null)
- Initialize state as null
- Reset subcategory when category changes

### 2. Import subcategory query
**Status:** Completed ✓
**Type:** Frontend
**File:** app/catalog/page.tsx
**Details:**
- Import `dashboard.show_subcategories_by_category` from convex api
- Add useQuery call to fetch subcategories when category is selected
- Handle loading and empty states

### 3. Add subcategory selector UI
**Status:** Completed ✓
**Type:** Frontend
**File:** app/catalog/page.tsx
**Details:**
- Add Select component for subcategory (below category selector)
- Include "Без подкатегории" option
- Show placeholder "Выберите подкатегорию"
- Wire up onChange handler

### 4. Update CatalogResults component props
**Status:** Completed ✓
**Type:** Frontend
**File:** app/catalog/page.tsx
**Details:**
- Add subcategory parameter to CatalogResults component
- Pass selected subcategory to the component

### 5. Update backend query to support subcategory filtering
**Status:** Completed ✓
**Type:** Backend
**File:** convex/catalog.ts
**Details:**
- Add optional `subcategory` parameter to `catalog_query_based_on_category_and_filter`
- Filter items by subcategory field when subcategory is provided
- Maintain backward compatibility when subcategory is null/undefined

### 6. Add disclaimer message for "Газовые" subcategory
**Status:** Completed ✓
**Type:** Frontend
**File:** app/catalog/page.tsx
**Details:**
- Add conditional rendering for message when subcategory === "Газовые"
- Display message "Все цены указаны с дымоходом"
- Style message with appropriate background/border (e.g., bg-blue-50 border-blue-200)
- Position message between filters and results

### 7. Test subcategory filtering
**Status:** Pending
**Type:** Testing
**File:** N/A
**Details:**
- Select a category with known subcategories
- Verify subcategory selector populates correctly
- Select different subcategories and verify items filter correctly
- Verify "Без подкатегории" shows all items

### 8. Test "Газовые" message display
**Status:** Pending
**Type:** Testing
**File:** N/A
**Details:**
- Select a category and then "Газовые" subcategory
- Verify message "Все цены указаны с дымоходом" appears
- Select a different subcategory and verify message disappears
- Verify message styling is appropriate

### 9. Test integration with existing filters
**Status:** Pending
**Type:** Testing
**File:** N/A
**Details:**
- Combine subcategory selection with filter buttons (Хиты продаж, Новинки, Со скидкой)
- Verify all combinations work correctly
- Test pagination with subcategory filter

### 10. Update type definitions
**Status:** Pending
**Type:** Frontend
**File:** app/catalog/page.tsx
**Details:**
- Update TypeScript types to include subcategory parameter
- Ensure no type errors in IDE/compiler

## Validation Tasks

### 11. Run openspec validate
**Status:** Completed ✓
**Type:** Validation
**File:** N/A
**Details:**
- Run `openspec validate add-gas-type-filter-message --strict`
- Fix any validation errors
- Verify proposal meets all requirements

### 12. Manual testing in browser
**Status:** Pending
**Type:** Testing
**File:** N/A
**Details:**
- Start dev server (pnpm dev)
- Navigate to /catalog
- Test full user flow: select category → select subcategory → verify message
- Verify existing functionality still works

## Notes
- Tasks 1-3, 6, 10 can be done in parallel (frontend tasks)
- Task 5 should be done before testing tasks
- Task 11 (validation) should be run after all implementation is complete
- Consider testing with actual data that includes "Газовые" subcategory items
