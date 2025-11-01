# catalog-filter Specification

## Purpose
TBD - created by archiving change add-gas-type-filter-message. Update Purpose after archive.
## Requirements
### Requirement: Subcategory Selector UI Component
**Description:** A new subcategory selector dropdown SHALL be added to the catalog page, appearing after the category selector.

**Type:** Frontend (UI)
**Files:** app/catalog/page.tsx

#### Scenario 1.1: Subcategory selector appears after category selection
Given the catalog page is loaded
When a category is selected
Then a subcategory selector should appear below the category selector

#### Scenario 1.2: Subcategory selector populates with available subcategories
Given a category with subcategories is selected
When the subcategory selector is clicked
Then it should display the list of subcategories for that category

#### Scenario 1.3: Subcategory selector has placeholder text
Given the catalog page is loaded
When the subcategory selector is rendered
Then it should show placeholder text "Выберите подкатегорию"

#### Scenario 1.4: "Без подкатегории" option is available
Given the subcategory selector is rendered
When the user opens the dropdown
Then there should be a "Без подкатегории" option to show all items

### Requirement: Subcategory Data Fetching
**Description:** The catalog page SHALL fetch subcategories from the backend when a category is selected.

**Type:** Frontend (Data Fetching)
**Files:** app/catalog/page.tsx

#### Scenario 2.1: Fetch subcategories when category changes
Given a category is selected
When the selection changes
Then subcategories should be fetched using `dashboard.show_subcategories_by_category`

#### Scenario 2.2: Fetch subcategories only when category is selected
Given no category is selected or category is cleared
When subcategories would be fetched
Then the query should not be called or should return empty results

#### Scenario 2.3: Subcategories are stored in component state
Given subcategories are fetched successfully
When the data is received
Then subcategories should be stored in component state for rendering

### Requirement: Item Filtering by Subcategory
**Description:** Catalog results SHALL be filtered to show only items matching the selected subcategory.

**Type:** Backend (Data Layer)
**Files:** convex/catalog.ts

#### Scenario 3.1: Backend supports subcategory filtering
Given items have subcategory field values
When catalog_query_based_on_category_and_filter is called
Then it should support filtering by subcategory name

#### Scenario 3.2: Items match selected subcategory
Given items with subcategory "Газовые" exist
When filtering by subcategory "Газовые"
Then only items with subcategory "Газовые" should be returned

#### Scenario 3.3: "Без подкатегории" shows all items
Given no specific subcategory is selected
When the query is executed
Then it should return all items in the category (same as before)

### Requirement: "Газовые" Disclaimer Message
**Description:** SHALL when subcategory "Газовые" is selected, display message "Все цены указаны с дымоходом".

**Type:** Frontend (UI)
**Files:** app/catalog/page.tsx

#### Scenario 4.1: Message appears for "Газовые" subcategory
Given subcategory "Газовые" is selected
When the catalog results are displayed
Then a message "Все цены указаны с дымоходом" should be displayed

#### Scenario 4.2: Message has appropriate styling
Given the message is displayed
When users view the message
Then it should have prominent styling (e.g., background color, border, padding) to draw attention

#### Scenario 4.3: Message appears in logical position
Given the message is displayed
When users view the catalog
Then the message should appear between the filters and the product grid

#### Scenario 4.4: Message only appears for "Газовые"
Given a subcategory other than "Газовые" is selected
When the catalog results are displayed
Then the disclaimer message should NOT be shown

### Requirement: Catalog Query with Subcategory Support
**Description:** SHALL enhance catalog query to support optional subcategory filtering parameter.

**Type:** Backend (Data Layer)
**Files:** convex/catalog.ts

#### Scenario 5.1: Query accepts subcategory parameter
Given the query is called with subcategory
When the query executes
Then it should filter items by the subcategory field matching the provided value

#### Scenario 5.2: Query works without subcategory
Given the query is called without subcategory
When the query executes
Then it should behave as before (no subcategory filtering)

#### Scenario 5.3: Query maintains existing filters
Given the query has subcategory parameter
When the query executes
Then it should still respect the existing filter logic (Хиты продаж, Новинки, Со скидкой)

### Requirement: Integration with Existing Filters
**Description:** SHALL work seamlessly with existing category and filter buttons.

**Type:** Integration (Frontend)
**Files:** app/catalog/page.tsx, convex/catalog.ts

#### Scenario 6.1: Subcategory works with category filter
Given a category and subcategory are both selected
When the page renders
Then items should match both the category AND subcategory

#### Scenario 6.2: Subcategory works with filter buttons
Given a subcategory and a filter button (e.g., "Новинки") are selected
When the page renders
Then items should match the subcategory AND the filter criteria

#### Scenario 6.3: Changing category resets subcategory
Given a subcategory is selected
When the user changes the category
Then the subcategory selection should be cleared

#### Scenario 6.4: Changing category refetches subcategories
Given a subcategory is selected
When the user changes the category
Then new subcategories should be fetched for the new category

