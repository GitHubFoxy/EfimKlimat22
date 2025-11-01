## ADDED Requirements

### Requirement: Orders Section Empty State
The manager UI SHALL display an empty state for Orders when the selected status and view (Все/Мои) returns zero results.

**Files:** app/manager/page.tsx

#### Scenario: Orders empty state with current filter
Given a manager is on the Orders section with filters applied
When the filters result in zero orders
Then an empty state SHALL be displayed with:
- Title: "Заказов нет"
- Description: "Нет заказов для текущего фильтра. Измените статус или проверьте позже."
- Secondary action: "Изменить статус" that changes status filter or focuses status control

### Requirement: Consultants Section Empty State
The manager UI SHALL display an empty state for Consultants when the selected status and view (Все/Мои) returns zero results.

**Files:** app/manager/page.tsx

#### Scenario: Consultants empty state with current filter
Given a manager is on the Consultants section with filters applied
When the filters result in zero consultations
Then an empty state SHALL be displayed with:
- Title: "Запросов на консультацию нет"
- Description: "Нет консультаций для текущего фильтра. Измените статус или проверьте позже."
- Secondary action: "Изменить статус" that changes status filter or focuses status control

### Requirement: Items Section Empty State (Enhanced)
The manager UI SHALL display appropriate empty states for Items in both initial and filtered states.

**Files:** app/manager/page.tsx

#### Scenario: Items empty state with no items
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