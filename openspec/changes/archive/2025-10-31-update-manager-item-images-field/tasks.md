## 1. Implementation

- [ ] 1.1 Frontend components
  - Create `components/manager/ImageField.tsx` combining Dropzone, thumbnails, modal preview, and reorder controls
  - Use existing `Dropzone`, `DropzoneContent`, `DropzoneEmptyState` components and accept only images (`accept: { 'image/*': [] }`)
  - Add mouse-based drag-and-drop reordering (native HTML5 DnD); keyboard fallback (move left/right) is optional
  - Enforce max 15 images: block new drops/selects when 15 reached; show Russian message "Максимум 15 изображений"
  - Set thumbnail `alt` attribute to the item name

- [ ] 1.2 Wire into Manager UI
  - Replace current images input in `app/manager/page.tsx` with `ImageField`
  - Maintain local state of `imageStorageIds` and `imagesUrls`, update on drop and reorder
  - Ensure primary image is first in arrays

- [ ] 1.3 Convex mutation
  - Add `api.dashboard.update_item_images` with args: `{ itemId, imageStorageIds?: Id<'_storage'>[], imagesUrls?: string[], removeMissing?: boolean }`
  - Persist order exactly as provided
  - Always delete storage objects that are no longer referenced (make cleanup mandatory)
  - Validate image count <= 15; reject with a clear error message in Russian when exceeded
  - Confirm `api.dashboard.deleteItem` deletes all storage objects referenced by `imageStorageIds` when an item is removed

- [ ] 1.4 Save flows
  - On item create: upload via `generateUploadUrl`, build arrays, then pass to `addItemsPublic`
  - On item edit: call `update_item_images` after reorder/remove, then `update_item` for other fields as needed

- [ ] 1.5 Empty state UX
  - Implement a prominent dashed area with icon and Russian instructions
  - Ensure zero-height bug is fixed; provide min-height and padding

- [ ] 1.6 QA & Preview
  - Run `pnpm dev`
  - Open `/manager`; verify preview, reorder, and empty state visually
  - Test keyboard accessibility

## 2. Validation & Review
- [ ] 2.1 Run `openspec validate update-manager-item-images-field --strict`
- [ ] 2.2 Address validation issues
- [ ] 2.3 Request approval before implementation proceeds