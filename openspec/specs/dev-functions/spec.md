# dev-functions Specification

## Purpose
TBD - created by archiving change add-dev-add-subcategory-function. Update Purpose after archive.
## Requirements
### Requirement: Add Subcategory Dev Function
The system SHALL provide an internal mutation function `addSubcategory` that allows creating new subcategories programmatically for testing and development purposes.

#### Scenario: Add subcategory to existing category
- **WHEN** the function is called with a valid parent category ID and subcategory name
- **THEN** a new subcategory record is created in the subcategorys table with the specified parent and name

#### Scenario: Simple implementation
- **WHEN** the function is called
- **THEN** it performs a straightforward insert without complex error handling or validation (appropriate for dev/testing use)

