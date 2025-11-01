## ADDED Requirements

### Requirement: Manager Header (Russian UI)
The system SHALL display a Manager Header within the /manager area containing: brand logo, manager display name, and a logout button. All labels SHALL be in Russian.

#### Scenario: Header renders for logged-in manager
- **WHEN** a manager is logged in and navigates to /manager
- **THEN** the header shows the brand logo on the left
- **AND** shows the manager’s display name (e.g., "Менеджер: Иван")
- **AND** shows a "Выйти" (Logout) button on the right

### Requirement: Items Management (CRUD) within /manager
Managers SHALL be able to create, read, update, and delete items from the Manager UI. This includes selecting a brand/category, uploading images, and editing pricing/description fields. All UI labels SHALL be in Russian.

#### Scenario: Create item (success)
- **WHEN** a manager opens the "Товары" section and submits a valid form with name, brand, category, price, and image(s)
- **THEN** the item is created and appears in the list

#### Scenario: Edit item (success)
- **WHEN** a manager opens an item detail/editor and changes fields (e.g., price or description)
- **THEN** the item updates and the list reflects changes

#### Scenario: Delete item (success)
- **WHEN** a manager clicks "Удалить" on an item and confirms
- **THEN** the item is removed from the list

### Requirement: Orders UI (status, claim/unclaim, update)
Managers SHALL be able to view orders by status, paginate results, claim/unclaim orders, and update the order status. Statuses SHALL be shown in Russian labels: "Ожидает" (maps to pending), "В процессе" (maps to processing), "Готово" (maps to done).

#### Scenario: List orders by status (Russian labels)
- **WHEN** a manager opens "Заказы" and selects a status filter ("Ожидает", "В процессе", "Готово")
- **THEN** the system paginates and displays orders newest-first by updatedAt
- **AND** internally maps the selected Russian label to backend values (pending, processing, done)

#### Scenario: Claim an order
- **WHEN** a manager clicks "Взять в работу" on an order
- **THEN** the order is assigned to that manager

#### Scenario: Unclaim an order
- **WHEN** a manager clicks "Снять с меня" on an order
- **THEN** the order’s assignedManager is cleared

#### Scenario: Update order status
- **WHEN** a manager selects a new status for an order (e.g., from pending → processing)
- **THEN** the order’s status is updated and list refreshes

### Requirement: Consultations UI (status, claim/unclaim, update)
Managers SHALL be able to view consultation requests by status, paginate results, claim/unclaim requests, and update statuses. Statuses SHALL be shown in Russian labels: "Ожидает" (pending), "В процессе" (processing), "Готово" (done).

#### Scenario: List consultations by status (Russian labels)
- **WHEN** a manager opens "Консультации" and selects a status filter ("Ожидает", "В процессе", "Готово")
- **THEN** the system paginates and displays consultations newest-first by updatedAt
- **AND** internally maps the selected Russian label to backend values (pending, processing, done)

#### Scenario: Claim a consultation
- **WHEN** a manager clicks "Взять в работу" on a consultation request
- **THEN** the request is assigned to that manager

#### Scenario: Unclaim a consultation
- **WHEN** a manager clicks "Снять с меня" on a consultation
- **THEN** the request’s assignedManager is cleared

#### Scenario: Update consultation status
- **WHEN** a manager selects a new status for a consultation (e.g., from pending → processing)
- **THEN** the consultation’s status is updated and list refreshes

### Requirement: Russian localization in /manager UI
All visible labels, buttons, and UX copy in the /manager area SHALL be in Russian, aligned with ru-RU locale for number/currency formatting.

#### Scenario: Russian labels visible
- **WHEN** a manager navigates the /manager sections
- **THEN** tabs and actions are labeled "Товары", "Заказы", "Консультации", "Пользователи" (admin-only), and actions like "Создать", "Редактировать", "Удалить", "Взять в работу", "Снять с меня", "Сохранить", "Выйти" are shown in Russian

### Requirement: Drag-and-drop image input for Items
The Items create/edit forms SHALL provide drag-and-drop image input using the existing Dropzone component.

#### Scenario: Drag-and-drop upload
- **WHEN** a manager drags files onto the image input area in the "Товары" form
- **THEN** files are accepted according to configured constraints and uploaded via a Convex-generated upload URL
- **AND** previews/thumbnails are displayed using returned URLs from ctx.storage.getUrl