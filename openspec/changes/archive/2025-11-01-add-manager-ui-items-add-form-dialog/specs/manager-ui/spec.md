## ADDED Requirements

### Requirement: Add Item Form shown in a dialog
The Manager Items page SHALL render the Add Item form inside a modal dialog instead of inline.

#### Scenario: Open dialog from header action
- **WHEN** the manager clicks “Добавить товар” in the Manager header
- **THEN** the Add Item dialog opens with focus on the first form field

#### Scenario: Open dialog from Empty State action
- **WHEN** there are no items and the user clicks the Empty State primary action “Добавить товар”
- **THEN** the Add Item dialog opens

#### Scenario: Deep-link opens dialog
- **WHEN** the user navigates to `/manager#add-item`
- **THEN** the Add Item dialog auto-opens on page load

#### Scenario: Accessibility and focus management
- **WHEN** the dialog is opened
- **THEN** focus is trapped within the dialog, ESC closes it, and closing returns focus to the trigger element

#### Scenario: Unsaved changes confirmation
- **WHEN** the user has modified any field and attempts to close the dialog (via backdrop, ESC, or close button)
- **THEN** the system asks for confirmation before discarding unsaved changes

#### Scenario: Mobile full-screen presentation
- **WHEN** viewport is small (mobile)
- **THEN** the Add Item dialog is presented in a full-screen sheet variant for comfortable input

#### Scenario: Submit success
- **WHEN** the form is valid and submitted
- **THEN** the system creates the item (existing Convex mutation), closes the dialog, shows a success toast, and refreshes the items list to include the new item

#### Scenario: Validation error
- **WHEN** the form submission fails client-side validation
- **THEN** error messages are displayed inline, focus moves to the first invalid field, and the dialog remains open

### Requirement: Image handling within dialog
The dialog SHALL include the existing image handling features.

#### Scenario: Image previews, reorder, and limits
- **WHEN** the user adds images in the dialog
- **THEN** previews are shown, images can be reordered, and the maximum image limit is enforced (as per existing items image spec)

## ADDED Requirements

### Requirement: Items Empty State primary action opens dialog
The Items Empty State primary action SHALL open the Add Item dialog instead of relying on scrolling to an inline form.

#### Scenario: Empty list – create first item
- **WHEN** items list is empty and user clicks “Добавить товар”
- **THEN** the Add Item dialog opens (still compatible with `#add-item` deep-link)