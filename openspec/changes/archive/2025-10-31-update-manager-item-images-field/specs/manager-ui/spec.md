## ADDED Requirements

### Requirement: Manager - Item Images Preview
The Manager item form SHALL display small image thumbnails and MAY provide a full-size preview modal.

#### Scenario: Thumbnail grid with modal preview
- **WHEN** the item has one or more images
- **THEN** show a grid of thumbnails
- **AND** clicking a thumbnail opens a modal with the full image (optional)

#### Scenario: Alt attribute for accessibility
- **WHEN** thumbnails are rendered
- **THEN** each thumbnail MUST include an `alt` attribute equal to the item name

#### Scenario: Keyboard accessibility
- **WHEN** the user navigates with keyboard
- **THEN** the thumbnails are focusable
- **AND** pressing Enter opens the modal

### Requirement: Manager - Item Images Reordering (Mouse)
Managers MUST be able to reorder images via mouse drag-and-drop and persist the order.

#### Scenario: Drag to reorder and save
- **WHEN** a manager drags (with a mouse) an image to a new position
- **THEN** the local order updates immediately
- **AND** on save, the order is persisted to Convex (`imagesUrls` and `imageStorageIds` arrays in the same order)

### Requirement: Manager - Keyboard Reorder (Optional)
Managers MAY be able to reorder images using keyboard buttons when mouse drag-and-drop is unavailable.

#### Scenario: Keyboard reorder (fallback)
- **WHEN** drag-and-drop is unavailable
- **THEN** the UI provides move-left/move-right buttons per image to change order

### Requirement: Manager - Images Empty State UI
The images field SHALL show a helpful empty state encouraging upload.

#### Scenario: Clear empty state
- **WHEN** no images are attached
- **THEN** show a dashed drop area with an icon and Russian instructions:
- "Перетащите изображения сюда или нажмите, чтобы выбрать"
- **AND** only image file types are accepted

### Requirement: Manager - Max Images Limit
The system MUST limit images per item to a maximum of 15.

#### Scenario: Prevent exceeding max images
- **WHEN** a user attempts to add more than 15 images
- **THEN** the UI prevents additional uploads and shows a Russian message: "Максимум 15 изображений"
- **AND** the backend mutation rejects updates that exceed 15 with a clear error message

### Requirement: Manager - Persist and Clean Up Images
The backend MUST support updating image arrays and MUST clean up removed storage objects.

#### Scenario: Persist order
- **WHEN** the manager saves the item after reordering images
- **THEN** the mutation updates `imagesUrls` and `imageStorageIds` arrays in the given order

#### Scenario: Remove and delete (mandatory)
- **WHEN** an image is removed by the manager
- **THEN** the mutation deletes the corresponding storage object
- **AND** removes it from the item document

#### Scenario: Delete all images on item deletion
- **WHEN** an item is deleted
- **THEN** all storage objects referenced by `imageStorageIds` MUST be deleted