## Why
Users viewing a specific item in the catalog need to easily discover alternative variants of the same product (e.g., different colors, sizes, or configurations from the same product line). Currently, there is no way to browse related items that share the same brand and collection on the item detail page. This makes it difficult for users to understand all available options for a product line from a single page.

## What Changes
- **Database Schema Modification**: Add an optional `collection` string field to the items table in the Convex schema
- **New Convex Function**: Create `show_items_by_brand_and_collection` query to fetch related items by brand and collection (excluding the current item)
- **Frontend Enhancement**: Display a "Похожие товары" (Related Items) section on the `/catalog/[id]` page, showing items that share the same brand and collection as the current item

## Impact
- **Affected Specs**:
  - `items` capability: Modified schema to include collection field
  - `related-items` capability: New feature for displaying related items on item detail page
- **Affected Code**:
  - `convex/schema.ts`: Add collection field to items table
  - `convex/dashboard.ts`: New query function for fetching related items
  - `app/catalog/[id]/page.tsx`: Add related items section below ItemCard
- **Breaking Changes**: None - the collection field is optional and all existing items will continue to work without it
