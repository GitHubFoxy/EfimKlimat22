# manager-ui Specification

## Purpose
TBD - created by archiving change add-manager-ui-items-add-form-dialog. Update Purpose after archive.
## Requirements
### Requirement: Items Empty State primary action opens dialog
The Items Empty State primary action SHALL open the Add Item dialog instead of relying on scrolling to an inline form.

#### Scenario: Empty list – create first item
- **WHEN** items list is empty and user clicks “Добавить товар”
- **THEN** the Add Item dialog opens (still compatible with `#add-item` deep-link)

