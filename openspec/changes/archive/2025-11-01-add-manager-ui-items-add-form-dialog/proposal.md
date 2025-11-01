## Why
The inline Add Item form on the Manager page consumes vertical space and interrupts browsing. Moving the form into a modal dialog improves focus, reduces page clutter, and provides a consistent entry point from both the Empty State and the header action.

## What Changes
- Extract the Add Item form from the Manager items section into a modal dialog (using existing `components/ui/dialog.tsx`).
- Primary action in Manager header and Items Empty State will open the dialog instead of scrolling to a form.
- Support deep-linking: visiting `/manager#add-item` auto-opens the dialog.
- Preserve existing validation and image handling (previews, reorder, limits) inside the dialog.
- UX affordances:
  - ESC to close, focus trap, return focus to trigger on close
  - Confirm before closing if the form has unsaved changes
  - Mobile: full-screen dialog/sheet variant at small viewports
- On successful submit: close dialog, show success toast, refresh items list.

## Impact
- Affected specs: `manager-ui` (Items section)
- Affected code: `app/manager/page.tsx`, `components/ui/dialog.tsx`, and the existing Add Item form component(s) and ImageField.
- No backend/schema changes; reuse existing Convex mutations.