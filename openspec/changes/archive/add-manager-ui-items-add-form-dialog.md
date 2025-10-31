# Archive: add-manager-ui-items-add-form-dialog

Date: 2025-10-31

Status: Applied and archived

## Summary
Extracted the "Добавить товар" form from the Manager Items section into a modal dialog. This improves focus, enables deep-link opening, and unifies empty-state actions to trigger the dialog. No backend changes were required; existing mutations and image upload flow were reused.

## Files Impacted
- app/manager/page.tsx
  - Added Dialog with two-column responsive form (md:grid-cols-2; description and images span both columns).
  - Implemented deep-link auto-open for `/manager#add-item`.
  - Added close guard (confirm on unsaved changes).
  - Sticky footer with right-aligned actions within scrollable dialog.
  - EmptyState primary action updated to open dialog for both no-items and search-empty states; added secondary action to clear search.
  - Hidden legacy inline `#add-item` block kept only to preserve hash anchor compatibility.
- components/manager/ManagerHeader.tsx
  - New optional `onAddItem` prop.
  - Added “Добавить товар” button that triggers the dialog.

## UX Decisions
- Dialog title: «Добавить товар».
- Actions: «Отмена» (outline) and a single primary «Сохранить».
- Sticky footer: Buttons are right-aligned and remain visible while the dialog content scrolls.
- Deep-link: Visiting `/manager#add-item` auto-opens the dialog; the hidden inline anchor remains for compatibility.
- Mobile: Dialog uses full width on small screens, content is vertically scrollable.
- Accessibility: Focus is trapped in the dialog; ESC closes (with unsaved changes confirmation).

## Technical Notes
- Reused existing `convex` mutations: `generateUploadUrl` and `addItemsPublic`.
- Image uploads: Drag-and-drop with type filtering and max 15 images; object URLs used for immediate preview and revoked on reset.
- No backend/API changes.

## Acceptance
- Verified empty states trigger the dialog.
- Verified deep-link opens the dialog.
- Verified sticky footer behavior and two-column layout.
- Confirmed single “Сохранить” button per stakeholder feedback.