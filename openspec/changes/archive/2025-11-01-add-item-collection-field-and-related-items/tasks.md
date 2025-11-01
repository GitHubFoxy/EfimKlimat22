## 1. Implementation

### Database Schema Changes
- [ ] 1.1 Add `collection` field to items table in `convex/schema.ts`
- [ ] 1.2 Regenerate Convex types after schema update

### Backend Function Development
- [ ] 2.1 Create `show_items_by_brand_and_collection` query function in `convex/dashboard.ts`
  - Filter by brand and collection
  - Exclude the current item by ID
  - Return all matching items (no limit)

### Frontend Dependencies
- [ ] 3.1 Install shadcn tooltip component
  - Run: `pnpm dlx shadcn@latest add tooltip`

### Frontend Integration
- [ ] 4.1 Update `/catalog/[id]/page.tsx` to fetch related items
  - Call the new Convex query function
  - Pass current item ID, brand, and collection
- [ ] 4.2 Render related items section below the ItemCard
  - Display section only when related items exist
  - Show "Похожие товары" heading
  - Render small image previews (not full ItemCard components)
  - Use horizontal scrollable container layout
- [ ] 4.3 Implement tooltip on hover
  - Import Tooltip components from shadcn/ui
  - Show full product name: "{brand} {name} {variant}"
  - Example: "LG Кондиционер Artcool WHITE"
  - Position tooltip appropriately
- [ ] 4.4 Handle missing images
  - Display placeholder image (/not-found.jpg) when no images
  - Ensure tooltip still shows correct product name

### Manager UI Updates (Optional)
- [ ] 5.1 Add collection field to item creation form in manager UI
- [ ] 5.2 Add collection field to item edit form in manager UI

### Testing & Validation
- [ ] 6.1 Test with items that have collection field set
- [ ] 6.2 Test with items without collection field (should not show related items)
- [ ] 6.3 Test with items that share brand but different collections
- [ ] 6.4 Verify related items section doesn't render when no matches found
- [ ] 6.5 Test horizontal scroll on different screen sizes
- [ ] 6.6 Test tooltip functionality on hover
- [ ] 6.7 Test clicking on related item images navigates correctly
- [ ] 6.8 Test that current item is excluded from related items

## 2. Post-Implementation
- [ ] 7.1 Update seeding data to include collection values for testing
- [ ] 7.2 Document the collection field usage for content managers
