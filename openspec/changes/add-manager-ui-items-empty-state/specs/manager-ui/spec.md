# Manager UI – Items Empty State (ADDED)

## Context
This spec adds an Empty State for the Items section on /manager when there are no items in the system or when filtering/search returns zero results.

## Requirements
- When the Items list query resolves to zero items and there is no active search term or filter:
  - Show an Empty State with:
    - Title: "Товаров нет"
    - Description: "Добавьте первый товар, чтобы начать управление каталогом."
    - Primary action: Button labeled "Добавить товар" that scrolls/focuses the create item form section
    - Optional secondary actions: "Обновить" (reload items), "Импорт" (future; hidden if not implemented)
  - Use small, clean visual styling consistent with the existing EmptyState component

- When a search/filter is active and returns zero results:
  - Show a variant Empty State with:
    - Title: "Ничего не найдено"
    - Description: "Измените условия поиска или сбросьте фильтры."
    - Secondary action: "Сбросить фильтры" or "Очистить поиск" (if applicable)

- Accessibility & UX
  - Maintain keyboard focus behavior; primary action should be reachable via keyboard
  - Keep copy in Russian, aligned with the rest of Manager UI
  - Do not start a dev server or build as part of spec application

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