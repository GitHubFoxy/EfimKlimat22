# Unified Empty States – Manager UI (Concise)

## Items
- Empty (no search):
  - Title: "Товаров нет"
  - Description: "Добавьте первый товар, чтобы начать управление каталогом."
  - Primary: { label: "Добавить товар", href: "#add-item" }
- Search/Filter-empty:
  - Title: "Ничего не найдено"
  - Description: "Измените условия поиска или сбросьте фильтры."

## Orders
- Empty for current view/status:
  - Title: "Заказов нет"
  - Description: "Нет заказов для текущего фильтра. Измените статус или проверьте позже."
  - Secondary: { label: "Изменить статус", onClick: () => setStatus("pending") }

## Consultants
- Empty for current view/status:
  - Title: "Запросов на консультацию нет"
  - Description: "Нет консультаций для текущего фильтра. Измените статус или проверьте позже."
  - Secondary: { label: "Изменить статус", onClick: () => setCStatus("new") }

## Integration
- app/manager/page.tsx: import and render `components/ui/EmptyState`
- Add `id="add-item"` to Items create form block

## Notes
- Russian copy only; no backend changes