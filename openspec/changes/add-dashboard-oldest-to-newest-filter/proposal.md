## Why
The dashboard’s items list lacks an explicit sort control to view products from oldest to newest. Managers need to find earlier entries and verify legacy items more quickly. Adding a simple sort filter improves usability without changing data models.

## What Changes
- Add a sort control to the Dashboard items panel that supports:
  - Newest → Oldest (default)
  - Oldest → Newest
- Apply sorting by `_creationTime` after existing filters (category and search).
- Keep behavior reactive and zero-latency by sorting client-side; server ordering is optional.
- No schema changes. No breaking API changes.

## Impact
- Affected specs: `dashboard`
- Affected code:
  - `app/dashboard/page.tsx` (DashboardItemsPanel UI and sorting logic)
  - Optional: `convex/dashboard.ts` if adding server-side variant
- UX: Adds a small Select control labeled “Sort” with two options; default remains “Newest first”.