## ADDED Requirements

### Requirement: Unified Empty State Implementation
The manager UI SHALL use a unified EmptyState component across all sections (Items, Orders, Consultants) with appropriate copy and actions per section.

**Files:** app/manager/page.tsx

#### Scenario: Items empty state (no search)
Given a manager is on the Items section with no items in the system
When the page renders
Then an empty state SHALL be displayed with:
- Title: "Товаров нет"
- Description: "Добавьте первый товар, чтобы начать управление каталогом."
- Primary action: "Добавить товар" linking to `#add-item`

#### Scenario: Items filter empty state
Given a manager is on the Items section with search or filters active
When the search/filter returns zero results
Then an empty state SHALL be displayed with:
- Title: "Ничего не найдено"
- Description: "Измените условия поиска или сбросьте фильтры."

#### Scenario: Orders empty state
Given a manager is on the Orders section with filters applied
When the filters result in zero orders
Then an empty state SHALL be displayed with:
- Title: "Заказов нет"
- Description: "Нет заказов для текущего фильтра. Измените статус или проверьте позже."
- Secondary action: "Изменить статус" that calls `setStatus("pending")`

#### Scenario: Consultants empty state
Given a manager is on the Consultants section with filters applied
When the filters result in zero consultations
Then an empty state SHALL be displayed with:
- Title: "Запросов на консультацию нет"
- Description: "Нет консультаций для текущего фильтра. Измените статус или проверьте позже."
- Secondary action: "Изменить статус" that calls `setCStatus("new")`

## Integration
- app/manager/page.tsx: import and render `components/ui/EmptyState`
- Add `id="add-item"` to Items create form block

## Notes
- Russian copy only; no backend changes