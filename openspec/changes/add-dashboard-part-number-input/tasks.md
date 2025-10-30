## 1. Implementation
- [ ] 1.1 Add `partNumber` input to the Dashboard item form (Shadcn `Input`)
- [ ] 1.2 Wire `partNumber` state into create/update item mutations
- [ ] 1.3 Extend Convex functions to accept `partNumber`:
  - Dashboard: `addItemsPublic` args include `partNumber?: string`
  - Admin: `create_item` args include `partNumber?: string`
- [ ] 1.4 Store `partNumber` in item documents on insert/patch

## 2. Validation
- [ ] 2.1 Verify `convex/schema.ts` includes `partNumber: v.optional(v.string())`
- [ ] 2.2 Confirm `partNumber` persists end-to-end (form → mutation → DB)
- [ ] 2.3 Manual UI test: create item with and without `partNumber`

## 3. Optional Enhancements
- [ ] 3.1 Show `partNumber` on item card (admin view) for quick reference
- [ ] 3.2 Add basic input validation (trim, length checks)