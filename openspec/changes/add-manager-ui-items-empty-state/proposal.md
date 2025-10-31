## Why
The Manager page lacks a clear UI state when there are no items. Managers see an empty list without guidance, which is confusing and provides no call to action.

## What Changes
- Add a friendly Empty State for the Items section of /manager when no items exist
- Show Russian copy, an icon (optional), and a primary action to add a new item
- Optionally handle the case when a search/filter returns zero results with a tailored message
- Reuse the existing `components/ui/EmptyState` component

## Impact
- Affected spec: manager-ui (Items administration)
- Affected code:
  - app/manager/page.tsx (render EmptyState when items list is empty)
  - components/ui/EmptyState.tsx (reuse; no changes expected)
- No schema or backend changes
- No new dependencies; use existing UI components

## Notes
- All user-facing text in the Manager should remain in Russian
- Primary action should focus the "Добавить товар" form (e.g., scroll to section)