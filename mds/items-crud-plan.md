# Plan: Items CRUD (Create, Read, Update, Delete)

## 1. Backend Implementation (Convex)
- [ ] **Create Item:** `convex/manager.ts` -> `create_item` mutation.
    - Args: `name`, `price`, `stock`, `brandId`, `categoryId`, `description`, etc.
- [ ] **Update Item:** `convex/manager.ts` -> `update_item` mutation.
    - Args: `id`, plus partial item fields.
- [ ] **Delete Item:** `convex/manager.ts` -> `delete_item` mutation.
    - Args: `id`.
- [ ] **Fetch Brands & Categories:** Ensure we have queries to populate dropdowns in the form.

## 2. Shared Dialog Component (Create/Edit)
- [ ] Create `ItemFormDialog.tsx` using Shadcn `Dialog`.
- [ ] Use `react-hook-form` with `zod` for validation.
- [ ] Fields required:
    - Name (Input)
    - Brand (Select/Combobox)
    - Category (Select/Combobox)
    - Price (Number Input)
    - Stock (Number Input)
    - Description (Textarea)
- [ ] Handle "Create" mode (empty fields) vs "Edit" mode (pre-filled fields).

## 3. Delete Confirmation Dialog
- [ ] Use Shadcn `AlertDialog` for safe deletion.
- [ ] Trigger from a "Delete" button in the table row actions.

## 4. Frontend Integration (`items-table-content.tsx`)
- [ ] Add "Actions" column to the table.
- [ ] Dropdown menu (Shadcn `DropdownMenu`) for each row:
    - Edit -> Opens Form Dialog.
    - Delete -> Opens Alert Dialog.
- [ ] Connect "Добавить" (Add) button in the header to the Form Dialog.

## 5. UI/UX Refinements
- [ ] Loading states for buttons (disable while submitting).
- [ ] Toast notifications on success/error (using Shadcn `use-toast`).
- [ ] Automatic list refresh (handled by Convex's reactive queries).
