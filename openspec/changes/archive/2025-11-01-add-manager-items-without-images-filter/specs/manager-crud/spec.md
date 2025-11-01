## MODIFIED Requirements
### Requirement: Read Item (View Item List)
Managers SHALL be able to view a paginated list of all items in the system with key information displayed, and SHALL be able to filter the list to show only items without images.

#### Scenario: View items list with filter Switch
- **GIVEN** a manager navigates to the Items section
- **WHEN** the page loads
- **THEN** the list displays items with:
  - Thumbnail image (first image)
  - Item name
  - Brand
  - Price
  - Quantity
  - Edit and Delete buttons
- **AND** a shadcn Switch component labeled "Только без изображений" (Only without images) is visible

#### Scenario: Filter to show items without images
- **GIVEN** a manager is on the Items page with a list of items (some with images, some without)
- **WHEN** they toggle the "Только без изображений" Switch to enabled
- **THEN** the list filters to show only items where images array is empty or undefined
- **AND** the Switch shows an active/checked state
- **AND** a count of filtered items may be displayed

#### Scenario: Disable filter to show all items
- **GIVEN** the "Только без изображений" filter is enabled and showing only items without images
- **WHEN** they toggle the Switch again to disabled
- **THEN** the list shows all items regardless of image count
- **AND** the Switch shows an inactive/unchecked state

#### Scenario: Search within filtered results
- **GIVEN** the "Только без изображений" filter is enabled
- **WHEN** they type in the search field
- **THEN** the list filters to items without images that match the search term (by name or brand)

#### Scenario: Filter with zero items match
- **GIVEN** the "Только без изображений" filter is enabled
- **WHEN** all items in the system have at least one image
- **THEN** the list shows an empty state with message indicating no items match the filter
- **AND** the Switch remains active

#### Scenario: Items with no images display correctly
- **GIVEN** an item has no images (empty array or undefined)
- **WHEN** the "Только без изображений" filter is enabled
- **THEN** the item appears in the filtered list
- **AND** a placeholder or icon indicates missing image
- **AND** other item details (name, brand, price, quantity) display normally
