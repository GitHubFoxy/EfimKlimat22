# Items Specification

## Purpose
Defines the schema and structure for items in the catalog, including the optional collection field for grouping related products from the same brand.
## Requirements
### Requirement: Items Table Schema
The items table SHALL include a collection field to group related products from the same brand.

#### Current Schema (before change):
```typescript
items: defineTable({
  partNumber: v.optional(v.string()),
  brand: v.optional(v.string()),
  name: v.string(),
  lowerCaseName: v.string(),
  imagesUrls: v.optional(v.array(v.string())),
  imageStorageIds: v.optional(v.array(v.id("_storage"))),
  quantity: v.number(),
  description: v.string(),
  price: v.number(),
  rating: v.optional(v.number()),
  orders: v.optional(v.number()),
  category: v.optional(v.id("categorys")),
  sale: v.optional(v.number()),
  variant: v.string(),
  subcategory: v.optional(v.string()),
  color: v.optional(v.string()),
})
```

#### New Schema (after change):
```typescript
items: defineTable({
  partNumber: v.optional(v.string()),
  brand: v.optional(v.string()),
  name: v.string(),
  lowerCaseName: v.string(),
  imagesUrls: v.optional(v.array(v.string())),
  imageStorageIds: v.optional(v.array(v.id("_storage"))),
  quantity: v.number(),
  description: v.string(),
  price: v.number(),
  rating: v.optional(v.number()),
  orders: v.optional(v.number()),
  category: v.optional(v.id("categorys")),
  sale: v.optional(v.number()),
  variant: v.string(),
  subcategory: v.optional(v.string()),
  color: v.optional(v.string()),
  collection: v.optional(v.string()), // NEW FIELD
})
```

#### Scenario: Items can be created with collection field
- **GIVEN** a manager creates a new item
- **WHEN** they provide a value for the collection field
- **THEN** the item is stored with the collection value
- **AND** the collection can be used to find related items

#### Scenario: Items can be created without collection field
- **GIVEN** a manager creates a new item
- **WHEN** they do not provide a value for the collection field
- **THEN** the item is stored with collection as undefined/null
- **AND** existing functionality continues to work without modification
- **AND** the item does not appear in related items queries for collections

#### Scenario: Existing items without collection remain valid
- **GIVEN** the database contains items created before adding the collection field
- **WHEN** these items are queried or displayed
- **THEN** they function normally with collection as undefined
- **AND** no data migration is required

