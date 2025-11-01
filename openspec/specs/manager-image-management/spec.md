# manager-image-management Specification

## Purpose
TBD - created by archiving change manage-manager-ui-item-crud-with-images. Update Purpose after archive.
## Requirements
### Requirement: Image Upload via Drag-and-Drop
Managers SHALL be able to upload images by dragging files onto the designated drop zone in item forms.

#### Scenario: Drag-and-drop single image
- **GIVEN** a manager is creating/editing an item
- **WHEN** they drag a single image file onto the drop zone
- **THEN** the file is accepted
- **AND** a thumbnail preview is displayed
- **AND** the image is uploaded to storage
- **AND** a storage ID is generated

#### Scenario: Drag-and-drop multiple images
- **GIVEN** a manager is creating/editing an item
- **WHEN** they drag multiple image files onto the drop zone
- **THEN** all files are accepted (up to max limit)
- **AND** thumbnail previews are displayed for each
- **AND** each image is uploaded to storage
- **AND** storage IDs are generated for each

#### Scenario: Drag-and-drop non-image file
- **GIVEN** a manager is creating/editing an item
- **WHEN** they drag a non-image file (e.g., .pdf) onto the drop zone
- **THEN** the file is rejected
- **AND** an error message is shown in Russian

#### Scenario: Exceed maximum images
- **GIVEN** an item already has 15 images
- **WHEN** a manager tries to upload more
- **THEN** the upload is rejected
- **AND** a message "Максимум 15 изображений" is shown

### Requirement: Image Upload via File Selection
Managers SHALL be able to upload images by clicking the "Выбрать" button and selecting files from the file system.

#### Scenario: Select files via button
- **GIVEN** a manager is on an item form
- **WHEN** they click "Выбрать" button
- **AND** select image files from the dialog
- **THEN** the selected files are uploaded
- **AND** thumbnail previews are displayed

#### Scenario: Select same file twice
- **GIVEN** a manager selects a file for upload
- **WHEN** they select the same file again
- **THEN** the file is accepted again
- **AND** a second thumbnail is created (duplicates allowed)

### Requirement: Image Reordering via Drag-and-Drop
Managers SHALL be able to reorder images by dragging thumbnails to new positions, with the first image being the primary product image.

#### Scenario: Reorder two images
- **GIVEN** an item has 2 images in order [Image A, Image B]
- **WHEN** a manager drags Image A to the position after Image B
- **THEN** the order updates to [Image B, Image A]
- **AND** the change is reflected in the thumbnail grid

#### Scenario: Reorder to first position
- **GIVEN** an item has 3 images in order [A, B, C]
- **WHEN** a manager drags Image C to the first position
- **THEN** the order updates to [C, A, B]
- **AND** Image C becomes the primary image

#### Scenario: Drag preview updates during reorder
- **GIVEN** a manager is dragging an image thumbnail
- **WHEN** they hover over different positions
- **THEN** visual feedback shows where the image will be placed
- **AND** on drop, the image moves to that position

### Requirement: Image Deletion
Managers SHALL be able to delete individual images from an item.

#### Scenario: Delete single image
- **GIVEN** an item has 3 images
- **WHEN** a manager clicks "Удалить" on one image
- **THEN** that image is removed from the list
- **AND** the image storage object is deleted
- **AND** the remaining images shift to fill the gap

#### Scenario: Delete all images
- **GIVEN** an item has multiple images
- **WHEN** a manager deletes all images one by one
- **THEN** the images section shows the empty state
- **AND** no storage objects remain for this item

#### Scenario: Delete and re-add image
- **GIVEN** an item has 2 images
- **WHEN** a manager deletes 1 image
- **AND** uploads a new image
- **THEN** the deleted image storage object is removed
- **AND** the new image has its own storage object
- **AND** the item now has 2 images (original + new)

### Requirement: Image Preview
Managers SHALL be able to preview images in a larger view and see thumbnails in the grid.

#### Scenario: Click thumbnail to preview
- **GIVEN** an item has uploaded images
- **WHEN** a manager clicks on a thumbnail
- **THEN** a modal dialog opens
- **AND** displays the full-size image
- **AND** shows the item name as alt text

#### Scenario: Close preview modal
- **GIVEN** the preview modal is open
- **WHEN** a manager clicks outside the image or presses Escape
- **THEN** the modal closes
- **AND** they return to the form

#### Scenario: Thumbnail grid displays correctly
- **GIVEN** an item has 4 images
- **WHEN** the images are displayed
- **THEN** they appear in a responsive grid (2 columns on small, 3 on medium, 4 on large)
- **AND** each thumbnail shows the image
- **AND** each thumbnail has the item name as alt attribute

### Requirement: Image Storage and URL Management
The system SHALL properly manage image storage objects and generate accessible URLs.

#### Scenario: Storage objects created on upload
- **GIVEN** a manager uploads 3 images
- **WHEN** the upload completes
- **THEN** 3 storage objects are created in Convex storage
- **AND** each has a unique storage ID
- **AND** URLs are generated for each

#### Scenario: URLs regenerate on edit
- **GIVEN** an item has existing images with storage IDs
- **WHEN** the item is loaded for editing
- **THEN** URLs are regenerated from storage IDs
- **AND** thumbnails display correctly

#### Scenario: Storage cleanup on delete
- **GIVEN** an item has 5 images with storage IDs
- **WHEN** the item is deleted
- **THEN** the item document is removed
- **AND** all 5 storage objects are deleted
- **AND** no orphaned storage remains

### Requirement: Maximum 15 Images
The system SHALL enforce a maximum of 15 images per item.

#### Scenario: Limit enforced on upload
- **GIVEN** an item has 14 images
- **WHEN** a manager tries to upload 2 more images
- **THEN** only 1 image is accepted
- **AND** a warning message is shown
- **AND** the 15th image is accepted, 16th is rejected

#### Scenario: Limit enforced on reorder
- **GIVEN** an item has 15 images
- **WHEN** a manager tries to add another image
- **THEN** the upload is rejected
- **AND** message "Максимум 15 изображений" is displayed

### Requirement: Image Order Persistence
The order of images SHALL be persisted and used to determine the primary image (first position).

#### Scenario: Order persists across sessions
- **GIVEN** a manager reordered images to [Img3, Img1, Img2]
- **WHEN** they save and return later
- **THEN** the images remain in order [Img3, Img1, Img2]

#### Scenario: First image used as primary
- **GIVEN** an item has images in order [A, B, C]
- **WHEN** the item is displayed in the store
- **THEN** Image A is shown as the primary/product image
- **AND** Image A appears first in galleries

