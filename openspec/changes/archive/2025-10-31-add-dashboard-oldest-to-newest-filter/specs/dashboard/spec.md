## ADDED Requirements

### Requirement: Items list supports sorting by creation time
The dashboard SHALL provide a sort control on the items list allowing users to view products ordered by their creation time.

#### Scenario: Default sorting (Newest → Oldest)
- **WHEN** the dashboard loads
- **THEN** items are ordered by `_creationTime` descending
- **AND** no explicit sort selection is required

#### Scenario: User selects Oldest → Newest
- **WHEN** the user selects the “Oldest → Newest” option in the sort control
- **THEN** items are ordered by `_creationTime` ascending
- **AND** the sorting applies after the current category and search filters

#### Scenario: Sorting composes with filters
- **WHEN** the user applies a category filter and/or text search
- **THEN** the sort order is applied to the filtered results
- **AND** toggling sort does not reset active filters

#### Scenario: Persistence within session view
- **WHEN** the user changes sorting and continues interacting on the dashboard
- **THEN** the selected sort remains active until changed again or the page reloads

## Non-Goals
- Persisting sort choice across sessions or routes
- Changing backend schema or adding new indexes
- Introducing advanced multi-field sorting