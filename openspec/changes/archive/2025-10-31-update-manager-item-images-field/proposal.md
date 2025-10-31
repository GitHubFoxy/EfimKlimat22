## Why
The current item images field in the Manager UI lacks essential UX: managers cannot preview uploaded images, cannot reorder them to control the primary image, and the empty state is unclear. This causes confusion and incorrect presentation in the storefront.

## What Changes
- Add small image preview in Manager item forms: thumbnail grid (optional click-to-preview modal)
- Add mouse-based drag-and-drop reordering of images with persisted order (primary image = first position)
- Improve empty state UI: clear drop/paste/upload instructions, icon, and accept-only image types
- Add Convex mutation to persist image order and handle removals safely, deleting removed storage objects
- Keep all labels in Russian to match existing Manager UI
- Enforce a maximum of 15 images per item (client-side and mutation validation)
- Set alt attribute of thumbnails to the item name for accessibility

## Impact
- Affected specs: manager-ui (items images management)
- Affected code:
  - app/manager/page.tsx (replace current images input with preview + reorderable list)
  - components/manager/ImageField.tsx (new reusable field: Dropzone + thumbnails + reorder + modal)
- convex/dashboard.ts (new mutation: update_item_images; optional safe delete of removed storage IDs)
  - Make deletion mandatory when images are removed; ensure existing deleteItem deletes all associated storage objects
  - types: items.imagesUrls and items.imageStorageIds order significance
  - CSS: minor styles for thumbnails, drag handles, and empty state
  - No new dependencies (use native HTML5 drag-and-drop)

No breaking changes for public routes. Storefront reads the first image as primary (already supported via imagesUrls[0]); reordering refines that behavior.