## Context
Extend the Manager page with role-aware sections for Items, Orders, Consultations, and Admin-only Users management. Keep UI in Russian and leverage existing Convex functions and indexes for performance and correctness.

## Goals / Non-Goals
- Goals:
  - Unified Manager UI with Russian labels
  - Role gating (manager vs admin)
  - CRUD for items; status management and assignment flows for orders/consultations
  - Admin-only user CRUD
- Non-Goals:
  - Overhauling authentication beyond current phone-based manager flows
  - Changing data model unless gaps are discovered

## Decisions
- Use existing Convex modules where possible:
  - Orders: convex/manager.ts (list, claim/unclaim, update status)
  - Consultations: convex/consultants.ts (list, claim/unclaim, update status)
  - Items: convex/items.ts and/or convex/dashboard.ts (CRUD, image upload)
  - Users: convex/users.ts (extend with mutations if read-only functions exist)
- UI: shadcn/ui + Tailwind; tabs for "Товары", "Заказы", "Консультации", "Пользователи"
- Localization: hardcode Russian strings for now; consider i18n later
- Performance: paginate lists; rely on withIndex queries (by_status_and_updatedAt, by_assignedManager_status_updatedAt)

## Risks / Trade-offs
- Risk: Role gating on the client relies on minimal auth; Mitigation: validate role server-side in Convex mutations
- Risk: Items CRUD overlaps with dashboard; Mitigation: share components/utilities; avoid duplicate logic
- Risk: Russian-only copy may need future i18n; Mitigation: structure components to allow future translation

## Migration Plan
1. Implement header and tabs
2. Wire orders/consultations sections to existing queries/mutations
3. Implement items CRUD using existing functions; add missing ones if needed
4. Add admin users CRUD; extend convex/users.ts if gaps exist
5. Verify Russian labels and formatting; QA

## Open Questions
- Should item CRUD remain only for admin or be open to manager? (Request states manager SHOULD be able to CRUD items)
- Any additional statuses for orders/consultations beyond pending/processing/done?