# Feature 04: Manager Dashboard: Items

## Overview

Enhance product management with dynamic specifications, image uploads, and advanced table sorting/filtering.

## Requirements

- **Dynamic Specifications**: Item form must show different fields based on category (e.g., Power/Area for Boilers, Section count for Radiators).
- **Image Management**: Support multiple image uploads per item using Convex Storage (`_storage`).
- **Table Operations**:
  - Sorting: Price, Quantity, Name, Date.
  - Filtering: Brand, Category, Status.
  - Bulk Actions: Delete, update status.
- **Search**: Integrated search with server-side filtering.

## Tasks

- [ ] **Item Form**: Update `ItemFormDialog.tsx` to render dynamic specification fields based on selected category.
- [ ] **Image Upload**: Add image upload zone (drag & drop) with preview.
- [ ] **Storage Logic**: Implement `generateUploadUrl` and file metadata mapping.
- [ ] **Table**: Update `columns.tsx` and `items-table-content.tsx` with TanStack Table sorting/filtering features.
- [ ] **Backend**: Create `list_items_with_filters` query in `convex/manager.ts`.

## Specification Mapping (Example)

- **Газовые котлы**: Мощность (кВт), Отапливаемая площадь (м²).
- **Радиаторы**: Кол-во секций, Материал.
- **Водонагреватели**: Объем (л), Тип нагрева.
