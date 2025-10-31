## ADDED Requirements

### Requirement: Dashboard supports `partNumber` field in item form
The dashboard SHALL provide a Shadcn `Input` for `partNumber` (артикул) when creating or editing items.

#### Scenario: Part number entry on create
- **WHEN** a manager opens the item creation form
- **THEN** a labeled `partNumber` input is available
- **AND** the field is optional
- **AND** entered value is saved to the item on submit

#### Scenario: Persist to backend via Convex
- **WHEN** the item form is submitted with `partNumber`
- **THEN** the value is sent through dashboard/admin Convex mutations
- **AND** stored on the item document

#### Scenario: Omit part number
- **WHEN** no `partNumber` is provided
- **THEN** the item is created successfully
- **AND** the item document has no `partNumber` field or it is undefined

## MODIFIED Requirements

### Requirement: Dashboard item creation (Convex integration)
The dashboard’s Convex functions SHALL accept and store `partNumber`.

#### Scenario: Dashboard addItemsPublic accepts `partNumber`
- **WHEN** creating an item via `addItemsPublic`
- **THEN** the function accepts `partNumber?: string`
- **AND** persists it on insert

#### Scenario: Admin create_item accepts `partNumber`
- **WHEN** creating an item via admin mutation `create_item`
- **THEN** the function accepts `partNumber?: string`
- **AND** persists it on insert

## Non-Goals
- Enforcing uniqueness on `partNumber`
- Adding indexes for `partNumber`
- Displaying `partNumber` on all user-facing pages (optional for admin)