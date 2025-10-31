## Why
The current Manager page lacks a complete, role-aware UI for day-to-day operations. Managers need a unified interface (in Russian) with a clear header and workflows to manage items, orders, and consultation requests. Admins further need user management (CRUD) accessible from the same area.

## What Changes
- Add Manager Header with brand logo, manager display name, and logout button (Russian labels).
 - Add Items management (CRUD) within /manager: list, create (with image upload), edit, delete; categories/brands selection; Russian UI copy. Images input MUST support drag-and-drop using the existing Dropzone component.
 - Add Orders UI in /manager: list by status, pagination, claim/unclaim, update status; role-based visibility. Statuses displayed in Russian: "Ожидает" (pending), "В процессе" (processing), "Готово" (done).
 - Add Consultations UI in /manager: list by status, pagination, claim/unclaim, update status. Statuses displayed in Russian: "Ожидает", "В процессе", "Готово".
- Add Admin-only Users management (CRUD) section within /manager, visible only when role=admin.
- Role gating and UX: show/hide sections based on role; all labels and messages in Russian.
- Align data operations with existing Convex functions and indexes; add mutations/queries only if gaps are found.

## Impact
- Affected specs: manager, admin (users management), items, orders, consultants
- Affected code (indicative):
  - app/manager/page.tsx (new tabs/sections, header, role-aware routing)
  - components (new ManagerHeader and UI sections; shadcn/ui usage)
  - hooks/useRole.ts (role gating in UI)
  - convex/manager.ts and convex/consultants.ts (list/claim/unclaim/status updates)
  - convex/items.ts and convex/dashboard.ts (items CRUD; image upload integration via generateUploadUrl)
  - components/ui/shadcn-io/dropzone (drag-and-drop image input)
  - convex/users.ts (admin-only users CRUD if functions are missing or need extension)
  - app/globals.css and constants for Russian labels if needed

No breaking changes expected; routes remain under /manager.