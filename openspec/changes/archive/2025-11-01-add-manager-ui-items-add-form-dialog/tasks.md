## 1. Implementation
- [ ] 1.1 Create/Add Item Dialog: wrap existing Add Item form in `components/ui/dialog.tsx`
- [ ] 1.2 Trigger from ManagerHeader: wire “Добавить товар” to open the dialog
- [ ] 1.3 Trigger from EmptyState: ensure Empty State primary action opens the dialog (keep `#add-item` deep-link)
- [ ] 1.4 Deep-link: on `location.hash === '#add-item'`, auto-open dialog on `/manager`
- [ ] 1.5 Unsaved changes guard: show confirm before closing if form dirty
- [ ] 1.6 Mobile full-screen: use sheet/full-screen variant on small viewports
- [ ] 1.7 Validation + submit: reuse existing validation and Convex mutation; close on success, toast, and refresh items list
- [ ] 1.8 Accessibility: focus trap, ESC close, return focus to trigger on close

## 2. QA & Acceptance
- [ ] 2.1 Header button opens dialog and focuses first field
- [ ] 2.2 Empty State action opens dialog
- [ ] 2.3 Deep-link `/manager#add-item` opens dialog on load
- [ ] 2.4 Dirty form close shows confirmation
- [ ] 2.5 Mobile shows full-screen variant; desktop shows modal dialog
- [ ] 2.6 Successful submit closes dialog, toasts, and shows new item in list
- [ ] 2.7 Validation errors keep dialog open and focus first invalid field

## Notes
- UI-only change; no backend/schema changes.
- Reuse ImageField with previews, reorder, limits.