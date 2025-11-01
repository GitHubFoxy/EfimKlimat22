# Tasks: Manage Manager UI Item CRUD with Images

## Phase 1: Backend Validation

1. **Verify Convex mutations for item management**
   - Review `convex/dashboard.ts`: `deleteItem`, `addItemsPublic`, `update_item_images`
   - Review `convex/admin_items.ts`: `create_item`, `update_item`, `delete_item`
   - Test that mutations properly handle image storage cleanup
   - Test that URL generation works correctly
   - Test 15 image maximum enforcement
   - Status: ✅ Completed

2. **Verify delete functionality cleanup**
   - Ensure `deleteItem` deletes both the item document and associated storage
   - Confirm no orphaned storage objects remain
   - Status: ✅ Completed

## Phase 2: Frontend Integration

3. **Integrate Delete Item UI**
   - Add delete button to item list rows in `app/manager/page.tsx`
   - Add confirmation dialog ("Удалить товар?")
   - Wire to appropriate mutation
   - Refresh item list after deletion
   - Status: ✅ Completed

4. **Validate Add Item Dialog**
   - Test drag-and-drop image upload
   - Test file selection upload
   - Verify ImageField component integration
   - Test 15 image limit enforcement
   - Verify image preview thumbnails
   - Status: ✅ Completed

5. **Validate Edit Item Functionality**
   - Test loading existing item data
   - Test image display with reordering
   - Test individual image deletion
   - Test adding new images
   - Test save/cancel operations
   - Status: ✅ Completed

## Phase 3: UI/UX Polish

6. **Verify ImageField component behavior**
   - Test drag-and-drop reordering across browsers
   - Test click-to-preview modal
   - Test hover states and controls
   - Status: ✅ Completed

7. **Add empty state testing**
   - Verify empty state shows when no images
   - Verify upload prompts are clear
   - Status: ✅ Completed

## Phase 4: End-to-End Testing

8. **Run comprehensive CRUD tests**
   - Create item with multiple images
   - Edit item (modify fields and images)
   - Reorder images and verify primary image
   - Delete images individually
   - Delete entire item
   - Status: ✅ Completed

9. **Verify Russian localization**
   - All buttons and labels in Russian
   - Confirmation dialogs in Russian
   - Error messages in Russian
   - Status: ✅ Completed

10. **Test with real data**
    - Upload various image formats (jpg, png, webp)
    - Test with different image sizes
    - Test performance with multiple items
    - Status: ✅ Completed

## Phase 5: Validation

11. **OpenSpec validation**
    - Run `openspec validate manage-manager-ui-item-crud-with-images --strict`
    - Fix any validation errors
    - ✅ Fixed Convex validation error: Added `partNumber` to `admin_items:list_items_paginated` return validator
    - Status: ✅ Completed

## Notes

- ImageField component already exists with reordering and deletion
- Backend mutations already exist for most operations
- Focus on integration and ensuring all flows work end-to-end
- All UI text must remain in Russian
