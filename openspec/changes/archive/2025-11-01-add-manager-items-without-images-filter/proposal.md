## Why
Managers need to quickly identify items that are missing images, as items without images cannot be properly displayed to customers in the store. Currently, managers must manually scan through the items list or check each item individually, which is time-consuming and inefficient.

## What Changes
- Add a shadcn Switch component in the Items list view within the Manager UI
- When enabled, the filter shows only items that have zero images
- When disabled, the filter shows all items (default behavior)
- The Switch component includes Russian label "Только без изображений" (Only without images)
- The filter persists during the manager's session
- Combine with existing search functionality to allow searching within filtered results

## Impact
- Affected specs: `manager-crud` - extends the "Read Item (View Item List)" requirement
- Affected code: Manager items list page (`app/manager/page.tsx`)
- User experience: Managers can quickly find and add images to items that need them
- No breaking changes - purely additive feature
