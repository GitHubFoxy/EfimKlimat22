# Proposal: Manage Manager UI Item CRUD with Images

## Why

The Manager UI requires comprehensive item management capabilities to maintain the product catalog. Managers need to add, edit, and delete items with full control over associated images including reordering to set the primary image, removing unwanted images, and uploading new ones. Currently, some backend mutations exist but are not fully integrated into the manager UI, creating an inconsistent experience.

## What Changes

### Backend Changes (Convex)
1. **Ensure delete functionality**: Verify `deleteItem` mutation from `dashboard.ts` is properly exposed and handles image storage cleanup
2. **Validate image mutations**: Confirm `update_item_images` mutation correctly:
   - Persists image order (first image = primary)
   - Deletes removed storage objects
   - Enforces 15 image maximum
   - Generates URLs from storage IDs

### Frontend Changes (Manager UI)
1. **Add Delete Item UI**: Integrate delete button with confirmation dialog in item list/edit view
2. **Validate Create Item flow**: Ensure "Добавить товар" dialog properly:
   - Accepts drag-and-drop or file selection for images
   - Uses `addItemsPublic` mutation
   - Displays image previews with thumbnail grid
   - Enforces 15 image limit

3. **Validate Edit Item flow**: Ensure edit functionality properly:
   - Loads existing item data including images
   - Uses `ImageField` component for image management
   - Supports drag-and-drop reordering
   - Supports individual image deletion
   - Supports adding new images
   - Persists changes using appropriate mutations

4. **ImageField Integration**: Verify `components/manager/ImageField.tsx` is used across all item forms with:
   - Drag-and-drop upload support
   - Thumbnail grid preview
   - Click-to-preview modal
   - Reorder via drag-and-drop
   - Remove individual images

### Specifications Updates
- Update `openspec/specs/manager/spec.md` with explicit requirements for:
  - Item CRUD operations (Add, Edit, Delete)
  - Image management (Upload, Reorder, Delete)
  - Russian UI labels
  - 15 image maximum enforcement

## Impact

- **Affected specs**: manager (CRUD operations), manager-ui (image management)
- **Affected code**:
  - `app/manager/page.tsx` - integrate delete functionality and validate CRUD flows
  - `components/manager/ImageField.tsx` - ensure consistent usage
  - `convex/dashboard.ts` - verify mutations are correct
  - `convex/admin_items.ts` - verify mutations are correct
  - All UI labels remain in Russian

### Dependencies
- Leverages existing `ImageField` component
- Uses existing Convex mutations
- No new dependencies required

## No Breaking Changes

All changes are additive or fix integration gaps. Existing storefront functionality remains unchanged.
