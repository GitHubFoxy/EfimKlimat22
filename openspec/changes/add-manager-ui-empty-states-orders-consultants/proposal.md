## Why
Orders and Consultants sections in /manager do not display a clear empty state when there are no records or when filters yield zero results. This can confuse managers, as the UI appears blank without guidance or actions.

## What Changes
- Use a single reusable EmptyState component (existing `components/ui/EmptyState`) and render it in:
  - Orders: when the current view (Все/Мои) and selected status have zero results
  - Consultants: when the current view (Все/Мои) and selected status have zero results
  - Items: already proposed; include filter-empty variant and add an anchor for add-item

## Impact
- Affected: app/manager/page.tsx (orders, consultants, items sections)
- No backend or schema changes
- Keep UI copy in Russian

## Notes
- The same component is used with different title/description text per section
- Actions:
  - Items: primary action to scroll to add form
  - Orders/Consultants: optional secondary action to change status filter