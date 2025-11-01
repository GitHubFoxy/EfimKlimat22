## ADDED Requirements

### Requirement: Items Section Empty State (No Items)
The manager UI SHALL display an empty state for Items when there are no items in the system and no active search or filter.

**Files:** app/manager/page.tsx

#### Scenario: Items list empty with no search/filter
Given a manager navigates to the Items section with zero items in the system
When the page renders
Then an empty state SHALL be displayed with:
- Title: "Товаров нет"
- Description: "Добавьте первый товар, чтобы начать управление каталогом."
- Primary action: "Добавить товар" button that scrolls to the create item form
- Optional secondary actions: "Обновить" (reload items), "Импорт" (if implemented)

### Requirement: Items Section Empty State (Filter Results)
The manager UI SHALL display an empty state variant for Items when search or filters return zero results.

**Files:** app/manager/page.tsx

#### Scenario: Items search/filter returns zero results
Given a manager is on the Items section with active search or filter
When the search/filter returns zero results
Then an empty state SHALL be displayed with:
- Title: "Ничего не найдено"
- Description: "Измените условия поиска или сбросьте фильтры."
- Secondary action: "Сбросить фильтры" or "Очистить поиск"

## Integration Points
- app/manager/page.tsx:
  - Detect empty `items` array from the paginated query (list_items_paginated)
  - Render `components/ui/EmptyState` with the above copy and actions
  - Expose an anchor id (e.g., `id="add-item"`) on the create item form; primary action links to `#add-item`

## Acceptance Criteria
1. Visiting /manager with zero items shows the Empty State described above
2. Clicking "Добавить товар" scrolls the page to the create item form
3. If search/filter is present and returns empty, the variant Empty State is shown
4. No backend/schema changes are introduced
5. Copy is in Russian and matches spec
