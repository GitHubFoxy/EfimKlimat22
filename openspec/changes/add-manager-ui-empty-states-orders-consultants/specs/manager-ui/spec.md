# Manager UI – Empty States for Orders & Consultants (ADDED)

## Context
Extend empty state handling in /manager to Orders and Consultants, using the same EmptyState component already defined for Items.

## Requirements
- Orders section
  - When the selected status and view (Все/Мои) returns zero results, show:
    - Title: "Заказов нет"
    - Description: "Нет заказов для текущего фильтра. Измените статус или проверьте позже."
    - Secondary action: "Изменить статус" (sets status to "pending" or focuses the status control)

- Consultants section
  - When the selected status and view (Все/Мои) returns zero results, show:
    - Title: "Запросов на консультацию нет"
    - Description: "Нет консультаций для текущего фильтра. Измените статус или проверьте позже."
    - Secondary action: "Изменить статус" (sets status to "new" or focuses the status control)

- Items (for completeness, aligned with the prior spec)
  - When there are zero items and no search/filter, show:
    - Title: "Товаров нет"
    - Description: "Добавьте первый товар, чтобы начать управление каталогом."
    - Primary action: "Добавить товар" linking to `#add-item`
  - When search/filter is active and returns zero results:
    - Title: "Ничего не найдено"
    - Description: "Измените условия поиска или сбросьте фильтры."

## Integration Points
- app/manager/page.tsx
  - Import and render `components/ui/EmptyState` in orders and consultants sections
  - For items, ensure `id="add-item"` is present on the create form block

## Acceptance Criteria
1. Empty states appear for Orders and Consultants when lists are empty for the current filters
2. Items section shows empty state when there are no items; variant for empty search results
3. The same EmptyState component is used in all sections, only copy and actions differ
4. Copy is Russian and matches the spec
5. No backend changes introduced