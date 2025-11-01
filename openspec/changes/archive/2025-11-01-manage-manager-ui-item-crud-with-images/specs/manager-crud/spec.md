# manager-crud Specification

## Purpose
Define requirements for Manager UI CRUD operations on items within the /manager area. Managers SHALL be able to create, read, update, and delete items with all necessary fields and proper validation.

## ADDED Requirements

### Requirement: Create Item (Add New Product)
Managers SHALL be able to create new items through the "Товары" section with all required fields and validation.

#### Scenario: Create item with all fields (success)
- **GIVEN** a manager is on the Items page
- **WHEN** they click "Добавить товар" and fill the form with:
  - Name: "Кондиционер LG"
  - Brand: "LG"
  - Price: 50000
  - Quantity: 10
  - Description: "Бытовой кондиционер"
  - Variant: "WHITE"
  - Sale: 10 (optional)
  - Images: at least 1 (up to 15)
- **THEN** the item is created successfully
- **AND** the item appears in the items list
- **AND** a success message is shown

#### Scenario: Create item without required fields (validation error)
- **GIVEN** a manager is on the Add Item form
- **WHEN** they submit with missing required fields (name, price, or quantity)
- **THEN** the form shows validation errors in Russian
- **AND** the item is NOT created

#### Scenario: Create item with images
- **GIVEN** a manager is creating a new item
- **WHEN** they upload images via drag-and-drop or file selection
- **THEN** thumbnail previews are displayed
- **AND** images are stored with proper URLs
- **AND** the first image is set as primary (displayed first)

### Requirement: Read Item (View Item List)
Managers SHALL be able to view a paginated list of all items in the system with key information displayed.

#### Scenario: View items list
- **GIVEN** a manager navigates to the Items section
- **WHEN** the page loads
- **THEN** the list displays items with:
  - Thumbnail image (first image)
  - Item name
  - Brand
  - Price
  - Quantity
  - Edit and Delete buttons

#### Scenario: Search items
- **GIVEN** a manager is on the Items page
- **WHEN** they type in the search field
- **THEN** the list filters to show matching items by name or brand

### Requirement: Edit Item (Update Existing Product)
Managers SHALL be able to edit existing items and persist changes to all fields including images.

#### Scenario: Edit item basic fields
- **GIVEN** a manager clicks "Редактировать" on an existing item
- **WHEN** they modify fields (name, price, quantity, description, etc.)
- **AND** click "Сохранить"
- **THEN** the changes are persisted
- **AND** the list reflects the updated values
- **AND** a success message is shown

#### Scenario: Edit item and cancel
- **GIVEN** a manager clicks "Редактировать" on an existing item
- **WHEN** they modify fields but click "Отмена"
- **THEN** the original values are restored
- **AND** no changes are persisted

#### Scenario: Edit item with image changes
- **GIVEN** a manager is editing an item with existing images
- **WHEN** they:
  - Reorder images via drag-and-drop
  - Delete some images
  - Add new images
- **AND** click "Сохранить"
- **THEN** image order is updated
- **AND** deleted images are removed from storage
- **AND** new images are added
- **AND** a success message is shown

### Requirement: Delete Item
Managers SHALL be able to delete items with proper confirmation and cleanup of associated resources.

#### Scenario: Delete item (success)
- **GIVEN** a manager is on the Items page
- **WHEN** they click "Удалить" on an item
- **AND** confirm deletion in the dialog
- **THEN** the item is removed from the database
- **AND** all associated image storage objects are deleted
- **AND** the item disappears from the list
- **AND** a success message is shown

#### Scenario: Delete item (cancel)
- **GIVEN** a manager clicks "Удалить" on an item
- **WHEN** they click "Отмена" in the confirmation dialog
- **THEN** the item remains in the system
- **AND** no changes are made

#### Scenario: Delete item with multiple images
- **GIVEN** a manager deletes an item that has 5 images
- **WHEN** the deletion is confirmed
- **THEN** the item document is deleted
- **AND** all 5 image storage objects are deleted
- **AND** no orphaned storage objects remain

### Requirement: Russian UI Localization
All Manager UI labels, buttons, messages, and validation errors SHALL be in Russian.

#### Scenario: Russian labels visible
- **GIVEN** a manager navigates the Items section
- **WHEN** they view the interface
- **THEN** all labels show in Russian:
  - "Добавить товар" (Add Item)
  - "Редактировать" (Edit)
  - "Удалить" (Delete)
  - "Сохранить" (Save)
  - "Отмена" (Cancel)
  - "Подтвердить" (Confirm)
  - "Отменить" (Cancel)
  - Field labels and error messages in Russian

## Related Capabilities

- References `manager-image-management` for image handling requirements
- References existing `manager` spec for header and general UI requirements
