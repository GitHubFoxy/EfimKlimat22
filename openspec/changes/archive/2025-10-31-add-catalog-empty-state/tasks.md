## 1. Implementation
- [ ] 1.1 Create a reusable EmptyState component (components/ui/EmptyState.tsx) with props: title, description, primaryAction {label, onClick}, secondaryActions [{label, onClick|href}]
- [ ] 1.2 Update app/catalog/page.tsx (CatalogResults) to render EmptyState when results.length === 0, isLoading === false, and status === "Exhausted" (or first page load with 0 results)
- [ ] 1.3 Update the search results section to use the same EmptyState component (replace the plain "Ничего не найдено" text)
- [ ] 1.4 Provide actions:
      - Clear search query or navigate back to catalog
      - Contact consultant (link to FreeConsultmant section or use lib/consts.ts links)
- [ ] 1.5 Verify ru-RU copy and accessibility (focusable buttons, keyboard navigation)
- [ ] 1.6 Manual test: categories with no items, filters with no items, and empty search; ensure layout is responsive and consistent with Tailwind styles
- [ ] 1.7 Run dev locally (pnpm dev) and validate UI across mobile and desktop breakpoints

## 2. Validation
- [ ] 2.1 Confirm no regressions in pagination (loadMore remains hidden when exhausted)
- [ ] 2.2 Confirm no unexpected network calls beyond existing queries
- [ ] 2.3 Confirm empty state does not flash during loading states

## 3. Release
- [ ] 3.1 Prepare PR describing changes and screenshots of empty state
- [ ] 3.2 Get approval for the proposal and implementation
- [ ] 3.3 Merge and deploy