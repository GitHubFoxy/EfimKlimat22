## Why
/manager shows no guidance when Items, Orders, or Consultants lists are empty or filtered to zero.

## What
Use one reusable EmptyState component with section-specific Russian text:
- Items: "Товаров нет" + primary action "Добавить товар" → `#add-item`; variant for search-empty: "Ничего не найдено"
- Orders: "Заказов нет" + secondary action "Изменить статус" (e.g., set to pending)
- Consultants: "Запросов на консультацию нет" + secondary action "Изменить статус" (e.g., set to new)

## Impact
- Code: app/manager/page.tsx only (import and conditional render)
- No backend/schema changes