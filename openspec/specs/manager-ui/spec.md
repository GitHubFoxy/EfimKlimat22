# manager-ui Specification

## Purpose
TBD - created by archiving change add-manager-ui-items-add-form-dialog. Update Purpose after archive.
## Requirements
### Requirement: Items Empty State primary action opens dialog
The Items Empty State primary action SHALL open the Add Item dialog instead of relying on scrolling to an inline form.

#### Scenario: Empty list – create first item
- **WHEN** items list is empty and user clicks “Добавить товар”
- **THEN** the Add Item dialog opens (still compatible with `#add-item` deep-link)

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

### Requirement: Manager UI Header Component
The manager UI SHALL include a header component with branding, manager identification, and logout functionality.

**Files:** app/manager/page.tsx

#### Scenario: Header displays company branding
Given a manager is on the /manager page
When the page renders
Then a header SHALL be displayed with:
- Company logo
- Clear visual branding consistent with the application

#### Scenario: Header shows manager identification
Given a manager is logged in and on the /manager page
When the header renders
Then it SHALL display:
- Manager's name or identifier
- Visual indication of the logged-in state

#### Scenario: Header provides logout functionality
Given a manager is on the /manager page
When they click the logout button in the header
Then it SHALL:
- End the manager's session
- Redirect to the login page or appropriate authentication flow
- Clear any stored authentication tokens

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

