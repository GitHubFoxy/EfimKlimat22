# admin Specification

## Purpose
TBD - created by archiving change add-manager-ui-crud-orders-consultations. Update Purpose after archive.
## Requirements
### Requirement: Admin-only Users Management (CRUD) within /manager
Admins SHALL have a dedicated "Пользователи" section accessible from the Manager area to create, read, update, and delete users. Only role=admin users SHALL see this section.

#### Scenario: Admin sees Users section
- **WHEN** an admin navigates to /manager
- **THEN** the UI shows a tab/section labeled "Пользователи"

#### Scenario: Create user (success)
- **WHEN** an admin fills out a user form (name, phone, role) and submits
- **THEN** the user is created and appears in the users list

#### Scenario: Edit user (success)
- **WHEN** an admin edits a user’s fields (e.g., role from manager → admin)
- **THEN** the user updates and the list reflects changes

#### Scenario: Delete user (success)
- **WHEN** an admin clicks "Удалить" on a user and confirms
- **THEN** the user is removed from the list

#### Scenario: Role-based gating
- **WHEN** a non-admin (manager role) navigates to /manager
- **THEN** the "Пользователи" section is not visible and users CRUD actions are not accessible

