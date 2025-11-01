## ADDED Requirements
### Requirement: Related Items Query Function
The system SHALL provide a Convex query function to fetch items that share the same brand and collection as a given item, excluding the item itself.

#### Scenario: Fetch related items by brand and collection
- **GIVEN** an item exists with brand "LG" and collection "Artcool"
- **WHEN** `show_items_by_brand_and_collection` is called with the item's ID, brand "LG", and collection "Artcool"
- **THEN** the query returns all other items that have brand "LG" AND collection "Artcool"
- **AND** the current item is NOT included in the results

#### Scenario: No related items when collection is empty
- **GIVEN** an item has an empty or undefined collection field
- **WHEN** the query is called for this item
- **THEN** the query returns an empty array
- **AND** no errors are thrown

#### Scenario: Related items filtered by exact collection match
- **GIVEN** there are items with brand "Samsung" and collections "WindFree AC" and "Smart AC"
- **WHEN** querying for an item with brand "Samsung" and collection "WindFree AC"
- **THEN** only items with collection "WindFree AC" are returned
- **AND** items with collection "Smart AC" are excluded

#### Scenario: Related items returns all matching items
- **GIVEN** there are 10 items with the same brand and collection
- **WHEN** the query is executed
- **THEN** all 10 items are returned
- **AND** the results are ordered (e.g., by name or most popular)

### Requirement: Related Items Display on Item Detail Page
The `/catalog/[id]` page SHALL display a related items section below the main item card when related items exist.

#### Scenario: Related items section appears when matches found
- **GIVEN** a user views an item page at `/catalog/[id]`
- **WHEN** the item has at least one related item (same brand and collection, different item)
- **THEN** a "Похожие товары" (Related Items) section is displayed below the ItemCard
- **AND** the section shows all related items as small image previews
- **AND** the related items are laid out in a horizontal scrollable container

#### Scenario: Related items section hidden when no matches
- **GIVEN** a user views an item page at `/catalog/[id]`
- **WHEN** the item has no related items (no collection or no other items with same brand+collection)
- **THEN** the "Похожие товары" section is NOT displayed
- **AND** the page layout remains clean without empty sections

#### Scenario: Related items are small image previews
- **GIVEN** related items are displayed on the page
- **WHEN** a user views the related items
- **THEN** each related item displays only:
  - A small square image (e.g., 80x80px or similar thumbnail size)
  - No title, price, or buttons are shown in the preview
  - The image is clickable and navigates to the item's detail page

#### Scenario: Related items navigation works
- **GIVEN** related items are displayed as small image previews
- **WHEN** a user clicks on a related item image
- **THEN** they are navigated to that item's detail page (`/catalog/[related-item-id]`)
- **AND** the new page loads correctly with its own related items (if any)

#### Scenario: Tooltip shows full product name on hover
- **GIVEN** related items are displayed as small image previews
- **WHEN** a user hovers over a related item image
- **THEN** a tooltip appears with the full product name formatted as:
  - "{brand} {name} {variant}"
  - Example: "LG Кондиционер Artcool WHITE"
- **AND** the tooltip uses the shadcn/ui Tooltip component
- **AND** the tooltip disappears when the cursor moves away

#### Scenario: Related items section is scrollable horizontally
- **GIVEN** a user views the item detail page
- **WHEN** the page is rendered with multiple related items
- **THEN** related items are displayed in a horizontal scrollable container
- **AND** users can scroll left/right to see all related items
- **AND** on mobile devices, the container is swipeable

#### Scenario: Related items exclude the current item
- **GIVEN** a user views an item detail page
- **WHEN** the page loads related items
- **THEN** the currently viewed item does NOT appear in the related items section
- **AND** only other items from the same brand and collection are shown

#### Scenario: Missing images show placeholder
- **GIVEN** a related item has no images (imagesUrls is empty or undefined)
- **WHEN** the related item is rendered
- **THEN** a placeholder image (e.g., "/not-found.jpg") is displayed
- **AND** the tooltip still shows the correct product name
