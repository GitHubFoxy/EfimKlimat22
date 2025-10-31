## ADDED Requirements

### Requirement: Catalog empty state for no items
The system SHALL display a friendly empty state in the catalog when there are no items for the selected category and filter, and for search queries returning zero results.

#### Scenario: No items for selected category + filter
- **WHEN** the user selects a category and filter and the paginated query returns 0 items
- **THEN** the page SHALL show an empty state with:
  - Title: "В этой категории пока нет товаров по выбранному фильтру"
  - Description: "Если вам нужна помощь с подбором, свяжитесь с консультантом"
  - Secondary actions: "Связаться с консультантом" (link to consultation)

#### Scenario: Search yields zero results
- **WHEN** the user performs a search that returns no items
- **THEN** the page SHALL show an empty state with:
  - Title: "Ничего не найдено"
  - Description: "Проверьте запрос или попробуйте выбрать категорию"
  - Primary action: "Очистить поиск" → clears the query and returns to catalog
  - Secondary actions: "Перейти в каталог" (navigate to /catalog), "Связаться с консультантом"

#### Scenario: Loading vs empty state
- **WHEN** the initial query is still loading
- **THEN** the page SHALL show a loading indicator and SHALL NOT display the empty state yet