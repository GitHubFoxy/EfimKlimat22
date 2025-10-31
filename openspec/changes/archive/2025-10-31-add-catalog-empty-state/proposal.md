## Why
When a user selects a category and filter on the catalog page, the current UI does not provide a clear, helpful message if no items are available. This can feel broken or confusing. A friendly empty state with guidance and actions improves UX and reduces abandonment.

## What Changes
- Add an empty state UI for the catalog when the paginated query returns 0 items for the selected category and filter.
- Unify the search empty state to use the same component and provide helpful next actions.
- Provide clear CTAs: change filter, pick another category, clear search, or contact a consultant.
- Visual affordances: icon/illustration, concise copy (ru), and primary/secondary actions.

## Impact
- Affected specs: catalog capability
- Affected code:
  - app/catalog/page.tsx (render empty state when results.length === 0 and not loading)
  - components (new reusable EmptyState component under components/ui, or inline implementation)
  - Optional: link to FreeConsultmant or contact links (lib/consts.ts)