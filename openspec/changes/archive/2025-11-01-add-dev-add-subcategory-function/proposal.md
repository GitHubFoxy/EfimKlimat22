## Why
Need a simple internal dev function to programmatically add subcategories for testing and development purposes. This will facilitate easier setup of test data and development workflows without manual database operations.

## What Changes
- Add a new internal Convex mutation function `addSubcategory` to `convex/dev.ts`
- Function accepts `parentCategory` as an ID reference to the categorys table and `subcategoryName` as a string
- Inserts a new record into the `subcategorys` table with the provided parent and name
- Simple implementation without error checking, suitable for development/testing use only

## Impact
- Affected specs: dev-functions capability
- Affected code: `convex/dev.ts`
- No breaking changes to existing functionality
- Internal function (not exposed to clients)
