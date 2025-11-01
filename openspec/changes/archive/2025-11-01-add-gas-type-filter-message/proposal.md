# Proposal: Add Subcategory Selector with "Газовые" Disclaimer Message

## Why
Currently, the catalog only supports category-level filtering, but items are further categorized into subcategories like "Газовые", "Электрические", etc. This limits users' ability to narrow down their product search. Additionally, gas-powered equipment has specific pricing considerations where chimneys are included in the base price, which customers need to be aware of at the time of viewing.

## What Changes
- Add subcategory selector UI component to catalog page
- Integrate subcategory filtering with existing catalog query system
- Display pricing disclaimer message specifically for "Газовые" subcategory items

## Summary
Add a subcategory selector to the catalog page that appears after selecting a category. When "Газовые" subcategory is selected, display a disclaimer message "Все цены указаны с дымоходом" (All prices include chimney).

## Context
The catalog currently has category selection and filter buttons (Хиты продаж, Новинки, Со скидкой), but lacks subcategory filtering. Items in the database have a `subcategory` field (string) that corresponds to subcategory names like "Газовые", "Электрические", etc. The business needs to allow users to filter by subcategory and show an important pricing disclaimer for gas-powered equipment.

## Change Scope
- **Frontend**: Add subcategory selector UI component to catalog page
- **Data Layer**: Use existing `dashboard.show_subcategories_by_category` query to fetch subcategories
- **Filtering**: Filter catalog results by selected subcategory
- **UI**: Display disclaimer message when "Газовые" subcategory is selected

## Technical Approach
1. Add state management for selected subcategory in `app/catalog/page.tsx`
2. Fetch subcategories based on selected category using `dashboard.show_subcategories_by_category`
3. Add subcategory selector UI after the category selector
4. Add filtering logic to only show items matching the selected subcategory
5. Add conditional message display when subcategory is "Газовые"

## Validation
- Test subcategory selector populates correctly when category is selected
- Verify items are filtered correctly by subcategory
- Confirm message appears only when "Газовые" subcategory is selected
- Ensure existing filters (Хиты продаж, Новинки, Со скидкой) continue to work with subcategory selection
