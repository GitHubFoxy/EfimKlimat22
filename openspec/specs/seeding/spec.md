# seeding Specification

## Purpose
TBD - created by archiving change add-convex-seed-items. Update Purpose after archive.
## Requirements
### Requirement: Seed Items from JSON with Image Uploads
The system SHALL provide a documented, scriptable process to seed items from a JSON file, converting and uploading images, then inserting items referencing storage IDs and URLs.

#### Scenario: Successful seeding from test.json
- WHEN the seeding script reads public/test.json and finds image files for each item
- AND converts images to WebP
- AND uploads each image to Convex Storage via a generated upload URL
- AND invokes the mutation to insert items with imageStorageIds
- THEN the Items table stores imageStorageIds and imagesUrls (derived from storage)

#### Scenario: Missing images directory
- WHEN the images directory for an item does not exist or is empty
- THEN the script logs a warning
- AND the insert proceeds with an empty imageStorageIds array
- AND imagesUrls is empty or defaults

#### Scenario: Invalid category/subcategory IDs
- WHEN the JSON contains category or subcategory IDs that do not exist
- THEN the insert still succeeds with undefined category/subcategory
- AND a warning is logged to encourage data correction

### Requirement: Backend batch insert action
The system SHALL provide a backend action to batch insert items when provided imageStorageIds; the backend MUST NOT perform filesystem access or image conversion.

#### Scenario: Batch insert with storage IDs
- WHEN the action receives an array of items each with imageStorageIds
- THEN it loops and calls dashboard.addItemsPublic per item
- AND returns count of items inserted

