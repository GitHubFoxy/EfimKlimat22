# Tasks (Concise)

1) Items
- Add `id="add-item"` to create form
- Render EmptyState when items.length===0 and no search
- Render variant when search/filter returns zero

2) Orders
- Compute ordersToShow (Все/Мои)
- If empty, render EmptyState with status-change secondary action

3) Consultants
- Compute list (Все/Мои)
- If empty, render EmptyState with status-change secondary action

Notes: UI-only, reuse components/ui/EmptyState; no backend changes.