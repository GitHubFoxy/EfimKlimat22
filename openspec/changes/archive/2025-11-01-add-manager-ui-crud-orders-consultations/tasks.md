## 1. Implementation

- [ ] 1.1 Manager Header (Russian UI)
  - Create components/ManagerHeader.tsx with logo (public/logo.webp), manager display name, and "Выйти" button
  - Integrate into app/manager/page.tsx (top of page/layout)

- [ ] 1.2 Role detection & gating
  - Use hooks/useRole.ts to determine role (manager|admin)
  - Conditionally render sections; show "Пользователи" only for admin

- [ ] 1.3 Items CRUD in /manager
  - "Товары" section: list items with pagination; filters if available
  - Create form with Russian labels: name, brand, category, price, description, images (upload)
  - Images input MUST be drag-and-drop using components/ui/shadcn-io/dropzone (Dropzone, DropzoneEmptyState, DropzoneContent)
  - Use convex/dashboard.generateUploadUrl to obtain upload URLs; store storage IDs and retrieve URLs via ctx.storage.getUrl
  - Integrate Convex mutations/queries (convex/items.ts and/or convex/dashboard.ts)
  - Edit/update and delete flows; optimistic updates where appropriate

- [ ] 1.4 Orders UI in /manager
  - "Заказы" section: list by status (tabs or filter), pagination
  - Status labels: "Ожидает" (pending), "В процессе" (processing), "Готово" (done)
  - Use convex/manager.ts: list_orders_by_status, list_my_orders_by_status, claim_order, unclaim_order, update_order_status
  - Actions: "Взять в работу", "Снять с меня", status dropdown (pending, processing, done)

- [ ] 1.5 Consultations UI in /manager
  - "Консультации" section: list by status, pagination
  - Status labels: "Ожидает", "В процессе", "Готово"
  - Use convex/consultants.ts: list_consultants_by_status, list_my_consultants_by_status, claim_consultant, unclaim_consultant, update_consultant_status

- [ ] 1.6 Admin-only Users CRUD
  - "Пользователи" section visible only for admin
  - Implement create/edit/delete using convex/users.ts (extend with mutations as needed)
  - Fields: name, phone, role (user|manager|admin)

- [ ] 1.7 Russian localization
  - Ensure all labels/buttons/messages in /manager are in Russian
  - Use ru-RU for currency/number formatting where displayed

- [ ] 1.8 Navigation & UX
  - Add tabs for "Товары", "Заказы", "Консультации", "Пользователи"
  - Ensure responsive layout with shadcn/ui and Tailwind

- [ ] 1.9 Access control & auth UX
  - Reuse auth flows (convex/auth.ts) for manager login/register
  - Guard /manager route; present helpful Russian message if unauthenticated

- [ ] 1.10 QA & Preview
  - Run pnpm dev; verify flows manually
  - Review UI changes visually; fix edge cases

## 2. Validation & Review
- [ ] 2.1 Confirm proposal approved before implementation starts
- [ ] 2.2 Run openspec validate add-manager-ui-crud-orders-consultations --strict
- [ ] 2.3 Address any validation issues