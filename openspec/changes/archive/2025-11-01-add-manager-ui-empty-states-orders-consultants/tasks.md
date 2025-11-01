# Tasks – Manager Orders & Consultants Empty States

## Overview
Render a unified EmptyState component in the Manager UI for Orders and Consultants when lists are empty, and ensure Items align with the existing spec.

## Steps
1. Import EmptyState in `app/manager/page.tsx`

2. Orders section
   - Compute `ordersToShow` based on view (Все/Мои) and managerId
   - If `ordersToShow.length === 0`, render `EmptyState`:
     - title: "Заказов нет"
     - description: "Нет заказов для текущего фильтра. Измените статус или проверьте позже."
     - secondaryActions: `[ { label: "Изменить статус", onClick: () => setStatus("pending") } ]`

3. Consultants section
   - Compute `list` based on view (Все/Мои) and managerId
   - If `list.length === 0`, render `EmptyState`:
     - title: "Запросов на консультацию нет"
     - description: "Нет консультаций для текущего фильтра. Измените статус или проверьте позже."
     - secondaryActions: `[ { label: "Изменить статус", onClick: () => setCStatus("new") } ]`

4. Items section (confirm alignment)
   - Add `id="add-item"` to the create form block
   - When no items and no search, render `EmptyState`:
     - title: "Товаров нет"
     - description: "Добавьте первый товар, чтобы начать управление каталогом."
     - primaryAction: `{ label: "Добавить товар", href: "#add-item" }`
   - When search/filter is active and returns zero, render variant:
     - title: "Ничего не найдено"
     - description: "Измените условия поиска или сбросьте фильтры."

5. QA
   - Verify Russian copy
   - Ensure actions behave (set status, scroll to add form)

## Notes
- Reuse existing `components/ui/EmptyState` component
- No backend changes
- Do not start dev server/build/test per user preferences