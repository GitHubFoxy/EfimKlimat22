## Why
Managers need to capture a product’s part number (артикул) when creating or editing items in the dashboard. This improves item identification and searchability without changing the core flow.

## What Changes
- Add a Shadcn `Input` field for `partNumber` in the Dashboard item form.
- Persist `partNumber` through Convex functions used by the dashboard (create/update).
- Keep `partNumber` optional and non-breaking.

## Impact
- Affected specs: `dashboard`
- Affected code:
  - `app/dashboard/page.tsx` (form: add `partNumber` input and wire into mutations)
  - `convex/dashboard.ts` (addItemsPublic: accept and store `partNumber`)
  - `convex/admin_items.ts` (create_item: accept and store `partNumber`)
  - `convex/schema.ts` (Field exists; verify presence and types)
  - Optional: `ItemDoc` type in `app/dashboard/page.tsx`