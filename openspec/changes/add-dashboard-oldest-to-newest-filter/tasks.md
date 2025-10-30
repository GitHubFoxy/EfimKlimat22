## 1. Implementation
- [ ] 1.1 Add a Sort control to DashboardItemsPanel with two options
- [ ] 1.2 Implement client-side sorting by `_creationTime` ascending/descending
- [ ] 1.3 Ensure sorting composes with category and text search filters
- [ ] 1.4 Verify default selection is “Newest → Oldest”

## 2. Optional (Server-side)
- [ ] 2.1 Extend `dashboard.show_all_items` to accept `order` if needed
- [ ] 2.2 Use `.order("asc"|"desc")` on Convex query when parameterized

## 3. QA / Validation
- [ ] 3.1 Manual check with 5+ items: sort toggles correctly
- [ ] 3.2 Sorting remains stable when switching category/search
- [ ] 3.3 No regression in add/delete item flows