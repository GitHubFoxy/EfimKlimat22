# Tasks – Manager Items Empty State

## Overview
Implement an Empty State in /manager for the Items section when there are no items, and a variant for empty search results.

## Steps
1. Manager page anchor
   - Add an `id="add-item"` to the create item form section in `app/manager/page.tsx`

2. Render Empty State on empty list
   - In `app/manager/page.tsx`, after the items query resolves, detect `items.length === 0`
   - If no active search/filter, render `components/ui/EmptyState` with:
     - title: "Товаров нет"
     - description: "Добавьте первый товар, чтобы начать управление каталогом."
     - primaryAction: `{ label: "Добавить товар", href: "#add-item" }`
     - secondaryActions: optional `[ { label: "Обновить", onClick: () => refetch() } ]`

3. Render variant for empty search/filter results
   - If search term or filters are active and list is empty, render `EmptyState` with:
     - title: "Ничего не найдено"
     - description: "Измените условия поиска или сбросьте фильтры."
     - secondaryActions: `[ { label: "Сбросить фильтры", onClick: () => clearFilters() } ]` (if applicable)

4. QA and copy check
   - Verify Russian copy matches spec
   - Ensure keyboard navigation can reach the primary action

## Notes
- Reuse `components/ui/EmptyState` (no new UI dependencies)
- No backend changes
- Do not run dev/build/test; dev servers are already managed by the user